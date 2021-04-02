---
id: nft-tokens
title: NFT tokens
---

:::important
NFTs aren't enabled yet on Elrond Mainnet. See testnet or devnet
:::

## **Introduction**

The Elrond protocol introduces native NFT support by adding metadata and attributes on top of the already existing [ESDT](/developers/esdt-tokens).
This way, one can issue a semi fungible token or a non fungible token which is quite similar to an ESDT, but has a few more attributes, such as a changeable URI. 
Once owning a quantity of a NFT/SFT, users will have their data store directly under their account, inside the trie. All the fields available inside a NFT/SFT token are:

- attributes
- balance
- creator
- hash
- name
- properties
- royalties
- tokenIdentifier
- URIs

**The flow of issuing and transferring non-fungible or semi-fungible tokens is:**
- register/issue the token
- set roles to the address that will create the NFT/SFTs
- create the NFT/SFT
- transfer quantity(es)

## **Issuance of Non Fungible Tokens**

One has to perform an issuance transaction in order to register a non fungible token. 
Non Fungible Tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a token, one must provide a token name, a ticker and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000 (5 eGLD)
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
    Value: 5000000000000000000 (5 eGLD)
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

## **Issuance of Semi Fungible Tokens**

One has to perform an issuance transaction in order to register a semi fungible token.
Semi Fungible Tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a semi fungible token, one must provide a token name, a ticker, the initial quantity and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000 (5 eGLD)
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
    Value: 5000000000000000000 (5 eGLD)
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
    Value: 5000000000000000000
    GasLimit: 60000000
    Data: "issueSemiFungible" +
          "@416c696365546f6b656e73" +
          "@414c43" +
}
```
Once this transaction is processed by the Metachain, Alice becomes the designated **manager of AliceTokens**, and is granted a balance of 4091 AliceTokens. She can increase the total supply of tokens at a later time if needed. For more operations available to ESDT token managers, see [Token management](/developers/esdt-tokens#token-management).

If the issue transaction is successful, a smart contract result will mint the requested token and supply in the account used for issuance, which is also the token manager.
In that smart contract result, the `data` field will contain a transfer syntax which is explained below. What is important to note is that the token identifier can be fetched from
here in order to use it for transfers. Alternatively, the token identifier can be fetched from the API (explained also in section [Rest API - Get NFT data](/developers/nft-tokens#get-nft-data-for-an-address) ).

## **Roles** ##

In order to be able to perform actions over a token, one needs to have roles assigned.
The existing roles are:

- ESDTRoleNFTCreate : this role allows one to create a new NFT/SFT
- ESDTRoleNFTAddQuantity : this role allows one to add quantity of a specific NFT/SFT
- ESDTRoleNFTBurn : this role allows one to burn quantity of a specific NFT/SFT

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

## **Creation of an NFT**

A single address can own the role of creating an NFT for an ESDT token. This role can be transferred by using the `ESDTNFTCreateRoleTransfer` function.

An NFT can be created on top of an existing ESDT by sending a transaction to self that contains the function call that triggers the creation.
Any number of URIs can be assigned (minimum 1)

```
NFTCreationTransaction {
    Sender: <address with ESDTRoleNFTCreate role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 60000000
    Data: "ESDTNFTCreate" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <initial quantity in hexadecimal encoding> +
          "@" + <NFT name in hexadecimal econding> +
          "@" + <Royalties in hexadecimal encoding> +
          "@" + <Hash in hexadecimal encoding> +
          "@" + <Attributes in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          "@" + <URI in hexadecimal encoding> +
          ...
}
```

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
    GasLimit: 500000 + length of Data field in bytes * 1500
    Data: "ESDTNFTCreateRoleTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <the address to transfer the role from in hexadecimal encoding> + 
          "@" + <the address to transfer the role to in hexadecimal encoding> 
}
```

## **Transfers**

Performing an ESDT NFT transfer is done by specifying the receiver's address inside the `Data` field, alongside other details. An ESDT NFT transfer transaction has the following form:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 500000 + length of Data field in bytes * 1500
    Data: "ESDTNFTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <the nonce after the NFT creation in hexadecimal encoding> + 
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
    GasLimit: 500000 + extra for smart contract call
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

## **Example flow**

Let's see a complete flow of creating and transferring a Semi Fungible Token.

**Step 1: Issue/Register a Semi Fungible Token**

```
{
    Sender: <your address>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000  # 5 eGLD
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
For example, if Alice has nonce `5` before sending the nft creation transaction, nonce `6` must be used in further actions.
Also, the `nonce` can be fetched by viewing all the tokens for the address via API.
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
https://api.elrond.com/address/<bech32Address>/nft/<tokenIdentifier>/nonce/<creation-nonce>
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

### <span class="badge badge-primary">GET</span> **Get all ESDT tokens for an address**

One can use [get all esdt tokens for an address endpoint](/developers/esdt-tokens#get-all-esdt-tokens-for-an-address) used for ESDT.

### <span class="badge badge-primary">GET</span> **Get all issued ESDT tokens**

One can use [get all issued esdt tokens endpoint](/developers/esdt-tokens#get-all-issued-esdt-tokens) used for ESDT.

### <span class="badge badge-success">POST</span> **Get ESDT properties**

One can use [get esdt properties endpoint](/developers/esdt-tokens#get-esdt-token-properties) used for ESDT.
