---
id: staking-contract
title: Staking smart contract tutorial
---

# Introduction

This tutorial aims to teach you how to write a simple staking contract, and to illustrate and correct the common pitfalls new smart contract developers might fall into.  

If you find anything not answered here, feel free to ask further questions on the Elrond Developers Telegram channel: https://t.me/ElrondDevelopers

# Prerequisites

## erdpy

First and foremost, you need to have erdpy installed: https://docs.elrond.com/sdk-and-tools/erdpy/installing-erdpy/

If you already have erdpy installed, make sure to update it to the latest version, using the same instructions as for the installation.

We're going to use erdpy for interacting with our contracts, so if you need more details about some of the steps we will perform, you can check here for more detailed explanations regarding what each command does: https://docs.elrond.com/sdk-and-tools/erdpy/smart-contract-interactions/

## Rust

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

## VSCode and rust-analyser extension

VSCode: https://code.visualstudio.com/

Assuming you're on Ubuntu, download the `.deb` version. Go to that folder:
- open folder in terminal
- run the following command: `sudo dpkg -i downloaded_file_name`

rust-analyser: https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer
Elrond VSCode extension: https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide

Both can be easily installed from the "Extensions" menu in VSCode.  

# Creating the contract

Run the following command in the folder in which you want your smart contract to be created:
```
erdpy contract new staking-contract --template empty
```

Open VSCode, select File -> Open Folder, and open the newly created `staking-contract` folder.

You should then have the following structure:  
![img](/developers/staking-contract-tutorial-img/folder_structure.png)

For now, comment all the code in the `./tests/empty_rust_test.rs` file (ctrl + "A", then ctrl + "/"). Otherwise, it will keep popping up errors as we modify the contract's code.

# Setting up the workspace

Now, to have all the extensions work properly, we have to setup our workspace. This is done by pressing `ctrl + shift + P` and selecting the "Elrond: Setup Workspace" option from the menu. Choose the "Yes" option on the pop-up menu.

Now let's open the Elrond VSCode extension and try building our contract, to see if everything is properly set up. Go to the extension's tab, right-click on "staking-contract" and select the "Build Contract" option:  
![img](/developers/staking-contract-tutorial-img/elrond_ide_extension.png)

Alternatively, you can run `erdpy --verbose contract build` yourself from the VSCode terminal. The command should be run inside the staking-contract folder.

After the building has completed, our folder should look like this:  
![img](/developers/staking-contract-tutorial-img/folder_structure_2.png)

A new folder, called `output` was created, which contains the compiled contract code. More on this is used later. For now, let's continue.

# Your first lines of Rust

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

Since we want this function to be callable by users, we have to annotate it with `#[endpoint]`. Also,since we want to be able to receive a payment, we mark it also as `#[payable("EGLD)]`. For now, we'll use EGLD as our staking token. 

:::note
The contract does NOT need to be payable for it to receive payments on endpoint calls. The payable flag at contract level is only for receiving payments without endpoint invocation.

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

We've also added #[view] annotation for the storage mappers, so we can later perform queries on those storage entries. You can read more about annotations here: https://docs.elrond.com/developers/developer-reference/elrond-wasm-annotations/

Also, if you're confused about some of the functions used or the storage mappers, you can read more here:
- https://docs.elrond.com/developers/developer-reference/elrond-wasm-api-functions/
- https://docs.elrond.com/developers/developer-reference/storage-mappers/

Now, I've intentionally written some bad code here. Can you spot the improvements we can make?

Firstly, the last _clone_ is not needed. If you clone variables all the time, then you need to take some time to read the Rust ownership chapter of the Rust book: https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html and also about the implications of cloning types from the Rust framework: https://docs.elrond.com/developers/best-practices/biguint-operations/

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

# Trying it out on devnet

To deploy and interact with the contract, we need to write some snippets. Create an `interactions` folder, and inside it, a `snippets.sh` file. This is the standard for using snippets, and this way, they're also recognized by the Elrond IDE extension. More on this in a bit. Your new folder structure should look like this:  
![img](/developers/staking-contract-tutorial-img/folder_structure_3.png)

## Creating a devnet wallet

:::note  
You can skip this section if you already have a devnet wallet setup.

Let's create a devnet wallet. Go to https://devnet-wallet.elrond.com/, and select "create wallet". Save your 24 words (in the given order!), and create a password for your keystore file.

Now, we could use the keystore file with a password, but it's more convenient to use a PEM file. To generate the PEM file from your secret phrase, follow these instructions: https://docs.elrond.com/sdk-and-tools/erdpy/deriving-the-wallet-pem-file/

TL;DR: open the terminal and run the following command. Write your secret phrase words in order:
```
erdpy --verbose wallet derive ./tutorialKey.pem --mnemonic
```

:::note  
You have to press "space" between the words, not "enter"!

## Deploying the contract

Now that we've created a wallet, it's time to deploy our contract. Open your `snippets.sh` file, and add the following:

```bash
USER_PEM="~/Downloads/tutorialKey.pem"
PROXY="https://devnet-gateway.elrond.com"
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
If you wanted to use testnet, the proxy would be "https://testnet-gateway.elrond.com" and the chain ID would be "T". For mainnet, it would be "https://gateway.elrond.com" and chain ID "1".  

The only thing you need to edit is the USER_PEM variable with the previously created PEM file's path.

To run this snippet, we're going to use the Elrond IDE extension again. Open the extension in VSCode from the left-hand menu, right click on the contract name, and select the `Run Contract Snippet` option. This should open a menu in at the top:  
![img](/developers/staking-contract-tutorial-img/snippet.png)

For now, we only have one option, as we only have a single function in our file, but any bash functionw we write in the snippets.sh file will appear there. Now, select the deploy option and let's deploy the contract.  

### Account was not found? But I just created the wallet!

You're going to see an error like the following:  
```bash
CRITICAL:cli:Proxy request error for url [https://devnet-gateway.elrond.com/transaction/send]: {'data': None, 'error': 'transaction generation failed: account not found for address erd1... and shard 1, err: account was not found', 'code': 'internal_issue'}
```

This is because your account has no EGLD in it, so as far as the blockchain is concerned, the account does not exist, as it has no transactions from or to it.  

But still, how come you're seeing the contract's address if the deploy failed?
```bash
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqq...
INFO:utils:View this contract address in the Elrond Devnet Explorer: https://devnet-explorer.elrond.com/accounts/erd1qqqqqqqqqqqqq...
```

This is because contract addresses are calculated from the deployer's address and their current account nonce. They are not random. So erdpy calculates the address beforehand and displays it in the terminal. Additionally, the deployed contract is always in the same shard as the deployer.  

## Getting EGLD on devnet

There are two ways of getting EGLD on devnet:
- through the devnet wallet
- through an external faucet

### Getting EGLD through devnet wallet

Go to https://devnet-wallet.elrond.com and login to your devnet account with your PEM file. In the leftside menu, select the "faucet" option:  
![img](/developers/staking-contract-tutorial-img/wallet_faucet.png)

Request the tokens. After a couple seconds, refresh the page, and you should have 30 xEGLD in your wallet.  

### Getting EGLD through external faucet

Go to https://r3d4.fr/faucet and submit a request:  
![img](/developers/staking-contract-tutorial-img/external_faucet.png)

Make sure you selected "devnet" and input your address! It might take a bit depending on how "busy" the faucet is.  

## Deploying the contract, second try

Now that the blockchain knows about our account, it's time to try the deploy again. Run the `deploy` snippet again and let's see the results. Make sure you save the contract address. erdpy will print it in the console for you:
```bash
INFO:cli.contracts:Contract address: erd1qqqqqqqqqqqqq...
```

Alternatively, you can check the address in the logs tab in explorer, namely the `SCDeploy` event.

### Too much gas error?

Everything should work just fine, but you'll see this message:  
![img](/developers/staking-contract-tutorial-img/too_much_gas.png)

This is NOT an error. This simply means you provided way more gas than needed, so all the gas was consumed instead of the leftover being returned to you. This is done to protect the network against certain attacks. For instance, one could always provide the max gas limit and only use very little, decreasing the network's throughput significantly.  

## The first stake

Let's add a snippet for the staking function:
```bash
USER_PEM="~/Downloads/tutorialKey.pem"
PROXY="https://devnet-gateway.elrond.com"
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

This is because EGLD has 18 decimals. So to send 1 EGLD, you actually have to send a value equal to 1000000000000000000 (i.e. 1 * 10^18). The blockchain only works with unsigned numbers. Floating point numbers are not allowed. The only reason the explorer displays the balances with a floating point is because it's much more user friendly to tell someone they have 1 EGLD instead of 1000000000000000000 EGLD, but internally, only the integer value is used.

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

:::note
Because there is no PEM file required, there is no "caller" for VM queries. Attemting to use `self.blockchain().get_caller()` in a query function will return the SC's own address.

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

# Adding unstake functionality

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

## Partial unstake

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

This makes it so if someone wants to perform a full unstake, they can simply not give the argument at all.

## Unstaking our devnet tokens

Now that we've added the unstake function, let's test it out on devnet. Build your SC again through the Elrond IDE extension or erdpy directly, and add the unstake function to our snippets.rs file:

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

# Writing Rust tests

As you might've noticed, it can be quite a chore to keep upgrading the contract after every little change, especially if all we want to do is test a new feature. So let's recap what we've done until now:
- deploy our contract
- stake
- partial unstake
- full unstake

----- TODO -----

# Staking Rewards

Right now, there is no incentive to stake EGLD into this smart contract. Let's say we want to give every staker 10% APY. For example, if someone staked 100 EGLD, they will receive a total of 10EGLD per year.

----- TODO -----
