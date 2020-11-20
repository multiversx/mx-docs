---
id: elrond-serialization-format
title: The Elrond Serialization Format
---

How Elrond smart contracts serialize arguments, results and storage

As maybe hinted in the Mandos tests reference, there is a specific serialization format for all values with which a smart contract interacts. This is central to any project, since all values entering and exiting a contract are represented as byte arrays that should interpreted according to this format.

In Rust, **elrond-codec** crate ([crate](https://crates.io/crates/elrond-codec), [repo](https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/elrond-codec), [doc](https://docs.rs/elrond-codec/0.1.3/elrond_codec/)) exclusively deals with this format. Both Go and Rust implementations of Mandos have a component the serializes to this format. DApp developers need to be aware of this format when interacting with the smart contract in the backend.

# **Rationale**

 We want the format to be somewhat readable and to interact with the rest of the blockchain ecosystem as easily as possible. This is why we have chosen **big endian representation for all numeric types.**

More importantly, the format needs to be as compact as possible, since each additional byte costs additional fees.

# **The concept of top-level vs. nested objects**

There is a perk that is central to the formatter: we know the size of the byte arays entering the contract. All arguments have a known size in bytes, and we normally learn the length of storage values before loading the value itself into the contract. This gives us some additional data straight away that allows us to encode less.

Imagine that we have an argument of type int32. During a smart contract call we want to transmit the value "5" to it. A standard deserializer might expect us to send the full 4 bytes `0x00000005`, but there is clearly no need for the leading zeroes. It's a single argument and we know where to stop, there is no risk of reading too much. So sending `0x05` is enough. We saved 3 bytes. Here we say that the integer is represented in its **top-level form**, it exists on its own and can be represented more compatcly.

But now imagine that an argument that deserializes as a vector of int32. The numbers are serialized one after the other. We no longer have the possibility of having variable length integers because we won't know where one number begins and one ends. Should we interpret `0x0101` as`[1, 1]` or `[257]`? So the solution is to always represent each integer in its full 4-byte form.  `[1, 1]` is thus represented as `0x0000000100000001` and`[257]`as `0x00000101`, there is no more ambiguity. The integers here are in said to be in their **nested form**. This means that because they are part of a larger structure, the length of their representation must be apparent from the encoding.

But what about the vector itself? Its representation must always be a multiple of 4 bytes in length, so from the representation we can always deduce the length of the vector by dividing the number of bytes by 4. If the encoded byte length is not divisible by 4, this is a deserialization error. Because the vector is top-level we don't have to worry about encoding its length, but if the vector itself gets embedded into an even larger structure, this can be a problem. If, for instance, the argument is a vector of vectors of int32, each nested vector also needs to have its length encoded before its data.

# **A note about the value zero**

We are used to writing the number zero as "0" or "0x00", but if we think about it we don't need 1 byte for representing it, 0 bytes or an "empty byte array" represent the number 0 just as well. In fact, just like in `0x0005`, the leading 0 byte is superfluous, so is the byte `0x00` just like an unnecessary leading 0.

With this being said, the format always encodes zeroes of any type as empty byte arrays.

# **The format itself**

| Type description                | Rust type                      | Top-level encoding                                           | Nested encoding                                              |
| ------------------------------- | ------------------------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Unsigned int 8/16/32/64         | u8/u16/u32/u64                 | Minimal number of bytes that can fit the numbere.g.0u8 -> 0x5u32 -> 0x05255u32 -> 0xFF257u32 -> 0x0101 | Exact width representation(8/16/32/64) e.g.0u8 -> 0x005u32 -> 0x00000005257u32 -> 0x00000101 |
| Unsigned platform-dependent int | usize                          | Always same as u32.*This type is 32 bits long on 32 bit architectures and 64 bits on 64. We always serialize as u32 regardless.* | Always same as u32                                           |
| Unsigned big int                | BigUint                        | Minimal number of bytes that can fit the number, same rules as for the small ints | Just like a Vec<u8>: length of the top-level encoding (as 4-byte unsigned int), followed by the top-level encoding |
| Signed int 8/16/32/64           | i8/i16/i32/i64                 | Minimal number of bytes that can fit the 2's complement unambiguously. The leading byte (leftmost) must always match the sign (1=negative, 0=positive).e.g.0i8 -> 0x5i32 -> 0x05-1i32 -> 0xFF255i32 -> 0x00FF (leading 0 required for sign, disambiguates from -1)257i32 -> 0x0101 | Exact width 2's complement (8/16/32/64) e.g.0i8 -> 0x005i32 -> 0x00000005-1i32 -> 0xFFFFFFFF255i32 -> 0x000000FF257i32 -> 0x00000101 |
| Unsigned platform-dependent int | isize                          | Always same as i32.                                          | Always same as i32.                                          |
| Signed big int                  | BigInt                         | Minimal number of bytes that can fit the 2's complement unambiguously, same rules as for the small ints. | Just like a Vec<u8>: length of the top-level encoding (as 4-byte unsigned int), followed by the top-level encoding. |
| Boolean                         | bool                           | True -> 0x01False -> 0x*(equivalent to number that can only take values 0 or 1)* | True -> 0x01False -> 0x00*(equivalent to number that can only take values 0 or 1)* |
| Vectors                         | Vec<T>                         | Concatenated nested encodings of items.                      | Length of the vector (as 4-byte unsigned int) followed by concatenated nested encodings of items. |
| Boxed values                    | Box<T>                         | Top-level encoding of item.                                  | Nested encoding of item.                                     |
| Option                          | Option<T>                      | if Some -> 0x01 followed by nested encoding of valueif None -> 0x (nothing) | if Some -> 0x01 followed by nested encoding of valueif None -> 0x00 |
| Tuples                          | (T1, T2, ...)                  | Concatenated nested encodings of items.                      | Concatenated nested encodings of items.No need for length, since it is fixed. |
| Arrays                          | [T; N]                         | Concatenated nested encodings of items.                      | Concatenated nested encodings of items.No need for length, since it is fixed. |
| ASCII strings                   | Vec<u8>                        | See vectors.                                                 | See vectors.                                                 |
| UTF-8 strings                   | String                         | Not yet supported, but will be serialized as bytes.Arguably, smart contracts don't really need UTF-8 support, that is the frontend's job. |                                                              |
| Custom structures/ enums        | struct S { ... }enum E { ... } | According to the implementations of traits TopEncode/TopDecode | According to the implementations of traits NestedEncode/NestedDecode |