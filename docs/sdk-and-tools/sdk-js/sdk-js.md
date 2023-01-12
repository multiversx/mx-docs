---
id: sdk-js
title: sdk-js
---

MultiversX SDK for TypeScript and JavaScript

**JS SDKs** consists of TypeScript / JavaScript helpers and utilities for interacting with the Blockchain (in general) and with Smart Contracts (in particular).

| Package                                                                                  | Source code                                                         | Description                                                                    |
|------------------------------------------------------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------|
| [sdk-core](https://www.npmjs.com/package/@multiversx/sdk-core)                           | [Github](https://github.com/multiversx/mx-sdk-js-core)              | Basic components for interacting with the blockchain and with smart contracts. |
| [sdk-wallet](https://www.npmjs.com/package/@multiversx/sdk-wallet)                       | [Github](https://github.com/multiversx/mx-sdk-js-wallet)            | Core wallet components (generation, signing).                                  |
| sdk-contract-wrappers                                                                    | [Github](https://github.com/multiversx/mx-sdk-js-contract-wrappers) | Smart Contract wrappers, based on sdk-js. NodeJS repl-friendly.                |
| [sdk-network-providers](https://www.npmjs.com/package/@multiversx/sdk-network-providers) | [Github](https://github.com/multiversx/mx-sdk-js-network-providers) | Network Provider (API, Gateway) components (compatible with sdk-js).           |
| [sdk-exchange](https://www.npmjs.com/package/@multiversx/sdk-exchange)                   | [Github](https://github.com/multiversx/mx-sdk-js-exchange)          | Utilities modules for xExchange interactions.                                  |

Signing providers for dApps:

| Package                                                                                          | Source code                                                               | Description                                                                                   |
|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [sdk-dapp](https://www.npmjs.com/package/@multiversx/sdk-dapp)                                   | [Github](https://github.com/multiversx/mx-sdk-dapp)                       | A library that holds the core functional & signing logic of a dapp on the MultiversX Network. |
| [sdk-hw-provider](https://www.npmjs.com/package/@multiversx/sdk-hw-provider)                     | [Github](https://github.com/multiversx/mx-sdk-js-hw-provider)             | Sign using the hardware wallet (Ledger).                                                      |
| [sdk-web-wallet-provider](https://www.npmjs.com/package/@multiversx/sdk-web-wallet-provider)     | [Github](https://github.com/multiversx/mx-sdk-js-web-wallet-provider)     | Sign using the MultiversX web wallet.                                                         |
| [sdk-wallet-connect-provider](https://www.npmjs.com/package/@multiversx/sdk-web-wallet-provider) | [Github](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider) | Sign using Wallet Connect.                                                                    |
| [sdk-extension-provider](https://www.npmjs.com/package/@multiversx/sdk-extension-provider)       | [Github](https://github.com/multiversx/mx-sdk-js-extension-provider)      | Sign using the Maiar DeFi Wallet (browser extension).                                         |

:::important
For all purposes, **we recommend using [sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
:::

For more details about integrating a signing provider into your dApp, please follow [this guide](/sdk-and-tools/sdk-js/sdk-js-signing-providers) or the [mx-sdk-js-examples repository](https://github.com/multiversx/mx-sdk-js-examples).

Additional utility packages:

| Package                                                                                  | Source code                                                        | Description                                            |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------|
| [transaction-decoder](https://www.npmjs.com/package/@multiversx/sdk-transaction-decoder) | [Github](https://github.com/multiversx/mx-sdk-transaction-decoder) | Decodes transaction metadata from a given transaction. |
