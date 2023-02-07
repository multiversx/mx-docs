---
id: sc-meta
title: Smart Contract Developer Tooling
---

## Introduction

We have developed a universal smart contract management tool, called `multiversx-sc-meta` (`sc-meta` in short).

It is called that, because it provides a layer of meta-programming over the regular smart contract development. It can read and interact with some of the code written by developers.

You can find it on [crates.io](https://crates.io/crates/multiversx-sc-meta) [![crates.io](https://img.shields.io/crates/v/multiversx-sc-meta.svg?style=flat)](https://crates.io/crates/multiversx-sc-meta)

To install it, simply call

```
cargo install multiversx-sc-meta
```

After that, try calling `sc-meta help` or `sc-meta -h` to see the CLI docs.


## Standalone tool vs. contract tool

The unusual thing about this tool is that it comes in two flavors. One of them is the standalone tool, installed as above. The other is a tool that gets provided specifically for every contract, and which helps with building.

The contract tool lies in the `meta` folder under each contract. It just contains these 3 lines of code:

```rust
fn main() {
    multiversx_sc_meta::cli_main::<my_contract_crate::AbiProvider>();
}
```

... but they are important, because they link the contract tool to the contract code, via the ABI.

The contract tool is required in order to build contracts, because it is the only tool that we have that calls the ABI generator, manages the wasm crate and the multi-contract config, and has the data on how to build the contract.

Therefore, all the functionality that needs the ABI goes into the contract tool, whereas the rest in the standalone tool.

To see the contract meta CLI docs, `cd` into the `/meta` crate and call `cargo run help` or `cargo run -- -h`.


## Contract functionality

Currently the contract functionality is:
  - `abi`       Generates the contract ABI and nothing else.
  - `build`     Builds contract(s) for deploy on the blockchain.
  - `build-dbg` Builds contract(s) with symbols and WAT.
  - `twiggy`    Builds contract(s) and generate twiggy reports.
  - `clean`     Clean the Rust project and the output folder.
  - `update`    Update the Cargo.lock files in all wasm crates.
  - `snippets`  Generates a snippets project, based on the contract ABI.

To learn more about building contracts, see the [the build reference](/developers/developer-reference/sc-build-reference).

The `snippets` documentation is still under construction, it will follow soon.


## Standalone functionality

The standalone functionality is:
  - `info`        General info about the contract an libraries residing in the targetted directory.
  - `all`         Calls the meta crates for all contracts under given path with the given arguments.
  - `upgrade`     Upgrades a contract to the latest version. Multiple contract crates are allowed.
  - `local-deps`  Generates a report on the local depedencies of contract crates. Will explore indirect depdencies too.

All the standalone tools take an optional `--path` argument. if not provided, it will be the current directory.


### The `all` command

There is a special feature that needs additional explanation: the `sc-meta all ...` command.

It is the bridge between the standalone tool and the contract tools. What the `all` comman does is simply to find all contracts in a given folder and call the contract tool for each of them with the given arguments.

For example:
- `sc-meta all abi` will generate the ABIs for all contracts;
- `sc-meta all build --locked` will build all contracts, with the crate versions given by Cargo.lock;
- `sc-meta all clean` will clean all projects;
- etc.

You can even call `sc-meta all help` and see that the CLI docs are almost the same as those of the individual contract tool.

A related command is the `info` command, which just prints a tree with all the contract and contract libraries in a folder, without doing anything to them.

### The contract upgrade tool

Calling `sc-meta upgrade` will try to automatically upgrade a contract or group of contracts to the latest version.

The oldest version currently supported is `0.28.0`. Any older than that, and the developer will need to upgrade it by hand to `0.28.0`.

It is especially important when upgrading from `0.38` to `0.39.0`, since a lot of changes happened at that point.

:::tip
For projects with multiple contract crates, we recommend upgrading all of them at once. The upgrade algorithm goes step by step, version after version. For some of the major versions, it also checks that the project compiles before moving on. This is to give developers the chance to fix issues manually, if necessary, and not have those issues pile up. If there are local depdencies between contracts, the upgrader will not be able to do the check unless all of them are upgraded together.
:::

### Local depdendencies

Calling `sc-meta local-deps` will create in each contract a report of the local dependencies between contracts and libraries. This helps with the reproducible builds, but might be extended in the future for other uses.

Example output (abridged):
```json
{
    "root": "/home/user/multiversx/mx-exchange-sc/",
    "contractPath": "/home/user/multiversx/mx-exchange-sc/dex/pair",
    "commonDependencyPath": "/home/user/multiversx/mx-exchange-sc",
    "dependencies": [
        {
            "path": "common/common_errors",
            "depth": 1
        },
        {
            "path": "common/common_structs",
            "depth": 1
        },
        {
            "path": "common/modules/legacy_token_decode_module",
            "depth": 3
        },
        {
            "path": "common/modules/locking_module",
            "depth": 2
        },
        {
            "path": "common/modules/math",
            "depth": 2
        }
    ]
}
```
