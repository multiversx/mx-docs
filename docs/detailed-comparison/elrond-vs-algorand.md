---
id: elrond-vs-algorand
title: Elrond vs. Algorand
---

Elrond has Adaptive State Sharding, Algorand doesn’t have any kind of sharding.

Selection of leader/validators for consensus group is different:

In Elrond the selection is based on a randomness source that is easy to verify, but made available only at the beginning of the round to all members, it satisfies both required properties unpredictability and unbiasability. The validators selection is thus very fast (milliseconds) and, because this is available at the beginning of the round, the communication for consensus can be done only between the consensus group members, saving time on propagation and other interactions.

In Algorand, selection can take much longer (up to 12 seconds) moreover, due to how VRFs work, you might end up with multiple leaders or none at all, depending on the threshold set. To find out which validators you need to do the consensus with, the consensus messages has to be propagated to the whole network. Furthermore, because VRF might create more leaders, there is more interactivity involved both leading to slower consensus.

Both consensus algorithms are based on BFT, but there are differences: Algorand uses own Byzantine Agreement, while Elrond uses a modified pBFT. 

While in Algorand just the selection of validators can take up to 12 seconds, in Elrond selection plus consensus are done in  ~4 seconds in a shard. Scalability is higher in Elrond as our throughput can increase with the number of shards. In Algorand it can only decrease with usage, as it will first reach storage and communication limitations.

With Adaptive State Sharding Elrond can instead increase the network throughput as the usage increases (and the number of nodes increases), storage and communication limitations are mitigated with state and network sharding, and we also have storage pruning.