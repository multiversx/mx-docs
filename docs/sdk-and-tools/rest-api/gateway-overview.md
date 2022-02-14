---
id: gateway-overview
title: Gateway overview
---

## Overview of Elrond Gateway Rest API

The Elrond's Gateway REST API can be used by any application - dApp, desktop or server application - to interact with the Blockchain.
The Gateway is backed by the [proxy](/sdk-and-tools/proxy) and the names Gateway or Proxy are often referred as the same thing.
The difference is that `gateway` is Elrond's infrastructure backed by the [elrond-proxy-go](https://github.com/ElrondNetwork/elrond-proxy-go) repository.

## **Proxy API vs. Observer API**

Both the **Elrond Proxy** and the **Node (Observer)** are designed to expose the same HTTP endpoints, though **this doesn't always hold due to architectural constraints**. When describing each HTTP endpoint on the following pages, if there is any discrepancy or mismatch between the _Proxy endpoint_ and the _Observer endpoint_, this will be captured in a note as the one below:

:::important
`**example/endpoint**` is only available on the Elrond Proxy.
:::

## **Authentication**

Currently, authentication is not needed to access the API.

## **HTTP Response format**

Each request against the Elrond API will resolve to a JSON response having the following structure:

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

## **REST Client playground**

If you wish to rapidly test the API endpoints we have created some [playground files](https://github.com/ElrondNetwork/elrond-sdk/tree/master/proxy-playground) for [Visual Studio Code REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client). These files contain examples for using the API.
