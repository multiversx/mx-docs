---
id: overview
title: Overview
---

## Processing cost (gas units)

Each Elrond transaction has a **processing cost**, expressed as **an amount of _gas units_**. Each transaction must be provided a **gas limit** (`gasLimit`), which acts as an _upper limit_ of the processing cost.

For any transaction, the `gasLimit` must be greater or equal to `erd_min_gas_limit` but smaller than `erd_max_gas_per_transaction`, these two being [parameters of the Network](/sdk-and-tools/rest-api/network#get-network-configuration):

```
networkConfig.erd_min_gas_limit <= tx.gasLimit < networkConfig.erd_max_gas_per_transaction
```

The **actual gas cost** - also known as **used gas** - is the consumed amount of the provided **gas limit** - the amount of gas units actually required by the Network in order to process the transaction. The unconsumed amount is called **remaining gas**.

At processing time, the Network breaks the **actual gas cost** down into two components: 
 - `value_data_cost`: **value movement** and **data handling** cost
 - `execution_cost`: **contract execution** cost (for System or User-Defined Smart Contract calls)

:::note
Simple transfers of value (EGLD transfers) present only _value movement and data handling_ component of the cost (no _execution_ cost), while Smart Contract calls (this includes ESDT and NFT transfers as well) present both components of the cost.
:::

## Processing fee (EGLD)

The **processing fee**, measured in EGLD, is computed with respect to the **actual gas cost** - broken down into its components - and the **gas price per gas unit** - which differs between the components.

While the price of a gas unit for the **value movement and data handling** component equals the **gas price** provided in the transaction, the price of a gas unit for the **contract execution** component is computed with respect to a Network parameter called `erd_gas_price_modifier`:

```
value_data_price_per_unit = tx.GasPrice
execution_price_per_unit = tx.GasPrice * networkConfig.erd_gas_price_modifier
```

:::note
Generally speaking, the price of a gas unit for **contract execution** is lower than the price of a gas unit for **value movement and data handling**. 
:::

The **processing fee** formula looks like this:

```
processing_fee = 
    value_data_cost * value_data_price_per_unit + 
    execution_cost * execution_price_per_unit
```

Upon processing the transaction, if applicable (if the **paid fee** is higher than the **necessary fee**), the Network will return the originator a value called **gas refund**, computed with respect to the unconsumed (component of the) gas.
