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

If you're confused about some of the functions used or the storage mappers, you can read more here:
- https://docs.elrond.com/developers/developer-reference/elrond-wasm-api-functions/
- https://docs.elrond.com/developers/developer-reference/storage-mappers/

Now, I've intentionally written some bad code here. Can you spot the improvements we can make?

Firstly, the last _clone_ is not needed. If you clone variables all the time, then you need to take some time to read the Rust ownership chapter of the Rust book: https://doc.rust-lang.org/book/ch04-00-understanding-ownership.html and also about the implications of cloning types from the Rust framework: https://docs.elrond.com/developers/best-practices/biguint-operations/

Secondly, the `staking_position` does not need an owned value of the `addr` argument. We can take a reference instead.

And lastly, there's a logic error. What happens if a user stakes twice? That's right, their position will be overwritten with the newest value.

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