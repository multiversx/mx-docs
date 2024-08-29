---
id: faq
title: Frequently Asked Questions
---

[comment]: # "mx-abstract"

This page contains answers to frequently asked questions about connecting an application to MultiversX, be it an exchange, wallet, dApp, Web3 indexer or data provider.

## General information

### What is the native token of MultiversX?

**EGLD** on Mainnet, **XeGLD** on Devnet and Testnet. The atomic unit of the native token (think of `wei` for Ethereum) is not named.

```
1 EGLD = 10^18 atomic units = 1000000000000000000 atomic units
```

See [constants](/developers/constants).

### What kind of consensus does MultiversX use?

See more at [secure proof of stake](/learn/consensus).

### What is the block time (round duration)?

The block time (round duration) is [6 seconds](/developers/constants). Also see [the welcome page](/welcome/welcome-to-multiversx).

### Does MultiversX employ sharding?

Currently, the MultiversX network has 3 regular shards, plus a special one, called the _metachain_ - this arrangement holds not only on _mainnet_, but also on _devnet_ and _testnet_.

Transactions between accounts assigned to the same shard are called _intra-shard transactions_. Transactions between accounts located in distinct shards are called _cross-shard transactions_.

More details about the sharded architecture of MultiversX can be found [here](/learn/sharding).
Integrators may choose to have a unified view of the network, leveraging the [hyperblock](/integrators/egld-integration-guide) abstraction.

## Wallet

### What signature scheme does MultiversX use?

For transactions, [ed25519](/developers/signing-transactions/signing-transactions) is used.

### What BIP-0044 coin type is being used?

CoinType is **508**, according to: [SLIP-0044](https://github.com/satoshilabs/slips/blob/master/slip-0044.md).

### What is the derivation path for wallets?

The derivation path is `m/44'/508'/0'/0'/{address_index}'`. That is, the _account index_ stays fixed at `0`, while the _address index_ is allowed to vary.

## Transactions

### What is the schema of a transaction?

See [transactions](/learn/transactions).

### How to determine the status of a transaction?

See [querying the blockchain](/integrators/querying-the-blockchain).

### What can be said about transactions finality?

A transaction is final when the block or blocks (for cross-shard transactions) that notarize it have been declared **final**.
Generally speaking, a transaction can be considered final as soon as it presents the _hyperblock coordinates_ (hyperblock nonce and hyperblock hash) when queried from the network, and these coordinates are under (older than) the [latest final hyperblock](/integrators/querying-the-blockchain#querying-finality-information).

For more details, see [integration guide](/integrators/egld-integration-guide) and [querying the blockchain](/integrators/querying-the-blockchain).

## Accounts

### How does an address look like?

An **account** is identified by an **address**, which is the **bech32-encoded** public key of the account.
For the **bech32** encoding, the human-readable part (HRP) is `erd`.

### Types of accounts

Both _regular user accounts_ and _smart contract accounts_ can hold tokens: EGLD and ESDT tokens (fungible, semi-fungible or non-fungible ones).

Regular user accounts can sign transactions using their private key. Smart contracts cannot create actual transactions, as they cannot sign them. Instead, they interact with other accounts by crafting so-called _unsigned transactions_ (or smart contract results).

### How are accounts created?

Regular user accounts get created on the blockchain when the corresponding address receives tokens for the first time. On the other hand, (user-defined) smart contract accounts are created when a smart contract is deployed. The address of a smart contract is a function of `[address of the deployer, nonce of deployment transaction]`. For a smart contract account, there is no (known) private key.

### How to distinguish between a normal account and a smart contract?

Examples of addresses:
 - **regular user account:** `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`
 - **smart contract:** `erd1qqqqqqqqqqqqqpgqq66xk9gfr4esuhem3jru86wg5hvp33a62jps2fy57p`

If the address (decoded as bytes) has a prefix of 8 bytes of `0x00`, then it refers to a smart contract.

## Smart Contracts

There are two types of smart contracts on MultiversX: **system smart contracts** and **user-defined smart contracts**. System smart contracts are coded into the Protocol itself, while user-defined smart contracts are developed and deployed by users. The latter are written primarily in **Rust**. The Virtual Machine uses the **WASM** format, by leveraging the [Wasmer](https://wasmer.io/) engine.

### How to detect contract deployment events?

Look for events of type [`SCDeploy`](/developers/event-logs/contract-deploy-events).

### Is it possible to upgrade a smart contract?

Yes, if the `upgradeable` flag is set in the contract's [metadata](/developers/data/code-metadata). Also see [upgrading smart contracts](/developers/developer-reference/upgrading-smart-contracts).

