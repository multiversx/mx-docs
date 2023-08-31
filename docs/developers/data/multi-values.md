---
id: multi-values
title: Multi-Values
---
[comment]: # (mx-abstract)

## Single values vs. multi-values

To recap, we have discussed about data being represented either in a:
- nested encoding, as part of the byte representation of a larger object;
- top encoding, the full byte represention of an object.

But even the top encoding only refers to a _single_ object, being represented as a _single_ array of bytes. This encoding, no matter how simple of complex, is the representation for a _single_ argument, result, log topic, log event, NFT attribute, etc.

However, we sometimes want to work with _multiple_, variadic arguments, or an arbitrary number of results. An elegant solution is modelling them as special collections of top-encodable objects that each represent an individual item. For instance, a we could have a list of separate arguments, of arbitrary length.

Multi-values work similarly to varargs in other languages, such as C, where you can write `void f(int arg, ...) { ... }`. In the smart contract framework they do not need specialized syntax, we use the type system to define theit behavior.

:::info Note
In the framework, single values are treated as a special case of multi-value, one that consumes exactly one argument, or returns exactly one value.

In effect, all serializable types implement the multi-value traits.
:::

[comment]: # (mx-context-auto)

## Parsing and limitations

It is important to understand that arguments get read one by one from left to right, so there are some limitations as to how var-args can be positioned. Argument types also define how the arguments are consumed, so, for instance, if a type specifies that all remaining arguments will be consumed, it doesn't really make sense to have any other argument after that.


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

## Implementation details

All serializable types will implement traits `TopEncodeMulti` and `TopDecodeMulti`.

The components that do argument parsing, returning results, or handling of event logs all work with these two traits.

All serializable types (the ones that implement `TopEncode`) are explicitly decalred to also be multi-value in this declaration:

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

To create a custom multi-value type, one needs to implement these two traits for the type, by hand. Unlike for single values, there is no [equivalent derive syntax](/developers/data/custom-types).
