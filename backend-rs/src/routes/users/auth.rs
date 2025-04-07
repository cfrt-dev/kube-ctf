use crate::{
    db::Db,
    errors::KubeCTFError,
    forms::users::{UserLoginForm, UserRegisterForm},
    jwt::{generate::create_token, hashing::Argon, models::UserRole},
    AppState,
};
use axum::{extract::State, http::StatusCode, Json};

/// Register new user with username, email and password
#[utoipa::path(
    post,
    tag = "Users",
    path = "/api/accounts/register",
    request_body = UserRegisterForm,
    responses(
        (status = 201, body = String, description = "Create user and return jwt"),
        (status = 401, body = String, description = "User with the same email already exists")
    )
)]
pub async fn register(
    State(state): State<AppState>,
    Json(form): Json<UserRegisterForm>,
) -> Result<(StatusCode, String), KubeCTFError> {
    let mut conn = state.pool.conn().await?;
    let hashed_password = Argon::hash_password(form.password.as_bytes())?;

    let row = sqlx::query!(
        r#"
        INSERT INTO users(name, email, password)
        VALUES ($1, $2, $3)
        RETURNING id
        "#,
        form.username,
        form.email,
        hashed_password
    )
    .fetch_one(conn.as_mut())
    .await
    .map_err(|err| match err {
        sqlx::Error::Database(e) if e.is_unique_violation() => {
            KubeCTFError::AlreadyExists("User with the same email already exists.".to_string())
        }
        _ => KubeCTFError::DatabaseError(err),
    })?;

    let token = create_token(row.id, UserRole::User)?;
    Ok((StatusCode::CREATED, token))
}

/// Login user with email and password
#[utoipa::path(
    post,
    tag = "Users",
    path = "/api/accounts/login",
    request_body = UserLoginForm,
    responses(
        (status = 200, body = String, description = "JWT token"),
        (status = 403, description = "Wrong email or password")
    )
)]
pub async fn login(
    State(state): State<AppState>,
    Json(form): Json<UserLoginForm>,
) -> Result<String, KubeCTFError> {
    let mut conn = state.pool.conn().await?;

    let row = sqlx::query!(
        r#"
        SELECT id, team_id, password, role as "role: UserRole"
        FROM users
        WHERE email = $1
        "#,
        form.email
    )
    .fetch_one(conn.as_mut())
    .await
    .map_err(|err| match err {
        sqlx::Error::RowNotFound => KubeCTFError::Forbidden("Wrong email or password.".to_string()),
        _ => KubeCTFError::DatabaseError(err),
    })?;

    if !Argon::verify(form.password.as_bytes(), &row.password)? {
        return Err(KubeCTFError::Forbidden(
            "Wrong email or password.".to_string(),
        ));
    }

    let token = create_token(row.id, row.r#role)?;
    Ok(token)
}
