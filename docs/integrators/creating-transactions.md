---
id: creating-transactions
title: Creating Transactions
---

[comment]: # (mx-abstract)

This page describes how to create, sign and broadcast transactions to the MultiversX Network.

[comment]: # (mx-context-auto)

## **Transaction structure**

As described in section [Signing Transactions](/developers/signing-transactions), a ready-to-broadcast transaction is structured as follows:

```json
{
  "nonce": 42,
  "value": "100000000000000000",
  "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
  "sender": "erd1ylzm22ngxl2tspgvwm0yth2myr6dx9avtx83zpxpu7rhxw4qltzs9tmjm9",
  "gasPrice": 1000000000,
  "gasLimit": 70000,
  "data": "Zm9vZCBmb3IgY2F0cw==",
  "chainID": "1",
  "version": 1,
  "signature": "5845301de8ca3a8576166fb3b7dd25124868ce54b07eec7022ae3ffd8d4629540dbb7d0ceed9455a259695e2665db614828728d0f9b0fb1cc46c07dd669d2f0e"
}
```

[comment]: # (mx-context-auto)

## **SDK and tools support for creating and signing transactions**

There are SDKs or tools with support for interacting with the MultiversX blockchain, so one can use one of the following SDKs to perform
transactions creation and signing:

- [sdk-js - JavaScript SDK](/sdk-and-tools/sdk-js)
- [sdk-py - Python SDK](/sdk-and-tools/sdk-py)
- [sdk-go - Golang SDK](/sdk-and-tools/sdk-go)
- [sdk-java - Java SDK](/sdk-and-tools/mxjava)
- [lightweight JS CLI](https://www.npmjs.com/package/@multiversx/sdk-wallet-cli)
- [lightweight HTTP utility](https://github.com/multiversx/mx-sdk-js-wallet-http)

[comment]: # (mx-context-auto)

## **General network parameters**

General network parameters, such as the **chain ID**, **the minimum gas price**, **the minimum gas limit** and the **oldest acceptable transaction version** are available at the API endpoint [Get Network Configuration](/sdk-and-tools/rest-api/network#get-network-configuration).

```json
{
    "config": {
        "erd_chain_id": "1",
        "erd_gas_per_data_byte": 1500,
        "erd_min_gas_limit": 50000,
        "erd_min_gas_price": 1000000000,
        "erd_min_transaction_version": 1,
        ...
    }
}
```

[comment]: # (mx-context-auto)

## **Nonce management**

Each transaction broadcasted to the Network must have the **nonce** field set consistently with the **account nonce**. In the Network, transactions of a given sender address are processed in order, with respect to the transaction nonce.

The account nonce can be fetched from the API: [Get Address Nonce](/sdk-and-tools/rest-api/addresses#get-address-nonce).

**The nonce must be a strictly increasing number, scoped to a given sender.** The sections below describe common issues and possible solutions when managing the nonce for transaction construction.

[comment]: # (mx-context-auto)

### **Issue: competing transactions**

Broadcasted transactions that reach the _mempool_ having the same sender address and the same nonce are _competing transactions_, and only one of them will be processed (the one providing a higher gas price or, if they have the same gas price, the one that arrived the second - but keep in mind that arrival time is less manageable).

:::tip
Avoid competing transactions by maintaining a strictly increasing nonce sequence when broadcasting transactions of the same sender address.
:::

Although an explicit _transaction cancellation trigger_ is not yet available in the Network, cancellation of a transaction T1 with nonce 42 could be _possible_ if one broadcasts a second transaction T2 with same nonce 42, with higher gas price (and without a value to transfer) **immediately** (e.g. 1 second) after broadcasting T1.

[comment]: # (mx-context-auto)

### **Issue: nonce gaps**

If broadcasted transactions have their nonces higher than the current account nonce of the sender, this is considered a _nonce gap_, and the transactions will remain in the mempool unprocessed, until new transactions from the same sender arrive _to resolve the nonce gap -_ or until the transactions are swept from the mempool (sweeping takes place regularly).

:::tip
**Avoid nonce gaps** by regularly fetching the current account nonce, in order to populate the nonce field correctly before broadcasting the transactions. This technique is also known as **periodically recalling the nonce**.
:::

[comment]: # (mx-context-auto)

### **Issue: too many transactions from the same account**

Starting with the [Sirius Mainnet Upgrade](https://github.com/multiversx/mx-specs/blob/main/releases/protocol/release-specs-v1.6.0-Sirius), the transaction pool allows a maximum of **100** transactions from the same sender to exist, at a given moment.

For example, if an address broadcasts `120` transactions with nonces from `1` to `120`, then the transactions with nonces `1 - 100` will be accepted for processing, while the remaining `20` transactions will be dropped.

The solution is to use chunks holding a **maximum of `100` transactions** and a place a generous **delay between sending the chunks**. Let's suppose an account has the nonce `1000` and it wants to send `120` transactions. It should send the first chunk, that is, the transactions with nonces `1000 - 1099`, wait until all of them are processed (the account nonce increments on each processed transaction), then send the second chunk, the transactions with nonces `1100 - 1019`.

[comment]: # (mx-context-auto)

### **Issue: fetching a stale account nonce**

You should take care when fetching the current account nonce from the API immediately after broadcasting transactions.

Example:

1. Time 12:00:01 - the sender's nonce is recalled, and its value is 42
2. Time 12:00:02 - the sender broadcasts the transaction T1 with nonce 42
3. Time 12:00:03 - the sender's nonce is recalled again, in order to broadcast a new transaction. **The nonce is still 42. It is stale, not yet incremented on the Network (since T1 is still pending or being processed at this very moment).**
4. Time 12:00:04 - the sender broadcasts T2 with nonce 42, which will compete with T1, as they have the same nonce.

:::tip
Avoid fetching stale account nonces by **periodically recalling the nonce.**

Avoid recalling the nonce in between **rapidly sequenced transactions from the same sender** . For rapidly sequenced transactions, you have to programmatically manage, keep track of the account nonce using a **local mirror (copy) of the account nonce** and increment it appropriately.
:::

[comment]: # (mx-context-auto)

### **Issue: sending large batches of transactions cause nonce gaps**

Whenever sending a large batch of transactions, even if the node/gateway returned transaction hashes for each transaction in the batch and no error, there is no strict guarantee that those transactions will end up being executed.
The reason is that the node will not immediately send each transaction or transaction batch but rather accumulate them in packages to be efficiently send through the p2p network.
At this moment, the node might decide to drop one or more packet because it detected a possible p2p flooding condition. This can happen independent of the transaction sender, the number of transactions sent and so on.

To handle this behavior, special care should be carried by the integrators. One possible way to handle this efficiently is to temporarily store all transactions that need to be sent on the network and continuously monitor the senders accounts involved if their nonces increased.
If not, a resend of the required transaction is needed, otherwise the transaction might be discarded from the temporary storage as it was executed.

We have implemented several components written in GO language that solve the transaction send issues along with the correct nonce management. 
The source code can be found [here](https://github.com/multiversx/mx-sdk-go/tree/main/interactors/nonceHandlerV2)
The main component is the `nonceTransactionsHandlerV2` that will create an address-nonce handler for each involved address. This address nonce handler will be specialized in the nonce and transactions sending mechanism for a single address and will be independent of the other addresses involved. 
The main component has a few exported functionalities:
- `ApplyNonceAndGasPrice` method that is able to apply the current handled nonce of the sender and the network's gas price on a provided transaction instance
- `SendTransaction` method that will forward the provided transaction towards the proxy but also stores it internally in case it will need to be resent.
- `DropTransactions` method that will clean all the stored transactions for a provided address.
- `Close` cleanup method for the component.

[comment]: # (mx-context-auto)

## **Gas limit computation**

Please follow [Gas and Fees](/developers/gas-and-fees/overview/).

[comment]: # (mx-context-auto)

## **Signing transactions**

Please follow [Signing Transactions](/developers/signing-transactions).

[comment]: # (mx-context-auto)

## **Simulate transaction execution**

:::important
Documentation about transaction simulation is preliminary and subject to change.
:::
