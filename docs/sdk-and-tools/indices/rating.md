---
id: es-index-rating
title: rating
---

[comment]: # (mx-abstract)

This page describes the structure of the `rating` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is composed in this way: `{validator_bls_key}_{epoch}` (example: `blskey_37`).

[comment]: # (mx-context-auto)

## Fields

[comment]: # (table:rating)

| Field     | Description                                                      |
|-----------|------------------------------------------------------------------|
| rating    | The rating of the validator, which can be in the [0, 100] range. |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

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
