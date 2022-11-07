---
id: elastic-search
title: Elasticsearch
---

## Overview

An Elrond node can enable the indexing within an Elasticsearch instance. Indexed data will serve as historical data source
that can be used as it is for searching purposes or to serve a front-end application.

:::tip
Due to the possible high data volume, it's not recommended to use validators as nodes to index in Elasticsearch from.
Our implementation uses a concept of a queue and makes sure that everything is being processed. Consensus and synchronization mechanisms can have delays because of the indexing.
:::

## Setup

In order to set up an observer that indexes in Elasticsearch, one has to update the `external.toml` file from the node's 
configuration directory. A minimum configuration would have `Enabled` set to `true` and the rest of the fields updated 
accordingly (`URL`, `Username`, `Password`). 

An example of a configuration is:

```
# ElasticSearchConnector defines settings related to ElasticSearch such as login information or URL
[ElasticSearchConnector]
    ## We do not recommend to activate this indexer on a validator node since
    #the node might loose rating (even facing penalties) due to the fact that
    #the indexer is called synchronously and might block due to external causes.
    #Strongly suggested to activate this on a regular observer node.
    Enabled           = true
    IndexerCacheSize  = 0
    BulkRequestMaxSizeInBytes = 4194304 # 4MB
    URL               = "http://localhost:9200"
    UseKibana         = false
    Username          = "elastic-username"
    Password          = "elastic-password"
    # EnabledIndexes represents a slice of indexes that will be enabled for indexing. Full list is:
    # ["rating", "transactions", "blocks", "validators", "miniblocks", "rounds", "accounts", "accountshistory", "receipts", "scresults", "accountsesdt", "accountsesdthistory", "epochinfo", "scdeploys", "tokens", "tags", "logs", "delegators", "operations", "collections"]
    EnabledIndexes    = ["rating", "transactions", "blocks", "validators", "miniblocks", "rounds", "accounts", "accountshistory", "receipts", "scresults", "accountsesdt", "accountsesdthistory", "epochinfo", "scdeploys", "tokens", "tags", "logs", "delegators", "operations", "collections"]
```

`Kibana` can be used for visualizing Elastic Data. Kikana's path must be `_plugin/kibana/api` (as seen in AWS managed instances).

`EnabledIndexes` array specifies the indices that will be populated. 

### Proxy support

There are some endpoints in elrond-proxy that rely on an Elasticsearch instance. They can be found [here](/sdk-and-tools/proxy#dependency-on-elastic-search).

## Multi-shards

In order to have the history of the entire network, one has to enable elastic indexing for a node in each shard (0, 1, 2 and metachain).
Some features that ensure data validity rely on the fact that a node of each shard indexes in the database. For example, the status
of a cross-shard transaction is decided on the destination shard.

## Elasticsearch cluster system requirements

The Elasticsearch cluster can be installed on multiple machines (we recommend a setup with more nodes in a cluster) or on a single one.

In case of a single machine, our recommendation is as follows:

- 12 x CPU
- 32 GB RAM
- Disk space that can grow up to 3 TB
- 100 Mbit/s always-on Internet connection

## Clone an Elasticsearch cluster

In order to have all the information about the Elrond chain in an Elasticsearch cluster (from genessis to current time) one has to copy all the data with a specific tool from an Elasticsearch cluster to another.
To get more information how to do this use the documentation from this [repository](https://github.com/ElrondNetwork/elrond-tools-go/tree/main/elasticreindexer).


## Elasticsearch indices 

An observing-squad with the elastic indexer enabled will save data in different indices. This data is used to solve a lot of use-cases. An example is to fetch all the 
transactions that belongs to an address or to display all the address sorted based on the EGLD balances.
All the information that is saved in grouped in indices.


| Name                                                                                | Description                                                                 |
|-------------------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [rating](/)        | Contains information about the validatators rating in every epoch.          |
| [transactions](/) | Cotains all the transactions.                                               |
| [blocks](/)                | Contains all the executed blocks.                                           |
| [validators](/)                | Contains information about the validators.                                  |
| [miniblocks](/)                         | Cointans information about the executed miniblocks.                         |
| [rounds](/)                | Cointans information about rounds.                                          |
| [accounts](/)                 | Cointans information about all the addresses.                               | 
| [accountshistory](/)                 | Cointans information about all the addresses balances.                      |
| [receipts](/)                 | Contains information about all the generated receipts.                      |
| [scresults](/)                         | Contains all the genered smart contract results.                            |
| [accountsesdt](/)                 | Contains information about the ESDT balances.                               |
| [accountsesdthistory](/)                 | Contains information about the ESDT balances historically.                  |
| [epochinfo](/)                 | Contains information about the epochs.                                      |
| [scdeploys](/)                 | Contains information about all the smart contracts deployed.                |
| [tokens](/)                 | Contains information about all the created ESDT tokens.                     |
| [tags](/)                 | Contains information about the NFT's tags.                                  |
| [logs](/)                 | Contains all the logs generated by transactions and smart contract results. |
| [delegators](/)                 | Contains information about delegators.                                      |
| [operations](/)                 | Cotains all the transactions and smart contract results.                    |
| [collections](/)                 | Contains information about collections.                                     |

