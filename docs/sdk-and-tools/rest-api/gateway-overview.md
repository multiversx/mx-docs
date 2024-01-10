---
id: gateway-overview
title: Gateway overview
---

[comment]: # (mx-abstract)

## Overview of MultiversX Gateway REST API

The MultiversX's Gateway REST API can be used by any application - dApp, desktop or server application - to interact with the Blockchain.
The Gateway is backed by the [proxy](/sdk-and-tools/proxy) and the names Gateway or Proxy are often referred as the same thing.
The difference is that `gateway` is MultiversX's infrastructure backed by the [mx-chain-proxy-go](https://github.com/multiversx/mx-chain-proxy-go) repository.

[comment]: # (mx-context-auto)

## **Proxy API vs. Observer API**

Both the **MultiversX Proxy** and the **Node (Observer)** are designed to expose (almost) the same HTTP endpoints, though **this doesn't always hold due to architectural constraints**. When describing each HTTP endpoint on the following pages, if there is any discrepancy or mismatch between the _Proxy endpoint_ and the _Observer endpoint_, this will be captured in a note as the one below:

:::important
Proxy/Gateway endpoints are referred as `https://gateway.multiversx.com/....`, while node endpoints are referred as `http://localhost:8080/....`.
:::

[comment]: # (mx-context-auto)

## **Authentication**

Currently, authentication is not needed to access the API.

[comment]: # (mx-context-auto)

## **HTTP Response format**

Each request against the MultiversX API will resolve to a JSON response having the following structure:

```
{
  "data": {
    ...
  },
  "error": "...",
  "code": "..."
}
```

That is, all responses will contain the fields `data`, `error` and `code`.

In case of a **success**, the `data` field is populated, the `error` field is empty, while the `code` field is set to `**successful**`. For example:

```
{
  "data": {
    "account": {
      "address": "erd1...",
      "nonce": 0,
      "balance": "42",
      ...
    }
  },
  "error": "",
  "code": "successful"
}
```

In the case of an **error**, the `data` field is unset, the `error` field contains a _human-readable_ description of the issue, while the `code` field is set to a both _machine_ and _human-readable_ error code. For example:

```
{
  "data": null,
  "error": "checksum failed. Expected 2rq9g5, got smsgld.",
  "code": "internal_issue"
}
```

:::important
When describing each HTTP endpoint on the following pages, the basic structure of the response is **simplified for brevity,** and, in general, only the actual payload of the response is depicted.
:::
