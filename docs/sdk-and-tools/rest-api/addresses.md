---
id: addresses
title: Addresses
---

Get information about an Elrond Address.

## <span class="badge badge-primary">GET</span> **Get Address**

`https://gateway.elrond.com/address/:bech32Address`

This endpoint allows one to retrieve basic information about an Address (Account).

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

<!--Response-->

🟢 200: OK

Address information successfully retrieved.

```
{
    "account": {
        "address": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
        "nonce": 0,
        "balance": "100000000000000000000",
        "username": "",
        "code": "000000000000000000010000000000000000000000000000000000000004ffff",
        "codeHash": "YspAmEhzTEaqNOZlw+E+bPQx4JnfLJk4Fa/gtKas5fI=",
        "rootHash": "JF2QNq8wpVGijn9vvoSV+vGqTbuKVK1LIj7IlA21JXE=",
        "codeMetadata": "BAA=",
        "developerReward": "5670000000000000",
        "ownerAddress": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## <span class="badge badge-primary">GET</span> **Get Address Nonce**

https://gateway.elrond.com**/address/:bech32Address/nonce**

This endpoint allows one to retrieve the nonce of an Address.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

<!--Response-->

🟢 200: OK

Nonce successfully retrieved.

```
{
  "nonce": 5
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## <span class="badge badge-primary">GET</span> **Get Address Balance**

https://gateway.elrond.com**/address/:bech32Address/balance**

This endpoint allows one to retrieve the balance of an Address.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

<!--Response-->

🟢 200: OK

Balance successfully retrieved.

```
{
  "balance": "100000000000000000000"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## <span class="badge badge-primary">GET</span> **Get Address Transactions**

https://gateway.elrond.com**/address/:bech32Address/transactions**

This endpoint allows one to retrieve the latest 20 Transactions sent from an Address.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description           |
| ------------- | ----------------------------------------- | -------- | --------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query. |

<!--Response-->

🟢 200: OK

Transactions successfully retrieved.

```
{
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
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::warning
This endpoint is not available on Observer Nodes. It is only available on Elrond Proxy.

**Currently, this endpoint is only available on the Official Elrond Proxy instance.**

This endpoint requires the presence of an Elasticsearch instance (populated through Observers) as well.
:::

## <span class="badge badge-primary">GET</span> **Get Storage Value for Address**

https://gateway.elrond.com**/address/:bech32Address/key/:key**

This endpoint allows one to retrieve a value stored within the Blockchain for a given Address.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description                 |
| ------------- | ----------------------------------------- | -------- | --------------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query.       |
| key           | <span class="text-danger">REQUIRED</span> | `string` | The key entry to fetch.     |

The key must be hex-encoded.

<!--Response-->

🟢 200: OK

Value (hex-encoded) successfully retrieved.

```
{
    "value": "abba"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## <span class="badge badge-primary">GET</span> **Get all storage for Address**

https://gateway.elrond.com**/address/:bech32Address/keys**

This endpoint allows one to retrieve all the key-value pairs stored under a given account.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param         | Required                                  | Type     | Description                 |
| ------------- | ----------------------------------------- | -------- | --------------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query.       |

<!--Response-->

🟢 200: OK

Key-value pairs (both hex-encoded) successfully retrieved.

```
{
    "pairs": {
        "abba": "6f6b"
        ...
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->
