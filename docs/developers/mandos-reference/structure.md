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
                "address:user_account": {
                    "comment": "we can comment on individual account initializations",
                    "nonce": "0",
                    "balance": "123,000,000,000",
                    "esdt": {
                        "str:MYFUNGIBLE-0001": "400,000,000,000",
                        "str:MYSFT-123456": {
                            "instances": [
                                {
                                    "nonce": "24",
                                    "balance": "1"
                                },
                                {
                                    "nonce": "25",
                                    "balance": "1",
                                    "creator": "address:other_creator_address",
                                    "royalties": "5000",
                                    "hash": "keccak256:str:other_nft_hash",
                                    "uri": [
                                        "str:www.something.com/funny.jpeg"
                                    ],
                                    "attributes": "str:other_attributes"
                                }
                            ],
                            "lastNonce": "7",
                            "roles": [
                                "ESDTRoleLocalMint",
                                "ESDTRoleLocalBurn",
                                "ESDTRoleNFTCreate",
                                "ESDTRoleNFTAddQuantity",
                                "ESDTRoleNFTBurn"
                            ],
                            "frozen": "false"
                        }
                    },
                    "username": "str:myusername.elrond",
                    "storage": {},
                    "code": ""
                },
                "sc:smart_contract_address": {
                    "nonce": "0",
                    "balance": "23,000",
                    "esdt": {
                        "str:MYFUNGIBLE-0001": "100,000,000,000",
                    },
                    "storage": {
                        "str:storage-key-1": "-5",
                        "str:storage-key-2|u32:4": ["u32:1", "u32:2", "u32:3"]
                    },
                    "code": "file:smart-contract.wasm"
                }
            },
            "newAddresses": [
                {
                    "creatorAddress": "address:creator",
                    "creatorNonce": "1234",
                    "newAddress": "sc:future_sc"
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

- `comment` doesn't affect execution
- `accounts` any number of accounts can be specified, both user accounts and smart contracts. The account contains several fields, all of them optional:
    - `comment` doesn't affect execution
    - `nonce` account nonce at the beginning of the execution
    - `balance` EGLD balance
    - `esdt` a list of ESDT tokens owned by this account
        - Owned ESDTs are represented as a map from token identifier to token data
        - Mandos does not validate token identifiers (the keys).
        - There are 2 formats for expressing the ESDT value:
            - Compact: for fungible tokens a single string containing the ESDT balance is enough.
            - Full: as a map containing several fields:
                - `instances` is a list containing the main token data. Each instance has a unique token nonce (although Mandos does not enforce this uniqueness). Fungible tokens can only have 1 instance with the nonce 0. Semi-fungible tokens have non-zero nonces. Each instance has the following fields:
                    - `nonce`
                    - `balance`
                    - `creator` address of the account that created the NFT
                    - `royalties` a proportion out of 10000 that represents what percentage of an NFT sell price should be transferred to the creator. This is not enforced by the protocol or Mandos in any way.
                    - `hash` NFT hash
                    - `uri` a list of URIs associated to the NFT/SFT
                    - `attributes` raw bytes where any data can be stored
                - `lastNonce` the last created instance nonce for this token identifier. The next NFT/SFT will have nonce `lastNonce + 1`
                - `roles` determine how the current account can interact with the ESDT token
                - `frozen` ESDT tokens can be frozen by their creator if they are configured to be freezable
    - `username` the "herotag", which is stored directly in the account trie
    - `storage` initializes storage with given key-value map. Both keys and values can be of any length.
    - `code` typically provided in the format `"code": "file:path/to/binary"` More on this [here](/developers/mandos-reference/values-simple#file-contents). Having a `code` makes the account a smart contract.
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
                "address:user_account": {
                    "comment": "we can comment on individual account initializations",
                    "nonce": "0",
                    "balance": "*",
                    "esdt": {
                        "str:MYFUNGIBLE-0001": "*",
                        "str:MYSFT-123456": {
                            "instances": [
                                {
                                    "nonce": "24",
                                    "balance": "*"
                                },
                                {
                                    "nonce": "25",
                                    "balance": "1",
                                    "creator": "address:other_creator_address",
                                    "royalties": "5000",
                                    "hash": "keccak256:str:other_nft_hash",
                                    "uri": [
                                        "str:www.something.com/funny.jpeg"
                                    ],
                                    "attributes": "str:other_attributes"
                                }
                            ],
                            "lastNonce": "7",
                            "roles": [
                                "ESDTRoleLocalMint",
                                "ESDTRoleLocalBurn",
                                "ESDTRoleNFTCreate",
                                "ESDTRoleNFTAddQuantity",
                                "ESDTRoleNFTBurn"
                            ],
                            "frozen": "false"
                        }
                    },
                    "username": "str:myusername.elrond",
                    "storage": {},
                    "code": ""
                },
                "sc:smart_contract_address": {
                    "nonce": "0",
                    "balance": "23,000",
                    "esdt": {
                        "str:MYFUNGIBLE-0001": "100,000,000,000",
                    },
                    "storage": {
                        "str:storage-key-1": "-5",
                        "str:storage-key-2|u32:4": "*",
                        "+": ""
                    },
                    "code": "file:smart-contract.wasm"
                }
            }
        }
    ]
```

Fields:

- `comment` (optional) - doesn't affect execution
- accounts - a map from account address to expected account state. It also accepts the optional entry `"+": ""`, which indicates that there can be other accounts in the blockchain mock that are not mentioned here. Without this field, unexpected account will cause an error. Each account state has the following fields:
  - `nonce` - either expected nonce value, or `"*"` to skip check
  - `balance` - either expected EGLD balance, or `"*" `to skip check
  - `esdt` - either a list of token values, or `"*"` to skip check entirely.
    - Note: by default no other tokens than the ones specified are allowed. To allow more tokens than the ones specified, add a `"+": ""` entry.
  - `username` - either expected user name value, or `"*"` to skip check
  - `storage` all key-value pairs must match, or `"*"` to skip check entirely.
    - Note: by default no other entries than the ones specified are allowed. To allow more storage entries than the ones specified, add a `"+": ""` entry.
  - `code` - expected smart contract code, or `"*"` to skip check
  - `asyncCallData` - this field is set by asynchronous calls and when contracts send funds to an account

## **Step type: `dumpState`**

Simply prints the entire state of the blockchain mock to the console.

```
{
    "step": "dumpState",
    "comment": "print everything to console"
}
```

## **Step type: `scCall`**

```
{
    "steps": [
        {
            "step": "scCall",
            "txId": "tx-name-or-id",
            "comment": "just an example",
            "tx": {
                "from": "address:sender",
                "to": "sc:contract",
                "egldValue": "0",
                "esdtValue": [
                    {
                        "tokenIdentifier": "str:MYFUNGIBLE-000001",
                        "value": "250,000,000,000"
                    },
                    {
                        "tokenIdentifier": "str:MYSFT-123456",
                        "nonce": "24",
                        "value": "1"
                    }
                ]
                "function": "contractEndpoint",
                "arguments": [
                    "str:argument-1",
                    "1234",
                    "",
                    "str:a message (as bytes)"
                ],
                "gasLimit": "5,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [
                    "5",
                    "*"
                ],
                "status": "",
                "logs": [
                    {
                        "address": "sc:contract",
                        "endpoint": "str:contractEndpoint",
                        "topics": [
                            "str:topic-1",
                            "str:topic-2"
                        ],
                        "data": "str:log-value"
                    }
                ],
                "gas": "*",
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
  - `egldValue` - how much EGLD to transfer as part of the call. Only payable functions will accept this kind of payment.
  - `esdtValue` - a list of ESDT tokens to transfer as part of the call. Cannot transfer both EGLD and ESDT at the same time. Each transferred item has the following fields:
    - `tokenIdentifier` - the ESDT token unique identifier
    - `nonce` - NFT/SFT token nonce. For fungible tokens the nonce is 0 and this field can be omitted.
    - `value` - amount to transfer
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
            "txId": "query-id",
            "comment": "query comment",
            "tx": {
                "to": "sc:contract",
                "function": "contractView",
                "arguments": [
                    "str:argument-1",
                    "1234",
                    "",
                    "str:a message (as bytes)"
                ],
            },
            "expect": {
                "out": [
                    "5",
                    "*"
                ],
                "status": ""
            }
        }
    ]
}
```

This step simulates a VM query from outside the blockchain. It is very similar to a `scCall`, with a few differences:
- There is no sender. Being an off-chain query, there is no actual transaction happening, so the idea of sender is immaterial. In practice, just like on the real blockchain, the sender is made equal to the contract address, so it's as if the contract is calling itself.
- Gas is irrelevant. No gas is consumed off-chain.
- None of the changes (if any) are persisted. Despite this, it is considered bad practice to query endpoints that are not readonly.
- Cannot transfer tokens in a query (neither EGLD nor ESDT).
- Querying does not increase any account nonce.

Fields:

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
                "from": "address:deployer",
                "value": "123,000",
                "contractCode": "str:new contract code here",
                "arguments": [
                    "str:init-arg-1",
                    "100",
                    "",
                    "str:a message (as bytes)"
                ],
                "gasLimit": "5,000,000",
                "gasPrice": "0"
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
  - `from`, `value`, `arguments`, `gasLimit`, `gasPrice` - same as for `scCall`
- `expect` (optional) - same as for `scCall`

Please note: cannot transfer ESDT during contract deploy. If you need to feed ESDTs to a contract when deploying, send them with a `scCall` immediately after deploy.


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
                "from": "address:sender",
                "to": "address:receiver",
                "egldValue": "0",
                "esdtValue": [
                    {
                        "tokenIdentifier": "str:MYFUNGIBLE-000001",
                        "value": "250,000,000,000"
                    },
                    {
                        "tokenIdentifier": "str:MYSFT-123456",
                        "nonce": "24",
                        "value": "1"
                    }
                ]
            }
        }
    ]
}
```

The fields are:

- `txId` (optional) - same as `scCall`/`scDeploy`
- `comment` (optional) - same as `scCall`/`scDeploy`
- `tx`
  - `from` - same as `scCall`/`scDeploy`
  - `to` - same as `scCall`
  - `egldValue` - EGLD value
  - `esdtValue` - same as `scCall`



## **Step type: `validatorReward`**

Lesser used step type. Simulates a validator reward being sent by the protocol. This transaction has no sender, and beside increasing the recipient balance, it also increments the `ELRONDrewards` field in the smart contract storage. Useful when building delegation or other staking contracts.

```
{
    "steps": [
        {
            "step": "validatorReward",
            "txId": "4",
            "comment": "system send out validator rewards",
            "tx": {
                "to": "sc:delegation_contract",
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
