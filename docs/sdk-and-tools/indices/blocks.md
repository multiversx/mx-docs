---
id: es-index-blocks
title: blocks
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by the block hash, in a hexadecimal encoding.

[comment]: # (mx-context-auto)

## Fields

| Field                 | Description                                                                                                                                                        |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| nonce                 | The nonce field represents the sequence number of the block.                                                                                                       |
| round                 | The round field represents the round when the block was proposed and executed.                                                                                     |
| epoch                 | The epoch field represents the epoch when the block was proposed and executed.                                                                                     |
| miniBlocksHashes      | The miniBlocksHashes field contains an array of the miniblock hashes (hexadecimal encoded) that were included in the block.                                        |
| miniBlocksDetails     | The miniBlocksDetails field contains an array of structures indicating processing details of the miniblocks, such as the index of the first processed transaction. |
| notarizedBlocksHashes | The notarizedBlocksHashes field represents the hashes of the blocks that were notarized in the current block.                                                      |
| proposer              | The proposer field represents the index of the validator that proposed the block.                                                                                  |
| validators            | The validators field is an array that contains the indices of the validators that signed the block. The indices are to be found in the validators index.           |
| pubKeyBitmap          | The pubKeyBitmap field represents the pub key bitmap.                                                                                                              |
| size                  | The size field represents the size of the block in bytes.                                                                                                          |
| sizeTxs               | The sizeTxs field holds the size of the block's transactions in bytes.                                                                                             |
| timestamp             | The timestamp field represents the timestamp when the block was proposed and executed.                                                                             |
| stateRootHash         | The stateRootHash field represents the trie's state root hash when the block was proposed and executed.                                                            |
| prevHash              | The prevHash field represents the hash of the previous block.                                                                                                      |
| shardId               | The shardId field represents in which shard the block was executed.                                                                                                |
| txCount               | The txCount field represents the number of transactions that were executed in the block.                                                                           |
| notarizedTxsCount     | The notarizedTxsCount field represents the number of transactions that were notarized in the block.                                                                |
| accumulatedFees       | The accumulatedFees field represents the accumulated fees that were payed in the block.                                                                            |
| developerFees         | The developerFees field represents the fees that were accumulated in the block.                                                                                    |
| epochStartBlock       | The epochStartBlock field is true if the current block is an epoch-start block.                                                                                    |
| epochStartInfo        | The epochStartInfo field is a structure that contains economic data, such as total supply.                                                                         |
| gasProvided           | The gasProvided field represents the total gas that was provided in the block.                                                                                     |
| gasRefunded           | The gasRefunded field represents the total gas that was refunded in the block.                                                                                     |
| gasPenalized          | The gasPenalized field represents the total gas that was penalized in the block.                                                                                   |
| maxGasLimit           | The maxGasLimit field represents the total gas that can be provided in the block.                                                                                  |
| scheduledData         | The scheduledData contains data about the scheduled execution.                                                                                                     |
| epochStartShardsData  | The epochStartShardsData is an array of structures that contains epoch-start data for each shard, such as pending miniblocks.                                      |

A `metachain` block (`shardId:4294967295`) with field `epochStartBlock:true` will have the field `epochStartInfo` field populated with the next data:

| epochStartInfo fields            | Description                                                                                                          |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------|
| totalSupply                      | The totalSupply field represents the EGLD supply.                                                                    |
| totalToDistribute                | The totalToDistribute field represents the amount of EGLD that will be distributed to validators/delegators.         |
| totalNewlyMinted                 | The totalNewlyMinted field represents the amount of the newly minted EGLG.                                           |
| rewardsPerBlock                  | The rewardsPerBlock field represents the amount of rewards in EGLD per block.                                        |
| rewardsForProtocolSustainability | The rewardsForProtocolSustainability field represents the amount of rewards for the protocol sustainability address. |
| nodePrice                        | The nodePrice field represents EGLD amount required to run a validator.                                              |
| prevEpochStartRound              | The prevEpochStartRound field represents the round of the previous epoch start block.                                |
| prevEpochStartHash               | The prevEpochStartHash field represents the hash of the previous epoch start block.                                  |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch blocks for a shard 
In order to fetch the latest blocks from a shard, one has to do a query that matches the field `shardId`.
```
curl --request GET \
  --url ${ES_URL}/blocks/_search \
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

[comment]: # (mx-context-auto)

### Fetch the latest 10 blocks for all shards

```
curl --request GET \
  --url ${ES_URL}/blocks/_search \
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
