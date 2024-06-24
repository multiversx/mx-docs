---
id: chronology
title: Chronology
---

Following the common Proof-of-Stake principles, the MultiversX network organizes time into rounds and epochs, where a fixed number of consecutive rounds form an epoch. The first round of the first epoch ever is called the _genesis round_, which contains the bootstrapping phase of the network.

[comment]: # (mx-context-auto)

## **Rounds**

Each round has a fixed time duration, consistent across the network, currently decided to be 6 seconds. In [Architecture overview](/technology/architecture-overview) we mentioned that the MultiversX network is sharded. Because all shards process transactions in parallel and _in lock-step_, it means that in each round, inside a shard, at most one block may be added to the shard's blockchain. There may be rounds where no block is added to the blockchain, for example when consensus is not reached or when the designated consensus group leader is offline and cannot propose a block.

[comment]: # (mx-context-auto)

## **Epochs**

An epoch is a sequence of consecutive rounds during which the configuration of the network does not change. The number of rounds in an epoch is initially calculated to produce epochs of 24 hours in length.

The moment between epochs is used by the network to adapt its topology according to the processing load and its size, to compute rewards for the validator nodes and to perform other tasks to close the previous epoch and prepare for the new. Read more about how the network reconfigures its topology and how it prevents node collusion in [Adaptive State Sharding](/technology/adaptive-state-sharding).
