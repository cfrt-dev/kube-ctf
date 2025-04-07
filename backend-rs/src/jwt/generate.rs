use crate::errors::KubeCTFError;
use crate::jwt::models::Claims;
use axum::http::HeaderMap;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use std::{env, iter::repeat_with, sync::LazyLock};
use tonic::metadata::MetadataMap;

use super::models::UserRole;

static SECRET: LazyLock<Vec<u8>> = LazyLock::new(|| {
    env::var("JWT_SECRET").map_or_else(|_| generate_bytes(32), |data| data.as_bytes().to_vec())
});

pub fn create_token(user_id: i32, role: UserRole) -> Result<String, KubeCTFError> {
    let claims = Claims::new(user_id, role);

    encode(
        &Header::new(Algorithm::HS256),
        &claims,
        &EncodingKey::from_secret(&SECRET),
    )
    .map_err(KubeCTFError::InvalidToken)
}

pub fn validate_token(token: &str) -> Result<Claims, KubeCTFError> {
    decode::<Claims>(
        token,
        &DecodingKey::from_secret(&SECRET),
        &Validation::new(Algorithm::HS256),
    )
    .map(|data| data.claims)
    .map_err(KubeCTFError::InvalidToken)
}

pub fn claims_from_headers(headers: &impl Map) -> Result<Claims, KubeCTFError> {
    if !headers.contains_key("authorization") {
        return Err(KubeCTFError::Forbidden(
            "No authorization token was found".to_string(),
        ));
    }

    headers
        .get("authorization")
        .map_err(|_| KubeCTFError::ShitHappened("Wrong authorization Bearer format".to_string()))?
        .expect("meow token error")
        .parse()
}

pub fn generate_bytes(number: usize) -> Vec<u8> {
    repeat_with(|| fastrand::u8(..)).take(number).collect()
}

pub trait Map {
    fn get(&self, key: &str) -> anyhow::Result<Option<&str>>;
    fn contains_key(&self, key: &str) -> bool;
}

impl Map for HeaderMap {
    fn get(&self, key: &str) -> anyhow::Result<Option<&str>> {
        Ok(self.get(key).map(|x| x.to_str()).transpose()?)
    }

    fn contains_key(&self, key: &str) -> bool {
        self.contains_key(key)
    }
}

impl Map for MetadataMap {
    fn get(&self, key: &str) -> anyhow::Result<Option<&str>> {
        Ok(self.get(key).map(|x| x.to_str()).transpose()?)
    }

    fn contains_key(&self, key: &str) -> bool {
        self.contains_key(key)
    }
}
