---
id: staking-v4
title: Staking v4
---

# **Introduction**

Staking and delegation should be developed as time goes on. No system has to stay the same. Our assumptions of how the
market works and reacts may change over time, the same way it may change with users and markets.
Right now we have around 400 validators (running one or multiple nodes). Some of them are staking providers, while
others are individuals running validators directly. Although most of the nodes have a nice topup on the top of the base
stake of 2.5k eGLD, others don't.

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

This is what we call SOFT AUCTION. Doing this we democratize, making the whole validator system as a free market.

Right now at the end of the epoch we are shuffling 80 nodes from the eligible list to the end of the waiting list at
every shard. We make nodes to shuffle out into a new shard waiting list, from where later on the nodes are shuffled into
the shards. When the limit of 3200 nodes is eliminated we will do one more step here, at the end of epoch.
Select best nodes from auction list to “possible to be selected into waiting list” - best of auction. This is a global
selection - not per shard. We preselect the best global nodes at the end of epoch systemSCs processing level (process
block), node shuffler will shuffle these at commit block level.
Shuffle out nodes from eligible to auction list. (these shuffled out nodes will not participate in the auction in the
current epoch, only in the next one).
Shuffle into the waiting list those nodes selected at step 1.

The activation of this flag will be in two steps:
At first epoch activation we put every node from the additional queue into the auction list. No other action at the end
of the epoch.
We activate the selection algorithm on the next epoch. Eligible goes into shuffle out which subsequently goes into
auction on the next epoch, best nodes from auction into waiting, a part of waiting into eligible.

The selection process of best X nodes from auction into “to be shuffled into waiting” list can be done in 2 ways.
Currently the first, easy version is implemented - let’s call it strict selection.

Sort all the nodes from the auction list based on their topUp and select the first 320 ( nr_shards *
nr_nodes_to_shuffle_out_per_shard).

This is strict, as the VALIDATORS have to manage their number of nodes if their topUp is close to the border of
selection. This is because the topUp is computed as TotalStake/NumberOfNodes - 2.5k eGLD. So if a validator registered
more nodes, their topUp is smaller.
Example: 10 nodes, 50k eGLD = 2.5k topUp per node
20 nodes, 50k eGLD = 0 topUp

In this way, if a staking provider registers all those 20 nodes, they will be at the end of the list in case of the
auction selection. If there are 320 nodes with at least 1eGLD topUp on each of them, NONE of the 20 nodes from this
staking provider is selected.

As this selection takes place at every end of epoch, those staking providers who are at the limit of the topUp per node
according to the selection process can be easily moved out by delegating to other SPs or unDelegating from this SP. The
SP would need to continuously monitor the limit and unStake / stake nodes at the end of the epoch, depending on the
topUp per node of other providers. This selection is sorting nodes based on topUp, it is not protecting the SPs. There
is a need for constant supervision and action from SPs.

# **Current implementation**

:::note
Please note that the numbers below are indicative and only used to better exemplify the model.
:::

In the current implementation (staking 3.5), we have:

1. A capped number of 3200 nodes in the network out of which:
    - 1600 active/eligible validators
    - 1600 waiting to be distributed in the active list
2. An uncapped queue list, in which **new** staked nodes are placed.

Right now, the only way a queued node can take part in the network is if one of the existing nodes is either
**unstaked** or **jailed**

![alt text](/validators/stakingV4/current-staking.png)

# **Staking V4**

Staking phase 4 will be done in 3 consecutive steps, each step corresponding to a certain epoch.

## Staking v4. Phase 1.

In the first step, we will completely **remove** the staking queue and place all nodes in an **auction list**. This
process will be done automatically at the end of the epoch and requires no interaction from validators.

![alt text](/validators/stakingV4/stakingV4-phase1.png)

Important notes:
Starting with this epoch:

- Every **new staked** node will be placed in **auction list**.
- Every **unjailed** node will be placed in **auction list**
- Owners with insufficient staked EGLD for their nodes will have their nodes removed w.r.t the following
  order: `auction` -> `waiting` -> `eligible`.

Example: `owner1` has 4 nodes:

- 1 eligible (`node1`)
- 2 waiting (`node2`, `node3`)
- 1 auction (`node4`)

Considering a minimum price of 2500 EGLD per staked node, `owner1` should have 10.000 EGLD (4 * 2500 EGLD). Suppose he
unstakes 4000 EGLD. This would result in a base stake of 6000 EGLD, which is only enough for 2 staked nodes.
Automatically, at the end of the epoch, w.r.t to the previous order, `owner1` will have his `node4` and `node3`
unstaked.

## Staking v4. Phase 2.

In the second step, all **shuffled out** nodes from **eligible list** will be sent to the **auction** list.
Using the example above, this will result in waiting lists per shard to be resized from 400 nodes -> 320 nodes.

![alt text](/validators/stakingV4/stakingV4-phase2.png)

## Staking v4. Phase 3.

Starting with this epoch:

- All shuffled out nodes from eligible will be sent to auction
- All **qualified** nodes from auction will be distributed to waiting list, based on the available slots
- All **unqualified** nodes from auction will remain in auction
- Distribution from `waiting` -> `eligible` list will remain unchanged
- no rewards lost !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! because of day with 320

![alt text](/validators/stakingV4/stakingV4-phase3.png)

## Staking v4. Soft auction selection mechanism

Nodes from the auction list will be selected to be distributed in the waiting list based on the **soft auction**
mechanism.
For each owner, based on his topUp, we compute how many validators he would be able to run. This mechanism ensures that
for each owner we select as many nodes as possible, based on the available slots and a **minimum required topUp**.

Suppose we have the following auction list, and 3 available slots:

```
+--------+------------------+------------------+-------------------+--------------+-----------------+---------------------------+
| Owner  | Num staked nodes | Num active nodes | Num auction nodes | Total top up | Top up per node | Auction list nodes        |
+--------+------------------+------------------+-------------------+--------------+-----------------+---------------------------+
| owner3 | 2                | 1                | 1                 | 2444         | 1222            | pubKey7                   |
| owner4 | 4                | 1                | 3                 | 2666         | 666             | pubKey9, pubKe10, pubKe11 |
| owner1 | 3                | 2                | 1                 | 3666         | 1222            | pubKey2                   |
| owner2 | 3                | 1                | 2                 | 2555         | 851             | pubKey4, pubKey5          |
+--------+------------------+------------------+-------------------+--------------+-----------------+---------------------------+  
```

For the configuration above:

- Minimum possible topUp = 666, considering owner4 will have all of his 3 auction nodes selected
    - owner4's total top up/(1 active node + 3 auction nodes) = 2666 / 4 = 666
- Maximum possible topUp = 1333, considering owner4 will only have one of his auction nodes selected
    - owner4's total top up/(1 active node + 1 auction nodes) = 2666 / 2 = 1333

Based on this configuration, we compute the minimum required topUp to be qualified = 1216. This ensures that we
maximize the number of owners that will be selected, as well as their number of auction nodes:

- `owner1` has 1 auction node (`pubKey2`) with qualified topUp = 1222 > 1216
- `owner2` has 2 auction nodes (`pubKey4`, `pubKey5`) with a topUp of 851. By leaving one of his nodes in the auction,
  while only selecting one of them, his topUp would be rebalanced to 1277 (2555/2) > 1216
- `owner3` has 1 auction node (`pubKey7`) with qualified topUp = 1222 > 1216
- `owner4` has 3 auction nodes (`pubKey9`, `pubKey10`, `pubKey10`) with a topUp of 666. By leaving two of his nodes in
  the auction, while only selecting one of them, his topUp would be rebalanced to 1333 (2666/2) > 1216

```
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
| Owner  | Num staked nodes | TopUp per node | Total top up | Num auction nodes | Num qualified auction nodes | Num active nodes | Qualified top up per node | Selected auction list nodes |
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
| owner1 | 3                | 1222           | 3666         | 1                 | 1                           | 2                | 1222                      | pubKey2                     |
| owner2 | 3                | 851            | 2555         | 2                 | 1                           | 1                | 1277                      | pubKey5                     |
| owner3 | 2                | 1222           | 2444         | 1                 | 1                           | 1                | 1222                      | pubKey7                     |
| owner4 | 4                | 666            | 2666         | 3                 | 1                           | 1                | 1333                      | pubKey9                     |
+--------+------------------+----------------+--------------+-------------------+-----------------------------+------------------+---------------------------+-----------------------------+
```

:::note

If an owner has multiple nodes in auction, but only a part of them are selected to be distributed in waiting list,
selection will be done by sorting the bls keys.

:::

Final nodes selected from auction list:

```
 +--------+----------------+--------------------------+
 | Owner  | Registered key | Qualified TopUp per node |
 +--------+----------------+--------------------------+
 | owner4 | pubKey9        | 1333                     |
 | owner2 | pubKey5        | 1277                     |
 | owner1 | pubKey2        | 1222                     |
 +--------+----------------+--------------------------+
 | owner3 | pubKey7        | 1222                     |
 +--------+----------------+--------------------------+
```

Finally, we sort all validators based on topUp and select them based on available slots. In case two or more validators
have the same topUp(e.g.: `pubKey2` and `pubKey7`), the selection will be random, but deterministic. Selection is done
by a XOR between validators public keys and the current block's randomness. This ensures that validators wouldn't be
able to "mint" their bls keys in order to gain any selection advantage, since the randomness is only known at the
selection time.

Following our example above, we have two nodes with 1222 top up per node:

- `owner1` with 1 bls key = `pubKey2`
- `owner3` with 1 bls key = `pubKey7`

Suppose the result of the XOR operation between they bls keys and randomness is:

- `XOR1` = `pubKey2` XOR `randomness` = `[143...]`
- `XOR2` = `pubKey7` XOR `randomness` = `[131...]`

Having `XOR1` > `XOR2`, therefore `pubKey2` will to be selected.

-- EACH VALDIATOR SHOULD MONITOR HIS TOPUP AND DECIDE IF HE WANTS TO UNSTAKE HIS NODE OR ADD MORE TOPUP

- EDGE CASE: mai multe locuri decat noduri in auction
- infinite number of staked new nodes