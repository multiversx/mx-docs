---
id: ide-setup
title: Fix IDEs configuration
---

[comment]: # (mx-abstract)

The issues tackled on this page are related to IDEs preferred by MultiversX builders, such as **VSCode** or **RustRover**.

[comment]: # (mx-context-auto)

## VSCode: fix configuration for Rust Analyzer

If `rust-analyzer` is not working properly on VSCode, you might see (one of) the following error messages:

```
 - rust-analyzer failed to load workspace: Failed to load the project.
 - Failed to query rust toolchain version.
 - error: rustup could not choose a version of cargo to run, because one wasn't specified explicitly, and no default is configured.
```

If so, **[make sure Rust is properly installed](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta)**.

Then, restart VSCode. Now, `rust-analyzer` should work properly. If the problem persists, please [contact us](/developers/overview).
