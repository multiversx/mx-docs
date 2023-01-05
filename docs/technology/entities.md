---
id: entities
title: Entities
---

There are two primary entities in MultiversX (previously Elrond): users and nodes.

A **user** is anyone holding one or more pairs of keys (one secret, one public). Using a pair of keys, the user can submit signed transactions to the network. The MultiversX (previously Elrond) network treats each pair of keys as an _account_, and each account implicitly has an associated amount of EGLD tokens, called the _balance_ of the account. Moreover, an account also has an associated mapping storage, which holds arbitrary values.

An account is uniquely identified by its _address_. The MultiversX (previously Elrond) network defines the address of an account to be equal to the public key of its corresponding pair of keys (the secret key remains known only by the user that owns the key pair). The public key is 32 bytes in length, which means that the address of an account is 32 bytes as well. As a standard, the MultiversX (previously Elrond) network uses the Bech32 human-readable representation for account addresses.

Users normally manage the keys of their accounts using _wallets_, which are applications dedicated to securely contain these keys. While it's completely possible to manage one's keys and accounts without a wallet application, it is an uncommon practice and employed mostly by advanced users or by automated processes. The **nodes** are the devices connected to the MultiversX (previously Elrond) network, which perform the operations requested by its users. Nodes can be either passive or actively engaged in processing tasks. _Eligible validators_ are active participants in the network. Specifically, they are responsible for performing consensus, adding blocks, maintaining the state, and they are also rewarded for their contribution. Each eligible validator can be uniquely identified by its 96-byte-long BLS public key (not to be confused with account keys, which are generated with the Schnorr algorithm).

A user that manages one or multiple nodes is called a **node operator**. These users must stake a substantial amount of EGLD tokens for each of their node as a collateral, effectively vouching for the correctness and performance of the nodes. The network locks the staked amount, which cannot be accessed by the node operator unless they withdraw both the stake _and the nodes_. Nodes that have been staked for by a user are promoted to **validator** status, and they may participate in consensus and earn rewards for their contribution. Without staking, nodes remain **observers** of the network. While passive, observers are still important in the network.
