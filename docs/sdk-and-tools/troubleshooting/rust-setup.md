---
id: fix-rust-setup
title: Fix Rust installation
---

[comment]: # (mx-abstract)

When encountering issues with your Rust installation, we recommend a cleanup (uninstall) first, especially if you have multiple installations (by accident or on purpose).

[comment]: # (mx-context-auto)

## Uninstall existing Rust

If you've installed Rust using your OS package manager:

```bash
# Ubuntu
sudo apt remove cargo
sudo apt remove rustc
sudo apt autoremove
```

If you've installed Rust using `rustup`:

```bash
rustup self uninstall
```

If you've installed Rust using `brew`:

```bash
brew uninstall rust
```

:::note
We never recommend installing Rust using `brew`, especially because it makes it non-trivial to switch between different Rust versions.
:::

If you've installed Rust using `snap`:

```bash
snap remove rustup
```

If you've installed Rust using `mxpy` with a version older than `v9`:

```bash
rm -rf ~/multiversx-sdk/vendor-rust
```

If you've installed Rust using `mxpy v9` or later:

```bash
rustup self uninstall
```

## Reinstall Toolchain Setup

After successfully uninstalling your current toolchain, you can follow the [setup guide](/docs/developers/toolchain-setup.md) to reinstall the environment from scratch.
