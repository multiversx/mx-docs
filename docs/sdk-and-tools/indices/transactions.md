---
id: transactions
title: transactions
---

The `_id` field for this index is composed of transaction hash hex encoded.
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


## Query examples

#### Fetch the latest transactions for an address

```
curl --request GET \
  --url ${ES_URL}/transactions/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
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
