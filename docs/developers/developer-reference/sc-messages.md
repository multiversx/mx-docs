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
    - For **number types**, it is the base 10 representation.
    ```rust
    // "Printing u64: 372036854775807"
    sc_print!("Printing u64: {}", 372036854775807u64;);

    // "Printing u32: 800000008"
    sc_print!("Printing u32: {}", 800000008u32);

    // "Printing usize: 1800000000"
    sc_print!("Printing usize: {}", 1800000000usize);

    // "Printing u16: 60123"
    sc_print!("Printing u16: {}", 60123u16);

    // "Printing u8: 233"
    sc_print!("Printing u8: {}", 233u8);
    
    // "Printing i64: -372036854775807"
    sc_print!("Printing i64: {}", -372036854775807i64);

    // "Printing i32: -800000008"
    sc_print!("Printing i32: {}", -800000008i32);

    // "Printing isize: -1800000000"
    sc_print!("Printing isize: {}", -1800000000isize);

    // "Printing i16: -30123"
    sc_print!("Printing i16: {}", -30123i16);

    // "Printing i8: -126"
    sc_print!("Printing i8: {}", -126i8);

    let x_bigint: BigInt = BigInt::from(-3272036854775807i64);
    // "Printing x_bigint: -3272036854775807"
    sc_print!("Printing x_bigint: {}", x_bigint);
    
    let x_biguint: BigUint = BigUint::from(3272036854775807u64);
    // "Printing x_biguint: 3272036854775807"
    sc_print!("Printing x_biguint: {}", x_biguint);
    ```
    - For `ManagedBuffer`, it is the contained text.
    ```rust
    let managed_buffer: ManagedBuffer = ManagedBuffer::new_from_bytes(b"Welcome to MultiversX!");
    // "Printing managed_buffer: Welcome to MultiversX!"
    sc_print!("Printing managed_buffer: {}", managed_buffer);
    ```
    - For **bool**, it indicates whether the condition is true or false.
    ```rust
    let x_bool: bool = true;
    // "Printing x_bool: true"
    sc_print!("Printing x_bool: {}", x_bool);
    ```
    - For **byte values**, it is the string character.
    ```rust
    let x_bytes: &[u8] = b"MVX";
    // "Printing x_bytes: MVX"
    sc_print!("Printing x_bytes: {}", x_bytes);
    ```
    - For `CodeMetadata`, it is the flag represented as a text.
    ```rust
    let code_metadata: CodeMetadata = CodeMetadata::UPGRADEABLE;
    // "Printing code_metadata: Upgradeable"
    sc_print!("Printing code_metadata: {}", code_metadata);
    ```
    - For `TokenIdentifier`, it is the token ticker.
    ```rust
    let token_identifier = TokenIdentifier::from(&b"TESTTOK-2345"[..]);
    // "Printing token_identifier: TESTTOK-2345"
    sc_print!("Printing token_identifier: {}", token_identifier);
    ```
    - for `EgldOrEsdtTokenIdentifier`, it is the token ticker.
    ```rust
    let egld_or_esdt_token_identifier: EgldOrEsdtTokenIdentifier = EgldOrEsdtTokenIdentifier::egld();
    // "Printing egld_or_esdt_token_identifier: EGLD"
    sc_print!("Printing egld_or_esdt_token_identifier: {}", egld_or_esdt_token_identifier);
    ```
    
- `{:x}` - Lowercase hexadecimal encoding.
    - For **number types**, it is the base 16 representation.
    ```rust
    // "Printing u64: 1525d94927fff"
    sc_print!("Printing u64: {:x}", 372036854775807u64);

    // "Printing u32: 2faf0808"
    sc_print!("Printing u32: {:x}", 800000008u32);

    // "Printing usize: 6b49d200"
    sc_print!("Printing usize: {:x}", 1800000000usize);

    // "Printing u16: eadb"
    sc_print!("Printing u16: {:x}", 60123u16);

    // "Printing u8: e9"
    sc_print!("Printing u8: {:x}", 233u8);
    
    // "Printing i64: fffeada26b6d8001"
    sc_print!("Printing i64: {:x}", -372036854775807i64);

    // "Printing i32: d050f7f8"
    sc_print!("Printing i32: {:x}", -800000008i32);

    // "Printing isize: 94b62e00"
    sc_print!("Printing isize: {:x}", -1800000000isize);

    // "Printing i16: 8a55"
    sc_print!("Printing i16: {:x}", -30123i16);

    // "Printing i8: 82"
    sc_print!("Printing i8: {:x}", -126i8);
    ```
    - For `ManagedBuffer`, it is the contained text as hexadecimal.
    ```rust
    let managed_buffer: ManagedBuffer = ManagedBuffer::new_from_bytes(b"MultiversX!");
    // "Printing managed_buffer: 4d756c7469766572735821"
    sc_print!("Printing managed_buffer: {:x}", managed_buffer);
    ```    
    - For `ManagedAddress`, it is the contained address as hexadecimal.
    ```rust
    let address: [u8; 32] = hex!("fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe");
    let managed_address: ManagedAddress = ManagedAddress::from(&address);
    // "Printing managed_address: fefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefefe"
    sc_print!("Printing managed_address: {:x}", managed_address);    
    ```
    - For `ManagedByteArray`, it is the hexadecimal representation for the ASCII characters.
    ```rust
    let managed_byte_array: ManagedByteArray<Self::Api, 3> = ManagedByteArray::new_from_bytes(b"MVX");
    // "Printing managed_byte_array: 4d5658"
    sc_print!("Printing managed_byte_array: {:x}", managed_byte_array);
    ```
    - For `CodeMetadata`, it is the metadata stored in the flag as hexadecimal.
    ```rust
    let code_metadata: CodeMetadata = CodeMetadata::UPGRADEABLE;
    // "Printing code_metadata: 0100"
    sc_print!("Printing code_metadata: {}", code_metadata);
    ```
    - For `TokenIdentifier`, it is the token ticker as hexadecimal.
    ```rust
    let token_identifier = TokenIdentifier::from(&b"TESTTOK-2345"[..]);
    // "Printing token_identifier: 54455354544f4b2d32333435"
    sc_print!("Printing token_identifier: {:x}", token_identifier);
    ```
    - for `EgldOrEsdtTokenIdentifier`, it is the token ticker as hexadecimal.
    ```rust
    let egld_or_esdt_token_identifier: EgldOrEsdtTokenIdentifier = EgldOrEsdtTokenIdentifier::egld();
    // "Printing egld_or_esdt_token_identifier: 45474C44"
    sc_print!("Printing egld_or_esdt_token_identifier: {:x}", egld_or_esdt_token_identifier);
    ```

- `{:b}` - Binary encoding ("0" and "1").
    - For **number types**, it is the base 2 representation.
     ```rust
    // "Printing u64: 1010100100101110110010100100100100111111111111111"
    sc_print!("Printing u64: {:b}", 372036854775807u64);

    // "Printing u32: 101111101011110000100000001000"
    sc_print!("Printing u32: {:b}", 800000008u32);

    // "Printing usize: 1101011010010011101001000000000"
    sc_print!("Printing usize: {:b}", 1800000000usize);

    // "Printing u16: 1110101011011011"
    sc_print!("Printing u16: {:b}", 60123u16);

    // "Printing u8: 11101001"
    sc_print!("Printing u8: {:b}", 233u8);
    ```
    - For `CodeMetadata`, we get the individual bits.
    ```rust
    let code_metadata: CodeMetadata = CodeMetadata::UPGRADEABLE;
    // "Printing code_metadata: 0000000100000000"
    sc_print!("Printing code_metadata: {:b}", code_metadata);
    ```
    - For `ManagedBuffer`, it is the contained text as bits.
    ```rust
    let managed_buffer: ManagedBuffer = ManagedBuffer::new_from_bytes(b"MVX");
    // "Printing managed_buffer: 010011010101011001011000"
    sc_print!("Printing managed_buffer: {}", managed_buffer);
    ```

- `{:c}` - Encoded the same as the [codec representation](/developers/data/serialization-overview). Helpful when trying to visualize the encoding of an object. It is also the one available for most types, so it is a good fallback when other types of formatting are not available, e.g. for custom structs.
    - For all types, it is the [top-encoded](/developers/data/serialization-overview#the-concept-of-top-level-vs-nested-objects) representation.
    ```rust
    // "Printing u64: 01525d94927fff"
    sc_print!("Printing u64: {:c}", 372036854775807u64);
    ```
