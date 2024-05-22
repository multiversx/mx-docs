---
id: sc-test setup
title: Test setup
---

[comment]: # "mx-abstract"

## Overview

[comment]: # "mx-context-auto"

### Registering contracts

Since we don't have native execution in the Rust backend yet, the only way to run contracts is to register the contract implementation for the given contract code identifier. In simpler words, we tell the environment "whenever you encounter this contract code, run this code that I've written instead".

Since this operation is specific to only the Rust debugger, it doesn't go through the mandos pipeline.


[comment]: # "mx-context-auto"

### Setting accounts

Setting accounts in blackbox tests can be easily done by using a `SetStateBuilder`. In order to create an instance of the builder, we have to call the `.account(...)` method from `ScenarioWorld`.

```rust title=blackbox_test.rs
world // ScenarioWorld struct
    .account(USER_ADDRESS) // SetStateBuilder with USER_ADDRESS account
    .nonce(1) // custom nonce
    .balance(50) // egld balance
    .esdt_balance(TRANSFER_TOKEN, 1000) // esdt balance 
    .esdt_nft_balance(NFT_TOKEN_ID, 1u64, 1u64, ManagedBuffer::new()); // nft balance
```

There are no mandatory fields, so we can only add the fields that we actually need. For example, if we only need to create the account and we don't care about other fields, `world.account(ADDRESS)` will compile. 

However, there is no possibility to upgrade and existing account, so there can only be one set block per account.

We can also chain the set state declarations (if useful) as such:

```rust title=blackbox_test.rs
    world
        .account(first) // SetStateBuilder for account `first`
        .nonce(1)
        .balance(100) 
        .account(second) // SetStateBuilder for `second`, ends set state for `first`
        .nonce(2)
        .balance(300)
        .esdt_balance(TOKEN_ID, 500); // end set state for `second`
```

[comment]: # "mx-context-auto"

### Checking accounts

Similar to setting accounts, the framework provides a `CheckStateBuilder` that we can use to check state values. The check builder is instantiated using `.check_account(...)` from `ScenarioWorld`.

```rust title=blackbox_test.rs
    world
        .check_account(first) // CheckStateBuilder for `first`
        .nonce(3)
        .balance(100);
```

The same rules apply when chaining multiple account checks as for chaining accounts set.

```rust title=blackbox_test.rs
    world
        .check_account(first) // CheckStateBuilder for `first`
        .nonce(3)
        .balance(100);
        .check_account(second) // CheckStateBuilder for `second`, ends check state for `first`
        .check_storage("str:sum", "6");
```

[comment]: # "mx-context-auto"

### Mandos trace

A mandos `trace` is an auto-generated scenario file (`.scen.json`) based on the logic written in the integration test.
We can quickly generate a mandos `trace`, by starting the trace before the beginning of the test and writing the trace in a json file at the end, as such:

```rust title=blackbox_test.rs
    world.start_trace();

    // integration test logic

    world.write_scenario_trace("trace1.scen.json");
```

Having an auto-generated mandos scenario is very useful when testing the contract against both VMs (Go and Rust). Writing the integration test in Rust helps us test the contract against the Rust VM, and by quickly generating a scenario trace, we can then test the scenario against the Go VM without rewriting the logic by hand.