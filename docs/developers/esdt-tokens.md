---
id: esdt-tokens
title: ESDT tokens
---

Custom tokens at native speed and scalability, without ERC20

The Elrond network natively supports the issuance of custom tokens, without the need for contracts such as ERC20, but addressing the same use-cases. And due to the native in-protocol support, transactions with custom tokens do not require the VM at all. In effect, this means that custom tokens are ***as fast and as scalable as the native eGLD token itself.*** 

Users also do not need to worry about sharding when transacting custom tokens, because the protocol employs the same handling mechanisms for ESDT transactions across shards as the mechanisms used for the eGLD token. Sharding is therefore automatically handled and invisible to the user.

Technically, the balances of ESDT tokens held by an Account are stored directly under the data trie of that Account. It also implies that an Account can hold balances of *any number of custom tokens*, in addition to the native eGLD balance. The protocol guarantees that no Account can modify the storage of ESDT tokens, neither its own nor of other Accounts.

ESDT tokens can be issued, owned and held by any Account on the Elrond network, which means that both users *and smart contracts* have the same functionality available to them. Due to the design of ESDT tokens, smart contracts can manage tokens with ease, and they can even react to an ESDT transfer.

# **Issuance of ESDT tokens**

ESDT tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will own and manage the tokens. This transaction has the form:



```
IssuanceTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000 (5 eGLD)
    GasLimit: 50000000
    Data: "issue" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <initial supply in hexadecimal encoding>
}
```

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.

 There are two restrictions imposed on the name of the token to be issued:

- its length must be between 10 and 20 characters
- all characters must be alphanumeric

For example, a user named Alice wants to issue 4091 tokens called "AliceTokens".  The issuance transaction would be:



```
IssuanceTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 5000000000000000000
    GasLimit: 50000000
    Data: "issue" +
          "@416c696365546f6b656e73" +
          "@0ffb"
}
```

Once this transaction is processed by the Metachain, Alice becomes the designated **owner of AliceTokens**, and is granted a balance of 4091 AliceTokens, to do with them as she pleases. She can increase the total supply of tokens at a later time, if needed. For more operations available to ESDT token owners, see [Token management](https://docs.elrond.com/developers/esdt-tokens#token-management).

# **Transfers**

Performing an ESDT transfer is done by sending a transaction directly to the desired receiver Account, but specifying some extra pieces of information in its Data field. An ESDT transfer transaction has the following form:



```
TransferTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the receiver>
    Value: 0
    GasLimit: 250000
    Data: "ESDTTransfer" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding>
}
```

While this transaction may superficially resemble a smart contract call, it is not. The differences are the following:

-  the receiver can be any account (which may or may not be a smart contract)
- the `GasLimit` must be set to the value required by the protocol for ESDT transfers, namely 250000
- the Data field contains what appears to be a smart contract method invocation with arguments, but this invocation never reaches the VM: the string `ESDTTransfer` is reserved by the protocol and is handled as a built-in function, not as a smart contract call

Following the example from earlier, a transfer from Alice to another user, Bob, would look like this:



```
TransferTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx
    Value: 0
    GasLimit: 250000
    Data: "ESDTTransfer" +
          "@416c696365546f6b656e73" +
          "@0c"
}
```

Using the transaction in the example above, Alice will transfer 12 AliceTokens to Bob.

## **Transfers to a smart contract**

Smart contracts may hold ESDT tokens and perform any kind of transactions with them, just like any Account. However, there are a few extra ESDT features dedicated to smart contracts:

**Payable versus non-payable contract**: upon deployment, a smart contract may be marked as *payable*, which means that it can receive either eGLD or ESDT tokens without calling any of its methods (i.e. a simple transfer). But by default, all contracts are *non-payable*, which means that simple transfers of eGLD or ESDT tokens will be rejected, unless they are method calls.

**ESDT transfer with method invocation**: it is possible to send ESDT tokens to a contract *as part of a method call*, just like sending eGLD as part of a method call. A transaction that sends ESDT tokens to a contract while also calling one of its methods has the following form:



```
TransferWithCallTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the smart contract>
    Value: 0
    GasLimit: 250000 + <an appropriate amount for the method call>
    Data: "ESDTTransfer" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding> +
          "@" + <name of method to call in hexadecimal encoding> +
          "@" + <first argument of the method in hexadecimal encoding> +
          "@" + <second argument of the method in hexadecimal encoding> +
          <...>
}
```

Sending a transaction containing both an ESDT transfer *and a method call* allows non-payable smart contracts to receive tokens as part of the call, as if it were eGLD. The smart contract may use dedicated API functions to inspect the name of the received ESDT tokens and their amount, and react accordingly.

# **Token management**

The Account which submitted the issuance request for a custom token automatically becomes the owner of the token (see [Issuance of ESDT tokens](https://docs.elrond.com/developers/esdt-tokens#issuance-of-esdt-tokens)). The owner of a token has the ability to manage the properties, the total supply and the availability of a token. Because smart contracts are Accounts as well, a smart contract can also issue and own ESDT tokens and perform management operations by sending the appropriate transactions, as shown below.

## **Configuration properties of an ESDT token**

Every ESDT token has a set of properties which control what operations are possible with it. See [Management operations](https://docs.elrond.com/developers/esdt-tokens#management-operations) below for the operations controlled by them. The properties are:

- `canMint` - more units of this token can be minted by the owner after initial issuance, increasing the supply
- `canBurn` - users may "burn" some of their tokens, reducing the supply
- `canPause` - the owner may prevent all transactions of the token, apart from minting and burning
- `canFreeze` - the owner may freeze a specific account, preventing transfers to and from that account
- `canWipe` - the owner may wipe out the tokens held by a frozen account, reducing the supply
- `canChangeOwner` - ownership of the token can be transferred to a different account
- `canUpgrade` - the owner may change these properties

## **Management operations**

The owner of an ESDT token has a number of operations at their disposal, which control how the token is used by other users. All of these operations require ownership of the token - no other account may perform them. One special exception is the `ESDTburn` operation, which is available to any Account which holds units of the token in cause.

### **Minting**

The owner of an ESDT token can increase the total supply by sending to the Metachain a transaction of the following form:



```
MintTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "mint" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <new supply in hexadecimal encoding>
}
```

Following this transaction, the total supply of tokens is increased by the new supply specified in the Data field, and the owner receives that amount of tokens into their balance.

This operation requires that the option `canMint` is set to `true` for the token.

### **Burning**

Anyone that holds an amount of ESDT tokens may burn it at their discretion, effectively losing them permanently. This operation reduces the total supply of tokens, and cannot be undone, unless the token owner mints more tokens. Burning is performed by sending a transaction to the Metachain, of the form:



```
BurnTransaction {
    Sender: <account address of a token holder>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "ESDTburn" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <supply to burn in hexadecimal encoding>
}
```

Following this transaction, the token holder loses from the balance the amount of tokens specifed by the Data.

This operation requires that the option `canBurn` is set to `true` for the token.

### **Pausing and Unpausing**

The owner of an ESDT token may choose to suspend all transactions of the token, except minting and burning. The transaction form is as follows:



```
PauseTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "pause" +
          "@" + <token name in hexadecimal encoding>
}
```

The reverse operation, unpausing, will allow transactions of the token again:



```
UnpauseTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "unPause" +
          "@" + <token name in hexadecimal encoding>
}
```

These two operations require that the option `canPause` is set to `true`.

### **Freezing and Unfreezing**

The owner of an ESDT token may freeze the tokens held by a specific Account. As a consequence, no tokens may be transferred to or from the frozen Account. Freezing and unfreezing the tokens of an Account are operations designed to help token owners to comply with regulations. The transaction that freezes the tokens of an Account has the form:



```
FreezeTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "freeze" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <account address to freeze in hexadecimal encoding>
}
```

The reverse operation, unfreezing, will allow further transfers to and from the Account:



```
UnfreezeTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "unFreeze" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <account address to freeze in hexadecimal encoding>
}
```

These two operations require that the option `canFreeze` is set to `true`.

### **Wiping**

The owner of an ESDT token may wipe out all the tokens held by a frozen Account. This operation is similar to burning the tokens, but the Account must have been frozen beforehand, and it must be done by the token owner. Wiping the tokens of an Account is an operation designed to help token owners to comply with regulations.Such a transaction has the form:



```
WipeTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "wipe" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <account address to wipe in hexadecimal encoding>
}
```

This operation requires that the option `canWipe` is set to `true`.

### **Transferring ownership**

The owner of an ESDT token may transfer the ownership to another Account. This can be done with a transaction of the form:



```
TransferOwnershipTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "transferOwnership" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <account address to transfer ownership to in hexadecimal encoding>
}
```

After this transaction is processed by the Metachain, any subsequent management operations will only be permitted to the new Account, as specified by the Data field of the transaction.

This operation requires that the option `canChangeOwner` is set to `true`.

### **Upgrading (changing properties)**

The owner of an ESDT token may individually change any of the properties of the token, or multiple properties at once. Such an operation is performed by a transaction of the form:



```
UpgradingTransaction {
    Sender: <account address of the token owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "esdtControlChanges" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          <...>
}
```

As an example, assume that the "AliceTokens" discussed in earlier sections has the property `canWipe` set to `true` and the property `canBurn` set to `false`,  but Alice, the token owner, wants to change these property to `false` and `true`, respectively. The transaction that would achieve this change is:



```
UpgradingTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 50000000
    Data: "esdtControlChanges" +
          "@416c696365546f6b656e73" +
          "@63616e57697065" + 
          "@66616c7365" +
          "@63616e4275726e" +
          "@74727565"
}
```

In the example above, the encodings mean the following (decoded to ASCII):

- `416c696365546f6b656e73` = `AliceTokens`
- `63616e57697065` = `canWipe`
- `66616c7365` = `false`
- `63616e4275726e` = `canBurn`
- `74727565` = `true`