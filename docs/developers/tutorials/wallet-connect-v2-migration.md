---
id: wallet-connect-v2-migration
title: WalletConnect 2.0 Migration
---

[comment]: # (mx-context-auto)

## Using `sdk-dapp`

Using `@multiversx/sdk-dapp` >= `2.2.8` or `@elrondnetwork/dapp-core` >= `2.0.0`

WalletConnect 2.0 is already integrated, only not enabled by default.

Follow [these steps](/sdk-and-tools/sdk-dapp/#walletconnect-20-setup) to generate and add a `walletConnectV2ProjectId` and set the `isWalletConnectV2` flag

--------------

[comment]: # (mx-context-auto)

## Using `sdk-wallet-connect-provider`

Using `@multiversx/sdk-wallet-connect-provider` >= 3.0.1 or `@elrondnetwork/erdjs-wallet-connect-provider`

Since the WalletConnect 2.0 implementation was complimentary to the existing 1.0 version, there should be no breaking changes to upgrade the library

Check out some detailed examples [here](/sdk-and-tools/sdk-js/sdk-js-signing-providers/#the-wallet-connect-provider).

To Set up the 2.0 functionality you can check out the examples here: [https://github.com/multiversx/mx-sdk-js-examples](https://github.com/multiversx/mx-sdk-js-examples) or a more advanced implementation on sdk-dapp here: [https://github.com/multiversx/mx-sdk-dapp/blob/main/src/hooks/login/useWalletConnectV2Login.ts](https://github.com/multiversx/mx-sdk-dapp/blob/main/src/hooks/login/useWalletConnectV2Login.ts)

The main difference between V1 and V2 is in the `login` method where we now have to first `connect()` to get the `uri` and the `approval` Promise

```js
await provider.init();
const { uri, approval } = await provider.connect();        

await openModal(uri);        

try {
    await provider.login({ approval, token }); // optional token
} catch (err) {
    console.log(err);
    alert('Connection Proposal Refused')
}
```

Another difference is in the `callbacks` where on WalletConnect 2.0 we have a third one for events:

```js
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
```

`signTransaction`, `signTransactions`, `logout`, etc remain the same for the library user since the action happens in the provider directly.
