---
id: accounts-management
title: Accounts Management
---

Managing Wallets and Addresses

:::tip
If integrating a **system** with the **Network** involves transfers between different users (accounts) - a good example for this case is the integration between an **exchange system** and the **Network** - the recommended approach is to have **a MultiversX Account (Address) for each user of the system**.
:::

Accounts creation can be achieved through different approaches:

- using the [MultiversX Web Wallet](https://wallet.multiversx.com/)
- programmatically, using the [erdjs - JavaScript SDK](/sdk-and-tools/erdjs)
- programmatically, using the [erdpy - Python SDK](/sdk-and-tools/erdpy/erdpy)
- programmatically, using the [erdgo - Golang SDK](/sdk-and-tools/erdgo)
- programmatically, using the [erdjava - Java SDK](/sdk-and-tools/erdjava)
- using the [lightweight CLI](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli) wrapper over our [elrond-core-js library](https://github.com/ElrondNetwork/elrond-core-js)
- using our [lightweight HTTP utility](https://github.com/ElrondNetwork/erdwalletjs-http), which wraps the [elrond-core-js library](https://github.com/ElrondNetwork/elrond-core-js)
- programmatically, using the [TrustWalletCore extension](https://github.com/trustwallet/wallet-core/tree/master/src/MultiversX) for MultiversX
