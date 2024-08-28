---
id: sc-debugging
title: Smart Contract Debugging
---

[comment]: # (mx-abstract)

## Introduction

Debugging smart contracts is possible with the integrated debugger in Visual Studio Code. You will be able to debug your contract just like you would debug a regular program.

[comment]: # (mx-context-auto)

## Prerequisites

For this tutorial, you will need:
- Visual Studio Code  
- the [rust-analyser](https://marketplace.visualstudio.com/items?itemName=matklad.rust-analyzer) extension.  
- the [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) extension.  
- A [Rust test](rust/sc-blackbox-example)

If you want to follow along, you can clone the [mx-sdk-rs](https://github.com/multiversx/mx-sdk-rs) repository and use the [crowdfunding-esdt](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples/crowdfunding-esdt) example.  

[comment]: # (mx-context-auto)

## Step by step debugging

In VSCode, you can put breakpoints anywhere in your code, by simply clicking to the left of the line number. A red dot should appear to mark the breakpoint as registered by the environment:

![img](/developers/sc-debugging/breakpoint_setup.png)

Once you've done that, you can debug your test function by pressing the `Debug` button above the test function name:

![img](/developers/sc-debugging/start_test.png)

If it doesn't appear, you might have to wait a bit for rust-analyser to load, or you might've forgotten the `#[test]` annotation.  

Once you've started the test, it should stop at the breakpoint and highlight the current line for you:

![img](/developers/sc-debugging/first_step_debugging.png)

Then, you can use VSCode's step by step debugging (usually F10 to step over, F11 to step into, or shift + F11 to step out).

[comment]: # (mx-context-auto)

## Inspecting variables

For base Rust types, like u64 and such, you will be able to simply hover over them and see the value.

You might however, try to hover over the `target` variable for instance, and will be immediately disappointed, since all you'll see is something like this:

```rust
handle:0
_phantom:{...}
```

This is not very helpful. Unfortunately, for managed types you don't have the actual data in the type itself, you only have a handle (i.e. an index) in a stack somewhere. 

For that reason, we have the `sc_print!` macro:

```rust
sc_print!("{}", target);
```

Adding this line to the beginning of the `#[init]` function will print `2000` in the console.

[comment]: # (mx-context-auto)

## Printing formatted messages

If you want to print other data types, maybe even with a message, you can use the `sc_print!` macro all the same.

For example, if you were to add this to the start of the `#[init]` function:
```rust
sc_print!(
    "I accept {}, a number of {}, and only until {}",
    token_identifier,
    target,
    deadline
);
```

This macro would print the following: 

`"I accept CROWD-123456, a number of 2000, and only until 604800"`

Note: For ASCII or decimal representation, use `{}`, and for hex, use `{:x}`.  
