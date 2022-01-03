---
id: overview
title: Mandos Overview
---

Rationale, description and functionality of Mandos JSON tests

## **Who is Mandos?**

According to the Lord of the Rings wiki: «[**Mandos**](https://lotr.fandom.com/wiki/Mandos) ("Prison-Fortress") was an [Ainu](https://lotr.fandom.com/wiki/Ainu), one of the [Aratar](https://lotr.fandom.com/wiki/Aratar), and a [Vala](https://lotr.fandom.com/wiki/Vala) who was responsible for the judgement of the Spirits (or [Fëa](https://lotr.fandom.com/wiki/Fëa)) of all Elven dead. He also had responsibility for pronouncing the dooms and judgments of [Eru Ilúvatar](https://lotr.fandom.com/wiki/Eru_Ilúvatar) under [Manwë](https://lotr.fandom.com/wiki/Manwë). His real name was **Námo** ("Ordainer" or "Judge") but was later known to the [Elves](https://lotr.fandom.com/wiki/Elves) as Mandos after his sacred [Halls of Mandos](https://lotr.fandom.com/wiki/Halls_of_Mandos), over which he presided, and where Elves would go when slain.» It is only fitting that Mandos is also the name of a framework for _judging_ smart contracts, especially since they are in many ways _immortal_ too.

## **Rationale**

During smart contract development, it is important for the developer to have the capacity to write unit and integration tests easily.

Short unit tests can use the language and tools the contract is written with, but to test the contract in a realistic scenario we need at least a blockchain mock and some way to specify execution scenarios.

Mandos is suitable for both short tests that check how a transaction changes the storage, and for long and complex scenarios.

The fact that it is expressed in a descriptive language like JSON makes it agnostic to the language in which the smart contract is developed.

## **Running the tests**

At the moment of writing this document, Mandos tests can be launched directly from the Elrond VSCode extension, from contextual menus.

## **Mandos-go vs. Mandos-rs**

There are currently 2 implementations of the Mandos specifications.

1. Mandos-go is part of Elrond VM, it is integrated with the VM fully and runs actual smart contract code. This is the most up-to-date version of the two.

2. Mandos-rs is an implementation that is integrated into the `elrond-wasm` Rust smart contract framework. It mocks everything, including the VM and the WebAssembly engine. It is useful for debugging smart contracts and for generating high-level coverage for contracts. Mandos-rs is not yet fully featured, parts of the ESDT specification are not yet implemented, as well as some of the contract-to-contract calls.

Developers are expected to only write the Mandos tests once, but they can run them on both systems, as needed. It is important to have the tests running with mandos-go. Running them with mandos-rs too is convenient, but not critical.

## **Test file extension**

Mandos scenario files should end in `.scen.json`, where "scen" comes from "scenario". The framework uses the double extension to identify tests to attempt running. Any other extension will be ignored.

On a side note, there is also an older format that is now deprecated, where test file names end in `.test.json`, but you shouldn't worry about it.
