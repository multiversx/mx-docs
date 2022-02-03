---
id: egld-transfers
title: EGLD transfers
---

## Formula

For EGLD transfers, the **actual gas cost** of processing is easy to determine precisely, since it only contains the **value movement and data handling** component. The **gas limit** should be set to the **actual gas cost**, according to the previously depicted formula:

```
tx.gasLimit = 
    networkConfig.erd_min_gas_limit + 
    networkConfig.erd_gas_per_data_byte * lengthOf(tx.data)
```

## Examples

Given:

```
networkConfig.erd_min_gas_limit is 50000
networkConfig.erd_gas_per_data_byte is 1500

tx1.data = ""
tx2.data = "Hello world!"
```

Then:

```
tx1.gasLimit = 50000

tx2.gasLimit 
    = 50000 + 1500 * len("Hello world!") 
    = 68000
```
