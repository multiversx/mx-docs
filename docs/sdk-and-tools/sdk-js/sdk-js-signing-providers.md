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

- **Log in (trivial flow, not recommended)**: the user of a dApp is asked her MultiversX identity. The user reaches the wallet, unlocks it, and confirms the login. The flow continues back to the dApp, which is now informed about the user's blockchain address. Note, though, that this piece of information is not authenticated: the dApp receives a _hint_ about the user's address, not a _guarantee_ (proof). Sometimes (though rarely), this is enough. If in doubt, always have your users login using the **native authentication** flow (see below).
- **Log in using native authentication (recommended)**: once the user decides to log in, the dApp crafts a special piece of data called _the native authentication initial part_ - a shortly-lived artifact that contains, among others, a marker of the originating dApp and a marker of the target Network. The user is given this piece of data and she is asked to sign it, to prove her MultiversX identity. The user then reaches the wallet, which unwraps and (partly) displays the payload of _the native authentication initial part_. The user unlocks the wallet and confirms the login - under the hood, the _part_ is signed with the user's secret key. The flow continues back to the dApp, which now receives the user's blockchain address, along with a proof (signature). Then, the dApp (e.g. maybe a server-side component) can verify the signature to make sure that the user is indeed the owner of the address.
- **Log out**: once the user decides to log out from the dApp, the latter should ask the wallet to do so. Once the user is signed out, the flow continues back to the dApp.
- **Sign transactions**: while interacting with the dApp, the user might be asked to sign one or more transactions. The user reaches the wallet, unlocks it again if necessary, and confirms the signing. The flow continues back to the dApp, which receives the signed transactions, ready to be broadcasted to the Network.
- **Sign messages**: while interacting with the dApp, the user might be asked to sign an arbitrary message. The user reaches the wallet, unlocks it again if necessary, and confirms the signing. The flow continues back to the dApp, which receives the signed message.

[comment]: # (mx-context-auto)

## Implementations (available providers)

For MultiversX dApps, the following signing providers are available:

- [Web wallet provider](https://github.com/multiversx/mx-sdk-js-web-wallet-provider), compatible with the [Web Wallet](/wallet/web-wallet) and [xAlias](/wallet/xalias)
- [Browser extension provider](https://github.com/multiversx/mx-sdk-js-extension-provider), compatible with the [MultiversX DeFi Wallet](/wallet/wallet-extension)
- [WalletConnect provider](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider), compatible with [xPortal App](/wallet/xportal)
- [Hardware wallet provider](https://github.com/multiversx/mx-sdk-js-hw-provider), compatible with [Ledger](/wallet/ledger)

:::important
The code samples depicted on this page are written in JavaScript, and can also be found [on GitHub](https://github.com/multiversx/mx-sdk-js-examples/tree/main/signing-providers). There, the signing providers are integrated into a basic web page (for example purposes).
:::

[comment]: # (mx-context-auto)

## The Web Wallet Provider

:::note
Make sure you have a look over the [webhooks](/wallet/webhooks), in advance.
:::

[`@multiversx/sdk-web-wallet-provider`](https://github.com/multiversx/mx-sdk-js-web-wallet-provider) allows the users of a dApp to log in and sign data using the [Web Wallet](/wallet/web-wallet) or [xAlias](/wallet/xalias).

:::important
Remember that [xAlias](/wallet/xalias) exposes **the same [URL hooks and callbacks](/wallet/webhooks)** as the [Web Wallet](/wallet/web-wallet). Therefore, integrating xAlias is **identical to integrating the Web Wallet** - with one trivial exception: the configuration of the URL base (see below).
:::

In order to create an instance of the provider that talks to the **Web Wallet**, do as follows:

```js
import { WalletProvider, WALLET_PROVIDER_DEVNET } from "@multiversx/sdk-web-wallet-provider";

const provider = new WalletProvider(WALLET_PROVIDER_DEVNET);
```

Or, for **xAlias**:

```js
import { WalletProvider, XALIAS_PROVIDER_DEVNET } from "@multiversx/sdk-web-wallet-provider";

const provider = new WalletProvider(XALIAS_PROVIDER_DEVNET);
```

The following provider URLs [are defined](https://github.com/multiversx/mx-sdk-js-web-wallet-provider/blob/main/src/constants.ts) by the package:  

- `WALLET_PROVIDER_TESTNET`, `WALLET_PROVIDER_DEVNET`, `WALLET_PROVIDER_MAINNET`
- `XALIAS_PROVIDER_MAINNET`, `XALIAS_PROVIDER_DEVNET`, `XALIAS_PROVIDER_TESTNET`

[comment]: # (mx-context-auto)

### Login and logout {#wallet-login-and-logout}

Then, ask the user to log in:

```js
const callbackUrl = encodeURIComponent("http://my-dapp");
await provider.login({ callbackUrl });
```

Once the user opens her wallet, the web wallet issues a redirected back to `callbackUrl`, along with the **address** of the user. You can get the address as follows:

```js
import qs from "qs";

const queryString = window.location.search.slice(1);
const queryStringParams = qs.parse(queryString);
console.log(queryStringParams.address);
```

In order to log out, do as follows:

```js
const callbackUrl = window.location.href.split("?")[0];
await provider.logout({ callbackUrl: callbackUrl });
```

Though, most often, the dApps (or their server-side components) want to **reliably assign an off-chain user identity to a MultiversX address**. For this, the signing providers support an extra parameter to the `login()` method: **the initial part of the native authentication token**. That piece of data, generally crafted with the aid of [`sdk-native-auth-client`](https://www.npmjs.com/package/@multiversx/sdk-native-auth-client), is signed with the user's wallet at login-time, and the signature is made available to the dApp, which, in turn, packs it into the actual **native authentication token**.

:::important
We always recommend using the **native authentication** flow, instead of the trivial one. That is, always pass the `token` parameter to the `login()` method. This is applicable to all signing providers.
:::

```js
import { NativeAuthClient } from "@multiversx/sdk-native-auth-client";

const nativeAuthClient = new NativeAuthClient({ ... });
const nativeAuthInitialPart = await nativeAuthClient.initialize();

const callbackUrl = encodeURIComponent("https://my-dapp/on-wallet-login");
await provider.login({ callbackUrl, token: nativeAuthInitialPart });
```

Once the flow returns to the dApp, the `address` and `signature` parameters are available. The actual **native authentication token** is obtained upon an additional processing step - a re-packing, by means of `NativeAuthClient.getToken()`:

```js
const address = queryStringParams.address;
const signature = queryStringParams.signature;
const nativeAuthToken = nativeAuthClient.getToken(address, nativeAuthInitialPart, signature);
```

[comment]: # (mx-context-auto)

### Signing transactions {#wallet-signing-transactions}

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

Upon signing the transactions, the user is redirected back to `callbackUrl`, while the _query string_ contains information about the transactions, including their signatures. The information can be used to reconstruct `Transaction` objects using `getTransactionsFromWalletUrl()`:

```js
const plainSignedTransactions = provider.getTransactionsFromWalletUrl();
```

:::important
The following workaround is subject to change.
:::

As of January 2024, this signing provider returns the data field as a plain string. However, sdk-js' `Transaction.fromPlainObject()` expects it to be base64-encoded. Therefore, we need to apply a workaround (an additional conversion) on the results of `getTransactionsFromWalletUrl()`.

```js
for (const plainTransaction of plainSignedTransactions) {
    const plainTransactionClone = structuredClone(plainTransaction);
    plainTransactionClone.data = Buffer.from(plainTransactionClone.data).toString("base64");
    const transaction = Transaction.fromPlainObject(plainTransactionClone);

    // "transaction" can now be broadcasted.
}
```

[comment]: # (mx-context-auto)

### Signing messages {#wallet-signing-messages}

Messages can be signed as follows:

```js
import { SignableMessage } from "@multiversx/sdk-core";

const message = new SignableMessage({ message: "hello" });
await provider.signMessage(message, { callbackUrl });
```

Upon signing the transactions, the user is redirected back to `callbackUrl`, while the _query string_ includes the signature of the message. The signature can be retrieved as follows:

```js
const signature = provider.getMessageSignatureFromWalletUrl();
```

[comment]: # (mx-context-auto)

## The browser extension provider

:::note
Make sure you have a look over [this page](/wallet/wallet-extension), in advance.
:::

[`@multiversx/sdk-js-extension-provider`](https://github.com/multiversx/mx-sdk-sdk-js-extension-provider) allows the users of a dApp to log in and sign transactions using the [MultiversX DeFi Wallet](/wallet/wallet-extension).

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

### Login and logout {#extension-login-and-logout}

Then, ask the user to log in:

```js
const address = await provider.login();

console.log(address);
console.log(provider.account);
```

In order to log out, do as follows:

```js
await provider.logout();
```

The `login()` method supports the `token` parameter, for **the native authentication flow** (always recommended, see above):

```js
const nativeAuthInitialPart = await nativeAuthClient.initialize();
await provider.login({ token: nativeAuthInitialPart });

const address = provider.account.address;
const signature = provider.account.signature;
const nativeAuthToken = nativeAuthClient.getToken(address, nativeAuthInitialPart, signature);
```

[comment]: # (mx-context-auto)

### Signing transactions {#extension-signing-transactions}

Transactions can be signed as follows:

```js
import { Transaction } from "@multiversx/sdk-core";

const firstTransaction = new Transaction({ ... });
const secondTransaction = new Transaction({ ... });

await provider.signTransactions([firstTransaction, secondTransaction]);

// "firstTransaction" and "secondTransaction" can now be broadcasted.
```

[comment]: # (mx-context-auto)

### Signing messages {#extension-signing-messages}

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

[`@multiversx/sdk-js-wallet-connect-provider`](https://github.com/multiversx/mx-sdk-js-wallet-connect-provider) allows the users of a dApp to log in and sign transactions using [xPortal](https://xportal.com/) (the mobile application).

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

### Login and logout  {#walletconnect-login-and-logout}

Then, ask the user to log in using xPortal on her phone:

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

The `login()` method supports the `token` parameter, for **the native authentication flow** (always recommended, see above):

```js
const nativeAuthInitialPart = await nativeAuthClient.initialize();
await provider.login({ approval, token: nativeAuthInitialPart });

const address = await provider.getAddress();
const signature = await provider.getSignature();
const nativeAuthToken = nativeAuthClient.getToken(address, nativeAuthInitialPart, signature);
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

### Signing transactions {#walletconnect-signing-transactions}

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

### Signing messages {#walletconnect-signing-messages}

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

[`@multiversx/sdk-hw-provider`](https://github.com/multiversx/mx-sdk-js-hw-provider) allows the users of a dApp to log in and sign transactions using a [Ledger device](/wallet/ledger).

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

The **the native authentication flow** (always recommended, see above) is supported using the `tokenLogin()` method:

```js
const nativeAuthInitialPart = await nativeAuthClient.initialize();
const nativeAuthInitialPartAsBuffer =  Buffer.from(nativeAuthInitialPart);
const { address, signature } = await provider.tokenLogin({ addressIndex: 0, token: nativeAuthInitialPartAsBuffer });

const nativeAuthToken = nativeAuthClient.getToken(address, nativeAuthInitialPart, signature.toString("hex"));
```

[comment]: # (mx-context-auto)

### Signing transactions {#hw-signing-transactions}

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

### Signing messages {#hw-signing-messages}

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
It's recommended to use the libraries [`sdk-native-auth-client`](https://www.npmjs.com/package/@multiversx/sdk-native-auth-client) and [`sdk-native-auth-server`](https://www.npmjs.com/package/@multiversx/sdk-native-auth-server) to handle the **native authentication** flow.
:::

Please follow [this](https://github.com/multiversx/mx-sdk-js-native-auth-server) for more details about verifying the signature of a login token (i.e. within a server-side component of the dApp).
