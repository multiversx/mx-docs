---
id: es-index-delegators
title: delegators
---

[comment]: # (mx-abstract)

This page describes the structure of the `delegators` index (Elasticsearch), and also depicts a few examples of how to query it.

[comment]: # (mx-context-auto)

## _id

The `_id` field of this index is composed in this way: `blake2bHash(delegatorAddress+stakingProviderAddress)`, in a base64 encoding (example: `YZNG+r3ZwFtOj0c057MnpVnXAfmSqLai15lusLWg+KM=`).

[comment]: # (mx-context-auto)

## Fields

| Field          | Description                                                                                                                          |
|----------------|--------------------------------------------------------------------------------------------------------------------------------------|
| address        | The address field holds the address in a bech32 encoding of the delegator.                                                           |
| contract       | This field holds the bech32 encoded address of the staking provider contract to whom it was delegated to.                            |
| activeStake    | The activeStake field holds the EGLD amount of the active stake (not undelegated nor unbondable).                                    |
| activeStakeNum | The activeStake field holds the EGLD amount of the active stake (not undelegated nor unbondable), in a numeric format. Example: 1.5. |
| unDelegateInfo | The unDelegateInfo contains a list with data about the unDelegated values.                                                           |
| timestamp      | The timestamp field represents the last moment when was a interation with the delegation contract.                                   |


The `unDelegateInfo` field is populated with the fields below:

| unDelegateInfo fields | Description                                                                                     |
|-----------------------|-------------------------------------------------------------------------------------------------|
| value                 | The value field holds the EGLD amount that was undelegated.                                     |
| valueNum              | The value field holds the EGLD amount that was undelegated, in a numeric format (example: 1.5). |
| timestamp             | The timestamp field represents the timestamp when the unDelegation operation was done.          |


[comment]: # (mx-context-auto)

## Query examples

[comment]: # (mx-context-auto)

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

[comment]: # (mx-context-auto)

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
