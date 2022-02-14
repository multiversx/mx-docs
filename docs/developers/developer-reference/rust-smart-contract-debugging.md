---
id: rust-smart-contract-debugging
title: Rust Smart Contract Debugging
---

## Prerequisites

For this tutorial, you will need:
- Visual Studio Code  
- the [rust-analyser](https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer) extension. Newer versions sometimes cause issues, I recommend the `v0.2.751` version.  
- A [Rust test](rust-testing-framework.md)

If you want to follow along, you can clone the [elrond-wasm-rs](https://github.com/ElrondNetwork/elrond-wasm-rs) repository and use the [crowdfunding-esdt](https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/examples/crowdfunding-esdt) example.  

## Step by step debugging

In VSCode, you can put breakpoints anywhere in your code, by simply clicking to the left of the line number. A red dot should appear to mark the breakpoint as registered by the environment:

![img](debugging-images/breakpoint_setup.png)

Once you've done that, you can debug your test function by pressing the `Debug` button above the test function name:

![img](debugging-images/start_test.png)

If it doesn't appear, you might have to wait a bit for rust-analyser to load, or you might've forgotten the `#[test]` annotation.  

Once you've started the test, it should stop at the breakpoint and highlight the current line for you:

![img](debugging-images/first_step_debugging.png)

Then, you can use VSCode's step by step debugging (usually F10 to step over, F11 to step into, or shift + F11 to step out).

## Inspecting variables

For base Rust types, like u64 and such, you will be able to simply hover over them and see the value.

You might however, try to hover over the `target` variable for instance, and will be immediately disappointed, since all you'll see is something like this:

```rust
handle:0
_phantom:{...}
```

This is not very helpful. Unfortunately, for managed types you don't have the actual data in the type itself, you only have a handle (i.e. an index) in a stack somewhere. 

For that reason, we have a print method for biguints:

```rust
self.print().print_biguint(&target);
```

Adding this line to the beginning of the `#[init]` function will print the following in the console:

`BigUint { handle: 0, hex: "07d0", dec: "2000" }`

## Printing formatted messages

If you want to print other data types, maybe even with a message, you can use the `sc_print!` macro. Currently, only HEX and ASCII representations are supported (no decimal numbers yet. For that, use the `print_biguint` function).  

For example, if you were to add this to the start of the `#[init]` function:
```rust
sc_print!(
    "I accept {}, a number of {:x}, and only until {:x}",
    token_identifier,
    target,
    deadline
);
```

This macro would print the following: 

`"I accept CROWD-123456, a number of 0x07d0, and only until 0x093a80"`

Note: For ASCII representation, use `{}`, and for hex, use `{:x}`.  
