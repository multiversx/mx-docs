---
id: erdjs
title: erdjs
---

MultiversX SDK for TypeScript and JavaScript

**erdjs** consists of TypeScript / JavaScript helpers and utilities for interacting with the Blockchain (in general) and with Smart Contracts (in particular).

| Package                                                                                         | Source code                                                            | Description                                                                    |
|-------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|--------------------------------------------------------------------------------|
| [erdjs](https://www.npmjs.com/package/@elrondnetwork/erdjs)                                     | [Github](https://github.com/multiversx/mx-sdk-erdjs)                   | Basic components for interacting with the blockchain and with smart contracts. |
| [erdjs-walletcore](https://www.npmjs.com/package/@elrondnetwork/erdjs-walletcore)               | [Github](https://github.com/multiversx/mx-sdk-erdjs-walletcore)        | Core wallet components (generation, signing).                                  |
| erdjs-contract-wrappers                                                                         | [Github](https://github.com/multiversx/mx-sdk-erdjs-contract-wrappers) | Smart Contract wrappers, based on erdjs. NodeJS repl-friendly.                 |
| [erdjs-network-providers](https://www.npmjs.com/package/@elrondnetwork/erdjs-network-providers) | [Github](https://github.com/multiversx/mx-sdk-erdjs-network-providers) | Network Provider (API, Gateway) components (compatible with erdjs).            |
| [erdjs-dex](https://www.npmjs.com/package/@elrondnetwork/erdjs-dex)                             | [Github](https://github.com/multiversx/mx-sdk-erdjs-dex)               | Utilities modules for Maiar Exchange interactions.                             |

Signing providers for dApps:

| Package                                                                                                     | Source code                                                                  | Description                                                                                   |
|-------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [dapp-core](https://www.npmjs.com/package/@elrondnetwork/dapp-core)                                         | [Github](https://github.com/multiversx/mx-sdk-dapp)                          | A library that holds the core functional & signing logic of a dapp on the MultiversX Network. |
| [erdjs-hw-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-hw-provider)                         | [Github](https://github.com/multiversx/mx-sdk-erdjs-hw-provider)             | Sign using the hardware wallet (Ledger).                                                      |
| [erdjs-web-wallet-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-web-wallet-provider)         | [Github](https://github.com/multiversx/mx-sdk-erdjs-web-wallet-provider)     | Sign using the MultiversX web wallet.                                                         |
| [erdjs-wallet-connect-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-wallet-connect-provider) | [Github](https://github.com/multiversx/mx-sdk-erdjs-wallet-connect-provider) | Sign using Wallet Connect.                                                                    |
| [erdjs-extension-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-extension-provider)           | [Github](https://github.com/multiversx/mx-sdk-erdjs-extension-provider)      | Sign using the Maiar DeFi Wallet (browser extension).                                         |

:::important
For all purposes, **we recommend using [dapp-core](/sdk-and-tools/dapp-core)** instead of integrating the signing providers on your own.
:::

For more details about integrating a signing provider into your dApp, please follow [this guide](/sdk-and-tools/erdjs/erdjs-signing-providers) or the [erdjs examples repository](https://github.com/multiversx/mx-sdk-erdjs-examples).

Additional utility packages:

| Package                                                                                 | Source code                                                         | Description                                            |
|-----------------------------------------------------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------|
| [transaction-decoder](https://www.npmjs.com/package/@elrondnetwork/transaction-decoder) | [Github](https://github.com/multiversx/mx-sdk-transaction-decoder)  | Decodes transaction metadata from a given transaction. |

