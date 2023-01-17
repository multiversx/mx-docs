---
id: staking-providers-apr
title: Staking Providers APR
---

## Introduction

By using the [Delegation Manager](/validators/delegation-manager/) system smart contract, a new staking provider can be
set up. According to the initial deposits (half of the minimum node stake) + delegations from other users (or even the owner itself)
the staking contract can spawn new nodes. Currently, the minimum node cost is 2500 EGLD, so, for example, if a staking contract
gathered 7500 EGLD it can spawn 3 new nodes.

### Base stake and top-up

As stated, a validator node requires at least 2500 EGLD. So multiple nodes would mean at least _2500 multiplied by the number of nodes_ EGLD in the contract.
The difference is considered top-up. Also, the staking provider owner can choose to keep the tokens as top-up, even
if the top-up is enough to spawn a new validator node.

Let's take some examples:

a). A Staking Contract has 2550 EGLD. This would mean a base stake of 2500 EGLD + 50 EGLD top-up

b). A Staking Contract has 5200 EGLD. This could mean:

- a base stake of 2500 EGLD (1 node) + 2700 EGLD top-up
- a base stake of 5000 EGLD (2 nodes) + 200 EGLD top-up

Network-wise, the base stake is currently limited to 8,000,000 EGLD (3200 nodes \* 2500 EGLD / node). However, current staking
metrics indicate that the total EGLD staked is around 13,000,000 EGLD, resulting in a base stake of 8 millions EGLD + ~5 millions EGLD top-up.

### Service Fee

At each epoch change, the delegation contract receives the rewards in accordance to its stake. Over those rewards,
a service fee applies so the owner can cover the hosting and nodes management costs.

So for example, if the rewards are 10 EGLD in an epoch, and the service fee is set to 10%, the owner of the staking
contract will be eligible for 1 EGLD, while the difference (9 EGLD) will be allocated to the delegators.

### Inflation Rate

MultiversX's economics model is based on an inflation rate that decreases each year. More about this can be read on the
[blog](https://multiversx.com/blog/the-wealth-of-crypto-networks-elrond-economics-paper).

This means that for each year the estimated rewards for a validator will change. This has to be taken into account
when computing the APR.

The configuration for the inflation rate can be found [here](https://github.com/multiversx/mx-chain-mainnet-config/blob/master/economics.toml) (`YearSettings`).

The protocol doesn't take leap years into consideration, but rather approximate each year at 365 days.

The approximated inflation rate is as follows:

| Year | Start Date  | Inflation rate |
|------|-------------|----------------|
| 1    | 2020.07.30  | 10.84%         |
| 2    | 2021.07.30  | 9.7%           |
| 3    | 2022.07.30  | 8.56%          |
| 4    | 2023.07.30  | 7.42%          |
| 5    | 2024.07.29  | 6.27%          |
| 6    | 2025.07.29  | 5.13%          |
| 7    | 2026.07.29  | 3.99%          |
| 8    | 2027.07.29  | 2.85%          |
| 9    | 2028.07.28  | 1.71%          |
| 10   | 2029.07.28  | 0.57%          |
| 11   | 2030.07.28  | 0%             |

### Protocol Sustainability

In accordance to the Mainnet's [configuration](https://github.com/multiversx/mx-chain-mainnet-config/blob/master/economics.toml#L35) (`ProtocolSustainabilityPercentage`).
at each epoch change, when new tokens are distributed among the validators, 10% of the value goes to Protocol Sustainability Address.

This also has to be taken into account when calculating the APR.

## Rewards calculation

When wanting to calculate the APR (Annual Percentage Return) of a Staking Provider, there are multiple factors that have
to be taken into account, such as total value locked at Network-level, the inflation based on the current year, the
staking provider base stake and top-up stake, and so on.

### Network Top-Up rewards

The formula for determining the rewards received by the validators for the top-up in a given epoch is:

$$
topUpRewards(e) = \frac{2 * topUpRewardLimit(e)}{\pi} * atan(\frac{eligibleCumulatedTopUp(e)}{p})
$$

Where:

- `e` represents the given epoch
- `topUpRewardLimit(e)` represents the maximum top-up rewards that can be distributed in the given epoch. This can be viewed
  as the maximum value out of the epoch rewards that can be distributed as rewards for the top-up stake, and depends
  on the total rewards to be distributed in the epoch and a configured network parameter that defines the proportion out of the total rewards.
- `eligibleCumulatedTopUp(e)` represents the rewards distributed in the epoch for signing and proposing blocks.
  This does not include the protocol sustainability rewards, developer fees or the penalty for missed blocks.
- `p` represents a chosen parameter to control the gradient of top-up rewards. It can be viewed as the cumulated top-up stake
  where the given top-up rewards reach ½ of the top-up rewards set limit. It is currently set to 2M EGLD.

### Network base rewards

$$
baseRewards(e) = blocksRewards(e) - topUpReward(e)
$$

Where:

- `blocksRewards(e)` represents the rewards received by the validators by either signing or proposing blocks during the epoch that are now
  part of the canonical chain
- `topUpReward(e)` is computed above

## APR calculation

After determining the base and the top-up rewards for an epoch, the APR can be calculated for a Staking Provider.

First, we have to determine the maximum rewards that can be reached in ideal situations (no missed block in an epoch).

### Staking Provider base stake rewards

We have to calculate the estimated rewards received by a Staking Provider in one epoch for the base stake.

This is done by calculating the share of the total rewards in accordance to the provider's number of nodes.

Therefore, if a Staking Provider has 320 nodes out of 3200 nodes, it will receive 10% of the base rewards. Note that the base rewards
are calculated after decreasing the protocol sustainability rewards, as well as the computed top-up rewards.

$$
stakingProviderBaseStakeRewards(e) = \frac{stakingProviderNumberOfNodes}{totalNumberOfNodesInNetwork} * baseRewards(e)
$$

### Top-Up rewards

Similar to base stake rewards, the rewards for top-up are estimated by computing the share of the provider's top-up in
accordance to the network's total top-up.

$$
stakingProviderTopUpRewards(e) = \frac{stakingProviderTopUpAmount}{networkTotalTopUp} * topUpRewards(e)
$$

### APR calculation

In order to obtain the estimation of the APR, we first need to calculate the share of the provider's earnings in an epoch as compared
to it's total stake locked. Then we will multiply by 365 (the number of days in a year) and get the result.

$$
aprWithoutFee = \frac{stakingProviderBaseStakeRewards(e) + stakingProviderTopUpRewards(e)}{providerTotalStake} * 365
$$

The last step is to decrease the fee deducted by the staking provider owner:

$$
apr = \frac{100 - fee}{100} * aprWithoutFee
$$

## Example

The formulas and all the mathematics involved might be quite complicated, so let's take an example.

Let's say we have the following parameters:

Network parameters

```
genesisTotalSupply = 20M EGLD
inflationRate = 9.7% (year 2)
p = 2M EGLD
totalNodes = 3200
eligibleCumulatedTopUp = 2.6M
totalCumulatedTopUp = 5.2M
protocolSustainabilityRewards = 10%
numDaysInAYear = 365
topUpFactor = 0.5
```

Staking provider parameters:

```
stakingProviderNumberOfNodes = 10
stakingProviderBaseStake = 25,000 EGLD
stakingProviderTopUpAmount = 6,472 EGLD
stakingProviderTotalStake = 31,472 EGLD
fee = 2%
```

For a random day, the maximum rewards that can be distributed is:

```
maximumRewardsInADay(e) = inflationRate * genesisTotalSupply / numDaysInAYear = 9.7% * 20M / 365 = 5315 EGLD
```

We have to decrease the protocol sustainability rewards, resulting in:

```
maximumRewardsInADay(e) = 4783 EGLD
```

The maximum top-up reward for the epoch is:

```
topUpRewardLimit(e) = topUpFactor * maximumRewardsInADay(e) = 0.5 * 4783 =~ 2391 EGLD
```

Therefore, the network top-up would be:

```
topUpRewards(e) = (2 * topUpRewardLimit(e) / pi) * atan(eligibleCumulatedTopUp(e) / p) = (2 * 2391 / pi) * atan(2.6M / 2M) =~ 1522 * 0.91 =~ 1385 EGLD
```

The base rewards would be:

```
baseRewards(e) = blocksRewards(e) - topUpReward(e) = maximumRewardsInADay(e) - topUpReward(e) = 4783 - 1385 = 3398 EGLD
```

Moving to the staking provider:

```
stakingProviderBaseStakeRewards(e) = stakingProviderNumberOfNodes / totalNodes * baseRewards(e) = 10 / 3200 * 3398 = 10.61 EGLD
stakingProviderTopUpRewards(e) = stakingProviderTopUpAmount / totalCumulatedTopUp * topUpRewards(e) = 6472 / 5.2M * 1385 = 1.72 EGLD
```

And, finally, calculating the APR:

```
aprWithoutFee = (stakingProviderBaseStakeRewards(e) + stakingProviderTopUpRewards(e)) / providerTotalStake * 365 = (10.61 + 1.72) / 31472 * 365 = 14.29 %
```

After deducting the fee:

```
apr = (100 - fee) / 100 * aprWithoutFee = (100 - 2) / 100 * 14.29 = 14.00 %
```
