pub mod managements;

use std::collections::HashSet;

use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use validator::{Validate, ValidationError};

use crate::errors::KubeCTFError;

#[derive(Serialize, Deserialize, Validate, ToSchema)]
pub struct Env {
    #[validate(length(min = 1))]
    pub name: String,

    #[validate(length(min = 1))]
    pub value: String,
}

#[derive(Serialize, Deserialize, Debug, Clone, Copy, ToSchema)]
#[serde(rename_all = "lowercase")]
pub enum Protocols {
    HTTP,
    TCP,
}

#[derive(Serialize, Deserialize, Validate, Debug, ToSchema)]
pub struct Port {
    #[validate(range(min = 1, max = 65535))]
    pub number: i32,
    pub protocol: Protocols,

    #[validate(custom(function = "validate_lowercase"))]
    pub domain: Option<String>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Resource {
    #[serde(default = "default_resource_cpu")]
    pub cpu: String,

    #[serde(default = "default_resource_memory")]
    pub memory: String,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub struct Resources {
    pub requests: Option<Resource>,
    pub limits: Option<Resource>,
}

#[derive(Serialize, Deserialize, Validate, ToSchema)]
pub struct Container {
    pub image: String,

    #[validate(custom(function = "validate_container_name"))]
    #[serde(default)]
    pub name: String,

    #[serde(default, rename = "allowExternalNetwork")]
    pub allow_external_network: bool,

    #[serde(default)]
    pub envs: Vec<Env>,

    #[validate(custom(function = "validate_ports"))]
    #[serde(default)]
    pub ports: Vec<Port>,

    pub resources: Option<Resources>,
}

#[derive(Serialize, Deserialize)]
pub struct ChallengeRequest(pub Vec<Container>);

pub fn validate_domain(
    containers: &[Container],
    instance_id: &str,
    max_length: usize,
) -> Result<(), KubeCTFError> {
    for container in containers {
        let container_name = &container.name;
        for port in container.ports.iter() {
            let port_domain = port.domain.as_deref().unwrap_or("");

            let port_domain_part = match port_domain.is_empty() {
                true => port.number.to_string(),
                false => port_domain.to_string(),
            };

            let mut parts = vec![&port_domain_part, container_name, instance_id];
            parts.retain(|x| !x.is_empty());

            if parts.join("-").len() > max_length {
                return Err(KubeCTFError::ShitHappened(
                    "Subdomain is too long".to_string(),
                ));
            }
        }
    }

    Ok(())
}

fn validate_container_name(container_name: &str) -> Result<(), ValidationError> {
    let mut chars = container_name.chars();
    if let Some(data) = chars.next() {
        if data.is_ascii_digit() {
            return Err(ValidationError::new(
                "Container name can not start with digit",
            ));
        }
    }

    validate_lowercase(&chars.collect::<String>())
}

fn validate_lowercase(string: &str) -> Result<(), ValidationError> {
    if !string
        .chars()
        .all(|x| "abcdefghijklmnopqrstuvwxyz0123456789".contains(x))
    {
        return Err(ValidationError::new("All characters must be lowercase."));
    }

    Ok(())
}

fn validate_ports(ports: &[Port]) -> Result<(), ValidationError> {
    let mut port_domains = HashSet::new();

    for port in ports {
        if !port_domains.insert(&port.domain) {
            return Err(ValidationError::new(
                "Ports in one container should have different domain.",
            ));
        }
    }

    Ok(())
}

fn default_resource_memory() -> String {
    "128Mi".to_string()
}

fn default_resource_cpu() -> String {
    "100m".to_string()
}
