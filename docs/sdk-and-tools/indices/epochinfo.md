---
id: es-index-epochinfo
title: epochinfo
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## _id

The `_id` field of this index is represented by epoch.

[comment]: # (mx-context)

## Fields

| Field            | Description                                                                                |
|------------------|--------------------------------------------------------------------------------------------|
| accumulatedFees  | The accumulatedFees field represents the accumulated fees that were payed in the epoch.    |
| developerFees    | The developerFees field represents the developer fees that were accumulated in the epoch.  |

[comment]: # (mx-context)

## Query examples

[comment]: # (mx-context)

### Fetch accumulatedFees and developerFees for a specific epoch

```
curl --request GET \
  --url ${ES_URL}/epochinfo/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"600"
		}
	}
}'
```
