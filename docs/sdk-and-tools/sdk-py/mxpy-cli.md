---
id: mxpy-cli
title: mxpy CLI cookbook
---

[comment]: # (mx-abstract)

## mxpy (Command Line Interface)

**mxpy**, as a command-line tool, can be used to simplify and automate the interaction with the MultiversX network - it can be easily used in shell scripts, as well. It implements a set of **commands**, organized within **groups**. 

The complete Command Line Interface is listed [**here**](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI). Command usage and description are available through the `--help` or `-h` flags.

For example:

```sh
mxpy --help
mxpy tx --help
mxpy tx new --help
```

This page will guide you through the process of handling common tasks using **mxpy**.

[comment]: # (mx-context-auto)

## Upgrading mxpy

[comment]: # (mx-context-auto)

### Upgrade using pipx

In case you used **pipx** to install **mxpy**, to upgrade to a newer version, you can run the following command:

```sh
pipx upgrade multiversx-sdk-cli
```

[comment]: # (mx-context-auto)

### Using the installation script

If you've previously installed **mxpy** using the legacy **mxpy-up** installation script, you should switch to the **pipx** approach. Make sure to remove the old `mxpy` shortcut and virtual Python environment beforehand:

```sh
rm ~/multiversx-sdk/mxpy
rm -rf ~/multiversx-sdk/mxpy-venv
```

Additionally, you might want to cleanup the shell profile files, to not alter anymore the `PATH` variable with respect to `~/multiversx-sdk`: `~/.profile`, `~/.bashrc` and / or `~/.zshrc`.

[comment]: # (mx-context-auto)

## Managing dependencies

Using `mxpy` you can either check if a dependency is installed or install a new dependency.

To check if a dependecy is installed you can use:

```sh
mxpy deps check <dependecy-name>
```

To install a new dependency you can use:

```sh
mxpy deps install <dependency-name>
```

Both `mxpy deps check <dependecy-name>` and `mxpy deps install <dependency-name>` use the `<dependency-name>` as a positional argument.

To find out which dependencies can be managed using `mxpy` you can type one of the following commands and you will see which positional arguments it accepts:

```sh
mxpy deps check -h
mxpy deps install -h
```

For example, in order to check if `rust` is installed you would type:

```sh
mxpy deps check rust
```

When installing dependecies the `--overwrite` argument can be used to overwrite an existing version.

For example, to install `rust`, you can simply type the command:

```sh
mxpy deps install rust
```

If no tag is provided **the default version** will be installed.

:::note Default rust version
Generally speaking, the default `rust` version installed by `mxpy` is the one referenced by [the latest Docker image](https://github.com/multiversx/mx-sdk-rust-contract-builder/blob/main/Dockerfile) used for reproducible builds.
:::

:::note
On Ubuntu (or Windows with WSL), you might need to install the following dependencies of Rust and `sc-meta` before running `mxpy deps install rust`:

```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

:::

Here's how to install a specific version of `rust` (example):

```sh
mxpy deps install rust --overwrite
```

[comment]: # (mx-context-auto)

## Creating wallets

There are a couple available wallet formats:

- `raw-mnemonic` - secret phrase in plain text
- `keystore-mnemonic` - secret phrase, as a password-encrypted JSON keystore file
- `keystore-secret-key` - secret key (irreversibly derived from the secret phrase), as a password-encrypted JSON keystore file
- `pem` - secret key (irreversibly derived from the secret phrase), as a PEM file

For this example, we are going to create a `keystore-mnemonic` wallet.

Let's create a keystore wallet:

```sh
mxpy wallet new --format keystore-mnemonic --outfile test_wallet.json
```

The wallet's mnemonic will appear, followed by a prompt to set a password for the file. Once you input the password and press "Enter", the file will be generated at the location specified by the `--outfile` argument.

[comment]: # (mx-context-auto)

## Converting a wallet

As you have read above, there are multiple ways in which you can store your secret keys.

To convert a wallet from a type to another you can use:

```sh
mxpy wallet convert
```

:::info
Keep in mind that the conversion isn't always possible (due to irreversible derivations of the secret phrase):

- `raw-mnemonic` can be converted to any other format
- `keystore-mnemonic` can be converted to any other format
- `keystore-secret-key` can only be converted to `pem`
- `pem` can only be converted to `keystore-secret-key`

It's mandatory that you keep a backup of your secret phrase somewhere safe.
:::

Let's convert the previously created `keystore-mnemonic` to a `PEM` wallet. We discourage the use of PEM wallets for storing cryptocurrencies due to their lower security level. However, they prove to be highly convenient and user-friendly for application testing purposes.

To convert the wallet we type the follwing command:

```sh
mxpy wallet convert --infile test_wallet.json --in-format keystore-mnemonic --outfile converted_wallet.pem --out-format pem
```

After being prompted to enter the password you've previously set for the wallet the new `.pem` file will be created.

The command arguments can be found [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#walletconvert) or by typing:

```sh
mxpy wallet convert --help
```

[comment]: # (mx-context-auto)

## Building a smart contract

In order to deploy a smart contract on the network, you need to build it first.

The contract we will be using for this examples can be found [here](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/adder).

The `mxpy` command used for building contracts is:

```sh
mxpy contract build --path <path to contract>
```

If our working directory is already the contract's directory we can skip the `--path` argument as by default the contract's directory is the _current working directory_.

The generated `.wasm` file will be created in a directory called `output` inside the contract's directory.

The command accepts a few parameters that you can check out [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#contractbuild) or by simply typing:

```sh
mxpy contract build --help
```

If you'd like to build a smart contract directly using `sc-meta` instead, please follow [this](/developers/meta/sc-meta).

[comment]: # (mx-context-auto)

## Deploying a smart contract

After you've built your smart contract, it can be deployed on the network.

For deploying a smart contract the following command can be used:

```sh
mxpy contract deploy
```

To deploy a smart contract you have to send a transaction to the **Smart Contract Deploy Address** and that address is `erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu`, but you don't have to worry about setting the receiver of the transaction because the above command takes care of it.

The `--bytecode` argument specifies the path to your previously-built contract. If you've built the smart contract using `mxpy`, the generated `.wasm` file will be in a folder called `output`.

For example, if your contract is in `~/contracts/adder`, the generated bytecode file `adder.wasm` will be in `~/contracts/adder/output`. So, when providing the `--bytecode` argument the path should be `~/contracts/adder/output/adder.wasm`.

The `mxpy contract deploy` command needs a multitude of other parameters that can be checked out [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#contractdeploy) or by simply typing the following:

```sh
mxpy contract deploy --help
```

We will use a `.pem` file for the sake of simplicity but you can easily use any wallet type.

Let's see a simple example:

```sh
mxpy contract deploy --bytecode ~/contracts/adder/output/adder.wasm \
    --proxy=https://devnet-gateway.multiversx.com --recall-nonce \
    --arguments 0 --gas-limit 5000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

The `--proxy` is used to specify the url of the proxy and the `--chain` is used to select the network the contract will be deployed to. The chain ID and the proxy need to match for our transaction to be executed. We can't prepare a transaction for the Devnet (using `--chain D`) and send it using the mainnet proxy (https://gateway.multiversx.com).

The `--recall-nonce` is used to get the nonce of the address so we don't search it manually. It simply makes an API request to get the nonce of the account. The `--arguments` is used in case our contract needs any arguments for the initialization. We know our `adder` needs a value to start adding from, so we set that to `0`.

The `--gas-limit` is used to set the gas we are willing to pay so our transaction will be executed. 5 million gas is a bit too much because our contract is very small and simple, but better to be sure. In case our transaction doesn't have enough gas the network will not execute it, saying something like `Insufficent gas limit`.

The `--pem` argument is used to provide the sender of the transaction, the payer of the fee. The sender will also be the owner of the contract.

[comment]: # (mx-context-auto)

## Calling the Smart Contract

After deploying our smart contract we can start interacting with it. The contract has a function called `add()` that we can call and it will increase the value stored in the contract with the value we provide.

To call a function we use the `mxpy contract call` command. Here's an example of how we can do that:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem --recall-nonce \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --function add --arguments 5 --gas-limit 1000000 \
    --send
```

The positional argument is the contract address that we want to interact with. The `--pem`, `--recall-nonce`, `--proxy` and `--chain` arguments are used the same as above in the deploy transaction.

Using the `--function` argument we specify the function we want to call and with the `--arguments` argument we specify the value we want to add. We set the gas we are willing to pay for the transaction and finally we send the transaction.

[comment]: # (mx-context-auto)

## Querying a Smart Contract

Querying a contract is done by calling a so called `view function`. We can get data from a contract without sending a transaction to the contract, basically without spending money.

As you know, our contract has a function called `add()` that we previously called, and a `view function` called `getSum()`. Using this `getSum()` function we can see the value that is currently stored in the contract.

If you remember, when we deployed the contract we passed the value `0` as a contract argument, this means the contract started adding from `0`. When calling the `add()` function we used the value `5`. This means that now if we call `getSum()` we should get the value `5`. To do that, we use the `mxpy contract query` command. Let's try it!

```sh
mxpy contract query erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --proxy https://devnet-gateway.multiversx.com \
    --function getSum
```

We see that `mxpy` returns our value as a base64 string, as a hex number and as a integer. Indee, we see the expected value.

[comment]: # (mx-context-auto)

## Upgrading a Smart Contract

In case there's a new release of your Smart Contract, or perhaps you've patched a possible vulnerability you can upgrade the code of the Smart Contract deployed on the network.

We've modified our adder contract to add `1` to every value added to the contract. Now everytime the `add()` function is called will add the value provided with `1`. In order to do that we access the source code and navigate to the `add()` endpoint. We can see that `value` is added to `sum` each time the endpoint is called. Modify the line to look something like this `self.sum().update(|sum| *sum += value + 1u32);`

Before deploying the contract we need to build it again to make sure we are using the latest version. We then deploy the newly built contract, then we call it and query it.

First we build the contract:

```sh
mxpy contract build
```

Then we upgrade the contract by running:

```sh
mxpy contract upgrade erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --bytecode ~/contracts/adder/output/adder.wasm \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --recall-nonce --arguments 0 --gas-limit 5000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

We provide as a positional argument the contract's address that we want to upgrade, in our case the previously deployed adder contract. The `--bytecode` is used to provide the new code that will replace the old code. We also set the `--arguments` to `0` as we didn't change the constructor and the contract will start counting from `0` again. The rest of the arguments you know from all the previous operations we've done.

Now let's add `5` to the contract one more time. We do so by running the following:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem --recall-nonce \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --function add --arguments 5 --gas-limit 1000000 \
    --send
```

Now, if we query the contract we should see the value `6`. We added `5` in the contract but modified the contract code to add `1` to every value. Let's see!

```sh
mxpy contract query erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 --proxy https://devnet-gateway.multiversx.com --function getSum
```

We see that we indeed got the value `6`. Our upgrade was sucessfull.

[comment]: # (mx-context-auto)

## Verifying a smart contract

Verifying a smart contract means ensuring that the contract deployed on the network matches a specific version of the original source code. That is done by an external service that, under the hood, performs a reproducible build of the given contract and compares the resulting bytecode with the one deployed on the network.

To learn more about reproducible builds, please follow [**this page**](/developers/reproducible-contract-builds). If you'd like to set up a Github Workflow that performs a reproducible build of your smart contract, follow the examples in [**this repository**](https://github.com/multiversx/mx-contracts-rs).

The command used for verifying contracts is:

```sh
mxpy contract verify
```

Let's see an example:

```sh
export CONTRACT_ADDRESS="erd1qqqqqqqqqqqqqpgq6eynj8xra5v87qqzpjhc5fnzzh0fqqzld8ssqrez2g"

mxpy --verbose contract verify ${CONTRACT_ADDRESS} \
    --packaged-src=adder-0.0.0.source.json \
    --verifier-url="https://devnet-play-api.multiversx.com" \
    --docker-image="multiversx/sdk-rust-contract-builder:v5.1.0" \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem
```

:::info
The account that triggers the code verification process must be the owner of the contract.
:::

:::info
The _packaged source_ passed as `--packaged-src` can be obtained either from [the Github Workflows for reproducible builds](https://github.com/multiversx/mx-contracts-rs/tree/main/.github/workflows) set up on your own repository, or from locally invoking a reproducible build, as depicted [here](https://docs.multiversx.com/developers/reproducible-contract-builds/#reproducible-build-using-mxpy).
:::

[comment]: # (mx-context-auto)

## Creating and sending transactions

To create a new transaction we use the `mxpy tx new` command. Let's see how that works:

```sh
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem --recall-nonce \
    --receiver erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
    --gas-limit 50000 --value 1000000000000000000 \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --send
```

That's it! As easy as that. We sent a transaction from Alice to Bob. We choose the receiver of our transaction using the `--receiver` argument and set the gas limit to `50000` because that is the gas cost of a simple move balance transaction. Notice we used the `--value` argument to pass the value that we want to transfer but we passed in the denomintated value. We transferred 1 eGLD (1 * 10^18). We then specify the proxy and the chain ID for the network we want to send our transaction to and use the `--send` argument to broadcast it.

In case you want to save the transaction you can also provide the `--outfile` argument and a `json` file containing the transaction will be saved at the specified location. If you just want to prepare the transaction without broadcasting it simply remove the `--send` argument.

[comment]: # (mx-context-auto)

## Guarded transactions

If your address is guarded, you'll have to provide some additional arguments because your transaction needs to be co-signed. 

The first extra argument we'll need is the `--guardian` argument. This specifies the guardian address of our address. Then, if our account is guarded by a service like our trusted co-signer service we have to provide the `--guardian-service-url` which specifies where the transaction is sent to be co-signed.

Keep in mind that **mxpy** always calls the `/sign-transaction` endpoint of the `--guardian-service-url` you have provided. Another argment we'll need is `--guardian-2fa-code` which is the code generated by an external authenticator.

Each guarded transaction needs an additional `50000` gas for the `gasLimit`. The `version` field needs to be set to `2`. The `options` field needs to have the second least significant bit set to "1".

:::note
Here are the urls to our hosted co-signer services:

- Mainnet: [https://tools.multiversx.com/guardian](https://tools.multiversx.com/guardian)
- Devnet: [https://devnet-tools.multiversx.com/guardian](https://devnet-tools.multiversx.com/guardian)
- Testnet: [https://testnet-tools.multiversx.com/guardian](https://testnet-tools.multiversx.com/guardian)

:::

```sh
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem --recall-nonce \
    --receiver erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
    --gas-limit 200000 --value 1000000000000000000 \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --guardian erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8 \
    --guardian-service-url https://devnet-tools.multiversx.com/guardian \
    --guardian-2fa-code 123456 --version 2 --options 2
    --send
```

If your address is guarded by another wallet, you'll still need to provide the `--guardian` argument and the guardian's wallet that will co-sign the transaction, but you don't need to provide the 2fa code and the service url. You can provide the guardian's wallet using one of the following arguments: `--guardian-pem`, `--guardian-keyfile`, or `--guardian-ledger`.

[comment]: # (mx-context-auto)

## Using the Ledger hardware wallet

You can sign any transaction (regular transfers, smart contract deployments and calls) using a Ledger hardware wallet by leveraging the `--ledger` command-line argument.

First, connect your device to the computer, unlock it and open the MultiversX Ledger app.

Then, you can perform a trivial connectivity check by running:

```sh
mxpy ledger version
```

The output should look like this:

```sh
MultiversX App version: ...
```

Another trivial check is to ask the device for the (first 10) MultiversX addresses it manages:

```sh
mxpy ledger addresses
```

The output should look like this:

```sh
account index = 0 | address index = 0 | address: erd1...
account index = 0 | address index = 1 | address: erd1...
account index = 0 | address index = 2 | address: erd1...
...
```

Now let's sign and broadcast a transaction (EGLD transfer):

```sh
mxpy tx new --proxy https://devnet-gateway.multiversx.com --recall-nonce \
    --receiver erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th \
    --gas-limit 50000 --value 1000000000000000000 \
    --ledger \
    --send
```

By default, the first MultiversX address managed by the device is used as the sender (signer) of the transaction. In order to select a different address, you can use the `--ledger-address-index` CLI parameter:

```sh
mxpy tx new --proxy https://devnet-gateway.multiversx.com --recall-nonce \
    --receiver erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th \
    --gas-limit 50000 --value 1000000000000000000 \
    --ledger --ledger-address-index=42 \
    --send
```

:::info
For MultiversX, **the account index should always be `0`**, while the address index is allowed to vary. Therefore, you should not use the `--ledger-account-index` CLI parameter (it will be removed in a future release).
:::

Now let's deploy a smart contract using the Ledger:

```sh
mxpy contract deploy --proxy=https://devnet-gateway.multiversx.com --recall-nonce \
    --bytecode=counter.wasm --gas-limit=5000000 \
    --ledger --ledger-address-index=42 \
    --send
```

Then, perform a contract call:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgqwwef37kmegph97egvvrxh3nccx7xuygez8ns682zz0 \
    --proxy=https://devnet-gateway.multiversx.com --recall-nonce \
    --function increment --gas-limit 5000000 \
    --ledger --ledger-address-index=42 \
    --send
```

:::note
As of October 2023, on Windows (or WSL), you might encounter some issues when trying to use Ledger in `mxpy`.
:::
