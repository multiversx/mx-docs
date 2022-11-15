---
id: es-index-scresults
title: Elasticsearch index: scresults
---

The `_id` field for this index is composed of hex encoded smart contract result hash.
(example: `cbd4692a092226d68fde24840586bdf36b30e02dc4bf2a73516730867545d53c`)


| Field             | Description                                                                                                                                                                           |
|-------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| miniBlockHash     | The miniBlockHash represents the hash of the miniblock in which the smart contract result was included.                                                                               |
| nonce             | The nonce field represents the transaction sequence number.                                                                                                                           |
| gasLimit          | The gasLimit field represents the maximum gas units the sender is willing to pay for.                                                                                                 |
| gasPrice          | The gasPrice field represents the amount to be paid for each gas unit.                                                                                                                |
| value             | The value field represents the amount of EGLD to be sent from the sender to the receiver.                                                                                             |
| sender            | The sender field represents the address of the smart contract result sender.                                                                                                          |
| receiver          | The receiver field represents the destination address of the smart contract result.                                                                                                   |
| senderShard       | The senderShard field represents the shard ID of the sender address.                                                                                                                  |
| receiverShard     | The receiverShard field represents the shard ID of the receiver address.                                                                                                              |
| relayerAddr       | The relayerAddr field represents the address of the relayer.                                                                                                                          |
| relayedValue      | This relayedValue field represents the amount of EGLD to be transferred via the inner transaction's sender.                                                                           |
| code              | The code holds the code of the smart contract result.                                                                                                                                 |
| data              | The data field holds additional information for a smart contract result. It can contain a simple message, a function call, an ESDT transfer payload, or so on.                        |
| prevTxHash        | The prevTxHash holds the hex encoded hash of the previous transaction.                                                                                                                |
| originalTxHash    | The originalTxHash holds the hex encoded hash of the transaction that generated the smart contract result.                                                                            |
| callType          | The callType field holds the type of smart contract call that is done through the smart contract result.                                                                              |
| codeMetaData      | The codeMetaData field holds the code metadata.                                                                                                                                       |
| returnMessage     | The returnMessage field holds the message that is returned by a smart contract in case of an error.                                                                                   |
| timestamp         | The timestamp field represents the timestamp of the block in which the smart contract result was executed.                                                                            |
| status            | The status field holds the execution state of the smart contract result. The execution state can be `pending` or `success`.                                                           |
| tokens            | The tokens field contains a list of ESDT tokens that are transferred based on the data field. The indices from the `tokens` list are linked to the indices from `esdtValues` list.  |
| esdtValues        | The esdtValues field contains a list of ESDT values that are transferred based on the data field.                                                                                     |
| receivers         | The receivers field contains a list of receiver addresses in case of ESDTNFTTransfer or MultiESDTTransfer.                                                                            |
| receiversShardIDs | The receiversShardIDs field contains a list of receiver addresses' shard IDs.                                                                                                         |
| operation         | The operation field represents the operation of the smart contract result based on the data field.                                                                                    |
| function          | The function field holds the name of the function that is called in case of a smart contract call.                                                                                    |
| originalSender    | The originalSender field holds the sender's address of the original transaction.                                                                                                      |


## Query examples

### Fetch all the smart contract results generated by a transaction

```
curl --request GET \
  --url ${ES_URL}/scresults/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"originalTxHash":"d6.."
		}
	}
}'
```
