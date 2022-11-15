---
id: es-index-accountsesdthistory
title: Elasticsearch index: accountsesdthistory
---

The `_id` field of this index is composed in this way: `{bech32address}_{tokenIdentifier}_{nonce}_{timestamp}` (example: `erd.._abcd-0123-01`).


| Field      | Description                                                                                                         |
|------------|---------------------------------------------------------------------------------------------------------------------|
| address    | The address field holds the address in a bech32 encoding.                                                           |
| balance    | The balance field holds the amount of ESDT token the address possesses.                                             |
| token      | he token field holds the token name of the token.                                                                   |
| identifier | The identifier field is composed from the `token` field and the `nonce` field hex encoded.                          |
| tokenNonce | The tokenNonce field holds the sequence number of the token. This field can be empty in the case of `FungibleESDT`. |
| timestamp  | The timestamp field represents the timestamp when the address balance was changed.                                  |


## Query examples

### Fetch the latest 10 entries for an address by token sorted by timestamp

```
curl --request GET \
  --url ${ES_URL}/accountshistory/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"must": [
				{
				     "match": {
                        "identifier": {
                            "token": "MY-TOKEN-aaabbb",
                                "operator": "AND"
                            }
                     }
				},
				{
					"match": {
						"token": "erd..."
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

