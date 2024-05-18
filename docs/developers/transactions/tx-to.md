---
id: tx-to
title: Receiver
---

[comment]: # "mx-abstract"

## Overview

Among the seven distinct generics defining a transaction, `To` signifies the **third** generic field - **the entity that receives the transaction**. With the exception of deployments, it is required to be specified for every transaction in any environment.

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

Transactions, excluding deployments, require the designation of a recipient. This means that most transaction calls must utilise the `.to` method, explicitly specifying the receiving entity.

In the subsequent section, we will go into the various data types that are permissible for recipient nomination.

### ManagedAddress

This function, which is a sample from a **blackbox test**, increases a value and sends it to a particular wallet. This example specifically focuses on the `.to` call, which establishes the **receiver**. In this case, it is a hardcoded **ManagedAddress** instance.

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

Below there is an interactor that funds a specific contract with an amount of EGLD. The recipient contract is instantiated as an address object within the interactor's context.

```rust title=interactor.rs
async fn feed_contract_egld(&mut self) {
    self.interactor
        .tx()
        .from(&self.wallet_address)
        .to(self.state.current_adder_address())
        .egld(NumExpr("0,050000000000000000"))
        .prepare_async()
        .run()
        .await;
}
```

For parametric testing, there are particular address types:

- **TestSCAddress**
  - encodes a dummy smart contract address, equivalent to `"sc:{}"`; For the example below it is equivalent to `"sc:example_contract"`;
  - contains two functions:
    - **`.eval_to_array()`** parses the address into an array of u8.
    - **`.eval_to_expr()`** returns the address as a string object.
    - **`.to_address()`** returns the actual Address object.
  
The following example is a fragment from a blackbox test designed for *Price Aggregator Smart Contract* (code available [here](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/core/price-aggregator)). This function simulates the staking of an amount of EGLD within the *Price Aggregator Smart Contract*.
```rust title=price_aggregator_blackbox_test.rs
const STAKE_AMOUNT: u64 = 20;
const PRICE_AGGREGATOR_ADDRESS: TestSCAddress = TestSCAddress::new("price-aggregator");

fn stake(&mut self) {
    self.world
        .tx()
        .from(self.address)
        .to(PRICE_AGGREGATOR_ADDRESS)
        .typed(price_aggregator_proxy::PriceAggregatorProxy)
        .stake()
        .egld(STAKE_AMOUNT)
        .run();
}
```

### Bech32Address
In order to avoid repeated conversions, it keeps the **Bech32** representation **inside**. It wraps the address and presents it as a Bech32 expression.

The example below is a piece of an interactor for the *Adder Smart Contract* (code available [here](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples/adder)). The aim of the function is to print the total sum of the contract. The receiver is set via the Bech32Address variable.

```rust title=interact.rs
async fn print_sum(&mut self, adder_address: &Bech32Address) {
    let sum = self
        .interactor
        .query()
        .to(adder_address)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ReturnsResultUnmanaged)
        .prepare_async()
        .run()
        .await;

    println!("sum: {sum}");
}
```

[comment]: # "mx-context-auto"

## Special recipient

### ESDTSystemSCAddress
This type indicates the system smart contract address, which is the same on any MultiversX blockchain.
  - **`.to_managed_address()`**: converts the addresse to **ManagedAddress**.
  - **`.to_bech32_str()`**: returns the **str** value of the address.
  - **`.to_bech32_string()`**: returns the **String** value of the address.

The next example represents a part of a **smart contract** whose aim is to issue semi-fungible tokens. The call is made via a system proxy for the ESDT system smart contract. More details regarding the system proxy can be found [here TBD](https://github.com/multiversx/mx-sdk-rs/tree/master/contracts/examples/adder).
```rust title=lib.rs
fn sft_issue(
    issue_cost: BigUint<SA>,
    token_display_name: ManagedBuffer<SA>,
    token_ticker: ManagedBuffer<SA>,
) -> IssueCallTo<SA> {
    Tx::new_tx_from_sc()
        .to(ESDTSystemSCAddress)
        .typed(ESDTSystemSCProxy)
        .issue_semi_fungible(
            issue_cost,
            &token_display_name,
            &token_ticker,
            SemiFungibleTokenProperties::default(),
        )
}
```
### ToSelf
It indicates that the transaction should be sent to itself.

The following lines illustrate an example of changing attributes of an NFT via a system proxy function.
```rust title=lib.rs
pub fn nft_update_attributes<T: codec::TopEncode>(
    &self,
    token_id: &TokenIdentifier<A>,
    nft_nonce: u64,
    new_attributes: &T,
) {
    Tx::new_tx_from_sc()
        .to(ToSelf)
        .gas(GasLeft)
        .typed(system_proxy::UserBuiltinProxy)
        .nft_update_attributes(token_id, nft_nonce, new_attributes)
        .sync_call()
}
```