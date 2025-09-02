---
id: governance-interaction
title: Governance interaction
---

[comment]: # (mx-context-auto)

### Introduction

The interaction with the governance system smartcontract is done through correctly formatted transactions to submit actions and through the usage of the vm-query REST API calls for reading the proposal(s) status.

[comment]: # (mx-context-auto)

### Creating a proposal

The proposal creation transaction has the following parameters:

```rust
GovernanceProposalTransaction {
    Sender: <account address of the wallet that creates the proposal>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla
    Value: 1000 EGLD
    GasLimit: 51000000
    Data: "proposal" +
          "@<identifier>" +
          "@<starting epoch in hex format>" +
          "@<ending epoch in hex format>"
}
```

The proposal identifier is a hex string containing exactly 40 characters. Usually, this can be a git commit hash on which the proposal is made but can be any other identifier string.  

The starting & ending epochs should be an even-length hex string containing the starting epoch and the ending epoch. During this time frame the votes can be cast.

After issuing the proposal, there is a log event generated having the `proposal` identifier that will contain the following encoded topics:

- `nonce` as encoded integer which uniquely identifies the proposals 
- `identifier` the provided 40 hex characters longs identifier
- `start epoch` as encoded integer for the starting epoch
- `end epoch` as encoded integer for the ending epoch

[comment]: # (mx-context-auto)

### Voting a proposal using the direct staked or delegation-system amount

Any wallet that has staked EGLD (either direct staked or through the delegation sub-system) can cast a vote for a proposal.
```rust
GovernanceVoteTransaction {
    Sender: <account address of the wallet that will vote the proposal>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla
    Value: 0 EGLD
    GasLimit: 6000000
    Data: "vote" +
          "@<nonce>" +
          "@<vote_type>"
}
```

The `nonce` is the hex encoded value of the proposal's unique nonce and the `vote_type` can be one of the following values:
- for **Yes**: `796573`;
- for **No**: `6e6f`;
- for **Abstain**: `6162737461696e`;
- for **Veto**: `7665746f`.

The vote value for the account that will vote a proposal is the sum of all staked values along with the sum of all delegated values in the delegation sub-system. 

[comment]: # (mx-context-auto)

### Voting a proposal through smart contracts (delegation voting)

Whenever we deal with a smart contract that delegated through the delegation sub-system or owns staked nodes it is the out of scope of the metachain's governance contract to track each address that sent EGLD how much is really staked (if any EGLD is staked).
That is why we offered an endpoint to the governance smart contact that can be called **only by a shard smart contract** and the governance contract will record the address provided, the vote type and vote value.
This is very useful whenever implementing liquid-staking-like smart contracts. The liquid-staking contract knows the balance for each user, so it will delegate the call to the governance contract providing the value.

:::important
The maximum value for the staked value & the voting power for the liquid-staking contract is known by the governance contract, so it can not counterfeit the voting. If, due to a bug the liquid-staking contract allows, for example, for a user to vote with a larger quota, the liquid-staking contract will deplete its maximum allowance making other voting transactions (on his behalf) to fail.
:::

```rust
GovernanceVoteThourghDelegationTransaction {
    Sender: <smart contract address>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla
    Value: 0 EGLD
    GasLimit: 51000000
    Data: "delegateVote" +
          "@<nonce>" +
          "@<vote_type>" +
          "@<account address handled by the smart contract>" + 
          "@<vote_balance>" 
}
```

The `nonce` is the hex encoded value of the proposal's unique nonce and the `vote_type` can be one of the following values:
- for **Yes**: `796573`;
- for **No**: `6e6f`;
- for **Abstain**: `6162737461696e`;
- for **Veto**: `7665746f`.

The `account address handled by the smart contract` is the address handled by the smart contract that will delegate the vote towards the governance smart contract. This address will be recorded for casting the vote.
The `vote_balance` is the amount of stake the address has in the smart contract. The governance contract will "believe" that this is the right amount as it impossible to verify the information. The balance will diminish the total voting power the smart contract has. 

[comment]: # (mx-context-auto)

### Closing a proposal

A proposal can be closed only in an epoch that is strictly higher than the end epoch value provided when the proposal was opened.  
Closing can only be performed by the account that created the proposal (the issuer).

```rust
CloseProposalTransaction {
    Sender:   <account address of the wallet that created the proposal>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla
    Value:    0 EGLD
    GasLimit: 51000000
    Data:     "closeProposal" +
              "@<nonce>"
}
```
#### Rules for closing
- Only the issuer can call `closeProposal`.  
- If the proposal **passes** → the full proposal fee is refunded.  
- If the proposal **fails** or is **vetoed** → the refund is reduced by the `LostProposalFee`.  
- Once a proposal is closed, it cannot be reopened.
- Closing also finalizes the vote tally (the proposal is marked as `Passed` or not, based on the results).

 
[comment]: # (mx-context-auto)

### Querying the status of a proposal

The status of any proposal can be queried at any time through `vm-values/query` REST API endpoints provided by the gateway/API.

```bash
https://<gateway>.multiversx.com/vm-values/query
```

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla",
  "funcName": "viewProposal",
  "args": ["<nonce-hex>"]
}
```

- The argument `nonce` is the proposal nonce in hex format.
- The response will contain the following json definition where all fields are base64-encoded:

```json
{
  "returnData": [
    "<proposal_cost>", (amount locked by proposer)
    "<commit_hash>", (unique identifier of the proposal)
    "<nonce>", (proposal number)
    "<issuer_address>", (address of the proposer)
    "<start_epoch>", (epoch when voting starts)
    "<end_epoch>", (epoch when voting ends)
    "<quorum_stake>", (current quorum stake: sum of stake that participated)
    "<yes_votes>", (total stake voting YES)
    "<no_votes>", (total stake voting NO)
    "<veto_votes>", (total stake vetoing the proposal)
    "<abstain_votes>", (total stake abstaining)
    "<proposal_closed true|false>",
    "<proposal_passed true|false>"
  ]
}
```

Example response:
```json
{
  "returnData": [
    "NjXJrcXeoAAA", (proposal locked amount: 1000 EGLD denominated = 1000 * 10^18)
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABg==", (commit hash: 0x0000...006)
    "AQ==", (nonce: 1)
    "aj88GtqHy9ibm5ePPQlG4aqLhpgqsQWygoTppckLa4M=", (proposer address)
    "bQ==", (starting epoch: 109)
    "bg==", (ending epoch: 110)
    "ntGU2xmyOMAAAA==", (quorum: 7,500,000 EGLD denominated)
    "", (yes votes: 0)
    "", (no votes: 0)
    "ntGU2xmyOMAAAA==", (veto votes: 7,500,000 EGLD denominated)
    "", (abstain votes: 0)
    "dHJ1ZQ==", (proposal closed: true)
    "ZmFsc2U=" (proposal passed: false)
  ]
}



[comment]: # (mx-context-auto)

### Querying an address voting status (direct staking or system delegation)

The voting status of a certain address can be queried at any time by using the `vm-values/query` REST API endpoints provided by the gateway/API.

```bash
https://<gateway>.multiversx.com/vm-values/query
```

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla",
  "funcName": "viewDelegatedVoteInfo",
  "args": ["<proposal_nonce-hex>", "<address>"]
}
```

- `proposal_nonce` → the proposal identifier (nonce, hex-encoded).  
- `address` → the bech32 address of the account to check.  

> **Note:** The older function `viewUserVoteHistory` (which returned lists of proposal nonces) is now considered legacy.  
> Use `viewDelegatedVoteInfo` for detailed voting power and stake information.

The response will contain the following json definition where all fields are base64-encoded:

```json
{
  "returnData": [
    "<used_power>", (voting power already used by this address on the proposal)
    "<used_stake>", (stake associated with the used power)
    "<total_power>", (total available voting power for the address)
    "<total_stake>" (total stake considered in governance for the address)
  ]
}
```

Example for an address that voted:
```json
{
  "returnData": [
    "Cg==", (used power: 10)
    "ZAA=", (used stake: 100)
    "A+g=", (total power: 1000)
    "Gg4M=", (total stake: 10000)
  ]
}
```
In this example, the queried address voted on this proposal with **100 stake**, which translated into **10 voting power**. The proposal overall had **10000 total stake** and **1000 total voting power** recorded.

Example for an address that did not vote:
```json
{
  "returnData": [
    "AA==", (used power: 0)
    "AA==", (used stake: 0)
    "A+g=", (total power: 1000)
    "Gg4M=", (total stake: 10000)
  ]
}
```
