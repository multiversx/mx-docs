---
id: sc-api-functions
title: Smart Contract API Functions
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## Introduction

The Rust framework provides a wrapper over the MultiversX VM API functions and over account-level built-in functions. They are split into multiple modules, grouped by category:

- BlockchainApi: Provides general blockchain information, which ranges from account balances, NFT metadata/roles to information about the current and previous block (nonce, epoch, etc.)
- CallValueApi: Used in payable endpoints, providing information about the tokens received as payment (token type, nonce, amount)
- CryptoApi: Provides support for cryptographic functions like hashing and signature checking
- SendApi: Handles all types of transfers to accounts and smart contract calls/deploys/upgrades, as well as support for ESDT local built-in functions

- BlockchainApi: Provides general blockchain information, which ranges from account balances, NFT metadata/roles to information about the current and previous block (nonce, epoch, etc.)
- CallValueApi: Used in payable endpoints, providing information about the tokens received as payment (token type, nonce, amount)
- CryptoApi: Provides support for cryptographic functions like hashing and signature checking
- SendApi: Handles all types of transfers to accounts and smart contract calls/deploys/upgrades, as well as support for ESDT local built-in functions

The base trait for the APi is: https://docs.rs/multiversx-sc/0.39.0/multiversx_sc/api/trait.VMApi.html

The source code for the APIs can be found here: https://github.com/multiversx/mx-sdk-rs/tree/master/framework/base/src/api

[comment]: # (mx-context-auto)

## Blockchain API

This API is accessible through `self.blockchain()`. Available functions:

[comment]: # (mx-context-auto)

### get_sc_address

```rust
get_sc_address() -> ManagedAddress
```

Returns the smart contract's own address.

[comment]: # (mx-context-auto)

### get_owner_address

```rust
get_owner_address() -> ManagedAddress
```

Returns the owner's address.

[comment]: # (mx-context-auto)

### check_caller_is_owner

```rust
check_caller_is_owner()
```

Terminates the execution and signals an error if the caller is not the owner.

Use `#[only_owner]` endpoint annotation instead of directly calling this function.

[comment]: # (mx-context-auto)

### get_shard_of_address

```rust
get_shard_of_address(address: &ManagedAddress) -> u32
```

Returns the shard of the address passed as argument.

[comment]: # (mx-context-auto)

### is_smart_contract

```rust
is_smart_contract(address: &ManagedAddress) -> bool
```

Returns `true` if the address passed as parameter is a Smart Contract address, `false` for simple accounts.

[comment]: # (mx-context-auto)

### get_caller

```rust
get_caller() -> ManagedAddress
```

Returns the current caller.

Keep in mind that for SC Queries, this function will return the SC's own address, so having a view function that uses this API function will not have the expected behaviour.

[comment]: # (mx-context-auto)

### get_balance

```rust
get_balance(address: &ManagedAddress) -> BigUint
```

Returns the EGLD balance of the given address.

This only works for addresses that are in the same shard as the smart contract.

[comment]: # (mx-context-auto)

### get_sc_balance

```rust
get_sc_balance(token: &EgldOrEsdtTokenIdentifier, nonce: u64) -> BigUint
```

Returns the EGLD/ESDT/NFT balance of the smart contract.

For fungible ESDT, nonce should be 0. To get the EGLD balance, you can simply pass `EgldOrEsdtTokenIdentifier::egld()` as parameter.

[comment]: # (mx-context-auto)

### get_tx_hash

```rust
get_tx_hash() -> ManagedByteArray<Self::Api, 32>
```

Returns the current tx hash.

In case of asynchronous calls, the tx hash is the same both in the original call and in the associated callback.

[comment]: # (mx-context-auto)

### get_gas_left

```rust
get_gas_left() - > u64
```

Returns the remaining gas, at the time of the call.

This is useful for expensive operations, like iterating over an array of users in storage and sending rewards.

A smart contract call that runs out of gas will revert all operations, so this function can be used to return _before_ running out of gas, saving a checkpoint, and continuing on a second call.

[comment]: # (mx-context-auto)

### get_block_timestamp

```rust
get_block_timestamp() -> u64
```

[comment]: # (mx-context-auto)

### get_block_nonce

```rust
get_block_nonce() -> u64
```

[comment]: # (mx-context-auto)

### get_block_round

```rust
get_block_round() -> u64
```

[comment]: # (mx-context-auto)

### get_block_epoch

```rust
get_block_epoch() -> u64
```

These functions are mostly used for setting up deadlines, so they've been grouped together.

[comment]: # (mx-context-auto)

### get_block_random_seed

```rust
get_block_random_seed() -> ManagedByteArray<Self::Api, 48>
```

Returns the block random seed, which can be used for generating random numbers.

This will be the same for all the calls in the current block, so it can be predicted by someone calling this at the start of the round and only then calling your contract.

[comment]: # (mx-context-auto)

### get_prev_block_timestamp

```rust
get_prev_block_timestamp() -> u64
```

[comment]: # (mx-context-auto)

### get_prev_block_nonce

```rust
get_prev_block_nonce() -> u64
```

[comment]: # (mx-context-auto)

### get_prev_block_round

```rust
get_prev_block_round() -> u64
```

[comment]: # (mx-context-auto)

### get_prev_block_epoch

```rust
get_prev_block_epoch() -> u64
```

[comment]: # (mx-context-auto)

### get_prev_block_random_seed

```rust
get_prev_block_random_seed() -> ManagedByteArray<Self::Api, 48>
```

The same as the functions above, but for the previous block instead of the current block.

[comment]: # (mx-context-auto)

### get_current_esdt_nft_nonce

```rust
get_current_esdt_nft_nonce(address: &ManagedAddress, token_id: &TokenIdentifier) -> u64
```

Gets the last nonce for an SFT/NFT. Nonces are incremented after every ESDTNFTCreate operation.

This only works for accounts that have the ESDTNFTCreateRole set and only for accounts in the same shard as the smart contract.

This function is usually used with `self.blockchain().get_sc_address()` for smart contracts that create SFT/NFTs themselves.

[comment]: # (mx-context-auto)

### get_esdt_balance

```rust
get_esdt_balance(address: &ManagedAddress, token_id: &TokenIdentifier, nonce: u64) -> BigUint
```

Gets the ESDT/SFT/NFT balance for the specified address.

This only works for addresses that are in the same shard as the smart contract.

For fungible ESDT, nonce should be 0. For EGLD balance, use the `get_balance` instead.

[comment]: # (mx-context-auto)

### get_esdt_token_data

```rust
get_esdt_token_data(address: &ManagedAddress, token_id: &TokenIdentifier, nonce: u64) -> EsdtTokenData<Self::Api>
```

Gets the ESDT token properties for the specific token type, owned by the specified address.

`EsdtTokenData` has the following format:

```rust
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

```rust
pub enum EsdtTokenType {
    Fungible,
    NonFungible,
    SemiFungible,
    Meta,
    Invalid,
}
```

You will only receive basic distinctions for the token type, i.e. only `Fungible` and `NonFungible` (The smart contract has no way of telling the difference between non-fungible, semi-fungible and meta tokens).

`amount` is the current owned balance of the account.

`frozen` is a boolean indicating if the account is frozen or not.

`hash` is the hash of the NFT. Generally, this will be the hash of the `attributes`, but this is not enforced in any way. Also, the hash length is not fixed either.

`name` is the name of the NFT, often used as display name in front-end applications.

`attributes` can contain any user-defined data. If you know the format, you can use the `EsdtTokenData::decode_attributes` method to deserialize them.

`creator` is the creator's address.

`royalties` a number between 0 and 10,000, meaning a percentage of any selling price the creator receives. This is used in the ESDT NFT marketplace, but is not enforced in any other way. (The way these percentages work is 5,444 would be 54.44%, which you would calculate: price \* 5,444 / 10,000. This convention is used to grant some additional precision)

`uris` list of URIs to an image/audio/video, which represents the given NFT.

This only works for addresses that are in the same shard as the smart contract.

Most of the time, this function is used with `self.blockchain().get_sc_address()` as address to get the properties of a token that is owned by the smart contract, or was transferred to the smart contract in the current executing call.

[comment]: # (mx-context-auto)

### get_esdt_local_roles

```rust
get_esdt_local_roles(token_id: &TokenIdentifier) -> EsdtLocalRoleFlags
```

Gets the ESDTLocalRoles set for the smart contract, as a bitflag. The returned type contains methods of checking if a role exists and iterating over all the roles.

This is done by simply reading protected storage, but this is a convenient function to use.

[comment]: # (mx-context-auto)

## Call Value API

This API is accessible through `self.call_value()`. The alternative is to use the `#[payment]` annotations, but we no longer recommend them. They have a history of creating confusion, especially for new users.

Available functions:

[comment]: # (mx-context-auto)

### egld_value

```rust
egld_value() -> BigUint
```

Returns the amount of EGLD transferred in the current transaction. Will return 0 for ESDT transfers.

[comment]: # (mx-context-auto)

### all_esdt_transfers

```rust
all_esdt_transfers() -> ManagedVec<EsdtTokenPayment<Self::Api>>
```

Returns all ESDT transfers. Useful when you're expecting a variable number of transfers.

Returns the payments into a `ManagedVec` of structs, that contain the token type, token ID, token nonce and the amount being transferred:

```rust
pub struct EsdtTokenPayment<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub amount: BigUint<M>,
}
```

[comment]: # (mx-context-auto)

### multi_esdt

```rust
multi_esdt<const N: usize>() -> [EsdtTokenPayment<Self::Api>; N]
```

Returns a fixed number of ESDT transfers as an array. Will signal an error if the number of ESDT transfers differs from `N`.

For example, if you always expect exactly 3 payments in your endpoint, you can use this function like so:  
`let [payment_a, payment_b, payment_c] = self.call_value().multi_esdt();`

[comment]: # (mx-context-auto)

### single_esdt

```rust
single_esdt() -> EsdtTokenPayment<Self::Api>
```

Returns the received ESDT token payment if exactly one was received. Will signal an error in case of multi-transfer or no transfer.

[comment]: # (mx-context-auto)

### single_fungible_esdt

```rust
single_fungible_esdt(&self) -> (TokenIdentifier, BigUint)
```

Similar to the function above, but also enforces the payment to be a fungible ESDT.

[comment]: # (mx-context-auto)

### egld_or_single_fungible_esdt

```rust
egld_or_single_fungible_esdt(&self) -> (EgldOrEsdtTokenIdentifier<Self::Api>, BigUint)
```

Same as the function above, but also allows EGLD to be received.

[comment]: # (mx-context-auto)

### egld_or_single_esdt

```rust
egld_or_single_esdt() -> EgldOrEsdtTokenPayment<Self::Api>
```

Allows EGLD or any single ESDT token to be received.

[comment]: # (mx-context-auto)

## Crypto API

This API is accessible through `self.crypto()`. It provides hashing functions and signature verification. Since those functions are widely known and have their own pages of documentation, we will not go into too much detail in this section.

Hashing functions:

[comment]: # (mx-context-auto)

### sha256

```rust
sha256(data: &ManagedBuffer) -> ManagedByteArray<Self::Api, 32>
```

[comment]: # (mx-context-auto)

### keccak256

```rust
keccak256(data: &ManagedBuffer) -> ManagedByteArray<Self::Api, 32>
```

[comment]: # (mx-context-auto)

### ripemd160

```rust
ripemd160(data: &ManagedBuffer) -> ManagedByteArray<Self::Api, 20>
```

Signature verification functions:

[comment]: # (mx-context-auto)

### verify_ed25519_legacy_managed

```rust
verify_ed25519_legacy_managed<const MAX_MESSAGE_LEN: usize>(key: &ManagedByteArray<Self::Api, 32>, message: &ManagedBuffer, signature: &ManagedByteArray<Self::Api, 64>) -> bool
```

[comment]: # (mx-context-auto)

### verify_bls

```rust
verify_bls(key: &[u8], message: &[u8], signature: &[u8]) -> bool
```

[comment]: # (mx-context-auto)

### verify_secp256k1

```rust
verify_secp256k1(key: &[u8], message: &[u8], signature: &[u8]) -> bool
```

[comment]: # (mx-context-auto)

### verify_custom_secp256k1

```rust
verify_custom_secp256k1(key: &[u8], message: &[u8], signature: &[u8], hash_type: MessageHashType) -> bool
```

`MessageHashType` is an enum, representing the hashing algorithm that was used to create the `message` argument. Use `ECDSAPlainMsg` if the message is in "plain text".

```rust
pub enum MessageHashType {
    ECDSAPlainMsg,
    ECDSASha256,
    ECDSADoubleSha256,
    ECDSAKeccak256,
    ECDSARipemd160,
}
```

To be able to use the hashing functions without dynamic allocations, we use a concept in Rust known as `const generics`. This allows the function to have a constant value as a generic instead of the usual trait types you'd see in generics. The value is used to allocate a static buffer in which the data is copied temporarily, to then be passed to the legacy API.

To call such a function, the call would look like this:

```rust
let hash = self.crypto().sha256_legacy_managed::<200>(&data);
```

Where `200` is the max expected byte length of `data`.

[comment]: # (mx-context-auto)

### encode_secp256k1_der_signature

```rust
encode_secp256k1_der_signature(r: &[u8], s: &[u8]) -> BoxedBytes
```

Creates a signature from the corresponding elliptic curve parameters provided.

[comment]: # (mx-context-auto)

## Send API

This API is accessible through `self.send()`. It provides functionalities like sending tokens, performing smart contract calls, calling built-in functions and much more.

We will not describe every single function in the API, as that would create confusion. We will only describe those that are recommended to be used (as they're mostly wrappers around more complicated low-level functions).

For Smart Contract to Smart Contract calls, use the Proxies, as described in the [contract calls](sc-contract-calls.md) section.

Without further ado, let's take a look at the available functions:

[comment]: # (mx-context-auto)

### direct

```rust
direct(to: &ManagedAddress, token: &EgldOrEsdtTokenIdentifier, nonce: u64, amount: &BigUint)
```

Performs a simple EGLD/ESDT/NFT transfer to the target address, with some optional additional data. If you want to send EGLD, simply pass `EgldOrEsdtTokenIdentifier::egld()`. For both EGLD and fungible ESDT, `nonce` should be 0.

This will fail if the destination is a non-payable smart contract, but the current executing transaction will only fail if the destination SC is in the same shard, and as such, any changes done to the storage will persist. The tokens will not be lost though, as they will be automatically returned.

Even though an invalid destination will not revert, an illegal transfer will return an error and revert. An illegal transfer is any transfer that would leave the SC with a negative balance for the specific token.

If you're unsure about the destination's account type, you can use the `is_smart_contract` function from `Blockchain API`.

If you need a bit more control, use the `direct_with_gas_limit` function instead.

[comment]: # (mx-context-auto)

### direct_egld

```rust
direct_egld(to: &ManagedAddress, amount: &BigUint)
```

The EGLD-transfer version for the `direct` function.

[comment]: # (mx-context-auto)

### direct_esdt

```rust
direct_esdt(to: &ManagedAddress, token_id: &TokenIdentifier, token_nonce: u64, amount: &BigUint)
```

The ESDT-only version for the `direct` function. Used so you don't have to wrap `TokenIdentifier` into an `EgldOrEsdtTokenIdentifier`.

[comment]: # (mx-context-auto)

### direct_multi

```rust
direct_multi(to: &ManagedAddress, payments: &ManagedVec<EsdtTokenPayment<Self::Api>>)
```

The multi-transfer version for the `direct_esdt` function. Keep in mind you cannot transfer EGLD with this function, only ESDTs.

[comment]: # (mx-context-auto)

### change_owner_address

```rust
change_owner_address(child_sc_address: &ManagedAddress, new_owner: &ManagedAddress)
```

Changes the ownership of target child contract to another address. This will fail if the current contract is not the owner of the `child_sc_address` contract.

This also has the implication that the current contract will not be able to call `#[only_owner]` functions of the child contract, upgrade, or change owner again.

[comment]: # (mx-context-auto)

### esdt_local_mint

```rust
esdt_local_mint(token: &TokenIdentifier, nonce: u64, amount: &BigUint)
```

Allows synchronous minting of ESDT/SFT (depending on nonce). Execution is resumed afterwards. Note that the SC must have the `ESDTLocalMint` or `ESDTNftAddQuantity` roles set, or this will fail with "action is not allowed".

For SFTs, you must use `esdt_nft_create` before adding additional quantity.

This function cannot be used for NFTs.

[comment]: # (mx-context-auto)

### esdt_local_burn

```rust
esdt_local_burn(token: &TokenIdentifier, nonce: u64, amount: &BigUint)
```

The inverse operation of `esdt_local_mint`, which permanently removes the tokens. Note that the SC must have the `ESDTLocalBurn` or `ESDTNftBurn` roles set, or this will fail with "action is not allowed".

Unlike the mint function, this can be used for NFTs.

[comment]: # (mx-context-auto)

### esdt_nft_create

```rust
esdt_nft_create<T: TopEncode>(token: &TokenIdentifier, amount: &BigUint, name: &ManagedBuffer, royalties: &BigUint, hash: &ManagedBuffer, attributes: &T, uris: &ManagedVec< ManagedBuffer>) -> u64
```

Creates a new SFT/NFT, and returns its nonce.

Must have `ESDTNftCreate` role set, or this will fail with "action is not allowed".

`token` is identifier of the SFT/NFT brand.

`amount` is the amount of tokens to be minted. For NFTs, this should be "1".

`name` is the display name of the token, which will be used in explorers, marketplaces, etc.

`royalties` is a number between 0 and 10,000, which represents the percentage of any selling amount the creator receives. This representation is used to be able to have more precision. For example, a percentage like `55.66%` is stored as `5566`. These royalties are not enforced, and will mostly be used in "official" NFT marketplaces.

`hash` is a user-defined hash for the token. Recommended value is sha256(attributes), but it can be anything.

`attributes` can be any serializable user-defined struct, more specifically, any type that implements the `TopEncode` trait. There is no real standard for attributes format at the point of writing this document, but that might change in the future.

`uris` is a list of links to the NFTs visual/audio representation, most of the time, these will be links to images, videos or songs. If empty, the framework will automatically add an "empty" URI.

[comment]: # (mx-context-auto)

### esdt_nft_create_compact

```rust
esdt_nft_create_compact<T: TopEncode>(token: &TokenIdentifier, amount: &BigUint, attributes: &T) -> u64
```

Same as `esdt_nft_create`, but fills most arguments with default values. Mostly used in contracts that use NFTs as a means of information rather than for display purposes.

[comment]: # (mx-context-auto)

### sell_nft

```rust
sell_nft(nft_id: &TokenIdentifier, nft_nonce: u64, nft_amount: &BigUint, buyer: &ManagedAddress, payment_token: &EgldOrEsdtTokenIdentifier, payment_nonce: u64, payment_amount: &BigUint) -> BigUint
```

Sends the SFTs/NFTs to target address, while also automatically calculating and sending NFT royalties to the creator. Returns the amount left after deducting royalties.

`(nft_id, nft_nonce, nft_amount)` are the SFTs/NFTs that are going to be sent to the `buyer` address.

`(payment_token, payment_nonce, payment_amount)` are the tokens that are used to pay the creator royalties.

This function's purpose is mostly to be used in marketplace-like smart contracts, where the contract sells NFTs to users.

[comment]: # (mx-context-auto)

### nft_add_uri

```rust
nft_add_uri(token_id: &TokenIdentifier, nft_nonce: u64, new_uri: ManagedBuffer)
```

Adds an URI to the selected NFT. The SC must own the NFT and have the `ESDTRoleNFTAddURI` to be able to use this function.

If you need to add multiple URIs at once, you can use `nft_add_multiple_uri` function, which takes a `ManagedVec<ManagedBuffer>` as argument instead.

[comment]: # (mx-context-auto)

### nft_update_attributes

```rust
nft_update_attributes<T: TopEncode>(token_id: &TokenIdentifier, nft_nonce: u64, new_attributes: &T)
```

Updates the attributes of the selected NFT to the provided value. The SC must own the NFT and have the `ESDTRoleNFTUpdateAttributes` to be able to update the attributes.

[comment]: # (mx-context-auto)

## Conclusion

While there are still other various APIs in multiversx-sc, they are mostly hidden from the user. These are the ones you're going to be using in your day-to-day smart contract development.
