---
id: erdjs-migration-guides
title: Migration guides
---

This tutorial will guide you through the process of migrating from one major version of **erdjs** (or one of its _satellites_) to another.

:::important
Make sure you have a look over the [cookbook](/sdk-and-tools/erdjs/erdjs-cookbook), in advance.
:::

## Migrate **erdjs** from v11.x to v12 (October of 2022)

**erdjs v12** brings a series of breaking changes that we will explain below.

### Transaction version and options

Starting with **erdjs v12**, support for `GuardAccount` feature will be available to use. This means that another option for transaction has been activated. Therefore, now we have: 

```
export const TRANSACTION_OPTIONS_DEFAULT = 0;
export const TRANSACTION_OPTIONS_TX_HASH_SIGN = 1;
export const TRANSACTION_OPTIONS_TX_GUARDED = 2;
```
Given this addition it means that previously `export const TRANSACTION_VERSION_TX_HASH_SIGN = 2` becomes obsolete because a *version 2* transaction will support more than one option. That's why we changed this constant to:

```
export const TRANSACTION_VERSION_WITH_TX_OPTIONS = 2;
```
As a consequence, in `src/networkParams.ts` the method previously named `withTxHashSignVersion()` will become:

```
    /**
     * Creates a TransactionVersion object with the VERSION setting for enabling options
     */
    static withTxOptions(): TransactionVersion {
        return new TransactionVersion(TRANSACTION_VERSION_WITH_TX_OPTIONS);
    }
```

Also changes on [elrond-sdk-erdjs-walletcore](https://github.com/ElrondNetwork/elrond-sdk-erdjs-walletcore) have been implemented and will be made available with **v3.0.1** release (see [details](https://docs.elrond.com/sdk-and-tools/erdjs/erdjs-migration-guides#elrond-sdk-erdjs-walletcore---v301-release) below).

### Guarded Transaction

After setting a guardian (`SetGuardian`) and sending `GuardAccount` builtin transaction to Elrond network, only guardian co-signed transactions will be accepted by the *guarded* account. For supporting this, two new fields have been added to the transaction proto (Guardian Address and Guardian Signature):
```
message Transaction {
	uint64   Nonce          = 1  [(gogoproto.jsontag) = "nonce"];
	bytes    Value          = 2  [(gogoproto.jsontag) = "value", (gogoproto.casttypewith) = "math/big.Int;github.com/ElrondNetwork/elrond-go/data.BigIntCaster"];
	bytes    RcvAddr        = 3  [(gogoproto.jsontag) = "receiver"];
	bytes    RcvUserName    = 4  [(gogoproto.jsontag) = "rcvUserName,omitempty"];
	bytes    SndAddr        = 5  [(gogoproto.jsontag) = "sender"];
	bytes    SndUserName    = 6  [(gogoproto.jsontag) = "sndUserName,omitempty"];
	uint64   GasPrice       = 7  [(gogoproto.jsontag) = "gasPrice,omitempty"];
	uint64   GasLimit       = 8  [(gogoproto.jsontag) = "gasLimit,omitempty"];
	bytes    Data           = 9  [(gogoproto.jsontag) = "data,omitempty"];
	bytes    ChainID        = 10 [(gogoproto.jsontag) = "chainID"];
	uint32   Version        = 11 [(gogoproto.jsontag) = "version"];
	bytes    Signature      = 12 [(gogoproto.jsontag) = "signature,omitempty"];
	uint32   Options        = 13 [(gogoproto.jsontag) = "options,omitempty"];
	bytes    GuardAddr      = 14 [(gogoproto.jsontag) = "guardian,omitempty"];
	bytes    GuardSignature = 15 [(gogoproto.jsontag) = "guardianSignature,omitempty"];
}
```
Once an account is guarded, only transactions with set `guardian` and `version=2`, `options=2` will be accepted.

Example:
```
const transaction = new Transaction({
    nonce: sender.account.getNonceThenIncrement(),
    sender: sender.address,
    receiver: receiver.address,
    value: payment,
    gasLimit: gasLimit,
    chainID: this.networkConfig.ChainID,
    guardian: guardian.address,
    options: TransactionOptions.withTxGuardedOptions(),
    version: TransactionVersion.withTxOptions(),
});
```
After adding sender's signature also guardians signature has to be added:
```
const guardian: IGuardianUser;
...
await guardian.signer.guard(transaction);
```

### Transaction field `sender` became mandatory with erdjs - v11

This implies changes on various levels on several files.

1. `smartContract.deploy({...})` receives a new mandatory input parameter `deployer`, that has been added on
```
export interface DeployArguments {
    code: ICode;
    codeMetadata?: ICodeMetadata;
    initArguments?: TypedValue[];
    value?: ITransactionValue;
    gasLimit: IGasLimit;
    gasPrice?: IGasPrice;
    chainID: IChainID;
    deployer: IAddress;
}
```
2. `smartContract.upgrade({...})` receives a new mandatory input parameter `caller`, that has been added on
```
export interface UpgradeArguments {
    code: ICode;
    codeMetadata?: ICodeMetadata;
    initArguments?: TypedValue[];
    value?: ITransactionValue;
    gasLimit: IGasLimit;
    gasPrice?: IGasPrice;
    chainID: IChainID;
    caller: IAddress;
}
```
3. `smartContract.call({...})` receives a new mandatory input parameter `caller`, that has been added on
```
export interface CallArguments {
    func: IContractFunction;
    args?: TypedValue[];
    value?: ITransactionValue;
    gasLimit: IGasLimit;
    receiver?: IAddress;
    gasPrice?: IGasPrice;
    chainID: IChainID;
    caller: IAddress;
}
```
4. `withSender(sender: IAddress): Interaction{}` has been added to be used for adding the sender when defining an interaction:
```
const interaction = <Interaction>contract.methods.method1()
    .withGasLimit(3000000)
    .withChainID(network.ChainID)
    .withSender(alice.address);
``` 

### elrond-sdk-erdjs-walletcore - v3.0.1 release

Another `signer` has been added in support for Guard Account feature (`GuardianSigner` as an extension to `UserSigner`). 
```
/**
 * An interface that defines a signing-capable object.
 */
export interface IGuardianSigner {
    /**
     * Gets the {@link Address} of the signer.
     */
    getAddress(): IAddress;

    /**
     * Signs a message (e.g. a transaction).
     */
    guard(signable: ISignable): Promise<void>;
}
```

## Migrate **erdjs** from v9.x to v10 (April of 2022)

**erdjs v10** brought a series of breaking changes. Most importantly, the packages **walletcore**, **dapp**, **contractWrappers** and the network providers (`ApiProvider`, `ProxyProvider`) have been extracted to separate repositories - consequently, they are now distributed as separate NPM packages. **erdjs** does not depend anymore on the libraries **fs**, **crypto** and **axios**.

The classes responsible with parsing contract results or query responses, and the ones responsible with transaction completion detection have been rewritten, as well.

Furthermore, we have removed a couple of _previously-thought as utility_ functions, in order to simplify and improve the codebase of **erdjs**.

### `Balance` vs. `TokenPayment`

In erdjs 10, the classes `Balance` and `BalanceBuilder` do not exist anymore.

Instead, a `TokenPayment` or an `IAccountBalance` (a simple `BigNumber`) should be used instead, depending on the case.

erdjs 9x:

```
let balance = Balance.egld(1);
```

erdjs 10:

```
let paymentEGLD = TokenPayment.egldFromAmount("1");
let paymentFungible = TokenPayment.fungibleFromBigInteger(identifier, "1000000", numDecimals);
let paymentNonFungible = TokenPayment.nonFungible(identifier, nonce);
```

### Transaction broadcasting and fetching

The following utility functions are not available anymore: `transaction.send()`, `transaction.getAsOnNetwork()`.

Instead, one should directly call a network provider:

```
await networkProvider.sendTransaction(tx);
await networkProvider.getTransaction(txHash)
```

### Transaction awaiting

In erdjs 10, the following utility functions are not available anymore: `transaction.awaitExecuted()`, `transaction.awaitPending()`.

Instead, one should directly use the `TransactionWatcher`:

```
let watcher = new TransactionWatcher(networkProvider);
await watcher.awaitCompleted(tx);
```

### Fetching network configuration

In erdjs 10, we have removed the utility functions `NetworkConfig.getDefault()` and `NetworkConfig.sync()`. 

Instead, one should fetch the network configuration as follows: 

```
let networkConfig = await provider.getNetworkConfig();
```

Then cache the response, if needed.

### Nonce, gas limit, gas price, chain ID

In erdjs 10, the classes `Nonce`, `GasLimit`, `GasPrice` and `ChainID` do not exist anymore. 

Instead, one should simply use primitives when creating transactions / interactions:

```
let tx = new Transaction({
    nonce: 7,
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    gasPrice: 1000000000,
    receiver: new Address("erd1..."),
    value: TokenPayment.egldFromAmount(1),
    chainID: "D"
});
```

### Creating contract queries

The function `smartContract.runQuery()` has been removed, in order to decouple the `SmartContract` class from the network provider.

In erdjs 10, one should do as follows:

```
let query = smartContract.createQuery({ /* ... */ });
let queryResponse = await networkProvider.queryContract(query);
```

 `smartContract.createQuery()` + `provider.queryContract()` have to be used, instead.

### Creating interactions using `contract.methods`

In erdjs 10, when using `contract.methods.myContractFunction([a, b, c])`, the type inference system comes into play. 

That is, you **cannot** write the following anymore:

```
let interaction = <Interaction>this.contract.methods.getLotteryInfo([
    BytesValue.fromUTF8("my-lottery")
]);
```

Instead, you have to either **not provide typed values** ar arguments (automatic type inference will be applied):

```
let interaction = <Interaction>this.contract.methods.getLotteryInfo(["my-lottery")]);
```

 \- or to provide typed values, as before, but using the `methodsExplicit` object:

```
let interaction = <Interaction>this.contract.methodsExplicit.getLotteryInfo([
    BytesValue.fromUTF8("my-lottery")
]);
```

### Parsing contract results

The modules designed to parse the contract results have been rewritten in erdjs 10. `ExecutionResultsBundle` and `QueryResponseBundle` have been removed, and replaced by `TypedOutcomeBundle` (and its untyped counterpart, `UntypedOutcomeBundle`).  `SmartContractResults` has been changed to not use the concepts `immediate result` and `resulting calls` anymore. Instead, interpreting `SmartContractResults.items` is now the responsibility of the `ResultsParser`. `interpretQueryResponse()` and `interpretExecutionResults()` do not exist on the `Interaction` object anymore. `DefaultInteractionRunner` has been removed, as well.

The functions `getReceipt()`, `getSmartContractResults()` and `getLogs()` of `TransactionOnNetwork` have been removed. The underlying properties are now public. Furthermore, `TransactionOnNetwork` is now defined within `@elrondnetwork/erdjs-network-providers`.

In order to parse contract results in erdjs 10, please follow [this guide](/sdk-and-tools/erdjs/erdjs-cookbook#parsing-contract-results).

### `EsdtHelpers` and `ScArgumentsParser` vs. `transaction-decoder`

In erdjs 10, the classes `EsdtHelpers` and `ScArgumentsParser` have been removed.

Instead, one should reference and use the package [@elrondnetwork/transaction-decoder](https://www.npmjs.com/package/@elrondnetwork/transaction-decoder).

### ChainID is now required

`ChainID` is now a required parameter of the `Transaction` constructor. 

Furthermore, `interaction.withChainID("D")` must be used before calling `interaction.buildTransaction()`.

```
let tx = interaction
    .withNonce(7)
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

## Migrate **erdjs-snippets** from v2.x to v3.x (May of 2022)

In order to migrate from `erdjs-snippets v2.x` to `erdjs-snippets v3.x`, please follow the changes depicted [here](https://github.com/ElrondNetwork/elrond-wasm-rs/pull/712).
