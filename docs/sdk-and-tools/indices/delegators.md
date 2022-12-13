---
id: es-index-delegators
title: delegators
---


## _id


The `_id` field of this index is composed in this way: `blake2bHash(delegatorAddress+stakingProviderAddress)`, in a base64 encoding (example: `YZNG+r3ZwFtOj0c057MnpVnXAfmSqLai15lusLWg+KM=`).

## Fields


| Field          | Description                                                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------|
| address        | The address field holds the address in a bech32 encoding of the delegator.                                                           |
| contract       | This field holds the bech32 encoded address of the staking provider contract to whom it was delegated to.                            |
| activeStake    | The activeStake field holds the EGLD amount of the active stake (not undelegated nor unbondable).                                    |
| activeStakeNum | The activeStake field holds the EGLD amount of the active stake (not undelegated nor unbondable), in a numeric format. Example: 1.5. |

## Query examples

### Fetch all delegations of an address

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

### Fetch all delegators to a staking provider

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
