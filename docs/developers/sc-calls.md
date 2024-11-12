---
id: sc-calls
title: Smart Contract Calls
---
[comment]: # (mx-abstract)

This guide provides a detailed overview of the different types of smart contract calls available in the MultiversX blockchain, covering synchronous and asynchronous interactions between contracts.

[comment]: # (mx-context-auto)

## Introduction

Smart contract calls on MultiversX fall into two main categories: synchronous (`sync`) and asynchronous (`async`), each with distinct usage scenarios based on developer needs, dApp architecture and the network's `sharded` structure.

A `sync` call executes immediately and is used when the source and destination contracts are `on the same shard`. This is the fastest type of call and is ideal for high-speed operations. Because of that, it's recommended that multiple contracts that are part of the same mechanism should lie on the same shard. For example, a sync call is commonly used to deploy a smart contract.

An `async` call is used when the source and destination contracts may reside `on different shards`. When in doubt about the destination shard, async calls are recommended to maximize transaction success. An example of a popular async call is the upgrade of a smart contract.

:::note
Async call functions do not return values (they return the `never` type or nothing) and may include a `callback` function to handle the response from the destination contract.
:::

This is an example of a callback function that gets triggered after an `issue_fungible` action:

```rust
    #[callback]
    fn esdt_issue_callback(
        &self,
        caller: &ManagedAddress,
        #[call_result] result: ManagedAsyncCallResult<()>,
    ) {
        let (token_identifier, returned_tokens) = self.call_value().egld_or_single_fungible_esdt();
        // callback is called with ESDTTransfer of the newly issued token, with the amount requested,
        // so we can get the token identifier and amount from the call data
        match result {
            ManagedAsyncCallResult::Ok(()) => {
                self.last_issued_token().set(token_identifier.unwrap_esdt());
                self.last_error_message().clear();
            },
            ManagedAsyncCallResult::Err(message) => {
                // return issue cost to the caller
                if token_identifier.is_egld() && returned_tokens > 0 {
                    self.tx().to(caller).egld(&returned_tokens).transfer();
                }

                self.last_error_message().set(&message.err_msg);
            },
        }
    }
```

Each of these calls further divide in multiple cathegories, depending on the mechanism they use, different developer use-cases and expected results.

[comment]: # (mx-context-auto)

## Sync calls

Sync calls are used when `intra-shard communication` is required, allowing transactions to execute in the same shard only.
There are four main types of sync calls developers can use inside a smart contract.

[comment]: # (mx-context-auto)

### Sync call

A standard sync call performs a direct, synchronous transaction to a contract on the same shard. This type of call is launched with `.sync_call()`.

```rust
    /// Executes transaction synchronously.
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

```rust title=adder.rs
    #[endpoint]
    fn sync(&self, destination: ManagedAddress, value: BigUint) {
        self.tx()
            .to(destination)
            .typed(adder_proxy::AdderProxy)
            .add(value)
            .sync_call();
    }
```

### Sync call same context

This call operates in the same execution context as the source contract. Used, for instance, inside a contract that does not have its own storage. To perform this type of call, use `.sync_call_same_context()`.

```rust
    /// Executes transaction synchronously, in the same context (performed in the name of the caller).
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call_same_context(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

```rust title=adder.rs
    #[endpoint]
    fn sync_same_context(&self, destination: ManagedAddress, value: BigUint) {
        self.tx()
            .to(destination)
            .typed(adder_proxy::AdderProxy)
            .add(value)
            .sync_call_same_context();
    }
```

### Sync call readonly

This type of call performs a synchronous call in `readonly` mode, meaning the destination contract's state cannot be altered by this action. This type of call is performed with `.sync_call_readonly()`. 

```rust
    /// Executes transaction synchronously, in readonly mode (target contract cannot have its state altered).
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call_readonly(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

```rust title=adder.rs
    #[endpoint]
    fn sync_readonly(&self, destination: ManagedAddress, _value: BigUint) {
        self.tx()
            .to(destination)
            .typed(adder_proxy::AdderProxy)
            .sum()
            .sync_call_readonly();
    }
```

[comment]: # (mx-context-auto)

### Deploy call

Sync calls can also be used to deploy new contracts. There are two primary methods:
- Raw deploy (directly deploys a contract with specific bytecode)
- Deploy from source (deploys a contract using bytecode from an existing contract address)

Syntax-wise, both of these calls are executed using `.sync_call()`, but the transaction setup differs for each type.

For a simple `raw deploy`, initiate a raw deploy transaction as shown below:

```rust title=adder.rs
    #[endpoint]
    fn raw_deploy(&self, code: ManagedBuffer) -> ManagedAddress {
        self.tx()
            .raw_deploy()
            .code(code)
            .code_metadata(CodeMetadata::UPGRADEABLE)
            .returns(ReturnsNewManagedAddress)
            .sync_call()
    }
```

In the example above, only `.code()` is mandatory for a deploy sync call. We need to either pass the code to the transaction as an argument, or to receive it from a specified location on the blockchain (from source).

In the case of a `deploy from source` transaction, we would use the specific function `.from_source()` instead of `.code()` and pass the source address as a parameter, as such:

```rust title=adder.rs
    #[endpoint]
    fn raw_deploy_from_source(&self, source: ManagedAddress) -> ManagedAddress {
        self.tx()
            .raw_deploy()
            .from_source(source)
            .code_metadata(CodeMetadata::UPGRADEABLE)
            .returns(ReturnsNewManagedAddress)
            .sync_call()
    }
```

## Async calls

Async calls are used when `cross-shard communication` is required, allowing transactions to execute across multiple shards.

### Async call (V1)

The most common type of async call. This type of call can be executed with `.async_call_and_exit()`. As of framework version `0.50.2`, this replaces the deprecated `.async_call()` method.

:::important
This type of call uses the `async V1` mechanism.
:::

```rust
pub fn async_call_and_exit(self) -> ! 
```

```rust title=adder.rs
    #[endpoint]
    fn async_call(&self, destination: ManagedAddress, value: BigUint) {
        self.tx()
            .to(destination)
            .typed(adder_proxy::AdderProxy)
            .add(value)
            .async_call_and_exit();
    }
```

### Register promise (V2)

Register promise performs an asynchronous promise call and allows multiple calls as such in a single transaction. To perform this type of call, use `.register_promise()`. 
As of framework version `0.50.2`, this replaces the deprecated `.async_call_promise()` method.

:::important
Register promise uses the `async V2` mechanism.
:::

```rust
    /// Launches a transaction as an asynchronous promise (async v2 mechanism).
    ///
    /// Several such transactions can be launched from a single transaction.
    ///
    /// Must set:
    /// - to
    /// - gas
    /// - a function call, ideally via a proxy.
    ///
    /// Value-only promises are not supported.
    ///
    /// Optionally, can add:
    /// - any payment
    /// - a promise callback, which also needs explicit gas for callback.
    pub fn register_promise(self)
```

```rust title=adder.rs
    #[endpoint]
    fn register_promise(&self, destination: ManagedAddress, value: BigUint) {
        self.tx()
            .to(destination)
            .gas(30_000_000u64)
            .typed(adder_proxy::AdderProxy)
            .add(value)
            .register_promise();
    }
```

### Transfer execute

This call executes a transaction asynchronously without waiting for a callback. In order to perform this type of call use `.transfer_execute()`.

```rust
    /// Sends transaction asynchronously, and doesn't wait for callback ("fire and forget".)
    pub fn transfer_execute(self)
```

```rust title=adder.rs
    #[endpoint]
    fn transfer_execute(&self, destination: ManagedAddress, value: BigUint) {
        self.tx()
            .to(destination)
            .gas(30_000_000u64)
            .typed(adder_proxy::AdderProxy)
            .add(value)
            .transfer_execute();
    }
```

### Upgrade call

Async calls can also be used to upgrade existing contracts. Similar to deploy calls, there are two types of upgrade calls:
- Raw upgrade (upgrades a contract using specific bytecode)
- Upgrade from source (upgrades a contract using bytecode from an existing source address)

```rust
    /// Launches the upgrade from source async call.
    pub fn upgrade_async_call_and_exit(self)
```

Syntax-wise, both of these calls are executed using `.upgrade_async_call_and_exit()`, but the transaction setup differs for each type.

For a simple `raw upgrade` transaction, we could write:
```rust title=adder.rs
    #[endpoint]
    fn raw_upgrade(&self, address: ManagedAddress, code: ManagedBuffer) {
        self.tx()
            .to(address)
            .raw_upgrade()
            .code(code)
            .code_metadata(CodeMetadata::UPGRADEABLE)
            .upgrade_async_call_and_exit();
    }
```

Similar to deploy calls, `.code()` is mandatory. We must either pass the code to the transaction, or to receive it from a specified location on the blockchain (from source).

In order to change this call into an `upgrade from source` call, replace the provided code with the source address, using `.from_source()`:

```rust title=adder.rs
    #[endpoint]
    fn raw_upgrade_from_source(&self, address: ManagedAddress, source: ManagedAddress) {
        self.tx()
            .to(address)
            .raw_upgrade()
            .from_source(source)
            .code_metadata(CodeMetadata::UPGRADEABLE)
            .upgrade_async_call_and_exit();
    }
```

