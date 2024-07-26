---
id: sdk-js-cookbook-v12
title: Cookbook (v12)
pagination_prev: sdk-and-tools/sdk-js/sdk-js-cookbook-versions
pagination_next: null
---

[comment]: # (mx-abstract)

This page will guide you through the process of handling common tasks using **sdk-js v12 (legacy, previous version)**.

:::important
A newer variant of the **sdk-js** cookbook is available [here](/sdk-and-tools/sdk-js/sdk-js-cookbook-v13).
:::

:::important
In order to migrate to the newer `sdk-js v13`, please follow [the migration guide](https://github.com/multiversx/mx-sdk-js-core/issues/392).
:::

[comment]: # (mx-context-auto)

## Creating network providers

Creating an API provider:

```js
import { ApiNetworkProvider } from "@multiversx/sdk-network-providers";

const apiNetworkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
```

Creating a Proxy provider:

```js
import { ProxyNetworkProvider } from "@multiversx/sdk-network-providers";

const proxyNetworkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
```

Use the classes from `@multiversx/sdk-network-providers` **only as a starting point**. 
As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements 
(whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

On this topic, please see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

[comment]: # (mx-context-auto)

## Fetching network parameters

```js
const networkConfig = await apiNetworkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

[comment]: # (mx-context-auto)

## Working with accounts

[comment]: # (mx-context-auto)

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

[comment]: # (mx-context-auto)

### Managing the sender nonce locally

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```js
alice.incrementNonce();
console.log("Nonce:", alice.nonce);
```

Alternatively, you can also use `setNonce` on a `Transaction` object:

```js
notYetSignedTx.setNonce(alice.getNonceThenIncrement());
```

For further reference, please see [nonce management](https://docs.multiversx.com/integrators/creating-transactions/#nonce-management).

[comment]: # (mx-context-auto)

## Preparing `TokenTransfer` objects

A `TokenTransfer` object for **EGLD transfers** (value movements):

```js
import { TokenTransfer } from "@multiversx/sdk-core";

let firstTransfer = TokenTransfer.egldFromAmount("1.5");
let secondTransfer = TokenTransfer.egldFromBigInteger("1500000000000000000");

console.log(firstTransfer.valueOf(), secondTransfer.valueOf());
console.log(firstTransfer.toPrettyString(), secondTransfer.toPrettyString());
```

A `TokenTransfer` object for transferring **fungible** tokens:

```js
const identifier = "FOO-123456";
const numDecimals = 2;
firstTransfer = TokenTransfer.fungibleFromAmount(identifier, "1.5", numDecimals);
secondTransfer = TokenTransfer.fungibleFromBigInteger(identifier, "4000", numDecimals);

console.log(firstTransfer.toString()); // Will output: 150.
console.log(firstTransfer.toPrettyString()); // Will output: 1.50 FOO-123456.
console.log(secondTransfer.toString()); // Will output: 4000.
console.log(secondTransfer.toPrettyString()); // Will output: 40.00 FOO-123456.
```

A `TokenTransfer` object for transferring **semi-fungible** tokens:

```js
let nonce = 3;
let quantity = 50;
let transfer = TokenTransfer.semiFungible(identifier, nonce, quantity);
```

A `TokenTransfer` object for transferring **non-fungible** tokens (the quantity doesn't need to be specified for NFTs, as the token is only one of its kind):

```js
nonce = 7;
transfer = TokenTransfer.nonFungible(identifier, nonce);
```

A `TokenTransfer` object for transferring **meta-esdt** tokens:

```js
transfer = TokenTransfer.metaEsdtFromAmount(identifier, nonce, "0.1", numDecimals);
```

[comment]: # (mx-context-auto)

## Broadcasting transactions

[comment]: # (mx-context-auto)

### Preparing a simple transaction

```js
import { Transaction, TransactionPayload } from "@multiversx/sdk-core";

const tx = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    value: TokenTransfer.egldFromAmount(1),
    chainID: "D"
});

tx.setNonce(alice.getNonceThenIncrement());
```

[comment]: # (mx-context-auto)

### Broadcast using a network provider

```js
let txHash = await proxyNetworkProvider.sendTransaction(tx); 
console.log("Hash:", txHash); 
```

Note that the transaction **must be signed before being broadcasted**. Signing can be achieved using a signing provider.

:::important
Note that, for all purposes, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

[comment]: # (mx-context-auto)

### Broadcast using `axios`

```js
import axios from "axios";

const data = readyToBroadcastTx.toSendable();
const url = "https://devnet-api.multiversx.com/transactions";
const response = await axios.post(url, data, {
    headers: {
        "Content-Type": "application/json",
    },
});
let txHash = response.data.txHash;
```

[comment]: # (mx-context-auto)

### Wait for transaction completion

```js
import { TransactionWatcher } from "@multiversx/sdk-core";

const watcher = new TransactionWatcher(apiNetworkProvider);
const transactionOnNetwork = await watcher.awaitCompleted(tx);
```

If only the `txHash` is available, then:

```js
const transactionOnNetwork = await watcher.awaitCompleted({ getHash: () => txHash });
console.log(transactionOnNetwork);
```

In order to wait for multiple transactions:

```js
await Promise.all([watcher.awaitCompleted(tx1), watcher.awaitCompleted(tx2), watcher.awaitCompleted(tx3)]);
```

For a different awaiting strategy, also see [extending sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/extending-sdk-js).

[comment]: # (mx-context-auto)

## Token transfers

First, let's create a `TransferTransactionsFactory`.

```js
import { GasEstimator, TransferTransactionsFactory } from "@multiversx/sdk-core";

const factory = new TransferTransactionsFactory(new GasEstimator());
```

[comment]: # (mx-context-auto)

### Single ESDT transfer

```js
import { TokenTransfer } from "@multiversx/sdk-core";

const transfer1 = TokenTransfer.fungibleFromAmount("TEST-8b028f", "100.00", 2);

const tx1 = factory.createESDTTransfer({
    tokenTransfer: transfer1,
    nonce: 7,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D"
});
```

[comment]: # (mx-context-auto)

### Single NFT transfer

```js
const transfer2 = TokenTransfer.nonFungible("TEST-38f249", 1);

const tx2 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer2,
    nonce: 8,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});
```

[comment]: # (mx-context-auto)

### Single SFT transfer

```js
const transfer3 = TokenTransfer.semiFungible("SEMI-9efd0f", 1, 5);

const tx3 = factory.createESDTNFTTransfer({
    tokenTransfer: transfer3,
    nonce: 9,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});
```

[comment]: # (mx-context-auto)

### Multi ESDT / NFT transfer

```js
const transfers = [transfer1, transfer2, transfer3];

const tx4 = factory.createMultiESDTNFTTransfer({
    tokenTransfers: transfers,
    nonce: 10,
    sender: addressOfAlice,
    destination: addressOfBob,
    chainID: "D"
});
```

[comment]: # (mx-context-auto)

## Contract deployments

[comment]: # (mx-context-auto)

### Load the bytecode from a file

```js
import { Code } from "@multiversx/sdk-core";
import { promises } from "fs";

let buffer = await promises.readFile("../contracts/counter.wasm");
let code = Code.fromBuffer(buffer);
```

[comment]: # (mx-context-auto)

### Load the bytecode from an URL

```js
import axios from "axios";

let response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.wasm", {
    responseType: "arraybuffer",
    transformResponse: [],
    headers: {
        "Accept": "application/wasm"
    }
});

buffer = Buffer.from(response.data);
code = Code.fromBuffer(buffer);
```

[comment]: # (mx-context-auto)

### Perform a contract deployment

Create a `SmartContract` object:

```js
import { SmartContract } from "@multiversx/sdk-core";

let contract = new SmartContract();
```

Prepare the deploy transaction:

```js
import { CodeMetadata } from "@multiversx/sdk-core";

const deployerAddress = addressOfAlice;

const deployTransaction = contract.deploy({
    deployer: deployerAddress,
    code: code,
    codeMetadata: new CodeMetadata(/* set the parameters accordingly */),
    initArguments: [/* set the initial arguments, if any */],
    gasLimit: 20000000,
    chainID: "D"
});
```

Then, set the transaction nonce.

Note that the account nonce must be synchronized beforehand. 
Also, locally increment the nonce of the deployer (optional).

```js
import { Account } from "@multiversx/sdk-core";

const deployer = new Account(deployerAddress);
const deployerOnNetwork = await networkProvider.getAccount(deployerAddress);
deployer.update(deployerOnNetwork);

deployTransaction.setNonce(deployer.getNonceThenIncrement());
```

Then **sign the transaction** using a wallet / signing provider of your choice (not shown here).

Upon signing, you would usually compute the contract address (deterministically computable), as follows:

```js
let contractAddress = SmartContract.computeAddress(deployTransaction.getSender(), deployTransaction.getNonce());
console.log("Contract address:", contractAddress.bech32());
```

In order to broadcast the transaction and await its completion, use a network provider and a transaction watcher:

```js
import { TransactionWatcher } from "@multiversx/sdk-core";

await networkProvider.sendTransaction(deployTransaction);
let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(deployTransaction);
```

In the end, parse the results:

```js
import { ResultsParser } from "@multiversx/sdk-core";

let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork);
console.log("Return code:", returnCode);
```

[comment]: # (mx-context-auto)

## ABI

[comment]: # (mx-context-auto)

### Load the ABI from a file

```js
import { AbiRegistry, Address, SmartContract } from "@multiversx/sdk-core";
import { promises } from "fs";

let abiJson = await promises.readFile("../contracts/counter.abi.json", { encoding: "utf8" });
let abiObj = JSON.parse(abiJson);
let abiRegistry = AbiRegistry.create(abiObj);
let existingContractAddress = Address.fromBech32("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```

[comment]: # (mx-context-auto)

### Load the ABI from an URL

```js
import axios from "axios";

const response = await axios.get("https://github.com/multiversx/mx-sdk-js-core/raw/main/src/testdata/counter.abi.json");
abiRegistry = AbiRegistry.create(response.data);
existingContract = new SmartContract({ address: existingContractAddress, abi: abiRegistry });
```

[comment]: # (mx-context-auto)

## Contract queries

[comment]: # (mx-context-auto)

### When the ABI is not available

```js
import { AddressValue, BigUIntType, BinaryCodec, ResultsParser, SmartContract } from "@multiversx/sdk-core";

let legacyDelegationContract = new SmartContract({
    address: legacyDelegationContractAddress
});

let query = legacyDelegationContract.createQuery({
    func: "getClaimableRewards",
    args: [new AddressValue(addressOfFirstDevnetDelegator)]
});

let queryResponse = await networkProvider.queryContract(query);
let bundle = new ResultsParser().parseUntypedQueryResponse(queryResponse);
let firstValue = bundle.values[0];
let decodedValue = new BinaryCodec().decodeTopLevel(firstValue, new BigUIntType());

console.log(bundle.returnCode);
console.log(bundle.returnMessage);
console.log(bundle.values);
console.log(decodedValue.valueOf().toFixed(0));
```

[comment]: # (mx-context-auto)

### Using `Interaction`, when the ABI is not available

```js
import { Interaction } from "@multiversx/sdk-core";

let args = [new AddressValue(addressOfFirstDevnetDelegator)];
query = new Interaction(legacyDelegationContract, "getClaimableRewards", args)
    .buildQuery();

let queryResponseFromInteraction = await networkProvider.queryContract(query);

console.assert(JSON.stringify(queryResponseFromInteraction) === JSON.stringify(queryResponse));
```

Then, parse the response as above.

[comment]: # (mx-context-auto)

### When the ABI is available

```js
import { AbiRegistry } from "@multiversx/sdk-core";

const legacyDelegationAbi = AbiRegistry.create({
    "endpoints": [
        {
            "name": "getClaimableRewards",
            "inputs": [{
                "type": "Address"
            }],
            "outputs": [{
                "type": "BigUint"
            }]
        }
    ]
});

const getClaimableRewardsEndpoint = legacyDelegationAbi.getEndpoint("getClaimableRewards");

query = legacyDelegationContract.createQuery({
    func: "getClaimableRewards",
    args: [new AddressValue(addressOfFirstDevnetDelegator)]
});

queryResponse = await networkProvider.queryContract(query);
let { values } = new ResultsParser().parseQueryResponse(queryResponse, getClaimableRewardsEndpoint);
console.log(values[0].valueOf().toFixed(0));
```

[comment]: # (mx-context-auto)

### Using `Interaction`, when the ABI is available

Prepare the interaction, check it, then build the query:

```js
legacyDelegationContract = new SmartContract({
    address: legacyDelegationContractAddress,
    abi: legacyDelegationAbi
});

let interaction = legacyDelegationContract.methods.getClaimableRewards([addressOfFirstDevnetDelegator]);
query = interaction.check().buildQuery();
```

Then, run the query and parse the results:

```js
queryResponse = await networkProvider.queryContract(query);
let typedBundle = new ResultsParser().parseQueryResponse(queryResponse, interaction.getEndpoint());
console.log(typedBundle.values[0].valueOf().toFixed(0));
```

Depending on the context, reinterpret (cast) the results:

```js
let firstValueAsStruct = <Struct>firstValue;
```

[comment]: # (mx-context-auto)

## Contract interactions

[comment]: # (mx-context-auto)

### When the ABI is not available

```js
import { Address, AddressValue, SmartContract, U64Value } from "@multiversx/sdk-core";

let contractAddress = new Address("erd1qqqqqqqqqqqqqpgq5sup58y38q3pwyqklagxmuraetshrqwpd8ssh0ssph");
let contract = new SmartContract({ address: contractAddress });

let tx1 = contract.call({
    caller: addressOfAlice,
    func: "doSomething",
    gasLimit: 5000000,
    args: [new AddressValue(addressOfCarol), new U64Value(1000)],
    chainID: "D"
});

tx1.setNonce(42);
```

Then, sign, broadcast `tx` and wait for its completion.

[comment]: # (mx-context-auto)

### Using `Interaction`, when the ABI is not available

```js
import { Interaction, TokenTransfer, U32Value } from "@multiversx/sdk-core";

let args = [new U32Value(1), new U32Value(2), new U32Value(3)];
let interaction = new Interaction(contract, "doSomethingWithValue", args);

let tx2 = interaction
    .withSender(addressOfAlice)
    .withNonce(43)
    .withValue(TokenTransfer.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

Then, sign, broadcast `tx` and wait for its completion.

[comment]: # (mx-context-auto)

### Using `Interaction`, when the ABI is available

```js
import { AbiRegistry } from "@multiversx/sdk-core";

let abiRegistry = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foobar",
            "inputs": [],
            "outputs": []
        },
        {
            "name": "doSomethingWithValue",
            "inputs": [{
                "type": "u32"
            },
            {
                "type": "u32"
            },
            {
                "type": "u32"
            }],
            "outputs": []
        }
    ]
});

contract = new SmartContract({ address: contractAddress, abi: abiRegistry });

let tx3 = contract.methods.doSomethingWithValue([1, 2, 3])
    .withSender(addressOfAlice)
    .withNonce(44)
    .withValue(TokenTransfer.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

Now let's see an example using variadic arguments, as well:

```js
import { StringValue, VariadicValue } from "@multiversx/sdk-core";

abiRegistry = AbiRegistry.create({
    "endpoints": [
        {
            "name": "foobar",
            "inputs": [],
            "outputs": []
        },
        {
            "name": "doSomething",
            "inputs": [{
                "type": "counted-variadic<utf-8 string>"
            },
            {
                "type": "variadic<u64>"
            }],
            "outputs": []
        }
    ]
});

contract = new SmartContract({ address: contractAddress, abi: abiRegistry });

let tx4 = contract.methods.doSomething(
    [
        // Counted variadic must be explicitly typed 
        VariadicValue.fromItemsCounted(StringValue.fromUTF8("foo"), StringValue.fromUTF8("bar")),
        // Regular variadic can be implicitly typed 
        1, 2, 3
    ])
    .withSender(addressOfAlice)
    .withNonce(45)
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

[comment]: # (mx-context-auto)

### Transfer & execute

Given an interaction:

```js
interaction = contract.methods.foobar([]);
```

One can apply token transfers to the smart contract call, as well.

For single payments, do as follows:

```js
// Fungible token 
interaction.withSingleESDTTransfer(TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18));

// Non-fungible token 
interaction.withSingleESDTNFTTransfer(TokenTransfer.nonFungible("SDKJS-38f249", 1));
```

For multiple payments:

```js
interaction.withMultiESDTNFTTransfer([
    TokenTransfer.fungibleFromAmount("FOO-6ce17b", "1.5", 18),
    TokenTransfer.nonFungible("SDKJS-38f249", 1)
]);
```

[comment]: # (mx-context-auto)

## Parsing contract results

:::important
When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-js-core/issues), and also provide as many details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
:::

[comment]: # (mx-context-auto)

### When the ABI is not available

```js
import { ResultsParser } from "@multiversx/sdk-core";

let resultsParser = new ResultsParser();
let txHash = "d415901a9c88e564adf25b71b724b936b1274a2ad03e30752fdc79235af8ea3e";
let transactionOnNetwork = await networkProvider.getTransaction(txHash);
let untypedBundle = resultsParser.parseUntypedOutcome(transactionOnNetwork);

console.log(untypedBundle.returnCode, untypedBundle.values.length);
```

[comment]: # (mx-context-auto)

### When the ABI is available

```js
let endpointDefinition = AbiRegistry.create({
    "name": "counter",
    "endpoints": [{
        "name": "increment",
        "inputs": [],
        "outputs": [{ "type": "i64" }]
    }]
}).getEndpoint("increment");

transactionOnNetwork = await networkProvider.getTransaction(txHash);
let typedBundle = resultsParser.parseOutcome(transactionOnNetwork, endpointDefinition);

console.log(typedBundle.returnCode, typedBundle.values.length);
```

Above, `endpointDefinition` is manually constructed. 
However, in practice, it can be obtained from the `Interaction` object, if available in the context:

```js
endpointDefinition = interaction.getEndpoint();
```

Alternatively, the `endpointDefinition` can also be obtained from the `SmartContract` object:

```js
let endpointDefinition = smartContract.getEndpoint("myFunction");
```

For customizing the default parser, also see [extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js).

[comment]: # (mx-context-auto)

## Contract events

[comment]: # (mx-context-auto)

### Decode transaction events

Example of decoding a transaction event having the identifier `deposit`:

```js
const abiContent = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiContent);
const abiRegistry = AbiRegistry.create(abiObj);
const resultsParser = new ResultsParser();

const eventIdentifier = "deposit";
const eventDefinition = abiRegistry.getEvent(eventIdentifier);
const transaction = await networkProvider.getTransaction("532087e5021c9ab8be8a4db5ad843cfe0610761f6334d9693b3765992fd05f67");
const event = transaction.contractResults.items[0].logs.findFirstOrNoneEvent(eventIdentifier);
const outcome = resultsParser.parseEvent(event, eventDefinition);
console.log(JSON.stringify(outcome, null, 4));
```

[comment]: # (mx-context-auto)

## Explicit decoding / encoding of values

[comment]: # (mx-context-auto)

### Decoding a custom type

Example of decoding a custom type (a structure) called `DepositEvent` from binary data:

```js
import { AbiRegistry, BinaryCodec } from "@multiversx/sdk-core";
import { promises } from "fs";

const abiJson = await promises.readFile("../contracts/example.abi.json", { encoding: "utf8" });
const abiObj = JSON.parse(abiJson);
const abiRegistry = AbiRegistry.create(abiObj);
const depositCustomType = abiRegistry.getCustomType("DepositEvent");
const codec = new BinaryCodec();
let data = Buffer.from("00000000000003db000000", "hex");
let decoded = codec.decodeTopLevel(data, depositCustomType);
let decodedValue = decoded.valueOf();

console.log(JSON.stringify(decodedValue, null, 4));
```

Example of decoding a custom type (a structure) called `Reward` from binary data:

```js
const rewardStructType = abiRegistry.getStruct("Reward");
data = Buffer.from("010000000445474c440000000201f400000000000003e80000000000000000", "hex");

[decoded] = codec.decodeNested(data, rewardStructType);
decodedValue = decoded.valueOf();
console.log(JSON.stringify(decodedValue, null, 4));
```

[comment]: # (mx-context-auto)

## Signing objects

:::note
For **dApps**, use the available **[signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)** instead.
:::

Creating a `UserSigner` from a JSON wallet:

```js
import { UserSigner } from "@multiversx/sdk-wallet";
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

Signing a transaction:

```js
import { Transaction } from "@multiversx/sdk-core";

const transaction = new Transaction({
    gasLimit: 50000,
    gasPrice: 1000000000,
    sender: addressOfAlice,
    receiver: addressOfBob,
    chainID: "D",
    version: 1
});

const serializedTransaction = transaction.serializeForSigning();
const transactionSignature = await signer.sign(serializedTransaction);
transaction.applySignature(transactionSignature);

console.log("Transaction signature", transaction.getSignature().toString("hex"));
console.log("Transaction hash", transaction.getHash().toString());
```

Signing an arbitrary message:

```js
import { SignableMessage } from "@multiversx/sdk-core";

let message = new SignableMessage({
    message: Buffer.from("hello")
});

let serializedMessage = message.serializeForSigning();
let messageSignature = await signer.sign(serializedMessage);
message.applySignature(messageSignature);

console.log("Message signature", message.getSignature().toString("hex"));
```

[comment]: # (mx-context-auto)

## Verifying signatures

Creating a `UserVerifier`:

```js
import { UserVerifier } from "@multiversx/sdk-wallet";

const aliceVerifier = UserVerifier.fromAddress(addressOfAlice);
const bobVerifier = UserVerifier.fromAddress(addressOfBob);
```

Suppose we have the following transaction:

```js
const tx = Transaction.fromPlainObject({
    nonce: 42,
    value: "12345",
    sender: addressOfAlice.bech32(),
    receiver: addressOfBob.bech32(),
    gasPrice: 1000000000,
    gasLimit: 50000,
    chainID: "D",
    version: 1,
    signature: "3c5eb2d1c9b3ab2f578541e62dcfa5008976d11f85644a48884a8a6c4d2980fa14954ab2924d6e67c051562488096d2e79cd3c0378edf234a52e648e672d1b0a"
});

const serializedTx = tx.serializeForSigning();
const txSignature = tx.getSignature();
```

And / or the following message and signature:

```js
message = new SignableMessage({ message: Buffer.from("hello") });
serializedMessage = message.serializeForSigning();
messageSignature = Buffer.from("561bc58f1dc6b10de208b2d2c22c9a474ea5e8cabb59c3d3ce06bbda21cc46454aa71a85d5a60442bd7784effa2e062fcb8fb421c521f898abf7f5ec165e5d0f", "hex");
```

We can verify their signatures as follows:

```js
console.log("Is signature of Alice?", aliceVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Alice?", aliceVerifier.verify(serializedMessage, messageSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedTx, txSignature));
console.log("Is signature of Bob?", bobVerifier.verify(serializedMessage, messageSignature));
```

[comment]: # (mx-context-auto)

## Decoding transaction metadata

[comment]: # (mx-context-auto)

### Using the `transaction-decoder`

In order to decode the metadata (function, arguments, transfers) from a transaction payload, do as follows:

```js
import { TransactionDecoder, TransactionMetadata } from "@multiversx/sdk-transaction-decoder";

let transactionOnNetwork = await networkProvider.getTransaction(txHash);

let metadata = new TransactionDecoder().getTransactionMetadata({
    sender: transactionOnNetwork.sender.bech32(),
    receiver: transactionOnNetwork.receiver.bech32(),
    data: transactionOnNetwork.data.toString("base64"),
    value: transactionOnNetwork.value.toString(),
    type: transactionOnNetwork.type
});
```

[comment]: # (mx-context-auto)

### Using the `esdtHelpers` and `scArgumentsParser` of `sdk-js 9x`

The classes `esdtHelpers` and `scArgumentsParser` have been removed in `sdk-js 10`, in favor of the [@multiversx/sdk-transaction-decoder](https://www.npmjs.com/package/@multiversx/sdk-transaction-decoder) (see above).

However, you can still find the previous implementations at the following location:

- [esdtHelpers](https://github.com/multiversx/mx-sdk-js-core/blob/release/v9/src/esdtHelpers.ts)
- [esdtHelpers examples](https://github.com/multiversx/mx-sdk-js-core/blob/release/v9/src/esdtHelpers.spec.ts)
- [scArgumentsParser](https://github.com/multiversx/mx-sdk-js-core/blob/release/v9/src/scArgumentsParser.ts)
- [scArgumentsParser examples](https://github.com/multiversx/mx-sdk-js-core/blob/release/v9/src/scArgumentsParser.spec.ts)
