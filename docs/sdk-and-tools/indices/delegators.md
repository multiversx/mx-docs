---
id: es-index-delegators
title: Elasticsearch index: delegators
---

The `_id` field of this index is composed in this way: `blake2bHash(delegatorAddress+stakingProviderAddress)`, in a base64 encoding (example: `YZNG+r3ZwFtOj0c057MnpVnXAfmSqLai15lusLWg+KM=`).


| Field          | Description                                                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------|
| address        | The address field holds the address in a bech32 encoding of the delegator.                                                           |
| contract       | The contract field holds the address in a bech32 encoding of the staking provider contract.                                          |
| activeStake    | The activeStake field holds the EGLD amount of the active stake (not undelegated, unbondable).                                       |
| activeStakeNum | The activeStake field holds the EGLD amount of the active stake (not undelegated, unbondable), in a numeric format. . Example: 1.5.  |

## Query examples

### Fetch all records for an address

```
curl --request GET \
  --url ${ES_URL}/delegators/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"address":"erd.."
		}
	}
}'
```

### Fetch all delegators from a staking provider

```
curl --request GET \
  --url ${ES_URL}/delegators/_search \
  --header 'Content-Type: application/json' \
  --data '{
	"query": {
		"match": {
			"contract":"erd.."
		}
	}
}'
```
