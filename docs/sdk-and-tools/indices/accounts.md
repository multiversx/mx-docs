---
id: es-index-accounts
title: accounts
---

[comment]: # (mx-abstract)

This page describes the structure of the `accounts` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by a bech32 encoded address.

[comment]: # (mx-context-auto)

## Fields

| Field            | Description                                                                                                                                                                          |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| address          | The address field holds the address in a bech32 encoding. Should be equal to the _id field.                                                                                          |
| balance          | The balance field holds the amount of EGLD the address possesses. It is a string that also includes the number of decimals. Example: "1500000000000000000" (equivalent to 1.5 EGLD). |
| balanceNum       | The balanceNum field holds the amount of EGLD the address possesses, in a numeric format. Example: 1.5.                                                                              |
| nonce            | The nonce field represents the sequence number of the address.                                                                                                                       |
| shardID          | The shardID field represents the shard where the address belongs to, based on its bytes.                                                                                             |
| timestamp        | The timestamp field represents the last moment when the address balance was changed.                                                                                                 |
| developerRewards | The developerRewards represents the fees that were accumulated after all the smart contract calls. They can be claimed by the owner.                                                 |
| currentOwner     | The currentOwner field holds the address in a bech32 format of the current owner of the smart contract. This field is populated only for the smart contract addresses.               |
| userName         | The userName field contains the herotag the address possesses.                                                                                                                       |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

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

[comment]: # (mx-context-auto)

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

[comment]: # (mx-context-auto)

### Fetch addresses with username

```
curl --request GET \
  --url ${ES_URL}/accounts/_search \
  --header 'Content-Type: application/json' \
  --data '{
  "query": {
    "exists": {
      "field": "userName"
    }
  }
}'
```
