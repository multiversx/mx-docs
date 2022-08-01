---
id: erdjs
title: erdjs
---

Elrond SDK for TypeScript and JavaScript

**erdjs** consists of TypeScript / JavaScript helpers and utilities for interacting with the Blockchain (in general) and with Smart Contracts (in particular).

| Package | Source code | Description |
| ------------- | ----------------------------------------- | ------------------------------------- |
| [erdjs](https://www.npmjs.com/package/@elrondnetwork/erdjs) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs) | Basic components for interacting with the blockchain and with smart contracts. |
| [erdjs-walletcore](https://www.npmjs.com/package/@elrondnetwork/erdjs-walletcore) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-walletcore) | Core wallet components (generation, signing). |
| erdjs-contract-wrappers | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-contract-wrappers) | Smart Contract wrappers, based on erdjs. NodeJS repl-friendly. |
| [erdjs-network-providers](https://www.npmjs.com/package/@elrondnetwork/erdjs-network-providers) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-network-providers) | Network Provider (API, Gateway) components (compatible with erdjs). |

Signing providers for dApps:

:::important
For all purposes, **we recommend using [dapp-core](https://github.com/ElrondNetwork/dapp-core)** instead of integrating the signing providers on your own.
:::

| Package | Source code | Description |
| ------------- | ----------------------------------------- | ------------------------------------- |
| [erdjs-hw-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-hw-provider) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-hw-provider) | Sign using the hardware wallet (Ledger). |
| [erdjs-web-wallet-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-web-wallet-provider) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-web-wallet-provider) | Sign using the Elrond web wallet. |
| [erdjs-wallet-connect-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-wallet-connect-provider) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-wallet-connect-provider) | Sign using Wallet Connect.|
| [erdjs-extension-provider](https://www.npmjs.com/package/@elrondnetwork/erdjs-extension-provider) | [Github](https://github.com/ElrondNetwork/elrond-sdk-erdjs-extension-provider) | Sign using the Maiar DeFi Wallet (browser extension). |

For more details about integrating a signing provider into your dApp, please follow [this guide](/sdk-and-tools/erdjs/erdjs-signing-providers) or the [erdjs examples repository](https://github.com/ElrondNetwork/elrond-sdk-erdjs-examples).

Additional utility packages:

| Package | Source code | Description |
| ------------- | ----------------------------------------- | ------------------------------------- |
| [transaction-decoder](https://www.npmjs.com/package/@elrondnetwork/transaction-decoder) | [Github](https://github.com/ElrondNetwork/transaction-decoder) | Decodes transaction metadata from a given transaction.|

:::tip
The **auto-generated** SDK documentation can be found [here](https://elrondnetwork.github.io/elrond-sdk-docs).
:::
