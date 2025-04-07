use crate::routes::users::auth::{__path_login, __path_register};
use utoipa::openapi::security::{Http, HttpAuthScheme, SecurityScheme};
use utoipa::{Modify, OpenApi};

struct SecurityAddon;
impl Modify for SecurityAddon {
    fn modify(&self, openapi: &mut utoipa::openapi::OpenApi) {
        let components: &mut utoipa::openapi::Components = openapi
            .components
            .as_mut()
            .expect("shit happened at SecurityAddon");
        components.add_security_scheme(
            "bearerAuth",
            SecurityScheme::Http(Http::new(HttpAuthScheme::Bearer)),
        );
    }
}

#[derive(OpenApi)]
#[openapi(
    paths(
        login, register
    ),
    tags(
        (name = "Users", description = "User management"),
    ),
    info(
        title = "KubeCTF",
        license(
            name = "KubeCTF",
            identifier = "MIT"
        )
    ),
    modifiers(&SecurityAddon)
)]
pub struct ApiDoc;
