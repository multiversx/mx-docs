---
id: system-requirements
title: System Requirements
---

# **Elrond Nodes explained**

Nodes are computers running the Elrond software, so they contribute to the Elrond network by relaying information and validating it. Each node needs to stake 2.500 EGLD to become a **Validator** and is rewarded for its service. Nodes without a stake are called **Observers** - they are connected to the network and relay information, but they have no role in processing transactions and thus do not earn rewards.

# **System Requirements**

- 2 x CPU, either Intel or AMD, with the `SSE4.1` and `SSE4.2` flags (use [lscpu](https://manpages.ubuntu.com/manpages/trusty/man1/lscpu.1.html) to verify)
- 4 GB RAM
- 200 GB SSD
- 100 Mbit/s always-on internet connection
- Linux OS (Ubuntu 18.04 recommended) / MacOS

:::tip
Support for ARM processors (e.g. for Raspberry Pi) will come in the future, pending third-party issues.
:::

### **Networking**

In order for a node to be reachable by other nodes several conditions have to be met:

1. The port opened by the node on the interfaces must not be blocked by a firewall that denies inbound connections on it
2. If behind a NAT device, the node must be able to use the UPnP protocol to successfully negotiate a port that the NAT device will forward the incoming connections to (in other words, the router should be UPnP compatible)
3. There must be maximum 1 NAT device between the node and the Internet at large. Otherwise, the node will not be reachable by other nodes, even if it can connect itself to them.

To make sure the required ports are open, use the following command before continuing:

```
sudo ufw allow 37373:38383/tcp
```
