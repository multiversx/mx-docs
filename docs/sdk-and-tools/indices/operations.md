---
id: es-index-operations
title: operations
---


## _id

The _id field of this index is represented by the transactions OR smart contract result hash, in a hexadecimal encoding.

## Fields

This index contains both transactions and smart contract results. This is useful because one can query both of them in a single request.

The unified structure will contain an extra field in order to be able to differentiate between them.

| Field | Description                                                                                    |
|-------|------------------------------------------------------------------------------------------------|
| type  | It can be `normal` in case of a transaction and `unsigned` in case of a smart contract result. |


## Query examples

### Fetch the latest operations of an address

```
curl --request GET \
  --url ${ES_URL}/operations/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"bool": {
			"should": [
				{
					"match": {
						"sender": "erd..."
					}
				},
				{
					"match": {
						"receiver": "erd..."
					}
				},
				{
					"match": {
						"receivers": "erd..."
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
    ]
}'
```
