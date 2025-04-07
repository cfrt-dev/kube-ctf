use sqlx::{pool::PoolConnection, PgPool, Postgres};

use crate::errors::KubeCTFError;

pub trait Db {
    type Conn;
    async fn conn(&self) -> Result<Self::Conn, KubeCTFError>;
}

impl Db for PgPool {
    type Conn = PoolConnection<Postgres>;

    async fn conn(&self) -> Result<Self::Conn, KubeCTFError> {
        self.acquire().await.map_err(KubeCTFError::DatabaseError)
    }
}

pub trait Rclient {
    type Conn;
    async fn conn(&self) -> Result<Self::Conn, KubeCTFError>;
}

impl Rclient for redis::Client {
    type Conn = redis::aio::MultiplexedConnection;

    async fn conn(&self) -> Result<Self::Conn, KubeCTFError> {
        self.get_multiplexed_tokio_connection()
            .await
            .map_err(KubeCTFError::RedisError)
    }
}
