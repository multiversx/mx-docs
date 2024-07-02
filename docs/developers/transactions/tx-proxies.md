---
id: tx-proxies
title: Proxies
---

[comment]: # (mx-abstract)

## Overview

Proxies are objects that mimic the contract, they provide methods with the same names and the same argument types. When called, they will format a transaction for the contract. So they act as translators: you can call them just like regular functions, and they will translate it for the blockchain and pass on the call. They also tell you what type the function is expected to return.

New proxies are generated as structures. If you have the proxy, you have all its methods. The generated code is in plain sight and readable, designed to add no overhead to the contract binaries once compiled.

Proxies can be simply copied between crates, so there is no more need for dependencies between contract crates. Proxies do not mind what their source contract code looks like or what framework version it uses.

[comment]: # (mx-context-auto)

## How to generate

Proxy generation can be triggered by calling `sc-meta all proxy` in the contract root folder. This command generates the proxy of the main contract in `/output` folder with name `proxy.rs` if it has no configuration. To configure it, you need to modify sc-config.toml.

This first image represents the structure of the project without calling a proxy generator, while the second one shows how it is called and what files it generates.

![img](/img/tree_before_proxy.png)

![img](/img/tree_after_proxy.png)

[comment]: # (mx-context-auto)

## How to set up project to re-generate easily

In order to configure the proxy, you need to change configuration file. If this file is absent from the project directory, you have to create it. More details about how to set up a configuration file are available [here](../meta/sc-config/).

### Path

First, you need to specify the output path where the generated proxy file will be saved. This ensures that whenever you regenerate the proxy, the configured path will be automatically updated with the latest version.

```toml title=sc-config.toml
[settings]

[[proxy]]
path = "src/adder_proxy.rs"
```

After the proxy is generated via "sc-meta all proxy" command, you have to import the module in the contract.

```rust title=adder.rs
#![no_std]

use multiversx_sc::imports::*;

pub mod adder_proxy;

#[multiversx_sc::contract]
pub trait Adder {
    ...
}
```

:::note
Changing the settings requires configuring the output path.
:::
### Override imports
If you need to override the proxy imports that are encapsulated in the line `use multiversx_sc::proxy_imports::*;` from proxy, you can achieve this by adding the `override_import`.


```toml title=sc-config.toml
[settings]

[[proxy]]
path = "src/adder_proxy.rs"
override-import = "use multiversx_sc::abi::{ContractAbi, EndpointAbi};"
```

### Rename paths
If you want to rename paths from structures and enumerations in a generated proxy, use the `path-rename` setting. Specify both the original path and the new name you want.

```toml title=sc-config.toml
[[proxy]]
path = "src/adder_proxy.rs"
[[proxy.path-rename]]
from = "adder"
to = "new_path::adder"
```

### Generate variant from multi-contract
To generate a proxy for a specific variant within a multi-contract project, use the `variant` setting and specify the desired variant.

```toml title=multicontract.toml
[settings]
main = "multi-contract-main"

[[proxy]]
variant = "multi_contract_example_feature"
path = "src/multi_contract_example_feature_proxy.rs"
```

### Generate custom proxy

First, it needs to be specified that all unlabelled endpoints should **not** be added to this contract. This can be configured using:
- `add-unlabelled`
  - values: `true` | `false`
  - default: `true`

```toml title=multicontract.toml
[[proxy]]
path = "src/multisig_view_proxy.rs"
add-unlabelled = false      # unlabelled endpoints are not included
```
If you want to generate a proxy for all endpoints labelled with a certain tag, you can use:
- `add-labels`
  - values: `list of strings`, e.g. add-labels = ["label1", "label2"]
  - default: `[]`

The example below will create a proxy for all endpoints that are tagged with *"label(proxy_one)"* and *"label(proxy_two)"*.

```toml title=multicontract.toml
[[proxy]]
path = "src/multisig_view_proxy.rs"
add-unlabelled = false
add-labels = ["proxy_one", "proxy_two"]
```

If you want to generate a proxy based on a specific list of endpoints, there is:
- `add-endpoints`
  - values: `list of strings`, e.g. add-endpoints = ["endpoint_one", "endpoint_two"]
  - default: `[]`

The following example will create a proxy only with the functions specified in the list of `add-endpoints`.

```toml title=multicontract.toml
[[proxy]]
path = "src/multisig_view_proxy.rs"
add-unlabelled = false
add-endpoints = ["init", "user_role"]
```
The custom proxy can be generated using simultaneously both configurations: specified endpoints and endpoints labelled with a particular tag.
```toml title=multicontract.toml
[[proxy]]
path = "src/multisig_view_proxy.rs"
add-unlabelled = false
add-labels = ["proxy_one"]
add-endpoints = ["user_role"]
```

[comment]: # (mx-context-auto)

## Adjustments in contracts

Before generating a proxy, you have to change every structure and enumeration that contains `#[derive(TypeAbi)]` with `#[type_abi]`. If you do not update structures and enumerations, they will not be correctly generated in the proxy.

Before version 0.49.0:
```rust title=lib.rs
#[derive(TopEncode, TopDecode, PartialEq, Eq, Clone, Copy, Debug, TypeAbi)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}
```
After version 0.49.0:
```rust title=lib.rs
#[type_abi]
#[derive(TopEncode, TopDecode, PartialEq, Eq, Clone, Copy, Debug)]
pub enum Status {
    FundingPeriod,
    Successful,
    Failed,
}
```
If the custom type is in a private module or another crate is better to replace it because the proxy will be useless.


[comment]: # (mx-context-auto)

## Diagram

This is the diagram for how to populate the data field using proxies. For the raw setup, see [here](tx-data#diagram)

```mermaid
graph LR
    subgraph "Data (via proxies)"
        data-unit["()"]
        data-unit -->|typed| Proxy
        Proxy -->|"init(args, ...)"| deploy
        Proxy -->|"upgrade(args, ...)"| upgrade
        Proxy -->|"«endpoint»(args, ...)"| fc[Function Call]
        deploy -->|from_source| deploy-from-source["DeployCall&lt;FromSource&lt;ManagedAddress&gt;&gt;"]
        deploy -->|code| deploy-code["DeployCall&lt;Code&lt;ManagedBuffer&gt;&gt;"]
        deploy -->|code_metadata| deploy
        upgrade -->|from_source| upgrade-from-source["UpgradeCall&lt;CodeSource&lt;ManagedAddress&gt;&gt;"]
        upgrade -->|code| upgrade-code["UpgradeCall&lt;Code&lt;ManagedBuffer&gt;&gt;"]
        upgrade -->|code_metadata| upgrade
    end
```


[comment]: # (mx-context-auto)

## Original type

Proxies have the power to define the **original type** by themselves because, when they are generated, they have access to the ABI.

The proxy will add the type definition by calling `.original_type()`, which places an [`OriginalResultMarker`](tx-result-handlers#original-result-marker) object as the transaction result handler. This is a zero-sized type, it is only there for type inference and safety in result handlers.


[comment]: # (mx-context-auto)

## NotPayable protection

All non-payment endpoints in the generated proxy have a safeguard to prevent accidental payments. This involves automatically setting the payment to [**NotPayable**](tx-payment#notpayable).
