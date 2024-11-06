---
id: es-index-epochinfo
title: epochinfo
---

[comment]: # (mx-abstract)

This page describes the structure of the `epoch-info` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by epoch.

[comment]: # (mx-context-auto)

## Fields

[comment]: # (table:epochinfo)

| Field            | Description                                                                                |
|------------------|--------------------------------------------------------------------------------------------|
| accumulatedFees  | The accumulatedFees field represents the accumulated fees that were paid in the epoch.    |
| developerFees    | The developerFees field represents the developer fees that were accumulated in the epoch.  |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

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
