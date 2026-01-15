---
id: final-code
title: Final Code
---

[comment]: # (mx-abstract)
Complete crowdfunding smart contract implementation with all features.

This page provides the complete, final version of the crowdfunding smart contract developed throughout the tutorial. This implementation includes all the features covered in [Part 1](crowdfunding-p1.md), [Part 2](crowdfunding-p2.md), and [Part 3](crowdfunding-p3.md).

[comment]: # (mx-context-auto)

## Overview

The final crowdfunding smart contract includes:

- **Initialization**: Sets up the token identifier, target amount, and deadline
- **Fund endpoint**: Accepts token payments from donors during the funding period
- **Claim endpoint**: Allows the owner to claim funds if successful, or donors to get refunds if failed
- **Status view**: Returns the current campaign status (FundingPeriod, Successful, or Failed)
- **Storage**: Tracks target amount, deadline, deposits per donor, and token identifier

[comment]: # (mx-context-auto)

## Contract Features

### Status Enum

The contract uses a custom `Status` enum to represent the three possible states of a crowdfunding campaign:

- **FundingPeriod**: The campaign is still accepting donations (before the deadline)
- **Successful**: The deadline has passed and the target amount was reached
- **Failed**: The deadline has passed but the target amount was not reached

### Key Methods

- **`init`**: Initializes the contract with a token identifier, target amount, and deadline. Includes validation to ensure the token is valid, the target is greater than zero, and the deadline is in the future.

- **`fund`**: Allows users to contribute tokens to the campaign. Validates that the correct token is being sent, that only fungible tokens are accepted, and that the funding period is still active.

- **`claim`**: Handles the claiming logic based on the campaign status:
  - During the funding period: Returns an error
  - If successful: Allows only the owner to claim all collected funds
  - If failed: Allows donors to claim their individual refunds

- **`status`**: A view function that returns the current status of the campaign based on the deadline and funds raised.

- **`get_current_funds`**: Returns the total amount of tokens currently held by the contract.

[comment]: # (mx-context-auto)

## Complete Contract Code

```rust title=crowdfunding.rs
#![no_std]

use multiversx_sc::{derive_imports::*, imports::*};
pub mod crowdfunding_proxy;

#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}

#[multiversx_sc::contract]
pub trait Crowdfunding {
    #[init]
    fn init(&self, token_identifier: TokenId, target: BigUint, deadline: TimestampMillis) {
        require!(token_identifier.is_valid(), "Invalid token provided");
        self.cf_token_id().set(token_identifier);

        require!(target > 0, "Target must be more than 0");
        self.target().set(target);

        require!(
            deadline > self.get_current_time_millis(),
            "Deadline can't be in the past"
        );
        self.deadline().set(deadline);
    }

    #[endpoint]
    #[payable]
    fn fund(&self) {
        let payment = self.call_value().single();

        require!(
            payment.token_identifier == self.cf_token_id().get(),
            "wrong token"
        );
        require!(payment.is_fungible(), "only fungible tokens accepted");
        require!(
            self.status() == Status::FundingPeriod,
            "cannot fund after deadline"
        );

        let caller = self.blockchain().get_caller();
        self.deposit(&caller)
            .update(|deposit| *deposit += payment.amount.as_big_uint());
    }

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
    #[title("currentFunds")]
    fn get_current_funds(&self) -> BigUint {
        let token = self.cf_token_id().get();

        self.blockchain().get_sc_balance(&token, 0)
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

                let token_identifier = self.cf_token_id().get();
                let sc_balance = self.get_current_funds();

                if let Some(sc_balance_non_zero) = sc_balance.into_non_zero() {
                    self.tx()
                        .to(&caller)
                        .payment(Payment::new(token_identifier, 0, sc_balance_non_zero))
                        .transfer();
                }
            }
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
            }
        }
    }

    // private

    fn get_current_time_millis(&self) -> TimestampMillis {
        self.blockchain().get_block_timestamp_millis()
    }

    // storage

    #[view(getTarget)]
    #[title("target")]
    #[storage_mapper("target")]
    fn target(&self) -> SingleValueMapper<BigUint>;

    #[view(getDeadline)]
    #[title("deadline")]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<TimestampMillis>;

    #[view(getDeposit)]
    #[title("deposit")]
    #[storage_mapper("deposit")]
    fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[view(getCrowdfundingTokenId)]
    #[title("tokenIdentifier")]
    #[storage_mapper("tokenIdentifier")]
    fn cf_token_id(&self) -> SingleValueMapper<TokenId>;
}
```

[comment]: # (mx-context-auto)

## Complete Blackbox Test (ESDT)

```rust title=crowdfunding_esdt_blackbox_test.rs
use crowdfunding::crowdfunding_proxy;

use multiversx_sc_scenario::imports::*;

const CF_DEADLINE: TimestampMillis = TimestampMillis::new(7 * 24 * 60 * 60 * 1000); // 1 week in milliseconds

const FIRST_USER_ADDRESS: TestAddress = TestAddress::new("first-user");
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const SECOND_USER_ADDRESS: TestAddress = TestAddress::new("second-user");

const CODE_PATH: MxscPath = MxscPath::new("output/crowdfunding.mxsc.json");
const CROWDFUNDING_ADDRESS: TestSCAddress = TestSCAddress::new("crowdfunding-sc");

const CF_TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("CROWD-123456");
const OTHER_TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("OTHER-123456");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.set_current_dir_from_workspace("contracts/examples/crowdfunding");
    blockchain.register_contract(CODE_PATH, crowdfunding::ContractBuilder);
    blockchain
}

struct CrowdfundingTestState {
    world: ScenarioWorld,
}

impl CrowdfundingTestState {
    fn new() -> Self {
        let mut world = world();

        world.account(OWNER_ADDRESS).nonce(1);

        world
            .account(FIRST_USER_ADDRESS)
            .nonce(1)
            .balance(1000)
            .esdt_balance(CF_TOKEN_ID, 1000)
            .esdt_balance(OTHER_TOKEN_ID, 1000);

        world
            .account(SECOND_USER_ADDRESS)
            .nonce(1)
            .esdt_balance(CF_TOKEN_ID, 1000);

        Self { world }
    }

    fn deploy(&mut self) {
        self.world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .init(CF_TOKEN_ID, 2_000u32, CF_DEADLINE)
            .code(CODE_PATH)
            .new_address(CROWDFUNDING_ADDRESS)
            .run();
    }

    fn fund(&mut self, address: TestAddress, amount: u64) {
        self.world
            .tx()
            .from(address)
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .fund()
            .payment(Payment::new(
                CF_TOKEN_ID.as_str().into(),
                0u64,
                NonZeroBigUint::try_from(amount as u128).unwrap(),
            ))
            .run();
    }

    fn check_deposit(&mut self, donor: TestAddress, amount: u64) {
        self.world
            .query()
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .deposit(donor)
            .returns(ExpectValue(amount))
            .run();
    }

    fn check_status(&mut self, expected_value: crowdfunding_proxy::Status) {
        self.world
            .query()
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .status()
            .returns(ExpectValue(expected_value))
            .run();
    }

    fn claim(&mut self, address: TestAddress) {
        self.world
            .tx()
            .from(address)
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .claim()
            .run();
    }

    fn check_esdt_balance(&mut self, address: TestAddress, balance: u64) {
        self.world
            .check_account(address)
            .esdt_balance(CF_TOKEN_ID, balance);
    }

    fn set_block_timestamp(&mut self, block_timestamp: TimestampMillis) {
        self.world
            .current_block()
            .block_timestamp_millis(block_timestamp);
    }
}

#[test]
fn test_fund_esdt() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    state.fund(FIRST_USER_ADDRESS, 1_000u64);
    state.check_deposit(FIRST_USER_ADDRESS, 1_000u64);
}

#[test]
fn test_status_esdt() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    state.check_status(crowdfunding_proxy::Status::FundingPeriod);
}

#[test]
fn test_sc_error_esdt() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    state
        .world
        .tx()
        .from(FIRST_USER_ADDRESS)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .fund()
        .payment(Payment::new(
            OTHER_TOKEN_ID.as_str().into(),
            0,
            NonZeroBigUint::try_from(1000u128).unwrap(),
        ))
        .with_result(ExpectError(4, "wrong token"))
        .run();

    state.check_deposit(FIRST_USER_ADDRESS, 0);
}

#[test]
fn test_successful_cf_esdt() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    // first user fund
    state.fund(FIRST_USER_ADDRESS, 1_000u64);
    state.check_deposit(FIRST_USER_ADDRESS, 1_000);

    // second user fund
    state.fund(SECOND_USER_ADDRESS, 1000);
    state.check_deposit(SECOND_USER_ADDRESS, 1_000);

    // set block timestamp after deadline
    state.set_block_timestamp(CF_DEADLINE + DurationMillis::new(1));

    // check status successful
    state.check_status(crowdfunding_proxy::Status::Successful);

    state
        .world
        .tx()
        .from(FIRST_USER_ADDRESS)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .claim()
        .with_result(ExpectError(4, "only owner can claim successful funding"))
        .run();

    // owner claim
    state.claim(OWNER_ADDRESS);

    state.check_esdt_balance(OWNER_ADDRESS, 2000);
    state.check_esdt_balance(FIRST_USER_ADDRESS, 0);
    state.check_esdt_balance(SECOND_USER_ADDRESS, 0);
}

#[test]
fn test_failed_cf_esdt() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    // first user fund
    state.fund(FIRST_USER_ADDRESS, 300);
    state.check_deposit(FIRST_USER_ADDRESS, 300u64);

    // second user fund
    state.fund(SECOND_USER_ADDRESS, 600);
    state.check_deposit(SECOND_USER_ADDRESS, 600u64);

    // set block timestamp after deadline
    state.set_block_timestamp(CF_DEADLINE + DurationMillis::new(1));

    // check status failed
    state.check_status(crowdfunding_proxy::Status::Failed);

    // first user claim
    state.claim(FIRST_USER_ADDRESS);

    // second user claim
    state.claim(SECOND_USER_ADDRESS);

    state.check_esdt_balance(OWNER_ADDRESS, 0);
    state.check_esdt_balance(FIRST_USER_ADDRESS, 1000);
    state.check_esdt_balance(SECOND_USER_ADDRESS, 1000);
}
```

[comment]: # (mx-context-auto)

## EGLD Test File

For testing with EGLD, we have a separate test file that uses native EGLD transfers:

```rust title=crowdfunding_egld_blackbox_test.rs
use crowdfunding::crowdfunding_proxy;

use multiversx_sc_scenario::imports::*;

const CF_DEADLINE: TimestampMillis = TimestampMillis::new(7 * 24 * 60 * 60 * 1000); // 1 week in milliseconds

const FIRST_USER_ADDRESS: TestAddress = TestAddress::new("first-user");
const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const SECOND_USER_ADDRESS: TestAddress = TestAddress::new("second-user");

const CODE_PATH: MxscPath = MxscPath::new("output/crowdfunding.mxsc.json");
const CROWDFUNDING_ADDRESS: TestSCAddress = TestSCAddress::new("crowdfunding-sc");

const OTHER_TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("OTHER-123456");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.set_current_dir_from_workspace("contracts/examples/crowdfunding");
    blockchain.register_contract(CODE_PATH, crowdfunding::ContractBuilder);
    blockchain
}

struct CrowdfundingTestState {
    world: ScenarioWorld,
}

impl CrowdfundingTestState {
    fn new() -> Self {
        let mut world = world();

        world.account(OWNER_ADDRESS).nonce(1);

        world
            .account(FIRST_USER_ADDRESS)
            .nonce(1)
            .balance(1000)
            .esdt_balance(OTHER_TOKEN_ID, 1000);

        world.account(SECOND_USER_ADDRESS).nonce(1).balance(1000);

        Self { world }
    }

    fn deploy(&mut self) {
        self.world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .init(TokenId::native(), 2_000u32, CF_DEADLINE)
            .code(CODE_PATH)
            .new_address(CROWDFUNDING_ADDRESS)
            .run();
    }

    fn fund(&mut self, address: TestAddress, amount: u64) {
        self.world
            .tx()
            .from(address)
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .fund()
            .egld(amount)
            .run();
    }

    fn check_deposit(&mut self, donor: TestAddress, amount: u64) {
        self.world
            .query()
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .deposit(donor)
            .returns(ExpectValue(amount))
            .run();
    }

    fn check_status(&mut self, expected_value: crowdfunding_proxy::Status) {
        self.world
            .query()
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .status()
            .returns(ExpectValue(expected_value))
            .run();
    }

    fn claim(&mut self, address: TestAddress) {
        self.world
            .tx()
            .from(address)
            .to(CROWDFUNDING_ADDRESS)
            .typed(crowdfunding_proxy::CrowdfundingProxy)
            .claim()
            .run();
    }

    fn check_balance(&mut self, address: TestAddress, balance: u64) {
        self.world.check_account(address).balance(balance);
    }

    fn set_block_timestamp(&mut self, block_timestamp: TimestampMillis) {
        self.world
            .current_block()
            .block_timestamp_millis(block_timestamp);
    }
}

#[test]
fn test_fund_egld() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    state.fund(FIRST_USER_ADDRESS, 1_000u64);
    state.check_deposit(FIRST_USER_ADDRESS, 1_000u64);
}

#[test]
fn test_status_egld() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    state.check_status(crowdfunding_proxy::Status::FundingPeriod);
}

#[test]
fn test_sc_error_egld() {
    let mut state = CrowdfundingTestState::new();

    state.deploy();

    state
        .world
        .tx()
        .from(FIRST_USER_ADDRESS)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .fund()
        .payment(Payment::new(
            OTHER_TOKEN_ID.as_str().into(),
            0,
            NonZeroBigUint::try_from(1000u128).unwrap(),
        ))
        .with_result(ExpectError(4, "wrong token"))
        .run();

    state.check_deposit(FIRST_USER_ADDRESS, 0);
}

#[test]
fn test_successful_cf_egld() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    // first user fund
    state.fund(FIRST_USER_ADDRESS, 1_000u64);
    state.check_deposit(FIRST_USER_ADDRESS, 1_000);

    // second user fund
    state.fund(SECOND_USER_ADDRESS, 1000);
    state.check_deposit(SECOND_USER_ADDRESS, 1_000);

    // set block timestamp after deadline
    state.set_block_timestamp(CF_DEADLINE + DurationMillis::new(1));

    // check status successful
    state.check_status(crowdfunding_proxy::Status::Successful);

    state
        .world
        .tx()
        .from(FIRST_USER_ADDRESS)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .claim()
        .with_result(ExpectError(4, "only owner can claim successful funding"))
        .run();

    // owner claim
    state.claim(OWNER_ADDRESS);

    state.check_balance(OWNER_ADDRESS, 2000);
    state.check_balance(FIRST_USER_ADDRESS, 0);
    state.check_balance(SECOND_USER_ADDRESS, 0);
}

#[test]
fn test_failed_cf_egld() {
    let mut state = CrowdfundingTestState::new();
    state.deploy();

    // first user fund
    state.fund(FIRST_USER_ADDRESS, 300);
    state.check_deposit(FIRST_USER_ADDRESS, 300u64);

    // second user fund
    state.fund(SECOND_USER_ADDRESS, 600);
    state.check_deposit(SECOND_USER_ADDRESS, 600u64);

    // set block timestamp after deadline
    state.set_block_timestamp(CF_DEADLINE + DurationMillis::new(1));

    // check status failed
    state.check_status(crowdfunding_proxy::Status::Failed);

    // first user claim
    state.claim(FIRST_USER_ADDRESS);

    // second user claim
    state.claim(SECOND_USER_ADDRESS);

    state.check_balance(OWNER_ADDRESS, 0);
    state.check_balance(FIRST_USER_ADDRESS, 1000);
    state.check_balance(SECOND_USER_ADDRESS, 1000);
}
```

The key differences in the EGLD test:
- Uses `TokenId::native()` for deployment
- Uses `.egld()` for funding transactions  
- Uses `.balance()` for balance checks

Both test files verify the same functionality (successful funding, failed funding, wrong token rejection), proving the contract works identically regardless of the token type!

[comment]: # (mx-context-auto)

## Storage Mappers

The contract uses several storage mappers to persist data on the blockchain:

- **`target`**: Stores the target amount of tokens to be raised (BigUint)
- **`deadline`**: Stores the campaign deadline as a timestamp in milliseconds (TimestampMillis)
- **`deposit`**: Maps each donor's address to their contribution amount (BigUint)
- **`cf_token_id`**: Stores the token identifier used for the crowdfunding campaign (TokenId)

Each storage mapper is also exposed as a view function, allowing external queries to read these values.

[comment]: # (mx-context-auto)

## Next Steps

Now that you have the complete crowdfunding contract:

1. **Add more tests**: Try to write comprehensive tests covering all edge cases, especially for the `claim` function
2. **Extend the functionality**: Consider adding features like:
   - Multiple funding rounds
   - Partial withdrawals
   - Campaign updates or extensions
   - Reward tiers for different contribution levels
3. **Explore other contracts**: Check out more smart contract examples in the [MultiversX contracts repository](https://github.com/multiversx/mx-contracts-rs)

[comment]: # (mx-context-auto)

## Related Documentation

- [Part 1: Crowdfunding Smart Contract Setup](crowdfunding-p1.md)
- [Part 2: Crowdfunding Logic](crowdfunding-p2.md)
- [Part 3: Supporting Any Fungible Token](crowdfunding-p3.md)
- [Smart Contract Developer Reference](/developers/developer-reference/sc-annotations)
- [Testing Smart Contracts](/developers/testing/testing-overview)
