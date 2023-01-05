---
id: rust-testing-framework
title: Rust Testing Framework
---

## Introduction

The Rust testing framework was developed as an alternative to manually writing Mandos tests. This comes with many advantages:

- being able to calculate values using variables
- type checking
- automatic serialization
- far less verbose
- semi-automatic generation of the Mandos tests

The only disadvantage is that you need to learn something new! Jokes aside, keep in mind that this whole framework runs in a mocked environment. So while you get powerful testing and debugging tools, you are ultimately running a mock and have no guarantee that the contract will work identically with the current VM version deployed on the mainnet.

This is where the Mandos generation part comes into play. The Rust testing framework allows you to generate Mandos scenarios with minimal effort, and then run said scenarios with one click through our MultiversX (previously Elrond) VSCode extension (alteratively, simply run `erdpy contract test`). There will be a bit of manual effort required on the developer's part, but we'll get to that in its specific section.

Please note that mandos generation is more of an experiment rather than a fully fledged implementation, which we might even remove in the future. Still, some examples are provided here if you still wish to attempt it.

## Prerequisites

You need to have the latest elrond-wasm version (at the time of writing this, the latest version is 0.31.1). You can check the latest version here: https://crates.io/crates/elrond-wasm

Add `elrond-wasm-debug` and required packages as dev-dependencies in your Cargo.toml:

```toml
[dev-dependencies.elrond-wasm-debug]
version = "0.31.1"

[dev-dependencies]
num-bigint = "0.4.2"
num-traits = "0.2"
hex = "0.4"
```

For this tutorial, we're going to use the crowdfunding SC, so it might be handy to have it open or clone the repository: https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/examples/crowdfunding-esdt

You need a `tests` and a `mandos` folder in your contract. Create a `.rs` file in your `tests` folder.

In your newly created test file, add the following code (adapt the `crowdfunding_esdt` namespace, the struct/variable names, and the contract wasm path according to your contract):

```rust
use crowdfunding_esdt::*;
use elrond_wasm::{
    sc_error,
    types::{Address, SCResult},
};
use elrond_wasm_debug::{
    managed_address, managed_biguint, managed_token_id, rust_biguint, testing_framework::*,
    DebugApi,
};

const WASM_PATH: &'static str = "crowdfunding-esdt/output/crowdfunding-esdt.wasm";

struct CrowdfundingSetup<CrowdfundingObjBuilder>
where
    CrowdfundingObjBuilder:
        'static + Copy + Fn() -> crowdfunding_esdt::ContractObj<DebugApi>,
{
    pub blockchain_wrapper: BlockchainStateWrapper,
    pub owner_address: Address,
    pub first_user_address: Address,
    pub second_user_address: Address,
    pub cf_wrapper:
        ContractObjWrapper<crowdfunding_esdt::ContractObj<DebugApi>, CrowdfundingObjBuilder>,
}
```

The `CrowdfundingSetup` struct isn't really needed, but it helps de-duplicating some code. You may add other fields in your struct if needed, but for now this is enough for our use-case. The only fields you'll need for any contract are `blockchain_wrapper` and `cf_wrapper`. The rest of the fields can be adapted according to your test scenario.

And that's all you need to get started.

## Writing your first test

The first test you need to write is the one simulating the deploy of your smart contract. For that, you need a user address and a contract address. Then you simply call the `init` function of the smart contract.

Since we're going to be using the same token ID everywhere, let's add it as a constant (and while we're at it, have the deadline as a constant as well):

```rust
const CF_TOKEN_ID: &[u8] = b"CROWD-123456";
const CF_DEADLINE: u64 = 7 * 24 * 60 * 60; // 1 week in seconds
```

Let's create our initial setup:

```rust
fn setup_crowdfunding<CrowdfundingObjBuilder>(
    cf_builder: CrowdfundingObjBuilder,
) -> CrowdfundingSetup<CrowdfundingObjBuilder>
where
    CrowdfundingObjBuilder: 'static + Copy + Fn() -> crowdfunding_esdt::ContractObj<DebugApi>,
{
    let rust_zero = rust_biguint!(0u64);
    let mut blockchain_wrapper = BlockchainStateWrapper::new();
    let owner_address = blockchain_wrapper.create_user_account(&rust_zero);
    let first_user_address = blockchain_wrapper.create_user_account(&rust_zero);
    let second_user_address = blockchain_wrapper.create_user_account(&rust_zero);
    let cf_wrapper = blockchain_wrapper.create_sc_account(
        &rust_zero,
        Some(&owner_address),
        cf_builder,
        WASM_PATH,
    );

    blockchain_wrapper.set_esdt_balance(&first_user_address, CF_TOKEN_ID, &rust_biguint!(1_000));
    blockchain_wrapper.set_esdt_balance(&second_user_address, CF_TOKEN_ID, &rust_biguint!(1_000));

    blockchain_wrapper
        .execute_tx(&owner_address, &cf_wrapper, &rust_zero, |sc| {
            let target = managed_biguint!(2_000);
            let token_id = managed_token_id!(CF_TOKEN_ID);

            sc.init(target, CF_DEADLINE, token_id);
        })
        .assert_ok();

    blockchain_wrapper.add_mandos_set_account(cf_wrapper.address_ref());

    CrowdfundingSetup {
        blockchain_wrapper,
        owner_address,
        first_user_address,
        second_user_address,
        cf_wrapper,
    }
}
```

The main object you're going to be interacting with is the `BlockchainStateWrapper`. It holds the entire (mocked) blockchain state at any given moment, and allows you to interact with the accounts.

As you can see in the above test, we use the said wrapper to create an owner account, two other user accounts, and the Crowdfunding smart contract account.

Then, we set the ESDT balances for the two users, and deploy the smart contract, by using the `execute_tx` function of the `BlockchainStateWrapper` object. The arguments are:

- caller address
- contract wrapper (which contains the contract address and the contract object builder)
- EGLD payment amount
- a lambda function, which contains the actual execution

Since this is a SC deploy, we call the `init` function. Since the contract works with managed objects, we can't use the built-in Rust BigUint, so we use the one provided by `elrond_wasm` instead. To create managed types, we use the `managed_` functions. Alternatively, you can create those objects by:

```rust
let target = BigUint::<DebugApi>::from(2_000u32);
```

Keep in mind you can't create managed types outside of the `execute_tx` functions.

Some observations for the `execute_tx` function:

- The return type for the lambda function is a `TxResult`, which has methods for checking for success or error: `assert_ok()` is used to check the tx worked. If you want to check error cases, you would use `assert_user_error("message")`.
- After running the `init` function, we add a `setState` step in the generated Mandos, to simulate our deploy: `blockchain_wrapper.add_mandos_set_account(cf_wrapper.address_ref());`

To test the scenario and generate the Mandos file, you have to create a test function:

```rust
#[test]
fn init_test() {
    let cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    cf_setup
        .blockchain_wrapper
        .write_mandos_output("_generated_init.scen.json");
}
```

And you're done for this step. You successfuly tested your contract's init function, and generated a Mandos scenario for it.

## Testing transactions

Let's test the `fund` function. For this, we're going to use the previous setup, but now we use the `execute_esdt_transfer` method instead of `execute_tx`, because we're sending ESDT to the contract while calling `fund`:

```rust
#[test]
fn fund_test() {
    let mut cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    let b_wrapper = &mut cf_setup.blockchain_wrapper;
    let user_addr = &cf_setup.first_user_address;

    b_wrapper
        .execute_esdt_transfer(
            user_addr,
            &cf_setup.cf_wrapper,
            CF_TOKEN_ID,
            0,
            &rust_biguint!(1_000),
            |sc| {
                sc.fund();

                let user_deposit = sc.deposit(&managed_address!(user_addr)).get();
                let expected_deposit = managed_biguint!(1_000);
                assert_eq!(user_deposit, expected_deposit);
            },
        )
        .assert_ok();
}
```

As you can see, we can directly call the storage mappers (like `deposit`) from within the contract and compare with a local value. No need to encode anything.

If you also want to generate a Mandos scenario file for this transaction, this is where the bit of manual work comes in:

```rust
    let mut sc_call = ScCallMandos::new(user_addr, cf_setup.cf_wrapper.address_ref(), "fund");
    sc_call.add_esdt_transfer(CF_TOKEN_ID, 0, &rust_biguint!(1_000));

    let expect = TxExpectMandos::new(0);
    b_wrapper.add_mandos_sc_call(sc_call, Some(expect));

    cf_setup
        .blockchain_wrapper
        .write_mandos_output("_generated_fund.scen.json");
```

You have to add this at the end of your `fund_test`. The more complex the call, the more arguments you'll have to add and such. The `SCCallMandos` struct has the `add_argument` method so you don't have to do any encoding by yourself.

## Testing queries

Testing queries is similar to testing transactions, just with less arguments (since there is no caller, and no payment, and any modifications are automatically reverted):

```rust
#[test]
fn status_test() {
    let mut cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    let b_wrapper = &mut cf_setup.blockchain_wrapper;

    b_wrapper
        .execute_query(&cf_setup.cf_wrapper, |sc| {
            let status = sc.status();
            assert_eq!(status, Status::FundingPeriod);
        })
        .assert_ok();

    let sc_query = ScQueryMandos::new(cf_setup.cf_wrapper.address_ref(), "status");
    let mut expect = TxExpectMandos::new(0);
    expect.add_out_value(&Status::FundingPeriod);

    b_wrapper.add_mandos_sc_query(sc_query, Some(expect));

    cf_setup
        .blockchain_wrapper
        .write_mandos_output("_generated_query_status.scen.json");
}
```

## Testing smart contract errors

In the previous transaction test, we've tested the happy flow. Now let's see how we can check for errors:

```rust
#[test]
fn test_sc_error() {
    let mut cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    let b_wrapper = &mut cf_setup.blockchain_wrapper;
    let user_addr = &cf_setup.first_user_address;

    b_wrapper.set_egld_balance(user_addr, &rust_biguint!(1_000));

    b_wrapper
        .execute_tx(
            user_addr,
            &cf_setup.cf_wrapper,
            &rust_biguint!(1_000),
            |sc| {
                sc.fund();
            },
        )
        .assert_user_error("wrong token");

    b_wrapper
        .execute_tx(user_addr, &cf_setup.cf_wrapper, &rust_biguint!(0), |sc| {
            let user_deposit = sc.deposit(&managed_address!(user_addr)).get();
            let expected_deposit = managed_biguint!(0);
            assert_eq!(user_deposit, expected_deposit);
        })
        .assert_ok();

    let mut sc_call = ScCallMandos::new(user_addr, cf_setup.cf_wrapper.address_ref(), "fund");
    sc_call.add_egld_value(&rust_biguint!(1_000));

    let mut expect = TxExpectMandos::new(4);
    expect.set_message("wrong token");

    b_wrapper.add_mandos_sc_call(sc_call, Some(expect));

    cf_setup
        .blockchain_wrapper
        .write_mandos_output("_generated_sc_err.scen.json");
}
```

Notice how we've changed the payment intentionally to an invalid token to check the error case. Also, we've changed the expected deposit to "0" instead of the previous "1_000". And lastly: the `.assert_user_error("wrong token")` call on the result.

## Testing a successful funding campaign

For this scenario, we need both users to fund the full amount, and then owner to claim the funds. For simplicity, we've left the Mandos generation out of this one:

```rust
#[test]
fn test_successful_cf() {
    let mut cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    let b_wrapper = &mut cf_setup.blockchain_wrapper;
    let owner = &cf_setup.owner_address;
    let first_user = &cf_setup.first_user_address;
    let second_user = &cf_setup.second_user_address;

    // first user fund
    b_wrapper
        .execute_esdt_transfer(
            first_user,
            &cf_setup.cf_wrapper,
            CF_TOKEN_ID,
            0,
            &rust_biguint!(1_000),
            |sc| {
                sc.fund();

                let user_deposit = sc.deposit(&managed_address!(first_user)).get();
                let expected_deposit = managed_biguint!(1_000);
                assert_eq!(user_deposit, expected_deposit);
            },
        )
        .assert_ok();

    // second user fund
    b_wrapper
        .execute_esdt_transfer(
            second_user,
            &cf_setup.cf_wrapper,
            CF_TOKEN_ID,
            0,
            &rust_biguint!(1_000),
            |sc| {
                sc.fund();

                let user_deposit = sc.deposit(&managed_address!(second_user)).get();
                let expected_deposit = managed_biguint!(1_000);
                assert_eq!(user_deposit, expected_deposit);
            },
        )
        .assert_ok();

    // set block timestamp after deadline
    b_wrapper.set_block_timestamp(CF_DEADLINE + 1);

    // check status
    b_wrapper
        .execute_query(&cf_setup.cf_wrapper, |sc| {
            let status = sc.status();
            assert_eq!(status, Status::Successful);
        })
        .assert_ok();

    // user try claim
    b_wrapper
        .execute_tx(first_user, &cf_setup.cf_wrapper, &rust_biguint!(0), |sc| {
            sc.claim();
        })
        .assert_user_error("only owner can claim successful funding");

    // owner claim
    b_wrapper
        .execute_tx(owner, &cf_setup.cf_wrapper, &rust_biguint!(0), |sc| {
            sc.claim();
        })
        .assert_ok();

    b_wrapper.check_esdt_balance(owner, CF_TOKEN_ID, &rust_biguint!(2_000));
    b_wrapper.check_esdt_balance(first_user, CF_TOKEN_ID, &rust_biguint!(0));
    b_wrapper.check_esdt_balance(second_user, CF_TOKEN_ID, &rust_biguint!(0));
}
```

You've already seen most of the code in this test before already. The only new things are the `set_block_timestamp` and the `check_esdt_balance` methods of the wrapper. There are similar methods for setting block nonce, block random seed, etc., and the checking EGLD and SFT/NFT balances.

## Testing a failed funding campaign

This is simimlar to the previous one, but instead we have the users claim instead of the owner after deadline.

```rust
#[test]
fn test_failed_cf() {
    let mut cf_setup = setup_crowdfunding(crowdfunding_esdt::contract_obj);
    let b_wrapper = &mut cf_setup.blockchain_wrapper;
    let owner = &cf_setup.owner_address;
    let first_user = &cf_setup.first_user_address;
    let second_user = &cf_setup.second_user_address;

    // first user fund
    b_wrapper
        .execute_esdt_transfer(
            first_user,
            &cf_setup.cf_wrapper,
            CF_TOKEN_ID,
            0,
            &rust_biguint!(300),
            |sc| {
                sc.fund();

                let user_deposit = sc.deposit(&managed_address!(first_user)).get();
                let expected_deposit = managed_biguint!(300);
                assert_eq!(user_deposit, expected_deposit);
            },
        )
        .assert_ok();

    // second user fund
    b_wrapper
        .execute_esdt_transfer(
            second_user,
            &cf_setup.cf_wrapper,
            CF_TOKEN_ID,
            0,
            &rust_biguint!(600),
            |sc| {
                sc.fund();

                let user_deposit = sc.deposit(&managed_address!(second_user)).get();
                let expected_deposit = managed_biguint!(600);
                assert_eq!(user_deposit, expected_deposit);
            },
        )
        .assert_ok();

    // set block timestamp after deadline
    b_wrapper.set_block_timestamp(CF_DEADLINE + 1);

    // check status
    b_wrapper
        .execute_query(&cf_setup.cf_wrapper, |sc| {
            let status = sc.status();
            assert_eq!(status, Status::Failed);
        })
        .assert_ok();

    // first user claim
    b_wrapper
        .execute_tx(first_user, &cf_setup.cf_wrapper, &rust_biguint!(0), |sc| {
            sc.claim();
        })
        .assert_ok();

    // second user claim
    b_wrapper
        .execute_tx(second_user, &cf_setup.cf_wrapper, &rust_biguint!(0), |sc| {
            sc.claim();
        })
        .assert_ok();

    b_wrapper.check_esdt_balance(owner, CF_TOKEN_ID, &rust_biguint!(0));
    b_wrapper.check_esdt_balance(first_user, CF_TOKEN_ID, &rust_biguint!(1_000));
    b_wrapper.check_esdt_balance(second_user, CF_TOKEN_ID, &rust_biguint!(1_000));
}
```

## Conclusion

This tests cover pretty much every flow in the crowdfunding smart contract. Keep in mind that code can be deduplicated even more by having functions similar to the `setup_crowdfunding` function, but for the sake of the example, we've kept this as simple as possible. We hope this will make writing tests and debugging a lot easier moving forward!
