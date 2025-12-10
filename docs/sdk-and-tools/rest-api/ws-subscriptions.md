---
id: multiversx-api-ws
title: MultiversX API WebSocket
---

## MultiversX WebSocket Subscription API

Starting with the release [v.1.17.0](https://github.com/multiversx/mx-api-service/releases/tag/v1.17.0) we introduced WebSocket Subscription functionality.

It is useful for subscribing to new events in real-time, rather than performing polling (requesting latest events with a given refresh period).

## Update Frequency and Stream Modes

The WebSocket API supports two primary modes of data consumption: **Pulse Stream** and **Filtered Stream**.

### 1. Pulse Stream (Snapshot & Loop)
Subscribers receive the most recent events for a specific timeframe at regular intervals defined by the API.
* **Behavior:** You receive an update every round (or configured interval).
* **Content:** Each update contains the latest events for the requested buffer (e.g., latest 25 blocks).
* **Duplicates:** Because of the repeating interval, **duplicate events may appear across batches**. It is the user’s responsibility to filter these duplicates.
* **Available Streams:** Transactions, Blocks, Pool, Events, Stats.

### 2. Filtered Stream (Custom Real-time Streams)
Subscribers receive events strictly as they occur on the blockchain, filtered by specific criteria.
* **Behavior:** You are notified immediately when a new event matches your filter.
* **Content:** Data flows in real-time from the moment of subscription.
* **Duplicates:** **No duplicate events are sent.** You receive each item exactly once.
* **Available Streams:** Only `Transactions` and `Events` are supported in this mode.

## Rest API models compatibility
The MultiversX WebSocket Subscription API provides real-time blockchain data identical in structure to REST API responses:

```text
[https://api.multiversx.com](https://api.multiversx.com)
[https://devnet-api.multiversx.com](https://devnet-api.multiversx.com)
[https://testnet-api.multiversx.com](https://testnet-api.multiversx.com)
```

All updates mirror REST responses and include a `<resource>Count` field representing **the total number of existing items at the moment the update was delivered**.

## Selecting the WebSocket Endpoint

Before connecting, fetch the WebSocket cluster:

### Mainnet
```text
https://api.multiversx.com/websocket/config
```

### Testnet
```text
https://testnet-api.multiversx.com/websocket/config
```

### Devnet
```text
https://devnet-api.multiversx.com/websocket/config
```

### Response example
```json
{
  "url": "socket-api-xxxx.multiversx.com"
}
```

### WebSocket endpoint
```text
https://<returned-url>/ws/subscription
```

---

## Subscription Events Overview

| Stream Type | Stream Name | Subscribe Event | Update Event | Description |
|---|---|---|---|---|
| **Pulse** | Transactions | `subscribeTransactions` | `transactionUpdate` | Recurring latest buffer |
| **Pulse** | Blocks | `subscribeBlocks` | `blocksUpdate` | Recurring latest buffer |
| **Pulse** | Pool | `subscribePool` | `poolUpdate` | Recurring mempool dump |
| **Pulse** | Events | `subscribeEvents` | `eventsUpdate` | Recurring latest events |
| **Pulse** | Stats | `subscribeStats` | `statsUpdate` | Recurring chain stats |
| **Filtered** | Custom Txs | `subscribeCustomTransactions` | `customTransactionUpdate` | Real-time filtered Txs |
| **Filtered** | Custom Events| `subscribeCustomEvents` | `customEventUpdate` | Real-time filtered Events |

---

## Pulse Stream Subscriptions

**Note:** This mode pushes the latest buffer of data repeatedly. **Duplicate events may appear across batches**, and it is the user’s responsibility to filter or handle those duplicates on their side.

### Transactions (Pulse)

#### Payload (DTO)

| Field                   | Type                                               | Required |
|-------------------------|----------------------------------------------------|----------|
| from                    | number                                             | YES      |
| size                    | number (1–50)                                      | YES      |
| status                  | `"success" \| "pending" \| "invalid" \| "fail"`    | NO       |
| order                   | `"asc" \| "desc"`                                  | NO       |
| isRelayed               | boolean                                            | NO       |
| isScCall                | boolean                                            | NO       |
| withScResults           | boolean                                            | NO       |
| withRelayedScresults    | boolean                                            | NO       |
| withOperations          | boolean                                            | NO       |
| withLogs                | boolean                                            | NO       |
| withScamInfo            | boolean                                            | NO       |
| withUsername            | boolean                                            | NO       |
| withBlockInfo           | boolean                                            | NO       |
| withActionTransferValue | boolean                                            | NO       |
| fields                  | string[]                                           | NO       |

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  const payload = { from: 0, size: 25 };

  socket.emit("subscribeTransactions", payload);

  socket.on("transactionUpdate", (data) => {
    console.log("Transactions update:", data);
  });
}

main().catch(console.error);
```

#### Update Example

```json
{
  "transactions": [
    {
      "txHash": "7f172e468e61210805815f33af8500d827aff36df6196cc96783c6d592a5fc76",
      "sender": "erd1srdxd75cg7nkaxxy3llz4hmwqqkmcej0jelv8ults8m86g29aj3sxjkc45",
      "receiver": "erd19waq9tlhj32ane9duhkv6jusm58ca5ylnthhg9h8fcumtp8srh4qrl3hjj",
      "nonce": 211883,
      "status": "pending",
      "timestamp": 1763718888
    }
  ],
  "transactionsCount": 1234567
}
```

---

### Blocks (Pulse)

#### Payload (DTO)

| Field                 | Type                | Required |
|-----------------------|---------------------|----------|
| from                  | number              | YES      |
| size                  | number (1–50)       | YES      |
| shard                 | number              | NO       |
| order                 | `"asc" \| "desc"`   | NO       |
| withProposerIdentity  | boolean             | NO       |

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  const payload = { from: 0, size: 25 };

  socket.emit("subscribeBlocks", payload);

  socket.on("blocksUpdate", (data) => {
    console.log("Blocks update:", data);
  });
}

main().catch(console.error);
```

#### Update Example

```json
{
  "blocks": [
    {
      "hash": "8576bb346bc95680f1ab0eb1fb8c43bbd03ef6e6ac8fd24a3c6e85d4c81be16b",
      "epoch": 1939,
      "nonce": 27918028,
      "round": 27933551,
      "shard": 0,
      "timestamp": 1763718906
    }
  ],
  "blocksCount": 111636242
}
```

---

### Pool (Pulse)

#### Payload (DTO)

| Field | Type                                                | Required |
|--------|-----------------------------------------------------|----------|
| from  | number                                              | YES      |
| size  | number (1–50)                                       | YES      |
| type  | `"Transaction" \| "SmartContractResult" \| "Reward"`| NO       |

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  const payload = { from: 0, size: 25, type: "Transaction" };

  socket.emit("subscribePool", payload);

  socket.on("poolUpdate", (data) => {
    console.log("Pool update:", data);
  });
}

main().catch(console.error);
```

#### Update Example

```json
{
  "pool": [
    {
      "txHash": "0b0cd3932689c6853e50ccc0f49feeb9c5f2a68858cbd213fd0825dd4bc0632b",
      "sender": "erd1jfwjg6tl87rhe73zmd5ygm8xmc9u3ys80mjvakdc7ca3kknr2kjq7s98h3",
      "receiver": "erd1qqqqqqqqqqqqqpgq0dsmyccxtlkrjvv0czyv2p4kcy72xvt3nzgq8j2q3y",
      "nonce": 1166,
      "function": "claim",
      "type": "Transaction"
    }
  ],
      "poolCount": 1902
}
```

---

### Events (Pulse)

#### Payload (DTO)

| Field | Type          | Required |
|-------|---------------|----------|
| from  | number        | YES      |
| size  | number (1–50) | YES      |
| shard | number        | NO       |

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  const payload = { from: 0, size: 25 };

  socket.emit("subscribeEvents", payload);

  socket.on("eventsUpdate", (data) => {
    console.log("Events update:", data);
  });
}

main().catch(console.error);
```

#### Update Example

```json
{
  "events": [
    {
      "txHash": "b5bde891df72e26fb36e7ab3acc14b74044bd9aa82b4852692f5b9a767e0391f-1-0",
      "identifier": "signalError",
      "address": "erd1jv5m4v3yr0wy6g2jtz2v344sfx572rw6aclum9c6r7rd4ej4l6csjej2wh",
      "timestamp": 1763718864,
      "topics": [
        "9329bab2241bdc4d21525894c8d6b049a9e50ddaee3fcd971a1f86dae655feb1",
        "4865616c7468206e6f74206c6f7720656e6f75676820666f72206c69717569646174696f6e2e"
      ],
      "shardID": 1
    }
  ],
  "eventsCount": 109432
}
```

---

### Stats (Pulse)

#### Payload (DTO)

Stats subscription does not accept any payload.

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  socket.emit("subscribeStats");

  socket.on("statsUpdate", (data) => {
    console.log("Stats update:", data);
  });
}

main().catch(console.error);
```

#### Update Example

```json
{
  "shards": 3,
  "blocks": 111636242,
  "accounts": 9126654,
  "transactions": 569773975,
  "scResults": 402596990,
  "epoch": 1939,
  "roundsPassed": 9478,
  "roundsPerEpoch": 14400,
  "refreshRate": 6000
}
```

---

## Filtered Stream Subscriptions (Custom Streams)

**Note:** These streams provide real-time data (with a small delay after the actions are committed on-chain) for specific criteria. You must provide at least one filter criteria when subscribing.

### Custom Transactions (Filtered)

Subscribes to transactions matching specific criteria (Sender, Receiver, or Function) as they happen.

#### Subscribe Event
`subscribeCustomTransactions`

#### Payload (DTO)

| Field | Type | Required | Description |
|---|---|---|---|
| sender | string | NO* | Filter by sender address (bech32) |
| receiver | string | NO* | Filter by receiver address (bech32) |
| function | string | NO* | Filter by smart contract function name |

*\*At least one field must be provided.*

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("[https://api.multiversx.com/websocket/config](https://api.multiversx.com/websocket/config)")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  // Subscribe to all transactions sent by a specific address
  const payload = { 
    sender: "erd1..." 
  };

  socket.emit("subscribeCustomTransactions", payload);

  socket.on("customTransactionUpdate", (data) => {
    // data.transactions: Transaction[]
    // data.timestampMs: number
    console.log("New Custom Transaction:", data);
  });
}
```

#### Update Example

```json
{
  "transactions": [
    {
      "txHash": "7f172e468e61210805815f33af8500d827aff36df6196cc96783c6d592a5fc76",
      "sender": "erd1srdxd75cg7nkaxxy3llz4hmwqqkmcej0jelv8ults8m86g29aj3sxjkc45",
      "receiver": "erd19waq9tlhj32ane9duhkv6jusm58ca5ylnthhg9h8fcumtp8srh4qrl3hjj",
      "nonce": 211883,
      "status": "pending",
      "timestamp": 1763718888
    }
  ],
  "timestampMs": 1763718888000
}
```

---

### Custom Events (Filtered)

Subscribes to smart contract events matching specific criteria as they happen.

#### Subscribe Event
`subscribeCustomEvents`

#### Payload (DTO)

| Field | Type | Required | Description |
|---|---|---|---|
| address | string | NO* | Filter by the address associated with the event |
| identifier | string | NO* | Filter by event identifier (name) |
| logAddress | string | NO* | Filter by the contract address that emitted the log |

*\*At least one field must be provided.*

#### Example usage

```js
import { io } from "socket.io-client";

async function main() {
  const { url } = await fetch("https://api.multiversx.com/websocket/config")
    .then((r) => r.json());

  const socket = io(`https://${url}`, { path: "/ws/subscription" });

  // Subscribe to a specific event identifier
  const payload = { 
    identifier: "swap" 
  };

  socket.emit("subscribeCustomEvents", payload);

  socket.on("customEventUpdate", (data) => {
      // data.events: Events[]
      // data.timestampMs: number
      console.log("New Custom Event:", data);
  });
}
```

#### Update Example

```json
{
  "events": [
    {
      "txHash": "b5bde891df72e26fb36e7ab3acc14b74044bd9aa82b4852692f5b9a767e0391f-1-0",
      "identifier": "signalError",
      "address": "erd1jv5m4v3yr0wy6g2jtz2v344sfx572rw6aclum9c6r7rd4ej4l6csjej2wh",
      "timestamp": 1763718864,
      "topics": [
        "9329bab2241bdc4d21525894c8d6b049a9e50ddaee3fcd971a1f86dae655feb1",
        "4865616c7468206e6f74206c6f7720656e6f75676820666f72206c69717569646174696f6e2e"
      ],
      "shardID": 1
    }
  ],
  "timestampMs": 1763718864000
}
```

---

## Unsubscribing

To stop receiving updates for any stream, you must emit the corresponding unsubscribe event.

**The Rule:**
1.  Add the prefix `un` to the subscription event name (e.g., `subscribeTransactions` → `unsubscribeTransactions`, `subscribeCustomTransactions` → `unsubscribeCustomTransactions`).
2.  Send the **exact same payload** used for the subscription.

### Example: Unsubscribe from Custom Transactions

If you subscribed with:
```js
const payload = { sender: "erd1..." };
socket.emit("subscribeCustomTransactions", payload);
```

You must unsubscribe with:
```js
socket.emit("unsubscribeCustomTransactions", payload);
```

### Example: Unsubscribe from Blocks
If you subscribed with:
```js
const payload = { from: 0, size: 25 };
socket.emit("subscribeBlocks", payload);
```

You must unsubscribe with:
```js
socket.emit("unsubscribeBlocks", payload);
```

---

## Error Handling

Unexpected behaviors, such as sending an invalid payload or exceeding the server's subscription limits, will trigger an `error` event emitted by the server.

You should listen to this event to handle failures gracefully.

### Payload (DTO)

The error object contains context about which subscription failed and why.

| Field   | Type   | Description                                                                        |
|---------|--------|------------------------------------------------------------------------------------|
| pattern | string | The subscription topic (event name) that was requested (e.g., `subscribePool`). |
| data    | object | The original payload sent by the client that caused the error.                       |
| error   | object | The specific error returned by the server.                                 |

### Example usage

```js
import { io } from "socket.io-client";

// ... setup socket connection ...

// Listen for generic errors from the server
socket.on("error", (errorData) => {
  console.error("Received error from server:");
  console.dir(errorData, { depth: null });
});
```

### Error Example

**Scenario:** The client attempts to open more subscriptions than the server allows (e.g., limit of X).

```json
{
  "pattern": "subscribePool",
  "data": {
    "from": 0,
    "size": 25,
    "type": "badInput"
  },
  "error": [
    {
      "target": {
        "from": 0,
        "size": 25,
        "type": "badInput"
      },
      "value": "badInput",
      "property": "type",
      "children": [],
      "constraints": {
        "isEnum": "type must be one of the following values: Transaction, SmartContractResult, Reward"
      }
    }
  ]
}
```

---

## Summary

- WebSocket endpoint is dynamically obtained via `/websocket/config`.
- **Pulse Stream Subscriptions:** periodic updates with possible duplicates (Transactions, Blocks, Pool, Events, Stats).
- **Filtered Stream Subscriptions:** real-time updates with only new data (CustomTransactions, CustomEvents).
- **Unsubscribing:** Use `un` prefix + same payload.
- Payload DTOs define allowed fields and required/optional rules.
- Update messages mirror REST API and include `<resource>Count` fields.
- Errors are emitted via the standard `error` event.
- Uses `socket.io-client`.

This document contains everything required to use MultiversX WebSocket Subscriptions effectively.