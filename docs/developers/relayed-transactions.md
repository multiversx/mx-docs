---
id: relayed-transactions
title: Relayed Transactions
---
[comment]: # (mx-abstract)

On this page, you will find comprehensive information on all aspects of relayed transactions.

[comment]: # (mx-context-auto)

## Introduction

Relayed transactions (or meta-transactions) are transactions with the fee paid by a so-called relayer.
In other words, if a relayer is willing to pay for an interaction, it is not mandatory that the address
interacting with a Smart Contract has any EGLD for fees.

More details and specifications can be found on [MultiversX Specs](https://github.com/multiversx/mx-specs/blob/main/sc-meta-transactions.md).

[comment]: # (mx-context-auto)

## Types of relayed transactions

Currently, there are 3 versions of relayed transactions: v1, v2 and v3. In the end, they all have the same effect.

Relayed v2 was meant to bring optimisations in terms of gas usage. But v3 reduces the costs even further, **making it our recommendation**.

Once all applications will completely transition to relayed v3 model, v1 and v2 will be removed.

[comment]: # (mx-context-auto)

## Relayed transactions version 1

:::note
Legacy version. Please use [version 3](#relayed-transactions-version-3), instead.
:::


[comment]: # (mx-context-auto)

## Relayed transactions version 2

:::note
Legacy version. Please use [version 3](#relayed-transactions-version-3), instead.
:::

[comment]: # (mx-context-auto)

## Relayed transactions version 3

Relayed transactions v3 feature comes with a change on the entire transaction structure, adding two new optional fields: 
- `relayer`, which is the relayer address that will pay the fees.
- `relayerSignature`, the signature of the relayer that proves the agreement of the relayer.

That being said, relayed transactions v3 will look and behave very similar to a regular transaction, the only difference being the gas consumption from the relayer. It is no longer needed to specify the user transaction in the data field.

In terms of gas limit computation, an extra base cost will be consumed. Let's consider the following example: relayed transaction with inner transaction of type move balance, that also has a data field `test` of length 4.
```js
    gasLimitInnerTx = <base_cost> + <cost_per_byte> * length(txData)
    gasLimitInnerTx =    50_000   +      4          *     1_500
    gasLimitInnerTx = 56_000
    
    gasLimitRelayedTx = <base_cost> + <gasLimitInnerTx>
    gasLimitRelayedTx =   50_000    +       56_000
    gasLimitRelayedTx = 106_000
```

It would look like:

```rust
RelayedV3Transaction {
    Sender: <Sender address>
    Receiver: <Receiver address>
    Value: <value>
    GasLimit: <base_cost> + <base_cost> + <cost_per_byte> * length(txData)
    Relayer: <Relayer address>
    RelayerSignature: <Relayer signature>
    Signature: <Sender signature>
}
```

Therefore, in order to build such a transaction, one has to follow the next steps:
  - set the `relayer` field to the address that would pay the gas
  - add the extra base cost for the relayed operation
  - add sender's signature
  - add relayer's signature

:::note
1. For a guarded relayed transaction, the guarded operation fee will also be consumed from the relayer.
2. Relayer must be different from guardian, in case of guarded sender.
3. Guarded relayers are not allowed.
:::

### Example

Here's an example of a relayed v3 transaction. Its intent is to call the `add` method of a previously deployed adder contract, with parameter `01`

```json
{
  "nonce": 0,
  "value": "0",
  "receiver": "erd1qqqqqqqqqqqqqpgqeunf87ar9nqeey5ssvpqwe74ehmztx74qtxqs63nmx",
  "sender": "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
  "data": "YWRkQDAx",
  "gasPrice": 1000000000,
  "gasLimit": 5000000,
  "signature": "...",
  "chainID": "T",
  "version": 2,
  "relayer": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
  "relayerSignature": "..."
}
```

### Preparing relayed transactions using the SDKs

The SDKs have built-in support for relayed transactions. Please follow:
 - [mxpy support](/sdk-and-tools/mxpy/mxpy-cli/#relayed-transactions-v3)
 - [sdk-py support](/sdk-and-tools/sdk-py/#relayed-transactions)
 - [sdk-js v15 support](/sdk-and-tools/sdk-js/sdk-js-cookbook#relayed-transactions)
