---
id: tx-migration
title: Migration
---

[comment]: # (mx-abstract)

There is an older syntax for producing contract calls, detailed [here](tx-legacy-calls). It is already in use in many projects.

Upgrading to framework version 0.49.0 is almost completely backwards compatible, but the new syntax is nicer and more reliable, so we encourage everyone to migrate.

This will be a migration guide, as well as some frequently encountered pitfalls.

:::caution
Even though the syntax is backwards compatible, the implementation of the [old syntax](tx-legacy-calls) has been replaced.

To the best of our knowledge, all code should continue to behave the same. However, if you upgrade beyond 0.49.0, please make sure to **test your smart contract fully** once again, even if you do not change a single line of code in your code base.

Do not be fooled by the identical legacy syntax, the implementation for **all** contract calls is new.
:::


[comment]: # (mx-context-auto)

## Imports

This is not strictly related to the unified syntax, but the imports were recently cleaned up. A single line should be enough for each of the contexts, as follows:
- In contracts: `use multiversx_sc::imports::*;`
- In tests: `use multiversx_sc_scenario::imports::*;`
- In interactors: `use multiversx_sc_snippets::imports::*;`

We also have `use multiversx_sc::derive_imports::*;`, which gives you derives like `TypeAbi` and the codec derives.

The proxies have `use multiversx_sc::proxy_imports::*;`, but that gets generated automatically, so develoeprs shouldn't worry about it.



[comment]: # (mx-context-auto)

## Old `Proxy` type caveat

We must start with the only instance of backwards incompatibility that we have after 0.49.0.

It is very uncommon to encounter this problem, we don't expect developers to encounter it, but it did pop up in the DEX when migrating.

The old `Proxy` type has been split in two: `Proxy` no longer includes the field for the recipient, whereas there is a new `ProxyTo` type that does include it.

Whenever you encounter code of this sort, everything should remain unchanged:

```rust
    #[proxy]
    fn vault_proxy(&self) -> vault::Proxy<Self::Api>;
```

If, however, your proxy getter looks like this, the return type has changed, the return type is now `ProxyTo`:

```rust
    #[proxy]
    fn vault_proxy(&self, sc_address: ManagedAddress) -> vault::Proxy<Self::Api>;
```

To preserve backwards compatibility in this case as well, we placed a hack in the pre-processor stage: the `Proxy` return type is silently replaced by `ProxyTo` in the background, unbeknownst to the developer. For all practical purposes, the code should still be functioning the same way.

If, however, the developer does not use the legacy proxy object directly, i.e. it returns it, or passes it on to another function, the framework cannot do the replacement there, and you might get a compilation error.

The solution in this case is simple: replace `Proxy` with `ProxyTo` in code.



[comment]: # (mx-context-auto)

## Replace `#[derive(TypeAbi)]` with `#[type_abi]`

To use the new proxies, one must first [generate](tx-proxies#how-to-generate) them. The proxy is designed to be self-contained, so unless configured otherwise, it will also output a copy of the contract types involved in the ABI.

No methods of these types are copied, but the annotations are important most of the time, so they need to be copied too. These types will need the encode/decode annotations, as well as `Clone`, `Eq`, etc.

In order to do this, the proxy generator (via `TypeAbi`) needs to know what type annotations were originally declared. It turns out, derive annotations in Rust don't have access to the other derives that were declared on the same line. For instance, `B` does not see `A` in `#[derive(A, B)]`.

The solution is to have another annotation, called `#[type_abi]` **before** the derives.

Currently, `#[type_abi]` takes no arguments and works the same way as `#[derive(TypeAbi)]`, but it might be extended in the future.

This is yet the case, but `#[derive(TypeAbi)]` might become deprecated at some point in the future, after most projects will have been migrate.


[comment]: # (mx-context-auto)

## Generate the new proxies

Just like for a new project, you will need to [generate](tx-proxies#how-to-generate) the new proxies and embed them in your project.


[comment]: # (mx-context-auto)

## Replace the old proxies in calls

You might have this kind of syntax in your contract. You can easily find it by searching in your project for `#[proxy]` or `.contract(`.

```rust title="Variant A"
    #[proxy]
    fn vault_proxy(&self) -> vault::Proxy<Self::Api>;

    #[endpoint]
    fn do_call(&self, to: ManagedAddress, args: MultiValueEncoded<ManagedBuffer>) {
        self.vault_proxy()
            .contract(to)
            .echo_arguments(args)
            .async_call()
            .with_callback(self.callbacks().echo_args_callback())
            .call_and_exit();
    }
```

```rust title="Variant B"
    #[proxy]
    fn vault_proxy(&self, sc_address: ManagedAddress) -> vault::Proxy<Self::Api>;

    #[endpoint]
    fn do_call(&self, to: ManagedAddress, args: MultiValueEncoded<ManagedBuffer>) {
        self.vault_proxy(to)
            .echo_arguments(args)
            .async_call()
            .with_callback(self.callbacks().echo_args_callback())
            .call_and_exit();
    }


```

```rust title="Replace by"
    #[endpoint]
    fn do_call(&self, to: ManagedAddress, args: MultiValueEncoded<ManagedBuffer>) {
        self.tx()
            .to(&to)
            .typed(vault_proxy::VaultProxy)
            .echo_arguments(args)
            .async_call()
            .with_callback(self.callbacks().echo_args_callback())
            .call_and_exit();
    }
```

Both variants above should be replaced by this pattern.

:::info
The new proxies no longer have a recipient field in them. The [recipient (to) field](tx-to) is completely independent. It is set the same way for transactions with or without proxies.

This feature has proven not worth the complication, we are happy to see it go.
:::

Once you've done this, you can safely delete all the old proxy getters (all methods annotated with `#[proxy]`).

You can also delete all proxy trait imports of the form `my_module::ProxyTrait as _`. The new proxies require no trait imports.


:::info
The explicit proxies (traits annotated with `#[multiversx_sc::proxy]`) do not yet have an equivalent in the new syntax.

It's ok to not migrate them yet.

Of course, it is possible rewrite them in the style of the new proxies, but in the absence of code generation, this might be tedious.

A solution is planned for the near future.
:::


In case you want to migrate to the unified syntax and you cannot, or do not want to get rid of the old proxies, this is an alternative transitional syntax:

```rust title="Transitional variant"
    #[proxy]
    fn vault_proxy(&self, sc_address: ManagedAddress) -> vault::Proxy<Self::Api>;

    #[endpoint]
    fn do_call(&self, to: ManagedAddress, args: MultiValueEncoded<ManagedBuffer>) {
        self.tx()
            .legacy_proxy_call(self.vault_proxy(to).echo_arguments(args))
            .async_call()
            .with_callback(self.callbacks().echo_args_callback())
            .call_and_exit();
    }
```




[comment]: # (mx-context-auto)

## (Optional) Remove contract dependencies

The new proxies can be copy-pasted between contract crates. This means that a caller's contract no longer needs to depend on its callees, in order to obtain the proxy. Once the new proxies are set up, you might be able to get rid of the dependency.

This also means contracts no longer need to be on the same framework version. The same proxy, once generated, should work with any framework version the caller uses, irrespective of the callee.

:::info
Dependencies might still be needed for shared structures and modules.
:::



[comment]: # (mx-context-auto)

## Replace method names

To achieve backwards compatibility, all the old methods were kept (even though their implementations changed).

We did not yet deprecate the old ones, but we encourage everyone to switch to the new ones. They have shorter names and tend to be more expressive.

| Old method | New method | Comments |
| ---------- | ---------- | -----|
| `.with_egld_transfer(amount)` | `.egld(amount)` | |
| `.with_esdt_transfer((token, nonce, amount))` | `.esdt((token, nonce, amount))`<br /> or <br />`.single_esdt(&token, nonce, &amount)` | `single_esdt` can deal with references, instead of taking owned objects. |
| `.with_multi_token_transfer(p)` | `.payment(p)` | `payment` is universal. |
| `.with_egld_or_single_esdt_transfer(p)` | `.payment(p)` | Method `payment` is universal. |
| `.with_gas_limi(gas)` | `.gas(gas)` | |
| `.with_extra_gas_for_callback(gas)` | `.gas_for_callback(gas)` | Method `payment` is universal. |
| `.async_call()` | - | Does nothing, can be removed with no consequences. |
| `.async_call_promise()` | - | Does nothing, can be removed with no consequences. |
| `.with_callback(cb)` | `.callback(cb)` | |
| `.deploy_contract(code, code_metadata)` | `.code(code)`<br />`.code_metadata(code_metadata)`<br />`.sync_call()` | Also add result handlers for decoding the result. |
| `.deploy_from_source(address, code_metadata)` | `.from_source(code)`<br />`.code_metadata(code_metadata) .sync_call()` | Also add result handlers for decoding the result. |
| `.upgrade_contract(code, code_metadata)` | `.code(code) .code_metadata(code_metadata) .upgrade_async_call_and_exit()` | Upgrades are async calls. |
| `.upgrade_from_source(address, code_metadata)` | `.from_source(code)`<br />`.code_metadata(code_metadata)`<br />`.upgrade_async_call_and_exit()` | Upgrades are async calls. |
| `.execute_on_dest_context()` | `.sync_call()` | Also add result handlers for decoding the result. |
| `.execute_on_dest_context`<br />`_with_back_transfers()` | `.returns(ReturnsBackTransfers)`<br />`.sync_call()` | Add additional result handlers for decoding the result. |



[comment]: # (mx-context-auto)

## Black-box tests

We have not extensively advertised the scenario-based black-box tests, knowing they would eventually be superseded by the unified transaction syntax.

If, however, you got to develop on that syntax, here is how to migrate to the new one.

```rust title=before_migration.rs
use multiversx_sc_scenario::{scenario_model::*, *};

const ADDER_PATH_EXPR: &str = "mxsc:output/adder.mxsc.json";

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace("contracts/examples/adder");

    blockchain.register_contract(ADDER_PATH_EXPR, adder::ContractBuilder);
    blockchain
}

#[test]
fn adder_blackbox_raw() {
    let mut world = world();
    let adder_code = world.code_expression(ADDER_PATH_EXPR);

    world
        .set_state_step(
            SetStateStep::new()
                .put_account("address:owner", Account::new().nonce(1))
                .new_address("address:owner", 1, "sc:adder"),
        )
        .sc_deploy(
            ScDeployStep::new()
                .from("address:owner")
                .code(adder_code)
                .argument("5")
                .expect(TxExpect::ok().no_result()),
        )
        .sc_query(
            ScQueryStep::new()
                .to("sc:adder")
                .function("getSum")
                .expect(TxExpect::ok().result("5")),
        )
        .sc_call(
            ScCallStep::new()
                .from("address:owner")
                .to("sc:adder")
                .function("add")
                .argument("3")
                .expect(TxExpect::ok().no_result()),
        )
        .check_state_step(
            CheckStateStep::new()
                .put_account("address:owner", CheckAccount::new())
                .put_account(
                    "sc:adder",
                    CheckAccount::new().check_storage("str:sum", "8"),
                ),
        );
}
```

This was the old blackbox code from the `adder` contract, present in framework version `0.48.0`. 

Migrating this test to unified syntax means, in a nutshell, separating each action into different steps, replacing verbose `CheckStateStep` and `SetStateStep` with their specific state builders, and replacing the interactions with actual transactions (deploy, query, call).

This is how the migrated test looks like:
```rust title=after_migration.rs
use multiversx_sc_scenario::imports::*;

use adder::*;

// new types
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const ADDER_ADDRESS: TestSCAddress = TestSCAddress::new("adder");
const CODE_PATH: MxscPath = MxscPath::new("output/adder.mxsc.json");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.register_contract(CODE_PATH, adder::ContractBuilder);
    blockchain
}

#[test]
fn adder_blackbox() {
    let mut world = world(); // ScenarioWorld

    // starting mandos trace
    world.start_trace();

    // set state for owner
    world.account(OWNER_ADDRESS).nonce(1);

    // deploy the contract
    let new_address = world
        .tx() // tx with test environment
        .from(OWNER_ADDRESS)
        .typed(adder_proxy::AdderProxy) // typed call - proxy
        .init(5u32) // deploy call
        .code(CODE_PATH)
        .new_address(ADDER_ADDRESS) // custom deploy address for tests
        .returns(ReturnsNewAddress) // returns new address after deploy
        .run(); // send transaction

    assert_eq!(new_address, ADDER_ADDRESS.to_address());

    // query the contract, `sum` view
    world
        .query() // tx with test query environment
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy) // typed call - proxy
        .sum()
        .returns(ExpectValue(5u32)) // asserts returned value == 5u32
        .run(); // send transaction

    // contract call, `add` endpoint
    world
        .tx() // tx with test environment
        .from(OWNER_ADDRESS)
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy) // typed call - proxy
        .add(1u32)
        .run(); // send transaction

    // query the contract, `sum view`
    world
        .query() // tx with test query environment
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy) // typed call - proxy
        .sum()
        .returns(ExpectValue(6u32)) // asserts returned value == 6u32
        .run(); // send transaction

    // check state for owner
    world.check_account(OWNER_ADDRESS);

    // check state for adder
    world
        .check_account(ADDER_ADDRESS)
        .check_storage("str:sum", "6");

    // write mandos trace to file
    world.write_scenario_trace("trace1.scen.json");
}
```
