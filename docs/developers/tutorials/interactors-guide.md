---
id: interactors-guide
title: Deploy a SC in 5 minutes - SpaceCraft interactors
---

[comment]: # (mx-abstract)

This short guide demonstrates how to deploy and interact with a smart contract (SC) on MultiversX using the SpaceCraft interactors. We will cover essential topics such as the SC framework, integration tests, `sc-meta`, and interactors (devtools).

[comment]: # (mx-context-auto)

## Introduction

Building smart contracts involves complex tasks. Beyond the syntax, a smart contract acts as a public server where users pay for actions. Enforcing rules to ensure safety (treating possible exploits) and efficiency (timewise - transaction speed, costwise - gas fees) for all users interacting with the contract is crucial.

In order to make sure that the smart contract works as expected, there are at least three stages of testing that we recommend to be performed before live deployment:

- unit testing ([SpaceCraft testing framework](/docs/developers/testing/rust/sc-test-overview.md#overview) - Rust unit tests, RustVM)
- scenarios ([mandos](/docs/developers/testing/scenario/concept.md#what-is-mandos) - json files, can be generated from Rust unit tests). Mandos can be used to test the logic on the [GoVM](/docs/learn/space-vm.md) as well, which is the actual VM running on the node
- integration testing ([SpaceCraft Rust interactors](/docs/developers/meta/interactor/interactors-overview.md#overview) - testing on the blockchain). Integration tests cover real life scenarios across the different MultiversX blockchain environments - devnet/testnet/mainnet

In this tutorial we will focus on integration testing using the interactors made available by the SpaceCraft smart contract framework.

::::important Prerequisites

- `stable` Rust version `≥1.83.0` (install via [rustup](/docs/developers/toolchain-setup.md#installing-rust-and-sc-meta)):
- `multiversx-sc-meta` (cargo install [multiversx-sc-meta](/docs/developers/meta/sc-meta-cli.md))
::::

[comment]: # (mx-context-auto)

## Step 1: Start from a template

Get a headstart by using `sc-meta` to generate one of our smart contract templates as a starting point for your smart contract. Let’s say we start from the `empty` template contract and name it `my-contract`.

```bash
sc-meta new --template empty --name my-contract
code my-contract # opens the contract in VSCode (optional)
```

This command generates an empty contract called `MyContract`, with the minimum requirements for deployment. The main file *(my-contract/src/my_contract.rs)* includes only two empty endpoints: `init` and `upgrade`.

[comment]: # (mx-context-auto)

## Step 2: Customize the template

However, we are not interested in deploying an empty contract, so we will quickly add some endpoints:

```rust title=my_contract.rs
#![no_std]

#[allow(unused_imports)]
use multiversx_sc::imports::*;

/// An empty contract. To be used as a template when starting a new contract from scratch.
#[multiversx_sc::contract]
pub trait MyContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[endpoint]
    fn register_me(&self) {
        let caller = self.blockchain().get_caller();
        require!(
            self.already_registered(&caller).is_empty(),
            "user already registered"
        );
        self.already_registered(&caller).set(true)
    }

    #[endpoint]
    fn deregister_me(&self) {
        let caller = self.blockchain().get_caller();
        require!(
            !self.already_registered(&caller).is_empty(),
            "user not registered"
        );
        self.already_registered(&caller).clear()
    }

    #[view]
    #[storage_mapper]
    fn already_registered(&self, user: &ManagedAddress) -> SingleValueMapper<bool>;
}
```

In this snippet, we have created a storage mapper named `already_registered` to track user registration status, and two endpoints to handle the registration process and enforce a clear path of action for the user: first register, then deregister. Any other path of action should result in an error. In order to make sure the rules are enforced on the actual blockchain, we will create some integration tests.

[comment]: # (mx-context-auto)

## Step 3: Build the contract

Considering our syntax development is done, we should now be able to build the contract. We need to build the contract in order to generate necessary files for deployment and testing inside the `output` folder such as *my-contract.wasm* and *my-contract.mxsc.json*.

```bash
cd my-contract
sc-meta all build
```

[comment]: # (mx-context-auto)

## Step 4: Generate the interactor

Based on the smart contract we have just created, we can generate interactors with just one command using `sc-meta` in the root folder of the contract.

```bash
sc-meta all snippets
```

This command compiled the contract and generated a new folder called `interactor`. The interactor is by default a Rust CLI program that uses the smart contract proxy to send calls to the contract.

Inside the source folder *(my-contract/interactor/src)*, we should find the newly generated proxy of the contract *(my_contract_proxy.rs)* and the `interactor_main.rs` file, which is the main file of the project. A *sc-config.toml* file has also been created (if not existent) in the contract root containing the path of the proxy file.

If we navigate to *interactor/src/interact.rs*, inside the `my_contract_cli()` function, we can find all the CLI command available to us:

```rust title=interact.rs
pub async fn my_contract_cli() {
    env_logger::init();

    let mut args = std::env::args();
    let _ = args.next();
    let cmd = args.next().expect("at least one argument required");
    let config = Config::new();
    let mut interact = ContractInteract::new(config).await;
    match cmd.as_str() {
        "deploy" => interact.deploy().await,
        "upgrade" => interact.upgrade().await,
        "register_me" => interact.register_me().await,
        "deregister_me" => interact.deregister_me().await,
        "already_registered" => interact.already_registered().await,
        _ => panic!("unknown command: {}", &cmd),
    }
}
```

As you can see, `sc-meta` automatically generated all the logic behind calling the smart contract endpoints. The interactor uses asynchronous Rust, so all the functions are marked as `async` and need to be awaited to get a result.

In order to compile the project, we need to include it in the project tree. In this case, we have to add the interactor project to the smart contract’s workspaces, in the *my-contract/Cargo.toml* file:

```toml title=Cargo.toml
[workspace]
members = [
   ".",
   "meta",
   "interactor"
]
```

[comment]: # (mx-context-auto)

## Step 5: Create scenarios & run

Now the setup is complete, it’s time to create some scenarios to test. For our use-case, the perfect scenario is: **deploy the contract**, **register from a user** and **deregister from the same user**. Anything else should result in an error.

In order to test the perfect scenario first, we will first deploy the contract:

```bash
cd interactor
cargo run deploy
```

After deploying the contract, a new file named *state.toml* will be created in the `interactor` directory, which contains the newly deployed SC address. For each deploy, a new address will be printed into the file.

```toml title=state.toml
contract_address = "erd1qqqqqqqqqqqqqpgqpsev0x4nufh240l44gf2t6qzkh9xvutqd8ssrnydzr"
```

By default, the testing environment is `devnet`, specified by the `my-contract/interactor/config.toml`:

```toml title=config.toml
chain_type = 'real'
gateway_uri = 'https://devnet-gateway.multiversx.com'
```

Changing the value of the `gateway_uri` will change the testing environment for a quick setup. Other options are:

- Testnet: `https://testnet-gateway.multiversx.com`
- Mainnet: `https://gateway.multiversx.com`

Each command has some waiting time and returns the result inside a variable in the function, but also prints it in the console for easy tracking.

In this case, the console shows:

```bash
interactor % cargo run deploy
   Compiling rust-interact v0.0.0 (/Users/you/Documents/my-contract/interact-rs)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 1.96s
     Running `/Users/you/Documents/my-contract/target/debug/rust-interact deploy`
sender's recalled nonce: 1717
-- tx nonce: 1717
sc deploy tx hash: 623c7b853b1fbb36762d433c6a5e27d34f48198e68bbba1216d1c676ab0ba3be
deploy address: erd1qqqqqqqqqqqqqpgqpsev0x4nufh240l44gf2t6qzkh9xvutqd8ssrnydzr
new address: erd1qqqqqqqqqqqqqpgqpsev0x4nufh240l44gf2t6qzkh9xvutqd8ssrnydzr
```

Then, we can continue testing the scenario:

```bash
cargo run register_me
cargo run deregister_me
```

These commands will send two transactions to the newly deployed contract from the `test_wallets::alice()` wallet, each of them calling one endpoint of the contract in the specified order.

```bash title=register_me
interactor % cargo run register_me
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.35s
     Running `/Users/you/Documents/my-contract/target/debug/rust-interact register_me`
sender's recalled nonce: 1718
-- tx nonce: 1718
sc call tx hash: 97bea2b18ca0d1305200dc4ea0d1b2b32a666430f8d24ab042f59c324bf47eec
Result: ()
```

```bash title=deregister_me
interactor % cargo run deregister_me
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.11s
     Running `/Users/you/Documents/my-contract/target/debug/rust-interact deregister_me
sender's recalled nonce: 1719
-- tx nonce: 1719
sc call tx hash: 20540f1548508e198359d3e897c1e380796e89142801d485c76c700b7dab2a8b
Result: ()
```

[comment]: # (mx-context-auto)

## Step 6 (optional): Create integration tests

Using the functions generated by `sc-meta`, we can extend the interactor to cover a series of integration tests. Organized tests help with maintenance and long-term testing.

We can create a quick integration test as such:

Inside the `tests` directory of the `interactor`, you can add integration tests that run either on the **chain simulator** or on the **gateway** configured in `config.toml`.

For this example, we can create an integration test that runs on `devnet`, starting with the template provided in the file `my-contract/interactor/interact_tests.rs`:

```rust title=interact_tests.rs
#[tokio::test]
async fn integration_test() {
    let mut interactor = ContractInteract::new(Config::new()).await;

    interactor.deploy().await;
    interactor.register_me().await;
    interactor.deregister_me().await;
}
```

Alternatively, we can create an integration test that runs only on the [chain simulator](/docs/developers/tutorials/chain-simulator-adder.md):

```rust
#[tokio::test]
#[cfg_attr(not(feature = "chain-simulator-tests"), ignore)]
async fn chain_simulator_integration_test() {
    let mut interactor = ContractInteract::new(Config::chain_simulator_config()).await;
    
    interactor.deploy().await;
    interactor.register_me().await;
    interactor.deregister_me().await;
}
```

Running `integration_test()` will perform the previous CLI actions in the same order, on the real blockchain. The console will show all the intermediate actions at the end of the test, as such:

```bash
running 1 test
test integration_test ... ok

successes:

---- integration_test stdout ----
sender's recalled nonce: 1720
-- tx nonce: 1720
sc deploy tx hash: ca6e69c18acd73b20bfd21142b45be1b530ecbec89d1eb9c374b93f7681dbc38
deploy address: erd1qqqqqqqqqqqqqpgq0lkg29q0ep09llg0mva5lle3s0334wqtd8ss40lmkn
new address: erd1qqqqqqqqqqqqqpgq0lkg29q0ep09llg0mva5lle3s0334wqtd8ss40lmkn
sender's recalled nonce: 1721
-- tx nonce: 1721
sc call tx hash: f8692bd508c1d1aa10324a79d497f1c6995e053e3f89fca48e8f4185808f067a
Result: ()
sender's recalled nonce: 1722
-- tx nonce: 1722
sc call tx hash: 369429790c8d77d85dd52f73c9a6b6427709f327b7e004ad99de3bc04f3ee767
Result: ()


successes:
    integration_test

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 14.38s
```

[comment]: # (mx-context-auto)

## Conclusion

The interactors are a versatile tool that greatly simplifies various processes around a smart contract, including deployment, upgrades, interaction, and testing. These tools not only save time but also offer a robust starting codebase for Rust developers. They also provide a valuable learning opportunity for non-Rust developers to explore asynchronous Rust and other advanced features.

We highly recommend experimenting with these interactors, as they are efficient time-savers and are likely to be expanded with even more features in the future. By incorporating these practices, you can ensure that your smart contract functions as intended, providing a reliable and efficient service to users on MultiversX.
