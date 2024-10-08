---
id: rust-setup
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

[comment]: # (mx-context-auto)

## Installing Rust and sc-meta

:::note
`sc-meta` is universal smart contract management tool. Please follow [this](/developers/meta/sc-meta) for more information.
:::

[comment]: # (mx-context-auto)

On Ubuntu (or Windows with WSL), you might need to install the following dependencies of Rust and `sc-meta` first:
    
```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

Install Rust as recommended on [rust-lang.org](https://www.rust-lang.org/tools/install):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then, choose **Proceed with installation (default)**. 

:::tip
Generally speaking, you should install Rust `v1.78.0` (stable channel) or later, or `nightly-2024-05-22` (nightly channel) or later.
:::

```bash
rustup update
rustup default stable
```

Afterwards, open a new terminal (shell) and install `sc-meta`:

```bash
cargo install multiversx-sc-meta --locked
```

Once `sc-meta` is ready, install the `wasm32` target (for the Rust compiler), `wasm-opt`, and others dependencies as follows:

```bash
# Installs `wasm32`, `wasm-opt`, and others in one go:
sc-meta install all

cargo install twiggy
```

[comment]: # (mx-context-auto)

### Within CI / CD

On Ubuntu (or Windows with WSL), you might need to install the following dependencies of Rust and `sc-meta` first:
    
```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

For CI / CD, install Rust as follows:

```bash
wget -O rustup.sh https://sh.rustup.rs && \
    chmod +x rustup.sh && \
    ./rustup.sh --verbose --default-toolchain stable --target wasm32-unknown-unknown -y

cargo install multiversx-sc-meta --locked
```

[comment]: # (mx-context-auto)

### Handle missing dependencies

On Ubuntu (or Windows with WSL), you might need to install the following dependencies of Rust and `sc-meta` before installing Rust:
    
```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

Also see this [GitHub issue](https://github.com/multiversx/mx-sdk-py-cli/issues/338).

[comment]: # (mx-context-auto)

## Check your Rust installation

You can check your Rust installation by invoking `rustup show`:

```
$ rustup show

Default host: x86_64-unknown-linux-gnu
rustup home:  /home/ubuntu/.rustup

installed toolchains
--------------------

[...]
stable-x86_64-unknown-linux-gnu (default)

installed targets for active toolchain
--------------------------------------

[...]
wasm32-unknown-unknown

active toolchain
----------------

[...]
stable-x86_64-unknown-linux-gnu (default)
```
