---
id: addresses
title: Addresses
---

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Get information about an MultiversX Address.

## <span class="badge badge--primary">GET</span> **Get Address** {#get-address}

`https://gateway.multiversx.com/address/:bech32Address`

This endpoint allows one to retrieve basic information about an Address (Account).

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param | Required                                  | Type     | Description               |
| ----- | ----------------------------------------- | -------- | ------------------------- |
| nonce | <span class="text-danger">REQUIRED</span> | `number` | The Block nonce (height). |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Block details retrieved successfully.

```json
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

</TabItem>
</Tabs>

## <span class="badge badge--primary">GET</span> **Get Address Nonce** {#get-address-nonce}

`https://gateway.multiversx.com/address/:bech32Address/nonce`

This endpoint allows one to retrieve the nonce of an Address.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Nonce successfully retrieved.

```json
{
  "data": {
    "nonce": 5
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

## <span class="badge badge--primary">GET</span> **Get Address Balance** {#get-address-balance}

`https://gateway.multiversx.com/address/:bech32Address/balance`

This endpoint allows one to retrieve the balance of an Address.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Balance successfully retrieved.

```json
{
  "data": {
    "balance": "100000000000000000000"
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

## <span class="badge badge--primary">GET</span> **Get Address Username (herotag)** {#get-address-username-herotag}

`https://gateway.multiversx.com/address/:bech32Address/username`

This endpoint allows one to retrieve the username / herotag of an Address (if any).

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Balance successfully retrieved.

```json
{
  "data": {
    "username": "docs.elrond"
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

## <span class="badge badge--primary">GET</span> **Get Address Transactions** {#get-address-transactions}

`https://gateway.multiversx.com/address/:bech32Address/transactions`
`https://gateway.multiversx.com/address/:bech32Address/transactions`

This endpoint allows one to retrieve the latest 20 Transactions sent from an Address.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Transactions successfully retrieved.

```json
{
  "data": {
    "transactions": [
      {
        "hash": "1a3e...",
        "fee": "10000000000000000",
        "miniBlockHash": "9673...",
        "nonce": 68,
        "round": 33688,
        "value": "1000000000000000000",
        "receiver": "erd1...",
        "sender": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
        "receiverShard": 0,
        "senderShard": 0,
        "gasPrice": 200000000000,
        "gasLimit": 50000,
        "gasUsed": 50000,
        "data": "",
        "signature": "ed75...",
        "timestamp": 1591258128,
        "status": "Success",
        "scResults": null
      },
      {
        "hash": "d72d...",
        "fee": "10000000000000000",
        "miniBlockHash": "fd45...",
        "nonce": 67,
        "round": 27353,
        "value": "100000000000000000000000000",
        "receiver": "erd1...",
        "sender": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
        "receiverShard": 1,
        "senderShard": 0,
        "gasPrice": 200000000000,
        "gasLimit": 50000,
        "gasUsed": 50000,
        "data": "",
        "signature": "bb98...",
        "timestamp": 1591220142,
        "status": "Success",
        "scResults": null
      },
      ...
    ]
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

:::warning
This endpoint is not available on Observer Nodes. It is only available on MultiversX Proxy.

**Currently, this endpoint is only available on the Official MultiversX Proxy instance.**

This endpoint requires the presence of an Elasticsearch instance (populated through Observers) as well.
:::

## <span class="badge badge--primary">GET</span> **Get Storage Value for Address** {#get-storage-value-for-address}

`https://gateway.multiversx.com/address/:bech32Address/key/:key`
`https://gateway.multiversx.com/address/:bech32Address/key/:key`

This endpoint allows one to retrieve a value stored within the Blockchain for a given Address.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description             |
| ------------- | ----------------------------------------- | -------- | ----------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query.   |
| key           | <span class="text-danger">REQUIRED</span> | `string` | The key entry to fetch. |

The key must be hex-encoded.

</TabItem>
<TabItem value="Response">

🟢 200: OK

Value (hex-encoded) successfully retrieved.

```json
{
  "data": {
    "value": "abba"
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

## <span class="badge badge--primary">GET</span> **Get all storage for Address** {#get-all-storage-for-address}

`https://gateway.multiversx.com/address/:bech32Address/keys`
`https://gateway.multiversx.com/address/:bech32Address/keys`

This endpoint allows one to retrieve all the key-value pairs stored under a given account.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

</TabItem>
<TabItem value="Response">

🟢 200: OK

Key-value pairs (both hex-encoded) successfully retrieved.

```json
{
    "data": {
        "pairs": {
            "abba": "6f6b"
            ...
        }
    },
    "error": "",
    "code": "successful"
}
```

</TabItem>
</Tabs>

## **ESDT tokens endpoints**

There are a number of ESDT tokens endpoints that one can use to check all tokens of an address, balance for
specific fungible or non-fungible tokens or so on.

Fungible tokens endpoints can be found [here](/developers/esdt-tokens/#rest-api) and non-fungible tokens
endpoints can be found [here](/developers/nft-tokens/#rest-api).
