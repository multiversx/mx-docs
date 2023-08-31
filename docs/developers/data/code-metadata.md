---
id: code-metadata
title: Code Metadata
---

[comment]: # (mx-abstract)

## Introduction

Code metadata are flags representing the smart contract's allowed actions after deploy, specifically:
- `upgradeable` - if the contract can be upgraded in the future
- `readable` - if the contract's storage can be read by other contracts
- `payable` - if the contract can receive funds without having any endpoint called (just like user accounts). Note: A contract does NOT have to be payable to receive funds in payable endpoints.
- `payable by smart contracts` - just like the `payable` flag, but can only receive funds from other smart contracts. User transfers will be rejected.

:::important
The code metadata **must be specified** at deploy-time and, if the contract is _upgradeable_, it **must be specified** at upgrade-time, as well.
:::

:::important
Once a contract is marked as _**not** upgradeable_, its code and code metadata become **immutable, forever**.
:::

[comment]: # (mx-context-auto)

## Usage

When deploying (or upgrading) a smart contract using **mxpy**, its default _code metadata flags_ are: `upgradeable`, `readable` and **non-**`payable`. The default values can be overwritten by decorating the command `mxpy contract deploy` (or `mxpy contract upgrade`) as follows:
- `--metadata-not-upgradeable` - mark the contract as **non-** `upgradeable`
- `--metadata-not-readable` - mark the contract as **non-** `readable`
- `--metadata-payable` - mark the contract as `payable`
- `--metadata-payable-by-sc` - mark the contract as `payable by smart contracts`

For more information, please follow [mxpy CLI](/sdk-and-tools/sdk-py/mxpy-cli).

[comment]: # (mx-context-auto)

## Bit-flag layout

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

[comment]: # (mx-context-auto)

## Conclusion

We hope these flags will make it a lot easier to create and upgrade smart contracts.  

If you want to take a look at some more examples of how Code Metadata is used, take a look here: https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples
