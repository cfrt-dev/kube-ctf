use crate::AppState;
use auth::{login, register};
use axum::{routing::post, Router};

pub mod auth;

pub fn get_routes(state: AppState) -> Router {
    Router::new()
        .route("/login", post(login))
        .route("/register", post(register))
        .with_state(state)
}
