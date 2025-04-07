use axum::{
    extract::{Path, State},
    http::HeaderMap,
    Json,
};
use redis::AsyncCommands;
use sqlx::Acquire;
use tokio::try_join;

use crate::{
    controllers::challenges::ChallengeController,
    db::{Db, Rclient},
    errors::KubeCTFError,
    jwt::{
        generate::claims_from_headers,
        models::{Claims, UserRole},
    },
    models::challenges::DeployChallengeResponse,
    utils::{generate_container_links, generate_id},
    AppState,
};

pub async fn deploy_challenge(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(challenge_id): Path<i32>,
) -> Result<Json<DeployChallengeResponse>, KubeCTFError> {
    let Claims { user_id, role, .. } = claims_from_headers(&headers)?;
    let (mut rdb, mut conn) = try_join!(state.rdb.conn(), state.pool.conn())?;
    let mut tx = conn.begin().await?;

    let challenge_row = sqlx::query!(
        r#"
        SELECT
            c.flag,
            c.hidden,
            EXISTS (
                SELECT 1 FROM submissions s
                WHERE s.challenge_id = c.id
                  AND s.user_id = $2
                  AND s.is_correct = true
            ) AS solved
        FROM challenges c
        WHERE c.id = $1
        "#,
        challenge_id,
        user_id
    )
    .fetch_optional(tx.as_mut())
    .await?
    .ok_or_else(not_found)?;

    if challenge_row.hidden && matches!(role, UserRole::User) {
        return Err(not_found());
    }

    let existing = sqlx::query!(
        r#"
        SELECT id
        FROM running_challenges
        WHERE user_id = $1
        "#,
        user_id
    )
    .fetch_all(tx.as_mut())
    .await?;

    if existing.len() == 1 {
        let ids = existing
            .iter()
            .map(|x| x.id.clone())
            .collect::<Vec<_>>()
            .join(",");

        return Err(KubeCTFError::Conflict(format!(
            "You already have running challenge - {ids}."
        )));
    }

    let mut id = generate_id(10);
    while rdb.exists::<_, bool>(&id).await.unwrap_or(false) {
        id = generate_id(10)
    }

    let base_domain = "tasks.cfrt.dev";
    let challenge = ChallengeController::get_challenge_by_id(state.pool, challenge_id).await?;
    let deploy = challenge.deploy.ok_or_else(|| {
        KubeCTFError::ShitHappened("No deploy configuration found for challenge".into())
    })?;

    state
        .provider
        .create_instnace(&deploy.containers, &id)
        .await
        .map_err(|e| KubeCTFError::DeployError(format!("Failed to deploy instance: {e}")))?;

    let row = sqlx::query!(
        r#"
        INSERT INTO running_challenges(id, challenge_id, user_id, flag)
        VALUES ($1, $2, $3, $4)
        RETURNING start_time, end_time
        "#,
        id,
        challenge_id,
        user_id,
        challenge_row.flag
    )
    .fetch_one(tx.as_mut())
    .await
    .map_err(|e| {
        let _ = state.provider.delete_instnace(&id);
        KubeCTFError::DatabaseError(e)
    })?;

    if let Err(e) = rdb.set::<_, _, ()>(&id, user_id).await {
        let _ = state.provider.delete_instnace(&id).await;
        let _ = tx.rollback().await;
        return Err(KubeCTFError::RedisError(e));
    }

    if let Err(e) = tx.commit().await {
        let _ = state.provider.delete_instnace(&id).await;
        return Err(KubeCTFError::DatabaseError(e));
    }

    let links = generate_container_links(base_domain, &id, &deploy.containers);
    let response = DeployChallengeResponse {
        id: id.clone(),
        links,
        start_time: row.start_time,
        end_time: row.end_time,
    };

    Ok(Json(response))
}

pub async fn delete_challenge(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(instance_id): Path<String>,
) -> Result<(), KubeCTFError> {
    let Claims { user_id, .. } = claims_from_headers(&headers)?;
    let (mut rdb, mut conn) = try_join!(state.rdb.conn(), state.pool.conn())?;
    let mut tx = conn.begin().await?;

    let record = sqlx::query!(
        r#"
        SELECT user_id FROM running_challenges
        WHERE id = $1
        "#,
        instance_id
    )
    .fetch_optional(tx.as_mut())
    .await?
    .ok_or_else(|| KubeCTFError::NotFound("No running instance found with this ID.".into()))?;

    if record.user_id != user_id {
        return Err(KubeCTFError::Forbidden(
            "You are not allowed to delete this challenge.".into(),
        ));
    }

    let _ = state.provider.delete_instnace(&instance_id).await;

    sqlx::query!(
        r#"
        DELETE FROM running_challenges
        WHERE id = $1
        "#,
        instance_id
    )
    .execute(tx.as_mut())
    .await?;

    let _ = rdb.del::<_, ()>(&instance_id).await;

    tx.commit().await?;

    Ok(())
}

fn not_found() -> KubeCTFError {
    KubeCTFError::NotFound("No challenge was found with that id.".into())
}
