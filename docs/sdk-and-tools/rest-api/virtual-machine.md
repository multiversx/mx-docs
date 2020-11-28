---
id: virtual-machine
title: Virtual Machine
---

Query values stored within Smart Contracts.

### <span class="badge badge-success">POST</span> Compute Output of Pure Function

`https://api.elrond.com/vm-values/query`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the execution results (the Virtual Machine Output).

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| ScAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.          |
| FuncName      | <span class="text-danger">REQUIRED</span>  | `string` | The name of the Pure Function to execute. |
| Args | <span class="text-danger">REQUIRED</span> | `array` | The arguments of the Pure Function, as hex-encoded strings. The array can be empty.        |

<!--Response-->

🟢 200: OK

The VM Output is retrieved successfully.

```
{
  "data": {
    "ReturnData": [
      "eyJSZ... (base64)"
    ],
    "ReturnCode": 0,
    "ReturnMessage": "",
    "GasRemaining": 1500000000,
    "GasRefund": 0,
    "OutputAccounts": {
      "...": {
        "Address": "... (base64)",
        "Nonce": 0,
        "Balance": null,
        "BalanceDelta": 0,
        "StorageUpdates": null,
        "Code": null,
        "CodeMetadata": null,
        "Data": null,
        "GasLimit": 0,
        "CallType": 0
      }
    },
    "DeletedAccounts": null,
    "TouchedAccounts": null,
    "Logs": null
  }
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

Here's an example of a request:

```
POST https://api.elrond.com/vm-values/query HTTP/1.1
Content-Type: application/json

{
    "ScAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7",
    "FuncName": "get",
    "Args": ["d98d..."]
}
```

### <span class="badge badge-success">POST</span> Compute Hex Output of Pure Function

`https://api.elrond.com/vm-values/hex`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as a hex-encoded string.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| ScAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.           |
| FuncName      | <span class="text-danger">REQUIRED</span>  | `string` | The name of the Pure Function to execute. |
| Args | <span class="text-danger">REQUIRED</span> | `array` | The arguments of the Pure Function, as hex-encoded strings. The array can be empty.        |

<!--Response-->

🟢 200: OK

The output value is retrieved successfully.

```
{
  "data": "7b22..."
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Compute String Output of Pure Function

`https://api.elrond.com/vm-values/string`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as a string.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| ScAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.           |
| FuncName      | <span class="text-danger">REQUIRED</span>  | `string` | The name of the Pure Function to execute. |
| Args | <span class="text-danger">REQUIRED</span> | `array` | The arguments of the Pure Function, as hex-encoded strings. The array can be empty.        |

<!--Response-->

🟢 200: OK

The output value is retrieved successfully.

```
{
  "data": "foobar"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Get Integer Output of Pure Function

`https://api.elrond.com/vm-values/int`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as an integer.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

Body Parameters

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| ScAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.           |
| FuncName      | <span class="text-danger">REQUIRED</span>  | `string` | The name of the Pure Function to execute. |
| Args | <span class="text-danger">REQUIRED</span> | `array` | The arguments of the Pure Function, as hex-encoded strings. The array can be empty.        |

<!--Response-->

🟢 200: OK

The output value is retrieved successfully.

```
{
    "data": "2020"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->