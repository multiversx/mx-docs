---
id: deep-history-squad
title: Deep History Squad
---

## Overview

[comment]: # (How is a Deep History Observing Squad different from a regular Observing Squad?)

A variant of the standard [observing squad](/integrators/observing-squad) is one that retains a non-pruned history of the blockchain and allows one to query the state of an account at an arbitrary block in the past. Such a setup is called a **[deep-history observing squad](https://github.com/multiversx/mx-chain-deep-history)**.

[comment]: # (How to get historical account state?)
[comment]: # (How to get historical contract state?)
[comment]: # (How to get historical balances?)

A deep-history setup is able to resolve historical account (state) queries, that is, to answer questions such as:

> What was Alice's balance on [May the 4th](https://explorer.multiversx.com/blocks/5f6a02d6a5d2a851fd6dc1fb53435083830c2a13121e003958d97c2389711f06)?

```bash
GET http://squad:8080/address/erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th?blockNonce=9250000
```

:::tip
Currently, the API client has to perform the conversion from _desired timestamp_ to _block nonce_. In a future release, the API will directly support timestamp-based queries.
:::

> How much UTK were in the [`UTK / WEGLD` Liquidity Pool](https://explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga) on [1st of October](https://explorer.multiversx.com/blocks/cefd41e1e9bbe3ba023a695f412b99cecb15ef789475648ee7c31e7d9fef31d1)?

```markup
GET http://squad:8080/address/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga/key/726573657276650000000a55544b2d326638306539?blockNonce=11410000
```

In the example above, the key `726573657276650000000a55544b2d326638306539` is decoded as `reserve\x00\x00\x00\nUTK-2f80e9`.

## Public instance

:::tip
For experimentation, you can use one of the following deep-history gateways (backed by deep-history observing squads):

 - https://deep-history.multiversx.com:4443/mainnet-gateway/
 - https://deep-history.multiversx.com:4443/devnet-gateway/

Note that these instances are protected with basic HTTP authentication; access is given on demand.
:::

## On-premises instance

Deep-history squads can be set up on-premises, just as regular observing squads. However, the storage requirements might increase over time - we'll tackle this [in a separate section](/integrators/deep-history-squad#handling-storage-requirements).

Since each observer of a deep-history squad must have a non-pruned history, their non-regular databases have to be either **downloaded** or **reconstructed**, in advance.

### Downloading non-pruned database

:::tip
As of October 2022, a public repository with non-pruned databases for both _mainnet_ and _devnet_ is under construction. This repository would take the shape of a _Digital Ocean (S3-compatible) Space_. Once the repository is ready, the data can be downloaded via **[db-archive-scripts](https://github.com/multiversx/mx-chain-db-archive-scripts)** - documentation will follow.
:::

### Reconstructing non-pruned database

An alternative to downloading a non-pruned history is to reconstruct it locally (on your own infrastructure).

Under the hood, the reconstruction process relies on the **[import-db](https://docs.multiversx.com/validators/import-db/)** feature, which allows us to reprocess previously processed blocks - and, while doing so, for our purposes, we'll also retain the whole, non-pruned history. For our purposes, the `import-db` procedure requires a **target database** (placed in the folder `node-workdir/db`) and a **source database** (usually placed in the folder `node-workdir/import-db/db`).

It follows that, in order to reconstruct the history for an observer, we need (to download) **two database archives**: an _old archive_ and a _new archive_. For reconstructing the history of a whole squad, `4 x 2` archives are required (to be downloaded).

_Downloading_ the necessary archives and _unarchiving_ them is encapsulated in a step called **reconstruction bootstrapping**.

#### Bootstrapping

First, choose an empty folder to serve as the workspace (working directory) of the squad instance - for example, `~/deep-history-workspace`.

Afterward, prepare a configuration file called `reconstruction.json`, following the example of [`default.reconstruction.json`](https://github.com/multiversx/mx-chain-deep-history/tree/main), and save it in the chosen workspace. For the fields `oldestArchive` and `newestArchive`, use URLs towards the MultiversX public archive (which are available [on request](https://t.me/MultiversXDevelopers)). The URLs in the example below are mere placeholders.

```
// ~/deep-history-workspace/reconstruction.json
{
    "networks": {
        "devnet": {
            "shards": {
                "0": {
                    "oldestArchive": "https://.../shard-0/2022-October-15.tar",
                    "newestArchive": "https://.../shard-0/2022-October-25.tar"
                },
                "1": {
                    "oldestArchive": "https://.../shard-1/2022-October-15.tar",
                    "newestArchive": "https://.../shard-1/2022-October-25.tar"
                },
                "2": {
                    "oldestArchive": "https://.../shard-2/2022-October-15.tar",
                    "newestArchive": "https://.../shard-2/2022-October-25.tar"
                },
                "metachain": {
                    "oldestArchive": "https://.../shard-metachain/2022-October-15.tar",
                    "newestArchive": "https://.../shard-metachain/2022-October-25.tar"
                }
            }
        }
    }
}
```

Above, we've chosen (as an example) the archives in such a way as to reconstruct the history between the 15th and 25th of October (~10 days, ~120 _devnet_ epochs).

Now, bootstrap the reconstruction as follows:

```
# Download the docker-compose configuration
wget https://github.com/multiversx/mx-chain-deep-history/blob/main/docker-compose.yml

# Run the "bootstrap" Docker service
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile bootstrap \
    --project-name deep-history-reconstruction up --detach
```

If you prefer to wait in the current shell until the bootstrap finishes, omit the `--detach` flag.

:::tip
Downloading the archives and extracting them might take a while.
:::

#### Start the reconstruction

Once the bootstrap step is ready, you can proceed with running the reconstruction containers. The example below if for _devnet_:

```
# Download the docker-compose configuration (skip this step if performed before)
wget https://github.com/multiversx/mx-chain-deep-history/blob/main/docker-compose.yml

# Possible profiles: reconstruction-devnet, reconstruction-devnet-0, reconstruction-devnet-1, reconstruction-devnet-2, reconstruction-devnet-metachain
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile reconstruction-devnet \
    --project-name deep-history-reconstruction up --detach
```

:::tip
The reconstruction (which uses _import-db_ under the hood, as previously stated) takes a long time - depending on machine's resources (CPU & memory), and on the distance between the chosen archives.
:::

Once a container finishes reconstruction (for a shard), it will shut down. Once all containers of the compose _project_ `deep-history-reconstruction` have stopped, the reconstruction is ready, and you can proceed with starting the squad (next section).

### Starting the squad

The squad can be started using docker-compose, as follows (the example is for _devnet_):

```
# Download the docker-compose configuration (skip this step if performed before)
wget https://github.com/multiversx/mx-chain-deep-history/blob/main/docker-compose.yml

# Possible profiles: squad-devnet, squad-devnet-0, squad-devnet-1, squad-devnet-2, squad-devnet-metachain, squad-devnet-proxy
DEEP_HISTORY_WORKSPACE=${HOME}/deep-history-workspace DOCKER_USER=$(id -u):$(id -g) docker compose \
    --file ./docker-compose.yml \
    --profile squad-devnet \
    --project-name deep-history-squad-devnet up --detach
```

**Congratulations, you've set up a deep-history observing squad!** The gateway should be ready to resolve historical account (state) queries.

## Handling storage requirements

:::caution
Documentation in this section is preliminary and subject to change.
:::
