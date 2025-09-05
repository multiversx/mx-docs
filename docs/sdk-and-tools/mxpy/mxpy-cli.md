---
id: mxpy-cli
title: mxpy CLI cookbook
---

[comment]: # (mx-abstract)



## mxpy (Command Line Interface)

**mxpy**, as a command-line tool, can be used to simplify and automate the interaction with the MultiversX network - it can be easily used in shell scripts, as well. It implements a set of **commands**, organized within **groups**.

:::important
In order to migrate to the newer `mxpy`, please follow [the migration guide](https://github.com/multiversx/mx-sdk-py-cli/issues?q=label:migration).
:::

The complete Command Line Interface is listed [**here**](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md). Command usage and description are available through the `--help` or `-h` flags.

For example:

```sh
mxpy --help
mxpy tx --help
mxpy tx new --help
```

This page will guide you through the process of handling common tasks using **mxpy**.

[comment]: # (mx-context-auto)

## Managing dependencies

Using `mxpy` you can either check if a dependency is installed or install a new dependency.

To check if a dependency is installed you can use:

```sh
mxpy deps check <dependency-name>
```

To install a new dependency you can use:

```sh
mxpy deps install <dependency-name>
```

Both `mxpy deps check <dependency-name>` and `mxpy deps install <dependency-name>` use the `<dependency-name>` as a positional argument.

To find out which dependencies can be managed using `mxpy`, you can type one of the following commands to see the positional arguments it accepts:

```sh
mxpy deps check -h
mxpy deps install -h
```

For example, in order to check if the `testwallets` dependency is installed, you would type:

```sh
mxpy deps check testwallets
```

For example, to install the `testwallets` dependency, you can simply type the command:

```sh
mxpy deps install testwallets
```

When installing dependencies, the `--overwrite` argument can be used to overwrite an existing version.

For example, to overwrite the installation of a dependency, you can simply type the command:

```sh
mxpy deps install testwallets --overwrite
```

## Configuring mxpy

The configuration can be altered using the `mxpy config` command.

:::tip
mxpy's configuration is stored in the file `~/multiversx-sdk/mxpy.json`.
:::

[comment]: # (mx-context-auto)

### Viewing the current mxpy configuration

As of `mxpy v11`, we've introduced more configuration options, such as `environments` and `wallets`.

In order to view the current configuration, one can issue the command `mxpy config dump`. Output example:

```json
{
  "dependencies.testwallets.tag": ""
}
```

For viewing the default configuration the following command can be used:

```sh
mxpy config dump --defaults
```

[comment]: # (mx-context-auto)

### Updating the mxpy configuration

One can alter the current configuration using the command `mxpy config set`.

The default config contains the **log level** of the CLI. The default log level is set to `info`, but can be changed. The available values are: [debug, info, warning, error]. To set the log level, we can use the following command:
```sh
mxpy config set log_level debug
```

:::note
Previously, the `default_address_hrp` was also stored in the config. As of `mxpy v11` it has been moved to the `env` config, which we'll talk about in the next section.
:::

### Configuring environments

An `env config` is a named environment configuration that stores commonly used settings (like proxy url, hrp, and flags) for use with the **mxpy CLI**. Environments can be useful when switching between networks, such as Mainnet and Devnet.

The values that are available for configuration and their default values are the following:
```json
{
    "default_address_hrp": "erd",
    "proxy_url": "",
    "explorer_url": "",
    "ask_confirmation": "false",
}
```

#### Creating a new env config

To create a new env config, we use the following command:

```sh
mxpy config-env new <name>
```

Additionally, `--template` can be used to create a config from an existing env config. After a new env config is created, it becomes the active one. You can then set its values using the `mxpy config-env set` command.

#### Setting the default hrp

The `default_address_hrp` might need to be changed depending on the network you plan on using (e.g Sovereign Chain). Most of the commands that might need the `address hrp` already provide a parameter called `--hrp` or `--address-hrp`, that can be explicitly set, but there are system smart contract addresses that cannot be changed by providing the parameter. If those addresses need to be changed, we can use the following command to set the `default hrp` that will be used throughout mxpy. Here we set the default hrp to `test`:

```sh
mxpy config-env set default_address_hrp test --env test-env
```

:::note
Explicitly providing `--hrp` will **always** be used over the one fetched from the network or the `hrp` set in the config.
:::

#### Setting the proxy url

If `proxy_url` is set in the active environment, the `--proxy` argument is no longer required for the commands that need this argument.

To set the proxy url, use the following command:

```sh
mxpy config-env set proxy_url https://devnet-api.multiversx.com --env devnet
```

#### Setting the explorer url

**mxpy** already knows the explorer urls for all three networks (Mainnet, Devnet, Testnet). This is particularly useful when running the CLI on custom networks where an explorer is also available. This key is not required to be present in the `env config` for the config to be valid. To set the explorer url use the following command:

```sh
mxpy config-env set explorer_url https://url-to-explorer.com --env test-env
```

#### Setting the ask for confirmation flag

If set to `true`, whenever sending a transaction, mxpy will display the transaction and will ask for your confirmation. To set the flag, use the following command:

```sh
mxpy config-env set ask_confirmation true --env mainnet
```

#### Dumping the active env config

We can see the values set in our active env config. To do so, we use the following command:

```sh
mxpy config-env dump
```

#### Dumping all the available env configs

We may have multiple env configs, maybe one for each network. To dump all the available env configs, we use the following command:

```sh
mxpy config-env list
```

#### Deleting a value from the active env config

We can also delete the key-value pairs saved in the env config. For example, let's say we want to delete the explorer url, so we use the following command:

```sh
mxpy config-env delete explorer_url --env test-env
```

#### Getting a value from the active env config

If we want to see just the value of a env config key from a specific environment, we can use the following command:

```sh
mxpy config-env get <key-name> --env mainnet
```

#### Deleting an env config

To delete an env config, we use the following command:

```sh
mxpy config-env remove <env-name>
```

#### Switching to a different env config

To switch to a new env config, we use the following command:

```sh
mxpy config-env switch --env <env-name>
```

You can manage multiple environment configurations with ease using `mxpy config-env`. This feature helps streamline workflows when working with multiple networks or projects. Use `mxpy config-env list` to see all available configs, and `switch` to quickly toggle between them.

### Configuring wallets

Wallets can be configured in the wallet config. Among all configured wallets, one must be set as the active wallet. This active wallet will be used by default in all mxpy commands, unless another wallet is explicitly provided using `--pem`, `--keystore`, or `--ledger`. Alternatively, the `--sender` argument can be used to specify a particular sender address from the address config (e.g. --sender alice).

The values that are available for configuring wallets are the following:
```json
{
    "path": "",
    "index": "",
}
```

Supported wallet types include PEM files and keystores. The CLI will determine the type based on the given path and act accordingly. If the wallet is of type `keystore`, you'll be prompted to enter the wallet's password.

The `path` field represents the absolute path to the wallet.

The `index` field represents the index that will be used when deriving the wallet from the secret key. This field is optional, the default index is `0`.

#### Creating a new wallet config

When configuring a new wallet we need to give it an alias. An alias is a user-defined name that identifies a configured wallet (e.g. alice, bob, dev-wallet). To create a new wallet config, we use the following command:

```sh
mxpy config-wallet new <alias>
```

This command accepts the `--path` argument, so the path to the wallet can be set directly, without needing to call `mxpy config-wallet set` afterwards.

#### Setting the wallet config fields

For a config to be valid, we need to set at least the `path` field for an already created wallet alias. To do so, we use the following command:

```sh
mxpy config-wallet set path absolute/path/to/pem/wallet.pem --alias alice
```

#### Getting the value of a field

We can get the value of a field from an alias using the following command:

```sh
mxpy config-wallet get path --alias alice
```

#### Dumping the active wallet config

To view all the properties of the active address, use the following command:

```sh
mxpy config-wallet dump
```

#### Dumping all configured wallets

To view all the wallets configured, use the following command:

```sh
mxpy config-wallet list
```

#### Switching to a different wallet

We may have multiple wallets configured, so to switch between them, we use the following command:

```sh
mxpy config-wallet switch --alias alice
```

#### Removing an address from the config

We can remove an address from the config using the alias of the address and the following command:

```sh
mxpy config-wallet remove --alias alice
```

## Estimating the Gas Limit for transactions

mxpy (version 11.1.0 and later) can automatically estimate the required gas limit for transactions when a proxy URL is provided. The estimation works by simulating the transaction before sending it.

While the estimation is generally accurate, it's recommended to add a safety margin to account for potential state changes. This can be done in two ways:

1. Per transaction, using the `--gas-limit-multiplier` flag:

```sh
mxpy tx new --gas-limit-multiplier 1.1 ...
```

2. As a global default setting in the config:

```sh
mxpy config set gas_limit_multiplier 1.1
```

A multiplier of 1.1 (10% increase) is typically sufficient for most transactions.

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

To convert the wallet we type the following command:

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

In order to deploy a smart contract on the network, you need to build it first. For this purpose, [sc-meta](/developers/meta/sc-build-reference#how-to-basic-build) should be used. To learn more about `sc-meta`, please check out [this page](/developers/meta/sc-meta).

The contract we will be using for this examples can be found [here](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/adder).

Build a contract as follows:

```sh
sc-meta all build --path <path to contract>
```

If our working directory is already the contract's directory we can skip the `--path` argument as by default the contract's directory is the _current working directory_.

The generated `.wasm` file will be created in a directory called `output` inside the contract's directory.

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
    --proxy=https://devnet-gateway.multiversx.com \
    --arguments 0 --gas-limit 5000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

The `--proxy` is used to specify the url of the proxy and the `--chain` is used to select the network the contract will be deployed to. The chain ID and the proxy need to match for our transaction to be executed. We can't prepare a transaction for the Devnet (using `--chain D`) and send it using the mainnet proxy (https://gateway.multiversx.com).

The `--arguments` is used in case our contract needs any arguments for the initialization. We know our `adder` needs a value to start adding from, so we set that to `0`.

The `--gas-limit` is used to set the gas we are willing to pay so our transaction will be executed. 5 million gas is a bit too much because our contract is very small and simple, but better to be sure. In case our transaction doesn't have enough gas the network will not execute it, saying something like `Insufficient gas limit`.

The `--pem` argument is used to provide the sender of the transaction, the payer of the fee. The sender will also be the owner of the contract. The nonce of the sender is fetched from the network if the `--proxy` argument is provided. The nonce can also be explicitly set using the `--nonce` argument. If the nonce is explicitly set, mxpy will not fetch the nonce from the network.

[comment]: # (mx-context-auto)

### Deploying a smart contract providing the ABI file

For functions that have complex arguments, we can use the ABI file generated when building the contract. The ABI can be provided using the `--abi` argument. When using the ABI, and only when using the ABI, the arguments should be written in a `json` file and should be provided via the `--arguments-file` argument.

For this example, we'll use the [multisig contract](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig).

First, we'll prepare the file containing the constructors arguments. We'll refer to this file as `deploy_multisig_arguments.json`. The constructor requires two arguments, the first is of type `u32` and the second one is of type `variadic<Address>`. All the arguments in this file **should** be placed inside a list. The arguments file should look like this:

```json
[
  2,
  [
    {
      "bech32": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"
    },
    {
      "hex": "8049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f8"
    }
  ]
]
```

Let's go a bit through our file and see why it looks like this. First, as mentioned above, we have to place all the arguments inside a list. Then, the value `2` corresponds to the type `u32`. After that, we have another list that corresponds to the type `variadic`. Inside this list, we need to insert our addresses. For `mxpy`to encode addresses properly, we need to provide the address values inside a dictionary that can contain two keys: we can provide the address as the `bech32` representation or as the `hex encoded` public key.

After finishing the arguments file, we can run the following command to deploy the contract:

```sh
mxpy contract deploy --bytecode ~/contracts/multisig/output/multisig.wasm \
    --proxy=https://devnet-gateway.multiversx.com \
    --abi ~/contracts/multisig/output/multisig.abi.json \
    --arguments-file deploy_multisig_arguments.json \
    --gas-limit 500000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

[comment]: # (mx-context-auto)

## Calling the Smart Contract

After deploying our smart contract we can start interacting with it. The contract has a function called `add()` that we can call and it will increase the value stored in the contract with the value we provide.

To call a function we use the `mxpy contract call` command. Here's an example of how we can do that:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --function add --arguments 5 --gas-limit 1000000 \
    --send
```

The positional argument is the contract address that we want to interact with. The `--pem`, `--proxy` and `--chain` arguments are used the same as above in the deploy transaction.

Using the `--function` argument we specify the function we want to call and with the `--arguments` argument we specify the value we want to add. We set the gas we are willing to pay for the transaction and finally we send the transaction.

[comment]: # (mx-context-auto)

### Calling the smart contract providing the ABI file

Same as we did for deploying the contract, we can call functions by providing the ABI file and the arguments file.

Since we deployed the [multisig contract](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig), we'll call the `proposeTransferExecute` endpoint.

First, we'll prepare the file containing the endpoints arguments. We'll refer to this file as `call_multisig_arguments.json`. The `proposeTransferExecute` endpoint requires four arguments, the first is of type `Address`, the second one is of type `BigUInt`, the third is of type `Option<u64>` and the fourth is of type `variadic<bytes>`. All the arguments in this file **should** be placed inside a list. The arguments file should look like this:

```json
[
  {
    "bech32": "erd1qqqqqqqqqqqqqpgqs63rcpahnwtjnedj5y6uuqh096nzf75gczpsc4fgtu"
  },
  1000000000000000000,
  5000000,
  [
    {
      "hex": "616464403037"
    }
  ]
]
```

Let's go a bit through our file and see why it looks like this. First, as mentioned above, we have to place all the arguments inside a list. Then, the contract expects an address, so we provide the `bech32` representation. After that, we have a `BigUInt` value that we can provide as a number. The third value is `Option<u64>`, so we provide it as a number, as well. In case we wanted to skip this value, we could've simply used `0`. The last parameter is of type `variadic<bytes>`. Because it's a variadic value, we have to place the arguments inside a list. Since we can't write bytes, we `hex encode` the value and place it in a dictionary containing the key-value pair `"hex": "<hex_string>"`, same as we did above for the address.

After finishing the arguments file, we can run the following command to call the endpoint:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgqjsg84gq5e79rrc2rm5ervval3jrrfvvfd8sswc6xjy \
    --proxy=https://devnet-gateway.multiversx.com \
    --abi ~/contracts/multisig/output/multisig.abi.json \
    --arguments-file call_multisig_arguments.json \
    --function proposeTransferExecute
    --gas-limit 500000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

[comment]: # (mx-context-auto)

## Querying the Smart Contract

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

### Querying the smart contract providing the ABI file

We'll call the `signed` readonly endpoint of the [multisig contract](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig). This endpoint accepts two arguments: the first is the address, and the second is the proposal ID, which will be used to verify if the address has signed the proposal. The endpoint returns a `boolean` value, `true` if the address has signed the proposal and `false` otherwise.

Let's prepare the arguments file. The first argument is of type `Address` and the second one is of type `u32`, so our file looks like this:

```json
[
  {
    "bech32": "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"
  },
  1
]
```

As above, we encapsulate the address in a dictionary and the `u32` value is simply a number. We'll refer to this file as `query_multisig_arguments.json`.

After preparing the file, we can run the following command:

```sh
mxpy contract query erd1qqqqqqqqqqqqqpgqjsg84gq5e79rrc2rm5ervval3jrrfvvfd8sswc6xjy \
    --proxy https://devnet-gateway.multiversx.com \
    --function signed \
    --abi ~/contracts/multisig/output/multisig.abi.json \
    --arguments-file query_multisig_arguments.json
```

[comment]: # (mx-context-auto)

## Upgrading a Smart Contract

In case there's a new release of your Smart Contract, or perhaps you've patched a possible vulnerability you can upgrade the code of the Smart Contract deployed on the network.

We've modified our adder contract to add `1` to every value added to the contract. Now every time the `add()` function is called will add the value provided with `1`. In order to do that we access the source code and navigate to the `add()` endpoint. We can see that `value` is added to `sum` each time the endpoint is called. Modify the line to look something like this `self.sum().update(|sum| *sum += value + 1u32);`

Before deploying the contract we need to build it again to make sure we are using the latest version. We then deploy the newly built contract, then we call it and query it.

First we build the contract:

```sh
sc-meta all build
```

Then we upgrade the contract by running:

```sh
mxpy contract upgrade erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --bytecode ~/contracts/adder/output/adder.wasm \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --arguments 0 --gas-limit 5000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --send
```

We provide as a positional argument the contract's address that we want to upgrade, in our case the previously deployed adder contract. The `--bytecode` is used to provide the new code that will replace the old code. We also set the `--arguments` to `0` as we didn't change the constructor and the contract will start counting from `0` again. The rest of the arguments you know from all the previous operations we've done.

As shown above, we can also upgrade the contract by providing the ABI file and the arguments file:

```sh
mxpy contract upgrade erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --bytecode ~/contracts/adder/output/adder.wasm \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --gas-limit 5000000 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --abi=~/contracts/multisig/output/multisig.abi.json,
    --arguments-file=upgrade_arguments.json
    --send
```

Now let's add `5` to the contract one more time. We do so by running the following:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 \
    --pem=~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --proxy=https://devnet-gateway.multiversx.com --chain D \
    --function add --arguments 5 --gas-limit 1000000 \
    --send
```

Now, if we query the contract we should see the value `6`. We added `5` in the contract but modified the contract code to add `1` to every value. Let's see!

```sh
mxpy contract query erd1qqqqqqqqqqqqqpgq3zrpqj3sulnc9xq95sljetxhf9s07pqtd8ssfkxjv4 --proxy https://devnet-gateway.multiversx.com --function getSum
```

We see that we indeed got the value `6`. Our upgrade was successful.

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
    --docker-image="multiversx/sdk-rust-contract-builder:v8.0.1" \
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
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --receiver erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
    --gas-limit 50000 --value 1000000000000000000 \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --send
```

That's it! As easy as that. We sent a transaction from Alice to Bob. We choose the receiver of our transaction using the `--receiver` argument and set the gas limit to `50000` because that is the gas cost of a simple move balance transaction. Notice we used the `--value` argument to pass the value that we want to transfer but we passed in the denomintated value. We transferred 1 eGLD (1 \* 10^18). We then specify the proxy and the chain ID for the network we want to send our transaction to and use the `--send` argument to broadcast it.

In case you want to save the transaction you can also provide the `--outfile` argument and a `json` file containing the transaction will be saved at the specified location. If you just want to prepare the transaction without broadcasting it simply remove the `--send` argument.

[comment]: # (mx-context-auto)

## Guarded transactions

If your address is guarded, you'll have to provide some additional arguments because your transaction needs to be co-signed.

The first extra argument we'll need is the `--guardian` argument. This specifies the guardian address of our address. Then, if our account is guarded by a service like our trusted co-signer service we have to provide the `--guardian-service-url` which specifies where the transaction is sent to be co-signed.

Keep in mind that **mxpy** always calls the `/sign-transaction` endpoint of the `--guardian-service-url` you have provided. Another argument we'll need is `--guardian-2fa-code` which is the code generated by an external authenticator.

Each guarded transaction needs an additional `50000` gas for the `gasLimit`. The `version` field needs to be set to `2`. The `options` field needs to have the second least significant bit set to "1".

:::note
Here are the urls to our hosted co-signer services:

- Mainnet: [https://tools.multiversx.com/guardian](https://tools.multiversx.com/guardian)
- Devnet: [https://devnet-tools.multiversx.com/guardian](https://devnet-tools.multiversx.com/guardian)
- Testnet: [https://testnet-tools.multiversx.com/guardian](https://testnet-tools.multiversx.com/guardian)

:::

```sh
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem \
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

## Relayed transactions V3

Relayed transactions are transactions with the fee paid by a so-called relayer. In other words, if a relayer is willing to pay for a transaction, it is not mandatory for the sender to have any EGLD for fees. To learn more about relayed transactions check out [this page](/developers/relayed-transactions/).

In this section we'll see how we can send `Relayed V3` transactions using `mxpy`. For a more detailed look on `Relayed V3` transactions, take a look [here](/developers/relayed-transactions/#relayed-transactions-version-3). For these kind of transactions two new transaction fields were introduced, `relayer` and `relayerSignature`. In this example we'll see how we can create the relayed transaction.

For this, a new command `mxpy tx relay` has been added. The command can be used to relay a previously signed transaction. The saved transaction can be loaded from a file using the `--infile` argument.

There are two options when creating the relayed transaction:
1. Create the relayed transaction separately. (Sender signature and relayer signature are added by different entities.)
2. Create the complete relayed transaction. (Both signatures are added by the same entity.)

### Creating the inner transaction

The inner transaction is any regular transaction, with the following notes:
- relayer address must be added
- extra 50000 (base cost) gas must be added for the relayed operation. For more details on how the gas is computed, check out [this page](/developers/relayed-transactions/#relayed-transactions-version-3).

This can be generated through `mxpy tx new` command. A new argument `--relayer` has been added for this feature.

```sh
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --receiver erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
    --gas-limit 100000 --value 1000000000000000000 \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --relayer erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8 \
    --outfile inner_tx.json
```

After creating the inner transaction, we are ready to create the relayed transaction.

### Creating the relayed transaction

We can create the relayed transaction by running the following command:

```sh
mxpy tx relay --relayer-pem ~/multiversx-sdk/testwallets/latest/users/carol.pem \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --infile inner_tx.json \
    --send
```

### Creating the relayed transaction in one step

This can be done through `mxpy tx new` command, as follows:
```sh
mxpy tx new --pem ~/multiversx-sdk/testwallets/latest/users/alice.pem \
    --receiver erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx \
    --relayer erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8 \
    --relayer-pem ~/multiversx-sdk/testwallets/latest/users/carol.pem \
    --gas-limit 100000 --value 1000000000000000000 \
    --proxy https://devnet-gateway.multiversx.com --chain D \
    --send
```

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
mxpy tx new --proxy https://devnet-gateway.multiversx.com \
    --receiver erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th \
    --gas-limit 50000 --value 1000000000000000000 \
    --ledger \
    --send
```

By default, the first MultiversX address managed by the device is used as the sender (signer) of the transaction. In order to select a different address, you can use the `--ledger-address-index` CLI parameter:

```sh
mxpy tx new --proxy https://devnet-gateway.multiversx.com \
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
mxpy contract deploy --proxy=https://devnet-gateway.multiversx.com \
    --bytecode=adder.wasm --gas-limit=5000000 \
    --ledger --ledger-address-index=42 \
    --send
```

Then, perform a contract call:

```sh
mxpy contract call erd1qqqqqqqqqqqqqpgqwwef37kmegph97egvvrxh3nccx7xuygez8ns682zz0 \
    --proxy=https://devnet-gateway.multiversx.com \
    --function add --arguments 42 --gas-limit 5000000 \
    --ledger --ledger-address-index=42 \
    --send
```

:::note
As of October 2023, on Windows (or WSL), you might encounter some issues when trying to use Ledger in `mxpy`.
:::

## Interacting with the Multisig Smart Contract

As of `mxpy v11`, interacting with Multisig contracts has become a lot easier because a dedicated command group called `mxpy multisig` has been added. We can deploy a multisig contract, create proposals and query the contract. For a full list of all the possible actions, run the following command:

```sh
mxpy multisig -h
```

#### Deploying a multisig contract

```sh
mxpy multisig deploy --bytecode path/to/multisig.wasm \
    --abi path/to/multisig.abi.json
    --quorum 2
    --board-members erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx
    --proxy=https://devnet-gateway.multiversx.com \
    --gas-limit 100000000 \
    --send
```

#### Creating a new proposal

```sh
mxpy multisig add-board-member --contract erd1qqqqqqqqqqqqqpgq2ukrsg73nwgu3uz6sp8vequuyrhtv2akd8ssyrg7wj \
    --abi path/to/multisig.abi.json
    --board-member erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8
    --proxy=https://devnet-gateway.multiversx.com \
    --gas-limit 10000000 \
    --send
```

#### Querying the contract

```sh
mxpy multisig get-proposers --contract erd1qqqqqqqqqqqqqpgq2ukrsg73nwgu3uz6sp8vequuyrhtv2akd8ssyrg7wj \
    --abi path/to/multisig.abi.json
    --proxy=https://devnet-gateway.multiversx.com
```

## Interacting with the Governance Smart Contract

As of `mxpy v11`, mxpy allows for easier interaction with the Governance smart contract. We can create a new governance proposal, vote for a proposal and query the contract. For a full list of the available commands, run the following command:

```sh
mxpy governance -h
```

#### Creating a new proposal

```sh
mxpy governance propose \
    --commit-hash 30118901102b0bef11d675f4327565ae5246eeb5 \
    --start-vote-epoch 1000 \
    --end-vote-epoch 1010 \
    --proxy=https://devnet-gateway.multiversx.com \
    --gas-limit 100000000 \
    --send
```

#### Voting for a proposal

```sh
mxpy governance vote \
    --proposal-nonce 1 \
    --vote yes \
    --proxy=https://devnet-gateway.multiversx.com \
    --gas-limit 100000000 \
    --send
```

#### Querying the contract

```sh
mxpy governance get-proposal-info \
    --proposal-nonce 1 \
    --proxy=https://devnet-gateway.multiversx.com
```
