---
id: querying-the-blockchain
title: Querying the Blockchain
---

## **Querying broadcasted transactions**

In order to query a transaction and inspect its status, please follow:

- [get transaction by hash](/docs/sdk-and-tools/rest-api/transactions#get-transaction)
- [get transaction status by hash](/docs/sdk-and-tools/rest-api/transactions#get-transaction-status)

Querying a _recently_ broadcasted transaction may not return the _hyperblock coordinates_ (hyperblock nonce and hyperblock hash) in the response. However, once the transaction is fully executed - according to the `status` field (whether with success or with failure), the hyperblock coordinates will be set and present in the response.

## **Transaction Status**

For **regular transfer transactions**, the transaction `status` has the following meaning:

| Status                                                | Meaning                                                                                                                                                   |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **success** or **executed**                           | The transaction has been fully executed - with respect to Elrond's sharded architecture, it has been executed in both source shard and destination shard. |
| **invalid**                                           | The transaction has been processed with failure (not enough balance at sender's side).                                                                    |
| **pending** or **received** or **partially-executed** | The transaction has been accepted in the _mempool_ or accepted and partially executed (in the source shard).                                              |
| **fail** or **not-executed**                          | Regular transfer transactions cannot reach this status.                                                                                                   |

:::warning
The statuses are (broadly speaking) directly fetched from the Observer Nodes themselves. The Node [v1.1.6](https://github.com/ElrondNetwork/elrond-go/releases/tag/v1.1.6) returns different statuses than previous versions. For example, the status **executed** has been renamed to **success**, while the statuses **received** and **partially-executed** have been merged under the status **pending**.

Currently, the HTTP API does not implement a versioning scheme (work is in progress on this matter) and thus does not yet provide a layer that abstracts away this renaming of statuses. Therefore **the API consumers** - in order to appropriately handle the data coming from both versions of the Node (prior to `v1.1.6` and after `v1.1.6`) - **are recommended to**:

✔ handle **success** and **executed** as synonyms

✔ handle **pending**, **received** and **partially-executed** as synonyms

✔ handle **fail** and **not-executed** as synonyms.
:::

For **smart contract transactions**, the transaction status has the following meaning:

| Status                                                | Meaning                                                                                                                                                                                                                                                                           |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **success** or **executed**                           | The smart contract transaction has been executed, **but not necessarily with** **success** - transactions executed with errors such as `user error` (raised by the contract) or `out of gas` also have this status - the erroneous scenarios will be handled in a future release. |
| **invalid**                                           | The transaction has been processed with failure at sender's side (e.g. not enough balance), but did not actually reach the Smart Contract for execution.                                                                                                                          |
| **pending** or **received** or **partially-executed** | The transaction has been accepted in the _mempool_ or accepted and partially executed (in the source shard).                                                                                                                                                                      |
| **fail**                                              | Not yet applicable. Reserved for future use - for transactions with `user error`.                                                                                                                                                                                                 |

:::important
Documentation in this sub-section (about smart contract transactions) is preliminary and subject to change.
:::

## **Querying hyperblocks and fully executed transactions**

In order to query executed transactions, please follow:

- [get hyperblock by nonce](/docs/sdk-and-tools/rest-api/blocks#get-hyperblock-by-nonce)
- [get hyperblock by hash](/docs/sdk-and-tools/rest-api/blocks#get-hyperblock-by-hash)

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
