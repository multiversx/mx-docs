---
id: elrond-wasm-modules
title: Smart contract modules
---

## Introduction

Smart contract modules are a handy way of dividing a contract into smaller components. Modules also reduce code duplication, since they can be reused across multiple contracts.

## Declaration

Modules can be defined both in the same crate as the main contract, or even in their own standalone crate. The latter is used when you want to use the same module in multiple contracts.  

A module is trait declared with the `#[elrond_wasm::module]` macro. Inside the trait, you can write any code you would usually write in a smart contract, even endpoints, events, storage mappers, etc.  

For example, let's say you want to have your storage mappers in a separate module. The implementation would look like this:  

```
#[elrond_wasm_derive::module]
pub trait StorageModule {
#[view(getQuorum)]
    #[storage_mapper("firstStorage")]
    fn first_storage(&self) -> SingleValueMapper<Self::Storage, usize>;

    #[view]
    #[storage_mapper("secondStorage")]
    fn second_storage(&self) -> SingleValueMapper<Self::Storage, u64>;
}
```

## Importing a module

A module can be imported both by other modules and contracts: 

```
pub trait SetupModule:
    crate::storage::StorageModule
    + crate::util::UtilModule {

}
```

```
#[elrond_wasm_derive::contract]
pub trait MainContract: 
    setup::SetupModule
    + storage::StorageModule
    + util::UtilModule {

}
```

Keep in mind your main contract has to implement all modules that any sub-module might use. In this example, even if the `MainContract` does not use anything from the `UtilModule`, it still has to implement it if it wants to use `SetupModule`.  

## Conclusion

We hope this module system will make it a lot easier to write maintainable smart contract code, and even reusable modules.  

If you want to take a look at some more examples, or even just modules you can use, take a look here: https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/modules  
