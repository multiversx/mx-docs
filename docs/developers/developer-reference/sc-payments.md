---
id: sc-payments
title: Smart contract payments
---

[comment]: # (mx-abstract)

## Some general points

We want to offer an overview on how smart contracts process payments. This includes two complementary parts: receiving tokens and sending them.

:::important important
On MultiversX it is impossible to send both EGLD and any ESDT token at the same time.

For this reason you will see no syntax for transferring both, neither when sending, nor receiving.
:::

---

[comment]: # (mx-context-auto)

## Receiving payments

There are two ways in which a smart contract can receive payments:
1. Like any regular account, directly, without any contract code being called;
2. Via an endpoint.

[comment]: # (mx-context-auto)

### Receiving payments directly

Sending EGLD and ESDT tokens directly to accounts works the same way for EOAs (extrernally owned accounts) as for smart contracts: the tokens are transferred from one account to the other without firing up the VM.

However, not all smart contracts are allowed to receive tokens directly. There is a flag that controls this, called "payable". This flag is part of the [code metadata](/developers/data/code-metadata), and is specified in the transaction that deploys or upgrades the smart contract.

The rationale for this is as follows: the MultiversX blockchain doesn't offer any mechanism to allow contracts to react to direct calls. This is because we wanted to keep direct calls simple, consistent, and with a predictable gas cost, in all contexts. Most contracts, however, will likely want to keep track of all the funds that are fed into them, so they do not want to accept payments without an opportunity to also change their internal state.

[comment]: # (mx-context-auto)

### Receiving payments via endpoints

The most common way for contracts to accept payments is by having endpoints annotated with the `#[payable(...)]` annotation.

:::important important
The "payable" flag in the code metadata only refers to direct transfers. Transferring tokens via contract endpoint calls is not affected by it in any way.
:::

If an endpoint only accepts EGLD, it should be annotated with `#[payable("EGLD")]`:

```rust
#[endpoint]
#[payable("EGLD")]
fn accept_egld(&self) {
	// ...
}
```

When annotated like this, the contract will reject any ESDT payment. Calling this function without any payment will work.

To accept any kind of payment, do annotate the endpoints with `#[payable("*")]`:

```rust
#[endpoint]
#[payable("*")]
fn accept_any_payment(&self) {
	// ...
}
```

:::note Hard-coded token identifier
It is also possible to hard-code a token identifier in the `payable`, e.g. `#[payable("MYTOKEN-123456")]`. It is rarely, if ever, used, tokens should normally be configured in storage, or at runtime.
:::

Additional restrictions on the incoming tokens can be imposed in the body of the endpoint, by calling the call value API. Most of these functions retrieve data about the received payment, while also stopping execution if the payment is not of the expected type.
- `self.call_value().egld_value()` retrieves the EGLD value transferred, or zero. Never stops execution.
- `self.call_value().all_esdt_transfers()` retrieves all the ESDT transfers received, or an empty list. Never stops execution.
- `self.call_value().multi_esdt<N>()` is ideal when we know exactly how many ESDT transfers we expect. It returns an array of `EsdtTokenPayment`. It knows exactly how many transfers to expect based on the return type (it is polymorphic in the length of the array). Will fail execution if the number of ESDT transfers does not match.
- `self.call_value().single_esdt()` expects a single ESDT transfer, fails otherwise. Will return the received `EsdtTokenPayment`. It is a special case of `multi_esdt`, where `N` is 1.
- `self.call_value().single_fungible_esdt()` further restricts `single_esdt` to only fungible tokens, so those with their nonce zero. Returns the token identifier and amount, as pair.
- `self.call_value().egld_or_single_esdt()` retrieves an object of type `EgldOrEsdtTokenPayment`. Will halt execution in case of ESDT multi-transfer.
- `self.call_value().egld_or_single_fungible_esdt()` further restricts `egld_or_single_esdt` to fungible ESDT tokens. It will return a pair of `EgldOrEsdtTokenIdentifier` and an amount.
- `self.call_value().any_payment()` is the most general payment retriever. Never stops execution. Returns an object of type `EgldOrMultiEsdtPayment`.

---

[comment]: # (mx-context-auto)

## Sending payments

We have seen how contracts can accommodate receiving tokens. Sending them is, in principle, even more straightforward, as it only involves specializing the `Payment` generic of the transaction using specific methods, or better said, attaching a payload to a regular transaction. Read more about payments [here](../transactions/tx-payment.md).
---

## Practical ESDT Payment Examples[​](#practical-esdt-payment-examples "Direct link to Practical ESDT Payment Examples")

While the annotations above show what's possible, here are further examples showing how to properly receive and validate ESDT payments in your contracts.

### Receiving and Validating ESDT Payments[​](#receiving-and-validating-esdt-payments "Direct link to Receiving and Validating ESDT Payments")

Here's a complete example of an endpoint that receives ESDT tokens with proper validation:
```rust
#[payable("*")]
#[endpoint]
fn fund(&self) {
    // Prevent funding twice
    require!(!self.funded().get(), "Already funded");
    
    // Get the payment details
    let payment = self.call_value().single_esdt();
    
    // Validate correct token was sent
    let expected_token = self.token_id().get();
    require!(
        payment.token_identifier == expected_token,
        "Wrong token sent"
    );
    
    // Validate correct amount was sent
    let expected_amount = self.total_amount().get();
    require!(
        payment.amount == expected_amount,
        "Amount mismatch"
    );
    
    // Mark as funded
    self.funded().set(true);
}

#[storage_mapper("funded")]
fn funded(&self) -> SingleValueMapper<bool>;

#[storage_mapper("tokenId")]
fn token_id(&self) -> SingleValueMapper<EgldOrEsdtTokenIdentifier>;

#[storage_mapper("totalAmount")]
fn total_amount(&self) -> SingleValueMapper<BigUint>;
```

**Why these validations matter:**

* **Token validation:** Users might send the wrong ESDT token. Without validation, your contract logic would break.
* **Amount validation:** Ensures the exact expected amount is sent. Underfunding breaks contract logic; overfunding locks extra tokens permanently.
* **State checks:** Prevents double-funding or other state-related issues.

### Testing ESDT Contract Endpoints[​](#testing-esdt-contract-endpoints "Direct link to Testing ESDT Contract Endpoints")

When testing contracts that receive ESDT tokens, you cannot call the endpoint directly like a normal function. Instead, you must use the `ESDTTransfer` protocol function:
```bash
mxpy contract call <CONTRACT_ADDRESS> \
  --pem wallet.pem \
  --proxy https://devnet-gateway.multiversx.com \
  --chain D \
  --gas-limit 10000000 \
  --function ESDTTransfer \
  --arguments str:TOKEN-abc123 10000000000000000000 str:fund \
  --send
```

**Structure breakdown:**

* `--function ESDTTransfer` - This is the protocol function, not your endpoint
* First argument: `str:TOKEN-abc123` - The full token identifier including the random suffix
* Second argument: `10000000000000000000` - Amount in smallest units (with decimals)
* Third argument: `str:fund` - Your actual endpoint name

This pattern ensures tokens are pushed to contracts rather than allowing contracts to pull tokens from users.

After funding, regular endpoint calls work normally:
```bash
mxpy contract call <CONTRACT_ADDRESS> \
  --pem wallet.pem \
  --function claim \
  --gas-limit 10000000 \
  --chain D \
  --send
```

### Common Validation Patterns[​](#common-validation-patterns "Direct link to Common Validation Patterns")

#### Single Specific Token

If your contract only works with one predetermined token:
```rust
#[init]
fn init(&self, token_id: EgldOrEsdtTokenIdentifier) {
    self.token_id().set(&token_id);
}

#[payable("*")]
#[endpoint]
fn deposit(&self) {
    let payment = self.call_value().single_esdt();
    require!(
        payment.token_identifier == self.token_id().get(),
        "Only configured token accepted"
    );
    // process deposit
}
```

#### Multiple Accepted Tokens

If your contract accepts several different tokens:
```rust
#[payable("*")]
#[endpoint]
fn deposit(&self) {
    let payment = self.call_value().single_esdt();
    require!(
        self.accepted_tokens().contains(&payment.token_identifier),
        "Token not accepted"
    );
    // process deposit
}

#[storage_mapper("acceptedTokens")]
fn accepted_tokens(&self) -> SetMapper<TokenIdentifier>;
```

#### Amount Range Validation

If your contract requires amounts within a specific range:
```rust
#[payable("*")]
#[endpoint]
fn deposit(&self) {
    let payment = self.call_value().single_esdt();
    
    let min_amount = self.min_deposit().get();
    let max_amount = self.max_deposit().get();
    
    require!(
        payment.amount >= min_amount && payment.amount <= max_amount,
        "Amount outside allowed range"
    );
    
    // process deposit
}
```

---

## Common ESDT Payment Errors[​](#common-esdt-payment-errors "Direct link to Common ESDT Payment Errors")

### "wrong token sent" Error

**Cause:** The token identifier sent doesn't match what the contract expects.

**Common mistakes:**

* Using just the ticker (`TOKEN`) instead of the full identifier (`TOKEN-abc123`)
* Copy-pasting the wrong token ID
* Token ID changed after contract was deployed with old ID

**Solution:** Always use the complete token identifier including the 6-character suffix generated during token issuance.

### "amount mismatch" Error

**Cause:** The amount sent doesn't match the expected amount (when validation is present).

**Common mistakes:**

* Forgetting to include decimal places (sending `10` instead of `10000000000000000000` for 18-decimal tokens)
* Confusing human-readable amounts with contract amounts

**Solution:** If your token has 18 decimals and you want to send 10 tokens, multiply: `10 × 10^18 = 10000000000000000000`

### Execution Fails Without Clear Error

**Cause:** The endpoint isn't marked as `#[payable]` or has wrong payment type specified.

**Solution:**

* Ensure the endpoint has `#[payable("*")]` for ESDT tokens
* Check that you're not using `#[payable("EGLD")]` when sending ESDT
* Verify the contract was deployed with correct code metadata