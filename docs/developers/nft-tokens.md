---
id: nft-tokens
title: NFT tokens
---

## **Introduction**

The Elrond protocol introduces native NFT support by adding metadata and attributes on top of the already existing [ESDT](/developers/esdt-tokens).
This way, one can issue a semi-fungible token or a non-fungible token which is quite similar to an ESDT, but has a few more attributes, such as a changeable URI. 
Once owning a quantity of a NFT/SFT, users will have their data store directly under their account, inside the trie. All the fields available inside a NFT/SFT token can be found [here](/developers/nft-tokens#nftsft-fields).

**The flow of issuing and transferring non-fungible or semi-fungible tokens is:**
- register/issue the token
- set roles to the address that will create the NFT/SFTs
- create the NFT/SFT
- transfer quantity(es)

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
          "@" + <"canTransferNFTCreateRole" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded>
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
          "@" + <"canTransferNFTCreateRole" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded>
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters. For example, a token identifier could look like _ALC-6258d2_.

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
Once this transaction is processed by the Metachain, Alice becomes the designated **manager of AliceTokens**. She can add quantity later using `ESDTNFTCreate`. For more operations available to ESDT token managers, see [Token management](/developers/esdt-tokens#token-management).

In that smart contract result, the `data` field will contain a transfer syntax which is explained below. What is important to note is that the token identifier can be fetched from
here in order to use it for transfers. Alternatively, the token identifier can be fetched from the API (explained also in section [Rest API - Get NFT data](/developers/nft-tokens#get-nft-data-for-an-address) ).

## **Roles** ##

In order to be able to perform actions over a token, one needs to have roles assigned.
The existing roles are:

For NFT:
* ESDTRoleNFTCreate : this role allows one to create a new NFT
* ESDTRoleNFTBurn : this role allows one to burn quantity of a specific NFT

For SFT:
* ESDTRoleNFTCreate : this role allows one to create a new SFT
* ESDTRoleNFTBurn : this role allows one to burn quantity of a specific SFT
* ESDTRoleNFTAddQuantity : this role allows one to add quantity of a specific SFT

To see how roles can be assigned, please refer to [this](/developers/nft-tokens#assigning-roles) section.


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

Unset transactions are very similar. You can find an example [here](/developers/esdt-tokens#unset-special-role).

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
      "trait_type": "SampleTrait1",
      "value": "SampleValue1"
    },
    {
      "trait_type": "SampleTrait2",
      "value": "SampleValue2"
    },
    {
      "trait_type": "SampleTrait3",
      "value": "SampleValue3"
    }
  ]
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
|**Attributes**| metadata:*ipfsCID/song.json*;tags:myTag1,myTag2,myTag3 |  6d657461646174613a697066734349442f736f6e672e6a736f6e3b746167733a6d79546167312c6d79546167322c6d7954616733 |
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
    GasLimit: 6000000 + Additional gas (see below)
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

:::tip
Note that because NFTs are stored in accounts trie, every transaction involving the NFT will require a gas limit depending on NFT data size.
:::

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

### **Upgrading (changing properties)**
The manager of an ESDT token may individually change any of the properties of the token, or multiple properties at once, only if the ESDT was created as upgradable. 
Check the [ESDT - Upgrading (changing properties)](/developers/esdt-tokens#upgrading-changing-properties) section for more details.


## **Transfers**

Performing an ESDT NFT transfer is done by specifying the receiver's address inside the `Data` field, alongside other details. An ESDT NFT transfer transaction has the following form:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1000000 + length of Data field in bytes * 1500
    Data: "ESDTNFTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <the NFT nonce in hexadecimal encoding> + 
          "@" + <quantity to transfer in hexadecimal encoding> +
          "@" + <destination address in hexadecimal encoding>
}
```

## **Transfers to a Smart Contract**

To perform the transfer from your account to the smart contract, you have to use the following transaction format:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1000000 + extra for smart contract call
    Data: "ESDTNFTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
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

:::warning
This is an upcoming feature, and it's not yet enabled on mainnet, testnet or devnet.
:::

Multiple semi-fungible and/or non-fungible tokens can be transferred in a single transaction to a single receiver.

More details can be found [here](/developers/esdt-tokens#multiple-tokens-transfer) .

## **Example flow**

Let's see a complete flow of creating and transferring a Semi-Fungible Token.

**Step 1: Issue/Register a Semi-Fungible Token**

```
{
    Sender: <your address>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000  # 5 EGLD
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

Fill all the attributes as you think.

```
{
    Sender: <address with ESDTRoleNFTCreate role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 60000000
    Data: "ESDTNFTCreate" +
          "@414c432d317132773365" +   # previously fetched token identifier
          "@" + <initial quantity in hexadecimal encoding> +
          "@" + <NFT name in hexadecimal econding> +
          "@" + <Royalties in hexadecimal encoding> +
          "@" + <Hash in hexadecimal encoding> +
          "@" + <Attributes in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
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
    GasLimit: 500000 + length of Data field in bytes * 1500
    Data: "ESDTNFTTransfer" +
          "@414c432d317132773365" +   # previously fetched token identifier
          "@" + <the nonce saved above in hexadecimal encoding> + 
          "@" + <quantity to transfer in hexadecimal encoding> +
          "@" + <destination address in hexadecimal encoding>
}
```

## **Rest API**

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

### <span class="badge badge-primary">GET</span> **Get all ESDT tokens for an address**

One can use [get all esdt tokens for an address endpoint](/developers/esdt-tokens#get-all-esdt-tokens-for-an-address) used for ESDT.

### <span class="badge badge-primary">GET</span> **Get all issued ESDT tokens**

One can use [get all issued esdt tokens endpoint](/developers/esdt-tokens#get-all-issued-esdt-tokens) used for ESDT.

### <span class="badge badge-success">POST</span> **Get ESDT properties**

Properties can be queried via the [getTokenProperties function](/developers/esdt-tokens#get-esdt-token-properties) provided by ESDT.

### <span class="badge badge-success">POST</span> **Get special roles**

Special roles can be queried via the [getSpecialRoles function](/developers/esdt-tokens#get-special-roles-for-a-token) provided by ESDT.
