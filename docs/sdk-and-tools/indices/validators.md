---
id: validators
title: validators
---

The `_id` field for this index is composed in this way: `{shardID_epoch}` (example: `1_123`)

| Field       | Description                                                                                    |
|-------------|------------------------------------------------------------------------------------------------|
| publicKeys  | The publicKeys field contains a list of all validators' public keys for epoch from document ID |


## Query examples

#### Fetch all validators from a shard by epoch
In the below example we fetch all the validators' public keys from shard 1, epoch 600.

```
curl --request GET \
  --url ${ES_URL}/validators/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"1_600"
		}
	}
}'
```