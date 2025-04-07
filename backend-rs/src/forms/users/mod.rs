use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(Deserialize, Serialize, ToSchema)]
pub struct UserRegisterForm {
    pub username: String,
    pub email: String,
    pub password: String,
}

#[derive(Deserialize, Serialize, ToSchema)]
pub struct UserLoginForm {
    pub email: String,
    pub password: String,
}
