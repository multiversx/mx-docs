---
id: simple-values
title: Simple Values
---
[comment]: # (mx-abstract)

We will start by going through the basic types used in smart contracts:
- Fixed-width numbers
- Arbitrary width (big) numbers
- Boolean values


[comment]: # (mx-context-auto)

### Fixed-width numbers

Small numbers can be stored in variables of up to 64 bits. We use big endian encoding for all numbers in our projects.

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

| Type    | Number                | Top-level encoding   | Nested encoding      |
| ------- | --------------------- | -------------------- | -------------------- |
| `u8`    | `0`                   | `0x`                 | `0x00`               |
| `u8`    | `1`                   | `0x01`               | `0x01`               |
| `u8`    | `0x11`                | `0x11`               | `0x11`               |
| `u8`    | `255`                 | `0xFF`               | `0xFF`               |
| `u16`   | `0`                   | `0x`                 | `0x0000`             |
| `u16`   | `0x11`                | `0x11`               | `0x0011`             |
| `u16`   | `0x1122`              | `0x1122`             | `0x1122`             |
| `u32`   | `0`                   | `0x`                 | `0x00000000`         |
| `u32`   | `0x11`                | `0x11`               | `0x00000011`         |
| `u32`   | `0x1122`              | `0x1122`             | `0x00001122`         |
| `u32`   | `0x112233`            | `0x112233`           | `0x00112233`         |
| `u32`   | `0x11223344`          | `0x11223344`         | `0x11223344`         |
| `u64`   | `0`                   | `0x`                 | `0x0000000000000000` |
| `u64`   | `0x11`                | `0x11`               | `0x0000000000000011` |
| `u64`   | `0x1122`              | `0x1122`             | `0x0000000000001122` |
| `u64`   | `0x112233`            | `0x112233`           | `0x0000000000112233` |
| `u64`   | `0x11223344`          | `0x11223344`         | `0x0000000011223344` |
| `u64`   | `0x1122334455`        | `0x1122334455`       | `0x0000001122334455` |
| `u64`   | `0x112233445566`      | `0x112233445566`     | `0x0000112233445566` |
| `u64`   | `0x11223344556677`    | `0x11223344556677`   | `0x0011223344556677` |
| `u64`   | `0x1122334455667788`  | `0x1122334455667788` | `0x1122334455667788` |
| `usize` | `0`                   | `0x`                 | `0x00000000`         |
| `usize` | `0x11`                | `0x11`               | `0x00000011`         |
| `usize` | `0x1122`              | `0x1122`             | `0x00001122`         |
| `usize` | `0x112233`            | `0x112233`           | `0x00112233`         |
| `usize` | `0x11223344`          | `0x11223344`         | `0x11223344`         |
| `i8`    | `0`                   | `0x`                 | `0x00`               |
| `i8`    | `1`                   | `0x01`               | `0x01`               |
| `i8`    | `-1`                  | `0xFF`               | `0xFF`               |
| `i8`    | `127`                 | `0x7F`               | `0x7F`               |
| `i8`    | `-0x11`               | `0xEF`               | `0xEF`               |
| `i8`    | `-128`                | `0x80`               | `0x80`               |
| `i16`   | `-1`                  | `0xFF`               | `0xFFFF`             |
| `i16`   | `-0x11`               | `0xEF`               | `0xFFEF`             |
| `i16`   | `-0x1122`             | `0xEEDE`             | `0xEEDE`             |
| `i32`   | `-1`                  | `0xFF`               | `0xFFFFFFFF`         |
| `i32`   | `-0x11`               | `0xEF`               | `0xFFFFFFEF`         |
| `i32`   | `-0x1122`             | `0xEEDE`             | `0xFFFFEEDE`         |
| `i32`   | `-0x112233`           | `0xEEDDCD`           | `0xFFEEDDCD`         |
| `i32`   | `-0x11223344`         | `0xEEDDCCBC`         | `0xEEDDCCBC`         |
| `i64`   | `-1`                  | `0xFF`               | `0xFFFFFFFFFFFFFFFF` |
| `i64`   | `-0x11`               | `0xEF`               | `0xFFFFFFFFFFFFFFEF` |
| `i64`   | `-0x1122`             | `0xEEDE`             | `0xFFFFFFFFFFFFEEDE` |
| `i64`   | `-0x112233`           | `0xEEDDCD`           | `0xFFFFFFFFFFEEDDCD` |
| `i64`   | `-0x11223344`         | `0xEEDDCCBC`         | `0xFFFFFFFFEEDDCCBC` |
| `i64`   | `-0x1122334455`       | `0xEEDDCCBBAB`       | `0xFFFFFFEEDDCCBBAB` |
| `i64`   | `-0x112233445566`     | `0xEEDDCCBBAA9A`     | `0xFFFFEEDDCCBBAA9A` |
| `i64`   | `-0x11223344556677`   | `0xEEDDCCBBAA9989`   | `0xFFEEDDCCBBAA9989` |
| `i64`   | `-0x1122334455667788` | `0xEEDDCCBBAA998878` | `0xEEDDCCBBAA998878` |
| `isize` | `0`                   | `0x`                 | `0x00000000`         |
| `isize` | `-1`                  | `0xFF`               | `0xFFFFFFFF`         |
| `isize` | `-0x11`               | `0xEF`               | `0xFFFFFFEF`         |
| `isize` | `-0x1122`             | `0xEEDE`             | `0xFFFFEEDE`         |
| `isize` | `-0x112233`           | `0xEEDDCD`           | `0xFFEEDDCD`         |
| `isize` | `-0x11223344`         | `0xEEDDCCBC`         | `0xEEDDCCBC`         |

---

[comment]: # (mx-context-auto)

### Arbitrary width (big) numbers

For most smart contracts applications, number larger than the maximum uint64 value are needed.
EGLD balances for instance are represented as fixed-point decimal numbers with 18 decimals.
This means that to represent even just 100 EGLD we use the number 100*10<sup>18</sup>, which already exceeds the capacity of a regular 64-bit integer.

**Rust types**: `BigUint`, `BigInt`,

:::important
These types are managed by MultiversX VM, in many cases the contract never sees the data, only a handle.
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

| Type      | Number | Top-level encoding | Nested encoding  | Explanation                                                                                                  |
| --------- | ------ | ------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------ |
| `BigUint` | `0`    | `0x`               | `0x00000000`     | The length of `0` is considered `0`.                                                                         |
| `BigUint` | `1`    | `0x01`             | `0x0000000101`   | `1` can be represented on 1 byte, so the length is 1.                                                        |
| `BigUint` | `256`  | `0x0100`           | `0x000000020100` | `256` is the smallest number that takes 2 bytes.                                                             |
| `BigInt`  | `0`    | `0x`               | `0x00000000`     | Signed `0` is also represented as zero-length bytes.                                                         |
| `BigInt`  | `1`    | `0x01`             | `0x0000000101`   | Signed `1` is also represented as 1 byte.                                                                    |
| `BigInt`  | `-1`   | `0xFF`             | `0x00000001FF`   | The shortest 2's complement representation of `-1` is `FF`. The most significant bit is 1.                   |
| `BigUint` | `127`  | `0x7F`             | `0x000000017F`   |                                                                                                              |
| `BigInt`  | `127`  | `0x7F`             | `0x000000017F`   |                                                                                                              |
| `BigUint` | `128`  | `0x80`             | `0x0000000180`   |                                                                                                              |
| `BigInt`  | `128`  | `0x0080`           | `0x000000020080` | The most significant bit of this number is 1, so to avoid ambiguity an extra `0` byte needs to be prepended. |
| `BigInt`  | `255`  | `0x00FF`           | `0x0000000200FF` | Same as above.                                                                                               |
| `BigInt`  | `256`  | `0x0100`           | `0x000000020100` | `256` requires 2 bytes to represent, of which the MSB is 0, no more need to prepend a `0` byte.              |

---

[comment]: # (mx-context-auto)

### Boolean values

Booleans are serialized the same as a byte (`u8`) that can take values `1` or `0`.

**Rust type**: `bool`

**Values**

| Type   | Value   | Top-level encoding | Nested encoding |
| ------ | ------- | ------------------ | --------------- |
| `bool` | `true`  | `0x01`             | `0x01`          |
| `bool` | `false` | `0x`               | `0x00`          |

---

[comment]: # (mx-context-auto)

### Byte slices and ASCII strings

Byte slices are technically a special case of the [list types](developers/data/composite-values#lists-of-items), but they are usually thought of as basic types. Their encoding is, in any case, consistent with the rules for lists of "byte items".

:::important
Strings are treated from the point of view of serialization as series of bytes. Using Unicode strings, while often a good practice in programming, tends to add unnecessary overhead to smart contracts. The difference is that Unicode strings get validated on input and concatenation.

We consider best practice to use Unicode on the frontend, but keep all messages and error messages in ASCII format on smart contract level.
:::

**Rust types**: `ManagedBuffer`, `BoxedBytes`, `&[u8]`, `Vec<u8>`, `String`, `&str`.

**Top-encoding**: The byte slice, as-is.

**Nested encoding**: The length of the byte slice on 4 bytes, followed by the byte slice as-is.

**Examples**

| Type            | Value                       | Top-level encoding | Nested encoding    | Explanation                                                       |
| --------------- | --------------------------- | ------------------ | ------------------ | ----------------------------------------------------------------- |
| `&'static [u8]` | `b"abc"`                    | `0x616263`         | `0x00000003616263` | ASCII strings are regular byte slices of buffers.                 |
| `ManagedBuffer` | `ManagedBuffer::from("abc")`| `0x616263`         | `0x00000003616263` | Use `Vec` for a buffer that can grow.                             |
| `BoxedBytes`    | `BoxedBytes::from( b"abc")` | `0x616263`         | `0x00000003616263` | BoxedBytes are just optimized owned byte slices that cannot grow. |
| `Vec<u8>`       | `b"abc".to_vec()`           | `0x616263`         | `0x00000003616263` | Use `Vec` for a buffer that can grow.                             |
| `&'static str`  | `"abc"`                     | `0x616263`         | `0x00000003616263` | Unicode string (slice).                                           |
| `String`        | `"abc".to_string()`         | `0x616263`         | `0x00000003616263` | Unicode string (owned).                                           |


:::info Note
Inside contracts, `ManagedBuffer` is [the only recommended type for generic bytes](developers/best-practices/the-dynamic-allocation-problem).
:::

---

[comment]: # (mx-context-auto)

### Address

MultiversX addresses are 32 byte arrays, so they get serialized as such, both in top and nested encodings.

---

[comment]: # (mx-context-auto)

### Token identifiers

MultiversX ESDT token identifiers are of the form `XXXXXX-123456`, where the first part is the token ticker, 3 to 20 characters in length, and the last is a random generated number.

They are top-encoded as is, the exact bytes and nothing else.

Because of their variable length, they need to be serialized like variable length byte slices when nested, so the length is explicitly encoded at the start.

 Type            | Value                       | Top-level encoding | Nested encoding    |
| --------------- | --------------------------- | ------------------ | ------------------ |
| `TokenIdentifier` | `ABC-123456`                    | `0x4142432d313233343536`         | `0x0000000A4142432d313233343536` |

---

