---
id: upgrading-smart-contracts
title: Upgrading smart contracts
---

[comment]: # (mx-abstract)

## Sirius Mainnet Release - Version 1.6.0

:::important
The new Sirius Mainnet version 1.6.0 brings a significant update to how smart contracts can be upgraded. This release introduces a dedicated `upgrade` function, replacing the previous usage of the `init` function during contract upgrades. This change enhances the upgrade process and provides a clearer separation of concerns between contract initialization and subsequent upgrades.
**Note: Contracts deployed before version 1.6.0 will continue to function as before. The change in upgrade behavior applies only when upgrading the code of the contract. Existing contracts deployed only with an init function will still operate correctly without modifications.**
:::

Please take note of the following important information to ensure a smooth transition.

For contracts developed on or after version 1.6.0, developers should ensure that the `upgrade` function is implemented to handle the necessary upgrade logic. The `init` function will no longer be called during contract upgrades.

Let's look at an example of a simple Adder SC.

```rust
#[init]
fn init(&self, initial_value: u64) {
    // Save the initial value in storage only if it is empty.
    self.sum().set_if_empty(initial_value);
}

#[upgrade]
fn upgrade(&self, new_value: u64) {
    self.sum().set(new_value);
}
```

Let's assume we deploy the contract with the argument **1u64**, and then we upgrade it using the argument **2u64**. If before the new release, after upgrading the SC, we would have the value **1u64** in storage (as the `init` function would have been called, which saves the value in the storage only when it is empty), with the new release, the new value in the storage would be **2u64**.

[comment]: # (mx-context-auto)

## Deep diving into the Smart Contract Upgrade Process

Upgrading a smart contract is a relatively easy process, but its implications are not exactly obvious. To upgrade a smart contract, simply run the following command:

```
mxpy --verbose contract upgrade SC_ADDRESS \
    --pem=PEM_PATH --bytecode=WASM_PATH \
    --gas-limit=100000000 \
    --send --proxy=https://devnet-gateway.multiversx.com --chain=D
```

Replace SC_ADDRESS, PEM_PATH and WASM_PATH accordingly. Also, if you want to use testnet/mainnet, also change the proxy and chain ID.

This will replace the given SC's code with the one from the provided file, but that is not all. Additionally, it will run the new code's `upgrade` function. So, if your `upgrade` function has any arguments, the command has to be run by also giving said arguments:

```
mxpy --verbose contract upgrade SC_ADDRESS \
    --pem=PEM_PATH --bytecode=WASM_PATH \
    --arguments arg1 arg2 arg3
    --gas-limit=100000000 \
    --send --proxy=https://devnet-gateway.multiversx.com --chain=D
```

You might've seen in many of the MultiversX contracts, we often use the `set_if_empty` method in `init` and `upgrade` functions, instead of plain `set`. This is so we don't accidentally overwrite an important config value during the upgrade process.

[comment]: # (mx-context-auto)

## What about the old contract's storage?

Storage is kept intact, except for the changes the `upgrade` function might do during upgrade.

[comment]: # (mx-context-auto)

## Migrating storage or token attributes

If you modify your core data's design, you will run into "Decode error: Input too short". Fear not, as there are ways to avoid that.

For example, let's assume you had the following struct type, which keeps track of user information:

```rust
#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct UserData<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_update_block: u64,
}
```

In your new code, you decided it would be nice to also keep track of the last update epoch, not only block, so you changed the struct:

```rust
#[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct UserData<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_update_block: u64,
    pub last_update_epoch: u64,
}
```

This will not work. The struct will decode `stake_amount`, it will then decode `last_update_epoch`, and it will have no bytes left to decode the `last_update_epoch`.

:::caution
You always need to add new fields at the end of the struct, otherwise, this approach will not work.
:::

To fix this, we need to manually implement the decoding traits, which were previously automatically added through the derives.

```rust
use multiversx_sc::codec::{NestedDecodeInput, TopDecodeInput};

#[derive(TypeAbi, TopEncode, NestedEncode)]
pub struct UserData<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
    pub last_update_block: u64,
    pub last_update_epoch: u64,
}

impl<M: ManagedTypeApi> TopDecode for UserData<M> {
    fn top_decode<I>(input: I) -> Result<Self, DecodeError>
    where
        I: TopDecodeInput,
    {
        let mut buffer = input.into_nested_buffer();
        Self::dep_decode(&mut buffer)
    }
}

impl<M: ManagedTypeApi> NestedDecode for UserData<M> {
    fn dep_decode<I: NestedDecodeInput>(input: &mut I) -> Result<Self, DecodeError> {
        let stake_amount = BigUint::dep_decode(input)?;
        let last_update_block = u64::dep_decode(input)?;

        let last_update_epoch = if !input.is_depleted() {
            u64::dep_decode(input)?
        } else {
            0
        };

        if !input.is_depleted() {
            return Result::Err(DecodeError::INPUT_TOO_LONG);
        }

        Result::Ok(UserData {
            stake_amount,
            last_update_block,
            last_update_epoch
        })
    }
}
```

With the above code, we manually decode each field, and then, if there are any bytes left, we decode the new fields we've added, using a default value (0 in this case) if there are no more bytes - as this means it's an encoded version of the old struct.

Remember to also check if there are any remaining bytes after that and throw an error, otherwise, your struct could potentially be decoded from almost any input bytes.

[comment]: # (mx-context-auto)

### "But what if I want to remove a field?"

Unless you want to remove the very last field of the struct, and change nothing else, this is not possible, as you'd have almost no way of distinguishing between old and new data.

Assuming you simply want to remove `last_update_block` for the example above, the implementation would be as follows:

```rust
use multiversx_sc::codec::{NestedDecodeInput, TopDecodeInput};

#[derive(TypeAbi, TopEncode, NestedEncode)]
pub struct UserData<M: ManagedTypeApi> {
    pub stake_amount: BigUint<M>,
}

impl<M: ManagedTypeApi> TopDecode for UserData<M> {
    fn top_decode<I>(input: I) -> Result<Self, DecodeError>
    where
        I: TopDecodeInput,
    {
        let mut buffer = input.into_nested_buffer();
        Self::dep_decode(&mut buffer)
    }
}

impl<M: ManagedTypeApi> NestedDecode for UserData<M> {
    fn dep_decode<I: NestedDecodeInput>(input: &mut I) -> Result<Self, DecodeError> {
        let stake_amount = BigUint::dep_decode(input)?;

        if input.is_depleted() {
            return Result::Ok(UserData { stake_amount });
        }

        let _last_update_block = u64::dep_decode(input)?;
        if !input.is_depleted() {
            return Result::Err(DecodeError::INPUT_TOO_LONG);
        }

        Result::Ok(UserData { stake_amount })
    }
}
```

In this case, if there are any bytes left after we decode the `stake_amount`, we decode the old fields and ignore their values. Same as last time, remember to throw an error if there are bytes remaining still after that.

[comment]: # (mx-context-auto)

## Conclusion

This approach works for both stored instances, and token attributes. Keep in mind you'll have to keep adding more and more levels of partial decoding to the above implementation if you change the struct often, and new fields always have to be at the end.
