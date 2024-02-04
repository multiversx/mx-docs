---
id: built-in-functions
title: Built-In Functions
---

[comment]: # (mx-abstract)

## **Introduction**

MultiversX protocol has a set of built-in functions. A built-in function is a special protocol-side function that doesn't
require a specific smart contract address as receiver of the transaction. When such a function is called via a transaction,
built-in handlers are triggered and will execute it.

Calls to these functions are considered `built-in function calls` and are treated different than other smart contract calls.

This documentation is subject to change, but at the time of writing, the current built-in functions were:

- ClaimDeveloperRewards
- ChangeOwnerAddress
- SetUserName
- SaveKeyValue
- ESDTTransfer
- ESDTBurn
- ESDTFreeze
- ESDTUnFreeze
- ESDTWipe
- ESDTPause
- ESDTUnPause
- ESDTSetRole
- ESDTUnSetRole
- ESDTSetLimitedTransfer
- ESDTUnSetLimitedTransfer
- ESDTLocalBurn
- ESDTLocalMint
- ESDTNFTTransfer
- ESDTNFTCreate
- ESDTNFTAddQuantity
- ESDTNFTBurn
- ESDTNFTAddURI
- ESDTNFTUpdateAttributes
- MultiESDTNFTTransfer
- SetGuardian
- GuardAccount
- UnGuardAccount

[comment]: # (mx-context-auto)

## **ClaimDeveloperRewards**

This function is to be used by Smart Contract owners in order to claim the fees accumulated during smart contract calls.
Currently, the developer reward is set to 30% of the fee of each smart contract call.

```rust
ClaimDeveloperRewardsTransaction {
    Sender: <the owner of the SC>
    Receiver: <SC address>
    Value: 0
    GasLimit: 6_000_000
    Data: "ClaimDeveloperRewards"
}
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

:::note
The amount of available developer rewards can be viewed via [Get Address](/sdk-and-tools/rest-api/addresses/#get-address) endpoint when using the smart contract as the `bech32Address`.
:::

[comment]: # (mx-context-auto)

## **ChangeOwnerAddress**

`ChangeOwnerAddress` is the function to be called by a Smart Contract's owner when a new owner is desired.

```rust
ChangeOwnerAddressTransaction {
    Sender: <the current owner of the SC>
    Receiver: <SC address>
    Value: 0
    GasLimit: 6_000_000
    Data: "ChangeOwnerAddress" +
          "@" + <new owner address in hexadecimal encoding>
}
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

[comment]: # (mx-context-auto)

## **SetUserName**

`SetUserName` is used to set a username for a given address. The receiver's address has to be the DNS smart contract
address of the address.

```rust
SetUserNameTransaction {
    Sender: <sender>
    Receiver: <DNS address that corresponds to the sender>
    Value: 0
    GasLimit: 1_200_000
    Data: "SetUserName@" +
          "@" + <username in hexadecimal encoding>
}
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

[comment]: # (mx-context-auto)

## **SaveKeyValue**

`SaveKeyValue` is used to store a given key-value under an address's storage. More details and the transaction's format are
already covered [here](/developers/account-storage).

[comment]: # (mx-context-auto)

## **ESDT and NFT built-in functions**

Most of the ESDT and NFT related built-in function are already described in the [ESDT](/developers/esdt-tokens/) and
[NFT](/developers/nft-tokens) sections.

[comment]: # (mx-context-auto)

## **SetGuardian**

`SetGuardian` is used to set a guardian for a given address. 

```rust
SetGuardianTransaction {
    Sender: <sender address>
    Receiver: <sender address>
    Value: 0
    GasLimit: 1_000_000
    Data: "SetGuardian" +
          "@" + <guardian address in hexadecimal encoding> +
          "@" + <service ID in hexadecimal encoding>
}
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

:::note
1. After sending a `SetGuardian` transaction, the user has to wait for **20 epochs** until the chosen guardian becomes `activeGuardian` (`activationEpoch` field will show the epoch when a `pendingGuardian` will become active). Until the `activationEpoch` is reached, the chosen guardian will be seen as `pendingGuardian`. See [Guardian Data](/sdk-and-tools/rest-api/addresses) for more information.
2. In the case an address already has an activeGuardian, and the user wants to change it, a `SetGuardian` transaction has to be sent again and **20 epochs** have to be awaited.
3. If the account is already Guarded (see below `GuardAccount` transaction), a user can _Fast SetGuardian_ (not waiting for the **20 epochs** anymore) by sending a guarded transaction.
:::

[comment]: # (mx-context-auto)

## **GuardAccount**

`GuardAccount` is used to guard the account. In other words, after sending this transaction (and if it is successfull), all transactions that will be sent afterwards by this address must have `guardian` and `guardianSignature` filled in until a successfull `UnGuardAccount` transaction is being sent. 

```rust
GuardAccountTransaction {
    Sender: <sender address>
    Receiver: <sender address>
    Value: 0
    GasLimit: 1_000_000
    Data: "GuardAccount"
}
```

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._

:::note
After sending a successfull `GuardAccount` transaction, only co-signed (guarded) transactions can be sent. Any other transaction will not be processed, except a new `SetGuardian` (for which **20 epochs** must pass until the changes will occur).
:::

[comment]: # (mx-context-auto)

## **UnGuardAccount**

`UnGuardAccount` is used to unguard the account. After a successfull transaction, it is not mandatory anymore for the user to send co-signed (guarded) transactions.

```rust
UnGuardAccountTransaction {
    Nonce: <>
    Sender: <sender address>
    Receiver: <sender address>
    Guardian: <guardian address>
    Value: 0
    GasLimit: 1_000_000
    Data: "UnGuardAccount"
    Signature: <sender signed transaction>
    GuardianSignature: <guardian signed transaction>
    Version: 2
    Options: <the second least significant bit should be 1 (example: 02, or 03)>
}
```

:::note
Please be aware that the ```UnGuardAccount``` operation can only be performed through a guarded transaction when you have access to your activated guardian. Otherwise, you will need to change the guardian (and wait the 20 epochs) prior to performing the unguarding process.
:::

_For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format)._
