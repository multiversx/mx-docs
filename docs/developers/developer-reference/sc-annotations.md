---
id: sc-annotations
title: Smart contract annotations
---

[comment]: # (mx-abstract)

## Introduction

Annotations (also known as Rust "attributes") are the bread and butter of the `multiversx-sc` smart contract development framework. While contracts can in principle be written without any annotations or code generation macros in place, it is infinitely more difficult to do so.

One of the main purposes of the framework is to make the code as readable and concise as possible, and annotations are the path to get there.

For an introduction, check out [the Crowdfunding tutorial](/developers/tutorials/crowdfunding-p1). This page is supposed to be a complete index of all annotations that can be encountered in smart contracts.

[comment]: # (mx-exclude-context)

## Trait annotations

[comment]: # (mx-context-auto)

### `#[multiversx_sc::contract]`

The `contract` annotation must always be placed on a trait and will automatically make that trait the main container for the smart contract endpoints and logic. There should be only one such trait defined per crate.

Note that the annotation takes no additional arguments.

---

[comment]: # (mx-context-auto)

### `#[multiversx_sc::module]`

The `module` annotation must always be placed on a trait and will automatically make that trait a smart contract module.

Note that the annotation takes no additional arguments.

:::caution
Only one contract, module or proxy annotation is allowed per Rust module. If they are in separate files there is no problem, but if several share a file, explicit `mod module_name { ... }` must enclose the module.
:::

---

[comment]: # (mx-context-auto)

### `#[multiversx_sc::proxy]`

The `proxy` annotation must always be placed on a trait and will automatically make that trait a smart contract call proxy. More about smart contract proxies in [the contract calls reference](/developers/developer-reference/sc-contract-calls).

In short, contracts always get an auto-generated proxy. However, if such an auto-generated proxy of another contract is not available, it is possible to define such a "contract interface" by hand, using the `proxy` attribute.

Note that the annotation takes no additional arguments.

:::caution
Only one contract, module or proxy annotation is allowed per Rust module. If they are in separate files there is no problem, but if several share a file, explicit `mod proxy_name { ... }` must enclose the module.
:::

[comment]: # (mx-exclude-context)

## Method annotations

[comment]: # (mx-context-auto)

### `#[init]`

Every smart contract needs one constructor that only gets called once when the contract is deployed. The method annotated with init is the constructor.

```rust
#[multiversx_sc::contract]
pub trait Example {
    #[init]
    fn this_is_the_constructor(
        constructor_arg_1: u32,
        constructor_arg_2: BigUint) {
        // ...
    }
}
```

:::note
When upgrading a smart contract, the constructor in the new code is called. It is also called only once, and it can also never be called again.
:::

[comment]: # (mx-context-auto)

### `#[endpoint]` and `#[view]`

Endpoints are the public methods of contracts, which can be called in transactions. A contract can define any number of methods, but only those annotated with `#[endpoint]` or `#[view]` are visible to the outside world.

`#[view]` is meant to indicate readonly methods, but this is currently not enforced in any way. Functionally, `#[view]` and `#[endpoint]` are currently perfectly synonymous. However, there are plans for the future to enforce views to be verified at compile time to be readonly. When that happens, smart contracts that will already have been correctly annotated will be easier to migrate. Until then, there is still value in having 2 annotations, since they indicate intent.

If no arguments are provided to the attribute, the name of the Rust method will be the name of the endpoint. Alternatively, an explicit endpoint name can be provided in brackets.

Example:

```rust
#[multiversx_sc::contract]
pub trait Example {
	#[endpoint]
	fn example(&self) {
    }

    #[endpoint(camelCaseEndpointName)]
	fn snake_case_method_name(&self, value: BigUint) {
    }

    fn private_method(&self, value: &BigUint) {
    }

    #[view(getData)]
	fn get_data(&self) -> u32{
        0
    }
```

In this example, 3 methods are public endpoints. They are named `example`, `camelCaseEndpointName` and `getData`. All other names are internal and do not show up in the resulting contract.

:::note
All endpoint arguments and results must be either serializable or special endpoint argument types such as `MultiValueEncoded`. They must also all implement the `TypeAbi` trait. There is no such restriction for private methods.
:::

[comment]: # (mx-context-auto)

### Callbacks

There are 2 annotations for callbacks: `#[callback]` and `#[callback_raw]`. The second is only used in extreme cases.

Callbacks are special methods that get called automatically when the response comes after an asynchronous contract call. They give the contract the possibility to react to the result of a cross-shard call, but for consistency they get called the same way if the asynchronous call happens in the same shard.

They also act as closures, since they can retain some of the context of the transaction that performed the asynchronous call in the first place.

A more detailed explanation on how they work in [the contract calls reference](/developers/developer-reference/sc-contract-calls).

[comment]: # (mx-context-auto)

### Storage

It is possible for a developer to access storage manually in a contract, but this is error-prone and involves a lot of boilerplate code. For this reason, `multiversx-sc` offers storage annotations that manage and serialize the keys and values behind the scenes.

Each contract has a storage where arbitrary data can be stored on-chain. This storage is organized as a map of arbitrary length keys and values. The blockchain has no concept of storage key or value types, they are all stored as raw bytes. It is the job of the contract to interpret these values.

All trait methods annotated for storage handling must have no implementation.

[comment]: # (mx-context-auto)

#### `#[storage_get("key")]`

This is the simplest way to retrieve data from the storage. Let's start with an example of usage:

```rust
#[multiversx_sc::contract]
pub trait Adder {
	#[view(getSum)]
	#[storage_get("sum")]
	fn get_sum(&self) -> BigUint;

	#[storage_get("example_map")]
    fn get_value(&self, key_1: u32, key_2: u32) -> SerializableType;
```

First off, please note that a storage method can also be annotated with `#[view]` or `#[endpoint]`. The endpoint annotations refer to the role of the method in the contract, while the storage annotation refers to its implementation, so there is no overlap.

Then, also note that there are 2 ways to use this annotation. In the first example, we simply specify the key in the annotation and from here on the method will always read from the same storage key, `"sum"` in this case.

In the second example the get method also takes some arguments. Any number of arguments is allowed. These get concatenated to the base key to form a composite key, effectively turning a section of the contract storage into a dictionary or map.

For instance calling `self.get_value(1, 2)` will retrieve from the storage key `"example_map\x00\x00\x00\x01\x00\x00\x00\x02"` or `0x6578616d706c655f6d61700000000100000002`. `self.get_value(1, 3)` will read from a different place in storage, and so on.

This is the easiest way to get the equivalent of a HashMap in a smart contract.

Lastly, storage getters must always return a deserializable type. The framework will automatically deserialize the object from whatever bytes it finds in the storage value.

[comment]: # (mx-context-auto)

#### `#[storage_set("key")]`

This is the simplest way to write data to storage. Example:

```rust
#[multiversx_sc::contract]
pub trait Adder {
	#[storage_set("sum")]
	fn set_sum(&self, sum: &BigUint);

	#[storage_set("example_map")]
    fn set_value(&self, key_1: u32, key_2: u32, value: &SerializableType);
```

It works very similarly to `storage_get`, with the notable difference that instead of returning a value, the value must be provided as an argument. The value to store is always the last argument.

Again, just like for the getter, an arbitrary number of additional map keys can be specified, as for `set_value` in the example. This is how we can write values to a section of our storage that behaves like a map.

:::caution
There is no mechanism in place to ensure that there is no overlap between storage keys. Nothing prevents a developer from writing:

```rust
	#[storage_set("sum")]
	fn set_sum(&self, sum: &BigUint);

    #[storage_set("sum")]
	fn set_another_sum(&self, another_sum: &BigUint);

	#[storage_set("s")]
    fn set_value(&self, key: u16, value: &SerializableType);
```

The first problem is easy to spot: we have 2 setters with the same key.

The second is harder to notice. Calling `self.set_value(0x756d, value)` or `self.set_value(30061, value)` will also overwrite `"sum"`. This is because `"um"` = `"\x75\6d"`, which gets concatenated to the `"s"`, forming `"sum"`.

To avoid this vulnerability, **never have a key that is the prefix of another key!**

:::

[comment]: # (mx-context-auto)

#### `#[storage_mapper("key")]`

Storage mappers are objects that can manage multiple storage keys at once. They are in charge with both reading and writing values. Some of them read and write values to multiple storage keys at once.

There are many storage mappers in the framework and more can be custom-defined.

Example:

```rust
	#[storage_mapper("user_status")]
	fn user_status(&self) -> SingleValueMapper<UserStatus>;

    #[storage_mapper("list_mapper")]
	fn list_mapper(&self, sub_key: usize) -> LinkedListMapper<u32>;
```

The `SingleValueMapper` is the simplest of them all, since it only manages one storage key. Even though it only works with one storage entry, its syntax is more compact than `storage_get`/`storage_set` so it is used quite a lot.

In the `LinkedListMapper` we are dealing with a list of items, each with its own key.

Also note that additional sub-keys are also allowed for storage mappers, the same as for `storage_get` and `storage_set`.

[comment]: # (mx-context-auto)

#### `#[storage_is_empty("key")]`

This is very similar to `storage_get`, but instead of retrieving the value, it returns a boolean indicating whether the serialized value is empty or not. It does not attempt to deserialize the value, so it can be faster and more resilient than `storage_get`, depending on type.

```rust
	#[storage_is_empty("opt_addr")]
	fn is_empty_opt_addr(&self) -> bool;
```

Nowadays, it is more common to use storage mappers. The `SingleValueMapper` has an `is_empty()` method that does the same.

[comment]: # (mx-context-auto)

#### `#[storage_clear("key")]`

This is very similar to `storage_set`, but instead of serializing and writing the storage value, it simply clears the raw bytes.
It does not do any serializing, so it can be faster than `storage_set`, depending on type.

```rust
	#[storage_clear("field_to_clear")]
	fn clear_storage_value(&self);
```

Nowadays, it is more common to use storage mappers. The `SingleValueMapper` has an `clear()` method that does the same.

[comment]: # (mx-context-auto)

### Events

Events are a way of returning data from smart contract, by leaving a trace of what happened during the execution. Event logs are not saved on the blockchain, but a hash of them is. This means that we can always check whether certain events were emitted by a transactions or not.

Because they are not saved on the chain in full, they are also a lot cheaper than storage.

In smart contracts we define them as trait methods with no implementation, as follows:

```rust
	#[event("transfer")]
	fn transfer_event(
		&self,
		#[indexed] from: &ManagedAddress,
		#[indexed] to: &ManagedAddress,
		#[indexed] token_id: u32,
        data: ManagedBuffer,
	);
```

The annotation always requires the name of the event to be specified explicitly in brackets.

Events have 2 types of arguments:

- "Topics" are annotated with `#[indexed]`. When saving event logs to a database, indexes will be created for all these fields, so they can be searched for efficiently.
- The "data" argument has no annotation. There can be only one data field in an event, and it cannot be indexed later.

Event arguments (fields) can be of any serializable type. There is no return value for events.

[comment]: # (mx-context-auto)

### Events (legacy)

There is a legacy annotation, `#[legacy_event]` still used by some older contracts. It is deprecated and should no longer be used.

[comment]: # (mx-context-auto)

### `#[proxy]`

This is a simple getter, which provides a convenient instance of a contract proxy. It is used when wanting to call another contract.

```rust
#[multiversx_sc::module]
pub trait ForwarderAsyncCallModule {
	#[proxy]
	fn vault_proxy(&self, to: Address) -> vault::Proxy<Self::Api>;

    // ...
}
```

There is no need for arguments, the annotation will figure out the contract to call by the provided return type.

:::important
Proxy types need to be specified with an explicit module. In the example `vault::` is compulsory.
:::

[comment]: # (mx-context-auto)

### `#[output_names]`

This one is used for ABI result names. In Rust, it is impossible to write Rust Docs for method returns, so we are using this annotation to optionally name the outputs of an endpoint.
