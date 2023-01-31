---
id: virtual-machine
title: Virtual Machine
---

[comment]: # (mx-context)

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

Query values stored within Smart Contracts.

[comment]: # (mx-context)

## <span class="badge badge--success">POST</span> Compute Output of Pure Function {#compute-output-of-pure-function}

`https://gateway.multiversx.com/vm-values/query`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the execution results (the Virtual Machine Output).

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Body Parameters

| Param     | Required                                  | Type     | Description                                                                         |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| scAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.                                         |
| funcName  | <span class="text-danger">REQUIRED</span> | `string` | The name of the Pure Function to execute.                                           |
| args      | <span class="text-danger">REQUIRED</span> | `array`  | The arguments of the Pure Function, as hex-encoded strings. The array can be empty. |
| caller    | <span class="text-normal">OPTIONAL</span> | `string` | The Address (bech32) of the caller.                                                 |
| value     | <span class="text-normal">OPTIONAL</span> | `string` | The Value to transfer (can be zero).                                                |

</TabItem>
<TabItem value="Response">

🟢 200: OK

The VM Output is retrieved successfully.

```json
{
  "data": {
    "data": {
      "ReturnData": ["eyJSZ... (base64)"],
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
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

Here's an example of a request:

```json
POST https://gateway.multiversx.com/vm-values/query HTTP/1.1
Content-Type: application/json

{
    "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqllls0lczs7",
    "funcName": "get",
    "caller": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
    "value": "0",
    "args": ["d98d..."]
}
```

[comment]: # (mx-context)

## <span class="badge badge--success">POST</span> Compute Hex Output of Pure Function {#compute-hex-output-of-pure-function}

`https://gateway.multiversx.com/vm-values/hex`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as a hex-encoded string.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Body Parameters

| Param     | Required                                  | Type     | Description                                                                         |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| scAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.                                         |
| funcName  | <span class="text-danger">REQUIRED</span> | `string` | The name of the Pure Function to execute.                                           |
| args      | <span class="text-danger">REQUIRED</span> | `array`  | The arguments of the Pure Function, as hex-encoded strings. The array can be empty. |
| caller    | <span class="text-normal">OPTIONAL</span> | `string` | The Address (bech32) of the caller.                                                 |
| value     | <span class="text-normal">OPTIONAL</span> | `string` | The Value to transfer (can be zero).                                                |

</TabItem>
<TabItem value="Response">

🟢 200: OK

The output value is retrieved successfully.

```json
{
  "data": "7b22..."
}
```

</TabItem>
</Tabs>

[comment]: # (mx-context)

## <span class="badge badge--success">POST</span> Compute String Output of Pure Function {#compute-string-output-of-pure-function}

`https://gateway.multiversx.com/vm-values/string`

This endpoint allows one to execute - with no side effects - a pure function of a Smart Contract and retrieve the first output value as a string.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Body Parameters

| Param     | Required                                  | Type     | Description                                                                         |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| scAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.                                         |
| funcName  | <span class="text-danger">REQUIRED</span> | `string` | The name of the Pure Function to execute.                                           |
| args      | <span class="text-danger">REQUIRED</span> | `array`  | The arguments of the Pure Function, as hex-encoded strings. The array can be empty. |
| caller    | <span class="text-normal">OPTIONAL</span> | `string` | The Address (bech32) of the caller.                                                 |
| value     | <span class="text-normal">OPTIONAL</span> | `string` | The Value to transfer (can be zero).                                                |

</TabItem>
<TabItem value="Response">

🟢 200: OK

The output value is retrieved successfully.

```json
{
  "data": "foobar"
}
```

</TabItem>
</Tabs>

[comment]: # (mx-context)

## <span class="badge badge--success">POST</span> Get Integer Output of Pure Function {#get-integer-output-of-pure-function}

`https://gateway.multiversx.com/vm-values/int`

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as an integer.

<Tabs
defaultValue="Request"
values={[
{label: 'Request', value: 'Request'},
{label: 'Response', value: 'Response'},
]}>
<TabItem value="Request">

Body Parameters

| Param     | Required                                  | Type     | Description                                                                         |
| --------- | ----------------------------------------- | -------- | ----------------------------------------------------------------------------------- |
| scAddress | <span class="text-danger">REQUIRED</span> | `string` | The Address (bech32) of the Smart Contract.                                         |
| funcName  | <span class="text-danger">REQUIRED</span> | `string` | The name of the Pure Function to execute.                                           |
| args      | <span class="text-danger">REQUIRED</span> | `array`  | The arguments of the Pure Function, as hex-encoded strings. The array can be empty. |
| caller    | <span class="text-normal">OPTIONAL</span> | `string` | The Address (bech32) of the caller.                                                 |
| value     | <span class="text-normal">OPTIONAL</span> | `string` | The Value to transfer (can be zero).                                                |

</TabItem>
<TabItem value="Response">

🟢 200: OK

The output value is retrieved successfully.

```json
{
  "data": "2020"
}
```

</TabItem>
</Tabs>
