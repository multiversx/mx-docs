# Accounts Management

Managing Wallets and Addresses



If integrating a **system** with the **Network** involves transfers between different users (accounts) - a good example for this case is the integration between an **exchange system** and the **Network** - the recommended approach is to have **an Elrond Account (Address) for each user of the system**.

Accounts creation can be achieved through different approaches:

- using the [Elrond Web Wallet](https://wallet.elrond.com/)
- programmatically, using our [elrond-core-js](https://github.com/ElrondNetwork/elrond-core-js) library
- using the [lightweight CLI](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli) wrapper over our [elrond-core-js library](https://github.com/ElrondNetwork/elrond-core-js)
- using our [lightweight HTTP utility](https://github.com/ElrondNetwork/erdwalletjs-http), which wraps the [elrond-core-js library](https://github.com/ElrondNetwork/elrond-core-js)
- programmatically, using the [TrustWalletCore extension](https://github.com/trustwallet/wallet-core/tree/master/src/Elrond) for Elrond