use crate::forms::challenges::Container;
use sqlx::{prelude::FromRow, types::Uuid};
use utoipa::ToSchema;

use chrono::NaiveDateTime;
use serde::{Deserialize, Serialize};

use crate::forms::challenges::Protocols;

#[derive(Serialize, Deserialize)]
pub struct Link {
    pub url: String,
    pub protocol: Protocols,
}

#[derive(Serialize, Deserialize)]
pub struct DeployChallengeResponse {
    pub id: String,
    pub links: Vec<Link>,
    pub start_time: NaiveDateTime,
    pub end_time: NaiveDateTime,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeFileModel {
    pub id: Uuid,
    pub name: String,
    pub url: String,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, PartialEq, Eq, Debug, Clone, Copy)]
#[sqlx(type_name = "ChallengeType")]
pub enum ChallengeValueType {
    Static,
    Dynamic,
}

#[derive(Serialize, Deserialize, ToSchema, sqlx::Type, Debug)]
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

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeValueDecayFunction {
    pub r#type: ChallengeValueDecayFunctionType,
    pub decay: i32,
    pub minimum_value: i32,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeDeploy {
    pub r#type: ChallengeDeployType,
    pub containers: Vec<Container>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct ChallengeValue {
    pub r#type: ChallengeValueType,
    #[serde(rename = "initialValue")]
    pub initial_value: i32,
    pub decay_function: Option<ChallengeValueDecayFunction>,
}

#[derive(Serialize, Deserialize, ToSchema, FromRow)]
pub struct ChallengeModel {
    pub id: i32,

    pub name: String,
    pub flag: String,
    pub author: Option<String>,
    pub category: String,
    pub description: Option<String>,

    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub hints: Vec<String>,

    #[serde(default, rename = "dynamicFlag")]
    pub dynamic_flag: bool,
    pub hidden: bool,

    pub value: ChallengeValue,

    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub files: Vec<ChallengeFileModel>,
    pub deploy: Option<ChallengeDeploy>,
}

#[derive(Serialize, Deserialize, FromRow)]
pub struct PublicChallengeInfoModel {
    pub id: i32,
    pub name: String,

    pub author: Option<String>,
    pub category: String,
    pub description: Option<String>,

    pub points: i32,
    pub solved: Option<bool>,

    pub files: Vec<ChallengeFileModel>,
    pub hints: Vec<String>,

    pub deploy: Option<DeployChallengeResponse>,
}
