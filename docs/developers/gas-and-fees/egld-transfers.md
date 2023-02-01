---
id: egld-transfers
title: EGLD transfers (move balance transactions)
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## Formula

For EGLD transfers, the **actual gas cost** of processing is easy to determine precisely, since it only contains the **value movement and data handling** component. The **gas limit** should be set to the **actual gas cost**, according to the previously depicted formula:

```
tx.gasLimit = 
    networkConfig.erd_min_gas_limit + 
    networkConfig.erd_gas_per_data_byte * lengthOf(tx.data)
```

[comment]: # (mx-context-auto)

## Examples

Given:

```
networkConfig.erd_min_gas_limit is 50000
networkConfig.erd_gas_per_data_byte is 1500
networkConfig.erd_min_gas_price is 1000000000

tx1.data = ""
tx1.gasPrice = networkConfig.erd_min_gas_price

tx2.data = "Hello world!"
tx2.gasPrice = networkConfig.erd_min_gas_price
```

Then:

```
tx1.gasLimit = 50000

tx2.gasLimit 
    = 50000 + 1500 * len("Hello world!") 
    = 68000
```

Furthermore, the fee would be as follows:

```
fee(tx1) 
    = tx1.gasLimit * tx1.gasPrice 
    = 50000 * 1000000000
    = 50000000000000 atoms of EGLD
    = 0.00005 EGLD

fee(tx2) 
    = tx2.gasLimit * tx2.gasPrice 
    = 68000 * 1000000000
    = 68000000000000 atoms of EGLD
    = 0.000068 EGLD
```
