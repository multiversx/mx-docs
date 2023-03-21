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

1. Stop the observers nodes that index data in the Elasticsearch cluster.
2. Delete affected index: `operations`
3. Create the index again with the correct mappings:
   -  in order to do this, clone this [repository](https://github.com/multiversx/mx-chain-tools-go)
   -  checkout this branch `mappings-for-all-fields` 
   - `cd elasticreindexer/indices-creator`
   - open `config/cluster.toml` file and update it with the information about your cluster and at the `enabled-indices`
   section put `["operations"]`
   - build the binary and run it in order to create the index with the correct mappings.

4. After the index was created you can start again the observers. 
5. Copy all the data from a public Elasticsearch cluster for the index with problems.
   - in order to do this follow the steps from this [documentation](https://github.com/multiversx/mx-chain-tools-go/tree/mappings-for-all-fields/elasticreindexer#step-2) (only for the index/indices with problems)
