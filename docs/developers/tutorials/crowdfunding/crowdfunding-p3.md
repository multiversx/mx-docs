---
id: crowdfunding-p3
title: Supporting Any Fungible Token
---

[comment]: # (mx-abstract)
Generalize the crowdfunding contract to accept any fungible token instead of just EGLD.

[comment]: # (mx-context-auto)

## Introduction

In [Part 2](crowdfunding-p2.md), we built a complete crowdfunding contract that accepts EGLD. However, the contract was hardcoded to only work with EGLD. In this chapter, we'll generalize it to accept any fungible token (EGLD or ESDT), specified at deployment time.

This demonstrates an important principle in smart contract design: making contracts configurable and reusable for different use cases.

[comment]: # (mx-context-auto)

## Making the Token Identifier Configurable

Instead of hardcoding the token identifier in a method, we'll store it as a configuration parameter. Let's update our imports and storage mappers:

```rust
use multiversx_sc::imports::*;
```

Now let's convert the `cf_token_id()` method into a storage mapper and update the `init` function:

```rust
#[view(getCrowdfundingTokenId)]
#[storage_mapper("tokenIdentifier")]
fn cf_token_id(&self) -> SingleValueMapper<TokenId>;

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

fn get_current_time_millis(&self) -> TimestampMillis {
    self.blockchain().get_block_timestamp_millis()
}
```

We've made several improvements:

1. **TokenId type**: Represents any token identifier (EGLD or ESDT), providing type safety
2. **TimestampMillis type**: A type-safe wrapper for millisecond timestamps
3. **Validation**: We validate that the token identifier is valid before storing it
4. **Storage**: The token identifier is now stored and can be queried

[comment]: # (mx-context-auto)

## Updating the Deadline Storage

The deadline storage mapper already uses `TimestampMillis` from Part 2:

```rust
#[view(getDeadline)]
#[storage_mapper("deadline")]
fn deadline(&self) -> SingleValueMapper<TimestampMillis>;
```

[comment]: # (mx-context-auto)

## Updating the Fund Endpoint

Now we need to update the `fund` endpoint to accept any token and validate it matches the configured token identifier:

```rust
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
```

Changes from Part 2:

1. **`#[payable]`** without a specific token: This accepts any token (we'll validate it ourselves)
2. **`call_value().single()`**: Gets the payment as an `EsdtTokenPayment` structure
3. **Token validation**: We check that the sent token matches our configured token identifier
4. **Fungible check**: We ensure that only fungible tokens (not NFTs) are accepted
5. **Amount extraction**: We use `.as_big_uint()` to get the amount as a `BigUint`

[comment]: # (mx-context-auto)

## Updating Get Current Funds

We need to update `get_current_funds()` to use the stored token identifier:

```rust
#[view(getCurrentFunds)]
fn get_current_funds(&self) -> BigUint {
    let token = self.cf_token_id().get()
    self.blockchain().get_sc_balance(&token, 0)
}
```

[comment]: # (mx-context-auto)

## Updating the Status Method

The status method needs to use the new `get_current_time_millis()` helper:

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
```

[comment]: # (mx-context-auto)

## Updating the Claim Endpoint

Finally, we need to update the `claim` endpoint to send the configured token instead of hardcoded EGLD:

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
```

Key changes:

1. **Get token identifier**: We retrieve the stored token identifier
2. **New transaction syntax**: We use the `.tx()` builder with `Payment::new()` to send any token type
3. **Non-zero amounts**: We convert amounts to `NonZeroUsize` to ensure we only transfer when there's actually something to send

[comment]: # (mx-context-auto)

## Updating Tests

Let's update our tests to work with the new token-agnostic implementation. First, update the deploy function:

```rust
fn crowdfunding_deploy() -> ScenarioWorld {
    let mut world = world();

    world.account(OWNER).nonce(0).balance(1000000);

    let crowdfunding_address = world
        .tx()
        .from(OWNER)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .init(TokenId::egld(), 500_000_000_000u64, 123000u64)
        .code(CODE_PATH)
        .new_address(CROWDFUNDING_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(crowdfunding_address, CROWDFUNDING_ADDRESS.to_address());

    world
}
```

Note that we now pass `TokenId::egld()` as the first argument. This means our test still uses EGLD, but now the contract could work with any token!

Let's create a new test that uses an ESDT token instead:

```rust
const CF_TOKEN_ID: TestTokenIdentifier = TestTokenIdentifier::new("CROWD-123456");

fn crowdfunding_deploy_esdt() -> ScenarioWorld {
    let mut world = world();

    world.account(OWNER).nonce(0);

    let crowdfunding_address = world
        .tx()
        .from(OWNER)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .init(TokenId::from(CF_TOKEN_ID), 2_000u64, 604_800_000u64) // 1 week in ms
        .code(CODE_PATH)
        .new_address(CROWDFUNDING_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();

    assert_eq!(crowdfunding_address, CROWDFUNDING_ADDRESS.to_address());

    world
}

#[test]
fn crowdfunding_esdt_test() {
    let mut world = crowdfunding_deploy_esdt();
    
    // Set up donor with ESDT tokens
    world
        .account(DONOR)
        .nonce(0)
        .esdt_balance(CF_TOKEN_ID, 1_000u64);

    // Donor funds with ESDT
    world
        .tx()
        .from(DONOR)
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .fund()
        .esdt(CF_TOKEN_ID, 0, 500u64)
        .run();

    // Verify deposit
    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .deposit(DONOR)
        .returns(ExpectValue(500u64))
        .run();
}
```

This test demonstrates that the same contract can now work with ESDT tokens!

[comment]: # (mx-context-auto)

## Rebuild and Test

Don't forget to rebuild and test:

```bash
sc-meta all build
sc-meta all proxy
sc-meta test
```

[comment]: # (mx-context-auto)

## What We Achieved

By making these changes, we've:

1. ✅ Made the contract **configurable** - it can work with any fungible token
2. ✅ Improved **type safety** with `TokenId` and `TimestampMillis`
3. ✅ Added **proper validation** for token types (fungible only)
4. ✅ Used modern **transaction syntax** for transfers
5. ✅ Maintained **backward compatibility** - EGLD still works perfectly

The contract is now more flexible and can be deployed multiple times with different tokens, making it truly reusable!

[comment]: # (mx-context-auto)

## Next Steps

- **View the complete code**: Check out the [final contract code](final-code.md) with all the improvements
- **Explore more examples**: Visit the [MultiversX contracts repository](https://github.com/multiversx/mx-contracts-rs) for more advanced patterns
- **Continue learning**: Try other [tutorials](/developers/tutorials/your-first-dapp) to expand your MultiversX development skills
