---
id: elrond-serialization-format
title: The Elrond Serialization Format
---


*How Elrond smart contracts serialize arguments, results, and storage*

In Elrond, there is a specific serialization format for all data that interacts with a smart contract. The serialization format is central to any project because all values entering and exiting a contract are represented as byte arrays that need to be interpreted according to a consistent specification.

In Rust, the **elrond-codec** crate ([crate](https://crates.io/crates/elrond-codec), [repo](https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/elrond-codec), [doc](https://docs.rs/elrond-codec/0.8.5/elrond_codec/)) exclusively deals with this format. Both Go and Rust implementations of Mandos have a component that serializes to this format. DApp developers need to be aware of this format when interacting with the smart contract on the backend.



## Rationale

We want the format to be somewhat readable and to interact with the rest of the blockchain ecosystem as easily as possible. This is why we have chosen **big endian representation for all numeric types.**

More importantly, the format needs to be as compact as possible, since each additional byte costs additional fees.



## The concept of top-level vs. nested objects

There is a perk that is central to the formatter: we know the size of the byte arrays entering the contract. All arguments have a known size in bytes, and we normally learn the length of storage values before loading the value itself into the contract. This gives us some additional data straight away that allows us to encode less.

Imagine that we have an argument of type int32. During a smart contract call we want to transmit the value "5" to it. A standard deserializer might expect us to send the full 4 bytes `0x00000005`, but there is clearly no need for the leading zeroes. It's a single argument, and we know where to stop, there is no risk of reading too much. So sending `0x05` is enough. We saved 3 bytes. Here we say that the integer is represented in its **top-level form**, it exists on its own and can be represented more compactly.

But now imagine that an argument that deserializes as a vector of int32. The numbers are serialized one after the other. We no longer have the possibility of having variable length integers because we won't know where one number begins and one ends. Should we interpret `0x0101` as`[1, 1]` or `[257]`? So the solution is to always represent each integer in its full 4-byte form. `[1, 1]` is thus represented as `0x0000000100000001` and`[257]`as `0x00000101`, there is no more ambiguity. The integers here are said to be in their **nested form**. This means that because they are part of a larger structure, the length of their representation must be apparent from the encoding.

But what about the vector itself? Its representation must always be a multiple of 4 bytes in length, so from the representation we can always deduce the length of the vector by dividing the number of bytes by 4. If the encoded byte length is not divisible by 4, this is a deserialization error. Because the vector is top-level we don't have to worry about encoding its length, but if the vector itself gets embedded into an even larger structure, this can be a problem. If, for instance, the argument is a vector of vectors of int32, each nested vector also needs to have its length encoded before its data.



## A note about the value zero

We are used to writing the number zero as "0" or "0x00", but if we think about it, we don't need 1 byte for representing it, 0 bytes or an "empty byte array" represent the number 0 just as well. In fact, just like in `0x0005`, the leading 0 byte is superfluous, so is the byte `0x00` just like an unnecessary leading 0.

With this being said, the format always encodes zeroes of any type as empty byte arrays.




## How each type gets serialized


### Fixed-width numbers

Small numbers can be stored in variables of up to 64 bits.

**Rust types**: `u8`, `u16`, `u32`, `usize`, `u64`, `i8`, `i16`, `i32`, `isize`, `i64`.

**Top-encoding**: The same as for all numerical types, the minimum number of bytes that
can fit their 2's complement, big endian representation.

**Nested encoding**: Fixed width big endian encoding of the type, using 2's complement.

:::important
A note about the types `usize` and `isize`: these Rust-specific types have the width of the underlying architecture,
i.e. 32 on 32-bit systems and 64 on 64-bit systems. However, smart contracts always run on a wasm32 architecture, so
these types will always be identical to `u32` and `i32` respectively.
Even when simulating smart contract execution on 64-bit systems, they must still be serialized on 32 bits.
:::

**Examples**

| Type   | Number               | Top-level encoding   | Nested encoding      |
| ----   | -------------------- | -------------------- | -------------------- |
|`u8`    | `0`                  | `0x`                 | `0x00`               |
|`u8`    | `1`                  | `0x01`               | `0x01`               |
|`u8`    | `0x11`               | `0x11`               | `0x11`               |
|`u8`    | `255`                | `0xFF`               | `0xFF`               |
|`u16`   | `0`                  | `0x`                 | `0x0000`             |
|`u16`   | `0x11`               | `0x11`               | `0x0011`             |
|`u16`   | `0x1122`             | `0x1122`             | `0x1122`             |
|`u32`   | `0`                  | `0x`                 | `0x00000000`         |
|`u32`   | `0x11`               | `0x11`               | `0x00000011`         |
|`u32`   | `0x1122`             | `0x1122`             | `0x00001122`         |
|`u32`   | `0x112233`           | `0x112233`           | `0x00112233`         |
|`u32`   | `0x11223344`         | `0x11223344`         | `0x11223344`         |
|`u64`   | `0`                  | `0x`                 | `0x0000000000000000` |
|`u64`   | `0x11`               | `0x11`               | `0x0000000000000011` |
|`u64`   | `0x1122`             | `0x1122`             | `0x0000000000001122` |
|`u64`   | `0x112233`           | `0x112233`           | `0x0000000000112233` |
|`u64`   | `0x11223344`         | `0x11223344`         | `0x0000000011223344` |
|`u64`   | `0x1122334455`       | `0x1122334455`       | `0x0000001122334455` |
|`u64`   | `0x112233445566`     | `0x112233445566`     | `0x0000112233445566` |
|`u64`   | `0x11223344556677`   | `0x11223344556677`   | `0x0011223344556677` |
|`u64`   | `0x1122334455667788` | `0x1122334455667788` | `0x1122334455667788` |
|`usize` | `0`                  | `0x`                 | `0x00000000`         |
|`usize` | `0x11`               | `0x11`               | `0x00000011`         |
|`usize` | `0x1122`             | `0x1122`             | `0x00001122`         |
|`usize` | `0x112233`           | `0x112233`           | `0x00112233`         |
|`usize` | `0x11223344`         | `0x11223344`         | `0x11223344`         |
|`i8`    | `0`                  | `0x`                 | `0x00`               |
|`i8`    | `1`                  | `0x01`               | `0x01`               |
|`i8`    | `-1`                 | `0xFF`               | `0xFF`               |
|`i8`    | `127`                | `0x7F`               | `0x7F`               |
|`i8`    | `-128`               | `0x80`               | `0x80`               |
|`i16`   | `-0x11`              | `0xEF`               | `0xEF`               |
|`i16`   | `-1`                 | `0xFF`               | `0xFFFF`             |
|`i16`   | `-0x11`              | `0xEF`               | `0xFFEF`             |
|`i16`   | `-0x1122`            | `0xEEDE`             | `0xEEDE`             |
|`i32`   | `-1`                 | `0xFF`               | `0xFFFFFFFF`         |
|`i32`   | `-0x11`              | `0xEF`               | `0xFFFFFFEF`         |
|`i32`   | `-0x1122`            | `0xEEDE`             | `0xFFFFEEDE`         |
|`i32`   | `-0x112233`          | `0xEEDDCD`           | `0xFFEEDDCD`         |
|`i32`   | `-0x11223344`        | `0xEEDDCCBC`         | `0xEEDDCCBC`         |
|`i64`   | `-1`                 | `0xFF`               | `0xFFFFFFFFFFFFFFFF` |
|`i64`   | `-0x11`              | `0xEF`               | `0xFFFFFFFFFFFFFFEF` |
|`i64`   | `-0x1122`            | `0xEEDE`             | `0xFFFFFFFFFFFFEEDE` |
|`i64`   | `-0x112233`          | `0xEEDDCD`           | `0xFFFFFFFFFFEEDDCD` |
|`i64`   | `-0x11223344`        | `0xEEDDCCBC`         | `0xFFFFFFFFEEDDCCBC` |
|`i64`   | `-0x1122334455`      | `0xEEDDCCBBAB`       | `0xFFFFFFEEDDCCBBAB` |
|`i64`   | `-0x112233445566`    | `0xEEDDCCBBAA9A`     | `0xFFFFEEDDCCBBAA9A` |
|`i64`   | `-0x11223344556677`  | `0xEEDDCCBBAA9989`   | `0xFFEEDDCCBBAA9989` |
|`i64`   | `-0x1122334455667788`| `0xEEDDCCBBAA998878` | `0xEEDDCCBBAA998878` |
|`isize` | `0`                  | `0x`                 | `0x00000000`         |
|`isize` | `-1`                 | `0xFF`               | `0xFFFFFFFF`         |
|`isize` | `-0x11`              | `0xEF`               | `0xFFFFFFEF`         |
|`isize` | `-0x1122`            | `0xEEDE`             | `0xFFFFEEDE`         |
|`isize` | `-0x112233`          | `0xEEDDCD`           | `0xFFEEDDCD`         |
|`isize` | `-0x11223344`        | `0xEEDDCCBC`         | `0xEEDDCCBC`         |



-------------------------------------------------------------------------------------------------------------------------



### Arbitrary width (big) numbers

For most smart contracts applications, number larger than the maximum uint64 value are needed.
EGLD balances for instance are represented as fixed-point decimal numbers with 18 decimals.
This means that to represent even just 1 EGLD we use the number 10<sup>18</sup>, which already exceeds the capacity of a regular 64-bit integer.

**Rust types**: `BigUint`, `BigInt`,

:::important
These types are managed by Elrond VM, in many cases the contract never sees the data, only a handle.
This is to reduce the burden on the smart contract.
:::

**Top-encoding**: The same as for all numerical types, the minimum number of bytes that
can fit their 2's complement, big endian representation.

**Nested encoding**: Since these types are variable length, we need to encode their length, so that the decodes knows when to stop decoding.
The length of the encoded number always comes first, on 4 bytes (`usize`/`u32`).
Next we encode:
  - For `BigUint` the big endian bytes
  - For `BigInt` the shortest 2's complement number that can unambiguously represent the number. Positive numbers must always have the most significant bit `0`, while the negative ones `1`. See examples below. 


**Examples**

| Type           | Number               | Top-level encoding   | Nested encoding        | Explanation |
| -------------- | -------------------- | -------------------- | ---------------------- | --- |
|`BigUint` | `0`                  | `0x`                 | `0x00000000`           | The length of `0` is considered `0`. |
|`BigUint` | `1`                  | `0x01`               | `0x0000000101`         | `1` can be represented on 1 byte, so the length is 1. |
|`BigUint` | `256`                | `0x0100`             | `0x000000020100`       | `256` is the smallest number that takes 2 bytes. |
|`BigInt`  | `0`                  | `0x`                 | `0x00000000`           | Signed `0` is also represented as zero-length bytes. |
|`BigInt`  | `1`                  | `0x01`               | `0x0000000101`         | Signed `1` is also represented as 1 byte. |
|`BigInt`  | `-1`                 | `0x01FF`             | `0x00000001FF`         | The shortest 2's complement representation of `-1` if `FF`. The most significant bit is 1. |
|`BigUint` | `127`                | `0x7F`               | `0x000000017F`         | |
|`BigInt`  | `127`                | `0x7F`               | `0x000000017F`         | |
|`BigUint` | `128`                | `0x80`               | `0x0000000180`         | |
|`BigInt`  | `128`                | `0x0080`             | `0x000000020080`       | The most significant bit of this number is 1, so to avoid ambiguity an extra `0` byte needs to be prepended. |
|`BigInt`  | `255`                | `0x00FF`             | `0x0000000200FF`       | Same as above. |
|`BigInt`  | `256`                | `0x0100`             | `0x000000020100`       | `256` requires 2 bytes to represent, of which the MSB is 0, no more need to prepend a `0` byte. |



-------------------------------------------------------------------------------------------------------------------------



### Boolean values

Booleans are serialized the same as a byte (`u8`) that can take values `1` or `0`.

**Rust type**: `bool`

**Values**

| Type  | Value               | Top-level encoding   | Nested encoding  |
| ------| ------------------- | -------------------- | ---------------- |
|`bool` | `true`              | `0x01`               | `0x01`           |
|`bool` | `false`             | `0x`                 | `0x00`           |



-------------------------------------------------------------------------------------------------------------------------



### Lists of items

This is an umbrella term for all types of lists or arrays of various item types. They all serialize the same way.

**Rust types**: `&[T]`, `Vec<T>`, `Box<[T]>`, `LinkedList<T>`, `VecMapper<T>`, etc.

**Top-encoding**: All nested encodings of the items, concatenated.

**Nested encoding**: First, the length of the list, encoded on 4 bytes (`usize`/`u32`).
Then, all nested encodings of the items, concatenated.


**Examples**

| Type                 | Value                 | Top-level encoding    | Nested encoding       | Explanation |
| --------------       | --------------------  | --------------------  | --------------------  | --- |
|`Vec<u8>`             | `vec![1, 2]`          | `0x0102`              | `0x00000002 0102`     | Length = `2` |
|`Vec<u16>`            | `vec![1, 2]`          | `0x00010002`          | `0x00000002 00010002` | Length = `2` |
|`Vec<u16>`            | `vec![]`              | `0x`                  | `0x00000000`          | Length = `0` |
|`Vec<u32>`            | `vec![7]`             | `0x00000007`          | `0x00000001 00000007` | Length = `1` |
|`Vec< Vec<u32>>`      | `vec![ vec![7]]`      | `0x00000001 00000007` | `0x00000001 00000001 00000007` | There is 1 element, which is a vector. In both cases the inner Vec needs to be nested-encoded in the larger Vec. |
|`Vec<&[u8]>`          | `vec![ &[7u8][..]]`   | `0x00000001 07`       | `0x00000001 00000001 07` | Same as above, but the inner list is a simple list of bytes. |
|`Vec< BigUint>` | `vec![ 7u32.into()]`  | `0x00000001 07`       | `0x00000001 00000001 07` | `BigUint`s need to encode their length when nested. The `7` is encoded the same way as a list of bytes of length 1, so the same as above. |



-------------------------------------------------------------------------------------------------------------------------



### Arrays and tuples

The only difference between these types and the lists in the previous section is that their length is known at compile time.
Therefore, there is never any need to encode their length.

**Rust types**: `[T; N]`, `Box<[T; N]>`, `(T1, T2, ... , TN)`.

**Top-encoding**: All nested encodings of the items, concatenated.

**Nested encoding**: All nested encodings of the items, concatenated.

**Examples**

| Type                | Value               | Top-level encoding   | Nested encoding      |
| --------------      | ----------------    | -------------------- | -------------------- |
|`[u8; 2]`            | `[1, 2]`            | `0x0102`             | `0x0102`             |
|`[u16; 2]`           | `[1, 2]`            | `0x00010002`         | `0x00010002`         |
|`(u8, u16, u32)`     | `[1u8, 2u16, 3u32]` | `0x01000200000003`   | `0x01000200000003`   |



-------------------------------------------------------------------------------------------------------------------------



### Byte slices and ASCII strings

A special case of the list types, they behave according to the same rules as lists of items.

:::important
Strings are treated from the point of view of serialization as series of bytes. Using Unicode strings, while often a good practice in programming, tends to add unnecessary overhead to smart contracts. The difference is that Unicode strings get validated on input and concatenation.

We consider best practice to use Unicode on the frontend, but keep all messages and error messages in ASCII format on smart contract level.
:::

**Rust types**: `BoxedBytes`, `&[u8]`, `Vec<u8>`, `String`, `&str`.

**Top-encoding**: The byte slice, as-is.

**Nested encoding**: The length of the byte slice on 4 bytes, followed by the byte slice as-is.

**Examples**

| Type                | Value                       | Top-level encoding   | Nested encoding      | Explanation |
| --------------      | --------------------        | -------------------- | -------------------- | --- |
|`&'static [u8]`      | `b"abc"`                    | `0x616263`           | `0x00000003616263`   | ASCII strings are regular byte slices of buffers. |
|`BoxedBytes`         | `BoxedBytes::from( b"abc")` | `0x616263`           | `0x00000003616263`   | BoxedBytes are just optimized owned byte slices that cannot grow. |
|`Vec<u8>`            | `b"abc".to_vec()`           | `0x616263`           | `0x00000003616263`   | Use `Vec` for a buffer that can grow. |
|`&'static str`       | `"abc"`                     | `0x616263`           | `0x00000003616263`   | Unicode string (slice). |
|`String`             | `"abc".to_string()`         | `0x616263`           | `0x00000003616263`   | Unicode string (owned). |



-------------------------------------------------------------------------------------------------------------------------



### Options

An `Option` represents an optional value: every Option is either `Some` and contains a value, or `None`, and does not.

**Rust types**: `Option<T>`.

**Top-encoding**: If `Some`, a `0x01` byte gets encoded, and after it the encoded value. If `None`, nothing gets encoded.

**Nested encoding**: If `Some`, a `0x01` byte gets encoded, and after it the encoded value. If `None`, a `0x00` byte get encoded.

**Examples**

| Type                    | Value                                    | Top-level encoding   | Nested encoding      | Explanation |
| --------------          | --------------------                     | -------------------- | ------------         | --- |
|`Option<u16>`            | `Some(5)`                                | `0x010005`           | `0x010005`           | |
|`Option<u16>`            | `Some(0)`                                | `0x010000`           | `0x010000`           | |
|`Option<u16>`            | `None`                                   | `0x`                 | `0x00`               | Note that `Some` has different encoding than `None` for any type |
|`Option< BigUint>` | `Some( BigUint::from( 0x1234u32))` | `0x01 00000002 1234` | `0x01 00000002 1234` | The `Some` value is nested-encoded. For a `BigUint` this adds the length, which here is `2`. |



-------------------------------------------------------------------------------------------------------------------------



### Custom structures

Any structure defined in a contract of library can become serializable if it is annotated with either or all of: `TopEncode`, `TopDecode`, `NestedEncode`, `NestedDecode`.

**Example implementation:**

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct Struct {
	pub int: u16,
	pub seq: Vec<u8>,
	pub another_byte: u8,
	pub uint_32: u32,
	pub uint_64: u64,
}
```

**Top-encoding**: All fields nested-encoded one after the other.

**Nested encoding**: The same, all fields nested-encoded one after the other.

**Example value**

```rust
Struct {
		int: 0x42,
		seq: vec![0x1, 0x2, 0x3, 0x4, 0x5],
		another_byte: 0x6,
		uint_32: 0x12345,
		uint_64: 0x123456789,
}
```

It will be encoded (both top-encoding and nested encoding) as: `0x004200000005010203040506000123450000000123456789`.

Explanation:
```
[
/* int */ 0, 0x42, 
/* seq length */ 0, 0, 0, 5, 
/* seq contents */ 1, 2, 3, 4, 5,
/* another_byte */ 6,
/* uint_32 */ 0x00, 0x01, 0x23, 0x45,
/* uint_64 */ 0x00, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x89
]
```


-------------------------------------------------------------------------------------------------------------------------



### Custom enums

Any enum defined in a contract of library can become serializable if it is annotated with either or all of: `TopEncode`, `TopDecode`, `NestedEncode`, `NestedDecode`.

**A simple enum example:**

*Example taken from the elrond-codec tests.*

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
enum DayOfWeek {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}
```

**A more complex enum example:**

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
enum EnumWithEverything {
	Default,
	Today(DayOfWeek),
	Write(Vec<u8>, u16),
	Struct {
		int: u16,
		seq: Vec<u8>,
		another_byte: u8,
		uint_32: u32,
		uint_64: u64,
	},
}
```

**Nested encoding**:
First, the discriminant is encoded. The discriminant is the index of the variant, starting with `0`.
Then the fields in that variant (if any) get nested-encoded one after the other.

**Top-encoding**: Same as nested-encoding, but with an additional rule:
if the discriminant is `0` (first variant) and there are no fields, nothing is encoded.

**Example values**

*The examples below are taken from the elrond-codec tests.*

<table>
  <tr>
    <th>Value</th>
    <th>Top-encoding bytes</th>
    <th>Nested encoding bytes</th>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
DayOfWeek::Monday
        </code>
      </pre>
    </td>
    <td>
      <pre>
        <code> 
/* nothing */
        </code>
      </pre>
    </td>
    <td>
      <pre>
        <code> 
/* discriminant */ 0,
        </code>
      </pre>
    </td>
  </tr>
  <tr>

  <tr>
    <td>
      <pre>
        <code> 
DayOfWeek::Tuesday
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 1,
        </code>
      </pre>
    </td>
  </tr>
  <tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Default
        </code>
      </pre>
    </td>
    <td>
      <pre>
        <code> 
/* nothing */
        </code>
      </pre>
    </td>
    <td>
      <pre>
        <code> 
/* discriminant */ 0,
        </code>
      </pre>
    </td>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Today(
  DayOfWeek::Monday
)
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 1,
/* DayOfWeek discriminant */ 0
        </code>
      </pre>
    </td>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Today(
  DayOfWeek::Friday
)
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 1,
/* DayOfWeek discriminant */ 4
        </code>
      </pre>
    </td>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Write(
    Vec::new(),
    0,
)
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 2,
/* vec length */ 0, 0, 0, 0,
/* u16 */ 0, 0,
        </code>
      </pre>
    </td>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Write(
    [1, 2, 3].to_vec(),
    4
)
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 2, 
/* vec length */ 0, 0, 0, 3,
/* vec contents */ 1, 2, 3,
/* an extra 16 */ 0, 4,
        </code>
      </pre>
    </td>
  </tr>
  <tr>
    <td>
      <pre>
        <code> 
EnumWithEverything::Struct {
    int: 0x42,
    seq: vec![0x1, 0x2, 0x3, 0x4, 0x5],
    another_byte: 0x6,
    uint_32: 0x12345,
    uint_64: 0x123456789,
};
        </code>
      </pre>
    </td>
    <td colspan="2">
      <pre>
        <code> 
/* discriminant */ 3,
/* int */ 0, 0x42,
/* seq length */ 0, 0, 0, 5,
/* seq contents */ 1, 2, 3, 4, 5,
/* another_byte */ 6,
/* uint_32 */ 0x00, 0x01, 0x23, 0x45,
/* uint_64 */ 0x00, 0x00, 0x00, 0x01,
              0x23, 0x45, 0x67, 0x89,
        </code>
      </pre>
    </td>
  </tr>
</table>
