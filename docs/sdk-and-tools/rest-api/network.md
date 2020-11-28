---
id: network
title: Network
---

Query information about the Network.

## <span class="badge badge-primary">GET</span> **Get Network Configuration**

`https://api.elrond.com/network/config`

This endpoint allows one to query basic details about the configuration of the Network.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

<!--Response-->

🟢 200: OK

Configuration details retrieved successfully.

```
{
    "config": {
        "erd_chain_id": "1",
        "erd_denomination": 18,
        "erd_gas_per_data_byte": 1500,
        "erd_latest_tag_software_version": "v1.1.0.0",
        "erd_meta_consensus_group_size": 400,
        "erd_min_gas_limit": 50000,
        "erd_min_gas_price": 1000000000,
        "erd_min_transaction_version": 1,
        "erd_num_metachain_nodes": 400,
        "erd_num_nodes_in_shard": 400,
        "erd_num_shards_without_meta": 3,
        "erd_round_duration": 6000,
        "erd_shard_consensus_group_size": 63,
        "erd_start_time": 1596117600
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## <span class="badge badge-primary">GET</span> **Get Shard Status**

`https://api.elrond.com/network/status/:shardId`

This endpoint allows one to query the status of a given Shard.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| shardID | <span class="text-danger">REQUIRED</span> | `number` | The Shard ID. 0, 1, 2 etc. Use 4294967295 in order to query the Metachain. |

<!--Response-->

🟢 200: OK

Shard Status retrieved successfully.

```
{
    "status": {
        "erd_current_round": 187068,
        "erd_epoch_number": 12,
        "erd_highest_final_nonce": 187019,
        "erd_nonce": 187023,
        "erd_nonce_at_epoch_start": 172770,
        "erd_nonces_passed_in_current_epoch": 14253,
        "erd_round_at_epoch_start": 172814,
        "erd_rounds_passed_in_current_epoch": 14254,
        "erd_rounds_per_epoch": 14400
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
The path parameter `**shardId**` is only applicable on the Proxy endpoint. The Observer endpoint does not define this parameter.
:::