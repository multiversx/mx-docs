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

## Installing Rust and sc-meta

[comment]: # (mx-context-auto)

:::note
`sc-meta` is universal smart contract management tool. Please follow [this](/developers/meta/sc-meta) for more information.
:::

### With mxpy

```bash
mxpy deps install rust --overwrite
```

:::note
In addition to Rust and `sc-meta`, the above command also installs `twiggy` and `wasm-opt`.
:::

For more information, go to [managing dependencies using `mxpy`](/sdk-and-tools/sdk-py/mxpy-cli/#managing-dependencies).

[comment]: # (mx-context-auto)

### Without mxpy

As recommended on [rust-lang.org](https://www.rust-lang.org/tools/install):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Then, choose **Proceed with installation (default)**. 

Once Rust is installed, switch to a nightly version and install the `wasm32-unknown-unknown` target:

```bash
rustup default nightly-2023-12-11
rustup target add wasm32-unknown-unknown
```

Afterwards, install `sc-meta`:

```bash
cargo install multiversx-sc-meta --locked
```

Optionally, you may also want to install `wasm-opt` and `twiggy`:

```bash
cargo install wasm-opt
cargo install twiggy
```

[comment]: # (mx-context-auto)

### Without mxpy (CI / CD)

For CI / CD, use the following:

```bash
wget -O rustup.sh https://sh.rustup.rs && \
    chmod +x rustup.sh && \
    ./rustup.sh --verbose --default-toolchain nightly-2023-12-11 --target wasm32-unknown-unknown -y

cargo install multiversx-sc-meta --locked
```

[comment]: # (mx-context-auto)

### Handle missing dependencies of sc-meta

`sc-meta` requires a few dependencies that are not installed by default on some systems. In this case, installation of `sc-meta` fails.

For a workaround, please follow this [GitHub issue](https://github.com/multiversx/mx-sdk-py-cli/issues/338).

## Check your Rust installation

You can check your Rust installation by invoking `rustup show`:

```
$ rustup show

Default host: x86_64-unknown-linux-gnu
rustup home:  /home/ubuntu/.rustup

installed toolchains
--------------------

[...]
nightly-2023-12-11-x86_64-unknown-linux-gnu (default)

installed targets for active toolchain
--------------------------------------

[...]
wasm32-unknown-unknown


active toolchain
----------------

[...]
nightly-2023-12-11-x86_64-unknown-linux-gnu (default)
```

You can also check the status of your Rust installation using `mxpy`:

```
$ mxpy deps check rust

INFO     cli.deps: Checking dependency: module = rust, tag = nightly-2023-12-11
INFO     modules: which rustc: /home/ubuntu/.cargo/bin/rustc
INFO     modules: which cargo: /home/ubuntu/.cargo/bin/cargo
INFO     modules: which sc-meta: /home/ubuntu/.cargo/bin/sc-meta  
INFO     modules: which wasm-opt: /home/ubuntu/.cargo/bin/wasm-opt
INFO     modules: which twiggy: /home/ubuntu/.cargo/bin/twiggy
INFO     cli.deps: [rust nightly-2023-12-11] is installed.
```
