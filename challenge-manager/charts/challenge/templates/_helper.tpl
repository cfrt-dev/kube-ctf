{{- define "c.join" -}}
  {{- $result := list -}}
  {{- range . -}}
    {{- if . -}}
      {{- $result = append $result . -}}
    {{- end -}}
  {{- end -}}
  {{- join "-" $result }}
{{- end -}}