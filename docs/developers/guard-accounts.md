---
id: guard-accounts
title: Guard accounts
---

[comment]: # (mx-abstract)

On this page, you will find comprehensive information on all aspects of guarded (co-signed) transactions.

[comment]: # (mx-context-auto)

# Introduction

Phishing attacks that scam people have become a constant problem on blockchains in general, especially when newbies to the crypto world are granted easy access to this new economy. In light of these new challenges, it is important to continue educating people on specific ways to protect themselves while also considering new methods to add protection against such attacks. That's how we came to a method that we called Guardians, with the scope of having a guardian for each account.

[comment]: # (mx-context-auto)

# For consumers

## Web-Wallet

## xPortal

There is no solution released for the **xPortal Wallet**. As soon as there is one, it will be documented and referenced here.

## Ledger

There is no solution released for the **Ledger**. As soon as there is one, it will be documented and referenced here.

# For developers

If you are a developer and you understand what a transaction is, what fields it contains and how a signing of a transaction happens you may be interested by the technical aspects of the implementation.  can be achieved by adding another field in the transaction structure for a second signature, and defining the option to flag the transactions that are supposed to be executed/verified as multisig transactions. The option field in the transaction is currently used to differentiate between transactions where the signature should be verified over the marshaled transaction and transactions where the signature should be verified over the hash of the transaction, but additional options could be defined.

The full activation of the extra protection requires two actions:

**1. Register a Guardian**

**2. Guard the account**

After guarding the account, _almost_ every action the user takes should be co-signed by the guardian.

:::note
**Why not mandate that every transaction is co-signed by a guardian when an account is guarded?**

This is done in order to not have the user locked out of his account (e.g user guards his account but the guardian also loses access to his account). For this reason, the user should not only be able to **_set up a new guardian_**, but also **_change the guardian_** if he wishes so (e.g when the guardian is compromised).
:::

## Registering & Changing the guardian



### Register a Guardian

In order to register a guardian a user has to set a **guardian** address by sending a ```SetGuardian``` transaction (described in built-in functions [here](/developers/built-in-functions#setguardian)). The guardian address becomes active after **20 epochs**, a period longer than the unbond time (**10 epochs**). The guardian address should be set into the account’s key-value store.

### Change the Active Guardian

Accounts will continue to be compromised. For unknown reasons, you may be confronted with the necessity to change the active guardian. The scope of account guarding is to protect users in case of a compromised account, but there are edge cases where it is uncertain whether a user or a scammer is changing the guardian, potentially leading to a scammer taking control of a user's funds. To address this issue, additional measures are necessary to allow users to protect their funds. One solution is the implement for an activation time for setting a new guardian. If the transaction is not confirmed by an existing guardian, the activation time would give the user a chance to take action before the new guardian is set. In case the guardian confirms the transaction, the change could be made immediately. This solution would ensure that users have control over their accounts and can protect their funds even in the face of unexpected changes.

Taking into account the aforementioned considerations for changing to a new guardian, it's worth noting that a user must send a new ```SetGuardian``` ([described here](/developers/built-in-functions#setguardian)) transaction to change guardians. This transaction may either be unguarded (meaning that the guardian does not have to co-sign it, so the transaction will not contain a guardian address on the ```guardian``` field, nor the ```guardianSignature```, with proper transaction version and option, see [transaction fields](/sdk-and-tools/rest-api/transactions#send-transaction)), or it may be a guarded transaction (in the event that the account was already guarded). In the case of an unguarded transaction, it will take 20 days to become active, whereas a guarded transaction will occur instantly.

If the sent ```SetGuardian``` transaction is an unguarded one, the user will be able to see ```pendingGuardian``` set ([along with the activation epoch](/sdk-and-tools/rest-api/addresses#get-address-guardian-data)). On the other hand, if the transaction is a guarded one, the new guardian will become directly active.

## Guard account

A guard account transaction can be issued by the account and processed by the protocol only if the account has an ```activeGuardian``` (see [guardian-data fields](/sdk-and-tools/rest-api/addresses#get-address-guardian-data)) already set (which implies that the **20 epochs** since sending the ```SetGuardian``` already passed). When the account is guarded, any transaction issued by the owner of the account would be ignored unless it also carries the signature of its set guardian. This transaction could be sent either directly from the user or also through a relayer, if the user does not have the egld required for the transaction fee. 

:::note
The exception is the ```setGuardian``` transaction which can either:

- be executed immediately if it is co-signed by the active guardian and **cleans up any pending guardian activation**;

- not be confirmed by the guardian but in this case the guardian can only be set with an activation time in future (e.g the same 20 epochs from the initial setting of a guardian).
:::

:::note
The ```GuardAccount``` transaction should clear any pending guardian.
:::

## Sending guarded (co-signed) transactions

Sending a guarded transaction will follow the same process of using the [Send Transaction](/sdk-and-tools/rest-api-/transactions#send-transaction) endpoint. In order for the transaction to be accepted by the protocol (when account is guarded and more than 20 epochs passed after sending the ```SetGuardian``` transaction), the optional fields ```guardian``` and ```guardianSignature``` have to be completed along with the proper version and option.

:::info
For a Guarded Transaction the **Version** must be set to **2** and **Options** must have the **second bit** set.
:::

A guarded transaction would look like:

```json
{
    "nonce": 2,
    "value": "0",
    "receiver": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "sender": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "guardian": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    "gasPrice": 1000000000,
    "gasLimit": 1177500,
    "data": "U2V0R3VhcmRpYW5AYjEzYTAxNzQyM2MzNjZjYWZmOGNlY2ZiNzdhMTI2MTBhMTMwZjQ4ODgxMzQxMjJjNzkzN2ZlYWUwZDZkN2QxN0A3NTc1Njk2NA==", #base64 representation of Seting a Guardian
    "signature": "08e324107be096fa887d3a7679c1a612f138a7fb99936c60f767ac2ff98bd9cb1d161f738971da3934aac639de83870e03fdf0753f40b59b250334ffc881af03",
    "guardianSignature": "595a2fe26259c68789450f479515d40455b54507caf3a2e9bf62aa5e67ba45d38ea15c9ed06abb43a9a3644315ea2e3efefb83ce4a0f08ab89a99ac878049f01",
    "chainId": "local-testnet",
    "version": 2,
    "options": 2,
}
```

:::info
Both sender and guardian must sign the following serialized transaction:
```json
{
    "nonce": 2,
    "value": "0",
    "receiver": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "sender": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "guardian": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    "gasPrice": 1000000000,
    "gasLimit": 1177500,
    "data": "U2V0R3VhcmRpYW5AYjEzYTAxNzQyM2MzNjZjYWZmOGNlY2ZiNzdhMTI2MTBhMTMwZjQ4ODgxMzQxMjJjNzkzN2ZlYWUwZDZkN2QxN0A3NTc1Njk2NA==", #base64 representation of Seting a Guardian
    "signature": "",
    "guardianSignature": "",
    "chainId": "local-testnet",
    "version": 2,
    "options": 2,
}
```
:::

## Deactivate guarding the account



# For integrators
