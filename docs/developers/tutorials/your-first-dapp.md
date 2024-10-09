---
id: your-first-dapp
title: Build a dApp in 15 minutes
---

[comment]: # (mx-abstract)

Let's build your first decentralized App on the MultiversX Blockchain!

### Prerequisites

[comment]: # (mx-context-auto)

#### mxpy

We're going to use [**mxpy**](/sdk-and-tools/sdk-py/mxpy-cli) to create a wallet and deploy a contract. Follow the installation guide [here](/sdk-and-tools/sdk-py/installing-mxpy) - make sure to use the latest version available.

[comment]: # (mx-context-auto)

#### Rust

Install **Rust** and [**sc-meta**](/developers/meta/sc-meta) as depicted [here](/sdk-and-tools/troubleshooting/rust-setup). They are required to build smart contracts.

[comment]: # (mx-context-auto)

### **dApp Description**

![img](/developers/tutorial/dapp-problem.png)

The **Ping-Pong app** is a very simple decentralized application that will allow the user to deposit a specific number of tokens (default is 1 xEGLD) to a smart contract address and to lock them for a specific amount of time (default is 10 minutes). After this time interval passes, the user can claim back the same amount of tokens.
Sending funds to the contract is called `ping`.
Claiming the same amount back is called `pong`.

Other rules:

- the user can only `ping` **once** before `pong` (so no multiple pings).
- only **the set amount** can be `ping`-ed, no more, no less.

[comment]: # (mx-exclude-context)

## **MultiversX dApp architecture**

![img](/developers/tutorial/dapp-architecture.png)

[comment]: # (mx-context-auto)

### **Application Layer (The Frontend)**

For the web app we'll have two pages:

- The _Sign in_ page - here we can authenticate with ledger, web wallet or with xPortal app
- The _Dashboard_ page - here we can either ping or pong, if we already deposited, then we will see a countdown timer until the time interval clears out.

[comment]: # (mx-context-auto)

### **Blockchain Layer (The Backend)**

We will create a smart contract that can handle the deposit (`ping`), claim (`pong`) and status actions (`did_user_ping`, `get_time_to_pong`).
Let's say that, for now, this smart contract plays the role of an API in a dApp. Also, this is where our business logic resides.

The MultiversX _devnet_ is a public test network maintained by our community where any developer can test their smart contracts and dApps in a real world environment.

[comment]: # (mx-context-auto)

## **Set up the environment**

Let's set up the environment for getting your first dapp up and running.

[comment]: # (mx-context-auto)

### **Project Structure**

First let's create a new folder for our project, I'll name it `ping-pong`.

```sh
mkdir -p ping-pong/wallet
cd ping-pong
```

In the end, we'll have three subfolders: wallet, contract and dapp. For convenience, we'll save our owner's PEM wallet in the wallet folder.

![img](/developers/tutorial/folder-structure.png)

[comment]: # (mx-context-auto)

### **Create the owner wallet**

The smart contract can only be deployed on the blockchain by an owner, so let's create an owner's wallet **PEM file**. The owner can also update the contract, later on, if needed. Keep in mind we only use PEM wallets for testing and playing around with non-production code. For real applications please follow best practices, use secure wallets that can be generated [here](https://wallet.multiversx.com).

First, make sure you are in the `ping-pong` folder.

```sh
mxpy wallet new --format pem --outfile=./wallet/wallet-owner.pem
```

In order to initiate transactions on the blockchain, we need some funds, every transaction costs a very small fee, on the blockchain this is called **gas**.
On the devnet wallet we have a **faucet** that allows you to get free test funds for our applications. We can request 5 xEGLD every 24 hours, so let's request 5 xEGLD now. You can log in with your PEM using the newly generated PEM file [here](https://devnet-wallet.multiversx.com/unlock/pem). Use the faucet from the menu as you see below and you are all set.

![img](/developers/tutorial/faucet-screenshot.png)

[comment]: # (mx-exclude-context)

## **The Blockchain Layer - The Smart Contract**

Our owner wallet is completely set now, we can move on to our backend, the blockchain layer.

[comment]: # (mx-context-auto)

### **Clone the template**

Clone the Ping-Pong Sample Smart Contract

Let's start with our smart contract. We'll first clone the sample contract repository from here [https://github.com/multiversx/mx-ping-pong-sc](https://github.com/multiversx/mx-ping-pong-sc)

Also make sure you are still in the `ping-pong` folder.

```sh
git clone https://github.com/multiversx/mx-ping-pong-sc contract
```

[comment]: # (mx-context-auto)

### **Build the Smart Contract**

We now have the source code for the smart contract, but we need to compile it into a _binary_ that the MultiversX Virtual Machine can run. The VM can run Web Assembly code, so we need to compile our Rust source code into Web Assembly (WASM).

Run the following command in order to build the rust smart contract into a _wasm file_.

```sh
cd contract/ping-pong
sc-meta all build
```

When running the build command, a WASM file gets created: `output/ping-pong.wasm`. This file contains the bytecode of our smart contract.

[comment]: # (mx-context-auto)

### **Customize and Deploy**

Deploy the smart contract on MultiversX Devnet
Next step is to deploy the contract to the blockchain.

Make sure your _owner wallet PEM file_ is in the right folder, the smart contract is built and let's get to the deployment.
For now let's continue with the default values.
We will run:

```bash
mxpy --verbose contract deploy \
 --bytecode output/ping-pong.wasm \
 --pem ../../wallet/wallet-owner.pem \
 --recall-nonce \
 --gas-limit 60000000 \
 --arguments 1000000000000000000 600 \
 --chain D \
 --proxy https://devnet-api.multiversx.com \
 --outfile deploy-devnet.interaction.json \
 --send
```

We'll take a look at the log output. We have 2 elements that need our attention: the contract address and the transaction hash. Let's check them in the [Devnet Explorer](https://devnet-explorer.multiversx.com).

Devnet Explorer will be your best friend in developing dApps on the MultiversX Blockchain, as you'll first deploy and test your dApps on Devnet.

```sh
INFO:accounts:Account.sync_nonce()
INFO:accounts:Account.sync_nonce() done: 32
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqqpgq0hmfvuygs34cgqsvgg6fpq9c5mffh4y04cysagr6cn
INFO:utils:View this contract address in the MultiversX Devnet Explorer: https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgq0hmfvuygs34cgqsvgg6fpq9c5mffh4y04cysagr6cn
INFO:transactions:Transaction.send: nonce=32
INFO:transactions:Hash: ee84f3e833d439e159c9619fd76e26d2afcdad62c197d87e4940072f18558153
INFO:utils:View this transaction in the MultiversX Devnet Explorer: https://devnet-explorer.multiversx.com/transactions/ee84f3e833d439e159c9619fd76e26d2afcdad62c197d87e4940072f18558153
```

The smart contract is now deployed on the blockchain. We can interact with it using blockchain transactions in order to invoke smart contract functions `ping` or `pong`.

The smart contract source code resides in
`ping-pong-smart-contract/ping-pong/src/ping_pong.rs`

There are two main functions: `ping` and `pong`, these are invoked using blockchain transactions.

We also have two other functions defined in the smart contract: `get_time_to_pong` and `did_user_ping`, these view functions are invoked using **MultiversX API** (*https://devnet-api.multiversx.com/vm-values/query*).

[comment]: # (mx-exclude-context)

## **The Application Layer - The Web App**

All right, let's move on to the application layer.

[comment]: # (mx-context-auto)

### **Clone the Sample App**

First make sure to go back to the root `ping-pong` folder.

We will clone a very simple dApp template that implements the calls to our newly deployed smart contract.

```sh
git clone https://github.com/multiversx/mx-template-dapp dapp
cd dapp
```

[comment]: # (mx-context-auto)

### **Configure the app**

Use the preferred editor and customize the Smart Contract Address located in `src/config/config-devnet.tsx`

```sh
code .
```

Then edit this instruction, and change it to the contract address that was shown after `mxpy contract deploy`:

![img](/developers/tutorial/config-screenshot.png)

[comment]: # (mx-context-auto)

### **Build the dApp**

:::important
[Please make sure you have **yarn installed**](https://classic.yarnpkg.com/lang/en/docs/install) on your machine.
:::

We'll first install the dependencies:

```sh
yarn install
```

and then we'll start a development server to test our new dApp

```sh
yarn start:devnet
```

**Run it on local machine (or host it on your server)**
If you start the development server on the local machine, then open [http://localhost:3000](http://localhost:3000) in your browser.
If you start it on your own server, then you can access [http://ip:3000](http://ip:3000). The built version only contains static files, so any hosting provider will do.

After you start the development server, when you see the Sign in screen, this means the application is up and running.

[comment]: # (mx-context-auto)

## **Test Your Application**

We will sign in with a test wallet.
You can reuse the same owner's wallet if you want to, or create a new one, following the same steps you followed when creating the owner's wallet.

[comment]: # (mx-context-auto)

### **Ping Feature**

After signing in, we'll see the dashboard where we can see the **Ping** button.

Click the Ping button and you'll be redirected to the authentication page on the web wallet, maiar wallet or your authentication device.
A new transaction will be created and you'll be asked to confirm it. This transaction transfers balance from your wallet to the smart contract address. Those funds will be locked for the specified period of time. Pay attention to the data field, where we call the smart contract function `ping`.
After you confirm the transaction, a success message will appear and the funds are locked.

**Wait the time interval**
You can see the amount of time you'll have to wait until you can pong.

[comment]: # (mx-context-auto)

### **Pong Feature**

After the time interval has passed, you can claim the funds by clicking the Pong button.
Another blockchain transaction will wait to be processed, this time the amount will be zero, as we only have to invoke the `pong` function (specified in the _data_ field).
The transaction will trigger a success message and the funds will be returned to the wallet.

[comment]: # (mx-context-auto)

## **Where to go next?**

The purpose of this guide is to provide a starting point for you to discover the MultiversX technology capabilities and devkit. Keep reading the next docs to dive in deeper.
We welcome your questions and inquiries on Stack Overflow: [https://stackoverflow.com/questions/tagged/multiversx](https://stackoverflow.com/questions/tagged/multiversx).

Break down this guide and learn more about how to extend the smart contract, the wallet and the MultiversX tools. [https://docs.multiversx.com](/)
