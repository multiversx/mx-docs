---
id: nft-tokens
title: NFT tokens
---

## **Introduction**

### NFT and SFT
The Elrond protocol introduces native NFT support by adding metadata and attributes on top of the already existing [ESDT](/tokens/esdt-tokens).
This way, one can issue a semi-fungible token or a non-fungible token which is quite similar to an ESDT, but has a few more attributes, as well as an assignable URI.
Once owning a quantity of a NFT/SFT, users will have their data store directly under their account, inside the trie. All the fields available inside a NFT/SFT token can be found [here](/tokens/nft-tokens#nftsft-fields).

**The flow of issuing and transferring non-fungible or semi-fungible tokens is:**
- register/issue the token
- set roles to the address that will create the NFT/SFTs
- create the NFT/SFT
- transfer quantity(es)

### Meta ESDT

In addition to NFTs and SFTs, Elrond introduced Meta ESDTs.
Meta ESDTs are a special case of semi-fungible-tokens. They can be seen as regular ESDT fungible tokens that also have properties.
In a particular example, LKMEX is a Meta ESDT and its properties help implement the release schedule.

## **Branding**

Anyone can create NFTs and SFTs tokens on Elrond Network. There are also no limits in tokens names or tickers. For example,
one issues an `AliceToken` with the ticker `ALC`. Anyone else is free to create a new token with the same token name and
the same token ticker. The only difference will be the random sequence of the token identifier. So the "original" token
could have received the random sequence `1q2w3e` resulting in the `ALC-1q2w3e` identifier, while the second token could
have received the sequence `3e4r5t` resulting in `ALC-3e4r5t`.

In order to differentiate between an original token and other tokens with the same name or ticker, we have introduced a
branding mechanism that allows tokens owners to provide a logo, a description, a website, as well as social link for their tokens. Elrond products such as Explorer, Wallet and so on
will display tokens in accordance to their branding, if any.

A token owner can submit a branding request by opening a Pull Request on https://github.com/ElrondNetwork/assets.

### **Submitting a branding request**

Token owners can create a PR to the https://github.com/ElrondNetwork/assets with the logo in .png and .svg format, as well as a .json file containing all the relevant information.

Here’s a prefilled template for the .json file to get you started:

``` json
{
  "website": "https://www.elrondtoken.com",
  "description": "Elrond Token is a collection of 10.000 unique and randomly generated tokens.",
  "social": {
    "email": "erd-token@elrond.com",
    "blog": "https://www.elrondtoken.com/ERD-token-blog",
    "twitter": "https://twitter.com/ERD-token-twitter"
  },
  "status": "active"
}
```


## **Issuance of Non-Fungible Tokens**

One has to perform an issuance transaction in order to register a non-fungible token.
Non-Fungible Tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a token, one must provide a token name, a ticker and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issueNonFungible" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding>
}
```

Optionally, the properties can be set when issuing a token. Example:
```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issueNonFungible" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <"canFreeze" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canWipe" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canPause" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canTransferNFTCreateRole" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canChangeOwner" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canUpgrade" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canAddSpecialRoles" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          ...
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters. For example, a token identifier could look like _ALC-6258d2_.

## **Issuance of Semi-Fungible Tokens**

One has to perform an issuance transaction in order to register a semi-fungible token.
Semi-Fungible Tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a semi-fungible token, one must provide a token name, a ticker and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issueSemiFungible" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding>
}
```

Optionally, the properties can be set when issuing a token. Example:
```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issueSemiFungible" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <"canFreeze" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canWipe" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canPause" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canTransferNFTCreateRole" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canChangeOwner" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canUpgrade" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canAddSpecialRoles" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          ...
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters. For example, a token identifier could look like _ALC-6258d2_.

## **Issuance of Meta-ESDT Tokens**

One has to perform an issuance transaction in order to register a Meta-ESDT token.
Meta-ESDT Tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a semi-fungible token, one must provide a token name, a ticker and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "registerMetaESDT" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding>
}
```

Optionally, the properties can be set when issuing a token. Example:
```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "registerMetaESDT" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding>
          "@" + <"canFreeze" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canWipe" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canPause" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canTransferNFTCreateRole" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canChangeOwner" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canUpgrade" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canAddSpecialRoles" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          ...
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters. For example, a token identifier could look like _ALC-6258d2_.


### **Converting an SFT into Meta-ESDT**

An already existing *semi-fungible token* can be converted into a Meta-ESDT token if the owner sends the following transaction:

```
ConvertSftToMetaESDTTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "changeSFTToMetaESDT" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding>
}
```

## **Parameters format**

Token Name:

- length between 3 and 20 characters
- alphanumeric characters only


Token Ticker:

- length between 3 and 10 characters
- alphanumeric UPPERCASE only

## **Issuance examples**

For example, a user named Alice wants to issue an ESDT called "AliceTokens" with the ticker "ALC". The issuance transaction would be:

```
IssuanceTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issueSemiFungible" +
          "@416c696365546f6b656e73" +
          "@414c43" +
}
```
Once this transaction is processed by the Metachain, Alice becomes the designated **manager of AliceTokens**. She can add quantity later using `ESDTNFTCreate`. For more operations available to ESDT token managers, see [Token management](/tokens/esdt-tokens#token-management).

In that smart contract result, the `data` field will contain a transfer syntax which is explained below. What is important to note is that the token identifier can be fetched from
here in order to use it for transfers. Alternatively, the token identifier can be fetched from the API (explained also in section [REST API - Get NFT data](/tokens/nft-tokens#get-nft-data-for-an-address) ).

## **Roles** ##

In order to be able to perform actions over a token, one needs to have roles assigned.
The existing roles are:

For NFT:
* ESDTRoleNFTCreate : this role allows one to create a new NFT
* ESDTRoleNFTBurn : this role allows one to burn quantity of a specific NFT
* ESDTRoleNFTUpdateAttributes : this role allows one to change the attributes of a specific NFT
* ESDTRoleNFTAddURI : this role allows one add URIs for a specific NFT
* ESDTTransferRole : this role enables transfer only to specified addresses. The owner of the NFT and the address with the ESDTTransferRole should be located on the same shard. The addresses with the transfer role can transfer anywhere.

For SFT:
* ESDTRoleNFTCreate : this role allows one to create a new SFT
* ESDTRoleNFTBurn : this role allows one to burn quantity of a specific SFT
* ESDTRoleNFTAddQuantity : this role allows one to add quantity of a specific SFT
* ESDTTransferRole : this role enables transfer only to specified addresses. The owner of the SFT and the address with the ESDTTransferRole should be located on the same shard. The addresses with the transfer role can transfer anywhere.


To see how roles can be assigned, please refer to [this](/tokens/nft-tokens#assigning-roles) section.


## **Assigning roles** ##

Roles can be assigned by sending a transaction to the Metachain from the ESDT manager.

Within a transaction of this kind, any number of roles can be assigned (minimum 1).
```
RolesAssigningTransaction {
    Sender: <address of the ESDT manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "setSpecialRole" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <address to assign the role(s) in a hexadecimal encoding> +
          "@" + <role in hexadecimal encoding> +
          "@" + <role in hexadecimal encoding> +
          ...
}
```

For example, `ESDTRoleNFTCreate` = `45534454526f6c654e4654437265617465`

Unset transactions are very similar. You can find an example [here](/tokens/esdt-tokens#unset-special-role).

## **NFT/SFT fields**

Below you can find the fields involved when creating an NFT.

**NFT Name**
- The name of the NFT or SFT

**Quantity**
- The quantity of the token. If NFT, it must be `1`

**Royalties**
- Allows the creator to receive royalties for any transaction involving their NFT
- Base format is a numeric value between 0 an 10000 (0 meaning 0% and 10000 meaning 100%)

**Hash**
- Arbitrary field that should contain the hash of the NFT metadata
- Optional filed, should be left `null` when building the transaction to create the NFT

**Attributes**
- Represents additional information about the NFT or SFT, like picture traits or tags for your NFT/collection
- The field should follow a `metadata:ipfsCID/fileName.json;tags:tag1,tag2,tag3` format
- Below you can find a sample for the extra metadata format that should be stored on IPFS:
```
{
  "description": "This is a sample description",
  "attributes": [
    {
      "trait_type": "Background",
      "value": "Yellow",
      "{key}":"{value}",
      "{...}":"{...}",
      "{key}":"{value}"
    },
    {
      "trait_type": "Headwear",
      "value": "BlackBeanie"
    },
    {
      "trait_type": "SampleTrait3",
      "value": "SampleValue3"
    }
  ],
  "collection": "ipfsCID/fileName.json"
}
```

**URI(s)**
- <u>Mandatory</u> field that represents the URL to a [supported](#supported-media-types) media file ending with the file extension as described in the [example](#example) below
- Field should contain the `Uniform Resource Identifier`

<u>Note</u>: As a best practice, we recommend storing the files for media & extra metadata(from attributes field) within same folder on your storage provider, ideally IPFS.

:::important
Please note that each argument must be encoded in hexadecimal format with an even number of characters.
:::

### **Supported Media Types**
Below you can find a table with the supported media types for NFTs available on Elrond network.
|**Media Extension**|**Media Type**|
|-------------------|--------------|
|.png|image/png|
|.jpeg|image/jpeg|
|.jpg|image/jpg|
|.gif|image/gif|
|.webp|image/webp|
|.acc|audio/acc|
|.flac|audio/flac|
|.m4a|audio/m4a|
|.mp3|audio/mp3|
|.wav|audio/wav|
|.mov|video/mov|
|.quicktime|video/quicktime|
|.mp4|video/mp4|
|.webm|video/webm|

### **Example**
Below you can find a table representing an example of the fields for a non-fungible token that resembles a song.
| Property | Plain value | Encoded value |
|----------|-------------|---------------|
|**NFT Name**| Beautiful song | 42656175746966756c20736f6e67 |
|**Quantity**| 1 | 01|
|**Royalties**| 7500 *=75%* | 1d4c |
|**Hash** | 00 | 00 |
|**Attributes**| metadata:*ipfsCID/song.json*;tags:song,beautiful,music |  6d657461646174613a697066734349442f736f6e672e6a736f6e3b746167733a736f6e672c62656175746966756c2c6d75736963 |
|**URI**| *URL_to_decentralized_storage/song.mp3* | 55524c5f746f5f646563656e7472616c697a65645f73746f726167652f736f6e672e6d7033 |

In this example we are creating a NFT represeting a song. Hash is left null, we are sharing media location URL and we are also providing the location of the extra metadata within the attributes field.

## **Creation of an NFT**
A single address can own the role of creating an NFT for an ESDT token. This role can be transferred by using the `ESDTNFTCreateRoleTransfer` function.

An NFT can be created on top of an existing ESDT by sending a transaction to self that contains the function call that triggers the creation.
Any number of URIs can be assigned (minimum 1)

```
NFTCreationTransaction {
    Sender: <address with ESDTRoleNFTCreate role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 3000000 + Additional gas (see below)
    Data: "ESDTNFTCreate" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <initial quantity in hexadecimal encoding> +
          "@" + <NFT name in hexadecimal encoding> +
          "@" + <Royalties in hexadecimal encoding> +
          "@" + <Hash in hexadecimal encoding> +
          "@" + <Attributes in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          ...
}
```

Additional gas refers to:
- Transaction payload cost: Data field length * 1500 (GasPerDataByte = 1500)
- Storage cost: Size of NFT data * 50000 (StorePerByte = 50000)

To see more about the required fields, please refer to [this](/tokens/nft-tokens#nftsft-fields) section.

:::tip
Note that because NFTs are stored in accounts trie, every transaction involving the NFT will require a gas limit depending on NFT data size.
:::

Most of the times you will be able to create the NFTs by issuing one single transaction.
This assumes that the metadata file as well as the NFT media is already uploaded to IPFS.

There are times, however, when uploading the metadata file before issuing the NFT is not possible (eg. when issued from a smart contract)
In these cases it is possible to update an NFT with the metadata file after it was issued by sending an additional transaction. You can find more information [here](/tokens/nft-tokens#change-nft-attributes) about how to update the attributes

## **Other management operations**

### **Transfer NFT Creation Role**

:::tip
This role can be transferred only if the `canTransferNFTCreateRole` property of the token is set to `true`.
:::

The role of creating an NFT can be transferred by a Transaction like this:
```
TransferCreationRoleTransaction {
    Sender: <address of the current creation role owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000 + length of Data field in bytes * 1500
    Data: "transferNFTCreateRole" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <the address to transfer the role from in hexadecimal encoding> +
          "@" + <the address to transfer the role to in hexadecimal encoding>
}
```

### **Stop NFT creation**

The ESDT manager can stop the creation of an NFT for the given ESDT forever by removing the only `ESDTRoleNFTCreate` role available.
This is done by performing a transaction like this:

```
StopNFTCreationTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "stopNFTCreate" +
          "@" + <token identifier in hexadecimal encoding> +
}
```

### **Change NFT Attributes**

An user that has the `ESDTRoleNFTUpdateAttributes` role set for a given ESDT, can change the attributes of a given NFT/SFT.

:::tip
`ESDTNFTUpdateAttributes` will remove the old attributes and add the new ones. Therefore, if you want to keep the old attributes you will have to pass them along with the new ones.
:::
This is done by performing a transaction like this:

```
ESDTNFTUpdateAttributesTransaction {
    Sender: <address of an address that has ESDTRoleNFTUpdateAttributes role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 10000000
    Data: "ESDTNFTUpdateAttributes" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding> +
          "@" + <Attributes in hexadecimal encoding>
}
```
To see how you can assign this role in case it is not set, please refer to [this](/tokens/nft-tokens#assigning-roles) section.


### **Add URIs to NFT**

An user that has the `ESDTRoleNFTAddURI` role set for a given ESDT, can add uris to a given NFT/SFT.
This is done by performing a transaction like this:

```
ESDTNFTAddURITransaction {
    Sender: <address of an address that has ESDTRoleNFTAddURI role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 10000000
    Data: "ESDTNFTAddURI" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          ...
}
```
To see how you can assign this role in case it is not set, please refer to [this](/tokens/nft-tokens#assigning-roles) section.

### **Add quantity (SFT only)**

A user that has the `ESDTRoleNFTAddQuantity` role set for a given Semi-Fungible Token, can increase its quantity. This function will not work for NFTs, because in that case the quantity cannot be higher than 1.

```
AddQuantityTransaction {
    Sender: <address of an address that has ESDTRoleNFTAddQuantity role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 10000000
    Data: "ESDTNFTAddQuantity" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding>
          "@" + <quantity to add in hexadecimal encoding>
}
```

If successful, the balance of the address for the given SFT will be increased with the number specified in the argument.

### **Burn quantity**

A user that has the `ESDTRoleNFTBurn` role set for a given semi-fungible Token, can burn some (or all) of the quantity.

```
BurnQuantityTransaction {
    Sender: <address of an address that has ESDTRoleNFTBurn role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 10000000
    Data: "ESDTNFTBurn" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding>
          "@" + <quantity to burn in hexadecimal encoding>
}
```

If successful, the quantity from the argument will be decreased from the balance of the address for that given token.

### **Freezing and Unfreezing a single NFT**

The manager of an ESDT token may freeze the NFT held by a specific Account. As a consequence, no NFT can be transferred to or from the frozen Account. Freezing and unfreezing a single NFT of an Account are operations designed to help token managers to comply with regulations. The transaction that freezes a single NFT of an Account has the form:

```
FreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "freezeSingleNFT" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding>
          "@" + <account address to freeze in hexadecimal encoding>
}
```

The reverse operation, unfreezing, will allow further transfers to and from the Account:

```
UnfreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "unFreezeSingleNFT" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding> +
          "@" + <account address to unfreeze in hexadecimal encoding>
}
```

### **Wiping a single NFT**

The manager of an ESDT token may wipe out a single NFT held by a frozen Account. This operation is similar to burning the quantity, but the Account must have been frozen beforehand, and it must be done by the token manager. Wiping the tokens of an Account is an operation designed to help token managers to comply with regulations. Such a transaction has the form:

```
WipeTransaction {
    Sender: <account address of the token managers>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "wipeSingleNFT" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <NFT nonce in hexadecimal encoding> +
          "@" + <account address to wipe in hexadecimal encoding>
}
```

### **Transferring token management rights**

The manager of an ESDT token can transfer the ownership if the ESDT was created as upgradable. Check the [ESDT - Upgrading (changing properties)](/tokens/esdt-tokens#upgrading-changing-properties) section for more details.


### **Upgrading (changing properties)**
The manager of an ESDT token may individually change any of the properties of the token, or multiple properties at once, only if the ESDT was created as upgradable.
Check the [ESDT - Transferring token management rights](/tokens/esdt-tokens#transferring-token-management-rightss) section for more details.


## **Transfers**

Performing an ESDT NFT transfer is done by specifying the receiver's address inside the `Data` field, alongside other details. An ESDT NFT transfer transaction has the following form:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1000000 + length of Data field in bytes * 1500
    Data: "ESDTNFTTransfer" +
          "@" + <collection identifier in hexadecimal encoding> +
          "@" + <the NFT nonce in hexadecimal encoding> +
          "@" + <quantity to transfer in hexadecimal encoding> +
          "@" + <destination address in hexadecimal encoding>
}
```

:::tip
Here is an example of an NFT identifier: `ABC-1a9c7d-05dc`

The collection identifier is `ABC-1a9c7d` and the NFT nonce is `05dc`. Note that the `05dc` is hexadecimal encoded, it represents decimal 1500.

Also note that an Elrond address is in bech32, so you will need to convert the address from bech32 to hexadecimal. This can be done with the `hex()` method of erdjs for address (all the methods for addresses can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/address.ts)) or manually with an external converter which you can find [here.](http://207.244.241.38/elrond-converters/#bech32-to-hex)
:::

## **Transfers to a Smart Contract**

To perform the transfer from your account to the smart contract, you have to use the following transaction format:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1000000 + extra for smart contract call
    Data: "ESDTNFTTransfer" +
          "@" + <collection identifier in hexadecimal encoding> +
          "@" + <the nonce after the NFT creation in hexadecimal encoding> +
          "@" + <quantity to transfer in hexadecimal encoding> +
          "@" + <destination address in hexadecimal encoding> +
          "@" + <name of method to call in hexadecimal encoding> +
          "@" + <first argument of the method in hexadecimal encoding> +
          "@" + <second argument of the method in hexadecimal encoding> +
          <...>
}
```

## **Multiple tokens transfer**

Multiple semi-fungible and/or non-fungible tokens can be transferred in a single transaction to a single receiver.

More details can be found [here](/tokens/esdt-tokens#multiple-tokens-transfer).

## **Example flow**

Let's see a complete flow of creating and transferring a Semi-Fungible Token.

**Step 1: Issue/Register a Semi-Fungible Token**

```
{
    Sender: <your address>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # 0.05 EGLD
    GasLimit: 60000000
    Data: "issueSemiFungible" +
          "@416c696365546f6b656e73" + # AliceTokens
          "@414c43" +                 # ALC
}
```

**Step 2: Fetch the token identifier**

For doing this, one has to check the previously sent transaction and see the Smart Contract Result of it.
It will look similar to `@ok@414c432d317132773365`. The `414c432d317132773365` represents the token identifier in hexadecimal encoding.

**Step 3: Set roles**

Assign `ESDTRoleNFTCreate` and `ESDTRoleNFTAddQuantity` roles to an address. You can set these roles to your very own address.
```
{
    Sender: <your address>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "setSpecialRole" +
          "@414c432d317132773365" +   # previously fetched token identifier
          "@" + <address to assign the roles in a hexadecimal encoding> +
          "@45534454526f6c654e4654437265617465" +  # ESDTRoleNFTCreate
          "@45534454526f6c654e46544164645175616e74697479" # ESDTRoleNFTAddQuantity
          ...
}
```

**Step 4: Create NFT**

Now, the NFT creation transaction for the example case defined [here](/tokens/nft-tokens#creation-of-an-nft) looks like this:

```
{
    Sender: <address with ESDTRoleNFTCreate role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 3000000
    Data: "ESDTNFTCreate" +
          "@414c432d317132773365" +  # previously fetched token identifier
          "@01" + # quantity: 1
          "@42656175746966756c20736f6e67" + # NFT name: 'Beautiful song' in hexadecimal encoding
          "@1d4c" + # Royalties: 7500 =75%c in hexadecimal encoding
          "@00" + # Hash: 00 in hexadecimal encoding
          "@6d657461646174613a697066734349442f736f6e672e6a736f6e3b746167733a736f6e672c62656175746966756c2c6d75736963" + # Attributes: metadata:ipfsCID/song.json;tags:song,beautiful,music	 in hexadecimal encoding> +
          "@55524c5f746f5f646563656e7472616c697a65645f73746f726167652f736f6e672e6d7033" + # URI: URL_to_decentralized_storage/song.mp3 in hexadecimal encoding> +
          "@" + <additional optional URI in hexadecimal encoding> +
}
```

:::tip
Note that the nonce is very important when creating an NFT. You must save the nonce after NFT creation because you will need it for further actions.

The `NFT nonce` is different from the creator's nonce.

It can be fetched by viewing all the tokens for the address via API.
:::

**Step 5: Transfer**

```
{
    Sender: <your address>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1000000 + length of Data field in bytes * 1500
    Data: "ESDTNFTTransfer" +
          "@414c432d317132773365" +   # previously fetched token identifier
          "@" + <the nonce saved above in hexadecimal encoding> +
          "@" + <quantity to transfer in hexadecimal encoding> +
          "@" + <destination address in hexadecimal encoding>
}
```

## **REST API**

There are a number of API endpoints that one can use to interact with ESDT NFT data. These are:

### <span class="badge badge-primary">GET</span> **Get NFT data for an address**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns the balance of an address for specific ESDT Tokens.

```
https://gateway.elrond.com/address/<bech32Address>/nft/<tokenIdentifier>/nonce/<creation-nonce>
```

| Param           | Required                                  | Type     | Description                           |
| -------------   | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address   | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format.|
| tokenIdentifier | <span class="text-danger">REQUIRED</span> | `string` | The token identifier.                 |
| nonce           | <span class="text-danger">REQUIRED</span> | `numeric`| The nonce after the NFT creation.     |

<!--Response-->

```json
{
  "data": {
    "tokenData": {
      "attributes": "YXR0cmlidXRl",
      "balance": "2",
      "creator": "erd1ukn0tukrdhuv0zzxn0zlr53g7h0fr68dz9dd56mkksev59nwuvnswnlyuy",
      "hash": "aGFzaA==",
      "name": "H",
      "nonce": 1,
      "properties": "",
      "royalties": "9000",
      "tokenIdentifier": "4W97C-32b5ce",
      "uris": [
        "bmZ0IHVyaQ=="
      ]
    }
  },
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get NFTs/SFTs registered by an address**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns the identifiers of the tokens that have been registered by the provided address.

```
https://gateway.elrond.com/address/<bech32Address>/registered-nfts
```

| Param           | Required                                  | Type     | Description                           |
| -------------   | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address   | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format.|

<!--Response-->

```json
{
  "data": {
    "tokens": [
      "ABC-36tg72"
    ]
  },
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get tokens where an address has a given role**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns the identifiers of the tokens where the given address has the given role.

```
https://gateway.elrond.com/address/<bech32Address>/esdts-with-role/<role>
```

| Param           | Required                                  | Type     | Description                           |
| -------------   | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address   | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format.|
| role            | <span class="text-danger">REQUIRED</span> | `string` | The role to query for.                |

The role can be one of the roles specified in the documentation (for example: ESDTRoleNFTCreate)

<!--Response-->

```json
{
  "data": {
    "tokens": [
      "ABC-36tg72"
    ]
  },
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->


### <span class="badge badge-primary">GET</span> **Parse non/semi fungible tokens transfer logs**

Each **successful** nft/sft transfer generates logs and events that can be used to parse all the details about a transfer
(token identifier, sent amount and receiver).
In order to get the logs and events generated by the transfer, one should know the transaction's hash.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

| Param           | Required                                  | Type     | Description                                    |
| -------------   | ----------------------------------------- | -------- | -------------------------------------          |
| txHash          | <span class="text-danger">REQUIRED</span> | `string` | The hash of the transaction                    |

```
https://gateway.elrond.com/transaction/*txHash*?withResults=true
```

<!--Response-->

```
{
 "data": {
  "transaction": {
   ...
   "logs": {
    "address": "...",
    "events": [
     {
      "address": "...",
      "identifier": "ESDTNFTTransfer",
      "topics": [
       "VFNGVC1jODY3ZzM=",                              // TSFT-c867g3
       "CEI=",                                          // 2114
       "Ag==",                                          // 2
       "givNK+JiLZ5VA5/dP11QKoYEn7qoqnD8uPchH3ZMLw4="   // erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
      ],
      "data": null
     },
   }
 }
 "error": "",
 "code": "successful"
}
```

The event with the identifier `ESDTNFTTransfer` will have the following topics:
- 1st topic: token identifier (decoding: base64 to string)
- 2nd topic: token nonce (decoding: base64 to hex string + hex string to big number / integer)
- 3rd topic: the amount to be sent (decoding: base64 to hex string + hex string to big number)
- 4th topic: the recipient of the tokens (decoding: base64 to hex string + hex string to bech32 address)

In this example, `erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg` received 2 tokens of the collection
`TSFT-c867g3` with nonce `2114`.

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get all ESDT tokens for an address**

One can use [get all esdt tokens for an address endpoint](/tokens/esdt-tokens#get-all-esdt-tokens-for-an-address) used for ESDT.

### <span class="badge badge-primary">GET</span> **Get all issued ESDT tokens**

One can use [get all issued esdt tokens endpoint](/tokens/esdt-tokens#get-all-issued-esdt-tokens) used for ESDT.

### <span class="badge badge-success">POST</span> **Get ESDT properties**

Properties can be queried via the [getTokenProperties function](/tokens/esdt-tokens#get-esdt-token-properties) provided by ESDT.

### <span class="badge badge-success">POST</span> **Get special roles**

Special roles can be queried via the [getSpecialRoles function](/tokens/esdt-tokens#get-special-roles-for-a-token) provided by ESDT.
