---
id: overview
title: Overview
---

## Cost of processing (gas units)

Each Elrond transaction has a **processing cost**, expressed as **an amount of _gas units_**. At broadcast time, each transaction must be provided a **gas limit** (`gasLimit`), which acts as an _upper limit_ of the processing cost.

### Constraints

For any transaction, the `gasLimit` must be greater or equal to `erd_min_gas_limit` but smaller or equal to `erd_max_gas_per_transaction`, these two being [parameters of the Network](/sdk-and-tools/rest-api/network#get-network-configuration):

```
networkConfig.erd_min_gas_limit <= tx.gasLimit <= networkConfig.erd_max_gas_per_transaction
```

### Cost components

The **actual gas cost** - also known as **used gas** - is the consumed amount from the provided **gas limit** - the amount of gas units actually required by the Network in order to process the transaction. The unconsumed amount is called **remaining gas**.

At processing time, the Network breaks the **actual gas cost** down into two components: 
 - **value movement and data handling** cost
 - **contract execution** cost (for executing System or User-Defined Smart Contract)

:::note
Simple transfers of value (EGLD transfers) present only the _value movement and data handling_ component of the cost (that is, no _execution_ cost), while Smart Contract calls (which includes ESDT and NFT transfers as well - since they are, actually, calls against a System Smart Contract) present both components of the cost.
:::

The  **value movement and data handling** cost component is easily computable, using on the following formula:

```
tx.gasLimit = 
    networkConfig.erd_min_gas_limit + 
    networkConfig.erd_gas_per_data_byte * lengthOf(tx.data)
```

The **contract execution** cost component is easily computable for System Smart Contract calls (based on formulas specific to each contract), but harder to determine _a priori_  for User-defined Smart Contracts - where _simulations_ and _estimations_ are employed.

## Processing fee (EGLD)

The **processing fee**, measured in EGLD, is computed with respect to the **actual gas cost** - broken down into its components - and the **gas price per gas unit**, which differs between the components.

While the price of a gas unit for the **value movement and data handling** component equals the **gas price** provided in the transaction, the price of a gas unit for the **contract execution** component is computed with respect to a Network parameter called `erd_gas_price_modifier`:

```
value_movement_and_data_handling_price_per_unit = tx.GasPrice
contract_execution_price_per_unit = tx.GasPrice * networkConfig.erd_gas_price_modifier
```

:::note
Generally speaking, the price of a gas unit for **contract execution** is lower than the price of a gas unit for **value movement and data handling**. 
:::

The **processing fee** formula looks like this:

```
processing_fee = 
    value_movement_and_data_handling_cost * value_movement_and_data_handling_price_per_unit + 
    contract_execution_cost * contract_execution_price_per_unit
```

Upon processing the transaction, if applicable (if the **paid fee** is higher than the **necessary fee**), the Network will return the originator a value called **gas refund**, computed with respect to the unconsumed (component of the) gas.
