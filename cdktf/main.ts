import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { kubernetesCluster } from "@cdktf/provider-azurerm";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const resourceGroupName = "personal";

    new AzurermProvider(this, "azurerm", { features: {} });

    new kubernetesCluster.KubernetesCluster(this, "k8s", {
      name: "cdktf-k8s-cluster",
      location: "eastus",
      resourceGroupName,
      defaultNodePool: {
        name: "default",
        nodeCount: 1,
        vmSize: "Standard_B2s",

        // osDiskSizeGb: 30,
      },
      dnsPrefix: "test",
      identity: {
        type: "SystemAssigned",
      },
      // kubernetesVersion: "1.26.3",
    });
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
