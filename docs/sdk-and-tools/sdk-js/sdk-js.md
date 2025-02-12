---
id: sdk-js
title: sdk-js
---

[comment]: # (mx-abstract)

MultiversX SDK for TypeScript and JavaScript

This SDK consists of TypeScript / JavaScript helpers and utilities for interacting with the Blockchain (in general) and with Smart Contracts (in particular).

[comment]: # (mx-context-auto)

## Packages

Base libraries:

| Package                                                                                  | Source code                                                         | Description                                                                    |
|------------------------------------------------------------------------------------------|---------------------------------------------------------------------|--------------------------------------------------------------------------------|
| [sdk-core](https://www.npmjs.com/package/@multiversx/sdk-core)                           | [Github](https://github.com/multiversx/mx-sdk-js-core)              | The `sdk-core` package is a unification of the previous packages (`multiversx/sdk-wallet` and `multiversx/sdk-network-providers` into `multiversx/sdk-core`). It has basic components for interacting with the blockchain and with smart contracts. |
| [sdk-exchange](https://www.npmjs.com/package/@multiversx/sdk-exchange)                   | [Github](https://github.com/multiversx/mx-sdk-js-exchange)          | Utilities modules for xExchange interactions.                                  |

Signing providers for dApps:

| Package                                                                                                                              | Docs                                                                                                                                                                                                                | Source code                                                                            | Description                                                                                              |
|--------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| [sdk-hw-provider](https://www.npmjs.com/package/@multiversx/sdk-hw-provider)                                                         | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-hardware-wallet-provider)                                                                                                                        | [Github](https://github.com/multiversx/mx-sdk-js-hw-provider)                          | Sign using the hardware wallet (Ledger).                                                                 |
| [sdk-wallet-connect-provider](https://www.npmjs.com/package/@multiversx/sdk-wallet-connect-provider)                                 | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-walletconnect-provider)                                                                                                                          | [Github](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider)              | Sign using WalletConnect.                                                                                |
| [sdk-extension-provider](https://www.npmjs.com/package/@multiversx/sdk-extension-provider)                                           | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-browser-extension-provider) \| [interactive documentation](https://interactive-tutorials.multiversx.com/dashboard/extension-provider)            | [Github](https://github.com/multiversx/mx-sdk-js-extension-provider)                   | Sign using the MultiversX DeFi Wallet (browser extension).                                               |
| [sdk-web-wallet-provider](https://www.npmjs.com/package/@multiversx/sdk-web-wallet-provider)                                         | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-web-wallet-provider)                                                                                                                             | [Github](https://github.com/multiversx/mx-sdk-js-web-wallet-provider)                  | Sign using the MultiversX web wallet, using webhooks **(DEPRECATED)**.                                   |
| [mx-sdk-js-web-wallet-cross-window-provider](https://www.npmjs.com/package/@multiversx/sdk-web-wallet-cross-window-provider)         | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-web-wallet-cross-window-provider) \| [interactive documentation](https://interactive-tutorials.multiversx.com/dashboard/cross-window-provider)   | [Github](https://github.com/multiversx/mx-sdk-js-web-wallet-cross-window-provider)     | Sign using the MultiversX web wallet, by opening the wallet in a new tab.                                |
| [mx-sdk-js-metamask-proxy-provider](https://www.npmjs.com/package/@multiversx/sdk-metamask-proxy-provider)                           | [documentation](/sdk-and-tools/sdk-js/sdk-js-signing-providers#the-metamask-proxy-provider) \| [interactive documentation](https://interactive-tutorials.multiversx.com/dashboard/iframe-provider)                  | [Github](https://github.com/multiversx/mx-sdk-js-metamask-proxy-provider)              | Sign using the Metamask wallet, by using web wallet as a proxy widget in iframe.                         |

For more details about integrating a signing provider into your dApp, please follow [this guide](/sdk-and-tools/sdk-js/sdk-js-signing-providers) or the [mx-sdk-js-examples repository](https://github.com/multiversx/mx-sdk-js-examples).

Signing SDKs:

| Package                                                                                          | Source code                                                               | Description                                                                                   |
|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| [sdk-dapp-core](https://www.npmjs.com/package/@multiversx/sdk-dapp-core)                                   | [Github](https://github.com/multiversx/mx-sdk-dapp-core)                       | A library that holds the core functional & signing logic of a dapp on the MultiversX Network. |
| [sdk-guardians-provider](https://www.npmjs.com/package/@multiversx/sdk-guardians-provider)       | [Github](https://github.com/multiversx/mx-sdk-js-guardians-provider)      | Helper library for integrating a co-signing provider (Guardian) into dApps.                   |


:::important
For all purposes, **we recommend using [sdk-dapp](/sdk-and-tools/sdk-dapp)** instead of integrating the signing providers on your own.
:::

Native Authenticator libraries:

| Package                                                                                  | Source code                                                           | Description                                            |
|-------------------------------------------------------------------------------------------|----------------------------------------------------------------------|--------------------------------------------------------|
| [sdk-native-auth-client](https://www.npmjs.com/package/@multiversx/sdk-native-auth-client) | [Github](https://github.com/multiversx/mx-sdk-js-native-auth-client) | Native Authenticator - client-side components.         |
| [sdk-native-auth-server](https://www.npmjs.com/package/@multiversx/sdk-native-auth-server) | [Github](https://github.com/multiversx/mx-sdk-js-native-auth-server) | Native Authenticator - server-side components.         |

Additional utility packages:

| Package                                                                                  | Source code                                                        | Description                                            |
|------------------------------------------------------------------------------------------|--------------------------------------------------------------------|--------------------------------------------------------|
| [transaction-decoder](https://www.npmjs.com/package/@multiversx/sdk-transaction-decoder) | [Github](https://github.com/multiversx/mx-sdk-transaction-decoder) | Decodes transaction metadata from a given transaction. |
