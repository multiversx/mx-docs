---
id: deep-history-squad
title: Deep History Squad
---

[comment]: # (mx-abstract)

This page describes the Deep History Squad, which holds the entire trie data, so it can be used to query the state of an account at any point in time.

[comment]: # (mx-context-auto)

## Overview

A variant of the standard [**observing squad**](/integrators/observing-squad) is one that retains a non-pruned history of the blockchain and allows one to query the state of an account at an arbitrary block in the past. Such a setup is called a [**deep-history observing squad**](https://github.com/multiversx/mx-chain-deep-history).

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

The observing squads backing the public Gateways, in addition to being full history squads (serving past blocks, transaction and events up until the Genesis), also act as 3-epochs deep-history squads. That is, for Mainnet, one can use `https://gateway.multiversx.com` to resolve historical account (state) queries, for the last 3 days. This interval is driven by the configuration parameter `[StoragePruning.NumEpochsToKeep]`, which is set to `4`, by default.

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

Deep-history squads can be set up on-premises, just as regular observing squads. However, the storage requirements is significantly higher. For example, a deep-history squad for _mainnet_, configured for the interval July 2020 (Genesis) - January 2024 (Sirius), requires about 7.5 TB of storage:

```
307G    ./node-metachain
1.4T    ./node-0
3.9T    ./node-1
2.0T    ./node-2
```

Since each observer of a deep-history squad must have a non-pruned history, their (non-ordinary) databases have to be either **downloaded** or **reconstructed**, in advance.

[comment]: # (mx-context-auto)

## Downloading non-pruned database

An archive supporting historical lookup is available to download [on request](https://discord.gg/multiversxbuilders), from a cloud-based, _S3-compatible storage_.

The archive consists of:
 - Individual files per epoch: `Epoch_*.tar`
 - A file for the static database: `Static.tar`

[comment]: # (mx-context-auto)

### Reconstructing non-pruned databases

An alternative to downloading a non-pruned history is to reconstruct it locally (on your own infrastructure).

Under the hood, the reconstruction process relies on the **[import-db](https://docs.multiversx.com/validators/import-db/)** feature, which allows us to reprocess previously processed blocks - and, while doing so, retain the whole, non-pruned accounts history. 

!TBD!

_Downloading_ the necessary archives and _unarchiving_ them is encapsulated in a step called **reconstruction bootstrapping**.

!TBD!

:::tip
Downloading the archives and extracting them might take a while.
:::

:::tip
The reconstruction (which uses _import-db_ under the hood, as previously stated) takes a long time - depending on machine's resources (CPU & memory), and on the distance between the chosen archives.
:::

[comment]: # (mx-context-auto)

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

