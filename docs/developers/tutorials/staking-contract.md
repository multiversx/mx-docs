---
id: staking-contract
title: Staking smart contrac tutorial
---

# Introduction

This tutorial aims to teach you how to write a simple staking contract, and to illustrate and correct the common pitfalls new smart contract developers might fall into.

# Prerequisites

## erdpy

First and foremost, you need to have erdpy installed: https://docs.elrond.com/sdk-and-tools/erdpy/installing-erdpy/

If you already have erdpy installed, make sure to update it to the latest version, using the same instructions as for the installation.

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

Open the generated folder, and you should have the following structure:  
![img](/developers/staking-contract-tutorial-img/folder_structure.png)

For now, comment all the code in the `empty_rust_test.rs` file (ctrl + "A", then ctrl + "/"). Otherwise, it will keep popping up errors as we modify the contract's code.

# Setting up the workspace

Now, to have all the extensions work properly, we have to setup our workspace. This is done by pressing `ctrl + shift + P` and selecting the "Elrond: Setup Workspace" option from the menu. Choose the "Yes" option on the pop-up menu.

Now let's open the Elrond VSCode extension and try building our contract, to see if everything is properly set up. Go to the extension's tab, right-click on "staking-contract" and select the "Build Contract" option:  
![img](/developers/staking-contract-tutorial-img/elrond_ide_extension.png)

Alternatively, you can run `erdpy --verbose contract build` yourself from the VSCode terminal.

After the building has completed, our folder should look like this:  
![img](/developers/staking-contract-tutorial-img/folder_structure_2.png)

A new folder, called `output` was created, which contains the compiled contract code. More on this is used later. For now, let's continue.

# Your first lines of Rust

Currently, we just have an empty contract. Not very useful, is it? So let's add some simple code for it. Since this is a staking contract, we'd expect to have a `stake` function, right?

Let's add said function:
```rust
#[payable("EGLD")]
#[endpoint]
fn stake(&self) {}
```

Since we want this function to be callable by users, we have to annotate it with `#[endpoint]`. Also,since we want to be able to receive a payment, we mark it also as `#[payable("EGLD)]`. For now, we'll use EGLD as our staking token. Note that the contract does NOT need to be payable for it to receive payments on endpoint calls. The payable flag at contract level is only for receiving payments without endpoint invocation.

Now, it's time to add an implementation for the function. We need to see how much a user paid, and save their staking information in storage. We end up with this code:
```rust
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
    --gas-limit=50000000 \
    --send --outfile="deploy-testnet.interaction.json" \
    --proxy=${PROXY} --chain=${CHAIN_ID} || return
}
```

:::note  
If you wanted to use testnet, the proxy would be "https://testnet-gateway.elrond.com" and the chain ID would be "T". For mainnet, it would be "https://gateway.elrond.com" and chain ID "1".  

The only thing you need to edit is the USER_PEM variable with the previously created PEM file's path.

To run this snippet, we're going to use the Elrond IDE extension again. Open the extension in VSCode from the left-hand menu, right click on the contract name, and select the `Run Contract Snippet` option. This should open a menu in at the top:  
![img](/developers/staking-contract-tutorial-img/snippet.png)

For now, we only have one option, as we only have a single function in our file, but any bash functionw we write in the snippets.sh file will appear there. Now, select the deploy option and let's deploy the contract.  

## Account was not found? But I just created the wallet!

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

This is because contract addresses are calculated from the deployer's address and their current account nonce. They are not random. So erdpy calculates the address beforehand and displays it in the terminal.  

## Getting EGLD on devnet

There are two ways of getting EGLD on devnet:
- through the devnet wallet
- through an external faucet

### Getting EGLD through devnet wallet

Go to https://devnet-wallet.elrond.com and login to your devnet account with your PEM file. In the leftside menu, select the "faucet" option:  
![img](/developers/staking-contract-tutorial-img/wallet_faucet.png)

Request the tokens. After a couple seconds, refresh the page, and you should have 30 xEGLD in your wallet.  

### Getting EGLd through external faucet

Go to https://r3d4.fr/faucet and submit a request:  
![img](/developers/staking-contract-tutorial-img/external_faucet.png)

Make sure you selected "devnet" and input your address! It might take a bit depending on how "busy" the faucet is.  

