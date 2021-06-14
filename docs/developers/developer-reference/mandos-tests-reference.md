---
id: mandos-tests-reference
title: Mandos tests reference
---

Rationale, description and functionality of Mandos JSON tests

# **Who is Mandos?**

According to the Lord of the Rings wiki: «[**Mandos**](https://lotr.fandom.com/wiki/Mandos) ("Prison-Fortress") was an [Ainu](https://lotr.fandom.com/wiki/Ainu), one of the [Aratar](https://lotr.fandom.com/wiki/Aratar), and a [Vala](https://lotr.fandom.com/wiki/Vala) who was responsible for the judgement of the Spirits (or [Fëa](https://lotr.fandom.com/wiki/Fëa)) of all Elven dead. He also had responsibility for pronouncing the dooms and judgments of [Eru Ilúvatar](https://lotr.fandom.com/wiki/Eru_Ilúvatar) under [Manwë](https://lotr.fandom.com/wiki/Manwë). His real name was **Námo** ("Ordainer" or "Judge") but was later known to the [Elves](https://lotr.fandom.com/wiki/Elves) as Mandos after his sacred [Halls of Mandos](https://lotr.fandom.com/wiki/Halls_of_Mandos), over which he presided, and where Elves would go when slain.» It is only fitting that Mandos is also the name of a framework for _judging_ smart contracts, especially since they are in many ways _immortal_ too.

# **Rationale**

During smart contract development, it is important for the developer to have the capacity to write unit and integration tests easily.

Short unit tests can use the language and tools the contract is written with, but to test the contract in a realistic scenario we need at least a blockchain mock and some way to specify execution scenarios.

Mandos is suitable for both short tests that check how a transaction changes the storage, and for long and complex scenarios.

The fact that it is expressed in a descriptive language like JSON makes it agnostic to the language in which the smart contract is developed.

# **Running the tests**

At the moment of writing this document, Mandos tests can be launched directly from the Elrond VSCode extension, from contextual menus.

There are plans to enable running Mandos tests in the elrond-wasm Rust debugger directly.

# **Test file extension**

Mandos scenario files should end in `.scen.json`, where "scen" comes from "scenario". The framework uses thie double extension to identify tests to attempt running. Any other extension will be ignored.

On a side note, there is also an older format that is now deprecated, where test file names end in `.test.json`, but you shouldn't worry about it.

# **Test file structure**

## **Top level**

A scenario test file is essentially a collection of steps to be performed on a mock blockchain. The simplest such file looks like this:

```
{
    "name": "example scenario file",
    "comment": "comments are nice",
    "steps": [
    ]
}
```

The top-level fields are as follows:

- `name` (optional) - it is possible to name scenarios; this doesn’t have any effect on test execution
- `comment` (optional) - it is possible to have some comment; this doesn’t have any effect on test execution
- `steps` - the core of the scenario. Running a scenario means going through a number of different steps. There are several step types, we will go through each, one by one. Note that each item in this list will be a JSON map with a `step` field that discriminates the step type.

## **Step type: `externalSteps`**

```
{
    "steps": [
        {
            "step": "externalSteps",
            "path": "other.json"
        }
    ]
}
```

This step type is very useful for splitting, composing and reusing scenario steps. It is possible to have scenario bifurcation, to do so simply reuse the common part in 2 different tests.

The only specific field here is `path`, which indicates the relative path to a JSON file containing scenario steps. The referenced file does not need to have the `.scen.json `extension, so does not need to be a valid scenario on its own.

The imported steps will be run or re-run every time they are imported. There is no caching.

Also beware that there is currently no protection against cyclic imports.

## **Step type: `setState`**

```
{
    "steps": [
        {
            "step": "setState",
            "comment": "not much to comment here, but we can",
            "accounts": {
                "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000": {
                    "comment": "we can comment on individual account initializations",
                    "nonce": "0",
                    "balance": "0xe8d4a51000",
                    "storage": {},
                    "code": ""
                },
                "``smart_contract_address________s1": {
                    "nonce": "0x00",
                    "balance": "23,000",
                    "storage": {
                        "0x19efaebcc296cffac396adb4a60d54c05eff43926a6072498a618e943908efe1": "-5",
                        "``32_byte_key_____________________": "``string___interpreted___as__bytes"
                    },
                    "code": "file:smart-contract.wasm"
                }
            },
            "newAddresses": [
                {
                    "creatorAddress": "``creator_addr____________________",
                    "creatorNonce": "1234",
                    "newAddress": "``creator_addr____________________"
                }
            ]
        },
        {
            "step": "setState",
            "comment": "only set block info this time",
            "previousBlockInfo": {
                "blockNonce": "222",
                "blockRound": "333",
                "blockEpoch": "444"
            },
            "currentBlockInfo": {
                "blockTimestamp": "511",
                "blockNonce": "522",
                "blockRound": "533",
                "blockEpoch": "544"
            }
        }
    ]
}
```

This step type is used to initialize the blockchain mock, or reconfigure it during execution.

At least one such step is required before any execution, because all transactions need existing accounts to work with.

Not all of its sections are required each time. These sections are:

- `comment` (optional) - doesn't affect execution
- `accounts` - any number of accounts can be specified, both user accounts and smart contracts. Each account will have:
  - `comment` (optional)
  - `nonce`
  - `balance`
  - `storage` - initializes storage with given key-value map. Both keys and values can be of any length.
  - `code` - typically provided in the format `"code": "file:<relative path to contract binary>"`More on value type later. Having a `code` makes the account a smart contract.
- `newAddresses` - mock contract address generation during deploy. We basically tell the blockchain mock what address name to generate when deploying new contracts. Not having this would give a generated address that is hard to predict when developing tests. It consists of a list of triples:
  - `creatorAddress`
  - `creatorNonce`
  - `newAddress` - whenever an account with the given address and nonce deploys a contract, this will receive this address. This should make the test more readable, by having the new addresses explicitly stated, rather than being a magic new number popping up at some point in the scenario.
- `previousBlockInfo` and `currentBlockInfo` - set or change data that the blockchain mock is providing to smart contracts via hooks. Mandos does not model blocks, so this is how we simulate the passing of time in scenarios. Fields:
  - `blockTimestamp`
  - `blockNonce`
  - `blockRound`
  - `blockEpoch`

## **Step type: `checkState`**

This step checks the state of the blockchain mock at a certain point. It can check the entire state or just part of it.

Is allowed anywhere, not just as the end of tests, so progressive changes can be verified.

```
{
    "steps": [
        {
            "step": "checkState",
            "comment": "check that previous tx did the right thing",
            "accounts": {
                "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000": {
                    "comment": "we can comment on individual account checks",
                    "nonce": "1",
                    "balance": "0xe8d4951000",
                    "storage": {},
                    "code": ""
                },
                "``smart_contract_address________s1": {
                    "nonce": "0x00",
                    "balance": "23,000",
                    "storage": {
                        "0x19efaebcc296cffac396adb4a60d54c05eff43926a6072498a618e943908efe1": "-5",
                        "``32_byte_key_____________________": "``string___interpreted___as__bytes"
                    },
                    "code": "file:smart-contract.wasm"
                },
                "``smart_contract_address_2______s1": {
                    "nonce": "*",
                    "balance": "*",
                    "storage": "*",
                    "code": "*",
                    "asyncCallData": "func@arg1@arg2"
                },
                "+": ""
            }
        }
    ]
```

Fields:

- `comment` (optional) - doesn't affect execution
- accounts - a map from account address to expected account state. It also accepts the optional entry `"+": ""`, which indicates that there can be other accounts in the blockchain mock that are not mentioned here. Without this field, unexpected account will cause an error. Each account state has the following fields:
  - `nonce` - either expected nonce value, or `“*”` to skip check
  - `balance` - either expected balance value, or `“*” `to skip check
  - `storage` all key-value pairs must match, or `“*”` to skip check
  - `code` - expected smart contract code, or `“*”` to skip check
  - `asyncCallData` - this field is set by asynchronous calls and when contracts send funds to an account

## **Step type: `scCall`**

```
{
    "steps": [
        {
            "step": "scCall",
            "txId": "tx-name-or-id",
            "comment": "just an example",
            "tx": {
                "from": "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000",
                "to": "0x1000000000000000000000000000000000000000000000000000000000000000",
                "value": "0x00",
                "function": "someFunctionName",
                "arguments": [
                    "0x1234123400000000000000000000000000000000000000000000000000000004",
                    "0x00",
                    "",
                    "``a message (as bytes)"
                ],
                "gasLimit": "0x100000",
                "gasPrice": "0x01"
            },
            "expect": {
                "out": [
                    "5",
                    "*"
                ],
                "status": "",
                "logs": [
                    {
                        "address": "``smart_contract_address________s1",
                        "identifier": "0xf099cd8bde557814842a3121e8ddfd433a539b8c9f14bf31ebf108d12e6196e9",
                        "topics": [
                            "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000",
                            "0x1234123400000000000000000000000000000000000000000000000000000004"
                        ],
                        "data": "0x00"
                    }
                ],
                "gas": "0x1234",
                "refund": "*"
            }
        }
    ]
}
```

This step simulates a transaction to an existing smart contract. Fields:

- `txId` (optional) - it shows up in the error messages, to help the developer find a transaction that produced a wrong result or that failed. It is also used to generate mock tx hashes.
- `comment` (optional) - developers can provide comments or a description of the transaction. Does not influence execution.
- `tx` - specifies the details of the transaction.
  - `from` - account must exist in the blockchain mock
  - `to` - account must exist in the blockchain mock and must be a smart contract
  - `value` - how much ERD to transfer as part of the call. Only payable functions will accept this kind of payment.
  - `function` - function name to call in the contract
  - `arguments` - a list of the arguments to provide to the SC function
  - `gasLimit` - maximum amount of gas allowed in SC execution
  - `gasPrice` - how much each unit of gas costs in ERD. gasLimit x gasPrice will be subtracted from caller balance before the call. Normally, the unused gas (x gasPrice) is returned to the caller after executing the call. This does not happen in the Mandos tests as it would make resulting balances a lot harder to manage. Hint: Mandos allows `gasPrice` to be zero, to avoid having to keep track of gas payments.
- `expect` (optional) - each transaction produces a receipt whose hash ends up on the blockchain. The contents of the receipt can be checked here.
  - `out` - functions can return any number of results. This is an ordered list of these results.
  - `status` - indicates whether execution completed successfully or not. Status 0 means success. All errors occurring in the contract will yield status 4 (“user error”).
  - `message` (optional) - in case of error, the contract can also provide an error message. This is where this message can be checked, to make sure that the correct error occurred. It will be empty in case of success.
  - `logs` - contracts can save logs off-chain, that can be later studied to determine what happened with the contract. In the contract they are referred to as “events”. To skip checking logs, one can write `“logs”: “*”`.
    - `address` - smart contract address that produced the log. It can actually be different from the tx recipient if that contract in turn calls another contract.
    - `identifier` - a contract can have multiple event types, each of them has an identifier. In the API the identifier is the first topic saved. In the Rust framework the event identifier is specified explicitly in the contract.
    - `topics` - these are event arguments, provided by the contract. Off-chain they are indexed, so that users can search by these topics. All topics are currently 32 bytes in length, but this restriction might be lifted in the future.
    - `data` - same as the topics, but this is not indexed, cannot perform searches on data. Can be of any length (or sometimes empty).
  - `gas` - here the consumed gas can be checked. To ignore this check, set to `“*”`
  - `refund` - some operations, like freeing up storage actually gives EGLD back to the caller. To ignore this check, set to `“*”`
  
## **Step type: `scQuery`**

```
{
    "steps": [
        {
            "step": "scQuery",
            "txId": "tx-name-or-id",
            "comment": "just an example",
            "tx": {
                "to": "0x1000000000000000000000000000000000000000000000000000000000000000",
                "function": "someFunctionName",
                "arguments": [
                    "0x1234123400000000000000000000000000000000000000000000000000000004",
                    "0x00",
                    "",
                    "``a message (as bytes)"
                ],
            },
            "expect": {
                "out": [
                    "5",
                    "*"
                ],
                "status": "",
                "gas": "*",
                "refund": "*"
            }
        }
    ]
}
```

This step simulates a query to an existing smart contract. Fields:

- `txId` (optional) - it shows up in the error messages, to help the developer find a transaction that produced a wrong result or that failed. It is also used to generate mock tx hashes.
- `comment` (optional) - developers can provide comments or a description of the transaction. Does not influence execution.
- `tx` - specifies the details of the transaction.
  - `to` - account must exist in the blockchain mock and must be a smart contract
  - `function` - function name to call in the contract
  - `arguments` - a list of the arguments to provide to the SC function
- `expect` (optional) - each transaction produces a receipt whose hash ends up on the blockchain. The contents of the receipt can be checked here.
  - `out` - functions can return any number of results. This is an ordered list of these results.
  - `status` - indicates whether execution completed successfully or not. Status 0 means success. All errors occurring in the contract will yield status 4 (“user error”).
  - `message` (optional) - in case of error, the contract can also provide an error message. This is where this message can be checked, to make sure that the correct error occurred. It will be empty in case of success.
  - `gas` - here the consumed gas can be checked. To ignore this check, set to `“*”`
  - `refund` - some operations, like freeing up storage actually gives EGLD back to the caller. To ignore this check, set to `“*”`

## **Step type: `scDeploy`**

It is very similar to `scCall`, but it is used specifically for simulating deployment of new smart contracts.

```
{
    "steps": [
        {
            "step": "scDeploy",
            "txId": "2",
            "comment": "deploy example",
            "tx": {
                "from": "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000",
                "value": "0x00",
                "contractCode": "``new contract code here",
                "arguments": [
                    "0x1234123400000000000000000000000000000000000000000000000000000004",
                    "0x00",
                    "",
                    "``a message (as bytes)"
                ],
                "gasLimit": "0x100000",
                "gasPrice": "0x01"
            },
            "expect": {
                "out": [],
                "status": "",
                "logs": [],
                "gas": "*",
                "refund": "0"
            }
        }
    ]
}
```

The fields are:

- `txId` (optional) - same as for `scCall`
- `comment` (optional) - same as for `scCall`
- `tx` - similar with `scCall`, but a few differences. First off, there is no to field, since the contract does not exist yet. Also function cannot be specified, on deploy the `init` function is always called. We have:
  - `contractCode` - the code for the new contract. Typically in the `"file:<relative path to contract binary>"` format.
  - `from`, `value`, `arguments`, `gasLimit`, `gasPrice` - same as for `ScCall`
- `expect` (optional) - same as for `scCall`

## **Step type: `transfer`**

Lesser used step type. Simulates a simple transfer of eGLD between two accounts, without involving the VM. Note that simple transfers are also allowed toward smart contracts. They will increase the smart contract balance, without calling any function from it.

```
{
    "steps": [
        {
            "step": "transfer",
            "txId": "3",
            "comment": "simple transfer, no VM",
            "tx": {
                "from": "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000",
                "to": "0x1000000000000000000000000000000000000000000000000000000000000000",
                "value": "1234"
            }
        }
    ]
}
```

The fields are:

- `txId` (optional) - same as `scCall`/`scDeploy`
- `comment` (optional) - same as `scCall`/`scDeploy`
- `tx`
  - `from`
  - `to`
  - `value`

## **Step type: `validatorReward`**

Lesser used step type. Simulates a validator reward being sent by the protocol. This transaction has no sender, and beside increasing the recipient balance, it also increments the `ELRONDrewards` field in the smart contract storage. Useful when building delegation of other staking contracts.

```
{
    "steps": [
        {
            "step": "validatorReward",
            "txId": "4",
            "comment": "system send out validator rewards",
            "tx": {
                "to": "``delegation_contract___________s1",
                "value": "555,000,000"
            }
        }
    ]
}
```

The fields are:

- `txId` (optional) - same as `scCall`/`scDeploy`
- `comment` (optional) - same as `scCall`/`scDeploy`
- `tx`
  - `to`
  - `value`

# **Formatting values**

We went through the structure of a Mandos test, but you might have noticed that the actual values are expressed in many different, some unusual ways.

Almost all values in the JSON file end up being sent to the VM as raw bytes. This is why we have developed a consistent format to express all raw values everywhere. The same format is used for expressing addresses, balances, transaction and block nonces, keys, contract code, storage keys and values, log identifiers, topics and data, gas limits, gas costs, etc.

Exceptions: `txId`, `comment` and `asyncCallData` are simple strings. `asyncCallData` might be changed to the default value format in the future and/or reworked.

The format is as follows

- Empty strings (`""`) mean empty byte arrays. The number zero can also be represented as an empty byte array.
- Hexadecimal representation, starting with `0x`. With this representation, what you see is what you get. E.g. `“0x1234567890”`. After the `0x` prefix an even number of digits is expected, since 2 digits = 1 byte.
- Base 10 unsigned number representation. Unprefixed numbers are interpreted as base 10, unsigned. E.g. `“0”`, `“1”`, `“1000000”.` Unsigned numbers will be represented in the minimum amount of bytes in which they can fit. `“255”` = `“0xff”`, `“256”` = `“0x0100”`, `"0"` = `""`. Digit separators are allowed, e.g. `"1,000,000"`.
- Biguint representation. Biguints are formatted with special rules to signal the amount of bytes needed to build the number. Mandos can do that for you by specifying a number with a `biguint:` prefix for example `biguint:5`.
- Typed numbers. Use `u64:` `i64:` `u32:` `i32:` `u16:` `i16:` `u8:` `i8:` to represent a number with a fixed length.
- Signed number representation. Some contract arguments are expected to be signed. These arguments will be transmitted as two’s complement representation. Prefixing any number (base 10 or hex) with a minus sign will convert them to two’s complement. Two’s complement is interpreted as positive or negative based on the first bit. Sometimes positive numbers can start with a “1” bit and get accidentally interpreted as negative. To prevent this, we can prefix them with a plus. A few examples should make this clearer:
  - `“1” `is represented as `“0x01”`, signed interpretation: `1`, everything OK.
  - `“255”` is represented as `“0xff”`, signed interpretation: `“-1”,` this might not be what we expected.
  - `“+255”` is represented as `“0x00ff”`, signed interpretation: `“255”.` The prepended zero byte makes sure the contract interprets it as positive. The `+` makes sure those leading zeroes are added if necessary.
  - `“+1”` is still represented as `“0x01”`, here the leading 0 is not necessary. Still, it is good practice to add the `+` if we know the argument is expected to be signed.
  - `“-1”` is represented as `“0xff”`. Negative numbers are also represented in the minimum number of bytes possible.
- Boolean values: `"true"` = `"1"` = `"0x01"`; `"false"` = `"0"` = `""`.
- String representation, starting with `''` or ``. Mandos steps can be embedded in Go code now; in Go ` is reserved for multi-line strings, so `''` is preferred now. In this representation, each character gets converted to a single byte, based on its ASCII code. It is especially useful for making the dummy account addresses readable. Storage keys are also commonly readable as ASCII. E.g. ` “``some string argument” `, ` "``node_address__________________s1" `, `"storage_key_1"`
- Concatenate multiple values (possibly of different formats) using the pipe (`|`) separator. E.g. ` “0x1234|``abcd|-1” ` gets interpreted as `“0x123461626364ff”`
- Load file, starting with `file:`. This will replace the field with the entire contents of the file, given as relative path with respect to the JSON file we are executing. E.g. `“file:contracts/erc20-c.wasm”`
- Keccak hash, starting with `keccak256:`. E.g. `“keccak256:1|0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b000000000000000000000000”` gets interpreted as `“0x648147902a606bf61e05b8b9d828540be393187d2c12a271b45315628f8b05b9”`. Note that the argument can contain concatenation, but this is not a full parser yet, only very primitive syntax trees are possible for now.
- Addresses, starting with `address:`. This will format a string to a valid address representation. A valid example would be `address:owner`.
- SmartContract-Addresses, starting with `sc:`. Same as address, but will enforce the SmartContract address formatting. A valid example would be `sc:smartcontract`.

# **Embedding in Go**

Mandos steps can be embedded in Go, in order to program for more flexible behavior. One can even save dynamically generated Mandos scenarios. For a comprehensive example on how to do that, check out the [delegation contract fuzzer in Arwen](https://github.com/ElrondNetwork/arwen-wasm-vm/tree/master/fuzz/delegation) or the [DNS contract deployment scenario test generator](https://github.com/ElrondNetwork/arwen-wasm-vm/tree/master/cmd/testgen/dns). Just a snippet from the fuzzer:

```
_, err = pfe.executeTxStep(fmt.Sprintf(`
	{
		"step": "scDeploy",
		"txId": "-deploy-",
		"tx": {
			"from": "''%s",
			"value": "0",
			"contractCode": "file:delegation.wasm",
			"arguments": [
				"''%s",
				"%d",
				"%d",
				"%d"
			],
			"gasLimit": "100,000",
			"gasPrice": "0"
		},
		"expect": {
			"out": [],
			"status": "",
			"logs": [],
			"gas": "*",
			"refund": "*"
		}
	}`,
		string(pfe.ownerAddress),
		string(pfe.auctionMockAddress),
		args.serviceFee,
		args.numBlocksBeforeForceUnstake,
		args.numBlocksBeforeUnbond,
	))
```
