---
id: tx-env
title: Environments (Călin)
---

[comment]: # (mx-abstract)

## Overview

When discussing the unified transaction syntax, we identify four primary environments crucial for developing and deploying secure smart contracts on MultiversX. This design aims to cover all essential development stages, ensuring a seamless workflow. Notably, it streamlines the process for Rust developers by empowering them to solely concentrate on mastering Rust. As a result, they can effortlessly write, test, deploy, and interact with smart contracts without the burden of learning additional complementary technologies.

The environments:
- Smart contract - Rust framework, the syntax for writing smart contracts (`TxScEnv`)
- Integration test - Rust testing framework, used for writing Rust tests against the Rust VM and Go VM (`ScenarioTxEnv`, `ScenarioEnvExec`, `ScenarioTxEnvData`)
- Parametric test - symbolic execution, safety of the smart contract code (coming soon...)
- Interactor - Rust microservice, used for system testing and interaction with the smart contract on the real blockchain (`InteractorExecEnv`, `InteractorQueryEnv`)

:::info
The Rust unified syntax is able to interact with all of these environments, meaning that the syntax remains the same for all purposes mentioned above. The only element that changes the route of the transaction (whether it's going to be run inside a `smart contract`, `test`, or `interactor`) is the environment `TxEnv`. 

Creating a transaction with a specific environment gives the developer access to the specific functions used in said environment only. 
:::

Switching between environments is accessible for the developer and enforced by the Rust type system. Each environment is represented by a different type, and switching between environments can be easily done by specializing the `TxEnv` generic of the transaction with a concrete value from the pool of available environments. 

Each transaction starts from the environment, then multiple smaller bits of information are added in a modular way so that the generics of the `Tx` object are instantiated one by one and the route of the transaction is defined. The developer is not forced to complete the transaction in any way, but the route of the transaction is narrowed down by the types used at every step. 

For example, let's suppose we are in the smart contract environment of `SomeContract`:

```rust title=lib.rs
#[multiversx_sc::contract]
pub trait SomeContract {

    #[endpoint]
    fn deploy_another_contract(
        &self,
        code_metadata: CodeMetadata,
        source: ManagedAddress,
        deploy_arg: Option<u64>
    ) -> ManagedAddress {
        self.tx() // TxScEnv - smart contract environment
            .raw_deploy() // TxScEnv + DeployCall - deploy tx in a sc environment
            .from_source(source) // deploy detail, further defines DeployCall
            .code_metadata(code_metadata) // deploy detail
            .argument(&deploy_arg) // deploy argument
            .returns(ReturnsNewManagedAddress) // result handler - expected return type
            .sync_call() // type of call
    }
}
```

In this example, the endpoint `deploy_another_contract` performs a smart contract deploy action with specific parameters. First, we define the tx environment with `self.tx()`, which automatically translates to `TxScEnv` inside the smart contract. Then, we add bits of information to the transaction, such as the type of action we are looking for: `.raw_deploy()`. This narrows down our environment to `TxScEnv` and also specializes our `TxData` generic field as a `DeployCall`, which now creates a route for our transaction (deploy) and gives us access to other functions that can help the deploy action only.

:::info
Once the environment is selected, developers have four methods to narrow down the route of the transaction::
- `.raw_call("function_name")` - creates a raw call to a smart contract (function name can also be empty)
- `.raw_deploy()` - creates a deploy call, can not have a recipient
- `.raw_upgrade()` - creates an upgrade call
- `.typed(proxy::ContractProxy)` - creates a typed call through a contract proxy, knows the expected return type of the endpoint
:::

:::note
Apart from the environment, developers are not obliged to include any specific details within a transaction. They have the freedom to construct the transaction in any manner they see fit, provided that the transaction ultimately contains sufficient information to execute the intended action accurately.
:::

[comment]: # (mx-context-auto)

## Smart contract

A transaction with the smart contract environment can be created from inside the smart contract (annotated with `#[multiversx_sc::contract]`), by simply calling `self.tx()`. The returned transaction env is `TxScEnv` by default, which helps us build transactions in this environment.

```rust
        self.tx() // TxScEnv - smart contract environment
            .to(address) // receiver
            .gas(10_000_00u64) // gas limit
            .raw_call(function_name) // raw endpoint call
            .arguments_raw(args) // arguments as ManagedArgBuffer
            .payment(payments) // payment (can be single value or vec)
            .returns(ReturnsResult) // result handler - returns expected type
            .async_call(); // call type - signals async call
```


[comment]: # (mx-context-auto)

## Integration test

world.tx()....
world.query()....


[comment]: # (mx-context-auto)

## Parametric tests

not yet available

## Interactor

self.interactor.tx()....
get help from: `sc-meta all snippets --overwrite`

## Feature table - Andrei

```
table ---> to, from, ...
  |
  |
  v
environments
```

[comment]: # (mx-context-auto)

## Implementation details - Andrei (optional)
