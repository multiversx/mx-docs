---
id: adaptive-state-sharding
title: Adaptive State Sharding
---

Sharding was first used in databases and is a method for distributing data across multiple machines. This makes it a _scaling technique_, and can be used by blockchain networks to partition states and transaction processing, so that each node of the network would only need to process a fraction of all the transactions. Moreover, sharding allows for the parallel processing of transactions. As long as there is a sufficient number of nodes verifying each transaction, ensuring high reliability and security, then splitting a blockchain into shards will allow it to process far more transactions by means of parallelization, and thus greatly improving transaction throughput and efficiency. Moreover, sharding promises to increase the throughput of the network as it expands and the number of validator grows - a property called _horizontal scaling_.

## **Sharding types**

We emphasize the three main types of sharding: network sharding, transaction sharding and state sharding, described in the next paragraphs.

**Network sharding** handles the way the nodes are grouped into shards and can be used to optimize communication, as message propagation inside a shard can be done much faster than propagation to the entire network. This is the first challenge in every sharding approach and the mechanism that maps nodes to shards has to take into consideration the possible attacks from an attacker that gains control over a specific shard.

**Transaction sharding** handles the way the transactions are mapped to the shards where they will be processed. In an account-based system, the transactions could be assigned to shards based on the sender's address.

**State sharding** is the most challenging approach. In contrast to the previously described sharding mechanisms, where all nodes store the entire state, in the case of state-sharded blockchains each shard maintains only a portion of the state. If the accounts involved in a transaction reside in different shards, executing that transaction will require the state to be updated in both shards and will involve the exchange of messages between the nodes of the two shards. In order to increase resiliency to malicious attacks, the nodes in the shards have to be reshuffled from time to time. However, moving nodes between shards introduces synchronization overheads, that is, the time taken for the newly added nodes to download the latest state from their new shard. Thus, it is imperative that only a subset of all nodes should be redistributed during each epoch, to prevent down times during the synchronization process.

## **Sharding directions**

Some sharding proposals attempt to focus on transaction sharding or state sharding alone, which increases transaction's throughput, either by forcing every node to store lots of state data or each node to be a supercomputer.

Sharding introduces some new challenges, such as the single-shard takeover attack, potentially intensive cross-shard communication, overall data availability and also the need of an abstraction layer that hides the shards. However, given that the above problems are addressed correctly, state sharding brings considerable overall improvements: transaction throughput will increase significantly due to parallel transaction processing and transaction fees will be considerably reduced. These two criteria are widely considered to be the main obstacles against mainstream adoption of blockchain technology. Elrond has undertaken the task of transforming these obstacles into advantages and incentives towards massive mainstream adoption.

# **The Elrond sharding approach**

## **Goals**

Sharding in the Elrond network was designed from the ground up to address the complexity of combining **network sharding**, **transaction sharding** and **state sharding**. The result is a cohesive protocol design, which not only achieves full sharding, but attains the following goals as well:

1. **Scalability without affecting availability**, which requires that increasing or decreasing the number of shards should only affect a negligibly small vicinity of nodes without causing down-times, or minimizing them while updating states.
2. **Fast dispatching and instant traceability**, which requires that computing the destination shard of a transaction must be deterministic and also trivial to calculate, eliminating the need for communication rounds.
3. **Efficiency and adaptability**, which requires that the shards should be as balanced as possible at any given time.

A trivial step-by-step example of how it works is depicted in the animation below:

![img](/technology/sharding.gif)

Adaptive State Sharding workflow

## Node shuffling

To prevent collusion, the configuration of each shard needs to change regularly. The Elrond network does this by shuffling nodes between shards at the end of each epoch. While reshuffling all of the nodes in every epoch would provide the highest security level, it would have a non-negligible impact on the liveness of the system, due to additional latencies that appear when nodes are resynchronizing with their new shards. To avoid these latencies, a carefully controlled proportion of eligible validators belonging to a shard will be redistributed non-deterministically and uniformly to the other shards at the end of each epoch.

Shuffled nodes will be placed in the new shards in a _waiting list_, meaning that they must spend this epoch performing resynchronization with the new shard. Only after spending an entire epoch in the waiting list of the new shard is the node allowed to become an _eligible validator_ and join the shard in full.

The unpredictability of the shuffling process is important for the security of the network. For this reason, at the end of each epoch, it is the metachain which computes a list of nodes which must leave their shards and move to new ones. These nodes are selected using the randomness source calculated in the preceding metachain block, which means that the selection and redistribution cannot be known in advance. This computation is deterministic, therefore it requires no additional communication.

![img](/technology/node-shuffling.png)

Node reshuffling diagram

In the above diagram, _e_ represents the upcoming network, for which nodes must be shuffled, while _e - 1_ represents the epoch that is ending.

The node shuffling process must take multiple aspects into account:

- Nodes must be shuffled among shards while also maintaining the shards balanced;
- Nodes that have already spent an epoch synchronizing inside the waiting list of a shard must be promoted to _eligible validator_ status in the respective shard.
- There may be new nodes that have registered to the network and are waiting to join. They have been placed into a _network-wide waiting list_ and remain unassigned to shards until the end of the current epoch.
- There may be nodes that have signaled their intention to leave
- The network topology might need changes. If processing load has been uneven across shards, or if many nodes are joining or exiting the network, then the number of shards must change.

To produce a shard configuration for the new epoch, the metachain performs the following steps:

1. The number of nodes that must be shuffled out of each shard is calculated, then these nodes are _unassigned_ from their shards;
2. The new number of shards for the entire network is computed, based on the processing load in shards and number of nodes that will form the network in the upcoming epoch, and also taking into account nodes that are joining or leaving;
3. For each shard, the nodes that have previously spent an epoch synchronizing in the waiting list are promoted to _eligible validators_ in that shard;
4. The nodes in the network-wide waiting list (including those that have been unassigned from their shards at step 1) are redistributed randomly and uniformly to all shards and put into their waiting lists, where they'll spend the next epoch synchronizing with the new shard.

As described before, the reconfiguration of shards at the start of epochs and the [arbitrary selection of validators]() within rounds both discourage the creation of unfair coalitions and diminish the possibility of DDoS and bribery attacks, while maintaining decentralization and a high transactions throughput.
