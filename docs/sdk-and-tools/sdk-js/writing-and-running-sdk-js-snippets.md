---
id: writing-and-testing-sdk-js-interactions
title: Writing and testing interactions
---

[comment]: # (mx-abstract)

:::important
Documentation on this page is partly deprecated, and subject to change.
:::

This tutorial will guide you through the process of (system) testing smart contracts by means of actual contract interactions, using **sdk-js** and **sdk-js snippets**. Everything in here is meant for **testing & auditing Smart Contracts**. This is not a tutorial for writing dApps.

:::important
**Do not reference** `sdk-js-snippets` library as a **regular** dependency (i.e. `dependencies` section) of your project (Node / dApp). Only reference it as a **development** dependency (i.e. `devDependencies` section).
:::

[comment]: # (mx-context-auto)

## IDE Prerequisites

In order to follow the steps in this tutorial, you need **Visual Studio Code** with the following extensions installed:

- [MultiversX IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide)
- [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter)

[comment]: # (mx-context-auto)

## Setup steps

[comment]: # (mx-context-auto)

### Setup the workspace

First, you need to open in Visual Studio Code a folder that will hold both the smart contracts and the interaction snippets. Upon opening a folder, you need to invoke the command `Elrond: Setup workspace`.

:::note
Make sure the latest MultiversX SDK is available in your environment. In order to do so, invoke the command `MultiversX: Install SDK`.
:::

[comment]: # (mx-context-auto)

### Add one or more smart contracts

In the **Templates** view of the MultiversX IDE, choose the template `adder` and click on **New Contract**. Then, choose the template `lottery-esdt` and click on **New Contract**. By doing so, MultiversX IDE will create one folder for each of the chosen smart contracts

An **additional folder** called `mx-skd-js-snippets` gets created, as well. That's a **nodejs** package, holding the source code for the **contract interaction** and for the test **snippets**.

Before moving further, make sure you build the two contracts (from the **Smart Contracts** view of the MultiversX IDE or using the command line, as desired).

[comment]: # (mx-context-auto)

### Set up the snippets

Now that you've created two contracts using the provided templates (and built them), let's tell the IDE (and the Mocha Test Explorer) where the snippets are located, by invoking the command `Elrond: Setup erdjs-snippets`. When asked to specify the folder containing the snippets, choose the already existing folder `mx-sdk-js-snippets`.

As previously mentioned, the folder `mx-sdj-js-snippets` is a nodejs package. Let's install its dependencies by running the following commands within the integrated terminal:

```bash
cd ./mx-sdk-js-snippets
npm install
```

The Mocha Test Explorer (Visual Studio Code extension) should now pick up the interaction snippets as regular mocha tests and list them in the **Testing** view, as follows:

![sdk-js-snippets in Mocha Test Explorer](/developers/sdk-and-tools/sdk-js/sdk-js-snippets-in-mocha-test-explorer.png)

By leveraging the Mocha Test Explorer, you can **run** and **debug** one, more or all **steps** of a snippets.

Now that your workspace and the snippets are set up, let's dive deeper. In the next section we'll learn **what is**, actually, an interaction snippet.

[comment]: # (mx-context-auto)

## Anatomy of an sdk-js snippet

A sdk-js **snippet** is, actually, a file that defines a suite of _mocha_ tests, having the extension `*.spec.ts` or `*.snippet.ts`. A **snippet step** is an individual test-like construct.

When executing one or more steps, they execute within a **test session**, selected by the following instruction of the snippet:

```js
session = await TestSession.load("nameOfMySession", __dirname);
```

[comment]: # (mx-context-auto)

### Session configuration

The test session is configured by means of a `nameOfMySession.session.json` file, located near the snippet(s) or one level above. In this file, you can configure the URL of the network provider, the test wallets to use etc. For example:

```json
{
  "networkProvider": {
    "type": "ProxyNetworkProvider",
    "url": "https://devnet-gateway.multiversx.com",
    "timeout": 5000
  },
  "users": {
    "individuals": [
      {
        "name": "alice",
        "pem": "~/multiversx-sdk/testwallets/latest/users/alice.pem"
      },
      {
        "name": "bob",
        "pem": "~/multiversx-sdk/testwallets/latest/users/bob.pem"
      }
    ],
    "groups": [
      {
        "name": "friends",
        "folder": "~/multiversx-sdk/testwallets/latest/users"
      }
    ]
  }
}
```

Another example, using the `ApiNetworkProvider` instead of `ProxyNetworkProvider`:

```json
{
    "networkProvider": {
        "type": "ApiNetworkProvider",
        "url": "https://devnet-api.multiversx.com",
        "timeout": 5000
    },
    "users": {
        ...
    }
}
```

[comment]: # (mx-context-auto)

### Session state

One of the main responsibilities of the test session object is to hold state among the steps (until it is explicitly destroyed). Under the hood, the state is saved in a lightweight **sqlite database** located near the `nameOfMySession.session.json` file.

:::note
One way to destroy the session is to delete it's `*.sqlite` file. Another way is to define a special step in your snippets, as follows:

```js
it("destroy session", async function () {
  await session.destroy();
});
```

However, in practice, sessions can be reused indefinitely.
:::

For example, in an early step you can save the address of a deployed contract, the identifier of an issued token or some arbitrary data:

```js
await session.saveAddress({ name: "myContractAddress", address: addressOfMyContract });
...
await session.saveToken({ name: "lotteryToken", token: myLotteryToken });
...
await session.saveBreadcrumb({ name: "someArbitraryData", value: { someValue: 42 } });
```

Then, in a subsequent step, you can load the previously stored contract address, token and arbitrary data:

```js
const myLotteryToken = await session.loadToken("lotteryToken");
...
const addressOfMyContract = await session.loadAddress("myContractAddress");
...
const someArbitraryData = await session.loadBreadcrumb("someArbitraryData");
```

[comment]: # (mx-context-auto)

### Assertions

It's recommended to make use of _assert_ statements, which makes the snippets more valuable and meaningful. For example:

```js
assert.isTrue(returnCode.isSuccess());
...
assert.equal(lotteryInfo.getFieldValue("token_identifier"), "myToken");
assert.equal(lotteryStatus, "someStatus");
```

[comment]: # (mx-context-auto)

### Test users

A test session provides a set of test users to engage in smart contract interactions. Given the session configuration provided as an example above, one can access the test users as follows:

```js
const alice: ITestUser = session.users.getUser("alice");
const bob: ITestUser = session.users.getUser("bob");
const friends: ITestUser[] = session.users.getGroup("friends");
```

[comment]: # (mx-context-auto)

### Generate secret keys for test users

`sdk-js-snippets` allows you to generate test users (secrey keys), as well. On this matter, you first have to provide a configuration file, which specifies some parameters for the generation process.

For example, let's create the file `myGenerator.json`:

```json
{
  "individuals": [
    {
      "shard": 0,
      "pem": "~/test-wallets/zero.pem"
    },
    {
      "shard": 1,
      "pem": "~/test-wallets/one.pem"
    },
    {
      "shard": 2,
      "pem": "~/test-wallets/two.pem"
    }
  ],
  "groups": [
    {
      "size": 3,
      "shard": 0,
      "pem": "~/test-wallets/manyZero.pem"
    },
    {
      "size": 3,
      "shard": 1,
      "pem": "~/test-wallets/manyOne.pem"
    },
    {
      "size": 3,
      "shard": 2,
      "pem": "~/test-wallets/manyTwo.pem"
    }
  ]
}
```

Then, in order to actually generate the test users (secret keys), add a step in an arbitrary snippet file and run it:

```js
describe("user operations snippet", async function () {
  it("generate keys", async function () {
    this.timeout(OneMinuteInMilliseconds);

    const config = readJson < ISecretKeysGeneratorConfig > "myGenerator.json";
    await generateSecretKeys(config);
  });
});
```

The resulted keys can be used as seen in the section [session configuration](/sdk-and-tools/sdk-js/writing-and-testing-sdk-js-interactions#session-configuration).

[comment]: # (mx-context-auto)

### Writing events in the audit log

At some point within the snippets or _interactor_ objects (more on that later), it's useful (for debugging and auditing Smart Contracts) to record events such as _sending a transaction_, _receiving a contract result_, or take account _state snapshots_ prior and / or after an interaction takes place. In order to do so, call the utility functions of the `Audit` object.

The recorded events will be listed in the session report(s) - more on that later.

For example, in the _interactor_:

```js
const transactionHash = await this.networkProvider.sendTransaction(transaction);
await this.audit.onTransactionSent({
  action: "add",
  args: [value],
  transactionHash: transactionHash,
});

const transactionOnNetwork = await this.transactionWatcher.awaitCompleted(
  transaction
);
await this.audit.onTransactionCompleted({
  transactionHash: transactionHash,
  transaction: transactionOnNetwork,
});
```

For example, in the snippet file:

```js
const sumBefore = await interactor.getSum();
const snapshotBefore = await session.audit.onSnapshot({
  state: { sum: sumBefore },
});

const returnCode = await interactor.add(owner, 3);
await session.audit.onContractOutcome({ returnCode });

const sumAfter = await interactor.getSum();
await session.audit.onSnapshot({
  state: { sum: sumBefore },
  comparableTo: snapshotBefore,
});
```

Above, note the `comparableTo` parameter of the snapshotting function. If provided, then a generated session report will include a difference between the two snapshots in question (**this feature isn't available as of `snk-js-snippets 3.0.0`**).

[comment]: # (mx-context-auto)

### Generate session reports

:::important
As of `sdk-js-snippets 3.0.0`, report generation is experimental. It will improve over time.
:::

`sdk-js-snippets` can generate a HTML report based on the data and events accumulated within a test session.

In order to configure the reporting feature, define an additional entry in the session configuration file:

```json
"reporting": {
    "explorerUrl": "https://devnet-explorer.multiversx.com",
    "apiUrl": "https://devnet-api.multiversx.com",
    "outputFolder": "~/reports"
}
```

Then, in order to generate a report, add an extra snippet step:

```js
it("generate report", async function () {
  await session.generateReport();
});
```

Upon running the step, the `outputFolder` should contain the generated session report(s).

[comment]: # (mx-context-auto)

### Dependence on interactors

The most important dependency of a snippet is the **contract interactor**, which is responsible with creating and executing sdk-js-based interactions and contract queries.

[comment]: # (mx-context-auto)

## Anatomy of an interactor

In our workspace, the interactors are: `adderInteractor.ts` and `lotteryInteractor.ts`. They contain _almost_ production-ready code to call and query your contracts, code which is _generally_ copy-paste-able into your dApps.

Generally speaking, an interactor component (class) depends on the following objects (defined by `sdk-js` or by satellites of `sdk-js`):

- a `SmartContract` (composed with its `SmartContractAbi`)
- an `INetworkProvider`, to broadcast / retrieve transactions and perform contract queries
- a snapshot of the `INetworkConfig`
- a `TransactionWatcher`, to properly detect the completion of a transaction
- a `ResultsParser`, to parse the outcome of contract queries or contract interactions
- optionally, an `IAudit` object to record certain events within the test session

[comment]: # (mx-context-auto)

### Creation of an interactor

Let's see how to construct an interactor (we use the lottery contract as an example).

First, you have to load the ABI:

```js
const registry = await loadAbiRegistry(PathToAbi);
const abi = new SmartContractAbi(registry);
```

:::important
Make sure you have a look over the [cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook), in advance.
:::

Then, create a `SmartContract` object as follows:

```js
const contract = new SmartContract({ address: address, abi: abi });
```

If the address of the contract is yet unknown (e.g. prior deployment), then omit the address parameter above.

Afterwards, hold a reference to the `NetworkProvider` and the `NetworkConfig` snapshot provided by the test session:

```js
const networkProvider = session.networkProvider;
const networkConfig = session.getNetworkConfig();
```

Finally, create the interactor:

```js
const interactor = new LotteryInteractor(
  contract,
  networkProvider,
  networkConfig
);
```

In our examples, the `TransactionWatcher` and the `ResultsParser` are usually instantiated by the interactor class (e.g. in the constructor) instead of being provided as a dependency. This should not be considered a guideline though. Here is how you would create the transaction watcher and the results parser:

```js
const transactionWatcher = new TransactionWatcher(networkProvider);
const resultsParser = new ResultsParser();
```

In the end, the code that creates an interactor looks as follows:

```js
export async function createLotteryInteractor(
  session: ITestSession,
  contractAddress?: IAddress
): Promise<LotteryInteractor> {
  const registry = await loadAbiRegistry(PathToAbi);
  const abi = new SmartContractAbi(registry);
  const contract = new SmartContract({ address: contractAddress, abi: abi });
  const networkProvider = session.networkProvider;
  const networkConfig = session.getNetworkConfig();
  const audit = session.audit;
  const interactor = new LotteryInteractor(
    contract,
    networkProvider,
    networkConfig,
    audit
  );
  return interactor;
}
```

Where the class `LotteryInteractor` is defined like this:

```js
export class LotteryInteractor {
    private readonly contract: SmartContract;
    private readonly networkProvider: INetworkProvider;
    private readonly networkConfig: INetworkConfig;
    private readonly transactionWatcher: TransactionWatcher;
    private readonly resultsParser: ResultsParser;
    private readonly audit: IAudit;

    constructor(contract: SmartContract, networkProvider: INetworkProvider, networkConfig: INetworkConfig, audit: IAudit) {
        this.contract = contract;
        this.networkProvider = networkProvider;
        this.networkConfig = networkConfig;
        this.transactionWatcher = new TransactionWatcher(networkProvider);
        this.resultsParser = new ResultsParser();
        this.audit = audit;
    }

    // ... methods of the interactor (see next section)
}
```

[comment]: # (mx-context-auto)

### Methods of the interactor

Generally speaking, when writing an interactor, you'd like to have a function (method) for each endpoint of the smart contract. While this is straightforward when writing query functions against `readonly` / `get` endpoints, for `executable` / `do` endpoints you need to build, **sign** (using a signing / wallet provider) and broadcast a transaction, then optionally await for its execution and parse the results (if any).

The interrupted nature of the flow for calling `executable` endpoints and the eventual context switching required by some of the signing / wallet providers (e.g. navigating through web pages) makes it (the flow) a bit harder to be captured in a single function (method) of the interactor in an _universally applicable manner_. However, the example interactors follow the _one method for each endpoint_ guideline, since they use a _test user_ object to sign the transactions (that is, no external signing provider).

[comment]: # (mx-context-auto)

### Writing an interactor method for a contract query

:::important
Make sure you have a look over the [cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook), in advance.
:::

In order to implement a contract query as a method of your interactor, you first need to the prepare the `Interaction` object:

```js
// Example 1 (adder contract)
const interaction = <Interaction>this.contract.methods.getSum();

// Example 2 - automatic type inference of parameters (lottery contract)
const interaction = <Interaction>this.contract.methods.status(["my-lottery"]);

// Example 2 - explicit types (lottery contract)
const interaction = <Interaction>this.contract.methodsExplicit.status([
    BytesValue.fromUTF8("my-lottery")
]);

// Example 3 - automatic type inference of parameters (lottery contract)
const interaction = <Interaction>this.contract.methodsAuto.getLotteryWhitelist(["my-lottery"]);

// Example 3 - explicit types (lottery contract)
const interaction = <Interaction>this.contract.methodsExplicit.getLotteryWhitelist([
    BytesValue.fromUTF8("my-lottery")
]);

// Example 4 - automatic type inference of parameters (lottery contract)
const interaction = <Interaction>this.contract.methods.getLotteryInfo(["my-lottery"]);

// Example 4 - explicit types (lottery contract)
const interaction = <Interaction>this.contract.methodsExplicit.getLotteryInfo([
    BytesValue.fromUTF8("my-lottery")
]);
```

Above, you may notice there are two possible ways for providing the arguments to the interaction: the **explicitly** mode and the **implicit** mode, also called **the auto mode** - since it performs _automatic type inference_ (within sdk-js' own typesystem) with respect to the endpoint definition (more precisely, with respect to the ABI types of the input arguments). You can choose any of the modes to provide the arguments for the interaction. Pick the one that best suits your programming style.

Afterwards, you should verify the interaction object with respect to the ABI (skip this step if you are using the _auto mode_). It will throw an error if the ABI (more specifically, the input parameters of the endpoint) is not followed:

```js
interaction.check();
```

Now Let's run the query:

```js
let queryResponse = await this.networkProvider.queryContract(query);
```

Then parse the results:

```js
// Example 1
const { firstValue } = this.resultsParser.parseQueryResponse(
  queryResponse,
  interaction.getEndpoint()
);

// Example 2
const { firstValue, secondValue, thirdValue } =
  this.resultsParser.parseQueryResponse(
    queryResponse,
    interaction.getEndpoint()
  );

// Example 3
const { values, returnCode } = this.resultsParser.parseQueryResponse(
  queryResponse,
  interaction.getEndpoint()
);

// Example 4
const bundle = this.resultsParser.parseQueryResponse(
  queryResponse,
  interaction.getEndpoint()
);
```

In the end, you would (optionally) cast, then interpret the values in the bundle (when necessary), before returning them to the caller of the interactor function (method):

```js
// Example 1
const firstValueAsBigUInt = <BigUIntValue>firstValue;
return firstValueAsBigUInt.valueOf().toNumber();

// Example 2
const firstValueAsEnum = <EnumValue>firstValue;
return firstValueAsEnum.name;

// Example 3
const firstValueAsVariadic = <VariadicValue>firstValue;
return firstValueAsVariadic.valueOf();

// Example 4 (not calling valueOf())
const firstValueAsStruct = <Struct>firstValue;
return firstValueAsStruct;
```

Now let's put the code together and see some full examples.

Getting the status of a lottery **(enum)**:

```js
// Interactor method:
async getStatus(lotteryName: string): Promise<string> {
    // Prepare the interaction
    const interaction = <Interaction>this.contract.methods.status([lotteryName]);
    const query = interaction.check().buildQuery();

    // Let's run the query and parse the results:
    const queryResponse = await this.networkProvider.queryContract(query);
    const { firstValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

    // Now let's interpret the results.
    const firstValueAsEnum = <EnumValue>firstValue;
    return firstValueAsEnum.name;
}

// Caller:
let status: string = await interactor.getStatus("my-lottery");
console.log(status);
```

Getting the lottery info **(struct)**:

```js
// Interactor method:
async getLotteryInfo(lotteryName: string): Promise<Struct> {
    // Prepare the interaction
    const interaction = <Interaction>this.contract.methods.getLotteryInfo([lotteryName]);
    const query = interaction.check().buildQuery();

    // Let's run the query and parse the results:
    const queryResponse = await this.networkProvider.queryContract(query);
    const { firstValue } = this.resultsParser.parseQueryResponse(queryResponse, interaction.getEndpoint());

    // Now let's interpret the results.
    const firstValueAsStruct = <Struct>firstValue;
    return firstValueAsStruct;
}

// Caller:
const lotteryInfo: Struct = await interactor.getLotteryInfo("my-lottery");
console.log(lotteryInfo.valueOf());
console.log(lotteryInfo.getFieldValue("token_identifier"));
console.log(lotteryInfo.getFieldValue("prize_pool"));
```

[comment]: # (mx-context-auto)

### Writing an interactor method for a contract call

:::important
Make sure you have a look over the [cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook), in advance.
:::

In order to implement a contract call as a method of your interactor, you first need to the prepare the `Interaction` object:

```js
// Example 1 (adder)
const interaction = <Interaction>this.contract.methods
    .add([new BigUIntValue(value)])
    .withGasLimit(new GasLimit(10000000))
    .withNonce(caller.account.getNonceThenIncrement());
```

```js
// Example 2 - automatic type inference (lottery)
const interaction = <Interaction>this.contract.methods
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

```js
// Example 2 - explicit types (lottery)
const interaction = <Interaction>this.contract.methodsExplicit
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

```js
// Example 3 - automatic type inference (lottery)
const interaction = <Interaction>this.contract.methods
    .buy_ticket([lotteryName])
    .withGasLimit(new GasLimit(50000000))
    .withSingleESDTTransfer(amount)
    .withNonce(user.account.getNonceThenIncrement());
```

:::note
Generally, it is the interactors where you specify the default **gas limit** and apply the **payments** (token transfers) on the contract calls (above, see `withGasLimit` and `withSingleESDTTransfer`), but there are other ways to design this, according to your needs.
:::

:::important
The account nonce must be synchronized beforehand (that is, before calling the interactor method).
:::

Afterwards, you should verify the interaction object with respect to the ABI (skip this step if you are using the _auto mode_), then build the transaction object:

```js
let transaction = interaction.check().buildTransaction();
```

Then, use a signer (e.g. a dApp provider) to sign the transaction. In the snippets, we use the `ITestUser` object to perform the signing:

```js
await owner.signer.sign(transaction);
```

Now let's broadcast the transaction and await its completion:

```js
await this.networkProvider.sendTransaction(transaction);
const transactionOnNetwork = await this.transactionWatcher.awaitCompleted(
  transaction
);
```

In the end, we parse the results into an object called `TypedOutcomeBundle` (just like for query responses):

```js
// Example 1
const { returnCode } = this.resultsParser.parseOutcome(
  transactionOnNetwork,
  interaction.getEndpoint()
);

// Example 2
const bundle = this.resultsParser.parseOutcome(
  transactionOnNetwork,
  interaction.getEndpoint()
);

// Example 3
const { returnCode, firstValue } = this.resultsParser.parseOutcome(
  transactionOnNetwork,
  interaction.getEndpoint()
);
```

Then, for interpreting the results, follow the same guidelines as for query results (section above).

Now let's put the code together and see a full example:

```js
async buyTicket(user: ITestUser, lotteryName: string, amount: TokenPayment): Promise<ReturnCode> {
    console.log(`LotteryInteractor.buyTicket(): address = ${user.address}, amount = ${amount.toPrettyString()}`);

    // Prepare the interaction
    let interaction = <Interaction>this.contract.methods
        .buy_ticket([
            lotteryName
        ])
        .withGasLimit(50000000)
        .withSingleESDTTransfer(amount)
        .withNonce(user.account.getNonceThenIncrement())
        .withChainID(this.networkConfig.ChainID);

    // Let's check the interaction, then build the transaction object.
    let transaction = interaction.check().buildTransaction();

    // Let's sign the transaction. For dApps, use a wallet provider instead.
    await user.signer.sign(transaction);

    // Let's broadcast the transaction and await its completion:
    const transactionHash = await this.networkProvider.sendTransaction(transaction);
    await this.audit.onTransactionSent({ action: "buyTicket", args: [lotteryName, amount.toPrettyString()], transactionHash: transactionHash });

    const transactionOnNetwork = await this.transactionWatcher.awaitCompleted(transaction);
    await this.audit.onTransactionCompleted({ transactionHash: transactionHash, transaction: transactionOnNetwork });

    // In the end, parse the results:
    let { returnCode } = this.resultsParser.parseOutcome(transactionOnNetwork, interaction.getEndpoint());
    return returnCode;
}
```
