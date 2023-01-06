---
id: erdjs-cookbook
title: Cookbook
---

This page will guide you through the process of handling common tasks using **erdjs**.

:::important
This cookbook makes use of `erdjs 10`. In order to migrate from `erdjs 9.x` to `erdjs 10`, please follow [the migration guide](/sdk-and-tools/erdjs/erdjs-migration-guides).
:::

## Creating network providers

Creating an API provider:

```
import { ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";

let networkProvider = new ApiNetworkProvider("https://devnet-api.multiversx.com");
```

Creating a Proxy provider:

```
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";

let networkProvider = new ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
```

:::important
Use the classes from `@elrondnetwork/erdjs-network-providers` **only as a starting point**. As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements (whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

On this topic, please see [extending erdjs](/sdk-and-tools/erdjs/extending-erdjs).
:::

## Fetching network parameters

```
let networkConfig = await networkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

## Working with accounts

### Synchronizing an account object

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

```
let addressOfAlice = new Address("erd1...");
let alice = new Account(addressOfAlice);
let aliceOnNetwork = await networkProvider.getAccount(addressOfAlice);
alice.update(aliceOnNetwork);

console.log(alice.nonce);
console.log(alice.balance);
```

### Managing the sender nonce locally

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
alice.incrementNonce();
```

Alternatively, you can also use:

```
transaction.setNonce(alice.getNonceThenIncrement());
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

## Preparing payment objects

:::important
In **erdjs 9x**, the payments were prepared using the classes `Balance` and `BalanceBuilder`. In **erdjs 10**, we use `TokenPayment`.
:::

A `TokenPayment` object for **EGLD transfers** (value movements):

```
let firstPayment = TokenPayment.egldFromAmount("1.5");
let secondPayment = TokenPayment.egldFromBigInteger("1500000000000000000");
console.log(firstPayment.valueOf(), secondPayment.valueOf());
console.log(firstPayment.toPrettyString(), secondPayment.toPrettyString());
```

A `TokenPayment` object for transferring **fungible** tokens:

```
let identifier = "FOO-123456";
let numDecimals = 2;
let firstPayment = TokenPayment.fungibleFromAmount(identifier, "1.5", numDecimals);
let secondPayment = TokenPayment.fungibleFromBigInteger(identifier, "4000", numDecimals);

console.log(firstPayment.toString()); // Will output: 150.
console.log(firstPayment.toPrettyString()); // Will output: 1.50 FOO-123456.
console.log(secondPayment.toString()); // Will output: 4000.
console.log(secondPayment.toPrettyString()); // Will output: 40.00 FOO-123456.

```

A `TokenPayment` object for transferring **semi-fungible** tokens:

```
let nonce = 3;
let quantity = 50;
let payment = TokenPayment.semiFungible(identifier, nonce, quantity);
```

A `TokenPayment` object for transferring **non-fungible** tokens (the quantity doesn't need to be specified for NFTs, as the token is only one of its kind):

```
let nonce = 7;
let payment = TokenPayment.nonFungible(identifier, nonce);
```

A `TokenPayment` object for transferring **meta-esdt** tokens:

```
let payment = TokenPayment.metaEsdtFromAmount(identifier, nonce, "0.1", numDecimals);
```

## Broadcasting transactions

### Preparing a simple transaction

```
let tx = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    receiver: new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value: TokenPayment.egldFromAmount(1),
    chainID: "D"
});
```

### Broadcast using a network provider

```
let txHash = await networkProvider.sendTransaction(tx);
```

Note that the transaction needs to be signed before broadcasting it. Signing can be achieved using a signing provider.

:::important
Note that, for all purposes, **we recommend using [dapp-core](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

### Broadcast using `axios`

```
let data = tx.toSendable();
let url = "https://devnet-api.multiversx.com/transactions";
let response = await axios.post(url, data, {
    headers: {
        "Content-Type": "application/json",
    },
});
let txHash = response.data.txHash;
```

### Wait for transaction completion

```
let watcher = new TransactionWatcher(networkProvider);
let transactionOnNetwork = await watcher.awaitCompleted(tx);
```

If only the `txHash` is available, then:

```
let transactionOnNetwork = await watcher.awaitCompleted({ getHash: () => txHash });
console.log(transactionOnNetwork);
```

In order to wait for multiple transactions:

```
await Promise.all([watcher.awaitCompleted(tx1), watcher.awaitCompleted(tx2), watcher.awaitCompleted(tx3)]);
```

For a different awaiting strategy, also see [extending erdjs](/sdk-and-tools/erdjs/extending-erdjs).

## Token transfers

### Single ESDT transfer

```
let payment = TokenPayment.fungibleFromAmount("COUNTER-8b028f", "100.00", 2);
let data = new ESDTTransferPayloadBuilder()
    .setPayment(payment)
    .build();

transactions.push(new Transaction({
    nonce: 7,
    sender: new Address("erd1..."),
    receiver: new Address("erd1..."),
    data: data,
    gasLimit: 50000 + 1500 * data.length() + 300000,
    chainID: "D"
}));
```

### Single NFT transfer

```
let payment = TokenPayment.nonFungible("ERDJS-38f249", 1);
let payload = new ESDTNFTTransferPayloadBuilder()
    .setPayment(payment)
    .setDestination(new Address("erd1..."))
    .build();

transactions.push(new Transaction({
    nonce: 7,
    sender: new Address("erd1..."),
    // Same as sender address!
    receiver: new Address("erd1..."),
    data: data,
    gasLimit: 50000 + 1500 * data.length() + 1000000,
    chainID: "D"
}));
```

### Single SFT transfer

```
let payment = TokenPayment.semiFungible("SEMI-9efd0f", 1, 5);
let payload = new ESDTNFTTransferPayloadBuilder()
    .setPayment(payment)
    .setDestination(new Address("erd1..."))
    .build();

transactions.push(new Transaction({
    nonce: 7,
    sender: new Address("erd1..."),
    // Same as sender address!
    receiver: new Address("erd1..."),
    data: data,
    gasLimit: 50000 + 1500 * data.length() + 1000000,
    chainID: "D"
}));
```

### Multi ESDT / NFT transfer

```
let paymentOne = TokenPayment.nonFungible("ERDJS-38f249", 1);
let paymentTwo = TokenPayment.fungibleFromAmount("BAR-c80d29", "10.00", 18);
let payments = [paymentOne, paymentTwo];
let payload = new MultiESDTNFTTransferPayloadBuilder()
    .setPayments(payments)
    .setDestination(new Address("erd1..."))
    .build();

transactions.push(new Transaction({
    nonce: 7,
    sender: new Address("erd1..."),
    // Same as sender address!
    receiver: new Address("erd1..."),
    data: data,
    gasLimit: 50000 + 1500 * data.length() + 1000000 * payments.length,
    chainID: "D"
}));
```

## Contract deployments

### Load the bytecode from a file

```
import { Code } from "@elrondnetwork/erdjs";
import { promises } from "fs";

let buffer: Buffer = await promises.readFile(file);
let code = Code.fromBuffer(buffer);
```

### Load the bytecode from an URL

```
import axios, { AxiosResponse } from "axios";

let response: AxiosResponse<ArrayBuffer> = await axios.get("https://.../myContract.wasm", {
    responseType: "arraybuffer",
    transformResponse: [],
    headers: {
        "Accept": "application/wasm"
    }
});

let buffer = Buffer.from(response.data);
let code = Code.fromBuffer(buffer);
```

### Perform a contract deployment

Create a `SmartContract` object:

```
let contract = new SmartContract();
```

Prepare the deploy transaction:

```
let transaction = contract.deploy({
    code: code,
    codeMetadata: new CodeMetadata(/* set the parameters accordingly */),
    initArguments: [/* set the initial arguments, if any */],
    gasLimit: 20000000,
    chainID: "D"
});
```

Then, set the transaction nonce. 

Note that the account nonce must be synchronized beforehand. Also, locally increment the nonce of the deployer (optional).

```
transaction.setNonce(deployer.getNonceThenIncrement());
```

Then sign the transaction using a wallet / signing provider of your choice. Upon signing, you would usually compute the contract address (deterministically computable), as follows:

```
let contractAddress = SmartContract.computeAddress(transaction.getSender(), transaction.getNonce());
```

In order to broadcast the transaction and await its completion, use a network provider and a transaction watcher:

```
await networkProvider.sendTransaction(transaction);
let transactionOnNetwork = await new TransactionWatcher(networkProvider).awaitCompleted(transaction);
```

In the end, parse the results:

```
let { returnCode } = new ResultsParser().parseUntypedOutcome(transactionOnNetwork);
```

## ABI

### Load the ABI from a file

```
import { AbiRegistry } from "@elrondnetwork/erdjs";
import { promises } from "fs";

let jsonContent: string = await promises.readFile("myAbi.json", { encoding: "utf8" });
let json = JSON.parse(jsonContent);
let abiRegistry = AbiRegistry.create(json);
let abi = new SmartContractAbi(abiRegistry, ["MyContract"]);
...
let contract = new SmartContract({ address: new Address("erd1..."), abi: abi });
```

### Load the ABI from an URL

```
import axios, { AxiosResponse } from "axios";

let response: AxiosResponse = await axios.get("https://.../myAbi.json");
let abiRegistry = AbiRegistry.create(response.data);
let abi = new SmartContractAbi(abiRegistry, ["MyContract"]);
...
let contract = new SmartContract({ address: new Address("erd1..."), abi: abi });
```

## Contract queries

### When the ABI is not available

```
let contractAddress = new Address("erd1qqq...");
let contract = new SmartContract({ address: contractAddress });
let addressOfAlice = new Address("erd1...");

let query = contract.createQuery({
    func: new ContractFunction("getClaimableRewards"),
    args: [new AddressValue(addressOfAlice)],
    caller: new Address("erd1...")
});

let queryResponse = await networkProvider.queryContract(query);
let bundle = resultsParser.parseUntypedQueryResponse(queryResponse);
console.log(bundle.returnCode);
console.log(bundle.returnMessage);
console.log(bundle.values);
```

### Using `Interaction`, when the ABI is not available

```
let func = new ContractFunction("getClaimableRewards");
let args = [new AddressValue(addressOfAlice)];
let query = new Interaction(contract, func, args)
    .withQuerent(new Address("erd1..."))
    .buildQuery();

let queryResponse = await networkProvider.queryContract(query);
```

Then, parse the response as above.

### When the ABI is available

```
let query = contract.createQuery({
    func: new ContractFunction("getClaimableRewards"),
    args: [new AddressValue(addressOfAlice)],
    caller: new Address("erd1...")
});

let queryResponse = await networkProvider.queryContract(query);
let endpointDefinition = contract.getEndpoint("getClaimableRewards");
let { firstValue, secondValue, returnCode } = resultsParser.parseQueryResponse(queryResponse, endpointDefinition);
```

### Using `Interaction`, when the ABI is available

Prepare the interaction, check it, then build the query:

```
let interaction = <Interaction>contract.methods.getLotteryInfo(["myLottery]);
let query = interaction.check().buildQuery();
```

Then, run the query and parse the results:

```
let queryResponse = await networkProvider.queryContract(query);
let endpointDefinition = interaction.getEndpoint();
let { firstValue, secondValue, returnCode } = resultsParser.parseQueryResponse(queryResponse, endpointDefinition);
```

Depending on the context, reinterpret (cast) the results:

```
let firstValueAsStruct = <Struct>firstValue;
return firstValueAsStruct;
```

## Contract interactions

### When the ABI is not available

```
let contractAddress = new Address("erd1qqq...");
let contract = new SmartContract({ address: contractAddress });
let addressOfCarol = new Address("erd1...");

let tx = contract.call({
    func: new ContractFunction("transferToken"),
    gasLimit: 5000000,
    args: [new AddressValue(addressOfCarol), new U64Value(1000)],
    chainID: "D"
});

tx.setNonce(alice.nonce);
```

Then, sign, broadcast `tx` and wait for its completion.

### Using `Interaction`, when the ABI is not available

```
let contract = new SmartContract({ address: contractAddress });
let dummyFunction = new ContractFunction("dummy");
let args = [new U32Value(100)];
let interaction = new Interaction(contract, dummyFunction, args);

let tx = interaction
    .withNonce(7)
    .withValue(TokenPayment.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

Then, sign, broadcast `tx` and wait for its completion.

### Using `Interaction`, when the ABI is available

```
let contract = new SmartContract({ address: contractAddress, abi: abi });
let tx = contract.methods.dummy([new U32Value(100)])
    .withNonce(7)
    .withValue(TokenPayment.egldFromAmount(1))
    .withGasLimit(20000000)
    .withChainID("D")
    .buildTransaction();
```

### Transfer & execute

Given an interaction:

```
let interaction = contract.methods.doStuff([]);
```

One can apply token transfers to the smart contract call, as well. 

For single payments, do as follows:

```
// Fungible token
interaction.withSingleESDTTransfer(TokenPayment.fungibleFromAmount("FOO-6ce17b", "1.5", 18));

// Non-fungible token
interaction.withSingleESDTNFTTransfer(TokenPayment.nonFungible("ERDJS-38f249", 1));
```

For multiple payments:

```
interaction.withMultiESDTNFTTransfer([
    TokenPayment.fungibleFromAmount("FOO-6ce17b", "1.5", 18)
    TokenPayment.nonFungible("ERDJS-38f249", 1)
]);
```

## Parsing contract results

:::important
When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-erdjs/issues), and also provide as much details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
:::

### When the ABI is not available

```
let resultsParser = new ResultsParser();
let transactionOnNetwork = await networkProvider.getTransaction(txHash);
let { returnCode, returnMessage, values } = resultsParser.parseUntypedOutcome(transactionOnNetwork, endpointDefinition);
```

### When the ABI is available

```
let resultsParser = new ResultsParser();
let transactionOnNetwork = await networkProvider.getTransaction(txHash);
let { returnCode } = resultsParser.parseOutcome(transactionOnNetwork, endpointDefinition);
```

The `endpointDefinition` can be obtained from the `Interaction` object, if available in the context:

```
let endpointDefinition = interaction.getEndpoint();
```

Alternatively, the `endpointDefinition` can be obtained from the `SmartContract` object:

```
let endpointDefinition = smartContract.getEndpoint("myFunction");
```

For customizing the default parser, also see [extending erdjs](/sdk-and-tools/erdjs/extending-erdjs).


## Signing objects

:::note
For **dApps**, use the available **[signing providers](/sdk-and-tools/erdjs/erdjs-signing-providers)** instead.
:::

Creating a `UserSigner` from a JSON wallet:

```
import { UserSigner } from "@elrondnetwork/erdjs-walletcore";

const walletObject = JSON.parse(fs.readFileSync(filePath, { encoding: "utf8" }));
const signer = UserSigner.fromWallet(walletObject, "password");
```

Creating a `UserSigner` from a PEM file:

```
const pemText = fs.readFileSync(filePath, { encoding: "utf8" });
const signer = UserSigner.fromPem(pemText));
```

Signable objects (messages, transactions) must adhere to the following interface:

```
interface ISignable {
    serializeForSigning(signedBy: IAddress): Buffer;
    applySignature(signature: ISignature, signedBy: IAddress): void;
}
```

Both `Transaction` and `Message` - defined in `erdjs` - implement `ISignable`.

Signing a transaction:

```
import { Transaction } from "@elrondnetwork/erdjs";

const transaction = new Transaction({ ... });

await signer.sign(transaction);
console.log("Transaction signature", transaction.getSignature().hex());
console.log("Transaction hash", transaction.getHash().hex());
```

Signing an arbitrary message:

```
import { SignableMessage } from "@elrondnetwork/erdjs";

const dataExample = `${address}hello{}`;
const message = new SignableMessage({
    message: Buffer.from(dataExample)
});

await signer.sign(message);
const signature = message.getSignature().hex();
console.log("Message signature", signature);
```

## Verifying signatures

Creating a `UserVerifier`:

```
import { UserVerifier } from "@elrondnetwork/erdjs-walletcore";

const alice = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
const bob = Address.fromBech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");
const aliceVerifier = UserVerifier.fromAddress(alice);
const bobVerifier = UserVerifier.fromAddress(bob);
```

For objects to support signature verification, they must adhere to the following interface:

```
interface IVerifiable {
    serializeForSigning(signedBy?: IAddress): Buffer;
    getSignature(): ISignature;
}
```

Both `Transaction` and `Message` - defined in `erdjs` - implement `IVerifiable`.

Suppose we have the following transaction:

```
const tx = Transaction.fromPlainObject({
    nonce: 42,
    value: "12345",
    sender: alice.bech32(),
    receiver: "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    gasPrice: 1000000000,
    gasLimit: 50000,
    chainID: "D",
    version: 1,
    signature: "3c5eb2d1c9b3ab2f578541e62dcfa5008976d11f85644a48884a8a6c4d2980fa14954ab2924d6e67c051562488096d2e79cd3c0378edf234a52e648e672d1b0a"
});
```

And / or the following message:

```
const dataExample = `${alice.bech32()}hello{}`;
const message = new SignableMessage({
    message: Buffer.from(dataExample),
    signature: { hex: () => "5a7de64fb45bb11fc540839bff9de5276e1b17de542e7750b002e4663aea327b9834d4ac46b2c9531653113b7eb3eb000aef89943bd03fd96353fbcf03512809" }
});
```

We can verify their signatures as follows:

```
console.log("Is signature of Alice?", aliceVerifier.verify(tx));
console.log("Is signature of Alice?", aliceVerifier.verify(message));
console.log("Is signature of Bob?", bobVerifier.verify(tx));
console.log("Is signature of Bob?", bobVerifier.verify(message));
```

## Decoding transaction metadata

### Using the `transaction-decoder`

In order to decode the metadata (function, arguments, transfers) from a transaction payload, do as follows:

```
import { TransactionDecoder, TransactionMetadata } from "@elrondnetwork/transaction-decoder";

let transactionOnNetwork = await networkProvider.getTransaction(txHash);

let metadata = new TransactionDecoder().getTransactionMetadata({
    sender: transactionOnNetwork.sender.bech32(),
    receiver: transactionOnNetwork.receiver.bech32(),
    data: transactionOnNetwork.data.toString("base64"),
    value: transactionOnNetwork.value.toString(),
    type: transactionOnNetwork.type
});
```

### Using the `esdtHelpers` and `scArgumentsParser` of `erdjs 9x`

The classes `esdtHelpers` and `scArgumentsParser` have been removed in `erdjs 10`, in favor of the [@elrondnetwork/transaction-decoder](https://www.npmjs.com/package/@elrondnetwork/transaction-decoder) (see above). 

However, you can still find the previous implementations at the following location: 
 - [esdtHelpers](https://github.com/multiversx/mx-sdk-erdjs/blob/release/v9/src/esdtHelpers.ts)
 - [esdtHelpers examples](https://github.com/multiversx/mx-sdk-erdjs/blob/release/v9/src/esdtHelpers.spec.ts)
 - [scArgumentsParser](https://github.com/multiversx/mx-sdk-erdjs/blob/release/v9/src/scArgumentsParser.ts)
 - [scArgumentsParser examples](https://github.com/multiversx/mx-sdk-erdjs/blob/release/v9/src/scArgumentsParser.spec.ts)
 
