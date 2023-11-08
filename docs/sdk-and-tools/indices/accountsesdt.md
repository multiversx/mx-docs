---
id: es-index-accountsesdt
title: accountsesdt
---

[comment]: # (mx-abstract)

This page describes the structure of the `accounts-esdt` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is composed in this way: `{bech32address}_{tokenIdentifier}_{nonce}` (example: `erd.._abcd-0123-01`).

[comment]: # (mx-context-auto)

## Fields

| Field      | Description                                                                                                                           |
|------------|---------------------------------------------------------------------------------------------------------------------------------------|
| identifier | The identifier field consists of `token` field and the `nonce` field hex encoded (example: `TOKEN-01abdc-01`).                        |
| address    | The address field holds the address in a bech32 encoding.                                                                             |
| balance    | The balance field holds the amount of ESDT token the address possesses. It includes the number of decimals.                           |
| balanceNum | The balanceNum field holds the amount of ESDT tokens the address possesses, in a numeric format.                                      |
| data       | The data field is a structure that contains extra data about a token, such as the creator of an NFT.                                  |
| tokenNonce | The tokenNonce field holds the sequence number of the token. This field is empty in the case of `FungibleESDT`.                       |
| token      | The token field holds the name of the token.                                                                                          |
| timestamp  | The timestamp field represents the timestamp when the address balance was changed.                                                    |
| type       | The type field represents the type of the ESDT token. It can be `FungibleESDT`, `NonFungibleESDT`, `SemiFungibleESDT`, or `MetaESDT`. |
| frozen     | The frozen field is set to true when the address possesses a current ESDT token that is in a frozen state.                            |

Docs with a non-empty `tokenNonce` field will have the `data` field populated with the following structure:

| data fields        | Description                                                                                                                                                                                                       |
|--------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| uris               | The uris field holds a list of URIs.                                                                                                                                                                              |
| creator            | The creator field holds the bech32 encoded address of the token's creator.                                                                                                                                        |
| whiteListedStorage | The whiteListedStorage field is true if the token has white-listed storage. An NFT/SFT has white-listed storage if the URI belongs to one of the allowed decentralized storage services, such as IPFS or Pinata.  |
| attributes         | The attributes field contains the attributes of the token.                                                                                                                                                        |
| nonEmptyURIs       | The nonEmptyURIs field is true if the token has non empty uris.                                                                                                                                                   |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch addresses that hold a specific token, sorted by balance (top holders of a token)

```
curl --request GET \
  --url ${ES_URL}/accountsesdt/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
         "identifier": {
           "query": "MY-TOKEN-aaabbb"
         }
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
