---
id: rating
title: rating
---

The `_id` field for this index is composed in this way: `{validator_bls_key}_{epoch}` (example: `blskey_37`).


| Field     | Description                                                     |
|-----------|-----------------------------------------------------------------|
| rating    | The rating of a validator                                       |


## Query examples

#### Fetch rating for a validator for a specific epoch

```
curl --request GET \
  --url ${ES_URL}/rating/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"${BLS_KEY}_600"
		}
	}
}'
```