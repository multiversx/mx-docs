---
id: crowdfunding-p2
title: The Crowdfunding Smart Contract (part 2)
---
[comment]: # (mx-abstract)
Define contract arguments, handle storage, process payments, define new types, write better tests

[comment]: # (mx-context-auto)

# **Configuring the contract**

The previous chapter left us with a minimal contract as a starting point.

The first thing we need to do is to configure the desired target amount and the deadline. The deadline will be expressed as the block timestamp after which the contract can no longer be funded. We will be adding 2 more storage fields and arguments to the constructor.

```rust
  #[view(getTarget)]
  #[storage_mapper("target")]
  fn target(&self) -> SingleValueMapper<BigUint>;

  #[view(getDeadline)]
  #[storage_mapper("deadline")]
  fn deadline(&self) -> SingleValueMapper<u64>;

  #[view(getDeposit)]
  #[storage_mapper("deposit")]
  fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

  #[init]
  fn init(&self, target: BigUint, deadline: u64) {
      self.target().set(&target);
      self.deadline().set(&deadline);
  }
```

The deadline being a block timestamp can be expressed as a regular 64-bits unsigned int. The target, however, being a sum of EGLD cannot. Note that 1 EGLD = 10^18 EGLD-wei (also known as atto-EGLD), the smallest unit of currency, and all payments are expressed in wei. So you can see that even for small payments the numbers get large. Luckily, the framework offers support for big numbers out of the box. Two types are available: BigUint and BigInt.

Try to avoid the signed version as much as possible (unless negative values are really possible and needed). There are some caveats with BigInt argument serialization that can lead to subtle bugs.

Also note that BigUint logic does not reside in the contract, but is built into the MultiversX VM API, to not bloat the contract code.

Let's test that initialization works.

```json,file=crowdfunding-init.scen.json
{
    "name": "crowdfunding deployment test",
    "steps": [
        {
            "step": "setState",
            "accounts": {
                "address:my_address": {
                    "nonce": "0",
                    "balance": "1,000,000"
                }
            },
            "newAddresses": [
                {
                    "creatorAddress": "address:my_address",
                    "creatorNonce": "0",
                    "newAddress": "sc:crowdfunding"
                }
            ]
        },
        {
            "step": "scDeploy",
            "txId": "deploy",
            "tx": {
                "from": "address:my_address",
                "contractCode": "file:../output/crowdfunding.wasm",
                "arguments": [
                    "500,000,000,000",
                    "123,000"
                ],
                "gasLimit": "5,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [],
                "status": "0",
                "gas": "*",
                "refund": "*"
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "address:my_address": {
                    "nonce": "1",
                    "balance": "1,000,000",
                    "storage": {}
                },
                "sc:crowdfunding": {
                    "nonce": "0",
                    "balance": "0",
                    "storage": {
                        "str:target": "500,000,000,000",
                        "str:deadline": "123,000"
                    },
                    "code": "file:../output/crowdfunding.wasm"
                }
            }
        }
    ]
}
```

Note the added `"arguments"` field in `scDeploy` and the added fields in storage.

Run the following commands:

```python
mxpy contract build
mxpy contract test
```

You should once again see this:

```python
Scenario: crowdfunding-init.scen.json ...   ok
Done. Passed: 1. Failed: 0. Skipped: 0.
SUCCESS
```

[comment]: # (mx-context-auto)

## **Funding the contract**

It is not enough to receive the funds, the contract also needs to keep track of who donated how much.

```rust
    #[view(getDeposit)]
    #[storage_mapper("deposit")]
    fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;

    #[endpoint]
    #[payable("EGLD")]
    fn fund(&self) {
        let payment = self.call_value().egld_value();
        let caller = self.blockchain().get_caller();
        self.deposit(&caller).update(|deposit| *deposit += &*payment);
    }
```

A few things to unpack:

1. This storage mapper has an extra argument, for an address. This is how we define a map in the storage. The donor argument will become part of the storage key. Any number of such key arguments can be added, but in this case we only need one. The resulting storage key will be a concatenation of the specified base key `"deposit"` and the serialized argument.
2. We encounter the first payable function. By default, any function in a smart contract is not payable, i.e. sending a sum of EGLD to the contract using the function will cause the transaction to be rejected. Payable functions need to be annotated with #[payable].
3. fund needs to also be explicitly declared as an endpoint. All `#[payable]`methods need to be marked `#[endpoint]`, but not the other way around.

To test the function, we'll add a new test file, in the same `scenarios` folder. Let's call it `crowdfunding-fund.scen.json` .

To avoid duplicating the deployment code, we import it from `crowdfunding-init.scen.json` .

```json,file=crowdfunding-fund.scen.json
{
    "name": "crowdfunding funding",
    "steps": [
        {
            "step": "externalSteps",
            "path": "crowdfunding-init.scen.json"
        },
        {
            "step": "setState",
            "accounts": {
                "address:donor1": {
                    "nonce": "0",
                    "balance": "400,000,000,000"
                }
            }
        },
        {
            "step": "scCall",
            "txId": "fund-1",
            "tx": {
                "from": "address:donor1",
                "to": "sc:crowdfunding",
                "egldValue": "250,000,000,000",
                "function": "fund",
                "arguments": [],
                "gasLimit": "100,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [],
                "status": "",
                "gas": "*",
                "refund": "*"
            }
        },
        {
            "step": "checkState",
            "accounts": {
                "address:my_address": {
                    "nonce": "1",
                    "balance": "1,000,000",
                    "storage": {}
                },
                "address:donor1": {
                    "nonce": "1",
                    "balance": "150,000,000,000",
                    "storage": {}
                },
                "sc:crowdfunding": {
                    "nonce": "0",
                    "balance": "250,000,000,000",
                    "storage": {
                        "str:target": "500,000,000,000",
                        "str:deadline": "123,000",
                        "str:deposit|address:donor1": "250,000,000,000"
                    },
                    "code": "file:../output/crowdfunding.wasm"
                }
            }
        }
    ]
}
```

Explanation:

1. `"externalSteps"`allows us to import steps from another json file. This is very handy, because we can write test scenarios that branch out from each other without having to duplicate code. Here we will be reusing the deployment steps in all tests. These imported steps get executed again each time they are imported.
2. We need a donor, so we add another account using a new `"setState"` step.
3. The actual simulated transaction. Note that we use `"scCall"` instead of `"scDeploy"`. There is a `"to"` field, and no `"contractCode"`. The rest functions the same. The `"egldValue"` field indicates the amount paid to the function.
4. When checking the state, we have a new user, we see that the donor's balance is decreased by the amount paid, and the contract balance increased by the same amount.
5. There is another entry in the contract storage. The pipe symbol`|`in the key means concatenation. The addresses are serialized as itself, and we can represent it in the same readable format.

Test it by running the commands again:

```python
mxpy contract build
mxpy contract test
```

You should then see that both tests pass:

```python
Scenario: crowdfunding-fund.scen.json ...   ok
Scenario: crowdfunding-init.scen.json ...   ok
Done. Passed: 2. Failed: 0. Skipped: 0.
SUCCESS
```

[comment]: # (mx-context-auto)

## **Validation**

It doesn't make sense to fund after the deadline has passed, so fund transactions after a certain block timestamp must be rejected. The idiomatic way to do this is:

```rust
    #[endpoint]
    #[payable("EGLD")]
    fn fund(&self) {
        let payment = self.call_value().egld_value();

        let current_time = self.blockchain().get_block_timestamp();
        require!(current_time < self.deadline().get(), "cannot fund after deadline");

        let caller = self.blockchain().get_caller();
        self.deposit(&caller).update(|deposit| *deposit += &*payment);
    }
```

:::tip
`require!(expression, error_msg)` is the same as `if !expression { sc_panic!(error_msg) }`

`sc_panic!("message")` works similarly to the standard `panic!`, but works better in a smart contract context and is more efficient. The regular `panic!` is allowed too, but it might bloat your code, and you won't see the error message.
:::

We'll create another test file to verify that the validation works: `test-fund-too-late.scen.json` .

```json,file=crowdfunding-fund-too-late.scen.json
{
    "name": "trying to fund one block too late",
    "steps": [
        {
            "step": "externalSteps",
            "path": "crowdfunding-fund.scen.json"
        },
        {
            "step": "setState",
            "currentBlockInfo": {
                "blockTimestamp": "123,001"
            }
        },
        {
            "step": "scCall",
            "txId": "fund-too-late",
            "tx": {
                "from": "address:donor1",
                "to": "sc:crowdfunding",
                "egldValue": "10,000,000,000",
                "function": "fund",
                "arguments": [],
                "gasLimit": "100,000,000",
                "gasPrice": "0"
            },
            "expect": {
                "out": [],
                "status": "4",
                "message": "str:cannot fund after deadline",
                "gas": "*",
                "refund": "*"
            }
        }
    ]
}
```

We branch this time from `crowdfunding-fund.scen.json`, where we already had a donor. Now the same donor wants to donate, again, but in the meantime the current block timestamp has become 123,001, one block later than the deadline. The transaction fails with status 4 (user error - all errors from within the contract will return this status). The testing environment allows us to also check that the correct message was returned.

By building and testing the contract again, you should see that all three tests pass:

```python
Scenario: crowdfunding-fund-too-late.scen.json ...   ok
Scenario: crowdfunding-fund.scen.json ...   ok
Scenario: crowdfunding-init.scen.json ...   ok
Done. Passed: 3. Failed: 0. Skipped: 0.
SUCCESS
```

[comment]: # (mx-context-auto)

## **Querying for the contract status**

The contract status can be known by anyone by looking into the storage and on the blockchain, but it is really inconvenient right now. Let's create an endpoint that gives this status directly. The status will be one of: `FundingPeriod`, `Successful` or `Failed`. We could use a number to represent it in code, but the nice way to do it is with an enum. We will take this opportunity to show how to create a serializable type that can be taken as argument, returned as result or saved in storage.

This is the enum:

```rust
#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Clone, Copy)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}
```

Make sure to add it outside the contract trait.
Don't forget to add the import for the derive types. This can be place on top off the file next to the other import.

```rust
multiversx_sc::derive_imports!();
```
The `#[derive]` keyword in Rust allows you to automatically implement certain traits for your type. `TopEncode` and `TopDecode` mean that objects of this type are serializable, which means they can be interpreted from/to a string of bytes.

`TypeAbi` is needed to export the type when you want to interact with the already deployed contract. This is out of scope of this tutorial though.

`PartialEq`, `Clone` and `Copy` are Rust traits that allow your type instances to be compared with the `==` operator, and the `Clone` and `Copy` traits allow your object instances to be clone/copied respectively.

We can now use the type Status just like we use the other types, so we can write the following method in the contract trait:

```rust
  #[view]
  fn status(&self) -> Status {
      if self.blockchain().get_block_timestamp() <= self.deadline().get() {
          Status::FundingPeriod
      } else if self.get_current_funds() >= self.target().get() {
          Status::Successful
      } else {
          Status::Failed
      }
  }

  #[view(getCurrentFunds)]
  fn get_current_funds(&self) -> BigUint {
      self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
  }
```

To test this method, we append one more step to the last test we worked on, `test-fund-too-late.scen.json` :

```json
{
  "name": "trying to fund one block too late",
  "steps": [
    {
      "step": "externalSteps",
      "path": "crowdfunding-fund.scen.json"
    },
    {
      "step": "setState",
      "currentBlockInfo": {
        "blockTimestamp": "123,001"
      }
    },
    {
      "step": "scCall",
      "txId": "fund-too-late",
      "tx": {
        "from": "address:donor1",
        "to": "sc:crowdfunding",
        "egldValue": "10,000,000,000",
        "function": "fund",
        "arguments": [],
        "gasLimit": "100,000,000",
        "gasPrice": "0"
      },
      "expect": {
        "out": [],
        "status": "4",
        "message": "str:cannot fund after deadline",
        "gas": "*",
        "refund": "*"
      }
    },
    {
      "step": "scQuery",
      "txId": "check-status",
      "tx": {
        "to": "sc:crowdfunding",
        "function": "status",
        "arguments": []
      },
      "expect": {
        "out": ["2"],
        "status": "0"
      }
    }
  ]
}
```

Since the function we're trying to call is a view function, we use the `scQuery` step instead of the `scCall` step. The difference is that for `scQuery`, there is no `caller`, no payment, and gas price/gas limit. On the real blockchain, a smart contract query does not create a transaction on the blockchain, so no account is needed. `scQuery` simulates this exact behaviour.

Note the call to "status" at the end and the result `"out": [ "2" ]` , which is the encoding for `Status::Failure`. Enums are encoded as an index of their values. In this example, `Status::FundingPeriod` is `"0"` (or `""`), `Status::Successful` is `"1"` and, as you've already seen, `Status::Failure` is `"2"`.

Contract functions can return in principle any number of results, that is why `"out"` is a list.

[comment]: # (mx-context-auto)

## **Claim functionality**

Finally, let's add the `claim` method. The `status` method we just implemented helps us keep the code tidy:

```rust
    #[endpoint]
    fn claim(&self) {
        match self.status() {
            Status::FundingPeriod => sc_panic!("cannot claim before deadline"),
            Status::Successful => {
                let caller = self.blockchain().get_caller();
                require!(
                    caller == self.blockchain().get_owner_address(),
                    "only owner can claim successful funding"
                );

                let sc_balance = self.get_current_funds();
                self.send().direct_egld(&caller, &sc_balance);
            },
            Status::Failed => {
                let caller = self.blockchain().get_caller();
                let deposit = self.deposit(&caller).get();

                if deposit > 0u32 {
                    self.deposit(&caller).clear();
                    self.send().direct_egld(&caller, &deposit);
                }
            },
        }
    }
```

The only new function here is `self.send().direct_egld()`, which simply forwards EGLD from the contract to the given address.

[comment]: # (mx-context-auto)

## **The final contract code**

If you followed all the steps presented until now, you should have ended up with a contract that looks something like:

```rust,file=final.rs
#![no_std]

multiversx_sc::imports!();
multiversx_sc::derive_imports!();

#[derive(TopEncode, TopDecode, TypeAbi, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}

#[multiversx_sc::contract]
pub trait Crowdfunding {
    #[init]
    fn init(&self, target: BigUint, deadline: u64) {
        require!(target > 0, "Target must be more than 0");
        self.target().set(target);

        require!(
            deadline > self.get_current_time(),
            "Deadline can't be in the past"
        );
        self.deadline().set(deadline);
    }

    #[endpoint]
    #[payable("EGLD")]
    fn fund(&self) {
        let payment = self.call_value().egld_value();

        require!(
            self.status() == Status::FundingPeriod,
            "cannot fund after deadline"
        );

        let caller = self.blockchain().get_caller();
        self.deposit(&caller).update(|deposit| *deposit +=  &*payment);
    }

    #[view]
    fn status(&self) -> Status {
        if self.get_current_time() <= self.deadline().get() {
            Status::FundingPeriod
        } else if self.get_current_funds() >= self.target().get() {
            Status::Successful
        } else {
            Status::Failed
        }
    }

    #[view(getCurrentFunds)]
    fn get_current_funds(&self) -> BigUint {
        self.blockchain().get_sc_balance(&EgldOrEsdtTokenIdentifier::egld(), 0)
    }

    #[endpoint]
    fn claim(&self) {
        match self.status() {
            Status::FundingPeriod => sc_panic!("cannot claim before deadline"),
            Status::Successful => {
                let caller = self.blockchain().get_caller();
                require!(
                    caller == self.blockchain().get_owner_address(),
                    "only owner can claim successful funding"
                );

                let sc_balance = self.get_current_funds();
                self.send().direct_egld(&caller, &sc_balance);
            },
            Status::Failed => {
                let caller = self.blockchain().get_caller();
                let deposit = self.deposit(&caller).get();

                if deposit > 0u32 {
                    self.deposit(&caller).clear();
                    self.send().direct_egld(&caller, &deposit);
                }
            },
        }
    }

    // private

    fn get_current_time(&self) -> u64 {
        self.blockchain().get_block_timestamp()
    }

    // storage

    #[view(getTarget)]
    #[storage_mapper("target")]
    fn target(&self) -> SingleValueMapper<BigUint>;

    #[view(getDeadline)]
    #[storage_mapper("deadline")]
    fn deadline(&self) -> SingleValueMapper<u64>;

    #[view(getDeposit)]
    #[storage_mapper("deposit")]
    fn deposit(&self, donor: &ManagedAddress) -> SingleValueMapper<BigUint>;
}
```

As an exercise, try to add some more tests, especially ones involving the claim function.

[comment]: # (mx-context-auto)

## **Next steps**

This concludes the first Rust multiversx-sc tutorial.

For more detailed documentation, visit [https://docs.rs/multiversx-sc/0.39.0/multiversx_sc/](https://docs.rs/multiversx-sc/0.39.0/multiversx_sc/)

If you want to see some other smart contract examples, or even an extended version of the crowdfunding smart contract, you can check here: https://github.com/multiversx/mx-sdk-rs/tree/v0.39.0/contracts/examples

:::tip
When entering directly on the `multiversx-sc` repository on GitHub, you will first see the `master` branch. While this is at all times the latest version of the contracts, they might sometimes rely on unreleased features and therefore not compile outside of the repository. Getting the examples from the last released version is, however, always safe.
:::
