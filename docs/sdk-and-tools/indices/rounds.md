---
id: es-index-rounds
title: Elasticsearch index: rounds
---

The `_id` field of this index is composed in this way: `{shardID}_{round}` (example: `2_10905514`)


| Field            | Description                                                                                                            |
|------------------|------------------------------------------------------------------------------------------------------------------------|
| round            | The round field represents number of the round.                                                                        |
| signersIndexes   | The signersIndexes is an array that contains the indices of the validators that should sign the block from this round. |
| blockWasProposed | The blockWasProposed is true if a block was produced in this round.                                                    |
| shardId          | The shardId field represents represents the shard to which the round belongs.                                          |
| epoch            | The epoch field represents the epoch to which the round belongs.                                                       |
| timestamp        | The timestamp field represents the timestamp of the round.                                                             |


## Query examples

## Fetch the latest rounds for a shard when block was produced

```
curl --request GET \
  --url ${ES_URL}/rounds/_search \
  --header 'Content-Type: application/json' \
  --data '{
    "query": {
        "match": {
            "shardId": 1
        }
    }
    "sort": [
        {
            "timestamp": {
                "order": "desc"
            }
        }
    ],
    "size":10
}'
```
