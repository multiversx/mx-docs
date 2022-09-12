---
id: transactions
title: Transactions
---

Send Transactions to the Blockchain and query information about them.

## <span class="badge badge-success">POST</span> Send Transaction

`https://gateway.elrond.com/transaction/send`

This endpoint allows one to send a signed Transaction to the Blockchain.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param            | Required                                  | Type     | Description                                                                      |
|------------------|-------------------------------------------|----------|----------------------------------------------------------------------------------|
| nonce            | <span class="text-danger">REQUIRED</span> | `number` | The Nonce of the Sender.                                                         |
| value            | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer, as a string representation of a Big Integer (can be "0"). |
| receiver         | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Receiver.                                            |
| sender           | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Sender.                                              |
| senderUsername   | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Sender's username.                       |
| receiverUsername | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Receiver's username.                     |
| gasPrice         | <span class="text-danger">REQUIRED</span> | `number` | The desired Gas Price (per Gas Unit).                                            |
| gasLimit         | <span class="text-danger">REQUIRED</span> | `number` | The maximum amount of Gas Units to consume.                                      |
| data             | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Transaction's message (data).            |
| signature        | <span class="text-danger">REQUIRED</span> | `string` | The Signature (hex-encoded) of the Transaction.                                  |
| chainID          | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                                                            |
| version          | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).                                         |
| options          | <span class="text-normal">OPTIONAL</span> | `number` | The Options of the Transaction (e.g. 1).                                         |

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
POST https://gateway.elrond.com/transaction/send HTTP/1.1
Content-Type: application/json

{
    "nonce": 42,
    "value": "100000000000000000",
    "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
    "sender": "erd1njqj2zggfup4nl83x0nfgqjkjserm7mjyxdx5vzkm8k0gkh40ezqtfz9lg",
    "gasPrice": 1000000000,
    "gasLimit": 70000,
    "data": "Zm9vZCBmb3IgY2F0cw==", #base64 representation of "food for cats"
    "signature": "93207c579bf57be03add632b0e1624a73576eeda8a1687e0fa286f03eb1a17ffb125ccdb008a264c402f074a360442c7a034e237679322f62268b614e926d10f",
    "chainId": "1",
    "version": 1
}
```

## <span class="badge badge-success">POST</span> Send Multiple Transactions

`https://gateway.elrond.com/transaction/send-multiple`

This endpoint allows one to send a bulk of Transactions to the Blockchain.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

Array of:

| Param            | Required                                  | Type     | Description                                                                      |
|------------------|-------------------------------------------|----------|----------------------------------------------------------------------------------|
| nonce            | <span class="text-danger">REQUIRED</span> | `number` | The Nonce of the Sender.                                                         |
| value            | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer, as a string representation of a Big Integer (can be "0"). |
| receiver         | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Receiver.                                            |
| sender           | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Sender.                                              |
| senderUsername   | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Sender's username.                       |
| receiverUsername | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Receiver's username.                     |
| gasPrice         | <span class="text-danger">REQUIRED</span> | `number` | The desired Gas Price (per Gas Unit).                                            |
| gasLimit         | <span class="text-danger">REQUIRED</span> | `number` | The maximum amount of Gas Units to consume.                                      |
| data             | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Transaction's message (data).            |
| signature        | <span class="text-danger">REQUIRED</span> | `string` | The Signature (hex-encoded) of the Transaction.                                  |
| chainID          | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                                                            |
| version          | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).                                         |
| options          | <span class="text-normal">OPTIONAL</span> | `number` | The Options of the Transaction (e.g. 1).                                         |

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
POST https://gateway.elrond.com/transaction/send-multiple HTTP/1.1
Content-Type: application/json

[
    {
        "nonce": 42,
        "value": "100000000000000000",
        "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
        "sender": "erd1njqj2zggfup4nl83x0nfgqjkjserm7mjyxdx5vzkm8k0gkh40ezqtfz9lg",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "Zm9vZCBmb3IgY2F0cw==", #base64 representation of "food for cats"
        "signature": "93207c579bf57be03add632b0e1624a73576eeda8a1687e0fa286f03eb1a17ffb125ccdb008a264c402f074a360442c7a034e237679322f62268b614e926d10f",
        "chainId": "1",
        "version": 1
}
    {
        "nonce": 43,
        "value": "100000000000000000",
        "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
        "sender": "erd1rhp4q3qlydyrrjt7dgpfzxk8n4f7yrat4wc6hmkmcnmj0vgc543s8h7hyl",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "YnVzIHRpY2tldHM=", #base64 representation of "bus tickets"
        "signature": "01535fd1d40d98b7178ccfd1729b3f526ee4542482eb9f591d83433f9df97ce7b91db07298b1d14308e020bba80dbe4bba8617a96dd7743f91ee4b03d7f43e00",
        "chainID": "1",
        "version": 1
    }
]
```

## <span class="badge badge-success">POST</span> Simulate Transaction

**Nodes and observers**

`https://gateway.elrond.com/transaction/simulate`

This endpoint allows one to send a signed Transaction to the Blockchain in order to simulate its execution.
This can be useful in order to check if the transaction will be successfully executed before actually sending it.
It receives the same request as the `/transaction/send` endpoint.

Move balance successful transaction simulation
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param            | Required                                  | Type     | Description                                                                      |
|------------------|-------------------------------------------|----------|----------------------------------------------------------------------------------|
| nonce            | <span class="text-danger">REQUIRED</span> | `number` | The Nonce of the Sender.                                                         |
| value            | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer, as a string representation of a Big Integer (can be "0"). |
| receiver         | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Receiver.                                            |
| sender           | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Sender.                                              |
| senderUsername   | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Sender's username.                       |
| receiverUsername | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Receiver's username.                     |
| gasPrice         | <span class="text-danger">REQUIRED</span> | `number` | The desired Gas Price (per Gas Unit).                                            |
| gasLimit         | <span class="text-danger">REQUIRED</span> | `number` | The maximum amount of Gas Units to consume.                                      |
| data             | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Transaction's message (data).            |
| signature        | <span class="text-danger">REQUIRED</span> | `string` | The Signature (hex-encoded) of the Transaction.                                  |
| chainID          | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                                                            |
| version          | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).                                         |
| options          | <span class="text-normal">OPTIONAL</span> | `number` | The Options of the Transaction (e.g. 1).                                         |

<!--Response-->

A full response contains the fields above:
*SimulationResults*
| Field      | Type                      | Description       |
|------------|---------------------------|-------------------|
| status     | string                    | success, fail ... |
| failReason | string                    | the error message |
| scResults  | []ApiSmartContractResult  | an array of smart contract results (if any) |
| receipts   | []ApiReceipt              | an array of the receipts (if any) |
| hash       | string                    | the hash of the transaction |


❕ Note that fields that are empty won't be included in the response. This can be seen in the examples below

---

🟢 200: OK

Transaction would be successful.

```json
{
 "status": "success",
 "hash": "bb24ccaa2da8cddd6a3a8eb162e6ff62ad4f6e1914d9aa0cacde6772246ca2dd"
}
```

---

🟢 200: Simulation was successful, but the transaction wouldn't be executed.

Invalid Transaction signature.

```json
{
    "status": "fail",
    "failReason": "higher nonce in transaction",
    "hash": "bb24ccaa2da8cddd6a3a8eb162e6ff62ad4f6e1914d9aa0cacde6772246ca2dd"
}
```
---

🔴 400: Bad request

```json
{
  "error": "transaction generation failed: invalid chain ID"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

---

**Proxy**

On the Proxy side, if the transaction to simulate is a cross-shard one, then the response format will contain two elements called `senderShard` and `receiverShard` which are of type `SimulationResults` explained above.

Example response for cross-shard transactions:

```
{
 "receiverShard": {
  "status": "success",
  "hash": "bb24ccaa2da8cddd6a3a8eb162e6ff62ad4f6e1914d9aa0cacde6772246ca2dd"
 },
 "senderShard": {
  "status": "success",
  "hash": "bb24ccaa2da8cddd6a3a8eb162e6ff62ad4f6e1914d9aa0cacde6772246ca2dd"
 }
}
```

## <span class="badge badge-success">POST</span> Estimate Cost of Transaction

`https://gateway.elrond.com/transaction/cost`

This endpoint allows one to estimate the cost of a transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param    | Required                                  | Type     | Description                                                                      |
|----------|-------------------------------------------|----------|----------------------------------------------------------------------------------|
| value    | <span class="text-danger">REQUIRED</span> | `string` | The Value to transfer, as a string representation of a Big Integer (can be "0"). |
| receiver | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Receiver.                                            |
| sender   | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Sender.                                              |
| data     | <span class="text-normal">OPTIONAL</span> | `string` | The base64 string representation of the Transaction's message (data).            |
| chainID  | <span class="text-danger">REQUIRED</span> | `string` | The Chain identifier.                                                            |
| version  | <span class="text-danger">REQUIRED</span> | `number` | The Version of the Transaction (e.g. 1).                                         |

<!--Response-->

🟢 200: OK

The cost is estimated successfully.

```json
{
  "txGasUnits": "77000"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::tip
This endpoint returns the cost on the transaction in **gas units**. The returned value can be used to fill in **gasLimit** field of the transaction.
:::

Here's an example of a request:

```
POST https://gateway.elrond.com/transaction/cost HTTP/1.1
Content-Type: application/json

{
    "value": "100000",
    "receiver": "erd188nydpkagtpwvfklkl2tn0w6g40zdxkwfgwpjqc2a2m2n7ne9g8q2t22sr",
    "sender": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
    "data": "dGhpcyBpcyBhbiBleGFtcGxl", #base64 representation of "this is an example"
    "chainID": "1",
    "version": 1
}
```

## <span class="badge badge-primary">GET</span> **Get Transaction**

`https://gateway.elrond.com/transaction/:txHash`

This endpoint allows one to query the details of a Transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param  | Required                                  | Type     | Description                               |
|--------|-------------------------------------------|----------|-------------------------------------------|
| txHash | <span class="text-danger">REQUIRED</span> | `string` | The hash (identifier) of the Transaction. |

Query Parameters

| Param       | Required                                  | Type     | Description                                                                                  |
|-------------|-------------------------------------------|----------|----------------------------------------------------------------------------------------------|
| sender      | <span class="text-normal">OPTIONAL</span> | `string` | The Address of the sender - a hint to optimize the request.                                  |
| withResults | <span class="text-normal">OPTIONAL</span> | `bool`   | Boolean parameter to specify if smart contract results and other details should be returned. |

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

<!--Example with results-->

Request URL:

`https://gateway.elrond.com/transaction/:txHash?withResults=true`

Response: 

The response can contain additional fields such as `smartContractResults`, or `receipt`
```
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
      "status": "executed",
      "receipt": {
        "value": 100,
        "sender": "erd1...",
        "data": "...",
        "txHash": "b37..."
      },
      "smartContractResults": [
        {
          "hash": "...",
          "nonce": 5,
          "value": 1000,
          "receiver": "erd1...",
          "sender": "erd1...",
          "data": "@6f6b",
          "prevTxHash": "3638...",
          "originalTxHash": "3638...",
          "gasLimit": 0,
          "gasPrice": 1000000000,
          "callType": 0
        }
      ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

:::important
The optional query parameter **`sender`** is only applicable to requests against the Proxy (not against the Observer Nodes).
:::

## <span class="badge badge-primary">GET</span> **Get Transaction Status**

`https://gateway.elrond.com/transaction/:txHash/status`

This endpoint allows one to query the Status of a Transaction.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Path Parameters

| Param  | Required                                  | Type     | Description                               |
|--------|-------------------------------------------|----------|-------------------------------------------|
| txHash | <span class="text-danger">REQUIRED</span> | `string` | The hash (identifier) of the Transaction. |

Query Parameters

| Param  | Required                                  | Type     | Description                                                 |
|--------|-------------------------------------------|----------|-------------------------------------------------------------|
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
