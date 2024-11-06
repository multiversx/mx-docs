---
id: sc-meta
title: Tooling Overview
---

[comment]: # (mx-abstract)

## Introduction

We have developed a universal smart contract management tool, called `multiversx-sc-meta` (`sc-meta` in short).

It is called that, because it provides a layer of meta-programming over the regular smart contract development. It can read and interact with some of the code written by developers.

You can find it on [crates.io](https://crates.io/crates/multiversx-sc-meta) [![crates.io](https://img.shields.io/crates/v/multiversx-sc-meta.svg?style=flat)](https://crates.io/crates/multiversx-sc-meta)

To install it, simply call

```
cargo install multiversx-sc-meta --locked
```

After that, try calling `sc-meta help` or `sc-meta -h` to see the CLI docs.

:::note endure dependencies
Ubuntu users have to ensure the existence of the `build_essential` package installed in their system.
:::

[comment]: # (mx-context-auto)

## Standalone tool vs. contract tool

The unusual thing about this tool is that it comes in two flavors. One of them is the standalone tool, installed as above. The other is a tool that gets provided specifically for every contract, and which helps with building.

The contract tool lies in the `meta` folder under each contract. It just contains these 3 lines of code:

```rust
fn main() {
    multiversx_sc_meta::cli_main::<my_contract_crate::AbiProvider>();
}
```

... but they are important, because they link the contract tool to the contract code, via the [ABI](/developers/data/abi).

The contract tool is required in order to build contracts, because it is the only tool that we have that calls the ABI generator, manages the wasm crate and the multi-contract config, and has the data on how to build the contract.

Therefore, all the functionality that needs the ABI goes into the contract tool, whereas the rest in the standalone tool.

To see the contract meta CLI docs, `cd` into the `/meta` crate and call `cargo run help` or `cargo run -- -h`.

[comment]: # (mx-context-auto)

## Contract functionality

Currently the contract functionality is:
  - `abi`       Generates the contract ABI and nothing else.
  - `build`     Builds contract(s) for deploy on the blockchain.
  - `build-dbg` Builds contract(s) with symbols and WAT.
  - `twiggy`    Builds contract(s) and generate twiggy reports.
  - `clean`     Clean the Rust project and the output folder.
  - `update`    Update the Cargo.lock files in all wasm crates.
  - `snippets`  Generates a snippets project, based on the contract ABI.

To learn more about the smart contract ABI and ABI-based individual contract tools, see [the CLI reference](/developers/meta/sc-meta-cli).

[comment]: # (mx-context-auto)

## Standalone functionality

The standalone functionality is:
  - `info`        General info about the contract an libraries residing in the targeted directory.
  - `all`         Calls the meta crates for all contracts under given path with the given arguments.
  - `new`         Creates a new smart contract from a template.
  - `templates`   Lists the available templates.
  - `upgrade`     Upgrades a contract to the latest version. Multiple contract crates are allowed.
  - `local-deps`  Generates a report on the local dependencies of contract crates. Will explore indirect dependencies too.

All the standalone tools take an optional `--path` argument. if not provided, it will be the current directory.

