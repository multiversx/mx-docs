---
id: sc-build-reference
title: Build Reference
---

[comment]: # (mx-abstract)

## How to: Basic build

To build a contract, it is enough to navigate in your contract crate and run

```sh
sc-meta all build
```

:::info Note
The traditional way to trigger a build in console is to call `mxpy contract build --path <project>`, which works as well. However, mxpy currently just forwards commands to the [MultiversX Metaprogramming standalone tool](/developers/meta/sc-meta#introduction), so you might as well call it directly.
:::

---

[comment]: # (mx-exclude-context)

## Configuring the build

The build process is mostly configured using the [build configuration file](/developers/meta/sc-config), currently called `multicontract.toml`, and placed in the contract crate root.

It is also possible for the build process to produce [more than one contract per project crate](/developers/meta/sc-config#multi-contract-configuration).

---

[comment]: # (mx-context-auto)

## Contract build process deep dive

This section provides an overview for those who want to understand the system on a deeper level. If you are simply looking to build some contracts, feel free to skip this.

Building a contract is a complex process, but luckily it gets handled invisibly by the framework. We will follow the components step by step and give some justification for this architecture.

[comment]: # (mx-context-auto)

### a. The smart contract itself

The smart contract is defined as a trait without an implementation. This is good, because it means the contract can be executed on various platforms. Some of the implementation gets generated automatically by the `[multiversx_sc::contract]` macro.

Not everything, though, can be performed here. Notably, macros cannot access data from other modules or crates, all processing is local to the current contract or module. Therefore, we need another mechanism for working with the complete contract data.

[comment]: # (mx-context-auto)

### b. The (generated) ABI generator

ABIs are a collection of metatada about the contract. To build an ABI, we also need the data from the modules. The module macros cannot be called from the contract macros (macros are run at compilation, we are not even sure that modules will need to be recompiled!). Modules, however can be called. That is why we are actually generating _ABI generator functions_ for each module, which can call one another to retrieve the composite picture.

Note: The ABI generator comes as an implementation of trait [ContractAbiProvider](https://docs.rs/multiversx-sc/0.39.0/multiversx_sc/contract_base/trait.ContractAbiProvider.html).

[comment]: # (mx-context-auto)

### c. Meta crate: generating the ABI

The next question is how will this function be called. Whenever we compile the WASM contracts, we also produce the ABIs in JSON format. Rust has something called build scripts, which get called _after_ compiling a project, but for reasons that will become apparent later, they are not powerful enough for our usecase.

Therefore, we have decided to include an extra crate in each smart contract project. It is always found in the `meta` folder in a contract, and it handles the entire build. To minimize boilerplate, it always only contains one line that simply defers execution to the framework:

```rust
fn main() {
    multiversx_sc_meta::cli_main::<my_contract_crate::AbiProvider>();
}
```

To produce the ABI, in fact, it is enough to call:

```sh
cd meta
cargo run abi
```

The meta crate has access to the ABI generator, because it always has a dependency to the contract crate. This is the `my_contract_crate::AbiProvider` in the example above.

This is also the step where the meta crate parses and processes the `multicontract.toml` file. If there are multiple outputs, one ABI will be produced for each.

[comment]: # (mx-context-auto)

### d. Meta crate: generating wasm crate code

Each contract must contain at least one `wasm` crate. This is separate from the contract crate because it has a different purpose: it only needs to be the basis for compiling wasm. Please take it as an intermediary step between the contract logic and the Rust to WASM compiler. This is also where the WASM compilation options are specified (e.g. the optimization level). These options can be seen in the `Cargo.toml` file of the `wasm` crate.

The separation is helpful because, in this way, the smart contract crate can act as a pure Rust crate with no knowledge of WebAssembly. This makes testing and coverage easy, as well as enabling integration with other unrelated technologies.

The `wasm` crates do not add any meaningful code to the smart contract. Everything they need to do is to provide an adapter to the WASM function syntax. More specifically, they expose an external function for each desired endpoint, which forwards execution to the corresponding smart contract method.

If we are not careful, we risk adding unwanted endpoints to the contract. A classic example is when we have a crate with multiple modules, of which only one is imported into the smart contract. In some older versions, you might have gotten unwanted endpoints from the other modules of that crate. To avoid this, we are using the ABI to generate a curated list of endpoints in each `wasm` crate. This way, our contracts always have the exact same endpoints as the ones specified in the ABIs.

This requires code generation. The `meta` crate will handle this code generation too. An example of such generated code lies below:

```rust
// Code generated by the multiversx-sc multi-contract system. DO NOT EDIT.

////////////////////////////////////////////////////
////////////////// AUTO-GENERATED //////////////////
////////////////////////////////////////////////////

// Init:                                 1
// Endpoints:                            2
// Async Callback (empty):               1
// Total number of exported functions:   4

#![no_std]
#![feature(alloc_error_handler, lang_items)]

multiversx_sc_wasm_adapter::allocator!();
multiversx_sc_wasm_adapter::panic_handler!();

multiversx_sc_wasm_adapter::endpoints! {
    adder
    (
        getSum
        add
    )
}

multiversx_sc_wasm_adapter::empty_callback! {}
```

The `multiversx_sc_wasm_adapter` macros help keep even this generated code to a minimum.

For multi-contract builds, one `wasm` crate needs to be generated for each of the output contracts:

- The main wasm crate must always reside in the `wasm` folder. The source file is auto-generated, but the `Cargo.toml` must be provided by the developer.
- The other wasm contracts (called "secondary") receive a crate folder starting with `wasm-`, e.g. `wasm-multisig-view`. These crates are fully generated based on data from `multicontract.toml`. The respective `Cargo.toml` files are based on the `Cargo.toml` of the main wasm crate. All configs are taken from there, except for the crate name.
- Warning: Any folders starting with `wasm-` that are unaccounted for will be removed without prompt. This is to keep the folder structure clean in case of renames.

[comment]: # (mx-context-auto)

### e. Meta crate: the actual WASM build

The previous two steps happen by just calling `cargo run` in the meta crate, but to perform a build, one must call `cargo run build`.

With the ABI information and the code generated, the meta crate can now build all the WASM contracts, one for each output contract.

The rust compiler places the result in the designated `target` folder, but for convenience, the meta crate moves the executables to the project `output` folder and renames them according to the configured names.

You might have performed this step automatically from mxpy, but mxpy simply calls the meta crate to do this job. This is because at this point only the meta crate has access to the ABIs and can do it easily.

[comment]: # (mx-context-auto)

### f. Meta crate: build post-processing

After building the contracts, there are three more operations left to perform, based on the compiled WebAssembly outputs:

1. All contracts are optimized, using `wasm-opt`. This operation can be disabled (via `--no-wasm-opt`).
2. A WAT file id generated for each contract. Not enabled by default, can be enabled (via `--wat`). The framework simply calls the `wasm2wat` tool to do this.
3. An `.imports.json` file is generated for each contract. Can be disabled (via `--no-imports`). The framework uses the `wasm-objdump` tool to retrieve the imports. It parses the output and saves it as JSON.

[comment]: # (mx-context-auto)

### g. Cleaning a project

Calling `cargo run clean` in the meta crate will run `cargo clean` in all wasm crates and delete the `output` folder.

`mxpy contract clean` also just forwards to this.

Note that even the clean operation relies on the ABI, in order to reach all the wasm crates.

[comment]: # (mx-context-auto)

### Build process summary

To recap, the build process steps are as follows:

1. Generate code using the contract/module macros, including the ABI generator;
2. Call the ABI generator, to produce an ABI in memory;
3. Parse the `multicontract.toml` file (if present);
4. Deciding based on that which endpoints go to which output contracts;
5. Save the ABI as JSON in the output folder (one for each output contract);
6. Generate the wasm crates for all output contracts (all sources generated, Cargo.toml contents copied from the main wasm crate);
7. Build all wasm crates;
8. Copy binaries from the `target` folder(s) to `output`.
9. Perform post-processing for each contract: `wasm-opt`, `wasm2wat`, imports;

Luckily, the framework can do all of this automatically, with a single click.
