---
id: virtual-machine
title: Virtual Machine
---

Query values stored within Smart Contracts.

## **Compute Output of Pure Function**

https://api.elrond.com**/vm-values/query**

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the execution results (the Virtual Machine Output).

Request

Response

Body Parameters

ScAddress

REQUIRED

string

The Address (bech32) of the Smart Contract.

FuncName

REQUIRED

string

The name of the Pure Function to execute.

Args

REQUIRED

array

The arguments of the Pure Function, as hex-encoded strings. The array can be empty.

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

## **Compute Hex Output of Pure Function**

https://api.elrond.com**/vm-values/hex**

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as a hex-encoded string.

Request

Response

Body Parameters

ScAddress

REQUIRED

string



FuncName

REQUIRED

string

The name of the Pure Function to execute.

Args

REQUIRED

array

The arguments of the Pure Function, as hex-encoded strings. The array can be empty.

## **Compute String Output of Pure Function**

https://api.elrond.com**/vm-values/string**

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as a string.

Request

Response

Body Parameters

ScAddress

REQUIRED

string



FuncName

REQUIRED

string

The name of the Pure Function to execute.

Args

REQUIRED

array

The arguments of the Pure Function, as hex-encoded strings. The array can be empty.

## **Get Integer Output of Pure Function**

https://api.elrond.com**/vm-values/int**

This endpoint allows one to execute - with no side-effects - a pure function of a Smart Contract and retrieve the first output value as an integer.

Request

Response

Body Parameters

ScAddress

REQUIRED

string



FuncName

REQUIRED

string

The name of the Pure Function to execute.

Args

REQUIRED

array

The arguments of the Pure Function, as hex-encoded strings. The array can be empty.