---
id: sc-payments
title: Smart contract payments
---

[comment]: # (mx-abstract)

## Some general points

We want to offer an overview on how smart contracts process payments. This includes two complementary parts: receiving tokens and sending them.

:::important important
On MultiversX it is possible to send one or more tokens with any transaction. This includes EGLD, and it is also possible (though impractical) to send several payments of the same token at once.
:::


:::note note
Historically, it used to be impossible to send EGLD and ESDT at the same time, this is why some of the legacy APIs have this restriction. This restriction no longer applies since the [Spica release](https://multiversx.com/release/release-spica-patch-4-v1-8-12).
:::

---

[comment]: # (mx-context-auto)

## Receiving payments

There are two ways in which a smart contract can receive payments:
1. Like any regular account, directly, without any contract code being called;
2. Via an endpoint.

[comment]: # (mx-context-auto)

### Receiving payments directly

Sending EGLD and ESDT tokens directly to accounts works the same way for EOAs (externally owned accounts) as for smart contracts: the tokens are transferred from one account to the other without firing up the VM.

However, not all smart contracts are allowed to receive tokens directly. There is a flag that controls this, called "payable". This flag is part of the [code metadata](/developers/data/code-metadata), and is specified in the transaction that deploys or upgrades the smart contract.

The rationale for this is as follows: the MultiversX blockchain doesn't offer any mechanism to allow contracts to react to direct calls. This is because we wanted to keep direct calls simple, consistent, and with a predictable gas cost, in all contexts. Most contracts, however, will likely want to keep track of all the funds that are fed into them, so they do not want to accept payments without an opportunity to also change their internal state.

[comment]: # (mx-context-auto)

### Receiving payments via endpoints

The most common way for contracts to accept payments is by having endpoints annotated with the `#[payable]` annotation (or `#[payable("*")]`).

:::important important
The "payable" flag in the code metadata only refers to direct transfers. Transferring tokens via contract endpoint calls is not affected by it in any way.
:::

To accept any kind of payment, annotate the endpoints with `#[payable]`:

```rust
#[endpoint]
#[payable]
fn accept_any_payment(&self) {
	// ...
}
```

Usually on the first line there will be an instruction that processes, interprets, and validates the received payment ([see below](#call-value-methods))



If an endpoint only accepts EGLD, it can be annotated with `#[payable("EGLD")]`, although this is slowly falling out of favor. 

```rust
#[endpoint]
#[payable("EGLD")]
fn accept_egld(&self) {
	// ...
}
```


:::note Multi-transfer note
Note that it is currently possible to send two or more EGLD payments in the same transaction. The `#[payable("EGLD")]` annotation rejects that.
:::

This snippet is equivalent to:

```rust
#[endpoint]
#[payable]
fn accept_egld(&self) {
    let payment_amount = self.call_value().egld();
    // ...
}
```



:::note Hard-coded token identifier
It is also possible to hard-code a token identifier in the `payable`, e.g. `#[payable("MYTOKEN-123456")]`. It is rarely, if ever, used, tokens should normally be configured in storage, or at runtime.
:::

[comment]: # (mx-context-auto)

## Payment Types

The framework provides a unified approach to handling payments using the `Payment` type that treats EGLD and ESDT tokens uniformly. EGLD is represented as `EGLD-000000` token identifier, making all payment handling consistent.

**`Payment<A>`** - The primary payment type that combines:
- `token_identifier`: `TokenId<A>` - unified token identifier (EGLD serialized as "EGLD-000000")
- `token_nonce`: `u64` - token nonce for NFTs/SFTs, which is zero for all fungible tokens (incl. EGLD)
- `amount`: `NonZeroBigUint<A>` - guaranteed non-zero amount

**`PaymentVec<A>`** - A managed vector of `Payment<A>` objects, representing multiple payments in a single transaction.

[comment]: # (mx-context-auto)

## Call Value Methods

Additional restrictions on the incoming tokens can be imposed in the body of the endpoint, by calling the call value API. Most of these functions retrieve data about the received payment, while also stopping execution if the payment is not of the expected type.

[comment]: # (mx-context-auto)

### `all()` - Complete Payment Collection

`self.call_value().all()` retrieves all payments sent with the transaction as a `PaymentVec<A>`. It handles all tokens uniformly, including EGLD (represented as "EGLD-000000"). Never stops execution.

```rust
#[payable]
#[endpoint]
pub fn process_all_payments(&self) {
    let payments = self.call_value().all();
    for payment in payments.iter() {
        // Handle each payment uniformly
        self.process_payment(&payment.token_identifier, payment.token_nonce, &payment.amount);
    }
}
```

[comment]: # (mx-context-auto)

### `single()` - Strict Single Payment

`self.call_value().single()` expects exactly one payment and returns it. Will halt execution if zero or multiple payments are received. Returns a `Payment<A>` object.

```rust
#[payable]
#[endpoint]
pub fn deposit(&self) {
    let payment = self.call_value().single();
    // Guaranteed to be exactly one payment
    let token_id = &payment.token_identifier;
    let amount = payment.amount;
    
    self.deposits(&self.blockchain().get_caller()).set(&amount);
}
```

[comment]: # (mx-context-auto)

### `single_optional()` - Flexible Single Payment

`self.call_value().single_optional()` accepts either zero or one payment. Returns `Option<Payment<A>>` for graceful handling. Will halt execution if multiple payments are received.

```rust
#[payable]
#[endpoint]
pub fn execute_with_optional_fee(&self) {
    match self.call_value().single_optional() {
        Some(payment) => {
            // Process the payment as fee
            self.execute_premium_service(payment);
        },
        None => {
            // Handle no payment scenario
            self.execute_basic_service();
        }
    }
}
```

[comment]: # (mx-context-auto)

### `array()` - Fixed-Size Payment Array

`self.call_value().array<N>()` expects exactly N payments and returns them as a fixed-size array. Will halt execution if the number of payments doesn't match exactly.

```rust
#[payable]
#[endpoint]
pub fn swap(&self) {
    // Expect exactly 2 payments for the swap
    let [input_payment, fee_payment] = self.call_value().array();
    
    require!(
        input_payment.token_identifier != fee_payment.token_identifier,
        "Input and fee must be different tokens"
    );
    
    self.execute_swap(input_payment, fee_payment);
}
```

[comment]: # (mx-context-auto)

## Legacy Call Value Methods

The following methods are available for backwards compatibility but may be deprecated in future versions:

- `self.call_value().egld_value()` retrieves the EGLD value transferred, or zero. Never stops execution.
- `self.call_value().all_esdt_transfers()` retrieves all the ESDT transfers received, or an empty list. Never stops execution.
- `self.call_value().multi_esdt<N>()` is ideal when we know exactly how many ESDT transfers we expect. It returns an array of `EsdtTokenPayment`. It knows exactly how many transfers to expect based on the return type (it is polymorphic in the length of the array). Will fail execution if the number of ESDT transfers does not match.
- `self.call_value().single_esdt()` expects a single ESDT transfer, fails otherwise. Will return the received `EsdtTokenPayment`. It is a special case of `multi_esdt`, where `N` is 1.
- `self.call_value().single_fungible_esdt()` further restricts `single_esdt` to only fungible tokens, so those with their nonce zero. Returns the token identifier and amount, as pair.
- `self.call_value().egld_or_single_esdt()` retrieves an object of type `EgldOrEsdtTokenPayment`. Will halt execution in case of ESDT multi-transfer.
- `self.call_value().egld_or_single_fungible_esdt()` further restricts `egld_or_single_esdt` to fungible ESDT tokens. It will return a pair of `EgldOrEsdtTokenIdentifier` and an amount.
- `self.call_value().any_payment()` is the most general payment retriever. Never stops execution. Returns an object of type `EgldOrMultiEsdtPayment`. *(Deprecated since 0.64.1 - use `all()` instead)*

---

[comment]: # (mx-context-auto)

## Sending payments

We have seen how contracts can accommodate receiving tokens. Sending them is, in principle, even more straightforward, as it only involves specializing the `Payment` generic of the transaction using specific methods, essentially attaching a payload to a regular transaction. Read more about payments [here](../transactions/tx-payment.md).
