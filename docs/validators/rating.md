---
id: rating
title: Rating
---

[comment]: # (mx-abstract)

This page exposes the rating system used for MultiversX validators.

[comment]: # (mx-context-auto)

## **Introduction**

Each individual validator has a **rating score**, which expresses its overall reliability, performance and responsiveness. It is an important value, and node operators should be always mindful of the rating of their validators.

Rating influences the probability of a validator to be selected for consensus in each round. A performant validator will be preferred in consensus, as opposed to a validator which sometimes fails to contribute or which is not always online.

:::tip
Observer nodes do not have a rating score. Only validator nodes do.
:::

When validators join the network immediately after staking, they start with an initial score of `50` points.

Validators gain or lose rating points in a round depending on their role in that round (consensus proposer vs. consensus validator) and on their behavior within that role. Rating penalties are currently set to be `4` times as large as the corresponding gains. This means that a validator has to perform an action correctly 4 times in order to compensate for performing it once incorrectly. Moreover, consecutive losses are _compounding_, which means that the rating penalty increases with each transgression. See [Rating shard validators](/validators/rating#rating-shard-validators) and [Rating metashard validators](/validators/rating#rating-metashard-validators) for details on the calculations.

:::tip
Rating gains and losses on the metashard are different from the gains and losses on the normal shards.
:::

The past and current rating of an individual validator can be found in the MultiversX Network Explorer at https://explorer.multiversx.com/nodes. Use the "Search" box to find a validator and click on its entry in the list. The "Node Details" page opens, which contains status information about the validator.

The "Node Details" page displays a plot of the validator rating during the past epochs:

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-MA1wJCHfE7ffob9gOjE%2F-MA1we9u12mvMRF1PU9y%2Fplot-rating.png?alt=media&token=6a1f0071-66d0-4aec-8192-2a8f716e67bb)

The X-axis represent the epochs, and the Y-axis represents the rating.

[comment]: # (mx-context-auto)

## **The jail**

For the overall health of the network, if the rating of a validator drops below `10` points, it will be **jailed**. Being jailed means that the validator will be taken out of the shards, it will not participate in consensus, and thus it will not earn any rewards.

There is an exception to jailing, though. If the network finds itself in a situation where jailing a validator would reduce the size of a shard below an allowed limit, the validator will not be jailed.

:::important
Jailing only occurs at the end of an epoch. This means that a validator with low rating still has until the end of the epoch to recover. If the validator fails to recover, and its rating remains below `10` at the end of the epoch, then it will start the new epoch in jail.
:::

To reinstate a jailed validator, its operator must submit an **unjail** transaction to the Staking SmartContract. This causes the validator to be taken out of the "jail" and added to the network as if it were a new validator.

A reinstated validator will be passive during the epoch of its unjailing. In the immediately following epoch, the validator will be assigned to a shard, where it must wait the entire epoch and spend it to synchronize with its new shard.

:::note rating reset
Rating is **not** reset to 50 due to shard shuffling. The rating of a validator is retained when changing shards due to shuffling.
:::

:::tip
The only way to increase the rating of a validator is to keep it up-to-date, keep it well-connected and make sure it is running on hardware that conforms to the [System requirements](/validators/system-requirements).
:::

:::note multiple validators on the same machine
Running **multiple validators on a single machine** will impact your rating and consequently _your rewards,_ if the machine doesn't have the as many times the minimum requirements as there are validators running on it.
:::

[comment]: # (mx-context-auto)

## **Consensus probabilities**

Rating affects the probability of a validator to be selected in the consensus group of a round. This is done by applying **rating modifiers** on the probability of selection for each validator.

Without rating, all validators of a shard would have the same probability of being chosen for consensus. But rating modifiers will alter the probability of individual validators based on their rating score, in order to give performant validators an edge over the average validators, and also to diminish the probability of selecting weak validators.

The following table shows how the rating of a validator influences its probability of being chosen for consensus:

| Rating interval | Modifier |
|-----------------|----------|
| [0-10]          | -100%    |
| (10-20]         | -20%     |
| (20-30]         | -15%     |
| (30-40]         | -10%     |
| (40-50]         | -5%      |
| (50-60]         | 0%       |
| (60-70]         | +5%      |
| (70-80]         | +10%     |
| (80-90]         | +15%     |
| (90-100]        | +20%     |

:::important
The algorithm that selects validators for consensus treats these modified selection probabilities as being relative to each other.
:::

[comment]: # (mx-context-auto)

## **Calibration**

Assuming a **24-hour-long epoch**, the rating mechanism has been calibrated with the following intentions:

- A new validator requires **approx. 72 hours** to reach maximum rating, assuming it remains in the same shard and won't be shuffled out (therefore it will be productive all the time, without any waiting time).
- The amount of rating gains earned as a block validator should be in balance with the amount of rating gains earned as a block proposer. This balance must take into account the fact that being selected as proposer is considerably less likely than being selected in consensus as block validator.

[comment]: # (mx-context-auto)

## **Rating shard validators**

[comment]: # (mx-context-auto)

### **Rating the shard block proposer**

The node chosen to propose the block for a specific round will:

- Gain `0.23148` points for a successful proposal: (1) the block is built correctly, (2) it is accepted by the consensus validators and (3) the proposer applies the final signature and propagates the block throughout the network;
- Lose `0.92592` points for an unsuccessful proposal.

Observe that the loss is 4 times larger than the gain, which means that a proposer must succeed 4 times to gain the points lost for a single missed block.

Rating for proposers is even stricter: there is a compounding penalty rule, which makes the rating of a node drop even faster when it proposes unsuccessfuly.

The amount of `0.92592` points is deducted from the rating of the proposer on the first unsuccessful proposal, but the second unsuccessful proposal will be penalized by `0.92592 × 1.1`. The third, by `0.92592 × 1.1 × 1.1`. The general formula is:

`0.92592 × 1.1^{cfp-1}0.92592×1.1^cfp^−1`

where `cfp` is the number of consecutive failed proposals.

This compounding penalty has the effect of quickly jailing repeatedly unsuccessful proposers.

[comment]: # (mx-context-auto)

### **Rating the shard block validator**

The nodes that take part in the consensus of a round (other than the proposer) will:

- Gain `0.00367` points for a successful validation: (1) the proposer has built and proposed a block, (2) the validator appears as a "signer" on that block; being a "signer" of a block means that the validator has approved of the block and was fast enough to be among the first ⅔ + 1 validators to have its signature received by the block proposer;
- Lose `0.01469` points for an unsuccessful proposal.

Observe that the first bulled mentions "the proposer has built and proposed a block". This sentence implies that _all validators will lose rating_ if the proposer fails to propose in the respective round.

Moreover, the validator must have been a "signer" in at least 1% of the previous blocks, otherwise it will not gain rating. In other words: if the validator has been performing poorly in the past, it will have to perform well for a while until it can start receiving any gains.

[comment]: # (mx-context-auto)

## **Rating metashard validators**

The rating mechanism for the metashard is identical with the rating mechanism of the normal shards, but the gain / loss values themselves are configured differently.

[comment]: # (mx-context-auto)

### **Rating the metashard block proposer**

The metachain proposer will:

- Gain `0.23148` points for a successful proposal;
- Lose `0.92592` points for an unsuccessful proposal.

The compounding penalty rule also applies to block proposers of the metachain. See [Rating the shard block proposer](#rating-the-shard-block-proposer) for details.

[comment]: # (mx-context-auto)

### **Rating the metashard block validator**

A validator taking part in consensus on the metachain will:

- Gain `0.00057` points for a successful validation;
- Lose `0.00231` points for an unsuccessful validation.

The rules from [Rating the shard block validator](#rating-the-shard-block-validator) apply for the metashard validators as well.
