---
id: governance-interaction
title: Governance interaction
---

[comment]: # (mx-context-auto)

## Introduction

The interaction with the governance system smartcontract is done through correctly formatted transactions to submit actions and through the usage of the vm-query REST API calls for reading the proposal(s) status.

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

The `account address handled by the smart contract` is the address is handled by the smart contract that will delegate the vote towards the governance smart contract. This address will be recorded that cast the vote.
The `vote_balance` is the amount of stake the address has in the smart contract. The governance contract will "believe" that this is the right amount as it impossible to verify the information. The balance will diminish the total voting power the smart contract has. 

### Closing a proposal

A proposal can be closed only in an epoch that is strictly higher than the end epoch value provided when the proposal was open.

```rust
CloseProposalTransaction {
    Sender: <account address of the wallet that created the proposal>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla
    Value: 0 EGLD
    GasLimit: 51000000
    Data: "closeProposal" +
          "@<nonce>"
}
```

Only the address that created the proposal can call the `closeProposal` function that will also trigger the funds unlocking. As stated in the overview page, if the proposal do not pass, the amount returned will be less with 10 EGLD.

### Querying the status of a proposal

The status of a certain proposal can be queried at any time by using the `vm-values/query` REST API endpoints provided by the gateway/API.

```bash
https://<gateway>.multiversx.com/vm-values/query
```

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla",
  "funcName": "viewProposal",
  "args": ["<nonce>"]
}
```

the `nonce` represents the proposal nonce in hex format. The response will contain the following json definition where all fields are base64-encoded:

```json
{
  "returnData": [
    "<proposal_cost>",
    "<commit_hash>",
    "<nonce>",
    "<account address of the wallet that created the proposal>",
    "<starting epoch>",
    "<ending epoch>",
    "<quorum stake>",
    "<yes_value>",
    "<no_value>",
    "<veto_value>",
    "<abstain_value>",
    "<proposal_closed true|false>",
    "<proposal_passed true|false>"
  ]
}
```

Example:
```json
{
  "returnData": [
    "NjXJrcXeoAAA", (proposal locked amount: 1000 EGLD denominated = 1000 * 10^18)
    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABg==", (commit hash: 0x0000...006)
    "AQ==", (nonce: 1)
    "aj88GtqHy9ibm5ePPQlG4aqLhpgqsQWygoTppckLa4M=", (address: erd1dglncxk6sl9a3xumj78n6z2xux4ghp5c92cstv5zsn56tjgtdwpsk46qrs)
    "bQ==", (starting epoch: 109)
    "bg==", (ending epoch: 110)
    "ntGU2xmyOMAAAA==", (quorum: 750000 EGLD = 7500000 * 10^18)
    "", (yes value: 0)
    "", (no value: 0)
    "ntGU2xmyOMAAAA==", (veto value: 7500000 * 10^18)
    "", (abstain value: 0)
    "dHJ1ZQ==", (proposal closed: true)
    "ZmFsc2U=" (proposal passed: false)
  ]
}
```


### Querying an address voting status (direct staking or system delegation)

The voting status of a certain address can be queried at any time by using the `vm-values/query` REST API endpoints provided by the gateway/API.

```bash
https://<gateway>.multiversx.com/vm-values/query
```

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqrlllsrujgla",
  "funcName": "viewUserVoteHistory",
  "args": ["<address>"]
}
```

the `address` represents the address in hex format. The response will contain the following json definition where all fields are base64-encoded:

```json
{
  "returnData": [
    "<the number of delegated nonces>",
    "<delegated nonce 0>",
    "<delegated nonce 1>",
    ...
    "<delegated nonce n>",
    "<the number of direct nonces>",
    "<direct nonce 0>",
    "<direct nonce 1>",
    ...
    "<direct nonce m>"
  ]
}
```

Example for an address that cast votes on 5 proposals:
```json
{
  "returnData": [
    "Aw==", (number of delegated nonces: 3)
    "AQ==", (nonce: 1)
    "Ag==", (nonce: 2)
    "Aw==", (nonce: 3)
    "Ag==", (number of direct nonces: 2)
    "BA==", (nonce: 4)
    "BQ==", (nonce: 5)
  ]
}
```

Example for an address that did not cast votes on any proposals:
```json
{
  "returnData": [
    "AA==", (number of delegated nonces: 0)
    "AA==", (number of direct nonces: 0)
  ]
}
```