---
id: architecture
title: Architecture
---

Ad-Astra Bridge is a system that allows for the transfer of ERC20 tokens between the Ethereum and MultiversX networks. The system is composed of several contracts and relayers that work together to facilitate the transfer of tokens.

## Ethereum Contracts
- **Repo**: https://github.com/multiversx/mx-bridge-eth-sc-sol
- **Safe (1)**: A contract that allows users to deposit ERC20 tokens that they want to transfer to the MultiversX network.
- **Bridge(2)**: A contract that facilitates the transfer of tokens from Ethereum to MultiversX.

## MultiversX Contracts
- **Repo**: https://github.com/multiversx/mx-bridge-eth-sc-rs
- **Safe (3)**: A contract that allows users to deposit ESDT tokens that they want to transfer to the Ethereum network.
- **Bridge (4)**: A contract that facilitates the transfer of tokens from MultiversX to Ethereum.
- **MultiTransfer (5)**: A helper contract that is used to perform multiple token transfers at once.
- **BridgedTokensWrapper (6)**: A helper contract that is used to support wrapping the same token from multiple chains into a single ESDT token.

## Relayers
- **Repo**: https://github.com/multiversx/mx-bridge-eth-go
- **5 Relayers**: Managed by the MultiversX Foundation.
- **5 Relayers**: Distributed to the MultiversX validators community, with each validator having one relayer.

