# Introduction

When we take a look at the blockchain industry, we observe a segregated ecosystem lacking cohesion, interoperability, teamwork. Many strive to reach the top independently. The vision lead to the Blockchain Revolution, knows as “Web3” — a new era of the internet that is user-centered, emphasizing data ownership and decentralized trust.

Sovereign Chains will dismantle the barriers between isolated blockchain networks by allowing smart contracts to seamlessly interact across different Sovereign Chains and the main MultiversX chain.
This cross-chain interoperability is crucial for fostering an environment where decentralized apps (dApps) can utilize functionalities or assets from across the ecosystem.

## What is Cross-Chain Execution?

Cross-Chain execution is the ability of smart contracts or decentralized applications on one blockchain to invoke actions on another blockchain. This feature allows for seamless communication and interaction between different blockchain networks, enabling developers to build applications that are chain agnostic.


## Cross-Chain Execution within Sovereign Chains

This feature is enabled by using multiple smart contracts, each one with its unique role and set of functionalities. The current Sovereign Chain suite consists of three main contracts, here is the high-level description for some of the cross chain smart contracts:

#### ESDT-Safe
The *ESDT-Safe* Smart Contract performs all the heavy lifting. This contract facilitates the cross-chain transfer between either any Sovereign Chain and the MultiversX mainchain or the other way around.

There are two modules implemented for this contract: [*From Sovereign*](from-sovereign.md), [*To Sovereign*](to-sovereign.md) and two important endpoints: [`execute_operation`](from-sovereign.md#executing-an-operation), [`deposit`](to-sovereign.md#deposit-tokens).

:::note
The naming for those modules has been chosen this way to represent the direction of the execution. In the following sections we will be referring to `FromSovereign` as the execution starts within the Sovereign Chain and `ToSovereign` as the destination of the execution is a Sovereign Chain. 
:::

#### Fee-Market
Since every Sovereign Chain will have a customizable fee logic, it was paramount that this configuration had to be separated into a different contract. Rules such as: fee per transferred token, fee per gas unit and users whitelist to bypass the fee are set here. This contract is also present in the MultiversX mainchain and in any Sovereign Chain.

#### Header-Verifier
When any transaction happens inside a Sovereign Chain is called and *operation*. The main role of this contract is to verify operations. They have to be signed by the validators of the Sovereign Chain. If the operation is succesfully verified it will be registered and then can be executed by the ESDT-Safe contract. All the *BLS keys* of the validator will be stored inside this contract.

:::note
The source for the smart contracts can be found at the official [MultiversX Sovereign Chain SCs repository](https://github.com/multiversx/mx-sovereign-sc). 
:::

#### Sovereign Bridge Service
This feature facilitates the execution of outgoing operations. This service is an application that receives Sovereign operations. After that, it will call the `execute_operation` endpoint from the instance of the ESDT-Safe contract that is deployed on the MultiversX mainchain. The registration and execution of operations looks like this:

- For N operations there is only one [register transaction](from-sovereign.md#registering-a-set-of-operations) inside the Header-Verifier smart contract.
- N transactions for the [execution](from-sovereign.md#executing-an-operation) of N operations inside the ESDT-Safe smart contract, one execution transaction per operation.

> There can be one or more services deployed in the network at the same time.
