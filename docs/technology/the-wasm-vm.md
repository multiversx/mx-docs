---
id: the-wasm-vm
title: The MultiversX WASM VM
---

[comment]: # (mx-context-auto)

The execution of SmartContracts plays a central role in modern blockchain networks. MultiversX built a fast and secure virtual machine for this purpose.

Because the MultiversX VM executes [WebAssembly](https://en.wikipedia.org/wiki/WebAssembly), it also means that it can execute smart contracts written in _any programming language_ that can be compiled to WASM bytecode, such as C, C++, C#, Rust, Go, TypeScript and many others.

Developers are encouraged to use Rust for their smart contracts, however. MultiversX provides a [Rust framework](https://github.com/multiversx/mx-sdk-rs) which allows for unusually clean and efficient code in smart contracts, a rarity in the blockchain field. A declarative testing framework is bundled as well. For the best coding experience, developers have the [MultiversX IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide) at their disposal.

[comment]: # (mx-context-auto)

## **Features**

The MultiversX VM was built to be as fast and secure as possible, but without adding unneeded restrictions to what smart contracts can do: the API provided by the VM, called the MultiversX Environment Interface, is comprehensive and easy to use.

[comment]: # (mx-context-auto)

## **Statelessness**

The MultiversX WASM VM is a stateless VM. When a smart contract is being executed, it is not allowed to write directly neither to the blockchain, nor to the storage. This is an important design decision, because it obviates the need for reverting operations. So, instead of writing directly to the state, the API will accumulate the changes introduced by the smart contract execution into a _transient data structure_, which is then applied to the storage and / or blockchain, but only at the end of the execution, and only in case of success. Reading the global state is, of course, permitted at any time.

In effect, the global state remains unaffected until the execution ends.

[comment]: # (mx-context-auto)

## **Fast execution engine**

The MultiversX VM executes code using Wasmer as an execution engine, which operates as a just-in-time streaming compiler. Due to the design of Wasmer, the smart contracts are executed at near-native speed.

The version of Wasmer that is embedded in the VM has been modified to add accurate metering with configurable cost per individual WASM opcode. But apart from metering, MultiversX has also modified Wasmer to allow for preemptive execution control at runtime, whereby a smart contract can be stopped immediately by the VM, if needed. Moreover, the compilation efficiency has been improved, and floating-point operations have been forbidden, to ensure strict determinism.

[comment]: # (mx-context-auto)

## **Asynchronous calls between contracts**

Smart contracts may call each other using the VM's asynchronous API. Because the MultiversX Network is sharded adaptively, it may happen that a smart contract will end up calling another smart contract stored by a different shard. This is handled easily by the MultiversX VM, and the smart contract developer never has to care about shards.

In case a contract calls another, and they are both in the same shard, the execution is effectively synchronous, and both contracts are executed without even leaving the VM.

If the contracts happen to be in different shards, no worries - the execution will be automatically switched to an asynchronous mode, the call is sent to its destination shard, executed there, and then the flow finally returns to the caller.

Both the synchronous and asynchronous modes are invisible to the smart contract developer: the API is the same for both, and the switch happens at runtime, when needed.
