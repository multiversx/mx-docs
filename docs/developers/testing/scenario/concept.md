---
id: concept
title: Concept
---


[comment]: # (mx-context-auto)

## What is a scenario?

Let's think for a moment how an interaction with a blockchain might look like.

The only way to change the blockchain state is by sending transctions. We might also need to query some contracts in between sending these transactions. We might also query the blockchain state (balances, for instance) directly. Let's call these actions "steps". In a simulated environment, we need at least an additional step: initializing the sandbox.

Several steps form a scenario.

A scenario is any interaction with a blockchain, composed of one or more steps. These interactions might be:
- real, completed on a real blockchain, a history of sorts;
- programmed to be executed in the future;
- simulated, but using real blockchain data;
- simulated, using absurd or unrealistic data.

So it doesn't really matter if these steps are real or imagined. All that matters is that they obey the rules of the blockchain.

Because of their generality, it is natural to think of all blockchain interactions and black-box tests as such scenarios.


[comment]: # (mx-context-auto)

## Scenario formats

The concept of scenario is not tied to a specific technology, or language.

Historically, they started out as JSON tests. But writing a lot of JSON by hand is very inconvenient and unproductive, so we came up with a very similar syntax in Rust. When we created the interactor framework, we found that the scenario model fits naturally to real interactions too.

:::info important
Nowadays, we think that the JSON scenario format is best used for interoperability and replays, not for writing tests.

There are several ways to generte a scenario JSON file automatically, and we encourage developers to move away from writing them by hand.
:::

The greatest benefit of the JSON format is that it is language-agnostic, and so it can be used with any of our backends.


[comment]: # (mx-context-auto)

## Scenarios as tests

Scenarios also have syntax for checking transaction outputs and the blockchain state. This means that each scenario is also a test. Any failing check causes the scenario test to fail.

:::important What kind of tests are they?
They are always **black-box** tests. They model real blockchain interactions, so there is no way for them to peek inside contracts and access their private functions.
:::


[comment]: # (mx-context-auto)

## Typed vs. untyped scenarios

Transaction data on the blockchain is not really typed. Arguments, storage, logs, etc. - they are all untyped at blockchain level. The types are only added by developers when writing contracts, to avoid bugs and make them safer to use.

But this means that scenarios in their most general form are also untyped. This fits JSON well, which is also (mostly) untyped.

It clearly becomes tiring, as a developer, to only be able to work with untyped and un-annotated data. There are two ways to overcome this:
- Using a typed version of the scenarios. This is what we do when working with scenarios in Rust.
- Using a specialized language to make values easier to read by developers.

These are the scenario value expressions, and they help us better express numbers, addresses, or even more complex data. Note that this does not add any type checks, it is a purely cosmetic affair. The format is detailed [here](/developers/testing/scenario/values-simple) and [here](/developers/testing/scenario/values-complex).









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

