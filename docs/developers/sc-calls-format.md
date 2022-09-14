---
id: sc-calls-format
title: Smart Contract Calls Data Format
---

## Introduction

Besides regular move-balance transactions (address A sends the amount X to address B, while optionally including a note in the `data` field), 
Elrond transactions can trigger a Smart Contract call, or a [built-in function call](/developers/built-in-functions). 

This can happen in the following situations:
- the receiver of the transaction is a Smart Contract Address and the data field begins with a valid function of the contract.
- the data field of the transaction begins with a valid built-in function name.

Calls to Smart Contracts functions (or built-in functions) on Elrond have the following format:

```
ScCallTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the receiver> # can be a SC, or other address in case of built in functions
    Value: X # to be determined for each case
    GasLimit: Y # to be determined for each case
    Data: "functionName" +
          "@" + <optional first argument in hexadecimal encoding> +
          "@" + <optional second argument in hexadecimal encoding> +
          ...
}
```

The number of arguments is specific to each function. 

*Example*. We have a smart contract A with the address `erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd`. The contract
has a function `add(numberToAdd numeric)` which adds the `numberToAdd` to an internally managed sum. If we want to call the 
function and add `15` to the internal sum, the transaction would look like:

```
ExampleScCallTransaction {
    Sender: <account address of the sender>
    Receiver: erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd
    Value: 0 # no value needed for this call
    GasLimit: 1_000_000 # let's suppose we need this much gas for calling the function
    Data: "add@0f" # call the function add with the argument 15, hex-encoded
}
```

### Constraints

Focusing only on the data field of a Smart Contract call / Built-In Function Call, there are some limitation for the function name and the arguments:

- `function name` has to be the plain text name of the function to be called.
- `arguments` must be hexadecimal encoded with an **even number of characters** (eq: `7` - invalid, `07` - valid; `f6f` - invalid, `6f6b` - valid).
- the `function name` and the `arguments` must be separated by the `@` character.

The next section of this page will focus on how different data types have to be encoded in order to be compliant with the desired format.

## How to convert arguments for Smart Contract calls

There are multiple ways of converting arguments from their original format to the hexadecimal encoding. 

For manually created transactions, arguments can be encoded by using tools that can be found online. For example, `hex to string`, `hex to decimal` and so on.

For programmatically created transactions, arguments can be encoded by using one of our SDKs (`erdpy`, `erdjs`, `erdjava`, and so on) or by using built-in components or other libraries
of the language the transaction is created in. 

## Converting a bech32 address (erd1)

Elrond uses `bech32` addresses with the HRP `erd`. Therefore, an address would look like:

`erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`

There are many smart contract calls (or built-in function calls) that receive an address as one of their arguments. Obviously, 
they have to be hexadecimal encoded. 
