---
id: sdk-js-cookbook-next
title: Cookbook (next)
---

[comment]: # (mx-abstract)

This page will guide you through the process of handling common tasks using **upcoming versions** of **sdk-js**.

:::important
This cookbook makes use of `sdk-js v13`. In order to migrate from `sdk-js v12.x` to `sdk-js v13`, please also follow [the migration guide](/sdk-and-tools/sdk-js/sdk-js-migration-guides).
:::

:::important
This page is a work in progress. Please check back later for more content.
:::

## Creating network providers

Creating an API provider:

```
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
```

Creating a Proxy provider:

```
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";

const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
```

Use the classes from `@multiversx/sdk-network-providers` **only as a starting point**. 
As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements 
(whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

On this topic, please see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

## Fetching network parameters

```
const networkConfig = await apiNetworkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

## Working with accounts

### Synchronizing an account object

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

```
import { Account } from "@multiversx/sdk-core";

const alice = new Account(addressOfAlice);
const aliceOnNetwork = await apiNetworkProvider.getAccount(addressOfAlice);
alice.update(aliceOnNetwork);

console.log("Nonce:", alice.nonce);
console.log("Balance:", alice.balance.toString());
```

### Managing the sender nonce locally

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
alice.incrementNonce();
console.log("Nonce:", alice.nonce);
```

:::note
Since `sdk-core v13`, the `Transaction` class exhibits its state as public read-write properties. For example, you can access and set the `nonce` property, instead of using `getNonce` and `setNonce`.
:::

If you are using `sdk-core v13` or later, use `tx.nonce = ` to apply the nonce to a transaction. 
For `sdk-core v12` or earlier, use the legacy `tx.setNonce()` to apply the nonce to a transaction.

```

notYetSignedTx.nonce = alice.getNonceThenIncrement();
```

For further reference, please see [nonce management](https://docs.multiversx.com/integrators/creating-transactions/#nonce-management).
## Broadcasting transactions

### Preparing a simple transaction

:::note
Since `sdk-core v13`, the `Transaction` class exhibits its state as public read-write properties. For example, you can access and set the `nonce` property, instead of using `getNonce` and `setNonce`.
:::

```
import { Transaction, TransactionPayload } from "@multiversx/sdk-core";

// Recommended approach: 

const tx = new Transaction({
    data: new TextEncoder().encode("food for cats"),
    gasLimit: 70000n,
    sender: addressOfAlice.toBech32(),
    receiver: addressOfBob.toBech32(),
    value: 1000000000000000000n,
    chainID: "D"
});

tx.nonce = 42n;

// Legacy approach: 

const txLegacy = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    value: "1000000000000000000",
    chainID: "D"
});

txLegacy.setNonce(43);
```

### Broadcast using a network provider

:::important
Note that the transactions **must be signed before being broadcasted**. 
On the front-end, signing can be achieved using a signing provider.
On this purpose, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

In order to broadcast a transaction, use a network provider:

```

const txHash = await apiNetworkProvider.sendTransaction(readyToBroadcastTx); 
console.log("TX hash:", txHash); 
```

### Wait for transaction completion

```
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(txHash);
```

If, instead, you use a `ProxyNetworkProvider` to instantiate the `TransactionWatcher`, you'll need to patch the `getTransaction` method,
so that it instructs the network provider to fetch the so-called _processing status_, as well (required by the watcher to detect transaction completion).

```
const watcherUsingProxy = new TransactionWatcher({
    getTransaction: async (hash) => { return await proxyNetworkProvider.getTransaction(hash, true) }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
```

In order to wait for multiple transactions:

```
await Promise.all([
    watcherUsingApi.awaitCompleted(tx1), 
    watcherUsingApi.awaitCompleted(tx2), 
    watcherUsingApi.awaitCompleted(tx3)
]);
```

For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).
## Token transfers

Generally speaking, in order to create transactions that transfer native tokens or ESDT tokens, one should use the `TransferTransactionsFactory` class.

::note
In `sdk-core v13`, the `TransferTransactionsFactory` class was extended with new methods, 
to be aligned with the [SDKs specs](https://github.com/multiversx/mx-sdk-specs/blob/main/core/transactions-factories/transfer_transactions_factory.md).
The old, legacy methods are still available (see below), thus existing client code isn't affected.
:::

:::note
In `sdk-core v13`, the `TokenTransfer` class has changed, in a non-breaking manner. 
Though, from now on, it should only be used for prepairing ESDT token transfers, not native EGLD transfers.

A `TokenTransfer` object can be instantiated using the legacy approaches, e.g. `fungibleFromAmount`, `nonFungible` (which are still available), 
or with the new approach (which, among others, makes abstraction of the number of decimals a token has).
:::

:::tip
For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
:::

First, let's create a `TransferTransactionsFactory`:

```
import { GasEstimator, Token, TokenComputer, TokenTransfer, TransactionsFactoryConfig, TransferTransactionsFactory } from "@multiversx/sdk-core";

// The new approach of creating a "TransferTransactionsFactory":
const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
const factory = new TransferTransactionsFactory({ config: factoryConfig, tokenComputer: new TokenComputer() });

// The legacy approach of creating a "TransferTransactionsFactory":
const legacyFactory = new TransferTransactionsFactory(new GasEstimator());
```

Now, we can use the factory to create transfer transactions.

### **EGLD** transfers (value movements)

```
const tx1 = factory.createTransactionForNativeTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    // 1 EGLD 
    nativeAmount: BigInt("1000000000000000000"),
});

tx1.nonce = 42n;
```

### Single ESDT transfer

```
// New approach: 
const tx2 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f", nonce: 0n }),
            amount: 10000n,
        })
    ],
});

tx2.nonce = 43n;

// Legacy approach: 
const tx2Legacy = legacyFactory.createESDTTransfer({
    tokenTransfer: TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2),
    nonce: 43,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D"
});

assert.deepEqual(tx2, tx2Legacy);
```

### Single NFT transfer

```
// New approach: 
const tx3 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n,
        })
    ],
});

tx3.nonce = 44n;

// Legacy approach: 
const tx3Legacy = legacyFactory.createESDTNFTTransfer({
    tokenTransfer: TokenTransfer.nonFungible("TEST-38f249", 1),
    nonce: 44,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});

assert.deepEqual(tx3, tx3Legacy);
```

### Single SFT transfer

```
// New approach: 
const tx4 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n,
        })
    ],
});

tx4.nonce = 45n;

// Legacy approach: 
const tx4Legacy = legacyFactory.createESDTNFTTransfer({
    tokenTransfer: TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5),
    nonce: 45,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});

assert.deepEqual(tx4, tx4Legacy);
```

### Multi ESDT / NFT transfer

```
// New approach: 
const tx5 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f", nonce: 0n }),
            amount: 10000n,
        }),
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n,
        }),
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n,
        })
    ],
});

tx5.nonce = 46n;

// Legacy approach: 
const tx5Legacy = legacyFactory.createMultiESDTNFTTransfer({
    tokenTransfers: [
        TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2),
        TokenTransfer.nonFungible("TEST-38f249", 1),
        TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5)
    ],
    nonce: 46,
    sender: addressOfAlice,
    destination: addressOfBob,
    gasLimit: 1712500,
    chainID: "D"
});

assert.deepEqual(tx5, tx5Legacy);
```
