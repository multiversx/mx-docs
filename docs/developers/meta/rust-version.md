---
id: rust-version
title: Rust Version
---

[comment]: # (mx-abstract)

## Required Rust version

Starting with framework version [v0.50.0](https://crates.io/crates/multiversx-sc/0.50.0), MultiversX smart contracts can be built using stable Rust.

Before this version, nightly Rust was required.

[comment]: # (mx-context-auto)

## Recommended compiler versions

For everything after v0.50.0 we recommend running the latest stable version of Rust. Older versions have had compatibility issues with certain framework dependencies, on certain versions of the compiler.

Also, everything on versions older than v0.50.0 needs to run on nightly Rust.

<table>
   <thead>
      <tr>
         <th>Application Version</th>
         <th>Required Rust Channel</th>
         <th>Version Requirements</th>
      </tr>
   </thead>
   <tbody class="table-center-content">
      <tr>
         <td>Prior to `v0.50`</td>
         <td>Nightly</td>
         <td>`nightly-2023-12-11` or `nightly-2024-05-22`</td>
      </tr>
      <tr>
         <td>`v0.50` to `v0.56`</td>
         <td>**Stable (recommended)** or Nightly</td>
         <td>≥`1.78` and ≤`1.86`</td>
      </tr>
      <tr>
         <td>`v0.57`</td>
         <td>**Stable (recommended)** or Nightly</td>
         <td>≥`1.83` and ≤`1.86`</td>
      </tr>
      <tr>
         <td>`v0.58` and Higher</td>
         <td>**Stable (recommended)** or Nightly</td>
         <td>≥`1.83`*</td>
      </tr>
   </tbody>
</table>

\* Starting with Rust version `1.89` and higher, there are known runtime issues when using **wasmer 6.0** (`wasmer-experimental`) exclusively on the **Linux platform**.

:::note
If you are using **wasmer 6.0** on Linux, we recommend pinning your Rust version below `1.89`.
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
