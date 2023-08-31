---
id: sc-config
title: Configuration
---

[comment]: # (mx-abstract)

We like to say that developers don't write smart contracts directly, rather they write _specification_ for smart contracts, from which an automated process creates the smart contracts themselves.

This philosophy has two practical implications:
1. The smart contract code itself has no direct knowledge of the underlying technology or of blockchain, and can therefore be used to build other products too, like tests, interactors, services, etc.
2. The build process is its own separate thing, which needs to be configured.

It is also possible to build different variants of smart contracts from the same code base. These variants can contain only subsets of the endpoints available in code, or they might have different build settings and underlying API. We call this system "multi-contract", and it is explained in greater depth further on.

In order not to overburden the build CLI, the bulk of the build configuration resides in a configuration file in the contract crate root. This file must necessarily be called `multicontract.toml` at the present moment. There are plans to change this name to something more general, since its contents have become as of late broader in scope. 

---

[comment]: # (mx-context-auto)

## Single contract configuration

### Specification

Assume we want to build a single contract from the project, encompassing all of the available functionality. Let's look at all the ways in which we can configure it:

```toml
[settings]
main = "main"

[contracts.main]
name = "my-contract"
add-unlabelled = true
panic-message = true
ei = "1.3"
allocator = "leaking"
stack-size = "3 pages"
features = ["example_feature_1", "example_feature_2"]
kill-legacy-callback = true
```

The settings are as follows:
- `panic-message`
    - “Panic with message” is a feature very useful for debugging. It displays messages from regular Rust panics in a contract, at the cost of ~1.5kB of additional contract size. It is disabled by default, we advise against using it in production.
    - _values_: `true` | `false
    - _default_: `false`
- `ei`
    - Configures the post-processor that checks the environment interface (EI) used by the built smart contract.
    - The post-processor currently only emits a warning, but this might become a hard error in the future.
    - _values_:
        - `"1.3"` - the EI version that comes with VM 1.5, coming to mainnet in September 2023
        - `"1.2"` - the EI version that comes with VM 1.4, currently available on mainnet 
        - `"1.1"` - older version of the EI, here for historical reasons
        - `"1.0"` - older version of the EI, here for historical reasons
    - _default_: `"1.2"`
- `allocator`
    - Read about it in more detail [here](/developers/meta/sc-allocator).
    - In short: configures the heap memory allocator to be used inside the compiled contract. 
    - _values_:
        - `"fail"` - execution crashes when any allocation is attempted;
        - `"leaking"` - requests pages, allocates in them, but never frees up memory on the heap;
        - `"static64k"` - pre-allocated static 2-page buffer is used for the heap;
        - `"wee_alloc"` - the `wee_alloc` allocator is used, which must be imported separately to the wasm crate.
    - _default_: `"fail"`
- `stack-size`
    - Allows adjusting the amount of memory set aside for the stack, in a WebAssembly contract.
    - _values_:
        - either number of bytes, e.g. `655360`;
        - or the same number expressed as kilobytes with the suffix `k`, e.g. `"64k"`, `"128k"`, etc.;
        - or the same number expressed in 64k pages, with the suffix `pages`, e.g. `"1 pages"`, `"8 pages"`, etc.;
        - spaces are fine;
        - there are some restrictions on this number, it can't be arbitrarily small. We advise against anything less than a page.
    - _default_: `131072` or `"128k"`, the size of 2 pages of memory in WebAssembly.
- `features`
    - Smart contract crates can have feature flags for conditional compilation. These feature flags allow the possiblity of having differences between variants of the smart contract and the usage of the code in tools and off-chain projects.
    - How it works: the contract will be built with these feature flags activated.
    - _values_:
        - a list of feature flags, similar to `Cargo.toml`, e.g. `features = ["example_feature_1", "example_feature_2"]`
    - _default_: `[]`
- `kill-legacy-callback`
    - The framework has no way of knowing whether or not a certain smart contract variant actually needs the async callback code or not, so in rare situations it is necessary to forcefully remove it.
    - _values_: `true` | `false
    - _default_: `false`


---

[comment]: # (mx-context-auto)

### Default configuration

Just to clarify defaults once again, if there is no configuration file, all defaults will be taken. This is equivalent to the minimal file below:

```toml
[settings]
main = "main"

[contracts.main]
name = "my-contract"
add-unlabelled = true
```

It is also equivalent to this more verbose version:

```toml
[settings]
main = "main"

[contracts.main]
name = "my-contract"
add-unlabelled = true
panic-message = false
ei = "1.2"
allocator = "fail"
stack-size = "2 pages"
features = []
kill-legacy-callback = false
```


---

[comment]: # (mx-context-auto)

## Multi-contract configuration

[comment]: # (mx-context-auto)

### Introduction

Starting with version `0.37`, it is possible to configure a so-called "multi contract build".

Just as we defined a single output contract (or contract variant) in the examples above, it is possible to define any number of such outputs.

Currently the most popular use of having multiple contracts built from the same source is having _external view contracts_.

An external view contract is a contract that allows convenient reading from another contract's storage directly. Its purpose is to off-load some of the logic required for view functions from the main contract to a secondary one. This can in some cases decrease the main contract's size by many kilobytes of binary code.

We develop this in more depth [a little later on](#the-external-view-contract-explained), but let's start with an example.

We will use the multisig contract as an example. In this contract we have several endpoints that are never used on-chain: `getPendingActionFullInfo`, `userRole`, `getAllBoardMembers`, `getAllProposers`, `getActionData`, `getActionSigners`, `getActionSignerCount`, `getActionValidSignerCount`. We want to place these contracts in an external view contract.

In order to make configuration easier, we label them in code, as can be seen in the excerpt below:

```rust
#[multiversx_sc::module]
pub trait MultisigStateModule {
    // ...

    /// Serialized action data of an action with index.
    #[label("multisig-external-view")]
    #[view(getActionData)]
    fn get_action_data(&self, action_id: usize) -> Action<Self::Api> {
        // ...
    }

    /// Gets addresses of all users who signed an action.
    #[label("multisig-external-view")]
    #[view(getActionSigners)]
    fn get_action_signers(&self, action_id: usize) -> ManagedVec<ManagedAddress> {
        // ...
    }

    // ...
}

```

Labels don't do anything more than provide a handy way to refer to groups of endpoints in `multicontract.toml`.

Now for the `multicontract.toml` config itself, with explanations in comments:

```toml
[settings]
# one of the output contracts is considered "multisig-main"
# it can have any id
main = "multisig-main"

# contracts are identified by a contract id
# this id is only relevant in this file and in test setup
[contracts.multisig-main]
# the contract name is the important one,
# the output will be <contract-name>.wasm/<contract-name>.abi.json
name = "multisig"
# we can choose to add all unlabelled endpoints to a contract
add-unlabelled = true

# this is the external view contract, here we call it "view"
[contracts.view]
# the output will be multisig-view.wasm/multisig-view.abi.json
name = "multisig-view"
# this is how we signal that this contract will be built as an external view
external-view = true
# we only add the endpoints labelled "multisig-external-view", as in the code snippet above
# any number of labels can be added
add-labels = ["multisig-external-view"]

# this is how you get a version of the contract with all endpoints
# (main and external view, as defined above),
[contracts.full]
name = "multisig-full"
add-unlabelled = true
add-labels = ["multisig-external-view"]
```

[comment]: # (mx-context-auto)

### The external view contract explained

The main rationale for _external view contracts_. It is very common for contracts to have certain endpoints that are very useful for grabbing data off-chain, but are very rarely used on-chain, if ever. Their code is basically bloating the main contract, and the idea is to extract them into a separate contract. This second contract (called an "external view contract") works because contracts can read from the storage of other contracts directly.

The framework does the storage access rerouting automatically behind the scenes. The contract code cannot even tell the difference between a regular view from the same contract and one that has been relegated to an external view. Even more so, the same view endpoint can function both as external view and as regular view in different contract variants.

An _external view contract_ has a behavior different from that of a regular contract. The framework adds some logic to such a contract, which is invisible to the developer. There are two main points:

1. Storage access is different. All storage reads are done from the target contract given in the constructor.
2. An external view contract is allowed to write to storage, but it will be its own storage. In general avoid writing in such a contract. This might become an error in the future.
3. The constructor is different. Be mindful of this when deploying the external view contract.
   - The original constructor is ignored, [a specific constructor is always provided instead](https://docs.rs/multiversx-sc/0.39.0/multiversx_sc/external_view_contract/fn.external_view_contract_constructor.html).
   - This constructor always takes one single argument, which is the address of the target contract to read from. From this on, the target address can no longer be changed.
   - The external view constructor ABI is always as follows:

```json
{
  "constructor": {
    "docs": [
      "The external view init prepares a contract that looks in another contract's storage.",
      "It takes a single argument, the other contract's address",
      "You won't find this constructors' definition in the contract, it gets injected automatically by the framework. See `multiversx_sc::external_view_contract`."
    ],
    "inputs": [
      {
        "name": "target_contract_address",
        "type": "Address"
      }
    ],
    "outputs": []
  }
}
```

---

[comment]: # (mx-context-auto)

### Specification

- `settings`
  - `main` - The contract id of the main wasm crate. The only thing special about this contract's crate is that it is simply called `wasm` and that its `Cargo.toml` is the basis for the `Cargo.toml` configs in all other output contract wasm crates.
- `contracts` map, indexed by contract id. Each contract has:
  - `name` (optional)
    - The output contract name.
    - It forms the basis of all output artifacts, e.g. from `my-contract` we get `my-contract.abi.json`, `my-contract.wasm`, `my-contract.mxsc.json`, etc.
    - _values_: any alphanumeric string, dashed and underscores are allowed. Dashes are preferred over underscores.
    - _default_: if missing, the contract id will be used.
  - `external-view`
    - Specifies that a contract should be built as an external view contract.
    - _values_: `true` | `false`
    - _default_: `false`
  - `add-unlabelled`
    - Specifies that all unlabelled endpoints should be added to this contract.
    - _values_: `true` | `false`
    - _default_: `false`
  - `add-labels`
    - All endpoints labelled with at least one of these labels will be added to the contract.
    - _values_: a list of string labels, e.g. `add-labels = ["label1", "label2"]`
    - _default_: `[]`
  - `add-endpoints`
    - A list of endpoint names to be added directly to this contract.
    - It bypasses the label system.
    - Can be useful if for some reason labels are missing in code or deemed too cumbersome.
    - Use the public endpoin names, not the rust function names.
    - _values_: a list of endpoint names, e.g. `add-labels = ["myEndpoint1", "myEndpoint1"]`
    - _default_: `[]`
- `labels-for-contracts`
    - Currently not used in any of our projects, probably better to stay away from this feature. Providing documentation for reference, anyway.
    - The idea is that it is also possible to map in reverse, labels to contracts. It contains a mapping from labels to lists of contract ids. 
    - It can be a little harder to read than the contract to label map, but it can be used.
    - There is a special key, `default`, which refers to the unlabelled endpoints.
    - Example, equivalent to the labels in :

```toml
[settings]
main = "multisig-main"

[contracts.multisig-main]
name = "multisig"

[contracts.view]
name = "multisig-view"
external-view = true

[contracts.full]
name = "multisig-full"

[labels-for-contracts]
default = ["multisig-main", "full"]
multisig-external-view = ["view", "full"]
```

---

[comment]: # (mx-context-auto)

## More examples

[comment]: # (mx-context-auto)

### Example 1

Suppose we want to use some unreleased functionality on the devnet, but also want a version of the contract that we can deploy to mainnet.

We can use a single code base, but produce two contracts from it.

In this example we use the async promises system, which is unreleased on the mainnet at the time of writing this.

Excerpts from the contract code, for context:

```rust
#[multiversx_sc::contract]
pub trait ForwarderQueue {
    // ...

    #[endpoint]
    #[payable("*")]
    fn forward_queued_calls(&self) {
        while let Some(node) = self.queued_calls().pop_front() {
            // ...

            match call.call_type {
                // ...
                QueuedCallType::Promise => {
                    #[cfg(feature = "promises")]
                    // ...
                },
            }
        }
    }

    #[promises_callback]
    #[label("promises-callback")]
    fn promises_callback_method(&self) {
        // ...
    }
}
```

And the configuration that comes with it:

```toml
[settings]
main = "main"

[contracts.main]
name = "example1-mainnet"
ei = "1.2"
add-unlabelled = true

[contracts.promises]
name = "example1-devnet"
ei = "1.3"
add-unlabelled = true
add-labels = ["promises-callback"]
features = ["promises"]
```

The result:

```
output
├── example1-devnet.abi.json
├── example1-devnet.imports.json
├── example1-devnet.mxsc.json
├── example1-devnet.wasm
├── example1-mainnet.abi.json
├── example1-mainnet.imports.json
├── example1-mainnet.mxsc.json
└── example1-mainnet.wasm
```

[comment]: # (mx-context-auto)

### Example 2

Since framework version 0.43.0, it is possible to have different variants of a contract with different constructors. This might desirable for several reasons:
- Keeping separate versions for upgrades and migrations.
- Optimizing contract size by first deploying just with the constructor, and then immediately upgrading to a version with all the code but without the constructor.

It is also possible to have different versions of the same endpoint in different contract variants. In the example below you will see that the endpoint `sampleValue` has two different implementations.

A minimal example:

```rust
#[multiversx_sc::contract]
pub trait Example2 {
    #[init]
    fn default_init(&self, sample_value: BigUint) {
        self.sample_value().set(sample_value);
    }

    #[init]
    #[label("alt-init")]
    fn alternative_init(&self) -> &'static str {
        "alternative init"
    }

    #[view(sampleValue)]
    #[storage_mapper("sample-value")]
    fn sample_value(&self) -> SingleValueMapper<BigUint>;

    #[view(sampleValue)]
    #[label("alt-impl")]
    fn alternative_sample_value(&self) -> &'static str {
        "alternative message instead of sample value"
    }
}
```

And the configuration that comes with it:

```toml
[settings]
main = "example2-main"

[contracts.example2-main]
add-unlabelled = true

[contracts.example2-alt-impl]
add-labels = ["alt-impl"]
```


---

[comment]: # (mx-context-auto)

## Testing with multi-contracts

It is possible (and recommended) to use the contracts in scenario tests as they would be used on-chain.

The Go scenario runner will work with the produced contract binaries without further ado. Calling an endpoint that is not available in a certain output contract will fail, even if said endpoint exists in the original contract code.

To achieve the same effect on the Rust scenario runner, configure as in the following snippet. This is an actual excerpt from `multisig_scenario_rs_test.rs`, one of the multisig test files.

```rust
fn world() -> ScenarioWorld {
    // Initialize the blockchain mock, the same as for a regular test.
    let mut blockchain = ScenarioWorld::new();
    blockchain.set_current_dir_from_workspace("contracts/examples/multisig");

    // Contracts that have no multi-contract config are provided the same as before.
    blockchain.register_contract("file:test-contracts/adder.wasm", adder::ContractBuilder);

    // For multi-contract outputs we need to provide:
    // - the ABI, via the generated AbiProvider type
    // - a scenario expression to bind to, same as for simple contracts
    // - a contract builder, same as for simple contracts
    // - the contract name, as specified in multicontract.toml
    blockchain.register_partial_contract::<multisig::AbiProvider, _>(
        "file:output/multisig.wasm",
        multisig::ContractBuilder,
        "multisig",
    );

    // The same goes for the external view contract.
    // There is no need to specify here that it is an external view,
    // the framework gets all the data from multicontract.toml.
    blockchain.register_partial_contract::<multisig::AbiProvider, _>(
        "file:output/multisig-view.wasm",
        multisig::ContractBuilder,
        "multisig-view",
    );

    blockchain
}
```

