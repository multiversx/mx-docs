---
id: overview
title: Developers - Overview
---

[comment]: # (mx-abstract)

This page serves as the landing destination for builders seeking to construct on the Multiversx platform.

If anything is missing, or you want to get more support, please refer to Discord or Telegram developers chats: 
- [Discord: MultiversX Builders](https://discord.gg/multiversxbuilders)
- [Telegram: MultiversX Developers](https://t.me/MultiversXDevelopers)

[comment]: # (mx-context-auto)

## Developer documentation

Get started with MultiversX by learning to write your first Smart Contract, build your first dApp or learn how to use our
API.

:::important
For interacting with MultiversX Blockchain via SDKs or Rest API, please refer to [SDKs & Tools](/sdk-and-tools/overview).
:::

[comment]: # (mx-context-auto)

## Table of contents
A list with everything that you can explore as a developer on MultiversX.

[comment]: # (mx-context-auto)

### Tutorials

Below is a list of tutorials for building on MultiversX:

| Name                                                                                | Description                                                      |
|-------------------------------------------------------------------------------------|------------------------------------------------------------------|
| [Build your first dApp in 15 minutes](/developers/tutorials/your-first-dapp)        | Video + written tutorial on how to create your first dApp.       |
| [Build a microservice for your dApp](/developers/tutorials/your-first-microservice) | Video + written tutorial on how to create your microservice.     |
| [Crowdfunding Smart Contract](/developers/tutorials/crowdfunding-p1)                | Crowdfunding tutorial (Part 1).                                  |
| [Crowdfunding Smart Contract](/developers/tutorials/crowdfunding-p2)                | Crowdfunding tutorial (Part 2).                                  |
| [The Counter Smart Contract](/developers/tutorials/counter)                         | The Counter SC tutorial.                                         |
| [Staking contract Tutorial](/developers/tutorials/staking-contract)                 | Step by step tutorial on how to create a Staking Smart Contract. |
| [WalletConnect 2.0 Migration](/developers/tutorials/wallet-connect-v2-migration)    | WalletConnect 2.0 Migration Guide                                |

[comment]: # (mx-context-auto)

### SDKs and Tools

One can (programatically) interact with the MultiversX Network by leveraging a set of **SDKs (TypeScript, Go, Python, C++ etc.), tools and APIs**. For more details, please follow:

| Name                                                              | Description                                                                     |
|-------------------------------------------------------------------|---------------------------------------------------------------------------------|
| [SDKs and Tools - Overview](/sdk-and-tools/overview)             | The complete list of SDKs, tools and APIs.                                      |

[comment]: # (mx-context-auto)

### Signing transactions

The following content explains the structure of a transaction, how to sign or send them:

| Name                                                                                 | Description                                             |
|--------------------------------------------------------------------------------------|---------------------------------------------------------|
| [Signing transactions](/developers/signing-transactions)                             | How to serialize and sign transactions.                 |
| [Tools for signing](/developers/signing-transactions/tools-for-signing)              | What to use in order to generate and sign transactions. |
| [Signing programmatically](/developers/signing-transactions/signing-programmatically) | How to sign transactions by using one of our SDKs.      |

[comment]: # (mx-context-auto)

### Gas and fees

Learn about transaction's gas and how a fee is calculated:

| Name                                                                                      | Description                                                               |
|-------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|
| [Overview](/developers/gas-and-fees/overview)                                             | General concepts and overview about gas cost, limit, price and fee.       |
| [For move-balance transfers](/developers/gas-and-fees/egld-transfers)                     | How fees are computed for move-balance transfers (EGLD transfers).        |
| [For System Smart Contracts](/developers/gas-and-fees/system-smart-contracts)             | How fees are computed when interacting with system smart contracts.       |
| [For User defined Smart Contracts](/developers/gas-and-fees/user-defined-smart-contracts) | How fees are computed when interacting with user defined smart contracts. |

[comment]: # (mx-context-auto)

### Smart Contract Developer reference

| Name                                                                                                                     | Description                                                                                     |
|--------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------|
| [How to format the data field for Smart Contract calls](/developers/sc-calls-format)                                     | Learn how a Smart Contract call looks like and how arguments should be encoded.                 |
| [MultiversX serialization format](/developers/data/serialization-overview)                                               | How MultiversX smart contracts serialize arguments, results, and storage.                       |
| [MultiversX SC annotations](/developers/developer-reference/sc-annotations)                                              | How to use annotations in your contracts to make use of many built-in features from the framework. |
| [MultiversX SC modules](/developers/developer-reference/sc-modules)                                                      | Learn how to divide a Smart Contract into multiples smaller components by using modules.        |
| [MultiversX SC contract calls](/developers/developer-reference/sc-contract-calls)                                        | Learn how to call a Smart Contract from another Smart Contract.                                 |
| [Code metadata](/developers/data/code-metadata)                                                                          | Choose the properties / eligible actions of your Smart Contract.                                |
| [Upgrading smart contracts](/developers/developer-reference/upgrading-smart-contracts)                                   | The implications of upgrading a Smart Contract.                                                 |
| [MultiversX SC api functions](/developers/developer-reference/sc-api-functions)                                          | Make use of the MultiversX VM API functions to query relevant data from the blockchain.         |
| [Storage mappers](/developers/developer-reference/storage-mappers)                                                       | Decide from multiple ways of storing data in your SC, by considering performance.               |
| [Rust testing framework](/developers/developer-reference/rust-testing-framework)                                         | Test your Smart Contract directly in Rust.                                                      |
| [Rust testing framework functions reference](/developers/developer-reference/rust-testing-framework-functions-reference) | A list of available functions to be used when testing your Smart Contract in Rust.              |
| [Rust smart contract debugging](/developers/developer-reference/sc-debugging)                                            | How to debug your Smart Contract.                                                               |
| [Rust smart contract build reference](/developers/meta/sc-build-reference)                                               | How to build and organize your Smart Contract.                                                  |
| [Random numbers in smart contracts](/developers/developer-reference/sc-random-numbers)                                   | How to generate random number in Smart Contracts.                                               |

[comment]: # (mx-context-auto)

### Smart Contract Developers Best Practices

| Name                                                                                        | Description                                        |
|---------------------------------------------------------------------------------------------|----------------------------------------------------|
| [Best practices basics](/developers/best-practices/best-practices-basics)                   | How to better structure your Smart Contract code.  |
| [Biguint operations](/developers/best-practices/biguint-operations)                         | Handle Biguint operations in a more efficient way. |
| [The dynamic allocation problem](/developers/best-practices/the-dynamic-allocation-problem) | Description of the dynamic allocation problem.     |
| [Multi values](/developers/best-practices/multi-values)                                     | Take advantage of the variadic input and output.   |

[comment]: # (mx-context-auto)

### Scenarios Reference

| Name                                                                 | Description                                              |
|----------------------------------------------------------------------|----------------------------------------------------------|
| [Scenario Overview](/developers/scenario-reference/overview)             | Test your Smart Contracts by using Scenario JSON tests. |
| [Scenario Structure](/developers/scenario-reference/structure)           | How to structure a scenario.                          |
| [Scenario Simple Values](/developers/scenario-reference/values-simple)   | Handle simple values in scenario tests.                    |
| [Scenario Complex Values](/developers/scenario-reference/values-complex) | Handle complex values in scenario tests.                   |
| [Embedding Scenario code in GO](/developers/scenario-reference/embed)    | How to embed scenario code in Go.                          |

[comment]: # (mx-context-auto)

### Event logs

Event logs are special events generated by smart contracts, built-in functions, or ESDT operations. They provide a way to record important information about
the execution of smart contract, information about ESDT transfers or built-in function calls.

#### Event structure

| Field      | Type     | Description                                       |
|------------|----------|---------------------------------------------------|
| identifier | string   | The identifier for the event.                     |
| address    | string   | The associated address.                           |
| topics     | []string | An array containing information about the event.  |
| data       | string   | Additional data related to the event.             |


#### Event logs can be categorized into the following types:

| Name                                                                          | Description                                                                                                                                                                                                         |
|-------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [ESDT Operations Events](/developers/log-events/esdt-events)                  | ESDT operations, which encompass token creation, transfers, and other critical actions, generate log events. These events record sender and receiver addresses, token amounts, and operation types.                 |
| [Execution Events](/developers/log-events/execution-events)                   | Execution events are dedicated to recording the status of transaction execution. They indicate whether a transaction was successfully executed or encountered an error.                                             |
| [Smart Contract Call Events](/developers/log-events/contract-call-events)     | Smart contract calls often emit log events to report their execution status and results. These events typically include information such as the caller's address, the called function, and any other relevant data. |
| [Smart Contract Deploy Events](/developers/log-events/contract-deploy-events) | Smart contract deployment and upgrade events are used to record when a smart contract is initially deployed or when it undergoes an upgrade.                                                                        |
| [System Delegation Events](/developers/log-events/system-delegation-events)   | System delegation events are generated in response to interactions with the system delegation contract.                                                                                                             |




### Others

| Name                                                                     | Description                                                                            |
|--------------------------------------------------------------------------|----------------------------------------------------------------------------------------|
| [Constants](/developers/constants)                                       | A list of useful constants that governs the MultiversX Mainnet.                        |
| [Built in functions](/developers/built-in-functions)                     | Built-in functions - protocol-side functions.                                          |
| [Account storage](/developers/account-storage)                           | How the data is stored under an account + how to query and change it.                  |
| [Relayed/meta transactions](/developers/relayed-transactions)            | How to prepare transactions whose fee is not paid by the user, but by a relayer.       |
| [Setup local testnet](/developers/setup-local-testnet)                   | How to set up a localnet (local testnet) - basic solution                              |
| [Setup local testnet advanced](/developers/setup-local-testnet-advanced) | How to set up a localnet (local testnet) - advanced solution                           |
| [Creating wallets](/developers/creating-wallets)                         | Examples on creating wallets.                                                          |
| [Reproducible builds](/developers/reproducible-contract-builds)          | How to perform reproducible contract builds.                                           |
| [Contract API limits](/developers/contract-api-limits)                   | Limits that a smart contract must abide when calling external (node-related) functions | 
