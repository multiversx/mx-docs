---
id: wallet-keys
title: Wallet Keys
---

# Wallet Keys

The keys for your EGLD wallet.

The Wallet Keys are used to access the address from which you send the staking transaction. Your EGLD holdings leave this address and are deposited into a staking smart contract. Rewards are sent to this address, or maybe a different one of your choosing . 



This wallet is the only one that can be used to send an un-stake transaction, meaning to recover your 2 500 EGLD from the staking smart contract.‌

You can create a new Wallet Key at [https://wallet.elrond.com](https://wallet.elrond.com/). The resulting file(s) will have the default name `<wallet address>.json`, for example:

```
erd13kgks9km5ky8vj2dfty79v769ej433k5xmyhzunk7fv4pndh7z2s8depqq.json
```

You can rename the file to something easy to remember. You can retrieve the address from the file by editing it with a text editor. Open it and look for the `bech32` address, which always starts with `erd1...`