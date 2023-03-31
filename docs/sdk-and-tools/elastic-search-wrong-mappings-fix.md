---
id: es-index-wrong-mapping
title: How to fix Elasticsearch mapping errors
---

Starting with the February 2023 mainnet upgrade new constrains for Elasticsearch indices were added. Therefore, one can notice 
that the observers that index data in the Elasticsearch will remain stuck with an error similar to:

`dataDispatcher.doWork could not index item (will retry) error = { "index": "operations-000001",
"id": "", "statusCode": 400, "errorType": "mapper_parsing_exception", "reason": "failed to parse field [esdtValuesNum] of type [long] in document`

If an observer with `elastic-indexer` enabled will throw a `log.WARN` that contains `"errorType": "mapper_parsing_exception"` 
for an index, then one should follow the next steps: 

In the example below we will repair the `operations` index.
## Solution 1
:::caution
This solution will take more time because all the documents from the index with problems 
have to be reindexed from a public cluster.
:::


1. Stop the observers nodes that index data in the Elasticsearch cluster.
2. Delete affected index: `operations`
3. Create the index again with the correct mappings:
   -  in order to do this, clone this [repository](https://github.com/multiversx/mx-chain-tools-go)
   - `cd elasticreindexer/indices-creator`
   - open `config/cluster.toml` file and update it with the information about your cluster and at the `enabled-indices`
   section put `["operations"]`
   - build the binary and run it in order to create the index with the correct mappings.

4. After the index was created you can start again the observers. 
5. Copy all the data from a public Elasticsearch cluster for the index with problems.
   - in order to do this follow the steps from this [documentation](https://github.com/multiversx/mx-chain-tools-go/tree/mappings-for-all-fields/elasticreindexer#step-2) (only for the index/indices with problems)


## Solution 2

1. Stop the observers nodes that index data in the Elasticsearch cluster.
2. Force a `rollover` for the index with problems in this case `operations` index and the rollover have to contain the correct
mappings.
   ```
   curl --request POST \
     --url ${ES_CLUSTER_URL}/operations/_rollover \
     --header 'Content-Type: application/json' \
     --data '{
    "mappings": {
     "properties": {
      "esdtValuesNum": {
       "type": "double"
      },
      {ADD_THE_REST_OF_THE_MAPPINGS_OF_THE_INDEX}:{},
     }
    },
    "settings": {
     "index": {
      "sort.field": [
       "timestamp",
       "nonce"
      ],
      "sort.order": [
       "desc",
       "desc"
      ]
     },
     "number_of_replicas": 0,
     "number_of_shards": 5
    }
   }'
   ```
3. Make alias `operations` to fetch data from both indices("operations-000001" and "operations-000002").

   ```
   curl --request POST \
     --url ${ES_CLUSTER_URL}/_aliases \
     --header 'Content-Type: application/json' \
     --data '{
       "actions" : [
           { "add" : { "index" : "operations-000001", "alias" : "operations" } },
           { "add" : { "index" : "operations-000002", "alias" : "operations", "is_write_index" : true } }
       ]
   }'
   ```

4. Start again the observers.
