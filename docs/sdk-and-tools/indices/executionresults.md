---
id: es-index-blocks
title: blocks
description: "Elasticsearch executionresults index: execution result block hash, header fields and example queries."
---

[comment]: # (mx-abstract)

This page describes the structure of the `executionresults` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The _id field of this index is the block hash associated with the execution result, in a hexadecimal encoding.

[comment]: # (mx-context-auto)

## Fields

[comment]: # (table:blocks)

| Field                | Description                                                                                                                                                        |
|----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| nonce                | The nonce field represents the sequence number of the block (block height) associated with the execution result.                                                   |
| round                | The round field represents the round of the block associated with the execution result.                                                                            |
| epoch                | The epoch field represents the epoch of the block associated with the execution result.                                                                            |
| miniBlocksHashes     | The miniBlocksHashes field contains an array of the miniblock hashes (hexadecimal encoded) that were included in the block.                                        |
| miniBlocksDetails    | The miniBlocksDetails field contains an array of structures indicating processing details of the miniblocks, such as the index of the first processed transaction. |
| timestampMs          | The timestampMs field represents the timestamp of the block associated with the execution result.                                                                  |
| rootHash             | The rootHash field represents the trie's state root hash when of the block associated with the execution result.                                                   |
| shardId              | The shardId field represents the shard this block belongs to.                                                                                                      |
| txCount              | The txCount field represents the number of transactions from the block associated with the execution result.                                                       |
| gasUsed              | The gasUsed field represents the total gas that was used in the block associated with the execution result.                                                        | 
| accumulatedFees      | The accumulatedFees field represents the accumulated fees that were paid in the block associated with the execution result.                                        |
| developerFees        | The developerFees field represents the developer fees that were accumulated in the block.                                                                          |
| epochStartInfo       | The epochStartInfo field is a structure that contains economic data, such as total supply.                                                                         |
| notarizedInBlockHash | The notarizedInBlockHash field represents the hash of the block in which the execution result was notarized.                                                       |

[comment]: # (mx-context-auto)

### Fetch blocks for a shard
In order to fetch the latest execution results from a shard, one has to do a query that matches the field `shardId`.
```
curl --request GET \
  --url ${ES_URL}/executionresults/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
            "shardId": "1"
        }
    },
    "sort": [
        {
            "timestamp": {
                "order": "desc"
            }
        }
    ]
}'
```

### Fetch the latest 10 execution results for all shards

```
curl --request GET \
  --url ${ES_URL}/executionresults/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "sort": [
        {
            "timestamp": {
                "order": "desc"
            }
        }
    ],
    "size":10
}'
```