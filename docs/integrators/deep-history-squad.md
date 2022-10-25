---
id: deep-history-squad
title: Deep History Squad
---

## Overview

A variant of the standard [observing squad](/integrators/observing-squad) is one that retains a non-pruned history of the blockchain, and allows one to query the state of an account at an arbitrary block in the past. Such a setup is called a **[deep-history observing squad](https://github.com/ElrondNetwork/deep-history)**. 

A deep-history setup is able to resolve historical account (state) queries, that is, to answer questions such as:

> What was Alice's balance on [May the 4th](https://explorer.elrond.com/blocks/5f6a02d6a5d2a851fd6dc1fb53435083830c2a13121e003958d97c2389711f06)?

```
GET http://squad:8080/address/erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th?blockNonce=9250000
```

:::note
Currently, the API client has to perform the conversion from _desired timestamp_ to _block nonce_. In a future release, the API will directly support timestamp-based queries.
:::

> How much UTK were in the [`UTK / WEGLD` Liquidity Pool](https://explorer.elrond.com/accounts/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga) on [1st of October](https://explorer.elrond.com/blocks/cefd41e1e9bbe3ba023a695f412b99cecb15ef789475648ee7c31e7d9fef31d1)?

```
GET http://squad:8080/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga/key/726573657276650000000a55544b2d326638306539?blockNonce=11410000
```

In the example above, the key `726573657276650000000a55544b2d326638306539` is decoded as `reserve\x00\x00\x00\nUTK-2f80e9`.

## Public instance

:::note
As of October 2022, a public deep-history squad isn't yet available. The instance is being prepared and should be ready in November 2022.
:::

## On-premises instance

Deep-history squads can be set up on-premises, just as regular observing squads. However, the storage requirements might increase over time - we'll tackle this [in a separate section](/integrators/deep-history-squad#handling-storage-requirements).

Since each observer of a deep-history squad must have a non-pruned history, their non-regular databases have to be either **downloaded** or **reconstructed**, in advance.

### Downloading non-pruned database

:::note
As of October 2022, a public repository with non-pruned databases for both _mainnet_ and _devnet_ is under construction. This repository would take the shape of a _Digital Ocean (S3-compatible) Space_. Once the repository is ready, the data can be downloaded via **[db-archive-scripts](https://github.com/ElrondNetwork/db-archive-scripts)** - documentation will follow.
:::

### Reconstructing non-pruned database

An alternative to downloading a non-pruned history is to reconstruct it locally (on your own infrastructure). 

Under the hood, the reconstruction process relies on the **[import-db](https://docs.elrond.com/validators/import-db/)** feature, which allows us to reprocess previosuly processed blocks - and, while doing so, for our purposes, we'll also retain the whole, non-pruned history. The `import-db` requires a **start  database** (placed in the folder `node-dir/db`) and a **target database** (usually placed in the folder `node-dir/import-db/db`). In the context of deep-history squads, _archives_ of such databases are called **time capsules**.

It follows that, in order to reconstruct the history for an observer, we need (to download) **two time capsules**: a _start time capsule_ and a _target time capsule_. For reconstucting the history of a whole squad, `4 x 2` time capsules are required (to be downloaded).

_Downloading_ the necessary time capsules and _unarchiving_ them is encapsulated in a step called **reconstruction bootstrapping**.

#### Bootstrapping

First, choose an empty folder to serve as the workspace (working directory) of the squad instance - for example, `~/deep-history-workspace`.

Afterwards, prepare a configuration file called `reconstruction.json`, following the example of [`default.reconstruction.json`](https://github.com/ElrondNetwork/deep-history/tree/main), and save it in the chosen workspace. For the fields `startCapsule` and `targetCapsule`, use URLs towards the Elrond public archive (which are available [on request](https://t.me/ElrondDevelopers)). The URLs in the example below are mere placeholders.

```
// ~/deep-history-workspace/reconstruction.json
{
    "networks": {
        "devnet": {
            "shards": {
                "0": {
                    "startCapsule": "https://.../shard-0/2022-October-15.tar",
                    "targetCapsule": "https://.../shard-0/2022-October-25.tar"
                },
                "1": {
                    "startCapsule": "https://.../shard-1/2022-October-15.tar",
                    "targetCapsule": "https://.../shard-1/2022-October-25.tar"
                },
                "2": {
                    "startCapsule": "https://.../shard-2/2022-October-15.tar",
                    "targetCapsule": "https://.../shard-2/2022-October-25.tar"
                },
                "metachain": {
                    "startCapsule": "https://.../shard-metachain/2022-October-15.tar",
                    "targetCapsule": "https://.../shard-metachain/2022-October-25.tar"
                }
            }
        }
    }
}
```

Above, we've chosen (as an example) the time capsules in such a way to reconstruct the history between 15th and 25th of October (~10 days, ~120 _devnet_ epochs).

Now, bootstrap the reconstruction as follows:

```
# Download the docker-compose configuration
wget https://github.com/ElrondNetwork/deep-history/blob/main/docker-compose.yml

# Run the "bootstrap" Docker service
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile bootstrap \
    --project-name deep-history-reconstruction up --detach
```

If you prefer to wait in the current shell until the bootstrap finishes, omit the `--detach` flag.

:::note
Downloading the time capsules and extracting them might take a while.
:::

#### Start the reconstruction

Once the bootstrap step is ready, you can proceed with running the reconstruction containers. The example below if for _devnet_:

```
# Download the docker-compose configuration (skip this step if performed before)
wget https://github.com/ElrondNetwork/deep-history/blob/main/docker-compose.yml

# Run multiple Docker services: "devnet-0", "devnet-1", "devnet-2", "devnet-metachain"
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile devnet-0 --profile devnet-1 --profile devnet-2 --profile devnet-metachain \
    --project-name deep-history-reconstruction up --detach
```

:::note
The reconstruction (which uses _import-db_ under the hood, as previosuly stated) takes a long time - depending on machine's resources (CPU & memory), and on the distance between the chosen time capsules. 
:::

Once a container finishes reconstruction (for a shard), it will shut down. Once all containers of the compose _project_ `deep-history-reconstruction` have stopped, the reconstruction is ready, and you can proceed with starting the squad (next section).

### Starting the squad

The squad can be started using docker-compose, as follows (the example is for _devnet_):

```
# Download the docker-compose configuration (skip this step if performed before)
wget https://github.com/ElrondNetwork/deep-history/blob/main/docker-compose.yml

# Run multiple Docker services: "devnet-proxy", "devnet-0", "devnet-1", "devnet-2", "devnet-metachain"
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile devnet-proxy --profile devnet-0 --profile devnet-1 --profile devnet-2 --profile devnet-metachain \
    --project-name deep-history-squad-devnet up --detach
```

**Congratulations, you've set up a deep-history observing squad!** The gateway should be ready to resolve historical account (state) queries.

## Handling storage requirements

### Explicit (manual) pruning

### Using cheaper storage
