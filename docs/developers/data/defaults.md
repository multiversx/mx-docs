---
id: defaults
title: Defaults
---
[comment]: # (mx-abstract)

Smart contracts occasionally need to interact with uninitialized data. Most notably, whenever a smart contract is deployed, its entire storage will be uninitialized.

Uninitialized storage is indistinguishable from empty storage values, or storage that has been deleted. It always acts like  


[comment]: # (mx-context-auto)

## Built-in defaults

The serialization format naturally supports defaults for most types.

The default value of a type is the value that we receive when deserializing an empty buffer. The same value will serialize to an empty buffer. We like having easy access to empty serialized buffers, because that way we can easily clear storage and we minimize gas costs in transactions.

For instance, for all numeric types, zero is the default value, because we represent it as an empty buffer.

| Type                                      | Default value                  |
| ----------------------------------------- | ------------------------------ | 
| `u8`                                      | `0`                            |
| `u16`                                     | `0`                            |
| `u32`                                     | `0`                            |
| `u64`                                     | `0`                            |
| `usize`                                   | `0`                            |
| `BigUnt`                                  | `0`                            |
| `i8`                                      | `0`                            |
| `i16`                                     | `0`                            |
| `i32`                                     | `0`                            |
| `i64`                                     | `0`                            |
| `isize`                                   | `0`                            |
| `BigInt`                                  | `0`                            |
| `bool`                                    | `false`                        |
| `Option<T>`                               | `None`                         |
| `ManagedBuffer`                           | `ManagedBuffer::empty()`       |
| `Vec<T>`                                  | `Vec::new()`                   |
| `String`                                  | `"".to_string()`               |
| `DayOfWeek` (see example above)           | `DayOfWeek::Monday`            |
| `EnumWithEverything` (see example above)  | `EnumWithEverything::Default`  |

### Types that have no defaults 

Certain types have no values that can be represented as an empty buffer, and therefore they have no default value.

When trying to decode any of these types from an empty buffer, we will receive a deserialization error.

Examples:
- `(usize, usize)` always gets serialized as exactly 8 bytes, no less;
- `(usize, usize, usize)` always gets serialized as exactly 12 bytes;
- `[u8; 20]` always gets serialized as exactly 20 bytes.

The same goes for any custom `struct`, its representation is the concatenation of the nested encoding of its components, which is fixed size.

In some cases a custom `enum` faces the same problem. If the first variant has no additional data, the default is simply the first variant. We saw two examples above:
- `DayOfWeek` is a simple enum top to bottom, so `DayOfWeek::Monday` is naturally its default;
- `EnumWithEverything` has data in some of the variants, but not in the first, so in a similar manner, `EnumWithEverything::Default` works as its default.

However, if we were to define the enum:
```rust
#[derive(TopEncode, TopDecode)]
enum Either {
  Something(u32),
  SomethingElse(u64),
}
```
... there is no way to find a natural default value for it. Both variants are represented as non-empty buffers.

If you need the default, one workaround is to place these structures inside an `Option`. Options always have the default `None`, no matter the contents.

There is, however, another way to do it: for custom structures it is possible to define custom defaults, as we will see in the next section.

## Custom defaults

A structure that does not have a natural default value can receive one via custom code. First of all this applies to structures, but it can also be useful for some enums.

To do so, instead of deriving `TopEncode` and `TopDecode`, we will derive `TopEncodeOrDefault` and `TopDecodeOrDefault`, respectively.

We need to also specify what we want that default value to be, both when encoding and decoding. For this, we need to explicitly implement traits `EncodeDefault` and `DecodeDefault` for our structure.

Let's look at an example:

```rust
#[derive(TopEncodeOrDefault, TopDecodeOrDefault)]
pub struct StructWithDefault {
    pub first_field: u16,
    pub seq: Vec<u8>,
    pub another_byte: u8,
    pub uint_32: u32,
    pub uint_64: u64,
}

impl EncodeDefault for StructWithDefault {
    fn is_default(&self) -> bool {
        self.first_field == 5
    }
}

impl DecodeDefault for StructWithDefault {
    fn default() -> Self {
        StructWithDefault {
            first_field: 5,
            seq: vec![],
            another_byte: 0,
            uint_32: 0,
            uint_64: 0,
        }
    }
}
```

We just specified the following:
- `is_default`:whenever the `first_field` field is equal to 5, the other fields don't matter anymore and we save the structure as an empty buffer;
- `default`: whenever we try to decode an empty buffer, we yield a structure that has the `first_field` set to 5, and all the other fields empty or zero.

It should always be the case that `<T as EncodeDefault>::is_default(<T as EncodeDefault>::default())` is true. The framework does not enforce this in any way, but it should be common sense.

Other than that, there are no constraints on what the default value should be.

We can do the same for an enum:

```rust
#[derive(TopEncodeOrDefault, TopDecodeOrDefault)]
enum Either {
  Something(u32),
  SomethingElse(u64),
}

impl EncodeDefault for Either {
    fn is_default(&self) -> bool {
        matches!(*self, Either::Something(3))
    }
}

impl DecodeDefault for Either {
    fn default() -> Self {
        Either::Something(3)
    }
}
```

We just specified the following:
- `is_default`: whenever we have variant `Either::Something` _and_ the value contained is 3, encode as empty buffer;
- `default`: whenever we try to decode an empty buffer, we yield `Either::Something(3)`.

The same here, `<T as EncodeDefault>::is_default(<T as EncodeDefault>::default())` should be true. No other constraints over what the default value should be, of which variant. `Either::SomethingElse(0)` could also have been chosen to be the default.
