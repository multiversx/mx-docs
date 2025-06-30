---
id: setup-local-testnet
title: Set up a Localnet (mxpy)
---
[comment]: # (mx-abstract)

This guide describes how to set up a local mini-testnet - also known as **localnet** - using **mxpy**. The purpose of a localnet is to allow developers experiment with and test their Smart Contracts, in addition to writing unit and integration tests.

The localnet contains:

- **Validator Nodes** (two, by default)
- **Observer Nodes** (zero, by default)
- A **Seednode**
- A **MultiversX Proxy**

If not specified otherwise, the localnet starts with two shards plus the metachain (each with one validator).

[comment]: # (mx-context-auto)

## Prerequisites: mxpy

In order to install **mxpy**, follow [these instructions](/sdk-and-tools/mxpy/installing-mxpy).

:::note
This guide assumes you are using `mxpy v9.7.1` or newer.
:::

[comment]: # (mx-context-auto)

## The easy way to start a localnet

You can simply setup and start a localnet in a workspace (folder) of your choice by following the steps below.

Create a new folder (workspace) and navigate to it:

```bash
mkdir -p ~/my-first-localnet && cd ~/my-first-localnet
```

Create, build and configure a localnet (in one go):

```bash
mxpy localnet setup
```

Then, start the localnet:

```bash
mxpy localnet start
```

:::tip
Above, the command `mxpy localnet setup` performs the following sub-commands under the hood, in one go (so you don't have to run them individually):

```bash
mxpy localnet new
mxpy localnet prerequisites
mxpy localnet build
mxpy localnet config
```
:::

If everything goes well, in the terminal you should see logs coming from the nodes and proxy:

```
INFO:cli.localnet:Starting localnet...
...
INFO:localnet:Starting process ['./seednode', ...
...
INFO:localnet:Starting process ['./node', ...
...
INFO:localnet:Starting process ['./proxy', ...
[PID=...] DEBUG[...] [process/block]       started committing block ...
```

:::tip
The logs from all processes of the localnet can also be found in `~/my-first-localnet/localnet`. Simply look for `*.log` files.
:::

:::important
Note that the proxy starts with a delay of about 30 seconds.
:::

[comment]: # (mx-context-auto)

## Halting and resuming the localnet

In order to **halt the localnet**, press `Ctrl+C` in the terminal. This will stop all the processes (nodes, proxy etc.). The localnet can be **resumed at any time** by running again the command `mxpy localnet start` (from within your workspace).

[comment]: # (mx-context-auto)

## Removing the localnet

In order to remove the localnet, run the command (from within your workspace):

```bash
mxpy localnet clean
```

This will delete the `~/my-first-localnet/localnet` folder. Note that the configuration file (e.g. `localnet.toml`) will not be deleted automatically.

[comment]: # (mx-context-auto)

## Gaining more control over the localnet

[comment]: # (mx-context-auto)

### Perform setup steps individually

If you want to have more control over the localnet, you can run the setup sub-commands individually, as described below.

First, let's create a separate workspace (for the sake of this guide):

```bash
mkdir -p ~/my-second-localnet && cd ~/my-second-localnet
```

Then, create a new configuration file for the localnet, as follows:

```bash
mxpy localnet new
```

Upon running this command, a new file called `localnet.toml` will be added in the current directory. This file contains the default configuration of the localnet. **Make sure to open the file and inspect its content**. You should see something like this:

```
[general]
...
rounds_per_epoch = 100
round_duration_milliseconds = 6000

[metashard]
...
num_validators = 1

[shards]
num_shards = 2
...

[networking]
...
port_proxy = 7950
port_first_validator_rest_api = 10200

[software.mx_chain_go]
resolution = "remote"
archive_url = "https://github.com/multiversx/mx-chain-go/archive/refs/heads/master.zip"
...

[software.mx_chain_proxy_go]
resolution = "remote"
archive_url = "https://github.com/multiversx/mx-chain-proxy-go/archive/refs/heads/master.zip"
...
```

:::tip
Generally speaking, it's a good idea to only alter the `localnet.toml` **before first starting a localnet**. Once the localnet is started, the configuration file should not be modified anymore (e.g. when halting and resuming the localnet).
:::

Now, the following command will fetch the software prerequisites - **mx-chain-go**, **mx-chain-proxy-go** etc. - into `~/multiversx-sdk`:

```bash
mxpy localnet prerequisites
```

:::tip
The `prerequisites` step is only necessary when the localnet depends on remote source code archives - i.e. at least one software prerequisite has `resolution = remote` in `localnet.toml`. **This is actually the default, and it's the easiest way to get started with the localnet.** Later on, we'll see how to create the localnet from local source code (for advanced use-cases).
:::

Once the software prerequisites (source code) are fetched, we can build them:

```bash
mxpy localnet build
```

:::tip
The actual build takes place within the download folders of the software prerequisites which, by default, are children of `~/multiversx-sdk/localnet_software_remote`.
:::

Now let's configure (prepare) the localnet:

```bash
mxpy localnet config
```

It is only upon running this command that the localnet subfolders are created. Make sure to inspect them:

```bash
tree -L 3 ~/my-second-localnet
```

Example output:

```
├── localnet
│   ├── proxy
│   │   ├── config
│   │   └── proxy
│   ├── seednode
│   │   ├── config
│   │   ├── libwasmer_linux_amd64.so
│   |   ├── ...
│   │   └── seednode
│   ├── validator00
│   │   ├── config
│   │   ├── libwasmer_linux_amd64.so
│   |   ├── ...
│   │   └── node
│   ├── validator01
│   │   ├── config
│   │   ├── libwasmer_linux_amd64.so
│   |   ├── ...
│   │   └── node
│   └── validator02
│       ├── config
│       ├── libwasmer_linux_amd64.so
│       ├── ...
│       └── node
└── localnet.toml
```

We can then start, halt and resume the localnet as previously described.

[comment]: # (mx-context-auto)

### Altering chronology parameters

Let's create a new localnet workspace:

```bash
mkdir -p ~/my-localnet-with-altered-chronology && cd ~/my-localnet-with-altered-chronology
mxpy localnet new
```

**Before first starting a localnet**, you can alter the chronology parameters in `localnet.toml`. For example, let's have shorter epochs and shorter rounds:

```
[general]
rounds_per_epoch = 50
round_duration_milliseconds = 4000
```

Then, setup and start the localnet as previously described.

```bash
mxpy localnet setup
mxpy localnet start
```

[comment]: # (mx-context-auto)

### Altering sharding configuration

Let's create a new localnet workspace:

```bash
mkdir -p ~/my-localnet-with-altered-sharding && cd ~/my-localnet-with-altered-sharding
mxpy localnet new
```

**Before first starting a localnet**, you can alter the sharding configuration in `localnet.toml`. For example, let's have 3 shards, each with 2 validators and 1 observer (thus, 9 nodes, without the metachain ones):

```
[shards]
num_shards = 3
consensus_size = 2
num_observers_per_shard = 1
num_validators_per_shard = 2
```

Then, setup and start the localnet as previously described.

```bash
mxpy localnet setup
mxpy localnet start
```

[comment]: # (mx-context-auto)

### Building from local source code

Let's create a new localnet workspace:

```bash
mkdir -p ~/my-localnet-from-local-src && cd ~/my-localnet-from-local-src
mxpy localnet new
```

In order to build the **node** or the **proxy** from local source code (instead of fetching the source code from a remote archive), you can set `resolution = local` in `localnet.toml`. For example, let's build both the node and the proxy from local source code:

```
[software.mx_chain_go]
resolution = "local"
local_path = "~/Desktop/workspace/mx-chain-go"

[software.mx_chain_proxy_go]
resolution = "local"
local_path = "~/Desktop/workspace/mx-chain-proxy-go"
```

Then, setup and start the localnet as previously described.

```bash
mxpy localnet setup
mxpy localnet start
```

[comment]: # (mx-context-auto)

## Test (development) wallets

The development wallets **are minted at the genesis of the localnet** and their keys (both PEM files and Wallet JSON files) can be found in `~/multiversx-sdk/testwallets/latest/users`.

:::caution
These wallets (Alice, Bob, Carol, ..., Mike) **are publicly known** - they should only be used for development and testing purpose.
:::

[comment]: # (mx-context-auto)

## Interacting with our localnet

[comment]: # (mx-context-auto)

### Sending transactions

Let's send a simple transaction using **mxpy**:

```bash
mxpy tx new --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
 --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
 --chain=localnet --proxy=http://localhost:7950 \
 --send
```

You should see the prepared transaction and the **transaction hash** in the `stdout` (or in the `--outfile` of your choice). Using the transaction hash, you can query the status of the transaction against the Proxy:

```bash
curl http://localhost:7950/transaction/8b2cd8e61c12d6f02148537bdef40579c6cbff7ff0aba996f294d34a31992ba4 | jq
```

[comment]: # (mx-context-auto)

### Deploying and interacting with Smart Contracts

Let's deploy a Smart Contract using **mxpy**.

```bash
mxpy --verbose contract deploy --bytecode=./contract.wasm \
 --gas-limit=5000000 \
 --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
 --outfile=contract.json \
 --chain=localnet --proxy=http://localhost:7950 \
 --send
```

Upon deployment, you can check the status of the transaction and the existence of the Smart Contract:

```bash
curl http://localhost:7950/transaction/4c5bd51ca0a051397bd6b0c89add2a5375106562b005c839f7e9bb113e2a8ce4 | jq
curl http://localhost:7950/address/erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq | jq
```

If everything is fine (transaction status is `executed` and the `code` property of the address is set), you can interact with the deployed contract:

```bash
mxpy --verbose contract call erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq \
 --gas-limit=1000000 --function=increment \
 --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem --outfile=myCall.json \
 --chain=localnet --proxy=http://localhost:7950 \
 --send
```

In order to perform queries against the contract using `mxpy`, do as follows:

```
mxpy --verbose contract query erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq --function=get --proxy=http://localhost:7950
```

[comment]: # (mx-context-auto)

### Simulating transactions

At times, you can simulate transactions instead of broadcasting them, by replacing the flag `--send` with the flag `--simulate`. For example:

```bash
# Simulate: Call Contract
mxpy contract call erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq \
 --gas-limit=1000000 --function=increment \
 --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
 --chain=localnet --proxy=http://localhost:7950 \
 --simulate

# Simulate: Simple Transfer
mxpy tx new --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
 --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
 --chain=localnet --proxy=http://localhost:7950 \
 --simulate
```
