---
id: es-index-miniblocks
title: Elasticsearch index: miniblocks
---

The `_id` field of this index is represented by the miniblock hash, in a hexadecimal encoding.


| Field             | Description                                                                                                                                                            |
|-------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| senderShard       | The senderShard field represents the shard ID of the source block.                                                                                                     |
| receiverShard     | The senderShard field represents the shard ID of the destination block.                                                                                                |
| senderBlockHash   | The senderBlockHash field represents the hash(hexadecimal encoded) of the source block in which the miniblock is included.                                             |
| receiverBlockHash | The receiverBlockHash field represents the hash(hexadecimal encoded) of the destination block in which the miniblock is included.                                      |
| type              | The type field represents the type of the miniblock. It can be `TxBlock`(if contains transactions) or `SmartContractResultBlock`(if contains smart contracts results). |
| procTypeS         | The procTypeS field represents the processing type at the source shard. It can ce `Normal` or `Scheduled`.                                                             |
| procTypeD         | The procTypeD field represents the processing type at the destination shard. It can ce `Normal` or `Scheduled`.                                                        |
| timestamp         | The timestamp field represents the timestamp of the block in which the miniblock was executed.                                                                         |
| reserved          | The reserved field can contains some extra information that can be added in a miniblock.                                                                               |


## Query examples

### Fetch all the miniblocks from a block 

```
curl --request GET \
  --url ${ES_URL}/miniblocks/_search \
  --header 'Content-Type: application/json' \
  --data '{
  	"query": {
		"bool": {
			"should": [
				{
					"match": {
						"senderBlockHash": "ddc..."
					}
				},
				{
					"match": {
						"receiverBlockHash": "ddc..."
					}
				}
			]
		}
	}
}'
```
