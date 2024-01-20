---
id: sc-allocator
title: Memory allocation
---

[comment]: # (mx-abstract)

MultiversX smart contracts are compiled to WebAssembly, which does not come with memory allocation out of the box. In general WebAssembly programs need special memory allocation functionality to work with the heap.

Using traditional memory allocation is highly discouraged on MultiversX. There are several reasons:
- We have “managed types”, which are handled by the VM, and which offer a cheaper and more reliable alternative.
- “Memory grow” operations can be expensive and unreliable. For the stability of the blockchain we have chosen to limit them drastically.
- Memory allocators end up in smart contract code, bloating it with something that is not related in any way to its specifications. This contradicts our design philosophy.

Even so, it is unreasonable to forbid the use of allocators altogether, whether to use them or not ultimately needs to be the developers' choice. Before framework version 0.41.0, the only allocator solution offered was `wee_alloc`. Unfortunately, it has not been maintained for a few years and has some known vulnerabilities. This was also causing Github’s Dependabot to produce critical warnings, not only to our framework, but to all contract projects, despite most of them not really using it.

First of all, we made the allocator [configurable](/developers/meta/sc-config#single-contract-configuration) from multicontract.toml, currently the main source of contract build specifications. Developers currently have 4 allocators to choose from.

Then, we added the following allocators to our framework:
- `FailAllocator` (the default) simply crashes whenever any memory allocation or deallocation is attempted. For the first time we have a tool that completely prevents accidental memory allocation. We already had an "alloc" feature in Cargo.toml, but it is only operating high-level and can easily (and sometimes accidentally) be circumvented.
- `StaticAllocator64k` pre-allocates a static 2-page buffer, where all memory is allocated. It can never call memory.grow . It never deallocates and crashes when the buffer is full. It can be suitable for small contracts with limited data being processed, who want to avoid the pitfalls of a memory.grow .
- `LeakingAllocator` uses memory.grow to get hold of memory pages. It also never deallocates. This is because contracts do not generally fill up so much memory and all memory is erased at the end of execution anyway. Suitable for contracts with a little more data.
- `wee_alloc` is still supported. It is, however, not included in the framework. Contracts need to import it explicitly.

:::caution
While these allocators are functional, they should be avoided by all contracts. Only consider this functionality when all else fails, in extremely niche situations, or for dealing with very old code.
:::