---
id: elrond-vs-quarkchain
title: Elrond vs. Quarkchain
---

First difference between Elrond and Quarkchain is secure-proof-of-stake vs hybrid-proof-of-work. Quarkchain uses proof-of-work to manage its blockchain, however because of their assumption model, a malicious group could attack the network if they have 25% of the network hash power. Their rootchain uses complete PoW to validate the headers from each shard, while each shard uses root-first-PoW to validate and build their own blockchain.

Elrond is built upon secure-proof-of-stake, where each shard works independently and the metachain only notarizes. 99% of the cases forks are resolved at shard level, the corner cases are resolved with the notarized values from metachain. Furthermore, the security model of Elrond is stronger than most of the proposed blockchain solutions, the amount of stake needed to corrupt a shard or finalize a bad transaction would need to be more than ⅔ of the whole network. Even in those cases, with the proposed “fisherman challenge” the block would be invalidated, the malicious group slashed and the nodes reshuffled.

Quarkchain proposes blocks at every 8 seconds in every shard and at 150s at the root shard. This means that the finality of a cross-shard transactions is more than a few minutes. Elrond proposes 4seconds per block at shards and at metachain as well. Finality of cross shard transaction is under 20 seconds.

Furthermore, Quarkchain’s proposed sharding and smart contract handling model invalidates their state sharding claim. In case an account wants to use a smart contract in another shard, he needs to create an account in that shard and to send balance to that account as well. Their assumption that only a set of accounts would want to communicate with multiple dApps is wrong. In general an account will use a huge number of dApps. In this case Quarkchain effectively creates multiple accounts for the same person in multiple shards.

This is state duplication, not state sharding and is not horizontally scalable. In Elrond however, each account is managed in a single shard, communication with Smart Contracts in different shards are done through cross-shard transactions. Cross-shard transaction processing is fast in Elrond, and the execution of a smart contract is done in the shard it resides in. The SC dependency are ensured to be located in the same shard, so the execution is fast.
