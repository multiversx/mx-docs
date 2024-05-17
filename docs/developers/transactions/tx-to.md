---
id: tx-to
title: Receiver (Bianca)
---

[comment]: # "mx-abstract"

## Overview

Among the seven distinct generics defining a transaction, `To` signifies the the **third** generic field - **the entity that receives the transaction**. With the exception of deployments, it is required to be specified for every transaction from any environment.

[comment]: # "mx-context-auto"

## No recipient

Across the three distinct environments in which a transaction can be initialised, `deploy`, also known as the `init` function, stands alone as the only invocation that cannot designate the recipient.

```rust title=blackbox.rs
#[test]
fn deploy() {
    self.world
        .tx()
        .from(OWNER_ADDRESS)
        .typed(proxy::Proxy)
        .init(init_value)
        .code(CODE_PATH)
        .new_address(DEPLOY_ADDRESS) // Sets the new mock address to be used for the newly deployed contract.
        .run();
}
```


[comment]: # "mx-context-auto"

## Explicit recipient

Transactions, excluding deployments, requires the designation of a recipient. This means that most of transaction calls must utilize the `.to` method, explicitly specifying the receiving entity.

In the subsequent section, we will go into the various data types that are permissible for recipient nomination.

### ManagedAddress

This function, which is a sample from a **blackbox test**, increases a value and sends it to a particular wallet. This example specifically focuses on the `.to` call, which establishing the **receiver**. In this case it is a hardcoded **ManagedAddress** instance.

```rust title=blackbox_test.rs
fn add_one(&mut self, from: &AddressValue) {
    let to_wallet: ManagedAddress<StaticApi> = ManagedAddress::new_from_bytes(&[7u8; 32]);
    self.world
        .tx()
        .from(OWNER_ADDRESS)
        .to(to_wallet)
        .typed(proxy::Proxy)
        .add(1u32)
        .run();
}
```

### Address

- Address
- Bech32Address

[comment]: # "mx-context-auto"

## Special recipient

- ESDTSystemSCAddress
- ToSelf
- ToSender