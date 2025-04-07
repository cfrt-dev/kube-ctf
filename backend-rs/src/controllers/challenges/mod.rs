use crate::db::Db;
use crate::models::challenges::{
    ChallengeValue, ChallengeValueDecayFunction, ChallengeValueDecayFunctionType,
    ChallengeValueType,
};
use crate::{errors::KubeCTFError, models::challenges::ChallengeModel};
use sqlx::Postgres;
use sqlx::{Acquire, Pool};

pub struct ChallengeController;

impl ChallengeController {
    pub async fn get_challenge_by_id(
        pool: Pool<Postgres>,
        challenge_id: i32,
    ) -> Result<ChallengeModel, KubeCTFError> {
        let mut conn = pool.conn().await?;
        let mut tx = conn.begin().await?;

        let challenge = sqlx::query!(
            r#"
            SELECT id, name, flag, author, category, description,
                   type as "type: ChallengeValueType", points, initialPoints, hidden, dynamicFlag,
                   hints, deploy
            FROM challenges
            WHERE id = $1
            "#,
            challenge_id
        )
        .fetch_one(tx.as_mut())
        .await
        .map_err(|err| match err {
            sqlx::Error::RowNotFound => {
                KubeCTFError::NotFound("No challenge was found with that id.".to_string())
            }
            _ => KubeCTFError::DatabaseError(err),
        })?;

        let mut value = ChallengeValue {
            r#type: challenge.r#type,
            initial_value: challenge.initialpoints,
            decay_function: None,
        };

        if challenge.r#type == ChallengeValueType::Dynamic {
            let dynamic_challenge = sqlx::query!(
                r#"
                SELECT minimum, decay, type as "type: ChallengeValueDecayFunctionType"
                FROM dynamic_challenges
                WHERE id = $1
                "#,
                challenge_id
            )
            .fetch_one(tx.as_mut())
            .await?;

            value.decay_function = Some(ChallengeValueDecayFunction {
                r#type: dynamic_challenge.r#type,
                decay: dynamic_challenge.decay,
                minimum_value: dynamic_challenge.minimum,
            })
        }

        tx.commit().await?;

        let challenge_deploy = challenge
            .deploy
            .map(serde_json::from_value)
            .and_then(Result::ok);

        let challenge = ChallengeModel {
            id: challenge.id,
            name: challenge.name,
            flag: challenge.flag,
            author: challenge.author,
            category: challenge.category,
            description: challenge.description,
            hints: challenge.hints,
            dynamic_flag: challenge.dynamicflag,
            hidden: challenge.hidden,
            value,
            // TODO: select files
            files: Vec::new(),
            deploy: challenge_deploy,
        };

        Ok(challenge)
    }
}
