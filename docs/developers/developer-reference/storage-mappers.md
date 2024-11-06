---
id: storage-mappers
title: Storage Mappers
---
[comment]: # (mx-abstract)

The Rust framework provides various storage mappers you can use. Deciding which one to use for every situation is critical for performance. There will be a comparison section after each mapper is described.

Note: All the storage mappers support additional key arguments.

[comment]: # (mx-context-auto)

# General purpose mappers

[comment]: # (mx-context-auto)

## SingleValueMapper

Stores a single value. Examples:

```rust
fn single_value(&self) -> SingleValueMapper<Type>;
fn single_value_with_single_key_arg(&self, key_arg: Type1) -> SingleValueMapper<Type2>;
fn single_value_with_multi_key_arg(&self, key_arg1: Type1, key_arg2: Type2) -> SingleValueMapper<Type3>;
```

Keep in mind there is no way of iterating over all `key_arg`s, so if you need to do that, consider using another mapper.

Available methods:

[comment]: # (mx-context-auto)

### get
```rust
fn get() -> Type
```

Reads the value from storage and deserializes it to the given `Type`. For numerical types and vector types, this will return the default value for empty storage, i.e. 0 and empty vec respectively. For custom structs, this will signal an error if trying to read from empty storage.

[comment]: # (mx-context-auto)

### set
```rust
fn set(value: &Type)
```

Sets the stored value to the provided `value` argument. For base Rust numerical types, the reference is not needed.

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` is the storage entry is empty. Usually used when storing struct types to prevent crashes on `get()`.

[comment]: # (mx-context-auto)

### set_if_empty
```rust
fn set_if_empty(value: &Type)
```

Sets the value only if the storage for that value is currently empty. Usually used in #init functions to not overwrite values on contract upgrade.

[comment]: # (mx-context-auto)

### clear
```rust
fn clear()
```

Clears the entry.

[comment]: # (mx-context-auto)

### update
```rust
fn update<R, F: FnOnce(&mut Type) -> R>(f: F) -> R
```

Takes a closure as argument, applies that closure to the currently stored value, saves the new value, and returns any value the given closure might return. Examples:

Incrementing a value:
```rust
fn my_value(&self) -> SingleValueMapper<BigUint>;

self.my_value().update(|val| *val += 1);
```

Modifying a struct's field:
```rust
pub struct MyStruct {
    pub field_1: u64,
    pub field_2: u32
}

fn my_value(&self) -> SingleValueMapper<MyStruct>;

self.my_value().update(|val| val.field1 = 5);
```

Returning a value from the closure:
```rust
fn my_value(&self) -> SingleValueMapper<BigUint>;

let new_val = self.my_value().update(|val| {
    *val += 1;
    *val
});
```

[comment]: # (mx-context-auto)

### raw_byte_length
```rust
fn raw_byte_length() -> usize
```

Returns the raw byte length of the stored value. This should be rarely used.

[comment]: # (mx-context-auto)

## VecMapper

Stores elements of the same type, each under their own storage key. Allows access by index for said items. Keep in mind indexes start at 1 for VecMapper. Examples:

```rust
fn my_vec(&self) -> VecMapper<Type>;
fn my_vec_with_args(&self, arg: Type1) -> VecMapper<Type2>;
```

Available methods:

[comment]: # (mx-context-auto)

### push
```rust
fn push(elem: &T)
```

Stores the element at index `len` and increments `len` afterwards.

[comment]: # (mx-context-auto)

### get
```rust
fn get(index: usize) -> Type
```

Gets the element at the specific index. Valid indexes are 1 to `len`, both ends included. Attempting to read from an invalid index will signal an error.

[comment]: # (mx-context-auto)

### set
```rust
fn set(index: usize, value: &Type)
```

Sets the element at the given index. Index must be in inclusive range 1 to `len`.

[comment]: # (mx-context-auto)

### clear_entry
```rust
fn clear_entry(index: usize)
```

Clears the entry at the given index. This does not decrease the length.

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the mapper has no elements stored.

[comment]: # (mx-context-auto)

### len
```rust
fn len() -> usize
```

Returns the number of items stored in the mapper.

[comment]: # (mx-context-auto)

### extend_from_slice
```rust
fn extend_from_slice(slice: &[Type])
```

Pushes all elements from the given slice at the end of the mapper. More efficient than manual `for` of `push`, as the internal length is only read and updated once.

[comment]: # (mx-context-auto)

### swap_remove
```rust
fn swap_remove(index: usize)
```

Removes the element at `index`, moves the last element to `index` and decreases the `len` by 1. There is no way of removing an element and preserving the order.

[comment]: # (mx-context-auto)

### clear
```rust
fn clear()
```

Clears all the elements from the mapper. This function can run out of gas for big collections.

[comment]: # (mx-context-auto)

### iter
```rust
fn iter() -> Iter<Type>
```

Provides an iterator over all the elements.

[comment]: # (mx-context-auto)

## SetMapper

Stores a set of values, with no duplicates being allowed. It also provides methods for checking if a value already exists in the set. Values order is given by their order of insertion.

Unless you need to maintain the order of the elements, consider using `UnorderedSetMapper` or `WhitelistMapper` instead, as they're more efficient.

Examples:
```rust
fn my_set(&self) -> SetMapper<Type>;
```

Available methods:

[comment]: # (mx-context-auto)

### insert
```rust
fn insert(value: Type) -> bool
```

Insers the value into the set. Returns `false` if the item was already present.

[comment]: # (mx-context-auto)

### remove
```rust
fn remove(value: &Type)
```

Removes the value from the set. Returns `false` if the set did not contain the value.

[comment]: # (mx-context-auto)

### contains
```rust
fn contains(value: &Type) -> bool
```

Returns `true` if the mapper contains the given value.

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the mapper has no elements stored.

[comment]: # (mx-context-auto)

### len
```rust
fn len() -> usize
```

Returns the number of items stored in the mapper.

[comment]: # (mx-context-auto)

### clear
```rust
fn clear()
```

Clears all the elements from the mapper. This function can run out of gas for big collections.

[comment]: # (mx-context-auto)

### iter
```rust
fn iter() -> Iter<Type>
```

Returns an iterator over all the stored elements.

[comment]: # (mx-context-auto)

## UnorderedSetMapper

Same as SetMapper, but does not guarantee the order of the items. More efficient than `SetMapper`, and should be used instead unless you need to maintain the order. Internally, `UnorderedSetMapper` uses a `VecMapper` to store the elements, and additionally, it stores each element's index to provide O(1) `contains`.

Examples:
```rust
fn my_set(&self) -> UnorderedSetMapper<Type>;
```

Available methods:

`UnorderedSetMapper` contains the same methods as `SetMapper`, the only difference being item removal. Instead of `remove`, we only have `swap_remove` available.

[comment]: # (mx-context-auto)

### swap_remove
```rust
fn swap_remove(value: &Type) -> bool
```

Uses the internal `VecMapper`'s swap_remove method to remove the element. Additionally, it overwrites the last element's stored index with the removed value's index. Returns `false` if the element was not present in the set.

[comment]: # (mx-context-auto)

## WhitelistMapper

Stores a whitelist of items. Does not provide any means of iterating over the elements, so if you need to iterate over the elements, use `UnorderedSetMapper` instead. Internally, this mapper simply stores a flag in storage for each item if they're whitelisted.

Examples:
```rust
fn my_whitelist(&self) -> WhitelistMapper<Type>
```

Available methods:

[comment]: # (mx-context-auto)

### add
```rust
fn add(value: &Type)
```

Adds the value to the whitelist.

[comment]: # (mx-context-auto)

### remove
```rust
fn remove(value: &Type)
```

Removes the value from the whitelist.

[comment]: # (mx-context-auto)

### contains
```rust
fn contains(value: &Type) -> bool
```

Returns `true` if the mapper contains the given value.

[comment]: # (mx-context-auto)

### require_whitelisted
```rust
fn require_whitelisted(value: &Type)
```

Will signal an error if the item is not whitelisted. Does nothing otherwise.

[comment]: # (mx-context-auto)

## LinkedListMapper

Stores a linked list, which allows fast insertion/removal of elements, as well as possibility to iterate over the whole list.

Examples:
```rust
fn my_linked_list(&self) -> LinkedListMapper<Type>
```

Available methods:

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the mapper has no elements stored.

[comment]: # (mx-context-auto)

### len
```rust
fn len() -> usize
```

Returns the number of items stored in the mapper.

[comment]: # (mx-context-auto)

### clear
```rust
fn clear()
```

Clears all the elements from the mapper. This function can run out of gas for big collections.

[comment]: # (mx-context-auto)

### iter
```rust
fn iter() -> Iter<Type>
```

Returns an iterator over all the stored elements.

[comment]: # (mx-context-auto)

### iter_from_node_id
```rust
fn iter_from_node_id(node_id: u32) -> Iter<Type>
```

Returns an iterator starting from the given `node_id`. Useful when splitting iteration over multiple SC calls.

[comment]: # (mx-context-auto)

### front
```rust
fn front() -> Option<LinkedListNode<Type>>
fn back() -> Option<LinkedListNode<Type>>
```

Returns the first/last element if the list is not empty, `None` otherwise. A `LinkedListNode` has the following format:
```rust
pub struct LinkedListNode<Type> {
    value: Type,
    node_id: u32,
    next_id: u32,
    prev_id: u32,
}

impl<Type> LinkedListNode<Type> {
    pub fn get_value_cloned(&self) -> Type {
        self.value.clone()
    }

    pub fn get_value_as_ref(&self) -> &Type {
        &self.value
    }

    pub fn into_value(self) -> Type {
        self.value
    }

    pub fn get_node_id(&self) -> u32 {
        self.node_id
    }

    pub fn get_next_node_id(&self) -> u32 {
        self.next_id
    }

    pub fn get_prev_node_id(&self) -> u32 {
        self.prev_id
    }
}
```

[comment]: # (mx-context-auto)

### pop_front/pop_back
```rust
fn pop_front(&mut self) -> Option<LinkedListNode<Type>>
fn pop_back(&mut self) -> Option<LinkedListNode<Type>>
```

Removes and returns the first/last element from the list.

[comment]: # (mx-context-auto)

### push_after/push_before
```rust
pub fn push_after(node: &mut LinkedListNode<Type>, element: Type) -> Option<LinkedListNode<Type>>
pub fn push_before(node: &mut LinkedListNode<Type>, element: Type) -> Option<LinkedListNode<Type>>
```

Inserts the given `element` into the list after/before the given `node`. Returns the newly inserted node if the insertion was successful, `None` otherwise.

[comment]: # (mx-context-auto)

### push_after_node_id/push_before_node_id
```rust
pub fn push_after_node_id(node_id: usize, element: Type) -> Option<LinkedListNode<Type>>
pub fn push_before_node_id(node_id: usize, element: Type) -> Option<LinkedListNode<Type>>
```

Same as the methods above, but uses node_id instead of a full node struct.

[comment]: # (mx-context-auto)

### push_front/push_back
```rust
fn push_front(element: Type)
fn push_back(element: Type)
```

Pushes the given `element` at the front/back of the list. Can be seen as specialized versions of `push_before_node_id` and `push_after_node_id`.

[comment]: # (mx-context-auto)

### set_node_value
```rust
fn set_node_value(mut node: LinkedListNode<Type>, new_value: Type)
```

Sets a node's value, if the node exists in the list.

[comment]: # (mx-context-auto)

### set_node_value_by_id
```rust
fn set_node_value_by_id(node_id: usize, new_value: Type)
```

Same as the method above, but uses node_id instead of a full node struct.

[comment]: # (mx-context-auto)

### remove_node
```rust
fn remove_node(node: &LinkedListNode<Type>)
```

Removes the node from the list, if it exists.

[comment]: # (mx-context-auto)

### remove_node_by_id
```rust
fn remove_node(node_id: usize)
```

Same as the method above, but uses node_id instead of a full node struct.

[comment]: # (mx-context-auto)

### iter
```rust
fn iter() -> Iter<Type>
```

Returns an iterator over all the stored elements.

[comment]: # (mx-context-auto)

### iter_from_node_id
```rust
fn iter_from_node_id(node_id: u32) -> Iter<Type>
```

Returns an iterator starting from the given `node_id`. Useful when splitting iteration over multiple SC calls.

[comment]: # (mx-context-auto)

## MapMapper

Stores (key, value) pairs, while also allowing iteration over keys. This is the most expensive mapper to use, so make sure you really need to use it. Keys order is given by their order of insertion (same as `SetMapper`).

Examples:
```rust
fn my_map(&self) -> MapMapper<KeyType, ValueType>
```

Available methods:

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the mapper has no elements stored.

[comment]: # (mx-context-auto)

### len
```rust
fn len() -> usize
```

Returns the number of items stored in the mapper.

[comment]: # (mx-context-auto)

### contains_key
```rust
fn contains_key(k: &KeyType) -> bool
```

Returns `true` if the mapper contains the given key.

[comment]: # (mx-context-auto)

### get
```rust
fn get(k: &KeyType) -> Option<ValueType>
```

Returns `Some(value)` if the key exists. Returns `None` if the key does not exist in the map.

[comment]: # (mx-context-auto)

### insert
```rust
fn insert(k: KeyType, v: ValueType) -> Option<V>
```

Inserts the given key, value pair into the map, and returns `Some(old_value)` if the key was already present.

[comment]: # (mx-context-auto)

### remove
```rust
fn remove(k: &KeyType) -> Option<ValueType>
```

Removes the key and the corresponding value from the map, and returns the value. If the key was not present in the map, `None` is returned.

[comment]: # (mx-context-auto)

### keys/values/iter
```rust
fn keys() -> Keys<KeyType>
fn values() -> Values<ValueType>
fn iter() -> Iter<KeyType, ValueType>
```

Provides an iterator over all keys, values, and (key, value) pairs respectively.

[comment]: # (mx-context-auto)

# Specialized mappers

[comment]: # (mx-context-auto)

## FungibleTokenMapper

Stores a token identifier (like a `SingleValueMapper<TokenIdentifier>`) and provides methods for using this token ID directly with the most common API functions. Note that most method calls will fail if the token was not issued previously.

Examples:
```rust
fn my_token_id(&self) -> FungibleTokenMapper
```

Available methods:

[comment]: # (mx-context-auto)

### issue/issue_and_set_all_roles
```rust
fn issue(issue_cost: BigUint, token_display_name: ManagedBuffer, token_ticker: ManagedBuffer,initial_supply: BigUint, num_decimals: usize, opt_callback: Option<CallbackClosure<SA>>) -> !

fn issue_and_set_all_roles(issue_cost: BigUint, token_display_name: ManagedBuffer, token_ticker: ManagedBuffer,initial_supply: BigUint, num_decimals: usize, opt_callback: Option<CallbackClosure<SA>>) -> !
```

Issues a new fungible token. `issue_cost` is 0.05 EGLD (5000000000000000) at the time of writing this, but since this changed in the past, we've let it as an argument it case it changes again in the future.

This mapper allows only one issue, so trying to issue multiple types will signal an error.

`opt_callback` is an optional custom callback you can use for your issue call. We recommend using the default callback. To do so, you need to import multiversx-sc-modules in your Cargo.toml:
```toml
[dependencies.multiversx-sc-modules]
version = "0.39.0"
```

Note: current released multiversx-sc version at the time of writing this was 0.39.0, upgrade if necessary.

Then you should import the `DefaultCallbacksModule` in your contract:
```rust
#[multiversx_sc::contract]
pub trait MyContract: multiversx_sc_modules::default_issue_callbacks::DefaultIssueCallbacksModule {
    /* ... */
}
```

Additionally, pass `None` for `opt_callback`.

Note the "never" type `-> !` as return type for this function. This means this function will terminate the execution and launch the issue async call, so any code after this call will not be executed.

Alternatively, if you want to issue and also have all roles set for the SC, you can use the `issue_and_set_all_roles` method instead.

[comment]: # (mx-context-auto)

### mint
```rust
fn mint(amount: BigUint) -> EsdtTokenPayment
```

Mints `amount` tokens for the stored token ID, using the `ESDTLocalMint` built-in function. Returns a payment struct, containing the token ID and the given amount.

[comment]: # (mx-context-auto)

### mint_and_send
```rust
fn mint_and_send(to: &ManagedAddress, amount: BigUint) -> EsdtTokenPayment<SA>
```

Same as the method above, but also sends the minted tokens to the given address.

[comment]: # (mx-context-auto)

### burn
```rust
fn burn(amount: &BigUint)
```

Burns `amount` tokens, using the `ESDTLocalBurn` built-in function.

[comment]: # (mx-context-auto)

### get_balance
```rust
fn get_balance() -> BigUint
```

Gets the current balance the SC has for the token.

[comment]: # (mx-context-auto)

## NonFungibleTokenMapper

Similar to the `FungibleTokenMapper`, but is used for NFT, SFT and META-ESDT tokens.

[comment]: # (mx-context-auto)

### issue/issue_and_set_all_roles
```rust
fn issue(token_type: EsdtTokenType, issue_cost: BigUint, token_display_name: ManagedBuffer, token_ticker: ManagedBuffer,initial_supply: BigUint, num_decimals: usize, opt_callback: Option<CallbackClosure>) -> !

fn issue_and_set_all_roles(token_type: EsdtTokenType, issue_cost: BigUint, token_display_name: ManagedBuffer, token_ticker: ManagedBuffer,initial_supply: BigUint, num_decimals: usize, opt_callback: Option<CallbackClosure>) -> !
```

Same as the previous issue function, but also takes an `EsdtTokenType` enum as argument, to decide which type of token to issue. Accepted values are `EsdtTokenType::NonFungible`, `EsdtTokenType::SemiFungible` and `EsdtTokenType::Meta`.

[comment]: # (mx-context-auto)

### nft_create/nft_create_named
```rust
fn nft_create<T: TopEncode>(amount: BigUint, attributes: &T) -> EsdtTokenPayment

fn nft_create_named<T: TopEncode>(amount: BigUint, name: &ManagedBuffer, attributes: &T) -> EsdtTokenPayment
```

Creates an NFT (optionally with a display `name`) and returns the token ID, the created token's nonce, and the given amount in a payment struct.

[comment]: # (mx-context-auto)

### nft_create_and_send/nft_create_and_send_named
```rust
fn nft_create_and_send<T: TopEncode>(to: &ManagedAddress, amount: BigUint, attributes: &T,) -> EsdtTokenPayment

fn nft_create_and_send_named<T: TopEncode>(to: &ManagedAddress, amount: BigUint, name: &ManagedBuffer, attributes: &T,) -> EsdtTokenPayment
```

Same as the methods above, but also sends the created token to the provided address.

[comment]: # (mx-context-auto)

### nft_add_quantity
```rust
fn nft_add_quantity(token_nonce: u64, amount: BigUint) -> EsdtTokenPayment
```

Adds quantity for the given token nonce. This can only be used if one of the `nft_create` functions was used before AND the SC holds at least 1 token for the given nonce.

[comment]: # (mx-context-auto)

### nft_add_quantity_and_send
```rust
fn nft_add_quantity_and_send(to: &ManagedAddress, token_nonce: u64, amount: BigUint) -> EsdtTokenPayment
```

Same as the method above, but also sends the tokens to the provided address.

[comment]: # (mx-context-auto)

### nft_burn
```rust
fn nft_burn(token_nonce: u64, amount: &BigUint)
```

Burns `amount` tokens for the given nonce.

[comment]: # (mx-context-auto)

### get_all_token_data
```rust
fn get_all_token_data(token_nonce: u64) -> EsdtTokenData<Self::Api>
```

Gets all the token data for the given nonce. The SC must own the given nonce for this function to work.

`EsdtTokenData` contains the following fields:
```rust
pub struct EsdtTokenData<M: ManagedTypeApi> {
    pub token_type: EsdtTokenType,
    pub amount: BigUint<M>,
    pub frozen: bool,
    pub hash: ManagedBuffer<M>,
    pub name: ManagedBuffer<M>,
    pub attributes: ManagedBuffer<M>,
    pub creator: ManagedAddress<M>,
    pub royalties: BigUint<M>,
    pub uris: ManagedVec<M, ManagedBuffer<M>>,
}
```

[comment]: # (mx-context-auto)

### get_balance
```rust
fn get_balance(token_nonce: u64) -> BigUint
```

Gets the SC's balance for the given token nonce.

[comment]: # (mx-context-auto)

### get_token_attributes
```rust
fn get_token_attributes<T: TopDecode>(token_nonce: u64) -> T
```

Gets the attributes for the given token nonce. The SC must own the given nonce for this function to work.

[comment]: # (mx-context-auto)

## Common functions for FungibleTokenMapper and NonFungibleTokenMapper

Both mappers work similarly, so some functions have the same implementation for both.

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the token ID is not set yet.

[comment]: # (mx-context-auto)

### get_token_id
```rust
fn get_token_id() -> TokenIdentifier<SA>
```

Gets the stored token ID.

[comment]: # (mx-context-auto)

### set_token_id
```rust
fn set_token_id(token_id: &TokenIdentifier)
```

Manually sets the token ID for this mapper. This can only be used once, and can not be overwritten afterwards. This will fail if the token was issue previously, as the token ID was automatically set.

[comment]: # (mx-context-auto)

### require_same_token/require_all_same_token
```rust
fn require_same_token(expected_token_id: &TokenIdentifier)
fn require_all_same_token(payments: &ManagedVec<EsdtTokenPayment>)
```

Will signal an error if the provided token ID argument(s) differs from the stored token. Useful in `#[payable]` methods when you only want to this token as payment.

[comment]: # (mx-context-auto)

### set_local_roles
```rust
fn set_local_roles(roles: &[EsdtLocalRole], opt_callback: Option<CallbackClosure>) -> !
```

Sets the provided local roles for the token. By default, no callback is used for this call, but you may provide a custom callback if you want to.

You don't need to call this function if you use `issue_and_set_all_roles` for issuing.

Same as the issue function, this will terminate execution when called.

[comment]: # (mx-context-auto)

### set_local_roles_for_address
```rust
fn set_local_roles_for_address(address: &ManagedAddress, roles: &[EsdtLocalRole], opt_callback: Option<CallbackClosure>) -> !
```

Similar to the previous function, but sets the roles for a specific address instead of the SC address.

[comment]: # (mx-context-auto)

## UniqueIdMapper

A special mapper that holds the values from 1 to N, with the following property: if `mapper[i] == i`, then nothing is actually stored.

This makes it so the mapper initialization is O(1) instead of O(N). Very useful when you want to have a list of available IDs, as its name suggests.

Both the IDs and the indexes are `usize`.

Note: If you want an in-memory version of this, you can use the `SparseArray` type provided by the framework.

Examples:
```rust
fn my_id_mapper(&self) -> UniqueIdMapper<Self::Api>
```

Available methods:

[comment]: # (mx-context-auto)

### set_initial_len
```rust
fn set_initial_len(&mut self, len: usize)
```

Sets the initial mapper length, i.e. the `N`. The length may only be set once.

[comment]: # (mx-context-auto)

### is_empty
```rust
fn is_empty() -> bool
```

Returns `true` if the mapper has no elements stored.

[comment]: # (mx-context-auto)

### len
```rust
fn len() -> usize
```

Returns the number of items stored in the mapper.

[comment]: # (mx-context-auto)

### get
```rust
fn get(index: usize) -> usize
```

Gets the value for the given index. If the entry is empty, then `index` is returned, as per the mapper's property.

[comment]: # (mx-context-auto)

### set
```rust
fn set(&mut self, index: usize, id: usize)
```

Sets the value at the given index. The mapper's internal property of `mapper[i] == i` if empty entry is maintained.

[comment]: # (mx-context-auto)

### swap_remove
```rust
fn swap_remove(index: usize) -> usize
```

Removes the ID at the given `index` and returns it. Also, the value at `index` is now set the value of the last entry in the map. Length is decreased by 1.

[comment]: # (mx-context-auto)

### iter
```rust
fn iter() -> Iter<usize>
```

Provides an iterator over all the IDs.

[comment]: # (mx-context-auto)

## Comparisons between the different mappers

[comment]: # (mx-context-auto)

### SingleValueMapper vs old storage_set/storage_get pairs

There is no difference between `SingleValueMapper` and the old-school setters/getters. In fact, `SingleValueMapper` is basically a combination between `storage_set`, `storage_get`, `storage_is_empty` and `storage_clear`. Use of `SingleValueMapper` is encouraged, as it's a lot more compact, and has no performance penalty (if, for example, you never use `is_empty()`, that code will be removed by the compiler).

[comment]: # (mx-context-auto)

### SingleValueMapper vs VecMapper

Storing a `ManagedVec<T>` can be done in two ways:

```rust
#[storage_mapper("my_vec_single")]
fn my_vec_single(&self) -> SingleValueMapper<ManagedVec<T>>

#[storage_mapper("my_vec_mapper")]
fn my_vec_mapper(&self) -> VecMapper<T>;
```

Both of those approaches have their merits. The `SingleValueMapper` concatenates all elements and stores them under a single key, while the `VecMapper` stores each element under a different key. This also means that `SingleValueMapper` uses nested-encoding for each element, while `VecMapper` uses top-encoding.

Use `SingleValueMapper` when:
- you need to read the whole array on every use
- the array is expected to be of small length

Use `VecMapper` when:
- you only require reading a part of the array
- `T`'s top-encoding is vastly more efficient than `T`'s nested-encoding (for example: `u64`)

[comment]: # (mx-context-auto)

### VecMapper vs SetMapper

The primary use for `SetMapper` is storing a whitelist of addresses, token ids, etc. A token ID whitelist can be stored in these two ways:

```rust
#[storage_mapper("my_vec_whitelist")]
fn my_vec_whitelist(&self) -> VecMapper<TokenIdentifier>

#[storage_mapper("my_set_mapper")]
fn my_set_mapper(&self) -> SetMapper<TokenIdentifier>;
```

This might look very similar, but the implications of using `VecMapper` for this are very damaging to the potential gas costs. Checking for an item's existence in `VecMapper` is done in O(n), with each iteration requiring a new storage read! Worst case scenario is the Token ID is not in the whitelist and the whole Vec is read.

`SetMapper` is vastly more efficient than this, as it provides checking for a value in O(1). However, this does not come without a cost. This is how the storage looks for a `SetMapper` with two elements (this snippet is taken from a scenario test):

```rust
"str:tokenWhitelist.info": "u32:2|u32:1|u32:2|u32:2",
"str:tokenWhitelist.node_idEGLD-123456": "2",
"str:tokenWhitelist.node_idETH-123456": "1",
"str:tokenWhitelist.node_links|u32:1": "u32:0|u32:2",
"str:tokenWhitelist.node_links|u32:2": "u32:1|u32:0",
"str:tokenWhitelist.value|u32:2": "str:EGLD-123456",
"str:tokenWhitelist.value|u32:1": "str:ETH-123456"
```

A `SetMapper` uses 3 * N + 1 storage entries, where N is the number of elements. Checking for an element is very easy, as the only thing the mapper has to do is check the `node_id` entry for the provided token ID.

Even so, for this particular case, `SetMapper` is way better than `VecMapper`.

[comment]: # (mx-context-auto)

### VecMapper vs LinkedListMapper

`LinkedListMapper` can be seen as a specialization for the `VecMapper`. It allows insertion/removal only at either end of the list, known as pushing/popping. It's also storage-efficient, as it only requires 2 * N + 1 storage entries. The storage for such a mapper looks like this:

```rust
"str:list_mapper.node_links|u32:1": "u32:0|u32:2",
"str:list_mapper.node_links|u32:2": "u32:1|u32:0",
"str:list_mapper.value|u32:1": "123",
"str:list_mapper.value|u32:2": "111",
"str:list_mapper.info": "u32:2|u32:1|u32:2|u32:2"
```

This is one of the lesser used mappers, as its purpose is very specific, but it's very useful if you ever need to store a queue.

[comment]: # (mx-context-auto)

### SingleValueMapper vs MapMapper

Believe it or not, most of the time, `MapMapper` is not even needed, and can simply be replaced by a `SingleValueMapper`. For example, let's say you want to store an ID for every Address. It might be tempting to use `MapMapper`, which would look like this:

```rust
#[storage_mapper("address_id_mapper")]
fn address_id_mapper(&self) -> MapMapper<ManagedAddress, u64>;
```

This can be replaced with the following `SingleValueMapper`:
```rust
#[storage_mapper("address_id_mapper")]
fn address_id_mapper(&self, address: &ManagedAddress) -> SingleValueMapper<u64>;
```

Both of them provide (almost) the same functionality. The difference is that the `SingleValueMapper` does not provide a way to iterate over all the keys, i.e. Addresses in this case, but it's also 4-5 times more efficient.

Unless you need to iterate over all the entries, `MapMapper` should be avoided, as this is the most expensive mapper. It uses 4 * N + 1 storage entries. The storage for a `MapMapper` looks like this:

```rust
"str:map_mapper.node_links|u32:1": "u32:0|u32:2",
"str:map_mapper.node_links|u32:2": "u32:1|u32:0",
"str:map_mapper.value|u32:1": "123",
"str:map_mapper.value|u32:2": "111",
"str:map_mapper.node_id|u32:123": "1",
"str:map_mapper.node_id|u32:111": "2",
"str:map_mapper.mapped|u32:123": "456",
"str:map_mapper.mapped|u32:111": "222",
"str:map_mapper.info": "u32:2|u32:1|u32:2|u32:2"
```

Keep in mind that all the mappers can have as many additional arguments for the main key. For example, you can have a `VecMapper` for every user pair, like this:
```rust
#[storage_mapper("list_per_user_pair")]
fn list_per_user_pair(&self, first_addr: &ManagedAddress, second_addr: &ManagedAddress) -> VecMapper<T>;
```

Using the correct mapper for your situation can greatly decrease gas costs and complexity, so always remember to carefully evaluate your use-case.

[comment]: # (mx-context-auto)

## Accessing a value at an address

Because of the way the storage mappers are structured, it is very easy to access a "remote" value, meaning a value stored under a key at a different address than the current one.

```rust
#[storage_mapper("key_example")]
fn content(&self) -> MapMapper<u32, u32>;

#[storage_mapper_from_address("key_example")]
fn content_from_address(&self, address: ManagedAddress, ...) -> SetMapper<u32, ManagedAddress>;
```

The `content_from_address` function is used to create a **new map** for accessing the storage of another contract, identified by its address.

The function can have any name, but it is necessary to be tagged with `#[storage_mapper_from_address("key_example")]`, where **"key_example"** is the **exact key** used by the storage they wish to access.

[comment]: # (mx-context-auto)

### Parameters

- `&self`: reference to the current instance of the contract.
- `address: ManagedAddress`: required parameter; it specifies the address of the contract whose storage mapper you want to access.
- **optional** extra keys of any type.

[comment]: # (mx-context-auto)

### Return type

The function will return the desired mapper that will store the data. In addition, `ManagedAddress` will always be added to the end of the list of generics in the storage mapper.

:::important important
This feature only works `intra-shard`. 

Also note that a remote value found under a key at an address can only be `read`, not modified. 
:::

[comment]: # (mx-context-auto)

### Example

If a developer wanted, for example, to iterate over another contract's `SetMapper`, instead of retrieving the values through a call to an endpoint and then iterating, one could simply create a new `SetMapper` with a specific `address` parameter. Afterwards, the `iter` function can be called easily to accomplish the task.

```rust title=contract_to_be_called/lib.rs
#[storage_mapper("my_remote_mapper")]
fn my_set_mapper(&self) -> SetMapper<u32>
```

This is a simple `SetMapper` registered under the address of `contract_to_be_called`, and the value stored will be registered under the key provided, `my_remote_mapper`. If we wanted to iterate over the values of `my_set_mapper` intra-shard, we could write:

```rust title=caller_contract/lib.rs
// the address of the contract containing the storage (contract_to_be_called)
#[storage_mapper("contract_address")]
fn contract_address(&self) -> SingleValueMapper<ManagedAddress>;

// by creating the mapper with the address of the sc and exact storage key
// we get access to the value stored under that key
#[storage_mapper_from_address("contract_address")]
fn contract_from_address(&self, address: ManagedAddress) -> SetMapper<u32, ManagedAddress>;

#[endpoint]
fn my_endpoint(&self) -> u32 {
    let mut sum = 0u32;
    let address = self.contract_address().get();

    for number in self.contract_from_address(address).iter() {
        sum += number
    }

    sum
}
```

Calling `my_endpoint` will return the sum of the values stored in `contract_to_be_called`'s SetMapper.

By specifying the expected type, storage key and address, the value can be read and used inside our logic.
