---
id: secure-proof-of-stake
title: Secure Proof of Stake
---

[comment]: # (mx-context)

MultiversX's approach for consensus is called Secure Proof of Stake (SPoS). It innovates in the manner in which validator nodes are selected for consensus out of a shard and also in the steps taken by the validators to complete the consensus process as efficiently as possible. Let's take a look.

At the beginning of each round, SPoS selects validators for consensus using a **randomness source** that can be neither predicted, nor influenced. It is surprisingly simple, requiring only to be calculated from the previous block and to be signed by the consensus leader of the current round (also known as the _block proposer_). The resulting signature will be the randomness source for the next round, and due to its reliance on the immediately preceding block, it cannot be known more than a round in advance.

In each round, a new consensus group is selected to propose a block. But only one validator in the group will be the **block proposer**. This is the validator in the consensus group which has the hash of the public key and randomness source is the smallest, numerically. The block proposer will produce the block for the round, and the rest of the consensus group will validate and sign it.

The time necessary for random selection of the consensus group is exceptionally short (around 100 ms, often less). This efficiency is a consequence of the fact that consensus selection is deterministic once the randomness source is known, thus there is no communication requirement. This allows total round times on the order of mere seconds.

There is a security advantage to having rounds this short: SPoS is built on the premise that a malevolent actor cannot adapt faster than the timeframe allowed by a round in order to influence the block that will be proposed.

Like other Proof of Stake methods, SPoS selects validator nodes for consensus based on the amount of EGLD tokens staked by their operators. Additionally, each validator has an individual **rating score** that is taken into account - stake alone may only influence, but not completely determine the selection for consensus. Rating expresses the past behavior of the specific validator and is taken into account during consensus selection: validators with a higher rating are more likely to be selected. The rating of a validator is recalculated at the end of each epoch, with a few specific exceptions when rating is adjusted immediately. This way, SPoS promotes meritocracy among validators, encouraging their operators to keep them running smoothly.

A modified BLS multisignature scheme with 2 communication rounds is used by the consensus group for signing the block produced by the block proposer. Refer to the animation below for a step-by-step description of this process:

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-LiMxIign95mclxNqYGx%2F-LiMxWSVhwOjpz3wB71V%2Fspos.gif?alt=media&token=734c6439-d245-4e83-9a81-a72e6e27ce32)
