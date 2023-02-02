---
id: sc-modules
title: Smart contract modules
---

[comment]: # (mx-abstract)

## Introduction

Smart contract modules are a handy way of dividing a contract into smaller components. Modules also reduce code duplication, since they can be reused across multiple contracts.

[comment]: # (mx-context-auto)

## Declaration

Modules can be defined both in the same crate as the main contract, or even in their own standalone crate. The latter is used when you want to use the same module in multiple contracts.

A module is trait declared with the `#[multiversx_sc::module]` macro. Inside the trait, you can write any code you would usually write in a smart contract, even endpoints, events, storage mappers, etc.

For example, let's say you want to have your storage mappers in a separate module. The implementation would look like this:

```rust
#[multiversx_sc::module]
pub trait StorageModule {
    #[view(getQuorum)]
    #[storage_mapper("firstStorage")]
    fn first_storage(&self) -> SingleValueMapper<usize>;

    #[view]
    #[storage_mapper("secondStorage")]
    fn second_storage(&self) -> SingleValueMapper<u64>;
}
```

Then, in your main file (usually named `lib.rs`), you have to define the module. If the file for the above module is named `storage.rs`, then in the main file you'd declare it like this:

```rust
pub mod storage;
```

[comment]: # (mx-context-auto)

## Importing a module

A module can be imported both by other modules and contracts:

```rust
pub trait SetupModule:
    crate::storage::StorageModule
    + crate::util::UtilModule {

}
```

```rust
#[multiversx_sc::contract]
pub trait MainContract:
    setup::SetupModule
    + storage::StorageModule
    + util::UtilModule {

}
```

Keep in mind your main contract has to implement all modules that any sub-module might use. In this example, even if the `MainContract` does not use anything from the `UtilModule`, it still has to implement it if it wants to use `SetupModule`.

[comment]: # (mx-context-auto)

## Conclusion

We hope this module system will make it a lot easier to write maintainable smart contract code, and even reusable modules.

More modules and examples can be found here: https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/modules
