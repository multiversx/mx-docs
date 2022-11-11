---
id: es-index-accountsesdt
title: Elasticsearch index: accountsesdt
---

The `_id` field of this index is composed in this way: `{bech32address}_{tokenIdentifier}_{nonce}` (example: `erd.._abcd-0123-01`).

| Field       | Description                                                                                                                           |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|
| identifier  | The identifier field is composed from the `token` field and the `nonce` field hex encoded.                                            |
| address     | The address field holds the address bytes in a bech32 encoding.                                                                       |
| balance     | The balance field holds the amount of ESDT token the address has.                                                                     |
| balanceNum  | The balanceNum field holds the amount of ESDT token the address has in a numeric format(denominated with 10^18).                      |
| data        | The data field is a structure that contains extra data about a token, such as the creator of an NFT.                                  |
| tokenNonce  | The tokenNonce field holds the sequence number of the token. This field can be empty in the case of `FungibleESDT`.                   |
| token       | The token field holds the token name of the token.                                                                                    |
| timestamp   | The timestamp field represents the timestamp when the address balance was changed.                                                    |
| type        | The type field represents the type of the ESDT token. It can be `FungibleESDT`, `NonFungibleESDT`, `SemiFungibleESDT`, or `MetaESDT`. |


The docs with the field `tokenNonce` non-empty can have the `data` field populated with the fields below:

| data fields        | Description                                                                     |
|--------------------|---------------------------------------------------------------------------------|
| uris               | The uris field holds a URL or a web address.                                    |
| creator            | The creator field holds the address bech32 encoded of the creator of the token. |
| whiteListedStorage | The whiteListedStorage field is true if the token has white-listed storage.     |
| attributes         | The attributes field contains the attributes of the token.                      |
| nonEmptyURIs       | The nonEmptyURIs field is true if the token has nonce empty uris.               |


## Query examples

### Fetch addresses sorted by balance with a specific token

```
curl --request GET \
  --url ${ES_URL}/accountsesdt/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
         "identifier": {
           "token": "MY-TOKEN-aaabbb",
           "operator": "AND"
         }
       }
     }
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

### Fetch all the ESDT tokens that belong to an address.

```
curl --request GET \
  --url ${ES_URL}/accountsesdt/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"address":"erd.."
		}
	}
}'
```
+