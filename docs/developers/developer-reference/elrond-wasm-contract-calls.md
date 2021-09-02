---
id: elrond-wasm-contract-calls
title: Smart contract to smart contract calls
---

## Introduction

This guide provides some examples on how to call a contract from another contract. These examples can be found in [the contract composability feature tests](https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/feature-tests/composability).

More in-depth explanations will follow, for now we are providing the most relevant examples.

## Asynchronous calls

```rust
pub trait ForwarderAsyncCallModule {
	#[proxy]
	fn vault_proxy(&self, to: Address) -> vault::Proxy<Self::SendApi>;

	#[endpoint]
	#[payable("*")]
	fn forward_async_accept_funds(
		&self,
		to: Address,
		#[payment_token] token: TokenIdentifier,
		#[payment_amount] payment: Self::BigUint,
		#[payment_nonce] token_nonce: u64,
	) -> AsyncCall<Self::SendApi> {
		self.vault_proxy(to)
			.accept_funds(token, payment)
			.with_nft_nonce(token_nonce)
			.async_call()
	}
}
```

## Asynchronous calls with callback

```rust
pub trait ForwarderAsyncCallModule {
	#[proxy]
	fn vault_proxy(&self, to: Address) -> vault::Proxy<Self::SendApi>;

	#[endpoint]
	fn forward_async_retrieve_funds(
		&self,
		to: Address,
		token: TokenIdentifier,
		token_nonce: u64,
		amount: Self::BigUint,
	) -> AsyncCall<Self::SendApi> {
		self.vault_proxy(to)
			.retrieve_funds(token, token_nonce, amount, OptionalArg::None)
			.async_call()
			.with_callback(self.callbacks().retrieve_funds_callback())
	}

	#[callback]
	fn retrieve_funds_callback(
		&self,
		#[payment_token] token: TokenIdentifier,
		#[payment_nonce] nonce: u64,
		#[payment_amount] payment: Self::BigUint,
	) {
		self.retrieve_funds_callback_event(&token, nonce, &payment);

		let _ = self.callback_data().push(&CallbackData {
			callback_name: BoxedBytes::from(&b"retrieve_funds_callback"[..]),
			token_identifier: token,
			token_nonce: nonce,
			token_amount: payment,
			args: Vec::new(),
		});
	}
}
```

## Synchronous calls with callback



```rust
pub trait ForwarderAsyncCallModule {
	#[proxy]
	fn vault_proxy(&self, to: Address) -> vault::Proxy<Self::SendApi>;

    #[endpoint]
	#[payable("*")]
	fn forward_sync_accept_funds(
		&self,
		to: Address,
		#[payment_token] token: TokenIdentifier,
		#[payment_amount] payment: Self::BigUint,
		#[payment_nonce] token_nonce: u64,
	) {

		let result: MultiResult4<TokenIdentifier, BoxedBytes, Self::BigUint, u64> = self
			.vault_proxy(to)
			.accept_funds_echo_payment(token, payment, token_nonce)
			.execute_on_dest_context();

		let (token_identifier, token_type_str, token_payment, token_nonce) = result.into_tuple();
		self.accept_funds_sync_result_event(
			&token_identifier,
			token_type_str.as_slice(),
			&token_payment,
			token_nonce,
		);
	}

	#[event("accept_funds_sync_result")]
	fn accept_funds_sync_result_event(
		&self,
		#[indexed] token_identifier: &TokenIdentifier,
		#[indexed] token_type: &[u8],
		#[indexed] token_payment: &Self::BigUint,
		#[indexed] token_nonce: u64,
	);
}
```

