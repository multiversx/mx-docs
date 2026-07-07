---
id: terminology
title: Terminology
description: "A glossary of MultiversX terms across blockchain foundations, protocol and architecture, consensus and security, tokens, nodes and staking, wallets, ecosystem applications, upgrades, and the SDK. Every entry is sourced."
---

A sourced reference for MultiversX terminology. Foundational terms are included on purpose: what is obvious to readers fluent in the docs is not obvious to first-timers. Every entry carries a Source line; features in phased rollout (for example Supernova) are noted as such.

## Blockchain foundations

Plain-language entries for readers new to MultiversX or to blockchains. The terms here are general concepts, defined with their MultiversX specifics. The MultiversX-specific machinery follows in later sections.

### Blockchain

A shared, append-only ledger maintained by a network of nodes that agree on its contents through a consensus mechanism.

Context: MultiversX is a layer-1 blockchain that settles its own transactions. Its ledger is partitioned across shards and secured by Secure Proof of Stake.

See also: [Layer 1](#layer-1-l1), [Shard (Execution Shard)](#shard-execution-shard), [Consensus](#consensus), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Layer 1 (L1)

A base blockchain that settles transactions on its own network rather than depending on another chain for security.

Context: MultiversX is a layer-1, in contrast to layer-2 networks that post their data or proofs to a separate base chain. Its scaling comes from sharding rather than from an external settlement layer.

See also: [Blockchain](#blockchain), [Adaptive State Sharding](#adaptive-state-sharding), [Sovereign Chains](#sovereign-chains).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Block

A batch of ordered transactions, cryptographically linked to the previous block, that extends the ledger.

Context: On MultiversX each shard produces its own blocks, one per round, and the metachain notarizes them. A block becomes final once the shard's validators reach the consensus threshold.

See also: [Round](#round), [Shard (Execution Shard)](#shard-execution-shard), [Metachain](#metachain), [Finality](#finality).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Transaction

A signed instruction from an account to move value, call a smart contract, or invoke a built-in function.

Context: A MultiversX transaction carries a sender, receiver, value, data, gas limit, gas price, nonce, and chain ID, plus optional guardian and relayer fields. It is signed by the sender's key and gossiped to the network for inclusion in a block.

See also: [Account Nonce](#account-nonce), [Gas and Fees](#gas-and-fees), [Built-in Functions](#built-in-functions), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/developers/transactions/tx-overview](https://docs.multiversx.com/developers/transactions/tx-overview/); [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core).

---

### Account

An entry in the ledger identified by an address, holding a balance, a nonce, and (for contracts) code and storage.

Context: MultiversX has user accounts, controlled by a key, and smart contract accounts, controlled by code. Both use the same bech32 address format; a contract account additionally holds its deployed code and storage.

See also: [Bech32 Addressing](#bech32-addressing-erd1), [Account Nonce](#account-nonce), [Smart Contract](#smart-contract), [Account State Trie](#account-state-trie).
Read more: [docs.multiversx.com/developers/account-management](https://docs.multiversx.com/developers/account-management/).

---

### Smart Contract

A program deployed to the blockchain that runs deterministically when called, holding its own balance and storage.

Context: On MultiversX, smart contracts compile to WebAssembly and most are written in Rust with the `multiversx-sc` framework. A contract is itself an account, callable by transactions and by other contracts.

See also: [WASM VM](#wasm-vm-and-wasmer), [multiversx-sc (mx-sdk-rs)](#multiversx-sc-mx-sdk-rs), [Account](#account), [Tx Syntax](#tx-syntax).
Read more: [docs.multiversx.com/developers/overview](https://docs.multiversx.com/developers/overview/).

---

### Consensus

The process by which the validators of a network agree on the next block and the order of its transactions.

Context: MultiversX uses Secure Proof of Stake: a proposer is chosen at random each round and the shard's validators sign the block, which becomes final once a two-thirds threshold is reached.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Consensus Group](#consensus-group), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp), [Finality](#finality).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Proof of Stake (PoS)

A consensus family in which the right to validate is tied to staked tokens rather than to computational work.

Context: Validators lock EGLD as stake and are selected to produce and sign blocks; misbehavior can cost rewards or stake. MultiversX's variant is Secure Proof of Stake.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Staking](#staking), [Validator (node)](#validator-node), [Byzantine Fault Tolerance](#byzantine-fault-tolerance-bft).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Byzantine Fault Tolerance (BFT)

The property of a consensus protocol that lets the network agree correctly even if some participants fail or act maliciously, up to a threshold.

Context: MultiversX tolerates faulty or adversarial validators below one-third of a shard's set; a block needs at least two-thirds of signatures to finalize, so a dishonest minority cannot forge agreement.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Consensus](#consensus), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Finality

The point at which a block and its transactions become irreversible.

Context: MultiversX has deterministic finality: a block is final the moment its consensus proof is produced, with no probabilistic confirmation window. Finality is distinct from block time, which is how often blocks are produced.

See also: [Deterministic Finality](#deterministic-finality), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp), [Block Time](#block-time), [Supernova](#supernova).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Deterministic Finality

Finality reached at a defined moment, when the consensus threshold is met, rather than becoming more probable as further blocks are added.

Context: On MultiversX a block is final once its Equivalent Consensus Proof is broadcast, and exactly one valid proof can exist per block, so equivocation is not possible. Probabilistic-finality chains, by contrast, treat a block as final only after enough subsequent blocks. Supernova preserves deterministic finality while cutting the time to reach it.

See also: [Finality](#finality), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp), [Supernova](#supernova), [Byzantine Fault Tolerance](#byzantine-fault-tolerance-bft).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Block Time

The interval between consecutive blocks on a shard.

Context: MultiversX block time is roughly 6 seconds on mainnet today. The Supernova upgrade is designed to reduce it to a 600-millisecond target; Supernova is pre-mainnet, so this reduction is not yet live. Block time bounds how quickly transactions can be included, and is distinct from finality, which is when a block becomes irreversible.

See also: [Round](#round), [Finality](#finality), [Supernova](#supernova).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus); MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)).

---

### Mempool

The pool of valid, pending transactions a node holds before they are included in a block.

Context: Because MultiversX is sharded, each shard's nodes maintain the mempool for the transactions they are responsible for. Supernova (pre-mainnet) is designed to propagate blocks by referencing transactions nodes already hold rather than rebroadcasting full block bodies.

See also: [Transaction](#transaction), [Shard (Execution Shard)](#shard-execution-shard), [Supernova](#supernova).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Hash

A fixed-size fingerprint of data produced by a one-way function, used to link blocks, identify transactions, and commit to state.

Context: MultiversX uses cryptographic hashes throughout: to chain blocks, to derive the randomness for proposer selection, and to compute the transaction hash that identifies a transaction.

See also: [Block](#block), [Verifiable Random Function](#verifiable-random-function-vrf), [Account State Trie](#account-state-trie).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Account State Trie

The tree structure in which the protocol stores account balances, nonces, code, and storage, committing the whole state to a single root hash.

Context: Each shard maintains its own state trie for the accounts it holds. Storing state as a trie lets the protocol prove and verify account data efficiently, and is what state sharding partitions across shards.

See also: [Account](#account), [Adaptive State Sharding](#adaptive-state-sharding), [Hash](#hash).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Move Balance

The value-transfer and data-handling part of a transaction's cost, as opposed to smart-contract execution.

Context: A plain EGLD transfer is a pure move-balance operation: it pays the minimum gas plus a per-data-byte cost and does not invoke the virtual machine. Contract calls add an execution component on top. The distinction is the basis of MultiversX's two-part fee model.

See also: [Gas and Fees](#gas-and-fees), [Transaction](#transaction), [Smart Contract Results](#smart-contract-results-scrs).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Miniblock

A container inside a block that holds an ordered list of transactions grouped by their (sender shard, receiver shard) pair.

Context: A single MultiversX block can contain several miniblocks, one per shard-to-shard direction. The miniblock is the atomic unit of cross-shard execution: either the entire miniblock is processed, or none of its transactions are applied and it is retried in the next round.

See also: [Block](#block), [Cross-Shard Transaction](#cross-shard-transaction), [Metablock](#metablock), [Cross-Shard Atomicity](#cross-shard-atomicity).
Read more: [docs.multiversx.com/learn/transactions](https://docs.multiversx.com/learn/transactions).

---

### Metablock

The metachain's own block, which notarizes the finalized shard block headers rather than carrying user transactions.

Context: When a shard block is final, the metachain records that block's header and miniblock hashes, together with its Equivalent Consensus Proof, in the next metablock. The metablock is what makes a shard block's cross-shard output visible network-wide.

See also: [Metachain](#metachain), [Notarization](#notarization), [Miniblock](#miniblock), [Hyperblock](#hyperblock).
Read more: [docs.multiversx.com/learn/transactions](https://docs.multiversx.com/learn/transactions).

---

### Genesis Round

The first round of the first epoch of the chain, containing the network's bootstrapping phase.

Context: MultiversX organizes time into rounds grouped into epochs; the genesis round is where the chain starts. Round length is fixed (currently 6 seconds) and an epoch is initially sized to last about 24 hours.

See also: [Round](#round), [Epoch](#epoch), [Block](#block).
Read more: [docs.multiversx.com/learn/chronology](https://docs.multiversx.com/learn/chronology).

---

### Intra-Shard Transaction

A transaction whose sender and receiver accounts belong to the same shard, processed entirely within that one shard.

Context: Because both accounts live in the same shard, an intra-shard transaction is executed and finalized in a single shard block, without the metachain-mediated round trip that cross-shard transactions require.

See also: [Cross-Shard Transaction](#cross-shard-transaction), [Shard (Execution Shard)](#shard-execution-shard), [Bech32 Addressing](#bech32-addressing-erd1).
Read more: [docs.multiversx.com/integrators/faq](https://docs.multiversx.com/integrators/faq/); [docs.multiversx.com/learn/transactions](https://docs.multiversx.com/learn/transactions).

---

### Cross-Shard Transaction

A transaction whose sender and receiver accounts belong to different shards, executed asynchronously across both shards with metachain notarization in between.

Context: A cross-shard transaction passes through the sender's shard, metachain notarization, and the receiver's shard. The source shard finalizes and ships a notarized cross-shard miniblock, and the destination shard picks it up and executes its part, so execution is asynchronous rather than atomic across the two shards.

See also: [Intra-Shard Transaction](#intra-shard-transaction), [Cross-Shard Atomicity](#cross-shard-atomicity), [Miniblock](#miniblock), [Metachain](#metachain).
Read more: [docs.multiversx.com/integrators/faq](https://docs.multiversx.com/integrators/faq/); [docs.multiversx.com/learn/transactions](https://docs.multiversx.com/learn/transactions).

---

### Verifiable Unpredictable Function (VUF)

A function that produces a random seed which is verifiable and unpredictable, used to derive the randomness that seeds proposer selection each round.

Context: MultiversX uses a VUF to generate the new random seed carried in each block, and a Verifiable Random Function over that seed to select the block proposer. The VUF output is verifiable and unpredictable, though not uniform, which is why a separate VRF step is applied for selection.

See also: [Verifiable Random Function (VRF)](#verifiable-random-function-vrf), [Block Proposer (Leader)](#block-proposer-leader), [Secure Proof of Stake (SPoS)](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Mainnet

The live, production MultiversX network, where transactions move real EGLD and real value.

Context: MultiversX mainnet launched in July 2020 and runs three execution shards plus the metachain. It is the network real applications and users transact on, as distinct from the public test networks.

See also: [Testnet](#testnet), [Devnet](#devnet), [EGLD](#egld), [Shard (Execution Shard)](#shard-execution-shard).
Read more: [docs.multiversx.com/learn/EGLD](https://docs.multiversx.com/learn/EGLD/).

---

### Testnet

A public test network that runs the same MultiversX protocol as mainnet, for testing applications without spending real EGLD.

Context: Testnet uses valueless test EGLD (xEGLD) obtained from a faucet. It mirrors mainnet behavior so applications can be validated before deployment.

See also: [Devnet](#devnet), [Mainnet](#mainnet), [Faucet](#faucet), [Chain Simulator](#chain-simulator).
Read more: [docs.multiversx.com/learn/EGLD](https://docs.multiversx.com/learn/EGLD/).

---

### Devnet

A public development network running the same MultiversX protocol, used to try features and applications earlier than testnet.

Context: Devnet is the earliest public network for developers and typically carries in-development work; like testnet it uses valueless xEGLD from a faucet. Many applications run on devnet before promoting to mainnet.

See also: [Testnet](#testnet), [Mainnet](#mainnet), [Faucet](#faucet), [Chain Simulator](#chain-simulator).
Read more: [docs.multiversx.com/learn/EGLD](https://docs.multiversx.com/learn/EGLD/).

---

### Faucet

A service on the test networks that dispenses valueless test tokens (xEGLD) to an account, so developers can transact without spending real funds.

Context: The web wallet on devnet and testnet includes a faucet that sends test xEGLD, subject to a rate limit; other community faucets exist. It is the standard way to fund an account for testing.

See also: [Testnet](#testnet), [Devnet](#devnet), [Web Wallet](#web-wallet), [EGLD](#egld).
Read more: [docs.multiversx.com/wallet/web-wallet](https://docs.multiversx.com/wallet/web-wallet/); [docs.multiversx.com/learn/EGLD](https://docs.multiversx.com/learn/EGLD/).

---

## Protocol and architecture

### Adaptive State Sharding

The MultiversX scaling design that splits the network into parallel shards across three dimensions at once (state, transactions, and network) and can change the number of shards in response to load.

Context: Each shard processes only the transactions whose sender or receiver belongs to it and stores only its own slice of global state, so capacity grows by adding shards rather than by making one chain faster. Mainnet has run a stable configuration of three execution shards plus a coordinating metachain since the July 2020 launch, because it has not been throughput-bound. "Adaptive" refers to the protocol-level ability to split or merge shards; that capability is present but latent at the current configuration.

See also: [Metachain](#metachain), [Hyperblock](#hyperblock), [Cross-Shard Atomicity](#cross-shard-atomicity), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding); founding whitepaper, *A Highly Scalable Public Blockchain via Adaptive State Sharding and Secure Proof of Stake* ([files.multiversx.com/multiversx-whitepaper.pdf](https://files.multiversx.com/multiversx-whitepaper.pdf)).

---

### Metachain

The blockchain that runs in a dedicated coordinating shard, whose responsibility is notarizing and finalizing shard block headers rather than processing user transactions.

Context: Since the Andromeda upgrade a shard block is final within its own shard once more than two-thirds (2/3+1) of that shard's validators have signed it, independent of the metachain. The metachain's role is cross-shard: it includes the header and miniblock hashes of each new shard block in its own block, which is what lets the destination shard process that block's cross-shard output. The metachain also computes validator reshuffling at epoch boundaries and arbitrates cross-shard messaging.

See also: [Hyperblock](#hyperblock), [Cross-Shard Atomicity](#cross-shard-atomicity), [Validator Reshuffle](#validator-reshuffle-epoch-boundary), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/integrators/faq](https://docs.multiversx.com/integrators/faq/).

---

### Hyperblock

A block-like abstraction that reunites data from all shards from the perspective of a metachain block, and contains only fully executed transactions, meaning transactions executed in both their source and destination shards, where the final step is notarized in the metachain block with that nonce.

Context: The hyperblock is the unit that represents synchronized cross-shard state at a point in the chain's history. It is distinct from a metachain block (the metachain's own block that notarizes shard headers). A cross-shard transaction's "hyperblock coordinates" are set once it is notarized on both shards with acknowledgment from the metachain. The concept predates the Supernova upgrade.

See also: [Metachain](#metachain), [Cross-Shard Atomicity](#cross-shard-atomicity), [Supernova](#supernova).
Read more: [docs.multiversx.com/integrators/querying-the-blockchain](https://docs.multiversx.com/integrators/querying-the-blockchain/); [docs.multiversx.com/sdk-and-tools/rest-api/blocks](https://docs.multiversx.com/sdk-and-tools/rest-api/blocks/).

---

### Cross-Shard Atomicity

Whether a transaction whose sender and receiver live in different shards is all-or-nothing across both. On MultiversX, cross-shard execution is asynchronous rather than atomic in that strict sense: each shard executes its part in its own block, and a step that fails on a later shard does not automatically reverse steps already completed on an earlier one.

Context: A cross-shard transaction passes through multiple blocks: the source shard finalizes and ships a notarized cross-shard miniblock, and the destination shard picks it up and executes it, mediated by the metachain. Because the parts execute in sequence rather than together, partial outcomes are possible. For example, a swap that completes on the source shard and forwards its result to another shard, where a follow-on step then fails, leaves the original swap in place unless the contract itself undoes it. Composability is therefore structurally asynchronous: a contract calling a contract on another shard receives the outcome in a callback, not as a synchronous return value, and is responsible for any compensating action on failure. This model has held since 2020; the Supernova upgrade compresses the wall-clock latency between the steps without changing it.

See also: [Metachain](#metachain), [Hyperblock](#hyperblock), [Supernova](#supernova), [Typed Proxies](#typed-proxies).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding); [github.com/multiversx/mx-chain-go](https://github.com/multiversx/mx-chain-go).

---

### Secure Proof of Stake (SPoS)

MultiversX's Byzantine-fault-tolerant proof-of-stake consensus mechanism, in which validators are assigned to per-shard consensus groups at random and a verifiable random function selects block proposers and signers.

Context: Eligibility to validate depends on staked EGLD. A verifiable random function selects the block proposer each round, and validator signatures are aggregated with a BLS multi-signature scheme into a single proof. Since the Andromeda upgrade the full shard validator set signs each block, and a block is final once at least two-thirds have signed, giving single-block deterministic finality. SPoS is paired with adaptive state sharding as the two foundational designs from the 2018 whitepaper.

See also: [Adaptive State Sharding](#adaptive-state-sharding), [Validator Reshuffle](#validator-reshuffle-epoch-boundary), [Metachain](#metachain).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus); founding whitepaper ([files.multiversx.com/multiversx-whitepaper.pdf](https://files.multiversx.com/multiversx-whitepaper.pdf)).

---

### Validator Reshuffle (Epoch Boundary)

The pseudo-random redistribution of a portion of each shard's validators to other shards at every epoch boundary.

Context: At each epoch boundary (approximately 24 hours) up to one-third of each shard's validators are moved to new shards, computed by the metachain using its randomness source. The security rationale: if a validator cannot predict which shard it will be in next epoch, an attacker cannot cheaply concentrate a corrupt majority inside a single shard. This mechanism predates Supernova and is unchanged by it. A validator is a node that has staked at least 2500 EGLD and participates in consensus.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Metachain](#metachain), [Adaptive State Sharding](#adaptive-state-sharding).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding) (node shuffling).

---

### Onchain Guardian

An opt-in, protocol-level two-factor authentication standard in which a guarded account requires a second signature from a designated guardian before a transaction is valid.

Context: When an account enables a Guardian, transactions must carry a guardian co-signature in addition to the owner's signature, and the guardian can be a standard authenticator app (such as Google Authenticator or Authy) or another service. Because the second factor is enforced by the protocol rather than by an application, a leaked seed phrase alone is not sufficient to move funds from a guarded account. The standard shipped to mainnet in July 2023. Guarded transactions cost an additional 50,000 gas.

See also: [Relayed Transactions](#relayed-transactions-v1--v2--v3), [NativeAuth](#nativeauth).
Read more: [docs.multiversx.com/developers/built-in-functions](https://docs.multiversx.com/developers/built-in-functions/); The Block, "MultiversX introduces on-chain 2FA" (July 14, 2023, [theblock.co/post/239592/multiversx-on-chain-2fa](https://www.theblock.co/post/239592/multiversx-on-chain-2fa)).

---

### Relayed Transactions (V1 / V2 / V3)

A mechanism that lets one account (the relayer) pay the gas fees for another account's transaction, so the sending account can transact without holding EGLD for fees.

Context: Versions 1 and 2 wrapped the inner transaction in the relayer's transaction and are being deprecated. Version 3 adds explicit `relayer` and `relayerSignature` fields directly on the transaction. For V3 the relayer field must be set before either party signs, the sender and relayer must be in the same shard, and the transaction costs an additional 50,000 gas. Relayed V3 was introduced in the Spica upgrade.

See also: [Spica](#spica), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/developers/relayed-transactions](https://docs.multiversx.com/developers/relayed-transactions/); MultiversX SDK reference ([github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core)).

---

### WASM VM (and Wasmer)

The WebAssembly virtual machine in which MultiversX smart contracts execute. Contracts compile to the `wasm32` target and run inside this VM rather than on a chain-specific bytecode interpreter.

Context: Most contracts are written in Rust against the `multiversx-sc` framework and compiled to optimized WebAssembly. The VM uses a Wasmer-based execution engine to run the WASM modules. ESDT token transfers do not invoke the VM at all, which is part of why token operations are cheaper than contract-based token systems on other chains. The VM identifier for WASM contracts is `0x0500`.

See also: [ESDT](#esdt-estandard-digital-token), [sc-meta](#sc-meta), [Storage Mappers](#storage-mappers), [Tx Syntax](#tx-syntax).
Read more: [docs.multiversx.com/learn/space-vm](https://docs.multiversx.com/learn/space-vm); [github.com/multiversx/mx-chain-vm-go](https://github.com/multiversx/mx-chain-vm-go).

---

### ESDT (eStandard Digital Token)

MultiversX's native token standard, used to issue and manage fungible, semi-fungible, and non-fungible tokens at the protocol level without deploying a token-logic smart contract.

Context: Because token accounting is handled by the protocol, issuing or transferring an ESDT does not require the virtual machine, which lowers cost and complexity relative to contract-based standards. Token identifiers take the form `TICKER-randomhex` for fungible tokens, with a nonce suffix for non-fungible and semi-fungible tokens (`TICKER-randomhex-nonceHex`). A non-fungible token has a nonce greater than zero and a quantity of one; a semi-fungible token has a nonce greater than zero and a quantity greater than one.

See also: [WASM VM](#wasm-vm-and-wasmer), [EGLD](#egld), [Bech32 Addressing](#bech32-addressing-erd1).
Read more: [docs.multiversx.com/tokens/intro](https://docs.multiversx.com/tokens/intro) (expansion and protocol-level handling); [docs.multiversx.com/tokens/esdt-tokens](https://docs.multiversx.com/tokens/esdt-tokens/).

---

### Bech32 Addressing (erd1…)

The address format used on MultiversX, in which public keys are encoded as Bech32 strings with the human-readable prefix `erd`.

Context: A typical address looks like `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`. The prefix (the human-readable part, HRP) defaults to `erd`. Addresses are 32-byte public keys; the shard an address belongs to is derived from the last bytes of the public key, which is how the protocol routes a transaction to the correct shard. Smart contract addresses are a recognizable subclass of the same format.

See also: [ESDT](#esdt-estandard-digital-token), [Adaptive State Sharding](#adaptive-state-sharding), [EGLD](#egld).
Read more: MultiversX SDK `Address` reference ([github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core)).

---

### EGLD

The native token of MultiversX, used to pay transaction fees, secure the network through staking, and fund validator rewards.

Context: EGLD ("eGold") was introduced at the July 2020 mainnet launch, redenominated from the prior ERD token at 1,000 ERD to 1 EGLD. At launch the project marketed a fixed maximum supply of 31.4 million EGLD. That fixed cap was removed by the Economic Evolution proposal in October 2025, which moved EGLD to a tail-inflation model. One EGLD is divisible to 18 decimals (1 EGLD = 10^18 of its smallest unit). A validator must stake at least 2500 EGLD.

See also: [Economic Evolution](#economic-evolution), [Staking V5](#staking-v5-and-the-emission-split), [KPI-Gated Emissions](#kpi-gated-emissions), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: CoinDesk, "Elrond Launches Onto Mainnet, Reduces Token Supply by 99%" (July 31, 2020); MultiversX, "The MultiversX Economic Evolution" (Oct 22, 2025, [multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion](https://multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion)).

---

### KPI-Gated Emissions

An emissions design in which a portion of EGLD's annual issuance is released only if the ecosystem meets defined performance indicators, and is otherwise locked.

Context: Of the annual emission, the two growth-oriented buckets (the ecosystem growth fund and the user growth dividend, 20% each, so 40% combined) are conditional; the staking-reward and protocol-sustainability buckets are not. Four indicators are evaluated quarterly on three-month rolling averages: the staking ratio (target 65 to 70%), protocol revenue measured through fee burns (target above 10% quarter-on-quarter growth), DeFi activity (aggregate TVL and 24-hour volume targets), and price growth (a market indicator weighted in a composite score). Unmet targets lock the unused tokens at quarter-end, prorated to the share of the target achieved, enforced by smart contract. The distribution model is re-evaluated annually by governance vote. The mechanism is specified in the Economic Evolution framework, which is being rolled out in phases.

See also: [Economic Evolution](#economic-evolution), [Staking V5](#staking-v5-and-the-emission-split), [EGLD](#egld), [Governance Proposal Process](#governance-proposal-process).
Read more: "A competitive economic framework for MultiversX: toward revenue and reflexive value accrual," MultiversX Agora ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)); MultiversX, "The MultiversX Economic Evolution" (Oct 22, 2025, [multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion](https://multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion)).

---

### Shard (Execution Shard)

One of the parallel partitions of the network, each processing a subset of transactions and holding a slice of global state.

Context: Mainnet runs three execution shards plus the coordinating metachain. An account is assigned to a shard by the last bytes of its address, and a transaction is processed by the shard or shards of its sender and receiver. Adding shards is how the network scales throughput.

See also: [Adaptive State Sharding](#adaptive-state-sharding), [Metachain](#metachain), [Cross-Shard Atomicity](#cross-shard-atomicity), [Bech32 Addressing](#bech32-addressing-erd1).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Shard Split and Merge (Resharding)

The protocol-level ability to change the number of shards by splitting a shard into two when load rises, or merging shards when it falls, without halting the network.

Context: This is the "adaptive" part of adaptive state sharding. The machinery exists in the protocol, but mainnet has run a stable configuration of three execution shards plus the metachain since 2020 and has not been throughput-bound, so resharding has not been triggered in production. It is therefore an architectural capability rather than an exercised mainnet behavior.

See also: [Adaptive State Sharding](#adaptive-state-sharding), [Shard (Execution Shard)](#shard-execution-shard), [Metachain](#metachain), [Validator Reshuffle](#validator-reshuffle-epoch-boundary).
Read more: [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding); founding whitepaper ([files.multiversx.com/multiversx-whitepaper.pdf](https://files.multiversx.com/multiversx-whitepaper.pdf)).

---

### Epoch

The protocol's day-scale time unit, currently about 24 hours, used for validator reshuffling, staking state changes, and reward computation.

Context: Many protocol events are denominated in epochs rather than wall-clock time. Validator reshuffling happens at epoch boundaries, the unstake-to-withdraw waiting period is 10 epochs, and a guardian becomes active 20 epochs after it is set. An epoch is divided into many rounds.

See also: [Round](#round), [Validator Reshuffle](#validator-reshuffle-epoch-boundary), [Unbonding Period](#unbonding-period), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/validators/staking](https://docs.multiversx.com/validators/staking/).

---

### Round

The fixed time slot in which one block is proposed per shard.

Context: In each round one validator is selected as proposer and the shard's validators sign the proposed block. Round length sets the block time: roughly 6 seconds today, which the Supernova upgrade (pre-mainnet) is designed to reduce to a 600-millisecond target. Many rounds make up an epoch.

See also: [Epoch](#epoch), [Secure Proof of Stake](#secure-proof-of-stake-spos), [Supernova](#supernova).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Smart Contract Results (SCRs)

The result objects the protocol generates from smart-contract execution, used to deliver outcomes, value, and cross-shard effects back to callers and other contracts.

Context: A single transaction that calls a contract can produce one or more SCRs, including the gas refund and any cross-shard continuation of the call. SCRs are first-class records on the network, visible in explorers, rather than ordinary transactions. They are how MultiversX represents the asynchronous, cross-shard parts of a contract call.

See also: [Cross-Shard Atomicity](#cross-shard-atomicity), [Built-in Functions](#built-in-functions), [Gas and Fees](#gas-and-fees).
Read more: [docs.multiversx.com/developers/developer-reference/sc-api-functions](https://docs.multiversx.com/developers/developer-reference/sc-api-functions/).

---

### Built-in Functions

Protocol-side functions that execute without a dedicated smart contract as receiver, handled directly by the protocol.

Context: Roughly thirty built-in functions cover token and account operations. Examples include ESDTTransfer and MultiESDTNFTTransfer (token transfers), ESDTNFTCreate (mint), ClaimDeveloperRewards, ChangeOwnerAddress, SetUserName (herotag via DNS), and SetGuardian and GuardAccount. Because they run protocol-side, they are cheaper than equivalent contract code and available chain-wide without deploying anything.

See also: [ESDT](#esdt-estandard-digital-token), [System Smart Contracts](#system-smart-contracts), [Onchain Guardian](#onchain-guardian), [Herotag](#herotag).
Read more: [docs.multiversx.com/developers/built-in-functions](https://docs.multiversx.com/developers/built-in-functions/).

---

### System Smart Contracts

Protocol-level contracts deployed at fixed, well-known addresses that implement core functions such as staking, ESDT issuance, delegation, and governance.

Context: Unlike user-deployed contracts, these ship with the protocol and live at reserved addresses. Issuing a token, staking a node, creating a delegation contract, or submitting a governance proposal are all transactions sent to a system smart contract. They are the protocol's own onchain logic.

See also: [ESDT](#esdt-estandard-digital-token), [Staking](#staking), [Delegation](#delegation), [Governance Proposal Process](#governance-proposal-process).
Read more: [docs.multiversx.com/validators/staking/staking-smart-contract](https://docs.multiversx.com/validators/staking/staking-smart-contract/); [docs.multiversx.com/developers/built-in-functions](https://docs.multiversx.com/developers/built-in-functions/).

---

### Gas and Fees

MultiversX's transaction-cost model, in which a transaction declares a gas limit and gas price and the fee is computed from two components: moving value and data, and executing contract code.

Context: A simple EGLD transfer pays only the value-movement component (a minimum gas limit plus a per-data-byte cost). A contract call adds a second component, charged at the gas price times a gas-price modifier that is typically lower. Gas paid beyond what a call actually consumes is refunded. This split is what lets the protocol route most of a contract call's fee to the contract's developer.

See also: [Developer Revenue Share](#developer-revenue-share), [Smart Contract Results](#smart-contract-results-scrs), [Relayed Transactions](#relayed-transactions-v1--v2--v3).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Gas Refund

The return of gas a transaction reserved but did not consume, paid back to the sender as part of the transaction's results.

Context: A caller sets a gas limit up front; if execution uses less, the difference is refunded rather than kept. The refund is delivered as a smart contract result and is visible on the transaction in explorers. This is why setting a generous gas limit on a contract call does not, by itself, cost the full amount.

See also: [Gas and Fees](#gas-and-fees), [Gas-Price Modifier](#gas-price-modifier), [Smart Contract Results](#smart-contract-results-scrs).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Gas-Price Modifier

A protocol factor, less than one, applied to the execution portion of a contract call's fee, so the gas spent running contract code is charged at a lower rate than the base gas price.

Context: A transaction's cost splits into moving value and data (charged at the full gas price) and executing contract code (charged at the gas price times the modifier). The modifier lowers the effective cost of computation and is part of how the fee model keeps contract calls affordable. It applies only to the execution component, not to the value-movement component.

See also: [Gas and Fees](#gas-and-fees), [Move Balance](#move-balance), [Gas Refund](#gas-refund), [Developer Revenue Share](#developer-revenue-share).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Herotag

A human-readable name mapped to a MultiversX address through the protocol's onchain Distributed Name Service (DNS), so funds can be sent to a name instead of a full address.

Context: Instead of an `erd1...` address, a user can register and share a herotag (a short handle). The mapping is stored onchain through DNS smart contracts and resolved by wallets and explorers; the username is set with the SetUserName built-in function. It is MultiversX's naming-service equivalent.

See also: [Bech32 Addressing](#bech32-addressing-erd1), [Built-in Functions](#built-in-functions).
Source: [docs.multiversx.com/welcome/terminology](https://docs.multiversx.com/welcome/terminology/); xPortal Help Center, "What is a herotag?".

---

### Sovereign Chains

A framework and SDK for launching application-specific chains that connect to the MultiversX network while remaining independently configurable.

Context: A Sovereign Chain sets its own parameters (public or private, staking model, gas and fee rules, supported tokens) and runs a consensus configuration that dedicates most of its time to processing for higher throughput on a dedicated workload. It is MultiversX's approach to appchains and interoperability, announced in 2024.

See also: [Adaptive State Sharding](#adaptive-state-sharding), [ESDT](#esdt-estandard-digital-token).
Read more: [docs.multiversx.com/sovereign/overview](https://docs.multiversx.com/sovereign/overview/); [docs.multiversx.com/sovereign/concept](https://docs.multiversx.com/sovereign/concept/).

---

### SpaceVM

The name of the MultiversX virtual machine that executes smart contracts, a WebAssembly engine also documented under WASM VM.

Context: SpaceVM runs contracts compiled to the wasm32 target and is stateless: during execution a contract cannot write directly to storage or the blockchain, and the accumulated changes are applied only at the end, and only on success. Reading global state is permitted at any time.

See also: [WASM VM (and Wasmer)](#wasm-vm-and-wasmer), [Stateless Execution](#stateless-execution), [Smart Contract](#smart-contract).
Read more: [docs.multiversx.com/learn/space-vm](https://docs.multiversx.com/learn/space-vm).

---

### Stateless Execution

The MultiversX VM property that a smart contract cannot write directly to storage or the blockchain during execution; changes accumulate in a transient structure and are committed only at the end, and only if execution succeeds.

Context: This design removes the need for reverting operations: a failed execution leaves global state untouched because nothing was written until success. Reading global state is allowed at any time during execution.

See also: [SpaceVM](#spacevm), [WASM VM (and Wasmer)](#wasm-vm-and-wasmer), [Smart Contract Results (SCRs)](#smart-contract-results-scrs).
Read more: [docs.multiversx.com/learn/space-vm](https://docs.multiversx.com/learn/space-vm).

---

### Restaking (Sovereign Chains)

A model in which EGLD holders stake to help secure a sovereign chain and earn additional yield on top of base EGLD staking rewards, without giving up custody.

Context: Restaking lets the security of the MultiversX mainchain extend to sovereign chains and lets participants earn extra returns for backing them. It is part of how sovereign chains bootstrap validator participation.

See also: [Sovereign Chains](#sovereign-chains), [Dual Staking (Sovereign Chains)](#dual-staking-sovereign-chains), [Staking](#staking), [Delegation](#delegation).
Read more: [docs.multiversx.com/sovereign/restaking](https://docs.multiversx.com/sovereign/restaking/).

---

### Dual Staking (Sovereign Chains)

A design in which a validator earns rewards from both the MultiversX mainchain and a sovereign chain at the same time.

Context: Dual staking aims to let validators contribute to and be rewarded by a sovereign chain while continuing to validate the mainchain, improving participation efficiency across the two.

See also: [Sovereign Chains](#sovereign-chains), [Restaking (Sovereign Chains)](#restaking-sovereign-chains), [Staking](#staking).
Read more: [docs.multiversx.com/sovereign/dual-staking](https://docs.multiversx.com/sovereign/dual-staking/).

---

### Header Verifier

A component that verifies mainchain block headers on a sovereign chain, so cross-chain transfers act only on data proven final on the origin chain.

Context: The header verifier checks proofs of execution and finality before a sovereign chain accepts a cross-chain operation, which is what makes bridging between the mainchain and a sovereign chain secure.

See also: [Sovereign Chains](#sovereign-chains), [ESDT-Safe](#esdt-safe), [Cross-Shard Message Buffer](#cross-shard-message-buffer).
Read more: [docs.multiversx.com/sovereign/concept](https://docs.multiversx.com/sovereign/concept/).

---

### ESDT-Safe

The bridge contract that locks or receives tokens on one side of a cross-chain transfer and emits the events that trigger the corresponding action on the other side.

Context: On a sovereign or bridge setup, the ESDT-Safe contract accepts a token deposit with a destination address and function call, then logs an event that the relaying infrastructure uses to complete the transfer on the other chain. It is paired with a counterpart safe contract on the other side.

See also: [Sovereign Chains](#sovereign-chains), [Header Verifier](#header-verifier), [Ad-Astra Bridge](#ad-astra-bridge), [Bridged Tokens](#bridged-tokens).
Read more: [docs.multiversx.com/sovereign/concept](https://docs.multiversx.com/sovereign/concept/).

---

### Ad-Astra Bridge

The MultiversX cross-chain bridge that transfers tokens between MultiversX and EVM-compatible chains such as Ethereum, using safe and bridge contracts on each side operated by a relayer set.

Context: The bridge is run by ten relayers, five managed by the MultiversX Foundation and five by community validators, which together operate the contracts under a quorum. It moves tokens between ERC20 and ESDT form.

See also: [Bridged Tokens](#bridged-tokens), [Axelar (Bridge)](#axelar-bridge), [ESDT-Safe](#esdt-safe), [WEGLD (Wrapped EGLD)](#wegld-wrapped-egld).
Read more: [docs.multiversx.com/bridge/architecture](https://docs.multiversx.com/bridge/architecture/).

---

### Axelar (Bridge)

A second cross-chain path for MultiversX that uses Axelar's verifier network to reach a broader set of chains, requiring a MultiversX observing squad as part of the setup.

Context: Alongside the Ad-Astra bridge, the Axelar integration lets MultiversX interoperate with the chains Axelar connects, with MultiversX acting as a verifier chain in Axelar's Amplifier model.

See also: [Ad-Astra Bridge](#ad-astra-bridge), [Bridged Tokens](#bridged-tokens), [Observing Squad](#observing-squad).
Read more: [docs.multiversx.com/bridge/axelar](https://docs.multiversx.com/bridge/axelar/).

---

### Bridged Tokens

Tokens created on a non-native chain to represent an asset from another chain, kept at parity with the original by the bridge either minting and burning or locking and unlocking.

Context: Whether a bridged token uses a mint-and-burn or lock-and-unlock mechanism depends on which chain is the token's native chain and whether a mint role is available. On MultiversX these appear as ESDTs that mirror an ERC20 (or the reverse), maintained one-to-one by the bridge.

See also: [Ad-Astra Bridge](#ad-astra-bridge), [Axelar (Bridge)](#axelar-bridge), [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [WEGLD (Wrapped EGLD)](#wegld-wrapped-egld).
Read more: [docs.multiversx.com/bridge/token-types](https://docs.multiversx.com/bridge/token-types/).

---

## Consensus and security

The mechanics behind Secure Proof of Stake, and the Supernova consensus model layered on top of it.

### Consensus Group

The set of validators responsible for proposing and signing a shard's block in a given round.

Context: Since the Andromeda upgrade the consensus group is the shard's full validator set (about 400 nodes), fixed for the epoch, rather than a small subset re-drawn each round. One member is selected as proposer each round; the rest sign, and a block finalizes once at least two-thirds have signed.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Block Proposer](#block-proposer-leader), [Validator Reshuffle](#validator-reshuffle-epoch-boundary), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Block Proposer (Leader)

The validator chosen to build and broadcast the block in a given round.

Context: Selection is random and verifiable: each validator computes a score by hashing its public key with the round's randomness, and the lowest score becomes proposer. The proposer assembles the block and aggregates the other validators' signatures into the consensus proof.

See also: [Consensus Group](#consensus-group), [Verifiable Random Function](#verifiable-random-function-vrf), [BLS Multi-Signature](#bls-multi-signature), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Verifiable Random Function (VRF)

A function that produces randomness which is unpredictable in advance but verifiable afterward, used to drive proposer and validator selection.

Context: MultiversX derives each round's randomness from the previous block's seed, so no participant can predict or bias proposer selection, yet anyone can verify the result. The same randomness source drives epoch validator reshuffling.

See also: [Block Proposer](#block-proposer-leader), [Secure Proof of Stake](#secure-proof-of-stake-spos), [Validator Reshuffle](#validator-reshuffle-epoch-boundary).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### BLS Multi-Signature

A signature scheme that aggregates many validators' signatures on a block into a single, compact signature.

Context: MultiversX validators sign the block hash and the proposer aggregates at least two-thirds of the signatures into one 96-byte signature. Aggregation keeps consensus messages small, which is part of how the network reaches finality quickly.

See also: [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp), [Consensus Group](#consensus-group), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus).

---

### Equivalent Consensus Proof (ECP)

The aggregated BLS signature, from at least two-thirds of a shard's validators, that finalizes a block.

Context: A block is final the moment its ECP is broadcast, and only one valid ECP can exist for a given block, which makes equivocation impossible. The ECP is what gives MultiversX single-block, deterministic finality, and is what let the Andromeda upgrade remove the old confirmation block.

See also: [BLS Multi-Signature](#bls-multi-signature), [Deterministic Finality](#deterministic-finality), [Andromeda](#andromeda), [Notarization](#notarization).
Read more: [docs.multiversx.com/learn/consensus](https://docs.multiversx.com/learn/consensus); [docs.multiversx.com/integrators/faq](https://docs.multiversx.com/integrators/faq/).

---

### Notarization

The metachain's recording of a finalized shard block header, which enables cross-shard settlement.

Context: A shard block is already final within its own shard once more than two-thirds of its validators have signed it (its Equivalent Consensus Proof). Notarization is the separate step in which the metachain includes that block's header and aggregate signature in its own block, making the block visible network-wide so other shards can act on its cross-shard output.

See also: [Metachain](#metachain), [Hyperblock](#hyperblock), [Cross-Shard Atomicity](#cross-shard-atomicity), [Equivalent Consensus Proof](#equivalent-consensus-proof-ecp).
Read more: [docs.multiversx.com/integrators/faq](https://docs.multiversx.com/integrators/faq/).

---

### Agree-then-Run

The Supernova consensus model in which validators first agree on the order of transactions and then execute them, rather than agreeing on execution results.

Context: Validators still agree on the execution results of previous blocks, but the current block's execution result is no longer on the critical path for that block's consensus. Decoupling ordering from execution reduces the required block time, so consensus for one block can proceed while the previous block is still executing. This is what lets Supernova target sub-second blocks while preserving deterministic finality.

See also: [Pipelined Consensus](#pipelined-consensus), [Partial-Precommit Execution Dispatch](#partial-precommit-execution-dispatch), [Supernova](#supernova), [Deterministic Finality](#deterministic-finality).
Read more: MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)).

---

### Pipelined Consensus

A consensus design in which voting for each block runs in parallel with its own execution, rather than waiting for execution to complete before proceeding.

Context: Under Supernova, consensus and execution each run on their own pipeline and proceed in parallel. If execution extends past the block slot it overlaps with the next block's consensus, and it does not block it. This removes execution from the critical path of agreement and is the main source of Supernova's block-time reduction.

See also: [Agree-then-Run](#agree-then-run), [Partial-Precommit Execution Dispatch](#partial-precommit-execution-dispatch), [Supernova](#supernova).
Read more: MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)).

---

### Partial-Precommit Execution Dispatch

The Supernova mechanism by which validators begin executing a block as soon as their local validation passes, before casting their vote.

Context: The MvX consensus flow has three phases: block broadcast, voting (which follows local validation), and finalization (where a proof is produced). Validators start executing during the voting phase, so state changes are ready by the time finalization completes. Cross-shard transactions produced during this window are accepted only once the originating shard's block is proven final.

See also: [Pipelined Consensus](#pipelined-consensus), [Cross-Shard Message Buffer](#cross-shard-message-buffer), [Cross-Shard Atomicity](#cross-shard-atomicity), [Supernova](#supernova).
Read more: MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)).

---

### Cross-Shard Message Buffer

The mechanism, mediated by the metachain, that ensures cross-shard transactions are accepted only once the originating shard's execution results are proven final.

Context: Cross-shard transactions wait for a finality proof from the originating shard before the destination shard acts on them. Block headers may be broadcast early to reduce propagation time, but they are not considered for any operation until a proof exists. This ensures that pipelining does not weaken cross-shard safety.

See also: [Cross-Shard Atomicity](#cross-shard-atomicity), [Partial-Precommit Execution Dispatch](#partial-precommit-execution-dispatch), [Metachain](#metachain), [Supernova](#supernova).
Read more: MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)).

---

## Tokens

These entries detail the token types and controls built on ESDT, which is defined under Protocol and architecture.

### Meta-ESDT

A token type that carries per-nonce metadata like an NFT but holds fungible quantities, used for tokens whose units share attributes such as locked or staked positions.

Context: Technically a special case of the semi-fungible type, a Meta-ESDT behaves like a fungible token with attributes attached at each nonce. MultiversX ecosystem positions such as locked tokens (for example LKMEX and XMEX) are Meta-ESDTs.

See also: [ESDT](#esdt-estandard-digital-token), [ESDT Roles](#esdt-roles-special-roles), [Dynamic NFTs](#dynamic-nfts-dynamic-tokens).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### Dynamic NFTs (Dynamic Tokens)

Tokens registered as dynamic so their metadata and attributes can change after issuance rather than being fixed at mint.

Context: Static NFTs freeze their attributes at creation. A dynamic token can be updated by an address holding the appropriate role, which enables evolving game items, upgradable collectibles, and similar use cases. Dynamic token support was added in the Spica upgrade.

See also: [ESDT](#esdt-estandard-digital-token), [ESDT Roles](#esdt-roles-special-roles), [Spica](#spica).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### ESDT Roles (Special Roles)

Per-address permissions that authorize specific token operations such as creating, burning, or modifying a token.

Context: Roles are assigned to addresses by the token manager. Examples include ESDTRoleNFTCreate (mint), ESDTRoleNFTBurn (burn), ESDTRoleNFTAddQuantity (increase SFT supply), and ESDTRoleNFTUpdateAttributes (change attributes). Roles let a project delegate controlled minting and management without giving up ownership of the token.

See also: [ESDT](#esdt-estandard-digital-token), [Meta-ESDT](#meta-esdt), [Dynamic NFTs](#dynamic-nfts-dynamic-tokens).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### NFT Royalties

A creator royalty set at mint, expressed as a value from 0 to 10000 (0% to 100%) and applied to qualifying transfers.

Context: The royalty is stored as a property of the token, letting the creator receive a percentage of supported sales. The 0 to 10000 range encodes a percentage with two decimals of precision (for example, 500 is 5%).

See also: [ESDT](#esdt-estandard-digital-token), [ESDT Roles](#esdt-roles-special-roles).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### Fungible Token

An ESDT whose units are identical and interchangeable, like a currency or a points balance.

Context: Fungible ESDTs have a nonce of zero and a supply set by the number of decimals chosen at issuance. They are managed at protocol level, so no token contract is deployed.

See also: [ESDT](#esdt-estandard-digital-token), [Token Identifier](#token-identifier-ticker), [NFT](#nft-non-fungible-token).
Read more: [docs.multiversx.com/tokens/intro](https://docs.multiversx.com/tokens/intro).

---

### NFT (Non-Fungible Token)

A unique ESDT with a nonce greater than zero and a quantity of one, carrying its own name, attributes, royalties, and URIs.

Context: MultiversX NFTs are issued and transferred at protocol level rather than through a token contract, and their metadata can be made updatable by issuing them as dynamic tokens.

See also: [ESDT](#esdt-estandard-digital-token), [SFT](#sft-semi-fungible-token), [Dynamic NFTs](#dynamic-nfts-dynamic-tokens), [NFT Royalties](#nft-royalties).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### SFT (Semi-Fungible Token)

An ESDT with a nonce greater than zero and a quantity greater than one, behaving like multiple identical copies of the same non-fungible item.

Context: SFTs suit assets that are unique as a type but issued in editions, such as event tickets or game items. Quantity is increased with the add-quantity role.

See also: [ESDT](#esdt-estandard-digital-token), [NFT](#nft-non-fungible-token), [Meta-ESDT](#meta-esdt), [ESDT Roles](#esdt-roles-special-roles).
Read more: [docs.multiversx.com/tokens/nft-tokens](https://docs.multiversx.com/tokens/nft-tokens/).

---

### Token Identifier (Ticker)

The onchain identifier of an ESDT, formed from a human-chosen ticker plus a random suffix, for example `USDC-c76f1f`.

Context: The random suffix keeps identifiers unique even when tickers collide. Non-fungible and semi-fungible tokens extend the identifier with a nonce (`TICKER-randomhex-nonceHex`) to address an individual token.

See also: [ESDT](#esdt-estandard-digital-token), [Fungible Token](#fungible-token), [NFT](#nft-non-fungible-token).
Read more: [docs.multiversx.com/tokens/esdt-tokens](https://docs.multiversx.com/tokens/esdt-tokens/).

---

### Liquid Staking (lsEGLD)

A mechanism that issues a transferable ESDT representing staked EGLD, so the staked position can be used elsewhere while it still earns staking rewards.

Context: A user stakes EGLD into the liquid-staking contract and receives lsEGLD in return; the token can be used across DeFi while the underlying stake continues to accrue rewards. It addresses the illiquidity of ordinary staking.

See also: [Staking](#staking), [Delegation](#delegation), [ESDT](#esdt-estandard-digital-token).
Read more: [github.com/multiversx/mx-liquid-staking-sc](https://github.com/multiversx/mx-liquid-staking-sc).

---

### WEGLD (Wrapped EGLD)

An ESDT that represents EGLD one-to-one, letting the native token be used in contexts that expect a standard token rather than the protocol's native currency.

Context: EGLD is the native coin and is not itself an ESDT, so smart contracts and DeFi that operate on ESDTs use WEGLD, minted by locking EGLD in a wrapping contract and redeemable one-to-one. It is the MultiversX equivalent of wrapped-native tokens on other chains (such as WETH on Ethereum).

See also: [EGLD](#egld), [ESDT](#esdt-estandard-digital-token), [Fungible Token](#fungible-token), [Liquid Staking](#liquid-staking-lsegld).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`contracts/core/wegld-swap`); [docs.multiversx.com/tokens/intro](https://docs.multiversx.com/tokens/intro).

---

### Token Properties (canFreeze, canWipe, canPause, ...)

The configurable flags set on an ESDT at issuance that control which management operations its manager may later perform.

Context: The properties include canPause (halt all transfers except mint and burn), canFreeze (freeze a specific account's balance), canWipe (wipe a frozen account's tokens), canChangeOwner (transfer token management), canUpgrade (change the properties), canAddSpecialRoles (assign roles), and canCreateMultiShard. On mainnet since epoch 432, the older canMint and canBurn are no longer effective; local mint and burn roles are used instead.

See also: [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [ESDT Roles (Special Roles)](#esdt-roles-special-roles), [Freeze and Wipe](#freeze-and-wipe), [Pause (Token)](#pause-token), [Local Mint and Burn](#local-mint-and-burn).
Read more: [docs.multiversx.com/tokens/fungible-tokens](https://docs.multiversx.com/tokens/fungible-tokens/).

---

### Freeze and Wipe

Token-manager operations that freeze a specific account's balance of a token (blocking transfers to and from it) and, for an already frozen account, wipe out its tokens, reducing supply.

Context: Freezing requires the token's canFreeze property, and wiping requires canWipe and a previously frozen account. The pair exists to support regulatory or compliance actions; freezing is reversible, whereas wiping permanently removes the tokens.

See also: [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [Token Properties (canFreeze, canWipe, canPause, ...)](#token-properties-canfreeze-canwipe-canpause-), [Pause (Token)](#pause-token), [ESDT Roles (Special Roles)](#esdt-roles-special-roles).
Read more: [docs.multiversx.com/tokens/fungible-tokens](https://docs.multiversx.com/tokens/fungible-tokens/).

---

### Pause (Token)

A token-manager operation that prevents all transactions of a token except minting and burning, reversible with an unpause.

Context: Pausing requires the token's canPause property to be set to true. It halts transfers of the token network-wide until the manager unpauses it.

See also: [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [Token Properties (canFreeze, canWipe, canPause, ...)](#token-properties-canfreeze-canwipe-canpause-), [Freeze and Wipe](#freeze-and-wipe).
Read more: [docs.multiversx.com/tokens/fungible-tokens](https://docs.multiversx.com/tokens/fungible-tokens/).

---

### Local Mint and Burn

Protocol operations that increase or decrease a token's supply, performed by an address holding the corresponding local role.

Context: An address with the ESDTRoleLocalMint role can mint new units and one with ESDTRoleLocalBurn can burn units. On mainnet since epoch 432, global mint and burn are disabled, so local mint and burn (via these roles) are the way to change a token's supply.

See also: [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [ESDT Roles (Special Roles)](#esdt-roles-special-roles), [Token Properties (canFreeze, canWipe, canPause, ...)](#token-properties-canfreeze-canwipe-canpause-).
Read more: [docs.multiversx.com/tokens/fungible-tokens](https://docs.multiversx.com/tokens/fungible-tokens/).

---

## Network, nodes, and staking

### Node

A computer running the MultiversX client that relays messages with its peers. A node is either a validator or an observer.

Context: Nodes form the peer-to-peer network that propagates transactions and blocks. Their role depends on whether they have staked to validate or run passively as observers.

See also: [Validator](#validator-node), [Observer](#observer-node), [Observing Squad](#observing-squad).
Source: [docs.multiversx.com/welcome/terminology](https://docs.multiversx.com/welcome/terminology/).

---

### Validator (node)

A node that has staked at least 2500 EGLD and participates in consensus, processing transactions and securing the network in exchange for rewards.

Context: Validators are selected into per-round consensus groups and earn protocol rewards plus a share of fees. Each validator carries a rating, and unreliable validators can be jailed and excluded from consensus.

See also: [Observer](#observer-node), [Secure Proof of Stake](#secure-proof-of-stake-spos), [Validator Rating](#validator-rating), [Jailing](#jailing), [Staking](#staking).
Read more: [docs.multiversx.com/validators/overview](https://docs.multiversx.com/validators/overview/).

---

### Observer (node)

A passive node that follows the network and serves as a read-and-relay interface, without participating in consensus or earning rewards.

Context: Observers are not selected for consensus and do not carry a rating. They are used to read chain state and submit transactions, and a full set of them backs the public API.

See also: [Node](#node), [Validator](#validator-node), [Observing Squad](#observing-squad).
Read more: [docs.multiversx.com/validators/overview](https://docs.multiversx.com/validators/overview/).

---

### Observing Squad

A set of observer nodes covering every shard plus the metachain, fronted by a MultiversX Proxy that exposes a single HTTP API over the whole network.

Context: Because state is sharded, reading the entire network requires an observer in each shard. An observing squad bundles one observer per shard, plus the metachain, with a Proxy instance, giving an application one endpoint that routes each request to the correct shard. It is the standard way to self-host full network access.

See also: [Observer](#observer-node), [Shard (Execution Shard)](#shard-execution-shard), [Metachain](#metachain).
Read more: [docs.multiversx.com/integrators/observing-squad](https://docs.multiversx.com/integrators/observing-squad/).

---

### Validator Rating

A per-validator reliability score that rises with successful consensus participation and falls with missed or faulty duties.

Context: New validators start at a baseline score (50 points) and gain rating for each successful consensus they take part in. Rating reflects reliability and, if it falls too low, leads to jailing. It gives the protocol a continuous, onchain measure of node behavior.

See also: [Validator](#validator-node), [Jailing](#jailing), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/validators/rating](https://docs.multiversx.com/validators/rating/).

---

### Jailing

The state in which a validator whose rating has fallen too low is excluded from consensus and earns no rewards until it is restored.

Context: A jailed validator is removed from consensus selection. The operator can return it to the active set by paying a fine and unjailing it. Jailing is the enforcement mechanism behind the rating system.

See also: [Validator Rating](#validator-rating), [Validator](#validator-node), [Staking](#staking).
Read more: [docs.multiversx.com/validators/rating](https://docs.multiversx.com/validators/rating/).

---

### Staking

Locking EGLD to run a validator node, currently 2500 EGLD per node, held in a system smart contract.

Context: Staking makes a node eligible to validate and earn rewards. Stake above the per-node minimum is called topUp and affects how many of an operator's nodes stay active. Withdrawing requires unstaking and then waiting out the unbonding period.

See also: [Validator](#validator-node), [Delegation](#delegation), [Staking Auction and TopUp](#staking-auction-and-topup), [Unbonding Period](#unbonding-period).
Read more: [docs.multiversx.com/validators/staking](https://docs.multiversx.com/validators/staking/).

---

### Delegation

Contributing EGLD toward validator nodes operated by someone else, sharing in the rewards without running a node.

Context: Holders delegate to a staking provider, a custom delegation smart contract that pools participants' funds, operates the nodes, and takes a service fee from the rewards. A provider's pool has a delegation cap, the maximum amount it accepts. Delegation lowers the barrier below the 2500 EGLD per-node minimum.

See also: [Staking](#staking), [System Smart Contracts](#system-smart-contracts), [Staking Auction and TopUp](#staking-auction-and-topup).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Staking Auction and TopUp

The mechanism, introduced with Staking V4, that selects which staked nodes are active based on each operator's stake above the minimum, known as topUp.

Context: When more nodes are staked than there are available slots, an auction ranks operators by topUp per node and admits as many as their stake supports. This replaced the earlier first-come staking queue and ties active-set membership to economic commitment rather than arrival time.

See also: [Staking](#staking), [Staking V5](#staking-v5-and-the-emission-split), [Validator](#validator-node).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/).

---

### Unbonding Period

The waiting time between unstaking and being able to withdraw the funds, currently 10 epochs.

Context: After an operator or delegator unstakes, the funds stay locked for the unbonding period (about 10 days at the current epoch length) before they can be unbonded and withdrawn. The delay protects network security by preventing an instant exit.

See also: [Staking](#staking), [Delegation](#delegation), [Epoch](#epoch).
Read more: [docs.multiversx.com/validators/staking](https://docs.multiversx.com/validators/staking/).

---

### Unbond

The action of withdrawing staked or delegated EGLD back to the owner's account after it has been unstaked and the unbonding period has elapsed.

Context: Unbonding is the final step of exiting stake: an operator or delegator first unstakes, waits out the unbonding period (currently 10 epochs), and then unbonds to receive the funds. It is distinct from the earlier unstake step, which only signals the intent to withdraw.

See also: [Unstake](#unstake), [Unbonding Period](#unbonding-period), [Staking](#staking), [Delegation](#delegation).
Read more: [docs.multiversx.com/validators/staking/staking-smart-contract](https://docs.multiversx.com/validators/staking/staking-smart-contract/); [docs.multiversx.com/validators/staking](https://docs.multiversx.com/validators/staking/).

---

### Top-up

The EGLD an operator stakes above the per-node minimum, computed as total staked EGLD minus the minimum times the number of nodes.

Context: With the base stake fixed at 2500 EGLD per node, top-up is the excess. Top-up per node determines a node's priority in the staking auction and contributes to rewards; nodes with insufficient top-up can be left out of the active set.

See also: [Staking Auction and TopUp](#staking-auction-and-topup), [Soft Auction](#soft-auction), [Staking](#staking), [Auction List](#auction-list).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/).

---

### Auction List

The set of staked nodes competing, by their top-up per node, to be selected into the active validator set for the coming epoch.

Context: Introduced with Staking V4, the auction list replaced the earlier first-in first-out staking queue. At each epoch a soft auction selects nodes from the auction list based on top-up; unselected nodes remain in the auction.

See also: [Soft Auction](#soft-auction), [Top-up](#top-up), [Waiting List](#waiting-list), [Eligible Nodes](#eligible-nodes).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/).

---

### Waiting List

The pool of nodes that have been selected to join but are synchronizing with their assigned shard, before they become eligible for consensus.

Context: Nodes move from the auction list into the waiting list, spend time resynchronizing with the shard they were assigned, and are then shuffled into the eligible set. The waiting list keeps a node in sync so it is ready before it starts validating.

See also: [Auction List](#auction-list), [Eligible Nodes](#eligible-nodes), [Validator Reshuffle (Epoch Boundary)](#validator-reshuffle-epoch-boundary), [Soft Auction](#soft-auction).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/); [docs.multiversx.com/learn/sharding](https://docs.multiversx.com/learn/sharding).

---

### Eligible Nodes

The active validators in the consensus set, which produce and sign blocks and earn rewards.

Context: Only eligible nodes participate in consensus and receive validator rewards, and they are subject to jailing if their rating falls too low. Eligible nodes are drawn from the waiting list and reshuffled across shards at epoch boundaries.

See also: [Validator (node)](#validator-node), [Waiting List](#waiting-list), [Validator Reshuffle (Epoch Boundary)](#validator-reshuffle-epoch-boundary), [Consensus Group](#consensus-group).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/).

---

### Soft Auction

The Staking V4 selection mechanism that admits nodes from the auction list by finding the top-up threshold that fills the available slots while maximizing the number of qualifying owners and nodes.

Context: Rather than a strict cutoff that could force operators to unstake nodes, the soft auction adjusts the required top-up per node across a range so as many eligible nodes as possible are selected each epoch. It is designed to be fairer to smaller staking providers.

See also: [Auction List](#auction-list), [Top-up](#top-up), [Waiting List](#waiting-list), [Staking Auction and TopUp](#staking-auction-and-topup).
Read more: [docs.multiversx.com/validators/staking-v4](https://docs.multiversx.com/validators/staking-v4/).

---

### Slashing

A penalty in which a validator that seriously misbehaves is fined and loses part or all of its staked EGLD, in addition to having its validator status removed.

Context: The docs describe stake slashing as reserved for serious offences such as double-signing or producing bad blocks. As of the current docs, slashing for double-signing is noted as a near-future enforcement; day-to-day unreliability is handled by the rating system and jailing rather than by slashing principal.

See also: [Jailing](#jailing), [Validator Rating](#validator-rating), [Staking](#staking), [Secure Proof of Stake (SPoS)](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/validators/overview](https://docs.multiversx.com/validators/overview/).

---

### BLS Key (Validator Key)

The node-specific key a validator uses to sign blocks and consensus messages, stored in the node's validator key file and distinct from the wallet key that controls funds.

Context: Each validator node has its own BLS key, whose public key identifies the node in staking transactions and consensus. The private key must never leave the node's host; if it is stolen and used maliciously (for example to double-sign) the associated stake can be slashed.

See also: [Key Pair (Public and Private Key)](#key-pair-public-and-private-key), [BLS Multi-Signature](#bls-multi-signature), [Multikey Nodes](#multikey-nodes), [Slashing](#slashing).
Read more: [docs.multiversx.com/validators/key-management/validator-keys](https://docs.multiversx.com/validators/key-management/validator-keys/).

---

### Node Redundancy

A high-availability setup in which one or more standby nodes run alongside a main validator node and take over signing only if the main node goes offline.

Context: Standby nodes are configured with a redundancy level and stay synchronized with the main node's shard without signing, providing failover to avoid downtime and missed rewards. Two nodes must not share the same redundancy level, or they would sign in parallel and risk double-signing.

See also: [Multikey Nodes](#multikey-nodes), [BLS Key (Validator Key)](#bls-key-validator-key), [Slashing](#slashing), [Validator (node)](#validator-node).
Read more: [docs.multiversx.com/validators/redundancy](https://docs.multiversx.com/validators/redundancy/).

---

### Multikey Nodes

A configuration in which a small group of nodes collectively manages many validator BLS keys, with at least one node per shard plus the metachain, instead of running one node per key.

Context: The nodes share a file listing all managed validator keys and coordinate consensus signing across them, which pools server resources for operators running several keys. It is an optional, more economical setup for medium-to-large staking providers.

See also: [BLS Key (Validator Key)](#bls-key-validator-key), [Node Redundancy](#node-redundancy), [Validator (node)](#validator-node), [Staking](#staking).
Read more: [docs.multiversx.com/validators/key-management/multikey-nodes](https://docs.multiversx.com/validators/key-management/multikey-nodes/).

---

### Merge Validator

The operation that converts a standalone staked validator into a node managed by an existing delegation contract, keeping its active slot.

Context: Merging lets a node operator move a directly staked node under a staking provider's delegation contract without unstaking and re-entering the auction. When the node and the contract have different owners, whitelisting is required first.

See also: [Delegation Contract](#delegation-contract), [Delegation Manager](#delegation-manager), [Staking](#staking), [Delegation](#delegation).
Read more: [docs.multiversx.com/validators/staking/merge-validator-delegation-sc](https://docs.multiversx.com/validators/staking/merge-validator-delegation-sc/).

---

### Delegation Manager

The protocol's built-in factory contract, at a fixed metachain address, from which a node operator creates a delegation contract to run a staking provider.

Context: An operator submits a createNewDelegationContract request to the delegation manager, depositing 1250 EGLD, and receives their own delegation contract. Using the delegation manager is the standard way to set up a staking provider, though a custom smart contract is also possible.

See also: [Delegation Contract](#delegation-contract), [Staking provider](#staking-provider), [Delegation](#delegation), [System Smart Contracts](#system-smart-contracts).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Delegation Contract

The contract that runs an individual staking provider: it tracks the provider's nodes and delegators, distributes rewards, and applies the service fee.

Context: Created from the delegation manager with an initial 1250 EGLD from the operator (while 2500 EGLD is needed to stake a single node), the delegation contract handles staking, unstaking, and reward accounting for the pool. It also carries the pool's delegation cap and service fee.

See also: [Delegation Manager](#delegation-manager), [Staking provider](#staking-provider), [Delegation cap](#delegation-cap), [Service Fee](#service-fee).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Import DB

A node operation mode that reprocesses an existing node database from genesis, without live network synchronization, to rebuild state or reindex history.

Context: Import DB lets an operator replay the chain from a stored database, which is useful for reconstructing state, validating history, or populating external systems such as Elasticsearch. It can be faster than syncing from the network.

See also: [Elastic Indexer](#elastic-indexer), [Observer (node)](#observer-node), [Deep-History Squad](#deep-history-squad).
Read more: [docs.multiversx.com/validators/import-db](https://docs.multiversx.com/validators/import-db/).

---

## Wallets and accounts

### Wallet

Software that holds a user's keys and lets them hold assets, sign transactions, and interact with applications.

Context: MultiversX wallets include xPortal (mobile super-app), the web wallet, browser-extension wallets, and hardware-wallet support. The wallet holds the keys; the assets live onchain.

See also: [xPortal](#xportal), [Key Pair](#key-pair-public-and-private-key), [Onchain Guardian](#onchain-guardian), [NativeAuth](#nativeauth).
Read more: [docs.multiversx.com/wallet/web-wallet](https://docs.multiversx.com/wallet/web-wallet/).

---

### xPortal

MultiversX's official non-custodial mobile wallet and financial super-app for holding, sending, staking, and swapping EGLD and ESDTs, with an associated debit card.

Context: xPortal is the consumer entry point to MultiversX, combining a self-custodial wallet with payments and card features. It uses herotags so users can transact to a name instead of an address.

See also: [Wallet](#wallet), [Herotag](#herotag), [EGLD](#egld), [ESDT](#esdt-estandard-digital-token).
Read more: [multiversx.com/ecosystem/project/xportal](https://multiversx.com/ecosystem/project/xportal); MultiversX Help Center.

---

### Key Pair (Public and Private Key)

The cryptographic pair that controls an account: the public key derives the address, and the private key signs transactions.

Context: Whoever holds the private key controls the account, which is why MultiversX added Guardians as an onchain second factor so a leaked key alone is not enough to move funds.

See also: [Bech32 Addressing](#bech32-addressing-erd1), [Mnemonic](#mnemonic-seed-phrase), [Message Signing](#message-signing), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/wallet/wallets](https://docs.multiversx.com/wallet/wallets/).

---

### Mnemonic (Seed Phrase)

A human-readable list of words that encodes the secret from which an account's keys are derived.

Context: A mnemonic can regenerate the private key and address, so it must be kept secret; anyone with it controls the account. MultiversX wallets generate and restore accounts from a standard mnemonic.

See also: [Key Pair](#key-pair-public-and-private-key), [Keystore and PEM](#keystore-and-pem), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/wallet/wallets](https://docs.multiversx.com/wallet/wallets/); [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core).

---

### Keystore and PEM

Two file formats for storing account keys: a keystore is an encrypted JSON file unlocked by a password, while a PEM file stores the key unencrypted.

Context: Keystore files are for general use because they are password-protected. PEM files are convenient for development and automated testing but offer no protection and should not hold real funds.

See also: [Key Pair](#key-pair-public-and-private-key), [Mnemonic](#mnemonic-seed-phrase), [Wallet](#wallet).
Read more: [docs.multiversx.com/sdk-and-tools/sdk-py](https://docs.multiversx.com/sdk-and-tools/sdk-py/); [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core).

---

### Message Signing

Producing a signature over an arbitrary message, rather than a transaction, to prove control of an address without moving funds.

Context: Signed messages back login schemes such as NativeAuth and let applications verify that a user controls an address. The signature is verified against the account's public key.

See also: [NativeAuth](#nativeauth), [Key Pair](#key-pair-public-and-private-key), [Bech32 Addressing](#bech32-addressing-erd1).
Read more: [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core); [docs.multiversx.com/sdk-and-tools/sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/).

---

### Web Wallet

The official browser-based MultiversX wallet, at wallet.multiversx.com, for holding EGLD and tokens, signing transactions, and staking or delegating.

Context: The web wallet supports login by keystore file, Ledger, xPortal, and PEM, and on the test networks it provides a faucet for test funds. It is a common entry point for users and, via URL hooks, for dApp login flows.

See also: [Wallet](#wallet), [Wallet Extension (DeFi Wallet)](#wallet-extension-defi-wallet), [xAlias](#xalias), [Keystore and PEM](#keystore-and-pem).
Read more: [docs.multiversx.com/wallet/web-wallet](https://docs.multiversx.com/wallet/web-wallet/).

---

### Wallet Extension (DeFi Wallet)

The MultiversX browser-extension wallet, for Chrome, Brave, and Firefox, that creates or imports an account from a 24-word secret phrase and connects to dApps.

Context: The extension holds keys in the browser and signs transactions and messages for web applications, offering a lightweight alternative to the web wallet for day-to-day dApp use.

See also: [Wallet](#wallet), [Web Wallet](#web-wallet), [Mnemonic (Seed Phrase)](#mnemonic-seed-phrase), [mx-sdk-dapp](#mx-sdk-dapp).
Read more: [docs.multiversx.com/wallet/wallet-extension](https://docs.multiversx.com/wallet/wallet-extension/).

---

### Ledger (Hardware Wallet)

A hardware wallet device that stores an account's keys offline and signs MultiversX transactions on-device using the MultiversX app.

Context: With the MultiversX app installed through Ledger Live, a Ledger device keeps the private key isolated from the connected computer, and transactions are confirmed physically on the device. It is recommended for larger holdings.

See also: [Wallet](#wallet), [Web Wallet](#web-wallet), [Key Pair (Public and Private Key)](#key-pair-public-and-private-key), [Onchain Guardian](#onchain-guardian).
Read more: [docs.multiversx.com/wallet/ledger](https://docs.multiversx.com/wallet/ledger/).

---

### xAlias

A single sign-on wallet that onboards users through Google Sign-In, creating a self-custody MultiversX account without a seed phrase and convertible to a conventional wallet later.

Context: xAlias lets non-crypto users start with a familiar Web2 login while remaining self-custodial. For developers, integrating xAlias is identical to integrating the web wallet, since it exposes the same URL hooks and callbacks.

See also: [Wallet](#wallet), [Web Wallet](#web-wallet), [Mnemonic (Seed Phrase)](#mnemonic-seed-phrase), [NativeAuth](#nativeauth).
Read more: [docs.multiversx.com/wallet/xalias](https://docs.multiversx.com/wallet/xalias/).

---

### WalletConnect

An open protocol that connects a dApp to a compatible wallet over an encrypted channel, used on MultiversX so a dApp can request transaction and message signatures from a mobile wallet such as xPortal.

Context: MultiversX exposes WalletConnect JSON-RPC methods for signing, and xPortal implements them, so a user can approve actions on their phone while using a dApp on desktop. It is the vendor-agnostic path for mobile wallet integration.

See also: [xPortal](#xportal), [Wallet](#wallet), [mx-sdk-dapp](#mx-sdk-dapp), [Message Signing](#message-signing).
Read more: [docs.multiversx.com/integrators/walletconnect-json-rpc-methods](https://docs.multiversx.com/integrators/walletconnect-json-rpc-methods/); [docs.multiversx.com/wallet/xportal](https://docs.multiversx.com/wallet/xportal/).

---

## Ecosystem applications

These are widely referenced MultiversX-ecosystem products rather than parts of the base protocol. They are included because the names recur in MultiversX materials; the distinction (application, not protocol) is stated in each entry.

### xExchange

MultiversX's flagship decentralized exchange, an automated-market-maker DEX for swapping and providing liquidity in EGLD and ESDTs, with its own governance token (MEX).

Context: xExchange (formerly Maiar Exchange) is an ecosystem application built on MultiversX, not a protocol feature. It uses WEGLD to pair EGLD against ESDTs and offers swaps, liquidity pools, and yield farms.

See also: [WEGLD](#wegld-wrapped-egld), [ESDT](#esdt-estandard-digital-token), [EGLD](#egld), [Liquid Staking](#liquid-staking-lsegld).
Read more: [multiversx.com/ecosystem](https://multiversx.com/ecosystem); [xexchange.com](https://xexchange.com).

---

### xMoney

A MultiversX-ecosystem payments product for accepting and making crypto payments, including merchant checkout and card features.

Context: xMoney (formerly Utrust) is an ecosystem company and product, not a protocol feature. Like xExchange and xPortal, it is an application in the ecosystem rather than part of the base chain.

See also: [xPortal](#xportal), [EGLD](#egld), [ESDT](#esdt-estandard-digital-token).
Read more: [multiversx.com/ecosystem](https://multiversx.com/ecosystem).

---

## Upgrades

Named mainnet protocol upgrades are ratified through onchain governance. The entries below are listed in chronological order.

### Sirius

The January 2024 upgrade that improved smart-contract upgrade handling, optimized signature verification, and added multi-key support for validators.

Context: Sirius was the first major release ratified through MultiversX's onchain governance process, passing with 97.89% of voting stake in favor. It established the pattern of governing protocol upgrades by stake-weighted onchain vote.

See also: [Governance Proposal Process](#governance-proposal-process), [Barnard](#barnard).
Read more: MultiversX State of the Foundation Report 2025 ([files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf](https://files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf)).

---

### Vega

The April 2024 upgrade (v1.7) that removed the staking-queue waiting period for new validators and introduced a chain-simulator environment for development and testing.

Context: Removing the staking queue let new validators enter the active set without waiting for a slot to free up. The chain simulator gave developers a local environment that mimics protocol behavior without running a full network.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [ScenarioWorld](#scenarioworld).
Read more: MultiversX State of the Foundation Report 2025 ([files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf](https://files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf)).

---

### Spica

The November 2024 upgrade (v1.8) that added relayed transactions V3, dynamic NFT metadata, and onchain passkey authentication.

Context: Relayed V3 moved fee-relaying to explicit transaction fields. Dynamic NFT metadata allowed token attributes to change after minting. Onchain passkey authentication added a WebAuthn-style login path at the protocol level.

See also: [Relayed Transactions](#relayed-transactions-v1--v2--v3), [ESDT](#esdt-estandard-digital-token).
Read more: MultiversX State of the Foundation Report 2025 ([files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf](https://files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf)).

---

### Andromeda

The May 2025 upgrade (v1.9) that restructured consensus, cutting time-to-finality from 12 seconds to 6 seconds and raising per-shard validator capacity.

Context: Andromeda removed the legacy requirement for a separate confirmation block, so a single block carried finality. This made block time the binding latency constraint and is the predecessor that the Supernova upgrade builds on.

See also: [Secure Proof of Stake](#secure-proof-of-stake-spos), [Supernova](#supernova).
Read more: MultiversX, "Andromeda" release post ([multiversx.com/blog/andromeda-supernova-highspeed-highways](https://multiversx.com/blog/andromeda-supernova-highspeed-highways)); State of the Foundation Report 2025.

---

### Barnard

The July 2025 upgrade (v1.10) that moved the governance contracts onchain and added millisecond-level block timestamps available to smart contracts.

Context: Onchain governance contracts let proposals and voting execute as protocol-native operations. Millisecond timestamps gave contracts finer-grained time information than the prior second-level granularity.

See also: [Governance Proposal Process](#governance-proposal-process), [Supernova](#supernova).
Read more: MultiversX State of the Foundation Report 2025 ([files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf](https://files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf)).

---

### Staking V5 (and the emission split)

The first phase of the Economic Evolution changes, live on mainnet since 2 December 2025 (v1.11.1), which revised how staking rewards and new EGLD issuance are distributed.

Context: Staking V5 implemented the move away from the fixed-supply model toward tail inflation. The annual emission is split 50% to staking rewards, 20% to an ecosystem growth fund, 20% to a user growth dividend, and 10% to protocol sustainability. This split is sometimes misreported as "50/50"; the four-way split above is the figure to use.

See also: [Economic Evolution](#economic-evolution), [KPI-Gated Emissions](#kpi-gated-emissions), [EGLD](#egld), [Developer Revenue Share](#developer-revenue-share).
Read more: MultiversX, "Release: Staking V5 and New Emissions Model, Phase 1 (v1.11.1)" (Dec 2025, [multiversx.com/release/release-economics-update-phase-1-v1-11-1](https://multiversx.com/release/release-economics-update-phase-1-v1-11-1)); emission split itemized in the economic framework proposal ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)).

---

### Economic Evolution

The October 2025 governance proposal that dropped EGLD's fixed-supply cap and replaced it with a tail-inflation model.

Context: Under the new framework, EGLD issuance starts at roughly 8.76% of circulating supply per year and decays toward a floor of 2% to 5%, with the decay tied to ecosystem performance indicators. Base transaction fees are split between smart-contract builders and a permanent burn, starting at 90% to builders and 10% burned and transitioning on a schedule toward a 50/50 split over eight years (see Developer Revenue Share). The proposal passed an onchain governance vote in late October 2025 with 94.55% of voting stake in favor on 41.77% participation. The first phase of protocol changes shipped as Staking V5.

See also: [Staking V5](#staking-v5-and-the-emission-split), [KPI-Gated Emissions](#kpi-gated-emissions), [EGLD](#egld), [Developer Revenue Share](#developer-revenue-share), [Governance Proposal Process](#governance-proposal-process).
Read more: MultiversX, "The MultiversX Economic Evolution" (Oct 22, 2025, [multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion](https://multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion)); economic framework proposal on Agora ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)).

---

### Supernova

The MultiversX upgrade that rewrites the consensus and block-propagation pipeline to compress block time from roughly 6 seconds to 600 milliseconds, by overlapping voting with execution and decoupling execution from the consensus critical path.

Context: Supernova introduces execution dispatch before voting (validators begin executing a block once local validation passes, before casting their vote) and a metachain-mediated cross-shard finality gate that ensures cross-shard transactions are accepted only once the originating shard's block is proven final. Its onchain governance vote (8 to 18 January 2026) passed with 99.64% of voting stake in favor on a 33.63% quorum. Demonstrated figures: the Battle of Nodes public adversarial test (11 to 31 March 2026) sustained 120,000 transactions per second on its final day and processed over a billion transactions across thousands of community-run validators; the design target is 600ms blocks with sub-300ms intra-shard finality (a 100 to 250 millisecond intra-shard production target; a cross-shard transaction requires three rounds (sender's shard, metachain notarization, receiver's shard) and finalizes in approximately 1.8 seconds). As of June 2026 the upgrade has cleared an external security audit and is in final integration and testing toward mainnet; it is not yet live on mainnet.

See also: [Cross-Shard Atomicity](#cross-shard-atomicity), [Hyperblock](#hyperblock), [Andromeda](#andromeda), [Secure Proof of Stake](#secure-proof-of-stake-spos).
Read more: MultiversX, "Supernova: decoupling consensus and execution" ([multiversx.com/blog/supernova-decoupling-consensus-and-execution](https://multiversx.com/blog/supernova-decoupling-consensus-and-execution)); test figures from xAlliance Substack, "Supernova Engine Room" series and [@MultiversX, March 31, 2026](https://x.com/MultiversX/status/2039002331640180765).

---

## Framework and SDK

These terms describe the MultiversX developer toolchain: the Rust smart-contract framework (`multiversx-sc`, repository `mx-sdk-rs`) and the dApp/JS SDKs.

### Storage Mappers

Typed storage abstractions in the Rust smart-contract framework that present contract state (a single value, a set, a map, a list, a token) through a method on the contract trait, hiding the raw key-value encoding.

Context: A mapper is declared with a `#[storage_mapper("key")]` annotation and returns a typed handle, for example `SingleValueMapper<BigUint>` for one value or `UnorderedSetMapper<T>` for a set. Adding arguments to the method parameterizes the storage key, so `balance(addr)` resolves to a different slot per address. Different mappers have different storage-cost and access profiles, so the choice of mapper affects gas. The framework documents the per-mapper trade-offs in source.

See also: [Tx Syntax](#tx-syntax), [Typed Proxies](#typed-proxies), [sc-meta](#sc-meta), [WASM VM](#wasm-vm-and-wasmer).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/base/src/storage/mappers/`); MultiversX docs, storage mappers ([docs.multiversx.com/developers/developer-reference/storage-mappers](https://docs.multiversx.com/developers/developer-reference/storage-mappers/)).

---

### Tx Syntax

The unified, fluent transaction builder in the Rust framework for every kind of outgoing transaction from a contract: native EGLD transfer, ESDT transfer, cross-contract call, deploy, upgrade, and read-only query.

Context: A transaction is built by chaining methods, for example `self.tx().to(&recipient).egld(&amount).transfer()`. The builder is type-checked at compile time: combinations that are not valid, such as attaching EGLD on top of an ESDT payment, fail to compile. The same builder expresses sync calls (same-shard), async calls with a callback (cross-shard), and fire-and-forget transfers, differing only in the terminal operation. The design is described in Andrei Marinica's "One Syntax to rule them all" series (2024).

See also: [Typed Proxies](#typed-proxies), [Storage Mappers](#storage-mappers), [Cross-Shard Atomicity](#cross-shard-atomicity).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/base/src/types/interaction/tx.rs`); [docs.multiversx.com/sdk-and-tools/sdk-rust](https://docs.multiversx.com/sdk-and-tools/sdk-rust/).

---

### Typed Proxies

Plain Rust structs, generated from a contract's ABI, that let you call that contract (from another contract, a test, or an interactor) with full compile-time argument and return-type checking.

Context: A proxy is generated by running `sc-meta all proxy` against a path declared in `sc-config.toml`; the framework reads the ABI and writes one method per endpoint. The same proxy is used in three contexts with the same method names: cross-contract calls inside a contract, blackbox tests, and interactor scripts. Proxies are plain structs (not traits), are copyable between crates, and are never hand-edited; they are regenerated when endpoints change.

See also: [Tx Syntax](#tx-syntax), [sc-meta](#sc-meta), [ScenarioWorld](#scenarioworld).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/meta-lib`); Andrei Marinica, "One Syntax to rule them all," Part 2 (2024).

---

### ScenarioWorld

The blockchain test harness in the Rust framework's scenario crate, which runs contracts against a Rust implementation of the MultiversX VM for blackbox, whitebox, and JSON-scenario (Mandos) tests.

Context: A test sets up accounts and balances, deploys contracts, sends transactions, and asserts on results or storage, using the same typed proxies a real caller would. Blackbox tests exercise a contract as the blockchain would; whitebox tests reach into contract internals through a closure; scenario tests replay JSON (`.scen.json`, Mandos) files. The Rust VM runs contracts two ways: through an interpreter (the debugger) or by compiling them and executing through Wasmer (2.2 today, with an experimental Wasmer 6 integration). Blackbox and scenario tests can use either path, and scenario files additionally run against the production Go VM via `mx-scenario-go`, which guards against divergence between the two VMs; whitebox and unit tests use the Rust VM debugger only. Blackbox tests reference the built `.mxsc.json` artifact, so the contract must be built before they run.

See also: [Typed Proxies](#typed-proxies), [sc-meta](#sc-meta), [Vega](#vega).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/scenario`); [docs.multiversx.com/developers/testing/rust/sc-test-overview](https://docs.multiversx.com/developers/testing/rust/sc-test-overview/).

---

### sc-meta

The standalone command-line tool for MultiversX smart-contract development: building contracts to WebAssembly, generating proxies, scaffolding from templates, running tests, sending transactions, and managing the framework toolchain.

Context: Common commands include `sc-meta all build` (compile every contract under the current path to WASM and produce the `.mxsc.json` package), `sc-meta all proxy` (regenerate typed proxies), `sc-meta new --template <name>` (scaffold a contract), and `sc-meta test`. The build produces an optimized WASM binary plus a package bundling the WASM, the ABI, and metadata. `sc-meta` can also send transactions from the command line, deploying and interacting with contracts directly in the manner of mxpy. `sc-meta` is published as the `multiversx-sc-meta` crate.

See also: [Typed Proxies](#typed-proxies), [ScenarioWorld](#scenarioworld), [WASM VM](#wasm-vm-and-wasmer), [Storage Mappers](#storage-mappers).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/meta`); [docs.multiversx.com/developers/meta/sc-meta](https://docs.multiversx.com/developers/meta/sc-meta/).

---

### NativeAuth

A MultiversX-native authentication scheme in which a wallet issues a signed token bound to a specific origin, a recent block hash, and an expiry, which a backend then verifies as proof of wallet control.

Context: The token encodes the origin, a recent block hash, an expiry in seconds, and optional signed extra information; the user signs it with their wallet, and a server verifies the signature, the origin, and the chain state. Expiry is enforced by distance from the bound block rather than by a server clock, so once the chain passes the bound block plus the expiry, the token is invalid by construction, with no revocation list. It is used for wallet-gated APIs and single sign-on across MultiversX dApps, and is wired into the dApp SDK via `initApp({ dAppConfig: { nativeAuth: true } })`.

See also: [Onchain Guardian](#onchain-guardian), [Bech32 Addressing](#bech32-addressing-erd1).
Read more: [github.com/multiversx/mx-sdk-dapp](https://github.com/multiversx/mx-sdk-dapp) (`src/services/nativeAuth/`); `@multiversx/sdk-native-auth-client` and `@multiversx/sdk-native-auth-server` packages.

---

### ABI (Application Binary Interface)

The machine-readable description of a smart contract's endpoints, arguments, return types, events, and custom types, used to encode calls and decode results.

Context: The ABI is produced when a contract is built. SDKs and the typed-proxy generator read it to convert native values to the contract's binary encoding and back, so callers do not hand-encode arguments. It is the contract's interface contract for tools and other programs.

See also: [Typed Proxies](#typed-proxies), [Tx Syntax](#tx-syntax), [sc-meta](#sc-meta).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs); [docs.multiversx.com/developers/data/abi](https://docs.multiversx.com/developers/data/abi/).

---

### Managed Types

The heap-light value types the Rust framework uses inside contracts (such as `BigUint`, `ManagedBuffer`, `ManagedVec`, and `ManagedAddress`) in place of standard-library types.

Context: Contracts run in a no-std WebAssembly environment without a normal allocator, so the framework provides managed equivalents whose data lives in the VM rather than in contract memory. `BigUint` is an arbitrary-precision unsigned integer; `ManagedBuffer` replaces byte vectors and strings; `ManagedVec` replaces `Vec`. Using them keeps contracts small and gas-efficient.

See also: [WASM VM](#wasm-vm-and-wasmer), [Storage Mappers](#storage-mappers), [Tx Syntax](#tx-syntax).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/base/src/types`); [docs.multiversx.com/developers/developer-reference](https://docs.multiversx.com/developers/developer-reference/).

---

### mxpy

The MultiversX command-line tool for deploying and interacting with contracts, for sending transactions, and for performing wallet and account operations.

Context: mxpy wraps common developer tasks (interacting with contracts, sending transactions, managing wallets, querying the network) in a CLI.

See also: [sc-meta](#sc-meta), [Typed Proxies](#typed-proxies), [Account Nonce](#account-nonce).
Read more: [docs.multiversx.com/sdk-and-tools/mxpy](https://docs.multiversx.com/sdk-and-tools/mxpy/).

---

### Account Nonce

A per-account counter that increments with each transaction the account sends, fixing transaction order and preventing replay.

Context: Every transaction must carry the sender's current nonce, and the network rejects one whose nonce is out of sequence. When sending several transactions in a row, a client fetches the latest nonce from the network and increments it locally. The nonce is account-scoped, not global.

See also: [Bech32 Addressing](#bech32-addressing-erd1), [Relayed Transactions](#relayed-transactions-v1--v2--v3), [mxpy](#mxpy).
Read more: [docs.multiversx.com/developers/account-management](https://docs.multiversx.com/developers/account-management/); [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core).

---

### multiversx-sc (mx-sdk-rs)

The official Rust framework for writing, building, and testing MultiversX smart contracts, distributed in the `mx-sdk-rs` repository.

Context: Also called the SpaceCraft framework, it provides the contract API, managed types, storage mappers, the unified Tx syntax, typed proxies, the build tool `sc-meta`, and a Rust implementation of the VM for testing. Most MultiversX contracts are written with it.

See also: [Storage Mappers](#storage-mappers), [Tx Syntax](#tx-syntax), [Typed Proxies](#typed-proxies), [sc-meta](#sc-meta), [Managed Types](#managed-types).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs); [docs.multiversx.com/sdk-and-tools/overview](https://docs.multiversx.com/sdk-and-tools/overview/).

---

### mx-sdk-js-core

The core JavaScript and TypeScript SDK for interacting with MultiversX: accounts, transactions, signing, queries, and smart contract calls.

Context: It provides the primitives (Address, Transaction, Account, network providers) used by backends, scripts, and higher-level libraries such as the dApp SDK.

See also: [mx-sdk-dapp](#mx-sdk-dapp), [Account Nonce](#account-nonce), [NativeAuth](#nativeauth).
Read more: [github.com/multiversx/mx-sdk-js-core](https://github.com/multiversx/mx-sdk-js-core); [docs.multiversx.com/sdk-and-tools/sdk-js](https://docs.multiversx.com/sdk-and-tools/sdk-js/).

---

### mx-sdk-dapp

A library holding the core functional logic for building MultiversX dApps: wallet-provider connections, transaction signing and tracking, and login state.

Context: It abstracts the supported wallet providers (xPortal/WalletConnect, extension, web wallet, Ledger, passkey) behind one interface and manages the sign, send, and track lifecycle. It is framework-agnostic, with React conveniences.

See also: [mx-sdk-js-core](#mx-sdk-js-core), [NativeAuth](#nativeauth), [Wallet](#wallet).
Read more: [github.com/multiversx/mx-sdk-dapp](https://github.com/multiversx/mx-sdk-dapp); [docs.multiversx.com/sdk-and-tools/sdk-dapp](https://docs.multiversx.com/sdk-and-tools/sdk-dapp/).

---

### Scenarios (testing)

A JSON-based test format that describes blockchain state, transactions, and expected results, runnable against both the Rust VM and the production Go VM.

Context: Scenario files (formerly called Mandos) let the same test verify a contract under the Rust test framework and the Go VM, which guards against divergence between them. The Rust framework also offers blackbox and whitebox test styles over the same engine.

See also: [ScenarioWorld](#scenarioworld), [sc-meta](#sc-meta), [Chain Simulator](#chain-simulator).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs); [docs.multiversx.com/developers/testing/rust/sc-test-overview](https://docs.multiversx.com/developers/testing/rust/sc-test-overview/).

---

### Chain Simulator

A local binary that mimics a MultiversX network, exposing the proxy endpoints plus extra controls so developers can test against realistic behavior without a full testnet.

Context: Introduced with the Vega upgrade, it lets developers drive network state and fast-forward epochs for integration tests. It replicates a local testnet's behavior for faster, deterministic development.

See also: [ScenarioWorld](#scenarioworld), [MultiversX Proxy](#multiversx-proxy), [Vega](#vega).
Read more: [docs.multiversx.com/sdk-and-tools/chain-simulator](https://docs.multiversx.com/sdk-and-tools/chain-simulator/).

---

### MultiversX Proxy

A service that sits in front of observer nodes and exposes a single HTTP API, routing each request to the correct shard.

Context: The proxy is the component an observing squad uses to present the whole sharded network as one endpoint. Public gateways and self-hosted setups both run a proxy.

See also: [Observing Squad](#observing-squad), [MultiversX API](#multiversx-api), [Observer](#observer-node).
Read more: [docs.multiversx.com/sdk-and-tools/overview](https://docs.multiversx.com/sdk-and-tools/overview/); [docs.multiversx.com/integrators/observing-squad](https://docs.multiversx.com/integrators/observing-squad/).

---

### MultiversX API

The public HTTP API (`api.multiversx.com`) that serves account, transaction, token, and network data, backed by observers and an indexer.

Context: It is the most common way applications read MultiversX data and submit transactions, layering a richer, indexed interface (using Elasticsearch) over the lower-level proxy. Network-specific hosts exist for devnet and testnet.

See also: [MultiversX Proxy](#multiversx-proxy), [Observing Squad](#observing-squad), [NativeAuth](#nativeauth).
Read more: [docs.multiversx.com/sdk-and-tools/rest-api](https://docs.multiversx.com/sdk-and-tools/rest-api/).

---

### Contract Trait (#[contract], #[module])

The Rust framework's model in which a smart contract is written as a trait, annotated with `#[multiversx_sc::contract]`, whose methods become the contract's endpoints, views, and storage declarations.

Context: Annotations on the trait's methods mark behavior: `#[init]` and `#[upgrade]` for lifecycle, `#[endpoint]` and `#[view]` for callable methods, `#[storage_mapper("key")]` for state, `#[payable]` and `#[only_owner]` for guards, and `#[event]` for logs. Reusable logic is factored into `#[multiversx_sc::module]` traits and composed by listing them as supertraits. The build tool reads this trait to generate the WASM entry points and the ABI.

See also: [multiversx-sc (mx-sdk-rs)](#multiversx-sc-mx-sdk-rs), [Storage Mappers](#storage-mappers), [Reusable Modules](#reusable-modules-multiversx-sc-modules), [ABI](#abi-application-binary-interface), [sc-meta](#sc-meta).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/derive`); [docs.multiversx.com/developers/developer-reference](https://docs.multiversx.com/developers/developer-reference/).

---

### Reusable Modules (multiversx-sc-modules)

A library of ready-made contract modules in the Rust framework that a contract can inherit to gain common functionality without reimplementing it.

Context: Modules are trait-based and composed by listing them as supertraits of the contract trait. The `multiversx-sc-modules` crate ships modules for pausing, admin-only access control, governance, staking, ESDT helpers, subscriptions, DNS, token merging, bonding curves, developer-reward claiming, and long-running operations. A contract opts in by adding the module to its trait bounds and gains the module's endpoints and storage.

See also: [multiversx-sc (mx-sdk-rs)](#multiversx-sc-mx-sdk-rs), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module), [Storage Mappers](#storage-mappers), [Tx Syntax](#tx-syntax).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`contracts/modules`); [docs.multiversx.com/developers/developer-reference](https://docs.multiversx.com/developers/developer-reference/).

---

### Multi-Value Types

Framework types that let a contract endpoint take a variable or optional number of arguments, or return several values, by mapping a single logical type to multiple serialized argument slots.

Context: `MultiValueEncoded<T>` carries a variable-length list of arguments or results; `OptionalValue<T>` is a trailing optional argument; `MultiValue2<...>` through `MultiValueN` group a fixed number of values. They exist because a contract call's arguments are a flat list, and these types describe how a Rust signature maps onto that list.

See also: [multiversx-sc (mx-sdk-rs)](#multiversx-sc-mx-sdk-rs), [Managed Types](#managed-types), [ABI](#abi-application-binary-interface).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/base/src/types`); [docs.multiversx.com/developers/developer-reference](https://docs.multiversx.com/developers/developer-reference/).

---

### Interactors (Snippets)

The Rust framework's tooling for driving a real network, or the chain simulator, from off-chain code, using the same typed proxies that contracts and tests use.

Context: Built on the `multiversx-sc-snippets` crate, an interactor sends transactions and queries against a gateway or the chain simulator, so the identical proxy methods serve three settings: cross-contract calls inside a contract, blackbox tests, and live interaction. Interactors are how a project scripts deploys and end-to-end checks against devnet, testnet, or mainnet.

See also: [Typed Proxies](#typed-proxies), [ScenarioWorld](#scenarioworld), [Chain Simulator](#chain-simulator), [sc-meta](#sc-meta).
Read more: [github.com/multiversx/mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) (`framework/snippets`); [docs.multiversx.com/sdk-and-tools/sdk-rust](https://docs.multiversx.com/sdk-and-tools/sdk-rust/).

---

### Official SDKs

The set of MultiversX libraries for interacting with the blockchain from different languages and frameworks.

Context: The docs list sdk-js (JavaScript and TypeScript), sdk-dapp (React and framework-agnostic dApp logic), sdk-py (Python), sdk-nestjs (NestJS microservices), sdk-go (Go), plus community-referenced mxjava (Java) and erdcpp (C++). Each provides wallet, transaction, signing, query, and contract-interaction capabilities in its language.

See also: [mx-sdk-js-core](#mx-sdk-js-core), [mx-sdk-dapp](#mx-sdk-dapp), [sdk-py](#sdk-py), [sdk-nestjs](#sdk-nestjs), [mxpy](#mxpy).
Read more: [docs.multiversx.com/sdk-and-tools/overview](https://docs.multiversx.com/sdk-and-tools/overview/).

---

### sdk-py

The official Python SDK for MultiversX, used to create wallets, build and send transactions, and interact with smart contracts and the network.

Context: sdk-py is the Python counterpart to sdk-js, suited to backend services, scripting, and automation. The mxpy command-line tool builds on the same Python libraries.

See also: [Official SDKs](#official-sdks), [mxpy](#mxpy), [mx-sdk-js-core](#mx-sdk-js-core).
Read more: [docs.multiversx.com/sdk-and-tools/sdk-py](https://docs.multiversx.com/sdk-and-tools/sdk-py/).

---

### sdk-nestjs

A MultiversX SDK for the NestJS framework, commonly used across the MultiversX microservice ecosystem.

Context: sdk-nestjs packages building blocks for backend microservices, including native-auth handling, caching, and monitoring utilities, so services in the ecosystem share common infrastructure.

See also: [Official SDKs](#official-sdks), [NativeAuth](#nativeauth), [mx-sdk-js-core](#mx-sdk-js-core).
Read more: [docs.multiversx.com/sdk-and-tools/sdk-nestjs](https://docs.multiversx.com/sdk-and-tools/sdk-nestjs/).

---

### Endpoint

A public method of a smart contract that can be called by a transaction, declared in the Rust framework with the #[endpoint] annotation.

Context: Endpoints are the contract's callable surface. A method marked #[endpoint] is state-changing; a read-only method is marked #[view]. The build tool exposes annotated methods as the contract's WASM entry points and records them in the ABI.

See also: [View](#view), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module), [ABI (Application Binary Interface)](#abi-application-binary-interface), [Payable Endpoint](#payable-endpoint).
Read more: [docs.multiversx.com/developers/developer-reference/sc-annotations](https://docs.multiversx.com/developers/developer-reference/sc-annotations/).

---

### View

A read-only endpoint, declared with the #[view] annotation, intended to query contract state without changing it.

Context: A view is functionally similar to an endpoint but signals read-only intent and is typically used for queries. Views are recorded in the ABI so SDKs and explorers can call them to read contract state.

See also: [Endpoint](#endpoint), [ABI (Application Binary Interface)](#abi-application-binary-interface), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module).
Read more: [docs.multiversx.com/developers/developer-reference/sc-annotations](https://docs.multiversx.com/developers/developer-reference/sc-annotations/).

---

### Init and Upgrade

The lifecycle methods of a contract: #[init] runs once when the contract is deployed, and #[upgrade] runs when the contract's code is replaced.

Context: The init constructor can take arguments to set up initial state. Since framework v1.6.0 a dedicated #[upgrade] function handles code upgrades separately from init, so migration logic is explicit. Storage persists across an upgrade, so changing the storage layout needs care.

See also: [Contract Trait (#[contract], #[module])](#contract-trait-contract-module), [Code Metadata](#code-metadata), [sc-meta](#sc-meta).
Read more: [docs.multiversx.com/developers/developer-reference/sc-annotations](https://docs.multiversx.com/developers/developer-reference/sc-annotations/); [docs.multiversx.com/developers/developer-reference/upgrading-smart-contracts](https://docs.multiversx.com/developers/developer-reference/upgrading-smart-contracts/).

---

### Payable Endpoint

An endpoint marked #[payable] so it can receive a payment (EGLD or ESDT tokens) along with the call.

Context: Without the payable annotation an endpoint rejects attached value. #[payable("EGLD")] or #[payable("TOKEN-ID")] narrows what is accepted; the contract reads the incoming payment through the call-value API. This is distinct from the code-metadata payable flag, which governs plain transfers to the contract.

See also: [Endpoint](#endpoint), [Code Metadata](#code-metadata), [ESDT (eStandard Digital Token)](#esdt-estandard-digital-token), [Tx Syntax](#tx-syntax).
Read more: [docs.multiversx.com/developers/developer-reference/sc-payments](https://docs.multiversx.com/developers/developer-reference/sc-payments/).

---

### only_owner

An annotation that restricts an endpoint so only the contract's owner address may call it.

Context: Marking a method #[only_owner] adds an ownership check, so administrative endpoints (for example configuration or upgrades) can be limited to the deploying account. It is the framework's built-in access guard.

See also: [Endpoint](#endpoint), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module), [Reusable Modules (multiversx-sc-modules)](#reusable-modules-multiversx-sc-modules).
Read more: [docs.multiversx.com/developers/developer-reference/sc-annotations](https://docs.multiversx.com/developers/developer-reference/sc-annotations/).

---

### Contract Calls (sync, async, transfer-execute)

The three ways a contract calls another contract: a synchronous call that runs inline and returns a result, an asynchronous call that runs after the current transaction and can trigger a callback, and a transfer-execute that sends value and calls a function without expecting a result.

Context: A synchronous call works only when both contracts are in the same shard. An asynchronous call works across shards and reports its outcome to a #[callback]. A transfer-execute is fire-and-forget. The unified Tx syntax expresses all three, differing only in the terminal operation.

See also: [Callback](#callback), [Tx Syntax](#tx-syntax), [Cross-Shard Atomicity](#cross-shard-atomicity), [Typed Proxies](#typed-proxies).
Read more: [docs.multiversx.com/developers/developer-reference/sc-to-sc-calls](https://docs.multiversx.com/developers/developer-reference/sc-to-sc-calls/).

---

### Callback

A method marked #[callback] that the framework invokes automatically when an asynchronous contract call completes, receiving the call's result along with any context passed from the call site.

Context: Because cross-shard calls are asynchronous, a contract cannot read the return value inline; it reacts in a callback once the call finishes. The callback is where a contract handles success or failure of an async call, including any compensating action.

See also: [Contract Calls (sync, async, transfer-execute)](#contract-calls-sync-async-transfer-execute), [Cross-Shard Atomicity](#cross-shard-atomicity), [Tx Syntax](#tx-syntax).
Read more: [docs.multiversx.com/developers/developer-reference/sc-to-sc-calls](https://docs.multiversx.com/developers/developer-reference/sc-to-sc-calls/).

---

### Code Metadata

The flags set when a contract is deployed or upgraded that control contract-level properties: whether it is upgradeable, readable by other contracts, payable, and payable by smart contracts.

Context: Code metadata is fixed at deploy or upgrade time and governs how the contract may be treated afterward, for example whether it can be upgraded later or receive plain transfers. It is separate from per-endpoint annotations such as #[payable].

See also: [Init and Upgrade](#init-and-upgrade), [Payable Endpoint](#payable-endpoint), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module).
Read more: [docs.multiversx.com/developers/data/code-metadata](https://docs.multiversx.com/developers/data/code-metadata/).

---

### Serialization (TopEncode / NestedEncode)

The MultiversX codec that turns contract values into bytes and back, with a top-level encoding for standalone values and a nested encoding for values inside larger structures.

Context: Top-level encoding (TopEncode/TopDecode) is used where a single value stands alone, such as a call argument or result, and can drop leading zeros because its length is known from context. Nested encoding (NestedEncode/NestedDecode) is used inside collections, tuples, and structs, where each value's length must be encoded so it can be read unambiguously.

See also: [ABI (Application Binary Interface)](#abi-application-binary-interface), [Managed Types](#managed-types), [Multi-Value Types](#multi-value-types).
Read more: [docs.multiversx.com/developers/data/serialization-overview](https://docs.multiversx.com/developers/data/serialization-overview/).

---

### Managed Decimal

A fixed-point decimal type in the Rust framework that pairs an integer value with a decimal scale, for representing decimal numbers inside a contract.

Context: ManagedDecimal is a managed type suited to token amounts and rates, giving decimal arithmetic without floating point. Like other managed types its data lives in the VM rather than in contract memory.

See also: [Managed Types](#managed-types), [Contract Trait (#[contract], #[module])](#contract-trait-contract-module).
Read more: [docs.multiversx.com/developers/best-practices/managed-decimal](https://docs.multiversx.com/developers/best-practices/managed-decimal/).

---

### Gas Limit

The maximum amount of gas a transaction may consume, declared by the sender when the transaction is built.

Context: The gas limit must fall between the network's minimum and maximum, and any gas reserved but not used is refunded to the sender. Setting it too low causes the transaction to run out of gas; setting it generously does not, by itself, cost the full amount because of the refund.

See also: [Gas and Fees](#gas-and-fees), [Gas Price](#gas-price), [Gas Refund](#gas-refund).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Gas Price

The price per unit of gas a transaction is willing to pay, declared by the sender and required to meet the network minimum.

Context: The fee is gas consumed times gas price, with the execution part of a contract call charged at the gas price times a lower modifier. Raising the gas price does not change how much gas a transaction uses, only the rate paid per unit.

See also: [Gas and Fees](#gas-and-fees), [Gas Limit](#gas-limit), [Gas-Price Modifier](#gas-price-modifier).
Read more: [docs.multiversx.com/developers/gas-and-fees/overview](https://docs.multiversx.com/developers/gas-and-fees/overview/).

---

### Code Hash

A cryptographic checksum of a deployed contract's bytecode, computed by the network and stored onchain.

Context: The code hash lets anyone verify a contract's bytecode, and it is the basis for confirming that a reproducible build produced exactly the bytecode that is deployed. Two builds that yield the same code hash contain identical bytecode.

See also: [Reproducible Build](#reproducible-build), [Smart Contract](#smart-contract), [Contract Address](#contract-address).
Read more: [docs.multiversx.com/developers/reproducible-contract-builds](https://docs.multiversx.com/developers/reproducible-contract-builds/).

---

### Reproducible Build

A deterministic contract build, run inside a pinned Docker image, that produces the same WebAssembly bytecode from the same source every time.

Context: By freezing the toolchain (compiler, wasm-opt, and dependency versions) in a versioned image, a reproducible build lets a third party recompile the source and confirm, via the code hash, that it matches the deployed contract. It is how contract bytecode is independently verified.

See also: [Code Hash](#code-hash), [sc-meta](#sc-meta), [Smart Contract](#smart-contract).
Read more: [docs.multiversx.com/developers/reproducible-contract-builds](https://docs.multiversx.com/developers/reproducible-contract-builds/).

---

### Contract Address

The bech32 address the network assigns to a smart contract when it is deployed, computed deterministically from the deployer's address and nonce.

Context: A contract address is a recognizable subclass of the normal address format and identifies the contract's code and storage. Because it is derived from the deployer and nonce, it can be computed before deployment, which lets a deploy flow know the address in advance.

See also: [Account](#account), [Bech32 Addressing (erd1…)](#bech32-addressing-erd1), [Account Nonce](#account-nonce), [Smart Contract](#smart-contract).
Read more: [docs.multiversx.com/developers/smart-contracts](https://docs.multiversx.com/developers/smart-contracts/).

---

### Blackbox and Whitebox Testing

Two integration-test styles in the Rust framework: a blackbox test exercises a contract only through its public interface, while a whitebox test reaches into the contract's internals.

Context: Blackbox tests run against the contract as the blockchain would see it (and scenario files additionally run against the production Go VM), which makes them the most realistic. Whitebox tests run on the Rust VM and can access private functions and internal state for step-by-step debugging.

See also: [ScenarioWorld](#scenarioworld), [Scenarios (testing)](#scenarios-testing), [Typed Proxies](#typed-proxies), [sc-meta](#sc-meta).
Read more: [docs.multiversx.com/developers/testing/testing-overview](https://docs.multiversx.com/developers/testing/testing-overview/).

---

### Gateway

The official public MultiversX HTTP API endpoint that fronts an observing squad, routing each request to the correct shard's observer.

Context: The gateway (gateway.multiversx.com) exposes the proxy's endpoints over the whole sharded network without requiring authentication, so applications can read data and broadcast transactions through one host. The same software can be self-hosted for private infrastructure.

See also: [MultiversX Proxy](#multiversx-proxy), [Observing Squad](#observing-squad), [MultiversX API](#multiversx-api).
Read more: [docs.multiversx.com/sdk-and-tools/rest-api/gateway-overview](https://docs.multiversx.com/sdk-and-tools/rest-api/gateway-overview/).

---

### Elastic Indexer

A component that ingests blockchain data from an observer and indexes it into Elasticsearch, enabling historical and search queries over chain data.

Context: The MultiversX API layers its richer, indexed interface over data held in Elasticsearch, which the elastic indexer populates from the network. Running the indexer is how a self-hosted setup gains historical query capability.

See also: [MultiversX API](#multiversx-api), [Observer (node)](#observer-node), [Events Notifier](#events-notifier).
Read more: [docs.multiversx.com/sdk-and-tools/elastic-indexer](https://docs.multiversx.com/sdk-and-tools/elastic-indexer/).

---

### Events Notifier

A service that receives block events from an observer and pushes them to subscribers over a message queue or WebSocket, for real-time event streaming.

Context: The notifier lets applications react to onchain events as they happen instead of polling the API. It is used to build reactive dApps and integrations that need push-based updates.

See also: [Elastic Indexer](#elastic-indexer), [MultiversX API](#multiversx-api), [Observer (node)](#observer-node).
Read more: [docs.multiversx.com/sdk-and-tools/notifier](https://docs.multiversx.com/sdk-and-tools/notifier/).

---

### Deep-History Squad

An observing squad that keeps a non-pruned history of the blockchain, so it can answer queries about an account's state at any past block.

Context: A standard observing squad retains only recent state, whereas a deep-history squad preserves historical tries, letting an application read balances or storage as they were at an arbitrary block height. It is used where historical state access is required.

See also: [Observing Squad](#observing-squad), [Snapshotless Observer](#snapshotless-observer), [MultiversX Proxy](#multiversx-proxy).
Read more: [docs.multiversx.com/integrators/deep-history-squad](https://docs.multiversx.com/integrators/deep-history-squad/).

---

### Snapshotless Observer

An observer running in a mode that skips trie snapshots at epoch boundaries and prunes trie storage, trading historical state access for a smaller footprint.

Context: By not creating snapshots, a snapshotless observer avoids that CPU and disk overhead and serves current-state queries and transaction broadcasting efficiently. It is the opposite trade-off to a deep-history squad.

See also: [Observer (node)](#observer-node), [Deep-History Squad](#deep-history-squad), [Observing Squad](#observing-squad).
Read more: [docs.multiversx.com/integrators/snapshotless-observing-squad](https://docs.multiversx.com/integrators/snapshotless-observing-squad/).

---

## Agent stack

MultiversX's agentic-commerce stack integrates several external standards (MCP, x402, Stripe's MPP, Google's UCP and AP2, the OpenAI/Stripe ACP) and adds protocol-native pieces for agent identity (MX-8004) and a developer hub (Agent Hub).

### MX-8004

MultiversX's onchain agent identity standard, built as a set of four smart contracts covering Identity, Reputation, Validation, and Escrow, and positioned as semantically aligned with Ethereum's ERC-8004 patterns.

Context: The four-contract framing is a point of difference from ERC-8004's three-contract framing; the Escrow contract is the fourth and is often omitted from third-party coverage. The standard's taxonomy (OASF) is carried in IPFS manifests rather than enforced onchain. MX-8004 is the current and canonical name and stays until further notice. (A rename was explored internally to avoid search-result collision with Ethereum's ERC-8004; it is not active, and all published assets use MX-8004.)

See also: [MCP Server](#mcp-server-multiversx), [MPP](#mpp-machine-payments-protocol), [Agent Hub](#agent-hub), [x402](#x402-multiversx-adapter).
Read more: MultiversX, "Universal Identity and Trust Layer for Agents" ([multiversx.com/blog/universal-identity-and-trust-layer-for-agents](https://multiversx.com/blog/universal-identity-and-trust-layer-for-agents)).

---

### MCP Server (MultiversX)

A Model Context Protocol server that exposes MultiversX blockchain operations as tools an AI agent or assistant can call.

Context: MCP is an open standard for connecting language models to external tools and data; the MultiversX MCP server provides tools for querying accounts, building and sending transactions, and interacting with contracts and tokens. The official MultiversX MCP package exposes 14 tools. A separate community-maintained server (referenced on the MultiversX `/ai` page) exposes 13 tools; the two should not be conflated. The companion `mx-ai-skills` repository provides 25 skills (its README states "19+", which understates the count).

See also: [Agent Hub](#agent-hub), [MX-8004](#mx-8004), [x402](#x402-multiversx-adapter).
Read more: [github.com/multiversx/mx-mcp](https://github.com/multiversx/mx-mcp); MultiversX `/ai` page ([multiversx.com/ai](https://multiversx.com/ai)); tool and skill counts corroborated by internal review (May 2026).

---

### x402 (MultiversX adapter)

A MultiversX adapter for the x402 protocol, which uses the HTTP 402 "Payment Required" status code to let a client (including an autonomous agent) pay for a resource inline over HTTP.

Context: x402 is an open payment standard originating outside MultiversX; the adapter lets an x402 payment settle on MultiversX. It is one of several agentic-commerce standards MultiversX has built integrations for, alongside MCP, Google's UCP and AP2, and the OpenAI/Stripe ACP. The MultiversX advantage in this area is breadth of supported standards rather than dominance of agent transaction volume.

See also: [MPP](#mpp-machine-payments-protocol), [Agent Hub](#agent-hub), [MCP Server](#mcp-server-multiversx), [MX-8004](#mx-8004).
Read more: MultiversX, "MultiversX speaks Agent" ([multiversx.com/blog/multiversx-speaks-agent](https://multiversx.com/blog/multiversx-speaks-agent)); x402 protocol specification (external).

---

### MPP (Machine Payments Protocol)

Stripe and Tempo's Machine Payments Protocol, a standard for autonomous machine-to-machine payments, for which MultiversX serves as a settlement venue.

Context: MPP is authored by Stripe and Tempo, not by MultiversX. The accurate framing is "Stripe's Machine Payments Protocol, settled on MultiversX," rather than "MultiversX MPP." Low-latency settlement is the property that makes a chain suitable for high-frequency machine payments, which is the connection to the Supernova upgrade.

See also: [x402](#x402-multiversx-adapter), [Supernova](#supernova), [Agent Hub](#agent-hub), [MX-8004](#mx-8004).
Read more: MultiversX, "Stripe's Machine Payments Protocol on MultiversX" ([multiversx.com/blog/stripes-machine-payments-protocol-on-multiversx](https://multiversx.com/blog/stripes-machine-payments-protocol-on-multiversx)).

---

### Agent Hub

MultiversX's hub for agentic development, bringing together the agent identity standard, the MCP server and skills, the payment-protocol adapters, and an agent explorer, launched in March 2026.

Context: The Agent Hub is the developer surface for building agents on MultiversX: it gathers the tooling (MCP server, `mx-ai-skills`, `mx-agent-kit`) and the standards (agent identity, MPP, x402, UCP, AP2, ACP) in one place. A devnet Agent Explorer surfaces registered agents.

See also: [MX-8004](#mx-8004), [MCP Server](#mcp-server-multiversx), [x402](#x402-multiversx-adapter), [MPP](#mpp-machine-payments-protocol).
Read more: MultiversX, "The MultiversX Universal Agentic Commerce Stack" ([multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack](https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack)).

---

### UCP (Universal Commerce Protocol)

An open commerce-orchestration standard from Google and Shopify that coordinates the steps above payment (product discovery, checkout, and post-purchase) for AI-assisted shopping, using lower-level payment and agent protocols underneath.

Context: UCP sits a layer above settlement: it orchestrates a purchase flow and delegates payment and agent-to-agent messaging to protocols such as AP2, A2A, and x402. Its public specification was published in January 2026 and it is wired into Google's AI shopping surfaces. MultiversX built an integration so a UCP flow can settle onchain; as with the other agentic standards, the MultiversX position is breadth of supported standards rather than control of the standard itself.

See also: [AP2](#ap2-agent-payments-protocol), [ACP](#acp-agentic-commerce-protocol), [x402 (MultiversX adapter)](#x402-multiversx-adapter), [Agent Hub](#agent-hub).
Read more: Google Developers Blog, "Under the hood: Universal Commerce Protocol (UCP)"; Shopify Engineering, "UCP"; MultiversX agentic-stack coverage ([multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack](https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack)).

---

### AP2 (Agent Payments Protocol)

Google's open protocol for agent-initiated payments, built around cryptographically signed "mandates" that create a non-repudiable record of what a user authorized an agent to buy.

Context: AP2 chains a user's intent, the resulting cart, and the payment into signed mandates, so an agent's purchase can be proven to match what the user approved. It is rail-agnostic, with crypto settlement handled through an x402 extension, and launched in September 2025 with a broad partner list (including Mastercard, PayPal, American Express, and Coinbase). MultiversX is among the chains that can settle AP2-authorized payments.

See also: [UCP](#ucp-universal-commerce-protocol), [ACP](#acp-agentic-commerce-protocol), [x402 (MultiversX adapter)](#x402-multiversx-adapter), [MX-8004](#mx-8004), [Agent Hub](#agent-hub).
Read more: Google Cloud Blog, "Announcing the Agent Payments Protocol (AP2)"; MultiversX agentic-stack coverage ([multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack](https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack)).

---

### ACP (Agentic Commerce Protocol)

The Agentic Commerce Protocol from OpenAI and Stripe, a standard for letting an AI assistant complete a purchase (for example, checkout inside ChatGPT), for which MultiversX has built an integration.

Context: ACP, published in September 2025, covers the checkout handoff between an assistant and a merchant, paired with Stripe's Shared Payment Token. Note a naming collision: "ACP" is also used by Virtuals for a separate Agent Commerce Protocol on Base; the MultiversX agentic stack refers to the OpenAI/Stripe Agentic Commerce Protocol. As with the other standards here, MultiversX provides an adapter rather than authoring the protocol.

See also: [UCP](#ucp-universal-commerce-protocol), [AP2](#ap2-agent-payments-protocol), [MPP](#mpp-machine-payments-protocol), [x402 (MultiversX adapter)](#x402-multiversx-adapter), [Agent Hub](#agent-hub).
Read more: Stripe newsroom, "Stripe and OpenAI bring Instant Checkout to ChatGPT" (Sept 2025); MultiversX agentic-stack coverage ([multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack](https://multiversx.com/blog/the-multiversx-universal-agentic-commerce-stack)).

---

### mx-agent-kit

A MultiversX toolkit that exposes blockchain actions (such as building and sending transactions or calling contracts) as functions an AI agent can invoke, so a developer can give an agent the ability to transact on MultiversX.

Context: The agent kit wraps the SDK's operations as agent-callable actions, alongside the MCP server and mx-ai-skills, and is one of the building blocks gathered under the Agent Hub. Some of the agent tooling is maintained on a core engineer's personal GitHub rather than under the `multiversx` organization, so repository provenance should be confirmed before a specific link is published as official.

See also: [MCP Server (MultiversX)](#mcp-server-multiversx), [mx-ai-skills](#mx-ai-skills), [Agent Hub](#agent-hub), [mx-sdk-js-core](#mx-sdk-js-core).
Read more: MultiversX `/ai` page ([multiversx.com/ai](https://multiversx.com/ai)); MultiversX agentic-stack coverage. (Provenance: confirm whether the kit is hosted under the `multiversx` org or a core engineer's personal account before publishing a direct link.)

---

### mx-ai-skills

A MultiversX repository of pre-built "skills" (packaged capabilities) that an AI agent or assistant can load to perform common MultiversX tasks.

Context: The skills complement the MCP server's tools, giving agents higher-level, ready-made actions. Internal review counts 25 skills in the repository; its README states "19+", which understates the count. It is part of the agent tooling gathered under the Agent Hub.

See also: [MCP Server (MultiversX)](#mcp-server-multiversx), [mx-agent-kit](#mx-agent-kit), [Agent Hub](#agent-hub).
Read more: MultiversX `/ai` page ([multiversx.com/ai](https://multiversx.com/ai)); skill count corroborated by internal review (May 2026).

---

### Agent Explorer

A MultiversX explorer, hosted by the Foundation on a devnet backend, for browsing agents registered onchain along with their jobs and verification records.

Context: The explorer (at `agents.multiversx.com`) reads real onchain data from devnet: registered agents appear as onchain NFT entries with an owner address and transaction hash, and the backend tracks jobs, verifications, and per-protocol support counts. It is a working preview on devnet, not a mainnet product, and should be labeled as such. It surfaces the agents registered under the MX-8004 identity standard.

See also: [MX-8004](#mx-8004), [MX-8004 Sub-Contracts](#mx-8004-sub-contracts-identity-reputation-validation-escrow), [Agent Hub](#agent-hub), [MCP Server (MultiversX)](#mcp-server-multiversx).
Read more: MultiversX `/ai` page ([multiversx.com/ai](https://multiversx.com/ai)); Agent Explorer ([agents.multiversx.com](https://agents.multiversx.com)), a devnet preview verified by internal review (2026).

---

### Agent Arena

A MultiversX format for agent-versus-agent contests in which results are settled and ranked onchain rather than self-reported, on the premise that "the ledger is the scoreboard."

Context: The idea is that autonomous agents compete (for example, trading or game-style challenges) and their performance is verifiable onchain, which suits a network that markets verifiable throughput. A version ran on the public Battle of Nodes test network in 2026. The broader vision of funding frontier models to trade autonomously and ranking them by onchain profit and loss is a direction rather than a shipped mainnet product.

See also: [Agent Hub](#agent-hub), [MX-8004](#mx-8004), [Agent Explorer](#agent-explorer).
Source: MultiversX / @CodeMultiversX Battle of Nodes posts (Agent Arena on the test network, 2026). FLAG: confirm the current canonical definition and rollout status with the agent-stack owner before the public cut.

---

### MX-8004 Sub-Contracts (Identity, Reputation, Validation, Escrow)

The four smart contracts that make up the MX-8004 agent-identity standard: Identity (an agent's onchain identifier and metadata), Reputation (feedback and scoring), Validation (verification of an agent's work), and Escrow (holding funds for agent jobs).

Context: The first three mirror the three registries of Ethereum's ERC-8004 (Identity, Reputation, Validation); MX-8004 adds Escrow as a fourth, which is the main structural difference and is often omitted from third-party coverage. As with MX-8004 generally, the standard is not yet ratified or published at an official standards URL, and parts of the implementation live on a core engineer's personal GitHub rather than under the `multiversx` organization, so it should be described as emerging rather than as a finalized Foundation standard.

See also: [MX-8004](#mx-8004), [Agent Explorer](#agent-explorer), [Agent Hub](#agent-hub), [Herotag](#herotag).
Read more: MultiversX, "Universal Identity and Trust Layer for Agents" ([multiversx.com/blog/universal-identity-and-trust-layer-for-agents](https://multiversx.com/blog/universal-identity-and-trust-layer-for-agents)); ERC-8004 comparison and ratification status corroborated by internal review (May 2026).

---

## Economics

### Developer Revenue Share

The portion of a smart contract's transaction fees routed to the contract's owner, rather than captured by the protocol or paid only to validators.

Context: Today, the owner of a called smart contract can claim 30% of the fee of each call, through the `ClaimDeveloperRewards` operation. A proposed economic framework would raise the builder share substantially: 90% of base transaction fees to the called contract's author and 10% permanently burned, rebalancing by 5% per year toward a 50/50 builder/burn split over eight years, with multi-contract transactions splitting the share in proportion to the gas each contract used and priority (tip) fees going to validators. That framework is approved in principle but not yet implemented, so the 30% claimable share remains the live figure.

See also: [Economic Evolution](#economic-evolution), [Staking V5](#staking-v5-and-the-emission-split), [KPI-Gated Emissions](#kpi-gated-emissions), [EGLD](#egld).
Read more (live, 30%): [docs.multiversx.com/developers/built-in-functions](https://docs.multiversx.com/developers/built-in-functions/) (ClaimDeveloperRewards). Read more (proposed, 90%): "A competitive economic framework for MultiversX: toward revenue and reflexive value accrual," MultiversX Agora ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)).

---

### Governance Proposal Process

MultiversX's onchain, stake-weighted process for ratifying protocol upgrades and parameter changes, in which a proposal passes by a stake-weighted vote subject to a quorum.

Context: Voting power is proportional to staked EGLD, and proposals (protocol upgrades, economic-model changes) are ratified by an onchain vote. Sirius (late 2023/early 2024) was the first major upgrade passed this way; the governance contracts themselves were moved fully onchain in the Barnard upgrade (July 2025). Recent recorded outcomes include the Economic Evolution vote (94.55% in favor on 41.77% participation, October 2025) and the Supernova vote (99.64% in favor on 33.63% quorum, January 2026). The Foundation reports that all six governance proposals submitted across 2024 and 2025 passed.

See also: [Economic Evolution](#economic-evolution), [Supernova](#supernova), [Barnard](#barnard), [Sirius](#sirius).
Read more: [docs.multiversx.com/governance/overview](https://docs.multiversx.com/governance/overview/); MultiversX State of the Foundation Report 2025 ([files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf](https://files.multiversx.com/MultiversX-State-of-the-Foundation-Report-2025.pdf)).

---

### Tail Inflation

An emissions model with no fixed supply cap, in which issuance continues at a declining rate rather than stopping at a maximum supply.

Context: The Economic Evolution proposal moved EGLD from a fixed cap to tail inflation, starting near 8.76% per year and decaying toward a 2% to 5% floor, with part of issuance gated on ecosystem KPIs. The intent is to keep funding security and growth past the point where the original cap would have been reached.

See also: [Economic Evolution](#economic-evolution), [KPI-Gated Emissions](#kpi-gated-emissions), [EGLD](#egld), [Fee Burn](#fee-burn).
Read more: MultiversX, "The MultiversX Economic Evolution" ([multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion](https://multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion)); economic framework proposal on Agora ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)).

---

### Fee Burn

The permanent removal from supply of a portion of transaction fees.

Context: Under the Economic Evolution framework, 10% of base transaction fees are burned today, rising on a schedule toward 50% over eight years as the developer share falls. Burning offsets issuance and ties supply pressure to network usage.

See also: [Developer Revenue Share](#developer-revenue-share), [Economic Evolution](#economic-evolution), [Tail Inflation](#tail-inflation), [Gas and Fees](#gas-and-fees).
Read more: economic framework proposal on Agora ([agora.multiversx.com/t/...530](https://agora.multiversx.com/t/a-competitive-economic-framework-for-multiversx-toward-revenue-and-reflexive-value-accrual/530)); MultiversX, "The MultiversX Economic Evolution" ([multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion](https://multiversx.com/blog/the-multiversx-economic-evolution-a-blueprint-for-growth-and-strategic-expansion)).

---

### APR (Annual Percentage Rate)

The yearly rate of staking rewards, expressed as a percentage of the staked amount.

Context: A validator's or delegator's APR depends on total network stake, the node's topUp, and the staking provider's service fee. It is the headline yield figure for staking on MultiversX.

See also: [Staking](#staking), [Delegation](#delegation), [Service Fee](#service-fee), [Staking Auction and TopUp](#staking-auction-and-topup).
Read more: [docs.multiversx.com/economics/staking-providers-apr](https://docs.multiversx.com/economics/staking-providers-apr/).

---

### Service Fee

The percentage a staking provider takes from the rewards earned on its delegators' stake.

Context: The provider sets the service fee, and delegators receive rewards net of it. It is how staking providers are compensated for operating nodes.

See also: [Delegation](#delegation), [Staking](#staking), [APR](#apr-annual-percentage-rate).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Governance Proposal

An onchain proposal, identified by a code commit hash, that the community votes on to change the protocol or its parameters.

Context: Anyone can submit a proposal by paying the proposal fee (currently 500 EGLD) after at least 15 days of public debate on Agora, and setting a voting start epoch. If the proposal passes the fee is refunded; if it fails a portion is kept as a lost-proposal fee; if it is vetoed the fee is slashed. A proposal cannot be duplicated and can be cancelled by the issuer before voting starts.

See also: [Governance Proposal Process](#governance-proposal-process), [Quorum](#quorum), [Veto](#veto), [Voting Power](#voting-power).
Read more: [docs.multiversx.com/governance/overview](https://docs.multiversx.com/governance/overview/).

---

### Quorum

The minimum share of total voting power that must participate in a governance vote for the proposal to be valid, currently at least 20%.

Context: If participation falls below the quorum, the proposal fails regardless of how the votes split. Quorum is a configurable governance parameter that ensures a decision reflects broad participation.

See also: [Governance Proposal](#governance-proposal), [Voting Power](#voting-power), [Veto](#veto), [Governance Proposal Process](#governance-proposal-process).
Read more: [docs.multiversx.com/governance/overview](https://docs.multiversx.com/governance/overview/).

---

### Veto

A vote type in MultiversX governance that rejects a proposal, and its threshold: if veto votes exceed 33% of the participating voting power, the proposal is rejected and its fee is slashed.

Context: Voters choose among Yes, No, Abstain, and Veto. Veto is a minority-protection mechanism, letting a sufficiently large share block a proposal that could harm the network even if a majority is in favor. Acceptance also requires Yes over Yes-plus-No-plus-Veto to reach at least 66.67%.

See also: [Governance Proposal](#governance-proposal), [Quorum](#quorum), [Voting Power](#voting-power), [Governance Proposal Process](#governance-proposal-process).
Read more: [docs.multiversx.com/governance/overview](https://docs.multiversx.com/governance/overview/).

---

### Voting Power

A voter's weight in governance, equal to their staked plus delegated EGLD, applied linearly so that each EGLD counts as one unit.

Context: Voting power is derived from stake, not liquid balance, and the governance contract tracks both used and total available voting power per address. Delegation and liquid-staking contracts can forward their users' voting power.

See also: [Governance Proposal](#governance-proposal), [Quorum](#quorum), [Veto](#veto), [Staking](#staking).
Read more: [docs.multiversx.com/governance/overview](https://docs.multiversx.com/governance/overview/).

---

## Staking operations

Practical staking and delegation vocabulary, aligned with the MultiversX docs terminology page. These describe the day-to-day actions a staker or delegator takes.

### Validate

Running a validator node and contributing to the network by relaying and validating information.

Context: Validating requires staking at least 2500 EGLD per node and participating in consensus. It is the direct, node-operating form of securing the network, as opposed to delegating stake to someone else's nodes.

See also: [Validator (node)](#validator-node), [Staking](#staking), [Delegate](#delegate), [Secure Proof of Stake (SPoS)](#secure-proof-of-stake-spos).
Read more: [docs.multiversx.com/validators/overview](https://docs.multiversx.com/validators/overview/).

---

### Stake

Contributing to network security by delegating 1 EGLD or more toward a staking provider that operates validator nodes.

Context: As a day-to-day action for a token holder, staking here means placing EGLD with a provider rather than running a node. The funds accrue rewards, and withdrawing them requires unstaking and then waiting out the unbonding period.

See also: [Staking](#staking), [Delegate](#delegate), [Stake rewards](#stake-rewards), [Unstake](#unstake).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Delegate

Contributing to network security by delegating 10 EGLD or more toward the MultiversX Community Delegation contract.

Context: Delegating pools a holder's EGLD into a delegation contract that runs the nodes and takes a service fee from the rewards. It lets a holder earn staking rewards without meeting the 2500 EGLD per-node minimum or operating hardware.

See also: [Delegation](#delegation), [Stake](#stake), [Delegate rewards](#delegate-rewards), [Service Fee](#service-fee).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Stake rewards

The income generated by funds locked to run validator nodes, which can be claimed or restaked.

Context: Rewards accrue to staked EGLD from protocol emission and a share of fees. A staker can withdraw the rewards or compound them back into stake; the yield rate is expressed as an APR that depends on total network stake and top-up.

See also: [Stake](#stake), [APR (Annual Percentage Rate)](#apr-annual-percentage-rate), [Delegate rewards](#delegate-rewards), [Staking](#staking).
Read more: [docs.multiversx.com/economics/staking-providers-apr](https://docs.multiversx.com/economics/staking-providers-apr/).

---

### Delegate rewards

The income generated by funds placed in delegation contracts, which can be claimed or redelegated.

Context: A delegator receives rewards net of the provider's service fee and can either withdraw them or redelegate to compound. This is the delegation counterpart to stake rewards.

See also: [Delegate](#delegate), [Delegation](#delegation), [Service Fee](#service-fee), [Stake rewards](#stake-rewards).
Read more: [docs.multiversx.com/economics/staking-providers-apr](https://docs.multiversx.com/economics/staking-providers-apr/).

---

### Unstake

Signaling the intention to unlock staked or delegated funds, which become available after the 10 epoch unbonding period.

Context: Unstaking starts the exit but does not release funds immediately; the EGLD stays locked for the unbonding period before it can be withdrawn. The final withdrawal step is unbonding.

See also: [Unbond](#unbond), [Unbonding Period](#unbonding-period), [Stake](#stake), [Delegation](#delegation).
Read more: [docs.multiversx.com/validators/staking](https://docs.multiversx.com/validators/staking/).

---

### Staking provider

A node operator that created a staking pool and accepts funds for staking.

Context: A staking provider runs a delegation contract that pools delegators' EGLD, operates the validator nodes, and takes a service fee from the rewards. Holders choose a provider to delegate to based on its fee and reliability.

See also: [Staking pool](#staking-pool), [Delegation Contract](#delegation-contract), [Delegate](#delegate), [Service Fee](#service-fee).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Staking pool

A system smart contract that accepts funds for staking.

Context: The staking pool is the delegation contract that holds a provider's delegated EGLD and stakes it across the provider's nodes. Its size is bounded by a delegation cap.

See also: [Staking provider](#staking-provider), [Delegation Contract](#delegation-contract), [Delegation cap](#delegation-cap), [System Smart Contracts](#system-smart-contracts).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---

### Delegation cap

The maximum amount of funds a staking pool accepts.

Context: The delegation cap is set by the pool's owner and limits total delegated EGLD; a cap of zero means unlimited. The initial owner deposit and all delegated funds count toward it.

See also: [Staking pool](#staking-pool), [Delegation Contract](#delegation-contract), [Delegate](#delegate), [Staking provider](#staking-provider).
Read more: [docs.multiversx.com/validators/delegation-manager](https://docs.multiversx.com/validators/delegation-manager/).

---
