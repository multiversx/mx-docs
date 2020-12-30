---
id: esdt-tokens
title: ESDT tokens
---

## **Introduction**
Custom tokens at native speed and scalability, without ERC20

The Elrond network natively supports the issuance of custom tokens, without the need for contracts such as ERC20, but addressing the same use-cases. And due to the native in-protocol support, transactions with custom tokens do not require the VM at all. In effect, this means that custom tokens are **as fast and as scalable as the native eGLD token itself.**

Users also do not need to worry about sharding when transacting custom tokens, because the protocol employs the same handling mechanisms for ESDT transactions across shards as the mechanisms used for the eGLD token. Sharding is therefore automatically handled and invisible to the user.

Technically, the balances of ESDT tokens held by an Account are stored directly under the data trie of that Account. It also implies that an Account can hold balances of _any number of custom tokens_, in addition to the native eGLD balance. The protocol guarantees that no Account can modify the storage of ESDT tokens, neither its own nor of other Accounts.

ESDT tokens can be issued, owned and held by any Account on the Elrond network, which means that both users _and smart contracts_ have the same functionality available to them. Due to the design of ESDT tokens, smart contracts can manage tokens with ease, and they can even react to an ESDT transfer.

## **Issuance of ESDT tokens**

ESDT tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a token, one must provide a token name, a ticker, the initial supply, the number of decimals for display purpose and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000 (5 eGLD)
    GasLimit: 50000000
    Data: "issue" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <initial supply in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding>
}
```

Optionally, the properties can be set when issuing a contract. Example:
```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000 (5 eGLD)
    GasLimit: 50000000
    Data: "issue" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <initial supply in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding> +
          "@" + <"canFreeze" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canWipe" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canPause" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canMint" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canBurn" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters. For example, a token identifier could look like _ALC-6258d2_.

### **Parameters format**

Token Name:

- length between 3 and 20 characters
- alphanumeric characters only


Token Ticker:

- length between 3 and 10 characters
- alphanumeric UPPERCASE only

Number of decimals:
- should be a numerical value between _0_ and _18_
- hexadecimal encoded

Numerical values, such as initial supply or number of decimals, should be the hexadecimal encoding of the decimal numbers representing them. Additionally, they should have an even number of characters. Examples:
- **10** _decimal_      => **0a** _hex encoded_
- **48** _decimal_      => **30** _hex encoded_
- **1000000** _decimal_ => **f4240** _hex encoded_

### **Issuance examples**

For example, a user named Alice wants to issue 4091 tokens called "AliceTokens" with the ticker "ALC". Also, the number of decimals is 6. The issuance transaction would be:

```
IssuanceTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000
    GasLimit: 50000000
    Data: "issue" +
          "@416c696365546f6b656e73" +
          "@414c43" +
          "@0ffb" +
          "@06"
}
```
Once this transaction is processed by the Metachain, Alice becomes the designated **manager of AliceTokens**, and is granted a balance of 4091 AliceTokens, to do with them as she pleases. She can increase the total supply of tokens at a later time if needed. For more operations available to ESDT token managers, see [Token management](/developers/esdt-tokens#token-management).

If the issue transaction is successful, a smart contract result will mint the requested token and supply in the account used for issuance, which is also the token manager.
 In that smart contract result, the `data` field will contain a transfer syntax which is explained below. What is important to note is that the token identifier can be fetched from
here in order to use it for transfers. Alternatively, the token identifier can be fetched from the API (explained also below).

## **Transfers**

Performing an ESDT transfer is done by sending a transaction directly to the desired receiver Account, but specifying some extra pieces of information in its `Data` field. An ESDT transfer transaction has the following form:

```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the receiver>
    Value: 0
    GasLimit: 250000
    Data: "ESDTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding>
}
```

While this transaction may superficially resemble a smart contract call, it is not. The differences are the following:

- the receiver can be any account (which may or may not be a smart contract)
- the `GasLimit` must be set to the value required by the protocol for ESDT transfers, namely `250000`
- the Data field contains what appears to be a smart contract method invocation with arguments, but this invocation never reaches the VM: the string `ESDTTransfer` is reserved by the protocol and is handled as a built-in function, not as a smart contract call

Following the example from earlier, assuming that the token identifier is `414c432d363235386432`, a transfer from Alice to another user, Bob, would look like this:

```
TransferTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx
    Value: 0
    GasLimit: 250000
    Data: "ESDTTransfer" +
          "@414c432d363235386432" +
          "@0c"
}
```

Using the transaction in the example above, Alice will transfer 12 AliceTokens to Bob.

## **Transfers to a smart contract**

Smart contracts may hold ESDT tokens and perform any kind of transaction with them, just like any Account. However, there are a few extra ESDT features dedicated to smart contracts:

**Payable versus non-payable contract**: upon deployment, a smart contract may be marked as _payable_, which means that it can receive either eGLD or ESDT tokens without calling any of its methods (i.e. a simple transfer). But by default, all contracts are _non-payable_, which means that simple transfers of eGLD or ESDT tokens will be rejected, unless they are method calls.

**ESDT transfer with method invocation**: it is possible to send ESDT tokens to a contract _as part of a method call_, just like sending eGLD as part of a method call. A transaction that sends ESDT tokens to a contract while also calling one of its methods has the following form:

```
TransferWithCallTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the smart contract>
    Value: 0
    GasLimit: 250000 + <an appropriate amount for the method call>
    Data: "ESDTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding> +
          "@" + <name of method to call in hexadecimal encoding> +
          "@" + <first argument of the method in hexadecimal encoding> +
          "@" + <second argument of the method in hexadecimal encoding> +
          <...>
}
```

Sending a transaction containing both an ESDT transfer _and a method call_ allows non-payable smart contracts to receive tokens as part of the call, as if it were eGLD. The smart contract may use dedicated API functions to inspect the name of the received ESDT tokens and their amount, and react accordingly.

## **Token management**

The Account which submitted the issuance request for a custom token automatically becomes the manager of the token (see [Issuance of ESDT tokens](/developers/esdt-tokens#issuance-of-esdt-tokens)). The manager of a token has the ability to manage the properties, the total supply and the availability of a token. Because smart contracts are Accounts as well, a smart contract can also issue and own ESDT tokens and perform management operations by sending the appropriate transactions, as shown below.

## **Configuration properties of an ESDT token**

Every ESDT token has a set of properties which control what operations are possible with it. See [Management operations](/developers/esdt-tokens#management-operations) below for the operations controlled by them. The properties are:

- `canMint` - more units of this token can be minted by the token manager after initial issuance, increasing the supply
- `canBurn` - users may "burn" some of their tokens, reducing the supply
- `canPause` - the token manager may prevent all transactions of the token, apart from minting and burning
- `canFreeze` - the token manager may freeze the token balance in a specific account, preventing transfers to and from that account
- `canWipe` - the token manager may wipe out the tokens held by a frozen account, reducing the supply
- `canChangeOwner` - token management can be transferred to a different account
- `canUpgrade` - the token manager may change these properties

## **Management operations**

The manager of an ESDT token has a number of operations at their disposal, which control how the token is used by other users. These operations can only be performed by the token manager - no other account may perform them. One special exception is the `ESDTBurn` operation, which is available to any Account which holds units of the token in cause.

### **Minting**

The manager of an ESDT token can increase the total supply by sending to the Metachain a transaction of the following form:

```
MintTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "mint" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <new supply in hexadecimal encoding>
}
```

Following this transaction, the total supply of tokens is increased by the new supply specified in the Data field, and the manager receives that amount of tokens into their balance.

This operation requires that the option `canMint` is set to `true` for the token.

### **Burning**

Anyone that holds an amount of ESDT tokens may burn it at their discretion, effectively losing them permanently. This operation reduces the total supply of tokens, and cannot be undone, unless the token manager mints more tokens. Burning is performed by sending a transaction to the Metachain, of the form:

```
BurnTransaction {
    Sender: <account address of a token holder>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "ESDTBurn" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <supply to burn in hexadecimal encoding>
}
```

Following this transaction, the token holder loses from the balance the amount of tokens specified by the Data.

This operation requires that the option `canBurn` is set to `true` for the token.

### **Pausing and Unpausing**

The manager of an ESDT token may choose to suspend all transactions of the token, except minting, freezing/unfreezing and wiping. The transaction form is as follows:

```
PauseTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "pause" +
          "@" + <token identifier in hexadecimal encoding>
}
```

The reverse operation, unpausing, will allow transactions of the token again:

```
UnpauseTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "unPause" +
          "@" + <token identifier in hexadecimal encoding>
}
```

These two operations require that the option `canPause` is set to `true`.

### **Freezing and Unfreezing**

The manager of an ESDT token may freeze the tokens held by a specific Account. As a consequence, no tokens may be transferred to or from the frozen Account. Freezing and unfreezing the tokens of an Account are operations designed to help token managers to comply with regulations. The transaction that freezes the tokens of an Account has the form:

```
FreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "freeze" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to freeze in hexadecimal encoding>
}
```

The reverse operation, unfreezing, will allow further transfers to and from the Account:

```
UnfreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "unFreeze" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to unfreeze in hexadecimal encoding>
}
```

These two operations require that the option `canFreeze` is set to `true`.

### **Wiping**

The manager of an ESDT token may wipe out all the tokens held by a frozen Account. This operation is similar to burning the tokens, but the Account must have been frozen beforehand, and it must be done by the token manager. Wiping the tokens of an Account is an operation designed to help token managers to comply with regulations.Such a transaction has the form:

```
WipeTransaction {
    Sender: <account address of the token managers>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "wipe" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to wipe in hexadecimal encoding>
}
```

This operation requires that the option `canWipe` is set to `true`.

### **Transferring token management rights**

The manager of an ESDT token may transfer the management rights to another Account. This can be done with a transaction of the form:

```
TransferOwnershipTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "transferOwnership" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address of the new token manager in hexadecimal encoding>
}
```

After this transaction is processed by the Metachain, any subsequent management operations will only be permitted to the new Account, as specified by the Data field of the transaction.

This operation requires that the option `canChangeOwner` is set to `true`.

### **Upgrading (changing properties)**

The manager of an ESDT token may individually change any of the properties of the token, or multiple properties at once. Such an operation is performed by a transaction of the form:

```
UpgradingTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "controlChanges" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          <...>
}
```

As an example, assume that the "AliceTokens" discussed in earlier sections has the property `canWipe` set to `true` and the property `canBurn` set to `false`, but Alice, the token manager, wants to change these properties to `false` and `true`, respectively. The transaction that would achieve this change is:

```
UpgradingTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "controlChanges" +
          "@414c432d363235386432" +
          "@63616e57697065" +
          "@66616c7365" +
          "@63616e4275726e" +
          "@74727565"
}
```

In the example above, the encodings mean the following (decoded to ASCII):

- `414c432d363235386432` = `ALC-6258d2`
- `63616e57697065` = `canWipe`
- `66616c7365` = `false`
- `63616e4275726e` = `canBurn`
- `74727565` = `true`

## **Rest API**

There are a number of API endpoints that one can use to interact with ESDT data. These are:

### <span class="badge badge-primary">GET</span> **Get all ESDT tokens for an address**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns an array of ESDT Tokens that the specified address has interacted with (issued, sent or received).

```
https://api.elrond.com/address/*bech32Address*/esdt
```

| Param         | Required                                  | Type     | Description                           |
| ------------- | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format.|

<!--Response-->

```json
{
  "data": {
    "tokens": [
      "ABC-0d0060",
      "DEF-d00600"
    ]
  },
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get balance for an address and an ESDT token**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns the balance of an address for specific ESDT Tokens.

```
https://api.elrond.com/address/*bech32Address*/esdt/*tokenIdentifier*
```

| Param           | Required                                  | Type     | Description                           |
| -------------   | ----------------------------------------- | -------- | ------------------------------------- |
| bech32Address   | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format.|
| tokenIdentifier | <span class="text-danger">REQUIRED</span> | `string` | The token identifier.                 |

<!--Response-->

```json
{
  "data": {
    "tokenData": {
      "balance": "99502603",
      "properties": "",
      "tokenIdentifier": "GLD-0d0060"
    }
  },
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> **Get all issued ESDT tokens**

This involves a `vm query` request to the `ESDT` address.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://api.elrond.com/vm-values/query
```

```json
{
	"scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
	"funcName": "getAllESDTTokens",
	"args": []
}

```

<!--Response-->

```json
{
  "data": {
    "data": {
      "returnData": [
        "VEdELWE1Y2NlYg=="
      ],
      "returnCode": "ok",
      "returnMessage": "",
      "gasRemaining": 18446744073659541615,
      "gasRefund": 0,
      "outputAccounts": {
        "000000000000000000010000000000000000000000000000000000000002ffff": {
          "address": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
          "nonce": 0,
          "balance": null,
          "balanceDelta": 0,
          "storageUpdates": {},
          "code": null,
          "codeMetaData": null,
          "outputTransfers": [],
          "callType": 0
        }
      },
      "deletedAccounts": null,
      "touchedAccounts": null,
      "logs": []
    }
  },
  "error": "",
  "code": "successful"
}
```

What is important in this section is the `returnData` member that will contain the bytes of a list of token identifiers, separated by `@`.
In the example response, `returnData` contains a single element `VEdELWE1Y2NlYg==` which represents the bytes for a single token identifier. In JSON, bytes fields are encoded as base64. `base64decode("VEdELWE1Y2NlYg==") = TGD-a5cceb`.

If multiple tokens exist, the `returnData` will still contain a single element. Example:
```
....
 "data": {
      "returnData": [
        "VEdELWE1Y2NlYkBBTEMtYjIzNDE1"
      ],
      "returnCode": "ok",
...      
```
where `VEdELWE1Y2NlYkBBTEMtYjIzNDE1` is translated to `TGD-a5cceb@ALC-b23415` (2 token identifier separated by `@`)

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> **Get ESDT token properties**

This involves a `vm query` request to the `ESDT` address.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://api.elrond.com/vm-values/query
```

```json
{
	"scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
	"funcName": "getTokenProperties",
	"args": ["474c442d306430303630"]
}
```
The argument must be the token identifier, hexadecimal encoded. In the example, `474c442d306430303630` = `GLD-0d0060`.

<!--Response-->

```json
{
  "data": {
    "data": {
      "returnData": [
        "QWxpY2VUb2tlbnM=",
        "2DSJxJNAmou8TU9f4WQo7rpyJ822eZVUQYwnabJM5hk=",
        "MTAwMDAwMDAwMDA=",
        "MA==",
        "TnVtRGVjaW1hbHMtNg==",
        "SXNQYXVzZWQtZmFsc2U=",
        "Q2FuVXBncmFkZS10cnVl",
        "Q2FuTWludC10cnVl",
        "Q2FuQnVybi10cnVl",
        "Q2FuQ2hhbmdlT3duZXItZmFsc2U=",
        "Q2FuUGF1c2UtdHJ1ZQ==",
        "Q2FuRnJlZXplLXRydWU=",
        "Q2FuV2lwZS10cnVl"
      ],
      "returnCode": "ok",
      "returnMessage": "",
      "gasRemaining": 18446744073659551615,
      "gasRefund": 0,
      "outputAccounts": {
        "000000000000000000010000000000000000000000000000000000000002ffff": {
          "address": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
          "nonce": 0,
          "balance": null,
          "balanceDelta": 0,
          "storageUpdates": {},
          "code": null,
          "codeMetaData": null,
          "outputTransfers": [],
          "callType": 0
        }
      },
      "deletedAccounts": null,
      "touchedAccounts": null,
      "logs": []
    }
  },
  "error": "",
  "code": "successful"
}
```

The `returnData` member will contain an array of the properties in a fixed order (base64 encoded). For the example response, the meaning is:
```
"returnData": [
  "QWxpY2VUb2tlbnM=",                             | token name                | AliceTokens
  "2DSJxJNAmou8TU9f4WQo7rpyJ822eZVUQYwnabJM5hk=", | bytes of a bech32 addres  | erd1mq6gn3yngzdgh0zdfa07zepga6a8yf7dkeue24zp3snknvjvucvs37hmrq after decoding
  "MTAwMDAwMDAwMDA=",                             | total supply              | 10000000000
  "MA==",                                         | burnt value               | 0
  "TnVtRGVjaW1hbHMtNg==",                         | number of decimals        | NumDecimals-6
  "SXNQYXVzZWQtZmFsc2U=",                         | is paused                 | IsPaused-false
  "Q2FuVXBncmFkZS10cnVl",                         | can upgrade               | CanUpgrade-true
  "Q2FuTWludC10cnVl",                             | can mint                  | CanMint-true
  "Q2FuQnVybi10cnVl",                             | can burn                  | CanBurn-true
  "Q2FuQ2hhbmdlT3duZXItZmFsc2U=",                 | can change token management address  | CanChangeOwner-true
  "Q2FuUGF1c2UtdHJ1ZQ==",                         | can pause                 | CanPause-true
  "Q2FuRnJlZXplLXRydWU=",                         | can freeze                | CanFreeze-true
  "Q2FuV2lwZS10cnVl"                              | can wipe                  | CanWipe-true
],
```

<!--END_DOCUSAURUS_CODE_TABS-->

