---
id: mxpy-cli
title: mxpy CLI cookbook
---

[comment]: # (mx-abstract)

mxpy (Command Line Interface)

**mxpy**, as a command-line tool, can be used to simplify and automate the interaction with the MultiversX network - it can be easily used in shell scripts, as well. It implements a set of **commands**, organized within **groups**. 

The complete Command Line Interface is listed [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md). Command usage and description are available through the `--help` or `-h` flags.

For example:

```
mxpy --help
mxpy tx --help
mxpy tx new --help
```

This page will guide you through the process of handling common tasks using **mxpy**.

## Upgrading mxpy

If you are using a older version of `mxpy` you can simply upgrade to a newer version by typing the following commands in a terminal:

```sh
wget -O mxpy-up.py https://raw.githubusercontent.com/multiversx/mx-sdk-py-cli/main/mxpy-up.py
python3 mxpy-up.py
```

This will recreate the light Python virtual environment (based on `venv`) in `~/multiversx-sdk/mxpy-venv`. 
Since you've had a previous `mxpy` version installed, you probably have already altered the **`$PATH`** variable so you don't have to re-alter it.

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

When installing dependecies the `--overwrite` argument can be used to overwrite an existing version. Also the `--tag` argument can be used to specify the exact version you want to install.

For example, to install `rust`, you can simply type the command:
```sh
mxpy deps install rust
```

If no tag is provided the default version will be installed.

:::note Default rust version
The default rust version is the version referenced by the Docker image used for reproducible builds.
:::

## Building a smart contract

Before deploying your smart contract on the network you need to build it first.

The `mxpy` command used for building contracts is:
```sh
mxpy contract build
```

The command accepts a few parameters that you can check out [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#contractbuild) or by simply typing:
```sh
mxpy contract build --help
```

## Deploying a smart contract

After you've built your smart contract, it's ready to be deployed on the network.

For deploying a smart contract the following command can be used:
```sh
mxpy contract deploy
```

To deploy a smart contract you have to send a transaction to the **Smart Contract Deploy Address** and that address is `erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu`, but you don't have to worry about setting the receiver of the transaction because the above command takes care of it.

The `--bytecode` argument needs to be provided. That is responsible for providing the `.wasm` file after the contract has been built.

If you've built the smart contract using `mxpy` the built `.wasm` file will be in a folder called _output_.

For example, if your contract is in `~/contracts/adder` the `adder.wasm` file that is the built contract will be in `~/contracts/adder/output`. So, when providing the `--bytecode` argument the path should be `~/contracts/adder/output/adder.wasm`.

The `mxpy contract deploy` command needs a multitude of other parameters that can be checked out [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#contractdeploy) or by simply typing the following:
```sh
mxpy contract build --help
```

## Verifying a smart contract

Verifying a smart contract means that the code you deployed on the network is the same as the code in your smart contract. That is done by an external service that builds the contract with the same configuration and checks the hashes. If the hashes match it means that the contracts are the same. If the code is slightly modified the hashes won't match.

The command used for verifying contracts is:
```sh
mxpy contract verify
```

**Add more details here**

:::info
The deployer of the contract needs to be the one who initializes the code verification process
:::

## Converting a wallet

As you may know, there are multiple ways in which you can store your secret keys.

To convert a wallet from a type to another you can use:
```sh
mxpy wallet convert
```

:::info
Keep in mind that after converting your secret phrase in a PEM or keystore format, you **can not** convert back to secret phrase.
We advise you keep a backup of your secret phrase somewhere safe.
:::

For example, let's say you want to convert from _mnemonic_ to a _PEM_ file. We can do that by typing the following:
```sh
mxpy wallet convert --in-format raw-mnemonic --out-format pem
```

You will then be asked to enter the mnemonic. After typing the mnemonic press `Ctrl + D` for Linux/MacOS or `Ctrl + Z` for Windows.

We can also convert your mnemonic to a keystore file. That can be done by typing:
```sh
mxpy wallet convert --in-format raw-mnemonic --out-format keystore-mnemonic --outfile keystore.json
```

After inserting the mnemonic you will be asked to provide a password for the file. Insert the password then press enter. A file named `keystore.json` has been created.

The command arguments can be found [here](https://github.com/multiversx/mx-sdk-py-cli/blob/main/CLI.md#walletconvert) or by typing:
```sh
mxpy wallet convert --help
```
