---
id: sc-calls-format
title: Smart Contract Calls Data Format
---
[comment]: # (mx-abstract)

This page provides an in-depth examination of the Smart Contract Calls Data Format.

[comment]: # (mx-context-auto)

## Introduction

Besides regular move-balance transactions (address A sends the amount X to address B, while optionally including a note in the `data` field),
MultiversX transactions can trigger a Smart Contract call, or a [built-in function call](/developers/built-in-functions).

This can happen in the following situations:

- the receiver of the transaction is a Smart Contract Address and the data field begins with a valid function of the contract.
- the data field of the transaction begins with a valid built-in function name.

Calls to Smart Contracts functions (or built-in functions) on MultiversX have the following format:

```rust
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

_Example_. We have a smart contract A with the address `erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd`. The contract
has a function `add(numberToAdd numeric)` which adds the `numberToAdd` to an internally managed sum. If we want to call the
function and add `15` to the internal sum, the transaction would look like:

```rust
ExampleScCallTransaction {
    Sender: <account address of the sender>
    Receiver: erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd
    Value: 0 # no value needed for this call
    GasLimit: 1_000_000 # let's suppose we need this much gas for calling the function
    Data: "add@0f" # call the function add with the argument 15, hex-encoded
}
```

[comment]: # (mx-context-auto)

### Constraints

Focusing only on the data field of a Smart Contract call / Built-In Function Call, there are some limitation for the function name and the arguments:

- `function name` has to be the plain text name of the function to be called.
- `arguments` must be hexadecimal encoded with an **even number of characters** (eq: `7` - invalid, `07` - valid; `f6f` - invalid, `6f6b` - valid).
- the `function name` and the `arguments` must be separated by the `@` character.

The next section of this page will focus on how different data types have to be encoded in order to be compliant with the desired format.

[comment]: # (mx-context-auto)

## How to convert arguments for Smart Contract calls

There are multiple ways of converting arguments from their original format to the hexadecimal encoding.

For manually created transactions, arguments can be encoded by using tools that can be found online. For example, `hex to string`, `hex to decimal` and so on.

For programmatically created transactions, arguments can be encoded by using one of our SDKs (`sdk-js`, `mxpy`, `sdk-go`, `sdk-java`, and so on) or by using built-in components or other libraries
of the language the transaction is created in.

There are multiple ways of formatting the data field:

- manually convert each argument, and then join the function name, alongside the argument via the `@` character.
- use a pre-defined arguments serializer, such as [the one found in sdk-js](https://github.com/multiversx/mx-sdk-js-core/blob/main/src/smartcontracts/argSerializer.ts).
- use sdk-js's [contract calls](/sdk-and-tools/sdk-js/sdk-js-cookbook/#smart-contracts).
- use sdk-cpp's [contract calls](https://github.com/multiversx/mx-sdk-cpp/blob/main/src/smartcontracts/contract_call.cpp).
- and so on

[comment]: # (mx-context-auto)

## Converting bech32 addresses (erd1)

MultiversX uses `bech32` addresses with the HRP `erd`. Therefore, an address would look like:

`erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`

:::caution
Converting a bech32 address into hexadecimal encoding _is not_ a simple `string to hex` operation, but requires specialized
tools or helpers.
:::

There are many smart contract calls (or built-in function calls) that receive an address as one of their arguments. Obviously,
they have to be hexadecimal encoded.

[comment]: # (mx-context-auto)

### Examples

bech32 --> hex

```
erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th
-->
0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1

erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r
-->
c70cf50b238372fffaf7b7c5723b06b57859d424a2da621bcc1b2f317543aa36
```

[comment]: # (mx-context-auto)

### Converting addresses using online tools

There are multiple tools that one can use in order to convert an address into hexadecimal encoding:

- [https://utils.multiversx.com/converters#addresses-bech32-to-hexadecimal](https://utils.multiversx.com/converters#addresses-bech32-to-hexadecimal)

- [https://slowli.github.io/bech32-buffer](https://slowli.github.io/bech32-buffer) (go to `Data`, select `erd` as Tag and `Bech32` as Encoding)

- [http://207.244.241.38/elrond-converters/#bech32-to-hex](http://207.244.241.38/elrond-converters/#bech32-to-hex)

[comment]: # (mx-context-auto)

### Converting addresses using mxpy

Make sure you have `mxpy` [installed](/sdk-and-tools/mxpy/installing-mxpy).

```bash
mxpy wallet bech32 --decode erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th
```

will output `0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1`.

Additionally, hex addresses can be converted to bech32 as follows:

```bash
mxpy wallet bech32 --encode 0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1
```

will output `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`.

The encoding algorithm that handles these conversions can be found [here](https://github.com/multiversx/mx-sdk-py-core/blob/main/multiversx_sdk_core/bech32.py).

[comment]: # (mx-context-auto)

### Converting addresses using sdk-js

Find more about `sdk-js` [here](/sdk-and-tools/sdk-js/).

```js
import { Address } from "@multiversx/sdk-core";
...

const address = Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
console.log(address.hex());
```

will output `0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1`.

Additionally, hex addresses can be converted to bech32 as follows:

```js
import { Address } from "@multiversx/sdk-core";
...

const address = Address.fromHex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1");
console.log(address.bech32());
```

will output `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`.

The encoding algorithm that handles these conversions can be found [here](https://github.com/multiversx/mx-sdk-js-core/blob/main/src/address.ts).

[comment]: # (mx-context-auto)

### Converting addresses using sdk-go

Find more about `sdk-go` [here](/sdk-and-tools/sdk-go/).

```js
import (
    ...
    "github.com/multiversx/mx-sdk-go/data"
    ...
)

addressObj, err := data.NewAddressFromBech32String("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
if err != nil {
    return err
}

fmt.Println(hex.EncodeToString(addressObj.AddressBytes()))
```

will output `0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1`.

Additionally, hex addresses can be converted to bech32 as follows:

```js
import (
    ...
    "ggithub.com/multiversx/mx-sdk-go/data"
    ...
)

addressBytes, err := hex.DecodeString("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
if err != nil {
    return err
}
addressObj := data.NewAddressFromBytes(addressBytes)

fmt.Println(addressObj.AddressAsBech32String())
```

will output `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`.

The encoding algorithm that handles these conversions can be found [here](https://github.com/multiversx/mx-chain-core-go/blob/main/core/pubkeyConverter/bech32PubkeyConverter.go).

[comment]: # (mx-context-auto)

### Converting addresses using sdk-java

Find more about `sdk-java` [here](/sdk-and-tools/mxjava).

```java
System.out.println(Address.fromBech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th").hex());
```

will output `0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1`.

Additionally, hex addresses can be converted to bech32 as follows:

```java
System.out.println(Address.fromHex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1").bech32());
```

will output `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`.

The encoding algorithm that handles these conversions can be found [here](https://github.com/multiversx/mx-sdk-java/blob/main/src/main/java/multiversx/Address.java).

[comment]: # (mx-context-auto)

## Converting string values

For situations when a string argument is desired for a smart contract call, it can be simply obtained by using
built-in libraries to convert them into hexadecimal format.

:::important
Make sure that the result has an even number of characters.
:::

Below you can find some examples:

:::note
By no means, these code snippets provide a coding guideline; they are more of simple examples on how to perform the necessary actions.
:::

[comment]: # (mx-context-auto)

### Examples

string --> hex

```
ok          --> 6f6b
MEX-455c57  --> 4d45582d343535633537
```

[comment]: # (mx-context-auto)

### Converting string values in javascript

```js
console.log(Buffer.from("ok").toString("hex")); // 6f6b
```

for converting hex-encoded string to regular string:

```js
console.log(Buffer.from("6f6b", "hex").toString()); // ok
```

[comment]: # (mx-context-auto)

### Converting string values in java

```java
String inputHex = Hex.encodeHexString("ok".getBytes(StandardCharsets.UTF_8));
if (inputHex.length() % 2 != 0) {
   inputHex = "0" + inputex;
}

System.out.println(inputHex);  // 6f6b
```

for converting hex-encoded string to regular string:

```java
byte[] bytes = Hex.decodeHex("6f6b".toCharArray());

String result = new String(bytes, StandardCharsets.UTF_8); // ok
```

[comment]: # (mx-context-auto)

### Converting string values in go

```go
fmt.Println(hex.EncodeToString([]byte("ok"))) // 6f6b
```

for converting hex-encoded string to regular string:

```go
decodedInput, err := hex.DecodeString("6f6b")
if err != nil {
    return err
}

fmt.Println(string(decodedInput)) // ok
```

[comment]: # (mx-context-auto)

## Converting numeric values

For situations when a numeric argument is desired for a smart contract call, it can be simply obtained by using
built-in libraries to convert them into hexadecimal format.

:::important
Make sure that the result has an even number of characters.
:::

Below you can find some examples. They use big integer / number libraries to ensure the code works for large values as well:

:::note
By no means, these code snippets provide a coding guideline; they are more of simple examples on how to perform the necessary actions.
:::

[comment]: # (mx-context-auto)

### Examples

numeric --> hex

```
7  --> 07
10 --> 0a
35 --> 23
```

[comment]: # (mx-context-auto)

### Converting numeric values in javascript

```js
const intValue = 37;
const bn = new BigNumber(intValue, 10);
let bnStr = bn.toString(16);
if (bnStr.length % 2 != 0) {
  bnStr = "0" + bnStr;
}
console.log(bnStr); // 25
```

for converting hex-encoded string to regular number:

```js
const hexValue = "25";
let bn = new BigNumber(hexValue, 16);
console.log(bn.toString()); // 37
```

Also, `sdk-js` includes some [utility functions](https://github.com/multiversx/mx-sdk-js-core/blob/main/src/utils.codec.ts) for padding the results.

[comment]: # (mx-context-auto)

### Converting numeric values in go

```go
inputNum := int64(37)

bi := big.NewInt(inputNum)
fmt.Println(hex.EncodeToString(bi.Bytes())) // 25
```

for converting hex-encoded number to regular number:

```go
hexString := "25"

decodedHex, err := hex.DecodeString(hexString)
if err != nil {
    return err
}
bi := big.NewInt(0).SetBytes(decodedHex)
fmt.Println(bi.String()) // 37
```
