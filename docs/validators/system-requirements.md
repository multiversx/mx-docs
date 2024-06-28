---
id: system-requirements
title: System Requirements
---

[comment]: # (mx-abstract)

This page provides the system requirements for running a MultiversX node.

[comment]: # (mx-context-auto)

## **MultiversX Nodes explained**

Nodes are computers running the MultiversX software, so they contribute to the MultiversX network by relaying information and validating it. Each node needs to stake 2500 EGLD to become a **Validator** and is rewarded for its service. Nodes without a stake are called **Observers** - they are connected to the network and relay information, but they have no role in processing transactions and thus do not earn rewards.

[comment]: # (mx-context-auto)

## **Minimum System Requirements for running 1 MultiversX Node**

- 4 x dedicated/physical CPUs, either Intel or AMD, **with `SSE4.1` and `SSE4.2` flags** (use [lscpu](https://manpages.ubuntu.com/manpages/trusty/man1/lscpu.1.html) to verify)
- 8 GB RAM
- 200 GB SSD
- 100 Mbit/s always-on internet connection, at least 4 TB/month data plan
- Linux OS (Ubuntu 22.04 recommended) / MacOS

:::caution
1. The CPUs must be `SSE4.1` and `SSE4.2` capable, otherwise the node won't be able to use the Wasmer 2 VM available through the VM 1.5 (and above) and the node will not be able to sync blocks from the network.
2. If the system chosen to host the node is a VPS, the host must have dedicated CPUs. Using shared CPUs can hinder your node's performance that will result in a decrease of node's rating and eventually the node might get jailed.
3. If you run multiple MultiversX Nodes on the same machine, the host running those nodes should have the specs at least equal to the minimum system requirements multiplied by the number of nodes running on that host.
:::

:::tip
We are promoting using processors that support the `fma` or `fma3` instruction set since it is widely used by our VM. Displaying the available CPU instruction set can be done using the Linux shell command `sudo lshw` or `lscpu`
:::

[comment]: # (mx-context-auto)

## **ARM Architecture Support**

Processors with ARM architecture are now supported.

:::caution
This update comes after extensive testing to ensure compatibility and functionality. However, we advise caution with its use in production environments.
:::

Usage recommendations:  
- Testnet/Devnet Validators: ARM processors can be utilized effectively as validator nodes on Testnet or Devnet.  
- Mainnet Observers: ARM processors can be utilized effectively as observer nodes that can provide API support to embedded and non-critical services.  
- Mainnet Validators: Despite successful testing, **it is NOT recommended to use ARM processors as mainnet validators** at this time due to potential performance and reliability concerns.

We will continue to monitor and improve support for ARM architecture, and we encourage the community to provide feedback on their experiences.

[comment]: # (mx-context-auto)

### **Networking**

In order for a node to be reachable by other nodes several conditions have to be met:

1. The port opened by the node on the interfaces must not be blocked by a firewall that denies inbound connections on it
2. If behind a NAT device, the node must be able to use the UPnP protocol to successfully negotiate a port that the NAT device will forward the incoming connections to (in other words, the router should be UPnP compatible)
3. There must be maximum 1 NAT device between the node and the Internet at large. Otherwise, the node will not be reachable by other nodes, even if it can connect itself to them.

To make sure the required ports are open, use the following command before continuing:

```
sudo ufw allow 37373:38383/tcp
```

:::note
The above ports need to be open in order to allow the node to communicate with other nodes via p2p. The configuration for the port range is set [here](https://github.com/multiversx/mx-chain-go/blob/master/cmd/node/config/p2p.toml#L7).
:::

:::caution
In case a firewall for outgoing traffic is used please make sure traffic to ports 10000 (p2p seeder) as well as 123 (NTP) is explicitly allowed.
:::
