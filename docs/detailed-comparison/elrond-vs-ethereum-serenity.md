---
id: elrond-vs-ethereum-serenity
title: Elrond vs. Ethereum Serenity
---

(based on Ethereum 2.0’s available documentation)

## **Validators shuffling cost**

Regarding the way validators are assigned to shards, Elrond is doing random shuffling of validators, but in order to optimize communication and storage cost, only up to 1/3 validators are shuffled from every shard at the end of each epoch. Because the allocation of nodes to shards is also buffered, there is actually no liveness penalty. Serenity could achieve the same effect of continuous liveness with gradual reshuffling of older validators, if the number of slots per cycle/epoch (time until next reshuffle) is large enough. Serenity overlooks the communication cost in case of reshuffling. They have smaller epochs and for each epoch, if a validator / attesters is reshuffled to another shard, than their last, it needs to synchronize with that blockchain. This synchronization brings a communication overhead into the network. It will be hard for a validator which is assigned to a new shard to do correct work before it is synchronized.

Serenity defines the duration of one epoch as a fixed number of slots considered for proposer assignment, each lasting for 6 seconds. There is one proposer assigned per slot in each shard, and the configuration of these slots is known for the entire epoch in advance, so proposers are D Globally predictable, where D is the number of slots in the epoch. The same happens also for the attesters, although these are exposed, the predictability could be less than for the block proposers. Elrond employs random sampling of validators and block proposer every round from the shard nodes. This way the time the validators are exposed is limited to one round (5 seconds), so only 1 Globally Predictable, which increases the security of Elrond against bribing and DDoS compared to Ethereum.

## **Staking role in consensus group selection**

Elrond has a selection of validators for consensus groups based on their rating. The stake is fixed and the rating can give a node slightly higher chances of being selected in the consensus group, but never more than one seat at a time. This requirement could help with the creation of extra nodes to secure and scale the network. Another reason for this is again to optimize the communication and storage, as it is only possible to be a validator in one shard at a time per validator/machine. Serenity allows multiple seats for validators which may cause a selection of a validator as attester in multiple shards at the same time, with penalties on communication and storage (communication and storage requirements proportional with the number of seats).

Some parts of Serenity sharding model are similar with Elrond’s proposal. In Elrond there is one shard maintaining the notarization of block hashes from all shards, which looks similar to what the cross-links are doing. In Serenity right now there is no clear incentive to run a beacon node, also beacon nodes have much higher HW requirements so it might be possible that running a beacon node may not be very attractive for users. When there is a need for specialized hardware, that also makes the protocol more centralized. In Elrond however, any node that stakes can act as a validator/block proposer for the metachain or shards. This can improve security as it will always be possible to assign a sufficient number of nodes in the metachain to maintain security.

While in Serenity there are some trust assumptions and higher hw requirements for the beacon nodes, as they need to feed the data to their directly connected validator nodes, in Elrond any validator node can fill any role, of a metachain node or a shard node, validator or proposer. Elrond’s p2p network topology holds both intra-shard connections and inter-shard connections, allowing Elrond to run in a minimal trust setup.

The target clients for validators in Elrond are the consumer grade computers so compared to a beacon node, the entry barrier is much lower. There is also the intention of adding another role, that could be filled by smartphones, but this is still in research so it will be left out of this analysis.

## **Sharding model**

Elrond implements an adaptive solution including transaction, network and state sharding. Serenity has no adaptivity in this regard and runs with a fixed setting of 1024 shards, so it cannot react well for the case where nodes are leaving the network. Maintaining the security of a shard means that the minimum number of nodes inside the shard is kept. Not adapting the number of shards to the actual number of nodes can become problematic. The direction for Serenity to overcome this seems to be to enforce nodes that want to leave, to remain in the network for prolonged time, until new nodes can take their place.

With Elrond we have a clear model of how the network reacts to the cases of adding or removing shards, when the number of nodes in the network demand it. We are using shard splits for adding shards and shard merges for removing shards. The communication cost of splitting one shard is virtually zero, and the cost of the merge can be optimized as well (for more details how this is done check our [whitepaper](https://elrond.com/assets/files/Elrond_Whitepaper_EN.pdf)). The network reacts fast to the registration of new nodes, which can already be added to one of the available shards and can start processing after one epoch of synchronization.

Moreover, because in Elrond the communication cost of shard splits is zero, there is no reason to delay adding new shards, we can leverage the linear scalability sharding can provide, so shard splits can occur fast, whenever a new shard can be created. For example, if we need at least N nodes per shard, then whenever we have X*N(1 +(1/10)) we could already form X shards through splitting, and in case we go below X*N nodes do a shard merge.

## **Forking**

In Serenity forks are likely to happen in the shard chains, while in the beacon chain the blocks are finalized with a high probability (for finality there is still a dependency on the PoW blocks referenced by the beacon blocks). Forking in the shard chains could add more complexity for cross shard transactions, which are the majority in a sharded system.

In Serenity one of the main problems is the long time for the cross shard transaction finality.

This means that one cross shard transaction can actually get finalized after tens of minutes (it takes at least 6 minutes to get one cross shard transaction message across shards). Serenity employs optimistic execution of cross shard transactions, but this means that the state grows faster for the shards where there are a lot of transactions that touch accounts involved with cross shard operations that were not finalized yet. One other thing with optimistic execution is that it only improves the user experience, where one can see the cross shard transfer reflected faster in the wallet funds, but this is not really finalized until those tens of minutes have passed, so it can still be rolled-back.

Elrond uses a pBFT like consensus. The consensus is run between a randomly sampled consensus group, different in each round, smaller than the size of the shard. The shard size is chosen sufficiently large so that it provides both reasonably fast processing and a probabilistic unfeasible long time to critical failure (where ratio of malicious nodes in consensus group is >2/3) which is also the only forking condition in the system.

Our system is able to recover naturally from consensus stalls, and even though probability for critical failure is almost impossible without highly adaptive coordinated adversaries, there is also a mechanism in place where the system can recover, with a bit of overhead. For this Elrond is using fisherman challenge, where as long as there is one honest node inside a shard, the invalid blocks are detected and reported by these nodes so that the network can recover. Elrond intends to provide at least one observer node to act as a fisherman inside each shard but anyone interested can add their own fisherman nodes. These observer nodes do not participate in consensus but only synchronize the data, and can choose which shard they want to monitor, reporting whenever there is a malicious activity.
