---
id: structure
title: Mandos Structure
---

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
  - `nonce` - either expected nonce value, or `"*"` to skip check
  - `balance` - either expected balance value, or `"*" `to skip check
  - `storage` all key-value pairs must match, or `"*"` to skip check
  - `code` - expected smart contract code, or `"*"` to skip check
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
  - `status` - indicates whether execution completed successfully or not. Status 0 means success. All errors occurring in the contract will yield status 4 ("user error").
  - `message` (optional) - in case of error, the contract can also provide an error message. This is where this message can be checked, to make sure that the correct error occurred. It will be empty in case of success.
  - `logs` - contracts can save logs off-chain, that can be later studied to determine what happened with the contract. In the contract they are referred to as "events". To skip checking logs, one can write `"logs": "*"`.
    - `address` - smart contract address that produced the log. It can actually be different from the tx recipient if that contract in turn calls another contract.
    - `identifier` - a contract can have multiple event types, each of them has an identifier. In the API the identifier is the first topic saved. In the Rust framework the event identifier is specified explicitly in the contract.
    - `topics` - these are event arguments, provided by the contract. Off-chain they are indexed, so that users can search by these topics. All topics are currently 32 bytes in length, but this restriction might be lifted in the future.
    - `data` - same as the topics, but this is not indexed, cannot perform searches on data. Can be of any length (or sometimes empty).
  - `gas` - here the consumed gas can be checked. To ignore this check, set to `"*"`
  - `refund` - some operations, like freeing up storage actually gives EGLD back to the caller. To ignore this check, set to `"*"`
  
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
  - `status` - indicates whether execution completed successfully or not. Status 0 means success. All errors occurring in the contract will yield status 4 ("user error").
  - `message` (optional) - in case of error, the contract can also provide an error message. This is where this message can be checked, to make sure that the correct error occurred. It will be empty in case of success.
  - `gas` - here the consumed gas can be checked. To ignore this check, set to `"*"`
  - `refund` - some operations, like freeing up storage actually gives EGLD back to the caller. To ignore this check, set to `"*"`

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
- `tx` - similar with `scCall`, but a few differences. First off, there is no `to` field, since the contract does not exist yet. Also function cannot be specified, on deploy the `init` function is always called. We have:
  - `contractCode` - the code for the new contract. Typically, in the `"file:<relative path to contract binary>"` format.
  - `from`, `value`, `arguments`, `gasLimit`, `gasPrice` - same as for `ScCall`
- `expect` (optional) - same as for `scCall`

## **Step type: `transfer`**

Lesser used step type. Simulates a simple transfer of EGLD between two accounts, without involving the VM. Note that simple transfers are also allowed toward smart contracts. They will increase the smart contract balance, without calling any function from it.

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
