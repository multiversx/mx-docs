---
id: your-first-dapp
title: Build a dApp in 15 minutes
---

[comment]: # (mx-abstract)

Let's build your first decentralized App on the MultiversX Blockchain

:::important
Please [create a sample **owner wallet**](/wallet/web-wallet) and have your security phrase on hand (24 words).
We'll work on the Devnet, you should manage your web wallet [here](https://devnet-wallet.multiversx.com).
:::

This guide has been made available in video format as well:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/IdkgvlK3rb8" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

[comment]: # (mx-context-auto)

### **dApp Description**

![img](/developers/tutorial/dapp-problem.png)

The **Ping-Pong app** is a very simple decentralized application that will allow the user to deposit a specific number of tokens (default is 1 xEGLD) to a smart contract address and to lock them for a specific amount of time (default is 10 minutes). After this time interval passes, the user can claim back the same amount of tokens.
Sending funds to the contract is called `ping`.
Claiming the same amount back is called `pong`.

Other rules:

- the user can only `ping` **once** before `pong` (so no multiple pings).
- only **the set amount** can be `ping`-ed, no more, no less.

Maybe you noticed the default amount for a deposit is **1 xEGLD** and not 1 EGLD which is MultiversX official token, this is because, for testing purposes we use MultiversX Devnet, which is a testing environment identical to the Mainnet, the official MultiversX Blockchain. Here, the currency is **xEGLD**, it's just a test token, it's worth nothing.

[comment]: # (mx-exclude-context)

## **MultiversX dApp architecture**

![img](/developers/tutorial/dapp-architecture.png)

[comment]: # (mx-context-auto)

### **Application Layer (The Frontend)**

For the web app we'll have two pages:

- The _Sign in_ page - here we can authenticate with ledger, web wallet or with Maiar Wallet
- The _Dashboard_ page - here we can either ping or pong, if we already deposited, then we will see a countdown timer until the time interval clears out.

[comment]: # (mx-context-auto)

### **Blockchain Layer (The Backend)**

We will create a smart contract that can handle the deposit (`ping`), claim (`pong`) and status actions (`did_user_ping`, `get_time_to_pong`).
Let's say that, for now, this smart contract plays the role of an API in a dApp. Also this is where our business logic resides.

The MultiversX _devnet_ is a public test network maintained by our community where any developer can test their smart contracts and dApps in a real world environment.

[comment]: # (mx-context-auto)

## **Set up the environment**

Let's set up the evironment for getting your first dapp up and running.

[comment]: # (mx-context-auto)

### **Project Structure**

First let's create a new folder for our project, I'll name it `ping-pong`.

```sh
mkdir -p ping-pong/wallet
cd ping-pong/wallet
```

In the end, we'll have three subfolders: wallet, contract and dapp. For convenience, we'll save our owner's wallet keystore in the wallet folder.

![img](/developers/tutorial/folder-structure.png)

[comment]: # (mx-context-auto)

### **Software Prerequisites**

Software prerequisites

In our example we'll use [Ubuntu 20.04](https://ubuntu.com/). MacOs works as well (skip to the last paragraph in this section). We'll need to install `python 3.8`, `python-pip` and `libncurses5`. For the frontend application, we'll use an app template based on [React JS](https://reactjs.org/), so we will need `nodejs` and `npm`.

First we make sure the operating system prerequisites are installed:

```sh
sudo apt-get update
sudo apt install libncurses5 build-essential python3-pip nodejs npm python3.8-venv
```

We'll also need `mxpy`, the MultiversX command line tool, which is helpful for signing transactions, deploying smart contracts, managing wallets, accounts and validators. We'll use it to deploy our smart contract.
mxpy can be installed using the MultiversX documentation page [https://docs.multiversx.com/sdk-and-tools/sdk-py/installing-mxpy](https://docs.multiversx.com/sdk-and-tools/sdk-py/installing-mxpy)

We'll download the `mxpy` installer and we run it

```sh
wget -O mxpy-up.py https://raw.githubusercontent.com/multiversx/mx-sdk-py-cli/main/mxpy-up.py
python3 mxpy-up.py
```

Restart the user session to activate `mxpy`

```sh
source ~/.profile
```

In order to install `mxpy` on **MacOs**, you need to make sure you have installed `python 3.8` and `pip` on your system.
Then, install the latest `mxpy` version,using `pip`.

```sh
pip3 install --user --upgrade --no-cache-dir mxpy
```

If you encounter any error relating to `pynacl` package, make sure you have `libsodium` installed.

```sh
brew install libsodium
```

[comment]: # (mx-context-auto)

### **Create an owner wallet**

We now have all the prerequisites installed, let's create an owner's wallet **PEM file**.

The smart contract can only be deployed on the blockchain by an owner, so we will create an owner wallet [here](https://devnet-wallet.multiversx.com). The owner can also update the contract, later on, if needed.

Let's head over to the MultiversX wallet, click **"Create new wallet"**, write down the security phrase (24 words) that can help us retrieve the wallet, and the password for the JSON keystore (that we will save in the `~/ping-pong/wallet folder`). We should be able to see our new MultiversX wallet owner address which is, in this case, _erd1......._

We can also generate a private key PEM file, like this we won't need to enter our wallet password each time we want to confirm a transaction.

```sh
cd ~/ping-pong/wallet
mxpy wallet convert --in-format=raw-mnemonic --out-format=pem --outfile=./wallet-owner.pem
```

We will enter our **24 secret words** when prompted and a new PEM file will be created. This command requires that you enter all 24 words each separated by a space.

In order to initiate transactions on the blockchain, we need some funds, every transaction costs a very small fee, on the blockchain this is called **gas**.
On the devnet wallet we have a **faucet** that allows you to get free test funds for our applications. We can request 10 xEGLD every 24 hours, so let's request 10 xEGLD now.
We now check if the transaction was successful, and yes, we see that we now have 10 xEGLD in our devnet wallet.

[comment]: # (mx-exclude-context)

## **The Blockchain Layer - The Smart Contract**

Our owner wallet is completely set now, we can move on to our backend, the blockchain layer.

[comment]: # (mx-context-auto)

### **Clone the template**

Clone the Ping-Pong Sample Smart Contract

Let's start with our smart contract. We'll first clone the sample contract repository from here [https://github.com/multiversx/mx-ping-pong-sc](https://github.com/multiversx/mx-ping-pong-sc)

```sh
cd ~/ping-pong
git clone https://github.com/multiversx/mx-ping-pong-sc contract
cd contract/ping-pong
```

[comment]: # (mx-context-auto)

### **Build the Smart Contract**

We now have the source code for the smart contract, but we need to compile it into a _binary_ that the MultiversX Virtual Machine can run. The VM can run Web Assembly code, so we need to compile our Rust source code into Web Assembly (WASM).

We now have the source code for the smart contract, but we need to compile it into a _binary_ that the MultiversX (previously Elrond) Virtual Machine can run. The VM can run Web Assembly code, so we need to compile our Rust source code into Web Assembly (WASM).

Run the following command in order to build the rust smart contract into a _wasm file_.

```sh
mxpy contract build
```

On the last line of the output we'll have:

```sh
INFO:projects.core:WASM file generated: output/ping-pong.wasm
```

After running this command line, we see that a wasm file was generated. This file contains the runtime code for our smart contract.

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
 --recal-nonce \
 --gas-limit 60000000 \
 --arguments [1000000000000000000, 600] \
 --chain D \
 --proxy https://devnet-api.multiversx.com \
 --outfile deploy-testnet.interaction.json \
 --send
```

We'll take a look at the log output. We have 2 elements that need our attention: the contract address and the transaction hash. Let's check them in the [Devnet Explorer](https://devnet-explorer.multiversx.com).

Devnet Explorer will be your best friend in developing dApps on the MultiversX Blockchain, as you'll first deploy and test your dApps on Devnet.

INFO:accounts:Account.sync_nonce()
INFO:accounts:Account.sync_nonce() done: 32
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqqpgq0hmfvuygs34cgqsvgg6fpq9c5mffh4y04cysagr6cn
INFO:utils:View this contract address in the MultiversX Devnet Explorer: https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgq0hmfvuygs34cgqsvgg6fpq9c5mffh4y04cysagr6cn
INFO:transactions:Transaction.send: nonce=32
INFO:transactions:Hash: ee84f3e833d439e159c9619fd76e26d2afcdad62c197d87e4940072f18558153
INFO:utils:View this transaction in the MultiversX Devnet Explorer: https://devnet-explorer.multiversx.com/transactions/ee84f3e833d439e159c9619fd76e26d2afcdad62c197d87e4940072f18558153

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

We will clone a very simple dApp template that implements the calls to our newly deployed smart contract.

```sh
git clone https://github.com/multiversx/mx-template-dapp dapp
cd dapp
```

[comment]: # (mx-context-auto)

### **Configure the app**

Customize the Smart Contract Address

```sh
nano src/config.tsx
```

We'll take a look on the first instruction:

```javascript
export const contractAddress = "erd1qqqqqqqqqqqqq...";
```

and we'll change it to our contract address that was shown after mxpy contract deploy:

```javascript
export const contractAddress =
  "erd1qqqqqqqqqqqqqpgq0hmfvuygs34cgqsvg...ffh4y04cysagr6cn";
```

Save and close `config.tsx` and we're ready for the first build.

[comment]: # (mx-context-auto)

### **Build the dApp**

We'll first install the dependencies:

```sh
npm install
```

and then we'll start a development server to test our new dApp

```sh
npm run start
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
We welcome your questions and inquiries on Stack Overflow: [https://stackoverflow.com/questions/tagged/elrond](https://stackoverflow.com/questions/tagged/elrond).

Break down this guide and learn more about how to extend the smart contract, the wallet and the MultiversX tools. [https://docs.multiversx.com](/)
