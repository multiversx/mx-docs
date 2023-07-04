---
id: es-index-accountsesdthistory
title: accountsesdthistory
---

[comment]: # (mx-abstract)

This page describes the structure of the `accounts-esdt-history` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is composed in this way: `{bech32address}_{tokenIdentifier}_{nonce}_{timestamp}` (example: `erd.._abcd-0123-01`).

[comment]: # (mx-context-auto)

## Fields

| Field           | Description                                                                                                         |
|-----------------|---------------------------------------------------------------------------------------------------------------------|
| address         | The address field holds the address in a bech32 encoding.                                                           |
| balance         | The balance field holds the amount of ESDT tokens the address possesses.                                            |
| token           | The token field holds the token name of the token.                                                                  |
| identifier      | The identifier field is composed of the `token` field and the `nonce` field, hex encoded.                           |
| tokenNonce      | The tokenNonce field holds the sequence number of the token. This field can be empty in the case of `FungibleESDT`. |
| timestamp       | The timestamp field represents the timestamp when the address balance was changed.                                  |
| isSmartContract | The isSmartContract field is true if the address is a smart contract address.                                       |
| shardID         | The shardID field represents the shard where the address belongs to, based on its bytes.                            |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch the latest 10 entries of an address' tokens sorted by timestamp

```
curl --request GET \
  --url ${ES_URL}/accountsesdthistory/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"must": [
				{
				     "match": {
                        "identifier": {
                            "query": "MY-TOKEN-aaabbb",
                            "operator": "AND"
                        }
                     }
				},
				{
					"match": {
						"address": "erd..."
					}
				}
			]
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
