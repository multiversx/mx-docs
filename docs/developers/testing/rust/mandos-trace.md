---
id: mandos-trace
title: Mandos traces
---

[comment]: # "mx-abstract"

## Overview

A Mandos `trace` is an auto-generated scenario file (`.scen.json`) derived from the logic within an integration test. We can generate a Mandos trace in the contract's root directory by initiating the trace at the start of the test and saving it as a JSON file at the end, as demonstrated below:

```rust title=blackbox_test.rs
    world.start_trace();

    // integration test logic

    world.write_scenario_trace("trace1.scen.json");
```

Auto-generating Mandos scenarios is particularly useful for testing the contract against both Go and Rust VMs. Writing the integration test in Rust allows us to test the contract against the Rust VM. By generating a scenario trace, we can then test the scenario against the Go VM without manually rewriting the logic.

[comment]: # (mx-context-auto)

### Example

Let's explore a use-case where generating traces proves beneficial. Below is the adder contract created using the [sc-meta new template --adder](../../../developers/meta/sc-meta-cli#calling-templates) command:

```rust title=adder.rs
#[multiversx_sc::contract]
pub trait Adder {
    #[view(getSum)]
    #[storage_mapper("sum")]
    fn sum(&self) -> SingleValueMapper<BigUint>;

    #[init]
    fn init(&self, initial_value: BigUint) {
        self.sum().set(initial_value);
    }

    #[upgrade]
    fn upgrade(&self, initial_value: BigUint) {
        self.init(initial_value);
    }

    /// Add desired amount to the storage variable.
    #[endpoint]
    fn add(&self, value: BigUint) {
        self.sum().update(|sum| *sum += value);
    }
}
```

To ensure comprehensive testing of the contract, we need to test interactions across multiple environments.

::::note
Using contract templates simplifies the process of creating and testing smart contracts. For example, executing the `sc-meta new --template adder` command generates an `adder` contract with various types of tests already included.
::::

The first step is to create Rust integration tests:

```rust title=adder_blackbox.rs
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

    world
        .tx()
        .from(OWNER_ADDRESS)
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .upgrade(100u64)
        .code(CODE_PATH)
        .run();

    world
        .check_account(ADDER_ADDRESS)
        .check_storage("str:sum", "100");

    world.write_scenario_trace("trace1.scen.json");
}
```

This test provides a small scenario that covers all endpoints and verifies the results. The `.start_trace()` and `.write_scenario_trace(FILE_PATH)` functions ensure that all actions between them are captured and converted into Mandos steps.

After running the test, the newly generated `trace1.scen.json` will contain the following:


```json title=trace1.scen.json
{
    "steps": [
        {
            "step": "setState",
            "accounts": {
                "address:owner": {
                    "nonce": "1"
                }
            }
        },
        {
            "step": "setState",
            "newAddresses": [
                {
                    "creatorAddress": "address:owner",
                    "creatorNonce": "1",
                    "newAddress": "sc:adder"
                }
            ]
        },
        {
            "step": "scDeploy",
            "id": "",
            "tx": {
                "from": "address:owner",
                "contractCode": "mxsc:output/adder.mxsc.json",
                "arguments": [
                    "0x05"
                ],
                "gasLimit": "5,000,000"
            },
            "expect": {
                "out": [],
                "status": "0"
            }
        },
        {
            "step": "scQuery",
            "id": "",
            "tx": {
                "to": "sc:adder",
                "function": "getSum",
                "arguments": []
            },
            "expect": {
                "out": [
                    "0x05"
                ],
                "status": "0"
            }
        },
        {
            "step": "scCall",
            "id": "",
            "tx": {
                "from": "address:owner",
                "to": "sc:adder",
                "function": "add",
                "arguments": [
                    "0x01"
                ],
                "gasLimit": "5,000,000"
            },
            "expect": {
                "out": [],
                "status": "0"
            }
        },
        {
            "step": "scQuery",
            "id": "",
            "tx": {
                "to": "sc:adder",
                "function": "getSum",
                "arguments": []
            },
            "expect": {
                "out": [
                    "0x06"
                ],
                "status": "0"
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "address:owner": {
                    "storage": "*",
                    "code": "*",
                    "owner": "*"
                }
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "sc:adder": {
                    "storage": {
                        "str:sum": "6"
                    },
                    "code": "*",
                    "owner": "*"
                }
            }
        },
        {
            "step": "scCall",
            "id": "",
            "tx": {
                "from": "address:owner",
                "to": "sc:adder",
                "function": "upgrade",
                "arguments": [
                    "0x64"
                ],
                "gasLimit": "5,000,000"
            },
            "expect": {
                "out": [],
                "status": "0"
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "sc:adder": {
                    "storage": {
                        "str:sum": "100"
                    },
                    "code": "*",
                    "owner": "*"
                }
            }
        }
    ]
}
```

As seen above, all blackbox actions are now captured as Mandos steps, simply by including the trace in the test.

However, testing only against the Rust VM alone is insufficient since the actual VM running on the nodes is the Go VM. The Mandos file generated from the trace enables easy testing against a Go VM backend (not the actual Go VM) using the `VmGoBackend`:

```rust title=adder_scenario_go_test.rs
use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    ScenarioWorld::vm_go() // VmGoBackend
}

#[test]
fn trace_one_go() {
    world().run("trace1.scen.json"); // run trace
}
```

Mandos tests can also run against the Rust VM, bypassing the Rust testing framework syntax:

```rust title=adder_scenario_rs_test.rs
use multiversx_sc_scenario::*;

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new(); // ScenarioWorld struct

    blockchain.register_contract("mxsc:output/adder.mxsc.json", adder::ContractBuilder);
    blockchain
}

#[test]
fn trace_one_rs() {
    world().run("trace1.scen.json"); // run trace
}
```
The key advantage of Mandos tests is their seamless integration with the actual [Go VM](https://github.com/multiversx/mx-chain-vm-go). Mandos serves as the unified "language" across our systems, allowing us to run the same scenarios in different environments. To ensure comprehensive VM-related testing, we can simply add our generated `trace1.scen.json` file to the collection of Mandos tests already present and execute the entire scenario against the Go VM.
