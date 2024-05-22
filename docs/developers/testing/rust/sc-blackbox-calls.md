---
id: sc-blackbox-calls
title: Blackbox calls
---

[comment]: # "mx-abstract"

## Overview

With the addition of unified syntax and new proxies, blackbox testing becomes the easiest and most accessible way to write integration tests for smart contracts. We can identify four types of transactions that can be ran in the testing environment:
- transaction - either a simple transfer or a contract call
- query - fetching values from the sc storage
- deploy - deploying a contract
- upgrade - upgrading a contract

As mentioned in [TxEnv](../../transactions/tx-env#integration-test), in order to be able to create transactions in the testing environment, we need to create an instance of the `ScenarioWorld` struct. In order to actually send the transaction, we need to finish it with `.run()`. 

### Transaction

```rust title=blackbox_test.rs
    world // ScenarioWorld struct
        .tx() // tx with testing environment
        .from(OWNER_ADDRESS)
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy) // typed call
        .add(1u32)
        .run(); // send transaction
```

In this example, we create a contract call to the `adder` contract. We are using the proxy (`AdderProxy`) to call the `add` endpoint of the contract and we mark the end of the transaction and the start of the execution by using `.run()`.

### Query 

```rust title=blackbox_test.rs
    world // ScenarioWorld struct
        .query() // tx with testing query environment
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(6u32)) // assert return value equals 6u32
        .run(); // send transaction
```

In this example, we are querying the `sum` view of the `adder` contract through the proxy.

### Deploy

```rust title=blackbox_test.rs
    let new_address = world // ScenarioWorld struct
        .tx() //tx with testing environment
        .from(OWNER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .init(5u32) // deploy call
        .code(CODE_PATH) 
        .new_address(ADDER_ADDRESS) // custom deploy address (only in tests)
        .returns(ReturnsNewAddress)
        .run(); // send transaction
```

In this example, we are deploying the `adder` contract by calling it's `init` endpoint through the proxy. The `.new_address(ADDER_ADDRESS)` component is only present in tests for deploy transactions and signals that the contract should be deployed at a specific custom test address. 

### Upgrade

Not yet supported in the testing framework, coming soon.