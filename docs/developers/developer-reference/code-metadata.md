---
id: code-metadata
title: Code Metadata
---

## Introduction

Code metadata are flags representing the smart contract's allowed actions after deploy, specifically:
- `upgradeable` - if the contract can be upgraded in the future
- `readable` - if the contract's storage can be read by other contracts
- `payable` - if the contract can receive funds without having any endpoint called (just like user accounts). Note: A contract does NOT have to be payable to receive funds in payable endpoints.
- `payable by smart contracts` - just like the `payable` flag, but can only receive funds from other smart contracts. User transfers will be rejected.

## Usability

By default, all contracts are `upgradeable`, `readable` and non-`payable`. This can be overwritten with the following `erdpy contract deploy` flags:
- `metadata-not-upgradeable` - set `upgradeable` to `false`
- `metadata-payable` - set `payable` to `true`

Note: There are currently no erdpy flags for `readable` and `payable by smart contracts`, but they will be added in the future.  

If the contract is `upgradeable`, the flags can also be overwritten at the time of upgrading.

## Converting Metadata to bytes

Internally, the metadata is stored as a 2-byte wide bit-flag. For easier visualization, let's define the flags like this:
```rust
bitflags! {
    struct CodeMetadata: u16 {
		const UPGRADEABLE = 0b0000_0001_0000_0000; // LSB of first byte
		const READABLE = 0b0000_0100_0000_0000; // 3rd LSB of first byte
		const PAYABLE = 0b0000_0000_0000_0010; // 2nd LSB of second byte
		const PAYABLE_BY_SC = 0b0000_0000_0000_0100; // 3rd LSB of second byte
    }
}
```

Alternatively, if you prefer hex over binary:
```rust
const UPGRADEABLE: u16 = 0x01_00;
const READABLE: u16 = 0x04_00;
const PAYABLE: u16 = 0x00_02;
const PAYABLE_BY_SC = 0x00_04;
```

For example, if we wish to deploy a contract that is payable and upgradeable our metadata would be `0x0102`.

## Conclusion

We hope these flags will make it a lot easier to create and upgrade smart contracts.  

If you want to take a look at some more examples of how Code Metadata is used, take a look here: https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/examples  
