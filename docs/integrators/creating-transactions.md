---
id: creating-transactions
title: Creating Transactions
---

## **Transaction structure**

As described in section [Signing Transactions](/developers/signing-transactions/signing-transactions), a ready-to-broadcast transaction is structured as follows:

```
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

## **SDK and tools support for creating and signing transactions**

There are SDKs or tools with support for interacting with the MultiversX blockchain, so one can use one of the following SDKs to perform
transactions creation and signing:

- [erdjs - JavaScript SDK](/sdk-and-tools/erdjs)
- [erdpy - Python SDK](/sdk-and-tools/erdpy/erdpy)
- [erdgo - Golang SDK](/sdk-and-tools/erdgo)
- [erdjava - Java SDK](/sdk-and-tools/erdjava)
- [lightweight JS CLI](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli)
- [lightweight HTTP utility](https://github.com/ElrondNetwork/erdwalletjs-http)

## **General network parameters**

General network parameters, such as the **chain ID**, **the minimum gas price**, **the minimum gas limit** and the **oldest acceptable transaction version** are available at the API endpoint [Get Network Configuration](/sdk-and-tools/rest-api/network#get-network-configuration).

```
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

## **Nonce management**

Each transaction broadcasted to the Network must have the **nonce** field set consistently with the **account nonce**. In the Network, transactions of a given sender address are processed in order, with respect to the transaction nonce.

The account nonce can be fetched from the API: [Get Address Nonce](/sdk-and-tools/rest-api/addresses#span-classbadge-badge-primarygetspan-get-address-nonce).

**The nonce must be a strictly increasing number, scoped to a given sender.** The sections below describe common issues and possible solutions when managing the nonce for transaction construction.

### **Issue: competing transactions**

Broadcasted transactions that reach the _mempool_ having the same sender address and the same nonce are _competing transactions_, and only one of them will be processed (the one providing a higher gas price or, if they have the same gas price, the one that arrived the second - but keep in mind that arrival time is less manageable).

:::tip
Avoid competing transactions by maintaining a strictly increasing nonce sequence when broadcasting transactions of the same sender address.
:::

Although an explicit _transaction cancellation trigger_ is not yet available in the Network, cancellation of a transaction T1 with nonce 42 could be _possible_ if one broadcasts a second transaction T2 with same nonce 42, with higher gas price (and without a value to transfer) **immediately** (e.g. 1 second) after broadcasting T1.

### **Issue: nonce gaps**

If broadcasted transactions have their nonces higher than the current account nonce of the sender, this is considered a _nonce gap_, and the transactions will remain in the mempool unprocessed, until new transactions from the same sender arrive _to resolve the nonce gap -_ or until the transactions are swept from the mempool (sweeping takes place regularly).

:::tip
Avoid nonce gaps by regularly fetching the current account nonce, in order to populate the nonce field correctly before broadcasting the transactions. This technique is also known as **periodically recalling the nonce**.
:::

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

## **Gas limit computation**

Please follow [Gas and Fees](/developers/gas-and-fees/overview/).

## **Signing transactions**

Please follow [Signing Transactions](/developers/signing-transactions/signing-transactions).

## **Simulate transaction execution**

:::important
Documentation about transaction simulation is preliminary and subject to change.
:::
