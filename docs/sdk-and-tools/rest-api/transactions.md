---
id: transactions
title: Transactions
---

Send Transactions to the Blockchain and query information about them.

## <span class="badge badge-success">POST</span> Send Transaction

`https://api.elrond.com/transaction/send`

This endpoint allows one to send a signed Transaction to the Blockchain.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param     | Required                                  | Type     | Description                                     |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------- |
| version   | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).        |
| chainID   | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                           |
| nonce     | <span class="text-danger">REQUIRED</span> | `number` | The Nonce of the Sender.                        |
| value     | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer (can be zero).            |
| sender    | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Sender.             |
| receiver  | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Receiver.           |
| gasPrice  | <span class="text-danger">REQUIRED</span> | `number` | The desired Gas Price (per Gas Unit).           |
| gasLimit  | <span class="text-danger">REQUIRED</span> | `number` | The maximum amount of Gas Units to consume.     |
| data      | <span class="text-normal">OPTIONAL</span> | `string` | The message (data) of the Transaction.          |
| signature | <span class="text-danger">REQUIRED</span> | `string` | The Signature (hex-encoded) of the Transaction. |

<!--Response-->

🟢 200: OK

Transaction sent with success. A Transaction Hash is returned.

```json
{
  "txHash": "6c41c71946b5b428c2cfb560e3ea425f8a00345de4bb2eb1b784387790914277"
}
```

🔴 400: Bad request

Invalid Transaction signature.

```json
{
  "error": "transaction generation failed: ed25519: invalid signature"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::warning
For Nodes (Observers or Validators with the HTTP API enabled), this endpoint **only accepts transactions whose sender is in the Node's Shard**.
:::

Here's an example of a request:

```
POST https://api.elrond.com/transaction/send HTTP/1.1
Content-Type: application/json

{
    "version": 1,
    "chainId": "v1.0.141",
    "nonce": 42,
    "value": "100000000000000000",
    "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
    "sender": "erd1njqj2zggfup4nl83x0nfgqjkjserm7mjyxdx5vzkm8k0gkh40ezqtfz9lg",
    "gasPrice": 1000000000,
    "gasLimit": 70000,
    "data": "food for cats",
    "signature": "93207c579bf57be03add632b0e1624a73576eeda8a1687e0fa286f03eb1a17ffb125ccdb008a264c402f074a360442c7a034e237679322f62268b614e926d10f"
}
```

## <span class="badge badge-success">POST</span> Send Multiple Transactions

`https://api.elrond.com/transaction/send-multiple`

This endpoint allows one to send a bulk of Transactions to the Blockchain.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param     | Required                                  | Type     | Description                                        |
| --------- | ----------------------------------------- | -------- | -------------------------------------------------- |
| version   | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).           |
| chainID   | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                              |
| nonce     | <span class="text-danger">REQUIRED</span> | `number` | The Nonce, for each Transaction.                   |
| value     | <span class="text-danger">REQUIRED</span> | `string` | The Value, for each Transaction.                   |
| sender    | <span class="text-danger">REQUIRED</span> | `string` | The Address of the Sender, for each Transaction.   |
| receiver  | <span class="text-danger">REQUIRED</span> | `string` | The Address of the Receiver, for each Transaction. |
| gasPrice  | <span class="text-danger">REQUIRED</span> | `number` | The Gas Price, for each Transaction.               |
| gasLimit  | <span class="text-danger">REQUIRED</span> | `number` | The Gas Limit, for each Transaction.               |
| data      | <span class="text-normal">OPTIONAL</span> | `string` | The message (data), for each Transaction.          |
| signature | <span class="text-danger">REQUIRED</span> | `string` | The Signature, for each Transaction.               |

<!--Response-->

🟢 200: OK

A bulk of Transactions were successfully sent.

```json
{
  "numOfSentTxs": 2,
  "txsHashes": {
    "0": "6c41c71946b5b428c2cfb560e3ea425f8a00345de4bb2eb1b784387790914277",
    "1": "fa8195bae93d4609a6fc5972a7a6176feece39a6c4821acae2276701aee12fb0"
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::warning
For Nodes (Observers or Validators with the HTTP API enabled), this endpoint **only accepts transactions whose sender is in the Node's Shard**.
:::

Here's an example of a request:

```
POST https://api.elrond.com/transaction/send-multiple HTTP/1.1
Content-Type: application/json

[
    {
        "nonce": 42,
        "value": "100000000000000000",
        "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
        "sender": "erd1njqj2zggfup4nl83x0nfgqjkjserm7mjyxdx5vzkm8k0gkh40ezqtfz9lg",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "food for cats",
        "chainId": "v1.0.141",
        "version": 1,
        "signature": "93207c579bf57be03add632b0e1624a73576eeda8a1687e0fa286f03eb1a17ffb125ccdb008a264c402f074a360442c7a034e237679322f62268b614e926d10f"
    },
    {
        "nonce": 43,
        "value": "100000000000000000",
        "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
        "sender": "erd1rhp4q3qlydyrrjt7dgpfzxk8n4f7yrat4wc6hmkmcnmj0vgc543s8h7hyl",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "bus tickets",
        "chainID": "v1.0.141",
        "version": 1,
        "signature": "01535fd1d40d98b7178ccfd1729b3f526ee4542482eb9f591d83433f9df97ce7b91db07298b1d14308e020bba80dbe4bba8617a96dd7743f91ee4b03d7f43e00"
    }
]
```

## <span class="badge badge-success">POST</span> Estimate Cost of Transaction

`https://api.elrond.com/transaction/cost`

This endpoint allows one to estimate the cost of a transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param    | Required                                  | Type     | Description                              |
| -------- | ----------------------------------------- | -------- | ---------------------------------------- |
| version  | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1). |
| chainID  | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                    |
| value    | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer.                   |
| sender   | <span class="text-danger">REQUIRED</span> | `string` | TThe Address of the Sender.              |
| receiver | <span class="text-danger">REQUIRED</span> | `string` | The Address of the Receiver.             |
| data     | <span class="text-normal">OPTIONAL</span> | `string` | The message (data) of the Transaction.   |

<!--Response-->

🟢 200: OK

The cost is estimated successfully.

```json
{
  "txGasUnits": "77000"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::warning
This api route returns the cost on the transaction in gas units. The returned value can be used to complete the **gasLimit** field of the transaction
:::

Here's an example of a request:

```
POST https://api.elrond.com/transaction/cost HTTP/1.1
Content-Type: application/json

{
    "value": "100000",
    "sender": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
    "receiver": "erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr",
    "data": "this is an example",
    "chainID": "v1.0.141",
    "version": 1
}
```

## <span class="badge badge-primary">GET</span> **Get Transaction**

`https://api.elrond.com/transaction/:txHash`

This endpoint allows one to query the details of a Transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param  | Required                                  | Type     | Description                               |
| ------ | ----------------------------------------- | -------- | ----------------------------------------- |
| txHash | <span class="text-danger">REQUIRED</span> | `string` | The hash (identifier) of the Transaction. |

Query Parameters

| Param  | Required                                  | Type     | Description                                                 |
| ------ | ----------------------------------------- | -------- | ----------------------------------------------------------- |
| sender | <span class="text-normal">OPTIONAL</span> | `string` | The Address of the sender - a hint to optimize the request. |

<!--Response-->

🟢 200: OK

Transaction details retrieved successfully.

```
{
    "transaction": {
        "type": "normal",
        "nonce": 3,
        "round": 186580,
        "epoch": 12,
        "value": "1000000000000000000",
        "receiver": "erd1...",
        "sender": "erd1...",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "Zm9yIHRlc3Rz",
        "signature": "1047...",
        "sourceShard": 2,
        "destinationShard": 1,
        "blockNonce": 186535,
        "miniblockHash": "e927...",
        "blockHash": "50a1...",
        "status": "executed"
    }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
The optional query parameter **`sender`** is only applicable to requests against the Proxy (not against the Observer Nodes).
:::

## <span class="badge badge-primary">GET</span> **Get Transaction Status**

`https://api.elrond.com/transaction/:txHash/status`

This endpoint allows one to query the Status of a Transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param  | Required                                  | Type     | Description                               |
| ------ | ----------------------------------------- | -------- | ----------------------------------------- |
| txHash | <span class="text-danger">REQUIRED</span> | `string` | The hash (identifier) of the Transaction. |

Query Parameters

| Param  | Required                                  | Type     | Description                                                 |
| ------ | ----------------------------------------- | -------- | ----------------------------------------------------------- |
| sender | <span class="text-normal">OPTIONAL</span> | `string` | The Address of the sender - a hint to optimize the request. |

<!--Response-->

🟢 200: OK

Transaction status retrieved successfully.

```
{
    "status": "executed"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
The optional query parameter **`sender`** is only applicable to requests against the Proxy (not against the Observer Nodes).
:::
