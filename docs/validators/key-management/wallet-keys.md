---
id: wallet-keys
title: Wallet Keys
---

As a Validator you use the Wallet Keys to access the address from which you send the staking transaction. Your EGLD holdings leave this address and are deposited into a staking smart contract. Rewards are sent to this address. You can change it later on by using a `changeRewards` transaction.

This wallet is the only one that can be used to send an un-stake transaction, meaning to recover your 2500 EGLD from the staking smart contract.

A Wallet Ket can be created via multiple ways that are described on the [Wallets section](/wallet/overview/).

The wallets use the bip44 standard with the mention that because MultiversX uses Ed25519 only hardened paths are used. Our coin_type is 508, making the path for the first address:m/44'/508'/0'/0'/0’
