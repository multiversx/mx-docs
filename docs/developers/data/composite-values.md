---
id: composite-values
title: Composite Values
---
[comment]: # (mx-abstract)

We often need to group simple values into more complex ones, without splitting them into [several arguments](/developers/data/multi-value).

Here too we opted for an encoding that is, above all, very easy to read.


[comment]: # (mx-context-auto)

### Lists of items

This is an umbrella term for all types of lists or arrays of various item types. They all serialize the same way.

**Rust types**: `&[T]`, `Vec<T>`, `Box<[T]>`, `LinkedList<T>`, `VecMapper<T>`, etc.

**Top-encoding**: All nested encodings of the items, concatenated.

**Nested encoding**: First, the length of the list, encoded on 4 bytes (`usize`/`u32`).
Then, all nested encodings of the items, concatenated.

**Examples**

| Type             | Value                | Top-level encoding    | Nested encoding                | Explanation                                                                                                                               |
| ---------------- | -------------------- | --------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `Vec<u8>`        | `vec![1, 2]`         | `0x0102`              | `0x00000002 0102`              | Length = `2`                                                                                                                              |
| `Vec<u16>`       | `vec![1, 2]`         | `0x00010002`          | `0x00000002 00010002`          | Length = `2`                                                                                                                              |
| `Vec<u16>`       | `vec![]`             | `0x`                  | `0x00000000`                   | Length = `0`                                                                                                                              |
| `Vec<u32>`       | `vec![7]`            | `0x00000007`          | `0x00000001 00000007`          | Length = `1`                                                                                                                              |
| `Vec< Vec<u32>>` | `vec![ vec![7]]`     | `0x00000001 00000007` | `0x00000001 00000001 00000007` | There is 1 element, which is a vector. In both cases the inner Vec needs to be nested-encoded in the larger Vec.                          |
| `Vec<&[u8]>`     | `vec![ &[7u8][..]]`  | `0x00000001 07`       | `0x00000001 00000001 07`       | Same as above, but the inner list is a simple list of bytes.                                                                              |
| `Vec< BigUint>`  | `vec![ 7u32.into()]` | `0x00000001 07`       | `0x00000001 00000001 07`       | `BigUint`s need to encode their length when nested. The `7` is encoded the same way as a list of bytes of length 1, so the same as above. |

---

[comment]: # (mx-context-auto)

### Arrays and tuples

The only difference between these types and the lists in the previous section is that their length is known at compile time.
Therefore, there is never any need to encode their length.

**Rust types**: `[T; N]`, `Box<[T; N]>`, `(T1, T2, ... , TN)`.

**Top-encoding**: All nested encodings of the items, concatenated.

**Nested encoding**: All nested encodings of the items, concatenated.

**Examples**

| Type             | Value               | Top-level encoding | Nested encoding    |
| ---------------- | ------------------- | ------------------ | ------------------ |
| `[u8; 2]`        | `[1, 2]`            | `0x0102`           | `0x0102`           |
| `[u16; 2]`       | `[1, 2]`            | `0x00010002`       | `0x00010002`       |
| `(u8, u16, u32)` | `[1u8, 2u16, 3u32]` | `0x01000200000003` | `0x01000200000003` |

---

[comment]: # (mx-context-auto)

### Options

An `Option` represents an optional value: every Option is either `Some` and contains a value, or `None`, and does not.

**Rust types**: `Option<T>`.

**Top-encoding**: If `Some`, a `0x01` byte gets encoded, and after it the encoded value. If `None`, nothing gets encoded.

**Nested encoding**: If `Some`, a `0x01` byte gets encoded, and after it the encoded value. If `None`, a `0x00` byte get encoded.

**Examples**

| Type               | Value                              | Top-level encoding   | Nested encoding      | Explanation                                                                                  |
| ------------------ | ---------------------------------- | -------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `Option<u16>`      | `Some(5)`                          | `0x010005`           | `0x010005`           |                                                                                              |
| `Option<u16>`      | `Some(0)`                          | `0x010000`           | `0x010000`           |                                                                                              |
| `Option<u16>`      | `None`                             | `0x`                 | `0x00`               | Note that `Some` has different encoding than `None` for any type                             |
| `Option< BigUint>` | `Some( BigUint::from( 0x1234u32))` | `0x01 00000002 1234` | `0x01 00000002 1234` | The `Some` value is nested-encoded. For a `BigUint` this adds the length, which here is `2`. |

---
