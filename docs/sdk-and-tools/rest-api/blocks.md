---
id: blocks
title: Blocks
---

Query blocks information.

## <span class="badge badge-primary">GET</span> **Get Hyperblock by Nonce**

`https://gateway.elrond.com//hyperblock/by-nonce/:nonce`

This endpoint allows one to query a Hyperblock by its nonce.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| nonce | <span class="text-danger">REQUIRED</span> | `number` | The Block nonce (height). |

<!--Response-->

🟢 200: OK

Block details retrieved successfully.

```
{
    "hyperblock": {
        "nonce": 185833,
        "round": 186582,
        "hash": "6a33...",
        "prevBlockHash": "aa7e...",
        "epoch": 12,
        "numTxs": 1,
        "shardBlocks": [
            {
                "hash": "cba4...",
                "nonce": 186556,
                "shard": 0
            },
            {
                "hash": "50a16...",
                "nonce": 186535,
                "shard": 1
            },
            {
                "hash": "7981...",
                "nonce": 186536,
                "shard": 2
            }
        ],
        "transactions": [
            {
                "type": "normal",
                "hash": "b035...",
                "nonce": 3,
                "value": "1000000000000000000",
                "receiver": "erd1...",
                "sender": "erd1...",
                "gasPrice": 1000000000,
                "gasLimit": 70000,
                "data": "Zm9yIHRlc3Rz",
                "signature": "1047...",
                "status": "executed"
            }
        ]
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
This endpoint is only is only defined by the Proxy. The Observer does not expose this endpoint.
:::

:::tip
A **Hyperblock** is a block-like abstraction that reunites the data from all shards, and contains only **fully-executed transactions** (that is, transactions executed both in _source_ and in _destination_ shard).

A **hyperblock** is composed using a **metablock** as a starting point - therefore, the `nonce` or `hash` of a hyperblock is the same as the `nonce` or `hash` of the base metablock.
:::

## <span class="badge badge-primary">GET</span> **Get Hyperblock by Hash**

`https://gateway.elrond.com/hyperblock/by-hash/:hash`

This endpoint allows one to query a Hyperblock by its hash.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| hash | <span class="text-normal">OPTIONAL</span> | `string` | The Block hash. |

<!--Response-->

🟢 200: OK

```
{
    "hyperblock": {
        "nonce": 185833,
        "round": 186582,
        "hash": "6a33...",
        "prevBlockHash": "aa7e...",
        "epoch": 12,
        "numTxs": 1,
        "shardBlocks": [
            {
                "hash": "cba4...",
                "nonce": 186556,
                "shard": 0
            },
            {
                "hash": "50a16...",
                "nonce": 186535,
                "shard": 1
            },
            {
                "hash": "7981...",
                "nonce": 186536,
                "shard": 2
            }
        ],
        "transactions": [
            {
                "type": "normal",
                "hash": "b035...",
                "nonce": 3,
                "value": "1000000000000000000",
                "receiver": "erd1...",
                "sender": "erd1...",
                "gasPrice": 1000000000,
                "gasLimit": 70000,
                "data": "Zm9yIHRlc3Rz",
                "signature": "1047...",
                "status": "executed"
            }
        ]
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
This endpoint is only is only defined by the Proxy. The Observer does not expose this endpoint.
:::

## <span class="badge badge-primary">GET</span> **Get Block by Nonce**

`http://localhost:8080/block/:shard/by-nonce/:nonce`

This endpoint allows one to query a Shard Block by its nonce (or height).

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| shard | <span class="text-normal">OPTIONAL</span> | `number` | The Shard. |
| nonce | <span class="text-danger">REQUIRED</span> | `number` | The Block nonce (height). |

Query Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| withTxs | <span class="text-normal">OPTIONAL</span> | `boolean` | Whether to include the transactions in the response. |

<!--Response-->

🟢 200: OK

Block retrieved successfully, with transactions included.

```
{
    "block": {
        "nonce": 186532,
        "round": 186576,
        "hash": "7aa3...",
        "prevBlockHash": "2580...",
        "epoch": 12,
        "shard": 2,
        "numTxs": 1,
        "miniBlocks": [
            {
                "hash": "e927...",
                "type": "TxBlock",
                "sourceShard": 2,
                "destinationShard": 1,
                "transactions": [
                    {
                        "type": "normal",
                        "hash": "b035...",
                        "nonce": 3,
                        "value": "1000000000000000000",
                        "receiver": "erd1...",
                        "sender": "erd1...",
                        "gasPrice": 1000000000,
                        "gasLimit": 70000,
                        "data": "Zm9yIHRlc3Rz",
                        "signature": "1047...",
                        "status": "partially-executed"
                    }
                ]
            }
        ]
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
For Observers, the `shard` parameter should not be set.
:::

## <span class="badge badge-primary">GET</span> **Get Block by Hash**

`http://localhost:8080/block/:shard/by-hash/:hash`

This endpoint allows one to query a Shard Block by its hash.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| shard | <span class="text-normal">OPTIONAL</span> | `number` | The Shard. |
| hash | <span class="text-danger">REQUIRED</span> | `string` | The Block hash. |

Query Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| withTxs | <span class="text-normal">OPTIONAL</span> | `boolean` | Whether to include the transactions in the response. |

<!--Response-->

🟢 200: OK

Block retrieved successfully, with transactions included.

```
{
    "block": {
        "nonce": 186532,
        "round": 186576,
        "hash": "7aa3...",
        "prevBlockHash": "2580...",
        "epoch": 12,
        "shard": 2,
        "numTxs": 1,
        "miniBlocks": [
            {
                "hash": "e927...",
                "type": "TxBlock",
                "sourceShard": 2,
                "destinationShard": 1,
                "transactions": [
                    {
                        "type": "normal",
                        "hash": "b035...",
                        "nonce": 3,
                        "value": "1000000000000000000",
                        "receiver": "erd1...",
                        "sender": "erd1...",
                        "gasPrice": 1000000000,
                        "gasLimit": 70000,
                        "data": "Zm9yIHRlc3Rz",
                        "signature": "1047...",
                        "status": "partially-executed"
                    }
                ]
            }
        ]
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
For Observers, the `shard` parameter should not be set.
:::