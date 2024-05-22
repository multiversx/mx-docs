---
id: tx-run
title: Run transactions
---

[comment]: # (mx-abstract)

## Overview

As discussed previously, the transaction syntax is consistent through the various transaction environments. However, when sending the transaction across a specific environment, certain conditions apply, depending on the framework's capability of processing the information and the route of the transaction.

:::note
The transaction itself is not different and will produce the same result, but the way the framework processes the transaction might differ depending on the environment.
:::

## Smart contract 

From the smart contract point of view, the transaction ends when specifying the transaction type (sync/async call).

- `async_call_and_exit` - executes the transaction asynchronously and exits after execution.

```rust title=contract.rs
    self.tx() // tx with sc environment
        .to(&marketplace_address)
        .typed(nft_marketplace_proxy::NftMarketplaceProxy)
        .claim_tokens(token_id, token_nonce, caller)
        .async_call_and_exit(); // async call and stop execution
```

In this case, the function `async_call_and_exit` marks the end of the transaction and executes it asynchronously. After the transaction is executed, the `never` type is returned, marking the end of the execution.

- `sync_call` - sends a transaction synchronously.

```rust title=contract.rs
    self
        .tx() // tx with sc environment
        .to(&to)
        .typed(vault_proxy::VaultProxy)
        .retrieve_funds(token, token_nonce, amount)
        .sync_call(); // synchronous call
```

- `async_call`, `async_call_promise` - backwards compatibility.

:::important
For the moment, the functions `async_call` and `async_call_promise` exist for backwards compatibility reasons only. These functions do `NOT` execute a transaction, they just return the current object state. Use `async_call_and_exit` instead.
:::

- `upgrade_async_call_and_exit` - upgrades contract asynchronously and exits after execution.

```rust title=contract.rs
    self.tx() // tx with sc environment
        .to(child_sc_address)
        .typed(vault_proxy::VaultProxy)
        .upgrade(opt_arg) // calling the upgrade function
        .from_source(source_address)
        .upgrade_async_call_and_exit(); // upgrades async and exits
```

- `sync_call_same_context` - executes the transaction synchronously on the same context (in the name of the caller).

```rust title=contract.rs
    self
        .tx() // tx with sc environment
        .to(&to)
        .raw_call(endpoint_name)
        .arguments_raw(args.to_arg_buffer())
        .sync_call_same_context(); // sync call in the same context
```

- `sync_call_readonly` - executes the transaction synchronously, in readonly mode (target contract cannot have its state altered).

```rust title=contract.rs
    let result = self
        .tx() // tx with sc environment
        .to(&to)
        .raw_call(endpoint_name)
        .arguments_raw(args.to_arg_buffer())
        .returns(ReturnsRawResult) // result handler - returns raw result data
        .sync_call_readonly(); // sync call in readonly mode
```

## Integration test

For the Rust testing environment, the only keyword for sending transactions is `run`. Inside an integration test, a  developer can build a transaction, choose the return type and then `run` it, marking the end of the transaction and the start of the execution.

```rust title=blackbox_test.rs
    world // ScenarioWorld instance
        .query() // query with test environment
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(6u32)) // result handler - assert return value
        .run(); // runs the query step
```

In this case, regarding of the type of the transaction (raw call, deploy, upgrade, query), it eventually turns into a scenario `Step` (`ScQueryStep`, `ScCallStep`, `ScDeployStep`) and it is processed as such. 

## Interactor

In the case of the interactor, the processing is similar to the integration test, with the exception that the interactor is using async Rust. First, the transaction is built, then it is turned into a `Step` using the `prepare_async` function, then we can `run` it and `await` the result.

```rust title=interact.rs
    self.interactor // Interactor instance
        .tx() // tx with interactor exec environment
        .from(&self.wallet_address)
        .to(self.state.current_multisig_address())
        .gas(NumExpr("30,000,000"))
        .typed(multisig_proxy::MultisigProxy)
        .dns_register(dns_address, name)
        .prepare_async() // converts tx into step
        .run() // runs the step
        .await; // awaits the result - async Rust
```