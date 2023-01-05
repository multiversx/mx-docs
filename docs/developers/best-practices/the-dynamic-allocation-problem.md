---
id: the-dynamic-allocation-problem
title: The dynamic allocation problem
---

### Avoiding memory allocation

:::warning
**Smart contracts must avoid dynamic allocation**. Due to the performance penalty incurred by dynamic allocation, the MultiversX Virtual Machine is configured with hard limits and will stop a contract that attempts too much allocation.
:::

Here are a few simple guidelines you can use to ensure your contract performs efficiently. By following them, you might notice a considerable reduction of gas consumption when your contract is called. It is also likely that the WASM binary resulting from compilation may become smaller in size, thus faster and cheaper to call overall.

### It's all about the types

Many basic Rust types (like `String` and `Vec<T>`) are dynamically allocated on the heap. In simple terms, it means the program (in this case, the smart contract) keeps asking for more and more memory from the runtime environment (the VM). For small collections, this doesn't matter much, but for bigger collection, this can become slow and the VM might even stop the contract and mark the execution as failed.

The main issue is that basic Rust types are quite eager with dynamic memory allocation: they ask for more memory than they actually need. For ordinary programs, this is great for performance, but for smart contracts, where every instruction costs gas, can be quite impactful, on both cost and even runtime failures.

The alternative is to use **managed types** instead of the usual Rust types. All managed types, like `BigUint`,  `ManagedBuffer` etc. store all their contents inside the VM's memory, as opposed to the contract memory, so they have a great performance advantage. But you don't need to be concerned with "where" the contents are, because managed types automatically keep track of the contents with help from the VM.

The managed types work by only storing a `handle` within the contract memory, which is a `u32` index, while the actual payload resides in reserved VM memory. So whenever you have to add two `BigUint`s for example, the `+` operation in your code will only pass the three handles: the result, the first operand, and the second operand. This way, there is very little data being passed around, which in turn makes everything cheaper. And since these types only store a handle, their memory allocation is fixed in size, so it can be allocated on the stack instead of having to be allocated on the heap.

:::warning
If you need to update older code to take advantage of managed types, please take the time to understand the changes you need to make. Such an update is important and cannot be done automatically.
:::

### Base Rust types vs managed types

Below is a table of unmanaged types (basic Rust types) and their managed counterparts, provided by the MultiversX framework:

| Unmanaged (safe to use) | Unmanaged (allocates on the heap) |                   Managed                    |
| :---------------------: | :-------------------------------: | :------------------------------------------: |
|            -            |                 -                 |                  `BigUint`                   |
|         `&[u8]`         |                 -                 |               `&ManagedBuffer`               |
|            -            |           `BoxedBytes`            |               `ManagedBuffer`                |
| `ArrayVec<u8, CAP>`[^1] |             `Vec<u8>`             |               `ManagedBuffer`                |
|            -            |             `String`              |               `ManagedBuffer`                |
|            -            |                 -                 |              `TokenIdentifier`               |
|            -            |          `MultiValueVec`          | `MultiValueEncoded` / `MultiValueManagedVec` |
| `ArrayVec<T, CAP>`[^1]  |             `Vec<T>`              |               `ManagedVec<T>`                |
|      `[T; N]`[^2]       |           `Box<[T; N]>`           |            `ManagedByteArray<N>`             |
|            -            |             `Address`             |               `ManagedAddress`               |
|            -            |              `H256`               |            `ManagedByteArray<32>`            |
|            -            |                 -                 |               `EsdtTokenData`                |
|            -            |                 -                 |              `EsdtTokenPayment`              |

[^1]: `ArrayVec` allocates on the stack, and so it has a fixed capacity - it cannot grow indefinitely. You can make it as large as you please, but be warned that adding beyond this capacity results in a panic. Use `try_push` instead of `push` for more graceful error handling.
[^2]: Be careful when passing arrays around, since they get copied when returned from functions. This can add a lot of expensive memory copies in your contract.

In most cases, the managed types can be used as drop-in replacements for the basic Rust types. For a simple example, see [BigUint Operations](#biguint-operations).

We also recommend _allocating Rust arrays directly on the stack_ (as local variables) whenever a contiguous area of useful memory is needed. Moreover, avoid allocating mutable global buffers for this purpose, which require `unsafe` code to work with.

Also, consider using `ArrayVec`, which provides the functionality of a `Vec`, but without allocation on the heap. Instead, it requires allocation of a block of memory directly on the stack, like a basic Rust local array, but retains the flexibility of `Vec`.

:::warning
Make sure you migrate to the managed types **incrementally** and **thoroughly test your code** before even considering deploying to the mainnet.
:::

:::tip
You can use the `erdpy contract report` command to verify whether your contract still requires dynamic allocation or not.
:::

