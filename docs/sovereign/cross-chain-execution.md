# Introduction

When we take a look at the blockchain industry, we observe a segregated ecosystem lacking cohesion, interoperability, teamwork. Many strive to reach the top independently. The vision lead to the Blockchain Revolution, knows as “Web3” — a new era of the internet that is user-centered, emphasizing data ownership and decentralized trust.

Sovereign Chains will dismantle the barriers between isolated blockchain networks by allowing smart contracts to seamlessly interact across different Sovereign Chains and the main MultiversX chain.
This cross-chain interoperability is crucial for fostering an environment where decentralized apps (dApps) can utilize functionalities or assets from across the ecosystem.

## What is Cross-Chain Execution?

Cross-Chain execution is the ability of smart contracts or decentralized applications on one blockchain to invoke actions on another blockchain. This feature allows for seamless communication and interaction between different blockchain networks, enabling developers to build applications that are chain agnostic.


## Cross-Chain Execution within Sovereign Chains

This feature is enabled by using multiple smart contracts, each one with its unique role and set of functionalities. The current Sovereign Chain suite consists of three main contracts, here is the high-level description for some of the cross chain smart contracts:

#### ESDT-Safe
The *ESDT-Safe* Smart Contract performs all the heavy lifting. This is the cross-chain execution contract, it will facilitate the transfer and mapping of assets and funds between Sovereign Chains and the MultiversX mainchain.

There are two modules implemented for this contract: [*From Sovereign*](from-sovereign.md), [*To Sovereign*](to-sovereign.md) and two important endpoints: `execute_operation`, `deposit`. Both of them allow the caller to transfer tokens and also execute smart contracts within a single transaction. The only difference is where the sender and receiver of the cross-chain execution are situated. 

The scenarios for what endpoint to choose look like this:
1. If the receiver is in a Sovereign Chain, the call should be to the `deposit` endpoint. (_To Sovereign_) 
2. If the sender is in a Sovereign Chain, the call should be to the `execute_operation` endpoint. (_From Sovereign_)

:::note
The naming for those modules has been chosen this way to represent the direction of the execution. In the following sections we will be referring to `FromSovereign` as the execution starts within the Sovereign Chain and `ToSovereign` as the destination of the execution is a Sovereign Chain. 
:::

#### Fee-Market
Since every Sovereign Chain will have a customizable fee logic, it was paramount that this configuration had to be separated into a different contract. Rules such as: fee token, fee percentages, whitelists are all stored inside this contract.

#### Header-Verifier
All the *BLS keys* of the validator will be stored inside this contract. The main role for the Header-Verifier contract is to verify signatures for the operations that are created inside the Sovereign Chain.

:::note
Each Sovereign Chain will include those smart contracts, the source code can be found at the official [MultiversX Sovereign Chain SCs repository](https://github.com/multiversx/mx-sovereign-sc). 
:::
