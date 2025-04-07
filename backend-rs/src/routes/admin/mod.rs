use crate::AppState;
use axum::Router;

pub mod challenges;

pub fn get_routes(state: AppState) -> Router {
    Router::new().nest("/challenges", challenges::get_routes(state))
}
