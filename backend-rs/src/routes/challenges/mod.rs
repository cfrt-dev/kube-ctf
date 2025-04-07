pub mod deploy;
pub mod routes;

use crate::AppState;
use axum::{
    routing::{delete, get, post},
    Router,
};
use deploy::{delete_challenge, deploy_challenge};
use routes::{get_challenge, list_challenges, submit};

pub fn get_routes(state: AppState) -> Router {
    let deploy = Router::new()
        .route("/{challenge_id}", post(deploy_challenge))
        .route("/{challenge_id}", delete(delete_challenge))
        .with_state(state.clone());

    Router::new()
        .route("/", get(list_challenges))
        .route("/submit", post(submit))
        .route("/{challenge_id}", get(get_challenge))
        .nest("/deploy", deploy)
        .with_state(state)
}
