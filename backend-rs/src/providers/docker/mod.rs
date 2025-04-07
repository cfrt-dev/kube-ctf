#![allow(unused_variables)]
use crate::forms::challenges::Container;
use async_trait::async_trait;

use super::Provider;

#[derive(Clone, Default)]
pub struct DockerProvider;

impl DockerProvider {
    pub const fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl Provider for DockerProvider {
    async fn create_instnace(
        &self,
        spec: &[Container],
        instance_id: &str,
    ) -> crate::errors::Result<()> {
        todo!()
    }

    async fn delete_instnace(&self, instance_id: &str) -> crate::errors::Result<()> {
        todo!()
    }
}
