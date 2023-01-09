---
id: merge-validator-delegation-sc
title: Merging A Validator Into An Existing Delegation Smart Contract
---

Introduced in Staking Phase 3.5, the ability of merging one or more existing standalone validator node into a staking pool gives more flexibility for staking pool operators.

There are two steps required for this action: The owner of the Delegation SC has to whitelist the wallet from which the Merging Validator was staked from. Then the Merging Validator has to send the merge transaction from the whitelisted wallet.

1. Merging a Validator into an Existing Delegation Smart Contract

From the Delegation Smart Contract owner's wallet, send a transaction with the following parameters:

```rust
Whitelist Wallet For Merging
    Sender: <account address that owns the delegation smart contract>
    Receiver: <delegation smart contract address>
    Value: 0
    Gas Limit: 5000000
    Data: "whitelistForMerge" +
    "@" + "<Merging Validator wallet address in HEX format>"
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

:::tip
You can obtain the HEX format of an address by first converting its bech32 (erd1...) form into binary, and then converting the resulting binary into HEX.
:::

2. The Merging Validator sends the merge transaction from the whitelisted wallet:

```rust
To: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6
Value: 0
Gas limit: 510000000
Data: mergeValidatorToDelegationWithWhitelist@<the Delegation SC address in HEX format>
```

```rust
Whitelist Wallet For Merging
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6
    Value: 0
    Gas Limit: 510000000
    Data: "mergeValidatorToDelegationWithWhitelist" +
    "@" "<the Delegation SC address in HEX format>"
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

:::warning
We advise against using this method to buy or sell validator slots - it requires the transfer of private keys (validatorKey.pem) which can't be changed. This puts the buyer at risk of slashing, should the seller deploy a node with the same key, either intentionally or by mistake.
:::
