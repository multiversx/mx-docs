---
id: multi-values
title: Multi-values
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## Variadic inputs and outputs (multi-values)

The Rust language does not natively support variadic arguments. Smart contracts, on the other hand, have no limitations on accepting a variable number of inputs or producing a variable number of results. To accommodate this, and to make I/O processing succint, the Rust framework provides a number of so-called multi-value types, that deserialize from multiple inputs and serialize to multiple outputs.

Please note that the same types are used both as arguments and as results. This makes sense especially for places like the callbacks, where the results of the asynchronous call become the inputs of the callback.

There are 4 types of variadic arguments supported for functions:
- `OptionalValue<T>` - arguments that can be skipped. Can have multiple per endpoint, but they all must be the last arguments of the endpoint.
- `MultiValueN<T1, T2, ... TN>` - A multi-value tuple. Can be used to return multiple results (since Rust methods can only have a single result value). They also work well in conjunction with other multi-values, for instance `MultiValueEncoded<MultiValue2<usize, BigUint>>` will accept any number of pairs of value, but will crash if an odd number of arguments is provided.
- `MultiValueEncoded<T>` - can receive any number of arguments. Note that only one `MultiValueEncoded` can be used per endpoint and must be the last argument in the endpoint. Cannot use both `OptionalValue` and `MultiValueEncoded` in the same endpoint. It keeps its contents encoded, so it decodes lazily when used as an argument and encodes eagerly when used as a result.
- `MultiValueManagedVec<T>` - Similar to `MultiValueEncoded<T>`, but it decodes eagerly when used as an argument and encodes lazily when used as a result. It is practically a `ManagedVec` with multi-value encoding, and so `T` in this case must be a type that implements `ManagedVecItem`. It cannot contain multi-values such as `MultiValueN`.

Below you can find some examples:
```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, obligatory_arg: T1, opt_arg: OptionalValue<T2>) {}

#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, obligatory_arg: T1, args: MultiValueEncoded<T2>) {}
```

This might seem over-complicated for no good reason. Why not simply use `Option<T>` instead of `OptionalValue<T>` and `ManagedVec<T>` instead of `MultiValueEncoded<T>`? The reason is the type of encoding used for each of them.

[comment]: # (mx-context-auto)

### Option\<T\> vs OptionalValue\<T\>

Let's use the following endpoints as examples:
```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, token_id: TokenIdentifier, opt_nonce: Option<u64>) {}
```

```
#[endpoint(myOptArgEndpoint)]
fn my_opt_arg_endpoint(&self, token_id: TokenIdentifier, opt_nonce: OptionalValue<u64>) {}
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

[comment]: # (mx-context-auto)

### ManagedVec\<T\> vs MultiValueEncoded\<T\>

For the sake of the example, let's assume you want to receive pairs of (token ID, nonce, amount). This can be implemented in two ways:
```
#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, args: ManagedVec<(TokenIdentifier, u64, BigUint)>) {}
```

```
#[endpoint(myVarArgsEndpoint)]
fn my_var_args_endpoint(&self, args: MultiValueManagedVec<TokenIdentifier, u64, BigUint>) {}
```

The first approach looks a lot simpler, just a `ManagedVec` of tuples. But, the implications are quite devastating, both for performance and usability. To use the first endpoint, with the pairs (TOKEN-123456, 5, 100) and (TOKEN-123456, 10, 500), the call data would have to look like this:
`myVarArgsEndpoint@0000000c_544f4b454e2d313233343536_0000000000000005_00000001_64_0000000c_544f4b454e2d313233343536_000000000000000a_00000002_01f4`

Note: Above, we've separated the parts with `_` for readability purposes only. On the real blockchain, there would be no underscores, everything would be concatenated.

As you can see, that endpoint is very hard to work with. All arguments have to be passed into this big chunk, with nested encoding, which also adds additional lengths for the `TokenIdentifier` (i.e. the 0000000c in front, which is length 12) and for `BigUint` (i.e. the length in bytes).

For the `MultiValueEncoded` approach, this endpoint is a lot easier to use. For the same arguments, the call data looks like this:
`myVarArgsEndpoint@544f4b454e2d313233343536@05@64@544f4b454e2d313233343536@0a@01f4`

The call data is a lot shorter, and it's much more readable, and as we use top-encoding instead of nested-encoding, there's no need for lengths either.
