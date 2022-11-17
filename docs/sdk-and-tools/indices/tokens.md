---
id: es-index-tokens
title: Elasticsearch index: tokens
---

The `_id` field of this index is represented by token identifier of an ESDT token.

| Field         | Description                                                                                                                                                                                |
|---------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| name          | The name field holds the name of the token. It contains alphanumeric characters only.                                                                                                      |
| ticker        | The ticker field represents the unique combination of letters assigned to a token.                                                                                                         |
| token         | The token represents the token identifier which has the form `ABCD-012345`. The token field is composed of the  `ticker` field and a random sequence generated when the token is created.  |
| issuer        | The issuer field holds the address in a bech32 format of the issuer of the token.                                                                                                          |
| currentOwner  | The currentOwner field holds the address in a bech32 format of the current owner of the token.                                                                                             |
| type          | The type field holds the type of the token. It can be `FungibleESDT`, `NonFungibleESDT`, `SemiFungibleESDT`, or `MetaESDT`.                                                                |
| timestamp     | The timestamp field represents the timestamp of the block in which the token was created.                                                                                                  |
| ownersHistory | The ownersHistory field holds a list of all the owners of a token.                                                                                                                         |


## Query examples

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
