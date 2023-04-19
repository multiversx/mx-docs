---
id: guard-accounts
title: Guard accounts
---

[comment]: # (mx-abstract)

On this page, you will find comprehensive information on all aspects of guarded (co-signed) transactions.

[comment]: # (mx-context-auto)

# Introduction

Scamming people through phishing attacks has become a constant problem on blockchains in general, especially when people new to crypto are given easy access to this new economy. In light of these new challenges, while educating people to the specific ways to protect themselves continues to be important, it becomes equally important to think of new methods of adding protection against such attacks.

[comment]: # (mx-context-auto)

# For consumers

## Web-Wallet

## xPortal

There is no solution released for the **xPortal Wallet**. As soon as there is one, it will be documented and referenced here.

## Ledger

There is no solution released for the **Ledger**. As soon as there is one, it will be documented and referenced here.

# For developers

This can be achieved by adding another field in the transaction structure for a second signature, and defining the option to flag the transactions that are supposed to be executed/verified as multisig transactions. The option field in the transaction is currently used to differentiate between transactions where the signature should be verified over the marshaled transaction and transactions where the signature should be verified over the hash of the transaction, but additional options could be defined.

The full activation of the extra protection requires two actions:

**1. Registering a guardian**

**2. Guarding the account**

## Registering & Changing the guardian



### Registration

### Change

## Guard account

## Sending guarded (co-signed) transactions

## Deactivate guarding the account

