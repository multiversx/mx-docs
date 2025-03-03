---
id: crowdfunding-p2
title: Enhancing the Crowdfunding Smart Contract
---
[comment]: # (mx-abstract)
Define contract arguments, handle storage, process payments, define new types, write better tests

[comment]: # (mx-context-auto)

## Configuring the contract

[The previous chapter](/docs/developers/tutorials/crowdfunding-p1.md) left us with a minimal contract as a starting point.

The first thing we need to do is to configure the desired target amount and the deadline. The deadline will be expressed as the block timestamp after which the contract can no longer be funded. We will be adding 2 more storage fields and arguments to the constructor.

```rust
#[view(getTarget)]
#[storage_mapper("target")]
fn target(&self) -> SingleValueMapper<BigUint>;

#[view(getDeadline)]
#[storage_mapper("deadline")]
fn deadline(&self) -> SingleValueMapper<u64>;

#[view(getDeposit)]
#[storage_mapper("deposit")]
fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[init]
fn init(&self, target: BigUint, deadline: u64) {
    self.target().set(&target);
    self.deadline().set(&deadline);
}
```

The deadline being a block timestamp can be expressed as a regular 64-bits unsigned integer. The target, however, being a sum of EGLD cannot.

:::note
 1 EGLD = 10<sup>18</sup> EGLD-wei, also known as atto-EGLD.

It is the smallest unit of currency, and all payments are expressed in wei.
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

```rust title=crowdfunding_blackbox_test.rs
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

It is not enough to receive the funds, the contract also needs to keep track of who donated how much.

```rust
#[view(getDeposit)]
#[storage_mapper("deposit")]
fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

#[endpoint]
#[payable("EGLD")]
fn fund(&self) {
    let payment = self.call_value().egld();
    let caller = self.blockchain().get_caller();
    self.deposit(&caller).update(|deposit| *deposit += &*payment);
}
```

:::tip
Every time the contract is modified, you need to rebuild it and regenerate the proxy.
:::

A few things to unpack:

1. This storage mapper has an extra argument, for an address. This is how we define a map in the storage. The donor argument will become part of the storage key. Any number of such key arguments can be added, but in this case we only need one. The resulting storage key will be a concatenation of the specified base key `"deposit"` and the serialized argument.
2. We encounter the first payable function. By default, any function in a smart contract is not payable, i.e. sending a sum of EGLD to the contract using the function will cause the transaction to be rejected. Payable functions need to be annotated with `#[payable]`.
3. `fund` needs to also be explicitly declared as an endpoint. All `#[payable]`methods need to be marked `#[endpoint]`, but not the other way around.

To test the function, we will add a new test, in the same `crowdfunding_blackbox_test.rs` file. Let's call it `crowdfunding_fund_test()` .

To avoid duplicate code, we will put all the deployment and account setup logic into a function called `crowdfunding_deploy()`. This function will return a **ScenarioWorld** response, which gives us the **state of the mocked chain** after setting up an account with the OWNER address and deploying the crowdfunding contract.

```rust title=crowdfunding_blackbox_test.rs
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

```rust title=crowdfunding_blackbox_test.rs
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

```rust title=crowdfunding_blackbox_test.rs
const DONOR: TestAddress = TestAddress::new("donor");

fn crowdfunding_fund() -> ScenarioWorld {
    let mut world = deploy_crowdfunding();

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

It doesn't make sense to create a funding what has the target 0 or a negative number, so target needs to be more than 0. Similarly, it’s unreasonable to create a fundraiser with a deadline in the past, so the deadline must be in the future relative to when the contract is deployed.

```rust
#[init]
fn init(&self, target: BigUint, deadline: u64) {
    require!(target > 0, "Target must be more than 0");
    self.target().set(target);

    require!(
        deadline > self.get_current_time(),
        "Deadline can't be in the past"
    );
    self.deadline().set(deadline);
}
```

Additionally, it doesn't make sense to accept funding after the deadline has passed, so any fund transactions after a certain block timestamp should be rejected. The idiomatic way to handle this is:

```rust
#[endpoint]
#[payable("EGLD")]
fn fund(&self) {
    let payment = self.call_value().egld();

    let current_time = self.blockchain().get_block_timestamp();
    require!(current_time < self.deadline().get(), "cannot fund after deadline");

    let caller = self.blockchain().get_caller();
    self.deposit(&caller).update(|deposit| *deposit += &*payment);
}
```

:::tip
The [`require!`](/docs/developers/developer-reference/sc-messages.md#require) macro is used for enforcing conditions.
:::

We will create another test to verify that the validation works: `crowdfunding_fund_too_late_test()` .

```rust title=crowdfunding_blackbox_test.rs
#[test]
fn crowdfunding_fund_too_late_test() {
    let mut world = crowdfunding_fund();

    world.current_block().block_timestamp(123_001u64);

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
    if self.blockchain().get_block_timestamp() <= self.deadline().get() {
        Status::FundingPeriod
    } else if self.get_current_funds() >= self.target().get() {
        Status::Successful
    } else {
        Status::Failed
    }
}

#[view(getCurrentFunds)]
fn get_current_funds(&self) -> BigUint {
    self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
}
```

We will also modify the `require` condition in the `fund` endpoint to ensure that the deposit can only be made during the **FundingPeriod**.

```rust
#[endpoint]
#[payable("EGLD")]
fn fund(&self) {
    let payment = self.call_value().egld();

    require!(
        self.status() == Status::FundingPeriod,
        "cannot fund after deadline"
    );

    let caller = self.blockchain().get_caller();
    self.deposit(&caller)
        .update(|deposit| *deposit += &*payment);
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

            let sc_balance = self.get_current_funds();
            self.send().direct_egld(&caller, &sc_balance);
        },
        Status::Failed => {
            let caller = self.blockchain().get_caller();
            let deposit = self.deposit(&caller).get();

            if deposit > 0u32 {
                self.deposit(&caller).clear();
                self.send().direct_egld(&caller, &deposit);
            }
        },
    }
}
```

[`sc_panic!`](/docs/developers/developer-reference/sc-messages.md) has the same functionality as [`panic!`](https://doc.rust-lang.org/std/macro.panic.html) from Rust, with the difference that it works in a no_std environment.

`self.send().direct_egld()` forwards EGLD from the contract to the given address.

[comment]: # (mx-context-auto)

## The final contract code

If you followed all the steps presented until now, you should have ended up with a contract that looks something like:

```rust title=crowdfunding.rs
#![no_std]

use multiversx_sc::{derive_imports::*, imports::*};
pub mod crowdfunding_proxy;

#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Clone, Copy)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}

#[multiversx_sc::contract]
pub trait Crowdfunding {
    #[init]
    fn init(&self, target: BigUint, deadline: u64) {
        require!(target > 0, "Target must be more than 0");
        self.target().set(target);

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );
        self.deadline().set(deadline);
    }

    #[endpoint]
    #[payable("EGLD")]
    fn fund(&self) {
        let payment = self.call_value().egld();

        require!(
            self.status() == Status::FundingPeriod,
            "cannot fund after deadline"
        );

        let caller = self.blockchain().get_caller();
        self.deposit(&caller).update(|deposit| *deposit += &*payment);
    }

    #[view]
    fn status(&self) -> Status {
        if self.get_current_time() <= self.deadline().get() {
            Status::FundingPeriod
        } else if self.get_current_funds() >= self.target().get() {
            Status::Successful
        } else {
            Status::Failed
        }
    }

    #[view(getCurrentFunds)]
    fn get_current_funds(&self) -> BigUint {
        self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
    }

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

                let sc_balance = self.get_current_funds();
                self.send().direct_egld(&caller, &sc_balance);
            },
            Status::Failed => {
                let caller = self.blockchain().get_caller();
                let deposit = self.deposit(&caller).get();

                if deposit > 0u32 {
                    self.deposit(&caller).clear();
                    self.send().direct_egld(&caller, &deposit);
                }
            },
        }
    }

    // private

    fn get_current_time(&self) -> u64 {
        self.blockchain().get_block_timestamp()
    }

    // storage

    #[view(getTarget)]
    #[storage_mapper("target")]
    fn target(&self) -> SingleValueMapper<BigUint>;

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getDeposit)]
    #[storage_mapper("deposit")]
    fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
```

As an exercise, try to add some more tests, especially ones involving the claim function.

[comment]: # (mx-context-auto)

## Next steps

If you want to see some other smart contract examples, or even an extended version of the crowdfunding smart contract, you can check [here](https://github.com/multiversx/mx-contracts-rs).
