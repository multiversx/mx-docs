---
id: convert-existing-validator-into-staking-pool
title: Convert An Existing Validator Into A Staking Pool
---

[comment]: # (mx-context-auto)

Staking Phase 3.5 introduced the ability for an existing Validator to create a new delegation smart contract and have their validator node(s) added in the delegation smart contract directly. This is different from before, when in order to do this, a Validator node was to be unstaked, and then placed at the back of the queue. With Staking Phase 3.5, Validators can retain the place inside the 3,200 Validator nodes, and start accepting non-custodial delegations.

1. Create a new Delegation Smart Contract for an Existing Validator

Send the following transaction from the wallet you staked the Validator from:

```
Generate Contract for Validator transaction
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6
    Value: 0
    Gas Limit: 510000000
    Data: "makeNewContractFromValidatorData" +
    "@" + "<max cap>" +
    "@" + "<fee>"
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Where:
Max cap = total delegation cap in EGLD, fully denominated, in hexadecimal encoding

For example, to obtain the fully denominated form of 7231.941 EGLD, the amount must be multiplied by 10^18, resulting in 7231941000000000000000. Do not encode the ASCII string "7231941000000000000000", but encode the integer 7231941000000000000000 itself. This would result in "01880b57b708cf408000".

00 = uncapped

Fee: service fee as hundredths of percents, in hexadecimal encoding

For example, a service fee of 37.45% is expressed by the integer 3745. This integer must then be encoded hexadecimally (3745 becomes "0ea1").

After successfully deploying your new delegation smart contract, make sure you manage it with the [Delegation Manager](/validators/delegation-manager).
