---
id: sdk-py-cookbook-v0
title: Cookbook (v0)
pagination_prev: sdk-and-tools/sdk-py/sdk-py
---

[comment]: # (mx-abstract)

[comment]: # (mx-context-auto)

## Overview

This page will guide you through the process of handling common tasks using the MultiversX Python SDK (libraries) **v0 (legacy, previous version)**.

:::note
All examples depicted here are captured in **(interactive) [Jupyter notebooks](https://github.com/multiversx/mx-sdk-py/blob/main/examples/Cookbook.ipynb)**.
:::

We are going to use the [multiversx-sdk-py](https://github.com/multiversx/mx-sdk-py) package. This package can be installed directly from GitHub or from [**PyPI**](https://pypi.org/project/multiversx-sdk/).

Example for installing the package directly from GitHub, using a `requirements.txt` file:

```
git+https://git@github.com/multiversx/mx-sdk-py.git@v1.2.3#egg=multiversx_sdk
```

<!-- BEGIN_NOTEBOOK { "url": "https://raw.githubusercontent.com/multiversx/mx-sdk-py/main/examples/Cookbook.ipynb" } -->

## Addresses

Create an `Address` object from a _bech32-encoded_ string:

```py
from multiversx_sdk import Address

address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print("Address (bech32-encoded)", address.to_bech32())
print("Public key (hex-encoded):", address.to_hex())
print("Public key (hex-encoded):", address.get_public_key().hex())
```

... or from a _hex-encoded_ string - note that you have to provide the address prefix, also known as the **HRP** (_human-readable part_ of the address):

```py
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1", "erd")
```

... or from a raw public key:

```py
pubkey = bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = Address(pubkey, "erd")
```

Alternatively, you can use an `AddressFactory` (initialized with a specific **HRP**) to create addresses:

```py
from multiversx_sdk import AddressFactory

factory = AddressFactory("erd")

address = factory.create_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
address = factory.create_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = factory.create_from_public_key(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

Addresses can be converted from one representation to another as follows:

```py
print(address.to_bech32())
print(address.to_hex())
```

Getting the shard of an address:

```py
from multiversx_sdk import AddressComputer

address_computer = AddressComputer(number_of_shards=3)
print("Shard:", address_computer.get_shard_of_address(address))
```

Checking whether an address is a smart contract:

```py
address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

print("Is contract:", address.is_smart_contract())
```

### Changing the default hrp

We have a configuration class, called `LibraryConfig`, that only stores (for the moment) the **default hrp** of the addresses. The default value is `erd`. The hrp can be changed when instantiating an address, or it can be changed in the `LibraryConfig` class, and all the addresses created will have the newly set hrp.

```py
from multiversx_sdk import Address
from multiversx_sdk import LibraryConfig


print(LibraryConfig.default_address_hrp)
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
print(address.to_bech32())

LibraryConfig.default_address_hrp = "test"
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
print(address.to_bech32())

# setting back the default value
LibraryConfig.default_address_hrp = "erd"
```

## EGLD / ESDT transfers

Create an EGLD transfer:

```py
from multiversx_sdk import Transaction, TransactionsConverter

transaction = Transaction(
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    gas_limit=50000,
    chain_id="D",
    nonce=77,
    value=1000000000000000000
)

transaction_converter = TransactionsConverter()
print(transaction_converter.transaction_to_dictionary(transaction))
```

In case you are using a **guarded** account you should also populate the `guardian` and `guardian_signature` fields after creating the transaction.

We'll see later how to [sign](#signing-objects) and [broadcast](#broadcasting-transactions) a transaction.

Create an EGLD transfer, but this time with a payload (data):

```py
transaction = Transaction(
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    gas_limit=50000,
    chain_id="D",
    nonce=77,
    value=1000000000000000000,
    data=b"for the book"
)

print(transaction_converter.transaction_to_dictionary(transaction))
```

Alternatively, we can create an EGLD transfer using a **transaction factory** (as we will see below, transaction factories are more commonly used). But before that, we have to create a configuration object (for any factory that we might use):

```py
from multiversx_sdk import TransactionsFactoryConfig

config = TransactionsFactoryConfig(chain_id="D")
```

The **transaction factory** is parametrized at instantiation, and the transaction is obtained by invoking the `create_transaction...` method:

```py
from multiversx_sdk import TransferTransactionsFactory

transfer_factory = TransferTransactionsFactory(config=config)
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

# With "data" field
transaction = transfer_factory.create_transaction_for_native_token_transfer(
    sender=alice,
    receiver=bob,
    native_amount=1000000000000000000,
    data="for the book"
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Create a single ESDT transfer:

```py
from multiversx_sdk import Token, TokenTransfer

token = Token("TEST-8b028f")
transfer = TokenTransfer(token, 10000)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Create a single NFT transfer:

Keep in mind, since we are sending a NFT, we **should** set the amount to `1`.

```py
token = Token(identifier="TEST-38f249", nonce=1)
transfer = TokenTransfer(token=token, amount=1)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Create a single SFT transfer (almost the same as above, the only difference being that for the transfer we set the desired amount, as an integer):

```py
token = Token(identifier="SEMI-9efd0f", nonce=1)
transfer = TokenTransfer(token=token, amount=5)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Create a multiple ESDT / NFT transfer:

```py
first_token = Token(identifier="TEST-38f249", nonce=1)
first_transfer = TokenTransfer(token=first_token, amount=1)

second_token = Token(identifier="BAR-c80d29")
second_transfer = TokenTransfer(token=second_token, amount=10000000000000000000)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[first_transfer, second_transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Additionally, we also have a method that combines the above methods and is able to identify the kind of transfer that we intend to perform based on it's parameters. The method can be used as follows:

For native token transfers:

```py
from multiversx_sdk import TransferTransactionsFactory, TransactionsFactoryConfig

transfer_factory = TransferTransactionsFactory(config=TransactionsFactoryConfig(chain_id="D"))

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

# With "data" field
transaction = transfer_factory.create_transaction_for_transfer(
    sender=alice,
    receiver=bob,
    native_amount=1000000000000000000,
    data="for the book".encode()
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

And for ESDT transfers:

```py
first_token = Token(identifier="TEST-38f249", nonce=1)
first_transfer = TokenTransfer(token=first_token, amount=1)

second_token = Token(identifier="BAR-c80d29")
second_transfer = TokenTransfer(token=second_token, amount=10000000000000000000)

transaction = transfer_factory.create_transaction_for_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[first_transfer, second_transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

Alternatively, the protocol will support (in the very near future) sending both native and esdt tokens in the same transaction. If a `native_amount` is provided together with `token_transfers`, the native token will also be included in the `MultiESDTNFTTrasfer` built-in function call.

```py
first_token = Token(identifier="TEST-38f249", nonce=1)
first_transfer = TokenTransfer(token=first_token, amount=1)

second_token = Token(identifier="BAR-c80d29")
second_transfer = TokenTransfer(token=second_token, amount=10000000000000000000)

transaction = transfer_factory.create_transaction_for_transfer(
    sender=alice,
    receiver=bob,
    native_amount=1000000000000000000,
    token_transfers=[first_transfer, second_transfer]
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

### Decoding Transactions

For example, when sending multiple ESDT and NFT tokens, the receiver field of the transaction is the same as the sender field and also the value is set to `0` because all the information is encoded in the `data` field of the transaction.

For decoding the data field we have a so called `TransactionDecoder`. We fetch the transaction from the network and then use the decoder.

```py
from multiversx_sdk import ProxyNetworkProvider, TransactionDecoder

proxy = ProxyNetworkProvider("https://devnet-api.multiversx.com")
transaction = proxy.get_transaction("3e7b39f33f37716186b6ffa8761d066f2139bff65a1075864f612ca05c05c05d")

decoder = TransactionDecoder()
decoded_transaction = decoder.get_transaction_metadata(transaction)

print(decoded_transaction.to_dict())
```

## Relayed Transactions

First, we get the newtwork configuration using the network providers.

```py
from multiversx_sdk import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
network_config = provider.get_network_config()
```

### Relayed V1

```py
from pathlib import Path

from multiversx_sdk import (Address, RelayedTransactionsFactory, Transaction,
                            TransactionComputer, TransactionsFactoryConfig,
                            UserSigner)

signer = UserSigner.from_pem_file(Path("../multiversx_sdk/testutils/testwallets/bob.pem"))
transaction_computer = TransactionComputer()

inner_tx = Transaction(
    chain_id=network_config.chain_id,
    sender="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    receiver="erd1qqqqqqqqqqqqqpgqqczn0ccd2gh8eqdswln7w9vzctv0dwq7d8ssm4y34z",
    gas_limit=60000000,
    nonce=198,
    data=b"add@05"
)
inner_tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(inner_tx))

config = TransactionsFactoryConfig(chain_id="D")
factory = RelayedTransactionsFactory(config=config)
relayer = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

relayed_tx = factory.create_relayed_v1_transaction(
    inner_transaction=inner_tx,
    relayer_address=relayer
)
relayed_tx.nonce = 2627

print(transaction_converter.transaction_to_dictionary(relayed_tx))
```

### Relayed V2

```py
from pathlib import Path

from multiversx_sdk import (Address, RelayedTransactionsFactory, Transaction,
                            TransactionComputer, TransactionsFactoryConfig,
                            UserSigner)

signer = UserSigner.from_pem_file(Path("../multiversx_sdk/testutils/testwallets/bob.pem"))
transaction_computer = TransactionComputer()

# for the relayedV2 transactions, the gasLimit for the inner transaction should be 0
inner_tx = Transaction(
            chain_id=network_config.chain_id,
            sender="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
            receiver="erd1qqqqqqqqqqqqqpgqqczn0ccd2gh8eqdswln7w9vzctv0dwq7d8ssm4y34z",
            gas_limit=0,
            nonce=15,
            data=b"add@05"
        )
inner_tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(inner_tx))

config = TransactionsFactoryConfig(chain_id="D")
factory = RelayedTransactionsFactory(config=config)
relayer = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

relayed_tx = factory.create_relayed_v2_transaction(
    inner_transaction=inner_tx,
    inner_transaction_gas_limit=60_000_000,
    relayer_address=relayer
)
relayed_tx.nonce = 37

print(transaction_converter.transaction_to_dictionary(relayed_tx))
```

## Contract ABIs

A contract's ABI describes the endpoints, data structure and events that a contract exposes. While contract interactions are possible without the ABI, they are easier to implement when the definitions are available.

### Load the ABI from a file

```py
from multiversx_sdk.abi import Abi, AbiDefinition

abi_definition = AbiDefinition.load(Path("./contracts/adder.abi.json"))
abi = Abi(abi_definition)
```

Or even simpler:

```py
abi = Abi.load(Path("./contracts/adder.abi.json"))
```

### Manually construct the ABI

If an ABI file isn't directly available, but you do have knowledge of the contract's endpoints and types, you can manually construct the ABI. Let's see a simple example:

```py
abi_definition = AbiDefinition.from_dict({
    "endpoints": [{
        "name": "add",
        "inputs": [
            {
                "name": "value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    }]
})
```

An endpoint with both inputs and outputs:

```py
abi_definition = AbiDefinition.from_dict({
    "endpoints": [
        {
            "name": "foo",
            "inputs": [
                { "type": "BigUint" },
                { "type": "u32" },
                { "type": "Address" }
            ],
            "outputs": [
                { "type": "u32" }
            ]
        },
        {
            "name": "bar",
            "inputs": [
                { "type": "counted-variadic<utf-8 string>" },
                { "type": "variadic<u64>" }
            ],
            "outputs": []
        }
    ]
})
```

## Contract deployments

### Load the bytecode from a file

```py
from pathlib import Path

bytecode = Path("contracts/adder.wasm").read_bytes()
```

### Perform a contract deployment

First, let's create a `SmartContractTransactionsFactory`:

```py
from multiversx_sdk import SmartContractTransactionsFactory

factory = SmartContractTransactionsFactory(config)
```

If the contract ABI is available, provide it to the factory:

```py
abi = Abi.load(Path("contracts/adder.abi.json"))
factory = SmartContractTransactionsFactory(config, abi)
```

Now, prepare the deploy transaction:

```py
from multiversx_sdk.abi import U32Value

# For deploy arguments, use typed value objects if you haven't provided an ABI to the factory:
args = [U32Value(42)]
# Or use simple, plain Python values and objects if you have provided an ABI to the factory:
args = [42]

deploy_transaction = factory.create_transaction_for_deploy(
    sender=alice,
    bytecode=bytecode,
    arguments=args,
    gas_limit=10000000,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

print("Transaction:", transaction_converter.transaction_to_dictionary(deploy_transaction))
print("Transaction data:", deploy_transaction.data.decode())
```

:::tip
When creating transactions using `SmartContractTransactionsFactory`, even if the ABI is available and provided,
you can still use _typed value_ objects as arguments for deployments and interactions.

Even further, you can use a mix of _typed value_ objects and plain Python values and objects. For example:
```
args = [U32Value(42), "hello", { "foo": "bar" }, TokenIdentifierValue("TEST-abcdef")];
```
:::

:::note
Setting the transaction nonce, signing a transaction and broadcasting it are depicted in a later section.
:::

### Computing the contract address

Even before broadcasting, at the moment you know the sender address and the nonce for your deployment transaction, you can (deterministically) compute the (upcoming) address of the contract:

```py
from multiversx_sdk import AddressComputer

address_computer = AddressComputer()
contract_address = address_computer.compute_contract_address(
    deployer=Address.new_from_bech32(deploy_transaction.sender),
    deployment_nonce=deploy_transaction.nonce
)

print("Contract address:", contract_address.to_bech32())
```

### Parsing transaction outcome

In the end, you can parse the results using a `SmartContractTransactionsOutcomeParser`. However, since the `parse_deploy` method requires a `TransactionOutcome` object as input, we need to first convert our `TransactionOnNetwork` object to a `TransactionOutcome`, by means of a `TransactionsConverter`.

```py
from multiversx_sdk import (SmartContractTransactionsOutcomeParser,
                            TransactionsConverter)

converter = TransactionsConverter()
parser = SmartContractTransactionsOutcomeParser()

transaction_on_network = proxy.get_transaction("0a7da74038244790b5bd4cd614c26cd5a6be76a6fcfcfb037974cc116b2ee9c6")
transaction_outcome = converter.transaction_on_network_to_outcome(transaction_on_network)
parsed_outcome = parser.parse_deploy(transaction_outcome)

print(parsed_outcome)
```

## Contract upgrades

Contract upgrade transactions are similar to deployment transactions (see above), in the sense that they also require a contract bytecode. In this context, though, the contract address is already known.

```py
contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")
bytecode = Path("./contracts/adder.wasm").read_bytes()

upgrade_transaction = factory.create_transaction_for_upgrade(
    sender=alice,
    contract=contract_address,
    bytecode=bytecode,
    gas_limit=10000000,
    arguments=[42],
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

print("Transaction:", transaction_converter.transaction_to_dictionary(upgrade_transaction))
print("Transaction data:", upgrade_transaction.data.decode())
```

## Contract interactions

The recommended way to create transactions for calling (and, for that matter, deploying and upgrading) smart contracts is through a `SmartContractTransactionsFactory`.

```py
from multiversx_sdk import SmartContractTransactionsFactory

factory = SmartContractTransactionsFactory(config)
```

If the contract ABI is available, provide it to the factory:

```py
abi = Abi.load(Path("contracts/adder.abi.json"))
factory = SmartContractTransactionsFactory(config, abi)
```

### Regular interactions

Now, let's prepare a contract transaction, to call the `add` function of our previously deployed smart contract:

```py
contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy")

# For arguments, use typed value objects if you haven't provided an ABI to the factory:
args = [U32Value(42)]
# Or use simple, plain Python values and objects if you have provided an ABI to the factory:
args = [42]

transaction = factory.create_transaction_for_execute(
    sender=alice,
    contract=contract_address,
    function="add",
    gas_limit=10000000,
    arguments=args
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

:::tip
When creating transactions using `SmartContractTransactionsFactory`, even if the ABI is available and provided,
you can still use _typed value_ objects as arguments for deployments and interactions.

Even further, you can use a mix of _typed value_ objects and plain Python values and objects. For example:
```
args = [U32Value(42), "hello", { "foo": "bar" }, TokenIdentifierValue("TEST-abcdef")];
```
:::

:::note
Setting the transaction nonce, signing a transaction and broadcasting it are depicted in a later section.
:::

### Transfer & execute

At times, you may want to send some tokens (native EGLD or ESDT) along with the contract call.

For transfer & execute with native EGLD, prepare your transaction as follows:

```py
transaction = factory.create_transaction_for_execute(
    sender=alice,
    contract=contract_address,
    function="add",
    gas_limit=10000000,
    arguments=[42],
    native_transfer_amount=1000000000000000000
)
```

Above, we're sending 1 EGLD along with the contract call.

For transfer & execute with ESDT tokens, prepare your transaction as follows:

```py
first_token = Token("TEST-38f249", 1)
first_transfer = TokenTransfer(first_token, 1)

second_token = Token("BAR-c80d29")
second_transfer = TokenTransfer(second_token, 10000000000000000000)

transfers = [first_transfer, second_transfer]

transaction = factory.create_transaction_for_execute(
    sender=alice,
    contract=contract_address,
    function="add",
    gas_limit=10000000,
    arguments=[42],
    token_transfers=transfers
)

print("Transaction:", transaction_converter.transaction_to_dictionary(transaction))
print("Transaction data:", transaction.data.decode())
```

### Parsing transaction outcome

:::note
Documentation in this section is preliminary and subject to change.
:::

### Decode transaction events

You might be interested into decoding events emitted by a contract. You can do so by using the [`TransactionEventsParser`](#).

Suppose we'd like to decode a `startPerformAction` event emitted by the [multisig](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract.

Let's fetch an already processed [transaction](https://devnet-explorer.multiversx.com/transactions/05d445cdd145ecb20374844dcc67f0b1e370b9aa28a47492402bc1a150c2bab4), to serve as an example, and convert it to a [TransactionOutcome](https://multiversx.github.io/mx-sdk-py/_modules/multiversx_sdk/core/transactions_outcome_parsers/resources.html#TransactionOutcome).

```py
from multiversx_sdk import ApiNetworkProvider, TransactionsConverter

api = ApiNetworkProvider("https://testnet-api.multiversx.com")
converter = TransactionsConverter()

transaction_on_network = api.get_transaction("6f006c99e45525c94629db2442d9ca27ff088ad113a09f0a3a3e24bcc164945a")
transaction_outcome = converter.transaction_on_network_to_outcome(transaction_on_network)
```

Now, lets find and parse the event we are interested in.

```py
from multiversx_sdk import TransactionEventsParser, find_events_by_first_topic
from multiversx_sdk.abi import Abi

abi = Abi.load(Path("./contracts/multisig-full.abi.json"))
events_parser = TransactionEventsParser(abi)

[event] = find_events_by_first_topic(transaction_outcome, "startPerformAction")
parsed_event = events_parser.parse_event(event)

print(parsed_event)
```

## Contract queries

In order to perform Smart Contract queries, we recommend the use of `SmartContractQueriesController`.

You will notice that the `SmartContractQueriesController` requires a `QueryRunner` object at initialization. A `NetworkProvider`, slightly adapted, is used to satisfy this requirement (more details about **network providers** can be found in a later section).

```py
from multiversx_sdk import (ProxyNetworkProvider, QueryRunnerAdapter,
                            SmartContractQueriesController)

contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgqqy34h7he2ya6qcagqre7ur7cc65vt0mxrc8qnudkr4")
query_runner = QueryRunnerAdapter(ProxyNetworkProvider("https://devnet-api.multiversx.com"))

query_controller = SmartContractQueriesController(query_runner)

```

If the contract ABI is available, provide it to the controller:

```py
abi = Abi.load(Path("contracts/adder.abi.json"))
query_controller = SmartContractQueriesController(query_runner, abi)
```

Query the contract as follows:

```py
data_parts = query_controller.query(
    contract=contract.to_bech32(),
    function="getSum",
    arguments=[],
)

print("Return data (parsed):", data_parts)
```

For finer control, first create a contract query, then run it and parse the outcome at a later time:

```py
query = query_controller.create_query(
    contract=contract.to_bech32(),
    function="getSum",
    arguments=[],
)

response = query_controller.run_query(query)
data_parts = query_controller.parse_query_response(response)

print("Return code:", response.return_code)
print("Return data (raw):", response.return_data_parts)
print("Return data (parsed):", data_parts)
```

## Creating wallets

Mnemonic generation is based on [`trezor/python-mnemonic`](https://github.com/trezor/python-mnemonic) and can be achieved as follows:

```py
from multiversx_sdk import Mnemonic

mnemonic = Mnemonic.generate()
words = mnemonic.get_words()

print(words)
```

The mnemonic can be saved to a keystore file:

```py
from pathlib import Path
from multiversx_sdk import UserWallet

path = Path("./output")
if not path.exists():
    path.mkdir(parents=True, exist_ok=True)

wallet = UserWallet.from_mnemonic(mnemonic.get_text(), "password")
wallet.save(path / "walletWithMnemonic.json")
```

Given a mnemonic, one can derive keypairs:

```py
secret_key = mnemonic.derive_key(0)
public_key = secret_key.generate_public_key()

print("Secret key:", secret_key.hex())
print("Public key:", public_key.hex())
```

A keypair can be saved as a JSON wallet:

```py
path = Path("./output")
if not path.exists():
    path.mkdir(parents=True, exist_ok=True)

wallet = UserWallet.from_secret_key(secret_key, "password")
wallet.save(path / "wallet.json", address_hrp="erd")
```

... or as a PEM wallet (usually not recommended):

```py
from multiversx_sdk import Address, UserPEM

path = Path("./output")
if not path.exists():
    path.mkdir(parents=True, exist_ok=True)

label = Address(public_key.buffer, "erd").to_bech32()
pem = UserPEM(label=label, secret_key=secret_key)
pem.save(path / "wallet.pem")
```

## Loading wallets

This is not a very common use-case - you might refer to [signing objects](#signing-objects) instead.

Load a keystore that holds an **encrypted mnemonic** (and perform wallet derivation at the same time):

```py
from multiversx_sdk import UserWallet

secret_key = UserWallet.load_secret_key(Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"), "password", address_index=0)
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

Load a keystore that holds an **encrypted secret** key:

```py
secret_key = UserWallet.load_secret_key(Path("../multiversx_sdk/testutils/testwallets/alice.json"), "password")
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

Load the secret key from a PEM file:

```py
from multiversx_sdk import UserPEM

pem = UserPEM.from_file(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

print("Secret key:", pem.secret_key.hex())
print("Public key:", pem.public_key.hex())
```

## Signing objects

Creating a `UserSigner` from a JSON wallet:

```py
from multiversx_sdk import UserSigner

signer = UserSigner.from_wallet(Path("../multiversx_sdk/testutils/testwallets/alice.json"), "password")
```

Creating a `UserSigner` from a PEM file:

```py
signer = UserSigner.from_pem_file(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
```

Signing a transaction:

```py
from multiversx_sdk import Transaction, TransactionComputer

tx = Transaction(
    nonce=90,
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

transaction_computer = TransactionComputer()

tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx))
print("Signature:", tx.signature.hex())
```

Signing an arbitrary message:

```py
from multiversx_sdk import Message, MessageComputer

signer_address = signer.get_pubkey().to_address(hrp="erd")
message = Message(b"hello")
message_computer = MessageComputer()

message.signature = signer.sign(message_computer.compute_bytes_for_signing(message))

print("Signature:", message.signature.hex())
```

## Verifying signatures

Creating a `UserVerifier`:

```py
from multiversx_sdk import Address, UserVerifier

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

alice_verifier = UserVerifier.from_address(alice)
bob_verifier = UserVerifier.from_address(bob)
```

Verifying a signature:

```py
from multiversx_sdk import MessageComputer, TransactionComputer

transaction_computer = TransactionComputer()
message_computer = MessageComputer()

print(f"Is signature of Alice?", alice_verifier.verify(transaction_computer.compute_bytes_for_signing(tx), tx.signature))
print(f"Is signature of Alice?", alice_verifier.verify(message_computer.compute_bytes_for_verifying(message), message.signature))
print(f"Is signature of Bob?", bob_verifier.verify(transaction_computer.compute_bytes_for_signing(tx), tx.signature))
print(f"Is signature of Bob?", bob_verifier.verify(message_computer.compute_bytes_for_verifying(message), message.signature))
```

## Creating network providers

It's recommended to use the `multiversx_sdk_network_providers` components **as a starting point**. As your application matures, switch to using your own network provider (e.g. deriving from the default ones), tailored to your requirements.

Creating an API provider:

```py
from multiversx_sdk import ApiNetworkProvider

provider = ApiNetworkProvider("https://devnet-api.multiversx.com")
```

Creating a Proxy provider:

```py
from multiversx_sdk import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
```

## Fetching network parameters

In order to fetch network parameters, do as follows:

```py
config = provider.get_network_config()

print("Chain ID:", config.chain_id)
print("Min gas price:", config.min_gas_price)
```

## Fetching account state

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account:

```py
account_on_network = provider.get_account(alice)

print("Nonce:", account_on_network.nonce)
print("Balance:", account_on_network.balance)
```

When sending a number of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```py
from multiversx_sdk import AccountNonceHolder

nonce_holder = AccountNonceHolder(account_on_network.nonce)

tx.nonce = nonce_holder.get_nonce_then_increment()
# Then, sign & broadcast the transaction(s).
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

## Broadcasting transactions

Broadcast a single transaction:

```py
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

tx = Transaction(
    sender=alice.to_bech32(),
    receiver=alice.to_bech32(),
    gas_limit=50000,
    chain_id="D"
)

alice_on_network = provider.get_account(alice)

tx.nonce = alice_on_network.nonce
tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx))

hash = provider.send_transaction(tx)
print("Transaction hash:", hash)
```

Broadcast multiple transactions:

```py
tx_1 = Transaction(
    sender=alice.to_bech32(),
    receiver=alice.to_bech32(),
    gas_limit=50000,
    chain_id="D"
)

tx_2 = Transaction(
    sender=alice.to_bech32(),
    receiver=alice.to_bech32(),
    gas_limit=50000,
    chain_id="D"
)

tx_3 = Transaction(
    sender=alice.to_bech32(),
    receiver=alice.to_bech32(),
    gas_limit=50000,
    chain_id="D"
)

alice_on_network = provider.get_account(alice)
nonce_holder = AccountNonceHolder(account_on_network.nonce)

tx_1.nonce = nonce_holder.get_nonce_then_increment()
tx_2.nonce = nonce_holder.get_nonce_then_increment()
tx_3.nonce = nonce_holder.get_nonce_then_increment()

tx_1.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx_1))
tx_2.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx_2))
tx_3.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx_3))

hashes = provider.send_transactions([tx_1, tx_2, tx_3])
print("Transactions hashes:", hashes)
```

Now let's fetch a previously-broadcasted transaction:

```py
tx_on_network = provider.get_transaction("9270a6879b682a7b310c659f58b641ccdd5f083e5633669817130269e5b0939b", with_process_status=True)
print("Status:", tx_on_network.status)
print("Is completed:", tx_on_network.is_completed)
```
<!-- END_NOTEBOOK -->
