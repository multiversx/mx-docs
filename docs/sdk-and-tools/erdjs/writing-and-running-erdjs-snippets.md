---
id: writing-and-running-erdjs-snippets
title: Writing and running erdjs-snippets
---

Writing and running erdjs-snippets

This tutorial will guide you through the process of writing and running smart contract interaction snippets using **erdjs**.

## Prerequisites

In order to write and execute contract interaction snippets based on **erdjs** and [**mocha**](https://mochajs.org), you need **Visual Studio Code** with the following extensions installed:

 - [Elrond IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide)
 - [Mocha Test Explorer](https://marketplace.visualstudio.com/items?itemName=hbenl.vscode-mocha-test-adapter)

## Steps

### Setup the workspace

First, you need to open in Visual Studio Code a folder that will hold both the smart contracts and the interaction snippets. Upon opening a folder, you need to invoke the command `Elrond: Setup workspace`.

:::note
Make sure the latest Elrond SDK is available in your environment. In order to do so, invoke the command `Elrond: Install SDK`.
:::

### Add one or more smart contracts

In the **Templates** view of the Elrond IDE, choose the template `adder` and click on **New Contract**. Then, choose the template `lottery-esdt` and click on **New Contract**. By doing so, Elrond IDE will create one folder for each of the chosen smart contracts, and an additional folder called `erdjs-snippets`. The latter is a **nodejs package** holding the source code for the contract interaction snippets.

Before moving further, let's build the two contracts from the **Smart Contracts** view of the Elrond IDE.

### Setup the snippets

Now that you've created two contracts using the provided templates, let's tell the IDE (and the Mocha Test Explorer) where the snippets are located by invoking the command `Elrond: Setup erdjs-snippets`. When asked to specify the folder containing the snippets, choose the previously created folder `erdjs-snippets`.

As previously mentioned, the folder `erdjs-snippets` is a nodejs package. Let's install its dependencies by running the following commands within the integrated terminal:

```
cd ./erdjs-snippets
npm install
```

The Mocha Test Explorer should now pick up the interaction snippets as regular mocha tests and list them in the **Testing** view, as follows:

![erdjs-snippets in Mocha Test Explorer](/developers/sdk-and-tools/erdjs/erdjs-snippets-in-mocha-test-explorer.png)