---
id: esdt-tokens
title: ESDT tokens
---

## **Introduction**
**ESDT** stands for *eStandard Digital Token*.

Custom tokens at native speed and scalability, without ERC20

The MultiversX network natively supports the issuance of custom tokens, without the need for contracts such as ERC20, but addressing the same use-cases. And due to the native in-protocol support, transactions with custom tokens do not require the VM at all. In effect, this means that custom tokens are **as fast and as scalable as the native EGLD token itself.**

Users also do not need to worry about sharding when transacting custom tokens, because the protocol employs the same handling mechanisms for ESDT transactions across shards as the mechanisms used for the EGLD token. Sharding is therefore automatically handled and invisible to the user.

Technically, the balances of ESDT tokens held by an Account are stored directly under the data trie of that Account. It also implies that an Account can hold balances of _any number of custom tokens_, in addition to the native EGLD balance. The protocol guarantees that no Account can modify the storage of ESDT tokens, neither its own nor of other Accounts.

ESDT tokens can be issued, owned and held by any Account on the MultiversX network, which means that both users _and smart contracts_ have the same functionality available to them. Due to the design of ESDT tokens, smart contracts can manage tokens with ease, and they can even react to an ESDT transfer.

## **Issuance of fungible ESDT tokens**

ESDT tokens are issued via a request to the Metachain, which is a transaction submitted by the Account which will manage the tokens. When issuing a token, one must provide a token name, a ticker, the initial supply, the number of decimals for display purpose and optionally additional properties. This transaction has the form:

```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issue" +
          "@" + <token name in hexadecimal encoding> +
          "@" + <token ticker in hexadecimal encoding> +
          "@" + <initial supply in hexadecimal encoding> +
          "@" + <number of decimals in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

The issuance cost is set to 0.05 EGLD. 

Optionally, the properties can be set when issuing a token. Example:
```
IssuanceTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
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
          "@" + <"canChangeOwner" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canUpgrade" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded> +
          "@" + <"canAddSpecialRoles" hexadecimal encoded> + "@" + <"true" or "false" hexadecimal encoded>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

The receiver address `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u` is a built-in system smart contract (not a VM-executable contract), which only handles token issuance and other token management operations, and does not handle any transfers.
The contract will add a random string to the ticker thus creating the **token identifier**. The random string starts with “-” and has 6 more random characters (3 bytes - 6 characters hex encoded). For example, a token identifier could look like _ALC-6258d2_.

:::note
Because of the 6 random characters sequence (3 bytes - 6 characters hex encoded), the token identifier cannot be precalculated, thus one has to check the Smart Contract Result of the issue transaction that indicates it. Alternatively, one can check its tokens via Explorer or API and search for the token that starts with the ticker that was chosen when issuing the token.
:::

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
- **1000000** _decimal_ => **0f4240** _hex encoded_

### **Number of decimals usage**
Front-end applications will use the number of decimals in order to display balances.
Therefore, you must adapt the supply according to the number of decimals parameter.

For example, if you would like to create a token `ALC` with a total supply of 100 and number of decimals = 2, then you should set
the initial supply to `10000` ($100 * 10^2$).
Also, when transferring/burning/minting tokens, you should keep in mind there is also the denomination involved.

Therefore, if you own some above-mentioned ALC tokens, and you want to transfer 7.5 ALC, then the value argument of the transaction should be `750` ($7.5 * 10^2$). The same rule applies to burning or minting.

:::tip
This is only relevant when performing operations via manual transactions over ESDT tokens. The Web Wallet for example already has this feature in place, so you don't have to take care of the number of decimals.
:::

### **Issuance examples**

For example, a user named Alice wants to issue 4091 tokens called "AliceTokens" with the ticker "ALC". Also, the number of decimals is 6.

As stated above, if the user wants 4091 tokens with 6 decimals, then the initial supply has to be $4091 * 10^6$ tokens so a total of `4091000000`.
```
IssuanceTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 50000000000000000 # (0.05 EGLD)
    GasLimit: 60000000
    Data: "issue" +
          "@416c696365546f6b656e73" +  // "AliceTokens" hex encoded
          "@414c43" +                  // "ALC" hex encoded
          "@f3d7b4c0" +                // 4091000000 hex encoded
          "@06"                        // 6 hex encoded  
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Once this transaction is processed by the Metachain, Alice becomes the designated **manager of AliceTokens**, and is granted a balance of `4091000000` AliceTokens with `6` decimals (resulting in `4091` tokens). She can increase the total supply of tokens at a later time if needed. For more operations available to ESDT token managers, see [Token management](/tokens/esdt-tokens#token-management).

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
    GasLimit: 500000
    Data: "ESDTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

:::important
The value of the transaction should be set to 0 EGLD, otherwise the transaction will fail. The (token) amount to be transferred is encoded into the data field. 
:::

While this transaction may superficially resemble a smart contract call, it is not. The differences are the following:

- the receiver can be any account (which may or may not be a smart contract)
- the `GasLimit` must be set to the value required by the protocol for ESDT transfers, namely `500000`
- the Data field contains what appears to be a smart contract method invocation with arguments, but this invocation never reaches the VM: the string `ESDTTransfer` is reserved by the protocol and is handled as a built-in function, not as a smart contract call

Following the example from earlier, assuming that the token identifier is `414c432d363235386432`, a transfer from Alice to another user, Bob, would look like this:

```
TransferTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx
    Value: 0
    GasLimit: 500000
    Data: "ESDTTransfer" +
          "@414c432d363235386432" +
          "@0c"
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Using the transaction in the example above, Alice will transfer 12 AliceTokens to Bob.

### Transfers gas limit

When computing the gas limit required for an ESDT transfer, our recommendation is to use 500_000 since it includes a buffer, 
and the remaining gas will be refunded to the sender's account.

However, if one wants to calculate the exact amount of gas needed, here's the formula:

```
ESDT_TRANSFER_GAS_LIMIT = MIN_GAS_LIMIT + data_length * GAS_PER_DATA_BYTE + ESDT_TRANSFER_FUNCTION_COST
```

Where the constants represent:
- `MIN_GAS_LIMIT` - the minimum gas limit of a transaction. Each transaction will have at least this cost. Can be fetched from [here](/sdk-and-tools/rest-api/network/#get-network-configuration).
- `GAS_PER_DATA_BYTE` - the amount of gas to be used for each character of the data field. Can be fetched from [here](/sdk-and-tools/rest-api/network/#get-network-configuration).
- `ESDT_TRANSFER_FUNCTION_COST` - the cost of the `ESDTTransfer` function. Can be fetched from [here](https://gateway.multiversx.com/network/gas-configs).

The current values of these constants are:
```
MIN_GAS_LIMIT = 50,000
GAS_PER_DATA_BYTE = 1,500
ESDT_TRANSFER_FUNCTION_COST = 200,000
```

Therefore, knowing these values, the gas units needed for pre-calculating the ESDT transfers gas limit, the transaction's data length is the only variable.

**Example**

Let's take an example. If one wants to transfer `20,000 MEX`, the data field of the transaction would look like:
- `ESDTTransfer@4d45582d343535633537@043c33c1937564800000`
Its length is 54 characters.

Following the formula, we'll get:

```
ESDT_TRANSFER_GAS_LIMIT = MIN_GAS_LIMIT + data_length * GAS_PER_DATA_BYTE + ESDT_TRANSFER_FUNCTION_COST
                        =     50,000    +     54      *      1,500        +          200,000
                        = 331,000
```

### Transfers fee

When computing the fee, it isn't enough to multiply the obtained gas limit with the gas price, since there is a reduction 
of fee in case of a Smart Contract call or a Built-In function call (which is the current case).

Therefore, the formula for computing the fee is:

```
ESDT_TRANSFER_FEE = gas_price * gas_cost
                  = gas_price * [MIN_GAS_LIMIT + (data_length * GAS_PER_DATA_BYTE) + (ESDT_TRANSFER_FUNCTION_COST * GAS_PRICE_MODIFIER)]
```

Most of the constants can be found in the [Transfers gas limit section](/tokens/esdt-tokens#transfers-gas-limit), beside the `GAS_PRICE_MODIFIER` which can
be found [here](/sdk-and-tools/rest-api/network/#get-network-configuration).

Currently, the constants values are:

```
MIN_GAS_LIMIT = 50,000
GAS_PER_DATA_BYTE = 1,500
ESDT_TRANSFER_FUNCTION_COST = 200,000
GAS_PRICE_MODIFIER = 0.01
```

**Example**

Let's take an example. If one wants to transfer `20,000 MEX`, the data field of the transaction would look like:
```
TransferTransaction {
    ...
    gasPrice: 1000000000
    data: ESDTTransfer@4d45582d343535633537@043c33c1937564800000
}
```

We can see that the data length is 54, while the gas price is the network's minimum, that is, `1000000000`.

Following the formula, we'll get:

```
ESDT_TRANSFER_FEE = gas_price * gas_cost
                  = 1000000000    * [ MIN_GAS_LIMIT + (data_length * GAS_PER_DATA_BYTE) + (ESDT_TRANSFER_FUNCTION_COST * GAS_PRICE_MODIFIER)]
                  = 1,000,000,000 * [    50,000     + (     54     *      1500        ) + (         200,000            *        0.01       )]
                  = 133000000000000
                  = 0.000133 EGLD
```

## **Transfers to a smart contract**

Smart contracts may hold ESDT tokens and perform any kind of transaction with them, just like any Account. However, there are a few extra ESDT features dedicated to smart contracts:

**Payable versus non-payable contract**: upon deployment, a smart contract may be marked as _payable_, which means that it can receive either EGLD or ESDT tokens without calling any of its methods (i.e. a simple transfer). But by default, all contracts are _non-payable_, which means that simple transfers of EGLD or ESDT tokens will be rejected, unless they are method calls.

**ESDT transfer with method invocation**: it is possible to send ESDT tokens to a contract _as part of a method call_, just like sending EGLD as part of a method call. A transaction that sends ESDT tokens to a contract while also calling one of its methods has the following form:

```
TransferWithCallTransaction {
    Sender: <account address of the sender>
    Receiver: <account address of the smart contract>
    Value: 0
    GasLimit: 500000 + <an appropriate amount for the method call>
    Data: "ESDTTransfer" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <value to transfer in hexadecimal encoding> +
          "@" + <name of method to call in hexadecimal encoding> +
          "@" + <first argument of the method in hexadecimal encoding> +
          "@" + <second argument of the method in hexadecimal encoding> +
          <...>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Sending a transaction containing both an ESDT transfer _and a method call_ allows non-payable smart contracts to receive tokens as part of the call, as if it were EGLD. The smart contract may use dedicated API functions to inspect the name of the received ESDT tokens and their amount, and react accordingly.

## **Multiple tokens transfer**

There is also the possibility to perform multiple tokens transfers in a single bulk. This way, one can send (to a single receiver) multiple
fungible, semi-fungible or non-fungible tokens via a single transaction.


A multi-token transfer transaction has the following form:
```
MultiTokensTransferTransaction {
    Sender: <account address of the sender>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 1_100_000 * num tokens
    Data: "MultiESDTNFTTransfer" +
          "@" + <receiver bytes in hexadecimal encoding> +
          "@" + <number of tokens to transfer in hexadecimal encoding> +
          "@" + <token 0 identifier in hexadecimal encoding> +
          "@" + <token 0 nonce in hexadecimal encoding> +
          "@" + <token 0 quantity to transfer in hexadecimal encoding> +
          "@" + <token 1 identifier in hexadecimal encoding> +
          "@" + <token 1 nonce in hexadecimal encoding> +
          "@" + <token 1 quantity to transfer in hexadecimal encoding> +
          ...
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

:::tip
Each token requires the token identifier, the nonce and the quantity to transfer.

For fungible tokens (regular ESDT) the nonce has to be 0 (`00` hex-encoded)
:::

Example:

```
MultiTokensTransferTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Value: 0
    GasLimit: 2_200_000
    Data: "MultiESDTNFTTransfer" +
          "@8049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f8" + // erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx
          "@02" +  // 2 tokens to transfer
          "@414c432d363235386432" +   // ALC-6258d2
          "@00" +  // 0 -> the nonce is 0 for regular ESDT tokens
          "@0c" +  // 12 -> value to transfer
          "@5346542d317134723869" +  // SFT-1q4r8i
          "@01" +  // 1 -> the nonce of the SFT
          "@03"   // 3 -> the quantity to transfer
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Using the transaction in the example above, the receiver should be credited `12 ALC-6258d2` tokens and `3 SFT-1q4r8i` tokens.

## **Transfers done programmatically**
The [Rust framework](https://github.com/ElrondNetwork/elrond-wasm-rs) exposes several ways in which you can transfer ESDT tokens via [SendApi](https://github.com/ElrondNetwork/elrond-wasm-rs/blob/master/elrond-wasm/src/api/send_api.rs). For example, in order to transfer _amount_ of _esdt\_token\_name_ to _address_, one would do the following:

```
self.send().direct_esdt(&address, &esdt_token_name, token_nonce: u64, &amount);
```

## **Token management**

The Account which submitted the issuance request for a custom token automatically becomes the manager of the token (see [Issuance of ESDT tokens](/tokens/esdt-tokens#issuance-of-esdt-tokens)). The manager of a token has the ability to manage the properties, the total supply and the availability of a token. Because smart contracts are Accounts as well, a smart contract can also issue and own ESDT tokens and perform management operations by sending the appropriate transactions, as shown below.

## **Configuration properties of an ESDT token**

Every ESDT token has a set of properties which control what operations are possible with it. See [Management operations](/tokens/esdt-tokens#management-operations) below for the operations controlled by them. The properties are:

- `canMint` - more units of this token can be minted by the token manager after initial issuance, increasing the supply
- `canBurn` - users may "burn" some of their tokens, reducing the supply
- `canPause` - the token manager may prevent all transactions of the token, apart from minting and burning
- `canFreeze` - the token manager may freeze the token balance in a specific account, preventing transfers to and from that account
- `canWipe` - the token manager may wipe out the tokens held by a frozen account, reducing the supply
- `canChangeOwner` - token management can be transferred to a different account
- `canUpgrade` - the token manager may change these properties
- `canAddSpecialRoles` - the token manager can assign a specific role(s)
- `canCreateMultiShard` - if true, then local mint/burn can be used so the token will be distributed among shards.

## **Management operations**

The manager of an ESDT token has a number of operations at their disposal, which control how the token is used by other users. These operations can only be performed by the token manager - no other account may perform them. One special exception is the `ESDTBurn` operation, which is available to any Account which holds units of the token in cause.

### **Minting**

:::tip
On Mainnet, starting with epoch 432, global mint is disabled so one has to use local mint instead.  
:::

The manager of an ESDT token can increase the total supply by sending to the Metachain a transaction of the following form:

```
MintTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "mint" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <supply to mint in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Following this transaction, the total supply of tokens is increased by the new supply specified in the Data field, and the manager receives that amount of tokens into their balance.

This operation requires that the option `canMint` is set to `true` for the token.

Alternatively, an account with the `ESDTRoleLocalMint` role set can perform a local mint:  

```
LocalMintTransaction {
    Sender: <address with ESDTRoleLocalMint role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 300000
    Data: "ESDTLocalMint" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <supply to mint in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

### **Burning**

:::tip
On Mainnet, starting with epoch 432, global burn is disabled so one has to use local burn instead.
:::

Anyone that holds an amount of ESDT tokens may burn it at their discretion, effectively losing them permanently. This operation reduces the total supply of tokens, and cannot be undone, unless the token manager mints more tokens. Burning is performed by sending a transaction to the Metachain, of the form:

```
BurnTransaction {
    Sender: <account address of a token holder>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "ESDTBurn" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <supply to burn in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Following this transaction, the token holder loses from the balance the amount of tokens specified by the Data.

This operation requires that the option `canBurn` is set to `true` for the token.

Alternatively, an account with the `ESDTRoleLocalBurn` role set can perform a local burn:  

```
LocalBurnTransaction {
    Sender: <address with ESDTRoleLocalBurn role>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 300000
    Data: "ESDTLocalBurn" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <supply to burn in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

:::note
Tokens issued after [release v1.3.42](https://elrond.com/releases/release-elrond-go---v1342) (*October 2022*), are burn-able by each holder, so setting the role for these tokens becomes redundant.
However, for older tokens, a transaction that will set the special role `ESDTRoleLocalBurn` is still necessary. Docs [here](#setting-and-unsetting-special-roles).
:::

### **Pausing and Unpausing**

The manager of an ESDT token may choose to suspend all transactions of the token, except minting, freezing/unfreezing and wiping. The transaction form is as follows:

```
PauseTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "pause" +
          "@" + <token identifier in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

The reverse operation, unpausing, will allow transactions of the token again:

```
UnpauseTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "unPause" +
          "@" + <token identifier in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

These two operations require that the option `canPause` is set to `true`.

### **Freezing and Unfreezing**

The manager of an ESDT token may freeze the tokens held by a specific Account. As a consequence, no tokens may be transferred to or from the frozen Account. Freezing and unfreezing the tokens of an Account are operations designed to help token managers to comply with regulations. The transaction that freezes the tokens of an Account has the form:

```
FreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "freeze" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to freeze in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

The reverse operation, unfreezing, will allow further transfers to and from the Account:

```
UnfreezeTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "unFreeze" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to unfreeze in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

These two operations require that the option `canFreeze` is set to `true`.

### **Wiping**

The manager of an ESDT token may wipe out all the tokens held by a frozen Account. This operation is similar to burning the tokens, but the Account must have been frozen beforehand, and it must be done by the token manager. Wiping the tokens of an Account is an operation designed to help token managers to comply with regulations. Such a transaction has the form:

```
WipeTransaction {
    Sender: <account address of the token managers>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "wipe" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address to wipe in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

### **Setting and unsetting special roles**

The manager of an ESDT token can set and unset special roles for a given address. Only applicable if `canAddSpecialRoles` property is `true`.
The special roles available for basic ESDT tokens are:

- **ESDTRoleLocalBurn**: an address with this role can burn tokens

- **ESDTRoleLocalMint**: an address with this role can mint new tokens

For NFTs, there are different roles that can be set. You can find them [here](/tokens/nft-tokens#assigning-roles).

#### **Set special role**

One or more roles for an address can be set by the owner by performing a transaction like:
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
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

#### **Unset special role**

One or more roles for an address can be unset by the owner by performing a transaction like:
```
RolesAssigningTransaction {
    Sender: <address of the ESDT manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "unSetSpecialRole" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <address to unset the role(s) in a hexadecimal encoding> +
          "@" + <role in hexadecimal encoding> +
          "@" + <role in hexadecimal encoding> +
          ...
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

### **Transferring token management rights**

The manager of an ESDT token may transfer the management rights to another Account. This can be done with a transaction of the form:

```
TransferOwnershipTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "transferOwnership" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <account address of the new token manager in hexadecimal encoding>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

After this transaction is processed by the Metachain, any subsequent management operations will only be permitted to the new Account, as specified by the Data field of the transaction.

This operation requires that the option `canChangeOwner` is set to `true`.

### **Upgrading (changing properties)**

:::tip
On Mainnet, starting with epoch 432, global mint and global burn are disabled so one has to use local mint/burn instead.
Therefore, properties canMint and canBurn aren't effective anymore after that epoch. For setting those properties, one has to set the `ESDTRoleLocalMint` and/or `ESDTRoleLocalBurn` instead.
:::

The manager of an ESDT token may individually change any of the properties of the token, or multiple properties at once. Such an operation is performed by a transaction of the form:

```
UpgradingTransaction {
    Sender: <account address of the token manager>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "controlChanges" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          "@" + <property name in hexadecimal encoding> +
          "@" + <"true" or "false" in hexadecimal encoding> +
          <...>
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

As an example, assume that the "AliceTokens" discussed in earlier sections has the property `canWipe` set to `true` and the property `canBurn` set to `false`, but Alice, the token manager, wants to change these properties to `false` and `true`, respectively. The transaction that would achieve this change is:

```
UpgradingTransaction {
    Sender: erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "controlChanges" +
          "@414c432d363235386432" + # ALC-6258d2
          "@63616e57697065" +       # canWipe
          "@66616c7365" +           # false
          "@63616e4275726e" +       # canBurn
          "@74727565"               # true
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

## **Branding**

Anyone can create an ESDT token on MultiversX Network. There are also no limits in tokens names or tickers. For example,
one issues an `AliceToken` with the ticker `ALC`. Anyone else is free to create a new token with the same token name and
the same token ticker. The only difference will be the random sequence of the token identifier. So the "original" token
could have received the random sequence `1q2w3e` resulting in the `ALC-1q2w3e` identifier, while the second token could
have received the sequence `3e4r5t` resulting in `ALC-3e4r5t`.

In order to differentiate between an original token and other tokens with the same name or ticker, we have introduced a
branding mechanism that allows tokens owners to provide a logo, a description, a website, as well as social link for their tokens.
An example of a branded token is MEX, the xExchange's token. MultiversX products such as Explorer, Wallet and so on
will display tokens in accordance to their branding, if any.

A token owner can submit a branding request by opening a Pull Request on [https://github.com/multiversx/mx-assets/](https://github.com/multiversx/mx-assets/).

### **Submitting a branding request**

Project owners can create a PR against [https://github.com/multiversx/mx-assets/](https://github.com/multiversx/mx-assets/) repository with the logo in `.png` and `.svg` format, as well as a `.json` file containing all the relevant information.

Here’s a prefilled template for the .json file to get you started:

``` json
{
  "website": "https://www.multiversxtoken.com",
  "description": "The MXT token is the utility token of MultiversX Token",
  "social": {
    "email": "mxt-token@multiversxtoken.com",
    "blog": "https://www.multiversxtoken.com/MXT-token-blog",
    "twitter": "https://twitter.com/MXT-token-twitter",
    "whitepaper": "https://www.multiversxtoken.com/MXT-token-whitepaper.pdf",
    "coinmarketcap": "https://coinmarketcap.com/currencies/MXT-token",
    "coingecko": "https://www.coingecko.com/en/coins/MXT-token"
  },
  "status": "active"
}
```

The ledgerSignature will be generated by MultiversX. It will give your token “whitelist” status on the Ledger app and enable a more data rich flow for users storing your token on their Ledger hardware wallets. If one wants to set a Ledger signature, request it when opening a PR.

## **REST API**

There are a number of API endpoints that one can use to interact with ESDT data. These are:

### <span class="badge badge-primary">GET</span> **Get all ESDT tokens for an address**
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
Returns an array of ESDT Tokens that the specified address has interacted with (issued, sent or received).

```
https://gateway.multiversx.com/address/*bech32Address*/esdt
```

| Param         | Required                                  | Type     | Description                            |
|---------------|-------------------------------------------|----------|----------------------------------------|
| bech32Address | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format. |

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
https://gateway.multiversx.com/address/*bech32Address*/esdt/*tokenIdentifier*
```

| Param           | Required                                  | Type     | Description                            |
|-----------------|-------------------------------------------|----------|----------------------------------------|
| bech32Address   | <span class="text-danger">REQUIRED</span> | `string` | The Address to query in bech32 format. |
| tokenIdentifier | <span class="text-danger">REQUIRED</span> | `string` | The token identifier.                  |

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

### <span class="badge badge-primary">GET</span> **Get all roles for tokens of an address**

This involves a basic request that contains the address to fetch all tokens and roles for.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/address/*bech32Address*/esdts/roles
```

<!--Response-->

```json
{
  "data": {
    "roles": {
      "TCK-0cv5hj": [
        "ESDTRoleNFTAddQuantity",
        "ESDTRoleNFTBurn"
      ],
      "TCK-ft90kn": [
        "ESDTRoleLocalBurn"
       ] 
    }
  },
  "error": "",
  "code": "successful"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get token's supply, burnt and minted values**

This involves a basic request that contains the token name. It will gather data from all shards and compute the 
initial minted value, burnt value, minted value and total supply value.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

| Param           | Required                                  | Type     | Description                                    |
|-----------------|-------------------------------------------|----------|------------------------------------------------|
| tokenIdentifier | <span class="text-danger">REQUIRED</span> | `string` | The token identifier (example: `WEGLD-bd4d79)` |

```
https://gateway.multiversx.com/network/esdt/supply/*token name*
```

<!--Response-->

```json
{
 "data": {
  "supply": "95000000000000000000",
  "minted": "5000000000000000000",
  "burned": "10000000000000000000",
  "initialMinted": "100000000000000000000"
 },
 "error": "",
 "code": "successful"
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Get all issued ESDT tokens**

1. All ESDT tokens

For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/network/esdts
```

<!--Response-->

```
{
  "data": {
    "tokens": [
      "token1",
      "token2",
      ...
    ],
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

---

2. Fungible tokens
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/network/esdt/fungible-tokens
```

<!--Response-->

```
{
  "data": {
    "tokens": [
      "token1",
      "token2",
      ...
    ],
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

---

3. Semi-fungible tokens
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/network/esdt/semi-fungible-tokens
```

<!--Response-->

```
{
  "data": {
    "tokens": [
      "token1",
      "token2",
      ...
    ],
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

---

4. Non-fungible tokens
<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/network/esdt/non-fungible-tokens
```

<!--Response-->

```
{
  "data": {
    "tokens": [
      "token1",
      "token2",
      ...
    ],
  "error": "",
  "code": "successful"
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-primary">GET</span> **Parse fungible tokens transfer logs**

Each **successful** ESDT transfer generates logs and events that can be used to parse all the details about a transfer
(token identifier, sent amount and receiver).
In order to get the logs and events generated by the transfer, one should know the transaction's hash.

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

| Param  | Required                                  | Type     | Description                 |
|--------|-------------------------------------------|----------|-----------------------------|
| txHash | <span class="text-danger">REQUIRED</span> | `string` | The hash of the transaction |

```
https://gateway.multiversx.com/transaction/*txHash*?withResults=true
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
      "identifier": "ESDTTransfer",
      "topics": [
       "TUVYLTQ1NWM1Nw==",                              // MEX-455c57
       "",                                              // N/A
       "CKxyMEiegAAA",                                  // 160000000000000000000
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

The event with the identifier `ESDTTransfer` will have the following topics:
- 1st topic: token identifier (decoding: base64 to string)
- 2nd topic: token nonce (used for NFTs only, not applicable here)
- 3rd topic: the amount to be sent (decoding: base64 to hex string + hex string to big number)
- 4th topic: the recipient of the tokens (decoding: base64 to hex string + hex string to bech32 address)

In this example, `erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg` received `160 MEX-455c57` (MEX-455c57 has 18 decimals)

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> **Get ESDT token properties**

This involves a `vm query` request to the `ESDT` address.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->

```
https://gateway.multiversx.com/vm-values/query
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
        "RnVuZ2libGVFU0RU",
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
        "Q2FuV2lwZS10cnVl",
        "Q2FuQWRkU3BlY2lhbFJvbGVzLXRydWU=",
        "Q2FuVHJhbnNmZXJORlRDcmVhdGVSb2xlLWZhbHNl",
        "TkZUQ3JlYXRlU3RvcHBlZC1mYWxzZQ==",
        "TnVtV2lwZWQtMA=="
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
  "QWxpY2VUb2tlbnM=",                             | token name                   | AliceTokens
  "RnVuZ2libGVFU0RU",                             | token type                   | FungibleESDT
  "2DSJxJNAmou8TU9f4WQo7rpyJ822eZVUQYwnabJM5hk=", | bytes of a bech32 addres     | erd1mq6gn3yngzdgh0zdfa07zepga6a8yf7dkeue24zp3snknvjvucvs37hmrq after decoding
  "MTAwMDAwMDAwMDA=",                             | total supply                 | 10000000000
  "MA==",                                         | burnt value                  | 0
  "TnVtRGVjaW1hbHMtNg==",                         | number of decimals           | NumDecimals-6
  "SXNQYXVzZWQtZmFsc2U=",                         | is paused                    | IsPaused-false
  "Q2FuVXBncmFkZS10cnVl",                         | can upgrade                  | CanUpgrade-true
  "Q2FuTWludC10cnVl",                             | can mint                     | CanMint-true
  "Q2FuQnVybi10cnVl",                             | can burn                     | CanBurn-true
  "Q2FuQ2hhbmdlT3duZXItZmFsc2U=",                 | can change token management address  | CanChangeOwner-true
  "Q2FuUGF1c2UtdHJ1ZQ==",                         | can pause                    | CanPause-true
  "Q2FuRnJlZXplLXRydWU=",                         | can freeze                   | CanFreeze-true
  "Q2FuV2lwZS10cnVl",                             | can wipe                     | CanWipe-true
  "Q2FuQWRkU3BlY2lhbFJvbGVzLXRydWU=",             | can add special roles        | CanAddSpecialRoles-true
  "Q2FuVHJhbnNmZXJORlRDcmVhdGVSb2xlLWZhbHNl",     | can transfer nft create role | CanTransferNFTCreateRole-false
  "TkZUQ3JlYXRlU3RvcHBlZC1mYWxzZQ==",             | nft creation stopped         | NFTCreateStopped-false  
  "TnVtV2lwZWQtMA=="                              | number of wiped quantity     | NumWiped-0                              
],
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> **Get special roles for a token**

This involves a `vm query` request to the `ESDT` address. It will return all addresses that have roles assigned for the token
with the provided identifier.
For example:

<!--DOCUSAURUS_CODE_TABS-->

<!--Request-->
```
https://gateway.multiversx.com/vm-values/query
```

```json
{
	"scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u",
	"funcName": "getSpecialRoles",
	"args": ["474c442d306430303630"]
}
```

The argument must be the token identifier, hexadecimal encoded. In the example, `474c442d306430303630` = `GLD-0d0060`.

<!--Response-->

```
{
  "data": {
    "data": {
      "returnData": [
        "ZXJkMTM2cmw4NzhqMDltZXYyNGd6cHk3MGsyd2ZtM3htdmo1dWN3eGZmczl2NXQ1c2sza3NodHN6ejI1ejk6RVNEVFJvbGVMb2NhbEJ1cm4=",
        "ZXJkMWt6enYydXc5N3E1azltdDQ1OHFrM3E5dTNjd2h3cXlrdnlrNTk4cTJmNnd3eDdndnJkOXM4a3N6eGs6RVNEVFJvbGVORlRBZGRRdWFudGl0eSxFU0RUUm9sZU5GVEJ1cm4="
      ],
      "returnCode": "ok",
      ........
}
```

In this example, converting the 2 messages from base64 to string would result in:
* `erd136rl878j09mev24gzpy70k2wfm3xmvj5ucwxffs9v5t5sk3kshtszz25z9:ESDTRoleLocalBurn`
* `erd1kzzv2uw97q5k9mt458qk3q9u3cwhwqykvyk598q2f6wwx7gvrd9s8kszxk:ESDTRoleNFTAddQuantity,ESDTRoleNFTBurn`

<!--END_DOCUSAURUS_CODE_TABS-->
