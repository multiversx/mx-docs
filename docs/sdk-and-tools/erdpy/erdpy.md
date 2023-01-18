---
id: erdpy
title: erdpy
---

erdpy CLI and Python SDK

**erdpy** (the CLI tool) can be found here: [mx-sdk-erdpy](https://github.com/multiversx/mx-sdk-erdpy). It targets a broad audience of **users** and **developers**, as depicted below:

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

**erdpy** libraries:

| Package                                                                       | Description                                                                    |
|-------------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| [erdpy_core](https://github.com/multiversx/mx-sdk-erdpy-core)                 | Basic components for interacting with the blockchain and with smart contracts. |
| [erdpy_wallet](https://github.com/multiversx/mx-sdk-erdpy-wallet)             | Core wallet components (generation, signing).                                  |
| [erdpy_network](https://github.com/multiversx/mx-sdk-erdpy-network-providers) | Network providers (API, Gateway).                                              |
