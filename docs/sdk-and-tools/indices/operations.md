---
id: es-index-operations
title: operations
---

[comment]: # (mx-abstract)

This page describes the structure of the `operations` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The _id field of this index is represented by the transactions OR smart contract result hash, in a hexadecimal encoding.

[comment]: # (mx-context-auto)

## Fields

| Field             | Description                                                                                                                                                                          |
|-------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| miniBlockHash     | The miniBlockHash field represents the hash of the miniblock in which the transaction was included.                                                                                  |
| nonce             | The nonce field represents the transaction sequence number of the sender address.                                                                                                    |
| round             | The round field represents the round of the block when the transaction was executed.                                                                                                 |
| value             | The value field represents the amount of EGLD to be sent from the sender to the receiver.                                                                                            |
| receiver          | The receiver field represents the destination address of the transaction.                                                                                                            |
| sender            | The sender field represents the address of the transaction sender.                                                                                                                   |
| receiverShard     | The receiverShard field represents the shard ID of the receiver address.                                                                                                             |
| senderShard       | The senderShard field represents the shard ID of the sender address.                                                                                                                 |
| gasPrice          | The gasPrice field represents the amount to be paid for each gas unit.                                                                                                               |
| gasLimit          | The gasLimit field represents the maximum gas units the sender is willing to pay for.                                                                                                |
| gasUsed           | The gasUsed field represents the amount of gas used by the transaction.                                                                                                              |
| fee               | The fee field represents the amount of EGLD the sender paid for the transaction.                                                                                                     |
| initialPaidFee    | The initialPaidFee field represents the initial amount of EGLD the sender paid for the transaction, before the refund.                                                               |
| data              | The data field holds additional information for a transaction. It can contain a simple message, a function call, an ESDT transfer payload, and so on.                                |
| signature         | The signature of the transaction, hex-encoded.                                                                                                                                       |
| timestamp         | The timestamp field represents the timestamp of the block in which the transaction was executed.                                                                                     |
| status            | The status field represents the status of the transaction.                                                                                                                           |
| senderUserName    | The senderUserName field represents the username of the sender address.                                                                                                              |
| receiverUserName  | The receiverUserName field represents the username of the receiver address.                                                                                                          |
| hasScResults      | The hasScResults field is true if the transaction has smart contract results.                                                                                                        |
| isScCall          | The isScCall field is true if the transaction is a smart contract call.                                                                                                              |
| hasOperations     | The hasOperations field is true if the transaction has smart contract results.                                                                                                       |
| tokens            | The tokens field contains a list of ESDT tokens that are transferred based on the data field. The indices from the `tokens` list are linked with the indices from `esdtValues` list. |
| esdtValues        | The esdtValues field contains a list of ESDT values that are transferred based on the data field.                                                                                    |
| receivers         | The receivers field contains a list of receiver addresses in case of ESDTNFTTransfer or MultiESDTTransfer.                                                                           |
| receiversShardIDs | The receiversShardIDs field contains a list of receiver addresses' shard IDs.                                                                                                        |
| type              | The type field represents the type of the transaction based on the data field.                                                                                                       |
| operation         | The operation field represents the operation of the transaction based on the data field.                                                                                             |
| function          | The function field holds the name of the function that is called in case of a smart contract call.                                                                                   |
| isRelayed         | The isRelayed field is true if the transaction is a relayed transaction.                                                                                                             |
| version           | The version field represents the version of the transaction.                                                                                                                         |
| hasLogs           | The hasLogs field is true if the transaction has logs.                                                                                                                               |


This index contains both transactions and smart contract results. This is useful because one can query both of them in a single request.

The unified structure will contain an extra field in order to be able to differentiate between them.

[comment]: # (table:operations)

| Field | Description                                                                                    |
|-------|------------------------------------------------------------------------------------------------|
| type  | It can be `normal` in case of a transaction and `unsigned` in case of a smart contract result. |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch the latest transactions of an address

```
curl --request GET \
  --url ${ES_URL}/operations/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"must": [
				{
					"match": {
						"type": "normal"
					}
				}
			],
			"should": [
				{
					"match": {
						"sender": "erd..."
					}
				},
				{
					"match": {
						"receiver": "erd..."
					}
				},
				{
					"match": {
						"receivers": "erd..."
					}
				}
			]
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

### Fetch the latest operations of an address

```
ADDRESS="erd1..."

curl --request GET \
  --url ${ES_URL}/operations/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"should": [
				{
					"match": {
						"sender": "${ADDRESS}"
					}
				},
				{
					"match": {
						"receiver": "${ADDRESS}"
					}
				},
				{
					"match": {
						"receivers": "${ADDRESS}"
					}
				}
			]
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


### Fetch all the smart contract results generated by a transaction

```
curl --request GET \
  --url ${ES_URL}/operations/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"must": [
				{
					"match": {
						"originalTxHash": "d6.."
					}
				},
				{
					"match": {
						"type": "unsigned"
					}
				}
			]
		}
	}
}'
```
