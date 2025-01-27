---
id: architecture
title: Architecture
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

[comment]: # (mx-abstract)

# Architecture

Ad-Astra Bridge is a system that allows the transfer of ERC20 tokens between EVM-compatible chains and the MultiversX network.
Currently, there are 2 bridges available: between the Ethereum and MultiversX networks and between the BSC and MultiversX networks.
The system is composed of several contracts and relayers that work together to facilitate the transfer of tokens.

Without entering too many details regarding the smart-contracts interactions, this is a simplified view of the entire bridge architecture.\

<!--- source file reference: /static/xbridge/xbridge-dark/light.drawio --->
<ThemedImage
    alt="Bridge general architecture overview"
    sources={{
        light: useBaseUrl('/xbridge/general-architecture-light.png'),
        dark: useBaseUrl('/xbridge/general-architecture-dark.png'),
    }}
/>

[comment]: # (mx-context-auto)

## EVM-compatible chains contracts
The repository for the Solidity contracts used on the EVM-compatible side can be found here: https://github.com/multiversx/mx-bridge-eth-sc-sol
The main contracts are described below:
1. **Safe**: A contract that allows users to deposit ERC20 tokens that they want to transfer to the MultiversX network;
2. **Bridge**: A contract that facilitates the transfer of tokens from MultiversX to an EVM-compatible chain. Only the relayers are allowed to use this contract.

[comment]: # (mx-context-auto)

## MultiversX contracts
The repository for the Rust contracts used on the MultiversX side can be found here: https://github.com/multiversx/mx-bridge-eth-sc-rs
1. **Safe**: A contract that allows users to deposit ESDT tokens that they want to transfer to EVM-compatible networks;
2. **Bridge**: A contract that facilitates the transfer of tokens from the EVM-compatible chain to MultiversX. As the Bridge contract on the EVM-compatible chain side, this
   the contract is allowed to be operated by the registered relayers;
3. **MultiTransfer**: A helper contract that is used to perform multiple token transfers at once;
4. **BridgedTokensWrapper**: A helper contract that is used to support wrapping the same token from multiple chains into a single ESDT token;
5. **BridgeProxy**: A helper contract that is used to store and handle the smart contract execution and the possible refund operation after the swap is done.

[comment]: # (mx-context-auto)

## Relayers
The repository for the code that the relayers use can be found here: https://github.com/multiversx/mx-bridge-eth-go

For each existing bridge, the following list applies:
- **5 Relayers** are managed by the MultiversX Foundation;
- **5 Relayers** are distributed to the MultiversX validators community, with each validator having one relayer.
