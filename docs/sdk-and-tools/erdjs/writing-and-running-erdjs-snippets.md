---
id: writing-and-testing-erdjs-interactions
title: Writing and testing interactions
---

Writing and testing interactions

:::important
This tutorial makes use of `erdjs 10`.
:::

This tutorial will guide you through the process of writing smart contract interactions using **erdjs** and run (test) them as [**mocha**](https://mochajs.org)-based **erdjs snippets**.

## IDE Prerequisites

In order to follow the steps in this tutorial, you need **Visual Studio Code** with the following extensions installed:

 - [Elrond IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide)
 - [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter)

## Setup steps

### Setup the workspace

First, you need to open in Visual Studio Code a folder that will hold both the smart contracts and the interaction snippets. Upon opening a folder, you need to invoke the command `Elrond: Setup workspace`.

:::note
Make sure the latest Elrond SDK is available in your environment. In order to do so, invoke the command `Elrond: Install SDK`.
:::

### Add one or more smart contracts

In the **Templates** view of the Elrond IDE, choose the template `adder` and click on **New Contract**. Then, choose the template `lottery-esdt` and click on **New Contract**. By doing so, Elrond IDE will create one folder for each of the chosen smart contracts

An **additional folder** called `erdjs-snippets` gets created, as well. That's a **nodejs** package, holding the source code for the **contract interaction** and for the test **snippets**.

Before moving further, make sure you build the two contracts (from the **Smart Contracts** view of the Elrond IDE or using the command line, as desired).

### Setup the snippets

Now that you've created two contracts using the provided templates (and built them), let's tell the IDE (and the Mocha Test Explorer) where the snippets are located, by invoking the command `Elrond: Setup erdjs-snippets`. When asked to specify the folder containing the snippets, choose the already existing folder `erdjs-snippets`.

As previously mentioned, the folder `erdjs-snippets` is a nodejs package. Let's install its dependencies by running the following commands within the integrated terminal:

```
cd ./erdjs-snippets
npm install
```

The Mocha Test Explorer (Visual Studio Code extension) should now pick up the interaction snippets as regular mocha tests and list them in the **Testing** view, as follows:

![erdjs-snippets in Mocha Test Explorer](/developers/sdk-and-tools/erdjs/erdjs-snippets-in-mocha-test-explorer.png)

By leveraging the Mocha Test Explorer, you can **run** and **debug** one, more or all **steps** of a snippets.

Now that your workspace and the snippets are set up, let's dive deeper. In the next section we'll learn **what is**, actually, an interaction snippet.

## Anatomy of an erdjs snippet

An erdjs **snippet** is, actually, a file that defines a suite of _mocha_ tests, having the extension `*.spec.ts` or `*.snippet.ts`. A **snippet step** is an individual test-like construct. 

When executing one or more steps, they execute within a **test session**, selected by the following instruction of the snippet:

```
session = await TestSession.loadOnSuite("nameOfMySession", suite);
```

### Session configuration

The test session is configured by means of a `nameOfMySession.session.json` file, located near the snippet(s) or one level above. In this file, you can configure the URL of the network provider, the test wallets to use etc. For example:

```
{
    "networkProvider": {
        "type": "ProxyNetworkProvider",
        "url": "https://devnet-gateway.elrond.com"
    },
    "users": {
        "individuals": [
            {
                "name": "alice",
                "pem": "~/elrondsdk/testwallets/latest/users/alice.pem"
            },
            {
                "name": "bob",
                "pem": "~/elrondsdk/testwallets/latest/users/bob.pem"
            }
        ],
        "groups": [
            {
                "name": "friends",
                "folder": "~/elrondsdk/testwallets/latest/users"
            }
        ]
    }
}
```

Another example, using the `ApiNetworkProvider` instead of `ProxyNetworkProvider`:

```
{
    "networkProvider": {
        "type": "ApiNetworkProvider",
        "url": "https://devnet-api.elrond.com"
    },
    "users": {
        ...
    }
}
```

### Session state

One of the main responsibilities of the test session object is to hold state among the steps (until it is explicitly destroyed). Under the hood, the state is saved in a lightweight **sqlite database** located near the `nameOfMySession.session.json` file.

:::note
Currently, the only way to destroy a session is to delete it's `*.sqlite` file. However, in practice, sessions can be reused indefinitely.
:::

For example, in an early step you can save the address of a deployed contract or the identifier of an issued token:

```
await session.saveAddress("myContractAddress", addressOfMyContract);
...
await session.saveToken("lotteryToken", myLotteryToken);
...
await session.saveBreadcrumb("someArbitraryData", { someValue: 42 });
```

Then, in a subsequent step, you can load the previously stored contract address and token:

```
let myLotteryToken = await session.loadToken("lotteryToken");
...
let addressOfMyContract = await session.loadAddress("myContractAddress");
...
let someArbitraryData = await session.loadBreadcrumb("someArbitraryData");
```

### Test users

A test session provides a set of test users to engage in smart contract interactions. Given the session configuration provided as an example above, one can access the test users as follows:

```
let alice: ITestUser = session.users.getUser("alice");
let bob: ITestUser = session.users.getUser("bob");
let friends: ITestUser[] = session.users.getGroup("friends");
```

### Assertions

Don't forget to use _assert_ statements, which makes the snippets more valuable and meaningful. For example:

```
assert.isTrue(returnCode.isSuccess());
...
assert.equal(lotteryInfo.getFieldValue("token_identifier"), "myToken");
assert.equal(lotteryStatus, "someStatus");
```

### Dependence on interactors

The most important dependency of a snippet is the **contract interactor**, which is responsible with creating and executing erdjs-based interactions and contract queries.

## Anatomy of an interactor

In our workspace, the interactors are: `adderInteractor.ts` and `lotteryInteractor.ts`. They contain almost production-ready code to call and query your contracts, code which is mostly copy-paste-able into your dApps.

Generally speaking, an interactor component depends on the following objects (defined by `erdjs` or by satellites of `erdjs`):
 - a `SmartContract` (composed with its `SmartContractAbi`)
 - a `NetworkProvider`, to broadcast / retrieve transactions and perform contract queries
 - a snapshot of the `NetworkConfig`
 - a `TransactionWatcher`, to properly detect the completion of a transaction
 - a `ResultsParser`, to parse the outcome of contract queries or contract interactions

### Creation of an interactor

Let's see how to construct an interactor (we use the lottery contract as an example).

First, you have to load the ABI:

```
let registry = await loadAbiRegistry(PathToAbi);
let abi = new SmartContractAbi(registry, ["Lottery"]);
```

**TBD: REFERENCE TO COOKBOOK (page).**

Then, create a `SmartContract` object as follows:

```
let contract = new SmartContract({ address: address, abi: abi });
```

If the address of the contract is yet unknown (e.g. prior deployment), then omit the address parameter above.

Afterwards, hold a reference to the `NetworkProvider` and the `NetworkConfig` snapshot provided by the test session:

```
let networkProvider = session.networkProvider;
let networkConfig = session.getNetworkConfig();
```

Finally, create the interactor:

```
let interactor = new LotteryInteractor(contract, networkProvider, networkConfig);
```

In our examples, the `TransactionWatcher` and the `ResultsParser` are usually instantiated by the interactor class (e.g. in the constructor) instead of being provided as a dependency. This should not be considered a guideline though. Strive to apply the most appropriate software design to your dApp.

### Methods of the interactor

Generally speaking, when writing an interactor, you'd like to have a function (method) for each endpoint of the smart contract. While this is straightforward when writing query functions against `readonly` / `get` endpoints, for `executable` / `do` endpoints you need to build, **sign** (using a signing / wallet provider) and broadcast a transaction, then optionally await for its execution and parse the results (if any). The interrupted nature of the flow for calling `executable` endpoints and the eventual context switching required by some of the signing / wallet providers (e.g. navigating through web pages) makes it (the flow) a bit harder to be captured in a single function (method) of the interactor in an _universally applicable manner_. However, the example interactors follow the _one method for each endpoint_ guideline, since they use a _test user_ object to sign the transactions (that is, no external signing provider).

### Writing an interactor method for a contract query

In order to implement a contract query as a method of your interactor, you first need to the prepare the `Interaction` object:

```
// Example 1 (adder contract)
let interaction = <Interaction>this.contract.methods.getSum();

// Example 2 - automatic type inference of parameters (lottery contract)
let interaction = <Interaction>this.contract.methods.status(["my-lottery"]);

// Example 2 - explicit types (lottery contract)
let interaction = <Interaction>this.contract.methodsExplicit.status([
    BytesValue.fromUTF8("my-lottery")
]);

// Example 3 - automatic type inference of parameters (lottery contract)
let interaction = <Interaction>this.contract.methodsAuto.getLotteryWhitelist(["my-lottery"]);

// Example 3 - explicit types (lottery contract)
let interaction = <Interaction>this.contract.methodsExplicit.getLotteryWhitelist([
    BytesValue.fromUTF8("my-lottery")
]);

// Example 4 - automatic type inference of parameters (lottery contract)
let interaction = <Interaction>this.contract.methods.getLotteryInfo(["my-lottery"]);

// Example 4 - explicit types (lottery contract)
let interaction = <Interaction>this.contract.methodsExplicit.getLotteryInfo([
    BytesValue.fromUTF8("my-lottery")
]);
```

Above, you may notice there are two possible ways for providing the arguments to the interaction: the **explicity** mode and the **implicit** mode, also called **the auto mode** - since it performs _automatic type inference_ (within erdjs' own typesystem) with respect to the endpoint definition (more precisely, with respect to the ABI types of the input arguments). You can choose any of the modes to provide the arguments for the interaction. Pick the one that best suits your programming style.

Afterwards, you should verify the interaction object with respect to the ABI (skip this step if you are using the _auto mode_). It will throw an error if the ABI (more specifically, the input parameters of the endpoint) is not followed:

```
interaction.check();
```

Now Let's run the query:

```
let queryResponse = await this.networkProvider.queryContract(query);
```

Then parse the results:

```
// Example 1
let { firstValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

// Example 2
let { firstValue, secondValue, thirdValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

// Example 3
let { values, returnCode } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

// Example 4
let bundle = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());
```

In the end, you would (optionally) cast, then interpret the values in the bundle (when necessary), before returning them to the caller of the interactor function (method):

```
// Example 1
let firstValueAsBigUInt = <BigUIntValue>firstValue;
return firstValueAsBigUInt.valueOf().toNumber();

// Example 2
let firstValueAsEnum = <EnumValue>firstValue;
return firstValueAsEnum.name;

// Example 3
let firstValueAsVariadic = <VariadicValue>firstValue;
return firstValueAsVariadic.valueOf();

// Example 4 (not calling valueOf())
let firstValueAsStruct = <Struct>firstValue;
return firstValueAsStruct;
```

Now let's put the code together and see some full examples.

Getting the status of a lottery **(enum)**:

```
// Interactor method:
async getStatus(lotteryName: string): Promise<string> {
    // Prepare the interaction
    let interaction = <Interaction>this.contract.methods.status([lotteryName]);
    let query = interaction.check().buildQuery();

    // Let's run the query and parse the results:
    let queryResponse = await this.networkProvider.queryContract(query);
    let { firstValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

    // Now let's interpret the results.
    let firstValueAsEnum = <EnumValue>firstValue;
    return firstValueAsEnum.name;
}

// Caller:
let status: string = await interactor.getStatus("my-lottery");
console.log(status);
```

Getting the lottery info **(struct)**:

```
// Interactor method:
async getLotteryInfo(lotteryName: string): Promise<Struct> {
    // Prepare the interaction
    let interaction = <Interaction>this.contract.methods.getLotteryInfo([lotteryName]);
    let query = interaction.check().buildQuery();

    // Let's run the query and parse the results:
    let queryResponse = await this.networkProvider.queryContract(query);
    let { firstValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

    // Now let's interpret the results.
    let firstValueAsStruct = <Struct>firstValue;
    return firstValueAsStruct;
}

// Caller:
let lotteryInfo: Struct = await interactor.getLotteryInfo("my-lottery");
console.log(lotteryInfo.valueOf());
console.log(lotteryInfo.getFieldValue("token_identifier"));
console.log(lotteryInfo.getFieldValue("prize_pool"));
```

### Writing an interactor method for a contract call

In order to implement a contract call as a method of your interactor, you first need to the prepare the `Interaction` object:

```
// Example 1 (adder)
let interaction = <Interaction>this.contract.methods
    .add([new BigUIntValue(value)])
    .withGasLimit(new GasLimit(10000000))
    .withNonce(caller.account.getNonceThenIncrement());
```
```
// Example 2 (lottery)
let interaction = <Interaction>this.contract.methods
    .start([
        BytesValue.fromUTF8(lotteryName),
        new TokenIdentifierValue(token_identifier),
        new BigUIntValue(price),
        OptionValue.newMissing(),
        OptionValue.newMissing(),
        OptionValue.newProvided(new U32Value(1)),
        OptionValue.newMissing(),
        OptionValue.newProvided(createListOfAddresses(whitelist)),
        OptionalValue.newMissing()
    ])
    .withGasLimit(new GasLimit(20000000))
    .withNonce(owner.account.getNonceThenIncrement());
```
```
// Example 2-auto (lottery)
let interaction = <Interaction>this.contract.methodsAuto
    .start([
        lotteryName,
        token_identifier,
        price,
        null,
        null,
        1
        null,
        whitelist
        // not provided
    ])
    .withGasLimit(new GasLimit(20000000))
    .withNonce(owner.account.getNonceThenIncrement());
```
```
// Example 3 (lottery)
let interaction = <Interaction>this.contract.methods
    .buy_ticket([
        BytesValue.fromUTF8(lotteryName)
    ])
    .withGasLimit(new GasLimit(50000000))
    .withSingleESDTTransfer(amount)
    .withNonce(user.account.getNonceThenIncrement());
```

:::note
Generally, it is the interactors where you specify the default **gas limit** and apply the **payments** (token transfers) on the contract calls, but there are other ways to design this, according to your needs.
:::

:::important
The account nonce must be synchronized beforehand (that is, before calling the interactor method).
:::

After that, you need to build the transaction object:

```
let transaction: Transaction = interaction.buildTransaction();
```

And now you have to sign the transaction using your provider of choice.

Once you've signed the transaction, you feed both the interaction object and the signed transaction to the smart contract controller, which verifies the interaction object with respect to the ABI, broadcast the transaction (using the Network Provider), awaits for its completion and parses the results into an object called `TypedOutcomeBundle`. It returns both the bundle and the `TransactionOnNetwork` object:

```
// Example 1
let { bundle: { returnCode } } = await this.controller.execute(interaction, transaction);

// Example 2
let { transactionOnNetwork, bundle } = await this.controller.execute(interaction, transaction);

// Example 3
let { bundle: { returnCode, firstValue } } = await this.controller.execute(interaction, transaction);
```

Then, for interpreting the results, follow the same guidelines as for query results (section above).

## Dissecting the contracts controller

### Contract calls

If, for some reason, the function `controller.execute()` depicted above brings undesired constraints in your application, you can replicate (and adjust) its behaviour with ease.

First, create an interaction checker and a results parser:

```
let checker = new InteractionChecker();
let parser = new ResultsParser();
```

Suppose that the following objects are available in your scope:

```
let abi: SmartContractAbi;
let provider: IProvider;
let interaction: Interaction;
let signedTransaction: Transaction;
```

Then, check the interaction against the ABI (optionally), broadcast the transaction, await for its completion and parse the contract results as follows:

```
let endpoint = abi.getEndpoint(interaction.getFunction());
checker.checkInteraction(interaction, endpoint);

await transaction.send(provider);
await transaction.awaitExecuted(provider);
let transactionOnNetwork = await transaction.getAsOnNetwork(provider);
let bundle = parser.parseOutcome(transactionOnNetwork, endpoint);
```

### Contract queries

If, for some reason, the function `controller.query()` depicted above brings undesired constraints in your application, you can replicate (and adjust) its behaviour with ease.

First, create an interaction checker and a results parser:

```
let checker = new InteractionChecker();
let parser = new ResultsParser();
```

Suppose that the following objects are available in your scope:

```
let abi: SmartContractAbi;
let provider: IProvider;
let interaction: Interaction;
```

Then, check the interaction against the ABI (optionally), query the provider and parse the results as follows:

```
let endpoint = abi.getEndpoint(interaction.getFunction());
checker.checkInteraction(interaction, endpoint);

let query = interaction.buildQuery();
let queryResponse = await provider.queryContract(query);
let bundle = parser.parseQueryResponse(queryResponse, endpoint);
```
