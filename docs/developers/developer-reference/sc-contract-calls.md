---
id: sc-contract-calls
title: Smart contract to smart contract calls
---

## Introduction

This guide provides some examples on how to call a contract from another contract. More examples can be found in [the contract composability feature tests](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/feature-tests/composability).

There are three ways of doing these calls:
- importing the callee contract's source code and using the auto-generated proxy (recommended)
- writing the proxy manually
- manually serializing the function name and arguments (not recommended)

## Method #1: Importing the contract

If you have access to the callee contract's code, importing the auto-generated proxy is easy. Simply import the contract (and any other modules the contract itself may use): 

```toml
[dependencies.contract-crate-name]
path = "relative-path-to-contract-crate"
```

If you want to use endpoints contained in an external module (i.e. in a different crate than the main contract) that the callee contract imports, you'll also have to add the module to the dependencies, the same way you added the main contract.

Additionally, in your caller code, you have to add the following import:
```rust
use module_namespace::ProxyTrait as _;
```

If you use the rust-analyser VSCode extension, it might complain that it can't find this, but if you actually build the contract, the compiler can find it just fine.

Once you've imported the contract and any external modules it might use, you have to declare your proxy creator function:
```rust
#[proxy]
fn contract_proxy(&self, sc_address: ManagedAddress) -> contract_namespace::Proxy<Self::Api>;
```

This function creates an object that contains all the endpoints of the callee contract, and it handles the serialization automatically.

Let's say you have the following endpoint in the contract you wish to call:

```rust
#[endpoint(myEndpoint)]
fn my_endpoint(&self, arg: BigUint) -> BigUint {
	// implementation
}
```

To call this endpoint, you would do this in the caller contract:
```rust
let biguint_result = self.contract_proxy(callee_sc_address)
	.my_endpoint(my_biguint_arg)
	.execute_on_dest_context();
```

This performs a synchronous call to the `callee_sc_address` contract, with the `my_biguint_arg` used as input for `arg: BigUint`. Notice how you also don't have to specify the `myEndpoint` name either. It's handled automatically.

After performing this call, you can execute some more code in the caller contract, using `biguint_result` as you wish.

NOTE: Keep in mind that this only works for same-shard contracts. If the contracts are in different shards, you have to use async-calls or transfer-and-execute.

## Types of Contract to Contract calls

There are two main types of contract-to-contract calls available at the moment:
- synchronous, same-shard calls, through execute_on_dest_context (as demonstrated above)
- asynchronous calls

### Asynchronous calls

Asynchronous calls can be launched either through transfer_execute (in the case you don't care about the result) or through async_call when you want to save the result from the callee contract or perform some additional computation. Keep in mind logic in callbacks should be kept at a minimum, as they usually receive very little gas to perform their duty.

To launch a transfer and execute call using the above described proxy, you can simply replace `execute_on_dest_context` method with the `transfer_execute` method. Keep in mind that you can't get the returned `BigUint` in this case.

If instead you want to launch an async call, you have to use the `async_call` method, and use the `call_and_exit()` method on the returned object.  

Using the above example, your async call would look like this:
```rust
#[endpoint]
fn caller_endpoint(&self) {
	// other code here

	self.contract_proxy(callee_sc_address)
		.my_endpoint(my_biguint_arg)
		.async_call()
		.call_and_exit();
}
```

### Callbacks

If you want to perform some logic based on the result of the async call, or just some cleanup after the call, you have to declare a callback function. For example, let's say we want to do something based if the result is even, and something else if the result is odd, and do some cleanup in case of error. Our callback function would look something like this:
```rust
#[callback]
fn my_endpoint_callback(
	&self,
	#[call_result] result: ManagedAsyncCallResult<BigUint>
) {
	match result {
        ManagedAsyncCallResult::Ok(value) => {
            if value % 2 == 0 {
				// do something
			} else {
				// do something else
			}
        },
        ManagedAsyncCallResult::Err(err) => {
			// log the error in storage
			self.err_storage().set(&err.err_msg);
        },
    }
}
```

To assign this callback to the aforementioned async call, we hook it like this:
```rust
#[endpoint]
fn caller_endpoint(&self) {
	// other code here

	self.contract_proxy(callee_sc_address)
		.my_endpoint(my_biguint_arg)
		.async_call()
		.with_callback(self.callbacks().my_endpoint_callback())
		.call_and_exit();
}
```

Even though, in theory, smart contract can only have ONE callback function, the Rust framework handles this for you by saving an ID for the callback function in storage when you fire the async call, and it knows how to retrieve the ID and call the correct function once the call returns.

### Callback Arguments

Your callback may have additional arguments that are given to it at the time of launching the async call. These will be automatically saved before performing the initial async call, and they will be retrieved when the callback is called. Example:

```rust
#[callback]
fn my_endpoint_callback(
	&self,
	original_caller: ManagedAddress,
	#[call_result] result: ManagedAsyncCallResult<BigUint>
) {
	match result {
        ManagedAsyncCallResult::Ok(value) => {
            if value % 2 == 0 {
				// do something
			} else {
				// do something else
			}
        },
        ManagedAsyncCallResult::Err(err) => {
			// log the error in storage
			self.err_storage().set(&err.err_msg);
        },
    }
}
```

To assign this callback to the aforementioned async call, we hook it like this:
```rust
#[endpoint]
fn caller_endpoint(&self) {
	// other code here
	let caller = self.blockchain().get_caller();

	self.contract_proxy(callee_sc_address)
		.my_endpoint(my_biguint_arg)
		.async_call()
		.with_callback(self.callbacks().my_endpoint_callback(caller))
		.call_and_exit();
}
```

Notice how the callback now has an argument:
```rust
self.callbacks().my_endpoint_callback(caller)
```

You can then use `original_caller` in the callback like any other function argument.

### Payments in proxy arguments

Let's say you want to call a `#[payable]` endpoint, with this definition:
```rust
#[payable("*")]
#[endpoint(myEndpoint)]
fn my_payable_endpoint(&self, arg: BigUint) -> BigUint {
	let payment = self.call_value().egld_or_single_esdt();
	// implementation
}
```

To pass the payment, you can use the `with_egld_or_single_esdt_token_transfer` method:

```rust
#[endpoint]
fn caller_endpoint(&self, token: EgldOrEsdtTokenIdentifier, nonce: u64, amount: BigUint) {
	// other code here

	self.contract_proxy(callee_sc_address)
		.my_endpoint(token, nonce, amount, my_biguint_arg)
		.with_egld_or_single_esdt_token_transfer(token, nonce, amount)
		.async_call()
		.call_and_exit();
}
```

`with_egld_or_single_esdt_token_transfer` allows adding EGLD payment of a single ESDT token as payment.

There are similar functions for other types of payments:
- `add_esdt_token_transfer` - for single ESDT transfers
- `with_egld_transfer` - for EGLD transfers
- `with_multi_token_transfer` - for ESDT multi-transfers

### Payments in callbacks

If you expect to receive a payment instead of paying the contract, keep in mind callback functions are `#[payable]` by default, so you don't need to add the annotation:

```rust
#[callback]
fn my_endpoint_callback(&self, #[call_result] result: ManagedAsyncCallResult<BigUint>) {
	let payment = self.call_value().egld_or_single_esdt();

	match result {
        ManagedAsyncCallResult::Ok(value) => {
            if value % 2 == 0 {
				// do something
			} else {
				// do something else
			}
        },
        ManagedAsyncCallResult::Err(err) => {
			// log the error in storage
			self.err_storage().set(&err.err_msg);
        },
    }
}
```

Keep in mind you do NOT need to specify the payments when hooking the callback:
```rust
#[endpoint]
fn caller_endpoint(&self) {
	// other code here

	self.contract_proxy(callee_sc_address)
		.my_endpoint(my_biguint_arg)
		.async_call()
		.with_callback(self.callbacks().my_endpoint_callback())
		.call_and_exit();
}
```
### Gas limit for execution

`with_gas_limit` allows you to specify a gas limit for your call. By default, all gas left is passed, and any remaining is returned either for further execution (in case of sync calls) or for callback execution (for async calls).

### Method #2: Manually writing the proxy

Sometimes you don't have access to the callee contract code, or it's simply inconvenient to import it (different framework versions, for instance). In this case, you're going to have to manually declare your proxy. Let's use the same example endpoint as in the first method:
```rust
mod callee_proxy {
    multiversx_sc::imports!();

    #[multiversx_sc::proxy]
    pub trait CalleeContract {
        #[payable("*")]
		#[endpoint(myEndpoint)]
		fn my_payable_endpoint(&self, arg: BigUint) -> BigUint;
    }
}
```

This is the only thing you'll have to do differently. The rest is the same, you declare a proxy builder, and the calls are all exactly the same as in method #1.
```rust
#[proxy]
fn contract_proxy(&self, sc_address: ManagedAddress) -> callee_proxy::Proxy<Self::Api>;
```

### Method #3: Manual calls (NOT recommended)

If for some reason you don't want to use the contract proxies, you can create a `ContractCall` object by hand:

```rust
let mut contract_call = ContractCall::new(
    self.api,
    dest_sc_address,
    ManagedBuffer::new_from_bytes(endpoint_name),
);
```

Where `dest_sc_address` is the address of the callee contract, and `endpoint_name` would be `b"myEndpoint"`.

From here, you would use `contract_call.push_endpoint_arg(&your_arg)` and the manual payment adder functions described in method #1 miscellaneous category.  

You would then use the same `execute_on_dest_context`, `transfer_execute` and `async_call` methods as in the automatically built `ContractCall` objects from before.

Only use this method if you REALLY have to, as it's very easy to make mistakes if you work with low-level code like this.

## Conclusion

We hope this covers all the questions about how to call another contract from your contract. Use method #1 whenever possible, and method #2 if needed. Avoid method #3 as much as possible.  
