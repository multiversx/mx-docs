---
id: elastic-indices
title: Elastic indices
---

## Introduction

Each entry in a Elasticsearch index will have a format similar to this:

```
{
    "_id": "..."
    "_source": {
      ...
    }
}
```

Each index that will be explained below will be the items that are put into the `_source` field.

## rating

The `_id` field for this index is composed in this way: `{validator_bls_key}_{epoch}` (example: `blskey_37`)

| Field     | Description                                                     |
|-----------|-----------------------------------------------------------------|
| rating    | The rating of a validator                                       |

## transactions

The `_id` field for this index is composed of transaction hash hex encoded 

(example: `cad4692a092226d68fde24840586bdf36b30e02dc4bf2a73516730867545d53c`)

| Field             | Description                                                                                                                            |
|-------------------|----------------------------------------------------------------------------------------------------------------------------------------|
| miniBlockHash     | The miniBlockHash represents the hash of the miniblocks in which the transaction is included.                                          |
| nonce             | The nonce field represents sequence number of transactions sent from a given address.                                                  |
| round             | The round field represents the round of block when transaction is executed.                                                            |
| value             | The value field represents the amount of EGLD from the sender to the receiver.                                                         |
| receiver          | The receiver field represents the destination address of the transaction.                                                              |
| sender            | The sender field field represents the address of the transaction sender.                                                               |
| receiverShard     | The receiverShard field represents the shard ID of the receiver address.                                                               |
| senderShard       | The senderShard field represents the shard ID of the sender address.                                                                   |
| gasPrice          | The gasPrice field represents the price of the gas.                                                                                    |
| gasLimit          | The gasLimit field represents the limit of the amount of EGLD the sender is willing to pay for the transaction.                        |                                                                  |
| gasUsed           | The gasUsed field represents the amount of gas used by the transaction.                                                                |
| fee               | The fee field represents the amount of EGLD the sender paid for the transaction.                                                       |
| initialPaidFee    | The initialPaidFee field represents the initial amount of EGLD the sender paid for the transaction, before the refund.                 |
| data              | The data field holds additional information for a transaction. It can either contain a simple message/ESDT related information/etc.    |
| signature         | The signature field represents the digital information used in cryptocurrency transactions to verify the identity of its participants. |
| timestamp         | The timestamp field represents the timestamp of the block in which the transaction was executed.                                       |
| status            | The status field represents the status of the transaction.                                                                             |
| senderUserName    | The senderUserName field represents the username of the sender address.                                                                |
| receiverUserName  | The receiverUserName field represents the username of the receiver address.                                                            |
| hasScResults      | The hasScResults field is true if the transaction has smart contract results.                                                          |
| isScCall          | The isScCall field is true if the transaction is a smart contract call.                                                                |
| hasOperations     | The hasOperations field is true if the transaction has smart contract results or logs.                                                 |
| tokens            | The tokens field contains list of ESDT tokens that are transferred based on the data field.                                            |
| esdtValues        | The esdtValues field contains list of ESDT values that are transferred based on the data field.                                        |
| receivers         | The receivers field contains list of receiver addresses in case of ESDTNFTTransfer or MultiESDTTransfer.                               |
| receiversShardIDs | The receiversShardIDs field contains list of receiver addresses shard IDs.                                                             |
| type              | The type field represents the type of the transaction based on the data field.                                                         |
| operation         | The operation field represents the operation of the transaction based on the data field.                                               |
| isRelayed         | The isRelayed field  is true if the transaction is a relayed transaction.                                                              |
| version           | The version field represents the version of the transaction.                                                                           |


## blocks

The `_id` field for this index is composed of block hash hex encoded

| Field                 | Description                                                                                                |
|-----------------------|------------------------------------------------------------------------------------------------------------|
| nonce                 | The nonce field represents sequence number of block.                                                       |
| round                 | The round field represents the round when block was proposed and executed.                                 |
| epoch                 | The epoch field represent the epoch when the block was proposed and executed.                              |
| miniBlocksHashes      | The miniBlocksHashes field represents the hashed hex encoded of the miniblocks that was included in block. |
| miniBlocksDetails     | The miniBlocksDetails field represents the details of all the miniblcoks that was included in block.       |
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

