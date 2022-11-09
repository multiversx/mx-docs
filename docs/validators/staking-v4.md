---
id: staking-v4
title: Staking v4
---

# **Introduction**

Staking and delegation should be developed as time goes on. No system has to stay the same. Our assumptions of how the market works and reacts may change over time, the same way it may change with users and markets.
Right now we have around 400 validators (running one or multiple nodes). Some of them are staking providers, while others are individuals running validators directly. Although most of the nodes have a nice topup on the top of the base stake of 2.5k eGLD, others don't.

# **Problems with current implementation**

The problems with the current implementation:
- Limiting the number of nodes to 3200 and the additional queue list. New validators can join the network only if somebody leaves the system.
- Big providers are getting bigger, it does not help with decentralization. 31% of validators are controlled by Elrond Foundation. The top 11 staking agencies control 33%.
- Big providers are putting up nodes in the waiting list - as they have little to lose and when somebody gets out, they are the first to enter.


One of the first things we should eliminate is the additional queue and use the topUp value per node in order to decide which are the best nodes and select those at the end of the epoch to become active. Doing that, we do not limit the entry of new validators as currently an old validator must leave in order for a new one to enter. The market will decide the actual price of the node, but it is not a hard auction, better say, it is a soft auction, where everybody paying the node price (2.5k eGLD) can register to the network, but the NODE becomes a validator only if it has enough TOPUP. The shuffling from waiting list to eligible list will not be affected at all. We will only work on the selection of the nodes from the auction list to waiting.

This is what we call SOFT AUCTION. Doing this we democratize, making the whole validator system as a free market.

Right now at the end of the epoch we are shuffling 80 nodes from the eligible list to the end of the waiting list at every shard. We make nodes to shuffle out into a new shard waiting list, from where later on the nodes are shuffled into the shards. When the limit of 3200 nodes is eliminated we will do one more step here, at the end of epoch.
Select best nodes from auction list to “possible to be selected into waiting list” - best of auction. This is a global selection - not per shard. We preselect the best global nodes at the end of epoch systemSCs processing level (process block), node shuffler will shuffle these at commit block level.
Shuffle out nodes from eligible to auction list. (these shuffled out nodes will not participate in the auction in the current epoch, only in the next one).
Shuffle into the waiting list those nodes selected at step 1.





The activation of this flag will be in two steps:
At first epoch activation we put every node from the additional queue into the auction list. No other action at the end of the epoch.
We activate the selection algorithm on the next epoch. Eligible goes into shuffle out which subsequently goes into auction on the next epoch, best nodes from auction into waiting, a part of waiting into eligible.


The selection process of best X nodes from auction into “to be shuffled into waiting” list can be done in 2 ways. Currently the first, easy version is implemented - let’s call it strict selection.

Sort all the nodes from the auction list based on their topUp and select the first 320 ( nr_shards * nr_nodes_to_shuffle_out_per_shard).

This is strict, as the VALIDATORS have to manage their number of nodes if their topUp is close to the border of selection. This is because the topUp is computed as TotalStake/NumberOfNodes - 2.5k eGLD. So if a validator registered more nodes, their topUp is smaller.
Example: 10 nodes, 50k eGLD = 2.5k topUp per node
20 nodes, 50k eGLD = 0 topUp

In this way, if a staking provider registers all those 20 nodes, they will be at the end of the list in case of the auction selection. If there are 320 nodes with at least 1eGLD topUp on each of them, NONE of the 20 nodes from this staking provider is selected.

As this selection takes place at every end of epoch, those staking providers who are at the limit of the topUp per node according to the selection process can be easily moved out by delegating to other SPs or unDelegating from this SP. The SP would need to continuously monitor the limit and unStake / stake nodes at the end of the epoch, depending on the topUp per node of other providers. This selection is sorting nodes based on topUp, it is not protecting the SPs. There is a need for constant supervision and action from SPs.

Another way to do SOFT AUCTION is by computing the topUp according to how much the validor would be able to run. Like will select as many nodes as possible with computed topUp. Thus selecting as many nodes as possible per validator.
Example: selected topUp to qualify for selection = 2.5K
10 nodes, 50k eGLD = all nodes are qualified - 2.5k base price, 2.5k topup of each node
15 nodes, 50k eGLD = 5 nodes are qualified - 2.5k base price for 15 nodes = 37.5k eGLD the rest of 12.5k is enough for 5 nodes to qualify.
20 nodes, 50k eGLD = no node is qualified - as all nodes are taking up only the 2.5K base price. There is no topUp at all.
