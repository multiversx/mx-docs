---
id: sdk-js-signing-providers
title: Signing Providers for dApps
---

[comment]: # (mx-abstract)

This page will guide you through the process of integrating the **sdk-js signing providers** in a dApp which isn't based on `sdk-dapp`.

:::important
Note that for most purposes, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

:::important
The code samples depicted on this page can also be found on the [**sdk-js examples repository**](https://github.com/multiversx/mx-sdk-js-examples).
:::

The following signing providers are available:

- Web Wallet Provider
- Extension Provider (Maiar DeFi Wallet)
- Wallet Connect provider
- Hardware Wallet (Ledger) Provider

[comment]: # (mx-context-auto)

## The Web Wallet Provider

:::note
Make sure you have a look over the [webhooks](/wallet/webhooks), in advance.
:::

[`@multiversx/sdk-web-wallet-provider`](https://github.com/multiversx/mx-sdk-js-web-wallet-provider) allows the users of a dApp to login and sign transactions using the [Web Wallet](/wallet/web-wallet).

In order to create an instance of the provider, do as follows:

```
import { WalletProvider, WALLET_PROVIDER_DEVNET } from "@multiversx/sdk-web-wallet-provider";

const provider = new WalletProvider(WALLET_PROVIDER_DEVNET);
```

The following provider URLs [are defined](https://github.com/multiversx/mx-sdk-js-web-wallet-provider/blob/main/src/constants.ts) by the package: `WALLET_PROVIDER_TESTNET`, `WALLET_PROVIDER_DEVNET`, `WALLET_PROVIDER_MAINNET`.

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to log in:

```
const callbackUrl = encodeURIComponent("http://my-dapp");
await provider.login({ callbackUrl });
```

Once the user opens her wallet, the web wallet issues a redirected back to `callbackUrl`, along with the **address** of the user. You can get the address as follows:

```
import qs from "qs";

const queryString = window.location.search.slice(1);
const params = qs.parse(queryString);
console.log(params.address);
```

In order to log out, do as follows:

```
const callbackUrl = window.location.href.split("?")[0];
await provider.logout({ callbackUrl: callbackUrl });
```

Sometimes, a dApp (and its backend) might want to reliably assign an off-chain user identity to a MultiversX address. In this context, the web wallet provider supports an extra parameter to the `login()` method: a custom authentication token, **completely opaque to the web wallet**, to be signed with the user's wallet, at login-time:

```
// An identity token, provided by an identity provider (server-side)
// (e.g. Google ID, a custom identity token)
const authToken = "aaaabbbbaaaabbbb";

// A server-side handler used to acknowledge, validate and honour
// the relationship between "authToken" and the MultiversX address of the user
const callbackUrl = encodeURIComponent("https://my-dapp/on-wallet-login");
await provider.login({ callbackUrl, token: authToken });
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@multiversx/sdk-core";

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

As of July 2022, the Web Wallet provider returns the data field as a plain string. However, sdk-js' `Transaction.fromPlainObject()` expects it to be base64-encoded. Therefore, we need to apply a workaround (an additional conversion) on the results of `getTransactionsFromWalletUrl()`.

```
for (const plainTransaction of plainSignedTransactions) {
    const plainTransactionClone = structuredClone(plainTransaction);
    plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
    const transaction = Transaction.fromPlainObject(plainTransactionClone);

    // "transaction" can now be broadcasted.
}
```

[comment]: # (mx-context-auto)

### Signing messages

:::important
Documentation in this section is preliminary and subject to change.
:::

As of July 2022, the web wallet provider does not allow one to sign arbitrary messages (only transaction signing is supported).

[comment]: # (mx-context-auto)

## The Extension Provider (Maiar DeFi Wallet)

:::note
Make sure you have a look over [this page](/wallet/wallet-extension), in advance.
:::

[`@multiversx/sdk-js-extension-provider`](https://github.com/multiversx/mx-sdk-sdk-js-extension-provider) allows the users of a dApp to login and sign transactions using the [Maiar DeFi Wallet](/wallet/wallet-extension).

In order to aquire the instance (singleton) of the provider, do as follows:

```
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";

const provider = ExtensionProvider.getInstance();
```

Before performing any operation, make sure to initialize the provider:

```
await provider.init();
```

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to login:

```
const address = await provider.login();

console.log(address);
console.log(provider.account);
```

In order to log out, do as follows:

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

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

[comment]: # (mx-context-auto)

### Signing messages

Arbitrary messages can be signed as follows:

```
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```

[comment]: # (mx-context-auto)

## The Wallet Connect provider

[`@multiversx/sdk-js-wallet-connect-provider`](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider) allows the users of a dApp to login and sign transactions using Maiar (the mobile application).

First, let's see a (simple) way to build a QR dialog using [`qrcode`](https://www.npmjs.com/package/qrcode) (and bootstrap):

```
import QRCode from "qrcode";

async function openModal(connectorUri) {
    const svg = await QRCode.toString(connectorUri, { type: "svg" });

    // The referenced elements must be added to your page, in advance
    $("#MyWalletConnectQRContainer").html(svg);
    $("#MyWalletConnectModal").modal("show");
}

function closeModal() {
    $("#MyWalletConnectModal").modal("hide");
}
```

In order to create an instance of the provider, do as follows:

```
import { WalletConnectProvider } from "@multiversx/sdk-wallet-connect-provider";

var provider;

const bridgeUrl = "https://bridge.walletconnect.org";

const callbacks = {
    onClientLogin: async function () {
        // closeModal() is defined above
        closeModal();
        const address = await provider.getAddress();
        console.log("Address:", address);
    },
    onClientLogout: async function () {
        console.log("onClientLogout()");
    }
};

const provider = new WalletConnectProvider(bridgeUrl, callbacks);
```

Before performing any operation, make sure to initialize the provider:

```
await provider.init();
```

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to login using Maiar on her phone:

```
const connectorUri = await provider.login();

// openModal() is defined above
openModal(connectorUri);
```

Once the user confirms the login, the `onClientLogin()` callback (declared above) is executed.

In order to log out, do as follows:

```
await provider.logout();
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

Alternatively, one can sign a single transaction using the method `signTransaction()`.

[comment]: # (mx-context-auto)

### Signing messages

:::important
Documentation in this section is preliminary and subject to change.
:::

As of July 2022, sdk-js' Wallet Connect provider does not allow one to sign arbitrary messages (only transaction signing is supported).

[comment]: # (mx-context-auto)

## The Hardware Wallet (Ledger) Provider

:::note
Make sure you have a look over [this page](/wallet/ledger), in advance.
:::

[`@multiversx/sdk-hw-provider`](https://github.com/multiversx/mx-sdk-js-hw-provider) allows the users of a dApp to login and sign transactions using a [Ledger device](/wallet/ledger).

In order to create an instance of the provider, do as follows:

```
import { HWProvider } from "@multiversx/sdk-hw-provider";

const provider = new HWProvider();
```

Before performing any operation, make sure to initialize the provider (also, the MultiversX application has to be open on the device):

```
await provider.init();
```

[comment]: # (mx-context-auto)

### Login

Before asking the user to log in using the Ledger, you may want to get all the available addresses on the device, display them, and let the user choose one of them:

```
const addresses = await provider.getAccounts();
console.log(addresses);
```

The login looks like this:

```
const chosenAddressIndex = 3;
await provider.login({ addressIndex: chosenAddressIndex });
alert(`Logged in. Address: ${await provider.getAddress()}`);
```

Alternatively, in order to select a specific address on the device after login, call `setAddressIndex()`:

```
const addressIndex = 3;
await provider.setAddressIndex(addressIndex);
console.log(`Address has been set: ${await provider.getAddress()}.`);
```

The Ledger provider does not support a _logout_ operation per se (not applicable in this context).

The login flow supports the `token` parameter (similar to other providers), using the method `tokenLogin()`:

```
// A custom identity token (opaque to the signing provider)
const authToken = "aaaabbbbaaaabbbb";

// Note the additional suffix (required as of July 2022):
const payloadToSign = Buffer.from(`${authToken}{}`);
const { address, signature } = await provider.tokenLogin({ addressIndex: 0, token: payloadToSign });

console.log("Address:", address);
console.log("Signature:", signature.hex());
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

Alternatively, one can sign a single transaction using the method `signTransaction()`.

[comment]: # (mx-context-auto)

### Signing messages

Arbitrary messages can be signed as follows:

```
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```

[comment]: # (mx-context-auto)

## Verifying the signature of a login token

As previously mentioned, a dApp (and its backend) might want to reliably assign an off-chain user identity to a MultiversX address. On this purpose, the signing providers allow a _login token_ to be used within the login flow - this token is signed using the wallet of the user. Afterwards, a backend application would normally verify the signature of the token, as follows:

```
export function verifyAuthTokenSignature(address, authToken, signature) {
    console.log("verifyAuthTokenSignature()");
    console.log("address:", address);
    console.log("authToken:", authToken);
    console.log("signature:", signature);

    // Note that the verification API will be improved in a future version of sdk-wallet.
    // As of @multiversx/sdk-wallet@v1.0.0, this API is a bit tedious:
    const verifier = UserVerifier.fromAddress(new Address(address));

    const message = new SignableMessage({
        signature: { hex: () => signature },
        message: Buffer.from(`${address}${authToken}{}`)
    });

    const ok = verifier.verify(message);
    if (ok) {
        return `The bearer of the token [${authToken}] is also the owner of the address [${address}].`;
    }

    return "Verification failed.";
}
```

:::note
The workaround applied in the code snippet above is subject for improvement.
:::
