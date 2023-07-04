---
id: constants
title: Constants
---
[comment]: # (mx-abstract)
MultiversX uses some constants, which are specific to each chain (Mainnet, Testnet or Devnet). The updated values can be found at these sources:

**Mainnet**:

- https://gateway.multiversx.com/network/config
- https://github.com/multiversx/mx-chain-mainnet-config

**Testnet**:

- https://testnet-gateway.multiversx.com/network/config
- https://github.com/multiversx/mx-chain-testnet-config

**Devnet**:

- https://devnet-gateway.multiversx.com/network/config
- https://github.com/multiversx/mx-chain-devnet-config

:::important
Each transaction requires a `chainID` field that represents the network's identifier. It adds protection so that transactions cannot be replayed from a network to another.
The values are:

- Mainnet: `1`
- Testnet: `T`
- Devnet: `D`
  :::

At the time of writing, the most used constants values for mainnet were:

- Round duration: 6 seconds
- Epoch duration: 14400 rounds, 24 hours
- Min gas price: 1000000000
- Min gas limit: 50000
- Chain ID: `1` (`T` for Testnet, `D` for Devnet)
- Min deposit for the creation of a system delegation smart contract: 1250 EGLD
- Min deposit for a validator: 2500 EGLD
- Number of eligible validators per shard: 400 validators
- Number of eligible validators per metachain: 400 validators
- Max number of active (eligible + waiting) validators: 3200 validators
- Consensus group size on shard: 63 validators
- Consensus group size on metachain: 400 validators
- Min deposit for staking provider: 1 EGLD
- Min deposit for legacy delegation: 10 EGLD
- Unbonding duration for legacy delegation: 144000 blocks
- Unbonding duration for staking providers: 10 epochs
- EGLD denomination: 18
