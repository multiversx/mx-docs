---
id: sc-blackbox
title: Blackbox tests
---

[comment]: # "mx-abstract"

## Overview


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


[comment]: # "mx-context-auto"

### Contract reference


```rust
use adder::*;
```


[comment]: # "mx-context-auto"

### Constants


```rust
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const ADDER_ADDRESS: TestSCAddress = TestSCAddress::new("adder");
const CODE_PATH: MxscPath = MxscPath::new("output/adder.mxsc.json");
```


[comment]: # "mx-context-auto"

### Environment setup function (`world()`)


```rust
fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace("contracts/examples/adder");

    blockchain.register_contract(CODE_PATH, adder::ContractBuilder);
    blockchain
}
```


[comment]: # "mx-context-auto"

### Setup mock accounts


```rust
    world.account(OWNER_ADDRESS).nonce(1);
```


[comment]: # "mx-context-auto"

### The test itself


```rust
#[test]
fn adder_blackbox() {
    let mut world = world();

    ///   
}
```


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


[comment]: # "mx-context-auto"

### Check accounts


```rust
    world.check_account(OWNER_ADDRESS);
```


[comment]: # "mx-context-auto"

### Traces


```rust
    world.start_trace();

    // ...

    world.write_scenario_trace("trace1.scen.json");
```
