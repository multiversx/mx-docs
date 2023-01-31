---
id: es-index-rating
title: rating
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## _id

The `_id` field of this index is composed in this way: `{validator_bls_key}_{epoch}` (example: `blskey_37`).

[comment]: # (mx-context)

## Fields

| Field     | Description                                                      |
|-----------|------------------------------------------------------------------|
| rating    | The rating of the validator, which can be in the [0, 100] range. |

[comment]: # (mx-context)

## Query examples

[comment]: # (mx-context)

### Fetch rating of a validator for a specific epoch

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
