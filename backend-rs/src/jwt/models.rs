use crate::{errors::KubeCTFError, jwt::generate::validate_token};
use chrono::{Duration, Utc};
use serde::{Deserialize, Serialize};
use std::str::FromStr;

const JWT_EXPIRY_HOURS: i64 = 24;

#[derive(Serialize, Deserialize, Clone, Debug, sqlx::Type)]
#[serde(rename_all = "lowercase")]
#[sqlx(type_name = "UserType", rename_all = "lowercase")]
pub enum UserRole {
    User,
    Admin,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct Claims {
    pub user_id: i32,
    pub role: UserRole,
    pub iat: i64,
    pub exp: i64,
}

impl Claims {
    pub fn new(user_id: i32, role: UserRole) -> Self {
        let iat = Utc::now();
        let exp = iat + Duration::hours(JWT_EXPIRY_HOURS);

        Self {
            role,
            user_id,
            iat: iat.timestamp(),
            exp: exp.timestamp(),
        }
    }
}

impl FromStr for Claims {
    type Err = KubeCTFError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        let claims: Vec<_> = s.split(' ').collect();
        let token = claims.get(1).ok_or(KubeCTFError::ShitHappened(
            "Wrong authorization Bearer format".to_string(),
        ))?;
        validate_token(token)
    }
}
