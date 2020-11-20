---
id: setup-local-testnet
title: Setup a Local Testnet
---

This guide describes how to set up a local mini-testnet using **erdpy**. The purpose of a local mini-testnet is to allow developers to experiment with and test their Smart Contracts, in addition to writing unit and integration tests.

The mini-testnet contains:

- **Validator Nodes** (two, by default)
- **Observer Nodes** (two, by default)
- A **Seednode**
- An **Elrond Proxy**

If not specified otherwise, the mini-testnet starts with one Shard plus the Metachain (each with one Validator and one Observer).

## **Prerequisites: erdpy**

In order to install erdpy, follow the instructions at [install erdpy](https://docs.elrond.com/tools/erdpy/installing-erdpy#install-using-erdpy-up-recommended).



Make sure your erdpy version is `0.8.7` or higher.

## **Prerequisites: Node and Proxy**

First, let erdpy know the desired software releases for the Node and for the Proxy:



```
$ erdpy config set dependencies.elrond_proxy_go.tag master
$ erdpy config set dependencies.elrond_go.tag master
```

Then, run the following command - this will fetch the software into `~/elrondsdk`:



```
$ erdpy testnet prerequisites
```

## **Testnet Configuration**

Let's configure the following network parameters in erdpy, so that subsequent command invocations (of erdpy) will not require you explicitly provide the `--proxy` and `--chainID` arguments:



```
$ erdpy config set chainID local-testnet
$ erdpy config set proxy http://localhost:7950
```

Then, in a folder of your choice add a file names `testnet.toml` with the content below.



```
$ mkdir MySandbox && cd MySandbox
$ touch testnet.toml
```



```
testnet.toml
[networking]
port_proxy = 7950
```



erdpy allows you to customize the configuration of the local mini-testnet in much greater detail, but for the sake of simplicity, in the example above we've only set the TCP port of the Elrond Proxy.

Then, configure and build the local testnet as follows:



```
$ cd MySandbox
$ erdpy testnet config
```

Upon running this command, a new folder called `testnet` will be added in the current directory. This folder contains the Node & Proxy binaries, their configurations, plus the **development wallets**.



The development wallets (Alice, Bob, Carol, ..., Mike) **are publicly known** - they should only be used for development and testing purpose.

The development wallets are minted at genesis and their keys (both PEM files and Wallet JSON files) can be found in the folder `testnet/wallets/users`.

## **Starting the Testnet**



```
erdpy testnet start
```

This will start the Seednode, the Validators, the Observers and the Proxy.



Note that the Proxy starts with a delay of about 30 seconds.

## **Sending transactions**

Let's send a simple transaction using **erdpy:**



```
Simple Transfer
erdpy tx new --recall-nonce --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
 --pem=./testnet/wallets/users/alice.pem \
 --send
```

You should see the prepared transaction and the **transaction hash** in the `stdout` (or in the `--outfile` of your choice). Using the transaction hash, you can query the status of the transaction against the Proxy or against erdpy itself:



```
$ curl http://localhost:7950/transaction/1dcfb2227e32483f0a5148b98341af319e9bd2824a76f605421482b36a1418f7
$ erdpy tx get --hash=1dcfb2227e32483f0a5148b98341af319e9bd2824a76f605421482b36a1418f7
```

## **Deploying and interacting with Smart Contracts**

Let's deploy a Smart Contract using **erdpy**. We'll use the simple Counter as an example.

If you need guidance on how to build the Counter sample contract, please follow the [Counter SmartContract Tutorial](https://app.gitbook.com/@elrond-docs/s/elrond/developers/dev-tutorials/the-counter-smart-contract#build-the-contract).



```
Deploy Contract
erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=5000000 \
 --pem=./testnet/wallets/users/alice.pem \
 --outfile=myCounter.json \
 --send
```

Upon deployment, you can check the status of the transaction and the existence of the Smart Contract:



```
$ curl http://localhost:7950/transaction/0db61bab8e78779ae009300988c6be0949086d93e2b7adfddd5e6375a4b6eeb7 | jq
$ curl http://localhost:7950/address/erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq | jq
```

If everything is fine (transaction status is `executed` and the `code` property of the address is set), you can interact with or perform queries against the deployed contract:



```
Call Contract
erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq \
 --recall-nonce --gas-limit=1000000 --function=increment \
 --pem=./testnet/wallets/users/alice.pem --outfile=myCall.json \
 --send

```



```
Query Contract
erdpy --verbose contract query erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq --function=get
```

## **Simulating transactions**

At times, you can simulate transactions instead of broadcasting them, by replacing the flag `--send` with the flag `--simulate`. For example:



```
Simulate: Call Contract
all-nonce --gas-limit=1000000 --function=increment \
 --pem=./testnet/wallets/users/alice.pem --outfile=myCall.json \
 --simulate
```



```
Simulate: Simple Transfer
erdpy tx new --recall-nonce --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
 --pem=./testnet/wallets/users/alice.pem \
 --simulate
```