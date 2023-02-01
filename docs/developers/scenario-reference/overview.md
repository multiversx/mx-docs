---
id: overview
title: Scenario Testing Overview
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## **Rationale**

During smart contract development, it is important for the developer to have the capacity to write unit and integration tests easily.

Short unit tests can use the language and tools the contract is written with, but to test the contract in a realistic scenario we need at least a blockchain mock and some way to specify execution scenarios.

Scenario testing is suitable for both short tests that check how a transaction changes the storage, and for long and complex test cases.

The fact that it is expressed in a descriptive language like JSON makes it agnostic to the language in which the smart contract is developed.

[comment]: # (mx-context-auto)

## **Running the tests**

At the moment of writing this document, scenario tests can be launched directly from the MultiversX VSCode extension, from contextual menus.

[comment]: # (mx-context-auto)

## **Go backend vs. Rust backend**

There are currently 2 implementations of the scenario specifications.

1. The Go backend is part of MultiversX VM, it is integrated with the VM fully and runs actual smart contract code. This is the most up-to-date version of the two.

2. The Rust backend is an implementation that is integrated into the Rust smart contract framework. It currently resides in the `multiversx-chain-vm` crate, but might get moved around in the future. The contracts only need to interact with the `multiversx-sc-scenario` crate. It mocks everything, including the VM and the WebAssembly engine. It is useful for debugging smart contracts and for generating high-level coverage for contracts. The Rust backend is not yet fully featured, parts of the ESDT specification are not yet implemented, as well as some of the contract-to-contract calls.

Developers are expected to only write the scenario tests once, but they can run them on both systems, as needed. It is important to have the tests running with the Go backend in the first place. Running them in Rust too is convenient, but not critical.

[comment]: # (mx-context-auto)

## **Test file extension**

Scenario files should end in `.scen.json`, where "scen" comes from "scenario". The framework uses the double extension to identify tests to attempt running. Any other extension will be ignored.

On a side note, there is also an older format that is now deprecated, where test file names end in `.test.json`, but you shouldn't worry about it.
