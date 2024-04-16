---
id: es-index-tags
title: tags
---

[comment]: # (mx-abstract)

This page describes the structure of the `tags` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by the tag name in a base64 encoding.

[comment]: # (mx-context-auto)

## Fields

[comment]: # (table:tags)

| Field | Description                                                         |
|-------|---------------------------------------------------------------------|
| count | The count field represents the number of NFTs with the current tag. |
| tag   | This field represents the tag in an alphanumeric format.            |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch NFTs count with a given tag

```
curl --request GET \
  --url ${ES_URL}/tags/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"tag":"sport"
		}
	}
}'
```
