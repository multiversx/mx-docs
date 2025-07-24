---
id: iterate-keys
title: Iterate keys
---

[comment]: # (mx-abstract)

## Overview

Retrieving all storage keys for an account can be resource-intensive if the account has many entries. The `/address/iterate-keys` endpoint allows clients to efficiently iterate through all key-value pairs in an account's data trie, fetching them in batches and resuming from a checkpoint using an iterator state. This is especially useful for large accounts or when paginating through storage.

If you need to ensure consistency across multiple requests (e.g., if the account might change), use the `?blockNonce={blockNonce}` query parameter to lock iteration to a specific trie root.

:::warning
This endpoint will only work if the node's `config.toml` file has the following setting enabled:

```
[TrieLeavesRetrieverConfig]
    Enabled = true
```
:::

[comment]: # (mx-context-auto)

## Endpoint Details

- **Method:** POST
- **Path:** `/address/iterate-keys`
- **Optional:** `/address/iterate-keys?blockNonce={blockNonce}`

### Request Body

| Field          | Type   | Description                                                                                       |
| -------------- | ------ | --------------------------------------------------------------------------------------------------|
| `address`      | string | Address of the account whose storage keys you want to iterate.                                    |
| `numKeys`      | int    | Number of keys to retrieve in this batch. If 0, retrieves as many as possible until timeout.      |
| `iteratorState`| array  | Set to empty array for the first request, or use the value from the previous response to resume.  |

#### Example First Request

```json
{
  "address": "erd1...",
  "numKeys": 100,
  "iteratorState": []
}
```

#### Example Subsequent Request

```json
{
  "address": "erd1...",
  "numKeys": 100,
  "iteratorState": [
            "QTyP0ZbUPao3dJiNhdduVDc2GlJO5XNSljRJS2lpF00EBg==",
            "F6Wc4zEhjoS2cpcmb4h4tH+8hNHwbez/mskIzpKr7ooF",
            "qE7Onkq+OYx9bCx2OPRl5GUIE3iqqA0I+hC7E35+2EwG",
            "eNu9LmbWHS5cjjaONCn3oc22+9H/hc2rvjHdJVLb9p8H",
            "9ikE6F470N3x4UxfSnXpqM6ATHUpdAAk7TwNEziXD5QI",
            "pymZnCzkTZ91cKFLTUlY0S5du5deg3CJXcR/jZR9gDUJ",
            "dK7SeJcCggBlkhKoQpfLbbQ1RkwRgDENK8YhjUu71HcK",
            "pYbrJttg/Cqzxko2IyqVWLeEiY1ScLYjPiVdqNX1PFcL",
            "vTuXGEd5YBqLX/bwG9rOhb+Ect25N5IIEgHR8TMklL4M",
            "MXbChMP5migm07zByj85+h3EZorzDwj4A0lRcNBIV1QO",
            "wq+g7t7WX/6bEcxZhGvQlIfgJxzY/gK2BR/IDjBVYw8P"
  ]
}
```


### Response Body

| Field                   | Type                | Description                                                                 |
|-------------------------|---------------------|-----------------------------------------------------------------------------|
| `data.blockInfo`        | object              | Information about the block (nonce, hash, rootHash).                        |
| `data.newIteratorState` | array \| null       | Array of strings if more data remains, or null if iteration is complete.    |
| `data.pairs`            | object              | Key-value pairs (hex-encoded) retrieved in this batch.                      |
| `error`                 | string              | Error message, if any.                                                      |
| `code`                  | string              | Status code, e.g., "successful".                                            |

#### Example Response (more data to fetch)

```json
{
  "data": {
    "blockInfo": {
      "nonce": 141738,
      "hash": "f7fd9ee6a3a24ab63c30f2a7c9df360d8e1d367aed52b43ec527bfd6aa8eae35",
      "rootHash": "96bb085e08cec47a45df37ed07abd6ed2e22fdeeb5192a6a2bb624cb8c18b3e1"
    },
    "newIteratorState": [
      "JZWO0TF7sEredrzrZQ3aSj40w29valylR4GHv65qiBoADw==",
      "WrN0877/4OOj2muLRNNhXbSB7wBpSKVqHJRhiinqOuQB",
      "4WECDX5h4NSKqdG4KOJgOdlbmbKMOYDc0GmUPH7ALoUC",
      "j+j5EIMbiE6VXkRRarus5AMImhC4eo6HIb7SBNga9VMD",
      "kR1nAJ1HXgc1OKnuJOu2U4qlGVx90zTiiFzvvyTBZ2AE",
      "F6Wc4zEhjoS2cpcmb4h4tH+8hNHwbez/mskIzpKr7ooF",
      "qE7Onkq+OYx9bCx2OPRl5GUIE3iqqA0I+hC7E35+2EwG",
      "eNu9LmbWHS5cjjaONCn3oc22+9H/hc2rvjHdJVLb9p8H",
      "9ikE6F470N3x4UxfSnXpqM6ATHUpdAAk7TwNEziXD5QI",
      "pymZnCzkTZ91cKFLTUlY0S5du5deg3CJXcR/jZR9gDUJ",
      "dK7SeJcCggBlkhKoQpfLbbQ1RkwRgDENK8YhjUu71HcK",
      "pYbrJttg/Cqzxko2IyqVWLeEiY1ScLYjPiVdqNX1PFcL",
      "vTuXGEd5YBqLX/bwG9rOhb+Ect25N5IIEgHR8TMklL4M",
      "MXbChMP5migm07zByj85+h3EZorzDwj4A0lRcNBIV1QO",
      "wq+g7t7WX/6bEcxZhGvQlIfgJxzY/gK2BR/IDjBVYw8P"
    ],
    "pairs": {
      "454c524f4e4465736474415745534f4d452d313632623032": "0403",
      "454c524f4e4465736474415745534f4d452d383831343636": "0403"
      // ... more key-value pairs ...
    }
  },
  "error": "",
  "code": "successful"
}
```

#### Example Response (iteration complete)

```json
{
  "data": {
    "blockInfo": {
      "nonce": 112594,
      "hash": "f26e9d8c00d7a56c071989d14544e0c3431eb33956854ce780374d8c08b4aa9f",
      "rootHash": "75c50f6913d4badb9635235f9dafc7eb14ce14406f8c59d05838ff25021c009f"
    },
    "newIteratorState": null,
    "pairs": {
      "454c524f4e446573647446554e4749424c452d326562313837": "0401"
    }
  },
  "error": "",
  "code": "successful"
}
```

[comment]: # (mx-context-auto)

## Usage Notes

- The `pairs` object contains hex-encoded keys and values. Decode as needed.
- Always pass `newIteratorState` as-is in your next request's `iteratorState` field to continue iteration.
- When `newIteratorState` is null, all keys have been retrieved.
- If `iteratorState` is an empty array (`[]`) in the request, iteration starts from the beginning of the trie.
- If `numKeys` is 0, the server will return as many keys as possible until all are retrieved or until the `TrieOperationsDeadlineMilliseconds` timeout is reached.
- If retrieving `numKeys` takes more time than the timeout, the request will return the keys collected up to that point.
- Use `?blockNonce={blockNonce}` to ensure all requests iterate the same trie root, even if the account changes between requests.

[comment]: # (mx-context-auto)

## Example Usage

1. **Initial Request:**
   - Send a POST with `iteratorState` as an empty array and desired `numKeys` (or 0 for maximum batch).
2. **Subsequent Requests:**
   - Use the `newIteratorState` from the previous response to fetch the next batch. Pass it as-is.
   - Optionally, provide `blockNonce` to ensure consistency if the account may change.
3. **Finish:**
   - When `newIteratorState` is null, you have retrieved all keys.
