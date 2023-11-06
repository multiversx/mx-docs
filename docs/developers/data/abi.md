---
id: abi
title: ABI
---

[comment]: # (mx-abstract)

## ABI Overview

To interact with a smart contract it is essential to understand its inputs and outputs. This is valid both for on-chain calls, and for off-chain tools, and can in most cases also tell us a lot about what the smart contract does and how it does it.

For this reason, blockchain smart contracts have so-called ABIs, expressed in a platform-agnostic language - JSON in our case.

Note that the name ABI is short for _Application Binary Interface_, which is a concept borrowed from low-level and systems programming. The word _binary_ does not refer to its representation, but rather to the fact that it describes the binary encoding of inputs and outputs.

---

[comment]: # (mx-context-auto)

## Minimal example

At its base minimum, an ABI contains:
- Some general build information, mostly used by humans, rather than tools:
    - the compiler version;
    - the name and version of the contract crate;
    - the framework version used.
- The name of the contract crate and the Rust docs associated to it (again, mostly for documentation purposes).
- Under it, the list of all endpoints. For each endpoint we get:
    - The Rust docs associated to them;
    - Mutability, meaning whether or not the endpoint can modify smart contract state. At this point in the evolution of the framework, this mutability is purely cosmetic, not enforced. It can be viewed as a form of documentation, or declaration of intent. This might change, though, in the future into a hard guarantee.
    - Whether the endpoint is payable.
    - The list of all inputs, with their corresponding names and types.
    - The list of all outputs, with their corresponding types. It is rare but possible to have more than one declared output value. It is also rare but possible to have output values named.

```json
{
    "buildInfo": {
        "rustc": {
            "version": "1.71.0-nightly",
            "commitHash": "a2b1646c597329d0a25efa3889b66650f65de1de",
            "commitDate": "2023-05-25",
            "channel": "Nightly",
            "short": "rustc 1.71.0-nightly (a2b1646c5 2023-05-25)"
        },
        "contractCrate": {
            "name": "adder",
            "version": "0.0.0",
            "gitVersion": "v0.43.2-5-gfe62c37d2"
        },
        "framework": {
            "name": "multiversx-sc",
            "version": "0.43.2"
        }
    },
    "docs": [
        "One of the simplest smart contracts possible,",
        "it holds a single variable in storage, which anyone can increment."
    ],
    "name": "Adder",
    "constructor": {
        "inputs": [
            {
                "name": "initial_value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    },
    "endpoints": [
        {
            "name": "getSum",
            "mutability": "readonly",
            "inputs": [],
            "outputs": [
                {
                    "type": "BigUint"
                }
            ]
        },
        {
            "docs": [
                "Add desired amount to the storage variable."
            ],
            "name": "add",
            "mutability": "mutable",
            "inputs": [
                {
                    "name": "value",
                    "type": "BigUint"
                }
            ],
            "outputs": []
        }
    ],
    "events": [],
    "hasCallback": false,
    "types": {}
}
```

---

[comment]: # (mx-context-auto)

## Data types

Smart contract inputs and outputs almost universally use the [standard MultiversX serialization format](/developers/data/serialization-overview).

The ABI is supposed to contain enough information, so that, knowing this standard, a developer can write an encoder or decoder for the data of a smart contract in any language.

:::important Important
Please note that the type names are not necessarily the ones from Rust, we are trying to keep this language-agnostic to some extent.
:::

[comment]: # (mx-context-auto)

### Basic types

First off, there are a number of [basic types](/developers/data/simple-values) that are known, and which have a universal representation:
- Numerical types: `BigUint`, `BigInt`, `u64`, `i32`, etc.
- Booleans: `bool`.
- Raw byte arrays are all specified as `bytes`, irrespective of the underlying implementation in the contract. Someone who just interacts with the contract does not care whether the contracts works with `ManagedBuffer`, `Vec<u8>`, or something else, it's all the same to the exterior.
- Text: `utf-8 string`.
- 32 byte account address: `Address`.
- ESDT token identifier: `TokenIdentifier`. Encoded the same as `bytes`, but with more specific semantics.

[comment]: # (mx-context-auto)

### Composite types

Then, there are several standard [composite types](/developers/data/composite-values). They also have type arguments that describe the type of their content:
- Variable-length lists: `List<T>`, where `T` can be any type; e.g. `List<u32>`.
- Fixed-length arrays: `arrayN<T>`, where `N` is a number and `T` can be any type; e.g. `array5<u8>` represents 5 bytes.
- Heterogenous fixed-length tuples, `tuple<T1,T2,...,TN>`, no spaces, where `T1`, `T2` , ... , `TN` can be any types; e.g. `tuple<i16,bytes>`.
- Optional data, `Option<T>`, where `T` can be any type. Represented as either nothing, or a byte of `0x01` followed by the serialized contents.

[comment]: # (mx-context-auto)

### Custom types: overview

All the types until here were standard and it is expected that any project using the ABI knows about them.

But here it gets interesting: the ABI also needs to describe types that are defined the smart contract itself.

There is simply not enough room to do it inline with the arguments, so a separate section is necessary, which contains all these descriptions. This section is called `"types"`, and it can describe `struct` and `enum` types.


Have a look at this example with custom types:

```json
{
    "buildInfo": {},
    "docs": [
        "Struct & Enum example"
    ],
    "name": "TypesExample",
    "constructor": {
        "inputs": [],
        "outputs": []
    },
    "endpoints": [
        {
            "name": "doSomething",
            "onlyOwner": true,
            "mutability": "mutable",
            "inputs": [
                {
                    "name": "s",
                    "type": "MyAbiStruct"
                }
            ],
            "outputs": [
                {
                    "type": "MyAbiEnum"
                }
            ]
        }
    ],
    "events": [],
    "hasCallback": false,
    "types": {
        "MyAbiStruct": {
            "type": "struct",
            "docs": [
                "ABI example of a struct."
            ],
            "fields": [
                {
                    "docs": [
                        "Fields can also have docs."
                    ],
                    "name": "field1",
                    "type": "BigUint"
                },
                {
                    "name": "field2",
                    "type": "List<Option<u32>>"
                },
                {
                    "name": "field3",
                    "type": "tuple<bool, i32>"
                }
            ]
        },
        "MyAbiEnum": {
            "type": "enum",
            "docs": [
                "ABI example of an enum."
            ],
            "variants": [
                {
                    "name": "Nothing",
                    "discriminant": 0
                },
                {
                    "name": "Something",
                    "discriminant": 1,
                    "fields": [
                        {
                            "name": "0",
                            "type": "i32"
                        }
                    ]
                },
                {
                    "name": "SomethingMore",
                    "discriminant": 2,
                    "fields": [
                        {
                            "name": "0",
                            "type": "u8"
                        },
                        {
                            "name": "1",
                            "type": "MyAbiStruct"
                        }
                    ]
                }
            ]
        }
    }
}
```


[comment]: # (mx-context-auto)

### Custom types: struct

ABI [structures](/developers/data/custom-types#custom-structures) are defined by:
- __Name__;
- __Docs__ (optionally);
- A list of ___fields___. Each field has:
    - __Name__;
    - __Docs__ (optionally);
    - The __type__ of the field. Any type is allowed, so:
        - simple types,
        - composite types,
        - other custom types,
        - even the type itself (if you manage to pull that off).

In the example above, we are declaring a structure called `MyAbiStruct`, with 3 fields, called `field1`, `field2`, and `field3`.


[comment]: # (mx-context-auto)

### Custom types: enum

Similarly, [enums](/developers/data/custom-types#custom-enums) are defined by:
- __Name__;
- __Docs__ (optionally);
- A list of ___variants___. Each variant has:
    - A __name__;
    - __Docs__ (optionally);
    - The __discriminant__. This is the index of the variant (starts from 0). It is always serialized as the first byte.
    - Optionally, __data fields__ associated with the enum.
        - It is most common to have single unnamed field, which will pe named `0`. There are, however, other options. Rust syntax allows:
        - Tuple varians, named `0`, `1`, `2`, etc.
        - Struct-like variants, with named fields.

You can read more about Rust enums [here](https://doc.rust-lang.org/book/ch06-01-defining-an-enum.html).

---

[comment]: # (mx-context-auto)

## Custom ABI exports

### Overview

Even though the `#[derive(TypeAbi)]` annotation exports all the data types used in the contract along with the type descriptions, we have implemented a manual way to export any kind of data type (used inside the contract or not) in the ABI file in order to fetch it easier from other services (e.g. use-case: the developer can define the type of the attributes expected for a specific ESDT, fetch it from abi and use it easily in the frontend for a more specific result).

Starting with the framework version `0.44`, developers can use the new trait annotation `#[esdt_attribute("name", Type)]` in order to export any data types in the ABI file. 

:::important Important
Please note that it is a `trait annotation`, meaning that it can only be used at trait level along with other `#[multiversx_sc]` annotation. Using it at endpoint level or at trait level outside `multiversx_sc` environment will not work.
:::

A new field called `esdtAttributes` was added to the ABI file, where developers can find the structs (name, type) exported using the `esdt_attribute` trait annotation. Additionally, each `esdt_attribute` will create a new json file with the name given by the developer (followed by `.esdt-abi`) and containing its exported structs (names, types and descriptions). 

### Basic types

Let's take the `Adder` contract as an example and try out the new annotation.

__adder.rs:__
```rust
#[multiversx_sc::contract]
#[esdt_attribute("testBasic", BigUint)]
pub trait Adder {
    #[view(getSum)]
    #[storage_mapper("sum")]
    fn sum(&self) -> SingleValueMapper<BigUint>;

    #[init]
    fn init(&self, initial_value: BigUint) {
        self.sum().set(initial_value);
    }

    /// Add desired amount to the storage variable.
    #[endpoint]
    fn add(&self, value: BigUint) {
        self.sum().update(|sum| *sum += value);
    }
}
```

Adding the `#[esdt_attribute("testBasic", BigUint)]` at trait level along with `#[multiversx_sc::contract]` should export a new structure named `testBasic` with a `BigUint` field type. The abi can be generated calling `sc-meta all abi` in the contract folder, or by building the contract using `sc-meta all build` (this command also adds the wasm file to the `output` folder).

Building the contract using `sc-meta all build` will generate the following folder structure:
```
adder
├── output
│   ├── adder.abi.json
│   ├── adder.imports.json
|   ├── adder.mxsc.json
|   ├── adder.wasm
│   ├── testBasic.esdt-abi.json
```

Let's check out the `adder.abi.json` file first. Here we discover the new `esdtAttributes` field, containing the value mentioned in the annotation.

```json
{
    "buildInfo": {
        "rustc": {
            "version": "1.71.0-nightly",
            "commitHash": "a2b1646c597329d0a25efa3889b66650f65de1de",
            "commitDate": "2023-05-25",
            "channel": "Nightly",
            "short": "rustc 1.71.0-nightly (a2b1646c5 2023-05-25)"
        },
        "contractCrate": {
            "name": "adder",
            "version": "0.0.0",
            "gitVersion": "v0.44.0"
        },
        "framework": {
            "name": "multiversx-sc",
            "version": "0.44.0"
        }
    },
    "docs": [
        "One of the simplest smart contracts possible,",
        "it holds a single variable in storage, which anyone can increment."
    ],
    "name": "Adder",
    "constructor": {
        "inputs": [
            {
                "name": "initial_value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    },
    "endpoints": [
        {
            "name": "getSum",
            "mutability": "readonly",
            "inputs": [],
            "outputs": [
                {
                    "type": "BigUint"
                }
            ]
        },
        {
            "docs": [
                "Add desired amount to the storage variable."
            ],
            "name": "add",
            "mutability": "mutable",
            "inputs": [
                {
                    "name": "value",
                    "type": "BigUint"
                }
            ],
            "outputs": []
        }
    ],
    "events": [],
    "esdtAttributes": [
        {
            "ticker": "testBasic",
            "type": "BigUint"
        }
    ],
    "hasCallback": false,
    "types": {}
}
```
We can also check the specific json file exported for the newly defined type where we can find information about the type separated from the main abi file.

__testBasic.esdt-abi.json__
```json
{
    "esdtAttribute": {
        "ticker": "testBasic",
        "type": "BigUint"
    }
}
```

## Composite types

Now, let's see what happens when we use other types than basic ones. Let's add a `Vec`, an `Enum` and an `Option` to our esdt attributes.

__adder.rs:__
```rust
#![no_std]

use multiversx_sc::derive::TypeAbi;

multiversx_sc::imports!();

/// One of the simplest smart contracts possible,
/// it holds a single variable in storage, which anyone can increment.
#[multiversx_sc::contract]
#[esdt_attribute("testBasic", BigUint)]
#[esdt_attribute("testVec", ManagedVec<u64>)]
#[esdt_attribute("testEnum", MyEnum)]
#[esdt_attribute("testOption", Option<TokenIdentifier>)]
pub trait Adder: module::ModuleExample {
    #[view(getSum)]
    #[storage_mapper("sum")]
    fn sum(&self) -> SingleValueMapper<BigUint>;

    #[init]
    fn init(&self, initial_value: BigUint) {
        self.sum().set(initial_value);
    }

    /// Add desired amount to the storage variable.
    #[endpoint]
    fn add(&self, value: BigUint) {
        self.sum().update(|sum| *sum += value);
    }
}

#[derive(TypeAbi)]
pub enum MyEnum {
    First,
    Second,
    Third,
}

```

If we call `sc-meta all abi` (or `sc-meta all build` if we also wish to build the contract), the new attributes will be added to our __adder.abi.json__ file and new separate json files will be created for each attribute.

__adder.abi.json:__
```json
{
    "buildInfo": {
        "rustc": {
            "version": "1.71.0-nightly",
            "commitHash": "a2b1646c597329d0a25efa3889b66650f65de1de",
            "commitDate": "2023-05-25",
            "channel": "Nightly",
            "short": "rustc 1.71.0-nightly (a2b1646c5 2023-05-25)"
        },
        "contractCrate": {
            "name": "adder",
            "version": "0.0.0",
            "gitVersion": "v0.44.0"
        },
        "framework": {
            "name": "multiversx-sc",
            "version": "0.44.0"
        }
    },
    "docs": [
        "One of the simplest smart contracts possible,",
        "it holds a single variable in storage, which anyone can increment."
    ],
    "name": "Adder",
    "constructor": {
        "inputs": [
            {
                "name": "initial_value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    },
    "endpoints": [
        {
            "name": "getSum",
            "mutability": "readonly",
            "inputs": [],
            "outputs": [
                {
                    "type": "BigUint"
                }
            ]
        },
        {
            "docs": [
                "Add desired amount to the storage variable."
            ],
            "name": "add",
            "mutability": "mutable",
            "inputs": [
                {
                    "name": "value",
                    "type": "BigUint"
                }
            ],
            "outputs": []
        }
    ],
    "events": [],
    "esdtAttributes": [
        {
            "ticker": "testBasic",
            "type": "BigUint"
        },
        {
            "ticker": "testVec",
            "type": "List<u64>"
        },
        {
            "ticker": "testEnum",
            "type": "MyEnum"
        },
        {
            "ticker": "testOption",
            "type": "Option<TokenIdentifier>"
        }
    ],
    "hasCallback": false,
    "types": {
        "MyEnum": {
            "type": "enum",
            "variants": [
                {
                    "name": "First",
                    "discriminant": 0
                },
                {
                    "name": "Second",
                    "discriminant": 1
                },
                {
                    "name": "Third",
                    "discriminant": 2
                }
            ]
        },
    }
}

```

Now, if we take a look into the folder structure of the contract, we should see the following updated folder structure containing the newly generated files in `output`:

```
adder
├── output
│   ├── adder.abi.json
│   ├── adder.imports.json
|   ├── adder.mxsc.json
|   ├── adder.wasm
│   ├── testBasic.esdt-abi.json
│   ├── testEnum.esdt-abi.json
│   ├── testOption.esdt-abi.json
│   ├── testVec.esdt-abi.json
```

Each file contains the new struct with its name and the type field's description.

__testEnum.esdt-abi.json:__
```json
{
    "esdtAttribute": {
        "ticker": "testEnum",
        "type": "MyEnum"
    },
    "types": {
        "MyEnum": {
            "type": "enum",
            "variants": [
                {
                    "name": "First",
                    "discriminant": 0
                },
                {
                    "name": "Second",
                    "discriminant": 1
                },
                {
                    "name": "Third",
                    "discriminant": 2
                }
            ]
        }
    }
}
```

__testOption.esdt-abi.json:__
```json
{
    "esdtAttribute": {
        "ticker": "testOption",
        "type": "Option<TokenIdentifier>"
    }
}
```

__testVec.esdt-abi.json:__
```json
{
    "esdtAttribute": {
        "ticker": "testVec",
        "type": "List<u64>"
    }
}
```

## Custom types

Let's also add a custom `Struct` into the mix. Here is the updated code for __adder.rs:__

```rust
#![no_std]

use multiversx_sc::derive::TypeAbi;

multiversx_sc::imports!();

/// One of the simplest smart contracts possible,
/// it holds a single variable in storage, which anyone can increment.
#[multiversx_sc::contract]
#[esdt_attribute("testBasic", BigUint)]
#[esdt_attribute("testVec", ManagedVec<u64>)]
#[esdt_attribute("testEnum", MyEnum)]
#[esdt_attribute("testOption", Option<TokenIdentifier>)]
#[esdt_attribute("testStruct", MyStruct<Self::Api>)]
pub trait Adder: module::ModuleExample {
    #[view(getSum)]
    #[storage_mapper("sum")]
    fn sum(&self) -> SingleValueMapper<BigUint>;

    #[init]
    fn init(&self, initial_value: BigUint) {
        self.sum().set(initial_value);
    }

    /// Add desired amount to the storage variable.
    #[endpoint]
    fn add(&self, value: BigUint) {
        self.sum().update(|sum| *sum += value);
    }
}

#[derive(TypeAbi)]
pub struct MyStruct<M: ManagedTypeApi> {
    pub field1: BigUint<M>,
    pub field2: ManagedVec<M, ManagedBuffer<M>>,
}

#[derive(TypeAbi)]
pub enum MyEnum {
    First,
    Second,
    Third,
}

```

Same as before, we use `sc-meta all abi` and a new file named `testStruct.esdt-abi.json` shows up in our folder structure:

```
adder
├── output
│   ├── adder.abi.json
│   ├── adder.imports.json
|   ├── adder.mxsc.json
|   ├── adder.wasm
│   ├── testBasic.esdt-abi.json
│   ├── testEnum.esdt-abi.json
│   ├── testOption.esdt-abi.json
│   ├── testStruct.esdt-abi.json
│   ├── testVec.esdt-abi.json
```

__testStruct.esdt-abi.json:__
```json
{
    "esdtAttribute": {
        "ticker": "testStruct",
        "type": "MyStruct"
    },
    "types": {
        "MyStruct": {
            "type": "struct",
            "fields": [
                {
                    "name": "field1",
                    "type": "BigUint"
                },
                {
                    "name": "field2",
                    "type": "List<bytes>"
                }
            ]
        }
    }
}
```

As a final check, let's take a look at the main abi file, `adder.abi.json`, after adding multiple new attributes.

__adder.abi.json:__
```json
{
    "buildInfo": {
        "rustc": {
            "version": "1.71.0-nightly",
            "commitHash": "a2b1646c597329d0a25efa3889b66650f65de1de",
            "commitDate": "2023-05-25",
            "channel": "Nightly",
            "short": "rustc 1.71.0-nightly (a2b1646c5 2023-05-25)"
        },
        "contractCrate": {
            "name": "adder",
            "version": "0.0.0",
            "gitVersion": "v0.44.0"
        },
        "framework": {
            "name": "multiversx-sc",
            "version": "0.44.0"
        }
    },
    "docs": [
        "One of the simplest smart contracts possible,",
        "it holds a single variable in storage, which anyone can increment."
    ],
    "name": "Adder",
    "constructor": {
        "inputs": [
            {
                "name": "initial_value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    },
    "endpoints": [
        {
            "name": "getSum",
            "mutability": "readonly",
            "inputs": [],
            "outputs": [
                {
                    "type": "BigUint"
                }
            ]
        },
        {
            "docs": [
                "Add desired amount to the storage variable."
            ],
            "name": "add",
            "mutability": "mutable",
            "inputs": [
                {
                    "name": "value",
                    "type": "BigUint"
                }
            ],
            "outputs": []
        }
    ],
    "events": [],
    "esdtAttributes": [
        {
            "ticker": "testBasic",
            "type": "BigUint"
        },
        {
            "ticker": "testVec",
            "type": "List<u64>"
        },
        {
            "ticker": "testEnum",
            "type": "MyEnum"
        },
        {
            "ticker": "testOption",
            "type": "Option<TokenIdentifier>"
        },
        {
            "ticker": "testStruct",
            "type": "MyStruct"
        }
    ],
    "hasCallback": false,
    "types": {
        "MyEnum": {
            "type": "enum",
            "variants": [
                {
                    "name": "First",
                    "discriminant": 0
                },
                {
                    "name": "Second",
                    "discriminant": 1
                },
                {
                    "name": "Third",
                    "discriminant": 2
                }
            ]
        },
        "MyStruct": {
            "type": "struct",
            "fields": [
                {
                    "name": "field1",
                    "type": "BigUint"
                },
                {
                    "name": "field2",
                    "type": "List<bytes>"
                }
            ]
        }
    }
}
```