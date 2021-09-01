---
id: overview
title: Overview
---

The Elrond network is made up of nodes and their interconnectivity - balanced by virtue of its design, secured through its size and fast, _very_ fast, because efficiency is what motivated its development. Every time a node joins the network, it adds more security and efficiency. The network, in turn, rewards the nodes for their contribution, generating a virtuous cycle.

We will call a _node_ any running instance of the software application developed by the Elrond team, [publicly available as open source](https://github.com/ElrondNetwork/elrond-go). Anyone can run a node on their machine - great care was taken to make the node consume as little computing resources as possible. Mid-level recent hardware can effortlessly run multiple individual nodes at the same time, earning more rewards for the same physical machine.

We will call a _node operator_ any person or entity who manages one or more nodes. These pages are for them.

# **Background**

Elrond is a decentralized blockchain network. This means that its nodes collaborate to create sequential **blocks** with strict regularity - blocks which contain the results of operations that were requested by the users of the network. Such operations may be simple transfers of tokens, or may be calls to SmartContracts. Either way, _all_ operations take the form of **transactions**.

Any user who submits a transaction to the network must pay a fee, in EGLD tokens. These fees are what produces **rewards** for the nodes.

Note that not all nodes earn rewards from these fees. Only **validator nodes** qualify, because they are the nodes which are allowed to take part in [consensus](/technology/secure-proof-of-stake), to produce and validate blocks and to earn rewards.

Because of the influence they have in the network, validator nodes are required to have a **stake**, which is a significant amount of EGLD locked as collateral for the good behavior of the validator. Currently, the stake amount is set to 2500 EGLD. Nodes without a stake are called **observer nodes** - they don't participate in consensus and do not earn rewards, but they support the network in different ways.

If the validator consistently misbehaves or performs malicious actions, it will be fined accordingly and lose EGLD, an action known as _stake slashing,_ and by also having its validator status removed. This form of punishment is reserved for serious offences.

Validator nodes each have an individual **rating score**, which expresses their overall reliability and responsiveness. Rating will increase for well-behaved nodes: every time a validator takes part in a successful consensus, its rating is increased.

The opposite is also true: a validator which is either offline during consensus or fails to contribute to the block being produced will be considered unreliable. And a consistently unreliable validator will see its rating drop.

**Consensus selection probability** is strongly influenced by a validators rating. The consensus process _favors validators with high rating_ and will avoid selecting validators with low rating.

This implies that a node with high rating produces far more rewards than a node with low rating, so it is essential that operators maintain their validators online, up-to-date and responsive.

Moreover, if the rating of a validator becomes too low, it will be **jailed**. A jailed validator will not be selected for consensus - thus earning no rewards. To restore the validator, it must be **unjailed**, which requires a fine to be paid, currently set to 2.5 EGLD.
