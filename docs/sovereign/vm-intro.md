# Introduction

The MultiversX protocol is designed so that integrating a new executor, a new processor, or even a completely new VM is straightforward. In essence, any new VM only needs to implement the `VMExecutionHandler` interface. Currently, there are two VMs running on MultiversX:

- **WasmVM**: Handles general smart contracts running on WASM.
- **systemVM**: Specialized for defined system smart contracts written in Go.

For sovereign shards, we introduced the option for a WasmVM smart contract to call a systemVM smart contract through the `BlockchainHookInterface`, specifically via the `ExecuteOnDestOnOtherVM` endpoint. This is necessary because both VMs reside in the same shard on sovereign shards. On the mainnet, however, WasmVM contracts can interact with systemVM contracts only through an asynchronous call, since systemVM exists exclusively on the metachain.

When considering the EVM or other VMs, on MultiversX, it’s important to note that developers will likely want to interact with WasmVM contracts as well. Put simply, a smart contract should be able to interact with both WasmVM and other VM contracts in a uniform way, and that abstraction must happen at the VM level. The WasmVM already handles this by smartly calling the `ExecuteOnDestOnOtherVM` endpoint as needed.

If we look further down the **STACK** we have SpaceVM which can actually accommodate multiple **EXECUTORS**. In the case of current mainnet/sovereign SpaceVM the **EXECUTOR** is *WASMER2.0* with a few additions from our side. Wasmer is written in rust and SpaceVM is written in GO. The SpaceVM has a big set of **OP_CODES**, from storage handling, to memory handling to crypto operations, big floats, and more. These **OP_CODES** are represented as pointer functions, written in GO and they have an access pointer. The executor, our modified Wasmer, receives this set of functions as a LIBRARY and when a SmartContract calls one of the **OP_CODES**, this calls the internal library added to WASMER which gets executed in the GO code of SpaceVM.
