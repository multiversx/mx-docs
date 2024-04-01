---
id: sdk-js-cookbook-v13
title: Cookbook (v13)
pagination_next: null
pagination_prev: sdk-and-tools/sdk-js/sdk-js-cookbook-versions
---

[comment]: # (mx-abstract)

This page will guide you through the process of handling common tasks using **upcoming versions** of **sdk-js**.

:::important
This cookbook makes use of `sdk-js v13`. In order to migrate from `sdk-js v12.x` to `sdk-js v13`, please also follow [the migration guide](https://github.com/multiversx/mx-sdk-js-core/issues/392).
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
On this purpose, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```
import { TransactionComputer } from "@multiversx/sdk-core";
import { UserSigner } from "@multiversx/sdk-wallet";
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
    getTransaction: async (hash) => {
        return await proxyNetworkProvider.getTransaction(hash, true);
    }
});

const transactionOnNetworkUsingProxy = await watcherUsingProxy.awaitCompleted(txHash);
```

In order to wait for multiple transactions:

```
await Promise.all([
    watcherUsingApi.awaitCompleted(txHash1),
    watcherUsingApi.awaitCompleted(txHash2),
    watcherUsingApi.awaitCompleted(txHash3)
]);
```

For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

## Token transfers

Generally speaking, in order to create transactions that transfer native tokens or ESDT tokens, one should use the `TransferTransactionsFactory` class.

:::note
In `sdk-core v13`, the `TransferTransactionsFactory` class was extended with new methods,
to be aligned with the [SDKs specs](https://github.com/multiversx/mx-sdk-specs/blob/main/core/transactions-factories/transfer_transactions_factory.md).
The old, legacy methods are still available (see below), thus existing client code isn't affected.
:::

:::note
In `sdk-core v13`, the `TokenTransfer` class has changed, in a non-breaking manner.
Though, from now on, it should only be used for prepairing ESDT token transfers, not native EGLD transfers.

A `TokenTransfer` object can still be instantiated using the legacy methods, e.g. `fungibleFromAmount`, `nonFungible` (which are still available),
but we recommend using the new approach instead (which, among others, makes abstraction of the number of decimals a token has).
:::

:::tip
For formatting or parsing token amounts, see [formatting and parsing amounts](#formatting-and-parsing-amounts).
:::

First, let's create a `TransferTransactionsFactory`:

```
import { Token, TokenTransfer, TransactionsFactoryConfig, TransferTransactionsFactory } from "@multiversx/sdk-core";

// The new approach of creating a "TransferTransactionsFactory":
const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });
const factory = new TransferTransactionsFactory({ config: factoryConfig });
```

Now, we can use the factory to create transfer transactions.

### **EGLD** transfers (value movements)

```
const tx1 = factory.createTransactionForNativeTokenTransfer({
    sender: addressOfAlice,
    receiver: addressOfBob,
    // 1 EGLD
    nativeAmount: BigInt("1000000000000000000")
});

tx1.nonce = 42n;
```

### Single ESDT transfer

```
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

```
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

```
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

```
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

```
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Format using sdk-dapp:", formatAmount({
    input: "1500000000000000000",
    decimals: 18,
    digits: 4
}));
```

Or directly using `bignumber.js`:

```
import BigNumber from "bignumber.js";

BigNumber.config({ ROUNDING_MODE: BigNumber.ROUND_FLOOR });

console.log("Format using bignumber.js:",new BigNumber("1500000000000000000").shiftedBy(-18).toFixed(4));
```

You can parse amounts using `parseAmount` from `sdk-dapp`:

```
import { formatAmount } from '@multiversx/sdk-dapp/utils/operations';

console.log("Parse using sdk-dapp:", parseAmount("1.5", 18));
```

Or directly using `bignumber.js`:

```
console.log("Parse using bignumber.js:", new BigNumber("1.5").shiftedBy(18).decimalPlaces(0).toFixed(0));
```

## Contract ABIs

A contract's ABI describes the endpoints, data structure and events that a contract exposes.
While contract interactions are possible without the ABI, they are easier to implement when the definitions are available.

### Load the ABI from a file

```
import { AbiRegistry } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/adder.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abi = AbiRegistry.create(abiObj);
```

### Load the ABI from an URL

```
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abi = AbiRegistry.create(response.data);
```

## Contract deployments

### Load the bytecode from a file

```
import { Code } from "@multiversx/sdk-core";

const codeBuffer = await promises.readFile("../contracts/adder.wasm");
const code = Code.fromBuffer(codeBuffer);
```

### Perform a contract deployment

In `sdk-core v13`, the recommended way to create transactions for deploying
(and, for that matter, upgrading and interacting with)
smart contracts is through a `SmartContractTransactionsFactory`.

The older (legacy) approach, using the method `SmartContract.deploy()`, is still available, however.
At some point in the future, `SmartContract.deploy()` will be deprecated and removed.

Now, let's create a `SmartContractTransactionsFactory`:

```
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
```

If the contract ABI is available, provide it to the factory:

```
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
```

Now, prepare the deploy transaction:

```
import { U32Value } from "@multiversx/sdk-core";

// For deploy arguments, use `TypedValue` objects if you haven't provided an ABI to the factory:
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory:
args = [42];

const deployTransaction = factory.createTransactionForDeploy({
    sender: addressOfAlice,
    bytecode: code.valueOf(),
    gasLimit: 6000000n,
    args: args
});
```

:::tip
When creating transactions using `SmartContractTransactionsFactory`, even if the ABI is available and provided,
you can still use `TypedValue` objects as arguments for deployments and interactions.

Even further, you can use a mix of `TypedValue` objects and plain JavaScript values and objects. For example:

```
let args = [new U32Value(42), "hello", { foo: "bar" }, new TokenIdentifierValue("TEST-abcdef")];
```

:::

Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

```
const deployer = new Account(addressOfAlice);
const deployerOnNetwork = await networkProvider.getAccount(addressOfAlice);
deployer.update(deployerOnNetwork);

deployTransaction.nonce = deployer.getNonceThenIncrement();
```

Now, **sign the transaction** using a wallet / signing provider of your choice.

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(deployTransaction);

deployTransaction.signature = await signer.sign(serializedTx);
```

Once you know the sender address and nonce for your deployment transaction, you can (deterministically) compute the (upcoming) address of the contract:

```
import { AddressComputer } from "@multiversx/sdk-core";

const addressComputer = new AddressComputer();
const contractAddress = addressComputer.computeContractAddress(
    Address.fromBech32(deployTransaction.sender),
    deployTransaction.nonce
);

console.log("Contract address:", contractAddress.bech32());
```

Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

```
const txHash = await networkProvider.sendTransaction(deployTransaction);
const transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(txHash);
```

In the end, you can parse the results using a [`SmartContractTransactionsOutcomeParser`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/SmartContractTransactionsOutcomeParser.html).
However, since the `parseDeploy` method requires a [`TransactionOutcome`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionOutcome.html) object as input,
we need to first convert our `TransactionOnNetwork` object to a `TransactionOutcome`, by means of a [`TransactionsConverter`](https://multiversx.github.io/mx-sdk-js-core/v13/classes/TransactionsConverter.html).

:::important
Generally speaking, the components of `sdk-core` and `sdk-network-providers` have different concerns.
The former aims to be agnostic to network providers, while the latter is designed to cover specifics of [the available REST APIs](https://docs.multiversx.com/sdk-and-tools/rest-api).

This being said, a certain impedance mismatch is expected between the two packages. This is resolved by means of specially crafted _converters_ and _adapters_.
Currently, for the JavaScript / TypeScript SDKs, the _converters_ and _adapters_ are residents of the `sdk-core` package.
However, this might change in the future - see the [sdk-specs](https://github.com/multiversx/mx-sdk-specs).
:::

```
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
smart contracts is through a `SmartContractTransactionsFactory`.

The older (legacy) approaches, using `SmartContract.call()`, `SmartContract.methods.myFunction()`, `SmartContract.methodsExplicit.myFunction()` and
`new Interaction(contract, "myFunction", args)` are still available.
However, at some point in the (more distant) future, they will be deprecated and removed.

Now, let's create a `SmartContractTransactionsFactory`:

```
import { SmartContractTransactionsFactory, TransactionsFactoryConfig } from "@multiversx/sdk-core";

const factoryConfig = new TransactionsFactoryConfig({ chainID: "D" });

let factory = new SmartContractTransactionsFactory({
    config: factoryConfig
});
```

If the contract ABI is available, provide it to the factory:

```
factory = new SmartContractTransactionsFactory({
    config: factoryConfig,
    abi: abi
});
```

### Regular interactions

Now, let's prepare a contract transaction, to call the `add` function of our
previously deployed smart contract:

```
import { U32Value } from "@multiversx/sdk-core";

// For arguments, use `TypedValue` objects if you haven't provided an ABI to the factory:
let args = [new U32Value(42)];
// Or use simple, plain JavaScript values and objects if you have provided an ABI to the factory:
args = [42];

const transaction = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "add",
    gasLimit: 5000000,
    args: args
});
```

:::tip
When creating transactions using `SmartContractTransactionsFactory`, even if the ABI is available and provided,
you can still use `TypedValue` objects as arguments for deployments and interactions.

Even further, you can use a mix of `TypedValue` objects and plain JavaScript values and objects. For example:

```
let args = [new U32Value(42), "hello", { foo: "bar" }, new TokenIdentifierValue("TEST-abcdef")];
```

:::

Then, as [previously seen](#working-with-accounts), set the transaction nonce (the account nonce must be synchronized beforehand).

```
const caller = new Account(addressOfAlice);
const callerOnNetwork = await networkProvider.getAccount(addressOfAlice);
caller.update(callerOnNetwork);

transaction.nonce = caller.getNonceThenIncrement();
```

Now, **sign the transaction** using a wallet / signing provider of your choice.

:::important
For the sake of simplicity, in this section we'll use a `UserSigner` object to sign the transaction.
In real-world dApps, transactions are signed by end-users using their wallet, through a [signing provider](https://docs.multiversx.com/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

```
const fileContent = await promises.readFile("../testwallets/alice.json", { encoding: "utf8" });
const walletObject = JSON.parse(fileContent);
const signer = UserSigner.fromWallet(walletObject, "password");

const computer = new TransactionComputer();
const serializedTx = computer.computeBytesForSigning(transaction);

transaction.signature = await signer.sign(serializedTx);
```

Then, broadcast the transaction and await its completion, as seen in the section [broadcasting transactions](#broadcasting-transactions):

```
const txHash = await networkProvider.sendTransaction(transaction);
const transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(txHash);
```

### Transfer & execute

At times, you may want to send some tokens (native EGLD or ESDT) along with the contract call.

For transfer & execute with native EGLD, prepare your transaction as follows:

```
const transactionWithNativeTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "add",
    gasLimit: 5000000,
    args: args,
    nativeTransferAmount: 1000000000000000000n
});
```

Above, we're sending 1 EGLD along with the contract call.

For transfer & execute with ESDT tokens, prepare your transaction as follows:

```
const transactionWithTokenTransfer = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "add",
    gasLimit: 5000000,
    args: args,
    tokenTransfers: [
        new TokenTransfer({
            token: new Token({ identifier: "UTK-14d57d" }),
            amount: 42000000000000000000n
        })
    ]
});
```

Or, for transferring multiple tokens (NFTs included):

```
const transactionWithMultipleTokenTransfers = factory.createTransactionForExecute({
    sender: addressOfAlice,
    contract: Address.fromBech32("erd1qqqqqqqqqqqqqpgq6qr0w0zzyysklfneh32eqp2cf383zc89d8sstnkl60"),
    functionName: "add",
    gasLimit: 5000000,
    args: args,
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

Above, we've prepared the `TokenTransfer` objects as seen in the section [token transfers](#token-transfers).

:::important
This page is a work in progress. Please check back later for more content.
:::
