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
The "payable" flag in the code metadata only refers to direct transfers. Trasferring tokens via contract endpoint calls is not affected by it in any way.
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
- `self.call_value().egld_value()` retrieves the EGLD value transfered, or zero. Never stops execution.
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


We have seen how how contracts can accomodate receiving tokens. Sending them is, in principle, even more straightforward, as it only involves calling methods from the `self.send()` component.


[comment]: # (mx-context-auto)

### Sending payments directly

Contracts can send tokens directly, without calling any endpoint at the destination, by using several methods from the API.

The following methods will perform a transfer-execute call. This is a type of asynchronous call that does not provide a callback, or any other feedback from the receiver. For direct transferring of funds, this call type is ideal. 

- `self.send().direct_egld(to, amount)` sends EGLD directly to an address.
- `self.send().direct_non_zero_egld(to, amount)` sends EGLD directly to an address, if the amount is non-zero. Does nothing otherwise.
- `self.send().direct(to, token, nonce, amount)` sends EGLD or a single ESDT token directly to an address. The `token` argument is of type `EgldOrEsdtTokenIdentifier`.
- `self.send().direct_non_zero(to, token, nonce, amount)` sends EGLD or a single ESDT token directly to an address, if the amount is non-zero. Does nothing otherwise.
- `self.send().direct_esdt(to, token, nonce, amount)` sends a single ESDT token directly to an address.
- `self.send().direct_non_zero_esdt_payment(to, payment)` sends a single ESDT token directly to an address, if the amount is non-zero. Does nothing otherwise.
- `self.send().direct_multi(to, payments)` sends one or more ESDT tokens to destination. The `payments` argument is a list of such payments.

It is also possible to transfer tokens via an async call:
- `self.send().transfer_esdt_via_async_call(to, token, nonce, amount)`
- `self.send().transfer_esdt_non_zero_via_async_call(to, token, nonce, amount)`
- `self.send().transfer_multiple_esdt_via_async_call(to, payments)`


[comment]: # (mx-context-auto)

### Sending payments to contract endpoints

Sending tokens to a contract endpoint is a contract call, and we have a [type-safe and clean way of doing this](/developers/developer-reference/sc-contract-calls).

Even if you do not know what the endpoint or the arguments will be at compile time, we still recommend creating a `ContractCall` first, and then decorating and sending it, as in [these examples](/developers/developer-reference/sc-contract-calls#no-proxy).

There are, howver, a few direct API methods. Just to mention them:
- `self.send().direct_esdt_with_gas_limit(to, token_identifier, nonce, amount, gas, endpoint_name, arguments)`
- `self.send().direct_non_zero_esdt_with_gas_limit(to, token_identifier, nonce, amount, gas, endpoint_name, arguments)`
- `self.send().direct_with_gas_limit(to, token, nonce, amount, gas, endpoint_name, arguments)`
- `self.send().direct_non_zero_with_gas_limit(to, token, nonce, amount, gas, endpoint_name, arguments)`


[comment]: # (mx-context-auto)

### Low-level API

In the unlikely case that you still could not find an appropriate method of sending tokens using the methods in this page or [the contract calls page](/developers/developer-reference/sc-contract-calls), it is also possible to use the methods in `self.send_raw()` directly.

<!-- TODO: make SendRawWrapper public and post link to docs.rs. -->
