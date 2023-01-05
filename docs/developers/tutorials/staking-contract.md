---
id: staking-contract
title: Staking smart contract tutorial
---

## Introduction

This tutorial aims to teach you how to write a simple staking contract, and to illustrate and correct the common pitfalls new smart contract developers might fall into.  

If you find anything not answered here, feel free to ask further questions on the MultiversX Developers Telegram channel: https://t.me/MultiversXDevelopers

## Prerequisites

### erdpy

First and foremost, you need to have erdpy installed: https://docs.multiversx.com/sdk-and-tools/erdpy/installing-erdpy/

If you already have erdpy installed, make sure to update it to the latest version, using the same instructions as for the installation.

We're going to use erdpy for interacting with our contracts, so if you need more details about some of the steps we will perform, you can check here for more detailed explanations regarding what each command does: https://docs.multiversx.com/sdk-and-tools/erdpy/smart-contract-interactions/

### Rust

Once you have erdpy installed, you also have to install Rust through it, and the VM tools for testing:
```
erdpy deps install rust

erdpy deps install vmtools --overwrite
```

If you installed Rust already without erdpy, you might run into some issues when building your smart contracts. It's recommended to uninstall Rust, and install it through erdpy instead.

Example of error:
```
error[E0554]: #![feature] may not be used on the stable release channel
--> /home/user/elrondsdk/vendor-rust/registry/src/github.com-1ecc6299db9ec823/elrond-wasm-derive-0.33.0/src/lib.rs:4:12
```

### VSCode and rust-analyser extension

VSCode: https://code.visualstudio.com/

Assuming you're on Ubuntu, download the `.deb` version. Go to that folder:
- open folder in terminal
- run the following command: `sudo dpkg -i downloaded_file_name`

rust-analyser: https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer

MultiversX VSCode extension: https://marketplace.visualstudio.com/items?itemName=MultiversX.vscode-elrond-ide

Both can be easily installed from the "Extensions" menu in VSCode.  

## Creating the contract

Run the following command in the folder in which you want your smart contract to be created:
```
erdpy contract new staking-contract --template empty
```

Open VSCode, select File -> Open Folder, and open the newly created `staking-contract` folder.

You should then have the following structure:  
![img](/developers/staking-contract-tutorial-img/folder_structure.png)

For now, comment all the code in the `./tests/empty_rust_test.rs` file (ctrl + "A", then ctrl + "/"). Otherwise, it will keep popping up errors as we modify the contract's code.  

## Setting up the workspace

Now, to have all the extensions work properly, we have to set up our workspace. This is done by pressing `ctrl + shift + P` and selecting the "MultiversX: Setup Workspace" option from the menu. Choose the "Yes" option on the pop-up menu.

Now let's open the MultiversX VSCode extension and try building our contract, to see if everything is properly set up. Go to the extension's tab, right-click on "staking-contract" and select the "Build Contract" option:  
![img](/developers/staking-contract-tutorial-img/elrond_ide_extension.png)

Alternatively, you can run `erdpy --verbose contract build` yourself from the VSCode terminal. The command should be run inside the staking-contract folder.

After the building has completed, our folder should look like this:  
![img](/developers/staking-contract-tutorial-img/folder_structure_2.png)

A new folder, called `output` was created, which contains the compiled contract code. More on this is used later. For now, let's continue.

## Your first lines of Rust

Currently, we just have an empty contract. Not very useful, is it? So let's add some simple code for it. Since this is a staking contract, we'd expect to have a `stake` function, right?

First, remove all the code in the `./src/empty.rs` file and replace it with this:
```rust
#![no_std]

elrond_wasm::imports!();

#[elrond_wasm::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {}
}

```

Since we want this function to be callable by users, we have to annotate it with `#[endpoint]`. Also, since we want to be able to receive a payment, we mark it also as `#[payable("EGLD)]`. For now, we'll use EGLD as our staking token. 

:::note
The contract does NOT need to be payable for it to receive payments on endpoint calls. The payable flag at contract level is only for receiving payments without endpoint invocation.
::: 

Now, it's time to add an implementation for the function. We need to see how much a user paid, and save their staking information in storage. We end up with this code:
```rust
#![no_std]

elrond_wasm::imports!();

#[elrond_wasm::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld_value();
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

`require!` is a macro that is a shortcut for `if !condition { signal_error(msg) }`. Signalling an error will terminate the execution and revert any changes made to the internal state, including token transfers from and to the SC. In this case, there is no reason to continue if the user did not pay anything.

We've also added #[view] annotation for the storage mappers, so we can later perform queries on those storage entries. You can read more about annotations here: https://docs.multiversx.com/developers/developer-reference/elrond-wasm-annotations/

Also, if you're confused about some of the functions used or the storage mappers, you can read more here:
- https://docs.multiversx.com/developers/developer-reference/elrond-wasm-api-functions/
- https://docs.multiversx.com/developers/developer-reference/storage-mappers/

Now, I've intentionally written some bad code here. Can you spot the improvements we can make?

Firstly, the last _clone_ is not needed. If you clone variables all the time, then you need to take some time to read the Rust ownership chapter of the Rust book: https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html and also about the implications of cloning types from the Rust framework: https://docs.multiversx.com/developers/best-practices/biguint-operations/

Secondly, the `staking_position` does not need an owned value of the `addr` argument. We can take a reference instead.

And lastly, there's a logic error. What happens if a user stakes twice? That's right, their position will be overwritten with the newest value. So instead, we need to add the newest stake amount over their current amount, using the `update` method.

After fixing the above problems, we end up with the following code:
```rust
#![no_std]

elrond_wasm::imports!();

#[elrond_wasm::contract]
pub trait StakingContract {
    #[init]
    fn init(&self) {}

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld_value();
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

### What's with the empty init function?

Every smart contract needs to have a function annotated with `#[init]`. This function is called on deploy and upgrade. For now, we need no logic inside it, but we still need to have this function.  

## Trying it out on devnet

To deploy and interact with the contract, we need to write some snippets. Create an `interactions` folder, and inside it, a `snippets.sh` file. This is the standard for using snippets, and this way, they're also recognized by the MultiversX IDE extension. More on this in a bit. Your new folder structure should look like this:  
![img](/developers/staking-contract-tutorial-img/folder_structure_3.png)

### Creating a devnet wallet

:::note  
You can skip this section if you already have a devnet wallet setup.
:::

Let's create a devnet wallet. Go to https://devnet-wallet.multiversx.com/, and select "create wallet". Save your 24 words (in the given order!), and create a password for your keystore file.

Now, we could use the keystore file with a password, but it's more convenient to use a PEM file. To generate the PEM file from your secret phrase, follow these instructions: https://docs.multiversx.com/sdk-and-tools/erdpy/deriving-the-wallet-pem-file/

TL;DR: open the terminal and run the following command. Write your secret phrase words in order:
```
erdpy --verbose wallet derive ./tutorialKey.pem --mnemonic
```

:::note  
You have to press "space" between the words, not "enter"!
:::

### Deploying the contract

Now that we've created a wallet, it's time to deploy our contract. Open your `snippets.sh` file, and add the following:

```bash
USER_PEM="~/Downloads/tutorialKey.pem"
PROXY="https://devnet-gateway.multiversx.com"
CHAIN_ID="D"

deploy() {
    erdpy --verbose contract deploy --project=${PROJECT} \
    --recall-nonce --pem=${USER_PEM} \
    --gas-limit=10000000 \
    --send --outfile="deploy-devnet.interaction.json" \
    --proxy=${PROXY} --chain=${CHAIN_ID} || return
}
```

:::note  
If you wanted to use testnet, the proxy would be "https://testnet-gateway.multiversx.com" and the chain ID would be "T". For mainnet, it would be "https://gateway.multiversx.com" and chain ID "1". 

More details can be found [here](/developers/constants/).
:::

The only thing you need to edit is the USER_PEM variable with the previously created PEM file's path.

To run this snippet, we're going to use the MultiversX IDE extension again. Open the extension in VSCode from the left-hand menu, right-click on the contract name, and select the `Run Contract Snippet` option. This should open a menu in at the top:  
![img](/developers/staking-contract-tutorial-img/snippet.png)

For now, we only have one option, as we only have a single function in our file, but any bash function we write in the snippets.sh file will appear there. Now, select the deploy option and let's deploy the contract.  

### Account was not found? But I just created the wallet!

You're going to see an error like the following:  
```bash
CRITICAL:cli:Proxy request error for url [https://devnet-gateway.multiversx.com/transaction/send]: {'data': None, 'error': 'transaction generation failed: account not found for address erd1... and shard 1, err: account was not found', 'code': 'internal_issue'}
```

This is because your account has no EGLD in it, so as far as the blockchain is concerned, the account does not exist, as it has no transactions from or to it.  

But still, how come you're seeing the contract's address if the deployment failed?
```bash
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqq...
INFO:utils:View this contract address in the MultiversX Devnet Explorer: https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqq...
```

This is because contract addresses are calculated from the deployer's address and their current account nonce. They are not random. So erdpy calculates the address beforehand and displays it in the terminal. Additionally, the deployed contract is always in the same shard as the deployer.  

### Getting EGLD on devnet

There are two ways of getting EGLD on devnet:
- through the devnet wallet
- through an external faucet

#### Getting EGLD through devnet wallet

Go to https://devnet-wallet.multiversx.com and login to your devnet account with your PEM file. On the left side menu, select the "faucet" option:  
![img](/developers/staking-contract-tutorial-img/wallet_faucet.png)

Request the tokens. After a couple seconds, refresh the page, and you should have 30 xEGLD in your wallet.  

#### Getting EGLD through external faucet

Go to https://r3d4.fr/faucet and submit a request:  
![img](/developers/staking-contract-tutorial-img/external_faucet.png)

Make sure you selected "devnet" and input your address! It might take a bit depending on how "busy" the faucet is.  

### Deploying the contract, second try

Now that the blockchain knows about our account, it's time to try the deploy again. Run the `deploy` snippet again and let's see the results. Make sure you save the contract address. erdpy will print it in the console for you:
```bash
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqq...
```

Alternatively, you can check the address in the logs tab in explorer, namely the `SCDeploy` event.

#### Too much gas error?

Everything should work just fine, but you'll see this message:  
![img](/developers/staking-contract-tutorial-img/too_much_gas.png)

This is NOT an error. This simply means you provided way more gas than needed, so all the gas was consumed instead of the leftover being returned to you. This is done to protect the network against certain attacks. For instance, one could always provide the max gas limit and only use very little, decreasing the network's throughput significantly.  

## The first stake

Let's add a snippet for the staking function:
```bash
USER_PEM="~/Downloads/tutorialKey.pem"
PROXY="https://devnet-gateway.multiversx.com"
CHAIN_ID="D"

SC_ADDRESS=erd1qqqqqqqqqqqqq...
STAKE_AMOUNT=1

deploy() {
    erdpy --verbose contract deploy --project=${PROJECT} \
    --recall-nonce --pem=${USER_PEM} \
    --gas-limit=10000000 \
    --send --outfile="deploy-devnet.interaction.json" \
    --proxy=${PROXY} --chain=${CHAIN_ID} || return
}

stake() {
    erdpy --verbose contract call ${SC_ADDRESS} \
    --proxy=${PROXY} --chain=${CHAIN_ID} \
    --send --recall-nonce --pem=${USER_PEM} \
    --gas-limit=10000000 \
    --value=${STAKE_AMOUNT} \
    --function="stake"
}
```

To pay EGLD, the `--value` argument is used, and, as you can guess, the `--function` argument is used to select which endpoint we want to call.  

We've now successfully staked 1 EGLD... or have we? If we look at the transaction, that's not quite the case:  
![img](/developers/staking-contract-tutorial-img/first_stake.png)

### I sent 1 EGLD to the SC, but instead 0.000000000000000001 EGLD got sent?

This is because EGLD has 18 decimals. So to send 1 EGLD, you actually have to send a value equal to 1000000000000000000 (i.e. 1 * 10^18). The blockchain only works with unsigned numbers. Floating point numbers are not allowed. The only reason the explorer displays the balances with a floating point is because it's much more user-friendly to tell someone they have 1 EGLD instead of 1000000000000000000 EGLD, but internally, only the integer value is used.

### But how do I send 0.5 EGLD to the SC?

Since we know EGLD has 18 decimals, we have to simply multiply 0.5 by 10^18, which yields 500000000000000000.  

## Actually staking 1 EGLD

To do this, we simply have to update our `STAKE_AMOUNT` variable in the snippet. This should be:
`STAKE_AMOUNT=1000000000000000000`.

Now let's try staking again:  
![img](/developers/staking-contract-tutorial-img/second_stake.png)

## Querying the view functions

To perform smart contract queries, we also use erdpy. Let's add the following to our snippet file:
```bash
USER_ADDRESS=erd1...

getStakeForAddress() {
    erdpy --verbose contract query ${SC_ADDRESS} \
    --proxy=${PROXY} \
    --function="getStakingPosition" \
    --arguments ${USER_ADDRESS}
}
```

:::note
You don't need a PEM file or an account at all to perform queries. Notice how you also don't need a chain ID for this call.
:::

:::note
Because there is no PEM file required, there is no "caller" for VM queries. Attempting to use `self.blockchain().get_caller()` in a query function will return the SC's own address.
:::

Replace `USER_ADDRESS` value with your address. Now let's see our staking amount, according to the SC's internal state:  
```bash
getStakeForAddress
[
    {
        "base64": "DeC2s6dkAAE=",
        "hex": "0de0b6b3a7640001",
        "number": 1000000000000000001
    }
]
```

We get the expected amount, 1 EGLD, plus the initial 10^-18 EGLD we sent.

Now let's also query the stakers list:
```bash
getAllStakers() {
    erdpy --verbose contract query ${SC_ADDRESS} \
    --proxy=${PROXY} \
    --function="getStakedAddresses"
}
```

Running this function should yield a result like this:
```bash
getAllStakers
[
    {
        "base64": "nKGLvsPooKhq/R30cdiu1SRbQysprPITCnvi04n0cR0=",
        "hex": "9ca18bbec3e8a0a86afd1df471d8aed5245b432b29acf2130a7be2d389f4711d",
        "number": 70846231242182541417246304875524977991498122361356467219989042906898688667933
    }
]
```

...but what's this value? If we try to convert `9ca18bbec3e8a0a86afd1df471d8aed5245b432b29acf2130a7be2d389f4711d` to ASCII, we get gibberish. So what happened to our pretty erd1 address?

### Converting erd1 addresses to hex

The smart contracts never work with the erd1 address format, but rather with the hex format. This is NOT an ASCII to hex conversion. This is a bech32 to ASCII conversion.

But then, why did the previous query work?  
```bash
getStakeForAddress() {
    erdpy --verbose contract query ${SC_ADDRESS} \
    --proxy=${PROXY} \
    --function="getStakingPosition" \
    --arguments ${USER_ADDRESS}
}
```

This is because erdpy automatically detected and converted the erd1 address to hex. To perform those conversions yourself, you can also use erdpy: 

bech32 to hex  
```bash
erdpy wallet bech32 --decode erd1...
```

In the previous example, we used the address: erd1njsch0krazs2s6harh68rk9w65j9kset9xk0yyc2003d8z05wywsmmnn76

Now let's try and decode this with erdpy:  
```bash
erdpy wallet bech32 --decode erd1njsch0krazs2s6harh68rk9w65j9kset9xk0yyc2003d8z05wywsmmnn76
9ca18bbec3e8a0a86afd1df471d8aed5245b432b29acf2130a7be2d389f4711d
```

Which is precisely the value we received from the smart contract. Now let's try it the other way around.

hex to bech32  
```bash
erdpy wallet bech32 --encode hex_address
```

Running the command with the previous example, we should get the same initial address:
```bash
erdpy wallet bech32 --encode 9ca18bbec3e8a0a86afd1df471d8aed5245b432b29acf2130a7be2d389f4711d
erd1njsch0krazs2s6harh68rk9w65j9kset9xk0yyc2003d8z05wywsmmnn76
```

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

    self.send().direct_egld(&caller, &caller_stake);
}
```

You might notice the variable `stake_mapper`. Just to remind you, the mapper's definition looks like this:
```rust
#[storage_mapper("stakingPosition")]
fn staking_position(&self, addr: &ManagedAddress) -> SingleValueMapper<BigUint>;
```

In pure Rust terms, this is a method of our contract trait, with one argument, that returns a `SingleValueMapper<BigUint>`. All mappers are nothing more than struct types that provide an interface to the storage API.

So then, why save the mapper in a variable? 

### Better usage of storage mapper types

Each time you access `self.staking_position(&addr)`, the storage key has to be constructed again, by concatenating the static string `stakingPosition` with the given `addr` argument. The mapper saves its key internally, so if we reuse the same mapper, the key is only constructed once.

This saves us the following operations:
```rust
let mut key = ManagedBuffer::new_from_bytes(b"stakingPosition");
key.append(addr.as_managed_buffer());
```

Instead, we just reuse the key we built previously. This can be a great performance enhancement, especially for mappers with multiple arguments. For mappers with no arguments, the improvement is minimal, but might still be worth thinking about.  

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

    self.send().direct_egld(&caller, &unstake_amount);
}
```

As you might notice, the code changed quite a bit. We also need to account for invalid user input, so we add a `require!` statement. Additionally, since we no longer need to simply "clear" the storage, we use the `update` method, which allows us to change the currently stored value through a mutable reference.

`update` is the same as doing `get`, followed by computation, and then `set`, but it's just a lot more compact. Additionally, it also allows us to return anything we want from the given closure, so we use that to detect if this was a full unstake.

```rust
pub fn update<R, F: FnOnce(&mut T) -> R>(&self, f: F) -> R {
    let mut value = self.get();
    let result = f(&mut value);
    self.set(value);
    result
}
```

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

    self.send().direct_egld(&caller, &unstake_amount);
}
```

This makes it so if someone wants to perform a full unstake, they can simply not give the argument at all.

### Unstaking our devnet tokens

Now that we've added the unstake function, let's test it out on devnet. Build your SC again through the MultiversX IDE extension or erdpy directly, and add the unstake function to our snippets.rs file:

```bash
UNSTAKE_AMOUNT=500000000000000000

unstake() {
    erdpy --verbose contract call ${SC_ADDRESS} \
    --proxy=${PROXY} --chain=${CHAIN_ID} \
    --send --recall-nonce --pem=${USER_PEM} \
    --gas-limit=10000000 \
    --function="unstake" \
    --arguments ${UNSTAKE_AMOUNT}
}
```

Now run this function, and you'll get this result:  
![img](/developers/staking-contract-tutorial-img/first_unstake.png)

...but why? We just added the function! Well, we might've added it to our code, but the contract on the devnet still has our old code. So, how do we upload our new code?

## Upgrading smart contracts

Since we've added some new functionality, we also want to update the currently deployed implementation. Add the upgrade snippet to your snippets.sh and run it:

```bash
upgrade() {
    erdpy --verbose contract upgrade ${SC_ADDRESS} \
    --project=${PROJECT} \
    --recall-nonce --pem=${USER_PEM} \
    --gas-limit=20000000 \
    --send --outfile="upgrade-devnet.interaction.json" \
    --proxy=${PROXY} --chain=${CHAIN_ID} || return
}
```

:::note
Keep in mind the `#[init]` function of the newly uploaded code is also called on upgrade. For now, it does not matter, as our init function does nothing, but it's worth keeping in mind.
:::

:::note
All the storage is kept on upgrade, so make sure any storage changes you make to storage mapping are backwards compatible!
:::

## Try unstaking again

Try running the `unstake` snippet again. This time, it should work just fine. Afterwards, let's query our staked amount through `getStakeForAddress`, to see if it updated our amount properly:

```bash
getStakeForAddress
[
    {
        "base64": "BvBbWdOyAAE=",
        "hex": "06f05b59d3b20001",
        "number": 500000000000000001
    }
]
```

We had 1 EGLD, and we've unstaked 0.5 EGLD. Now we have 0.5 EGLD staked. (with the extra 1 fraction of EGLD we've staked initially).  

## Unstake with no arguments

Let's also test the optional argument functionality. Remove the `--arguments` line from the snippet, and run it again.

```bash
unstake() {
    erdpy --verbose contract call ${SC_ADDRESS} \
    --proxy=${PROXY} --chain=${CHAIN_ID} \
    --send --recall-nonce --pem=${USER_PEM} \
    --gas-limit=10000000 \
    --function="unstake"
}
```

Let's also query `getStakeForAddress` and `getAllStakers` afterwards to see if the state was cleaned up properly:

```bash
getStakeForAddress
[
    ""
]
```

```bash
getAllStakers
[]
```

As you can see, we get an empty result (which means the value 0), and an empty array respectively.

## Writing Rust tests

As you might've noticed, it can be quite a chore to keep upgrading the contract after every little change, especially if all we want to do is test a new feature. So let's recap what we've done until now:
- deploy our contract
- stake
- partial unstake
- full unstake

:::note
A more detailed explanation of Rust tests can be found here: https://docs.multiversx.com/developers/developer-reference/rust-testing-framework/
:::

To test the previously described scenario, we're going to need a user address, and a new test function. Replace the contents of the `./tests/empty_rust_test.rs` file with the following:
```rust
use elrond_wasm::{elrond_codec::multi_types::OptionalValue, types::Address};
use elrond_wasm_debug::{
    managed_address, managed_biguint, rust_biguint, testing_framework::*, DebugApi,
};
use staking_contract::*;

const WASM_PATH: &'static str = "output/staking-contract.wasm";
const USER_BALANCE: u64 = 1_000_000_000_000_000_000;

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
                sc.init();
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
    let owner_addr = setup.owner_address.clone();
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
                    managed_biguint!(USER_BALANCE)
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
                    managed_biguint!(USER_BALANCE / 2)
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

                assert_eq!(
                    sc.staking_position(&managed_address!(&user_addr)).get(),
                    managed_biguint!(0)
                );
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

We've added a `user_address` field in the setup struct, which is initiated with `USER_BALANCE` EGLD in their account.

:::note
For the test we're going to use small numbers for balances, since there is no reason to work with big numbers. For this test, we're using 1 EGLD for user balance.
:::

Then, we've staked the user's entire balance, unstaked half, then unstaked fully. After each transaction, we've checked the SC's internal staking storage, and also the balance of the user and the SC respectively.

### Running the test

To run a test, you can use click on the `Run Test` button from under the test name.
![img](/developers/staking-contract-tutorial-img/running_rust_test.png)

There is also a `Debug` button, which can be used to debug smart contracts. More details on that here: https://docs.multiversx.com/developers/developer-reference/rust-smart-contract-debugging/

Alternatively, you can run all the tests in the file by running the following command in the VSCode terminal, in the `./staking-contract` folder:
```bash
cargo test --test empty_rust_test
```

Where `empty_rust_test` is the name of the file containing the tests.

## Staking Rewards

Right now, there is no incentive to stake EGLD into this smart contract. Let's say we want to give every staker 10% APY (Annual Percentage Yield). For example, if someone staked 100 EGLD, they will receive a total of 10EGLD per year.

For this, we're also going to need to save the time at which each user staked. Also, we can't simply make each user wait 1 year to get their rewards. We need a more fine-tuned solution, so we're going to calculate rewards per block instead of per year.

:::note
You can also use rounds, timestamp, epochs etc. for time keeping in smart contracts, but number of blocks is the recommended approach.
:::

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
Every managed type from the Rust framework needs a `ManagedTypeApi` implementation, which allows it to access the VM functions for performing operations. For example, adding two `BigUint` numbers, concatenating two `ManagedBuffer`s, etc. Inside smart contract code, the `ManagedTypeApi` associated type is automatically added, but outside of it, we have to manually specify it.
:::

Additionally, since we need to store this in storage, we need to tell the Rust framework how to encode and decode this type. This can be done automatically by deriving (i.e. auto-implementing) these traits, via the `#[derive]` annotation:

```rust
elrond_wasm::derive_imports!();

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Debug)]
pub struct StakingPosition<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_action_block: u64,
}
```

We've also added `TypeAbi`, since this is required for ABI generation. ABIs are used by dApps and such to decode custom SC types, but this is out of scope of this tutorial.

Additionally, we've added `PartialEq` and `Debug` derives, for easier use within tests. This will not affect performance in any way, as the code for these is only used during testing/debugging. `PartialEq` allows us to use `==` for comparing instances, while `Debug` will pretty-print the struct, field by field, in case of errors.

If you want to learn more about how such a struct is encoded, and the difference between top and nested encoding/decoding, you can read more here: https://docs.multiversx.com/developers/developer-reference/elrond-serialization-format/

### Rewards formula

A block is produced about every 6 seconds, so total blocks in a year would be seconds in year, divided by 6. More specifically:
```rust
pub const BLOCKS_IN_YEAR: u64 = 60 * 60 * 24 * 365 / 6;
```

More specifically: 60 seconds per minute * 60 minutes per hour * 24 hours per day * 365 days, divided by the 6-second block duration.

:::note
This is calculated and replaced with the exact value at compile time, so there is no performance penalty of having a constant with mathematical operations in its value definition.
:::

Having defined this constant, rewards formula should look like this:
```rust
let reward_amt = apy / 100 * user_stake * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

Using 10% as APY, and assuming exactly one year has passed since last claim, the reward amount would be `10/100 * user_stake`, which is exactly 10% APY.

But there is something wrong with the current formula. We will always get `reward_amt` = 0.

### BigUint division

BigUint division works the same as unsigned integer division. If you divide `x` by `y`, where `x < y`, you will always get 0 as result. So in our previous example, 10/100 is NOT 0.1, but 0.

To fix this, we need to take care of our operation order:
```rust
let reward_amt = user_stake * apy / 100 * blocks_since_last_claim / BLOCKS_IN_YEAR;
```

### How to express percentages like 50.45%?

In this case, we need to extend our precision by using fixed point precision. Instead of having `100` as the max percentage, we will extend it to `10_000`, and give `50.45%` as `5_045`. Updating our above formula results in this:

```rust
pub const MAX_PERCENTAGE: u64 = 10_000;

let reward_amt = user_stake * apy / MAX_PERCENTAGE * blocks_since_last_claim / BLOCKS_IN_YEAR;
```


For example, let's assume the user stake is 100, and 1 year has passed. Using `5_045` as APY value, the formula would become:
```rust
reward_amt = 100 * 5_045 / 10_000 = 504_500 / 10_000 = 50
```

:::note
Since we're still using BigUint division, we don't get `50.45`, but `50`. This precision can be increased by using more zeroes for the MAX_PERCENTAGE and the respective APY, but this is also "inheritly fixed" on the blockchain, because we work with very big numbers for `user_stake`
:::

## Rewards implementation

Now let's see how this would look in our Rust smart contract code. The smart contract looks like this after doing all the specified changes:

```rust
#![no_std]

elrond_wasm::imports!();
elrond_wasm::derive_imports!();

pub const BLOCKS_IN_YEAR: u64 = 60 * 60 * 24 * 365 / 6;
pub const MAX_PERCENTAGE: u64 = 10_000;

#[derive(TypeAbi, TopEncode, TopDecode, PartialEq, Debug)]
pub struct StakingPosition<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_action_block: u64,
}

#[elrond_wasm::contract]
pub trait StakingContract {
    #[init]
    fn init(&self, apy: u64) {
        self.apy().set(apy);
    }

    #[payable("EGLD")]
    #[endpoint]
    fn stake(&self) {
        let payment_amount = self.call_value().egld_value();
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

        self.send().direct_egld(&caller, &unstake_amount);
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

Now, let's update our test, to use our new `StakingPosition` struct, and also provide the `APY` as argument for the `init` function.  

```rust
use elrond_wasm::{elrond_codec::multi_types::OptionalValue, types::Address};
use elrond_wasm_debug::{
    managed_address, managed_biguint, rust_biguint, testing_framework::*, DebugApi,
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
        let payment_amount = self.call_value().egld_value();
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

## Depositing rewards / Conclusion

Currently, there is no way to deposit rewards into the SC, unless the owner makes it payable, which is generally bad practice, and not recommended.

As this is a fairly simple task compared to what we've done already, we'll leave this as an exercise to the reader. You'll have to add a `payable("EGLD")` endpoint, and additionally, a storage mapper that keeps track of the remaining rewards.

Good luck!

In part 2, which will come soon, we'll discuss about how to use custom ESDTs instead of just EGLD.
