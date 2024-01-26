---
id: deep-history-squad
title: Deep History Squad
---

[comment]: # (mx-abstract)

This page describes the Deep History Squad, which holds the entire trie data, so it can be used to query the state of an account at any point in time.

[comment]: # (mx-context-auto)

## Overview

A variant of the standard [**observing squad**](/integrators/observing-squad) is one that retains a non-pruned history of the blockchain and allows one to query the state of an account at an arbitrary block in the past. Such a setup is called a [**deep-history observing squad**](https://github.com/multiversx/mx-chain-deep-history).

:::tip
The standard observing squad is sufficient for most use-cases. It is able to resolve past blocks, miniblocks, transactions, transaction events etc. Most often, you do not need a deep-history squad, but a [**regular observing squad**](/integrators/observing-squad), instead.
:::

A deep-history setup is able to resolve historical account (state) queries, that is, to answer questions such as:

> What was Alice's balance on [May the 4th](https://explorer.multiversx.com/blocks/5f6a02d6a5d2a851fd6dc1fb53435083830c2a13121e003958d97c2389711f06)?

```bash
GET http://squad:8080/address/erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th?blockNonce=9250000
```

:::tip
The API client has to perform the conversion from _desired timestamp_ to _block nonce_. Timestamp-based queries aren't directly supported yet.
:::

> How much UTK were in the [`UTK / WEGLD` Liquidity Pool](https://explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga) on [1st of October](https://explorer.multiversx.com/blocks/cefd41e1e9bbe3ba023a695f412b99cecb15ef789475648ee7c31e7d9fef31d1)?

```markup
GET http://squad:8080/address/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga/key/726573657276650000000a55544b2d326638306539?blockNonce=11410000
```

In the example above, the key `726573657276650000000a55544b2d326638306539` is decoded as `reserve\x00\x00\x00\nUTK-2f80e9`.

[comment]: # (mx-context-auto)

## MultiversX squad

The observing squads backing the public Gateways, in addition to being full history squads (serving past blocks, transaction and events up until the Genesis), also act as 3-epochs deep-history squads. That is, for **mainnet**, one can use https://gateway.multiversx.com to resolve historical account (state) queries, for the last 3 days. This interval is driven by the configuration parameter `[StoragePruning.NumEpochsToKeep]`, which is set to `4`, by default.

In general:

```
...                                  deep history not available
CurrentEpoch - NumEpochsToKeep - 1:  deep history not available
CurrentEpoch - NumEpochsToKeep:      deep history not available
CurrentEpoch - NumEpochsToKeep + 1:  deep history parially available
CurrentEpoch - NumEpochsToKeep + 2:  deep history available
CurrentEpoch - NumEpochsToKeep + 3:  deep history available 
...                                  deep history available
CurrentEpoch:                        deep history available
```

In particular, for the public Gateway:

```
...                 deep history not available
CurrentEpoch - 5:   deep history not available
CurrentEpoch - 4    deep history not available
CurrentEpoch - 3:   deep history parially available
CurrentEpoch - 2:   deep history available
CurrentEpoch - 1:   deep history available
CurrentEpoch:       deep history available
```

[comment]: # (mx-context-auto)

## On-premises squad

Deep-history squads can be set up on-premises, just as regular observing squads. However, the storage requirements is significantly higher. For example, a deep-history squad for **mainnet**, configured for the interval July 2020 (Genesis) - January 2024 (Sirius), requires about 7.5 TB of storage:

```
307G    ./node-metachain
1.4T    ./node-0
3.9T    ./node-1
2.0T    ./node-2
```

Since each observer of a deep-history squad must have a non-pruned history, their (non-ordinary) databases have to be either **downloaded** or **reconstructed**, in advance (covered later, in detail).

[comment]: # (mx-context-auto)

## Observer configuration

A deep history squad has it's observers configured to retain the whole, non-pruned history of the blockchain. That is, the observers must have the following settings in their `prefs.toml`:

```
[Preferences]
    FullArchive = true

    OverridableConfigTomlValues = [
        { File = "config.toml", Path = "DbLookupExtensions.Enabled", Value = "true" },
        { File = "config.toml", Path = "StateTriesConfig.AccountsStatePruningEnabled", Value = "false" },
        { File = "config.toml", Path = "StateTriesConfig.SnapshotsEnabled", Value = "true" },
        { File = "config.toml", Path = "StoragePruning.ObserverCleanOldEpochsData", Value = "false" },
        { File = "config.toml", Path = "StoragePruning.AccountsTrieCleanOldEpochsData", Value = "false" },
        { File = "config.toml", Path = "StateTriesConfig.PeerStatePruningEnabled", Value = "true" },
        { File = "config.toml", Path = "GeneralSettings.StartInEpochEnabled", Value = "false" }
    ]
```

Above, the most important settings for retaining the non-pruned history are:

```
StateTriesConfig.AccountsStatePruningEnabled = false
StoragePruning.AccountsTrieCleanOldEpochsData = false
```

:::tip
Apart from the configuration above, the setup of a deep-history observer is identical to a regular full-history observer.
:::

:::warning
Never attach a non-pruned database to a regular observer (i.e. that does not have the above settings) - unless you are not interested into the deep-history features. The regular observer irremediably removes, trucates and prunes the data (as configured, for storage efficiency).
:::

[comment]: # (mx-context-auto)

## Downloading non-pruned database

An archive supporting historical lookup is available to download.

TBD

[comment]: # (mx-context-auto)

## Reconstructing non-pruned databases

An alternative to downloading the non-pruned history is to reconstruct it locally (on your own infrastructure). The reconstruction process is based on the **[import-db](/validators/import-db/)** feature, which re-processes past blocks - and, while doing so, retains the whole, non-pruned accounts history.

First, you need to decide whether to reconstruct a **complete** or a **partial** history. A _complete_ history provides the deep-history squad the ability to resolve historical account (state) queries **up until the Genesis**. A _partial_ history, instead, allows it to resolve state queries up until **a chosen past epoch** or **between two chosen epochs**.

:::note
The reconstruction flow has to be performed **for each shard, separately**.
:::

### Reconstruct a complete history

:::note
Below, the reconstruction is exemplified for **mainnet, shard 0**. The same applies to other networks (devnet, testnet) and shards (including the metachain). Furthermore, the example refers to the latest Protocol release as of January 2024 (Sirius). When reconstructing the history, use the latest release available.
:::

First, set up the reconstruction workspace in a folder of your choice (for the chosen shard), as follows:

```
# In most cases, this should be the latest tag:
# https://github.com/multiversx/mx-chain-mainnet-config/releases/latest
export CONFIG_TAG=v1.6.13.0

# Clone mainnet config into a folder named "config"
git clone https://github.com/multiversx/mx-chain-mainnet-config --branch=$CONFIG_TAG --single-branch --depth=1 config

# In most cases, this should be the tag found in the file "config/binaryVersion":
export BINARY_TAG=v1.6.13

# Clone and build the node binary
git clone https://github.com/multiversx/mx-chain-go.git --branch=$BINARY_TAG --single-branch --depth=1
go build -C mx-chain-go/cmd/node -o $(pwd)/node
```

Afterwards, open the configuration file `config/prefs.toml` and apply the configuration depicted above, in the section [**Observer configuration**](#observer-configuration).

:::warning
Editing the configuration is crucial for reconstructing and retaining the non-pruned history. Skipping this will result in a pruned database.
:::

Then, get (download) and extract **a recent daily archive (snapshot)** for the shard in question (e.g. shard 0). The daily archives are available to download **on request** ([Discord](https://discord.gg/multiversxbuilders) or [Telegram](https://t.me/MultiversXValidators)), from a cloud-based, _S3-compatible storage_ (Digital Ocean Spaces) - or you could fetch them from an existing regular full-history observer that you own. 

Upon extracting the downloaded archive, you'll have a new folder in your workspace: `db`, which contains the blockchain data for the shard in question. This data should be moved to a new folder, named `import-db`. All in all, the steps are as follows:

```
# Ask for the full download link on Discord or Telegram:
wget https://.../23-Jan-2024/Full-History-DB-Shard-0.tar.gz || exit 1
# This produces a new folder: "db"
tar -xf Full-History-DB-Shard-0.tar.gz || exit 1

# "import-db" should contain the whole blockchain to be re-processed
mkdir -p ./import-db && mv db ./import-db
# "db" will contain the reconstructed database (empty at first)
mkdir -p ./db
```

:::note
Downloading the archives and extracting them might take a while.
:::

Now, the reconstruction workspace should look as follows (irrelevant files omitted):

```
.
├── config          # network configuration files
├── import-db
│   └── db          # blockchain data
├── db              # empty
└── node            # binary file, the Node itself
```

We are ready to start the reconstruction process :rocket:

```
./node --import-db=./import-db --import-db-no-sig-check --log-level=*:INFO --use-log-view --log-save --destination-shard-as-observer 0
```

:::note
The reconstruction (which uses _import-db_ under the hood, as previously stated) takes a long time (e.g. days) - depending on the machine's resources (CPU, storage capabilities and memory).
:::

Once the **import-db** is over, the `db` folder contains the reconstructed database for the shard in question, ready to be attached to a deep-history observer (observer with the configuration described above).

Now, do the same for the other shards, as needed.

:::tip
You can smoke test the data by launching an (in-place) ephemeral observer:

```
./node --use-log-view --log-save --destination-shard-as-observer 0
```

Then, in another terminal, do a historical (state) query against the ephemeral observer:

```
curl http://localhost:8080/address/erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx?blockNonce=42 | jq
```
:::

:::tip
The configuration files used within the reconstruction flow (**import-db**) are identical to the ones that should be applied to on-line deep-history observers.
:::

### Reconstruct a partial history

:::tip
Make sure to read the section [**Reconstruct a complete history**](#reconstruct-a-complete-history) first, to understand the basics.
:::

Instead of reconstructing the whole history since Genesis, you may want to reconstruct a partial history, starting from a chosen epoch up until the latest epoch, or a history between two chosen epochs.

First, set up the reconstruction workspace in a folder of your choice, the same as for reconstructing a complete history (see above). That is:

```
git clone https://github.com/multiversx/mx-chain-mainnet-config --branch=$CONFIG_TAG --single-branch --depth=1 config
git clone https://github.com/multiversx/mx-chain-go.git --branch=$BINARY_TAG --single-branch --depth=1
go build -C mx-chain-go/cmd/node -o $(pwd)/node
```

Afterwards, open the configuration file `config/prefs.toml` and apply the configuration depicted in the section [**Observer configuration**](#observer-configuration).

If you want the reconstruction to end at a chosen epoch, enable the `BlockProcessingCutoff` feature in `config/prefs.toml`:

```
[BlockProcessingCutoff]
   Enabled = true
   Mode = "pause"
   CutoffTrigger = "epoch"
   # A chosen epoch
   Value = 123
```

Now, get (download) and extract **a daily archive (snapshot)** for the shard in question (e.g. shard 0), archive which includes the end epoch, if one is chosen. Alternatively, simply download a recent daily archive (snapshot). Then, extract the downloaded archive and **use it's payload as both `db` and `import-db`**.

```
wget https://.../23-Jan-2024/Full-History-DB-Shard-0.tar.gz || exit 1
# This produces a new folder: "db"
tar -xf Full-History-DB-Shard-0.tar.gz || exit 1
# Use the payload as both "db" and "import-db"
mkdir -p ./import-db && cp db ./import-db
```

The reconstruction workspace should look as follows (irrelevant files omitted):

```
.
├── config          # network configuration files
├── import-db
│   └── db          # blockchain data
├── db              # blockchain data
└── node            # binary file, the Node itself
```

Now, in order to pick an actual starting epoch for the `import-db` process, find the closest epoch older than the chosen one, whose `AccountsTrie` is available in the downloaded archive. For the official daily archives (snapshots taken from regular full history observers), the `AccountsTrie` is available for every 50 epochs - this is dictated by the `AccountsTrieSkipRemovalCustomPattern` configuration parameter of the observer that produced the daily archive. For example, if the chosen epoch for reconstruction is `107`, then the actual starting epoch for `import-db` should be `100` .

We are ready to start the reconstruction process from epoch 100 to epoch 123 (example) :rocket:

```
./node --import-db=./import-db --import-db-start-epoch=100 --import-db-no-sig-check --log-level=*:INFO --use-log-view --log-save --destination-shard-as-observer 0
```


## Starting a squad

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

