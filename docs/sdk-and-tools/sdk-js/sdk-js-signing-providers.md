---
id: sdk-js-signing-providers
title: Signing Providers for dApps
---

[comment]: # (mx-abstract)

This page will guide you through the process of integrating the **sdk-js signing providers** in a dApp which isn't based on `sdk-dapp`.

:::important
Note that for most purposes, **we recommend using [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp)** instead of integrating the signing providers on your own.
:::

[comment]: # (mx-context-auto)

## Anatomy of a signing provider

Generally speaking, a signing provider is a component that supports the following use-cases:

 - **Login**: the user of a dApp is asked her MultiversX identity. The user reaches the wallet, unlocks it, and confirms the login. The flow continues back to the dApp, which is now informed about the user's blockchain address. Note, though, that this piece of information is not authenticated: the dApp receives a _hint_ about the user's address, not a _guarantee_ (proof). Sometimes (though rarely), this is enough. If in doubt, always have your users login using the **native authentication** flow (see below).
 - **Login using Native Authentication**: once the user decides to login, the dApp crafts a special piece of data called _the native authentication initial part_ - a shortly-lived artifact that contains, among others, a marker of the originating dApp and a marker of the target Network. The user is given this piece of data and is asked to sign it, to prove her MultiversX identity. The user then reaches the wallet, which unwraps and (partly) displays the payload of _the native authentication initial part_. The user unlocks the wallet and confirms the login - under the hood, the _part_ is signed with the user's secret key. The flow continues back to the dApp, which now receives the user's blockchain address, along with a proof (signature). Then, the dApp (e.g. maybe a server-side component) can verify the signature to make sure that the user is indeed the owner of the address.
  - **Logout**: ... 
  - **Sign transactions**:
  - **Sign messages**:

## Implementations (available providers)

For MultiversX dApps, the following signing providers are available:

- [Web wallet provider](https://github.com/multiversx/mx-sdk-js-web-wallet-provider), compatible with the [Web Wallet](/wallet/web-wallet) and [xAlias](https://xalias.com)
- [Browser extension provider](https://github.com/multiversx/mx-sdk-js-extension-provider), compatible with the [MultiversX DeFi Wallet](/wallet/wallet-extension)
- [WalletConnect provider](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider), compatible with [xPortal App](/wallet/xportal)
- [Hardware wallet provider](https://github.com/multiversx/mx-sdk-js-hw-provider), compatible with [Ledger](/wallet/ledger)

:::important
The code samples depicted on this page are written in JavaScript, and can also be found [on GitHub](https://github.com/multiversx/mx-sdk-js-examples/tree/main/signing-providers). There, the signing providers are integrated into a basic web page (for example purposes).
:::

[comment]: # (mx-context-auto)

## The web wallet provider

:::note
Make sure you have a look over the [webhooks](/wallet/webhooks), in advance.
:::

[`@multiversx/sdk-web-wallet-provider`](https://github.com/multiversx/mx-sdk-js-web-wallet-provider) allows the users of a dApp to login and sign data using the [Web Wallet](/wallet/web-wallet).

In order to create an instance of the provider, do as follows:

```js
import { WalletProvider, WALLET_PROVIDER_DEVNET } from "@multiversx/sdk-web-wallet-provider";

const provider = new WalletProvider(WALLET_PROVIDER_DEVNET);
```

The following provider URLs [are defined](https://github.com/multiversx/mx-sdk-js-web-wallet-provider/blob/main/src/constants.ts) by the package: `WALLET_PROVIDER_TESTNET`, `WALLET_PROVIDER_DEVNET`, `WALLET_PROVIDER_MAINNET`.

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to log in:

```js
const callbackUrl = encodeURIComponent("http://my-dapp");
await provider.login({ callbackUrl });
```

Once the user opens her wallet, the web wallet issues a redirected back to `callbackUrl`, along with the **address** of the user. You can get the address as follows:

```js
import qs from "qs";

const queryString = window.location.search.slice(1);
const params = qs.parse(queryString);
console.log(params.address);
```

In order to log out, do as follows:

```js
const callbackUrl = window.location.href.split("?")[0];
await provider.logout({ callbackUrl: callbackUrl });
```

Sometimes, a dApp (and its backend) might want to reliably assign an off-chain user identity to a MultiversX address. In this context, the web wallet provider supports an extra parameter to the `login()` method: a custom authentication token, called a **native authentication token**, to be signed with the user's wallet, at login-time:

```js
// An identity token, provided by an identity provider (server-side)
// (e.g. Google ID, a custom identity token)
const authToken = "TBD";

// A server-side handler used to acknowledge, validate and honour
// the relationship between "authToken" and the MultiversX address of the user
const callbackUrl = encodeURIComponent("https://my-dapp/on-wallet-login");
await provider.login({ callbackUrl, token: authToken });
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```js
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions(
    [firstTransaction, secondTransaction],
    { callbackUrl: callbackUrl }
);
```

Upon signing the transactions using the web wallet, the user is redirected back to `callbackUrl`, while the _query string_ contains information about the transactions, including their signatures. The information can be used to reconstruct `Transaction` objects using `getTransactionsFromWalletUrl()`:

```js
const plainSignedTransactions = provider.getTransactionsFromWalletUrl();
```

:::important
The following workaround is subject to change.
:::

As of July 2022, the Web Wallet provider returns the data field as a plain string. However, sdk-js' `Transaction.fromPlainObject()` expects it to be base64-encoded. Therefore, we need to apply a workaround (an additional conversion) on the results of `getTransactionsFromWalletUrl()`.

```js
for (const plainTransaction of plainSignedTransactions) {
    const plainTransactionClone = structuredClone(plainTransaction);
    plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
    const transaction = Transaction.fromPlainObject(plainTransactionClone);

    // "transaction" can now be broadcasted.
}
```

[comment]: # (mx-context-auto)

### Signing messages

... TBD ...

[comment]: # (mx-context-auto)

## The browser extension provider

:::note
Make sure you have a look over [this page](/wallet/wallet-extension), in advance.
:::

[`@multiversx/sdk-js-extension-provider`](https://github.com/multiversx/mx-sdk-sdk-js-extension-provider) allows the users of a dApp to login and sign transactions using the [MultiversX DeFi Wallet](/wallet/wallet-extension).

In order to aquire the instance (singleton) of the provider, do as follows:

```js
import { ExtensionProvider } from "@multiversx/sdk-extension-provider";

const provider = ExtensionProvider.getInstance();
```

Before performing any operation, make sure to initialize the provider:

```js
await provider.init();
```

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to login:

```js
const address = await provider.login();

console.log(address);
console.log(provider.account);
```

In order to log out, do as follows:

```js
await provider.logout();
```

The `login()` method supports the `token` parameter (similar to the web wallet provider):

```js
// A custom identity token ... 
const authToken = "TBD";

await provider.login({ token: authToken });

console.log("Address:", provider.account.address);
console.log("Token signature:", provider.account.signature);
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```js
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

[comment]: # (mx-context-auto)

### Signing messages

Arbitrary messages can be signed as follows:

```js
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```

[comment]: # (mx-context-auto)

## The WalletConnect provider

[`@multiversx/sdk-js-wallet-connect-provider`](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider) allows the users of a dApp to login and sign transactions using [xPortal](https://xportal.com/) (the mobile application).

For this example we will use the WalletConnect 2.0 provider since 1.0 is no longer mantained and it is [deprecated](https://medium.com/walletconnect/weve-reset-the-clock-on-the-walletconnect-v1-0-shutdown-now-scheduled-for-june-28-2023-ead2d953b595)

First, let's see a (simple) way to build a QR dialog using [`qrcode`](https://www.npmjs.com/package/qrcode) (and bootstrap):

```js
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

```js
import { WalletConnectV2Provider } from "@multiversx/sdk-wallet-connect-provider";

// Generate your own WalletConnect 2 ProjectId here: 
// https://cloud.walletconnect.com/app
const projectId = "9b1a9564f91cb659ffe21b73d5c4e2d8";
// The default WalletConnect V2 Cloud Relay
const relayUrl = "wss://relay.walletconnect.com";
// T for Testnet, D for Devnet and 1 for Mainnet
const chainId = "T" 

const callbacks = {
    onClientLogin: async function () {
        // closeModal() is defined above
        closeModal();
        const address = await provider.getAddress();
        console.log("Address:", address);
    },
    onClientLogout: async function () {
        console.log("onClientLogout()");
    },
    onClientEvent: async function (event) {
        console.log("onClientEvent()", event);
    }
};

const provider = new WalletConnectProvider(callbacks, chainId, relayUrl, projectId);
```

:::note
You can customize the Core WalletConnect functionality by passing `WalletConnectProvider` an optional 5th parameter: `options`
For example `metadata` and `storage` for [React Native](https://docs.walletconnect.com/2.0/javascript/guides/react-native) or `{ logger: 'debug' }` for a detailed under the hood logging
:::

Before performing any operation, make sure to initialize the provider:

```js
await provider.init();
```

[comment]: # (mx-context-auto)

### Login and logout

Then, ask the user to login using xPortal on her phone:

```js
const { uri, approval } = await provider.connect();
// connect will provide the uri required for the qr code display 
// and an approval Promise that will return the connection session 
// once the user confirms the login

// openModal() is defined above
openModal(uri);        

// pass the approval Promise
await provider.login({ approval });
```

The `login()` method supports the `token` parameter (similar to other providers):

```js
// A custom identity token ...
const authToken = "TBD";

await provider.login({ approval, token: authToken });

console.log("Address:", provider.address);
console.log("Token signature:", provider.signature);
```

:::important
The pairing proposal between a wallet and a dapp is made using an [URI](https://docs.walletconnect.com/2.0/specs/clients/core/pairing/pairing-uri). In WalletConnect v2.0 the session and pairing are decoupled from each other. This means that a URI is shared to construct a pairing proposal, and only after settling the pairing the dapp can propose a session using that pairing. In simpler words, the dapp generates an URI that can be used by the wallet for pairing.
:::

Once the user confirms the login, the `onClientLogin()` callback (declared above) is executed.

In order to log out, do as follows:

```js
await provider.logout();
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```js
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

```js
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```

[comment]: # (mx-context-auto)

## The hardware wallet provider

:::note
Make sure you have a look over [this page](/wallet/ledger), in advance.
:::

[`@multiversx/sdk-hw-provider`](https://github.com/multiversx/mx-sdk-js-hw-provider) allows the users of a dApp to login and sign transactions using a [Ledger device](/wallet/ledger).

In order to create an instance of the provider, do as follows:

```js
import { HWProvider } from "@multiversx/sdk-hw-provider";

const provider = new HWProvider();
```

Before performing any operation, make sure to initialize the provider (also, the MultiversX application has to be open on the device):

```js
await provider.init();
```

[comment]: # (mx-context-auto)

### Login

Before asking the user to log in using the Ledger, you may want to get all the available addresses on the device, display them, and let the user choose one of them:

```js
const addresses = await provider.getAccounts();
console.log(addresses);
```

The login looks like this:

```js
const chosenAddressIndex = 3;
await provider.login({ addressIndex: chosenAddressIndex });
alert(`Logged in. Address: ${await provider.getAddress()}`);
```

Alternatively, in order to select a specific address on the device after login, call `setAddressIndex()`:

```js
const addressIndex = 3;
await provider.setAddressIndex(addressIndex);
console.log(`Address has been set: ${await provider.getAddress()}.`);
```

The Ledger provider does not support a _logout_ operation per se (not applicable in this context).

The login flow supports the `token` parameter (similar to other providers), using the method `tokenLogin()`:

```js
// A custom identity token ...
const authToken = "TBD";

// Note the additional suffix (required as of July 2022):
const payloadToSign = Buffer.from(`${authToken}{}`);
const { address, signature } = await provider.tokenLogin({ addressIndex: 0, token: payloadToSign });

console.log("Address:", address);
console.log("Signature:", signature.hex());
```

[comment]: # (mx-context-auto)

### Signing transactions

Transactions can be signed as follows:

```js
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

```js
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({
    message: Buffer.from("hello")
});

await provider.signMessage(message);

console.log(message.toJSON());
```

[comment]: # (mx-context-auto)

## Verifying the signature of a login token

:::note
Make sure to use [`sdk-native-auth-client`](https://www.npmjs.com/package/@multiversx/sdk-native-auth-client) and [`sdk-native-auth-server`](https://www.npmjs.com/package/@multiversx/sdk-native-auth-server) to handle the **native authentication** flow.
:::

As previously mentioned, a dApp (and its backend) might want to reliably assign an off-chain user identity to a MultiversX address. On this purpose, the signing providers allow a _login token_ (TBD) to be used within the login flow - this token is (... TBD ...) signed using the wallet of the user. Afterwards, a backend application would normally verify the signature of the token, using ... TBD.
