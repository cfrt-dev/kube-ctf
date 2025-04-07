package forms

import "encoding/json"

type Global struct {
	BaseDomain string `json:"baseDomain" binding:"required"`
	TlsCert    string `json:"tlsCert" binding:"required"`
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
	Requests Resource `json:"requests,omitempty"`
	Limits   Resource `json:"limits,omitempty"`
}

type Container struct {
	Image                string    `json:"image" binding:"required"`
	Name                 string    `json:"name,omitempty"`
	AllowExternalNetwork bool      `json:"allowExternalNetwork,omitempty"`
	Envs                 []Env     `json:"envs,omitempty"`
	Ports                []Port    `json:"ports,omitempty"`
	Resources            Resources `json:"resources,omitempty"`
}

type ChallengeRequest struct {
	Global           Global            `json:"global" binding:"required"`
	Labels           map[string]string `json:"labels,omitempty"`
	Containers       []Container       `json:"containers" binding:"required"`
	ImagePullSecrets []string          `json:"imagePullSecrets,omitempty"`
}

type QueryParams struct {
	Name      string `form:"name" binding:"required"`
	Namespace string `form:"namespace,omitempty"`
}

func StructToMap(s any) map[string]any {
	data, _ := json.Marshal(s)
	var result map[string]any
	_ = json.Unmarshal(data, &result)
	return result
}
