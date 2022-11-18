---
id: es-index-accountshistory
title: accountshistory
---

The `_id` field of this index is composed in this way: `{bech32address}_{timestamp}` (example: `erd.._1234`).

| Field     | Description                                                                                                                                                                           |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| address   | The address field holds the address in a bech32 encoding.                                                                                                                             |
| balance   | The balance field holds the amount of EGLD the address possesses. It is a string that also includes the number of decimals. Example: "1500000000000000000" (equivalent to 1.5 EGLD).  |
| isSender  | The isSender field is true if the address was the sender when the balance has changed.                                                                                                |
| timestamp | The timestamp field represents the timestamp when the address balance was changed.                                                                                                    |

## Query examples

### Fetch the latest 10 entries for an address sorted by timestamp

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
