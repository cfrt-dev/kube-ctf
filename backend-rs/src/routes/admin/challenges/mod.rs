pub mod routes;

use axum::{middleware::from_fn, routing::post, Router};
use routes::add_challenge;

use crate::{middlewares::auth_admin, AppState};

pub fn get_routes(state: AppState) -> Router {
    Router::new()
        .route("/new", post(add_challenge))
        .layer(from_fn(auth_admin))
        .with_state(state)
}
