# MultiversX WebSocket Subscription API  
### Real-Time Streaming Guide (socket.io-client)

The MultiversX WebSocket Subscription API provides real-time blockchain data identical in structure to the REST API responses from:

```
https://api.multiversx.com/<resource>
https://devnet-api.multiversx.com/<resource>
https://testnet-api.multiversx.com/<resource>
```

All updates contain the same fields as their REST counterparts, and where applicable, a `<resource>Count` representing **the total number of items existing at the time the message was delivered**.

---

# 1. Selecting the Correct WebSocket Endpoint

The WebSocket endpoint depends on the network:

## **Mainnet**
You must first determine which **cluster** you are allocated to.

### 1. Call:
```
https://api.multiversx.com/websocket/config
```

### Example response:
```json
{
  "url": "socket-api-ams.multiversx.com"
}
```

Clusters may be:
- `socket-api-ams.multiversx.com`
- `socket-api-ovh.multiversx.com`

### 2. Connect using the provided cluster:
```
https://<cluster>/ws/subscription
```

---

## **Devnet**

Direct endpoint:
```
https://devnet-socket-api.multiversx.com/ws/subscription
```
(Devnet always uses the `-ovh` cluster.)

---

## **Testnet**

Direct endpoint:
```
https://testnet-socket-api.multiversx.com/ws/subscription
```
(Testnet also always uses the `-ovh` cluster.)

---

# 2. Connecting with socket.io-client

```js
import { io } from "socket.io-client";

const socket = io("https://<cluster>", {
  path: "/ws/subscription",
});
```

Replace `<cluster>` depending on the network:
- Mainnet → result from `/websocket/config`
- Devnet → `devnet-socket-api.multiversx.com`
- Testnet → `testnet-socket-api.multiversx.com`

---

# 3. Subscription Events (Overview)

Each subscription type uses a dedicated event:

| Stream | Subscribe Event | Update Event | Mirrors REST Route |
|--------|-----------------|--------------|---------------------|
| Transactions | `subscribeTransactions` | `transactionUpdate` | `/transactions` |
| Blocks | `subscribeBlocks` | `blocksUpdate` | `/blocks` |
| Pool (Mempool) | `subscribePool` | `poolUpdate` | `/pool` |
| Events | `subscribeEvents` | `eventsUpdate` | `/events` |
| Stats | `subscribeStats` | `statsUpdate` | `/stats` |

All update events return objects structured **exactly like the REST API**, plus a `<resource>Count` where applicable (`transactionsCount`, `blocksCount`, etc.).

---

# 4. Payload Structure (DTO Requirements)

Below are the fields supported for each subscription.  
All fields not listed below must NOT be sent.

### Common Notes:
- `from` is **always required** and must be `0`  
- `size` is **required** unless otherwise specified, and must be **1–50**  
- All other filters are optional

---

## 4.1 Transactions Subscription

### Event
```
subscribeTransactions
```

### Payload Fields

| Field | Optional | Description |
|-------|----------|-------------|
| from | required | Must always be 0 |
| size | required | Number of items (1–50) |
| status | optional | Filter by status |
| order | optional | ASC or DESC |
| isRelayed | optional | Filter relayed txs |
| isScCall | optional | SC calls only |
| withScResults | optional | Attach SC results |
| withRelayedScresults | optional | Attach relayed SC results |
| withOperations | optional | Include operations |
| withLogs | optional | Include logs |
| withScamInfo | optional | Include scam info |
| withUsername | optional | Include username |
| withBlockInfo | optional | Include block metadata |
| withActionTransferValue | optional | Include transfer values |
| fields | optional | Select specific fields |

### Example subscribe

```js
socket.emit("subscribeTransactions", {
  from: 0,
  size: 25
});
```

### What you receive (generic)

```
transactionUpdate:
{
  "transactions": [...],         // identical to REST API
  "transactionsCount": <number>  // total items at that moment
}
```

---

## 4.2 Blocks Subscription

### Event
```
subscribeBlocks
```

### Payload Fields

| Field | Optional |
|-------|----------|
| from | required |
| size | required |
| shard | optional |
| order | optional |
| withProposerIdentity | optional |

### Example subscribe

```js
socket.emit("subscribeBlocks", {
  from: 0,
  size: 25
});
```

### Update structure

```
blocksUpdate:
{
  "blocks": [...],         // same as REST API
  "blocksCount": <number>  // total blocks at that moment
}
```

---

## 4.3 Pool (Mempool) Subscription

### Event
```
subscribePool
```

### Payload Fields

| Field | Optional |
|--------|----------|
| from | required |
| size | required |
| type | optional |

### Example subscribe

```js
socket.emit("subscribePool", {
  from: 0,
  size: 25,
  type: "Transaction"
});
```

### Update structure

```
poolUpdate:
{
  "pool": [...],        // same as REST API
  "poolCount": <number> // total pool items at that moment
}
```

---

## 4.4 Events Subscription

### Event
```
subscribeEvents
```

### Payload Fields

| Field | Optional |
|--------|----------|
| from | required |
| size | required |
| shard | optional |

### Example

```js
socket.emit("subscribeEvents", {
  from: 0,
  size: 25
});
```

### Update structure

```
eventsUpdate:
{
  "events": [...],          // same as REST API
  "eventsCount": <number>   // total events at that moment
}
```

---

## 4.5 Stats Subscription

### Event
```
subscribeStats
```

### Payload
No payload must be sent.

### Example

```js
socket.emit("subscribeStats");
```

### Update structure

```
statsUpdate:
{
  ... same fields as GET /stats
}
```

---

# 5. Summary

- WebSocket endpoint depends on network  
  - Mainnet → determined via `GET /websocket/config`  
  - Devnet/Testnet → fixed endpoint  
- All subscriptions are made via event names (`subscribeBlocks`, etc.)  
- Payload DTOs specify required and optional fields  
- Update events return structures identical to REST API  
- `<resource>Count` always reflects **the total number of items at that exact moment**  
- Communication is done using `socket.io-client`

This document contains everything required to use MultiversX WebSocket Subscriptions effectively.
