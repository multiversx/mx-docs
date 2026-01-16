---
id: crowdfunding-p2
title: Core Logic
---
[comment]: # (mx-abstract)
Define contract arguments, handle storage, process payments, define new types, write better tests

[comment]: # (mx-context-auto)

## Configuring the contract

[The previous chapter](crowdfunding-p1.md) left us with a minimal contract as a starting point.

The first thing we need to do is to configure the desired target amount and the deadline. The deadline will be expressed as the block timestamp (in milliseconds) after which the contract can no longer be funded. We will be adding 2 more storage fields and arguments to the constructor.

For now, we'll hardcode the contract to only accept EGLD. First, let's add the necessary import at the top of the file:

```rust
use multiversx_sc::imports::*;
```

Now let's add the storage mappers and init function:

```rust
#[view(getTarget)]
#[storage_mapper("target")]
fn target(&self) -> SingleValueMapper<BigUint>;

#[view(getDeadline)]
#[storage_mapper("deadline")]
fn deadline(&self) -> SingleValueMapper<TimestampMillis>;

#[view(getDeposit)]
#[storage_mapper("deposit")]
fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[view(getCrowdfundingTokenId)]
#[storage_mapper("tokenIdentifier")]
fn cf_token_id(&self) -> SingleValueMapper<TokenId>;

#[init]
fn init(&self, target: BigUint, deadline: TimestampMillis) {
    // only support EGLD for now
    self.cf_token_id().set(TokenId::egld());
    
    require!(target > 0, "Target must be more than 0");
    self.target().set(target);
    
    require!(
        deadline > self.get_current_time_millis(),
        "Deadline can't be in the past"
    );
    self.deadline().set(deadline);
}

fn get_current_time_millis(&self) -> TimestampMillis {
    self.blockchain().get_block_timestamp_millis()
}
```

The `cf_token_id()` storage mapper will hold the token identifier for our crowdfunding campaign. We initialize it to `TokenId::egld()` in the `init` function, hardcoding it to EGLD for now. In Part 3, we'll make this configurable to support any token.

`TimestampMillis` is a type-safe wrapper for millisecond timestamps, providing better type safety than using raw `u64` values.

:::note Private functions
Note that `get_current_time_millis()` is not annotated with `#[endpoint]` or `#[view]`. This makes it a **private helper function** that can only be called from within the contract, not from external transactions. Private functions are useful for organizing code and avoiding duplication, but they cannot be called directly by users or other contracts.
:::

The deadline being a block timestamp can be expressed as a 64-bits unsigned integer `TimestampMillis`. The target, however, being a sum of EGLD cannot.

:::note
 1 EGLD = 10<sup>18</sup> EGLD-wei, also known as atto-EGLD.

It is the smallest unit of currency, and all payments are expressed in wei. The same applies to ESDT tokens, where the smallest unit depends on the token's number of decimals.
:::

Even for small payments, the numbers get large. Luckily, the framework offers support for big numbers out of the box. Two types are available: [**BigUint**](/docs/developers/best-practices/biguint-operations.md) and **BigInt**.

:::tip
Try to **avoid** using the signed version whenever possible, unless negative values are truly needed. There are some caveats with **BigInt** argument serialization that can lead to **subtle bugs**.
:::

Note that BigUint logic is not implemented within the contract itself but is provided by the MultiversX VM API to keep the contract code lightweight.

Let's test that initialization works.

First, navigate to the contract's crate path and rebuild it using:

```bash
sc-meta all build
```

Next, we regenerate the proxy at the same path using:

```bash
sc-meta all proxy
```

Finally, we update the test:

```rust
#[test]
fn crowdfunding_deploy_test() {
    let mut world = world();

    world.account(OWNER).nonce(0).balance(1000000);

    let crowdfunding_address = world
        .tx()
        .from(OWNER)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .init(500_000_000_000u64, 123000u64)
        .code(CODE_PATH)
        .new_address(CROWDFUNDING_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(crowdfunding_address, CROWDFUNDING_ADDRESS.to_address());

    world.check_account(OWNER).balance(1_000_000);

    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .target()
        .returns(ExpectValue(500_000_000_000u64))
        .run();
    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .deadline()
        .returns(ExpectValue(123000u64))
        .run();
}
```

Note the added arguments in the deploy call and the additional query for the `deadline` storage.

Run the test again from the contract crate's path:

```bash
sc-meta test
```

[comment]: # (mx-context-auto)

## Funding the contract

It is not enough to receive the funds, the contract also needs to keep track of who donated how much. Additionally, we need to validate that the correct token is being sent.

```rust
#[view(getDeposit)]
#[storage_mapper("deposit")]
fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[endpoint]
#[payable]
fn fund(&self) {
    let payment = self.call_value().single();
    
    require!(
        payment.token_identifier == self.cf_token_id().get(),
        "wrong token"
    );
    
    let caller = self.blockchain().get_caller();
    self.deposit(&caller).update(|deposit| *deposit += payment.amount.as_big_uint());
}
```

:::tip
Every time the contract is modified, you need to rebuild it and regenerate the proxy.
:::

A few things to unpack:

1. This storage mapper has an extra argument, for an address. This is how we define a map in the storage. The donor argument will become part of the storage key. Any number of such key arguments can be added, but in this case we only need one. The resulting storage key will be a concatenation of the specified base key `"deposit"` and the serialized argument.
2. We encounter the first payable function. By default, any function in a smart contract is not payable, i.e. sending EGLD to the contract using the function will cause the transaction to be rejected. Payable functions need to be annotated with `#[payable]`.
3. `call_value().single()` gets the payment as a `Payment` structure, which we then validate against our stored EGLD token identifier from `cf_token_id()`.
4. `fund` needs to also be explicitly declared as an endpoint. All `#[payable]` methods need to be marked `#[endpoint]`, but not the other way around.

To test the function, we will add a new test, in the same `crowdfunding_blackbox_test.rs` file. Let's call it `crowdfunding_fund_test()` .

To avoid duplicate code, we will put all the deployment and account setup logic into a function called `crowdfunding_deploy()`. This function will return a **ScenarioWorld** response, which gives us the **state of the mocked chain** after setting up an account with the OWNER address and deploying the crowdfunding contract.

```rust
fn crowdfunding_deploy() -> ScenarioWorld {
    let mut world = world();

    world.account(OWNER).nonce(0).balance(1000000);

    let crowdfunding_address = world
        .tx()
        .from(OWNER)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .init(500_000_000_000u64, 123000u64)
        .code(CODE_PATH)
        .new_address(CROWDFUNDING_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(crowdfunding_address, CROWDFUNDING_ADDRESS.to_address());

    world
}
```

Now that we've moved the deployment logic to a separate function, let's update the test that checks the deploy endpoint like this:

```rust
#[test]
fn crowdfunding_deploy_test() {
    let mut world = crowdfunding_deploy();
    world.check_account(OWNER).balance(1_000_000);

    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .target()
        .returns(ExpectValue(500_000_000_000u64))
        .run();
    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .deadline()
        .returns(ExpectValue(123000u64))
        .run();
}
```

With the code organized, we can now start developing the test for the fund endpoint.

```rust
const DONOR: TestAddress = TestAddress::new("donor");

fn crowdfunding_fund() -> ScenarioWorld {
    let mut world = crowdfunding_deploy();

    world.account(DONOR).nonce(0).balance(400_000_000_000u64);

    world
        .tx()
        .from(DONOR)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .fund()
        .egld(250_000_000_000u64)
        .run();

    world
}

#[test]
fn crowdfunding_fund_test() {
    let mut world = crowdfunding_fund();

    world.check_account(OWNER).nonce(1).balance(1_000_000u64);
    world
        .check_account(DONOR)
        .nonce(1)
        .balance(150_000_000_000u64);
    world
        .check_account(CROWDFUNDING_ADDRESS)
        .nonce(0)
        .balance(250_000_000_000u64);

    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .target()
        .returns(ExpectValue(500_000_000_000u64))
        .run();
    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .deadline()
        .returns(ExpectValue(123_000u64))
        .run();
    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .deposit(DONOR)
        .returns(ExpectValue(250_000_000_000u64))
        .run();
}

```

Explanation:

1. We need a **donor**, so we add another account using `.account(DONOR)`.
2. The simulated transaction includes:
   - [Sender](/docs/developers/transactions/tx-from.md): `.from(DONOR)`
   - [Receiver](/docs/developers/transactions/tx-to.md): `.to(CROWDFUNDING_ADDRESS)`.
3. The [payment](/docs/developers/transactions/tx-payment.md) in the transaction is made using `.egld(250_000_000_000u64)`.
4. When checking the state, we see that the **donor's balance is decreased** by the amount paid, and the **contract balance increased** by the same amount.

Run again the following command in the root of the project to test it:

```bash
sc-meta test
```

You should then see that both tests pass:

```bash
Running tests in ./ ...
Executing cargo test ...
   Compiling crowdfunding v0.0.0 (/home/crowdfunding)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.22s
     Running unittests src/crowdfunding.rs (target/debug/deps/crowdfunding-73d2b98f9e2cff29)

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

     Running tests/crowdfunding_blackbox_test.rs (target/debug/deps/crowdfunding_blackbox_test-19b9f0d2428bc9f9)

running 2 tests
test crowdfunding_deploy_test ... ok
test crowdfunding_fund_test ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s

   Doc-tests crowdfunding

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

Process finished with: exit status: 0
```

[comment]: # (mx-context-auto)

## Validation

It doesn't make sense to create a funding that has the target 0 or a negative number, so target needs to be more than 0. Similarly, it’s unreasonable to create a fundraiser with a deadline in the past, so the deadline must be in the future relative to when the contract is deployed.

```rust
#[init]
fn init(&self, target: BigUint, deadline: TimestampMillis) {
    self.cf_token_id().set(TokenId::egld());
    
    require!(target > 0, "Target must be more than 0");
    self.target().set(target);

    require!(
        deadline > self.get_current_time_millis(),
        "Deadline can't be in the past"
    );
    self.deadline().set(deadline);
}
```

Additionally, it doesn't make sense to accept funding after the deadline has passed, so any fund transactions after a certain block timestamp should be rejected. The idiomatic way to handle this is:

```rust
#[endpoint]
#[payable]
fn fund(&self) {
    let payment = self.call_value().single();
    
    require!(
        payment.token_identifier == self.cf_token_id().get(),
        "wrong token"
    );

    let current_time = self.blockchain().get_block_timestamp_millis();
    require!(current_time < self.deadline().get(), "cannot fund after deadline");

    let caller = self.blockchain().get_caller();
    self.deposit(&caller).update(|deposit| *deposit += payment.amount.as_big_uint());
}
```

:::tip
The [`require!`](/docs/developers/developer-reference/sc-messages.md#require) macro is used for enforcing conditions.
:::

We will create another test to verify that the validation works: `crowdfunding_fund_too_late_test()` .

```rust
#[test]
fn crowdfunding_fund_too_late_test() {
    let mut world = crowdfunding_fund();

    world.current_block().block_timestamp_millis(123_001u64);

    world
        .tx()
        .from(DONOR)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .fund()
        .egld(10_000_000_000u64)
        .with_result(ExpectError(4, "cannot fund after deadline"))
        .run();
}
```

Now the same donor wants to donate, again, but in the meantime the current block timestamp has become `123_001`, one block later than the deadline.

The transaction **fails** with status 4. The testing environment allows us to also check that the proper error  message was returned.

:::info
Status 4 indicates a user error. All errors originating within the contract will return this status.
:::

By testing the contract again, you should see that all three tests pass:

```bash
Running tests/crowdfunding_blackbox_test.rs (target/debug/deps/crowdfunding_blackbox_test-19b9f0d2428bc9f9)

running 3 tests
test crowdfunding_deploy_test ... ok
test crowdfunding_fund_test ... ok
test crowdfunding_fund_too_late_test ... ok

test result: ok. 3 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s
```

[comment]: # (mx-context-auto)

## Querying for the contract status

The contract status can be known by anyone by looking into the storage and on the blockchain, but it is really inconvenient right now.

Let's create an endpoint that gives this status directly. The status will be one of: `FundingPeriod`, `Successful` or `Failed`.

We could use a number to represent it in code, but the nice way to do it is with an enum. We will take this opportunity to show how to create a serializable type that can be taken as argument, returned as result or saved in storage.

This is the enum:

```rust
#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Clone, Copy)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}
```

Make sure to add it outside the contract trait.

Don't forget to add the import for the derive types. This can be place on top off the file, replacing `use multiversx_sc::imports::*;` with:

```rust
use multiversx_sc::{derive_imports::*, imports::*};
```

The `#[derive]` keyword in Rust allows you to automatically implement certain traits for your type. `TopEncode` and `TopDecode` mean that objects of this type are serializable, which means they can be interpreted from/to a string of bytes.

`#[type_abi]` is needed to export the type when you want to interact with the already deployed contract. This is out of scope of this tutorial though.

`PartialEq`, `Clone` and `Copy` are Rust traits. `PartialEq` trait allows your type instances to be compared with the `==` operator. `Clone` and `Copy` traits allow your object instances to be clone/copied respectively.

We can now use the type **Status** just like we use the other types, so we can write the following method in the contract trait:

```rust
#[view]
fn status(&self) -> Status {
    if self.get_current_time_millis() < self.deadline().get() {
        Status::FundingPeriod
    } else if self.get_current_funds() >= self.target().get() {
        Status::Successful
    } else {
        Status::Failed
    }
}

#[view(getCurrentFunds)]
fn get_current_funds(&self) -> BigUint {
    let token = self.cf_token_id().get();
    self.blockchain().get_sc_balance(&token, 0)
}
```

We will also modify the `require` condition in the `fund` endpoint to ensure that the deposit can only be made during the **FundingPeriod**.

```rust
#[endpoint]
#[payable]
fn fund(&self) {
    let payment = self.call_value().single();
    
    require!(
        payment.token_identifier == self.cf_token_id().get(),
        "wrong token"
    );

    require!(
        self.status() == Status::FundingPeriod,
        "cannot fund after deadline"
    );

    let caller = self.blockchain().get_caller();
    self.deposit(&caller)
        .update(|deposit| *deposit += payment.amount.as_big_uint());
}
```

To test `status` method, we update the last test we worked on, `crowdfunding_fund_too_late_test()`:

```rust
use crowdfunding::crowdfunding_proxy::{self, Status};

#[test]
fn crowdfunding_fund_too_late_test() {
    /*
        Code before updating
    */

    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .status()
        .returns(ExpectValue(Status::Failed))
        .run();
}
```

:::info
The return response checked in the query is an enum defined in the crowdfunding proxy, thus you have to import `crowdfunding_proxy::Status`.
:::

[comment]: # (mx-context-auto)

## Claim functionality

Finally, let's add the `claim` method. The `status` method we just implemented helps us keep the code tidy:

```rust
#[endpoint]
fn claim(&self) {
    match self.status() {
        Status::FundingPeriod => sc_panic!("cannot claim before deadline"),
        Status::Successful => {
            let caller = self.blockchain().get_caller();
            require!(
                caller == self.blockchain().get_owner_address(),
                "only owner can claim successful funding"
            );

            let token_identifier = self.cf_token_id().get();
            let sc_balance = self.get_current_funds();

            if let Some(sc_balance_non_zero) = sc_balance.into_non_zero() {
                self.tx()
                    .to(&caller)
                    .payment(Payment::new(token_identifier, 0, sc_balance_non_zero))
                    .transfer();
            }
        },
        Status::Failed => {
            let caller = self.blockchain().get_caller();
            let deposit = self.deposit(&caller).get();

            if deposit > 0u32 {
                let token_identifier = self.cf_token_id().get();
                self.deposit(&caller).clear();

                if let Some(deposit_non_zero) = deposit.into_non_zero() {
                    self.tx()
                        .to(&caller)
                        .payment(Payment::new(token_identifier, 0, deposit_non_zero))
                        .transfer();
                }
            }
        },
    }
}
```

[`sc_panic!`](/docs/developers/developer-reference/sc-messages.md) has the same functionality as [`panic!`](https://doc.rust-lang.org/std/macro.panic.html) from Rust, with the difference that it works in a no_std environment.

We use the modern [transaction syntax](/developers/transactions/tx-overview) with `.tx()` to send tokens. We convert amounts to `NonZeroUsize` to ensure we only transfer when there's actually something to send, preventing unnecessary transactions with zero amounts.

[comment]: # (mx-context-auto)

## Conclusion

Congratulations! You've successfully built a crowdfunding smart contract with:

- EGLD-based funding mechanism
- Time-based campaign management
- Status tracking (FundingPeriod, Successful, Failed)
- Claim functionality for both successful campaigns and refunds
- Comprehensive testing

As an exercise, try to add some more tests, especially ones involving the claim function under different scenarios.

[comment]: # (mx-context-auto)

## Next Steps

- **Part 3**: In the [next chapter](crowdfunding-p3.md), we'll generalize the contract to accept any fungible token, not just EGLD
- **View the complete code**: Check out the [final contract code](final-code.md) with detailed explanations
- **Explore more examples**: Visit the [MultiversX contracts repository](https://github.com/multiversx/mx-contracts-rs) for more smart contract examples
