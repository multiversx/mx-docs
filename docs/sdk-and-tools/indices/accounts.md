---
id: es-index-accounts
title: accounts
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## _id

The `_id` field of this index is represented by a bech32 encoded address.

[comment]: # (mx-context)

## Fields

| Field      | Description                                                                                                                                                                          |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| address    | The address field holds the address in a bech32 encoding. Should be equal to the _id field.                                                                                          |
| balance    | The balance field holds the amount of EGLD the address possesses. It is a string that also includes the number of decimals. Example: "1500000000000000000" (equivalent to 1.5 EGLD). |
| balanceNum | The balanceNum field holds the amount of EGLD the address possesses, in a numeric format. Example: 1.5.                                                                              |
| nonce      | The nonce field represents the sequence number of the address.                                                                                                                       |
| shardID    | The shardID field represents the shard where the address belongs to, based on its bytes.                                                                                             |
| timestamp  | The timestamp field represents the last moment when the address balance was changed.                                                                                                 |

[comment]: # (mx-context)

## Query examples

[comment]: # (mx-context)

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

[comment]: # (mx-context)

### Fetch addresses in a shard, sorted by balance

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
