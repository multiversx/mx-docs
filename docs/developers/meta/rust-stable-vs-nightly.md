---
id: rust-stable-vs-nightly
title: Stable vs. Nightly Rust
---

[comment]: # (mx-abstract)

## Required Rust version

Starting with framework version [v0.50.0](https://crates.io/crates/multiversx-sc/0.50.0), MultiversX smart contracts can be built using stable Rust.

Before this version, nightly Rust was required.

[comment]: # (mx-context-auto)

## Recommended compiler versions

For everything after v0.50.0 we recommend running the latest stable version of Rust. Older versions have had compatibility issues with certain framework dependencies, on certain versions of the compiler.

Also, everything on versions older than v0.50.0 needs to run on nightly Rust.

:::important

- For Versions Prior to `v0.50`:
  - **Requirement**: A specific nightly build is necessary.
  - **Known Working Builds**:`nightly-2023-12-11` and `nightly-2024-05-22` are confirmed to run correctly.
- For Versions `v0.50` through `v0.57`:
  - **Requirement**: The **stable channel** must be used, requiring a Rust version that is **greater than or equal** to `1.78` and **less than or equal** to `1.86`.
- For Version `v0.58` and Higher:
  - **Requirement**: The **stable channel** must be used, requiring a **minimum** Rust version of `1.78` or newer.

:::

[comment]: # (mx-context-auto)

## Why Nightly for the older versions?

There were several nightly features that the framework was using, which we had hoped to see stabilized sooner.

These are of little relevance to the average developer, but for the record, let's mention a few of them and how we managed to circumvent their usage:

- `never_type` - avoided by using slightly different syntax;
- `auto_traits` and `negative_impls` - avoided by redesigning the `CodecFrom`/`TypeAbiFrom` trait systems;
- `generic_const_exprs` - replaced with massive amounts of macros;
- `panic_info_message` - replaced by a different method to retrieve the panic message.

If any of these get stabilized in the future, we might revert the changes enacted in v0.50.0.

It is in any case our commitment to keep the framework compatible with stable Rust from here on, no matter what.
