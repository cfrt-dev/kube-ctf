pub mod deploy;
pub mod routes;

use crate::AppState;
use axum::{
    routing::{delete, get, post},
    Router,
};
use deploy::{delete_challenge, deploy_challenge};
use routes::list_challenge_metadata;

pub fn get_routes(state: AppState) -> Router {
    let deploy = Router::new()
        .route("/{id}", post(deploy_challenge))
        .route("/{id}", delete(delete_challenge))
        .with_state(state.clone());

    Router::new()
        .route("/", get(list_challenge_metadata))
        .nest("/deploy", deploy)
        .with_state(state)
}
