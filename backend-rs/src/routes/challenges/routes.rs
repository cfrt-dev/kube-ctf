use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use redis::AsyncCommands;
use tokio::try_join;

use crate::{
    db::{Db, Rclient},
    errors::KubeCTFError,
    forms::challenges::FlagSubmitRequest,
    jwt::{generate::claims_from_headers, models::Claims},
    models::challenges::{ChallengeDeploy, DeployChallengeResponse, PublicChallengeInfoModel},
    utils::{generate_container_links, not_found},
    AppState,
};

pub async fn list_challenges(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<Vec<PublicChallengeInfoModel>>, KubeCTFError> {
    let Claims { user_id, .. } = claims_from_headers(&headers)?;
    let mut conn = state.pool.conn().await?;

    let challenges = sqlx::query!(
        r#"
        WITH one_submission_per_challenge AS (
            SELECT DISTINCT ON (challenge_id) *
            FROM submissions
            WHERE user_id = $1
        )

        SELECT c.id, c.name, c.author, c.category, c.description, c.points,
               c.hints, s.id IS NOT NULL AS solved,
               CASE
                   WHEN rc.id IS NULL THEN NULL
                   ELSE deploy
               END,
               rc.id AS instance_id, rc.start_time, rc.end_time
        FROM challenges c
        LEFT JOIN one_submission_per_challenge s ON s.challenge_id = c.id
        LEFT JOIN running_challenges rc ON rc.challenge_id = c.id AND rc.user_id = $1
        WHERE c.hidden = FALSE;
        "#,
        user_id
    )
    .fetch_all(conn.as_mut())
    .await?;

    let mut response = Vec::new();

    for challenge in challenges {
        let deploy = match challenge.deploy {
            Some(data) => {
                let deploy: ChallengeDeploy =
                    serde_json::from_value(data).expect("Value was validated on db insert");
                let id = challenge
                    .instance_id
                    .expect("SQL code make that impossible");
                let start_time = challenge.start_time.expect("SQL code make that impossible");
                let end_time = challenge.end_time.expect("SQL code make that impossible");

                let links = generate_container_links("tasks.cfrt.dev", &id, &deploy.containers);

                Some(DeployChallengeResponse {
                    id,
                    links,
                    start_time,
                    end_time,
                })
            }
            None => None,
        };

        response.push(PublicChallengeInfoModel {
            id: challenge.id,
            name: challenge.name,
            author: challenge.author,
            category: challenge.category,
            description: challenge.description,
            points: challenge.points,
            solved: challenge.solved,
            hints: challenge.hints,
            // TODO: select files
            files: Vec::new(),
            deploy,
        });
    }

    Ok(Json(response))
}

pub async fn get_challenge(
    headers: HeaderMap,
    State(state): State<AppState>,
    Path(challenge_id): Path<i32>,
) -> Result<Json<PublicChallengeInfoModel>, KubeCTFError> {
    let Claims { user_id, .. } = claims_from_headers(&headers)?;
    let mut conn = state.pool.conn().await?;

    let challenge = sqlx::query!(
        r#"
        SELECT c.id, c.name, c.author, c.category, c.description, c.points,
               c.deploy, c.hints, s.id IS NOT NULL AS solved,
               rc.id AS "instance_id?",
               rc.start_time AS "start_time?",
               rc.end_time AS "end_time?"
        FROM challenges c
        LEFT JOIN submissions s ON s.challenge_id = c.id AND s.user_id = $1
        LEFT JOIN running_challenges rc ON rc.challenge_id = c.id AND rc.user_id = $1
        WHERE c.hidden = FALSE and c.id = $2
        "#,
        user_id,
        challenge_id
    )
    .fetch_one(conn.as_mut())
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => not_found(),
        _ => KubeCTFError::DatabaseError(err),
    })?;

    let deploy = match challenge.deploy {
        Some(data) if challenge.instance_id.is_some() => {
            let deploy = serde_json::from_value::<ChallengeDeploy>(data)
                .expect("Value was validated on db insert");

            let id = challenge
                .instance_id
                .expect("SQL code make that impossible");
            let start_time = challenge.start_time.expect("SQL code make that impossible");
            let end_time = challenge.end_time.expect("SQL code make that impossible");

            let links = generate_container_links("tasks.cfrt.dev", &id, &deploy.containers);

            Some(DeployChallengeResponse {
                id,
                links,
                start_time,
                end_time,
            })
        }
        Some(_) | None => None,
    };

    let response = PublicChallengeInfoModel {
        id: challenge.id,
        name: challenge.name,
        author: challenge.author,
        category: challenge.category,
        description: challenge.description,
        points: challenge.points,
        solved: challenge.solved,
        hints: challenge.hints,
        // TODO: select files
        files: Vec::new(),
        deploy,
    };

    Ok(Json(response))
}

pub async fn submit(
    headers: HeaderMap,
    State(state): State<AppState>,
    Json(form): Json<FlagSubmitRequest>,
) -> Result<StatusCode, KubeCTFError> {
    let Claims { user_id, .. } = claims_from_headers(&headers)?;
    let FlagSubmitRequest { instance_id, flag } = form;

    let (mut rdb, mut conn) = try_join!(state.rdb.conn(), state.pool.conn())?;

    let running_challenge = sqlx::query!(
        r#"
        SELECT challenge_id, flag
        FROM running_challenges
        WHERE id = $1 and user_id = $2
        "#,
        instance_id,
        user_id
    )
    .fetch_optional(conn.as_mut())
    .await?
    .ok_or_else(not_found)?;

    let correct = running_challenge.flag == flag;

    let _ = sqlx::query!(
        r#"
        INSERT INTO submissions(user_id, challenge_id, is_correct, answer)
        VALUES ($1, $2, $3, $4)
        "#,
        user_id,
        running_challenge.challenge_id,
        correct,
        flag
    )
    .execute(conn.as_mut())
    .await?;

    if !correct {
        return Ok(StatusCode::BAD_REQUEST);
    }

    let _ = state.provider.delete_instnace(&instance_id).await;

    sqlx::query!(
        r#"
        DELETE FROM running_challenges
        WHERE id = $1
        "#,
        instance_id
    )
    .execute(conn.as_mut())
    .await?;

    let _ = rdb.del::<_, ()>(&instance_id).await;

    Ok(StatusCode::OK)
}
