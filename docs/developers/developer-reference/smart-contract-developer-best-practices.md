---
id: smart-contract-developer-best-practices
title: Smart Contract Developer Best Practices
---

## Code Arrangement

We'll start with something simple: code arrangement. It's best to separate your code into 4 main parts:
- endpoints
- view functions
- private functions
- storage

This ensures that it's much easier to find what you're looking for, and it's also much easier for everyone else who's working on that smart contract. Additionally, it's also best to split endpoints by their level of access. Some endpoints might be owner-only, some might be usable only by a select few addresses from a whitelist, and some can be called by anyone.  

The recommended order is the one from the list above, but order is not important as long as you clearly separate your code. Even better if you split those into modules.  

## BigUint Operations

`BigUint` is simply a handle to the actual representation, similar to how system file handles work, so it's simply a struct with an `i32` as member, representing the handle. All the operations have to be done through API functions, passing the handles for result, first operand, second operand. Using Rust's operator overloading feature, we're able to overwrite arithmetic operators and provide an easy way of adding `BigUint`s, just like primitive number types.  

Even so, you might easily reach situations where you want to use the same number multiple times. For instance, let's say you have 4 `BigUint`s: `a`, `b`, `c`, `d`, and you want to do the following operations:
```
c = a + b;
d = c + a;
```

You will quickly come to realize this does not work, due to Rust's ownership system. `a` is consumed after the first operation, and you will likely reach an error like this:
```
move occurs because `a` has type `<Self as ContractBase>::BigUint`, which does not implement the `Copy` trait
```

The easiest way to solve this is to simply clone `a`.
```
c = a.clone() + b;
d = c + a;
```

The errors are now gone, but behind the scenes, this is more complex than simply copying the handle. `a.clone()` creates a whole new `BigUint`, copying the bytes from the original `a`.  

This can be solved by borrowing `a`. `+` and the other operations are defined for references of `BigUint`, so this can be rewritten as:
```
c = &a + &b;
d = c + a;
```

Another example of avoiding the creation of additional `BigUint`s is performing operations with multiple arguments:
```
e = a + b + c + d;
```
Or, if you want to keep the instances (can't add owned `BigUint` to `&BigUint`, so you have to borrow the results as well):
```
e = &((&(&a + &b) + &c) + &d;
```

In both cases, this would do the following API calls:
```
temp1 = bigIntNew();
bigIntAdd(temp1, a, b);

temp2 = bigIntNew();
bigIntAdd(temp2, temp1, c);

temp3 = bigIntNew();
bigIntAdd(temp3, temp2, d);
```

And as such, creating 3 new `BigUints`, one for the result of `a + b`, one for the result of `(a + b) + c` and one for the final result that ends up in `e`. This can be optimized by rewriting the code in the following way:

```
e = BigUint::zero();
e += &a;
e += &b;
e += &c;
e += &d;
```

This creates a single `BigUint` instead of 3.  

Of course, these are trivial examples, but we hope this clears up some confusion about how `BigUint`s work and how you can get the most of them.  

## Storage Mappers

The Rust framework provides various storage mappers you can use:
- `SingleValueMapper` - Stores a single value. Also provides methods for checking for empty or clearing the entry.  
- `VecMapper` - Stores an array, with every single value under a different storage key.  
- `SetMapper` - Stores a set of values, with no duplicates being allowed. It also provides methods for checking if a value already exists in the set.  
- `UnorderedSetMapper` - Same as SetMapper, but does not guarantee the order of the items. More efficient than `SetMapper`, and should be used instead unless you need to iterate over all the elements.  
- `LinkedListMapper` - Stores a linked list, which allows fast insertion/removal of elements, as well as possibility to iterate over the whole list.  
- `MapMapper` - Stores (key, value) pairs, while also allowing iteration over keys.  

Although they're all very easy to use, the cost of using them vastly differs. `SingleValueMapper` is obviously the cheapest one, as you use a single key. The other mappers use additional storage to ease of iteration, insertion and deletion.  

### SingleValueMapper vs old storage_set/storage_get pairs

There is no difference between `SingleValueMapper` and the old-school setters/getters. In fact, `SingleValueMapper` is basically a combination between `storage_set`, `storage_get`, `storage_is_empty` and `storage_clear`. Use of `SingleValueMapper` is encouraged, as it's a lot more compact, and has no performance penalty (if, for example, you never use `is_empty()`, that code will be removed by the compiler).  

### SingleValueMapper vs VecMapper

Storing a `ManagedVec<T>` can be done in two ways:  

```
#[storage_mapper("my_vec_single)]
fn my_vec_single(&self) -> SingleValueMapper<ManagedVec<T>>

#[storage_mapper("my_vec_mapper)]
fn my_vec_mapper(&self) -> VecMapper<T>;
```

Both of those approaches have their merits. The `SingleValueMapper` concatenates all elements and stores them under a single key, while the `VecMapper` stores each element under a different key. This also means that `SingleValueMapper` uses nested-encoding for each element, while `VecMapper` uses top-encoding.  

Use `SingleValueMapper` when:
- you need to read the whole array on every use  
- the array is expected to be of small length  

Use `VecMapper` when:
- you only require reading a part of the array  
- `T`'s top-encoding is vastly more efficient than `T`'s nested-encoding (for example: `u64`)  

### VecMapper vs SetMapper

The primary use for `SetMapper` is storing a whitelist of addresses, token ids, etc. A token ID whitelist can be stored in these two ways:  

```
#[storage_mapper("my_vec_whitelist)]
fn my_vec_whitelist(&self) -> VecMapper<TokenIdentifier>

#[storage_mapper("my_set_mapper)]
fn my_set_mapper(&self) -> SetMapper<TokenIdentifier>;
```

This might look very similar, but the implications of using `VecMapper` for this are very damaging to the potential gas costs. Checking for an item's existence in `VecMapper` is done in O(n), with each iteration requiring a new storage read! Worst case scenario is the Token ID is not in the whitelist and the whole Vec is read.  

`SetMapper` is vastly more efficient than this, as it provides checking for a value in O(1). However, this does not come without a cost. This is how the storage looks for a `SetMapper` with two elements (this snippet is taken from a mandos test): 

```
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

### VecMapper vs LinkedListMapper

`LinkedListMapper` can be seen as a specialization for the `VecMapper`. It allows insertion/removal only at either end of the list, known as pushing/popping. It's also storage-efficient, as it only requires 2 * N + 1 storage entries. The storage for such a mapper looks like this:  

```
"``list_mapper.node_links|u32:1": "u32:0|u32:2",
"``list_mapper.node_links|u32:2": "u32:1|u32:0",
"``list_mapper.value|u32:1": "123",
"``list_mapper.value|u32:2": "111",
"``list_mapper.info": "u32:2|u32:1|u32:2|u32:2"
```

This is one of the lesser used mappers, as its purpose is very specific, but it's very useful if you ever need to store a queue.  

### SingleValueMapper vs MapMapper

Believe it or not, most of the time, `MapMapper` is not even needed, and can simply be replaced by a `SingleValueMapper`. For example, let's say you want to store an ID for every Address. It might be tempting to use `MapMapper`, which would look like this:

```
#[storage_mapper("address_id_mapper")]
fn address_id_mapper(&self) -> MapMapper<ManagedAddress, u64>;
```

This can be replaced with the following `SingleValueMapper`:
```
#[storage_mapper("address_id_mapper")]
fn address_id_mapper(&self, address: &ManagedAddress) -> SingleValueMapper<u64>;
```

Both of them provide (almost) the same functionality. The difference is that the `SingleValueMapper` does not provide a way to iterate over all the keys, i.e. Addresses in this case, but it's also 4-5 times more efficient. 

Unless you need to iterate over all the entries, `MapMapper` should be avoided, as this is the most expensive mapper. It uses 4 * N + 1 storage entries. The storage for a `MapMapper` looks like this:  

```
"``map_mapper.node_links|u32:1": "u32:0|u32:2",
"``map_mapper.node_links|u32:2": "u32:1|u32:0",
"``map_mapper.value|u32:1": "123",
"``map_mapper.value|u32:2": "111",
"``map_mapper.node_id|u32:123": "1",
"``map_mapper.node_id|u32:111": "2",
"``map_mapper.mapped|u32:123": "456",
"``map_mapper.mapped|u32:111": "222",
"``map_mapper.info": "u32:2|u32:1|u32:2|u32:2"
```

Keep in mind that all the mappers can have as many additional arguments for the main key. For example, you can have a `VecMapper` for every user pair, like this:
```
#[storage_mapper("list_per_user_pair")]
fn list_per_user_pair(&self, first_addr: &ManagedAddress, second_addr: &ManagedAddress) -> VecMapper<T>;
```

Using the correct mapper for your situation can greatly decrease gas costs and complexity, so always remember to carefully evaluate your use-case.  

## VarArgs and MultiResults

The Rust language does not natively support var args. The best you could probably do in native rust is use `Option<T>`. Even so, through some pre-processing of arguments, the Rust framework does provide support for said var args, and even multi results.  

There are X types of var args supported:
- `OptionalArg<T>` - arguments that can be skipped. Can have multiple per endpoint, but they all must be the last arguments of the endpoint.  
- `ManagedVarArgs<T>` - can receive any number of arguments. Note that only one `ManagedVarArgs` can be used per endpoint and must be the last argument in the endpoint. Cannot use both `OptionalArg` and `ManagedVarArgs` in the same endpoint.  
- `ManagedVarArgs<MultiArgN<T1, T2, ... TN>>` - Can be used when you want to receive a variable number of pairs or arguments. For example, let's say you want to receive a variable number of (token ID, nonce) pairs. You would then use `ManagedVarArgs<MultiArg2<TokenIdentifier, u64>>`.  

Note: Keep in mind you have to specify the `#[var_args]` annotation in front of those arguments. For example:
```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, obligatory_arg: T1, #[var_args] opt_arg: OptionalArg<T2>) {}

#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, obligatory_arg: T1, #[var_args] args: ManagedVarArgs<T2>) {}
```

This might seem over-complicated for no good reason. Why not simply use `Option<T>` instead of `OptionalArg<T>` and `ManagedVec<T>` instead of `ManagedVarArgs<T>`? The reason is the type of encoding used for each of them.

### Option\<T\> vs OptionalArg\<T\>

Let's use the following endpoints as examples:
```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, token_id: TokenIdentifier, opt_nonce: Option<u64>) {}
```

```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, token_id: TokenIdentifier, #[var_args] opt_nonce: OptionalArg<u64>) {}
```

With the following arguments: TOKEN-123456 (0x544f4b454e2d313233343536) and 5.

The most important factor is the user experience, but there's also a matter of efficiency. For the first one, the call data would look like this (notice the `01` in front for `Some(T)`)
`myOptArgEndpoint@544f4b454e2d313233343536@010000000000000005`

While for the second one, this is a lot cleaner:
`myOptArgEndpoint@544f4b454e2d313233343536@05`

For the same token ID and skipped nonce, the encodings look like this:
`myOptArgEndpoint@544f4b454e2d313233343536@00`

`myOptArgEndpoint@544f4b454e2d313233343536`

As you can see, the argument can be skipped altogether instead of passing a `00` (`None`).  

### ManagedVec\<T\> vs ManagedVarArgs\<T\>

For the sake of the example, let's assume you want to receive pairs of (token ID, nonce, amount). This can be implemented in two ways:
```
#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, args: ManagedVec<(TokenIdentifier, u64, BigUint)>) {}
```

```
#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, #[var_args] args: ManagedVarArgs<MultiArg3<TokenIdentifier, u64, BigUint>>) {}
```

The first approach looks a lot simpler, just a `ManagedVec` of tuples. But, the implications are quite devastating, both for performance and usability. To use the first endpoint, with the pairs (TOKEN-123456, 5, 100) and (TOKEN-123456, 10, 500), the call data would have to look like this:
`myVarArgsEndpoint@0000000c_544f4b454e2d313233343536_0000000000000005_00000001_64_0000000c_544f4b454e2d313233343536_000000000000000a_00000002_01f4`

Note: Above, we've separated the parts with `_` for readability purposes only. On the real blockchain, there would be no underscores, everything would be concatenated.

As you can see, that endpoint is very hard to work with. All arguments have to be passed into this big chunk, with nested encoding, which also adds additional lengths for the `TokenIdentifier` (i.e. the 0000000c in front, which is length 12) and for `BigUint` (i.e. the length in bytes).  

For the `ManagedVarArgs` approach, this endpoint is a lot easier to use. For the same arguments, the call data looks like this:
`myVarArgsEndpoint@544f4b454e2d313233343536@05@64@544f4b454e2d313233343536@0a@01f4`

The call data is a lot shorter, and it's much more readable, and as we use top-encoding instead of nested-encoding, there's no need for lengths either.  

## The dynamic allocation problem

The main difference between the base Rust types (like `Vec<T>`) and their managed counterparts, provided by the Rust framework (like `ManagedVec<T>`) lies in their memory allocation. Base Rust types use dynamic allocation on the heap, which in simple terms, it means the program (in this case, the smart contract) keeps asking for more and more memory from the operating system. For small collections, this doesn't matter much, but for bigger collection, this can make it so the contract call fails.  

The main issue is that the Rust runtime is quite eager with its dynamic memory allocation, and asks for more memory than it actually needs. For ordinary programs, this is great for performance, but for smart contracts, where every instruction costs gas, can be quite impactful, on both cost and even runtime failures.  

The alternative is to use **managed types**. All managed types, like `BigUint`, `TokenIdentifier`, `ManagedBuffer` etc. store all their memory inside the Elrond Virtual Machine, which is the program that executes smart contracts and provides the API functions. The managed types only store a `handle` within the smart contract memory, which is a `u32` index, while the actual payload resides in VM's memory. So whenever you have to add two `BigUint`s for example, you only pass the three handles: the result, the first operand, and the second operand. This way, there is very little data being passed around, which in turn makes everything cheaper. And since these types only store a handle, their memory allocation is fixed size, so it can be allocated on the stack instead of having to be allocated on the heap.  

### Base Rust types vs managed types

Below is a table of unmanaged types and their managed counterparts:  

| Unmanaged | Managed |
| :---: | :---: |
| &[u8] | TokenIdentifier |
| - | BigUint |
| BoxedBytes | ManagedBuffer |
| String | ManagedBuffer |
| VarArgs | ManagedVarArgs |
| Vec | ManagedVec |
| MultiResultVec | ManagedMultiResultVec |

### Static buffers

Sometimes you might want to allocate some memory inside the SC, because it might be easier to use. In that case, we recommend using static buffers. The declaration looks like this:

```rust
static mut STATIC_BUFFER: [u8; BUFFER_SIZE] = [0u8; BUFFER_SIZE];
```

Where `BUFFER_SIZE` can be constant. This will statically allocate `BUFFER_SIZE` bytes in the data segment. Keep in mind in Rust, accessing mutable global variables is unsafe, so if you want to use this buffer in any way, you will have to wrap the code in an `unsafe` block. For example, if you wanted to load a `ManagedBuffer` into a static buffer, you would have to do something like this:  

```rust
let mut buffer = ManagedBuffer::new();
// ...
// do something with the buffer
// ...
unsafe {
    let buffer_len = buffer.len();
    require!(
        buffer_len <= BUFFER_SIZE,
        "Cannot fit managed buffer in static buffer"
    );

    let static_buffer_slice = &mut STATIC_BUFFER[..buffer_len];
    require!(
        buffer.load_slice(0, static_buffer_slice).is_ok(),
        "Failed to load into static buffer"
    );
    // use static_buffer_slice in some way
}
```

We recommend not doing this unless you REALLY have to. This code is marked as unsafe for a good reason.  
