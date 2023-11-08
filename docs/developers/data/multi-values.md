---
id: multi-values
title: Multi-Values
---
[comment]: # (mx-abstract)

## Single values vs. multi-values

To recap, we have discussed about data being represented either in a:
- nested encoding, as part of the byte representation of a larger object;
- top encoding, the full byte represention of an object.

But even the top encoding only refers to a _single_ object, being represented as a _single_ array of bytes. This encoding, no matter how simple or complex, is the representation for a _single_ argument, result, log topic, log event, NFT attribute, etc.

However, we sometimes want to work with _multiple_, variadic arguments, or an arbitrary number of results. An elegant solution is modelling them as special collections of top-encodable objects that each represent an individual item. For instance, we could have a list of separate arguments, of arbitrary length.

Multi-values work similarly to varargs in other languages, such as C, where you can write `void f(int arg, ...) { ... }`. In the smart contract framework they do not need specialized syntax, we use the type system to define their behavior.

:::info Note
In the framework, single values are treated as a special case of multi-value, one that consumes exactly one argument, or returns exactly one value.

In effect, all serializable types implement the multi-value traits.
:::

[comment]: # (mx-context-auto)

## Parsing and limitations

It is important to understand that arguments get read one by one from left to right, so there are some limitations as to how var-args can be positioned. Argument types also define how the arguments are consumed, so, for instance, if a type specifies that all remaining arguments will be consumed, it doesn't really make sense to have any other argument after that. 

For instance, let's consider the behavior of `MultiValueEncoded`, which consumes all subsequent arguments. Hence, it's advisable to place it as the last argument in the function, like so:

```rust
#[endpoint(myEndpoint)]
fn my_endpoint(&self, first_arg: ManagedBuffer, second_arg: TokenIdentifier, last_arg: MultiValueEncoded<u64>)
```
Placing any argument after `MultiValueEncoded` will not initialize that argument, because `MultiValueEncoded` will consume all arguments following it. An important rule to remember is that an endpoint can have only one `MultiValueEncoded` argument, and it should always occupy the last position in order to achieve the desired outcome.

Another scenario to consider involves the use of multiple `Option` arguments. Take, for instance, the following endpoint:

```rust
#[endpoint(myOptionalEndpoint)]
fn my_optional_endpoint(&self, first_arg: Option<TokenIdentifier>, second_arg: Option<ManagedBuffer>)
```
In this context, both arguments (or none) should be provided at the same time in order to get the desired effect. Since arguments are processed sequentially from left to right, supplying a single value will automatically assign it to the first argument, making it impossible to determine which argument should receive that value.

The same rule applies when any regular argument is placed after a var-arg, so we have enforced a strong restriction regarding arguments' order. Regular arguments `must not` be placed after var-args.

To further enhance clarity and minimize potential errors related to var-args, starting from framework version `v0.44.0`, we have introduced a new annotation called `#[allow_multiple_var_args]`. 

:::info Note
`#[allow_multiple_var_args]` is required when using more than one var-arg in an endpoint and is placed at the endpoint level, alongside the `#[endpoint]` annotation. Utilizing `#[allow_multiple_var_args]` in any other manner will not work.

Considering this, our optional endpoint from the example before becomes:
```rust
#[allow_multiple_var_args]
#[endpoint(myOptionalEndpoint)]
fn my_optional_endpoint(&self, first_arg: Option<TokenIdentifier>, second_arg: Option<ManagedBuffer>)
``` 
:::

The only parsing validations are taking into account the number of var-args and their position. Not having `#[allow_multiple_var_args]` as an endpoint attribute if the endpoint is using more than one var-arg and/or placing regular arguments after var-args will fail the build. 

However, when `#[allow_multiple_var_args]` is used, there is no other parsing validation (except the ones from above) to enforce the var-args rules mentioned before. In simpler terms, using the annotation implies that the developer is assuming responsibility for handling multiple var-args and anticipating the outcomes, effectively placing trust in their ability to manage the situation.


[comment]: # (mx-context-auto)

## Standard multi-values

These are the common multi-values provided by the framework:
- Straightforward var-args, an arbitrary number of arguments of the same type.
    - Can be defined in code as:
        - `MultiValueVec<T>` - the unmanaged version. To be used outside of contracts. 
        - `MultiValueManagedVec<T>` - the equivalent managed version. The only limitation is that `T` must implement `ManagedVecItem`, because we are working with an underlying `ManagedVec`. Values are deserialized eagerly, the endpoint receives them already prepared.
        - `MultiValueEncoded<T>` - the lazy version of the above. Arguments are only deserialized when iterating over this structure. This means that `T` does not need to implement `ManagedVecItem`, since it never gets stored in a `ManagedVec`.
        - In all these 3 cases, `T` can be any serializable type, either single or multi-value.
    - Such a var-arg will always consume all the remaining arguments, so it doesn't make sense to place any other arguments after it, single or multi-value. The framework doesn't forbid it, but single values will crash at runtime, since they always need a value, and multi-values will always be empty.
- Multi-value tuples.
    - Defined as `MultiValueN<T1, T2, ..., TN>`, where N is a number between 2 and 16, and `T1`, `T2`, ..., `TN` can be any serializable types, either single or multi-value; e.g. `MultiValue3<BigUint, ManagedBuffer, u32>`.
    - It doesn't make much sense to use them as arguments on their own (it is easier and equivalent to just have separate named arguments), but they do have the following uses:
        - They can be embedded in a regular var-arg to obtain groups of arguments. For example `MultiValueVec<MultiValue3<BigUint, BigUint>>` defines pairs of numbers. There is no more need to check in code that an even number of arguments was passed, the deserializer resolves this on its own.
        - Rust does not allow returing more than one result, but by returning a multi-value tuple we can have an endpoint return several values, of different types.
- Optional arguments.
    - Defined as `OptionalValue<T>`, where `T` can be any serializable type, either single or multi-value.
    - At most one argument will be consumed. For this reason it sometimes makes sense to have several optional arguments one after the other, or optional arguments followed by var-args.
    - Do note, however, that an optional argument cannot be missing if there is anything else coming after it. For example if an endpoint has arguments `a: OptionalValue<u32>, b: OptionalValue<u32>`, `b` can be missing, or both can be missing, but there is no way to have `a` missing and `b` to be there, because passing any argument will automatically get it assigned to `a`.
- Counted var-args.
    - Suppose we actually do want two sets of var-args in an endpoint. One solution would be to explicitly state how many arguments each of them contain (or at least the first one). Counted var-args make this simple.
    - Defined as `MultiValueManagedVecCounted<T>`, where `T` can be any serializable type, either single or multi-value.
    - Always takes a number argument first, which represents how many arguments follow. Then it consumes exactly that many arguments.
    - Can be followed by other arguments, single or multi-value.
- Async call result.
    - Asynchronous call callbacks also need to know whether or not the call failed, so they have a special format for trasmitting arguments. The first argument is always the error code. If the error code is `0`, then the call result follows. Otherwise, we get one additional argument, which is the error message. To easily deserialize this, we use a special type.
    - Defined as `ManagedAsyncCallResult<T>`.
    - There is also an unmanaged version, `AsyncCallResult<T>`, but it is no longer used nowadays.
    - They are both enums, the managed part only refers to the error message.
- Ignored arguments.
    - Sometimes, for backwards compatibility or other reasons it can happen to have (optional) arguments that are never used and not of interest. To avoid any useless deserialization, it is possible to define an argument of type `IgnoreValue` at the end.
    - By doing so, any number of arguments are allowed at the end, all of which will be completely ignored.


So, to recap:

| Managed Version                    | Unmanaged version    | What it represents              | Similar single value           |
| ---------------------------------- | -------------------- | ------------------------------- | ------------------------------ |
| `MultiValueN<T1, T2, ..., TN>`     |                      | A fixed number of arguments     | Tuple `(T1, T2, ..., TN)`      |    
| `OptionalValue<T>`                 |                      | An optional argument            | `Option<T>`                    |
| `MultiValueEncoded<T>`             | `MultiValueVec<T>`   | Variable number of arguments    | `Vec<T>`                       |
| `MultiValueManagedVec<T>`          | `MultiValueVec<T>`   | Variable number of arguments    | `Vec<T>`                       |
| `MultiValueManagedVecCounted<T>`   |                      | Counted number of arguments     | `(usize, Vec<T>)`              |
| `ManagedAsyncCallResult<T>`        | `AsyncCallResult<T>` | Async call result in callback   | `Result<T, String>`            |
| `IgnoreValue`                      |                      | Any number of ignored arguments | Unit `()`                      |



[comment]: # (mx-context-auto)

## Storage mapper contents as multi-values

The storage mapper declaration is a method that can normally also be made into a public view endpoint. If so, when calling them, the entire contents of the mapper will be read from storage and serialized as multi-value. Only recommended when there is little data, or in tests.

These storage mappers are, in no particular order:
- BiDiMapper
- LinkedListMapper
- MapMapper
- QueueMapper
- SetMapper
- SingleValueMapper
- UniqueIdMapper
- UnorderedSetMapper
- UserMapper
- VecMapper
- FungibleTokenMapper
- NonFungibleTokenMapper

[comment]: # (mx-context-auto)

## Multi-values in action

[comment]: # (mx-context-auto)

To clarify the way multi-values work in real life, let's provide some examples of how one would go avout calling an endpoint with variadic arguments.

[comment]: # (mx-context-auto)

### Option vs. OptionalValue

Assume we want to have an endpoint that takes a token identifier, and, optionally, a token nonce. There are two ways of doing this:

```rust
#[endpoint(myOptArgEndpoint1)]
fn my_opt_arg_endpoint_1(&self, token_id: TokenIdentifier, opt_nonce: Option<u64>) {}
```

```rust
#[endpoint(myOptArgEndpoint2)]
fn my_opt_arg_endpoint_2(&self, token_id: TokenIdentifier, opt_nonce: OptionalValue<u64>) {}
```

We want to call these endpoints with arguments: `TOKEN-123456` (`0x544f4b454e2d313233343536`) and `5`. To contrast for the two endpoints:
- Endpoint 1: `myOptArgEndpoint1@544f4b454e2d313233343536@010000000000000005`
- Endpoint 2: `myOptArgEndpoint2@544f4b454e2d313233343536@05`


:::info Note
In the first case, we are dealing with an [Option](/developers/data/composite-values#options), whose first encoded byte needs to be `0x01`, to signal `Some`. In the second case there is no need for `Option`, `Some` is signalled simply by the fact that the argument was provided.

Also note that the nonce itself is nested-encoded in the first case (being _nested_ in an `Option`), whereas in the second case it can be top-encoded directly.
:::

Now let's do the same exercise for the case where we want to omit the nonce altogether:
- Endpoint 1: 
    - `myOptArgEndpoint1@544f4b454e2d313233343536@`, or
    - `myOptArgEndpoint1@544f4b454e2d313233343536@00` - also accepted
- Endpoint 2: 
    - `myOptArgEndpoint2@544f4b454e2d313233343536`

:::info Note
The difference is less striking in this case.

In the first case, we encoded `None` as an empty byte array (encoding it as `0x00` is also accepted). In any case, we do need to pass it as an explicit argument.

In the second case, the last argument is omitted altogether.
:::

We also want to point out that the multi-value implementation is more efficient in terms of gas. It is more easier for the smart contract to count the number of arguments and top-decode, than parse a composite type, like `Option`.

[comment]: # (mx-context-auto)

### ManagedVec vs. MultiValueEncoded

In this example, let's assume we want to receive any number of triples of the form (token ID, nonce, amount). This can be implemented in two ways:

```rust
#[endpoint(myVarArgsEndpoint1)]
fn my_var_args_endpoint_1(&self, args: ManagedVec<(TokenIdentifier, u64, BigUint)>) {}
```

```rust
#[endpoint(myVarArgsEndpoint2)]
fn my_var_args_endpoint_2(&self, args: MultiValueManagedVec<TokenIdentifier, u64, BigUint>) {}
```

The first approach seems a little simpler from the perspective of the smart contract implementation, since we only have a `ManagedVec` of tuples. But when we try to encode this argument, to call the endpoint, we are struck with a format that is quite devastating, both for performance and usability.

Let's call these endpoints with triples: `(TOKEN-123456, 5, 100)` and `(TOKEN-123456, 10, 500)`. The call data would have to look like this:
`myVarArgsEndpoint1@0000000c_544f4b454e2d313233343536_0000000000000005_00000001_64_0000000c_544f4b454e2d313233343536_000000000000000a_00000002_01f4`.

:::info Note
Above, we've separated the parts with `_` for readability purposes only. On the real blockchain, there would be no underscores, everything would be concatenated.

Every single value in this call data needs to be nested-encoded. We need to lay out the length or each token identifier, nonces are spelled out in full 8 bytes, and we also need the length of each `BigUint` value.
:::

As you can see, that endpoint is very hard to work with. All arguments are concatenated into one big chunk, and every single value needs to be nested-encoded. This is why we need to lay out the length for each `TokenIdentifier` (e.g. the 0000000c in front, which is length 12) as well as for each `BigUint` (e.g. the `00000001` before `64`). The nonces are spelled out in their full 8 bytes.

The second endpoint is a lot easier to use. For the same arguments, the call data looks like this:
`myVarArgsEndpoint2@544f4b454e2d313233343536@05@64@544f4b454e2d313233343536@0a@01f4`.

It is a lot more readable, for several reasons:
- We have 6 arguments instead of 1;
- The argument separator makes it much easier for both us and the smart contract to distinguish where each value ends and where the next one begins;
- All values are top-encoded, so there is no more need for lengths; the nonces can be expressed in a more compact form.

Once again, the multi-value implementation is more efficient in terms of gas. All the contract needs to do is to make sure that the number of arguments is a multiple of 3, and then top-decode each value. Conversely, in the first example, a lot more memory needs to be moved around when splitting the large argument into pieces.


[comment]: # (mx-context-auto)

## Implementation details

All serializable types will implement traits `TopEncodeMulti` and `TopDecodeMulti`.

The components that do argument parsing, returning results, or handling of event logs all work with these two traits.

All serializable types (the ones that implement `TopEncode`) are explicitly declared to also be multi-value in this declaration:

```rust
/// All single top encode types also work as multi-value encode types.
impl<T> TopEncodeMulti for T
where
    T: TopEncode,
{
    fn multi_encode_or_handle_err<O, H>(&self, output: &mut O, h: H) -> Result<(), H::HandledErr>
    where
        O: TopEncodeMultiOutput,
        H: EncodeErrorHandler,
    {
        output.push_single_value(self, h)
    }
}
```

To create a custom multi-value type, one needs to manually implement these two traits for the type. Unlike for single values, there is no [equivalent derive syntax](/developers/data/custom-types).



