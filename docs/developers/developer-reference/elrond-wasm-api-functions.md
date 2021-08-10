---
id: elrond-wasm-api-functions
title: Smart Contract API Functions
---

## Introduction

The Rust framework provides a wrapper over the Arwen API functions and over account-level built-in functions. They are split into multiple modules, grouped by category:  
- BlockchainApi: Provides general blockchain information, which ranges from account balances, NFT metadata/roles to information about the current and previous block (nonce, epoch, etc.)  
- CallValueApi: Used in payable endpoints, providing information about the tokens received as payment (token type, nonce, amount)  
- CryptoApi: Provides support for cryptographic functions like hashing and signature checking  
- SendApi: Handles all types of transfers to accounts and smart contract calls/deploys/upgrades, as well as support for ESDT local built-in functions  

The source code for the APIs can be found here: https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/elrond-wasm/src/api  

Keep in mind that through the source code, you might see various aliases for `Self::BigUint`, like `Self::AmountType` and `Self::BalanceType`. These are all equivalent and you can safely use `Self::BigUint` everywhere in your smart contract. In the chapters to come, we will use `Self::BigUint` everywhere to prevent any confusion.  

## Blockchain API

This API is accessible through `self.blockchain()`. Available functions:  

### `get_sc_address() -> Address`  
Returns the smart contract's own address.

### `get_owner_address() -> Address`  
Returns the owner's address.

### `check_caller_is_owner()`  
Signals an error if the caller is not the owner.  

Use `#[only_owner]` endpoint annotation instead of directly calling this function.

### `get_shard_of_address(address: &Address) -> u32`  
Returns the shard of the address passed as argument.

### `is_smart_contract(address: &Address) -> bool`  
Returns `true` if the address passed as parameter is a Smart Contract address, `false` for simple accounts.

### `get_caller() -> Address`  
Returns the current caller.  

Keep in mind that for SC Queries, this function will return the SC's own address, so having a view function that uses this API function will not have the expected behaviour.

### `get_balance(address: &Address) -> Self::BigUint`  
Returns the EGLD balance of the given address.  

This only works for addresses that are in the same shard as the smart contract.  

### `get_sc_balance(token: &TokenIdentifier, nonce: u64) -> Self::BigUint`  
Returns the EGLD/ESDT/NFT balance of the smart contract.  

For fungible ESDT, nonce should be 0. To get the EGLD balance, you can simply pass `TokenIdentifier::egld()` as parameter.  

### `get_tx_hash() -> H256`
Returns the current tx hash.  

In case of asynchronous calls, the tx hash is the same both in the original call and in the associated callback.

### `get_gas_left() - > u64`  
Returns the remaining gas, at the time of the call.  

This is useful for expensive operations, like iterating over an array of users in storage and sending rewards.  

A smart contract call that runs out of gas will revert all operations, so this function can be used to return _before_ running out of gas, saving a checkpoint, and continuing on a second call.

### `get_block_timestamp() -> u64`  
### `get_block_nonce() -> u64`  
### `get_block_round() -> u64`  
### `get_block_epoch() -> u64`  
These functions are mostly used for setting up deadlines, so they've been grouped together.

### `get_block_random_seed() -> Box<[u8; 48]>`  
Returns the block random seed, which can be used for generating random numbers.  

This will be the same for all the calls in the current block, so it can be predicted by someone calling this at the start of the round and only then calling your contract.  

### `get_prev_lock_timestamp() -> u64`  
### `get_prev_block_nonce() -> u64`  
### `get_prev_block_round() -> u64`  
### `get_prev_block_epoch() -> u64`  
### `get_prev_block_random_seed() -> Box<[u8; 48]>`  
The same as the functions above, but for the previous block instead of the current block.

### `get_current_esdt_nft_nonce(address: &Address, token_id: &TokenIdentifier) -> u64`  
Gets the last nonce for an SFT/NFT. Nonces are incremented after every ESDTNFTCreate operation.  

This only works for accounts that have the ESDTNFTCreateRole set and only for accounts in the same shard as the smart contract.  

This function is usually used with `self.blockchain().get_sc_address()` for smart contracts that create SFT/NFTs themselves.  

### `get_esdt_balance(address: &Address, token_id: &TokenIdentifier, nonce: u64) -> Self::BigUint`  
Gets the ESDT/SFT/NFT balance for the specified address.  

This only works for addresses that are in the same shard as the smart contract.  

For fungible ESDT, nonce should be 0. For EGLD balance, use the `get_balance` instead.  

### `get_esdt_token_data(address: &Address, token_id: &TokenIdentifier, nonce: u64) -> EsdtTokenData<Self::BigUint>`  
Gets the ESDT token properties for the specific token type, owned by the specified address.  

`EsdtTokenData` has the following format:  
```
pub struct EsdtTokenData<BigUint: BigUintApi> {
    pub token_type: EsdtTokenType,
    pub amount: BigUint,
    pub frozen: bool,
    pub hash: BoxedBytes,
    pub name: BoxedBytes,
    pub attributes: BoxedBytes,
    pub creator: Address,
    pub royalties: BigUint,
    pub uris: Vec<BoxedBytes>,
}
```

`token_type` is an enum, which can have one of the following values:  
```
pub enum EsdtTokenType {
    Fungible,
    NonFungible,
    SemiFungible,
    Invalid,
}
```

You will never receive `EsdtTokenType::Invalid` or `EsdtTokenType::SemiFungible` from this function (The smart has no way of telling the difference between non-fungible and semi-fungible tokens).  

`amount` is the current owned balance of the account.  

`frozen` is a boolean if the account if frozen or not.  

`hash` is the hash of the NFT. Generally, this will be the hash of the `attributes`, but this is not enforced in any way. Also, the hash length is not fixed either.  

`name` is the name of the NFT, often used as display name in front-end applications.  

`attributes` can contain any user-defined data. If you know the format, you can use the `EsdtTokenData::decode_attributes` method to deserialize them.  

`creator` is the creator's address.  

`royalties` a number between 0 and 10,000, meaning a percentage of any selling price the creator receives. This is used in the ESDT NFT marketplace, but is not enforced in any other way. (The way these percentages work is 5,444 would be 54.44%, which you would calculate: price * 5,444 / 10,000. This convention is used to grant some additional precision)  

`uris` list of URIs to an image/audio/video, which represents the given NFT.  

This only works for addresses that are in the same shard as the smart contract.  

Most of the time, this function is used with `self.blockchain().get_sc_address()` as address to get the properties of a token that is owned by the smart contract, or was transfered to the smart contract in the current executing call.  

### `get_esdt_local_roles(token_id: &TokenIdentifier) -> Vec<EsdtLocalRole>`  
Gets the ESDTLocalRoles set for the smart contract.  

This is done by simply reading protected storage, but this is a convenient function to use.  

