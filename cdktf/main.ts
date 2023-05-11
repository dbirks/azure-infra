import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { kubernetesCluster } from "@cdktf/provider-azurerm";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";
import { KubernetesClusterNodePool } from "@cdktf/provider-azurerm/lib/kubernetes-cluster-node-pool";
import { KubernetesClusterExtension } from "@cdktf/provider-azurerm/lib/kubernetes-cluster-extension";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const resourceGroupName = "personal";

    new AzurermProvider(this, "azurerm", { features: {} });

    const k8sCluster = new kubernetesCluster.KubernetesCluster(this, "k8s", {
      name: "home",
      dnsPrefix: "home", // prefix of the hostname of the publicly exposed cluster api
      location: "eastus",
      resourceGroupName,
      kubernetesVersion: "1.26",
      automaticChannelUpgrade: "patch",
      identity: {
        type: "SystemAssigned",
      },

      defaultNodePool: {
        name: "default",
        nodeCount: 1,
        vmSize: "Standard_B2s",
      },
    });

    new KubernetesClusterNodePool(this, "spot-node-pool", {
      name: "spot",
      kubernetesClusterId: k8sCluster.id,
      // vmSize: "Standard_B2s",
      vmSize: "Standard_D2s_v3",
      nodeCount: 0,
      minCount: 0,
      maxCount: 3,
      priority: "Spot",
      evictionPolicy: "Delete",
      enableAutoScaling: true,
      nodeLabels: {
        "kubernetes.azure.com/scalesetpriority": "spot",
      },
      nodeTaints: ["kubernetes.azure.com/scalesetpriority=spot:NoSchedule"],
    });

    new KubernetesClusterExtension(this, "k8s-extension-flux", {
      name: "flux",
      clusterId: k8sCluster.id,
      extensionType: "Microsoft.Flux",
      releaseNamespace: "flux-system",
      configurationSettings: {
        "gitRepository.url": "https://github.com/dbirks/personal-aks-cluster",
        "gitRepository.repositoryRef.branch": "main",
        "sourceKind": "GitRepository",


        // gitBranch: "main",
        // gitPath: "flux",
        // operatorInstanceName: "flux",
        // operatorNamespace: "flux-system",
        // syncInterval: "5m",
        // deleteCRD: "true",
      },
    });
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
