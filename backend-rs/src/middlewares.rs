use axum::{extract::Request, http::StatusCode, response::Response};
use tokio::time::Instant;
use tracing::info;

use crate::{
    errors::KubeCTFError,
    jwt::{generate::claims_from_headers, models::UserRole},
};

pub async fn log_request(
    req: Request,
    next: axum::middleware::Next,
) -> Result<Response, StatusCode> {
    let start = Instant::now();
    let path = req.uri().path().to_string();
    let method = req.method().clone();

    let response = next.run(req).await;

    let status = response.status();
    let latency = start.elapsed();

    info!(
        target: "kube-ctf",
        method = %method,
        path = %path,
        status = status.as_u16(),
        latency = ?latency,
        "request"
    );

    Ok(response)
}

pub async fn auth_admin(
    req: Request,
    next: axum::middleware::Next,
) -> crate::errors::Result<Response> {
    let headers = req.headers();
    let jwt = claims_from_headers(headers)?;

    if matches!(jwt.role, UserRole::Admin) {
        return Err(KubeCTFError::Forbidden("You are not an admin".to_string()));
    }

    Ok(next.run(req).await)
}
