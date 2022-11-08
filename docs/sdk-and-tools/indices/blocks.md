---
id: blocks
title: blocks
---

The `_id` field for this index is composed of block hash hex encoded

| Field                 | Description                                                                                                |
|-----------------------|------------------------------------------------------------------------------------------------------------|
| nonce                 | The nonce field represents sequence number of block.                                                       |
| round                 | The round field represents the round when block was proposed and executed.                                 |
| epoch                 | The epoch field represent the epoch when the block was proposed and executed.                              |
| miniBlocksHashes      | The miniBlocksHashes field represents the hashed hex encoded of the miniblocks that was included in block. |
| miniBlocksDetails     | The miniBlocksDetails field represents the details of all the miniblocks that was included in block.       |
| notarizedBlocksHashes | The notarizedBlocksHashes field represents the hashes of the blocks the was notarized in current block.    |
| proposer              | The proposer field represents the index of the validator that proposed this block.                         |
| validators            | The validators field represents the indices on the validators that have signed for this block.             |
| pubKeyBitmap          | The pubKeyBitmap field represents the pub key bitmap.                                                      |
| size                  | The size field represents the size of block in bytes.                                                      |
| sizeTxs               | The sizeTxs field represents the size of transactions from block in bytes.                                 |
| timestamp             | The timestamp field represents the timestamp when block was proposed and executed.                         |
| stateRootHash         | The stateRootHash field represents the state root hash of tree when block was proposed and executed.       |
| prevHash              | The prevHash field represents the hash of the previous block.                                              |
| shardId               | The shardId field represents the shard id of block.                                                        |
| txCount               | The txCount field represents the number of transactions that was executed in block.                        |
| notarizedTxsCount     | The notarizedTxsCount field represents the number of transactions that was notarized in block.             |
| accumulatedFees       | The accumulatedFees field represents the accumulated fee that was payed in block.                          |
| developerFees         | The developerFees field represents the fee that was accumulated in block.                                  |
| epochStartBlock       | The epochStartBlock is true if the current block is a start of epoch block.                                |
| epochStartInfo        | The epochStartInfo field contains data about current epoch.                                                |
| gasProvided           | The gasProvided field represents the total gas that was provided in block.                                 |
| gasRefunded           | The gasRefunded field represents the total gas that was refunded in block.                                 |
| gasPenalized          | The gasPenalized field represents the total gas that was penalized in block.                               |
| maxGasLimit           | The maxGasLimit field represents the total gas that can be provided in block.                              |
| scheduledData         | The scheduledData contains data about the scheduled execution.                                             |
| epochStartShardsData  | The epochStartShardsData contains data about the epoch start shards data.                                  |


The `metachain` block (`shardId:4294967295`) with field `epochStartBlock:true` has the field `epochStartInfo` populated with the next data:

| epochStartInfo fields            | Description                                                                                                          |
|----------------------------------|----------------------------------------------------------------------------------------------------------------------|
| totalSupply                      | The totalSupply field represents the EGLD supply.                                                                    |
| totalToDistribute                | The totalToDistribute field represents the amount of EGLD that will be distributed to validators/delegators.         |
| totalNewlyMinted                 | The totalNewlyMinted field represents the amount of the new EGLG minted.                                             |
| rewardsPerBlock                  | The rewardsPerBlock field represents the amount of rewards in EGLD per block.                                        |
| rewardsForProtocolSustainability | The rewardsForProtocolSustainability field represents the amount of rewards for the protocol sustainability address. |
| nodePrice                        | The nodePrice field represents the price in EGLD for a validator.                                                    |
| prevEpochStartRound              | The prevEpochStartRound field represents the round of the previous epoch start block.                                |
| prevEpochStartHash               | The prevEpochStartHash field represents the hash of the previous epoch start block.                                  |

## Query examples

#### Fetch blocks for a shard 
In order to fetch the latest blocks from one shard, one has to do a query that matches the field `shardId`.
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
