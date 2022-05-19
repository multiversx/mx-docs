---
id: node-upgrades
title: Elrond Node upgrades
---

## **Introduction**

Once a new node's binary is ready to be deployed on one of a network (mainnet, testnet or devnet), nodes operators must 
perform the upgrade to the newest version. These releases are always announced on Elrond [Validators chat](https://t.me/ElrondValidators) 
plus via other communication channels, depending on the case. 

## **Types of upgrades**

Currently, we have the following types of upgrades:

A. - **all nodes need to upgrade**:  upgrades that involve processing changes with an activation epoch (as explained below) 
and have to be performed by all nodes operators in order to keep the same view over the network and not cause service disruptions.

B. - **optional upgrades**: upgrades that for example simply add a new Rest API endpoint or improve the trie syncing timing 
are not critical from a processing point of view, and they are optional. If the nodes operators think the new feature will help them,
they can proceed with the upgrade without losing the compatibility with the network.

C. - **only validators need to upgrade**: upgrades that, for example, include new features that only trigger validators (ratings changes, 
transactions selection improvements and so on). Observers (nodes that don't have a stake attached) don't need to perform the upgrade.

## **Activation epochs**

In order to make the upgrades as smooth as possible and to ensure that each node has the same view over the network, 
Elrond has a so called *activation epoch* mechanism that allows the node to have both versions of the code (before and 
after the activation epoch) so that we can maintain the backwards compatibility. The system will behave accordingly to 
the epoch.

### **Deterministic time / height for upgrades**

As compared to other protocols that perform upgrades that start at a specific block height, releases for Elrond nodes
don't have a specific block height where the new updates become effective, but rather the first block in the 
activation epoch will make the nodes proceed with the updated versions of the components.

Since the height of the first block in an epoch isn't deterministic (due to possible roll-backs), the Network Height
where a feature becomes effective cannot be calculated.

However, the time when a new feature of a bugfix becomes effective is deterministic, as epochs have fixed lengths in rounds.
Currently, Elrond Mainnet has epochs of `14,400` rounds and a round is `6 sec`. This results in a `24h` epoch.

### *Activation epoch example*

For example, let's say that we want to introduce a feature so that smart contracts can receive a `PayableBySC` metadata that
will allow them to receive EGLD or other tokens from other smart contracts. 

*Timeline example*
- the Elrond Mainnet is at epoch `590`.
- currently, the node binary doesn't know about the `PayableBySC` metadata so if one wants to try it, an error like `invalid metadata` 
will be returned.
- at epoch `600`, we release a new node binary that contains the `PayableBySC` metadata that will become activate starting with epoch `613`.
- all nodes operators perform the upgrade.
- when epoch `613` begins, that metadata will be activated and smart contracts can now have that flag.
- if one wants to issue a smart contract that is `PayableBySC`, it will work.

- nodes that didn't perform the upgrade will produce a different output of the transaction (as compared to the majority)
and won't be able to advance in the consensus.

*Backwards compatibility explained*:  
If one wants to process all the blocks since genesis (via `full archive` or via `import-db`) with the released binary
it will behave this way: 
- if for example, in epoch `455` there was a transaction that tried to set the `PayableBySC` metadata, it will process it 
as `invalid metadata`
- for transactions in epochs newer than `613` it will process the new metadata.

|                 | Before activation epoch | After activation epoch |
| --------------- | ----------------------- | ---------------------- |
| IsPayableBySC   | `invalid metadata`      |   `successful`         |

