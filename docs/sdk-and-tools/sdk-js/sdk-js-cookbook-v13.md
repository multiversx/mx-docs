---
id: sdk-js-cookbook-v13
title: Cookbook (v13)
pagination_prev: sdk-and-tools/sdk-js/sdk-js
pagination_next: null
---

[comment]: # (mx-abstract)

This page will guide you through the process of handling common tasks using **sdk-js v13 (latest, stable version)**.

:::important
This cookbook makes use of `sdk-js v13`. In order to migrate from `sdk-js v12.x` to `sdk-js v13`, please also follow [the migration guide](https://github.com/multiversx/mx-sdk-js-core/issues/392).
:::

## Creating network providers

Creating an API provider:

```js
import { ApiNetworkProvider } from "@multiversx/sdk-core";

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com", { clientName: "multiversx-your-client-name" });
```

Creating a Proxy provider:

```js
import { ProxyNetworkProvider } from "@multiversx/sdk-core";

const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com", { clientName: "multiversx-your-client-name" });
```

Use the classes from `@multiversx/sdk-core/out/networkProviders` **only as a starting point**.
As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements
(whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

On this topic, please see [extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js).

## Fetching network parameters

```js
const networkConfig = await apiNetworkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

## Working with accounts

### Synchronizing an account object

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

```js
import { Account } from "@multiversx/sdk-core";

const alice = new Account(addressOfAlice);
const aliceOnNetwork = await apiNetworkProvider.getAccount(addressOfAlice);
alice.update(aliceOnNetwork);

console.log("Nonce:", alice.nonce);
console.log("Balance:", alice.balance.toString());
```

### Managing the sender nonce locally

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```js
alice.incrementNonce();
console.log("Nonce:", alice.nonce);
```

:::note
Since `sdk-core v13`, the [`Transaction`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/Transaction.html) class exhibits its state as public read-write properties. For example, you can access and set the `nonce` property, instead of using `getNonce` and `setNonce`.
:::

If you are using `sdk-core v13` or later, use `tx.nonce = ` to apply the nonce to a transaction.
For `sdk-core v12` or earlier, use the legacy `tx.setNonce()` to apply the nonce to a transaction.

```js
notYetSignedTx.nonce = alice.getNonceThenIncrement();
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

## Broadcasting transactions

### Preparing a simple transaction

:::note
Since `sdk-core v13`, the [`Transaction`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/Transaction.html) class exhibits its state as public read-write properties. For example, you can access and set the `nonce` property, instead of using `getNonce` and `setNonce`.
:::

```js
import { Transaction } from "@multiversx/sdk-core";

const tx = new Transaction({
    data: Buffer.from("food for cats"),
    gasLimit: 70000n,
    sender: addressOfAlice.toBech32(),
    receiver: addressOfBob.toBech32(),
    value: 1000000000000000000n,
    chainID: "D"
});

tx.nonce = 42n;
```

### Signing a transaction

:::important
Note that the transactions **must be signed before being broadcasted**.
On the front-end, signing can be achieved using a signing provider.
On this purpose, **we recommend using [sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
:::

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```js
import { TransactionComputer, UserSigner } from "@multiversx/sdk-core";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(tx);

tx.signature = await signer.sign(serializedTx);
```

### Broadcast using a network provider

In order to broadcast a transaction, use a network provider:

```js
const txHash = await apiNetworkProvider.sendTransaction(readyToBroadcastTx);
console.log("TX hash:", txHash);
```

### Wait for transaction completion

```js
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcherUsingApi = new TransactionWatcher(apiNetworkProvider);
const transactionOnNetworkUsingApi = await watcherUsingApi.awaitCompleted(txHash);
```

If, instead, you use a `ProxyNetworkProvider` to instantiate the [`TransactionWatcher`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionWatcher.html), you'll need to patch the `getTransaction` method,
so that it instructs the network provider to fetch the so-called _processing status_, as well (required by the watcher to detect transaction completion).

```js
const watcherUsingProxy = new TransactionWatcher({
    getTransaction: async (hash) => {
        return await proxyNetworkProvider.getTransaction(hash, true);
    }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
```

In order to wait for multiple transactions:

```js
await Promise.all([
    watcherUsingApi.awaitCompleted(txHash1),
    watcherUsingApi.awaitCompleted(txHash2),
    watcherUsingApi.awaitCompleted(txHash3)
]);
```

In some circumstances, when awaiting for a transaction completion in order to retrieve its logs and events,
it's possible that these pieces of information are missing at the very moment the transaction is marked as completed -
they may not be immediately available.

If that is an issue, you can configure the [`TransactionWatcher`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionWatcher.html) to have additional **patience**
before returning the transaction object. Below, we're adding a patience of 8 seconds:

```js
const watcherWithPatience = new TransactionWatcher(apiNetworkProvider, { patienceMilliseconds: 8000 });
```

Alternatively, use [`TransactionWatcher.awaitAnyEvent()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionWatcher.html#awaitAnyEvent) or [`TransactionWatcher.awaitOnCondition()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionWatcher.html#awaitOnCondition) to customize the waiting strategy.

For a different awaiting strategy, also see [extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js).

## Token transfers

Generally speaking, in order to create transactions that transfer native tokens or ESDT tokens, one should use the [`TransferTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransferTransactionsFactory.html) class.

:::note
In `sdk-core v13`, the [`TransferTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransferTransactionsFactory.html) class was extended with new methods,
to be aligned with the [SDKs specs](https://github.com/multiversx/mx-sdk-specs/blob/main/core/transactions-factories/transfer_transactions_factory.md).
The old, legacy methods are still available (see below), thus existing client code isn't affected.
:::

:::note
In `sdk-core v13`, the [`TokenTransfer`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenTransfer.html) class has changed, in a non-breaking manner.
Though, from now on, it should only be used for prepairing ESDT token transfers, not native EGLD transfers.

A [`TokenTransfer`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenTransfer.html) object can still be instantiated using the legacy methods, e.g. `fungibleFromAmount`, `nonFungible` (which are still available),
but we recommend using the new approach instead (which, among others, makes abstraction of the number of decimals a token has).
:::

:::tip
For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
:::

First, let's create a [`TransferTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransferTransactionsFactory.html):

```js
import { Token, TokenTransfer, TransactionsFactoryConfig, TransferTransactionsFactory } from "@multiversx/sdk-core";

// The new approach of creating a "TransferTransactionsFactory":
const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
const factory = new TransferTransactionsFactory({ config: factoryConfig });
```

Now, we can use the factory to create transfer transactions.

### **EGLD** transfers (value movements)

```js
const tx1 = factory.createTransactionForNativeTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    // 1 EGLD
    nativeAmount: BigInt("1000000000000000000")
});

tx1.nonce = 42n;
```

### Single ESDT transfer

```js
const tx2 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f" }),
            amount: 10000n
        })
    ]
});

tx2.nonce = 43n;
```

### Single NFT transfer

```js
const tx3 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n
        })
    ]
});

tx3.nonce = 44n;
```

### Single SFT transfer

```js
const tx4 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n
        })
    ]
});

tx4.nonce = 45n;
```

### Multi ESDT / NFT transfer

```js
const tx5 = factory.createTransactionForESDTTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "TEST-8b028f" }),
            amount: 10000n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "TEST-38f249", nonce: 1n }),
            amount: 1n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "SEMI-9efd0f", nonce: 1n }),
            amount: 5n
        })
    ]
});

tx5.nonce = 46n;
```

## Formatting and parsing amounts

:::note
For formatting or parsing token amounts as numbers (with fixed number of decimals), please do not rely on `sdk-core`. Instead, use `sdk-dapp` (higher level) or `bignumber.js` (lower level).
:::

You can format amounts using `formatAmount` from `sdk-dapp`:

```js
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Format using sdk-dapp:", formatAmount({
    input: "1500000000000000000",
    decimals: 18,
    digits: 4
}));
```

Or directly using `bignumber.js`:

```js
import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

console.log("Format using bignumber.js:", new BigNumber("1500000000000000000").shiftedBy(-18).toFixed(4));
```

You can parse amounts using `parseAmount` from `sdk-dapp`:

```js
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Parse using sdk-dapp:", parseAmount("1.5", 18));
```

Or directly using `bignumber.js`:

```js
console.log("Parse using bignumber.js:", new BigNumber("1.5").shiftedBy(18).decimalPlaces(0).toFixed(0));
```

## Contract ABIs

A contract's ABI describes the endpoints, data structure and events that a contract exposes.
While contract interactions are possible without the ABI, they are easier to implement when the definitions are available.

### Load the ABI from a file

```js
import { AbiRegistry } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abi = AbiRegistry.create(abiObj);
```

### Load the ABI from an URL

```js
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abi = AbiRegistry.create(response.data);
```

### Manually construct the ABI

If an ABI file isn't directly available, but you do have knowledge of the contract's endpoints and types, you can manually construct the ABI. Let's see a simple example:

```js
abi = AbiRegistry.create({
    "endpoints": [{
        "name": "add",
        "inputs": [],
        "outputs": []
    }]
});
```

An endpoint with both inputs and outputs:

```js
abi = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foo",
            "inputs": [
                { "type": "BigUint" },
                { "type": "u32" },
                { "type": "Address" }
            ],
            "outputs": [
                { "type": "u32" }
            ]
        },
        {
            "name": "bar",
            "inputs": [
                { "type": "counted-variadic<utf-8 string>" },
                { "type": "variadic<u64>" }
            ],
            "outputs": []
        }
    ]
});
```

## Contract deployments

### Load the bytecode from a file

```js
import { Code } from "@multiversx/sdk-core";

const codeBuffer = await promises.readFile("../contracts/adder.wasm");
const code = Code.fromBuffer(codeBuffer);
```

### Perform a contract deployment

In `sdk-core v13`, the recommended way to create transactions for deploying
(and, for that matter, upgrading and interacting with)
smart contracts is through a [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html).

The older (legacy) approach, using the method [`SmartContract.deploy()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContract.html#deploy), is still available, however.
At some point in the future, [`SmartContract.deploy()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContract.html#deploy) will be deprecated and removed.

Now, let's create a [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html):

```js
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
```

If the contract ABI is available, provide it to the factory:

```js
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
```

Now, prepare the deploy transaction:

```js
import { U32Value } from "@multiversx/sdk-core";

// For deploy arguments, use "TypedValue" objects if you haven't provided an ABI to the factory:
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory:
args = [42];

const deployTransaction = factory.createTransactionForDeploy({
    sender: addressOfAlice,
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    arguments: args
});
```

:::tip
When creating transactions using [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html), even if the ABI is available and provided,
you can still use [`TypedValue`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TypedValue.html) objects as arguments for deployments and interactions.

Even further, you can use a mix of [`TypedValue`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TypedValue.html) objects and plain JavaScript values and objects. For example:

```js
let args = [new U32Value(42), "hello", { foo: "bar" }, new TokenIdentifierValue("TEST-abcdef")];
```

:::

Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

```js
deployTransaction.nonce = deployer.getNonceThenIncrement();
```

Now, **sign the transaction** using a wallet / signing provider of your choice.

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```js
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(deployTransaction);

deployTransaction.signature = await signer.sign(serializedTx);
```

Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

```js
const txHash = await apiNetworkProvider.sendTransaction(deployTransaction);
const transactionOnNetwork = await new TransactionWatcher(apiNetworkProvider).awaitCompleted(txHash);
```

### Computing the contract address

Even before broadcasting,
at the moment you know the _sender_ address and the _nonce_ for your deployment transaction, you can (deterministically) compute the (upcoming) address of the contract:

```js
import { AddressComputer } from "@multiversx/sdk-core";

const addressComputer = new AddressComputer();
const contractAddress = addressComputer.computeContractAddress(
    Address.fromBech32(deployTransaction.sender),
    deployTransaction.nonce
);

console.log("Contract address:", contractAddress.bech32());
```

### Parsing transaction outcome

In the end, you can parse the results using a [`SmartContractTransactionsOutcomeParser`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsOutcomeParser.html).
However, since the `parseDeploy` method requires a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html) object as input,
we need to first convert our `TransactionOnNetwork` object to a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html), by means of a [`TransactionsConverter`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionsConverter.html).

```js
import { SmartContractTransactionsOutcomeParser, TransactionsConverter } from "@multiversx/sdk-core";

const converter = new TransactionsConverter();
const parser = new SmartContractTransactionsOutcomeParser();

const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
const parsedOutcome = parser.parseDeploy({ transactionOutcome });

console.log(parsedOutcome);
```

## Contract interactions

In `sdk-core v13`, the recommended way to create transactions for calling
(and, for that matter, deploying and upgrading)
smart contracts is through a [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html).

The older (legacy) approaches, using `SmartContract.call()`, `SmartContract.methods.myFunction()`, `SmartContract.methodsExplicit.myFunction()` and
`new Interaction(contract, "myFunction", args)` are still available.
However, at some point in the (more distant) future, they will be deprecated and removed.

Now, let's create a [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html):

```js
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
```

If the contract ABI is available, provide it to the factory:

```js
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
```

### Regular interactions

Now, let's prepare a contract transaction, to call the `add` function of our
previously deployed smart contract:

```js
import { U32Value } from "@multiversx/sdk-core";

// For arguments, use "TypedValue" objects if you haven't provided an ABI to the factory:
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory:
args = [42];

const transaction = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args
});
```

:::tip
When creating transactions using [`SmartContractTransactionsFactory`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsFactory.html), even if the ABI is available and provided,
you can still use [`TypedValue`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TypedValue.html) objects as arguments for deployments and interactions.

Even further, you can use a mix of [`TypedValue`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TypedValue.html) objects and plain JavaScript values and objects. For example:

```js
let args = [new U32Value(42), "hello", { foo: "bar" }, new TokenIdentifierValue("TEST-abcdef")];
```

:::

Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

```js
transaction.nonce = alice.getNonceThenIncrement();
```

Now, **sign the transaction** using a wallet / signing provider of your choice.

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```js
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(transaction);

transaction.signature = await signer.sign(serializedTx);
```

Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

```js
const txHash = await apiNetworkProvider.sendTransaction(transaction);
const transactionOnNetwork = await new TransactionWatcher(apiNetworkProvider).awaitCompleted(txHash);
```

### Transfer & execute

At times, you may want to send some tokens (native EGLD or ESDT) along with the contract call.

For transfer & execute with native EGLD, prepare your transaction as follows:

```js
const transactionWithNativeTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    nativeTransferAmount: 1000000000000000000n
});
```

Above, we're sending 1 EGLD along with the contract call.

For transfer & execute with ESDT tokens, prepare your transaction as follows:

```js
const transactionWithTokenTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "UTK-14d57d" }),
            amount: 42000000000000000000n
        })
    ]
});
```

Or, for transferring multiple tokens (NFTs included):

```js
const transactionWithMultipleTokenTransfers = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    function: "add",
    gasLimit: 5000000,
    arguments: args,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "UTK-14d57d" }),
            amount: 42000000000000000000n
        }),
        new TokenTransfer({
            token: new Token({ identifier: "EXAMPLE-453bec", nonce: 3n }),
            amount: 1n
        })
    ]
});
```

Above, we've prepared the [`TokenTransfer`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TokenTransfer.html) objects as seen in the section [token transfers](#token-transfers).

### Parsing transaction outcome

Once a transaction is completed, you can parse the results using a [`SmartContractTransactionsOutcomeParser`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsOutcomeParser.html).
However, since the `parseExecute` method requires a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html) object as input,
we need to first convert our `TransactionOnNetwork` object to a `TransactionOutcome`, by means of a [`TransactionsConverter`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionsConverter.html).

```js
import { SmartContractTransactionsOutcomeParser, TransactionsConverter } from "@multiversx/sdk-core";

const converter = new TransactionsConverter();
const parser = new SmartContractTransactionsOutcomeParser({
    abi: abi
});

const transactionOutcome = converter.transactionOnNetworkToOutcome(transactionOnNetwork);
const parsedOutcome = parser.parseExecute({ transactionOutcome });

console.log(parsedOutcome);
```

### Decode transaction events

Additionally, you might be interested into decoding the events emitted by a contract.
You can do so by means of the [`TransactionEventsParser`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionEventsParser.html).

Suppose we'd like to decode a `startPerformAction` event emitted by the [**multisig**](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract.

Let's fetch [a previously-processed transaction](https://devnet-explorer.multiversx.com/transactions/05d445cdd145ecb20374844dcc67f0b1e370b9aa28a47492402bc1a150c2bab4),
to serve as an example, and convert it to a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html) (see above why):

```js
const transactionOnNetworkMultisig = await apiNetworkProvider.getTransaction("05d445cdd145ecb20374844dcc67f0b1e370b9aa28a47492402bc1a150c2bab4");
const transactionOutcomeMultisig = converter.transactionOnNetworkToOutcome(transactionOnNetworkMultisig);
```

Now, let's find and parse the event we are interested in:

```js
import { TransactionEventsParser, findEventsByFirstTopic } from "@multiversx/sdk-core";

const abiJsonMultisig = await promises.readFile("../contracts/multisig-full.abi.json", { encoding: "utf8" });
const abiMultisig = AbiRegistry.create(JSON.parse(abiJsonMultisig));

const eventsParser = new TransactionEventsParser({
    abi: abiMultisig
});

const [event] = findEventsByFirstTopic(transactionOutcomeMultisig, "startPerformAction");
const parsedEvent = eventsParser.parseEvent({ event });

console.log(parsedEvent);
```

## Contract queries

In order to perform Smart Contract queries, we recommend the use of [`SmartContractQueriesController`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractQueriesController.html).
The legacy approaches that rely on [`SmartContract.createQuery()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContract.html#createQuery) or [`Interaction.buildQuery()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/Interaction.html#buildQuery) are still available, but they will be deprecated in the (distant) future.

You will notice that the [`SmartContractQueriesController`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractQueriesController.html) requires a `QueryRunner` object at initialization.
A `NetworkProvider`, slighly adapted, is used to satisfy this requirement.

```js
import { QueryRunnerAdapter, SmartContractQueriesController } from "@multiversx/sdk-core";

const queryRunner = new QueryRunnerAdapter({
    networkProvider: apiNetworkProvider
});

let controller = new SmartContractQueriesController({
    queryRunner: queryRunner
});
```

If the contract ABI is available, provide it to the controller:

```js
controller = new SmartContractQueriesController({
    queryRunner: queryRunner,
    abi: abi
});
```

Let's create a query object:

```js
const query = controller.createQuery({
    contract: "erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60",
    function: "getSum",
    arguments: [],
});
```

Then, run the query against the network. You will get a [`SmartContractQueryResponse`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractQueryResponse.html) object.

```js
const response = await controller.runQuery(query);
```

:::tip
The invocation of `controller.runQuery()` ultimately calls the VM query endpoints of the MultiversX REST API.
:::

The response object contains the raw output of the query, which can be parsed as follows:

```js
const [sum] = controller.parseQueryResponse(response);
console.log(sum);
```

## Explicit decoding / encoding of values

When needed, you can use the [`BinaryCodec`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/BinaryCodec.html) to [decode and encode values](/developers/data/serialization-overview/) manually,
leveraging contract ABIs:

```js
const abiJsonExample = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiExample = AbiRegistry.create(JSON.parse(abiJsonExample));

const abiJsonMultisig = await promises.readFile("../contracts/multisig-full.abi.json", { encoding: "utf8" });
const abiMultisig = AbiRegistry.create(JSON.parse(abiJsonMultisig));
```

:::note
The ABI files used within this cookbook are available [here](https://github.com/multiversx/mx-sdk-js-examples).
:::

### Decoding a custom type

Example of decoding a custom type (a structure) called `DepositEvent` from binary data:

```js
import { BinaryCodec } from "@multiversx/sdk-core";

const depositCustomType = abiExample.getCustomType("DepositEvent");
const codec = new BinaryCodec();
let data = Buffer.from("00000000000003db000000", "hex");
let decoded = codec.decodeTopLevel(data, depositCustomType);
let decodedValue = decoded.valueOf();

console.log(JSON.stringify(decodedValue, null, 4));
```

Example of decoding a custom type (a structure) called `Reward` from binary data:

```js
const rewardStructType = abiExample.getStruct("Reward");
data = Buffer.from("010000000445474c440000000201f400000000000003e80000000000000000", "hex");

[decoded] = codec.decodeNested(data, rewardStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
```

Example of decoding a custom type (an enum) called `Action` (of [**multisig**](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract) from binary data:

```js
const actionStructType = abiMultisig.getEnum("Action");
data = Buffer.from("0500000000000000000500d006f73c4221216fa679bc559005584c4f1160e569e1000000012a0000000003616464000000010000000107", "hex");

[decoded] = codec.decodeNested(data, actionStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
```

### Encoding a custom type

Example of encoding a custom type (a struct) called `EsdtTokenPayment` (of [**multisig**](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract) into binary data:

```js
import { BigUIntValue, Field, Struct, TokenIdentifierValue, U64Value } from "@multiversx/sdk-core";

const paymentType = abiMultisig.getStruct("EsdtTokenPayment");

const paymentStruct = new Struct(paymentType, [
    new Field(new TokenIdentifierValue("TEST-8b028f"), "token_identifier"),
    new Field(new U64Value(0n), "token_nonce"),
    new Field(new BigUIntValue(10000n), "amount")
]);

const encoded = codec.encodeNested(paymentStruct);

console.log(encoded.toString("hex"));
```

## Signing objects and verifying signatures

:::note
Skip this section if you're building a **dApp**.
This section is destined for developers of **wallet-like applications** or backend (server-side) components that are concerned with signing transactions and messages.

For **dApps**, use the available **[signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)** instead.
Note that we recommend using **[sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
:::

:::note
You might also be interested into the language-agnostic overview on [signing transactions](/developers/signing-transactions).
:::

### Signing objects

Creating a `UserSigner` from a JSON wallet:

```js
import { UserSigner } from "@multiversx/sdk-core";
import { promises } from "fs";

const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
let signer = UserSigner.fromWallet(walletObject, "password");
```

Creating a `UserSigner` from a PEM file:

```js
const pemText = await promises.readFile("../testwallets/alice.pem", { encoding: "utf8" });
signer = UserSigner.fromPem(pemText);
```

Signing a transaction, as we've seen [before](#signing-a-transaction):

```js
import { Transaction, TransactionComputer } from "@multiversx/sdk-core";

const transaction = new Transaction({
    nonce: 91,
    sender: "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    value: 1000000000000000000n,
    gasLimit: 50000n,
    chainID: "D"
});

const transactionComputer = new TransactionComputer()
let serializedTransaction = transactionComputer.computeBytesForSigning(transaction);
transaction.signature = await signer.sign(serializedTransaction);

console.log("Signature", Buffer.from(transaction.signature).toString("hex"));
```

Signing an arbitrary message:

```js
import { Message, MessageComputer } from "@multiversx/sdk-core";

let message = new Message({
    data: Buffer.from("hello")
});

const messageComputer = new MessageComputer();
let serializedMessage = messageComputer.computeBytesForSigning(message);
message.signature = await signer.sign(serializedMessage);

console.log("Signature", Buffer.from(message.signature).toString("hex"));
```

### Verifying signatures

Creating a `UserVerifier`:

```js
import { UserVerifier } from "@multiversx/sdk-core";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
```

Verifying a signature:

```js
serializedTransaction = transactionComputer.computeBytesForVerifying(transaction);
serializedMessage = messageComputer.computeBytesForVerifying(message);

console.log("Is signature of Alice?", aliceVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, message.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTransaction, transaction.signature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, message.signature));
```

### Handling messages over boundaries

Generally speaking, signed [`Message`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/Message.html) objects are meant to be sent to a remote party (e.g. a service), which can then verify the signature.

In order to prepare a message for transmission, you can use the [`MessageComputer.packMessage()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/MessageComputer.html#packMessage) utility method:

```js
const packedMessage = messageComputer.packMessage(message);

console.log("Packed message", packedMessage);
```

Then, on the receiving side, you can use [`MessageComputer.unpackMessage()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/MessageComputer.html#unpackMessage) to reconstruct the message, prior verification:

```js
const unpackedMessage = messageComputer.unpackMessage(packedMessage);
const serializedUnpackedMessage = messageComputer.computeBytesForVerifying(unpackedMessage);

console.log("Unpacked message", unpackedMessage);
console.log("Is signature of Alice?", aliceVerifier.verify(serializedUnpackedMessage, message.signature));
```

### Signing hashes of objects

Under the hood, [`MessageComputer.computeBytesForSigning()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/MessageComputer.html#computeBytesForSigning) does not compute a plain serialization of the message.
Instead, it first decorates the message (with a special prefix, plus the message length), and computes a **`keccak256` hash** of this decorated variant.
Ultimately, the signature is computed over the hash.

However, for transactions, **by default**, the Network expects the signature to be computed over [the plain serialization](/developers/signing-transactions/#serialization-for-signing) of the transaction.
The function [`TransactionComputer.computeBytesForSigning()`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionComputer.html#computeBytesForSigning) adheres to this default policy.

The behavior can be overridden by setting the _sign using hash_ flag of `transaction.options`:

```js
transactionComputer.applyOptionsForHashSigning(transaction);
```

Then, the transaction should be serialzed and signed as follows:

```js
const bytesToSign = transactionComputer.computeHashForSigning(transaction);
transaction.signature = await signer.sign(bytesToSign);
```

:::note
If you'd like to learn more about hash signing, please refer to the overview on [signing transactions](/developers/signing-transactions).
:::
