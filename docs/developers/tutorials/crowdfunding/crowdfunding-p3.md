---
id: crowdfunding-p3
title: Supporting Any Fungible Token
---

[comment]: # (mx-abstract)
Generalize the crowdfunding contract to accept any fungible token instead of just EGLD.

[comment]: # (mx-context-auto)

## Introduction

In [Part 2](crowdfunding-p2.md), we built a complete crowdfunding contract that accepts EGLD. The `cf_token_id()` storage mapper was initialized to `TokenId::egld()` in the init function. In this chapter, we'll make it configurable so the contract can accept any fungible token (EGLD or ESDT), specified at deployment time.

This demonstrates an important principle in smart contract design: making contracts configurable and reusable for different use cases.

[comment]: # (mx-context-auto)

## Making the Token Identifier Configurable

The `cf_token_id()` storage mapper already exists from Part 2. We just need to update the `init` function to accept a token identifier as a parameter instead of hardcoding it:

```rust
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

1. **New parameter**: `token_identifier: TokenId` is now the first parameter
2. **Validation**: We validate that the token identifier is valid before storing it
3. **Configuration**: Instead of `self.cf_token_id().set(TokenId::egld())`, we now use the provided parameter

[comment]: # (mx-context-auto)

## Updating the Fund Endpoint

The `fund` endpoint from Part 2 already validates the token identifier against `cf_token_id()`, so it automatically works with any configured token. We only need to add one more check to ensure that only fungible tokens (not NFTs) are accepted:

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

The only new line is the fungible check. Everything else works automatically because `cf_token_id().get()` now returns the configured token instead of always returning EGLD.

[comment]: # (mx-context-auto)

## Other Methods

The `get_current_funds()`, `status()`, and `claim()` methods from Part 2 work automatically with the configurable token because they all use `cf_token_id().get()`, which now returns the configured token instead of hardcoded EGLD.

[comment]: # (mx-context-auto)

## Testing with Different Tokens

Now that our contract is token-agnostic, we can test it with both EGLD and ESDT tokens. The key difference is in the deployment - we pass different token identifiers:

**For EGLD:**
```rust
.init(TokenId::native(), 2_000u32, CF_DEADLINE)
```

**For ESDT:**
```rust
.init(CF_TOKEN_ID, 2_000u32, CF_DEADLINE)
```

The complete test files demonstrate this:

### EGLD Test File

<details>
<summary>crowdfunding_egld_blackbox_test.rs (click to expand)</summary>

```rust file=/Users/andreim/multiversx/mx-docs/testing/crowdfunding/tests/crowdfunding_egld_blackbox_test.rs

```
</details>

### ESDT Test File

<details>
<summary>crowdfunding_esdt_blackbox_test.rs (click to expand)</summary>

```rust file=/Users/andreim/multiversx/mx-docs/testing/crowdfunding/tests/crowdfunding_esdt_blackbox_test.rs

```
</details>

Key differences in the ESDT test:

1. **Token setup**: Accounts are given ESDT balances instead of EGLD
2. **Deployment**: Contract is initialized with an ESDT token identifier
3. **Funding**: Uses `.payment(Payment::new(...))` instead of `.egld()`
4. **Balance checks**: Uses `.esdt_balance()` instead of `.balance()`

Both test files verify the same functionality (successful funding, failed funding, wrong token rejection), proving the contract works identically regardless of the token type!

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
