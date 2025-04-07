use crate::errors::Result;
use crate::forms::challenges::Container;
use async_trait::async_trait;

pub mod docker;
pub mod kubernetes;

#[async_trait]
pub trait Provider {
    async fn create_instnace(&self, spec: &[Container], instance_id: &str) -> Result<()>;
    async fn delete_instnace(&self, instance_id: &str) -> Result<()>;
}
