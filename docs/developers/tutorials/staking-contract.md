---
id: staking-contract
title: Staking smart contract
---

[comment]: # (mx-abstract)

## Introduction

This tutorial aims to teach you how to write a simple staking contract, and to illustrate and correct the common pitfalls new smart contract developers might fall into.

:::tip
If you find anything not answered here, feel free to ask further questions on the MultiversX Developers Telegram channel: [https://t.me/MultiversXDevelopers](https://t.me/MultiversXDevelopers)
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

## Creating the contract

Run the following command in the folder in which you want your smart contract to be created:

```bash
sc-meta new --name staking-contract --template empty
```

Open VSCode, select **File > Open Folder**, and open the newly created `staking-contract` folder.

[comment]: # (mx-context-auto)

## Building the contract

In the terminal, run the following command to build the contract:

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

A new folder, called `output` was created, which contains the compiled contract code. More on this is used later.

[comment]: # (mx-context-auto)

## First lines of Rust

Currently, we just have an empty contract. Not very useful, is it? So let's add some simple code for it. Since this is a staking contract, we would expect to have a `stake` function, right?

First, remove all the code in the `staking-contract/src/staking_contract.rs` file and replace it with this:

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

Since we want this function to be callable by users, we have to annotate it with `#[endpoint]`. Also, since we want to be able to [receive a payment](/docs/developers/developer-reference/sc-payments.md#receiving-payments), we mark it also as `#[payable("EGLD)]`. For now, we'll use EGLD as our staking token.

:::important
The contract **does NOT** need to be payable for it to receive payments on endpoint calls. The payable flag at contract level is only for receiving payments without endpoint invocation.
:::

We need to see how much a user paid, and save their staking information in storage.

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
    fn stake(&self) {
        let payment_amount = self.call_value().egld().clone();
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

We've also added [`#[view]`](/docs/developers/developer-reference/sc-annotations.md#endpoint-and-view) annotation for the storage mappers, allowing us to later perform queries on those storage entries. You can read more about annotations [here](/developers/developer-reference/sc-annotations/).

If you're confused about some of the functions used or the storage mappers, you can read more here:

- [Smart Contract API Functions](/developers/developer-reference/sc-api-functions)
- [Storage Mappers](/developers/developer-reference/storage-mappers)

Now, there is intentionally written some bad code here. Can you spot any improvements we could make?

1. The last `clone()` from `stake()` function is unnecessary. If you're cloning variables all the time,s then you need to take some time to read the [ownership](https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html) chapter of the Rust book and also about the [implications of cloning](/developers/best-practices/biguint-operations) types from the Rust framework.

2. The `staking_position` does not need an owned value of the `addr` argument. We can pass a reference instead.

3. There is a logic error: what happens if an user stakes twice? Their position will be overwritten with the new value. Instead, we should add the new stake amount to their existing amount, using the [`update`](/docs/developers/developer-reference/storage-mappers.md#update) method.

After fixing these issues, we end up with the following code:

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
    fn stake(&self) {
        let payment_amount = self.call_value().egld().clone();
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

Every smart contract must include a function annotated with [`#[init]`](/docs/developers/developer-reference/sc-annotations.md#init) and another with `#[upgrade]`.

The `init()` function is called when the contract is first deployed, while `upgrade()` is triggered during an upgrade. For now, we need no logic inside it, but we still need to have those functions.

[comment]: # (mx-context-auto)

## Creating a wallet

:::note  
You can skip this section if you already have a Devnet wallet setup.
:::

Open the terminal and run the following commands:

```sh
mkdir -p ~/MyTestWallets
sc-meta wallet new --format pem --outfile ~/MyTestWallets/tutorialKey.pem
```

[comment]: # (mx-context-auto)

## Deploy the contract

Now that we've created a wallet, it's time to deploy our contract.

:::important
Make sure you build the contract before deploying it. Open the terminal and run the following command from the contract root directory:

```bash
sc-meta all build
```

:::

Once the contract is built, generate the interactor:

```bash
sc-meta all snippets
```

Add the interactor to your project. In `staking-contract/Cargo.toml`, add `interactor` as a member of the workspace:

```toml
[workspace]
members = [
    ".",
    "meta",
    "interactor"    # <- new member added
]
```

Next, update the wallet path for sending transactions. In `staking-contract/interactor/src/interact.rs` locate the function `new(config: Config)` and **modify** the `wallet_address` variable with the [absolute path](https://www.redhat.com/en/blog/linux-path-absolute-relative) to your wallet:

```rust
let wallet_address = interactor
    .register_wallet(
        Wallet::from_pem_file("/MyTestWallets/tutorialKey.pem").expect(
            "Unable to load wallet. Please ensure the file exists.",
        ),
    )
    .await;
```

Finally, deploy the contract to Devnet:

```bash
cd interactor/
cargo run deploy
```

:::note  
To use Testnet instead, update `gateway_uri` in `staking-contract/interactor/config.toml` to: `https://testnet-gateway.multiversx.com`.

For  mainnet, use: `https://gateway.multiversx.com`.

More details can be found [here](/developers/constants/).
:::

You're going to see an error like the following:

```bash
error sending tx (possible API failure): transaction generation failed: insufficient funds for address erd1...
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
```

This is because your account has no EGLD in it.

[comment]: # (mx-context-auto)

### Getting EGLD on Devnet

There are many ways of getting EGLD on Devnet:

- Through the Devnet wallet;
- Using an external faucet;
- From the [MultiversX Builders Discord Server faucet](https://discord.gg/multiversxbuilders);
- By asking a team member on [Telegram](https://t.me/MultiversXDevelopers).

[comment]: # (mx-context-auto)

#### Getting EGLD through devnet wallet

Go to [Devnet Wallet](https://devnet-wallet.multiversx.com) and login to your account using your PEM file. From the left side menu, select *Faucet*:

![img](/developers/staking-contract-tutorial-img/wallet_faucet.png)

Request the tokens. After a few seconds you should have **5 xEGLD** in your wallet.

[comment]: # (mx-context-auto)

#### Getting EGLD through external faucet

Go to [https://r3d4.fr/faucet](https://r3d4.fr/faucet) and submit a request:  
![img](/developers/staking-contract-tutorial-img/external_faucet.png)

Make sure you selected `Devnet` and input **your** address!

It might take a little while, depending on how "busy" the faucet is.

[comment]: # (mx-context-auto)

### Deploying the contract, second try

Run the `deploy` command again and let's see the results:

```bash
sender's recalled nonce: 0
-- tx nonce: 0
sc deploy tx hash: 8a007...
deploy address: erd1qqqqqqqqqqqqq...
new address: erd1qqqqqqqqqqqqq...
```

Alternatively, you can check the address in the logs tab on [Devnet Explorer](https://devnet-explorer.multiversx.com/transactions), namely the `SCDeploy` method.

[comment]: # (mx-context-auto)

#### Too much gas error?

Everything should work just fine, but you'll see this message:  
![img](/developers/staking-contract-tutorial-img/too_much_gas.png)

This is **not** an error. This simply means you provided way more gas than needed, so all the gas was consumed instead of the leftover being returned to you.

This is done to protect the network against certain attacks. For instance, one could always provide the maximum gas limit and only use very little, decreasing the network's throughput significantly.

[comment]: # (mx-context-auto)

## The first stake

Let's update the `stake` function from `staking-contract/interactor/src/interact.rs` to do the first stake.

Initialize the `egld_amount` variable with `1` instead of `0`:

```rust
let egld_amount = BigUint::<StaticApi>::from(1u128);
```

This variable represents the amount of EGLD to be sent with the transaction.

Let's stake! At path `staking-contract/interactor` run the following command:

```bash
cargo run stake
```

We've now successfully staked 1 EGLD... or have we?

If we look at the transaction, that's not quite the case:

![img](/developers/staking-contract-tutorial-img/first_stake.png)

[comment]: # (mx-context-auto)

### Why was a smaller amount of EGLD sent?

This happens because EGLD uses **18 decimals**. So, to send 1 EGLD, you actually need to send the value `1000000000000000000` (i.e. 10<sup>18</sup>).

The blockchain works only with unsigned integers. Floating point numbers are not allowed. The only reason the explorer displays the balances with a floating point is because it's much more user-friendly to tell someone they have 1 EGLD instead of 1000000000000000000 EGLD, but internally, only the integer value is used.

[comment]: # (mx-context-auto)

### But how do I send 0.5 EGLD?

Since we know EGLD has 18 decimals, we have to simply multiply 0.5 by 10<sup>18</sup>, which yields 500000000000000000.

[comment]: # (mx-context-auto)

### Actually staking 1 EGLD

To stake 1 EGLD, simply update the `egld_amount` in the `stake` function from `staking-contract/interactor/src/interact.rs` with the following:

```rust
let egld_amount = BigUint::<StaticApi>::from(1000000000000000000u128);
```

Now let's try staking again:

![img](/developers/staking-contract-tutorial-img/second_stake.png)

[comment]: # (mx-context-auto)

## Performing contract queries

To perform smart contract queries for the `getStakingPosition` view, update the `addr` variable in the `staking_position` function from `staking-contract/interactor/src/interact.rs` with the address of the wallet you used for the staking transaction:

```rust
let addr = bech32::decode("erd1vx...");
```

Query the staking position by running the following command in the terminal, inside the `staking-contract/interactor` directory:

```bash
cargo run getStakingPosition
```

This will show the staking amount according to the smart contract's internal state:

```bash
Result: 1000000000000000001
```

The result includes 1 EGLD plus the initial 10<sup>-18</sup> EGLD that was sent.

Next, query the **stakers list**. Replace the next line from `staked_addresses` **function** in `staking-contract/interactor/src/interact.rs`:

```rust
println!("Result: {result_value:?}");
```

with the following:

```rust
for result in result_value.iter() {
    println!("Result: {}", Bech32Address::from(result).to_bech32_string());
} 
```

It is necessary to iterate through `result_value` because it is a [`MultiValueVec`](/docs/developers/data/multi-values.md#standard-multi-values) of `Address`. Each address is converted to `Bech32Address` to ensure it’s printed in Bech32 format, not as raw ASCII.

Run in terminal at path `staking-contract/interactor`:

```bash
cargo run getStakedAddresses
```

Running this function should yield a result like this:

```bash
Result: erd1vx...
```

[comment]: # (mx-context-auto)

## Adding unstake functionality

Currently, users can only stake, but they cannot actually get their EGLD back... at all. Let's add the unstake functionality in our smart contract:

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

You might notice the `stake_mapper` variable. Just to remind you, the mapper's definition looks like this:

```rust
#[storage_mapper("stakingPosition")]
fn staking_position(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
```

In Rust terms, this is a method of our contract trait, with one argument, that returns a [`SingleValueMapper<BigUint>`](/docs/developers/developer-reference/storage-mappers.md#singlevaluemapper). All [mappers](/docs/developers/developer-reference/storage-mappers.md) are nothing more than structure types that provide an interface to the storage API.

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

As you might notice, the code changed quite a bit:

1. To handle invalid user input, we used the `require!` statement;
2. Previously, we used `clear` to reset the staking position. However, now that we need to modify the stored value, we use the `update` method, which allows us to change the currently stored value through a mutable reference.

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

### Unstaking our Devnet tokens

Now that the unstake function has been added, let's test it out on Devnet. Build the smart contract again. In the contract root (`staking-contract/`), run the next command:

```bash
sc-meta all build
```

After building the contract, regenerate the interactor by running the following command in the terminal, also in the contract root:

```bash
sc-meta all snippets
```

:::warning
Make sure `wallet_address` stores the wallet that has to execute the transactions.
:::

Let's unstake some EGLD! Replace variable `opt_unstake_amount` from `unstake` function in `staking-contract/interactor/src/interact.rs` with:

```rust
let opt_unstake_amount = OptionalValue::Some(BigUint::<StaticApi>::from(500000000000000000u128));
```

Then, run in terminal at path `staking-contract/interactor`:

```bash
cargo run unstake
```

Now run this function, and you'll get this result:

![img](/developers/staking-contract-tutorial-img/first_unstake.png)

...but why? We just added the function!

Well, we might've added it to our code, but the contract on the Devnet still has our old code. So, how do we upload our new code?

[comment]: # (mx-context-auto)

## Upgrading smart contracts

Since we've added some new functionality, we also want to update the currently deployed implementation. **Build the contract** and then run the following command at path `staking-contract/interactor`:

```bash
cargo run upgrade
```

:::note Attention required
All the storage is kept on upgrade, so make sure any storage changes you make to storage mapping are **backwards compatible**!
:::

[comment]: # (mx-context-auto)

## Try unstaking again

Run the `unstake` snippet again. This time, it should work just fine. Afterwards, let's query our staked amount through `getStakingPosition`, to see if it updated our amount properly.

:::warning
Make sure that function `staking_position` has the changes previously made.
:::

```bash
cargo run getStakingPosition
```

```bash
Result: 500000000000000001
```

We had 1 EGLD, and we unstaked 0.5 EGLD. Now, we have 0.5 EGLD staked. (with the extra 1 fraction of EGLD we've staked initially).

[comment]: # (mx-context-auto)

### Unstake with no arguments

Now let’s test how the contract behaves when no amount is explicitly provided. This will confirm that the `OptionalValue::None` path works as expected.

In `staking-contract/interactor/src/interact.rs`, update the `unstake` function. Replace the `opt_unstake_amount` variable with:

```rust
let opt_unstake_amount: OptionalValue<BigUint<StaticApi>> = OptionalValue::None;
```

And then unstake:

```bash
cargo run unstake
```

After unstaking, query `stakingPosition` and `stakedAddresses`    to see if the state was cleaned up properly:

These should show that:

- Your staking position is now empty: 0 EGLD;
- Your address has been removed from the stakers list.

[comment]: # (mx-context-auto)

## Writing tests

As you might've noticed, it can be quite a chore to keep upgrading the contract after every little change, especially if all we want to do is test a new feature. So, let's recap what we've done until now:

- deploy our contract
- stake
- partial unstake
- full unstake

:::tip
A more detailed explanation of Rust tests can be found [here](https://docs.multiversx.com/developers/testing/rust/sc-test-overview/).
:::

Before developing the tests, you will have to generate the contract's [proxy](/docs/developers/transactions/tx-proxies.md).

You will add to `staking-contract/sc-config.toml`:

```toml
[[proxy]]
path = "tests/staking_contract_proxy.rs"
```

Then run in terminal at path `staking-contract/`:

```bash
sc-meta all proxy
```

You’ll find the contract’s proxy in `staking-contract/tests`, inside the file `staking_contract_proxy.rs`. This proxy will be used to help us write and run tests for the smart contract.

To test the previously described scenario, we're going to need a user address, and a new test function.

**Create** file `staking_contract_blackbox_test.rs` in `staking-contract/tests` with the following:

```rust
mod staking_contract_proxy;
use multiversx_sc::{
    imports::OptionalValue,
    types::{TestAddress, TestSCAddress},
};
use multiversx_sc_scenario::imports::*;

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

We've added a `USER_ADDRESS` constant, which is initialized with `USER_BALANCE` EGLD in their account.

:::note
For the test we're going to use small numbers for balances, since there is no reason to work with big numbers. For this test, we're using 1 EGLD for user balance.
:::

Then, we've staked the user's entire balance, unstaked half, then unstaked fully. After each transaction, we've checked the smart contract's internal staking storage, and also the balance of the user and the smart contract respectively.

[comment]: # (mx-context-auto)

### Running the test

To run a test, you can use click on the `Run Test` button from under the test name.

![img](/developers/staking-contract-tutorial-img/running_rust_test.png)

There is also a `Debug` button, which can be used to debug smart contracts. More details on that [here](/developers/testing/sc-debugging/).

Alternatively, you can run all the tests in the file by running the following command in the terminal, in the `staking-contract/` folder:

```bash
sc-meta test
```

[comment]: # (mx-context-auto)

## Staking Rewards

Right now, there is no incentive to stake EGLD in this smart contract. Let's say we want to give every staker 10% APY (Annual Percentage Yield). For example, if someone staked 100 EGLD, they will receive a total of 10 EGLD per year.

For this, we're also going to need to save the time at which each user staked. Also, we can't simply make each user wait one year to get their rewards. We need a more fine-tuned solution, so we're going to calculate rewards per block instead of per year.

:::tip
You can also use rounds, timestamp, epochs etc. for time keeping in smart contracts, but number of blocks is the recommended approach.
:::

[comment]: # (mx-context-auto)

### User-defined struct types

A single `BigUint` for each user is not enough anymore. As stated before, we need to also store the stake block, and we need to update this block number on every action.

So, we're going to use a struct:

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

If you want to learn more about how such a structure is encoded, and the difference between top and nested encoding/decoding, you can read more [here](/developers/data/serialization-overview).

[comment]: # (mx-context-auto)

### Rewards formula

A block is produced about every 6 seconds, so total blocks in a year would be seconds in year, divided by 6:

```rust
pub const BLOCKS_IN_YEAR: u64 = 60 * 60 * 24 * 365 / 6;
```

More specifically: *60 seconds per minute* x *60 minutes per hour* x *24 hours per day*  x *365 days*, divided by the 6-second block duration.

:::note
This is calculated and replaced with the exact value at compile time, so there is no performance penalty of having a constant with mathematical operations in its value definition.
:::

[comment]: # (mx-context)

Having defined this constant, rewards formula should look like this:

```rust
let reward_amt = apy / 100 * user_stake * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

Using 10% as the APY, and assuming exactly one year has passed since last claim.

In this case, the reward should be calculated as: `10/100 * user_stake`, which is exactly 10% APY.

However, there is something wrong with the current formula. We will always get `reward_amt` = 0.

[comment]: # (mx-context-auto)

### BigUint division

BigUint division works the same as unsigned integer division. If you divide `x` by `y`, where `x < y`, you will always get `0` as result. So in our previous example, 10/100 is **NOT** `0.1`, but `0`.

To fix this, we need to take care of our operation order:

```rust
let reward_amt = user_stake * apy / 100 * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

[comment]: # (mx-context-auto)

### How to express percentages like 50.45%?

In this case, we need to extend our precision by using fixed point precision. Instead of having `100` as the maximum percentage, we will extend it to `100_00`, and give `50.45%` as `50_45`. Updating our above formula results in this:

```rust
pub const MAX_PERCENTAGE: u64 = 100_00;

let reward_amt = user_stake * apy / MAX_PERCENTAGE * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

For example, let's assume the user stake is 100, and 1 year has passed. Using `50_45` as APY value, the formula would become:

```rust
reward_amt = 100 * 50_45 / 100_00 = 5045_00 / 100_00 = 50
```

:::note
Since we're still using the BigUint division, we don't get `50.45`, but `50`. This precision can be increased by using more zeroes for the `MAX_PERCENTAGE` and the respective APY, but this is also "inherently fixed" on the blockchain because we work with very big numbers for `user_stake`.
:::

[comment]: # (mx-exclude-context)

## Rewards functionality

[comment]: # (mx-exclude-context)

### Implementation

Now let's see how this would look in our Rust smart contract code. The smart contract looks like this after doing all the specified changes:

```rust
#![no_std]

use multiversx_sc::derive_imports::*;
use multiversx_sc::imports::*;

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
        let payment_amount = self.call_value().egld().clone();
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
            self.tx().to(user).egld(&reward_amount).transfer();
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

Let's update our test, to use our new `StakingPosition` structure, and also provide the `APY` as an argument for the `init` function.

```rust
mod staking_contract_proxy;
use multiversx_sc::{
    imports::OptionalValue,
    types::{BigUint, TestAddress, TestSCAddress},
};
use multiversx_sc_scenario::imports::*;
use staking_contract_proxy::StakingPosition;

const OWNER_ADDRESS: TestAddress = TestAddress::new("owner");
const USER_ADDRESS: TestAddress = TestAddress::new("user");
const STAKING_CONTRACT_ADDRESS: TestSCAddress = TestSCAddress::new("staking-contract");
const WASM_PATH: MxscPath = MxscPath::new("output/staking-contract.mxsc.json");
const USER_BALANCE: u64 = 1_000_000_000_000_000_000;
const APY: u64 = 10_00; // 10%

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
            .init(APY)
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

    let expected_result_1 = StakingPosition {
        stake_amount: BigUint::from(USER_BALANCE),
        last_action_block: 0,
    };

    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(expected_result_1))
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

    let expected_result_2 = StakingPosition {
        stake_amount: BigUint::from(USER_BALANCE / 2),
        last_action_block: 0,
    };
    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(expected_result_2))
        .run();

    let staked_addresses_1 = setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staked_addresses()
        .returns(ReturnsResultUnmanaged)
        .run();

    assert!(staked_addresses_1
        .into_vec()
        .contains(&USER_ADDRESS.to_address()));

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

    let staked_addresses_2 = setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staked_addresses()
        .returns(ReturnsResultUnmanaged)
        .run();
    assert!(staked_addresses_2.is_empty());

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

Now let's run the test... **it didn't work**. You should see the following error:

```bash
Error: result code mismatch.
Tx id: ''
Want: "0"
Have: 4
Message: storage decode error (key: stakingPositionuser____________________________): input too short
```

But why? Everything worked fine before.

This is because instead of using a simple `BigUint` for staking positions, we now use the `StakingPosition` structure. If you follow the error trace, you will see exactly where it failed:

```bash
28: staking_contract::StakingContract::stake
             at ./src/staking_contract.rs:33:9
```

Which leads to the following line:

```rust
self.staking_position(&caller).update(|staking_pos| {
    self.claim_rewards_for_user(&caller, staking_pos);

    staking_pos.stake_amount += payment_amount
});
```

Because we're trying to add a new user, which has no staking entry yet, the decoding fails.

For a simple `BigUint`, decoding from an empty storage yields the `0` value, which is exactly what we want, but for a struct type, it cannot give us any default value.

For this reason, we have to add some additional checks. The endpoint implementations will have to be changed to the following (the rest of the code remains the same):

```rust
#[payable("EGLD")]
#[endpoint]
fn stake(&self) {
    let payment_amount = self.call_value().egld().clone();
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

    self.tx().to(caller).egld(unstake_amount).transfer();
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

For the `stake` endpoint, if the user was not previously staked, we provide a default entry. The `insert` method of `UnorderedSetMapper` returns `true` if the entry is new and `false` if the user already exists in the list. This means we can use that result directly, instead of checking for `stake_mapper.is_empty()`.

For the `unstake` and `claimRewards` endpoints, we have to check if the user was already staked and return an error otherwise (as they'd have nothing to unstake/claim anyway).

Once you've applied all the suggested changes, **rebuilt the contract** and **regenerate the proxy**, running the test should work just fine now:

```bash
running 1 test
test stake_unstake_test ... ok
```

In order to apply these changes on devnet, you should build the contract, regenerate the interactor and then upgrade it.

:::warning
Whenever you regenerate the interactor, make sure that wallet_address points to the wallet you intend to use for executing transactions.

By default, the interactor registers Alice's wallet, so you’ll need to update wallet_address manually if you’re using a different one.
:::

```bash
sc-meta all build
sc-meta all snippets
cd interactor/
```

Set the `apy` variable inside the `upgrade` function from `staking-contract/interactor/src/interact.rs` to `100`, then run:

```bash
cargo run upgrade
```

To verify the change, query the `apy` storage mapper by running:

```bash
cargo run getApy
```

You should see the following output:

```bash
Result: 100
```

[comment]: # (mx-context-auto)

### Testing

Now that we've implemented rewards logic, let's add the following test to `staking-contract/tests/staking_contract_blackbox_test.rs`:

```rust
#[test]
fn rewards_test() {
    let mut setup = ContractSetup::new();

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

    let expected_result_1 = StakingPosition {
        stake_amount: BigUint::from(USER_BALANCE),
        last_action_block: 0,
    };

    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(&expected_result_1))
        .run();

    setup.world.current_block().block_nonce(BLOCKS_IN_YEAR);

    // query rewards
    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .calculate_rewards_for_user(USER_ADDRESS)
        .returns(ExpectValue(
            BigUint::from(USER_BALANCE) * APY / MAX_PERCENTAGE,
        ))
        .run();

    // claim rewards
    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(&expected_result_1))
        .run();

    setup
        .world
        .tx()
        .from(USER_ADDRESS)
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .claim_rewards()
        .run();

    let expected_result_2 = StakingPosition {
        stake_amount: BigUint::from(USER_BALANCE),
        last_action_block: BLOCKS_IN_YEAR,
    };
    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .staking_position(USER_ADDRESS)
        .returns(ExpectValue(expected_result_2))
        .run();

    setup
        .world
        .check_account(USER_ADDRESS)
        .balance(BigUint::from(USER_BALANCE) * APY / MAX_PERCENTAGE);

    // query rewards after claim
    setup
        .world
        .query()
        .to(STAKING_CONTRACT_ADDRESS)
        .typed(staking_contract_proxy::StakingContractProxy)
        .calculate_rewards_for_user(USER_ADDRESS)
        .returns(ExpectValue(0u32))
        .run();
}
```

In the test, we perform the following steps:

- Stake 1 EGLD;
- Set block nonce after 1 year (i.e. simulating 1 year worth of blocks passing);
- Querying rewards, which should give use 10% of 1 EGLD = 0.1 EGLD;
- Claiming said rewards and checking the internal state and user balance;
- Querying again after claim, to check that double-claim is not possible.

This test should work without any errors.

[comment]: # (mx-context-auto)

## Conclusion

Currently, there is no way to deposit rewards into the smart contract, unless the owner makes it payable, which is generally bad practice, and not recommended.

As this is a fairly simple task compared to what we've done already, we'll leave this as an exercise to the reader. You'll have to add a `payable("EGLD")` endpoint, and additionally, a storage mapper that keeps track of the remaining rewards.

Good luck!
