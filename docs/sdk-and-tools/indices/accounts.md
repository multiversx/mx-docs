---
id: es-index-accounts
title: Elasticsearch index: accounts
---

The `_id` field for this index is composed of bech32 encoded address.

| Field      | Description                                                                                                |
|------------|------------------------------------------------------------------------------------------------------------|
| address    | The address field holds the address bytes in a bech32 encoding.                                            |
| balance    | The balance field holds the amount of EGLD the address has.                                                |
| balanceNum | The balanceNum field holds the amount of EGLD the address has in a numeric format(denominated with 10^18). |
| nonce      | The nonce field represents the sequence number of the address.                                             |
| shardID    | The shardId field represents in which shard the address belongs.                                           |
| timestamp  | The timestamp field represents the timestamp when the address balance was changed.                         |

## Query examples

### Fetch addresses sorted by balance

```
curl --request GET \
  --url ${ES_URL}/accounts/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "sort": [
        {
            "balanceNum": {
                "order": "desc"
            }
        }
    ],
    "size":10
}'
```

### Fetch addresses sorted by balance from a shard

```
curl --request GET \
  --url ${ES_URL}/accounts/_search \
  --header 'Content-Type: application/json' \
  --data '{
     "query": {
        "match": {
            "shardId": "1"
        }
    },
    "sort": [
        {
            "balanceNum": {
                "order": "desc"
            }
        }
    ],
    "size":10
}'
```
