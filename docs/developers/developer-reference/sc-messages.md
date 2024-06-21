---
id: sc-messages
title: Messages
---

[comment]: # (mx-abstract)

The SC framework supports message interpolation in a variety of situations.

The mechanism makes full use of managed types, and does not require memory allocation on the heap.

It resembles the standard message formatting in Rust, but it does not have all the features and is a completely separate implementation.

To see these features in action, we have [an example contract just for that](https://github.com/multiversx/mx-sdk-rs/blob/master/contracts/feature-tests/formatted-message-features/src/formatted_message_features.rs).


[comment]: # (mx-context-auto)

## Errors

The most common place to see message interpolation is in the error messages. These messages will be seen in the explorer and tools if a transaction fails.

[comment]: # (mx-context-auto)

### sc_panic!

Whenever encountered, it stops execution immediately, and returns the given error message. Also note that for all errors originating in the smart contract, the status code is "4".

The macro simplifies the process of throwing exceptions with custom error messages. It works with formatted messages with arguments, and with static messages without arguments.

```rust
 sc_panic!("Formatted error message with arguments: {}", arg);  // message with argument
 sc_panic!("Static error message");                             // static messages
```

[comment]: # (mx-context-auto)

### require!

`require!` is a macro used to enforce preconditions by checking whether an expression evaluates to *true*. If the expression evaluates to *false*, it will trigger a panic with a specific error message. It is very useful when validating pre-conditions.

```rust
require!(expression, "formatted error message with argument: {}", arg); // error message with argument
require!(expression, "error message");                                  // static error messages
```


[comment]: # (mx-context-auto)

## Formatting string

We might want to interpolate a string for other uses than throwing an error, such as returning it or saving it to storage.

[comment]: # (mx-context-auto)

### sc_format!

The macro creates a formatted managed buffer in contracts. Just like all other format functionality, it supports both formatted messages with arguments and static messages without arguments. The returned value of this macro is a `ManagedBuffer` that can be used within smart contracts.

```rust
let number_i32: i32 = 16;
let message_with_i32: ManagedBuffer = sc_format!("i32: {}", number_i32);

let number_bigUint = BigUint::from(16u32);
let message_with_bigUint = sc_format!("BigUint: {}", number_bigUint);

let buffer: ManagedBuffer = ManagedBuffer::new_from_bytes(b"message");
let message_with_buffer = sc_format!("ManagedBuffer: {}", buffer);
let message_with_buffer_hex = sc_format!("ManagedBuffer hex: {:x}", buffer);
```


[comment]: # (mx-context-auto)

## Printing to console

Smart contracts cannot print messages on-chain, because they do not have access to any console or standard output. They can, however, do so when run in tests. This printing feature is designed to come to complement the debugger when testing contracts.

[comment]: # (mx-context-auto)

### sc_print!

This macro is the primary way to output messages to console, when running tests.

Using it doesn't impact wasm builds in any way, so it is safe to use in any situation. To avoid any overhead, not even the formatting code will end up compiled to WebAssembly.

Despite this, we recommend removing the `sc_print!` commands, once you are done with debugging.

To produce logs on-chain, consider using [event logs](sc-annotations#events) instead.


[comment]: # (mx-context-auto)

## Interpolation format

Values can be interpolated into messages in several ways.
- `{}` - The human-readable representation.
    - For number types, it is the base 10 representation.
    - For managed buffers, it is the contained text.

- `{:x}` - Lowercase hexadecimal encoding.
    - For number types, it is the base 16 representation.
    - For managed buffers, it is the contained bytes as hex.

- `{:b}` - Binary encoding ("0" and "1").
    - For number types, it is the base 2 representation.
    - For `CodeMetadata`, we get the individual bits.


- `{:c}` - Encoded the same as the [codec representation](/developers/data/serialization-overview). Helpful when trying to visualize the encoding of an object. It is also the one available for most types, so it is a good fallback when other types of formatting are not available, e.g. for custom structs.
    - For all types, it is the [top-encoded](/developers/data/serialization-overview#the-concept-of-top-level-vs-nested-objects) representation.

Example:

```rust
sc_print!("Static message");        // print static message
sc_print!("Printing x: {}", x);     // print message with argument 
sc_print!("Printing x: {:x}", x);   // print message hex
sc_print!("Printing x: {:b}", x);   // print message binary
sc_print!("Printing x: {:c}", x);   // print message codec
```

