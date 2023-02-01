---
id: multiple-chains
title: Multiple chains
---

[comment]: # (mx-context-auto)

An ESDT token can be bridged between multiple chains by using the `BridgedTokensWrapper` contract.

[comment]: # (mx-context-auto)

## Support for Multiple Chains for the same token
The **BridgedTokensWrapper (6)** contract facilitates the use case of having the same token on multiple chains. It accepts the chain-specific ESDT token and mints a universal ESDT token that can be used on any application within the MultiversX network. The universal ESDT token can be converted back to the chain-specific ESDT token using the **BridgedTokensWrapper (6)** contract. This process burns the given universal tokens and sends the chain-specific ESDT tokens to the user.

Internally, the Ad-Astra Bridge system uses the **BridgedTokensWrapper (6)** contract to wrap the chain-specific tokens minted by the **MultiTransfer (5)** contract from multiple chains into a single ESDT token and sends it to the user.

When a user wants to transfer the tokens back to the source network, they must send the universal ESDT token to the **BridgedTokensWrapper (6)** contract, and the chain-specific ESDT token will be sent to the user. After this step, the user can send the chain-specific ESDT token to the **Safe (3)** contract, and the transfer will be performed as described in the previous section.
