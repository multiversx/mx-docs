---
id: intro
title: Intro to ESDT
---

Fungible tokens, such as cryptocurrencies, are interchangeable and have the same value as other tokens of the same type. Non-fungible tokens (NFTs) are unique digital assets that are assigned unique identification codes and metadata, making them one-of-a-kind. Semi-fungible tokens are a combination of the two, offering both interchangeable and unique properties. For us they are ESDTs.

With ESDTs, you can take advantage of the security, transparency, and versatility of MultiversX blockchain technology to manage and transfer your assets.

[comment]: # (mx-context-auto)

## ESDT

ESDT stands for eStandard Digital Token.

One important implication is that a token issued on MultiversX does not need a dedicated smart contract. Token transactions do not require the Virtual Machine at all.

This greatly enhances the efficiency and cost of managing and transferring any kind of token. In effect, this means that custom tokens are as fast and as scalable as the native EGLD token itself.

The ESDT standard is used to manage fungible, semi-fungible and non-fungible tokens at protocol level.

Users also do not need to worry about sharding when transacting custom tokens, because the protocol employs the same handling mechanisms for ESDT transactions across shards as the mechanisms used for the EGLD token. Sharding is therefore automatically handled and invisible to the user.

Technically, the balances of ESDT tokens held by an account are stored directly under the data trie of that Account. It also implies that an account can hold balances of any number of custom tokens, in addition to the native EGLD balance. The protocol guarantees that no account can modify the storage of ESDT tokens, neither its own nor of other accounts.

ESDT tokens can be issued, owned and held by any account on the MultiversX network, which means that both users and smart contracts have the same functionality available to them. Due to the design of ESDT tokens, smart contracts can manage tokens with ease, and they can even react to an ESDT transfer.

[comment]: # (mx-context-auto)

## Table of contents

| Name                                                                    | Description                                            |
|-------------------------------------------------------------------------|--------------------------------------------------------|
| [Specs](https://github.com/multiversx/mx-specs/blob/main/ESDT-specs.md) | Official specifications of MultiversX's token standard |
| [Fungible tokens](/tokens/fungible-tokens)                              | Fungible ESDT tokens                                   |
| [Semi-fungible tokens](/tokens/nft-tokens)                              | Semi-Fungible ESDT tokens                              |
| [Non-fungible tokens](/tokens/nft-tokens)                               | Non-Fungible ESDT tokens                               |
| [Meta ESDT tokens](/tokens/nft-tokens)                                  | Meta ESDT tokens                                       |