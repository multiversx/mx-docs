---
id: sc-blackbox-example
title: Blackbox example
---

[comment]: # "mx-abstract"

## Overview

With the addition of unified syntax and new proxies, blackbox testing becomes the easiest and most accessible way to write integration tests for smart contracts. 

[comment]: # "mx-context-auto"

## Example explained

The best way to dive into the smart contract test framework is by dissecting a minimal example.

```rust title=adder_blackbox_test.rs
use multiversx_sc_scenario::imports::*;

use adder::*;

const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const ADDER_ADDRESS: TestSCAddress = TestSCAddress::new("adder");
const CODE_PATH: MxscPath = MxscPath::new("output/adder.mxsc.json");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace("contracts/examples/adder");

    blockchain.register_contract(CODE_PATH, adder::ContractBuilder);
    blockchain
}

#[test]
fn adder_blackbox() {
    let mut world = world();

    world.start_trace();

    world.account(OWNER_ADDRESS).nonce(1);

    let new_address = world
        .tx()
        .from(OWNER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .init(5u32)
        .code(CODE_PATH)
        .new_address(ADDER_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(new_address, ADDER_ADDRESS.to_address());

    world
        .query()
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(5u32))
        .run();

    world
        .tx()
        .from(OWNER_ADDRESS)
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .add(1u32)
        .run();

    world
        .query()
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(6u32))
        .run();

    world.check_account(OWNER_ADDRESS);

    world
        .check_account(ADDER_ADDRESS)
        .check_storage("str:sum", "6");

    world.write_scenario_trace("trace1.scen.json");
}
```


[comment]: # "mx-context-auto"

### Imports

```rust
use multiversx_sc_scenario::imports::*;
```

Importing everything from `multiversx_sc_scenario` gives us all the tools we need to write integration tests. From data types to methods, the dependency to `multiversx_sc_scenario` is definitely worth it for the majority of developers.

[comment]: # "mx-context-auto"

### Contract reference

```rust
use adder::*;
```

In this case, the only reason we import the contract files is to gain access to `adder_proxy.rs`, which is located at `adder/src/adder_proxy.rs`.

[comment]: # "mx-context-auto"

### Constants

```rust
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const ADDER_ADDRESS: TestSCAddress = TestSCAddress::new("adder");
const CODE_PATH: MxscPath = MxscPath::new("output/adder.mxsc.json");
```

The framework provides various types that offer accessibility acting as a wrapper around strings and giving a clearer scope for the constants. Mandos relies heavily on strings, so, eventually, we have to pass strings to mandos.

- `TestAddress` - creates a test address for a user that is not a smart contract. Using `TestAddress::new("owner")` is the same as using `address:owner`, but wrapper in a type.
- `TestSCAddress` - creates a test address for a smart contract. Same as before, using `TestSCAddress::new("adder")` is equivalent to using `sc:adder`.
- `MxscPath` - creates a path that is specifically used for locating the contract code.

[comment]: # "mx-context-auto"

### Environment setup function (`world`)

```rust
fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace("contracts/examples/adder");

    blockchain.register_contract(CODE_PATH, adder::ContractBuilder);
    blockchain
}
```

In the environment setup function of this example, the first step is to create an instance of the `ScenarioWorld` struct. This `ScenarioWorld` instance gives us access to the majority of the methods from the testing framework. Afterwards, we set the current directory path (used for debugging) and then we register the `adder` contract by providing the code path (path to `adder` root).

[comment]: # "mx-context-auto"

### Setup mock accounts

```rust
    world.account(OWNER_ADDRESS).nonce(1);
```

This snippet initializes a `SetStateBuilder` which helps us set the owner account at a custom address (`OWNER_ADDRESS`), and give it nonce 1. Now we can use the owner account to send transactions, and the account will be visible if checked.

[comment]: # "mx-context-auto"

### The test itself

```rust
#[test]
fn adder_blackbox() {
    let mut world = world();

    ///   
}
```

First thing to do inside the actual test is to initialize the environment using the `world()` function. Afterwards, we can write transactions and check results.

[comment]: # "mx-context-auto"

### Deploy

```rust
    let new_address = world
        .tx()
        .from(OWNER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .init(5u32)
        .code(CODE_PATH)
        .new_address(ADDER_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(new_address, ADDER_ADDRESS.to_address());
```

In order to be able to call and query the contract, we must deploy it first. The transaction syntax is consistent through our various environments, so we are able to write a deploy transaction in the testing framework in a similar way to a deploy from a smart contract.

There are, however, a few differences:
- `.new_address(ADDER_ADDRESS)` - only available in the testing framework inside a `deploy transaction`, indicates that the newly deployed contract should exist at test address `ADDER_ADDRESS`. If not specified, a mock address will be created and automatically assigned to the smart contract and a warning will appear in the console.
- `.run()` - converts tx data into `Step` data and then runs the step.

[comment]: # "mx-context-auto"

### Query

```rust
    world
        .query()
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(5u32))
        .run();
```

After deploying the contract, we are now free to interact with it by sending transactions at the specified address. In this example, we are querying the `sum` endpoint of the contract and doing an assert on the result. By using `.returns(ExpectValue(5u32))` we indicate that the returned result should be `5u32` and any other result will throw an error.

[comment]: # "mx-context-auto"

### Regular transactions

```rust
    world
        .tx()
        .from(OWNER_ADDRESS)
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .add(1u32)
        .run();
```

In this snippet, we are sending a transaction which is a typed contract call for endpoint `add`, with `1u32` as argument. We are using the `AdderProxy` object from the `adder_proxy` file in order to create the call. 

[comment]: # "mx-context-auto"

### Check accounts

```rust
    world.check_account(OWNER_ADDRESS);
```

In order to check the current state of the environment, we create a `CheckStateBuilder` using `check_account`. In this case, `.check_account(OWNER_ADDRESS)` checks if there is any account present at address `OWNER_ADDRESS`. In case of inconsistencies, the method throws an error and stops the execution.

[comment]: # "mx-context-auto"

### Traces

```rust
    world.start_trace();

    // ...

    world.write_scenario_trace("trace1.scen.json");
```

Traces help us with generating mandos based on blackbox tests. In order to use traces, we should initialize the trace at the beginning of the test, and then write the trace to a custom file at the end. The trace file in this example will be called `trace1.scen.json` and will be found in the root folder of the contract.
