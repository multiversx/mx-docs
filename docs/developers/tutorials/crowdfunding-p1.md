---
id: crowdfunding-p1
title: Building a Crowdfunding Smart Contract
---
[comment]: # (mx-abstract)
Write, build and deploy a simple smart contract written in Rust.

This tutorial will guide you through the process of writing, building and deploying a simple smart contract for the MultiversX Network, written in Rust.

:::important
The MultiversX Network supports smart contracts written in any programming language compiled into WebAssembly.
:::

[comment]: # (mx-context-auto)

## Scenario

Let's say you need to raise EGLD for a cause you believe in. They will obviously be well spent, but you need to get the EGLD first. For this reason, you decided to run a crowdfunding campaign on the MultiversX Network, which naturally means that you will use a smart contract for the campaign. This tutorial will teach you how to do just that: **write a crowdfunding smart contract, deploy it, and use it**.

The idea is simple: the smart contract will accept transfers until a deadline is reached, tracking all contributors.

If the deadline is reached and the smart contract has gathered an amount of EGLD above the desired funds, then the smart contract will consider the crowdfunding a success, and it will consequently send all the EGLD to a predetermined account (yours!).

However, if the donations fall short of the target, the contract will return all the all EGLD tokens to the donors.

[comment]: # (mx-context-auto)

## Design

Here is how the smart contract methods are designed:

- `init`: automatically triggered when the contract is deployed. It takes two inputs from you:
  1. The target amount of EGLD you want to raise;
  2. The crowdfunding deadline, which is expressed as a block nonce.
- `fund`: used by donors to contribute EGLD to the campaign. It will receive EGLD and save the necessary details so the contract can return funds if the campaign doesn't reach its goal;
- `claim`: if called before the deadline, it does nothing and returns an error. If called after the deadline:
  - By you (the campaign creator), it sends all the raised EGLDs to your account if the target amount is met. Otherwise, it returns an error;
  - By donor, it refunds their contribution if the target amount is not reached. If the target is met, it does nothing and returns an error;
  - By anyone else, it does nothing and returns an error.
- `status`: Provides information about the campaign, such as whether it is still active or completed and how much EGLD has been raised so far. You will likely use this frequently to monitor progress.

In this part of the tutorial, we will start with the `init` method to familiarize you with the development process and tools. You will not only implement the init method but also **tests** to ensure it works as expected.

:::important testing
Automated testing is exceptionally important for the development of smart contracts, due to the sensitive nature of the information they must handle.
:::

[comment]: # (mx-context-auto)

## Prerequisites

:::important
Before starting this tutorial, make sure you have the following:

- `stable` **Rust** version `≥ 1.85.0` (install via [rustup](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta))
- `sc-meta` (install [multiversx-sc-meta](/docs/developers/meta/sc-meta-cli.md))

:::

For contract developers, we generally recommend [**VSCode**](https://code.visualstudio.com) with the following extensions:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb)

[comment]: # (mx-context-auto)

## Step 1: prepare the workspace

The source code of each smart contract requires its own folder. We will start the development of the **crowdfunding** contract from the **empty** template. To get the development environment ready, simply run the following commands in your terminal:

```bash
sc-meta new --name crowdfunding --template empty
```

You may choose any location you want for your smart contract. Either way, now that you are in the `crowdfunding` folder we can begin.

[sc-meta](/docs/developers/meta/sc-meta.md) created your project out of a template. These templates are contracts written and tested by MultiversX, which can be used by anybody as starting points.

```toml title=Cargo.toml
[package]
name = "crowdfunding"
version = "0.0.0"
publish = false
edition = "2024"
authors = ["you"]

[lib]
path = "src/crowdfunding.rs"

[dependencies.multiversx-sc]
version = "0.64.1"

[dev-dependencies.multiversx-sc-scenario]
version = "0.64.1"

[workspace]
members = [
    ".",
    "meta",
]
```

Let's inspect the file found at path `crowdfunding/Cargo.toml`:

- `[package]` represents the **project** which is unsurprisingly named `crowdfunding`, and has version `0.0.0`. You can set any version you like, just make sure it has 3 numbers separated by dots. It is a requirement. The `publish` is set to **false** to prevent the package from being published to Rust’s central package registry. It's useful for private or experimental projects;
- `[lib]` declares the source code of the smart contracts, which in our case is `src/crowdfunding.rs`. You can name this file anything you want. The default Rust naming is `lib.rs`, but it can be easier to organize your code when the main code files bear the names of the contracts;
- This project has `dependencies` and `dev-dependencies`. You'll need a few special and very helpful packages:
  - `multiversx-sc`: developed by MultiversX, it is the interface that the smart contract sees and can use;
  - `multiversx-sc-scenario`: developed by MultiversX, it is the interface that defines and runs blockchain scenarios involving smart contracts;
  - `num-bigint`: for working with arbitrarily large integers.
- `[workspace]` is a group of related Rust projects that share common dependencies or build settings;
- The resulting binary will be the name of the project, which in our case is `crowdfunding` (actually, `crowdfunding.wasm`, but the compiler will add the `.wasm` part).

[comment]: # (mx-context-auto)

## Step 2: develop

With the structure in place, you can now write the code and build it.

Open `src/crowdfunding.rs`:

```rust
#![no_std]                      //  [1]

use multiversx_sc::imports::*;  //  [2]
#[allow(unused_imports)]        //  [3]

/// An empty contract. To be used as a template when starting a new contract from scratch.
#[multiversx_sc::contract]      //  [4]
pub trait Crowdfunding {        //  [5]
    #[init]                     //  [6]
    fn init(&self) {}           //  [7]

    #[upgrade]                  //  [8]
    fn upgrade(&self) {}        //  [9]
}
```

Let's take a look at the code:

- **[1]**: means that the smart contract **has no access to standard libraries**. That will make the code lean and very light.
- **[2]**: brings imports module from the [multiversx_sc](https://crates.io/crates/multiversx-sc) crate into **Crowdfunding** contract. It effectively grants you access to the [MultiversX framework for Rust smart contracts](https://github.com/multiversx/mx-sdk-rs), which is designed to simplify the code **enormously**.
- **[3]**: since the contract is still in an early stage of development, clippy (Rust's linter) will flag some imports as unused. For now, we will ignore this kind of error.
- **[4]**: processes the **Crowdfunding** trait definition as a **smart contract** that can be deployed on the MultiversX blockchain.
- **[5]**: the contract [trait](https://doc.rust-lang.org/book/ch10-02-traits.html) where all the endpoints will be developed.
- **[6]**: marks the following method (`init`) as the constructor function for the contract.
- **[7]**: this is the constructor itself. It receives the contract's instance as a parameter (_&self_). The method is called once the contract is deployed on the MultiversX blockchain. You can name it any way you wish, but it must be annotated with `#[init]`. For the moment, no initialization logic is defined.
- **[8]**: marks the following method (`upgrade`) as the upgrade function for the contract. It is called when the contract is re-deployed to the same address.
- **[9]**: this is the upgrade method itself. Similar to [7], it takes a reference to the contract instance (_&self_) and performs no specific logic here.

[comment]: # (mx-context-auto)

## Step 3: build

Now go back to the terminal, make sure the current folder is the one containing the Crowdfunding smart contract (`crowdfunding/`), then trigger the **build** command:

```bash
sc-meta all build
```

If this is the first time you build a Rust smart contract with the `sc-meta` command, it will take a little while before it's done. Subsequent builds will be much faster.

When the command completes, a new folder will appear: `crowdfunding/output/`. This folder contains:

1. `crowdfunding.abi.json`
2. `crowdfunding.imports.json`
3. `crowdfunding.mxsc.json`
4. `crowdfunding.wasm`

We won't be doing anything with these files just yet - wait until we get to the deployment part. Along with `crowdfunding/output/`, there are a few other folders and files generated. You can safely ignore them for now, but do not delete the `/crowdfunding/wasm/` folder - it's what makes the build command faster after the initial run.

The following can be safely deleted, as they are not important for this contract:

- The `scenarios/` folder;
- The `crowdfunding/tests/crowdfunding_scenario_go_test.rs` file;
- The `crowdfunding/tests/crowdfunding_scenario_rs_test.rs` file.

The structure of your folder should be like this (output printed using command `tree -L 2`):

```bash
.
├── Cargo.lock
├── Cargo.toml
├── meta
│   ├── Cargo.toml
│   └── src
├── multiversx.json
├── output
│   ├── crowdfunding.abi.json
│   ├── crowdfunding.imports.json
│   ├── crowdfunding.mxsc.json
│   └── crowdfunding.wasm
├── src
│   └── crowdfunding.rs
├── target
│   ├── CACHEDIR.TAG
│   ├── debug
│   ├── release
│   ├── tmp
│   └── wasm32-unknown-unknown
├── tests
└── wasm
    ├── Cargo.lock
    ├── Cargo.toml
    └── src
```

It's time to add some functionality to the `init` function now.

[comment]: # (mx-context-auto)

## Step 4: persisting values

In this step, you will use the `init` method to persist some values in the storage of the Crowdfunding smart contract.

[comment]: # (mx-context-auto)

### Storage mappers

Every smart contract can store key-value pairs in a persistent structure, created for the smart contract at its deployment on the MultiversX Network.

The storage of a smart contract is, for all intents and purposes, **a generic hash map or dictionary**. When you want to store some arbitrary value, you store it under a specific key. To get the value back, you need to know the key you stored it under.

To help you keep the code clean, the framework enables you to write **setter** and **getter** methods for individual key-value pairs. There are several ways to interact with storage from a contract, but the simplest one is by using [**storage mappers**](/docs/developers/developer-reference/storage-mappers.md).

Next, you will declare a [_SingleValueMapper_](/docs/developers/developer-reference/storage-mappers.md#singlevaluemapper) that has the purpose of storing a [_BigUint_](/docs/developers/best-practices/biguint-operations.md) number. This storage mapper is dedicated to storing/retrieving the value stored under the key `target`:

```rust
#[storage_mapper("target")]
fn target(&self) -> SingleValueMapper<BigUint>;
```

:::important
`BigUint` **type** is a big unsigned number, handled by the VM. There is no need to import any library, big number arithmetic is provided for all contracts out of the box.
:::

Normally, smart contract developers are used to dealing with raw bytes when storing or loading values from storage. The MultiversX framework for Rust smart contracts makes it far easier to manage the storage because it can handle typed values automatically.

[comment]: # (mx-context-auto)

### Extend init

You will now instruct the `init` method to store the amount of tokens that should be gathered upon deployment.

The owner of a smart contract is the account that deployed it (you). By design, your Crowdfunding smart contract will send all the donated EGLD to its owner (you), assuming the target amount was reached. Nobody else has this privilege, because there is only one single owner of any given smart contract.

Here's how the `init` method looks, with the code that saves the target:

```Rust
#[init]
fn init(&self, target: BigUint) {
    self.target().set(&target);
}
```

We have added an argument to the constructor method. It is called `target` and will need to be supplied when we deploy the contract. The argument then promptly gets saved to storage.

Now note the `self.target()` invocation. This gives us an object that acts like a proxy for a part of the storage. Calling the `.set()` method on it causes the value to be saved to the contract storage.

:::important
All of the stored values end up in the storage if the transaction completes successfully. Smart contracts cannot access the protocol directly, it is the VM that intermediates everything.
:::

Whenever you want to make sure your code is in order, run the build command:

```bash
sc-meta all build
```

There's one more thing: by default, none of the `fn` statements declare smart contract methods that are _externally callable_. All the data in the contract is publicly available, but it can be cumbersome to search through the contract storage manually. That is why it is often nice to make getters public, so people can call them to get specific data out.

Public methods are annotated with either `#[endpoint]` or `#[view]`. There is currently no difference in functionality between them (but there might be at some point in the future). Semantically, `#[view]` indicates readonly methods, while `#[endpoint]` suggests that the method also changes the contract state.

```rust
  #[view]
  #[storage_mapper("target")]
  fn target(&self) -> SingleValueMapper<BigUint>;
```

You can also think of `#[init]` as a special type of endpoint.

[comment]: # (mx-context-auto)

## Step 5: testing

You must always make sure that the code you write functions as intended. That's what **automated testing** is for.

For now, this is how your contract looks:

```rust
#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;

#[multiversx_sc::contract]
pub trait Crowdfunding {
    #[init]
    fn init(&self, target: BigUint) {
        self.target().set(&target);
    }

    #[upgrade]
    fn upgrade(&self) {}

    #[view]
    #[storage_mapper("target")]
    fn target(&self) -> SingleValueMapper<BigUint>;
}
```

There are several ways to write [smart contract tests in Rust](/docs/developers/testing/rust/sc-test-overview.md). Now, we will focus on developing a test using [black-box calls](/docs/developers/testing/rust/sc-blackbox-calls.md).

:::important
Blackbox tests execution imitates the blockchain with no access to private contract functions.
:::

Let's write a test against the `init` method to make sure that it definitely stores the address of the owner under the `target` key at deployment.

[comment]: # (mx-context-auto)

### Set up

In the folder of the Crowdfunding smart contract, there is a folder called `tests/`. Inside it, create a new Rust file called `crowdfunding_blackbox_test.rs`.

Your folder should look like this (output from the command `tree -L 2`):

```bash
.
├── Cargo.lock
├── Cargo.toml
├── meta
│   ├── Cargo.toml
│   └── src
├── multiversx.json
├── output
│   ├── crowdfunding.abi.json
│   ├── crowdfunding.imports.json
│   ├── crowdfunding.mxsc.json
│   └── crowdfunding.wasm
├── src
│   └── crowdfunding.rs
├── target
│   ├── CACHEDIR.TAG
│   ├── debug
│   ├── release
│   ├── tmp
│   └── wasm32-unknown-unknown
├── tests
│   └── crowdfunding_blackbox_test.rs
└── wasm
    ├── Cargo.lock
    ├── Cargo.toml
    └── src
```

Before creating the first test, we need to [set up the environment](/docs/developers/testing/rust/sc-test-setup.md). We will:

1. Generate the smart contract's proxy;
2. Register the contract;
3. Set up accounts.

[comment]: # (mx-context-auto)

### Generate Proxy

A smart contract's [proxy](/docs/developers/transactions/tx-proxies.md) is an object that mimics the contract. We will use the proxy to call the endpoints of the Crowdfunding contracts.

The proxy contains entirely autogenerated code. However, before running the command to generate the proxy, we need to set up a configuration file.

In the root of the contract, at the path `crowdfunding/`, we will create the configuration file `sc-config.toml`, where we will specify the path to generate the proxy:

```toml title=sc-config.toml
[settings]

[[proxy]]
path = "src/crowdfunding_proxy.rs"
```

In the terminal, in the root of the contract, we will run the next command that will generate the proxy for the Crowdfunding smart contract:

```bash
sc-meta all proxy
```

Once the proxy is generated, our work is not over yet. The next thing to do is to import the module in the Crowdfunding smart contract's code:

```rust
#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;

pub mod crowdfunding_proxy;

#[multiversx_sc::contract]
pub trait Crowdfunding {
    // Here is the implementation of the crowdfunding contract
}
```

With each build of the contract executed by the developer, the proxy will be automatically updated with the changes made to the contract.

[comment]: # (mx-context-auto)

### Register

The Rust backend does not run compiled contracts, instead, it hooks the actual Rust contract code to its engine. You can find more [here](/docs/developers/testing/rust/sc-test-setup.md#registering-contracts).

In order to link the smart contract code to the test you are developing, you need to call `register_contract()` in the setup function of the blackbox test.

```rust
use crowdfunding::crowdfunding_proxy;
use multiversx_sc_scenario::imports::*;

const CODE_PATH: MxscPath = MxscPath::new("output/crowdfunding.mxsc.json");

fn world() -> ScenarioWorld {
    let mut blockchain = ScenarioWorld::new();

    blockchain.set_current_dir_from_workspace("crowdfunding");
    blockchain.register_contract(CODE_PATH, crowdfunding::ContractBuilder);
    blockchain
}
```

### Account

The environment you're working in is a mocked blockchain. This means you have to create and manage accounts, allowing you to test and verify the behavior of your functions without deploying to a real blockchain.

Here's an example to get started in `crowdfunding_blackbox_test.rs`:

```rust
const OWNER: TestAddress = TestAddress::new("owner");

#[test]
fn crowdfunding_deploy_test() {
    let mut world = world();

    world.account(OWNER).nonce(0).balance(1000000);
}
```

In the snippet above, we've added only one account to the fictional universe of Crowdfunding smart contract. It is an account with the address `owner`, which the testing environment will use to pretend it's you. Note that in this fictional universe, your account nonce is `0` (meaning you've never used this account yet) and your `balance` is `1,000,000`.

:::important
No transaction can start if that account does not exist in the mocked blockchain. More explanations can be found [here](/docs/developers/testing/rust/sc-test-setup.md#setting-accounts).
:::

### Deploy

The purpose of the account created previously is to act as the owner of the Crowdfunding smart contract. To make this happen, the **OWNER** constant will serve as the transaction **sender**.

```rust
const CROWDFUNDING_ADDRESS: TestSCAddress = TestSCAddress::new("crowdfunding");

#[test]
fn crowdfunding_deploy_test() {
    /*
        Set up account
    */

    let crowdfunding_address = world
        .tx()
        .from(OWNER)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .init(500_000_000_000u64)
        .code(CODE_PATH)
        .new_address(CROWDFUNDING_ADDRESS)
        .returns(ReturnsNewAddress)
        .run();
}
```

The transaction above is a deploy call that stores in `target` value `500,000,000,000`. It was fictionally submitted by "you", using your account with the address `owner`.

`.new_address(CROWDFUNDING_ADDRESS)` marks that the address of the deployed contracts will be the value stored in the **CROWDFUNDING_ADDRESS** constant.

`.code(CODE_PATH)` explicitly sets the deployment Crowdfunding's code source as bytes.

:::note
Deploy calls are specified by the code source. You can find more details about what data needs a transaction [here](/docs/developers/transactions/tx-data.md).
:::

:::important
Remember to run `sc-meta all build` before running the test, especially if you made recent changes to the smart contract source code! Code source will be read directly from the file you specify through the **MxscPath** constant, without rebuilding it automatically.
:::

### Checks

What's the purpose of testing if we do not validate the behavior of the entities interacting with the blockchain? Let's take the next step by enhancing the `crowdfunding_deploy_test()` function to include verification operations.

Once the deployment is executed, we will verify if:

- The **contract address** is **CROWDFUNDING_ADDRESS**;
- The **owner** has no less EGLD than the value with which it was initialized: `1,000,000`;
- `target` contains the value set at deployment: `500,000,000,000`.

```rust
#[test]
fn crowdfunding_deploy_test() {
    /*
        Set up account
        Deploy
    */

    assert_eq!(crowdfunding_address, CROWDFUNDING_ADDRESS.to_address());

    world.check_account(OWNER).balance(1_000_000);

    world
        .query()
        .to(CROWDFUNDING_ADDRESS)
        .typed(crowdfunding_proxy::CrowdfundingProxy)
        .target()
        .returns(ExpectValue(500_000_000_000u64))
        .run();
}
```

Notice that there are two accounts now, not just one. There's evidently the account `owner` and the new account `crowdfunding`, as a result of the deployment transaction.

:::important
Smart contracts _are_ accounts in the MultiversX Network, accounts with associated code, which can be executed when transactions are sent to them.
:::

The **owner's balance** remains unchanged - the deployment transaction did not cost anything, because the gas price is set to `0` in the **testing environment**.

:::note
The `.check_account(OWNER)` method verifies whether an account exists at the specified address and checks its ownership details.  Details available [here](/docs/developers/testing/rust/sc-blackbox-example.md#check-accounts).
:::

:::note
The `.query()` method is used to interact with the smart contract's view functions via the proxy, retrieving information without modifying the blockchain state.

There is no caller, no payment, and gas price/gas limit. On the real blockchain, a smart contract query does not create a transaction on the blockchain, so no account is needed. Details available [here](/docs/developers/testing/rust/sc-blackbox-calls.md#query).
:::

## Run test

Do you want to try it out first? Go ahead and issue this command on your terminal at path `/crowdfunding`:

```bash
cargo test
```

If everything went well, you should see the following being printed:

```rust
running 1 test
test crowdfunding_deploy_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.05s
```

You need to understand the contents of this blackbox test - again, the importance of testing your smart contracts cannot be overstated.

[comment]: # (mx-context-auto)

## Next up

The tutorial will continue with defining of the `fund`, `claim` and `status` function, and will guide you through writing [blackbox tests](/docs/developers//testing/rust/sc-blackbox-calls.md) for them.
