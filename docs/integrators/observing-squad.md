---
id: observing-squad
title: Observing Squad
---

[comment]: # (mx-context)

The N+1 setup for connecting to the MultiversX Network

In order to integrate with the MultiversX Network and be able to [broadcast transactions](/integrators/creating-transactions) and [query blockchain data](/integrators/querying-the-blockchain) in an _optimized_ approach, one needs to set up an **on-premises Observing Squad**.

An Observing Squad is defined as a set of `N` **Observer Nodes** (one for each Shard, including the Metachain) plus an [**MultiversX Proxy**](/sdk-and-tools/proxy) instance which will connect to these Observers and provide an HTTP API (by delegating requests to the Observers).

:::tip
Currently the MultiversX Mainnet has 3 Shards, plus the Metachain. Therefore, the Observing Squad is composed of 4 Observers and one Proxy instance.
:::

By setting up an Observing Squad and querying the blockchain data through the Proxy, the particularities of MultiversX's sharded architecture are abstracted away. **This means that the client interacting with the Proxy does not have to be concerned about sharding at all.**

[comment]: # (mx-context)

## **System requirements**

The Observing Squad can be installed on multiple machines or on a single, but more powerful machine.

In case of a single machine, our recommendation is as follows:

- 16 x CPU
- 32 GB RAM
- Disk space that can grow up to 5 TB
- 100 Mbit/s always-on Internet connection
- Linux OS (Ubuntu 20.04 recommended)

The recommended number of CPUs has been updated from `8` to `16` in April 2021, considering the increasing load over the network.

:::tip
These specs are only a recommendation. Depending on the load over the API or the observers, one should upgrade the machine as to keep the squad synced and with good performance.
:::

[comment]: # (mx-context)

## **Setup via the Mainnet scripts**

:::caution
`elrond-go-scripts-mainnet` are deprecated as of November 2022. Please use `mx-chain-scripts`, explained below.
:::

[comment]: # (mx-context)

## **Setup via mx-chain-scripts**

[comment]: # (mx-context)

## **Installation and Configuration**

The Observing Squad can be set up using the [installation scripts](/validators/nodes-scripts/config-scripts/). Within the installation process, the `DBLookupExtension` feature (required by the Hyperblock API) will be enabled by default.

Clone the installer repository:

```bash
git clone https://github.com/multiversx/mx-chain-scripts
```

Edit `config/variables.cfg` accordingly. For example:

```bash
ENVIRONMENT="mainnet"
...
CUSTOM_HOME="/home/ubuntu"
CUSTOM_USER="ubuntu"
```

Additionally, you might want to set the following option, so that the logs are saved within the `logs` folder of the node:

```bash
NODE_EXTRA_FLAGS="-log-save"
```

Please check that the `CUSTOM_HOME` directory exists. Run the installation script as follows:

```bash
./script.sh observing_squad
```

After installation, 5 new `systemd` units will be available (and enabled).

Start the nodes and the Proxy using the command:

```bash
./script.sh start
```

In order to check the status of the Observing Squad, please see the section **Monitoring and trivial checks** below.

[comment]: # (mx-context)

## **Upgrading the Observing Squad**

The Observing Squad can be updated using the installation scripts.

[comment]: # (mx-context)

### **General upgrade procedure**

:::important
`elrond-go-scripts-mainnet` are deprecated as of November 2022. Users of these scripts have to migrate to [mx-chain-scripts](/validators/nodes-scripts/config-scripts/).
The migration guide can he found [here](/validators/nodes-scripts/install-update/#migration-from-old-scripts).
:::

In order to upgrade the Observing Squad - that is, both the Observers and the Proxy, one should issue the following commands:

```bash
$ cd ~/mx-chain-scripts
$ ./script.sh github_pull
$ ./script.sh stop
$ ./script.sh upgrade_squad
$ ./script.sh upgrade_proxy
$ ./script.sh start
```

After running the commands above, the upgraded Observing Squad will start again. The expected downtime is about 2-3 minutes.

[comment]: # (mx-context)

## **Monitoring and trivial checks**

One can monitor the running Observers using the **termui** utility (installed during the setup process itself in the `CUSTOM_HOME="/home/ubuntu"
` folder), as follows:

```bash
~/elrond-utils/termui --address localhost:8080    # Shard 0
~/elrond-utils/termui --address localhost:8081    # Shard 1
~/elrond-utils/termui --address localhost:8082    # Shard 2
~/elrond-utils/termui --address localhost:8083    # Metachain
```

Alternatively, one can query the status of the Observers by performing GET requests using **curl**:

```bash
curl http://localhost:8080/node/status | jq    # Shard 0
curl http://localhost:8081/node/status | jq    # Shard 1
curl http://localhost:8082/node/status | jq    # Shard 2
curl http://localhost:8083/node/status | jq    # Metachain
```

The Proxy does not offer a **termui** monitor, but its activity can be inspected using **journalctl**:

```bash
journalctl -f -u elrond-proxy.service
```

Optionally, one can perform the following smoke test in order to fetch the latest synchronized hyperblock:

```bash
export NONCE=$(curl http://localhost:8079/network/status/4294967295 | jq '.data["status"]["erd_highest_final_nonce"]')
curl http://localhost:8079/hyperblock/by-nonce/$NONCE | jq

```

[comment]: # (mx-context)

## **Setup via Docker**

The Observing Squad can be also set up using Docker.

Clone the Observing Squad repository:

```bash
git clone https://github.com/multiversx/mx-chain-observing-squad.git
```

Install docker-compose if not already installed:

```bash
apt install docker-compose
```

Install and run the whole Observing Squad using the `./start_stack.sh` script from the mainnet folder:

```bash
cd mainnet
./start_stack.sh
```

In order to check if the Observing Squad is running, you can list the running containers:

```bash
docker ps
```

In order to check the status inside a container, you can check the logs on the machine for the last synchronized block nonce:

```bash
docker exec -it 'CONTAINER ID' /bin/bash
cat logs/mx-chain-.......log
```

More detailed commands for installing, building and running an Observing Squad using Docker are described [here](https://github.com/multiversx/mx-chain-observing-squad.git). The images (for the Proxy and for the Observers) are published on [Docker Hub](https://hub.docker.com/u/multiversx).
