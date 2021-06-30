---
id: elrond-wasm-annotations
title: Smart contract annotations
---

## Introduction

Annotations (also known as Rust "attributes") are the bread and butter of the `elrond-wasm` smart contract development framework. While contracts can in principle be written without any annotations or code generation macros in place, it is infinitely more difficult to do so.

One of the main purposes of the framework is to make the code as readable and concise as possible, and annotations are the path to get there.

For an introduction, check out the Crowdfunding tutorial. This page is supposed to be a complete index of all annotations that can be encountered in smart contracts.


## Trait annotations

### `#[elrond_wasm_derive::contract]`

The `contract` annotation must always be placed on a trait and will automatically make that trait the main container for the smart contract endpoints and logic. There should be only one such trait defined per crate.

Note that the annotation takes no additional arguments.


----------------------------------------------


### `#[elrond_wasm_derive::module]`

The `module` annotation must always be placed on a trait and will automatically make that trait a smart contract module. More about smart contract modules in [the module reference](/developers/developer-reference/elrond-wasm-modules)

Note that the annotation takes no additional arguments.

:::warning
Only one contract, module or proxy annotation is allowed per Rust module. If they are in separate files there is no problem, but if several share a file, explicit `mod module_name { ... }` must enclose the module.
:::

----------------------------------------------


### `#[elrond_wasm_derive::proxy]`

The `proxy` annotation must always be placed on a trait and will automatically make that trait a smart contract call proxy. More about smart contract proxies in [the contract calls reference](/developers/developer-reference/elrond-wasm-contract-calls).

In short, contracts always get an auto-generated proxy. However, if such an auto-generated proxy of another contract is not available, it is possible to define such a "contract interface" by hand, using the `proxy` attribute.

Note that the annotation takes no additional arguments.

:::warning
Only one contract, module or proxy annotation is allowed per Rust module. If they are in separate files there is no problem, but if several share a file, explicit `mod proxy_name { ... }` must enclose the module.
:::


## Method annotations

### `#[endpoint]` and `#[view]`

Endpoints are the public methods of contracts, which can be called in transactions. A contract can define any number of methods, but only those annotated with `#[endpoint]` or `#[view]` are visible to the outside world.

`#[view]` is meant to indicate readonly methods, but this is currently not enforced in any way. Functionally, `#[view]` and `#[endpoint]` are currently perfectly synonymous. However, there are plans for the future to enforce views to be verified at compile time to be readonly. When that happens, smart contracts that will already have been correctly annotated will be easier to migrate. Until then, there is still value in having 2 annotations, since they indicate intent.

If no arguments are provided to the attribute, the name of the Rust method will be the name of the endpoint. Alternatively, an explicit endpoint name can be provided in brackets.

Example:

```rust
#[elrond_wasm_derive::contract]
pub trait Example {
	#[endpoint]
	fn example(&self) {
    }

    #[endpoint(camelCaseEndpointName)]
	fn snake_case_method_name(&self, value: &Self::BigInt) {
    }

    fn private_method(&self, value: &Self::BigInt) {
    }

    #[view(getData)]
	fn get_data(&self) -> u32{
        0
    }
```

In this example, 3 methods are public endpoints. They are named `example`, `camelCaseEndpointName` and `getData`. All other names are internal and do not show up in the resulting contract.