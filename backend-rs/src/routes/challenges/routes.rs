use axum::{extract::State, http::HeaderMap, Json};

use crate::{
    db::Db,
    errors::KubeCTFError,
    jwt::{generate::claims_from_headers, models::Claims},
    models::challenges::{ChallengeDeploy, DeployChallengeResponse, PublicChallengeInfoModel},
    utils::generate_container_links,
    AppState,
};

pub async fn list_challenge_metadata(
    headers: HeaderMap,
    State(state): State<AppState>,
) -> Result<Json<Vec<PublicChallengeInfoModel>>, KubeCTFError> {
    let Claims { user_id, .. } = claims_from_headers(&headers)?;
    let mut conn = state.pool.conn().await?;

    let challenges = sqlx::query!(
        r#"
        SELECT c.id, c.name, c.author, c.category, c.description, c.points,
               s.id IS NOT NULL AS solved,
               CASE
                   WHEN rc.id IS NULL THEN NULL
                   ELSE deploy
               END,
               rc.id AS instance_id, rc.start_time, rc.end_time
        FROM challenges c
        LEFT JOIN submissions s ON s.challenge_id = c.id AND s.user_id = $1
        LEFT JOIN running_challenges rc ON rc.challenge_id = c.id AND rc.user_id = $1
        WHERE c.hidden = FALSE
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
            deploy,
        });
    }

    Ok(Json(response))
}
