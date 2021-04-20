---
id: observing-squad
title: Observing Squad
---

The N+1 setup for connecting to the Elrond Network

In order to integrate with the Elrond Network and be able to [broadcast transactions](/integrators/creating-transactions) and [query blockchain data](/integrators/querying-the-blockchain) in an _optimized_ approach, one needs to setup an **on-premises Observing Squad**.

An Observing Squad is defined as a set of `N` **Observer Nodes** (one for each Shard, including the Metachain) plus an [**Elrond Proxy**](/sdk-and-tools/proxy) instance which will connect to these Observers and provide an HTTP API (by delegating requests to the Observers).

:::tip
Currently the Elrond Mainnet has 3 Shards, plus the Metachain. Therefore, the Observing Squad is composed of 4 Observers and one Proxy instance.
:::

By setting up an Observing Squad and querying the blockchain data through the Proxy, the particularities of Elrond's sharded architecture are abstracted away. **This means that the client interacting with the Proxy does not have to be concerned about sharding at all.**

## **System requirements**

The Observing Squad can be installed on multiple machines or on a single, but more powerful machine.

In case of a single machine, our recommendation is as follows:

- 16 x CPU
- 32 GB RAM
- HDD that can grow up to 5TB
- 100 Mbit/s always-on Internet connection
- Linux OS (Ubuntu 20.04 recommended)

The recommended number of CPUs has been updated from `8` to `16` in April 2021, considering the increasing load over the network.

:::tip
These specs are only a recommendation. Depending on the load over the API or the observers, one should upgrade the machine as to keep the squad synced and with good performance.
:::

# **Setup via the Mainnet scripts**

## **Installation and Configuration**

The Observing Squad can be set up using the [installation scripts](/validators/mainnet/config-scripts). Within the installation process, the `LookupDatabaseExtension` feature (required by the Hyperblock API) will be enabled by default.

Clone the installer repository:

```
git clone https://github.com/ElrondNetwork/elrond-go-scripts-mainnet.git
```

Edit `config/variables.cfg` accordingly. For example:

```
CUSTOM_HOME="/home/ubuntu"
CUSTOM_USER="ubuntu"
```

Additionally, you might want to set the following option, so that the logs are saved within the `logs` folder of the node:

```
NODE_EXTRA_FLAGS="-log-save"
```

Please check that the `CUSTOM_HOME` directory exists. Run the installation script as follows:

```
./script.sh observing_squad
```

After installation, 5 new `systemd` units will be available (and enabled).

Start the nodes and the Proxy using the command:

```
./script.sh start
```

In order to check the status of the Observing Squad, please see the section **Monitoring and trivial checks** below.

## **Upgrading the Observing Squad**

The Observing Squad can be updated using the Mainnet installation scripts.

### **April 2021 upgrade**

In order to upgrade the Observing Squad - that is, both the Observers and the Proxy, one should issue the following commands:

```
$ cd ~/elrond-go-scripts-mainnet
$ ./script.sh github_pull
$ ./script.sh stop
$ ./script.sh upgrade_squad
$ ./script.sh upgrade_proxy
$ ./script.sh start
```
:::important
The Observing Squad must be upgraded before 28th of April 14:30 UTC. Otherwise, the nodes will lose sync.
:::

### **March 2021 upgrade**

In order to upgrade the Observing Squad - that is, both the Observers and the Proxy, one should issue the following commands:

```
$ cd ~/elrond-go-scripts-mainnet
$ ./script.sh github_pull
$ ./script.sh stop
$ ./script.sh upgrade_squad
$ ./script.sh upgrade_proxy
$ ./script.sh start
```
:::important
The Observing Squad must be upgraded before 26th of March 14:20 UTC. Otherwise, the nodes will lose sync.
:::

### **January 2021 upgrade**

In order to upgrade the Observing Squad - that is, both the Observers and the Proxy, one should issue the following commands:

```
$ cd ~/elrond-go-scripts-mainnet
$ ./script.sh github_pull
$ ./script.sh stop
$ ./script.sh upgrade_squad
$ ./script.sh upgrade_proxy
$ ./script.sh start
```
:::important
The Observing Squad must be upgraded before 26th of January 14:20 UTC. Otherwise, the nodes will lose sync.
:::

### **Prerequisites for the November 2020 upgrade**

Observing Squads set up before November 2020 have been installed using a special branch of the Mainnet installation scripts: **exchanges-integration**. This special branch has been removed, in favor of the main branch of the installation scripts.

In order to upgrade an Observing Squad set up before November 2020, **one has to first follow these steps**:

```
$ cd ~/elrond-go-scripts-mainnet
MANUALLY BACKUP FILE config/variables.cfg

# IN ORDER TO ALLOW THE SUBSEQUENT SWITCH TO MAIN BRANCH
$ git checkout config/variables.cfg
# SWITCH TO MAIN BRANCH
$ git checkout master

MANUALLY RESTORE FILE config/variables.cfg
```

After following the steps above, the upgrade procedure shall continue as described in the next section.

### **General upgrade procedure**

In order to upgrade the Observing Squad - that is, both the Observers and the Proxy, one should issue the following commands:

```
$ cd ~/elrond-go-scripts-mainnet
$ ./script.sh github_pull
$ ./script.sh stop
$ ./script.sh upgrade_squad
$ ./script.sh upgrade_proxy
$ ./script.sh start
```

After running the commands above, the upgraded Observing Squad will start again. The expected downtime is about 2-3 minutes.

## **Monitoring and trivial checks**

One can monitor the running Observers using the **termui** utility (installed during the setup process itself in the `CUSTOM_HOME="/home/ubuntu"
` folder), as follows:

```
~/elrond-utils/termui --address localhost:8080    # Shard 0
~/elrond-utils/termui --address localhost:8081    # Shard 1
~/elrond-utils/termui --address localhost:8082    # Shard 2
~/elrond-utils/termui --address localhost:8083    # Metachain
```

Alternatively, one can query the status of the Observers by performing GET requests using **curl**:

```
curl http://localhost:8080/node/status | jq    # Shard 0
curl http://localhost:8081/node/status | jq    # Shard 1
curl http://localhost:8082/node/status | jq    # Shard 2
curl http://localhost:8083/node/status | jq    # Metachain
```

The Proxy does not offer a **termui** monitor, but its activity can be inspected using **journalctl**:

```
journalctl -f -u elrond-proxy.service
```

Optionally, one can perform the following smoke test in order to fetch the latest synchronized hyperblock:

```
export NONCE=$(curl http://localhost:8079/network/status/4294967295 | jq '.data["status"]["erd_highest_final_nonce"]')
curl http://localhost:8079/hyperblock/by-nonce/$NONCE | jq

```

# **Setup via Docker**

The Observing Squad can be also set up using Docker.

Clone the Observing Squad repository:

```
git clone https://github.com/ElrondNetwork/observing-squad.git
```

Install docker-compose if not already installed:

```
apt install docker-compose
```

Install and run the whole Observing Squad using the `./start_stack.sh` script from the mainnet folder:

```
cd mainnet
./start_stack.sh
```

In order to check if the Observing Squad is running, you can list the running containers:
```
docker ps
```

In order to check the status inside a container, you can check the logs on the machine for the last synchronized block nonce:
```
docker exec -it 'CONTAINER ID' /bin/bash
cat logs/elrond-go-.......log
```

More detailed commands for installing, building and running an Observing Squad using Docker are described [here](https://github.com/ElrondNetwork/observing-squad). The images (for the Proxy and for the Observers) are published on [Docker Hub](https://hub.docker.com/u/elrondnetwork).
