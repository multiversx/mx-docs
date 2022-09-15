---
id: built-in-functions
title: Built-In Functions
---

## **Introduction**

Elrond protocol has a set of built-in functions. A built-in function is a special protocol-side function that doesn't 
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

## **ClaimDeveloperRewards**

This function is to be used by Smart Contract owners in order to claim the fees accumulated during smart contract calls.
Currently, the developer reward is set to 30% of the fee of each smart contract call.

```
ClaimDeveloperRewardsTransaction {
    Sender: <the owner of the SC>
    Receiver: <SC address>
    Value: 0
    GasLimit: 6_000_000
    Data: "ClaimDeveloperRewards"
}
```

:::note
The amount of available developer rewards can be viewed via [Get Address](/sdk-and-tools/rest-api/addresses/#get-address) endpoint when using the smart contract as the `bech32Address`. 
:::

## **ChangeOwnerAddress**

`ChangeOwnerAddress` is the function to be called by a Smart Contract's owner when a new owner is desired. 

```
ChangeOwnerAddressTransaction {
    Sender: <the current owner of the SC>
    Receiver: <SC address>
    Value: 0
    GasLimit: 6_000_000
    Data: "ChangeOwnerAddress" +
          "@" + <new owner address in hexadecimal encoding>
}
```

## **SetUserName**

`SetUserName` is used to set an username for a given address. The receiver's address has to be the DNS smart contract
address of the address.

```
SetUserNameTransaction {
    Sender: <sender>
    Receiver: <DNS address that corresponds to the sender>
    Value: 0
    GasLimit: 1_200_000
    Data: "SetUserName@" +
          "@" + <username in hexadecimal encoding>
}
```

## **SetKeyValue**

`SetKeyValue` is used to store a given key-value under an address's storage. More details and transaction's format are 
already covered [here](/developers/account-storage).


## **ESDT and NFT built-in functions**

Most of the ESDT and NFT related built-in function are already described in the [ESDT](/developers/esdt-tokens/) and 
[NFT](/developers/nft-tokens) sections. 
