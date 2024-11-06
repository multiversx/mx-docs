---
id: serialization-overview
title: The MultiversX Serialization Format
---
[comment]: # (mx-abstract)

In MultiversX, there is a specific serialization format for all data that interacts with a smart contract. The serialization format is central to any project because all values entering and exiting a contract are represented as byte arrays that need to be interpreted according to a consistent specification.

In Rust, the **multiversx-sc-codec** crate ([crate](https://crates.io/crates/multiversx-sc-codec), [docs](https://docs.rs/multiversx-sc-codec/latest/multiversx_sc_codec/)) exclusively deals with this format. Both Go and Rust implementations of scenarios have a component that serializes to this format. DApp developers need to be aware of this format when interacting with the smart contract on the backend.

[comment]: # (mx-context-auto)

## Rationale

We want the format to be somewhat readable and to interact with the rest of the blockchain ecosystem as easily as possible. This is why we have chosen **big endian representation for all numeric types.**

More importantly, the format needs to be as compact as possible, since each additional byte costs additional fees.

[comment]: # (mx-context-auto)

## The concept of top-level vs. nested objects

There is a perk that is central to the formatter: we know the size of the byte arrays entering the contract. All arguments have a known size in bytes, and we normally learn the length of storage values before loading the value itself into the contract. This gives us some additional data straight away that allows us to encode less.

Imagine that we have an argument of type int32. During a smart contract call we want to transmit the value "5" to it. A standard deserializer might expect us to send the full 4 bytes `0x00000005`, but there is clearly no need for the leading zeroes. It's a single argument, and we know where to stop, there is no risk of reading too much. So sending `0x05` is enough. We saved 3 bytes. Here we say that the integer is represented in its **top-level form**, it exists on its own and can be represented more compactly.

But now imagine that an argument that deserializes as a vector of int32. The numbers are serialized one after the other. We no longer have the possibility of having variable length integers because we won't know where one number begins and one ends. Should we interpret `0x0101` as`[1, 1]` or `[257]`? So the solution is to always represent each integer in its full 4-byte form. `[1, 1]` is thus represented as `0x0000000100000001` and`[257]`as `0x00000101`, there is no more ambiguity. The integers here are said to be in their **nested form**. This means that because they are part of a larger structure, the length of their representation must be apparent from the encoding.

But what about the vector itself? Its representation must always be a multiple of 4 bytes in length, so from the representation we can always deduce the length of the vector by dividing the number of bytes by 4. If the encoded byte length is not divisible by 4, this is a deserialization error. Because the vector is top-level we don't have to worry about encoding its length, but if the vector itself gets embedded into an even larger structure, this can be a problem. If, for instance, the argument is a vector of vectors of int32, each nested vector also needs to have its length encoded before its data.

[comment]: # (mx-context-auto)

## A note about the value zero

We are used to writing the number zero as "0" or "0x00", but if we think about it, we don't need 1 byte for representing it, 0 bytes or an "empty byte array" represent the number 0 just as well. In fact, just like in `0x0005`, the leading 0 byte is superfluous, so is the byte `0x00` just like an unnecessary leading 0.

With this being said, the format always encodes zeroes of any type as empty byte arrays.

[comment]: # (mx-context-auto)

## How each type gets serialized

This guide is split into several sections:
- [Simple values, such as numbers, strings, etc.](/developers/data/simple-values)
- [Lists, tuples, Option](/developers/data/composite-values)
- [Custom types defined in the contracts.](/developers/data/custom-types)
- [Var-args and other multi-values](/developers/data/multi-values)
- [The code metadata flag](/developers/data/code-metadata)

There is a special section about [uninitialized data and how defaults relate to serialization](/developers/data/defaults).

