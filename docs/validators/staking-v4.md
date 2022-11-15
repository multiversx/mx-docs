---
id: staking-v4
title: Staking v4
---

# **Introduction**

Staking and delegation should be developed as time goes on. No system has to stay the same. Our assumptions of how the
market works and reacts may change over time, the same way it may change with users and markets.
Right now we have around 400 validators (running one or multiple nodes). Some of them are staking providers, while
others are individuals running validators directly. Although most of the nodes have a nice topUp on the top of the base
stake of 2.5k eGLD, others don't contribute to the network's security by adding more topUp.

# **Problems with current implementation**

The problems with the current implementation:

- Limiting the number of nodes to 3200 and the additional queue list. New validators can join the network only if
  somebody leaves the system.
- Big providers are getting bigger, it does not help with decentralization. 31% of validators are controlled by Elrond
  Foundation. The top 11 staking agencies control 33%.
- Big providers are putting up nodes in the waiting list - as they have little to lose and when somebody gets out, they
  are the first to enter.

One of the first things we should eliminate is the additional queue and use the topUp value per node in order to decide
which are the best nodes and select those at the end of the epoch to become active. Doing that, we do not limit the
entry of new validators as currently an old validator must leave in order for a new one to enter. The market will decide
the actual price of the node, but it is not a hard auction, better say, it is a soft auction, where everybody paying the
node price (2.5k eGLD) can register to the network, but the NODE becomes a validator only if it has enough TOPUP. The
shuffling from waiting list to eligible list will not be affected at all. We will only work on the selection of the
nodes from the auction list to waiting.

This is what we call _SOFT AUCTION_. Doing this we democratize, making the whole validator system as a free market.

The selection process of best X nodes from auction into “to be shuffled into waiting” list can be done in 2 ways.

**The first** and easy version it's a strict selection where we would sort all the nodes from the auction list based on
their topUp and select the first ones.

This is strict, as the VALIDATORS have to manage their number of nodes if their topUp is close to the border of
selection. This is because the topUp is computed as TotalStake/NumberOfNodes - 2,5k eGLD. So if a validator registers
more nodes, their topUp is smaller.
Example:

- 10 nodes, 50k eGLD = 2.5k topUp per node
- 20 nodes, 50k eGLD = 0 topUp

In this way, if a staking provider registers all those 20 nodes, they will be at the end of the list in case of an
auction selection. If we can only select 320 nodes out of 340, and every other node has at least 1eGLD topUp on each of
them, NONE of the 20 nodes from this staking provider is selected.

As this selection takes place at every end of epoch, those staking providers who are at the limit with their topUp per
node would need to continuously monitor the limit and unStake / stake nodes at the end of the epoch, depending on the
topUp per node of other providers. This selection of sorting nodes based on topUp is not protecting the SPs. There
is a need for constant supervision and action from SPs.

**Second version** is currently implemented and explained in the chapters below.

# **Current implementation**

:::note
Please note that the numbers below are indicative and only used to better exemplify the model.
:::

In the current implementation (staking 3.5), we have:

1. A capped number of 3200 **nodes in the network** out of which:
    - a global number of 1600 active/eligible validators, split in 400 nodes/shard
    - a global number of 1600 waiting validators to join the active list, split in 400 nodes/shard
2. An uncapped `FIFO` queue, in which **newly** staked nodes are placed and **waiting to take part in the network**.

:::important

Right now, the only way a queued node can take part in the network is if one of the existing nodes from the network is
either **unstaked** or **jailed**

:::

![alt text](/validators/stakingV4/current-staking.png)

Nodes distribution is done in the following steps:

1. For each shard, randomly shuffle out 80 eligible validators, resulting in 320(80 validators/4 shards) shuffled out
   validators
2. Select those 320 shuffled out validators to be randomly, but evenly, distributed at the **end of each shard's waiting
   list**
3. For each shard, replace the previously shuffled out with 80 waiting validators from the **top of each shard's waiting
   list**

In the current implementation, one can observe that regardless of the validator's topUp, each node has equal chances of
taking part in the consensus. Starting with staking phase 4, validators with higher staked topUP will have higher
chances to take part in the consensus.

# **Staking V4**

Staking phase 4 will be done in 3 consecutive steps, each step corresponding to a certain epoch.

## Staking v4. Phase 1.

In the first step, we will completely **remove the staking queue** and place all nodes in an **auction list**. This
process will be done automatically at the end of the epoch and requires no interaction from validators. Also, nodes
distribution remains unchanged.

![alt text](/validators/stakingV4/stakingV4-phase1.png)

:::important Important notes

Starting with this epoch:

- Every **new staked** node will be placed in **auction list**.
- Every **unjailed** node will be placed in **auction list**.
- The **number of new nodes** that can be staked is **uncapped**.
- Owners with **insufficient base staked EGLD** for their nodes will have them **removed** at the end of the epoch w.r.t
  the following order: `auction` -> `waiting` -> `eligible`.

:::

Below, you can find an example of how unstaking nodes of owners with insufficient base stake is done. Suppose we have
an `owner` of 4 nodes as following:

- 1 eligible: `node1`
- 2 waiting: `node2`, `node3`
- 1 auction: `node4`

Considering a minimum price of 2500 EGLD per staked node, `owner` should have a minimum base stake of 10.000 EGLD (4 *
2500 EGLD). Suppose that during the epoch he unstakes 4000 EGLD. This would result in a base stake of 6000 EGLD,
which is only enough to cover 2 staked nodes. Automatically, at the end of the epoch, w.r.t to the previous
order, `owner` will have `node4` and `node3` unstaked.

## Staking v4. Phase 2.

In the second step, all **shuffled out** nodes from **eligible list** will be sent to the **auction** list. Also,
waiting lists **will not be filled** by any shuffled out node.

Using the example above, this will result in each waiting list per shard to be resized from 400 nodes to 320 nodes.

![alt text](/validators/stakingV4/stakingV4-phase2.png)

## Staking v4. Phase 3.

Starting with this epoch:

- Maximum number of nodes in the network will be changed from 3200 to 2880 (3200 - 320), consisting of:
    - a global number of 1600 active/eligible validators, split in 400 nodes/shard
    - a global number of 1320 waiting validators to join the active list, split in 320 nodes/shard
- All **shuffled out** nodes from eligible list will be sent to auction list in order to take part in the auction
  selection. The more topUp an owner has, the higher the chances of having his auction nodes selected will be.
- Based on the _soft auction selection_ (see next section), all **qualified** nodes from **auction** will be distributed
  to waiting list (depending on the `available slots`). The other **unqualified** nodes will remain in auction and wait
  to be selected in the next epoch, if possible. The number of available slots is based on the number of shuffled out
  nodes and other nodes leaving the network (e.g.: `unstake/jail`). It guarantees that the waiting list is filled and
  the nodes configuration is maintained.
- Distribution from `waiting` to `eligible` list will remain unchanged

![alt text](/validators/stakingV4/stakingV4-phase3.png)

## Staking v4. Soft auction selection mechanism

Nodes from the auction list will be selected to be distributed in the waiting list based on the **soft auction**
mechanism.
For each owner, based on his topUp, we compute how many validators he would be able to run by distributing his total
topUp per fewer nodes(considering we would not select all of his auction nodes, but only a part of them). This mechanism
ensures that for each owner we select as many nodes as possible, based on the **minimum required topUp** to fill the
`available slots`. This is a global selection, not per shard. We preselect the best global nodes at the end of epoch.

Suppose we have the following auction list, and 3 available slots:

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
    - owner4's total top up/(1 active node + 1 auction nodes) = 2666 / 2 = 1333

Based on the above interval: `[666, 1333]`, we compute the `minimum required topUp per node` to be qualified from the
auction list. We gradually increase from min to max possible topUp per node with a step, such that we can fill
the `available slots`. At each step, we compute for each owner what's the maximum number of nodes that he could run by
distributing his total topUp per fewer auction nodes, leaving his other nodes as unqualified in the auction list.
This is a soft auction selection mechanism, since it is dynamic at each step and does not require owners to "manually
unstake" their nodes so that their topUp per node would be redistributed(and higher). This threshold ensures that we
maximize the number of owners that will be selected, as well as their number of auction nodes.

In this example, if we use a step of 10 EGLD in the `[666, 1333]` interval, the `minimum required topUp per node` would
be 1216 such that:

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

- `owner1` has 1 auction node: `pubKey1` with qualified topUp per node = 1222 > 1216
- `owner2` has 2 auction nodes: `pubKey2`, `pubKey3` with a topUp per node = 851. By leaving one of his nodes in
  auction(`pubKey3`), while only selecting one of them(`pubKey2`), his topUp per node would be rebalanced to
  1277 (2555/2) > 1216
- `owner3` has 1 auction node: `pubKey4` with qualified topUp per node = 1222 > 1216
- `owner4` has 3 auction nodes: `pubKey5`, `pubKey6`, `pubKey7` with a topUp per node = 666. By leaving two of his
  nodes in auction(`pubKey6`, `pubKey7`), while only selecting one of them(`pubKey5`), his topUp per node would be
  rebalanced to 1333 (2666/2) > 1216

If we had increased the threshold above by one more step from `1216` to `1226`, we would only have two qualified
nodes: `pubKey2` and `pubKey5`, which is not enough to fill all slots.

:::note

If an owner has multiple nodes in auction, but only a part of them are selected to be distributed in waiting list,
selection will be done by sorting the bls keys.

:::

:::note

Minimum required topUp per node, as well as real time auction list will be available in explorer at all times so that
owners can decide what's the best strategy to maximize the number of auction nodes that will be selected.

:::

Finally, we sort all validators based on qualified topUp per node and select them based on available slots. In case two
or more validators have the same topUp(e.g.: `pubKey1` and `pubKey4`), the selection will be random, but deterministic.
Selection is done by a XOR between validators public keys and the current block's randomness. This ensures that
validators wouldn't be able to "mint" their bls keys in order to gain any selection advantage, since the randomness is
only known at the selection time.

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

Following our example above, we have two nodes with 1222 qualified top up per node:

- `owner1` with 1 bls key = `pubKey1`
- `owner3` with 1 bls key = `pubKey4`

Suppose the result of the XOR operation between they bls keys and randomness is:

- `XOR1` = `pubKey1` XOR `randomness` = `[143...]`
- `XOR2` = `pubKey4` XOR `randomness` = `[131...]`

Since `XOR1` > `XOR2`, `pubKey1` will to be selected, while `pubKey4` remains in the auction list.

# **FAQ**

## Will the APR decrease?

## How much topUp should I have as a validator?

EACH VALDIATOR SHOULD MONITOR HIS TOPUP AND DECIDE IF HE WANTS TO UNSTAKE HIS NODE OR ADD MORE TOPUP

## Some of my nodes were sent to auction during stakingV4 phase2. Will I lose my rewards?

## What happens if there are fewer nodes in auction than available slots?

In this case all nodes will be selected, regardless of their topUP.

## One of my nodes was sent to auction during stakingV4 phase2. Will I loose rewards?

If one of your nodes is shuffled out into auction list during phase2 it will enter in competition with the other
existing nodes. In case you have enough topUP, **nothing changes, no rewards will be lost**. For owners that
contribute to the ecosystem and keep a nice topUp, this change will not have any negative impact. Of course, in case you
have low topUp, or close to zero, your nodes might be unqualified and remain in auction list.

## Why downsize the waiting list?

Short answer: _to keep the APR unchanged_.

Before stakingV4, in case a node was shuffled out and moved to waiting list, it was guaranteed that it would only be
"idle"(not participating in consensus) for 5 epochs. During this time, the node would not gain any rewards.

During stakingV4 phase2, no node from waiting is moved to active. If we were to keep the same configuration, a shuffled
out node from this phase would have to wait 6 epochs until eligible(if selected from auction) and therefore decreasing
overall APR:

- wait **1 epoch** in stakingV4 phase in auction list
- **if** selected from auction, wait **another 5 epochs** in waiting list.