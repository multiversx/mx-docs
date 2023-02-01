---
id: es-index-tokens
title: tokens
---

[comment]: # (mx-abstract)

This page describes the structure of the `tokens` index (Elastic Search), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by token identifier of an ESDT token.

[comment]: # (mx-context-auto)

## Fields

| Field         | Description                                                                                                                       |
|---------------|-----------------------------------------------------------------------------------------------------------------------------------|
| name          | The name field holds the name of the token. It contains alphanumeric characters only.                                             |
| ticker        | The ticker field represents the token's ticker (uppercase alphanumeric characters).                                               |
| token         | The token field is composed of the  `ticker` field and a random sequence generated when the token is created(e.g. `ABCD-012345`). |
| issuer        | The issuer field holds the bech32 encoded address of the token's issuer.                                                          |
| currentOwner  | The currentOwner field holds the address in a bech32 format of the current owner of the token.                                    |
| type          | The type field holds the type of the token. It can be `FungibleESDT`, `NonFungibleESDT`, `SemiFungibleESDT`, or `MetaESDT`.       |
| timestamp     | The timestamp field represents the timestamp of the block in which the token was created.                                         |
| ownersHistory | The ownersHistory field holds a list of all the owners of a token.                                                                |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch details of a token

```
curl --request GET \
  --url ${ES_URL}/tokens/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"ABCD-012345"
		}
	}
}'
```
