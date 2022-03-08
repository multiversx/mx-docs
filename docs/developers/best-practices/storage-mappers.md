---
id: storage-mappers
title: Storage Mappers
---

### Storage Mappers in Rust framework

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
"str:list_mapper.node_links|u32:1": "u32:0|u32:2",
"str:list_mapper.node_links|u32:2": "u32:1|u32:0",
"str:list_mapper.value|u32:1": "123",
"str:list_mapper.value|u32:2": "111",
"str:list_mapper.info": "u32:2|u32:1|u32:2|u32:2"
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
```
#[storage_mapper("list_per_user_pair")]
fn list_per_user_pair(&self, first_addr: &ManagedAddress, second_addr: &ManagedAddress) -> VecMapper<T>;
```

Using the correct mapper for your situation can greatly decrease gas costs and complexity, so always remember to carefully evaluate your use-case.
