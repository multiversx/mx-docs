---
id: erdjs-signing-providers
title: Signing Providers for dApps
---

This page will guide you through the process of integrating the **erdjs signing providers** in a dApp which isn't based on `dapp-core`.

:::important
Note that for most purposes, **we recommend using [dapp-core](https://github.com/ElrondNetwork/dapp-core)** instead of integrating the signing providers on your own.
:::

:::note
The code samples depicted on this page can also be found on the [erdjs examples repository](https://github.com/ElrondNetwork/elrond-sdk-erdjs-examples).
:::

## The Web Wallet Provider

:::note
Make sure you have a look over the [webhooks](/wallet/webhooks), in advance.
:::

[`@elrondnetwork/erdjs-web-wallet-provider`](https://github.com/ElrondNetwork/elrond-sdk-erdjs-web-wallet-provider) allows the users of a dApp to login and sign transactions using the [Web Wallet](/wallet/web-wallet).

In order to create an instance of the provider, do as follows:

```
import { WalletProvider, WALLET_PROVIDER_DEVNET } from "@elrondnetwork/erdjs-web-wallet-provider";

const provider = new WalletProvider(WALLET_PROVIDER_DEVNET);
```

The following provider URLs [are defined](https://github.com/ElrondNetwork/elrond-sdk-erdjs-web-wallet-provider/blob/main/src/constants.ts) by the package: `WALLET_PROVIDER_TESTNET`, `WALLET_PROVIDER_DEVNET`, `WALLET_PROVIDER_MAINNET`.

### Login and logout

Then, ask the user to login:

```
await provider.login({ callbackUrl: "http://my-dapp" });
```

Once the user opens hers wallet, the web wallet issues a redirected back to `callbackUrl`, along with the **address** of the user. You can get the address as follows:

```
import qs from "qs";

const queryString = window.location.search.slice(1);
const params = qs.parse(queryString);
console.log(params.address);
```

In order to logout, do as follows:

```
const callbackUrl = window.location.href.split("?")[0];
await provider.logout({ callbackUrl: callbackUrl });
```

Sometimes, a dApp (and its backend) might want to reliably assign an off-chain user identity to an Elrond address. In this context, the web wallet provider supports an extra parameter to the `login()` method: a custom authentication token, **completely opaque to the web wallet**, to be signed with the user's wallet, at login-time:

```
// An identity token, provided by an identity provider (server-side)
// (e.g. Google ID, a custom identity token)
const authToken = "aaaabbbbaaaabbbb";

// A server-side handler used to acknowledge, validate and honour
// the relationship between "authToken" and the Elrond address of the user
const callbackUrl = "https://my-dapp/on-wallet-login"

await provider.login({ callbackUrl: callbackUrl, token: authToken });
```

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@elrondnetwork/erdjs";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions(
    [firstTransaction, secondTransaction], 
    { callbackUrl: callbackUrl }
);
```

Upon signing the transactions using the web wallet, the user is redirected back to `callbackUrl`, while the _query string_ contains information about the transactions, including their signatures. The information can be used to reconstruct `Transaction` objects using `getTransactionsFromWalletUrl()`:

```
const plainSignedTransactions = provider.getTransactionsFromWalletUrl();
```

:::important
The following workaround is subject to change.
:::

As of July 2022, the Web Wallet provider returns the data field as a plain string. However, erdjs' `Transaction.fromPlainObject()` expects it to be base64-encoded. Therefore, we need to apply a workaround (an additional conversion) on the results of `getTransactionsFromWalletUrl()`.

```
for (const plainTransaction of plainSignedTransactions) {
    const plainTransactionClone = structuredClone(plainTransaction);
    plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
    const transaction = Transaction.fromPlainObject(plainTransactionClone);

    // "transaction" can now be broadcasted.
}
```

### Signing messages

:::important
Documentation in this section is preliminary and subject to change.
:::

As of July 2022, the web wallet provider does not allow one to sign arbitrary messages (only transaction signing is supported).

## The Extension Provider (Maiar DeFi Wallet)

:::note
Make sure you have a look over the [webhooks](/wallet/wallet-extension), in advance.
:::

[`@elrondnetwork/erdjs-extension-provider`](https://github.com/ElrondNetwork/elrond-sdk-erdjs-extension-provider) allows the users of a dApp to login and sign transactions using the [Maiar DeFi Wallet](/wallet/wallet-extension).

In order to aquire the instance (singleton) of the provider, do as follows:

```
import { ExtensionProvider } from "@elrondnetwork/erdjs-extension-provider";

const provider = ExtensionProvider.getInstance();
```

Before performing any operation, make sure to initialize the provider:

```
await provider.init();
```

### Login and logout

Then, ask the user to login:

```
const address = await provider.login();

console.log(address);
console.log(provider.account);
```

In order to logout, do as follows:

```
await provider.logout();
```

The `login()` method supports the `token` parameter (similar to the web wallet provider):

```
// A custom identity token (opaque to the signing provider)
const authToken = "aaaabbbbaaaabbbb";

await provider.login({ token: authToken });

console.log("Address:", provider.account.address);
console.log("Token signature:", provider.account.signature);
```

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@elrondnetwork/erdjs";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

### Signing messages

Arbitrary messages can be signed as follows:

```
import { SignableMessage } from "@elrondnetwork/erdjs";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```
