---
id: values-complex
title: Scenario Complex Values
---

We already covered representations of simple types [here](/developers/scenario-reference/values-simple). This is enough for arguments of types like `usize`, `BigUint` or `&[u8]`, but we need to also somehow specify complex types like custom structs or lists of items.

[comment]: # (mx-context-auto)

## **Concatenation**

It is possible to concatenate multiple expressions using the pipe operator (`|`). The pipe operator takes precedence over everything, so it is not currently possible to concatenate and then apply a function to the whole result.

This is ideal for short lists or small structs.

:::note Example

- a `Vec<u32>` can be expressed as `"u32:1|u32:2|u32:3"`.
- a `(BigUint, BigUint)` tuple can be expressed as `"biguint:1|biguint:2"`
- a `SimpleStruct { a: u8, b: BoxedBytes }` can be expressed as `"u8:4|nested:str:value-b"`
  :::

Please note that the pipe operator only takes care of the concatenation itself. You are responsible for making sure that [nested encoding](/developers/developer-reference/serialization-format/#the-concept-of-top-level-vs-nested-objects) is used where appropriate.

[comment]: # (mx-context-auto)

## **Using JSON lists as values**

Scenarios allow using JSON lists to express longer values. This especially makes sense when the value being represented is itself a list in the smart contract.

:::note Example

- a `Vec<u32>` can also be expressed as `["u32:1", "u32:2", "u32:3"]`.
- a `(BigUint, BigUint)` tuple can also be expressed as `["biguint:1", "biguint:2"]`
- a `SimpleStruct { a: u8, b: BoxedBytes }` can also be expressed as `["u8:4", "nested:str:value-b"]`, although in this case a [JSON map](#using-json-maps-as-values) might be more appropriate.
  :::

Make sure not to confuse values expressed as JSON lists with other elements of scenario syntax.

:::note Example

```json
{
            "step": "scCall",
            "txId": "echo_managed_vec_of_managed_vec",
            "tx": {
                "from": "address:an_account",
                "to": "sc:basic-features",
                "value": "0",
                "function": "echo_managed_vec_of_managed_vec",
                "arguments": [
                    [
                        "u32:3",
                        ["u32:1", "u32:2", "u32:3"],
                        "u32:0",
                        "u32:2",
                        ["u32:5", "u32:6"]
                    ]
                ],
                "gasLimit": "50,000,000",
                "gasPrice": "0"
            }
        },
```

In the example above, there is in fact a single argument that we are passing to the endpoint. The outer brackets in `"arguments": [ ... ]` are scenario syntax for the list of arguments. The brackets immediately nested signal a JSON list value. Notice how the list itself contains some more lists inside it. They all get concatenated in the end into a single value.

In this example the only argument is `0x0000000300000001000000020000000300000000000000020000000500000006`.

:::

:::tip

We mentioned above how the developer needs to take care of the serialization of the nested items. This is actually a good example of that. The endpoint `echo_managed_vec_of_managed_vec` takes a list of lists, so we need to serialize the lengths of the lists on the second level. Notice how the lengths are given as JSON strings and the contents as JSON lists; the first `"u32:3"` is the serialized length of the first item, which is `["u32:1", "u32:2", "u32:3"]`, and so forth.

:::

[comment]: # (mx-context-auto)

## **Using JSON maps as values**

JSON lists make sense for representing series of items, but for structs JSON maps are more expressive.

The rules are as follows:

- The interpreter will concatenate all JSON map values and leave the keys out.
- The keys need to be in alphanumerical order, so we customarily prefix them with numbers. Map keys in JSON are fundamentally unordered and this is the easiest way to enforce a deterministic order for the values.
- Map values can be either JSON strings, lists or other maps, all scenario value rules apply the same way all the way down.

:::note Example

This is an abridged section of the actual lottery contract in the examples.

```json
{
  "step": "checkState",
  "accounts": {
    "sc:lottery": {
      "storage": {
        "str:lotteryInfo|nested:str:lottery_name": {
          "0-token_identifier": "nested:str:LOTTERY-123456",
          "1-ticket_price": "biguint:100",
          "2-tickets-left": "u32:0",
          "3-deadline": "u64:123,456",
          "4-max_entries_per_user": "u32:1",
          "5-prize_distribution": ["u32:2", "u8:75", "u8:25"],
          "6-whitelist": [
            "u32:3",
            "address:acc1",
            "address:acc2",
            "address:acc3"
          ],
          "7-prize_pool": "biguint:500"
        }
      },
      "code": "file:../output/lottery-esdt.wasm"
    }
  }
}
```

The Rust struct this translates to is:

```rust
#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi)]
pub struct LotteryInfo<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub ticket_price: BigUint<M>,
    pub tickets_left: u32,
    pub deadline: u64,
    pub max_entries_per_user: u32,
    pub prize_distribution: Vec<u8>,
    pub whitelist: Vec<Address>,
    pub prize_pool: BigUint<M>,
}

```

:::

:::tip

Once again, note that all contained values are in [nested encoding format](/developers/developer-reference/serialization-format/#the-concept-of-top-level-vs-nested-objects):

- the token identifier has its length automatically prepended by the `nested:` prefix,
- big ints are given with the `biguint:` syntax, which prepends their byte length,
- small ints are given in full length,
- lists have their length explicitly encoded at the start, always on 4 bytes (as `u32`).

:::

[comment]: # (mx-context-auto)

## **A note about enums**

There are 2 types of enums that we use in Rust:

- simple enums are simply encoded as `u8`
- complex enums are encoded just like structures, with an added `u8` discriminant at the beginning.

Discriminants are not explicit in the Rust code, they get generated automatically. Discriminats start from `0`.

:::note Example

This is an abridged section of a Multisig contract test.

```json
{
  "step": "checkState",
  "accounts": {
    "sc:multisig": {
      "storage": {
        "str:action_data.item|u32:3": {
          "1-discriminant": "0x06",
          "2-amount": "u32:0",
          "3-code": "nested:file:../test-contracts/adder.wasm",
          "4-code_metadata": "0x0000",
          "5-arguments": ["u32:1", "u32:2|1234"]
        },
        "+": ""
      },
      "code": "file:../output/multisig.wasm"
    },
    "+": ""
  }
}
```

In this example we have a `SCDeploy`:

```rust
#[derive(NestedEncode, NestedDecode, TopEncode, TopDecode, TypeAbi)]
pub enum Action<M: ManagedTypeApi> {
    Nothing,
    AddBoardMember(ManagedAddress<M>),
    AddProposer(ManagedAddress<M>),
    RemoveUser(ManagedAddress<M>),
    ChangeQuorum(usize),
    SendEgld {
        to: ManagedAddress<M>,
        amount: BigUint<M>,
        data: BoxedBytes,
    },
    SCDeploy {
        amount: BigUint<M>,
        code: ManagedBuffer<M>,
        code_metadata: CodeMetadata,
        arguments: Vec<BoxedBytes>,
    },
    SCCall {
        to: ManagedAddress<M>,
        egld_payment: BigUint<M>,
        endpoint_name: BoxedBytes,
        arguments: Vec<BoxedBytes>,
    },
}
```

:::
