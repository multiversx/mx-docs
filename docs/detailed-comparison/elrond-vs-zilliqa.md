---
id: elrond-vs-zilliqa
title: Elrond vs. Zilliqa
---

Elrond does horizontal scaling with State Sharding.

Zilliqa tries to solve scalability by addressing half of the problem, and that is by doing network and transaction sharding - so it improves somewhat the scalability and the network can process about 2500 TPS (2828 TPS with 3600 nodes). The network sharding is not optimum however as all the shards still need to synchronize the entire state of the system leading to communication overhead. It does not solve the hardest part of the problem which is state sharding.

Having no State Sharding basically means for Zilliqa that every node in the network has to store the entire state of the blockchain. In very high throughput blockchains the storage requirements grow very fast. A validator needs some special hardware to keep up with this kind of demand. Elrond solves the storage problems, by also sharding state, so that every node in the network has to store just a part of the entire state, the one corresponding for its shard.

Zilliqa still uses PoW in order to prevent Sybil attacks, while Elrond uses PoS, a much more energy efficient way to prevent Sybil attacks. Ziliqa PoW validator is required to have special hardware to run a node, and it only runs in Ubuntu OS. Elrond validator has low system requirements and runs on Windows, Linux and Mac as well.

Zilliqa stores all the Smart Contracts in a single shard, while Elrond will distribute Smart Contracts among all shards in order to be able to parallelize Smart Contract execution.
