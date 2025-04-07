use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use sqlx::types::Uuid;
use utoipa::ToSchema;
use validator::{Validate, ValidationError, ValidationErrors};

use super::Container;

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeFileForm {
    pub id: Uuid,
    pub name: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
#[sqlx(type_name = "ChallengeType")]
pub enum ChallengeValueType {
    Static,
    Dynamic,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type)]
#[sqlx(type_name = "ChallengeDecayFunction")]
pub enum ChallengeValueDecayFunctionType {
    Logarithmic,
    Linear,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub enum ChallengeDeployType {
    Static,
    Dynamic,
}

#[derive(Serialize, Deserialize, ToSchema, Validate)]
pub struct ChallengeValueDecayFunction {
    pub r#type: ChallengeValueDecayFunctionType,
    pub decay: i32,
    #[serde(rename = "minimumValue")]
    pub minimum_value: i32,
}

#[derive(Serialize, Deserialize, ToSchema, Validate)]
pub struct ChallengeDeploy {
    pub r#type: ChallengeDeployType,
    #[validate(nested)]
    #[validate(
        length(min = 1, message = "You must specify at least one container."),
        custom(function = "validate_containers")
    )]
    pub containers: Vec<Container>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeValue {
    pub r#type: ChallengeValueType,
    #[serde(rename = "initialValue")]
    pub initial_value: i32,
    #[serde(rename = "decayFunction")]
    pub decay_function: Option<ChallengeValueDecayFunction>,
}

#[derive(Serialize, Deserialize, ToSchema, Validate)]
pub struct AddChallengeForm {
    pub name: String,
    pub flag: String,
    pub author: Option<String>,
    pub category: String,
    pub description: Option<String>,

    #[serde(default)]
    pub hints: Vec<String>,

    #[serde(default, rename = "dynamicFlag")]
    pub dynamic_flag: bool,
    #[serde(default = "default_hidden_status")]
    pub hidden: bool,

    #[validate(nested)]
    pub value: ChallengeValue,
    #[serde(default)]
    pub files: Vec<ChallengeFileForm>,
    #[validate(nested)]
    pub deploy: Option<ChallengeDeploy>,
}

impl Validate for ChallengeValue {
    fn validate(&self) -> Result<(), validator::ValidationErrors> {
        let mut errors = ValidationErrors::new();

        if self.initial_value < 0 {
            errors.add(
                "value.initialValue",
                ValidationError::new("Initial value must be positive integer."),
            );
            return Err(errors);
        }

        if let Some(decay_function) = &self.decay_function {
            if decay_function.minimum_value < 0 {
                errors.add(
                    "value.initialValue",
                    ValidationError::new("Initial value must be positive integer."),
                );
            }

            if self.initial_value < decay_function.minimum_value {
                errors.add(
                    "value.decayFunction.minimumValue",
                    ValidationError::new("Minimum value must be less than initial value."),
                );
            }
        }

        if matches!(self.r#type, ChallengeValueType::Dynamic) && self.decay_function.is_none() {
            errors.add(
                "value.decayFunction",
                ValidationError::new(
                    "If value type is dynamic, you must supply decayFunction object.",
                ),
            );
        }

        if !errors.is_empty() {
            return Err(errors);
        }

        Ok(())
    }
}

fn validate_containers(containers: &[Container]) -> Result<(), ValidationError> {
    let mut names = HashSet::new();

    for container in containers {
        if !names.insert(&container.name) {
            return Err(ValidationError::new("Containers must have different names"));
        }
    }

    Ok(())
}

const fn default_hidden_status() -> bool {
    true
}
