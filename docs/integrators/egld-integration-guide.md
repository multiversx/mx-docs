---
id: egld-integration-guide
title: EGLD integration guide
---

This section provides high-level technical requirements of integrating the MultiversX's (previously Elrond) native coin, EGLD in a platform that handles EGLD transactions for their users.

## Overview

In order to make possible for a platform to integrate EGLD transactions for its users, these are the minimum requirements:

- [setting up an observing squad](/integrators/observing-squad)
- [setting up a mechanism for accounts management](/integrators/accounts-management)
- [setting up a mechanism for creating and signing transactions](/integrators/creating-transactions)
- [setting up a mechanism that queries the blockchain for new transactions to process](/integrators/querying-the-blockchain/#querying-hyperblocks-and-fully-executed-transactions)

## Integration workflow

An integration could mean an automatic system that parses all the transactions on the chain and performs different
actions when an integrator's address is the sender or receiver of the transaction. Based on that, it should be able
to sign transactions or update the user's balance internally. Also, different things such as hot wallets can be
integrated as well for a better tokens management and less EGLD spent on gas.

In order to summarize the information and bring all the pieces together, this section will provide an example of how an integration can look:

### 1. Observing squad running

The integrator has an observing squad (an observer on each shard + proxy) running and synced.

### 2. Getting hyperblock by nonce

The system should always memorize the last processed nonce. After processing a hyperblock at a given nonce, it should
move on to the hyperblock that corresponds to the next nonce (when available, if not already existing).

In order to fetch the hyperblock for a given nonce, the system should perform an API call to `<proxy-url>/hyperblock/by-nonce/<nonce>`.

If the response contains an error, it probably means that the nonce isn't yet processed on the chain and a retry should be done after a small waiting period.

:::tip
A round in the blockchain is set to 6 seconds, so the nonce should change after a minimum of 6 seconds.
A good refresh interval for nonce-changing detection could be 2 seconds.
:::

#### 2.1. Fallback mechanism

If, for example, a server issue occurs and the observing squad gets stuck, the latest processed nonce must be saved
somewhere so when the observing squad is back online, the system should continue processing from the next nonce after the saved one.

#### 2.2. Example

For example, when the system is up, it should start processing from a nonce in the same epoch. Let's say the chain is in epoch
5 and the first hyperblock nonce in that epoch is 900

```
...
-> fetched hyperblock with nonce 900
-> processed hyperblock with nonce 900
-> saved last processed nonce = 900
-> waiting 2 seconds
-> fetching hyperblock with nonce 901: API error (nonce not yet processed on chain side), skip
-> waiting 2 seconds
-> fetching hyperblock with nonce 901: API error (nonce not yet processed on chain side), skip
-> waiting 2 seconds
-> fetched the hyperblock with nonce 901
-> processed hyperblock with nonce 901
-> saved last processed nonce = 901
-> waiting 2 seconds
...
```

:::warning
Keep in mind that a hyperblock shouldn't be processed twice as this might cause issues.
Make sure the block processing and the saving of the last processed nonce should be atomic.
:::

#### 2.3. Querying the transactions

The system fetches the response and iterates over each successful transaction and determine if any address from the integrator is involved.

### 3. Transaction handling

After identifying a relevant transaction in step 2.3 (the sender or the receiver is an integrator's address) actions could be taken on integrator's side.

It is recommended that the integrator performs some balances checks before triggering internal transfers.

For example, if the receiver is an integrator's address, the integrator can update its balance on internal storage systems.

### Mentions

- steps 2 and 3 should be executed in a continuous manner while always keeping record of the last processed nonce, in order to ensure
  that no transaction is skipped.
- other usual actions such as transferring (from time to time) all addresses funds to a hot wallet could also be implemented.

## Finality of the transactions / number of confirmations

The hyperblock includes only finalized transactions so only one confirmation is needed. The integrator however has the flexibility to wait for any number of additional confirmations.

## Balances check

From time to time, or for safety reasons before performing a transaction, an integrator would want to check the balance of some
addresses. This can be performed via [Get address balance endpoint](/sdk-and-tools/rest-api/addresses#get-address-balance).

## Useful tools and examples

MultiversX (previously Elrond) SDKs or tools can be used for signing transactions and performing accounts management.

A complete list and more detailed information can be found on the [accounts management](/integrators/accounts-management) and
[signing transaction](/integrators/creating-transactions) sections.

There is also an example that matches the above-presented workflow and can be found on the Go SDK for MultiversX (previously Elrond), [erdgo](https://github.com/ElrondNetwork/elrond-sdk-erdgo/tree/main/examples/examplesFlowWalletTracker).

However, other SDKs can be used as well for handling accounts management or transaction signing.
