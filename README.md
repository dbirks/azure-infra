# personal-aks-cluster

## Overview

<!-- This repo sets up a Kubernetes cluster on Azure, using  -->

This repo sets up a Kubernetes cluster on Azure, using CDK for Terraform (cdktf) as the infrastructure-as-code tool.

Repo overview:

- `cdktf/`: The folder for CDK for Terraform, written with TypeScript
  - `KubernetesCluster`: Creates the Kubernetes cluster itself, with a default node pool.
  - `KubernetesClusterNodePool`: Creates an additional node pool with spot instances.
  - `KubernetesClusterExtension`: Configures the Flux extension, which gives us the ability to do GitOps, controlling the yaml that will be applied to Kubernetes in a git repo (this repo).
- `flux/`: 


```
curl -LO https://app.getambassador.io/yaml/emissary/3.6.0/emissary-crds.yaml
```
