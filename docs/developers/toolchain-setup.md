---
id: toolchain-setup
title: Toolchain Setup 
---

[comment]: # (mx-context-auto)

## Installing Rust and sc-meta

:::note
`sc-meta` is universal smart contract management tool. Please follow [this](/developers/meta/sc-meta) for more information.
:::

[comment]: # (mx-context-auto)

For systems running Ubuntu or Windows with WSL, you should first ensure the following system-level dependencies required by Rust and sc-meta are in place:

```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

Install Rust as recommended on [rust-lang.org](https://www.rust-lang.org/tools/install):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then, choose **Proceed with installation (default)**.

:::tip
Generally speaking, you should install Rust `v1.85.0` (stable channel) or later.
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

### Within Continuous Integration / Continuous Delivery

For automated environments like CI/CD pipelines, start by installing the necessary foundational libraries. On platforms such as Ubuntu (or WSL), this means installing:

```bash
sudo apt-get install build-essential pkg-config libssl-dev
```

For CI / CD, install Rust as follows:

```bash
wget -O rustup.sh https://sh.rustup.rs && \
    chmod +x rustup.sh && \
    ./rustup.sh --verbose --default-toolchain stable -y

cargo install multiversx-sc-meta --locked

sc-meta install wasm32
```

[comment]: # (mx-context-auto)

## Check your Rust installation

You can check your Rust installation by invoking `rustup show`:

```sh
$ rustup show

Default host: x86_64-unknown-linux-gnu
rustup home:  /home/ubuntu/.rustup

installed toolchains
--------------------
stable-x86_64-unknown-linux-gnu (default)
[...]

active toolchain
----------------
name: stable-x86_64-unknown-linux-gnu
installed targets:
  wasm32-unknown-unknown
  wasm32v1-none
  x86_64-unknown-linux-gnu
