---
id: chain-simulator
title: Chain simulator
---

[comment]: # (mx-context-auto)

## Overview

Chain simulator is a piece of software that provides all the `mx-chain-proxy-go` endpoints and includes additional endpoints 
for specific operations.

Instead of setting up a local testnet with a proxy and nodes, using chain simulator is a simpler option.
It mimics the behavior of a local testnet, making it easier to test smart contracts in a simulated environment.

The chain simulator offers faster testing since it eliminates the need for consensus, allowing blocks to be generated 
in milliseconds rather than the typical 6-second intervals on a local testnet.

The chain simulator provides new endpoints that allow developers to replicate the state of a contract from the mainnet to the simulator.
This enables testing with the same state as on the mainnet, facilitating more accurate and realistic development scenarios.

[comment]: # (mx-context-auto)

## Architectural Overview

![img](/technology/chainsimulator.png)

This simulator is designed to replicate the behavior of a local testnet. Unlike a traditional testnet, this simulator
operates without a consensus group, allowing for isolated testing and development.


[comment]: # (mx-context-auto)

## Features

- Implements all `mx-chain-proxy-go` endpoints.
- Extra endpoints for specific operations.
- Simulates the behavior of a local testnet without a consensus group.

The GitHub repository for the chain simulator and more information
about how to use can be found [here](https://github.com/multiversx/mx-chain-simulator-go).
