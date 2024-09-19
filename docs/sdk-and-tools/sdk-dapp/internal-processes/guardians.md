---
id: guardians
title: Guardians
---

[comment]: # (mx-abstract)

## Introduction

The guardians feature adds an extra signing layer on top of transactions. This means that a guarded account (having the `isGuarded` flag set to true) will require a Guardian to sign the transaction before it can be executed.

[comment]: # (mx-context-auto)

### Specifications of a guarded transaction

The differences between a guarded transaction and a simple transaction are the following:
- it contains the `guardianAddress` field
- `gasLimit` has an extra `50000` gas added to it
- `options` field needs to have the second least signinficant bit set to "1" (ex: options: `2`)
- `version` field needs to be set to `2`

This is how a transaction can be formatted using `@multiversx/sdk-core`:

```js
transaction.setGuardian(Address.fromBech32(activeGuardianAddress));
transaction.setVersion(TransactionVersion.withTxOptions());
transaction.setOptions(TransactionOptions.withOptions({
    guarded: true,
    hashSign: true // if available
}));
```

[comment]: # (mx-context-auto)

### Signing the transaction

Once these fields are set, the transaction must be signed by both Guardian (adding the `guardianSignature` field) and UserSigner (adding the `signature` field).
All signing providers (except Ledger) take care internally of formatting the transaction, as described above (excluding adding the extra `gasLimit`).

[comment]: # (mx-context-auto)

#### Signing the transaction with Ledger 

After formatting the transaction and applying the signature provided by the Ledger device, the transaction must be signed by the Guardian. This is done by sending the transaction (or transactions array) to the web wallet 2FA hook. The web wallet will then prompt the user to sign the transaction with the Guardian account, and respond with the signed transaction.

```js
import { CrossWindowProvider } from "@multiversx/sdk-web-wallet-cross-window-provider";

// instantiate wallet cross-window provider
await CrossWindowProvider.getInstance().init();
const crossWindowProvider = CrossWindowProvider.getInstance();
crossWindowProvider.setWalletUrl(WALLET_PROVIDER_URL);

// set sender
const ledgerSenderBech32 = await this.hwProvider.getAddress();
const ledgerSender = new Address(senderBech32);
const sender = ledgerSender; // or "erd1...abc" witohut awaiting `getAddress()`
crossWindowProvider.setAddress(sender);

// the user signs transactions on ledger so we need to perform an extra
// user action with a confirmation popup so the browser opens the new tab
crossWindowProvider.setShouldShowConsentPopup(true);

const guardedTransactions = await crossWindowProvider.guardTransactions(
    signedTransactions
);
```

For a working example see the code used in [signing-providers](https://github.com/multiversx/mx-sdk-js-examples/blob/594465208fd3a9d5c57bca8ecc94f2dc59cbf4a6/signing-providers/src/hw.js#L87)

