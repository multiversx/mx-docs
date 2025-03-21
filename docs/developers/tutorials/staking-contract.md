---
id: staking-contract
title: Staking smart contract
---

[comment]: # (mx-abstract)

## Introduction

This tutorial aims to teach you how to write a simple staking contract, and to illustrate and correct the common pitfalls new smart contract developers might fall into.

:::tip
If you find anything not answered here, feel free to ask further questions on the MultiversX Developers Telegram channel: [https://t.me/MultiversXDevelopers](https://t.me/MultiversXDevelopershttps://t.me/MultiversXDevelopers)
:::

[comment]: # (mx-context-auto)

## Prerequisites

<!-- [comment]: # (mx-context-auto) -->

<!-- ### mxpy

We're going to use [**mxpy**](/sdk-and-tools/sdk-py/mxpy-cli) for interacting with our contracts. Follow the installation guide [here](/sdk-and-tools/sdk-py/installing-mxpy) - make sure to use the latest version available. -->

<!-- [comment]: # (mx-context-auto)

### Rust

Install **Rust** and [**sc-meta**](/developers/meta/sc-meta) as depicted [here](/sdk-and-tools/troubleshooting/rust-setup). -->
<!-- 
[comment]: # (mx-context-auto)

### VSCode

For contract developers, we generally recommend [**VSCode**](https://code.visualstudio.com) with the following extensions:

- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
- [CodeLLDB](https://marketplace.visualstudio.com/items?itemName=vadimcn.vscode-lldb) -->

[comment]: # (mx-context-auto)

## Creating the contract

Run the following command in the folder in which you want your smart contract to be created:

```bash
sc-meta new --name staking-contract --template empty
```

Open VSCode, select **File > Open Folder**, and open the newly created `staking-contract` folder.

[comment]: # (mx-context-auto)

## Building the contract

In the VSCode terminal, run the following command to build the contract:

```bash
sc-meta all build
```

After the building has completed, our folder should look like this:  

```bash
├── Cargo.lock
├── Cargo.toml
├── meta
│   ├── Cargo.toml
│   └── src
├── multiversx.json
├── output
│   ├── staking-contract.abi.json
│   ├── staking-contract.imports.json
│   ├── staking-contract.mxsc.json
│   └── staking-contract.wasm
├── scenarios
│   └── staking_contract.scen.json
├── src
│   └── staking_contract.rs
├── target
│   ├── CACHEDIR.TAG
│   ├── debug
│   ├── release
│   ├── tmp
│   └── wasm32-unknown-unknown
├── tests
│   ├── staking_contract_scenario_go_test.rs
│   └── staking_contract_scenario_rs_test.rs
└── wasm
    ├── Cargo.lock
    ├── Cargo.toml
    └── src
```

A new folder, called `output` was created, which contains the compiled contract code. More on this is used later. For now, let's continue.

[comment]: # (mx-context-auto)

## Your first lines of Rust

Currently, we just have an empty contract. Not very useful, is it? So let's add some simple code for it. Since this is a staking contract, we'd expect to have a `stake` function, right?

First, remove all the code in the `./src/staking_contract.rs` file and replace it with this:

```rust
#![no_std]

use multiversx_sc::imports::*;

#[multiversx_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {}
}
```

Since we want this function to be callable by users, we have to annotate it with `#[endpoint]`. Also, since we want to be able to receive a payment, we mark it also as `#[payable("EGLD)]`. For now, we'll use EGLD as our staking token.

:::note
The contract **does NOT** need to be payable for it to receive payments on endpoint calls. The payable flag at contract level is only for receiving payments without endpoint invocation.
:::

Now, it's time to add an implementation for the function. We need to see how much a user paid, and save their staking information in storage. We end up with this code:

```rust
#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[upgrade]
    fn upgrade(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld().clone_value();
        require!(payment_amount > 0, "Must pay more than 0");

        let caller = self.blockchain().get_caller();
        self.staking_position(caller.clone()).set(&payment_amount);
        self.staked_addresses().insert(caller.clone());
    }

    #[view(getStakedAddresses)]
    #[storage_mapper("stakedAddresses")]
    fn staked_addresses(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[view(getStakingPosition)]
    #[storage_mapper("stakingPosition")]
    fn staking_position(&self, addr: ManagedAddress) -> SingleValueMapper<BigUint>;
}
```

[`require!`](/docs/developers/developer-reference/sc-messages.md#require) is a macro that is a shortcut for `if !condition { signal_error(msg) }`. Signalling an error will terminate the execution and revert any changes made to the internal state, including token transfers from and to the smart contract. In this case, there is no reason to continue if the user did not pay anything.

We've also added [`#[view]`](/docs/developers/developer-reference/sc-annotations.md#endpoint-and-view) annotation for the storage mappers, so we can later perform queries on those storage entries. You can read more about annotations [here](/developers/developer-reference/sc-annotations/).

Also, if you're confused about some of the functions used or the storage mappers, you can read more here:

- [https://docs.multiversx.com/developers/developer-reference/sc-api-functions](/developers/developer-reference/sc-api-functions)
- [https://docs.multiversx.com/developers/developer-reference/storage-mappers](/developers/developer-reference/storage-mappers)

Now, I've intentionally written some bad code here. Can you spot the improvements we can make?

1. The last `clone()` from `stake()` function is not needed. If you clone variables all the time, then you need to take some time to read the Rust ownership chapter of the Rust book: [https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html) and also about the implications of cloning types from the Rust framework: [https://docs.multiversx.com/developers/best-practices/biguint-operations](/developers/best-practices/biguint-operations).

2. The `staking_position` does not need an owned value of the `addr` argument. We can take a reference instead.

3. There's a logic error. What happens if a user stakes twice? That's right, their position will be overwritten with the newest value. So instead, we need to add the newest stake amount over their current amount, using the [`update`](/docs/developers/developer-reference/storage-mappers.md#update) method.

After fixing the above problems, we end up with the following code:

```rust
#![no_std]

multiversx_sc::imports!();

#[multiversx_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld().clone_value();
        require!(payment_amount > 0, "Must pay more than 0");

        let caller = self.blockchain().get_caller();
        self.staking_position(&caller)
            .update(|current_amount| *current_amount += payment_amount);
        self.staked_addresses().insert(caller);
    }

    #[view(getStakedAddresses)]
    #[storage_mapper("stakedAddresses")]
    fn staked_addresses(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[view(getStakingPosition)]
    #[storage_mapper("stakingPosition")]
    fn staking_position(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
```

[comment]: # (mx-context-auto)

### What's with the empty init and upgrade function?

Every smart contract needs to have a function annotated with [`#[init]`](/docs/developers/developer-reference/sc-annotations.md#init) and `#[upgrade]`.

`init()` is called on deploy, while `upgrade()` on upgrade. For now, we need no logic inside it, but we still need to have those functions.

[comment]: # (mx-context-auto)

### Creating a wallet

:::note  
You can skip this section if you already have a devnet wallet setup.
:::

Open the terminal and run the following commands:

```sh
mkdir -p ~/MyTestWallets
sc-meta wallet new --format pem --outfile ./MyTestWallets/tutorialKey.pem
```

<!-- To initiate transactions on the blockchain, your wallet needs funds.

Here’s how to fund your wallet on **devnet**:

1. Go to [Devnet Wallet MultiversX](https://devnet-wallet.multiversx.com/unlock) and log in using `tutorialKey.pem`.
2. Once logged in, open the Faucet from the Tools;
3. Request 5 xEGLD to top up your wallet with test EGLD.

:::note
Faucet is available also on **testnet**. Go to [Testnet Wallet Multiversx](https://testnet-wallet.multiversx.com/unlock) and do the same steps presented previously to request 30 xEGLD.
::: -->

[comment]: # (mx-context-auto)

### Deploying the contract on devnet

Now that we've created a wallet, it's time to deploy our contract.

:::important
Make sure you build the contract before deploying it. Open the terminal and run the following command in the contract root:

```bash
sc-meta all build
```

:::

After the contract is built, generate the interactor:  

```bash
sc-meta all snippets
```

add the interactor to the project; at `staking-contract/Cargo.toml` add `interactor` as a member to the workspace:

```toml
[package]
# package info

[lib]
# lib path

[dependencies.multiversx-sc]
# multiversx-sc version

[dev-dependencies]
# components

[workspace]
members = [
    ".",
    "meta",
    "interactor"    # <- new member added
]
```

update the sender of the transactions. In the file `staking-contract/interact.rs` modify variable `wallet_address` from `new` function with the [absolute path](https://www.redhat.com/en/blog/linux-path-absolute-relative) to your wallet:

```rust
let wallet_address = interactor
    .register_wallet(
        Wallet::from_pem_file("/MyTestWallets/tutorialKey.pem").expect("wallet cannot be found"),
    )
    .await;
```

finally, deploy the contract on devnet:

```bash
cd interactor/
cargo run deploy
```

:::note  
If you wanted to use testnet, the `gateway_uri` from `staking-contract/interactor/config.toml` would be `https://testnet-gateway.multiversx.com`. For mainnet, it would be `https://gateway.multiversx.com`.

More details can be found [here](/developers/constants/).
:::

[comment]: # (mx-context-auto)

### Account was not found? But I just created the wallet

You're going to see an error like the following:

```bash
error sending tx (possible API failure): transaction generation failed: insufficient funds for address erd1vx8tcqgrkytf3yr3kjqux22ze27mzcgds067dnegxzp3u2dj253qwy7jjf
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

This is because your account has no EGLD in it. For now, the blockchain is concerned because the account does not exist, as it has no transactions from or to it.

[comment]: # (mx-context-auto)

### Getting EGLD on devnet

There are many ways of getting EGLD on devnet:

- through the devnet wallet
- through an external faucet
- through the [MultiversX Builders Discord Server faucet](https://discord.gg/multiversxbuilders)
- asking a team member on [Telegram](https://t.me/MultiversXDevelopers)

[comment]: # (mx-context-auto)

#### Getting EGLD through devnet wallet

Go to [https://devnet-wallet.multiversx.com](https://devnet-wallet.multiversx.com) and login to your devnet account with your PEM file. On the left side menu, select the "faucet" option:  
![img](/developers/staking-contract-tutorial-img/wallet_faucet.png)

Request the tokens. After a couple seconds, refresh the page, and you should have 5 xEGLD in your wallet.

[comment]: # (mx-context-auto)

#### Getting EGLD through external faucet

Go to [https://r3d4.fr/faucet](https://r3d4.fr/faucet) and submit a request:  
![img](/developers/staking-contract-tutorial-img/external_faucet.png)

Make sure you selected "devnet" and input your address! It might take a bit depending on how "busy" the faucet is.

[comment]: # (mx-context-auto)

### Deploying the contract, second try

Now that the blockchain knows about our account, it's time to try the deploy again. Run the `deploy` command again and let's see the results. Make sure you save the contract address:

```bash
sender's recalled nonce: 0
-- tx nonce: 0
sc deploy tx hash: 8a007...
deploy address: erd1qqqqqqqqqqqqq...
new address: erd1qqqqqqqqqqqqq...
```

Alternatively, you can check the address in the logs tab in [explorer](https://devnet-explorer.multiversx.com/transactions), namely the `SCDeploy` method.

[comment]: # (mx-context-auto)

#### Too much gas error?

Everything should work just fine, but you'll see this message:  
![img](/developers/staking-contract-tutorial-img/too_much_gas.png)

This is NOT an error. This simply means you provided way more gas than needed, so all the gas was consumed instead of the leftover being returned to you. This is done to protect the network against certain attacks. For instance, one could always provide the max gas limit and only use very little, decreasing the network's throughput significantly.

[comment]: # (mx-context-auto)

## The first stake

Let's update the stake function from `staking-contract/interactor/src/interact.rs` to do the first stake

Initialize variable `egld_amount` with `1` instead of `0`:

```rust
let egld_amount = BigUint::<StaticApi>::from(1u128);
```

This variable holds the EGLD value that will be paid.

Let's stake! At path `staking-contract/interactor` run the next command:

```bash
cargo run stake
```

We've now successfully staked 1 EGLD... or have we? If we look at the transaction, that's not quite the case:  
![img](/developers/staking-contract-tutorial-img/first_stake.png)

[comment]: # (mx-context-auto)

### Why was a smaller amount of EGLD sent to the SC?

This is because EGLD has 18 decimals. So to send 1 EGLD, you actually have to send a value equal to `1000000000000000000` (i.e. 10<sup>18</sup>).

The blockchain only works with unsigned numbers. Floating point numbers are not allowed. The only reason the explorer displays the balances with a floating point is because it's much more user-friendly to tell someone they have 1 EGLD instead of 1000000000000000000 EGLD, but internally, only the integer value is used.

[comment]: # (mx-context-auto)

### But how do I send 0.5 EGLD to the SC?

Since we know EGLD has 18 decimals, we have to simply multiply 0.5 by 10<sup>18</sup>, which yields 500000000000000000.

[comment]: # (mx-context-auto)

## Actually staking 1 EGLD

To do this, we simply have to update `egld_amount` that is in `stake` function from `staking-contract/interactor/src/interact.rs` with:

```rust
let egld_amount = BigUint::<StaticApi>::from(1000000000000000000u128);
```

Now let's try staking again:
![img](/developers/staking-contract-tutorial-img/second_stake.png)

[comment]: # (mx-context-auto)

## Querying the view functions

To perform smart contract queries for `getStakingPosition` view, you need to update `addr` variable with the address of the wallet you did the stake transaction:

```rust
let addr = bech32::decode("erd1vx...");
```

Then perform the query, running in terminal in `staking-contract/interactor` directory:

```bash
cargo run getStakingPosition
```

:::note
Attempting to use `self.blockchain().get_caller()` in a query function will return the SC's own address.
:::

Now let's see our staking amount, according to the SC's internal state:

```bash
Result: 1000000000000000001
```

We get the expected amount, 1 EGLD, plus the initial 10<sup>-18</sup> EGLD we sent.

Now let's also query the **stakers list**. Replace the next line from `staked_address` **function** that is at `staking-contract/interactor/src/interact.rs`:

```rust
        println!("Result: {result_value:?}");

```

with:

```rust
for result in result_value.iter() {
    println!("Result: {}", Bech32Address::from(result).to_bech32_string());
} 
```

It is necessary to iterate through `result_value` because it is a [`MultiValueVec`](/docs/developers/data/multi-values.md#standard-multi-values) of `Address`. Additionally, each address is converted to `Bech32Address` to ensure it is not printed in **ASCII** format.

Run in terminal at path `staking-contract/interactor`:

```bash
cargo run getStakedAddresses
```

Running this function should yield a result like this:

```bash
Result: erd1vx8tcqgrkytf3yr3kjqux22ze27mzcgds067dnegxzp3u2dj253qwy7jjf
```

[comment]: # (mx-context-auto)

## Adding unstake functionality

For now, users can only stake, but they cannot actually get their EGLD back... at all. Let's add the unstake endpoint in our SC:

```rust
#[endpoint]
fn unstake(&self) {
    let caller = self.blockchain().get_caller();
    let stake_mapper = self.staking_position(&caller);

    let caller_stake = stake_mapper.get();
    if caller_stake == 0 {
        return;
    }

    self.staked_addresses().swap_remove(&caller);
    stake_mapper.clear();

    self.tx().to(caller).egld(caller_stake).transfer();
}
```

You might notice the variable `stake_mapper`. Just to remind you, the mapper's definition looks like this:

```rust
#[storage_mapper("stakingPosition")]
fn staking_position(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
```

In pure Rust terms, this is a method of our contract trait, with one argument, that returns a [`SingleValueMapper<BigUint>`](/docs/developers/developer-reference/storage-mappers.md#singlevaluemapper). All [mappers](/docs/developers/developer-reference/storage-mappers.md) are nothing more than struct types that provide an interface to the storage API.

So then, why save the mapper in a variable?

[comment]: # (mx-context-auto)

### Better usage of storage mapper types

Each time you access `self.staking_position(&addr)`, the storage key has to be constructed again, by concatenating the static string `stakingPosition` with the given `addr` argument. The mapper saves its key internally, so if we reuse the same mapper, the key is only constructed once.

This saves us the following operations:

```rust
let mut key = ManagedBuffer::new_from_bytes(b"stakingPosition");
key.append(addr.as_managed_buffer());
```

Instead, we just reuse the key we built previously. This can be a great performance enhancement, especially for mappers with multiple arguments. For mappers with no arguments, the improvement is minimal, but might still be worth thinking about.

[comment]: # (mx-context-auto)

### Partial unstake

Some users might only want to unstake a part of their tokens, so we could simply add an `unstake_amount` argument:

```rust
#[endpoint]
fn unstake(&self, unstake_amount: BigUint) {
    let caller = self.blockchain().get_caller();
    let remaining_stake = self.staking_position(&caller).update(|staked_amount| {
        require!(
            unstake_amount > 0 && unstake_amount <= *staked_amount,
            "Invalid unstake amount"
        );
        *staked_amount -= &unstake_amount;

        staked_amount.clone()
    });
    if remaining_stake == 0 {
        self.staked_addresses().swap_remove(&caller);
    }

    self.tx().to(caller).egld(unstake_amount).transfer();
}
```

As you might notice, the code changed quite a bit. We also need to account for invalid user input, so we add a `require!` statement. Additionally, since we no longer need to simply "clear" the storage, we use the `update` method, which allows us to change the currently stored value through a mutable reference.

[`update`](/docs/developers/developer-reference/storage-mappers.md#update) is the same as doing [`get`](/docs/developers/developer-reference/storage-mappers.md#get), followed by computation, and then [`set`](/docs/developers/developer-reference/storage-mappers.md#set), but it's just a lot more compact. Additionally, it also allows us to return anything we want from the given closure, so we use that to detect if this was a full unstake.

[comment]: # (mx-context-auto)

### Optional arguments

For a bit of performance enhancement, we could have the `unstake_amount` as an optional argument, with the default being full unstake.

```rust
#[endpoint]
fn unstake(&self, opt_unstake_amount: OptionalValue<BigUint>) {
    let caller = self.blockchain().get_caller();
    let stake_mapper = self.staking_position(&caller);
    let unstake_amount = match opt_unstake_amount {
        OptionalValue::Some(amt) => amt,
        OptionalValue::None => stake_mapper.get(),
    };

    let remaining_stake = stake_mapper.update(|staked_amount| {
        require!(
            unstake_amount > 0 && unstake_amount <= *staked_amount,
            "Invalid unstake amount"
        );
        *staked_amount -= &unstake_amount;

        staked_amount.clone()
    });
    if remaining_stake == 0 {
        self.staked_addresses().swap_remove(&caller);
    }

    self.tx().to(caller).egld(unstake_amount).transfer();
}
```

This makes it so if someone wants to perform a full unstake, they can simply not give the argument at all.

[comment]: # (mx-context-auto)

### Unstaking our devnet tokens

Now that we've added the unstake function, let's test it out on devnet. Build your SC again. In contract root, at path `staking-contract/` run:

```bash
sc-meta all build
```

And then regenerate the interactor, running in terminal, also in contract root:

```bash
sc-meta all snippets
```

:::warning
Make sure `wallet_address` stores the wallet that has to execute the transactions.
:::

Let's unstake some EGLD! Replace variable `opt_unstake_amount` from `unstake` function that is at `staking-contract/interactor/src/interact.rs` with:

```rust
let opt_unstake_amount = OptionalValue::Some(BigUint::<StaticApi>::from(500000000000000000u128));
```

And the run in terminal at path `staking-contract/interactor`:

```bash
cargo run unstake
```

Now run this function, and you'll get this result:  
![img](/developers/staking-contract-tutorial-img/first_unstake.png)

...but why? We just added the function! Well, we might've added it to our code, but the contract on the devnet still has our old code. So, how do we upload our new code?

[comment]: # (mx-context-auto)

## Upgrading smart contracts

Since we've added some new functionality, we also want to update the currently deployed implementation. **Build the contract** and then run the following command at path `staking-contract/interactor`:

```bash
cargo run upgrade
```

:::note Attention required
All the storage is kept on upgrade, so make sure any storage changes you make to storage mapping are backwards compatible!
:::

[comment]: # (mx-context-auto)

## Try unstaking again

Try running the `unstake` snippet again. This time, it should work just fine. Afterwards, let's query our staked amount through `getStakingPosition`, to see if it updated our amount properly.

:::tip
Make sure that function `staking_position` has the changes previously made.
:::

```bash
cargo run getStakingPosition
```

```bash
Result: 500000000000000001
```

We had 1 EGLD, and we've unstaked 0.5 EGLD. Now we have 0.5 EGLD staked. (with the extra 1 fraction of EGLD we've staked initially).

[comment]: # (mx-context-auto)

## Unstake with no arguments

Let's also test the optional argument functionality. Replace `opt_unstake_amount` variable from `unstake` function that is inside `staking-contract/interactor/src/interact.rs` with:

```rust
let opt_unstake_amount: OptionalValue<BigUint<StaticApi>> = OptionalValue::None;
```

And then unstake:

```bash
cargo run unstake
```

Let's also query `stakingPosition` and `stakedAddresses` afterwards to see if the state was cleaned up properly:

```bash
cargo run getStakingPosition
```

```bash
Result: 0
```

```bash
cargo run getStakedAddresses
```

As you can see, we get an empty result (which means the value 0), and an empty array respectively.

[comment]: # (mx-context-auto)

## Writing tests

As you might've noticed, it can be quite a chore to keep upgrading the contract after every little change, especially if all we want to do is test a new feature. So let's recap what we've done until now:

- deploy our contract
- stake
- partial unstake
- full unstake

:::note
A more detailed explanation of Rust tests can be found [here](https://docs.multiversx.com/developers/testing/rust/sc-test-overview/).
:::

Before developing the tests, you will have to generate the contract's [proxy](/docs/developers/transactions/tx-proxies.md).

You will add to `./staking-contract/sc-config.toml`:

```toml
[[proxy]]
path = "src/staking_contract_proxy.rs"
```

Then run in terminal at path `./staking-contract`:

```bash
sc-meta all proxy
```

You will see at path `./staking-contract` the contract's proxy that will help us in developing tests: `staking_contract_proxy.rs`.

Lastly, link the proxy to the project. In the import section of file `./staking-contract/src/staking_contract.rs` add:

```rust
pub mod staking_contract_proxy;
```

To test the previously described scenario, we're going to need a user address, and a new test function. **Create** file `staking_contract_blackbox_test.rs` in `staking-contract/tests` with the following:

```rust
use multiversx_sc::{
    imports::OptionalValue,
    types::{TestAddress, TestSCAddress},
};
use multiversx_sc_scenario::{imports::MxscPath, ExpectValue, ScenarioTxRun, ScenarioWorld};
use staking_contract::staking_contract_proxy;

const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const STAKING_CONTRACT_ADDRESS: TestSCAddress = TestSCAddress::new("staking-contract");
const USER_ADDRESS: TestAddress = TestAddress::new("user");
const WASM_PATH: MxscPath = MxscPath::new("output/staking-contract.mxsc.json");
const USER_BALANCE: u64 = 1_000_000_000_000_000_000;

struct ContractSetup {
    pub world: ScenarioWorld,
}

impl ContractSetup {
    pub fn new() -> Self {
        let mut world = ScenarioWorld::new();
        world.set_current_dir_from_workspace("staking-contract");
        world.register_contract(WASM_PATH, staking_contract::ContractBuilder);

        world.account(OWNER_ADDRESS).nonce(1).balance(0);
        world.account(USER_ADDRESS).nonce(1).balance(USER_BALANCE);

        // simulate deploy
        world
            .tx()
            .from(OWNER_ADDRESS)
            .typed(staking_contract_proxy::StakingContractProxy)
            .init()
            .code(WASM_PATH)
            .new_address(STAKING_CONTRACT_ADDRESS)
            .run();

        ContractSetup { world }
    }
}

#[test]
fn stake_unstake_test() {
    let mut setup = ContractSetup::new();

    setup
        .world
        .check_account(USER_ADDRESS)
        .balance(USER_BALANCE);
    setup.world.check_account(OWNER_ADDRESS).balance(0);

    // stake full
    setup
        .world
        .tx()
        .from(USER_ADDRESS)
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .stake()
        .egld(USER_BALANCE)
        .run();

    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(USER_BALANCE))
        .run();

    setup.world.check_account(USER_ADDRESS).balance(0);
    setup
        .world
        .check_account(STAKING_CONTRACT_ADDRESS)
        .balance(USER_BALANCE);

    // unstake partial
    setup
        .world
        .tx()
        .from(USER_ADDRESS)
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .unstake(OptionalValue::Some(USER_BALANCE / 2))
        .run();

    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(USER_BALANCE / 2))
        .run();

    setup
        .world
        .check_account(USER_ADDRESS)
        .balance(USER_BALANCE / 2);
    setup
        .world
        .check_account(STAKING_CONTRACT_ADDRESS)
        .balance(USER_BALANCE / 2);

    // unstake full
    setup
        .world
        .tx()
        .from(USER_ADDRESS)
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .unstake(OptionalValue::None::<u64>)
        .run();

    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(0u8))
        .run();

    setup
        .world
        .check_account(USER_ADDRESS)
        .balance(USER_BALANCE);
    setup
        .world
        .check_account(STAKING_CONTRACT_ADDRESS)
        .balance(0);
}
```

We've added a `USER_ADDRESS` constant, which is initiated with `USER_BALANCE` EGLD in their account.

:::note
For the test we're going to use small numbers for balances, since there is no reason to work with big numbers. For this test, we're using 1 EGLD for user balance.
:::

Then, we've staked the user's entire balance, unstaked half, then unstaked fully. After each transaction, we've checked the smart contract's internal staking storage, and also the balance of the user and the smart contract respectively.

[comment]: # (mx-context-auto)

### Running the test

To run a test, you can use click on the `Run Test` button from under the test name.

![img](/developers/staking-contract-tutorial-img/running_rust_test.png)

There is also a `Debug` button, which can be used to debug smart contracts. More details on that [here](/developers/testing/sc-debugging/).

Alternatively, you can run all the tests in the file by running the following command in the terminal, in the `./staking-contract` folder:

```bash
sc-meta test
```

[comment]: # (mx-context-auto)

## Staking Rewards

Right now, there is no incentive to stake EGLD into this smart contract. Let's say we want to give every staker 10% APY (Annual Percentage Yield). For example, if someone staked 100 EGLD, they will receive a total of 10 EGLD per year.

For this, we're also going to need to save the time at which each user staked. Also, we can't simply make each user wait one year to get their rewards. We need a more fine-tuned solution, so we're going to calculate rewards per block instead of per year.

:::tip
You can also use rounds, timestamp, epochs etc. for time keeping in smart contracts, but number of blocks is the recommended approach.
:::

[comment]: # (mx-context-auto)

### User-defined struct types

A single `BigUint` for each user is not enough anymore. As stated before, we need to also store the stake block, and we need to update this block number on every action.

So we're going to use a struct:

```rust
pub struct StakingPosition<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_action_block: u64,
}
```

:::note
Every managed type from the SpaceCraft needs a `ManagedTypeApi` implementation, which allows it to access the VM functions for performing operations. For example, adding two `BigUint` numbers, concatenating two `ManagedBuffers`, etc. Inside smart contract code, the `ManagedTypeApi` associated type is automatically added, but outside of it, we have to manually specify it.
:::

[comment]: # (mx-context)

Additionally, since we need to store this in storage, we need to tell the Rust framework how to encode and decode this type. This can be done automatically by deriving (i.e. auto-implementing) these traits, via the `#[derive]` annotation:

```rust
use multiversx_sc::derive_imports::*;

#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Debug)]
pub struct StakingPosition<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_action_block: u64,
}
```

We've also added `#[type_abi]`, since this is required for ABI generation. ABIs are used by decentralized applications and such to decode custom smart contract types, but this is out of scope of this tutorial.

Additionally, we've added `PartialEq` and `Debug` derives, for easier use within tests. This will not affect performance in any way, as the code for these is only used during testing/debugging. `PartialEq` allows us to use `==` for comparing instances, while `Debug` will pretty-print the struct, field by field, in case of errors.

If you want to learn more about how such a struct is encoded, and the difference between top and nested encoding/decoding, you can read more [here](/developers/data/serialization-overview).

[comment]: # (mx-context-auto)

### Rewards formula

A block is produced about every 6 seconds, so total blocks in a year would be seconds in year, divided by 6. More specifically:

```rust
pub const BLOCKS_IN_YEAR: u64 = 60 * 60 * 24 * 365 / 6;
```

More specifically: 60 seconds per minute _60 minutes per hour_ 24 hours per day \* 365 days, divided by the 6-second block duration.

:::note
This is calculated and replaced with the exact value at compile time, so there is no performance penalty of having a constant with mathematical operations in its value definition.
:::

[comment]: # (mx-context)

Having defined this constant, rewards formula should look like this:

```rust
let reward_amt = apy / 100 * user_stake * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

Using 10% as APY, and assuming exactly one year has passed since last claim, the reward amount would be `10/100 * user_stake`, which is exactly 10% APY.

But there is something wrong with the current formula. We will always get `reward_amt` = 0.

[comment]: # (mx-context-auto)

### BigUint division

BigUint division works the same as unsigned integer division. If you divide `x` by `y`, where `x < y`, you will always get `0` as result. So in our previous example, 10/100 is **NOT** `0.1`, but `0`.

To fix this, we need to take care of our operation order:

```rust
let reward_amt = user_stake * apy / 100 * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

[comment]: # (mx-context-auto)

### How to express percentages like 50.45%?

In this case, we need to extend our precision by using fixed point precision. Instead of having `100` as the maximum percentage, we will extend it to `10_000`, and give `50.45%` as `5_045`. Updating our above formula results in this:

```rust
pub const MAX_PERCENTAGE: u64 = 10_000;

let reward_amt = user_stake * apy / MAX_PERCENTAGE * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

For example, let's assume the user stake is 100, and 1 year has passed. Using `5_045` as APY value, the formula would become:

```rust
reward_amt = 100 * 5_045 / 10_000 = 504_500 / 10_000 = 50
```

:::note
Since we're still using BigUint division, we don't get `50.45`, but `50`. This precision can be increased by using more zeroes for the `MAX_PERCENTAGE` and the respective APY, but this is also "inheritly fixed" on the blockchain, because we work with very big numbers for `user_stake`.
:::

[comment]: # (mx-exclude-context)

## Rewards implementation

Now let's see how this would look in our Rust smart contract code. The smart contract looks like this after doing all the specified changes:

```rust
#![no_std]

use multiversx_sc::derive_imports::*;
use multiversx_sc::imports::*;
pub mod staking_contract_proxy;

pub const BLOCKS_IN_YEAR: u64 = 60 * 60 * 24 * 365 / 6;
pub const MAX_PERCENTAGE: u64 = 10_000;

#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Debug)]
pub struct StakingPosition<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_action_block: u64,
}

#[multiversx_sc::contract]
pub trait StakingContract {
    #[init]
    fn init(&self, apy: u64) {
        self.apy().set(apy);
    }

    #[upgrade]
    fn upgrade(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld().clone_value();
        require!(payment_amount > 0, "Must pay more than 0");

        let caller = self.blockchain().get_caller();
        self.staking_position(&caller).update(|staking_pos| {
            self.claim_rewards_for_user(&caller, staking_pos);

            staking_pos.stake_amount += payment_amount
        });
        self.staked_addresses().insert(caller);
    }

    #[endpoint]
    fn unstake(&self, opt_unstake_amount: OptionalValue<BigUint>) {
        let caller = self.blockchain().get_caller();
        let stake_mapper = self.staking_position(&caller);
        let mut staking_pos = stake_mapper.get();

        let unstake_amount = match opt_unstake_amount {
            OptionalValue::Some(amt) => amt,
            OptionalValue::None => staking_pos.stake_amount.clone(),
        };
        require!(
            unstake_amount > 0 && unstake_amount <= staking_pos.stake_amount,
            "Invalid unstake amount"
        );

        self.claim_rewards_for_user(&caller, &mut staking_pos);
        staking_pos.stake_amount -= &unstake_amount;

        if staking_pos.stake_amount > 0 {
            stake_mapper.set(&staking_pos);
        } else {
            stake_mapper.clear();
            self.staked_addresses().swap_remove(&caller);
        }

        self.tx().to(caller).egld(unstake_amount).transfer();
    }

    #[endpoint(claimRewards)]
    fn claim_rewards(&self) {
        let caller = self.blockchain().get_caller();
        let stake_mapper = self.staking_position(&caller);

        let mut staking_pos = stake_mapper.get();
        self.claim_rewards_for_user(&caller, &mut staking_pos);
        stake_mapper.set(&staking_pos);
    }

    fn claim_rewards_for_user(
        &self,
        user: &ManagedAddress,
        staking_pos: &mut StakingPosition<Self::Api>,
    ) {
        let reward_amount = self.calculate_rewards(staking_pos);
        let current_block = self.blockchain().get_block_nonce();
        staking_pos.last_action_block = current_block;

        if reward_amount > 0 {
            self.send().direct_egld(user, &reward_amount);
        }
    }

    fn calculate_rewards(&self, staking_position: &StakingPosition<Self::Api>) -> BigUint {
        let current_block = self.blockchain().get_block_nonce();
        if current_block <= staking_position.last_action_block {
            return BigUint::zero();
        }

        let apy = self.apy().get();
        let block_diff = current_block - staking_position.last_action_block;

        &staking_position.stake_amount * apy / MAX_PERCENTAGE * block_diff / BLOCKS_IN_YEAR
    }

    #[view(calculateRewardsForUser)]
    fn calculate_rewards_for_user(&self, addr: ManagedAddress) -> BigUint {
        let staking_pos = self.staking_position(&addr).get();
        self.calculate_rewards(&staking_pos)
    }

    #[view(getStakedAddresses)]
    #[storage_mapper("stakedAddresses")]
    fn staked_addresses(&self) -> UnorderedSetMapper<ManagedAddress>;

    #[view(getStakingPosition)]
    #[storage_mapper("stakingPosition")]
    fn staking_position(
        &self,
        addr: &ManagedAddress,
    ) -> SingleValueMapper<StakingPosition<Self::Api>>;

    #[view(getApy)]
    #[storage_mapper("apy")]
    fn apy(&self) -> SingleValueMapper<u64>;
}
```

Now, rebuild the contract and regenerate the proxy:

```bash
sc-meta all build
sc-meta all proxy
```

Let's update our test, to use our new `StakingPosition` struct, and also provide the `APY` as argument for the `init` function.

```rust
use multiversx_sc::{codec::multi_types::OptionalValue, types::Address};
use multiversx_sc_scenario::{
    managed_address, managed_biguint, rust_biguint, whitebox::*, DebugApi,
};
use staking_contract::*;

const WASM_PATH: &'static str = "output/staking-contract.wasm";
const USER_BALANCE: u64 = 1_000_000_000_000_000_000;
const APY: u64 = 1_000; // 10%

struct ContractSetup<ContractObjBuilder>
where
    ContractObjBuilder: 'static + Copy + Fn() -> staking_contract::ContractObj<DebugApi>,
{
    pub b_mock: BlockchainStateWrapper,
    pub owner_address: Address,
    pub user_address: Address,
    pub contract_wrapper:
        ContractObjWrapper<staking_contract::ContractObj<DebugApi>, ContractObjBuilder>,
}

impl<ContractObjBuilder> ContractSetup<ContractObjBuilder>
where
    ContractObjBuilder: 'static + Copy + Fn() -> staking_contract::ContractObj<DebugApi>,
{
    pub fn new(sc_builder: ContractObjBuilder) -> Self {
        let rust_zero = rust_biguint!(0u64);
        let mut b_mock = BlockchainStateWrapper::new();
        let owner_address = b_mock.create_user_account(&rust_zero);
        let user_address = b_mock.create_user_account(&rust_biguint!(USER_BALANCE));
        let sc_wrapper =
            b_mock.create_sc_account(&rust_zero, Some(&owner_address), sc_builder, WASM_PATH);

        // simulate deploy
        b_mock
            .execute_tx(&owner_address, &sc_wrapper, &rust_zero, |sc| {
                sc.init(APY);
            })
            .assert_ok();

        ContractSetup {
            b_mock,
            owner_address,
            user_address,
            contract_wrapper: sc_wrapper,
        }
    }
}

#[test]
fn stake_unstake_test() {
    let mut setup = ContractSetup::new(staking_contract::contract_obj);
    let user_addr = setup.user_address.clone();

    setup
        .b_mock
        .check_egld_balance(&user_addr, &rust_biguint!(USER_BALANCE));
    setup
        .b_mock
        .check_egld_balance(setup.contract_wrapper.address_ref(), &rust_biguint!(0));

    // stake full
    setup
        .b_mock
        .execute_tx(
            &user_addr,
            &setup.contract_wrapper,
            &rust_biguint!(USER_BALANCE),
            |sc| {
                sc.stake();

                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    StakingPosition {
                        stake_amount: managed_biguint!(USER_BALANCE),
                        last_action_block: 0
                    }
                );
            },
        )
        .assert_ok();

    setup
        .b_mock
        .check_egld_balance(&user_addr, &rust_biguint!(0));
    setup.b_mock.check_egld_balance(
        setup.contract_wrapper.address_ref(),
        &rust_biguint!(USER_BALANCE),
    );

    // unstake partial
    setup
        .b_mock
        .execute_tx(
            &user_addr,
            &setup.contract_wrapper,
            &rust_biguint!(0),
            |sc| {
                sc.unstake(OptionalValue::Some(managed_biguint!(USER_BALANCE / 2)));

                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    StakingPosition {
                        stake_amount: managed_biguint!(USER_BALANCE / 2),
                        last_action_block: 0
                    }
                );
            },
        )
        .assert_ok();

    setup
        .b_mock
        .check_egld_balance(&user_addr, &rust_biguint!(USER_BALANCE / 2));
    setup.b_mock.check_egld_balance(
        setup.contract_wrapper.address_ref(),
        &rust_biguint!(USER_BALANCE / 2),
    );

    // unstake full
    setup
        .b_mock
        .execute_tx(
            &user_addr,
            &setup.contract_wrapper,
            &rust_biguint!(0),
            |sc| {
                sc.unstake(OptionalValue::None);

                assert!(sc
                    .staking_position(&managed_address!(&user_addr))
                    .is_empty());
            },
        )
        .assert_ok();

    setup
        .b_mock
        .check_egld_balance(&user_addr, &rust_biguint!(USER_BALANCE));
    setup
        .b_mock
        .check_egld_balance(setup.contract_wrapper.address_ref(), &rust_biguint!(0));
}
```

Now let's run the test... it didn't work. You should see the following error:

[comment]: # (mx-context-auto)

### Storage decode error: input too short

But why? Everything worked fine before. This is because instead of using a simple `BigUint` for staking positions, we now use the `StakingPosition` struct. If you follow the error trace, you will see exactly where it failed:

```
17: staking_contract::StakingContract::stake
             at ./src/empty.rs:29:9
```

Which leads to the following line:

```rust
self.staking_position(&caller).update(|staking_pos| {
            self.claim_rewards_for_user(&caller, staking_pos);

            staking_pos.stake_amount += payment_amount
        });
```

Because we're trying to add a new user, which has no staking entry yet, the decoding fails. For a simple `BigUint`, decoding from an empty storage yields the `0` value, which is exactly what we want, but for a struct type, it cannot give us any default value.

For this reason, we have to add some additional checks. The endpoint implementations will have to be changed to the following (the rest of the code remains the same):

```rust
    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld_value().clone_value();
        require!(payment_amount > 0, "Must pay more than 0");

        let caller = self.blockchain().get_caller();
        let stake_mapper = self.staking_position(&caller);

        let new_user = self.staked_addresses().insert(caller.clone());
        let mut staking_pos = if !new_user {
            stake_mapper.get()
        } else {
            let current_block = self.blockchain().get_block_epoch();
            StakingPosition {
                stake_amount: BigUint::zero(),
                last_action_block: current_block,
            }
        };

        self.claim_rewards_for_user(&caller, &mut staking_pos);
        staking_pos.stake_amount += payment_amount;

        stake_mapper.set(&staking_pos);
    }

    #[endpoint]
    fn unstake(&self, opt_unstake_amount: OptionalValue<BigUint>) {
        let caller = self.blockchain().get_caller();
        self.require_user_staked(&caller);

        let stake_mapper = self.staking_position(&caller);
        let mut staking_pos = stake_mapper.get();

        let unstake_amount = match opt_unstake_amount {
            OptionalValue::Some(amt) => amt,
            OptionalValue::None => staking_pos.stake_amount.clone(),
        };
        require!(
            unstake_amount > 0 && unstake_amount <= staking_pos.stake_amount,
            "Invalid unstake amount"
        );

        self.claim_rewards_for_user(&caller, &mut staking_pos);
        staking_pos.stake_amount -= &unstake_amount;

        if staking_pos.stake_amount > 0 {
            stake_mapper.set(&staking_pos);
        } else {
            stake_mapper.clear();
            self.staked_addresses().swap_remove(&caller);
        }

        self.send().direct_egld(&caller, &unstake_amount);
    }

    #[endpoint(claimRewards)]
    fn claim_rewards(&self) {
        let caller = self.blockchain().get_caller();
        self.require_user_staked(&caller);

        let stake_mapper = self.staking_position(&caller);
        let mut staking_pos = stake_mapper.get();
        self.claim_rewards_for_user(&caller, &mut staking_pos);

        stake_mapper.set(&staking_pos);
    }

    fn require_user_staked(&self, user: &ManagedAddress) {
        require!(self.staked_addresses().contains(user), "Must stake first");
    }
```

For the `stake` endpoint, in case the user was not previously staked, we provide a default entry. The `insert` method of `UnorderedSetMapper` returns `true` if the entry is new, `false` if the user was already in the list, so we can use that result instead of checking for `stake_mapper.is_empty()`.

For the `unstake` and `claimRewards` endpoints, we have to check if the user was already staked, and return an error otherwise (as they'd have nothing to unstake/claim anyway).

Running the test after the suggested changes should work just fine now:

```
running 1 test
test stake_unstake_test ... ok
```

In order to apply these changes on devnet, you should build the contract and then upgrade it. Because we added the APY on init now for the upgrade we will have to pass it as an argument.

```bash
    mxpy --verbose contract upgrade ${SC_ADDRESS} \
    --bytecode=~/Projects/tutorials/staking-contract/output/staking-contract.wasm \
    --recall-nonce --pem=~/MyTestWallets/tutorialKey.pem \
    --gas-limit=20000000 \
    --send --outfile="upgrade-devnet.interaction.json" \
    --proxy=https://devnet-gateway.multiversx.com --chain=D \
    --arguments 100
```

[comment]: # (mx-context-auto)

### Rewards testing

Now that we've implemented rewards logic, let's add the following test to ensure everything works as expected:

```rust
#[test]
fn rewards_test() {
    let mut setup = ContractSetup::new(staking_contract::contract_obj);
    let user_addr = setup.user_address.clone();

    // stake full
    setup
        .b_mock
        .execute_tx(
            &user_addr,
            &setup.contract_wrapper,
            &rust_biguint!(USER_BALANCE),
            |sc| {
                sc.stake();

                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    StakingPosition {
                        stake_amount: managed_biguint!(USER_BALANCE),
                        last_action_block: 0
                    }
                );
            },
        )
        .assert_ok();

    setup.b_mock.set_block_nonce(BLOCKS_IN_YEAR);

    // query rewards
    setup
        .b_mock
        .execute_query(&setup.contract_wrapper, |sc| {
            let actual_rewards = sc.calculate_rewards_for_user(managed_address!(&user_addr));
            let expected_rewards = managed_biguint!(USER_BALANCE) * APY / MAX_PERCENTAGE;
            assert_eq!(actual_rewards, expected_rewards);
        })
        .assert_ok();

    // claim rewards
    setup
        .b_mock
        .execute_tx(
            &user_addr,
            &setup.contract_wrapper,
            &rust_biguint!(0),
            |sc| {
                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    StakingPosition {
                        stake_amount: managed_biguint!(USER_BALANCE),
                        last_action_block: 0
                    }
                );

                sc.claim_rewards();

                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    StakingPosition {
                        stake_amount: managed_biguint!(USER_BALANCE),
                        last_action_block: BLOCKS_IN_YEAR
                    }
                );
            },
        )
        .assert_ok();

    setup.b_mock.check_egld_balance(
        &user_addr,
        &(rust_biguint!(USER_BALANCE) * APY / MAX_PERCENTAGE),
    );

    // query rewards after claim
    setup
        .b_mock
        .execute_query(&setup.contract_wrapper, |sc| {
            let actual_rewards = sc.calculate_rewards_for_user(managed_address!(&user_addr));
            let expected_rewards = managed_biguint!(0);
            assert_eq!(actual_rewards, expected_rewards);
        })
        .assert_ok();
}
```

In the test, we perform the following steps:

- stake 1 EGLD
- set block nonce after 1 year (i.e. simulating 1 year worth of blocks passing)
- querying rewards, which should give use 10% of 1 EGLD = 0.1 EGLD
- claiming said rewards and checking the internal state and user balance
- querying again after claim, to check that double-claim is not possible

This test should work without any errors.

[comment]: # (mx-context-auto)

## Depositing rewards / Conclusion

Currently, there is no way to deposit rewards into the SC, unless the owner makes it payable, which is generally bad practice, and not recommended.

As this is a fairly simple task compared to what we've done already, we'll leave this as an exercise to the reader. You'll have to add a `payable("EGLD")` endpoint, and additionally, a storage mapper that keeps track of the remaining rewards.

Good luck!

In part 2, which will come soon, we'll discuss about how to use custom ESDTs instead of just EGLD.
