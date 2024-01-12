---
id: staking-v4
title: Staking v4
---

# **Introduction**

Staking and delegation are processes that evolve over time. No system has to remain static. Our assumptions about how
the market works and reacts can change, just as user behavior and market dynamics may evolve. Currently, we have
approximately 400 validators, with some acting as staking providers and others as individual validator operators. While
most nodes have a comfortable top-up on the base stake of 2.5k eGLD, some do not contribute to the network's security by
adding more top-up.

# **Problems with the Current Implementation**

The issues with the current implementation include:

- Limiting the number of nodes to 3200, creating an additional queue. New validators can join the network only if
  someone leaves the system.
- Concentration of power among large providers, hindering decentralization. MultiversX Foundation together with the top
  11 staking agencies control 33%.
- Large providers strategically place nodes in the waiting list, taking advantage of their position when a slot becomes
  available.

One of our primary objectives is to eliminate the additional queue and leverage the top-up value per node to determine
the best nodes. This ensures that we do not restrict the entry of new validators, as the current system requires an old
validator to leave for a new one to enter. The market will determine the actual node price, operating as a soft auction
where anyone paying the node price (2.5k eGLD) can register, but the node becomes a validator only if it has sufficient
top-up. The shuffling from the waiting list to the eligible list remains unaffected, focusing solely on selecting nodes
from the auction list to the waiting list.

This approach, known as a _Soft Auction_, democratizes the validator system, transforming it into a free market.

The selection process for the best X nodes from the auction into the "to be shuffled into waiting" list can be executed
in two ways.

**The first** and easy version is a strict selection where all nodes from the auction list are sorted based on their
topUp, and only the first ones are selected.

This approach is strict, requiring validators to manage their number of nodes if their topUp is close to the selection
threshold. The topUp is computed as TotalStake/NumberOfNodes - 2.5k eGLD. If a validator registers more nodes, their
topUp per node decreases. For example:

- 10 nodes, 50k eGLD = 2.5k topUp per node
- 20 nodes, 50k eGLD = 0 topUp

In this scenario, if a staking provider registers all 20 nodes, they will be at the end of the list in case of an
auction selection. If only 320 nodes out of 340 can be selected, and every other node has at least 1 eGLD topUp on each
of them, none of the 20 nodes from this staking provider will be selected.

Since this selection occurs at the end of every epoch, staking providers near the topUp limit must continually monitor
and adjust their nodes, unstaking or staking nodes based on the topUp per node of other providers. Sorting nodes based
on topUp does not provide adequate protection for staking providers, requiring constant supervision and action.

**The second version**, currently implemented and explained in the following chapters, addresses the shortcomings of the
first version.

# **Current Implementation**

:::note
Please note that the numbers below are indicative and only used to better exemplify the model.
:::

In the current implementation (staking 3.5), we have:

1. A capped number of 3200 **nodes in the network**, including:
    - 1600 active/eligible validators globally, split into 400 nodes per shard
    - 1600 waiting validators globally, split into 400 nodes per shard
2. An uncapped `FIFO` queue where newly staked nodes are placed and await participation in the network.

:::important

Currently, a queued node can participate in the network only if an existing node is either unstaked or jailed.

:::

![Current Staking](/validators/stakingV4/current-staking.png)

Nodes are distributed in the following steps:

1. Randomly shuffle out 80 eligible validators for each shard, resulting in 320 (80 validators per 4 shards)
   shuffled-out validators.
2. Select these 320 shuffled-out validators to be randomly but evenly distributed at the end of each shard's waiting
   list.
3. For each shard, replace the previously shuffled-out validators with 80 waiting validators from the top of each
   shard's waiting list.

In the current implementation, each node, regardless of its top-up, has equal chances of participating in the consensus.
However, starting with staking phase 4, validators with higher staked top-up will have higher chances of participation.

# **Staking V4**

Staking phase 4 will unfold in three consecutive steps, each corresponding to a specific epoch.

## Staking v4. Phase 1.

In the first step, we will completely **remove the staking queue** and place all nodes in an **auction list**. This
process will occur automatically at the end of the epoch and requires no interaction from validators. Nodes'
distribution remains unchanged.

![Staking V4 Phase 1](/validators/stakingV4/stakingV4-phase1.png)

:::important Important notes

Starting with this epoch:

- Every **newly staked** node will be placed in the **auction list**.
- Every **unjailed** node will be placed in the **auction list**.
- The **number of new nodes** that can be staked is **uncapped**.
- Owners with **insufficient base staked EGLD** for their nodes will have them **removed** at the end of the epoch in
  the following order: `auction` -> `waiting` -> `eligible`.

:::

For example, if an owner has insufficient base stake for their nodes, the nodes will be removed from the network at the
end of the epoch based on the order: `auction` -> `waiting` -> `eligible`. This ensures that nodes contributing to the
ecosystem with a healthy top-up will not be adversely affected.

Below is an example of how nodes are unstaked based on insufficient base stake. Suppose an owner has four nodes:

- 1 eligible: `node1`
- 2 waiting: `node2`, `node3`
- 1 auction: `node4`

Assuming a minimum price of 2500 EGLD per staked node, the owner should have a minimum base stake of 10,000 EGLD (4 *
2500 EGLD). If, during the epoch, the owner unstakes 4000 EGLD, resulting in a base stake of 6000 EGLD, only two staked
nodes can be covered. At the end of the epoch, the nodes `node4` and `node3` will be unstaked in the specified order.

## Staking v4. Phase 2.

In the second step, all **shuffled-out** nodes from the **eligible list** will be sent to the **auction list**. Waiting
lists will not be filled by any shuffled-out nodes.

Using the example above, this will resize each waiting list per shard from 400 nodes to 320 nodes.

![Staking V4 Phase 2](/validators/stakingV4/stakingV4-phase2.png)

## Staking v4. Phase 3.

Starting with this epoch:

- Maximum number of nodes in the network will be changed from 3200 to 2880 (3200 - 320), consisting of:
    - a global number of 1600 active/eligible validators, split into 400 nodes/shard
    - a global number of 1320 waiting validators to join the active list, split into 320 nodes/shard
- All **shuffled out** nodes from the eligible list will be sent to the auction list to take part in the auction
  selection. The more topUp an owner has, the higher the chances of having their auction nodes selected will be.
- Based on the _soft auction selection_ (see the next section), all **qualified** nodes from the **auction** will be
  distributed to the waiting list (depending on the `available slots`). The other **unqualified** nodes will remain in
  the auction and wait to be selected in the next epoch if possible. The number of available slots is based on the
  number of shuffled-out nodes and other nodes leaving the network (e.g.: `unstake/jail`). It guarantees that the
  waiting list is filled, and the nodes' configuration is maintained.
- Distribution from the `waiting` to the `eligible` list will remain unchanged.

![](/validators/stakingV4/stakingV4-phase3.png)

## Staking v4. Soft Auction Selection Mechanism

Nodes from the auction list will be selected to be distributed in the waiting list based on the **soft auction**
mechanism. For each owner, based on their topUp, we compute how many validators they would be able to run by
distributing their total topUp per fewer nodes (considering we would not select all of their auction nodes, but only a
part of them). This mechanism ensures that for each owner, we select as many nodes as possible, based on the **minimum
required topUp** to fill the`available slots`. This is a global selection, not per shard. We preselect the best global
nodes at the end of the epoch.

Suppose we have the following auction list, and 3 available slots:

![](/validators/stakingV4/soft-auction1.png)

```
+--------+------------------+------------------+-------------------+--------------+-----------------+-------------------------+
| Owner  | Num staked nodes | Num active nodes | Num auction nodes | Total top up | Top up per node | Auction list nodes      |
+--------+------------------+------------------+-------------------+--------------+-----------------+-------------------------+
| owner1 | 3                | 2                | 1                 | 3666         | 1222            | pubKey1                 |
| owner2 | 3                | 1                | 2                 | 2555         | 851             | pubKey2, pubKey3        |
| owner3 | 2                | 1                | 1                 | 2444         | 1222            | pubKey4                 |
| owner4 | 4                | 1                | 3                 | 2666         | 666             | pubKey5, pubKe6, pubKe7 |
+--------+------------------+------------------+-------------------+--------------+-----------------+-------------------------+  
```

For the configuration above:

- Minimum possible `topUp per node` = 666, considering `owner4` will have all of his **3 auction nodes selected**
    - owner4's total top up/(1 active node + 3 auction nodes) = 2666 / 4 = 666
- Maximum possible `topUp per node` = 1333, considering `owner4` will only have **one of his auction nodes selected**
    - owner4's total top up/(1 active node + 1 auction node) = 2666 / 2 = 1333

Based on the above interval: `[666, 1333]`, we compute the `minimum required topUp per node` to be qualified from the
auction list. We gradually increase from min to max possible topUp per node with a step, such that we can fill
the `available slots`. At each step, we compute for each owner what's the maximum number of nodes that they could run by
distributing their total topUp per fewer auction nodes, leaving their other nodes as unqualified in the auction list.
This is a soft auction selection mechanism, since it is dynamic at each step and does not require owners to "manually
unstake" their nodes so that their topUp per node would be redistributed (and higher). This threshold ensures that we
maximize the number of owners that will be selected, as well as their number of auction nodes.

In this example, if we use a step of 10 EGLD in the `[666, 1333]` interval, the `minimum required topUp per node` would
be 1216, such that:

![](/validators/stakingV4/soft-auction2.png)

```
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
| Owner  | Num staked nodes | TopUp per node | Total top up | Num auction nodes | Num qualified auction nodes | Num active nodes | Qualified top up per node | Selected auction list nodes |
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
| owner1 | 3                | 1222           | 3666         | 1                 | 1                           | 2                | 1222                      | pubKey1                     |
| owner2 | 3                | 851            | 2555         | 2                 | 1                           | 1                | 1277                      | pubKey2                     |
| owner3 | 2                | 1222           | 2444         | 1                 | 1                           | 1                | 1222                      | pubKey4                     |
| owner4 | 4                | 666            | 2666         | 3                 | 1                           | 1                | 1333                      | pubKey5                     |
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
```

- `owner1` possesses one auction node, `pubKey1`, with a qualified topUp per node of 1222, surpassing the threshold of
    1216.
- `owner2` holds two auction nodes, `pubKey2` and `pubKey3`, with a topUp per node of 851. By leaving one
  node (`pubKey3`) in the auction while selecting only one (`pubKey2`), the topUp per node is rebalanced to 1277 (
  2555/2), exceeding the minimum threshold of 1216.
- `owner3` has one auction node, `pubKey4`, with a qualified topUp per node of 1222, surpassing the threshold of 1216.
- `owner4` possesses three auction nodes, `pubKey5`, `pubKey6`, and `pubKey7`, with a topUp per node of 666. By leaving
  two nodes (`pubKey6`, `pubKey7`) in the auction while selecting only one (`pubKey5`), the topUp per node is rebalanced
  to 1333 (2666/2), exceeding the minimum threshold of 1216.

If the threshold were increased by one more step from `1216` to `1226`, only two nodes, `pubKey2` and `pubKey5`, would
qualify, which is insufficient to fill all slots.

:::note

If an owner has multiple nodes in the auction, but only a portion is selected for distribution in the waiting list, the
selection will be based on sorting the BLS keys.

:::

:::note

The minimum required topUp per node, along with the real-time auction list, will be accessible in the explorer at all
times. This allows owners to determine the optimal strategy for maximizing the number of selected auction nodes.

:::

Finally, validators are sorted based on the qualified topUp per node, and the selection is made considering available
slots. In instances where two or more validators share the same topUp (e.g., `pubKey1` and `pubKey4`), the selection
process is random but deterministic. The selection involves an XOR operation between the validators' public keys and the
current block's randomness. This mechanism prevents validators from "minting" their BLS keys to gain an advantage in
selection, as the randomness is only revealed at the time of selection.

```
 +--------+----------------+--------------------------+
 | Owner  | Registered key | Qualified TopUp per node |
 +--------+----------------+--------------------------+
 | owner4 | pubKey5        | 1333                     |
 | owner2 | pubKey2        | 1277                     |
 | owner1 | pubKey1        | 1222                     |
 +--------+----------------+--------------------------+
 | owner3 | pubKey4        | 1222                     |
 +--------+----------------+--------------------------+
```

Following the example above, there are two nodes with a qualified top-up of 1222 per node:

- `owner1` with 1 BLS key = `pubKey1`
- `owner3` with 1 BLS key = `pubKey4`

Assuming the result of the XOR operation between their BLS keys and randomness is:

- `XOR1` = `pubKey1` XOR `randomness` = `[143...]`
- `XOR2` = `pubKey4` XOR `randomness` = `[131...]`

Since `XOR1` > `XOR2`, `pubKey1` will be selected, while `pubKey4` remains in the auction list.

# **FAQ**

## How much topUp should I have as a validator?

The required topUp for validators depends on various factors, including the number of nodes in the auction and the soft
auction selection mechanism. The soft auction selection dynamically computes the minimum required topUp per node to
qualify for distribution from the auction to the waiting list. To maximize the chances of having auction nodes selected,
validators are encouraged to maintain a competitive topUp. Real-time auction list information and the minimum required
topUp per node will be available in the explorer, allowing validators to strategize effectively.

## What happens if there are fewer nodes in the auction than available slots?

In this case, all nodes will be selected, regardless of their topUP.

## One of my nodes was sent to auction during stakingV4 phase2. Will I lose rewards?

If one of your nodes is shuffled out into the auction list during phase2, it will enter into competition with the other
existing nodes. If you have enough topUP, nothing changes, and no rewards will be lost. For owners contributing to the
ecosystem and maintaining a sufficient topUp, this change will not have any negative impact. However, if you have low
topUp or close to zero, your nodes might be unqualified and remain in the auction list.

## Why downsize the waiting list?

Short answer: _to keep the APR unchanged_.

Before stakingV4, if a node was shuffled out and moved to the waiting list, it was guaranteed to be "idle" (not
participating in consensus) for 5 epochs. During this time, the node would not gain any rewards.

During stakingV4 phase2, no node from the waiting list is moved to active. If we were to keep the same configuration, a
shuffled out node from this phase would have to wait 6 epochs until eligible (if selected from the auction) and
therefore decreasing the overall APR:

