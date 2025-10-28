---
id: smart-contract-interactions
title: Smart contract interactions
---

[comment]: # (mx-abstract)

Let's dive deeper into smart contract interactions and what you need to know to interact with a contract. If you followed the [previous `mxpy`](/docs/sdk-and-tools/mxpy/mxpy-cli.md) related documentation, you should be able to set up your prerequisites like proxy URL, the chain ID and the PEM file.

For this, we need a file inside the contract's folder, with a suggestive name. For example: `devnet.snippets.sh`.

:::important
In order to be able to call methods from the file, we need to assign the shell file as a source file in the terminal. We can do this by running the next command:

```shell
source devnet.snippets.sh
```

After each change to the interactions file, we need to repeat the source command.
:::

Let's take the following example:

1. We want to **deploy** a new smart contract on the Devnet.
2. We then need to **upgrade** the contract, to make it payable.
3. We **call** an endpoint without transferring any assets.
4. We **transfer** ESDT, in order to call a payable endpoint.
5. We call a **view** function.

[comment]: # (mx-context-auto)

## Prerequisites

Before starting this tutorial, make sure you have the following:

- [`mxpy`](/sdk-and-tools/mxpy/mxpy-cli). Follow the [installation guide](/sdk-and-tools/mxpy/installing-mxpy) - make sure to use the latest version available.
- `stable` **Rust** version `≥ 1.83.0`. Follow the [installation guide](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta).
- `sc-meta`. Follow the [installation guide](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta).

[comment]: # (mx-context-auto)

## Deploy

First things first. In order to deploy a new contract, we need to use `sc-meta` to build it, in the contract root, by invoking the next command:

```shell
sc-meta all build
```

This will output the WASM bytecode, to be used within the interactions file:

```shell
WASM_PATH="~/my-contract/output/my-contract.wasm"
```

Now, in order to deploy the contract, we use the special **deploy** function of `mxpy`, that deploys the contract on the appointed chain, and runs the **init** function of the contract.

```shell
WALLET_PEM="~/my-wallet/my-wallet.pem"
PROXY="https://devnet-gateway.multiversx.com"

deploySC() {
    mxpy --verbose contract deploy \
        --bytecode=${WASM_PATH} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --arguments $1 $2 \
        --send || return
}
```

Run in terminal the following command to deploy the smart contract on Devnet. Replace `arg1` and `arg2` with your desired deployment values.

```shell
source devnet.snippets.sh
deploySC arg1 arg2
```

Now let's look at the structure of the interaction. It receives the path of the **wasm file**, where we previously built the contract. It also receives the path of the **wallet** (the PEM file) and the **proxy URL** where the contract will be deployed.

Other than this, we also have the **arguments** keyword, that allows us to pass in the required parameters. As we previously said, deploying a smart contract means that we run the **init** function, which may or may not request some parameters. In our case, the **init** function has two different arguments, and we pass them when calling the **deploy** function. We'll come back later in this section at how we can pass parameters in function calls.

After the transaction is sent, `mxpy` will output information like the **transaction hash**, **data** and any other important information, based on the type of transaction. In case of a contract deployment, it will also output the **newly deployed contract address**.

[comment]: # (mx-context-auto)

## Upgrade

Let's now suppose we need to make the contract **payable**, in case it needs to receive funds. We could redeploy the contract but that will mean two different contracts, and not to mention that we will lose any existing storage. For that, we can use the **upgrade** command, that replaces the existing smart contract bytecode with the newly built contract version.

:::caution
It is import to handle data storage with caution when upgrading a smart contract. Data structure, especially for complex data types, must be preserved, otherwise the data may become corrupt.
:::

The upgrade function would look like this:

```shell
CONTRACT_ADDRESS="erd1qqqqqqqqqqqqqpgqspymnxmfjve0vxhmep5vr3tf6sj8e80dd8ss2eyn3p"

upgradeSC() {
    mxpy --verbose contract upgrade ${CONTRACT_ADDRESS} --metadata-payable \
        --bytecode=${WASM_PATH} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --arguments $1 $2 \
        --send || return
}
```

`CONTRACT_ADDRESS` is a placeholder value which value needs to be replaced with the address previously generated in the deploy action.

Here we have 2 new different elements that we need to observe:

1. We changed the **deploy** function with the **upgrade** function. This new function requires the address of the previously deployed smart contract so the system can identify which contract to update. It is important to note that this function can only be called by the smart contract's owner.
2. The **metadata-payable** keyword, which represents a [code metadata](/docs/developers/data/code-metadata.md) flag that allows the smart contract to receive payments.

[comment]: # (mx-context-auto)

## Non payable endpoint interaction

Let's suppose we want to call the following endpoint, that receives an address and three different `BigUint` arguments, in this specific order.

```shell
###PARAMS
#   $1 = FirstBigUintArgument
#   $2 = SecondBigUintArgument
THIRD_BIGUINT_ARGUMENT=0x0f4240
ADDRESS_ARGUMENT=erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3

myNonPayableEndpoint() {
    address_argument="0x$(mxpy wallet bech32 --decode ${ADDRESS_ARGUMENT})"
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --function="myNonPayableEndpoint" \
        --arguments $address_argument $1 $2 ${THIRD_BIGUINT_ARGUMENT}\
        --send || return
}
```

So, what happens in this interaction and how do we call it?

Besides the function and arguments parts, the snippet is more or less the same as when deploying or upgrading a contract. When calling a **non payable** function, we need to provide the **endpoint's name** as the function argument. As for the arguments, they have to be in the **same order** as in the endpoint's signature. Now, for the sake of example, we provided the arguments in multiple ways.

It is up to each developer to choose the layout he prefers, but a few points need to be underlined:

- Most of the supplied **arguments** need to be in the **hexadecimal format**: `0x...`.
- When converting a value to a hexadecimal format, we need to make sure it has an **even number** of characters. If not, we need to provide an extra `0` in order to make it even:
  - Example: the number `911` -> in hexadecimal encoding, it is equal to: `38f` -> so we need to provide the argument `0x038f`.
- Arguments can be provided both as a fixed arguments (usually for unchangeable arguments like the contract's address or a fixed number) or can be provided as an input in the terminal, when interacting with the snippet (mostly used for arguments that change often like numbers).

In our example we provide the address argument as a fixed argument. We then convert it to hexadecimal format (as it is in the bech32 format by default) and only after that we pass it as a parameter. As for the `BigUint` parameters, we provide the first two parameters directly in the terminal and the last one as a fixed argument, hexadecimal encoded.

:::tip
`mxpy` provides the following encoding conventions:

- We can use `str:` for encoding strings. For example: `str:MYTOKEN-123456`.
- Blockchain addresses that start with `erd1` are automatically encoded, so there is no need to further hex encode them.
- The values **true** or **false** are automatically converted to **boolean** values.
- Values that are identified as **numbers** are hex encoded as `BigUint` values.
- Arguments like `0x...` are left unchanged, as they are interpreted as already encoded hex values.

:::

So, in case of our **myNonPayableEndpoint** interaction, we can write it like so:

```shell
###PARAMS
#   $1 = FirstBigUintArgument
#   $2 = SecondBigUintArgument
THIRD_BIGUINT_ARGUMENT=1000000
ADDRESS_ARGUMENT=addr:erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3

myNonPayableEndpoint() {
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --function="myNonPayableEndpoint" \
        --arguments ${ADDRESS_ARGUMENT} $1 $2 ${THIRD_BIGUINT_ARGUMENT}\
        --send || return
}
```

A call example for this endpoint would look like:

```shell
source devnet.snippets.sh
myNonPayableEndpoint 10000 100000
```

Using unencoded values (for easier reading) would translate into:

```shell
myNonPayableEndpoint addr:erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3 10000 100000 1000000
```

:::caution
It is import to make sure all arguments have the correct encoding. Otherwise, the transaction will fail.
:::

[comment]: # (mx-context-auto)

## Payable endpoint interaction

[comment]: # (mx-context-auto)

### Fungible ESDT transfer

Now let's take a look at the following example, where we want to call a payable endpoint.

```shell
myPayableEndpoint() {
    token_identifier=$1
    token_amount=$2
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --token-transfers $token_identifier $token_amount \
        --function="myPayableEndpoint" \
        --send || return
}
```

To call a **payable endpoint**, we use the  `--token-transfer` flag, which requires two values:

1. The token identifier.
2. The amount.

In our case, we specify in the terminal the **token identifier** and **the amount of tokens** we want to transfer.

:::info
When specifying the amount of tokens to transfer, the value must include the token's decimal precision.

For example EGLD use 18 decimals. This means that if you want to transfer 1.5 EGLD, the amount value will be $1.5 \times 10^{18}$.
:::

[comment]: # (mx-context-auto)

### Non-fungible ESDT transfer (NFT, SFT and META ESDT)

Now let's suppose we want to call an endpoint that accepts an NFT or an SFT as payment.

```shell
###PARAMS
#   $1 = NFT/SFT Token Identifier,
#   $2 = NFT/SFT Token Amount,
FIRST_BIGUINT_ARGUMENT=1000
SECOND_BIGUINT_ARGUMENT=10000

myESDTNFTPayableEndpoint() {
    sft_token_identifier=$1
    sft_token_amount=$2
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --token-transfers $sft_token_identifier $sft_token_amount \
        --function="myESDTNFTPayableEndpoint" \
        --arguments ${FIRST_BIGUINT_ARGUMENT} ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
}
```

[comment]: # (mx-context-auto)

### Multi-ESDT transfer

In case we need to call an endpoint that accepts multiple tokens (let's say for example 2 fungible tokens and an NFT). Let's take a look at the following example:

```shell
###PARAMS
#   $1 = First Token Identifier,
#   $2 = First Token Amount,
#   $3 = Second Token Identifier,
#   $4 = Second Token Amount,
#   $5 = Third Token Identifier,
#   $6 = Third Token Amount,
FIRST_BIGUINT_ARGUMENT=1000
SECOND_BIGUINT_ARGUMENT=10000

myMultiESDTNFTPayableEndpoint() {
    first_token_identifier=$1
    first_token_amount=$2
    second_token_identifier=$3
    second_token_amount=$4
    third_token_identifier=$5
    third_token_amount=$6

    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --proxy=${PROXY} \
        --token-transfers $first_token_identifier $first_token_amount \
                        $second_token_identifier $second_token_amount \
                        $third_token_identifier $third_token_amount \
        --function="payable_nft_with_args" \
        --arguments ${FIRST_BIGUINT_ARGUMENT} ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
```

In this example, we call `myMultiESDTPayableEndpoint` endpoint, by transferring **3 different tokens**: the first two are fungible tokens and the last one is an NFT.

:::tip
More information about ESDT Transfers [here](/tokens/fungible-tokens/#transfers).
:::

[comment]: # (mx-context-auto)

## View interaction

In case we want to call a view function, we can use the **query** keyword.

```shell
###PARAMS
#   $1 = First argument
#   $2 = Second argument

myView() {
    mxpy --verbose contract query ${CONTRACT_ADDRESS} \
        --proxy=${PROXY} \
        --function="myView" \
        --arguments $1 $2
}
```

When calling a **view** function, `mxpy` will output the standard information in the terminal, along with the results, formatted based on the requested data type. The arguments are specified in the same way as with endpoints.
