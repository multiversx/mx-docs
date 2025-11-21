---
id: multiversx-api-ws
title: MultiversX API WebSocket
---

# MultiversX WebSocket Subscription API  
### Real-Time Streaming Guide (socket.io-client)

The MultiversX WebSocket Subscription API provides real-time blockchain data identical in structure to REST API responses:

```
https://api.multiversx.com/<resource>
https://devnet-api.multiversx.com/<resource>
https://testnet-api.multiversx.com/<resource>
```

All updates include the same fields as REST responses, plus a `<resource>Count` representing **the total number of existing items at the moment the message was delivered**.

---

# 1. Selecting the WebSocket Endpoint

Before connecting, fetch the WebSocket cluster:

## Mainnet
```
https://api.multiversx.com/websocket/config
```

## Testnet
```
https://testnet-api.multiversx.com/websocket/config
```

## Devnet
```
https://devnet-api.multiversx.com/websocket/config
```

### Response example
```json
{
  "url": "socket-api-xxxx.multiversx.com"
}
```

### WebSocket endpoint
```
https://<returned-url>/ws/subscription
```

---

# 2. Subscription Events Overview

| Stream       | Subscribe Event       | Update Event       | Mirrors REST Route |
|--------------|------------------------|---------------------|---------------------|
| Transactions | `subscribeTransactions`| `transactionUpdate`| `/transactions` |
| Blocks       | `subscribeBlocks`      | `blocksUpdate`     | `/blocks` |
| Pool         | `subscribePool`        | `poolUpdate`       | `/pool` |
| Events       | `subscribeEvents`      | `eventsUpdate`     | `/events` |
| Stats        | `subscribeStats`       | `statsUpdate`      | `/stats` |

---

# 3. Subscriptions (Full Flows)

Each subscription includes:

1. Connect  
2. Payload (fields + types + required)  
3. Subscribe  
4. Listen  
5. Update Example  

---

# 3.1 Transactions Subscription

## Connect

```js
import { io } from "socket.io-client";

const { url } = await fetch("https://api.multiversx.com/websocket/config")
  .then(r => r.json());

const socket = io(`https://${url}`, { path: "/ws/subscription" });
```

---

## Payload (DTO)

| Field | Type | Required |
|-------|------|----------|
| from | number | YES |
| size | number (1–50) | YES |
| status | `"success" \| "pending" \| "invalid" \| "fail"` | NO |
| order | `"asc" \| "desc"` | NO |
| isRelayed | boolean | NO |
| isScCall | boolean | NO |
| withScResults | boolean | NO |
| withRelayedScresults | boolean | NO |
| withOperations | boolean | NO |
| withLogs | boolean | NO |
| withScamInfo | boolean | NO |
| withUsername | boolean | NO |
| withBlockInfo | boolean | NO |
| withActionTransferValue | boolean | NO |
| fields | string[] | NO |

---

## Subscribe

```js
socket.emit("subscribeTransactions", {
  from: 0,
  size: 25
});
```

---

## Listen

```js
socket.on("transactionUpdate", (data) => {
  console.log("Transactions update:", data);
});
```

---

## Update Example

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

# 3.2 Blocks Subscription

## Connect

```js
const { url } = await fetch("https://api.multiversx.com/websocket/config")
  .then(r => r.json());

const socket = io(`https://${url}`, { path: "/ws/subscription" });
```

---

## Payload (DTO)

| Field | Type | Required |
|-------|------|----------|
| from | number | YES |
| size | number (1–50) | YES |
| shard | number | NO |
| order | `"asc" \| "desc"` | NO |
| withProposerIdentity | boolean | NO |

---

## Subscribe

```js
socket.emit("subscribeBlocks", {
  from: 0,
  size: 25
});
```

---

## Listen

```js
socket.on("blocksUpdate", (data) => {
  console.log("Blocks update:", data);
});
```

---

## Update Example

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

# 3.3 Pool Subscription

## Connect

```js
const { url } = await fetch("https://api.multiversx.com/websocket/config")
  .then(r => r.json());

const socket = io(`https://${url}`, { path: "/ws/subscription" });
```

---

## Payload (DTO)

| Field | Type | Required |
|--------|------|----------|
| from | number | YES |
| size | number (1–50) | YES |
| type | `"Transaction" \| "SmartContractResult" \| "Reward"` | NO |

---

## Subscribe

```js
socket.emit("subscribePool", {
  from: 0,
  size: 25,
  type: "Transaction"
});
```

---

## Listen

```js
socket.on("poolUpdate", (data) => {
  console.log("Pool update:", data);
});
```

---

## Update Example

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

# 3.4 Events Subscription

## Connect

```js
const { url } = await fetch("https://api.multiversx.com/websocket/config")
  .then(r => r.json());

const socket = io(`https://${url}`, { path: "/ws/subscription" });
```

---

## Payload (DTO)

| Field | Type | Required |
|--------|------|----------|
| from | number | YES |
| size | number (1–50) | YES |
| shard | number | NO |

---

## Subscribe

```js
socket.emit("subscribeEvents", {
  from: 0,
  size: 25
});
```

---

## Listen

```js
socket.on("eventsUpdate", (data) => {
  console.log("Events update:", data);
});
```

---

## Update Example

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

# 3.5 Stats Subscription

## Connect

```js
const { url } = await fetch("https://api.multiversx.com/websocket/config")
  .then(r => r.json());

const socket = io(`https://${url}`, { path: "/ws/subscription" });
```

---

## Payload (DTO)

Stats does not accept payload.

---

## Subscribe

```js
socket.emit("subscribeStats");
```

---

## Listen

```js
socket.on("statsUpdate", (data) => {
  console.log("Stats update:", data);
});
```

---

## Update Example

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

# 4. Summary

- WebSocket endpoint is dynamically obtained via `/websocket/config`
- Each stream has its own subscribe and update events
- Payload DTOs enforce strict field validation
- Update messages mirror REST API routes
- `<resource>Count` always reflects **total items at that moment**
- Uses `socket.io-client`

This document contains everything required to use MultiversX WebSocket Subscriptions effectively.
