---
id: chain-simulator-adder
title: Chain Simulator in Adder - SpaceCraft interactors
---

[comment]: # (mx-abstract)

This tutorial will guide you to interact with **Chain Simulator** using the SpaceCraft interactors in _Adder_ smart contract. 

[comment]: # (mx-context-auto)

## Introduction

[Chain Simulator](../../sdk-and-tools/chain-simulator.md) mimics the functionality of a local blockchain test network. It offers a convenient, faster, and realistic way to test smart contracts. 

[SpaceCraft interactor](../meta/interactor/interactors-overview.md) allows testing any complex scenario defined in a smart contract using **Chain Simulator**. Rather than going through the full setup of a local testnet, you can get straight to developing and debugging in a streamlined environment. This tool handles the setup details so you can focus on what matters most: **building and testing your contracts**.

:::important
Before we dive in and explore how easy it can be, make sure you have the following:
- `stable` Rust version `≥ 1.78.0` (install via [rustup](https://docs.multiversx.com/sdk-and-tools/troubleshooting/rust-setup/#without-mxpy)): 
- `multiversx-sc-meta` version `≥ 0.54.0` (cargo install [multiversx-sc-meta](https://docs.multiversx.com/developers/meta/sc-meta-cli/#introduction))
:::

[comment]: # (mx-context-auto)

## Step 1: Start from the template

For this journey, let's start with the _Adder_ template as our base. You can quickly set it up using **sc-meta** to generate it:

```bash
sc-meta new --template adder --name my-adder
```

After running the command, you’ll see that the contract `my-adder` has been generated. The crate will include the following structure:

```bash
.
├── interact
├── meta
├── scenarios
├── src
├── target
├── tests
├── sc-config.toml
├── multiversx.json
├── README.md
├── Cargo.toml
└── Cargo.lock
```

[comment]: # (mx-context-auto)

## Step 2: What is inside the interactor

Our main focus will be the `interact` directory. Let’s take a closer look:

The directory that makes the connection with Chain Simulator contains the following structures: 

```bash
.
├── Cargo.toml
├── config.toml
└── src
    ├── basic_interact_cli.rs
    ├── basic_interact_config.rs
    ├── basic_interact_main.rs
    ├── basic_interact.rs
    └── basic_interact_state.rs

1 directory, 7 files
```

[comment]: # (mx-context-auto)

### Configuration

To configure your environment as a blockchain simulator, you need to edit the `config.toml` file and add the following lines:

```toml
chain_type = 'simulator'
gateway_uri = 'http://localhost:8085'
```

You can customize two settings in the configuration:
- **Type of blockchain**;
- **Gateway URI**.
  
To use a simulator for your blockchain, set `chain_type` as shown in the example above. 

By default, the simulator runs on `http://localhost:8085`. However, depending on your Docker image settings, the simulator's URI **might have a different port or name**.

:::important
Make sure to set both `chain_type` and `gateway_uri` for the interactor to work.
:::

The configuration is parsed by `basic_interact_config.rs`. This file contains **two** functions that will be important for interacting with Chain Simulator:
- `use_chain_simulator()`: returns if the chain type is real or simulator;
- `chain_simulator_config()`: initialize the proper configuration for simulator environment; this function is useful for **continuous integration tests**.

[comment]: # (mx-context-auto)

### Command Line Instructions

The `basic_interact_cli.rs` file contains all the commands you can use to interact with the simulator.

```rust
/// MyAdder Interact CLI Commands
#[derive(Clone, PartialEq, Eq, Debug, Subcommand)]
pub enum InteractCliCommand {
    #[command(name = "add", about = "Add value")]
    Add(AddArgs),
    #[command(name = "deploy", about = "Deploy contract")]
    Deploy,
    #[command(name = "feed", about = "Feed contract EGLD")]
    Feed,
    #[command(name = "multi-deploy", about = "Multiple deploy contracts")]
    MultiDeploy(MultiDeployArgs),
    #[command(name = "sum", about = "Print sum")]
    Sum,
    #[command(name = "upgrade", about = "Upgrade contract")]
    Upgrade(UpgradeArgs),
}
```

Let's break down what these commands do on Chain Simulator:

- `deploy`: uploads the contract to the blockchain;
- `multi-deploy`: deploys multiple instances of the _Adder_ contract at once;
- `upgrade`: upgrades the existing _Adder_ contract with a new version;
- `add`: executes a transaction that calls the `add` endpoint of the _Adder_ contract, essentially adding a value to it;
- `sum`: queries the contract's storage **getSum**;
- `feed`: adds a specific amount of EGLD to the _Adder_ contract. 

[comment]: # (mx-context-auto)

### State Management for Interactions

Module `basic_interact_state.rs` defines a State structure to help us keep track of our smart contract’s address. This information is saved in `state.toml` so even when you restart the interaction commands, it remembers the address you have set!

[comment]: # (mx-context-auto)

### Interaction transactions

The `basic_interact.rs` file is where you will find the functions triggered by each command you run from the command line. Each function represents either a **transaction** or a **query**. In the next sections, we will take a closer look at how these work!

[comment]: # (mx-context-auto)

## Step 3: Initializing an interactor

In the Chain Simulator, time moves much faster, but nothing happens on its own. Unlike a live blockchain, transactions aren't automatically added to blocks. Instead, you need to manually trigger actions to process transactions and generate blocks. But don’t worry—SpaceCraft takes care of this for you!

:::info
Each time you start the Chain Simulator, it creates a fresh, new blockchain from scratch. This means your account state starts empty, and the transaction blocks have no data initially.
:::

```rust
pub async fn init(config: Config) -> Self {
    let mut interactor =
        Interactor::new(config.gateway_uri(), config.use_chain_simulator()).await;

    interactor.set_current_dir_from_workspace("interact");

    let adder_owner_address = interactor.register_wallet(test_wallets::alice()).await;
    let wallet_address = interactor.register_wallet(test_wallets::mike()).await;

    // generate blocks until ESDTSystemSCAddress is enabled
    interactor.generate_blocks_until_epoch(1).await.unwrap();

    Self {
        interactor,
        adder_owner_address: adder_owner_address.into(),
        wallet_address: wallet_address.into(),
        state: State::load_state(),
    }
}
```

Let's find out what is mandatory for initializing the Chain Simulator interactor. 

```rust
let adder_owner_address = interactor.register_wallet(test_wallets::alice()).await;
```
Every time you initialize an interactor, you’ll need to register a wallet. When a wallet is registered in the Chain Simulator, its associated account is automatically credited with a generous amount of EGLD. This way, you don’t have to worry about running out of tokens while testing!

:::tip
The account has access to a substantial amount of EGLD when a wallet is registered, removing the need to worry about limited resources.
:::

:::important
Whenever the Chain Simulator stops, the account will be dissolved.
:::

```rust
interactor.generate_blocks_until_epoch(1).await.unwrap();
```
Node enables `ESDTSystemSCAddress` in **epoch number one**. If you want to use functionality like issuing or minting tokens, it is necessary to generate blocks until the simulator chain reaches **epoch number one**.

[comment]: # (mx-context-auto)

## Step 4: Create tests that run on Chain Simulator

One of the best parts about using the Chain Simulator with your interactor is that it lets you create **continuous integration tests in an environment that mirrors the real blockchain**. To set this up, start by creating a new directory in your interactor crate—let’s name it `tests` for clarity. This folder will hold all your test suites, where you’ll be able to verify your contract’s behaviour effectively.

```bash
.
├── Cargo.toml
├── config.toml
├── src
│   ├── basic_interact_cli.rs
│   ├── basic_interact_config.rs
│   ├── basic_interact_main.rs
│   ├── basic_interact.rs
│   └── basic_interact_state.rs
└── tests
    └── basic_interact_cs_test.rs
```

:::important
Before you start writing tests, ensure that your `Cargo.toml` file includes the `chain-simulator-tests` feature flag, which is necessary to run them.
:::

In the initial template generated in [Step 1](./chain-simulator-adder.md#step-1-start-from-template), you’ll see that the `chain-simulator-tests` feature is already included. So, your interactor crate’s `Cargo.toml` file should look like this:

```toml
[package]
name = "my-adder"
version = "0.0.0"
publish = false
edition = "2021"
authors = ["you"]

[lib]
path = "src/my_adder.rs"

[dependencies.multiversx-sc]
version = "0.54.0"

[dev-dependencies.multiversx-sc-scenario]
version = "0.54.0"

[workspace]
members = [
    ".",
    "meta",
    "interact",
]

[features]
chain-simulator-tests = []
```

With this already set up, you’re ready to start building and running tests for your contract!

In the `basic_interact_cs_test.rs`, create a test that will walk through the following steps:

1. **Deploy** the contract.
2. **Add**: call the function that increments a stored number in the contract by 1.
3. **GetSum**: verify the increment, check that the number in storage has indeed increased by 1.
4. **Upgrade** the contract: perform an upgrade of the contract with a new number.
5. **Unauthorized Upgrade**: try upgrading the contract with an unauthorized user to verify that it results in a failed transaction.

[comment]: # (mx-context-auto)

### 0. The base

Each test you write should include the `#[tokio::test]` attribute for asynchronous execution and **enable** the `chain-simulator-tests` feature flag. Here’s how your test setup should look:

```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_adder_test() {}
```

[comment]: # (mx-context-auto)

### 1. Deploy the contract

**Deploy** on Chain Simulator _MyAdder_ contract which sets the initial sum with **zero**.
```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_adder_test() {
    let mut basic_interact = MyAdderInteract::init(Config::chain_simulator_config()).await;

    ///////////////////////1///////////////////////
    basic_interact.deploy().await;
}
```

[comment]: # (mx-context-auto)

### 2. Add

Create a transaction that calls endpoint `add` which successfully **increments** the stored number in the contract by **one**.

```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_upgrade_test() {
    let mut basic_interact = MyAdderInteract::init(Config::chain_simulator_config()).await;

    basic_interact.deploy().await;
    ///////////////////////2///////////////////////
    basic_interact.add(1u32).await;
}
```

[comment]: # (mx-context-auto)

### 3. GetSum

Query the storage where the number is stored. This way, you can verify if the stored value has been incremented.

```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_upgrade_test() {
    let mut basic_interact = MyAdderInteract::init(Config::chain_simulator_config()).await;

    basic_interact.deploy().await;
    basic_interact.add(1u32).await;

    ///////////////////////3///////////////////////
    // Sum will be 1
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 1u32.into());
}
```

[comment]: # (mx-context-auto)

### 4. Upgrade the contract

Upgrade successfully _MyAdder_ with **seven** as the new value stored in the `sum` storage mapper. To verify if the number was indeed changed, you need to query the `SingleValueMapper`.

```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_upgrade_test() {
    let mut basic_interact = AdderInteract::init(Config::chain_simulator_config()).await;

    basic_interact.deploy().await;
    basic_interact.add(1u32).await;

    // Sum will be 1
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 1u32.into());

    ///////////////////////4///////////////////////
    let adder_owner_address = basic_interact.adder_owner_address.clone();
    basic_interact
        .upgrade(7u32, &adder_owner_address, None)
        .await;

    // Sum will be the updated value of 7
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 7u32.into());
}
```

[comment]: # (mx-context-auto)

### 5. Unauthorized Upgrade
Attempt to upgrade the contract with an unauthorized user to confirm that it results in a failed transaction. To ensure no changes occur, you need to query the storage again to check that the number remains unchanged.

```rust
use basic_interact::{Config, MyAdderInteract};

#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn simulator_upgrade_test() {
    let mut basic_interact = MyAdderInteract::init(Config::chain_simulator_config()).await;

    basic_interact.deploy().await;
    basic_interact.add(1u32).await;

    // Sum will be 1
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 1u32.into());

    let adder_owner_address = basic_interact.adder_owner_address.clone();
    basic_interact
        .upgrade(7u32, &adder_owner_address, None)
        .await;

    // Sum will be the updated value of 7
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 7u32.into());

    ///////////////////////5///////////////////////
    let wallet_address = basic_interact.wallet_address.clone();
    let error_not_owner = (4, "upgrade is allowed only for owner");
    basic_interact
        .upgrade(10u32, &wallet_address, Some(error_not_owner))
        .await;

    // Sum will remain 7
    let sum = basic_interact.get_sum().await;
    assert_eq!(sum, 7u32.into());
}
```

[comment]: # (mx-context-auto)

## Step 5: Run tests on Chain Simulator

[comment]: # (mx-context-auto)

### Install
To run the tests you just created, you will need to install the Docker image that includes the Chain Simulator.

```bash
my-adder/interact$ sc-meta cs install
Attempting to install prerequisites for the Chain Simulator...
Successfully pulled the latest Chain Simulator image.
```

:::note
If you encounter the following error while installing:
```bash
Attempting to install prerequisites for the Chain Simulator...
Error: Failed to execute command: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

You will need to run the command with root privileges due to Docker usage:
```bash
my-adder/interact$ sudo sc-meta cs install
```

If you get this error:
```bash
sudo: sc-meta: command not found
```
You can find the sc-meta path and choose one of these solutions:
```bash
my-adder/interact$ which sc-meta
my-path/.cargo/bin/sc-meta
```

1. Add the sc-meta path to root privileges:
2. Run sc-meta directly using the full path:
```bash
sudo my-path/.cargo/bin/sc-meta cs install
```
:::

[comment]: # (mx-context-auto)

### Start

Once you’ve successfully installed the Docker image, you can start the Chain Simulator.
```bash
my-adder/interact$ sudo my-path/.cargo/bin/sc-meta cs start
Attempting to start the Chain Simulator...
Successfully started the Chain Simulator.
INFO [2024-11-11 13:09:15.683]   using the override config files          files = [./config/nodeOverrideDefault.toml] 
WARN [2024-11-11 13:09:15.684]   signature                                bypass = true 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = systemSmartContractsConfig.toml path = ESDTSystemSCConfig.BaseIssuingCost value = 50000000000000000 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = config.toml path = Debug.Process.Enabled value = false 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = config.toml path = VirtualMachine.Execution.WasmVMVersions value = [map[StartEpoch:0 Version:1.5]] 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = config.toml path = VirtualMachine.Querying.WasmVMVersions value = [map[StartEpoch:0 Version:1.5]] 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = config.toml path = WebServerAntiflood.WebServerAntifloodEnabled value = false 
INFO [2024-11-11 13:09:15.699]   updated config value                     file = config.toml path = WebServerAntiflood.SimultaneousRequests value = 100000
...
```

[comment]: # (mx-context-auto)

### Run
While Chain Simulator is running, open a new terminal window in parallel. In this new terminal, you will run the test you created in [Step 4](./chain-simulator-adder.md#step-4-create-tests-that-run-on-chain-simulator).

```bash
my-adder/interact$ sc-meta test --chain-simulator
```

```bash Output
running 1 test
test simulator_upgrade_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 1.09s
```
[comment]: # (mx-context-auto)

### Stop
In the **same** terminal window you ran the tests, **stop** Chain Simulator using the next command:
```bash
my-adder/interact$ sc-meta cs stop
Attempting to close the Chain Simulator...
Successfully stopped the Chain Simulator.
```
:::note
If you encounter the following error while stopping:
```bash
Attempting to close the Chain Simulator...
Error: Failed to execute command: permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock
```

Solution is presented in [Run](./chain-simulator-adder.md#install) section.
:::

By following these steps, you've mastered the basics of smart contract development and testing. Now, it's time to explore more advanced techniques and create innovative applications :sparkles: :rocket: