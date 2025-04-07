pub mod crds;

use anyhow::bail;
use async_trait::async_trait;
use crds::{ingressroutes::IngressRoute, ingressroutetcps::IngressRouteTCP};
use k8s_openapi::api::{
    apps::v1::Deployment,
    core::v1::{Service, ServicePort},
    networking::v1::NetworkPolicy,
};
use kube::{
    api::{DeleteParams, ListParams, PostParams},
    Api, Client,
};
use serde_json::json;
use tokio::try_join;
use tracing::{error, info};

use crate::{
    errors::{KubeCTFError, Result},
    forms::challenges::{Container, Protocols},
};

use super::Provider;

#[derive(Clone)]
pub struct KubernetesProvider(Client);

#[async_trait]
impl Provider for KubernetesProvider {
    async fn create_instnace(&self, spec: &[Container], instance_id: &str) -> Result<()> {
        for container in spec {
            let deployment = self.create_deployment(container, instance_id);
            let service = self.create_service(container, instance_id);
            let netpol = self.create_network_policy(container, instance_id);
            let ingress = self.create_ingress(container, instance_id);

            if let Err(e) = try_join!(deployment, service, netpol, ingress) {
                error!("Failed to create resources - {}", e.to_string());
                let _ = self.cleanup(instance_id).await;

                return Err(KubeCTFError::DeployError(e.to_string()));
            }
        }

        Ok(())
    }

    async fn delete_instnace(&self, instance_id: &str) -> Result<()> {
        self.cleanup(instance_id)
            .await
            .map_err(|err| KubeCTFError::DeployError(err.to_string()))
    }
}

impl KubernetesProvider {
    pub const fn new(client: kube::Client) -> Self {
        Self(client)
    }

    async fn create_deployment(
        &self,
        container: &Container,
        instance_id: &str,
    ) -> anyhow::Result<()> {
        let client = self.0.clone();
        let deployments = Api::<Deployment>::default_namespaced(client);
        let container_name = match container.name.as_str() {
            "" => "container",
            name => name,
        };

        let parts = [&container.name, instance_id]
            .iter()
            .filter(|x| !x.is_empty())
            .copied()
            .collect::<Vec<_>>();

        let instance_name = parts.join("-");

        let d: Deployment = serde_json::from_value(json!({
            "apiVersion": "apps/v1",
            "kind": "Deployment",
            "metadata": {
                "name": instance_name,
                "namespace": "default",
                "labels": {
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                }
            },
            "spec": {
                "selector": {
                    "matchLabels": {
                        "kube-ctf.io/name": instance_id,
                        "kube-ctf.io/instance": instance_name,
                    }
                },
                "template": {
                    "metadata": {
                        "labels": {
                        "kube-ctf.io/name": instance_id,
                        "kube-ctf.io/instance": instance_name,
                        }
                    },
                    "spec": {
                        "containers": [{
                            "name": container_name,
                            "image": container.image,
                            "imagePullPolicy": "IfNotPresent",
                            "env": container.envs,
                            "resources": container.resources,
                        }]
                    }
                }
            }
        }))?;

        let pp = PostParams::default();
        match deployments.create(&pp, &d).await {
            Ok(_) => info!("Created deployment - {}", instance_name),
            Err(kube::error::Error::Api(e)) if e.code == 409 => {}
            Err(e) => {
                error!("Failed to create deployment: {e}");
                bail!(e)
            }
        }

        Ok(())
    }

    async fn create_service(&self, container: &Container, instance_id: &str) -> anyhow::Result<()> {
        let client = self.0.clone();
        let services = Api::<Service>::default_namespaced(client);
        let instance_name_parts = [&container.name, instance_id]
            .iter()
            .filter(|x| !x.is_empty())
            .copied()
            .collect::<Vec<_>>();

        let instance_name = instance_name_parts.join("-");

        let ports = container
            .ports
            .iter()
            .map(|port| ServicePort {
                name: Some(port.number.to_string()),
                port: port.number,
                protocol: Some("TCP".to_string()),
                ..Default::default()
            })
            .collect::<Vec<_>>();

        if ports.is_empty() {
            return Ok(());
        }

        let s: Service = serde_json::from_value(json!({
            "apiVersion": "v1",
            "kind": "Service",
            "metadata": {
                "name": instance_name,
                "namespace": "default",
                "labels": {
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                }
            },
            "spec": {
                "selector": {
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                },
                "ports": ports
            }
        }))?;

        let pp = PostParams::default();
        match services.create(&pp, &s).await {
            Ok(_) => info!("Created service - {}", instance_name),
            Err(kube::error::Error::Api(e)) if e.code == 409 => {}
            Err(e) => {
                error!("Failed to create service: {e}");
                bail!(e)
            }
        }

        Ok(())
    }

    async fn create_ingress(&self, container: &Container, instance_id: &str) -> anyhow::Result<()> {
        let client = self.0.clone();
        let container_name = &container.name;
        let parts = [&container.name, instance_id]
            .iter()
            .filter(|x| !x.is_empty())
            .copied()
            .collect::<Vec<_>>();

        let instance_name = parts.join("-");

        for port in &container.ports {
            let mut ingress_name_parts = vec![
                port.domain.as_deref().unwrap_or_default(),
                container_name,
                instance_id,
            ];
            ingress_name_parts.retain(|x| !x.is_empty());

            let ingress_name = ingress_name_parts.join("-");

            match port.protocol {
                Protocols::HTTP => {
                    Self::create_ingress_route(
                        client.clone(),
                        &instance_name,
                        &ingress_name,
                        instance_id,
                        port.number,
                    )
                    .await?;
                }
                Protocols::TCP => {
                    Self::create_ingress_route_tcp(
                        client.clone(),
                        &instance_name,
                        &ingress_name,
                        instance_id,
                        port.number,
                    )
                    .await?;
                }
            }
        }

        Ok(())
    }

    async fn create_ingress_route_tcp(
        client: Client,
        instance_name: &str,
        ingress_name: &str,
        instance_id: &str,
        port: i32,
    ) -> anyhow::Result<()> {
        let ingress_route_tcps = Api::<IngressRouteTCP>::default_namespaced(client);
        let base_domain = "tasks.cfrt.dev";

        let irt: IngressRouteTCP = serde_json::from_value(json!({
            "apiVersion": "traefik.io/v1alpha1",
            "kind": "IngressRouteTCP",
            "metadata": {
                "name": ingress_name,
                "namespace": "default",
                "labels": {
                    "kube-ctf.io/port": port.to_string(),
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                }
            },
            "spec": {
                "routes": [{
                    "match": format!("HostSNI(`{ingress_name}.{base_domain}`)"),
                    "services": [{
                        "name": instance_name,
                        "port": port
                    }]
                }],
                "tls": {
                    "secretName": "wildcard-cert"
                }
            }
        }))?;

        let pp = PostParams::default();
        match ingress_route_tcps.create(&pp, &irt).await {
            Ok(_) => info!("Created IngressRoute - {}", ingress_name),
            Err(kube::error::Error::Api(e)) if e.code == 409 => {}
            Err(e) => {
                error!("Failed to create IngressRoute: {e}");
                bail!(e)
            }
        }

        Ok(())
    }
    async fn create_ingress_route(
        client: Client,
        instance_name: &str,
        ingress_name: &str,
        instance_id: &str,
        port: i32,
    ) -> anyhow::Result<()> {
        let ingress_routes = Api::<IngressRoute>::default_namespaced(client);
        let base_domain = "tasks.cfrt.dev";

        let ir: IngressRoute = serde_json::from_value(json!({
            "apiVersion": "traefik.io/v1alpha1",
            "kind": "IngressRoute",
            "metadata": {
                "name": ingress_name,
                "namespace": "default",
                "labels": {
                    "kube-ctf.io/port": port.to_string(),
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                }
            },
            "spec": {
                "routes": [{
                    "match": format!("Host(`{ingress_name}.{base_domain}`)"),
                    "kind": "Rule",
                    "services": [{
                        "name": instance_name,
                        "port": port
                    }]
                }],
                "tls": {
                    "secretName": "wildcard-cert"
                }
            }
        }))?;

        let pp = PostParams::default();
        match ingress_routes.create(&pp, &ir).await {
            Ok(_) => info!("Created IngressRoute - {}", ingress_name),
            Err(kube::error::Error::Api(e)) if e.code == 409 => {}
            Err(e) => {
                error!("Failed to create IngressRoute: {e}");
                bail!(e)
            }
        }

        Ok(())
    }

    async fn create_network_policy(
        &self,
        container: &Container,
        instance_id: &str,
    ) -> anyhow::Result<()> {
        let client = self.0.clone();
        let netpols = Api::<NetworkPolicy>::default_namespaced(client);
        let container_name = &container.name;
        let parts = [container_name, instance_id]
            .iter()
            .filter(|x| !x.is_empty())
            .copied()
            .collect::<Vec<_>>();

        let instance_name = parts.join("-");

        let external_network_rule = json!({
            "to": [{
                "ipBlock": {
                    "cidr": "0.0.0.0/0",
                    "except": [
                        "10.0.0.0/8",
                        "172.16.0.0/20",
                        "192.168.0.0/16"
                    ]
                }
            }]
        });

        let mut egress_rules = vec![json!({
            "ports": [
                {
                    "port": 53,
                    "protocol": "TCP",
                },
                {
                    "port": 53,
                    "protocol": "UDP",
                }
            ],
            "to": [{
                "namespaceSelector": {
                    "matchLabels": {
                        "kubernetes.io/metadata.name": "kube-system",
                    }
                },
                "podSelector": {
                    "matchLabels": {
                        "k8s-app": "kube-dns"
                    }
                }
            }]
        })];

        if container.allow_external_network {
            egress_rules.push(external_network_rule);
        }

        egress_rules.push(json!({
            "to": [{
                "podSelector": {
                    "matchLabels": {
                        "kube-ctf.io/name": instance_id,
                    }
                }
            }]
        }));

        let np: NetworkPolicy = serde_json::from_value(json!({
            "apiVersion": "networking.k8s.io/v1",
            "kind": "NetworkPolicy",
            "metadata": {
                "name": instance_name,
                "namespace": "default",
                "labels": {
                    "kube-ctf.io/name": instance_id,
                    "kube-ctf.io/instance": instance_name,
                }
            },
            "spec": {
                "podSelector": {
                    "matchLabels": {
                        "kube-ctf.io/name": instance_id,
                        "kube-ctf.io/instance": instance_name,
                    }
                },
                "policyTypes": [
                    "Ingress",
                    "Egress",
                ],
                "egress": egress_rules,
                "ingress": [
                    {
                        "from": [{
                            "namespaceSelector": {
                                "matchLabels": {
                                    "kubernetes.io/metadata.name": "kube-system",
                                }
                            },
                            "podSelector": {
                                "matchLabels": {
                                    "app.kubernetes.io/instance": "traefik-kube-system"
                                }
                            }
                        }]
                    },
                    {
                        "from": [{
                            "podSelector": {
                                "matchLabels": {
                                    "kube-ctf.io/name": instance_id,
                                }
                            }
                        }]
                    }
                ]
            }
        }))?;

        let pp = PostParams::default();
        match netpols.create(&pp, &np).await {
            Ok(_) => info!("Created network policy - {}", instance_name),
            Err(kube::error::Error::Api(e)) if e.code == 409 => {}
            Err(e) => {
                error!("Failed to create network policy: {e}");
                bail!(e)
            }
        }

        Ok(())
    }

    async fn cleanup(&self, instance_id: &str) -> anyhow::Result<()> {
        let client = self.0.clone();
        let label = format!("kube-ctf.io/name={instance_id}");

        let deployments: Api<Deployment> = Api::default_namespaced(client.clone());
        let services: Api<Service> = Api::default_namespaced(client.clone());
        let netpols: Api<NetworkPolicy> = Api::default_namespaced(client.clone());
        let ingressroutes: Api<IngressRoute> = Api::default_namespaced(client.clone());
        let ingressroutetcps: Api<IngressRouteTCP> = Api::default_namespaced(client.clone());

        let dp = DeleteParams {
            grace_period_seconds: Some(0),
            ..Default::default()
        };
        let lp = ListParams {
            label_selector: Some(label),
            ..Default::default()
        };

        let ddeploy = deployments.delete_collection(&dp, &lp);
        let dsvc = services.delete_collection(&dp, &lp);
        let dnetpols = netpols.delete_collection(&dp, &lp);
        let dir = ingressroutes.delete_collection(&dp, &lp);
        let dirt = ingressroutetcps.delete_collection(&dp, &lp);

        if let Err(e) = try_join!(ddeploy, dsvc, dnetpols, dir, dirt) {
            error!("Failed to delete resources - {}", e.to_string());
        }

        Ok(())
    }
}
