import { Construct } from "constructs";
import { App, TerraformStack } from "cdktf";
import { kubernetesCluster } from "@cdktf/provider-azurerm";
import { AzurermProvider } from "@cdktf/provider-azurerm/lib/provider";
import { VirtualNetwork } from "@cdktf/provider-azurerm/lib/virtual-network";
import { PrivateDnsZone } from "@cdktf/provider-azurerm/lib/private-dns-zone";
import { PrivateDnsResolver } from "@cdktf/provider-azurerm/lib/private-dns-resolver";

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const resourceGroupName = "personal";
    const location = "eastus";

    new AzurermProvider(this, "azurerm", { features: {} });

    // const wan = new VirtualWan(this, "wan", {
    //   name: "birks-wan",
    //   resourceGroupName,
    //   location,
    // });

    // new VirtualHub(this, "hub", {
    //   name: "birks-hub",
    //   resourceGroupName,
    //   location,
    //   virtualWanId: wan.id,
    //   addressPrefix: "10.10.0.0/20",
    // });

    const vnet = new VirtualNetwork(this, "vnet", {
      name: "personal",
      location,
      resourceGroupName,
      addressSpace: ["10.10.0.0/20"],
      subnet: [
        {
          name: "default",
          addressPrefix: "10.10.0.0/23",
        },
        {
          name: "GatewaySubnet",
          addressPrefix: "10.10.2.0/24",
        },
        {
          name: "dns-resolvers",
          addressPrefix: "10.10.3.0/28",
        },
      ],
      // gatewaySubnet: [
      //   {
      //     name: "gateway",
      //     addressPrefix: "10.10.2.0/24",
      //   }
    });

    // new VpnGateway(this, "vpn", {
    //   name: "Home connection",
    //   resourceGroupName,
    //   location,
    //   virtualHubId: hub.id,
    // });

    // TODO: Re-enable this when my subscription can create spot instances
    // new KubernetesClusterNodePool(this, "spot-node-pool", {
    //   name: "spot",
    //   kubernetesClusterId: k8sCluster.id,
    //   vmSize: "Standard_B2s",
    //   nodeCount: 1,
    //   minCount: 1,
    //   maxCount: 3,
    //   priority: "Spot",
    //   evictionPolicy: "Delete",
    //   enableAutoScaling: true,
    //   nodeLabels: {
    //     "kubernetes.azure.com/scalesetpriority": "spot",
    //   },
    //   nodeTaints: ["kubernetes.azure.com/scalesetpriority=spot:NoSchedule"],
    // });

    // TODO: Configure flux automatically here when this PR is merged:
    // https://github.com/hashicorp/terraform-provider-azurerm/issues/15011

    new PrivateDnsZone(this, "private-dns", {
      name: "birks.local",
      resourceGroupName,
    });

    new PrivateDnsResolver(this, "private-dns-resolver", {
      name: "private-resolver",
      resourceGroupName,
      location,
      virtualNetworkId: vnet.id,
      // privateDnsZoneConfigurations: [
      //   {
      //     name: "default",
      //     privateDnsZoneId: "birks.local",
      //     registrationEnabled: true,
      //     resolutionEnabled: true,
      //   },
      // ],
    });

    new kubernetesCluster.KubernetesCluster(this, "k8s", {
      name: "home",
      dnsPrefix: "home", // prefix of the hostname of the publicly exposed cluster api
      privateClusterEnabled: true,
      // privateDnsZoneId: privateDns.id,
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
  }
}

const app = new App();
new MyStack(app, "cdktf");
app.synth();
