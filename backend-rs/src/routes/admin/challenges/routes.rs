use axum::{extract::State, http::StatusCode};
use sqlx::Acquire;

use crate::{
    db::Db,
    errors::KubeCTFError,
    forms::challenges::managements::{AddChallengeForm, ChallengeValueType},
    map_vec,
    utils::ValidatedJson,
    AppState,
};

pub async fn add_challenge(
    State(state): State<AppState>,
    ValidatedJson(form): ValidatedJson<AddChallengeForm>,
) -> Result<StatusCode, KubeCTFError> {
    let mut conn = state.pool.conn().await?;
    let mut tx = conn.begin().await?;

    let challenge_id = sqlx::query!(
        r#"
        INSERT INTO challenges(name, flag, author, category, description, type,
                               points, initialPoints, hidden, dynamicFlag, hints,
                               deploy)
        VALUES ($1, $2, $3, $4, $5, $6,
                $7, $8, $9, $10, $11, $12)
        RETURNING id
        "#,
        form.name,
        form.flag,
        form.author,
        form.category,
        form.description,
        form.value.r#type as _,
        form.value.initial_value,
        form.value.initial_value,
        form.hidden,
        form.dynamic_flag,
        &form.hints,
        serde_json::to_value(form.deploy).expect("I just deserialized you"),
    )
    .fetch_one(tx.as_mut())
    .await
    .map_err(|err| match err {
        sqlx::Error::Database(e) if e.is_unique_violation() => {
            KubeCTFError::Conflict("Challenge with the same name already exists".to_string())
        }
        _ => KubeCTFError::DatabaseError(err),
    })?
    .id;

    if matches!(form.value.r#type, ChallengeValueType::Dynamic) {
        let decay_function = form
            .value
            .decay_function
            .expect("Was validated on struct level");

        let _ = sqlx::query!(
            r#"
            INSERT INTO dynamic_challenges(id, minimum, decay, type)
            VALUES ($1, $2, $3, $4)
            "#,
            challenge_id,
            decay_function.minimum_value,
            decay_function.decay,
            decay_function.r#type as _
        )
        .execute(tx.as_mut())
        .await?;
    }

    let files = form.files;
    let _ = sqlx::query!(
        r#"
        UPDATE files
        SET challenge_id = $1
        WHERE id = ANY($2)
        "#,
        challenge_id,
        &map_vec!(files, id)
    )
    .execute(tx.as_mut())
    .await?;

    tx.commit().await?;

    Ok(StatusCode::CREATED)
}
