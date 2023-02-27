---
id: contract-api-limits
title: MultiversX Smart Contracts API limits
---

[comment]: # (mx-abstract)

## MultiversX Smart Contracts API limits

Starting with the release v1.4.8, we have added maximum API limits that a Smart Contract can make towards the
node's API. These limits are set in the gas schedule files in the `MaxPerTransaction` section. For example, this 
gas schedule file https://github.com/multiversx/mx-chain-mainnet-config/blob/master/gasSchedules/gasScheduleV7.toml has the following limits:

```toml
[MaxPerTransaction]
    MaxBuiltInCallsPerTx = 100
    MaxNumberOfTransfersPerTx = 250
    MaxNumberOfTrieReadsPerTx = 1500
```

which translates to:
* each transaction can make a maximum 100 built-in functions calls, such as "get last nonce", "get last randomness", "ESDT unpause", "ESDT NFT create" and so on;
* each transaction can create maximum 250 transfers (as in produced smart contract results). For example, a call  to "ESDT NFT transfer" will create 1 
smart contract results and a call to "multi ESDT NFT transfer" will consume the number of transfers defined in the function call;
* each transaction can access its data trie for a maximum 1500 get operations (can read a maximum 1500 values stored in the contract).

These limits are subject to change, a new release can activate a new gas schedule at a defined epoch.