---
id: overview
title: SDKs and Tools - Overview
---

[comment]: # (mx-abstract)

## Introduction

One can (programmatically) interact with the MultiversX Network by leveraging the following SDKs, tools and APIs:

[comment]: # (mx-context-auto)

### sdk-rs - Rust SDK

:::important
Note that Rust is also the recommended programming language for writing Smart Contracts on MultiversX. That is, Rust can be used to write both _on-chain software_ (Smart Contracts) and _off-chain software_ (e.g. desktop applications, web applications, microservices). For the on-chain part, please follow [Smart Contracts](/developers/smart-contracts). Here, we refer to the off-chain part.
:::

| Name                                                                                      | Description                                                                                                                                                                                                                                                                     |
| ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sdk-rs](https://github.com/multiversx/mx-sdk-rs)                                         | Rust SDK used to interact with the MultiversX Blockchain. <br /> This is the parent repository, also home to the Rust Framework for Smart Contracts.                                                                                                                            |
| [sdk-rs/core](https://github.com/multiversx/mx-sdk-rs/tree/master/sdk/core)               | Core components, accompanied by a set of usage examples.                                                                                                                                                                                                                        |
| [sdk-rs/snippets](https://github.com/multiversx/mx-sdk-rs/tree/master/framework/snippets) | Smart Contract interaction snippets - base components. Examples of usage: [adder](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples/adder/interact), [multisig](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples/multisig/interact). |

[comment]: # (mx-context-auto)

### sdk-js - Javascript SDK

| Name                                                                                                     | Description                                         |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| [sdk-js](/sdk-and-tools/sdk-js)                                                                          | High level overview about sdk-js.                   |
| [sdk-js cookbook](/sdk-and-tools/sdk-js/sdk-js-cookbook-v13)                                             | Learn how to handle common tasks by using sdk-js.   |
| [Extending sdk-js](/sdk-and-tools/sdk-js/extending-sdk-js)                                               | How to extend and tailor certain modules of sdk-js. |
| [Writing and testing sdk-js interactions](/sdk-and-tools/sdk-js/writing-and-testing-sdk-js-interactions) | Write sdk-js interactions for Visual Studio Code    |
| [sdk-js migration guides](/sdk-and-tools/sdk-js/sdk-js-migration-guides)                                 | Migrate from sdk-js v9.x to v10+                    |
| [sdk-js signing providers](/sdk-and-tools/sdk-js/sdk-js-signing-providers)                               | Integrate sdk-js signing providers.                 |

In addition to sdk-js, one could use the following Javascript library for performing wallet operations via CLI:

| Name                                                  | Description                                                  |
| ----------------------------------------------------- | ------------------------------------------------------------ |
| [sdk-js-wallet-cli](/sdk-and-tools/sdk-js-wallet-cli) | Lightweight CLI wrapper used to perform wallet interactions. |

You might also want to have a look over [**xSuite**](https://xsuite.dev), a toolkit to init, build, test, deploy contracts using JavaScript, made by the [Arda team](https://arda.run).

[comment]: # (mx-context-auto)

### sdk-dapp - core functional logic of a dApp

| Name                                | Description                                                                                                                                                                                                                             |
| ----------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [sdk-dapp](/sdk-and-tools/sdk-dapp) | React library aimed to help developers create dApps based on MultiversX Network. <br/> <br/> It abstracts away all the boilerplate for logging in, signing transactions or messages, and also offers helper functions for common tasks. |

[comment]: # (mx-context-auto)

### sdk-py - Python SDK

| Name                                                         | Description                                                                                                                                            |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [sdk-py](/sdk-and-tools/sdk-py/#sdk-py-the-python-libraries) | Python SDK that can be used to create wallets, create and send transactions, interact with Smart Contracts and with the MultiversX Network in general. |

[comment]: # (mx-context-auto)

### mxpy - Python SDK (CLI)

| Name                                                                             | Description                               |
| -------------------------------------------------------------------------------- | ----------------------------------------- |
| [mxpy](/sdk-and-tools/sdk-py/)                                                   | High level overview about mxpy.           |
| [Installing mxpy](/sdk-and-tools/sdk-py/installing-mxpy)                         | How to install and get started with mxpy. |
| [mxpy cli](/sdk-and-tools/sdk-py/mxpy-cli)                                       | How to use the Command Line Interface.    |
| [Smart contract interactions](/sdk-and-tools/sdk-py/smart-contract-interactions) | Interact with Smart Contract.             |

[comment]: # (mx-context-auto)

### sdk-nestjs - NestJS SDK

| Name                                    | Description                                                        |
| --------------------------------------- | ------------------------------------------------------------------ |
| [sdk-nestjs](/sdk-and-tools/sdk-nestjs) | NestJS SDK commonly used in the MultiversX Microservice ecosystem. |

[comment]: # (mx-context-auto)

### mx-sdk-go - Golang SDK

| Name                            | Description                                                    |
| ------------------------------- | -------------------------------------------------------------- |
| [sdk-go](/sdk-and-tools/sdk-go) | Go/Golang SDK used to interact with the MultiversX Blockchain. |

[comment]: # (mx-context-auto)

### mx-sdk-java - Java SDK

| Name                            | Description                                               |
| ------------------------------- | --------------------------------------------------------- |
| [mxjava](/sdk-and-tools/mxjava) | Java SDK used to interact with the MultiversX Blockchain. |

[comment]: # (mx-context-auto)

### erdcpp - C++ SDK

| Name                            | Description                                              |
| ------------------------------- | -------------------------------------------------------- |
| [erdcpp](/sdk-and-tools/erdcpp) | C++ SDK used to interact with the MultiversX Blockchain. |

[comment]: # (mx-context-auto)

### erdkotlin - Kotlin SDK

| Name                                  | Description                                                 |
| ------------------------------------- | ----------------------------------------------------------- |
| [erdkotlin](/sdk-and-tools/erdkotlin) | Kotlin SDK used to interact with the MultiversX Blockchain. |

[comment]: # (mx-context-auto)

### nesdtjs-sdk - NestJS SDK

| Name                                    | Description                                                 |
| --------------------------------------- | ----------------------------------------------------------- |
| [sdk-nestjs](/sdk-and-tools/sdk-nestjs) | NestJS SDK used to interact with the MultiversX Blockchain. |

[comment]: # (mx-context-auto)

### Node Rest API

| Name                                                                     | Description                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| [Rest API](/sdk-and-tools/rest-api/)                                     | High level overview over the MultiversX's Rest API.               |
| [api.multiversx.com](/sdk-and-tools/rest-api/multiversx-api)             | MultiversX's main API instance.                                   |
| [Gateway overview](/sdk-and-tools/rest-api/gateway-overview)             | Gateway overview - public proxy instance.                         |
| [Addresses](/sdk-and-tools/rest-api/addresses)                           | Rest API endpoints dedicated to addresses.                        |
| [Transactions](/sdk-and-tools/rest-api/transactions)                     | Rest API endpoints dedicated to transactions.                     |
| [Network](/sdk-and-tools/rest-api/network)                               | Rest API endpoints dedicated to network status and configuration. |
| [Nodes](/sdk-and-tools/rest-api/nodes)                                   | Rest API endpoints dedicated to nodes.                            |
| [Blocks](/sdk-and-tools/rest-api/blocks)                                 | Rest API endpoints dedicated to blocks.                           |
| [Virtual machine](/sdk-and-tools/rest-api/virtual-machine)               | Rest API endpoints dedicated to the SC execution VM.              |
| [Versions and changelog](/sdk-and-tools/rest-api/versions-and-changelog) | What's new in different versions.                                 |

[comment]: # (mx-context-auto)

### Proxy

Proxy is an abstraction layer over the MultiversX Network's sharding. It routes the API request to the desired shard and
merges results when needed.

| Name                                     | Description                                          |
| ---------------------------------------- | ---------------------------------------------------- |
| [MultiversX Proxy](/sdk-and-tools/proxy) | A Rest API requests handler that abstracts sharding. |

[comment]: # (mx-context-auto)

### Elasticsearch

MultiversX Network uses Elasticsearch to index historical data. Find out more about how it can be configured.

| Name                                           | Description                                                                 |
| ---------------------------------------------- | --------------------------------------------------------------------------- |
| [Elasticsearch](/sdk-and-tools/elastic-search) | Make use of Elasticsearch near your nodes in order to keep historical data. |

[comment]: # (mx-context-auto)

### Events notifier

Events notifier is an external service that can be used to fetch block events and push them to subscribers.

| Name                                       | Description                          |
| ------------------------------------------ | ------------------------------------ |
| [Events notifier](/sdk-and-tools/notifier) | A notifier service for block events. |

[comment]: # (mx-context-auto)

### Chain simulator

Chain simulator is designed to replicate the behavior of a local testnet.
It can also be pre-initialized / initialized with blockchain state from other networks, such as mainnet or something similar.

| Name                                              | Description                  |
| ------------------------------------------------- | ---------------------------- |
| [Chain simulator](/sdk-and-tools/chain-simulator) | A service for local testing. |

[comment]: # (mx-context-auto)

### Devcontainers (for VSCode or GitHub Codespaces)

| Name                                          | Description                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| [Devcontainers](/sdk-and-tools/devcontainers) | Overview of MultiversX devcontainers (for VSCode or GitHub Codespaces). |
