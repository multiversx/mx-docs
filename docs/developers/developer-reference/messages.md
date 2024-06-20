---
id: messages
title: Messages
---

[comment]: # (mx-abstract)

## Errors

[comment]: # (mx-abstract)

### sc_panic!

It is a macro that signals errors. `sc_panic!` simplifies the process of throwing exceptions with custom error messages. It handles both formatted messages with arguments and static messages without arguments.

```rust
 sc_panic!("Formatted error message with arguments: {}", arg);  // message with argument
 sc_panic!("Static error message");                             // static messages
```
[comment]: # (mx-abstract)

### require!

`require!` is a macro used to enforce preconditions by checking wheater an expression evaluates to *true*. If the expression evaluates to *false*, it will trigger a panic with a specific error message. It is useful because it validates conditions.

```rust
require!(expression, "formatted error message with argument: {}", arg); // error message with argument
require!(expression, "error message");                                  // static error messages
```

[comment]: # (mx-abstract)

## Print

[comment]: # (mx-abstract)

### sc_print!
It is an essential tool for printing in smart contracts. `sc_print!` is used to output debug messages to the console. It handles both formatted messages with arguments and static messages without arguments.
```rust
sc_print!("Static message");        // print static message
sc_print!("Printing x: {}", x);     // print message with argument 
sc_print!("Printing x: {:x}", x);   // print message hex
sc_print!("Printing x: {:b}", x);   // print message binary
sc_print!("Printing x: {:c}", x);   // print message codec
```

[comment]: # (mx-abstract)

## Formatting string

[comment]: # (mx-abstract)

### sc_format!
It creates a formatted buffer in contracts. `sc_format!` supports both formatted messages with arguments and static messages without arguments. The returned value of this macro is a `ManagedBuffer` that can be used within smart contracts.
```rust
let number_i32: i32 = 16;
let message_with_i32: ManagedBuffer = sc_format!("i32: {}", number_i32);

let number_bigUint = BigUint::from(16u32);
let message_with_bigUint = sc_format!("BigUint: {}", number_bigUint);

let buffer: ManagedBuffer = ManagedBuffer::new_from_bytes(b"message");
let message_with_buffer = sc_format!("ManagedBuffer: {}", buffer);
let message_with_buffer_hex = sc_format!("ManagedBuffer hex: {:x}", buffer);
```