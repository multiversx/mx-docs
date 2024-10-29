---
id: sdk-py
title: sdk-py
---

[comment]: # (mx-abstract)

MultiversX SDK for Python

This SDK consists of a CLI tool, namely `mxpy`, and Python helpers and utilities for interacting with the Blockchain (in general) and with Smart Contracts (in particular).

[comment]: # (mx-context-auto)

## `mxpy`: the CLI tool

**mxpy** (the CLI tool) can be found here: [mx-sdk-py-cli](https://github.com/multiversx/mx-sdk-py-cli). It targets a broad audience of **users** and **developers**, as depicted below:

| Feature                                                                                        | Audience                                                            |
|------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| Compile Smart Contracts (Rust, C, C++) to WASM                                                 | Smart Contract developers                                           |
| Deploy, execute (call), query Smart Contracts                                                  | Smart Contract developers, application developers, tech enthusiasts |
| Run scenarios (JSON tests) against Smart Contracts                                             | Smart Contract developers                                           |
| Sign & send [System Smart Contract transactions](/validators/staking/staking-smart-contract)   | Validator owners                                                    |
| Sign & send regular transactions                                                               | Application developers, tech enthusiasts                            |
| Query Network status, transactions status / details                                            | Application developers, tech enthusiasts                            |
| Query account details                                                                          | Application developers, tech enthusiasts                            |
| Generate PEM files, recover private key from mnemonic                                          | Tech enthusiasts                                                    |
| Miscellaneous support features (e.g. bech32 conversion)                                        | Tech enthusiasts                                                    |

[comment]: # (mx-context-auto)

## `sdk-py`: the Python library

:::note
The `multiversx-sdk` package is a unification of the previous packages (multiversx-sdk-core, multiversx-sdk-wallet and multiversx-sdk-network-providers). This is the package that **should** be used from now on. All the upcoming updates will come only to this package. The older packages will no longer receive updates and will soon be deprecated.
:::

| Package                                                                                     | Source code                                                               | Description                                                                                   |
|---------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [multiversx-sdk](https://pypi.org/project/multiversx-sdk)                           | [mx-sdk-py](https://github.com/multiversx/mx-sdk-py)            | The all in one Python SDK for interacting with MultiversX. |
