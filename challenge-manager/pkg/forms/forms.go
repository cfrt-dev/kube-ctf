package forms

type Globals struct {
	BaseDomain string `json:"base_domain" binding:"required"`
	TlsCert    string `json:"tls_cert" binding:"required"`
}

type Env struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}

type Port struct {
	Number   uint16 `json:"number" binding:"required"`
	Protocol string `json:"protocol,omitempty"`
	Domain   string `json:"domain,omitempty"`
}

type Resource struct {
	CPU    string `json:"cpu,omitempty"`
	Memory string `json:"memory,omitempty"`
}

type Resources struct {
	Request Resource `json:"request,omitempty"`
	Limits  Resource `json:"limits,omitempty"`
}

type Container struct {
	Image                string    `json:"image" binding:"required"`
	Name                 string    `json:"name" binding:"required"`
	AllowExternalNetwork bool      `json:"allow_external_network,omitempty"`
	Envs                 []Env     `json:"envs" binding:"required"`
	Ports                []Port    `json:"ports" binding:"required"`
	Resource             Resources `json:"resources,omitempty"`
}

type ChallengeRequest struct {
	Globals          Globals           `json:"globals" binding:"required"`
	Labels           map[string]string `json:"labels,omitempty"`
	Containers       []Container       `json:"containers" binding:"required"`
	ImagePullSecrets []string          `json:"image_pull_secrets,omitempty"`
}

type QueryParams struct {
	Name      string `form:"name" binding:"required"`
	Namespace string `form:"namespace,omitempty"`
}
