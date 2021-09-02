---
id: the-arwen-wasm-vm
title: The Arwen WASM VM
---

The execution of SmartContracts plays a central role in modern blockchain networks. Elrond built a fast and secure virtual machine for this purpose, called Arwen.

Because the Arwen VM executes [WebAssembly](https://en.wikipedia.org/wiki/WebAssembly), it also means that it can execute smart contracts written in _any programming language_ that can be compiled to WASM bytecode, such as C, C++, C#, Rust, Go, TypeScript and many others.

Developers are encouraged to use Rust for their smart contracts, however. Elrond provides a [Rust framework ](https://github.com/ElrondNetwork/elrond-wasm-rs) which allows for unusually clean and efficient code in smart contracts, a rarity in the blockchain field. A declarative testing framework is bundled as well. For the best coding experience, developers have the [Elrond IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide) at their disposal.

:::note Important
Executing smart contracts written in Solidity is also possible, if a mature Solidity → WASM third-party compiler is used. At this time, though, the Solidity compilers known to produce WASM appear to be still under development and not ready for production, a fact which Elrond does not have control over.
:::

:::important
Instructions on how to migrate Ethereum smart contracts to the Elrond Network will be provided in the near future.
:::

# **Features**

Arwen was built to be as fast and secure as possible, but without adding unneeded restrictions to what smart contracts can do: the API provided by Arwen, called the Elrond Environment Interface, is comprehensive and easy to use.

## **Statelessness**

Arwen is a stateless VM. When a smart contract is being executed, it is not allowed to write directly neither to the blockchain, nor to the storage. This is an important design decision, because it obviates the need for reverting operations. So, instead of writing directly to the state, the API will accumulate the changes introduced by the smart contract execution into a _transient data structure_, which is then applied to the storage and / or blockchain, but only at the end of the execution, and only in case of success. Reading the global state is, of course, permitted at any time.

In effect, the global state remains unaffected until the execution ends.

## **Out-of-process execution**

To add an extra layer of stability and security, Arwen runs in its own process, separate from the node itself. The two processes exchange information via a collection of anonymous in-memory pipes. This means that memory segmentation itself, as realized by the OS, is used as a protective layer.

Moreover, the execution of WASM bytecode always happens in a tightly controlled sandbox, and the memory of Arwen's process is inaccessible.

## **Fast execution engine**

The Arwen VM executes code using Wasmer as an execution engine, which operates as a just-in-time streaming compiler. Due to the design of Wasmer, the smart contracts are executed at near-native speed.

The version of Wasmer that is embedded in Arwen has been modified to add accurate metering with configurable cost per individual WASM opcode. But apart from metering, Elrond has also modified Wasmer to allow for preemptive execution control at runtime, whereby a smart contract can be stopped immediately by Arwen, if needed. Moreover, the compilation efficiency has been improved, and floating-point operations have been forbidden, to ensure strict determinism.

## **Asynchronous calls between contracts**

Smart contracts may call each other using Arwen's asynchronous API. Because the Elrond Network is sharded adaptively, it may happen that a smart contract will end up calling another smart contract stored by a different shard. This is handled easily by the Arwen VM, and the smart contract developer never has to care about shards.

In case a contract calls another, and they are both in the same shard, the execution is effectively synchronous, and both contracts are executed without even leaving the VM.

If the contracts happen to be in different shards, no worries - the execution will be automatically switched to an asynchronous mode, the call is sent to its destination shard, executed there, and then the flow finally returns to the caller.

Both the synchronous and asynchronous modes are invisible to the smart contract developer: the API is the same for both, and the switch happens at runtime, when needed.
