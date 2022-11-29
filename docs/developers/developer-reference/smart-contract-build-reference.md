---
id: smart-contract-build-reference
title: Smart Contract Build Reference
---

## How to: basic build

To build a contract, it is enough to navigate in your contract crate and run

```sh
erdpy contract build
```
Alternativelly you can go to your installed `Elrond Workspace Explorer` VS Code extension and right click your Smart Contract followed by `Build Contract`  

![alt text](ide.png "Build Contract from the Elrond Workspace Explorer extension")
## How to: Multi contract build

To get a multi-contract build, it is enough to add a `multicontract.toml` file to the smart contract root, following running again the build command.

The `multicontract.toml` file is an optional file that if added to your smart contract will enable the multi-contract build. Its absence does not influence at all the basic build functionality. Here is an example of a `multicontract.toml` :
```toml
[settings]
main = "multi-contract-main"

[contracts.multi-contract-main]
# main contract can have any id and any name
name = "multi-contract-features"
add-unlabelled = true

[contracts.multi-contract-features-view]
# name is optional, if missing this ^^^ id will be used
external-view = true
add-labels = ["mcs-external-view"]
```
And now an example of contract that uses this multi-contract configuration file:

```rust
![no_std]

elrond_wasm::imports!();

#[elrond_wasm::contract]
pub trait MultiContractFeatures {
    #[init]
    fn init(&self, sample_value: BigUint) {
        self.sample_value().set(sample_value);
    }

    #[view]
    #[storage_mapper("sample-value")]
    fn sample_value(&self) -> SingleValueMapper<BigUint>;

    #[view]
    #[label("mcs-external-view")]
    fn external_pure(&self) -> i32 {
        1
    }

    #[view]
    #[label("mcs-external-view")]
    fn sample_value_external_get(&self) -> BigUint {
        self.sample_value().get()
    }

    /// This is not really a view.
    /// Designed to check what happens if we try to write to storage from an external view.
    #[endpoint]
    #[label("mcs-external-view")]
    fn sample_value_external_set(&self, sample_value: BigUint) {
        self.sample_value().set(sample_value);
    }
}

```

In the contract one may label endpoints and in the `multicontract.toml` file to decide in what to do with the certain label. A label ca be added to multiple contracts inside the `add-labels` component resulting the endpoints being added to the multiple specific contracts.

A contract may have a specific name in the toml file but can be generated with a differnet one by specifying its `name` field.

## Contract build process overview

This section provides an overview for those who want to understand the system on a deeper level. If you are simply looking to build some contracts, feel free to skip this.

Building a contract is a complex process, but luckily it gets handles invisibly by the framework. We will follow the components step by step and give some justification for this architecture.

### a. The smart contract itself

The smart contract is defined as a trait without an implementation. This is good, because it means the contract can be executed on various platforms. Some of the implementation gets generated automatically by the `[elrond_wasm::contract]` macro.

Not everything, though, can be performed here. Notably, macros cannot access data from other modules or crates, all processing is local to the current contract or module. Therefore, we need another mechanism for working with the complete contract data.

### b. The (generated) ABI generator

ABIs are a collection of metatada about the contract. To build an ABI, we also need the data from the modules. The module macros cannot be called from the contract macros (macros are run at compilation, we are not even sure that modules will need to be recompiled!). Modules, however can be called. That is why we are actually generating _ABI generator functions_ for each module, which can call one another to retrieve the composite picture.

Note: The ABI generator comes as an implementation of trait [ContractAbiProvider](https://docs.rs/elrond-wasm/latest/elrond_wasm/contract_base/trait.ContractAbiProvider.html).

### c. Meta crate: generating the ABI

The next question is how will this function be called. Whenever we compile the WASM contracts, we also produce the ABIs in JSON format. Rust has something called build scripts, which get called _after_ compiling a project, but for reasons that will become apparent later, they are not powerful enough for our usecase.

Therefore, we have decided to include an extra crate in each smart contract project. It is always found in the `meta` folder in a contract, and it handles the entire build. To minimize boilerplate, it always only contains one line, that simply defers execution to the framework:

```rust
fn main() {
    elrond_wasm_debug::meta::perform::<my_contract_crate::AbiProvider>();
}
```

To produce the ABI, in fact, it is enough to call:

```sh
cd meta
cargo run
```

The meta crate has access to the ABI generator, because it always has a dependency to the contract crate. This is the `my_contract_crate::AbiProvider` in the example above.

This is also the step where the meta crate parses and processes the `multicontract.toml` file. If there are multiple outputs, one ABI will be produced for each.


### d. Meta crate: generating `wasm` crate code

Each contract must contain at least one `wasm` crate. This is a separate crate from the contract crate, because it has a different purpose: it only needs to be the basis for compiling wasm. Take it as an intermediary step between the contract logic and the Rust to WASM compiler. This is also where the WASM compilation options are specified (e.g. the optimization level). These options can be seen in the the `Cargo.toml` file of the `wasm` crate.

The separation is important, because it means that the smart contract crate can act as a pure rust crate, with no knowledge of WebAssembly. This makes it easy to test, coverage, and integrate in other unrelated technologies.

The `wasm` crates, do not add any meaningful code to the the smart contract, everything they need to do is to provide an adapter to the WASM function syntax. More specifically, they expose an external function for each desired endpoint, which simply forwards execution to the corresponding smart contract method.

If we are not careful, there is a risk of adding unwanted endpoints to the contract. A classic example is when we have a crate with multiple modules, of which only one is imported into the smart contract. In some older versions you might have gotten unwanted endpoints from the other modules of that crate. In order to avoid this, we are using the ABI to generate a curated list of endpoints in each `wasm` crate. This way, our contracts always have the exact same endpoints as the ones specified in the ABIs.

This requires code generation. The `meta` crate will handle this code generation too. An example of such generated code lies below:

```rust
// Code generated by the elrond-wasm multi-contract system. DO NOT EDIT.

////////////////////////////////////////////////////
////////////////// AUTO-GENERATED //////////////////
////////////////////////////////////////////////////

// Number of endpoints: 2

#![no_std]

elrond_wasm_node::wasm_endpoints! {
    adder
    (
        getSum
        add
    )
}

elrond_wasm_node::wasm_empty_callback! {}
```

The `elrond_wasm_node` macros help keep even this generated code to a minimum.

For multi-contract builds, one `wasm` crate needs to be generated for each of the output contracts:
- The main wasm crate must always reside in the `wasm` folder. The source file is auto-generated, but the `Cargo.toml` must be provided by the developer.
- The other wasm contracts (called "secondary") receive a crate folder starting with `wasm-`, e.g. `wasm-multisig-view`. These crates are fully generated based on data from `multicontract.toml`. The respective `Cargo.toml` files are based on the the `Cargo.toml` of the main wasm crate. All configs are taken from there, except for the crate name.
- Warning: Any folders starting with `wasm-` that are unaccounted for will be removed without prompt. This is to keep the folder structure clean in case of renames.


### e. Meta crate: the actual WASM build

The previous two steps happen by just calling `cargo run` in the meta crate, but to actually perform a build, one must call `cargo run build`.

With the ABI information and the code generated, the meta crate can now actually build all the WASM contracts, one for each output contract.

The optimizer `wasm-opt` is also run on each of the resulting binaries (unless opted-out in the configs).

The rust compiler places the result in the designated `target` folder, but for convenience, the meta crate moves the executables to the contract's `output` folder and renames them according to the configured names.

You might have performed this step automatically from erdpy, but erdpy actually just calls the meta crate to do this job. This is because at this point only the meta crate has access to the ABIs and can do it that easily.

There are several options for this task:
    - `--wasm-symbols`: Does not optimize away symbols at compile time, retains function names, good for investigating the WAT.
    - `--no-wasm-opt`: Does not apply `wasm-opt` after the build, this retains function names, good for investigating the WAT.
    - `--wasm-name` followed by name: Replaces the main contract's name with this one. Does nothing for secondary contracts. => {
    - `--wasm-suffix` followed by a suffix: Adds a dash and this suffix to all produced contracts. E.g. `cargo run build --wasm-suffix dbg` on multisig will produce contracts `multisig-dbg.wasm`, `multisig-view-dbg.wasm` and `multisig-full-dbg.wasm`.
    - `--target-dir` specifies which target folder the rust compiler should use. In case more contract are compiled, it is faster for them to share the target directory, since common crates will not need to be recompiled for each contract. Erdpy always sets this for this reason.

These are especially useful for building debug versions of the binaries, call like this to get the full wat files:
`cargo run build --wasm-symbols --wasm-suffix "dbg" --no-wasm-opt`, then optionally `wasm2wat <contract-dbg.wasm>`

### f. Cleaning a project

Calling `cargo run clean` in the meta crate will run `cargo clean` in all wasm crates and delete the `output` folder.

`erdpy contract clean` also just forwards to this.

### Build process summary

To recap, the build process steps are as follows:

1. Generate code using the contract/module macros, including the ABI generator;
2. Call the ABI generator, to produce an ABI in memory;
3. Parse the `multicontract.toml` file (if present);
4. Deciding based on that which endpoints go to which output contracts;
5. Save the ABI as JSON in the output folder (one for each output contract);
6. Generate the wasm crates for all output contracts (all sources generated, Cargo.toml contents copied from the main wasm crate);
7. Build all wasm crates;
8. Apply `wasm-opt` for each;
9. Copy binaries from `target` folder to `output`.

Luckily, the framework can do all of this automatically, with a single click.
