# Interoperability and Modular Design

Sovereign Chains are designed to serve as an interoperability layer between different ecosystems. Ecosystem partners and builders have the opportunity to create a set of components that can be activated or deactivated based on the specific needs of a particular Sovereign Chain. But how will sovereign chains achieve that?

## Virtual Machine Structure

SpaceVM has two parts, developed in GO and Rust:

**1. One part handles**:
- OPCODES
- State management
- Transfers
    
**2. The other part functions as the executor.**

Starting from the address model, multiple VMs are enabled to run within the system. There is a clear implementation of how these VMs can call each other independently, facilitated by the blockchainHook. TODO: add information about the implementation.

## Modular Design and Multi-VM Capabilities

The basic idea is to utilize the modular design and multi-VM capabilities to create direct connections to existing technologies from the market.

### Ethereum L2

### Bitcoin L2

### Solana L2
