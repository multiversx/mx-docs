---
id: values-simple
title: Mandos Simple Values
---

We went through the structure of a Mandos test, and you might have noticed that in a lot of places values are expressed in diverse ways.

The VM imposes very few restrictions on its inputs and outputs, most fields are processed as raw bytes. The most straightforward way to write a test that one could think of would be to have the actual raw bytes always expressed in a simple format (e.g. like hexadecimal encoding). Indeed, our first contract tests were like this, but we soon discovered that it took painfully long prepare them and even longer to refactor. So, we gradually came up with increasingly complex formats to represent values in an intuitive human-readable way.

We chose to create a single universal format to be used everywhere in a Mandos file. The same format is used for expressing:

- addresses,
- balances,
- transaction and block nonces,
- contract code,
- storage keys and values,
- log identifiers, topics and data,
- gas limits, gas costs,
- ESDT metadata, etc.

The advantage of this unique value format is that it is enough to understand it once to then use it everywhere.

The Mandos value format is closely related to the [MultiversX serialization format](/developers/developer-reference/serialization-format). This is not by accident, Mandos is designed to make it easy to interact MultiversX contracts and their data.

Exceptions: `txId`, `comment` and `asyncCallData` are simple strings. `asyncCallData` might be changed to the default value format in the future and/or reworked.

:::important

It must be emphasized that no matter how values are expressed in Mandos, the communication with the VM is always done via raw bytes. Of course it is best when the Mandos value expression and the types in the smart contract match, but this is not enforced.

:::

A note on error messages: whenever we write a test that fails, Mandos tries its best to transform the actual value it found from raw bytes to a more human-readable form. It doesn't really know what format to use, to it tries its best to find something plausible. However, all it has are some heuristics, so it doesn't always get it right. It also displays the raw bytes so that the developer can investigate the proper value.

## **A note about the value parser and the use of prefixes**

The Mandos value interpreter is not very complex and uses simple prefixes for most functions. Examples of prefixes are `"str:"` and `"u32:"`.

The `|` (pipe) operator, which we use for concatenation has the highest priority. More about it [here](/developers/mandos-reference/values-complex#concatenation).

The arguments of functions start after the prefix (no whitespace) and end either at the first pipe (`|`) or at the end of the string.

Multiple prefixes evaluated right to left, for instance `"keccak256:keccak256:str:abcd"` will first convert `"abcd"` to bytes, then apply the hashing function on it twice.

With that being said, the following sections will describe how to express different value types with Mandos. A full list of the prefixes is [at the end of this page](#the-full-list-of-mandos-value-prefixes).

## **Empty value**

Empty strings (`""`) mean empty byte arrays. The number zero can also be represented as an empty byte array.
Other values that translate to an empty byte array are `"0"` and `"0x"`.

## **Hexadecimal representation**

To provide raw hexadecimal representations of the values, use the prefix `0x` and follow it with the base-16 bytes. E.g. `"0x1234567890"`.
After the `0x` prefix an even number of digits is expected, since 2 digits = 1 byte.

::: note Examples

- `"0x"`
- `"0x1234567890abcdef"`
- `"0x0000000000000000"`
  :::

## **Standalone number representations**

Unprefixed numbers are interpreted as base 10, unsigned.
Unsigned numbers will be represented in the minimum amount of bytes in which they can fit.

:::note Examples

- `"0"`
- `"1"`
- `"1000000".`
- `"255"` is the same as `"0xff"`
- `"256"` is the same as `"0x0100"`
- `"0"` is the same as `""`
  :::

:::tip
Digit separators are allowed anywhere, for readability, e.g. `"1,000,000"`.
:::

## **Standalone signed numbers**

:::caution
Only use signed numbers if you absolutely need to. Big signed integer representation has some pitfalls that can lead to subtle and unexpected issues when interacting with the contract.
:::

Sometimes contract arguments are expected to be signed. These arguments will be transmitted as two’s complement representation. Prefixing any number (base 10 or hex) with a minus sign will convert them to two’s complement. Two’s complement is interpreted as positive or negative based on the first bit.

Sometimes positive numbers can start with a "1" bit and get accidentally interpreted as negative. To prevent this, we can prefix them with a plus. A few examples should make this clearer:

:::note Examples

- `"1" `is represented as `"0x01"`, signed interpretation: `1`, everything OK.
- `"255"` is represented as `"0xff"`, signed interpretation: `"-1",` this might not be what we expected.
- `"+255"` is represented as `"0x00ff"`, signed interpretation: `"255".` The prepended zero byte makes sure the contract interprets it as positive. The `+` makes sure those leading zeroes are added if necessary.
- `"+1"` is still represented as `"0x01"`, here the leading 0 is not necessary. Still, it is good practice adding the `+` if we know the argument is expected to be signed.
- `"-1"` is represented as `"0xff"`. Negative numbers are also represented in the minimum number of bytes possible.
  :::

For more about signed number encoding, see [the big number serialization format](/developers/developer-reference/serialization-format/#arbitrary-width-big-numbers).

## **Nested numbers**

Whenever we nest numbers in larger structures, we need to somehow encode their length. Otherwise, it would become impossible for them to be deserialized.

Mandos helps developers to also easily represent nested numbers. These are as follows:

- `biguint:` is useful for representing a nested BigUint. It outputs the length of the byte representation, followed by the big endian byte representation itself.
- `u64:` `u32:` `u16:` `u8:` interpret the argument as an unsigned int and convert to big endian bytes of respective length (8/4/2/1 bytes)
- `i64:` `i32:` `i16:` `i8:` interpret the argument as a signed int and convert to 2's complement big endian bytes of respective length (8/4/2/1 bytes)

:::note Examples

- `"biguint:0"` equals `0x00000000`
- `"biguint:1"` equals `0x0000000101`
- `"biguint:256"` equals `0x00000020100`
- `u64:1` equals `0x0000000000000001`
- `i64:-1` equals `0xFFFFFFFFFFFFFFFF`
- `u32:1` equals `0x00000001`
- `u16:1` equals `0x0001`
- `u8:1` equals `0x01`
  :::

## **Nested items**

The `nested:` prefix prepends the length of the argument. It is similar to `biguint:`, but does not expect a number.

:::note Examples

- `"nested:str:abc"` equals `0x00000003|str:abc`
- `"nested:0x01020304"` equals `0x0000000401020304`
  :::

## **Booleans**

Mandos offers these 2 constants, for convenience:

- `"true"` = `"1"` = `"0x01"`
- `"false"` = `"0"` = `""`.

:::caution
This is the standalone representation. If your boolean is embedded in a structure or list, use `u8:0` instead of `false`.
:::

## **ASCII strings**

The preferred way of representing ASCII strings is with the `str:` prefix.

:::important
The `''` and ` `` ` prefixes are common in older examples. They are equivalent to `str:`, but considered legacy. We recommend avoiding them because they clash with the syntax of languages where we might want to embed Mandos code (Go and Markdown in particular).
:::

## **User Addresses**

`address:` constructs a dummy user address from a word.

Addresses need to be 32 bytes long, so

- if the word is longer, it gets chopped off at the end
- if the word is shorter, it gets extended to the right with `0x5f` bytes (the `"_"` character).

::: note Example
`"address:my_address"` is the same as:

- `"str:my_address______________________"` or
- `"0x6d795f616464726573735f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f5f"`.
  :::

## **Smart Contract Addresses**

`sc:` constructs a dummy smart contract address.

On MultiversX, smart contract addresses have a different format than user address - they start with 8 bytes of zero.

:::important
Mandos requires that all accounts with addresses in SC format must have non-empty code.

Mandos forbids accounts with addresses that don't have the SC format to have code.
:::

::: note Example
`"sc:my_address"` is the same as:

- `"0x0000000000000000|str:my_address______________"` or
- `"0x00000000000000006d795f616464726573735f5f5f5f5f5f5f5f5f5f5f5f5f5f"`.
  :::

Sometimes the last byte of a a SC address is relevant, since it affects which shard the contract will end up in. It can be specified with a hash characher `#`, followed by the final byte as hex.

::: note Example
`"sc:my_address#a3"` is the same as:

- `"0x0000000000000000|str:my_address_____________|0xa3"` and
- `"0x00000000000000006d795f616464726573735f5f5f5f5f5f5f5f5f5f5f5f5fa3"`.
  :::

## **File contents**

`file:` loads an entire file and uses the contents of the entire file as value.

The path of the file is given relative to the current mandos file.

Used in the first place for specifying smart contract code. It can, however, be used for specifying any value, anywhere.

::: note Example
`"file:../output/my-contract.wasm"`
:::

Example usage:

- initializing contract code,
- contract code to deploy,
- contract code to be passed to another contract as argument for indirect deploy,
- checking some contract code in storage,
- any large argument

## **Hash function**

`keccak256:` computes the Keccak256 hash of the argument. The result is always 32 bytes in length.

## **The full list of Mandos value prefixes**

The prefixes are:

- `str:` converts from ASCII strings to bytes.
- `address:` dummy user address
- `sc:` dummy smart contract address
- `file:` loads the entire contents of a file
- `keccak256:` computes the hash of the argument
- `u64:` `u32:` `u16:` `u8:` interpret the argument as an unsigned int and convert to big endian bytes of respective length (8/4/2/1 bytes)
- `i64:` `i32:` `i16:` `i8:` interpret the argument as a signed int and convert to 2's complement big endian bytes of respective length (8/4/2/1 bytes)
- `biguint:` big number unsigned byte length followed by big number unsigned bytes themselves
- `nested:` prepends the length of the argument
