---
id: multisig-contract
title: Multi Signature Contract
---

## **Introduction**
Elrond Network’s carefully designed features make it a suitable candidate to support a broad range of digital use cases. One important feature is the capability that allows multiple stakeholders to securely agree on decisions via a multi-signature contract.

The multisig SC (MSC) enables multiple parties to sign or approve an action that takes place - typically a requirement for certain wallets, accounts, and smart contracts to prevent a rogue or hacked individual from performing detrimental actions.

More information about the MSC can be found on the [**Elrond specifications repository**](https://github.com/ElrondNetwork/elrond-specs/blob/main/sc-multisig-specs.md). 

## Roles

* Deployer - This is the address that deploys the MSC. By default this address is also the owner of the SC, but the owner can be changed later if required.
* Owner - The deployer is initially the owner of the MSC, but if desired can be changed later by the current owner to a different owner. If the SC is upgradeable, the owner can also upgrade the SC.
* Board and quorum - Multiple addresses need to be previously registered in the MSC, forming its board. For instance, such a contract could have 5 board members, but a quorum of 3 would be enough to perform any action (M-of-N or in this case 3-of-5).
* Proposer - The proposer is an address whitelisted in the MSC that can propose any action in form of transactions.

## Multisig transaction flow

On-chain multisig wallets are made possible by the fact that smart contracts can call other smart contracts. To execute a multisig transaction the flow would be:

1. A proposer or board member proposes an action.
2. The proposed action receives an unique id/hash.
3. N board members are notified (off-chain) to review the action with the specific id/hash.
4. M out of N board members sign and approve the action.
5. Any proposer or board member “performs the action”.

## Deploy MSC

## 