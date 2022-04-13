---
id: erdjs-cookbook
title: Cookbook (common tasks)
---

:::important
This cookbook makes use of `erdjs 10`.
:::

This page will guide you through the process of handling common tasks using **erdjs**.

## Fetching network parameters

### Using the API Provider

```
import { ApiNetworkProvider } from "@elrondnetwork/erdjs-network-providers";

let networkProvider = new ApiNetworkProvider("https://devnet-api.elrond.com");
let networkConfig = await networkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

### Using the Proxy Provider

```
import { ProxyNetworkProvider } from "@elrondnetwork/erdjs-network-providers";

let networkProvider = new ProxyNetworkProvider("https://devnet-gateway.elrond.com");
let networkConfig = await networkProvider.getNetworkConfig();
console.log(networkConfig.MinGasPrice);
console.log(networkConfig.ChainID);
```

## Working with accounts

### Synchronizing an account object

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account, and updates the local representation of the account.

```
let addressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
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

## Prepairing payment objects

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
```

A `TokenPayment` object for transferring **semi-fungible** tokens:

```
```

A `TokenPayment` object for transferring **non-fungible** tokens:

```
```

A `TokenPayment` object for transferring **meta-esdt** tokens:

```
```

## Broadcasting transactions

### Preparing a simple transaction

```
let tx = new Transaction({
    data: new TransactionPayload("helloWorld"),
    gasLimit: 70000,
    receiver: new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value: TokenPayment.egldFromAmount(1)
});
```

### Broadcast using a network provider

```
let txHash = await networkProvider.send(tx);
```

### Broadcast using `axios`

```
let data = tx.toSendable();
let url = "https://devnet-api.elrond.com/transactions";
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

## Token transfers

Transfer **fungible** tokens:

```
```

Transfer **semi-fungible** tokens:

```
```

Transfer **non-fungible** tokens:

```
```

Transfer **meta-esdt** tokens:

```
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
    responseType: 'arraybuffer',
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

## Parsing contract results

In order to parse the outcome of a smart contract using a `ResultsParser`, you need:
 - the representation of the transaction, as fetched from the Network
 - the ABI definition of the called endpoint

```
let parser = new ResultsParser();
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

## Contract queries

## Contract interactions

### Transfer & execute
