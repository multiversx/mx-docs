# The Crowdfunding Smart Contract (part 2)

Define contract arguments, handle storage, process payments, define new types, write better tests

# **Configuring the contract** 

The previous chapter left us with a minimal contract as a starting point.

The first thing we need to do is to configure the desired target amount and the deadline. The deadline will be expressed as the block nonce after which the contract can no longer be funded. We will be adding 2 more storage fields and arguments to the constructor.



```
    #[storage_set("target")]
    fn set_target(&self, target: &BigUint);

    #[view]
    #[storage_get("target")]
    fn get_target(&self) -> BigUint;

    #[storage_set("deadline")]
    fn set_deadline(&self, deadline: u64);

    #[view]
    #[storage_get("deadline")]
    fn get_deadline(&self) -> u64;

    #[init]
    fn init(&self, target: &BigUint, deadline: u64) {
        let my_address: Address = self.get_caller();
        self.set_owner(&my_address);
        self.set_target(target);
        self.set_deadline(deadline);
    }
```

The deadline being a block nonce can be expressed as a regular 64-bits unsigned int. The target, however, being a sum of ERD cannot. Note that 1 ERD = 10^18 ERD wei, the smallest unit of currency, and all payments are expressed in wei. So you can see that even for small payments the numbers get large. Luckily, the framework offers support for big numbers out of the box. Two types are available: BigUint and BigInt.

Try to avoid the signed version as much as possible (unless negative values are really possible and needed). There are some caveats with BigInt argument serialization that can lead to subtle bugs.

Also note that BigUint logic does not reside in the contract, but is built into Arwen's API, so as to not bloat the contract code.

Let's test that initialization works.



```
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
            "newAddress": "address:the_crowdfunding_contract"
          }
        ]
      },
      {
        "step": "scDeploy",
        "tx": {
          "from": "address:my_address",
          "contractCode": "file:../output/crowdfunding.wasm",
          "value": "0",
          "arguments": [
              "500,000,000,000",
              "123,000"
          ],
          "gasLimit": "1,000,000",
          "gasPrice": "0"
        },
        "expect": {
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
            "balance": "1,000,000"
          },
          "address:the_crowdfunding_contract": {
            "nonce": "0",
            "balance": "0",
            "storage": {
              "''owner": "address:my_address",
              "''target": "500,000,000,000",
              "''deadline": "123,000"
            },
            "code": "file:../output/crowdfunding.wasm"
          }
        }
      }
    ]
  }
```

Note the added `"arguments"`field in `scDeploy` and the added fields in storage.

Run the following commands:



```
erdpy contract build
erdpy contract test
```

You should once again see this:



```
Scenario: test-init.scen.json ...   ok
Done. Passed: 1. Failed: 0. Skipped: 0.
SUCCESS
```

# **Funding the contract**

It is not enough to receive the funds, the contract also needs to keep track of who donated how much.



```
    #[storage_set("deposit")]
    fn set_deposit(&self, donor: &Address, amount: &BigUint);

    #[view]
    #[storage_get("deposit")]
    fn get_deposit(&self, donor: &Address) -> BigUint;

    #[payable]
    #[endpoint]
    fn fund(&self, #[payment] payment: &BigUint) {
        let caller = self.get_caller();
        let mut deposit = self.get_deposit(&caller);
        deposit += payment;
        self.set_deposit(&caller, &deposit);
    }
```

A few things to unpack:

1. This getter and setter both have an extra argument, for both an address. This is how we define a map in the storage. The donor argument will become part of the storage key. Any number of such key arguments can be added, but in this case we only need one. The resulting storage key will be a concatenation of the specified base key `"deposit"` and the serialized argument.
2. We encounter the first payable function. By default, any function in a smart contract is not payable, i.e. sending a sum of ERD to the contract using the function will cause the transaction to be rejected. Payable functions need to be annotated with #[payable]. Notice the `#[payment] payment: &BigUint` argument. This is not a real argument, but just syntactic sugar to pass the payed sum to the function.
3. fund needs to also be explicitly declared as an endpoint. All `#[payable]`methods need to be marked `#[endpoint]`, but not the other way around.

To test the function, we'll add a new test file, in the same `mandos` folder. Let's call it `test-fund.scen.json` .

To avoid duplicating the deployment code, we import it from `test-init.scen.json` .



```
{
  "name": "crowdfunding funding",
  "steps": [
    {
      "step": "externalSteps",
      "path": "test-init.scen.json"
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
          "to": "address:the_crowdfunding_contract",
          "value": "250,000,000,000",
          "function": "fund",
          "arguments": [],
          "gasLimit": "100,000,000",
          "gasPrice": "0"
      },
      "expect": {
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
          "balance": "1,000,000"
        },
        "address:donor1": {
          "nonce": "1",
          "balance": "150,000,000,000"
        },
        "address:the_crowdfunding_contract": {
          "nonce": "0",
          "balance": "250,000,000,000",
          "storage": {
            "''owner": "address:my_address",
            "''target": "500,000,000,000",
            "''deadline": "123,000",
            "''deposit|address:donor1": "250,000,000,000"
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
3. The actual simulated transaction. Note that we use `"scCall"` instead of `"scDeploy"`. There is a `"to"` field, and no `"contractCode"`. The rest functions the same. The `"value"` field indicates the amount payed to the function.
4. When checking the state, we have a new user, we see that the donor's balance is decreased by the amount payed, and the contract balance increased by the same amount.
5. There is another entry in the contract storage. The pipe symbol`|`in the key means concatenation. The addresses is serialized as itself, and we can represent it in the same readable format.

Test it by running the commands again:



```
erdpy contract build
erdpy contract test
```

You should then see that both tests pass:



```
Scenario: test-fund.scen.json ...   ok
Scenario: test-init.scen.json ...   ok
Done. Passed: 2. Failed: 0. Skipped: 0.
SUCCESS
```

# **Validation**

It doesn't make sense  to fund after the deadline has passed, so fund transactions after a certain block nonce must be rejected. The idiomatic way to do this is:



```
    #[payable]
    #[endpoint]
    fn fund(&self, #[payment] payment: &BigUint) -> SCResult<()> {
        if self.get_block_nonce() > self.get_deadline() {
            return sc_error!("cannot fund after deadline");
        }
        let caller = self.get_caller();
        let mut deposit = self.get_deposit(&caller);
        deposit += payment;
        self.set_deposit(&caller, &deposit);
        Ok(())
    }
```

`SCResult<T>` is a type specific to elrond-wasm that can contain either a result, or an error. It is the smart contract equivalent of Rust's `Result<T, E>`. In principle the type parameter can be almost anything (more on that later). However, we don't need to return anything here in case of success, so we uset he unit type`()` , which doesn't contain any data.

To return the error version of the SCResult, the easiest way is to use the macro `sc_error!` In case of success, we must explicitly return  an `Ok(...)` expression.



`sc_error!("message")` is just syntactic sugar for `SCResult::Err(SCError::Static(b"message"[..]))`. Only static messages for now, some error formatting is on our to-do list.

Note: `panic!` works in contracts, but it is highly discouraged.

We'll create another test file to verify that the validation works: `test-fund-too-late.scen.json` .



```
{
  "name": "trying to fund one block too late",
  "steps": [
    {
      "step": "externalSteps",
      "path": "test-fund.scen.json"
    },
    {
      "step": "setState",
      "currentBlockInfo": {
          "blockNonce": "123,001"
      }
    },
    {
      "step": "scCall",
      "txId": "fund-too-late",
      "tx": {
          "from": "address:donor1",
          "to": "address:the_crowdfunding_contract",
          "value": "10,000,000,000",
          "function": "fund",
          "arguments": [],
          "gasLimit": "100,000,000",
          "gasPrice": "0"
      },
      "expect": {
          "status": "4",
          "message": "str:cannot fund after deadline",
          "gas": "*",
          "refund": "*"
      }
    }
  ]
}
```

We branch this time from `test-fund.scen.json`, where we already had a donor. Now the same donor wants to donate, again, but in the mean time the current block nonce has become 123,001, one block nonce later than the deadline. The transaction fails with status 4 (user error - all errors from within the contract will return this status). The testing framework allows us to also check that the correct message was returned.

By building and testing the contract again, you should see that all three tests pass:



```
Scenario: test-fund-too-late.scen.json ...   ok
Scenario: test-fund.scen.json ...   ok
Scenario: test-init.scen.json ...   ok
Done. Passed: 3. Failed: 0. Skipped: 0.
SUCCESS
```

# **Querying for the contract status**

The contract status can be known by anyone by looking into the storage and on the blockchain, but it is really inconvenient right now. Let's create an endpoint that gives this status directly. The status will be one of: `FundingPeriod`, `Successful` or `Failed`. We could use a number to represent it in code, but the nice way to do it is with an enum. We will take this opportunity to show how to create a serializable type that can be taken as argument, returned as result or saved in storage.

This is the enum:



```
#[derive(PartialEq, Clone, Copy)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed
}
```

Make sure to add it outside the contract trait.

Making it serializable will be as simple as replacing the first line with #[derive(Encode, Decode, PartialEq, Clone, Copy)]  but this is work in progress, until then it has to be done manually. Just paste the bit below at the end of `lib.rs`: 



```
use elrond_wasm::elrond_codec::*;

impl Status {
    pub fn to_u8(&self) -> u8 {
        match self {
            Status::FundingPeriod => 0,
            Status::Successful => 1,
            Status::Failed => 2,
        }
    }

    fn from_u8(v: u8) -> Result<Self, DecodeError> {
        match v {
            0 => core::result::Result::Ok(Status::FundingPeriod),
            1 => core::result::Result::Ok(Status::Successful),
            2 => core::result::Result::Ok(Status::Failed),
            _ => core::result::Result::Err(DecodeError::InvalidValue),
        }
    }
}

impl Encode for Status {
	fn dep_encode_to<O: Output>(&self, dest: &mut O) -> Result<(), EncodeError> {
        self.to_u8().dep_encode_to(dest)
	}
}

impl Decode for Status {
	fn dep_decode<I: Input>(input: &mut I) -> Result<Self, DecodeError> {
        Status::from_u8(u8::dep_decode(input)?)
    }
}

```

We can now use the type Status just like we use the other types, so we can write the following method in the contract trait:



```
    #[view]    
    fn status(&self) -> Status {
        if self.get_block_nonce() <= self.get_deadline() {
            Status::FundingPeriod
        } else if self.get_sc_balance() >= self.get_target() {
            Status::Successful
        } else {
            Status::Failed
        }
    }
```

To test this method, we append one more step to the last test we worked on, `test-fund-too-late.scen.json` :



```
{
  "name": "trying to fund one block too late",
  "steps": [
    {
      "step": "externalSteps",
      "path": "test-fund.scen.json"
    },
    {
      "step": "setState",
      "currentBlockInfo": {
          "blockNonce": "123,001"
      }
    },
    {
      "step": "scCall",
      "txId": "fund-too-late",
      "tx": {
          "from": "address:donor1",
          "to": "address:the_crowdfunding_contract",
          "value": "10,000,000,000",
          "function": "fund",
          "arguments": [],
          "gasLimit": "100,000,000",
          "gasPrice": "0"
      },
      "expect": {
          "status": "4",
          "message": "str:cannot fund after deadline",
          "gas": "*",
          "refund": "*"
      }
    },
    {
      "step": "checkState",
      "accounts": {
        "address:my_address": {
          "nonce": "1",
          "balance": "1,000,000"
        },
        "address:donor1": {
          "nonce": "*",
          "balance": "150,000,000,000"
        },
        "address:the_crowdfunding_contract": {
          "nonce": "0",
          "balance": "250,000,000,000",
          "storage": {
            "''owner": "address:my_address",
            "''target": "500,000,000,000",
            "''deadline": "123,000",
            "''deposit|address:donor1": "250,000,000,000"
          },
          "code": "file:../output/crowdfunding.wasm"
        }
      }
    },
    {
      "step": "scCall",
      "txId": "check-status",
      "tx": {
          "from": "address:donor1",
          "to": "address:the_crowdfunding_contract",
          "value": "0",
          "function": "status",
          "arguments": [],
          "gasLimit": "100,000,000",
          "gasPrice": "0"
      },
      "expect": {
          "out": [ "2" ],
          "status": "0",
          "gas": "*",
          "refund": "*"
      }
    }
  ]
}
```

Note the call to "status" at the end and the result `"out": [ "2" ]` , which is the encoding for `Status::Failure`. Contract functions can return in principle any number of results, that is why `"out"` is a list.

# **Claim functionality**

Finally, let's add the `claim` method. The `status` method we just implemented helps us keep the code tidy:



```
    #[endpoint]
    fn claim(&self) -> SCResult<()> {
        match self.status() {
            Status::FundingPeriod => {
                sc_error!("cannot claim before deadline")
            },
            Status::Successful => {
                let caller = self.get_caller();
                if &caller != &self.get_owner() {
                    return sc_error!("only owner can claim succesful funding");
                }
                self.send_tx(&caller, &self.get_sc_balance(), "funding success");
                Ok(())
            },
            Status::Failed => {
                let caller = self.get_caller();
                let deposit = self.get_deposit(&caller);
                if &deposit > &0 {
                    self.send_tx(&caller, &deposit, "reclaim failed funding");
                    self.set_deposit(&caller, &BigUint::zero());
                }
                Ok(())
            },
        }
    }
```

The only new function here is `send_tx`, which simply forwards funds from the contract to the given address. The last argument is a message that gets saved on the blockchain too with the transaction.

# **The final contract code**

If you followed all the steps presented until now, you should have ended up with a contract that looks something like:



```
#![no_std]

imports!();

#[elrond_wasm_derive::contract(CrowdfundingImpl)]
pub trait Crowdfunding {

    #[storage_set("owner")]
    fn set_owner(&self, address: &Address);

    #[view]
    #[storage_get("owner")]
    fn get_owner(&self) -> Address;

    #[storage_set("target")]
    fn set_target(&self, target: &BigUint);

    #[view]
    #[storage_get("target")]
    fn get_target(&self) -> BigUint;

    #[storage_set("deadline")]
    fn set_deadline(&self, deadline: u64);

    #[view]
    #[storage_get("deadline")]
    fn get_deadline(&self) -> u64;

    #[storage_set("deposit")]
    fn set_deposit(&self, donor: &Address, amount: &BigUint);

    #[view]
    #[storage_get("deposit")]
    fn get_deposit(&self, donor: &Address) -> BigUint;

    #[init]
    fn init(&self, target: &BigUint, deadline: u64) {
        let my_address: Address = self.get_caller();
        self.set_owner(&my_address);
        self.set_target(target);
        self.set_deadline(deadline);
    }

    #[payable]
    #[endpoint]
    fn fund(&self, #[payment] payment: &BigUint) -> SCResult<()> {
        if self.get_block_nonce() > self.get_deadline() {
            return sc_error!("cannot fund after deadline");
        }
        let caller = self.get_caller();
        let mut deposit = self.get_deposit(&caller);
        deposit += payment;
        self.set_deposit(&caller, &deposit);
        Ok(())
    }

    #[view]    
    fn status(&self) -> Status {
        if self.get_block_nonce() <= self.get_deadline() {
            Status::FundingPeriod
        } else if self.get_sc_balance() >= self.get_target() {
            Status::Successful
        } else {
            Status::Failed
        }
    }

    #[endpoint]
    fn claim(&self) -> SCResult<()> {
        match self.status() {
            Status::FundingPeriod => {
                sc_error!("cannot claim before deadline")
            },
            Status::Successful => {
                let caller = self.get_caller();
                if &caller != &self.get_owner() {
                    return sc_error!("only owner can claim succesful funding");
                }
                self.send_tx(&caller, &self.get_sc_balance(), "funding success");
                Ok(())
            },
            Status::Failed => {
                let caller = self.get_caller();
                let deposit = self.get_deposit(&caller);
                if &deposit > &0 {
                    self.send_tx(&caller, &deposit, "reclaim failed funding");
                    self.set_deposit(&caller, &BigUint::zero());
                }
                Ok(())
            },
        }
    }
}

#[derive(PartialEq, Clone, Copy)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed
}

use elrond_wasm::elrond_codec::*;

impl Status {
    pub fn to_u8(&self) -> u8 {
        match self {
            Status::FundingPeriod => 0,
            Status::Successful => 1,
            Status::Failed => 2,
        }
    }

    fn from_u8(v: u8) -> Result<Self, DecodeError> {
        match v {
            0 => core::result::Result::Ok(Status::FundingPeriod),
            1 => core::result::Result::Ok(Status::Successful),
            2 => core::result::Result::Ok(Status::Failed),
            _ => core::result::Result::Err(DecodeError::InvalidValue),
        }
    }
}

impl Encode for Status {
	fn dep_encode_to<O: Output>(&self, dest: &mut O) -> Result<(), EncodeError> {
        self.to_u8().dep_encode_to(dest)
	}
}

impl Decode for Status {
	fn dep_decode<I: Input>(input: &mut I) -> Result<Self, DecodeError> {
        Status::from_u8(u8::dep_decode(input)?)
    }
}

```

As an exercise, try to add some more tests, especially ones involving the claim function.

# **Next steps**

This concludes the first Rust elrond-wasm tutorial.

For more detailed documentation, visit [https://docs.rs/elrond-wasm/0.7.1/elrond_wasm/](https://docs.rs/elrond-wasm/0.7.1/elrond_wasm/index.html)

Coming soon:

- Writing the same crowdfunding contract with an ERC20-like token instead of ERD. This will provide the opportunity to explore asynchronous calls between contracts in different shards.
- Writing the same crowdfunding contract with an ESDT token.

[
  ](https://docs.elrond.com/developers/dev-tutorials/the-crowdfund-smartcontract)