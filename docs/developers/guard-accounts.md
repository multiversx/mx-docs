---
id: guard-accounts
title: Guard accounts
---

[comment]: # (mx-abstract)

On this page, you will find comprehensive information on all aspects of guarded (co-signed) transactions.

[comment]: # (mx-context-auto)

## Introduction

Phishing attacks that scam people have become a constant problem on blockchains in general, especially when newbies to the crypto world are granted easy access to this new economy. In light of these new challenges, it is important to continue educating people on specific ways to protect themselves while also considering new methods to add protection against such attacks. That's how we came to a method that we called Guardians, an optional security feature that any user can enable.

[comment]: # (mx-context-auto)

### Trusted Co-Signer Service (TCS)

In the proposed setup, an off-chain handshaking process is necessary between the user and the guardian to ensure transaction security. This protocol requires integration at the wallet application level, such as the MultiversX web wallet, MultiversX wallet extension, or xPortal wallet app. The purpose of the guardian feature is to protect users whose accounts may have been compromised due to leaked secret keys.

Let's consider a scenario where two friends, Alice and Bob, have MultiversX wallets with addresses addrAlice and addrBob, respectively. Alice asks Bob to become her guardian, and after Bob agrees, Alice sets addrBob as her guardian. Once the guardian signing is activated through the GuardAccount function (which can only be done 20 days after setting the guardian), every transaction from Alice requires not only her signature but also Bob's signature.

For example, when Alice creates a guarded transaction to transfer 1 EGLD to Charlie, the transaction includes two new fields: GuardianAddr and GuardianSignature, in addition to the regular transaction details. Alice signs the transaction and sends it to Bob for co-signing. The wallet back-end can handle the transaction submission and temporarily store incomplete guarded transactions, displaying them in the guardian wallet (Bob's wallet) as "transactions waiting for guardian approval." Bob then verifies if these transactions are genuinely from Alice or from someone impersonating her. In this scenario, Bob can directly ask Alice if the pending transaction is hers. If confirmed, he will sign it; otherwise, he may choose to reject it.

While this process appears feasible in theory, there may be practical challenges. Alice might not want to wait for Bob's approval for a DEX transaction, or Bob could be overwhelmed with transactions from both Alice and potentially Eve, who gained access to Alice's secret key. Thus, it is crucial to automate the entire process to balance security and user experience without imposing high costs. One proposed automation solution is to use a Trusted Co-Signer (TCS) service that acts as a guardian, based on 2FA validation. This solution requires support from all wallet implementations that offer guardian-setting flows. In the case of the xPortal wallet, the application on the device will act as the guardian, optimizing the communication and eliminating the need for the TCS service.

[comment]: # (mx-context-auto)

## For developers

If you are a developer and you understand what a transaction is, what fields it contains and how a signing of a transaction happens you may be interested in the technical aspects of the implementation.  On top of a regular transaction, 2 new fields must be filled in:
- [NEW] `guardian` - representing the address of the Guardian that has to co-sign the transaction
- [NEW] `guardianSignature` - representing the the signature computed by the guardian

Also, some other fields have to be altered:
- `version` needs to be at least `2`
- `options` needs to have the second least significant bit set to `1`. For example: `0011` _bin_ = `3` _dec_

The full activation of a guardian requires two actions:
1. Setting a Guardian
2. Guard the account

After guarding the account, _almost_ every action the user takes should be co-signed by the guardian.

:::note
**Why not mandate that every transaction is co-signed by a guardian when an account is guarded?**

This is done in order to not have the user locked out of his account (e.g user guards his account but the guardian also loses access to his account). For this reason, the user should not only be able to **_set up a new guardian_**, but also **_change the guardian_** if he wishes so (e.g when the guardian is compromised).
:::

[comment]: # (mx-context-auto)

### Setting & Changing the guardian

[comment]: # (mx-context-auto)

### Set a Guardian

In order to register a guardian a user has to set a **guardian** address by sending a ```SetGuardian``` transaction (described in built-in functions [here](/developers/built-in-functions#setguardian)). The guardian address becomes active after **20 epochs**, a period longer than the unbond time (**10 epochs**). The guardian address should be set into the account’s key-value store.

[comment]: # (mx-context-auto)

### Guard account

In order to activate guardian signing (co-signing) a ```GuardAccount``` builtin function transaction needs to be sent to MultiversX network. A guard account transaction can be issued by the account and processed by the protocol only if the account has an ```activeGuardian``` (see [guardian-data fields](/sdk-and-tools/rest-api/addresses#get-address-guardian-data)) already set (which implies that the **20 epochs** since sending the ```SetGuardian``` already passed). When the account is guarded, any transaction issued by the owner of the account would be ignored unless it also carries the signature of its set guardian. This transaction could be sent either directly from the user or also through a relayer, if the user does not have the egld required for the transaction fee.

The field ```"guarded":true``` in [guardian-data fields](/sdk-and-tools/rest-api/addresses#get-address-guardian-data) specifies that the ```GuardAccount``` transaction was executed and was successful for the account. In this case all transactions from the user account, to be executed by the protocol, will require to be guarded transactions, and the guardian to be the activeGuardian of the account. The only exception is the SetGuardian transaction which can as well be sent through a regular transaction, in which case, the new guardian will become pending for 20 epochs, and at the end of these 20 epochs replace the current active guardian.

In case ```"guarded":false``` even if there is a non-empty ```activeGuardian```, the protocol will still only execute regular (non-guarded) transactions.

:::note
The exception is the ```setGuardian``` transaction which can either:

- be executed immediately if it is co-signed by the active guardian and **cleans up any pending guardian activation**;
- not be confirmed by the guardian but in this case the guardian can only be set with an activation time in future (e.g the same 20 epochs from the initial setting of a guardian).

:::

:::note
The ```GuardAccount``` transaction should clear any pending guardian.
:::

[comment]: # (mx-context-auto)

### Sending guarded (co-signed) transactions

Sending a guarded transaction will follow the same process of using the [Send Transaction](/sdk-and-tools/rest-api/transactions#send-transaction) endpoint. In order for the transaction to be accepted by the protocol (when account is guarded and more than 20 epochs passed after sending the ```SetGuardian``` transaction), the optional fields ```guardian``` and ```guardianSignature``` have to be completed along with the proper version and option.

:::info
For a Guarded Transaction the **Version** must be set to **2** and **Options** needs to have the second least significant bit set to `1`.
:::

A guarded transaction would look like:

```rust
{
    "nonce": 2,
    "value": "0",
    "receiver": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "sender": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "guardian": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    "gasPrice": 1000000000,
    "gasLimit": 1177500,
    "data": "U2V0R3VhcmRpYW5AYjEzYTAxNzQyM2MzNjZjYWZmOGNlY2ZiNzdhMTI2MTBhMTMwZjQ4ODgxMzQxMjJjNzkzN2ZlYWUwZDZkN2QxN0A3NTc1Njk2NA==", #base64 representation of Setting a Guardian
    "signature": "08e324107be096fa887d3a7679c1a612f138a7fb99936c60f767ac2ff98bd9cb1d161f738971da3934aac639de83870e03fdf0753f40b59b250334ffc881af03",
    "guardianSignature": "595a2fe26259c68789450f479515d40455b54507caf3a2e9bf62aa5e67ba45d38ea15c9ed06abb43a9a3644315ea2e3efefb83ce4a0f08ab89a99ac878049f01",
    "chainId": "local-testnet",
    "version": 2,
    "options": 2,
}
```

:::info
Both sender and guardian must sign the following serialized transaction:
```rust
{
    "nonce": 2,
    "value": "0",
    "receiver": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "sender": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "guardian": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    "gasPrice": 1000000000,
    "gasLimit": 1177500,
    "data": "U2V0R3VhcmRpYW5AYjEzYTAxNzQyM2MzNjZjYWZmOGNlY2ZiNzdhMTI2MTBhMTMwZjQ4ODgxMzQxMjJjNzkzN2ZlYWUwZDZkN2QxN0A3NTc1Njk2NA==", #base64 representation of Setting a Guardian
    "signature": "",
    "guardianSignature": "",
    "chainId": "local-testnet",
    "version": 2,
    "options": 2,
}
```
:::

[comment]: # (mx-context-auto)

### Deactivate guarding the account

For unguarding the account, a guarded ```UnGuardAccount``` transaction has to be sent (see details in [built-in functions](/developers/built-in-functions#unguardaccount)).

[comment]: # (mx-context-auto)

### Change the Active Guardian

Accounts can still be compromised by phishing attacks or other different ways. For unknown reasons, you may be confronted with the necessity to change the active guardian. The scope of account guarding is to protect users in case of a compromised account, but there are edge cases where it is uncertain whether a user or a scammer is changing the guardian, potentially leading to a scammer taking control of a user's funds. To address this issue, additional measures are necessary to allow users to protect their funds. One solution is the need for an activation time for setting a new guardian. If the transaction is not confirmed by an existing guardian, the activation time will give the user a chance to take action before the new guardian is set. In case the guardian confirms the transaction, the change will be made immediately. This solution will ensure that users have control over their accounts and can protect their funds even in the face of unexpected changes.

Taking into account the aforementioned considerations for changing to a new guardian, it's worth noting that a user must send a new ```SetGuardian``` ([described here](/developers/built-in-functions#setguardian)) transaction to change guardians. This transaction may either be unguarded (meaning that the guardian does not have to co-sign it, so the transaction will not contain a guardian address on the ```guardian``` field, nor the ```guardianSignature```, with proper transaction version and option, see [transaction fields](/sdk-and-tools/rest-api/transactions#send-transaction)), or it may be a guarded transaction (in the event that the account was already guarded). In the case of an unguarded transaction, it will take 20 days to become active, whereas a guarded transaction will occur instantly.

If the sent ```SetGuardian``` transaction is an unguarded one, the user will be able to see ```pendingGuardian``` set ([along with the activation epoch](/sdk-and-tools/rest-api/addresses#get-address-guardian-data)). On the other hand, if the transaction is a guarded one, the new guardian will become directly active.

[comment]: # (mx-context-auto)

## For users

[comment]: # (mx-context-auto)

### Wallet Extension

The process of utilizing the wallet extension generally remains unchanged, with one additional step. Now, whenever you wish to initiate a guarded transaction, you will need to input the 2FA code for the TCS service. This step ensures that your transaction is properly signed by the guardian. Refer to [wallet-extension](/wallet/wallet-extension#guardian) page for more information.

[comment]: # (mx-context-auto)

### Web-Wallet

Follow on details about web-wallet [here](/wallet/web-wallet.md#guardian).

[comment]: # (mx-context-auto)

### xPortal

**xPortal** fully supports the guardians feature. For more details, see [**invisible guardians**](/wallet/xportal/#what-are-invisible-guardians). 

[comment]: # (mx-context-auto)

### Ledger

The **MultiversX App** for **Ledger** supports the guardians feature (since version **v2.2.2**, released in August 2023). To set up a guardian for a Ledger account, follow [these steps](/wallet/web-wallet.md#guardian).

[comment]: # (mx-context-auto)

## For integrators

There should be no impact on integrators who utilize the [sdk-dapp](https://github.com/multiversx/mx-sdk-dapp). For everybody else, let's take the subject in the thread open on this [Discord](https://discord.com/channels/1045353153073258557/1110128760595959838) channel.

[comment]: # (mx-context-auto)

### Trusted Co-Signer Service for Guardians

In the future we want to publish the codebase to MultiversX TCS so that third party TCS service providers will be allowed to be listed in the MultiversX wallet, this process of launching a TCS guardian service needs to be defined.
