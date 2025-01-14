# Cross-Chain Execution

When we take a look at the blockchain industry, we observe a segregated ecosystem lacking cohesion, interoperability, teamwork. Many strive to reach the top independently. The vision lead to the Blockchain Revolution, knows as “Web3” — a new era of the internet that is user-centered, emphasizing data ownership and decentralized trust.

Sovereign Chains will dismantle the barriers between isolated blockchain networks by allowing smart contracts to seamlessly interact across different Sovereign Chains and the main MultiversX chain.
This cross-chain interoperability is crucial for fostering an environment where decentralized apps (dApps) can utilize functionalities or assets from across the ecosystem.

## What is a Cross-Chain Execution?

Being able to connect 2 different ecosystems opens up infinite possibilites for functionality. Cross-Chain Execution implies using the functionality of two different chains and combining both of them. In this context we can refer to: 

1. Sending tokens from one chain to another
2. Executing cross-chain endpoints for chain agnostic use cases

## Cross-Chain Execution with Sovereign Chains

Let’s get a closer look on how the builtin bridge inside the Sovereign Chains moves assets between each side:

### MultiversX to Sovereign
1. User deposits the tokens he wishes to bridge in the ESDT-Safe contract.
2. Validators in the Sovereign Chain monitor the mainchain headers and push the header, the bridge transactions and the corresponding proofs to the Sovereign Chain.
3. Leaders include proofs of execution from the mainchain. The notifier/proof system provides an abstracted interface through which Sovereign nodes can verify and validate the authenticity of data.
4. After verifying the proofs, the Incoming Transactions Processor processes the incoming transactions, and the user receives the tokens on the Sovereign Chain.

### Sovereign to MultiversX
1. User sends token to the ESDT-Safe smart contract on sovereign
2. The validators generate a proof on the Sovereign Chain for a batch of transfers, which will be sent to the mainchain ESDT-Safe contract.
3. Validators add this information to the sovereignChainBlockBody. Otherwise the block is not signed.
4. Leader will push the created txData to the mainchain
5. The ESDT-Safe contract on the mainchain verifies the proof and executes the transfers.
6. Sovereign validators notarize the completion of the transfer in the subsequent Sovereign block by receiving the attestation log event directly from the mainchain.

There are two modules implemented in the bridging mechanism inside any Sovereign Chains, [*From Sovereign*](from-sovereign.md) and [*To Sovereign*](to-sovereign.md). The source code can be found at the official [MultiversX Sovereign Chain SCs repository](https://github.com/multiversx/mx-sovereign-sc). 
