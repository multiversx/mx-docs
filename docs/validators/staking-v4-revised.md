---
id: staking-v4
title: Staking v4
---

[comment]: # (mx-context-auto)

# **1. Introduction**


## What is MultiversX staking?

Staking on MultiversX has reached its fourth iteration; also known as Staking v4 it now offers improved validator security and introduces a few new features designed to improve the staking experience and provide a non-biased 
validator rotation.

The core benefits Staking v4 offers for staking providers are mainly the intuitive validator dashboard, 
easy node management, and quick staking provider identity creation. Staking providers also have the ability to add 
or remove validator nodes easily and change network fees on the fly.

Compared to traditional staking mechanisms, MultiversX staking offers staking providers easy access, developer and technical support plus the ability to participate in protocol governance.


## Audience and Purpose

This document is intended for new staking providers that would like to start their journey with MultiversX and be part
 of our growing community of validators and providers.

While reading this document, you will be able to quickly understand and grasp the advantages of starting a Staking Provider on our protocol and fully reap the benefits while participating in one of the most stable protocols out there.


## Key Features and Advantages

**Security** is ensured by our Auction List mechanism that randomly selects 320 nodes, 80 nodes from each shard at every epoch start.The nodes are shuffled randomly to avoid collusion and to distribute the nodes across the shards. This contributes to the protocol security by maintaining a balanced network and avoiding concentration of power. 

**Scalability**

**Rewards**


# **2. Staking Protocol Overview**


## Core concepts

**Staking**

**Validators and Delegators**

**Reward Distribution**


## Protocol Design Principles

**Security and Decentralization**

**Economic Incentives**

**Fault Tolerance and Slashing**


## Ecosystem Roles

**Staking Providers**

**Node Operators**

**Developers**


# **3. How Staking Works**


## Staking Lifecycle

**Creating Your Staking Provider Identity**
**The Staking Smart Contract**
**Adding Nodes to Your Staking Provider**
**Staking Provider Dashboard**
**Web Wallet Dashboard**
**Explorer Interface**


## Staking Mechanisms

**Node Qualification Threshold** also known as NQT, it is a dynamically calculated number by the network approximately every 10 minutes. It is directly influenced by the numbers of validator nodes leaving or joining the network and the overall EGLD staked in the protocol. 

From a Staking Provider perspective you can calculate this as an average between the total EGLD staked, adding the top-up and dividing it by the number of nodes for your Staking Provider. This will show your status or customized NQT that you can compare against the network NQT.

For example, let's assume this ficitonal Staking Provider with the following parameters:

Number of Nodes: 10
EGLD Stake: 40,000

We can split the Stake like so:

EGLD: 25,000 Node Stake
EGLD: 15,000 Top-up

The NQT calculation is fairly simple as we divide the overall 40,000 EGLD stake by the number of nodes 10 and results in an NQT of 4,000. This examples is simplified for the sake of the example. Now this NQT can be compared to the actual network NQT so that the Staking Provider owner can decide on wether to adjust top-up or nodes.


**Auction List**

The Auction List has been introduced with Staking v4, here is an example from our explorer.


**Auction List Explorer Example**

The mechanism of the Auction List selects a list of 320 random nodes, 80 from each shard, at epoch start.
These selected nodes remain in the Auction List for one epoch. 

The Auction List was devised with security in mind , randomly selecting nodes with the point being to avoid colluding, 
giving Staking Providers a fair change for validating and also keeps the Shards healthy with shuffling nodes every epoch.

There are three different status titles for nodes in the Auction List, Qualified, Danger and Not Qualified.

![](/validators/stakingV4/AuctionList.png)


**Epoch Start**

320 Nodes are randomly shuffled out from the consensus and moved to the Auction List.
This includes jailed nodes, but the mechanism compensates for each jailed node by selecting the same number of nodes that are not jailed.  


**Qualified Status** of a node present in the Auction List

A Node gets the Qualified status if the Node NQT calculated for it, from the stake of Staking Provider and top-up, is the same or higher as compared to the Network NQT.

![](/validators/stakingV4/QualifiedSimple.png)

![](/validators/stakingV4/QualifiedDetail.png)


**Danger Status** 

A Node gets the Danger status if the Node NQT calculated for it, from the stake of Staking Provider and top-up, is dangerously close or exactly the same as the Network NQT.

![](/validators/stakingV4/DangerSimple.png)

![](/validators/stakingV4/DangerDetail.png)


**Not Qualified Status**

A Node gets the Not Qualified status when the Node NQT calculated for it, from the stake of Staking Provider and top-up,
is lower as compared to the Network NQT, the active period for the Validator Node.

![](/validators/stakingV4/NotQualifiedSimple.png)

![](/validators/stakingV4/NotQualifiedDetail.png)


**Waiting List**

The Waiting List represents the list of nodes that have been Qualified from the Auction List.
All the nodes that have passed the Qualified Status will then go to the Waiting List, they will remain in the Waitning List for 4 epochs which represents roughly four days.

After the 4 epochs, these nodes are moved to participate in the consensus for validating.
As a side note, even if the Network NQT changes in the 4 waiting Epochs the already selected nodes will still participate in the consensus even if they would presumambly have lower Node NQT after the aformentioned 4 epochs in the Waiting List.


**Waiting Status**

This Status means that the Validator Node has been Qualified from the Auction List and is in the 4 Epoch waiting time before joining the consensus to start validating.

![](/validators/stakingV4/WaitingDetail.png)


**Eligible Status**

This Status means that the Validator Node can validate or propose blocks in the current Epoch. It can be part of the Consensus in certain rounds.

![](/validators/stakingV4/EligibleDetail.png)


**Automatic Node Qualification**

This mechanism automatically distributes a Staking Provider's total top-up amount to the Validator Nodes they own.
It focuses on redistributing the top-up based on the Network NQT in order to Qualify as many Nodes as possible fro each staking provier.


**Top-up Balancing**

The point of this mechanism is to show Staking Providers their Nodes' status based on the Network NQT allowing them to adjust their number of nodes or the amount of top-up, either manually or automatically.

This allows for monitoring the status of the nodes and preparing for the Epoch Start.


# **4. Technical Setup**

## Validator Node Setup

## Multikey Setup

