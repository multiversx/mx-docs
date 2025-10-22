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

1. We want to deploy a new smart contract on the Devnet.
2. We then need to upgrade the contract, to make it payable.
3. We call an endpoint without transferring any assets.
4. We make an `ESDTTransfer`, in order to call a payable endpoint.
5. We call a view function.

[comment]: # (mx-context-auto)

## Prerequisites

Before starting this tutorial, make sure you have the following:

- [`mxpy`](/sdk-and-tools/mxpy/mxpy-cli). Follow the [installation guide](/sdk-and-tools/mxpy/installing-mxpy) - make sure to use the latest version available.
- `stable` **Rust** version `≥ 1.83.0`. Follow the [installation guide](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta).
- `sc-meta` (install [multiversx-sc-meta](/docs/developers/meta/sc-meta-cli.md)).

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
CHAIN_ID="D"

deploySC() {
    mxpy --verbose contract deploy \
        --bytecode=${WASM_PATH} \
        --pem=${WALLET_PEM} \
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 \
        --send || return
}
```

Run in terminal the following command to deploy the smart contract on Devnet. Replace `arg1` and `arg2` with your desired deployment values.

```shell
source devnet.snippets.sh
deploySC arg1 arg2
```

Now let's look at the structure of the interaction. It receives the path of the **wasm file**, where we previously built the contract. It also receives the path of the **wallet** (the PEM file), the **proxy URL** and the **chain ID**, where the contract will be deployed. Another important parameter is the **gas limit**, where we state the maximum amount of gas we are willing to spend with this transaction. Each transaction cost depends on its complexity and the amount of data storage it handles.

Other than this, we also have the **arguments** keyword, that allows us to pass in the required parameters. As we previously said, deploying a smart contract means that we run the **init** function, which may or may not request some parameters. In our case, the **init** function has two different arguments, and we pass them when calling the **deploy** function. We'll come back later in this section at how we can pass parameters in function calls.

After the transaction is sent, `mxpy` will output information like the **transaction hash**, **data** and any other important information, based on the type of transaction. In case of a contract deployment, it will also output the newly deployed contract address.

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
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 \
        --send || return
}
```

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
ADDRESS_ARGUMENT=addr:erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3

myNonPayableEndpoint() {
    address_argument="0x$(mxpy wallet bech32 --decode ${ADDRESS_ARGUMENT})"
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="myNonPayableEndpoint" \
        --arguments $address_argument $1 $2 ${THIRD_BIGUINT_ARGUMENT}\
        --send || return
}
```

So, what happens in this interaction and how do we call it?

Besides the function and arguments parts, the snippet is more or less the same as when deploying or upgrading a contract. When calling a non payable function, we need to provide the endpoint's name as the function argument. As for the arguments, they have to be in the **same order** as in the smart contract, including when calling an endpoint that has a variable number of arguments. Now, for the sake of example, we provided the arguments in multiple ways.

It is up to each developer to choose the layout he prefers, but a few points need to be underlined:

- Most of the supplied **arguments** need to be in the **hexadecimal format**: `0x...`.
- When converting a value to a hexadecimal format, we need to make sure it has an **even number** of characters. If not, we need to provide an extra `0` in order to make it even:
  - Example: the number `911` -> in hexadecimal encoding, it is equal to: `38f` -> so we need to provide the argument `0x038f`.
- Arguments can be provided both as a fixed arguments (usually for unchangeable arguments like the contract's address or a fixed number) or can be provided as an input in the terminal, when interacting with the snippet (mostly used for arguments that change often like numbers).

In our example we provide the address argument as a fixed argument. We then convert it to hexadecimal format (as it is in the bech32 format by default) and only after that we pass it as a parameter. As for the `BigUint` parameters, we provide the first two parameters directly in the terminal and the last one as a fixed argument, hexadecimal encoded.

:::tip
`mxpy` facilitates us with some encoding conventions, including:

- We can use `str:` for encoding strings. For example: `str:MYTOKEN-123456`.
- Blockchain addresses that start with `erd1` are automatically encoded, so there is no need to further hex encode them.
- The values **true** or **false** are automatically converted to **boolean** values.
- Values that are identified as **numbers** are hex encoded by default.
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
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
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
myNonPayableEndpoint erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3 10000 100000 1000000
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
    method_name=str:myPayableEndpoint
    my_token=str:$1
    token_amount=$2
    mxpy --verbose contract call ${CONTRACT_ADDRESS} \
        --pem=${WALLET_PEM} \
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="ESDTTransfer" \
        --arguments $my_token $token_amount $method_name\
        --send || return
}
```

As we can see, the way we call a **payable endpoint** is by calling an `ESDTTransfer` function (or any other function that transfer assets and supports contract calls) and providing the name of the method as an argument. The order of the arguments differs for each transfer function. In our case, we specify in the terminal the **token type** and **the amount of tokens** we want to transfer and then we provide as a **fixed input** what smart contract endpoint we want to call.

[comment]: # (mx-context-auto)

### Non-fungible ESDT transfer (NFT, SFT and META ESDT)

Now let's suppose we want to call an endpoint that accepts an NFT or an SFT as payment.

```shell
###PARAMS
#   $1 = NFT/SFT Token Identifier,
#   $2 = NFT/SFT Token Nonce,
#   $3 = NFT/SFT Token Amount,
#   $4 = Destination Address,
FIRST_BIGUINT_ARGUMENT=1000
SECOND_BIGUINT_ARGUMENT=10000
MY_WALLET_ADDRESS=erd1...

myESDTNFTPayableEndpoint() {
    method_name=str:myESDTNFTPayableEndpoint
    sft_token=str:$1
    sft_token_nonce=$2
    sft_token_amount=$3
    destination_address=addr:$4
    mxpy --verbose contract call ${MY_WALLET_ADDRESS} \
        --pem=${WALLET_PEM} \
        --gas-limit=100000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="ESDTNFTTransfer" \
        --arguments $sft_token \
                    $sft_token_nonce \
                    $sft_token_amount \
                    $destination_address \
                    $method_name \
                    ${FIRST_BIGUINT_ARGUMENT} \
                    ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
}
```

First of all, to call this type of transfer function we need to pass the receiver address the same as the sender address. So in this example, `MY_WALLET_ADDRESS` is the caller's address of the PEM wallet used.

Now, like in the case of `ESDTTransfer`, the name of the called function is `ESDTNFTTransfer`. All the other required data is passed as arguments (including the destination contract's address and the endpoint).

In case of this single NFT/SFT transfer, we first pass the **token** (identifier, nonce and amount) and then we pass the **destination address** and the **name of the endpoint**. In the end we pass whatever parameters the indicated method needs.

[comment]: # (mx-context-auto)

### Multi-ESDT transfer

In case we need to call an endpoint that accepts multiple tokens (let's say for example 2 fungible tokens and an NFT). Let's take a look at the following example:

```shell

###PARAMS
#   $1 = Destination Address,
#   $2 = First Token Identifier,
#   $3 = First Token Amount,
#   $4 = Second Token Identifier,
#   $5 = Second Token Amount,
#   $6 = Third Token Identifier,
#   $7 = Third Token Nonce,
#   $8 = Third Token Identifier,
FIRST_BIGUINT_ARGUMENT=1000
SECOND_BIGUINT_ARGUMENT=10000

myMultiESDTNFTPayableEndpoint() {
    method_name=str:myMultiESDTPayableEndpoint
    destination_address=addr:$1
    number_of_tokens=3
    first_token=str:$2
    first_token_nonce=0
    first_token_amount=$3
    second_token=str:$4
    second_token_nonce=0
    second_token_amount=$5
    third_token=str:$6
    third_token_nonce=$7
    third_token_amount=$8

    mxpy --verbose contract call $user_address \
        --pem=${WALLET_PEM} \
        --gas-limit=100000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="MultiESDTNFTTransfer" \
        --arguments $destination_address \
                    $number_of_tokens \
                    $first_token \
                    $first_token_nonce \
                    $first_token_amount \
                    $second_token \
                    $second_token_nonce \
                    $second_token_amount \
                    $third_token \
                    $third_token_nonce \
                    $third_token_amount \
                    $method_name \
                    ${FIRST_BIGUINT_ARGUMENT} \
                    ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
}
```

In this example, we call `myMultiESDTPayableEndpoint` endpoint, by transferring **3 different tokens**: the first two are fungible tokens and the last one is an NFT.

The endpoint takes 2 BigUInt arguments. The layout of the snippet is almost the same as with `ESDTNFTTransfer` (including the fact that the sender is the same as the receiver) but has different arguments. We now pass the destination address first and the number of ESDT/NFT tokens that we want to sent. Then, for each sent token, we specify the identifier, the nonce (in our example 0 for the fungible tokens and a specific value for the NFT) and the amount. In the end, like with the `ESDTTransfer`, we pass the name of the method we want to call and the rest of the parameters of that specific method.

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
