---
id: overview
title: Governance - Overview
---

[comment]: # (mx-abstract)

This page provides an overview of the On-chain Governance module that will be available on the `v1.6.x` release.

[comment]: # (mx-context-auto)

## Table of contents

| Name                                                                              | Description                                                              |
|-----------------------------------------------------------------------------------|--------------------------------------------------------------------------|
| [Interacting with the on-chain governance SC](/governance/governance-interaction) | Interacting with the governance system smart contract.                   |

[comment]: # (mx-context-auto)

## Overview

The MultiversX network enables on-chain governance by issuing special types of transactions. This mechanism increases decentralization by allowing community members to directly propose and vote on changes, such as protocol upgrades or configuration adjustments.

- **Anyone** can create a proposal by paying the proposal fee and specifying:
  - a **commit hash** (unique identifier, usually a GitHub commit or spec reference)
  - a **start epoch** and an **end epoch** (the voting window).
- **Any staked user** (direct or delegated) can vote during the active period.
- Voting power is proportional to stake:  
  `voting_power = staked_value` (linear voting).

[comment]: # (mx-context-auto)

## Implementation details

### Proposals
- Each proposal requires paying a `ProposalFee` (currently **500 EGLD**).  
- If the proposal passes or fails normally, the fee is refunded to the issuer.  
- If the proposal is vetoed, the fee is slashed (transferred to the **Community Governance Pool**) or reduced by the configured `LostProposalFee`.  
- Proposals cannot be duplicated: the same commit hash cannot be submitted twice.
- Proposals can be **cancelled** by the issuer **before the voting period starts**. (introduced in v1.10.0 Barnard release)
- Lost proposal fees may either be accumulated in the governance contract (retrievable by the contract owner) or redirected to a **Community Governance Pool**, depending on configuration.  


### Voting
- There are four vote types: **Yes**, **No**, **Abstain**, and **Veto**.  
- Voting consumes gas (approx. 6 million units).  
- Voting power is derived from staked and delegated EGLD.  
- Delegation and liquid staking contracts can cast votes on behalf of users.
- Voting power is **linear** with stake: the more EGLD staked or delegated, the higher the voting power.  
- The contract tracks both **used voting power/stake** (applied in a proposal) and **total available voting power/stake** for each address.  

### Quorum and thresholds
A proposal can pass only if all conditions are met:

- **Quorum**: at least `MinQuorum%` of the total voting power must participate. (currently at least **20%** of total voting power)
- **Acceptance threshold**: YES / (YES + NO + VETO) ≥ **66.67%** (`MinPassThreshold`) 
- **Veto threshold**:  if VETO votes exceed **33%** of total participating voting power, the proposal is rejected and the proposal fee is slashed.

### Closing and cleanup
- Proposals can only be closed after the end epoch has passed.  
- Only the issuer can close their proposal.  
- Closing finalizes the outcome (passed / failed / vetoed) and unlocks the funds.  
- Expired but unclosed proposals can also be cleaned up via `clearEndedProposals` to maintain efficiency.

### Governance configuration
All thresholds and fees are defined in `GovernanceConfigV2`:
- `MinQuorum`
- `MinPassThreshold`
- `MinVetoThreshold`
- `ProposalFee`
- `LostProposalFee`
- `LastProposalNonce`

These values are set by the system and can be updated by contract owner calls.

[comment]: # (mx-context-auto)

### Example
Let's suppose we have the following addresses that cast the following votes:
- `alice`: staked value **2000 EGLD** that vote **Yes**
- `bob`: staked value **3000 EGLD** that vote **Yes**
- `charlie`: staked value **4000 EGLD** that vote **Yes**
- `delta`: staked value **1500 EGLD** that vote **No**

The totals are:
- Quorum = `(2000+3000+4000+1500) = 10,500 EGLD`  
- **Yes** = `9000 EGLD`  
- **No** = `1500 EGLD`  
- **Abstain** = `0`  
- **Veto** = `0`  

Assume:  
- total staked in the system = `20,000 EGLD`  
- `MinQuorum` = 20%  
- `MinPassThreshold` = 50%  
- `MinVetoThreshold` = 33%  

Evaluation:
- Quorum is satisfied: `10,500 > 4000`  
- Yes > No: `9000 > 1500`  
- Yes is ≥ 50% of votes: `9000 / 10,500 = 85.7%`  
- Veto is below 33%: `0 < 3465`  

To sum it all, the proposal **passes**.
