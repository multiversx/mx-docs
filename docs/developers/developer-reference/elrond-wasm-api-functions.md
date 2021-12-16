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

## Blockchain API

This API is accessible through `self.blockchain()`. Available functions:  

### `get_sc_address() -> ManagedAddress`  
Returns the smart contract's own address.

### `get_owner_address() -> ManagedAddress`  
Returns the owner's address.

### `check_caller_is_owner()`  
Terminates the execution and signals an error if the caller is not the owner.  

Use `#[only_owner]` endpoint annotation instead of directly calling this function.

### `get_shard_of_address(address: &ManagedAddress) -> u32`  
Returns the shard of the address passed as argument.

### `is_smart_contract(address: &ManagedAddress) -> bool`  
Returns `true` if the address passed as parameter is a Smart Contract address, `false` for simple accounts.

### `get_caller() -> ManagedAddress`  
Returns the current caller.  

Keep in mind that for SC Queries, this function will return the SC's own address, so having a view function that uses this API function will not have the expected behaviour.

### `get_balance(address: &ManagedAddress) -> BigUint`  
Returns the EGLD balance of the given address.  

This only works for addresses that are in the same shard as the smart contract.  

### `get_sc_balance(token: &TokenIdentifier, nonce: u64) -> BigUint`  
Returns the EGLD/ESDT/NFT balance of the smart contract.  

For fungible ESDT, nonce should be 0. To get the EGLD balance, you can simply pass `TokenIdentifier::egld()` as parameter.  

### `get_tx_hash() -> ManagedByteArray<A, 32>`
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

### `get_block_random_seed() -> ManagedByteArray<A, 48>`  
Returns the block random seed, which can be used for generating random numbers.  

This will be the same for all the calls in the current block, so it can be predicted by someone calling this at the start of the round and only then calling your contract.  

### `get_prev_lock_timestamp() -> u64`  
### `get_prev_block_nonce() -> u64`  
### `get_prev_block_round() -> u64`  
### `get_prev_block_epoch() -> u64`  
### `get_prev_block_random_seed() -> ManagedByteArray<A, 48>`  
The same as the functions above, but for the previous block instead of the current block.

### `get_current_esdt_nft_nonce(address: &ManagedAddress, token_id: &TokenIdentifier) -> u64`  
Gets the last nonce for an SFT/NFT. Nonces are incremented after every ESDTNFTCreate operation.  

This only works for accounts that have the ESDTNFTCreateRole set and only for accounts in the same shard as the smart contract.  

This function is usually used with `self.blockchain().get_sc_address()` for smart contracts that create SFT/NFTs themselves.  

### `get_esdt_balance(address: &ManagedAddress, token_id: &TokenIdentifier, nonce: u64) -> BigUint`  
Gets the ESDT/SFT/NFT balance for the specified address.  

This only works for addresses that are in the same shard as the smart contract.  

For fungible ESDT, nonce should be 0. For EGLD balance, use the `get_balance` instead.  

### `get_esdt_token_data(address: &ManagedAddress, token_id: &TokenIdentifier, nonce: u64) -> EsdtTokenData<Self::Api>`  
Gets the ESDT token properties for the specific token type, owned by the specified address.  

`EsdtTokenData` has the following format:  
```
pub struct EsdtTokenData<M: ManagedTypeApi> {
    pub token_type: EsdtTokenType,
    pub amount: BigUint<M>,
    pub frozen: bool,
    pub hash: ManagedBuffer<M>,
    pub name: ManagedBuffer<M>,
    pub attributes: ManagedBuffer<M>,
    pub creator: ManagedAddress<M>,
    pub royalties: BigUint<M>,
    pub uris: ManagedVec<M, ManagedBuffer<M>>,
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

`frozen` is a boolean indicating if the account is frozen or not.  

`hash` is the hash of the NFT. Generally, this will be the hash of the `attributes`, but this is not enforced in any way. Also, the hash length is not fixed either.  

`name` is the name of the NFT, often used as display name in front-end applications.  

`attributes` can contain any user-defined data. If you know the format, you can use the `EsdtTokenData::decode_attributes` method to deserialize them.  

`creator` is the creator's address.  

`royalties` a number between 0 and 10,000, meaning a percentage of any selling price the creator receives. This is used in the ESDT NFT marketplace, but is not enforced in any other way. (The way these percentages work is 5,444 would be 54.44%, which you would calculate: price * 5,444 / 10,000. This convention is used to grant some additional precision)  

`uris` list of URIs to an image/audio/video, which represents the given NFT.  

This only works for addresses that are in the same shard as the smart contract.  

Most of the time, this function is used with `self.blockchain().get_sc_address()` as address to get the properties of a token that is owned by the smart contract, or was transferred to the smart contract in the current executing call.  

### `get_esdt_local_roles(token_id: &TokenIdentifier) -> EsdtLocalRoleFlags`  
Gets the ESDTLocalRoles set for the smart contract, as a bitflag. The returned type contains methods of checking if a role exists and iterating over all the roles.  

This is done by simply reading protected storage, but this is a convenient function to use.  

## Call Value API

This API is accessible through `self.call_value()`. You should never have to call these functions. Use the `#[payment]` annotations instead.  

Available functions:  

### `egld_value() -> BigUint`  
Returns the amount of EGLD transferred in the current transaction. Will return 0 for ESDT transfers.  

### `esdt_value() -> BigUint`  
Returns the amount of ESDT transferred in the current transaction. Will return 0 for EGLD transfers.  

### `token() -> TokenIdentifier`  
Returns the identifier of the token transferred in the current transaction. Will return `TokenIdentifier::egld()` for EGLD transfers.  

Use `#[payment_token]` argument annotation instead of directly calling this function.  

### `esdt_token_nonce() -> u64`
Returns the nonce of the SFT/NFT transferred in the current transaction. Will return 0 for EGLD or fungible ESDT transfers.  

Use `#[payment_nonce]` argument annotation instead of directly calling this function.  

### `esdt_token_type() -> EsdtTokenType`
Returns the type of token transferred in the current transaction. Will only return `EsdtTokenType::Fungible` or `EsdtTokenType::NonFungible`.   

### `payment_token_pair() -> (BigUint, TokenIdentifier)`  
Returns the amount and the ID of the token transferred in the current transaction.  

Mostly used by auto-generated code. Use `#[payment_token]` and `#[payment_amount]` argument annotations instead.  

### `all_esdt_transfers() -> ManagedVec<EsdtTokenPayment<Self::Api>>`  
Returns all the ESDT payments received in the current transaction. Used when you want to support ESDT Multi-transfers in your endpoint. Mostly used in auto-generated code. Use `#[payment_multi]` annotation instead: `#[payment_multi] payments: ManagedVec<EsdtTokenPayment<Self::Api>>`

Returns an array of structs, that contain the token type, token ID, token nonce and the amount being transferred:  
```
pub struct EsdtTokenPayment<M: ManagedTypeApi> {
    pub token_type: EsdtTokenType,
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
}
```

## Crypto API

This API is accessible through `self.crypto()`. It provides hashing functions and signature verification. Since those functions are widely known and have their own pages of documentation, we will not go into too much detail in this section.  

Hashing functions:  

### `sha256(data: &[u8]) -> H256`  
### `keccak256(data: &[u8]) -> H256`  
### `ripemd160(data: &[u8]) -> Box<[u8; 20]>`  

Signature verification functions:  

### `verify_bls(key: &[u8], message: &[u8], signature: &[u8]) -> bool`  
### `verify_ed25519(key: &[u8], message: &[u8], signature: &[u8]) -> bool`  
### `verify_secp256k1(key: &[u8], message: &[u8], signature: &[u8]) -> bool`  
### `verify_custom_secp256k1(key: &[u8], message: &[u8], signature: &[u8], hash_type: MessageHashType) -> bool`  

`MessageHashType` is an enum, representing the hashing algorithm that was used to create the `message` argument. Use `ECDSAPlainMsg` if the message is in "plain text".  

```
pub enum MessageHashType {
    ECDSAPlainMsg,
    ECDSASha256,
    ECDSADoubleSha256,
    ECDSAKeccak256,
    ECDSARipemd160,
}
```

Other:  

### `encode_secp256k1_der_signature(r: &[u8], s: &[u8]) -> BoxedBytes`  
Creates a signature from the corresponding elliptic curve parameters provided.  

## Send API

This API is accessible through `self.send()`. It provides functionalities like sending tokens, performing smart contract calls, calling built-in functions and much more.  

We will not describe every single function in the API, as that would create confusion. We will only describe those that are recommended to be used (as they're mostly wrappers around more complicated low-level functions).  

For Smart Contract to Smart Contract calls, use the Proxies, as described in the [contract calls](elrond-wasm-contract-calls.md) section.  

Without further ado, let's take a look at the available functions:  

### `direct<D>(to: &ManagedAddress<A>, token: &TokenIdentifier<A>, nonce: u64, amount: &BigUint<A>, data: D`

Where `D` is any type that can be converted to a `ManagedBuffer`.  

Performs a simple EGLD/ESDT/NFT transfer to the target address, with some optional additional data. If you want to send EGLD, simply pass `TokenIdentifier::egld()`. For both EGLD and fungible ESDT, `nonce` should be 0.  

This will fail if the destination is a non-payable smart contract, but the current executing transaction will not fail, and as such, any changes done to the storage will persist. The tokens will not be lost though, as they will be automatically returned.  

Even though an invalid destination will not revert, an illegal transfer will return an error and revert. An illegal transfer is any transfer that would leave the SC with a negative balance for the specific token.  

If you're unsure about the destination's account type, you can use the `is_smart_contract` function from `Blockchain API`.  

If you need a bit more control, use the `direct_with_gas_limit` function instead.    

### `change_owner_address(child_sc_address: &ManagedAddress, new_owner: &ManagedAddress)`  
Changes the ownership of target child contract to another address. This will fail if the current contract is not the owner of the `child_sc_address` contract.  

This also has the implication that the current contract will not be able to call `#[only_owner]` functions of the child contract, upgrade, or change owner again.  

### `esdt_local_mint(token: &TokenIdentifier, nonce: u64, amount: &BigUint)`  
Allows synchronous minting of ESDT/SFT (depending on nonce). Execution is resumed afterwards. Note that the SC must have the `ESDTLocalMint` or `ESDTNftAddQuantity` roles set, or this will fail with "action is not allowed".  

For SFTs, you must use `esdt_nft_create` before adding additional quantity.  

This function cannot be used for NFTs.  

### `esdt_local_burn(token: &TokenIdentifier, nonce: u64, amount: &BigUint)`  
The inverse operation of `esdt_local_mint`, which permanently removes the tokens.  Note that the SC must have the `ESDTLocalBurn` or `ESDTNftBurn` roles set, or this will fail with "action is not allowed".  

Unlike the mint function, this can be used for NFTs.  

### `esdt_nft_create<T: elrond_codec::TopEncode>(token: &TokenIdentifier, amount: &BigUint, name: &ManagedBuffer, royalties: &BigUint, hash: &ManagedBuffer, attributes: &T, uris: &ManagedVec< ManagedBuffer>) -> u64`  
Creates a new SFT/NFT, and returns its nonce.  

Must have `ESDTNftCreate` role set, or this will fail with "action is not allowed".  

`token` is identifier of the SFT/NFT brand.  

`amount` is the amount of tokens to be minted. For NFTs, this should be "1".  

`name` is the display name of the token, which will be used in explorers, marketplaces, etc.  

`royalties` is a number between 0 and 10,000, which represents the percentage of any selling amount the creator receives. This representation is used to be able to have more precision. For example, a percentage like `55.66%` is stored as `5566`. These royalties are not enforced, and will mostly be used in "official" NFT marketplaces.  

`hash` is a user-defined hash for the token. Recommended value is sha256(attributes), but it can be anything.  

`attributes` can be any serializable user-defined struct, more specifically, any type that implements the `TopEncode` trait. There is no real standard for attributes format at the point of writing this document, but that might change in the future.  

`uris` is a list of links to the NFTs visual/audio representation, most of the time, these will be links to images, videos or songs. If empty, the framework will automatically add an "empty" URI.

### `sell_nft(nft_id: &TokenIdentifier, nft_nonce: u64, nft_amount: &BigUint, buyer: &ManagedAddress, payment_token: &TokenIdentifier, payment_nonce: u64, payment_amount: &BigUint) -> BigUint`  
Sends the SFTs/NFTs to target address, while also automatically calculating and sending NFT royalties to the creator. Returns the amount left after deducting royalties.  

`(nft_id, nft_nonce, nft_amount)` are the SFTs/NFTs that are going to be sent to the `buyer` address.  

`(payment_token, payment_nonce, payment_amount)` are the tokens that are used to pay the creator royalties.  

This function's purpose is mostly to be used in marketplace-like smart contracts, where the contract sells NFTs to users.  

## Conclusion

While there are still other various APIs in elrond-wasm, they are mostly hidden from the user. These are the ones you're going to be using in your day-to-day smart contract development.  
