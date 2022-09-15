---
id: overview
title: Developers - Overview
---

## Developer documentation

Get started with Elrond by learning to write your first Smart Contract, build your first dApp or learn how to use our
API.

:::important
For interacting with Elrond Blockchain via SDKs or Rest API, please refer to [SDKs & Tools](/sdk-and-tools/overview).
:::

## Table of contents

### Tutorials

Below is a list of tutorials that one can you to get a full experience of building on Elrond

| Name                                                                                | Description                                                       |
|-------------------------------------------------------------------------------------|-------------------------------------------------------------------|
| [Build your first dApp in 15 minutes](/developers/tutorials/your-first-dapp)        | Video + written tutorial on how to create your first dApp.        |
| [Build a microservice for your dApp](/developers/tutorials/your-first-microservice) | Video + written tutorial on how to create your microservice.      |
| [Crowdfunding Smart Contract](/developers/tutorials/crowdfunding-p1)                | Crowdfunding tutorial (Part 1).                                   |
| [Crowdfunding Smart Contract](/developers/tutorials/crowdfunding-p2)                | Crowdfunding tutorial (Part 2).                                   |
| [The Counter Smart Contract](/developers/tutorials/counter)                         | The Counter SC tutorial.                                          |
| [Custom Wallet Connect](/developers/tutorials/custom-wallet-connect)                | Custom Wallet Connect tutorial.                                   |
| [Staking contract Tutorial](/developers/tutorials/staking-contract)                 | Step by step tutorial on how to create a Staking Smart Contract.  | 

### Signing transactions

The following content explain the structure of a transaction, how to sign or send them

| Name                                                                                      | Description                                             |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------|
| [Signing transactions](/developers/signing-transactions/signing-transactions)             | How to serialize and sign transactions.                 |
| [Tools for signing](/developers/signing-transactions/tools-for-signing)                   | What to use in order to generate and sign transactions. |
| [Signing programatically](/developers/signing-transactions/signing-programmatically)      | How to sign transactions by using one of our SDKs.      |

### Gas and fees

Learn about transaction's gas and how a fee is calculated

| Name                                                                                      | Description                                                               |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [Overview](/developers/gas-and-fees/overview)                                             | General concepts and overview about gas cost, limit, price and fee.       |
| [For move-balance transfers](/developers/gas-and-fees/egld-transfers)                     | How fees are computed for move-balance transfers (EGLD transfers).        |
| [For System Smart Contracts](/developers/gas-and-fees/system-smart-contracts)             | How fees are computed when interacting with system smart contracts.       |
| [For User defined Smart Contracts](/developers/gas-and-fees/user-defined-smart-contracts) | How fees are computed when interacting with user defined smart contracts. |

### Smart Contract Developer reference

| Name                                                                                                                     | Description                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| [Elrond serialization format](/developers/developer-reference/elrond-serialization-format)                               | How Elrond smart contracts serialize arguments, results, and storage.                           |
| [Elrond wasm annotations](/developers/developer-reference/elrond-wasm-annotations)                                       | How to use annotations your contracts to make use of many built-in features from the framework. |
| [Elrond wasm modules](/developers/developer-reference/elrond-wasm-modules)                                               | Learn how to divide a Smart Contract into multiples smaller components by using modules.        |
| [Elrond wasm contract calls](/developers/developer-reference/elrond-wasm-contract-calls)                                 | Learn how to call a Smart Contract from another Smart Contract.                                 |
| [Smart contract developer best practices](/developers/developer-reference/smart-contract-developer-best-practices)       | Few tips on how to write clean and efficient contracts on Elrond.                               |
| [Code metadata](/developers/developer-reference/code-metadata)                                                           | Choose the properties / eligible actions of your Smart Contract.                                |
| [Elrond wasm api functions](/developers/developer-reference/elrond-wasm-api-functions)                                   | Make use of the Elrond VM API functions to query relevant data from the blockchain.             |
| [Storage mappers](/developers/developer-reference/storage-mappers)                                                       | Decide from multiple ways of storing data in your SC, by considering performance.               |
| [Rust testing framework](/developers/developer-reference/rust-testing-framework)                                         | Test your Smart Contract directly in Rust.                                                      |
| [Rust testing framework functions reference](/developers/developer-reference/rust-testing-framework-functions-reference) | A list of available functions to be used when testing your Smart Contract in Rust.              |
| [Rust smart contract debugging](/developers/developer-reference/rust-smart-contract-debugging)                           | How to debug your Smart Contract.                                                               |
| [Random numbers in smart contracts](/developers/developer-reference/random-numbers-in-smart-contracts)                   | How to generate random number in Smart Contracts.                                               |

### Smart Contract Developers Best Practices

| Name                                                                                        | Description                                        |
|---------------------------------------------------------------------------------------------|----------------------------------------------------|
| [Best practices basics](/developers/best-practices/best-practices-basics)                   | How to better structure your Smart Contract code.  |
| [Biguint operations](/developers/best-practices/biguint-operations)                         | Handle Biguint operations in a more efficient way. |
| [The dynamic allocation problem](/developers/best-practices/the-dynamic-allocation-problem) | Description of the dynamic allocation problem.     |
| [Multi values](/developers/best-practices/multi-values)                                     | Take advantage of the variadic input and output.   |

### Mandos Tools Reference

| Name                                                                 | Description                                              |
|----------------------------------------------------------------------|----------------------------------------------------------|
| [Mandos Overview](/developers/mandos-reference/overview)             | Test your Smart Contracts by using JSON tests of Mandos. |
| [Mandos Structure](/developers/mandos-reference/structure)           | How to structure a Mandos test.                          |
| [Mandos Simple Values](/developers/mandos-reference/values-simple)   | Handle simple values in Mandos tests.                    |
| [Mandos Complex Values](/developers/mandos-reference/values-complex) | Handle complex values in Mandos tests.                   |
| [Embedding Mandos code in GO](/developers/mandos-reference/embed)    | How to embed Mandos code in Go.                          |

### Others

| Name                                                                     | Description                                                           |
|--------------------------------------------------------------------------|-----------------------------------------------------------------------|
| [Constants](/developers/constants)                                       | A list of useful constants that governs the Elrond Mainnet.           |
| [Built in functions](/developers/built-in-functions)                     | Built-in functions - protocol-side functions.                         |
| [Account storage](/developers/account-storage)                           | How the data is stored under an account + how to query and change it. |
| [Setup local testnet](/developers/setup-local-testnet)                   | How to set up a local testnet - basic solution                        |
| [Setup local testnet advanced](/developers/setup-local-testnet-advanced) | How to set up a local testnet - advanced solution                     |
| [Creating wallets](/developers/creating-wallets)                         | Examples on creating wallets.                                         |
| [Reproducible builds](/developers/reproducible-contract-builds)          | How to perform reproducible contract builds.                          |
