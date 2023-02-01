---
id: es-index-scdeploys
title: scdeploys
---

[comment]: # (mx-abstract)

This page describes the structure of the `sc-deploys` index (Elastic Search), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is represented by a bech32 encoded smart contract address.

[comment]: # (mx-context-auto)

## Fields

| Field         | Description                                                                                         |
|---------------|-----------------------------------------------------------------------------------------------------|
| deployTxHash  | The deployTxHash holds the hex encoded hash of the transaction that deployed the smart contract.    |
| deployer      | The address field holds the address in a bech32 encoding of the smart contract deployer.            |
| timestamp     | The timestamp field represents the timestamp of the block in which the smart contract was deployed. |
| upgrades      | The upgrades field holds a list with details about the upgrades of the smart contract.              |

The `upgrades` field is populated with the fields below:

| upgrades fields | Description                                                                                            |
|-----------------|--------------------------------------------------------------------------------------------------------|
| upgrader        | The upgrader field holds the bech32 encoded address of the sender of the contract upgrade transaction. |
| upgradeTxHash   | The upgradeTxHash field holds the hex encoded hash of the contract upgrade transaction.                |
| timestamp       | The timestamp field represents the timestamp of the block in which the smart contract was upgraded.    |

[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

### Fetch details about a smart contract

```
curl --request GET \
  --url ${ES_URL}/scdeploys/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"_id":"erd..."
		}
	}
}'
```
