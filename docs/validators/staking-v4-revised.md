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

### Security 

Ensured by our Auction List mechanism that randomly selects 320 nodes, 80 nodes from each shard at every epoch start.The nodes are shuffled randomly to avoid collusion and to distribute the nodes across the shards. This contributes to the protocol security by maintaining a balanced network and avoiding concentration of power. 


### Scalability 

Describe Scalability


### Rewards

#### APR (Annual Percentage Rate)

The APR of a Staking Provider is influenced by a few factors. The most important is how their Node NQT is aligned with the Network NQT. That means, the closer your Node NQT is to the Network NQT the better your APR.

An easy way to calculate this is to divide the total amount of EGLD locked in your Staking Provider contract by the number of nodes and compare it to the Network NQT. If your Staking Provider has a very high NQT compare to the Network, then your APR will be lower because the proportion of EGLD per node is not optimized.

![](/validators/stakingV4/LowAPRDetail.png)

The APR is also directly influenced by the service fee decided by the Staking Provider, more about this in the dedicated section below.


#### Service Fee

This fee represents the percentage of validator rewards the Staking Provider is gaining in order to kept heir service up, nodes updated, infrastructure paid and more. This is calculated directly from each Epoch reward and influences the overall Staking Provider APR. A high Service Fee will lower the APR and a lower or zero Service Fee will maximize APR.

For example if at the end of the Epoch, the statking provider delegators will receive a total of 100 EGLD in rewards, and the Staking Provider Service Fee is set at 10%, 10 EGLD will go to the Staking Provider Rewards Address and the 90 EGLD will be split between the delegators accordingly.

The Service Fee can be changed at any time by the owner of the Staking Provider wallet. This can range between 0% and 100%.
However, we recommend a service fee between 10% and 12% but every Staking Provider should keep and eye on the others and adjust as it is a competitive space and we do not impose any restrictions, only suggest fair fees to our Staking Providers.

#### Service Fee Examples

Here are a few examples from our current setup of Staking Providers and their APR according to their NQT and Service Fee:

#### Delegator Optimized Staking Provider 0% Service Fee for 4,018 EGLD Netqwork NQT

In this case for 36 Nodes with 145,910 EGLD Stake the Node NQT is 4,053 EGLD very close to 4,018.
Also, the Service Fee is set at 0% so the optimization is maximized to favor delegator rewards the Staking Provider taking zero rewards but ofeering the highest APR to their delegators of 7.74%.

![](/validators/stakingV4/DelegatorOptimized0Fees.png)


#### Balanced Optimized Staking Provider 10% Service Fee for 4,018 EGLD Netqwork NQT

Here is another example where this Staking Provider has chosen a 10% Service Fee. Althouhg the screenshot shows 50 nodes, because of the Network NQT they can only run 47 but the optimization is good with 47 Nodes as well offering their delegators 
6.9% APR. The calculation is the same, 196,805 staked EGLD for 47 Eligible Nodes gives a Node NQT of 4,187 EGLD very close to the Network NQT, but here the Service Fee is lowering the APR as you see compared to the previous example, is 0.84% lower.
This is how the Service Fee can impact as Staking Provider's APR.

![](/validators/stakingV4/Balanced10Fees.png)


#### Delegation Cap

The Delegation Cap is an option a Staking Provider can choose to use. This gives the Staking Provider mode granular control over the amount that can be delegated to their contract. This could potentially help prevent overdelegating which in turn could mean a lower APR if the overall EGLD staked per Node is much higher than the Network NQT.


# **2. Staking Protocol Overview**


## Core concepts

### Staking Providers

What is a Staking Provider


### Validators 

What is a Validator


### Delegators

Who are the Delegators


### Reward Distribution

Rewards distributed from Validators participating in Consensus are received at each Epoch end, roughly once per day at 18:45 GMT+1. The rewards are automatically distributed to Delegators according to their Stake and to the Staking Provider according to their set Service Fee.


## Protocol Design Principles

### Security and Decentralization

### Economic Incentives

### Fault Tolerance and Slashing


## Ecosystem Roles

### Staking Providers

### Node Operators

### Developers



# **3. How Staking Works**

## Creating Your Staking Provider Identity

## The Staking Smart Contract

## Adding Nodes to Your Staking Provider

## Staking Provider Dashboard

## Web Wallet Dashboard

## Explorer Interface


## Staking Mechanisms

### Node Qualification Threshold

Also known as NQT, it is a dynamically calculated number by the network approximately every 10 minutes. It is directly influenced by the numbers of validator nodes leaving or joining the network and the overall EGLD staked in the protocol. 

From a Staking Provider perspective you can calculate this as an average between the total EGLD staked, adding the top-up and dividing it by the number of nodes for your Staking Provider. This will show your status or customized NQT that you can compare against the network NQT.

For example, let's assume this ficitonal Staking Provider with the following parameters:

Number of Nodes: 10
EGLD Stake: 40,000

We can split the Stake like so:

EGLD: 25,000 Node Stake
EGLD: 15,000 Top-up

The NQT calculation is fairly simple as we divide the overall 40,000 EGLD stake by the number of nodes 10 and results in an NQT of 4,000. This examples is simplified for the sake of the example. Now this NQT can be compared to the actual network NQT so that the Staking Provider owner can decide on whether to adjust top-up or nodes.


### Auction List

The Auction List has been introduced with Staking v4, here is an example from our explorer.


#### Auction List Explorer Example**

The mechanism of the Auction List selects a list of 320 random nodes, 80 from each shard, at epoch start.
These selected nodes remain in the Auction List for one epoch. 

The Auction List was devised with security in mind , randomly selecting nodes with the point being to avoid colluding, 
giving Staking Providers a fair change for validating and also keeps the Shards healthy with shuffling nodes every epoch.

There are three different status titles for nodes in the Auction List, Qualified, Danger and Not Qualified.

![](/validators/stakingV4/AuctionList.png)


### Epoch Start

320 Nodes are randomly shuffled out from the consensus and moved to the Auction List.
This includes jailed nodes, but the mechanism compensates for each jailed node by selecting the same number of nodes that are not jailed.  


### Qualified Status

A Node gets the Qualified status if the Node NQT calculated for it, from the stake of Staking Provider and top-up, is the same or higher as compared to the Network NQT.

![](/validators/stakingV4/QualifiedSimple.png)

![](/validators/stakingV4/QualifiedDetail.png)


### Danger Status 

A Node gets the Danger status if the Node NQT calculated for it, from the stake of Staking Provider and top-up, is dangerously close or exactly the same as the Network NQT.

![](/validators/stakingV4/DangerSimple.png)

![](/validators/stakingV4/DangerDetail.png)


### Not Qualified Status

A Node gets the Not Qualified status when the Node NQT calculated for it, from the stake of Staking Provider and top-up,
is lower as compared to the Network NQT, the active period for the Validator Node.

![](/validators/stakingV4/NotQualifiedSimple.png)

![](/validators/stakingV4/NotQualifiedDetail.png)


### Waiting List

The Waiting List represents the list of nodes that have been Qualified from the Auction List.
All the nodes that have passed the Qualified Status will then go to the Waiting List, they will remain in the Waitning List for 4 epochs which represents roughly four days.

After the 4 epochs, these nodes are moved to participate in the consensus for validating.
As a side note, even if the Network NQT changes in the 4 waiting Epochs the already selected nodes will still participate in the consensus even if they would presumambly have lower Node NQT after the aforementioned 4 epochs in the Waiting List.


### Waiting Status

This Status means that the Validator Node has been Qualified from the Auction List and is in the 4 Epoch waiting time before joining the consensus to start validating.

![](/validators/stakingV4/WaitingDetail.png)


### Eligible Status

This Status means that the Validator Node can validate or propose blocks in the current Epoch. It can be part of the Consensus in certain rounds.

![](/validators/stakingV4/EligibleDetail.png)


### Automatic Node Qualification

This mechanism automatically distributes a Staking Provider's total top-up amount to the Validator Nodes they own.
It focuses on redistributing the top-up based on the Network NQT in order to Qualify as many Nodes as possible from each staking provider.


### Top-up Balancing

The point of this mechanism is to show Staking Providers their Nodes' status based on the Network NQT allowing them to adjust their number of nodes or the amount of top-up, either manually or automatically.

This allows for monitoring the status of the nodes and preparing for the Epoch Start.



# **4. Technical Setup**

## Validator Node Setup

## Multikey Setup

