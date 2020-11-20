---
id: elrond-vs-harmony
title: Elrond vs. Harmony
---

(based on testnet, reviews and documentation)

Harmony proposes in its white paper full sharding, new consensus mechanism and distributed randomness source generator. There are great differences about what is described in their white paper and what they are actually doing. At the moment of this writing, their testnet can produce 1Tx/block.

## **Consensus**

Harmony’s FBFT (fast byzantine fault tolerance) consensus mentioned in the whitepaper is a simple pBFT consensus where the voting is done using BLS multi-signature scheme in order to reduce the network communication. The view-change mechanism seems to be also modified from the pBFT model, and needs to be analyzed in more detail as it is the most complex part of pBFT. Elrond avoids it completely by simply aborting the consensus round on timeout when consensus was not achieved and leave the next sampled consensus group agree on a newly proposed block. This is in some regard similar to Tendermint approach, emphasising more on the simplicity of the consensus model and avoiding the communication expensive, complex and error-prone change-view mechanism.

Elrond has a consensus model based on the BLS multi-signature scheme which requires only 2 rounds. Our simplified scheme makes the consensus faster and the liveness higher. The security of our protocol is not compromised as we use “fisherman challenge” and “k block delayed finality” concepts, which makes it provably impossible for a malicious group to push bad transactions.

Harmony uses threshold-proof-of-stake to choose their validators for each round. This means, the more stake one validator has, the more voting power it has inside a shard and the more chances to be chosen as shard leader. These leaders are chosen for an entire epoch and could be targeted by malicious actors since they are known for a large amount of time. Elrond randomly chooses the block proposer and consensus group every round, giving an attacker less time and opportunity to attack. 

In the original whitepaper, Elrond employed a model where the stake could give slightly higher chances of being selected into a consensus group. Since then, we have changed to fixed stake, as otherwise the probability of consecutive consensus groups being monopolized by same validators would grow, and if these validators are adversarial this could decrease the security. The nodes are randomly selected and assigned to shards and even if an adversary runs multiple instances, the chances of those instances to be selected into the same shard and into the same consensus group are lower than winning the lottery. The amount to be staked in Elrond is ~200$. 

## **Sharding**

Both Elrond and Harmony propose full sharding solutions - transactions, network and state sharding. Although Harmony proposes full sharding, one validator with more stake will receive voting shares in every shard through a single epoch. If a validator has to cast a vote in one shard, it needs to know all the state from that shard - this is not a real state sharding. Furthermore, the resharding algorithm is done at the end of the epoch, and one validator assigned to a new shard has to synchronize with the state of that shard. Some of the synchronization problems is mitigated with a Fast-state synchronization approach, but a lot of communication cost is still overlooked. 

Elrond has a true state sharding model, where a node is allocated to only one shard. At the end-of-the epoch, at most ⅓ of the nodes are shuffled out of shards and into different shards, with a fast-state synchronization model and buffered so it doesn’t incur any liveness cost.

Harmony assumes that a malicious group can only be slowly adaptive, and the mitigation of a shard takeover is done through random sampling only. In this case if a malicious actor corrupts ⅔ of a single shard, it can do anything, creating new tokens would also be possible. 

Elrond assumes that a malicious group can be highly adaptive and proposes two solutions “fisherman challenge” and “k block delayed finality” to resolve any problem regarding shard takeover or invalid transaction (we use k=1). Any honest node can raise a challenge from the current shard and the sibling shard against a proposed block, in the time frame it becomes final. If the challenge is good, all the members who voted for that block will be slashed and lose all their stake. A block is final, only if the next k blocks are signed and valid. 

## **Randomness source**

Harmony proposes a combination of VRF and VDF used in other blockchains, but these are hard to compute and involve a lot of steps. This solution needs a consensus to generate a random number so a BLS consensus is used for this, which involves some communication overhead. Harmony assume that in the long run the VDF could also be attacked by an adversary through ASICs. In case of VDF attack an attacker with a faster computing device could calculate the result before the other honest nodes. In principle the attacker could take advantage of this, e.g. withdrawing its fund if the bet on a smart contract was unfavorable to him. 

As opposed to this approach Elrond’s random seed consists of a separate “linked list” of randomness seeds for each shard, which is easy to compute, verify, un-biasable and unpredictable. Elrond uses BLS single signature scheme for randomness source, as this scheme gives the same result every time the same message is signed by the same validator and does not involve any communication overhead. The leader of the consensus group signs with his own private key the previous random number, and his signature becomes the new random number. It is a simple scheme, but offers all properties to be a good randomness source.