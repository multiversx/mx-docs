---
id: es-index-accountshistory
title: Elasticsearch index: accountshistory
---

The `_id` field of this index is composed in this way: `{bech32address}_{timestamp}` (example: `erd.._1234`).

| Field     | Description                                                                            |
|-----------|----------------------------------------------------------------------------------------|
| address   | The address field holds the address bytes in a bech32 encoding.                        |
| balance   | The balance field holds the amount of EGLD the address has.                            |
| isSender  | The isSender field is true if the address was the sender when the balance has changed. |
| timestamp | The timestamp field represents the timestamp when the address balance was changed.     |

## Query examples

### Fetch the latest 10 recordings for an address sorted by timestamp

```
curl --request GET \
  --url ${ES_URL}/accountshistory/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
            "address": "erd..."
        }
    },
    "sort": [
        {
            "timestamp": {
                "order": "desc"
            }
        }
    ],
    "size":10
}'
```