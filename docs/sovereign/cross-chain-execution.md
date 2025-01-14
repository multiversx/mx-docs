# Creating Bridges

When we take a look at the blockchain industry, we observe a segregated ecosystem lacking cohesion, interoperability, teamwork. Many strive to reach the top independently. The vision lead to the Blockchain Revolution, knows as “Web3” — a new era of the internet that is user-centered, emphasizing data ownership and decentralized trust.

Sovereign Chains will dismantle the barriers between isolated blockchain networks by allowing smart contracts to seamlessly interact across different Sovereign Chains and the main MultiversX chain.
This cross-chain interoperability is crucial for fostering an environment where decentralized apps (dApps) can utilize functionalities or assets from across the ecosystem.

## What is Cross-Chain Execution?

Being able to connect 2 different ecosystems opens up infinite possibilities for functionality. Cross-Chain Execution implies using the functionality of two different chains and combining both of them. In this context we can refer to: 

1. Sending tokens from one chain to another
2. Executing cross-chain endpoints for chain agnostic use cases

## Cross-Chain Execution within Sovereign Chains

All the heavy lifting is being done by the *ESDT-Safe* Smart Contract. 
There are two modules implemented in the bridging mechanism inside any Sovereign Chains, [*From Sovereign*](from-sovereign.md) and [*To Sovereign*](to-sovereign.md). The source code can be found at the official [MultiversX Sovereign Chain SCs repository](https://github.com/multiversx/mx-sovereign-sc). 
