---
id: chain-simulator-adder
title: Chain Simulator in Adder - SpaceCraft interactors
---

[comment]: # (mx-abstract)

This tutorial will guide you to interact with **chain simulator** using the SpaceCraft interactors in _Adder_ smart contract. 

[comment]: # (mx-context-auto)

## Introduction

[Chain simulator](../../sdk-and-tools/chain-simulator.md) mimics the functionality of a local blockchain test network. It offers a convenient, faster, and realistic way to test smart contracts. 

[SpaceCraft interactor](../meta/interactor/interactors-overview.md) allows testing any complex scenario defined in a smart contract using chain simulator. Rather than going through the full setup of a local testnet, you can get straight to developing and debugging in a streamlined environment. This tool handles the setup details so you can focus on what matters most: **building and testing your contracts**.

:::important
Before we dive in and explore how easy it can be, make sure you have the following:
- `stable` Rust version `≥ 1.78.0` (install via [rustup](https://docs.multiversx.com/sdk-and-tools/troubleshooting/rust-setup/#without-mxpy)): 
- `multiversx-sc-meta` version `≥ 0.54.0` (cargo install [multiversx-sc-meta](https://docs.multiversx.com/developers/meta/sc-meta-cli/#introduction))
:::

[comment]: # (mx-context-auto)

## Step 1: Start from template

For this journey, let's start with the _adder_ template as our base. You can quickly set it up using **sc-meta** to generate it:

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

## Step 2: What is inside interactor

Our main focus will be on two directories: `src` and `interact`. The `src` folder contains the contract code, which is what you will deploy on the blockchain. Now, let’s take a closer look at the **interact directory**. 

The directory that makes the connection with chain simulator contains the following structures: 

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

### Configuration

To configure your environment as a blockchain simulator, edit the `config.toml` file and add the following lines:

```toml
chain_type = 'simulator'
gateway_uri = 'http://localhost:8085'
```

You can customize two settings in the configuration: **the type of blockchain** and **the gateway URI**. To use a simulator for your blockchain, set `chain_type` as shown in the example above. 

By default, the simulator runs on `http://localhost:8085`. However, depending on your Docker image settings, the simulator's URI **might have a different port or name**.

:::important
Make sure to set both `chain_type` and `gateway_uri` for the interactor to work.
:::

The configuration is parsed by `basic_interact_config.rs`. This file contains **two** functions that will be important for interacting with chain simulator:
- `use_chain_simulator()`: that returns if the chain type is real or simulator
- `chain_simulator_config()`: that initialize the proper configuration for simulator environment. This function is useful for **continuous integration tests**.

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

Let's break down what these commands do on chain simulator:

- `deploy`: uploads the contract to the blockchain;
- `multi-deploy`: deploys multiple instances of the _Adder_ contract at once;
- `upgrade`: upgrades the existing _Adder_ contract with a new version;
- `add`: executes a transaction that calls the `add` function of the _Adder_ contract, essentially adding a value to it;
- `sum`: queries the contract's storage **getSum**;
- `feed`: adds a specific amount of EGLD to the _Adder_ contract. 

:::tip
In the simulator context, `feed` command is not necessary, as the simulator provides an unlimited supply of EGLD. Once the contract is deployed, it has a virtually infinite amount of EGLD, removing the need to worry about limited resources.
:::

### State Management for Interactions

Module `basic_interact_state.rs` defines a State structure to help us keep track of our smart contract’s address. This information is saved in `state.toml` so even when we restart our interaction commands, it remembers the address we’ve set!

### Interaction transactions

The basic_interact.rs file is where you will find the functions triggered by each command you run from the command line. Each function represents either a transaction or a query. In the next sections, we will take a closer look at how these work!

## Step 3: Initializing a interactor

In the Chain Simulator, time moves much faster, but nothing happens on its own. Unlike a live blockchain, transactions aren't automatically added to blocks. Instead, you need to manually trigger actions to process transactions and generate blocks. But don’t worry—SpaceCraft takes care of this for you! We’ll explain how it all works in the next few sections.

:::info
Each time you start the chain simulator, it creates a fresh, new blockchain from scratch. This means your account state starts out empty, and the transaction blocks have no data initially.
:::

```rust
pub async fn init(config: Config) -> Self {
    let mut interactor = Interactor::new(config.gateway_uri(), config.use_chain_simulator())
        .await
        .with_tracer(INTERACTOR_SCENARIO_TRACE_PATH)
        .await;

    interactor.set_current_dir_from_workspace("contracts/examples/adder/interact");

    let adder_owner_address = interactor
        .register_wallet(Wallet::from_pem_file("adder-owner.pem").unwrap())
        .await;
    // PASSWORD: "alice"
    // InsertPassword::Plaintext("alice".to_string()) || InsertPassword::StandardInput
    let wallet_address = interactor
        .register_wallet(
            Wallet::from_keystore_secret(
                "alice.json",
                InsertPassword::Plaintext("alice".to_string()),
            )
            .unwrap(),
        )
        .await;

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

Let's find out what is mandatory for initializing the chain simulator interactor. 

```rust
let adder_owner_address = interactor
        .register_wallet(Wallet::from_pem_file("adder-owner.pem").unwrap())
        .await;
```
Every time you initialize an interactor, you’ll need to register a wallet. When a wallet is registered in the Chain Simulator, its associated account is automatically credited with a generous amount of EGLD. This way, you don’t have to worry about running out of tokens while testing!

:::important
Whenever the chain simulator stops, the account will be dissolved.
:::

```rust
interactor.generate_blocks_until_epoch(1).await.unwrap();
```
Node enables `ESDTSystemSCAddress` in **epoch number one**. If you want to use functionality like issuing or minting tokens, it is necessary to generate blocks until simulator chain reaches **epoch number one**.

## Step 4: Create tests that run on chain simulator

## Step 5: Run tests on chain simulator