use axum::{
    extract::{FromRequest, Request},
    Json,
};
use serde::de::DeserializeOwned;
use validator::Validate;

use crate::{errors::KubeCTFError, forms::challenges::Container, models::challenges::Link};

pub fn env(key: &str) -> String {
    dotenvy::var(key).unwrap_or_else(|_| panic!("`{key}` environment variable not found"))
}

pub struct ValidatedJson<T>(pub T);

impl<S, T> FromRequest<S> for ValidatedJson<T>
where
    S: Send + Sync,
    T: DeserializeOwned + Validate,
{
    type Rejection = KubeCTFError;

    async fn from_request(req: Request, state: &S) -> Result<Self, Self::Rejection> {
        let Json(value): Json<T> = Json::from_request(req, state)
            .await
            .map_err(|err| KubeCTFError::ShitHappened(err.to_string()))?;

        value.validate()?;

        Ok(Self(value))
    }
}

pub fn generate_id(length: usize) -> String {
    let first = fastrand::lowercase();
    let id = fastrand::choose_multiple("abcdefghijklmnopqrstuvwxyz0123456789".chars(), length - 1)
        .iter()
        .collect::<String>();
    format!("{first}{id}")
}

pub fn generate_container_links(
    base_domain: &str,
    id: &str,
    containers: &[Container],
) -> Vec<Link> {
    let mut links = Vec::new();

    for container in containers {
        let container_name = &container.name;

        if container.ports.is_empty() {
            continue;
        }

        for port in &container.ports {
            let port_domain = port.domain.as_deref().unwrap_or_default();
            let parts = [port_domain, container_name, id]
                .iter()
                .filter(|x| !x.is_empty())
                .copied()
                .collect::<Vec<_>>();

            let url = format!("{link}.{base_domain}", link = parts.join("-"));
            links.push(Link {
                url,
                protocol: port.protocol,
            });
        }
    }

    links
}
