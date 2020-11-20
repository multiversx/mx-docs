---
id: transactions
title: Transactions
---

Send Transactions to the Blockchain and query information about them.

## **Send Transaction**

https://api.elrond.com**/transaction/send**

This endpoint allows one to send a signed Transaction to the Blockchain.

Request

Response

Body Parameters

version

REQUIRED

number

The Version of the Transaction (e.g. `1`).

chainID

REQUIRED

string

The Chain identifier.

nonce

REQUIRED

number

The Nonce of the Sender.

value

REQUIRED

string

The Value to transfer (can be zero).

sender

REQUIRED

string

The Address (bech32) of the Sender.

receiver

REQUIRED

string

The Address (bech32) of the Receiver.

gasPrice

REQUIRED

number

The desired Gas Price (per Gas Unit).

gasLimit

REQUIRED

number

The maximum amount of Gas Units to consume.

data

OPTIONAL

string

The message (data) of the Transaction.

signature

REQUIRED

string

The Signature (hex-encoded) of the Transaction.



For Nodes (Observers or Validators with the HTTP API enabled), this endpoint **only accepts transactions whose sender is in the Node's Shard**.

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

## **Send Multiple Transactions**

https://api.elrond.com**/transaction/send-multiple**

This endpoint allows one to send a bulk of Transactions to the Blockchain.

Request

Response

Body Parameters

version

REQUIRED

number

The Version of the Transaction (e.g. `1`).

chainID

REQUIRED

string

The Chain identifier.

nonce

REQUIRED

number

The Nonce, for each Transaction.

value

REQUIRED

string

The Value, for each Transaction.

sender

REQUIRED

string

The Address of the Sender, for each Transaction.

receiver

REQUIRED

string

The Address of the Receiver, for each Transaction.

gasPrice

REQUIRED

number

The Gas Price, for each Transaction.

gasLimit

REQUIRED

number

The Gas Limit, for each Transaction.

data

OPTIONAL

string

The message (data), for each Transaction.

signature

REQUIRED

string

The Signature, for each Transaction.



For Nodes (Observers or Validators with the HTTP API enabled), this endpoint **only accepts transactions whose sender is in the Node's Shard**.

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

## **Estimate Cost of Transaction**

https://api.elrond.com**/transaction/cost**

This endpoint allows one to estimate the cost of a transaction. 

Request

Response

Body Parameters

version

REQUIRED

number

The Version of the Transaction (e.g. `1`).

chainID

REQUIRED

string

The Chain identifier.

value

REQUIRED

string

The Value to transfer.

sender

REQUIRED

string

The Address of the Sender. 

receiver

REQUIRED

string

The Address of the Receiver.

data

OPTIONAL

string

The message (data) of the Transaction.

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

## **Get Transaction**

https://api.elrond.com**/transaction/:txHash**

This endpoint allows one to query the details of a Transaction.

Request

Response

Path Parameters

txHash

REQUIRED

string

The hash (identifier) of the Transaction.

Query Parameters

sender

OPTIONAL

string

The Address of the sender - a hint to optimize the request.



The optional query parameter **`sender`** is only applicable to requests against the Proxy (not against the Observer Nodes).

## **Get Transaction Status**

https://api.elrond.com**/transaction/:txHash/status**

This endpoint allows one to query the Status of a Transaction.

Request

Response

Path Parameters

txHash

REQUIRED

string

The hash (identifier) of the Transaction.

Query Parameters

sender

OPTIONAL

string

The Address of the sender - a hint to optimize the request.



The optional query parameter **`sender`** is only applicable to requests against the Proxy (not against the Observer Nodes).