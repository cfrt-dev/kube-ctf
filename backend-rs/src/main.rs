#![deny(clippy::unwrap_used)]
#![warn(clippy::all, clippy::pedantic, clippy::nursery)]
#![allow(async_fn_in_trait)]
#![allow(clippy::missing_errors_doc)]
#![allow(clippy::missing_panics_doc)]
#![allow(clippy::must_use_candidate)]

pub mod controllers;
pub mod db;
pub mod errors;
pub mod forms;
pub mod jwt;
pub mod macros;
pub mod middlewares;
pub mod models;
#[cfg(feature = "swagger")]
mod openapi;
pub mod providers;
pub mod routes;
pub mod utils;

use std::sync::Arc;

use crate::utils::env;
use axum::{middleware::from_fn, Router};
use middlewares::log_request;
use providers::{docker::DockerProvider, kubernetes::KubernetesProvider, Provider};
use routes::{admin, challenges, users};
use sqlx::PgPool;
use tokio::net::TcpListener;
use tracing::{info, Level};

#[cfg(feature = "swagger")]
use crate::openapi::ApiDoc;
#[cfg(feature = "swagger")]
use utoipa::OpenApi;
#[cfg(feature = "swagger")]
use utoipa_swagger_ui::SwaggerUi;

#[derive(Clone)]
pub struct AppState {
    pub pool: PgPool,
    pub rdb: redis::Client,
    pub provider: Arc<dyn Provider + Send + Sync>,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt()
        .compact()
        .with_target(true)
        .with_max_level(Level::DEBUG)
        .init();

    let port = env("PORT");
    let db_url = env("DATABASE_URL");
    let redis_url = env("REDIS_URL");
    let provider: Arc<dyn Provider + Send + Sync> = match env("PROVIDER").to_lowercase().as_str() {
        "kubernetes" => Arc::new(KubernetesProvider::new(
            kube::Client::try_default()
                .await
                .expect("Failed to connect to kubernetes"),
        )),
        "docker" => Arc::new(DockerProvider::new()),
        provider => panic!("Unknown provider - {provider}"),
    };

    info!("Connecting to postgres");
    let pool = PgPool::connect(&db_url).await?;
    info!("Running migration");
    sqlx::migrate!("./migrations").run(&pool).await?;

    info!("Connecting to redis");
    let rdb = redis::Client::open(redis_url)?;
    let state = AppState {
        pool,
        rdb,
        provider,
    };

    let router = Router::new()
        .nest("/admin", admin::get_routes(state.clone()))
        .nest("/challenges", challenges::get_routes(state.clone()))
        .nest("/accounts", users::get_routes(state.clone()))
        .layer(from_fn(log_request));

    let app = Router::new().nest("/api", router);

    #[cfg(feature = "swagger")]
    let app = app
        .merge(SwaggerUi::new("/api/swagger-ui").url("/api-doc/openapi.json", ApiDoc::openapi()));

    let addr = format!("0.0.0.0:{port}");
    let listener = TcpListener::bind(&addr).await?;

    info!("Server listening at {}", addr);
    axum::serve(listener, app).await?;

    Ok(())
}
