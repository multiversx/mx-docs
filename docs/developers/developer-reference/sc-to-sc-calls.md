---
id: sc-to-sc-calls
title: SC to SC Calls
---
[comment]: # (mx-abstract)

This guide provides an overview of the different types of smart contract calls that originate from other smart contract calls.

[comment]: # (mx-context-auto)

## Introduction

Smart contract calls on MultiversX fall into two main categories: synchronous (`sync`) and asynchronous (`async`), each with distinct usage scenarios based on developer needs, and dApp architecture.


[comment]: # (mx-context-auto)

## Overview

[comment]: # (mx-context-auto)

### Sync calls vs. async calls


A `sync` call is similar to regular function call in a program: it relies on a call stack, the current execution is paused, the call is executed immediately, and execution of the caller function resumes immediately after.

An `async` call is similar to an asynchronous function call in a program, just like launching it on a different thread. The async call is not added to the same stack and does not interrupt the execution of the caller function.

The main differences between the two are in this table: 

| `sync` calls | `async` calls |
| ------------ | ------------- |
| Are executed immediately, inline. | Are executed after the current transaction is completed. |
| Only work in the same shard. | Work both in-shard and cross-shard. |
| Function results are available immediately. | Function results are only available later, in the callback, if a callback exists. |
| A callee crash causes caller to immediately crash as well. | A callee crash does not cause caller to crash, the error can be caught in the callback, if it exists. |
| Reentrancy issues possible. | Reentrancy not possible. |


[comment]: # (mx-context-auto)

### Transfer-execute calls

Transfer-execute calls are basically async calls without callback. You can think of them as a "fire and forget" mechanism.

They come in two flavors:
- **Transfer-only** - they are used to move EGLD or ESDT balance, and nothing else. Balance transfers can rarely fail, so they are very convenient to use.
- **Transfer-and-execute** - used when the caller does not care what the result of the callee function is.

They were very important in async v1, because they were the only mechanism to have more than one call leaving a transaction.

[comment]: # (mx-context-auto)

### Error recovery

Error recovery is not possible with sync calls, so sometimes contracts might choose to perform async calls to allow themselves to recover from errors, even if the target contract is in the same shard.

This also means that no error handling is necessary (or effective) around sync calls.

[comment]: # (mx-context-auto)

### Reentrancy

Reentrancy is very unlikely on a MultiversX blockchain, but not impossible, so let's dedicate a chapter to it.

There are 2 main elements that make it less of an issue than on other blockchain architectures:
1. Native tokens are built into the system, so they cannot become malicious. Most reentrancy attacks are performed via malicious tokens that exploit intermediate states in the middle of function execution.
2. Reentrancy can only be performed in sync calls. Async calls do not interrupt the execution, so they are not vectors for an attack.

Even so, to avoid vulnerabilities it is best to perform sync calls either at the very beginning, or at the very end of a SC endpoint execution.

A similar problem to reentrancy is the management of the intermediate state between an async call and the processing of its callback. Great care must be taken, to ensure the state of the contract is not vulnerable to attacks in this interval.


[comment]: # (mx-context-auto)

### Async callbacks

Async calls can optionally register callbacks. The callbacks are called by the system, irrespective of whether the caller completed successfully or failed.

The callback receives the following inputs:
- The call result, which contains several values:
    - In case of success:
        - The status code, 0 in this case, in the first position.
        - One argument for each result returned by the callee, after that.
    - In case of error:
        - The status code, will be different from 0. For example, error code "4" indicates a failure in the smart contract execution. It is also in the first position.
        - One argument, containing the error message as string.
    - Note: it is customary to use type `ManagedAsyncCallResult<T>` since it knows how to conveniently decode this structure.
- The callback closure:
    - There might be multiple async calls involved in a smart contract interaction, it can sometimes be hard to figure out which callback came from which call. That is why it is almost always the case that some information needs to be passed directly from the call site to the callback.
    - This is done by adding arguments 

:::note
Async call functions do not return values, but may include a `callback` function to handle the response from the destination contract. This is because the results are never available immediately.
:::

This is an example of a callback function that gets triggered after an `issue_fungible` action:

```rust
    #[callback]
    fn esdt_issue_callback(
        &self,
        caller: &ManagedAddress,
        #[call_result] result: ManagedAsyncCallResult<()>,
    ) {
        let (token_identifier, returned_tokens) = 
            self.call_value().egld_or_single_fungible_esdt();
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

And this is how it gets called:

```rust
        self.send()
            .esdt_system_sc_proxy()
            .issue_fungible(/* ... arguments ... */)
            .with_callback(self.callbacks().esdt_issue_callback(&caller))
            .async_call_and_exit()
```

Notice how the caller gets passed from the call site directly to the callback.

Also notice how the tokens transferred back to the caller are available in the callback, as _call value_.



[comment]: # (mx-context-auto)

### All call types

Each of these calls further divide in multiple categories, depending on the mechanism they use, different developer use-cases and expected results.

- Sync calls
    - Sync call
    - Sync call same context
    - Sync call readonly
    - Deploy call
- Async calls
    - Async call (V1)
    - Register promise (V2)
    - Transfer execute
    - Upgrade call

We will now explain each of them in greater depth, and provide some syntax examples.

For the full syntax specification, visit the [unified transaction syntax](/developers/transactions/tx-overview) documentation.


[comment]: # (mx-context-auto)

## Sync calls


[comment]: # (mx-context-auto)

### Standard sync call

A standard sync call performs a direct, synchronous transaction to a contract on the same shard. This type of call is launched with `.sync_call()`.

```rust
    /// Executes transaction synchronously.
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

In this example, we are building a `sync call` to a `destination` smart contract address using the adder contract's proxy:

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


[comment]: # (mx-context-auto)

### Sync call, same context

This call operates in the same execution context as the source contract. This means that the callee code is executed over the caller's storage and context, so it's just like calling third-party code to deal with your storage.

It's essential that the code called in such a way is _trusted_, since we are granting it direct access to our entire storage.

It can be useful for having library-like smart contracts or plug-in systems. It is currently not used often.

To perform this type of call, use `.sync_call_same_context()`.

```rust
    /// Executes transaction synchronously, in the same context (performed in the name of the caller).
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call_same_context(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

In this example, we are building a `sync call` using the `same execution context` to a `destination` smart contract address using the adder contract's proxy:

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


[comment]: # (mx-context-auto)

### Sync call, readonly

This type of call performs a synchronous call in `readonly` mode, meaning the destination contract's state cannot be altered by this action. This type of call is performed with `.sync_call_readonly()`. 

```rust
    /// Executes transaction synchronously, in readonly mode (target contract cannot have its state altered).
    ///
    /// Only works with contracts from the same shard.
    pub fn sync_call_readonly(self) -> <RH::ListReturns as NestedTupleFlatten>::Unpacked
```

In this example, we are building a `sync call` in `readonly mode` to a `destination` smart contract address using the adder contract's proxy:

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

### Contract Deploy

On MultiversX contracts can currently only be deployed in the same shard as their deployer. The new address will always be generated in such a way that it always lands in the same shard, no matter the shard configuration.

It therefore makes sense that deploy calls are always synchronous.

During the deploy, the constructor of the new contract , `init`, is always called. All contracts must have this endpoint.

There are 2 types of deploy call:
- Deploy with explicit byte code (provided explicitly by the caller contract);
- Deploy from source (using bytecode from an existing source address). This is usually cheaper, since byte codes can be large, and processing or storing this code can incur significant gas costs.


Both of these calls are executed using `.sync_call()`, but the transaction setup differs for each type.

For a simple `raw deploy`, initiate a raw deploy transaction using the `.raw_deploy()` function, as shown below:

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


[comment]: # (mx-context-auto)

## Async calls



[comment]: # (mx-context-auto)

### Async call (V1)

The most common type of async call. This type of call can be executed with `.async_call_and_exit()`.

:::important
Async call uses the `async V1` mechanism.
:::

```rust
pub fn async_call_and_exit(self) -> ! 
```

This type of call always terminates the current transaction immediately. Any code coming after it will not be executed.

It is therefore only possible to have **one** such call per transaction.

In this example, we are building an `async V1 call` to a `destination` smart contract address using the adder contract's proxy:

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


[comment]: # (mx-context-auto)

### Register promise (V2)

Register promise performs an asynchronous promise call and allows multiple calls as such in a single transaction. To perform this type of call, use `.register_promise()`. 

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

Unlike the old async call, it is possible to have more than one `register_promise` call in a transaction. Execution is not terminated.

In this example, we are building an `async V2 call` to a `destination` smart contract address using the adder contract's proxy:

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

Just like the old async call, promises allow callbacks.

:::important
Promises callbacks must be annotated with `#[promises_callback]` instead of `#[callback]`.
:::


[comment]: # (mx-context-auto)

### Transfer execute

This call executes a transaction asynchronously without waiting for a callback. In order to perform this type of call use `.transfer_execute()`.

```rust
    /// Sends transaction asynchronously, and doesn't wait for callback ("fire and forget".)
    pub fn transfer_execute(self)
```

In this example, we are building an async call that **does not wait for a callback** (fire and forget) to a `destination` smart contract address using the adder contract's proxy:

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


[comment]: # (mx-context-auto)

### Upgrade call

If a smart contract is marked as **upgradeable**, its owner is allowed to upgrade the smart contract code to a newer version.

The upgrade call changes the code and causes the special endpoint `upgrade` to be called, analogous to how a deploy will call the `init` constructor.

Unlike deploy calls, it is possible to upgrade a contract from another shard. This is because, even though the original owner deployer will always be in the same shard as the contract, contract ownership can be transferred.

Similar to deploy calls, there are two types of expressing upgrade calls:
- Upgrade with explicit byte code (provided explicitly by the caller contract);
- Upgrade from source (using bytecode from an existing source address). This is usually cheaper, since byte codes can be large, and processing or storing this code can incur significant gas costs.

Since the upgrade call is an async call (v1), it also terminates execution immediately. It also accepts a callback.

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

