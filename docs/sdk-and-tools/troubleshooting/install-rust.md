---
id: install-rust
title: How to install Rust
---

[comment]: # (mx-abstract)

When encountering issues with your Rust installation, we recommend a cleanup (uninstall) first, especially if you have multiple installations (by accident or on purpose).

[comment]: # (mx-context-auto)

## Uninstall existing Rust

If you've installed Rust using your OS package manager:

```bash
# Ubuntu
sudo apt remove cargo
sudo apt autoremove
```

If you've installed Rust using `rustup`:

```bash
rustup self uninstall
```

If you've installed Rust using `mxpy` with a version older than `v9`:

```bash
rm -rf ~/multiversx-sdk/vendor-rust
```

:::note
Since `mxpy v9` (November of 2023), `mxpy deps install rust` does not create an isolated Rust installation anymore in `~/multiversx-sdk/vendor-rust`. Instead, [it installs Rust _globally_](https://www.rust-lang.org/tools/install).
:::

If you've installed Rust using `mxpy v9` or later:

```bash
rustup self uninstall
```

[comment]: # (mx-context-auto)

## Installing Rust and `sc-meta`

[comment]: # (mx-context-auto)

### With `mxpy`

note, prior v9.

```
mxpy config set "dependencies.rust.resolution" "host"
```

[comment]: # (mx-context-auto)

### Without `mxpy`

As recommended on [rust-lang.org](https://www.rust-lang.org/tools/install):

```
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then,

```
source "$HOME/.cargo/env"

rustup default nightly-2023-05-26
rustup target add wasm32-unknown-unknown

cargo install multiversx-sc-meta
```

[comment]: # (mx-context-auto)

### Without `mxpy` (CI / CD)

For CI / CD, use the following:

```
wget -O rustup.sh https://sh.rustup.rs && \
    chmod +x rustup.sh && \
    ./rustup.sh --verbose --default-toolchain nightly-2023-05-26 --target wasm32-unknown-unknown -y

cargo install multiversx-sc-meta
```

[comment]: # (mx-context-auto)

### Missing `sc-meta` dependencies

https://github.com/multiversx/mx-sdk-py-cli/issues/338

Workaround: run sudo apt-get install pkg-config libssl-dev (on Ubuntu).
