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

In order to have all the information about the Elrond chain in an Elasticsearch cluster (from genesis to current time) one has to copy all the data with a specific tool from an Elasticsearch cluster to another.
To get more information how to do this use the documentation from this [repository](https://github.com/ElrondNetwork/elrond-tools-go/tree/main/elasticreindexer).


## Elasticsearch indices 

An observing-squad with the elastic indexer enabled will save data in different indices. This data is used for multiple use cases. An example is to fetch all the 
transactions that belong to an address or to display all the address sorted based on the EGLD balances.

Each entry in an Elasticsearch index will have a format similar to this:

```
{
    "_id": "..."
    "_source": {
      ...
    }
}
```

| Name                                                               | Description                                                                 |
|--------------------------------------------------------------------|-----------------------------------------------------------------------------|
| [transactions](/sdk-and-tools/indices/es-index-transactions)       | Contains all the transactions.                                              |
| [blocks](/sdk-and-tools/indices/es-index-blocks)                   | Contains all the executed blocks.                                           |
| [validators](/sdk-and-tools/indices/es-index-validators)           | Contains the public keys of the validators grouped by epoch and shard.      |
| [rating](/sdk-and-tools/indices/es-index-rating)                   | Contains the validators' rating for every epoch.                            |
| [miniblocks](/sdk-and-tools/indices/es-index-miniblocks)           | Contains all the executed minblocks.                                        |
| [rounds](/sdk-and-tools/indices/es-index-rounds)                   | Contains details of each round that has passed.                             |
| [accounts](/sdk-and-tools/indices/es-index-accounts)               | Contains the addresses' balances and the timestamp when they were modified. | 
| [accountshistory](/sdk-and-tools/indices/es-index-accountshistory) | Contains historical information about the address balances.                 |
| [receipts](/sdk-and-tools/indices/es-index-receipts)               | Contains all the generated receipts.                                        |
| [scresults](/sdk-and-tools/indices/es-index-scresults)             | Contains all the generated smart contract results.                          |
| [accountsesdt](/sdk-and-tools/indices/es-index-accountsesdt)       | Contains the addresses' ESDT balances.                                      |
| [accountsesdthistory](/)                                           | Contains historical information about the address ESDT balances.            |
| [epochinfo](/)                                                     | Contains the accumulated fees and the developer fees grouped by epochs.     |
| [scdeploys](/)                                                     | Contains details about all the deployed smart contracts.                    |
| [tokens](/)                                                        | Contains all the created ESDT tokens.                                       |
| [tags](/)                                                          | Contains the NFTs' tags.                                                    |
| [logs](/)                                                          | Contains all the logs generated by transactions and smart contract results. |
| [delegators](/)                                                    | Contains details about all the delegators.                                  |
| [operations](/)                                                    | Contains all the transactions and smart contract results.                   |
| [collections](/)                                                   | Contains all the collections.                                               |

