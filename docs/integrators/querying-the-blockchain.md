---
id: querying-the-blockchain
title: Querying the Blockchain
---

[comment]: # (mx-abstract)

This page describes how to query the Network in order to fetch data such as transactions and blocks (hyperblocks).

:::note
On this page, we refer to the [Gateway (Proxy) REST API](/sdk-and-tools/rest-api/gateway-overview) - i.e. the one backed by an [observing squad](/integrators/observing-squad).
:::

[comment]: # (mx-context-auto)

## **Querying broadcasted transactions**

In order to fetch a previously-broadcasted transaction, use:

- [get transaction by hash](/sdk-and-tools/rest-api/transactions#get-transaction)

:::note
Fetching a _recently_ broadcasted transaction may not return the _hyperblock coordinates_ (hyperblock nonce and hyperblock hash) in the response. However, once the transaction is notarized on both shards (with acknowledgement from the metachain), the hyperblock coordinates will be set and present in the response.
:::

In order to inspect the **status** of a transaction, use:

- [get transaction **shallow status** by hash](/sdk-and-tools/rest-api/transactions#get-transaction-status)
- [get transaction **process status** by hash](/sdk-and-tools/rest-api/transactions#get-transaction-process-status)

For the difference between the _shallow status_ and the _process status_, see the next section.

[comment]: # (mx-context-auto)

## **Transaction Status**

### Shallow status

The **shallow status** of a transaction indicates whether a transaction has been **handled and executed** by the network.
However, the _shallow_ status does not provide information about the transaction's **processing outcome**, and does not capture processing errors.
That is, transactions processed with errors (e.g. _user error_ or _out of gas_) have the status `success` (somehow counterintuitively).

:::note
The _shallow_ status is, generally speaking, sufficient for integrators that are only interested into simple transfers (of EGLD or custom tokens).
:::

The **shallow status** of a transaction can be one of the following:
 - `success` - the transaction has been fully executed - with respect to the network's sharded architecture, it has been executed in both source and destination shards.
 - `invalid` - the transaction has been marked as invalid for execution at sender's side (e.g., not enough balance at sender's side, sending value to non-payable contracts etc.).
 - `pending` - the transaction has been accepted in the _mempool_ or accepted and partially executed (in the source shard).

### Process status

The **process status** of a transaction indicates whether a transaction has been processed successfully or not.

:::note
The _process_ status is, generally speaking, useful for integrators that are interested in smart contract interactions.
:::

:::note
Fetching the _process status_ of a transaction is less efficient than fetching the _shallow status_.
:::

The **process status** of a transaction can be one of the following:
 - `success` - the transaction has been fully executed - with respect to the network's sharded architecture, it has been executed in both source and destination shards.
 - `fail` - the transaction has been processed, but with errors (e.g., _user error_ or _out of gas_), or it has been marked as invalid (see _shallow_ status).
 - `pending` - the transaction has been accepted in the _mempool_ or accepted and partially executed (in the source shard).
 - `unknown` - the processing status cannot be precisely determined yet.

[comment]: # (mx-context-auto)

## **Querying hyperblocks and fully executed transactions**

In order to query executed transactions, please follow:

- [get hyperblock by nonce](/sdk-and-tools/rest-api/blocks#get-hyperblock-by-nonce)
- [get hyperblock by hash](/sdk-and-tools/rest-api/blocks#get-hyperblock-by-hash)

[comment]: # (mx-context-auto)

## **Querying finality information**

In order to fetch the nonce (the height) of **the latest final (hyper) block**, one would perform the following request against the on-premises Proxy instance:

```
curl http://myProxy:8079/network/status/4294967295
```

Above, `4294967295` is a special number - the ID of the Metachain.

From the response, one should be interested into the field `erd_highest_final_nonce`, which will point to the latest final hyperblock.

```
  "data": {
    "status": {
      "erd_highest_final_nonce": 54321
      ...
    }
  },
  ...
}

```
