---
id: es-index-tags
title: Elasticsearch index: tags
---

The `_id` field of this index is represented by the tag name in a base64 encoding.


| Field | Description                                                                          |
|-------|--------------------------------------------------------------------------------------|
| count | The count field represents the number of NFTs that have the tag from the tag field.  |
| tag   | The tag field contains the tag in alphanumeric format.                               |

## Query examples

### Fetch the number of NFTs with the given tag.

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
