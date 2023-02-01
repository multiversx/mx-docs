---
id: sdk-py
title: sdk-py
---

MultiversX SDK for Python

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

**sdk-py** libraries:

| Package                                                                                     | Source code                                                               | Description                                                                                   |
|---------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [multiversx-sdk-core](https://pypi.org/project/multiversx-sdk-core)                           | [mx-sdk-py-core](https://github.com/multiversx/mx-sdk-py-core)            | Basic components for interacting with the blockchain and with smart contracts. |
| [multiversx-sdk-wallet](https://pypi.org/project/multiversx-sdk-wallet)                       | [mx-sdk-py-wallet](https://github.com/multiversx/mx-sdk-py-wallet)                       | Core wallet components (generation, signing). |
| [multiversx-sdk-network-providers](https://pypi.org/project/multiversx-sdk-network-providers) | [mx-sdk-py-network-providers](https://github.com/multiversx/mx-sdk-py-network-providers) | Network providers (API, Gateway). |
