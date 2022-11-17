---
id: es-index-accountsesdt
title: Elasticsearch index: accountsesdt
---

The `_id` field of this index is composed in this way: `{bech32address}_{tokenIdentifier}_{nonce}` (example: `erd.._abcd-0123-01`).

| Field       | Description                                                                                                                           |
|-------------|---------------------------------------------------------------------------------------------------------------------------------------|
| identifier  | The identifier field consists of `token` field and the `nonce` field hex encoded.                                                     |
| address     | The address field holds the address in a bech32 encoding.                                                                             |
| balance     | The balance field holds the amount of ESDT token the address possesses.                                                               |
| balanceNum  | The balanceNum field holds the amount of ESDT tokens the address possesses, in a numeric format.                                      |
| data        | The data field is a structure that contains extra data about a token, such as the creator of an NFT.                                  |
| tokenNonce  | The tokenNonce field holds the sequence number of the token. This field is empty in the case of `FungibleESDT`.                       |
| token       | The token field holds the name of the token.                                                                                          |
| timestamp   | The timestamp field represents the timestamp when the address balance was changed.                                                    |
| type        | The type field represents the type of the ESDT token. It can be `FungibleESDT`, `NonFungibleESDT`, `SemiFungibleESDT`, or `MetaESDT`. |


Docs with a non-empty `tokenNonce` field will have the `data` field populated with the following structure:

| data fields        | Description                                                                 |
|--------------------|-----------------------------------------------------------------------------|
| uris               | The uris field holds a list of URIs.                                        |
| creator            | The creator field holds the bech32 encoded address of the token's creator.  |
| whiteListedStorage | The whiteListedStorage field is true if the token has white-listed storage. |
| attributes         | The attributes field contains the attributes of the token.                  |
| nonEmptyURIs       | The nonEmptyURIs field is true if the token has non empty uris.             |


## Query examples

### Fetch addresses that hold a specific token, sorted by balance (top holders of a token)

```
curl --request GET \
  --url ${ES_URL}/accountsesdt/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
         "identifier": {
           "query": "MY-TOKEN-aaabbb",
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

### Fetch all the ESDT tokens in an address wallet

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
