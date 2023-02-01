---
id: smart-contract-interactions
title: Smart contract interactions
---

[comment]: # (mx-context-auto)

Let's dive deeper into the Smart Contract interactions and what do you need to know when you need to interact with a SC. If you followed the previous mxpy related documentation, you should be able to set up your prerequisites like proxy URL, the chain ID and the PEM file.
For this, we need an interactions file. Usually, we find this file inside the contract's folder, in an **interaction** folder. The interactions file usually has a suggestive name, related to which chain the setup has been done. For example: **devnet.snippets.sh**.

:::important
In order to be able to call methods from the interactions file, we need to assign the shell file as a source file in the terminal. We can do this by running the `source devnet.snippets.sh` command. Also, after each change to the interactions file structure, we need to repeat the source command.
:::

Let's take the following example:

- We want to deploy a new SC on the Devnet
- We then need to upgrade the contract, to make it payable
- We call an endpoint without transferring any assets
- We make an ESDTTransfer, in order to call a payable endpoint
- We call a view function

[comment]: # (mx-context-auto)

## Deploy & Upgrade

First things first. In order to deploy a new contract, we need to use mxpy to build it by using the `mxpy contract build` command. This will create the output wasm file and inside the interactions file we can save it as a fixed parameter:

```
WASM_PATH="~/my-contract/output/my-contract.wasm"
```

Now, in order to deploy the contract, we use the special **deploy** function of mxpy, that deploys the contract on the appointed chain, and runs the **init** function of the contract.

```
deploySC() {
    mxpy --verbose contract deploy --recall-nonce \
        --bytecode=${WASM_PATH} \
        --pem=${WALLET_PEM} \
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 \
        --send || return
}
```

Now let's look at the structure of the interaction. It receives the path of the wasm file, where we previously built the contract. It also receives the path of the PEM file, the proxy url and the chain id, where the contract will be deployed. Another important parameter is the gas limit, where we state the maximum amount of gas we are willing to spend with this transaction. Each transaction cost depends on its complexity and the amount of data storage it handles.

Another argument we must take a closer look at is **recall-nonce**. As we know, each account has its own nonce, that increases with each sent transaction. That being said, when calling an endpoint or a deploy function and so on, we must pass the next-in-line nonce, for the transaction to be correctly processed. And **recall-nonce** does just that. It gives us the correct nonce by querying the blockchain for the last one.

Other than this, we also have the **arguments** keyword, that allows us to pass in the required parameters. As we previously said, deploying a smart contract means that we run the **init** function, which may or may not request some parameters. In our case, the **init** function has two different arguments, and we pass them when calling the **deploy** function. We'll come back later in this section at how we can pass parameters in function calls.

After the transaction is sent, mxpy will output information like the transaction hash, data and any other important information, based on the type of transaction. In case of a contract deployment, it will also output the newly deployed contract address.

Let's now suppose we need to make the contract payable, in case it needs to receive funds. We could redeploy the contract but that will mean two different contracts, and not to mention that we will lose any existing storage. For that, we can use the **upgrade** command, that replaces the existing SC bytecode with the newly built contract version.

:::caution
It is import to handle data storage with caution when upgrading a smart contract. Data structure, especially for complex data types, must be preserved, otherwise the data may become corrupt.
:::

The upgrade function would look like this:

```
upgradeSC() {
    mxpy --verbose contract upgrade ${CONTRACT_ADDRESS} --recall-nonce --payable \
        --bytecode=${WASM_PATH} \
        --pem=${WALLET_PEM} \
        --gas-limit=60000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --arguments $1 $2 \
        --send || return
}
```

:::important
When we run the **upgrade** function, we once again call the **init** function of the SC. What this mean is that we must pass the function's parameters again, no matter if they changed or if they remained the same.
:::

Here we have 2 new different elements that we need to observe. First, we changed the **deploy** function with the **upgrade** function, which in turn requires the address of the previously deployed SC address, in order to be able to identify what SC to upgrade. Is important to note that this function can only be called by the SC's owner. The second element we need to observe is the **payable** keyword, which represents a code metadata flag that allows the SC to receive payments.

:::tip
More information about Code Metadata can be found [here](/developers/developer-reference/code-metadata).
:::

[comment]: # (mx-context-auto)

## Non payable endpoint interaction

Let's suppose we want to call the following endpoint, that receives an address and three different BigUint arguments, in this specific order.

```

[comment]: # (mx-context-auto)

###PARAMS
#1 - FirstBigUintArgument
#2 - SecondBigUintArgument

ADDRESS_ARGUMENT="erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3"
THIRD_BIGUINT_ARGUMENT=0x0f4240
myNonPayableEndpoint() {
    address_argument="0x$(mxpy wallet bech32 --decode ${ADDRESS_ARGUMENT})"
    mxpy --verbose contract call ${CONTRACT_ADDRESS} --recall-nonce \
        --pem=${WALLET_PEM} \
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="myNonPayableEndpoint" \
        --arguments $address_argument $1 $2 ${THIRD_BIGUINT_ARGUMENT}\
        --send || return
}
```

So, what happens in this interaction and how do we call it? Besides the function and arguments parts, the snippet is more or less the same as when deploying or upgrading a contract. When calling a non payable function, we need to provide the endpoint's name as the function argument. As for the arguments, they have to be in the same order as in the SC, including when calling an endpoint that has a variable number of arguments. Now, for the sake of example, we provided the arguments in multiple ways. It is up to each developer to choose the layout he prefers, but a few points need to be underlined:

- Most of the supplied arguments need to be in the hex format (0x...).
- When converting a value to a hex format, we need to make sure it has an even number of characters. If not, we need to provide an extra 0 in order to make it even. (e.g. The number 911 -> In hex encoding, it is equal to: 38f -> So we need to provide the argument 0x038f).
- Arguments can be provided both as a fixed arguments (usually for unchangeable arguments like the contract's address or a fixed number) or can be provided as an input in the terminal, when interacting with the snippet (mostly used for arguments that change often like numbers).

In our example we provide the address argument as a fixed argument. We then convert it to hex format (as it is in the bech32 format by default) and only after that we pass it as a parameter. As for the BigUint parameters, we provide the first two parameters directly in the terminal and the last one as a fixed argument, hex encoded.

:::tip
mxpy facilitates us with some encoding conventions, including:

- We can use **str:** for encoding strings. For example: str:MYTOKEN-123456
- Blockchain addresses that start with **erd1** are automatically encoded, so there is no need to further hex encode them
- The values **true** or **false** are automatically converted to **boolean** values
- Values that are identified as **numbers** are hex encoded by default
- Arguments like **0x...** are left unchanged, as they are interpreted as already encoded hex values
  :::

So, in case of our **myNonPayableEndpoint** interaction, we can write it like so:

```

[comment]: # (mx-context-auto)

###PARAMS
#1 - FirstBigUintArgument
#2 - SecondBigUintArgument

ADDRESS_ARGUMENT="erd14nw9pukqyqu75gj0shm8upsegjft8l0awjefp877phfx74775dsq49swp3"
THIRD_BIGUINT_ARGUMENT=1000000
myNonPayableEndpoint() {
    mxpy --verbose contract call ${CONTRACT_ADDRESS} --recall-nonce \
        --pem=${WALLET_PEM} \
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="myNonPayableEndpoint" \
        --arguments $address_argument $1 $2 ${THIRD_BIGUINT_ARGUMENT}\
        --send || return
}
```

A call example for this endpoint would look like:

```
myNonPayableEndpoint 10000 100000
```

This would translate in (using unencoded values for easier reading):

```
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

```
myPayableEndpoint() {
    method_name=str:myPayableEndpoint
    my_token=str:$1
    token_amount=$2
    mxpy --verbose contract call ${CONTRACT_ADDRESS} --recall-nonce \
        --pem=${WALLET_PEM} \
        --gas-limit=6000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="ESDTTransfer" \
        --arguments $my_token $token_amount $method_name\
        --send || return
}
```

As we can see, the way we call a payable endpoint is by calling an ESDTTransfer function (or any other function that transfer assets and supports contract calls) and providing the name of the method as an argument. The order of the arguments differs for each transfer function. In our case, we specify in the terminal the token type and the amount of tokens we want to transfer and then we provide as a fixed input what SC function we want to call.

[comment]: # (mx-context-auto)

### Non-fungible ESDT transfer (NFT, SFT and META ESDT)

Now let's suppose we want to call an endpoint that accepts an NFT or an SFT as payment.

```
#   $1 = NFT/SFT Token Identifier,
#   $2 = NFT/SFT Token Nonce,
#   $3 = NFT/SFT Token Amount,
#   $4 = Destination Address,

FIRST_BIGUINT_ARGUMENT=1000
SECOND_BIGUINT_ARGUMENT=10000
myESDTNFTPayableEndpoint() {
    user_address="$(mxpy wallet pem-address $WALLET_PEM)"
    method_name=str:myESDTNFTPayableEndpoint
    sft_token=str:$1
    sft_token_nonce=$2
    sft_token_amount=$3
    destination_address=$4
    mxpy --verbose contract call $user_address --recall-nonce \
        --pem=${WALLET_PEM} \
        --gas-limit=100000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="ESDTNFTTransfer" \
        --arguments $sft_token
                    $sft_token_nonce
                    $sft_token_amount
                    $destination_address
                    $method_name
                    ${FIRST_BIGUINT_ARGUMENT}
                    ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
}
```

First of all, to call this type of transfer function we need to pass the receiver address the same as the sender address. So in this example we convert the caller's address based on the indicated PEM file. Now, like in the case of `ESDTTransfer`, the name of the called function is `ESDTNFTTransfer`. All the other required data is passed as arguments (including the destination contract's address and the endpoint). In case of this single NFT/SFT transfer, we first pass the token (identifier, nonce and amount) and then we pass the destination address and the name of the endpoint. In the end we pass whatever parameters the indicated method needs.

[comment]: # (mx-context-auto)

### Multi-ESDT transfer

In case we need to call an endpoint that accepts multiple tokens (let's say for example 2 fungible tokens and an NFT). Let's take a look at the following example:

```

[comment]: # (mx-context-auto)

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
    user_address="$(mxpy wallet pem-address $WALLET_PEM)"
    method_name=str:myMultiESDTPayableEndpoint
    destination_address=$1
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

    mxpy --verbose contract call $user_address --recall-nonce \
        --pem=${WALLET_PEM} \
        --gas-limit=100000000 \
        --proxy=${PROXY} --chain=${CHAIN_ID} \
        --function="MultiESDTNFTTransfer" \
        --arguments $destination_address
                    $number_of_tokens
                    $first_token
                    $first_token_nonce
                    $first_token_amount
                    $second_token
                    $second_token_nonce
                    $second_token_amount
                    $third_token
                    $third_token_nonce
                    $third_token_amount
                    $method_name
                    ${FIRST_BIGUINT_ARGUMENT}
                    ${SECOND_BIGUINT_ARGUMENT} \
        --send || return
}
```

In this example, we call `myMultiESDTPayableEndpoint` endpoint, by transferring 3 different tokens (the first two are fungible tokens and the last one is an NFT). The endpoint takes 2 BigUInt arguments. The layout of the snippet is almost the same as with **ESDTNFTTransfer** (including the fact that the sender is the same as the receiver) but has different arguments. We now pass the destination address first and the number of ESDT/NFT tokens that we want to sent. Then, for each sent token, we specify the identifier, the nonce (in our example 0 for the fungible tokens and a specific value for the NFT) and the amount. In the end, like with the **ESDTTransfer**, we pass the name of the method we want to call and the rest of the parameters of that specific method.

:::tip
More information about ESDT Transfers [here](/developers/esdt-tokens/#transfers).
:::

[comment]: # (mx-context-auto)

## View interaction

In case we want to call a view function, we can use the **query** keyword.

```

[comment]: # (mx-context-auto)

###PARAMS
#1 - First argument
#2 - Second argument
myView() {
    mxpy --verbose contract query ${CONTRACT_ADDRESS} \
        --proxy=${PROXY} \
        --function="myView"
        --arguments $1 $2
}
```

When calling a view function, mxpy will output the standard information in the terminal, along with the results, formatted based on the requested data type. The arguments are specified in the same way as with endpoints.
