---
id: relayed-transactions
title: Relayed Transactions
---

## Introduction

Relayed transactions (or meta-transactions) are transactions with the fee paid by a so-called relayer.
In other words, if a relayer is willing to pay for an interaction, it is not mandatory that the address 
interacting with a Smart Contract has any EGLD for fees.

More details and specifications can be found on [Elrond Specs](https://github.com/ElrondNetwork/elrond-specs/blob/main/sc-meta-transactions.md).

## Types of relayed transactions

Currently, there are 2 versions of relayed transactions: v1 and v2. In the end, they both have the same effect,
but v2 comes with optimisations in terms of gas usage, making it our recommendation.

## Relayed transactions version 1

A relayed transaction version 1 relies on having the inner transaction JSON serialized and given as an argument to the `relayedTx` protocol function. 

It would look like: 

```
RelayedV1Transaction {
    Sender: <Relayer address>
    Receiver: <Address that signed the inner transaction>
    Value: 0
    GasLimit: <move_balance_cost> + length(Data) * <gas_per_data_byte> + <inner transaction gas limit>
    Data: "relayedTx" +
          "@" + <JSON serialized inner transaction in hexadecimal encoding>
}
```

The inner transaction can have a format like this:

```
RelayedV1InnerTransaction {
    Sender: <Receiver of the relayed transaction>
    Receiver: <Smart Contract address>
    Value: 0
    GasLimit: <to be determined for each case>
    Data: "functionName" +
          "@" + <argument in hexadecimal encoding>
          ...
}
```

However, unlike regular transactions' JSON serialization, the inner transaction that has to be signed has a different 
structure:

```
type Transaction struct {
	Nonce           uint64        
	Value           *math_big.Int 
	ReceiverAddress []byte            
	SenderAddress   []byte                
	GasPrice        uint64        
	GasLimit        uint64        
	Data            []byte        
	ChainID         []byte        
	Version         uint32        
	Signature       []byte        
	Options         uint32        
}
```

Notice that there are some differences as compared to the regular *frontend* [transaction structure](/developers/signing-transactions/signing-transactions/#general-structure), such:
- `SenderAddress` and `ReceiverAddress` have to be byte arrays instead of bech32 string addresses
- `Value` has to be a big integer, instead of a string
- `ChainID` has to be a byte array instead of a string
- `Signature` has to be a byte array instead of the hex version of it

### Preparing relayed v1 transaction using erdjs

`erdjs` has built-in support for relayed transactions version 1, by using a builder which allows one to prepare such 
a transaction. 

Resources:
- [relayedTransactionV1Builder](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/relayedTransactionV1Builder.ts)
- [tests/example](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/relayedTransactionV1Builder.spec.ts)

### Example

Here's an example of a relayed v1 transaction. Its intent is:

`erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx` will call the function `add` of the contract
`erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd`, while `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`
will pay the computation fee

```json
{
  "nonce":2627,
  "value":"0",
  "receiver":"erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
  "sender":"erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
  "gasPrice":1000000000,
  "gasLimit":61040000,
  "data":"cmVsYXllZFR4QDdiMjI2ZTZmNmU2MzY1MjIzYTMxMzkzODJjMjI3MzY1NmU2NDY1NzIyMjNhMjI2NzQ1NmU1NzRmNjU1NzZkNmQ0MTMwNjMzMDZhNmI3MTc2NGQzNTQyNDE3MDdhNjE2NDRiNDY1NzRlNTM0ZjY5NDE3NjQzNTc1MTYzNzc2ZDQ3NTA2NzNkMjIyYzIyNzI2NTYzNjU2OTc2NjU3MjIyM2EyMjQxNDE0MTQxNDE0MTQxNDE0MTQxNDE0NjQxNDIzNDc1NTk1MjcxNjMzNDY1NDQ0OTM0Nzk2NzM4N2E0ODc3NjI0NDMwNWE2ODZiNTg0MjM1NzAzMTc3M2QyMjJjMjI3NjYxNmM3NTY1MjIzYTMwMmMyMjY3NjE3MzUwNzI2OTYzNjUyMjNhMzEzMDMwMzAzMDMwMzAzMDMwMzAyYzIyNjc2MTczNGM2OTZkNjk3NDIyM2EzNjMwMzAzMDMwMzAzMDMwMmMyMjY0NjE3NDYxMjIzYTIyNTk1NzUyNmIyMjJjMjI3MzY5Njc2ZTYxNzQ3NTcyNjUyMjNhMjI0ZTMwNzIzMTcwNmYzNzZiNzY0ZjU0NGI0OTQ3NDcyZjc1NmI2NzcyMzg1YTYyNTc2NDU4NjczMTY2NTEzMDc2NmQ3NTYyMzU3OTM0NGY3MzUzNDE3MTM0N2EyZjU5Mzc2YzQ2NTI3OTU3NzM2NzM0NGUyYjZmNGE2OTQ5NDk1Nzc3N2E2YjZkNmM2YTQ5NDE3MjZkNjkzMTY5NTg0ODU0NzkzNDRiNjc0MTQxM2QzZDIyMmMyMjYzNjg2MTY5NmU0OTQ0MjIzYTIyNTY0MTNkM2QyMjJjMjI3NjY1NzI3MzY5NmY2ZTIyM2EzMTdk",
  "chainID":"T",
  "signature": "44889e788581c8913a00e03f711f9ed3522119030a48fe6c1b3434656670b4b93867213f7a7b5453eafe0884f7447361e1154d26c6e7b2cfa40510159e0e1008",
  "version":1
}
```

The data field (after decoding from base64 to string) is converted to: 

```
relayedTx@7b226e6f6e6365223a3139382c2273656e646572223a2267456e574f65576d6d413063306a6b71764d354241707a61644b46574e534f69417643575163776d4750673d222c227265636569766572223a22414141414141414141414146414234755952716334654449347967387a48776244305a686b5842357031773d222c2276616c7565223a302c226761735072696365223a313030303030303030302c226761734c696d6974223a36303030303030302c2264617461223a225957526b222c227369676e6174757265223a224e307231706f376b764f544b4947472f756b6772385a625764586731665130766d75623579344f73534171347a2f59376c465279577367344e2b6f4a69494957777a6b6d6c6a4941726d69316958485479344b6741413d3d222c22636861696e4944223a2256413d3d222c2276657273696f6e223a317d
```

Furthermore, the inner transaction can be easily decoded (hex string to string), resulting in:

```
{
   "nonce":198,
   "sender":"gEnWOeWmmA0c0jkqvM5BApzadKFWNSOiAvCWQcwmGPg=",
   "receiver":"AAAAAAAAAAAFAB4uYRqc4eDI4yg8zHwbD0ZhkXB5p1w=",
   "value":0,
   "gasPrice":1000000000,
   "gasLimit":60000000,
   "data":"YWRk",
   "signature":"N0r1po7kvOTKIGG/ukgr8ZbWdXg1fQ0vmub5y4OsSAq4z/Y7lFRyWsg4N+oJiIIWwzkmljIArmi1iXHTy4KgAA==",
   "chainID":"VA==",
   "version":1
}
```

Decoding the base64 fields, we'll get:
- sender: `erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx`
- receiver: `erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd`
- data: `add`
- chain ID: `T`
- signature: `374af5a68ee4bce4ca2061bfba482bf196d67578357d0d2f9ae6f9cb83ac480ab8cff63b9454725ac83837ea09888216c33926963200ae68b58971d3cb82a000`

Regarding the relayed transaction's gas limit, let's check the math.

```
gasLimit = <move_balance_cost> + length(Data) * <gas_per_data_byte> + <inner transaction gas limit>
gasLimit =          50_000     +      660     *        1500         +         60_000_000
gasLimit = 61040000  // just like the gas limit set in the relayed transaction
```

## Relayed transactions version 2

In contrast with version 1, relayed transactions version 2 have only certain fields of the inner transaction included 
in the data field, making the payload smaller, therefore the tx fee smaller. It also eliminates the need of calculating
the matching gas limit values between the relayed and inner transactions.

It would look like:

```
RelayedV1Transaction {
    Sender: <Relayer address>
    Receiver: <Address that signed the inner transaction>
    Value: 0
    GasLimit: <move_balance_cost> + length(Data) * <gas_per_data_byte> + <gas needed for the inner transaction>
    Data: "relayedTxV2" +
          "@" + <Smart Contract address to be called in hexadecimal encoding>
          "@" + <nonce of the receiver in hexadecimal encoding>
          "@" + <data field (function name + args) in hexadecimal encoding>
          "@" + <the signature of the inner transaction in hexadecimal encoding>
}
```

:::note
Noticing the arguments needed, there are some limitations for the inner transaction: it cannot have call value or a custom gas price.
:::

Therefore, when one wants to build such a transaction, the steps would be:

- create the inner transaction (make sure `gasLimit` is set to 0)
- sign it
- fetch the receiver, nonce, data and signature fields and use them in the relayed transaction

### Preparing relayed v2 transaction using erdjs

`erdjs` has built-in support for relayed transactions version 2, by using a builder which allows one to prepare such
a transaction.

Resources:
- [relayedTransactionV2Builder](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/relayedTransactionV2Builder.ts)
- [tests/example](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/relayedTransactionV2Builder.spec.ts)

### Example

Here's an example of a relayed v2 transaction. Its intent is:

`erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx` will call the function `add` of the contract
`erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd`, while `erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th`
will pay the computation fee

```json
{
   "nonce":37,
   "value":"0",
   "receiver":"erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
   "sender":"erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
   "gasPrice":1000000000,
   "gasLimit":60372500,
   "data":"cmVsYXllZFR4VjJAMDAwMDAwMDAwMDAwMDAwMDA1MDAxZTJlNjExYTljZTFlMGM4ZTMyODNjY2M3YzFiMGY0NjYxOTE3MDc5YTc1Y0AwZkA2MTY0NjRAOWFiZDEzZjRmNTNmM2YyMzU5Nzc0NGQ2NWZjNWQzNTFiYjY3NzNlMDVhOTU0YjQxOWMwOGQxODU5M2QxYzY5MjYyNzlhNGQxNjE0NGQzZjg2NmE1NDg3ODAzMTQyZmNmZjBlYWI2YWQ1ODgyMDk5NjlhY2I3YWJlZDIxMDIwMGI=",
   "chainID":"T",
   "signature":"2a448b92c16a564a0b1dc8d02fb3a73408decc0aa47d0780a4faa108234d767dc262057b376a9f3c4d9283018c90cb751b55d27c42f59d63cce3ca6213a5ac0a",
   "version":1
}
```

After decoding the data field (base64 to string) we'll get:

```
relayedTxV2@000000000000000005001e2e611a9ce1e0c8e3283ccc7c1b0f4661917079a75c@0f@616464@9abd13f4f53f3f23597744d65fc5d351bb6773e05a954b419c08d18593d1c6926279a4d16144d3f866a5487803142fcff0eab6ad588209969acb7abed210200b
```

Decoding the arguments ([useful resources here](/developers/sc-calls-format/)) we'll get:

- 1st argument: `000000000000000005001e2e611a9ce1e0c8e3283ccc7c1b0f4661917079a75c` => `erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd` (sc address to be called)
- 2nd argument: `0f` => `15` (nonce of the inner transaction)
- 3rd argument: `616464` => `add` (function to be called - no argument needed in this example)
- 4th argument: `9abd13f4f53f3f23597744d65fc5d351bb6773e05a954b419c08d18593d1c6926279a4d16144d3f866a5487803142fcff0eab6ad588209969acb7abed210200b` (the signature of the inner transaction)
