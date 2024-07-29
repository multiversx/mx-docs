---
id: architecture-overview
title: Architecture Overview
---

MultiversX is a high-throughput public blockchain aimed at providing security, efficiency, scalability and interoperability, beyond the current state-of-the-art. The two most important features that set MultiversX apart are Adaptive State Sharding and the Secure Proof of Stake consensus mechanism.

MultiversX is a complete redesign of blockchain architecture with the aim to achieve global scalability and near instant transaction speed. MultiversX's architecture rests on the following key innovations:

1. [**Adaptive State Sharding**](consensus) on all levels: transaction, data and network. The dynamically adaptive sharding mechanism will perform shard merging and shard splitting while taking into consideration both the number of available validator nodes and also the network usage.
2. [**Secure Proof of Stake**](/learn/consensus) **Consensus**, completed in just two communication steps, using modified Boneh–Lynn–Shacham ("BLS") multi-signatures among the validators of the consensus group. Moreover, nodes inside the shard are randomly selected for the consensus group with no possibility of knowing the group's composition more than one round in advance.
3. **High resiliency** to malicious attacks due to periodical node reshuffling across shards. Every epoch, up to 1/3 of the nodes in every shard are reshuffled to other shards in order to prevent collusion.
4. **Secure randomness source** with BLS signing, which makes it non-biasable and unpredictable.
5. The [**MultiversX WASM VM**](/learn/space-vm), an exceptionally fast virtual machine for executing smart contracts written in _any programming language_ that can compile to WebAssembly.
6. **Smart contracts on a sharded state architecture**, with balanced load on shards. This is a requirement for a high-throughput blockchain platform. Balancing smart contracts across shards allows MultiversX to run multiple SCs in parallel, while the cross-shard calls are handled by an asynchronous [cross-shard execution process](/learn/transactions).
7. **Fast finality for cross-shard transactions** in mere seconds. Having a very high TPS is required for a high throughput blockchain solution, but TPS is only half the picture: fast finality for cross-shard transactions is of crucial importance. Most existing state-of-the-art blockchain architectures refuse to mention this aspect, but from a user standpoint it is extremely important. Fast cross-shard finality is naturally handled by MultiversX at the protocol level, using a dispatching algorithm and a routing protocol.
