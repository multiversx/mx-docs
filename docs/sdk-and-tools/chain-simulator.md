---
id: chain-simulator
title: Chain simulator
---

[comment]: # (mx-context-auto)

## Overview

Chain simulator is a binary that provides all the `mx-chain-proxy-go` endpoints and includes additional endpoints 
for specific operations.

[comment]: # (mx-context-auto)

## Architectural Overview

This simulator is designed to replicate the behavior of a local testnet. Unlike a traditional testnet, this simulator
operates without a consensus group, allowing for isolated testing and development.

This simulator is designed to replicate the behavior of a local testnet. Unlike a traditional testnet, this simulator
operates without a consensus group, allowing for isolated testing and development.

[comment]: # (mx-context-auto)

## Features

- Implements all `mx-chain-proxy-go` endpoints.
- Extra endpoints for specific operations.
- Simulates the behavior of a local testnet without a consensus group.

The GitHub repository for the chain simulator and more information
about how to use can be found [HERE](https://github.com/multiversx/mx-chain-simulator-go).
