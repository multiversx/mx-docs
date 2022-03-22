---
id: writing-and-testing-erdjs-interactions
title: Writing and testing interactions
---

Writing and testing interactions

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
    "proxyUrl": "http://localhost:7950",
    "whalePem": "~/elrondsdk/testwallets/latest/users/alice.pem",
    ...
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
```

Then, in a subsequent step, you can load the previously stored contract address and token:

```
let myLotteryToken = await session.loadToken("lotteryToken");
...
let addressOfMyContract = await session.loadAddress("myContractAddress");
```

### Test users

A test session provides a set of test users to engage in smart contract interactions. They can be accessed as follows:

```
let whale = session.users.whale;
let alice = session.users.alice;
```

### Assertions

Don't forget to use _assert_ statements, which makes the snippets more valuable. For example:

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

Generally speaking, an interactor component depends on two objects: a `SmartContract` and a `SmartContractController` (both defined in erdjs).

### Creation of an interactor

Let's see how to construct an interactor (we use the lottery contract as an example).

First, you have to load the ABI:

```
let registry = await AbiRegistry.load({ files: [PathToAbi] });
let abi = new SmartContractAbi(registry, ["Lottery"]);
```

When loading the ABI from an url, change your code to:

```
let registry = await AbiRegistry.load({ url: [UrlToAbi] });
...
```

Then, create a `SmartContract` object as follows:

```
let contract = new SmartContract({ address: address, abi: abi });
```

If the address of the contract is yet unknown (e.g. prior deployment), then omit the address parameter above.

Now, create the `SmartContractController` and finally, the interactor:

```
let controller = new DefaultSmartContractController(abi, provider);
let interactor = new LotteryInteractor(contract, controller);
```

### Writing a contract query interaction

TBD

### Writing a contract call interaction

TBD