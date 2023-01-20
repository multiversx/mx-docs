---
id: transfer-flows
title: Transfer Flows
---

### Ethereum to MultiversX
1. A user deposits the ERC20 tokens that they want to transfer to the MultiversX network on the **Safe(1)** contract.
2. The **Safe(1)** contract groups multiple deposits into batches.
3. After a certain period of time, each batch becomes final and is processed by the relayers.
4. The relayers propose, vote, and perform the transfer using the **Bridge (4)** contract with a consensus of 7/10 votes.
5. On the MultiversX network, the same amount of ESDT tokens are minted as were deposited on the Ethereum network.
6. The user receives the equivalent amount of ESDT tokens on their recipient address on the MultiversX network.

### MultiversX to Ethereum
1. A user deposits the ESDT tokens that they want to transfer back to the Ethereum network on the **Safe(3)** contract.
2. The **Safe(3)** contract groups multiple deposits into batches.
3. After a certain period of time, each batch becomes final and is processed by the relayers.
4. The relayers propose, vote, and perform the transfer using the **Bridge (2)** contract with a consensus of 7/10 votes.
5. The user receives the equivalent amount of ERC20 tokens on their recipient address on the Ethereum network.
6. On the MultiversX network, the ESDT tokens that were transferred are burned.
