---
id: es-index-collections
title: collections
---


## _id

The `_id` field of this index is represented by a bech32 encoded address.

## Fields

This index contains a list of collections and the NFTs from collections that are in the balance of the address.

Example:
```
{
    "COLLECTION1-af3ea3": {
        "1b": "1",
        "1c": "1",
        "23": "1",
        "24": "1"
    },
    "COLLECTION1-a52799": {
        "01": "1"
    }
}
```

## Query examples

### Fetch collection data for an address

```
curl --request GET \
  --url ${ES_URL}/collections/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"erd.."
		}
	}
}'
```
