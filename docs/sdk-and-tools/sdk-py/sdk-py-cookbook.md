---
id: sdk-py-cookbook
title: Cookbook
---

[comment]: # "mx-abstract"
[comment]: # "mx-context-auto"

## Overview

This page will guide you through the process of handling common tasks using the MultiversX Python SDK (libraries).

:::note
All examples depicted here are captured in **(interactive) [Jupyter notebooks](https://github.com/multiversx/mx-sdk-py-examples)**.
:::

We are going to make use of the packages [multiversx-sdk-core](https://github.com/multiversx/mx-sdk-py-core), [multiversx-sdk-wallet](https://github.com/multiversx/mx-sdk-py-wallet) and [multiversx-sdk-network-providers](https://github.com/multiversx/mx-sdk-py-network-providers) (available as of January 2023), which were previously nicknamed _erdpy-eggs_. These packages can be installed directly from GitHub or from [**PyPI**](https://pypi.org/user/MultiversX).

Example for installing the packages directly from GitHub, using a `requirements.txt` file:

```
git+https://git@github.com/multiversx/mx-sdk-py-core.git@v1.2.3#egg=multiversx_sdk_core
git+https://git@github.com/multiversx/mx-sdk-py-wallet.git@v4.5.6#egg=multiversx_sdk_wallet
git+https://git@github.com/multiversx/mx-sdk-py-network-providers.git@v7.8.9#egg=multiversx_sdk_network_providers
```

These packages are distributed separately and have individual release schedules (make sure to check the **release tags on GitHub**), but they are designed to work together, with as little impedance mismatch as possible.

:::important
Documentation is preliminary and subject to change (the packages might suffer a series of breaking changes in 2023).
:::

<!-- BEGIN_NOTEBOOK { "url": "https://raw.githubusercontent.com/multiversx/mx-sdk-py-examples/main/Cookbook.ipynb" } -->

[comment]: # "mx-context-auto"

## Addresses

Create an `Address` object from a _bech32-encoded_ string:

```
from multiversx_sdk_core import Address

address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print("Address (bech32-encoded)", address.to_bech32())
print("Public key (hex-encoded):", address.to_hex())
print("Public key (hex-encoded):", address.pubkey.hex())
```

... or from a _hex-encoded_ string - note that you have to provide the address prefix, also known as the **HRP** (_human-readable part_ of the address):

```
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1", "erd")
```

... or from a raw public key:

```
pubkey = bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = Address(pubkey, "erd")
```

Alternatively, you can use an `AddressFactory` (initialized with a specific **HRP**) to create addresses:

```
from multiversx_sdk_core import AddressFactory

factory = AddressFactory("erd")

address = factory.create_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
address = factory.create_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = factory.create_from_public_key(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

Addresses can be converted from one representation to another as follows:

```
print(address.to_bech32())
print(address.to_hex())
```

Getting the shard of an address:

```
from multiversx_sdk_core import AddressComputer

address_computer = AddressComputer(number_of_shards=3)
print("Shard:", address_computer.get_shard_of_address(address))
```

Checking whether an address is a smart contract:

```
address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

print("Is contract:", address.is_smart_contract())
```

[comment]: # "mx-context-auto"

## EGLD / ESDT transfers

Create an EGLD transfer:

```
from multiversx_sdk_core import Transaction

transaction = Transaction(
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    gas_limit=50000,
    chain_id="D",
    nonce=77,
    amount=1000000000000000000
)

print(transaction.__dict__)
```

In case you are using a **guarded** account you should also populate the `guardian` and `guardian_signature` fields after creating the transaction.

We'll see later how to [sign](#signing-objects) and [broadcast](#broadcasting-transactions) a transaction.

Create an EGLD transfer, but this time with a payload (data):

```
transaction = Transaction(
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    gas_limit=50000,
    chain_id="D",
    nonce=77,
    amount=1000000000000000000,
    data=b"for the book"
)

print(transaction.__dict__)
```

Alternatively, we can create an EGLD transfer using a **transaction factory** (as we will see below, transaction factories are more commonly used). But before that, we have to create a configuration object (for any factory that we might use):

```
from multiversx_sdk_core.transaction_factories import TransactionsFactoryConfig

config = TransactionsFactoryConfig(chain_id="D")
```

The **transaction factory** is parametrized at instantiation, and the transaction is obtained by invoking the `create_transaction...` method:

```
from multiversx_sdk_core import TokenComputer
from multiversx_sdk_core.transaction_factories import TransferTransactionsFactory

transfer_factory = TransferTransactionsFactory(config, TokenComputer())
alice = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

# With "data" field
transaction = transfer_factory.create_transaction_for_native_token_transfer(
    sender=alice,
    receiver=bob,
    native_amount=1000000000000000000,
    data="for the book"
)

print("Transaction:", transaction.__dict__)
print("Transaction data:", transaction.data)
```

Create a single ESDT transfer:

```
from multiversx_sdk_core import Token, TokenTransfer

token = Token("TEST-8b028f")
transfer = TokenTransfer(token, 10000)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction.__dict__)
print("Transaction data:", transaction.data)
```

Create a single NFT transfer:

Keep in mind, since we are sending a NFT, we `should` set the amount to `1`.

```
token = Token(identifier="TEST-38f249", nonce=1)
transfer = TokenTransfer(token=token, amount=1)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction.__dict__)
print("Transaction data:", transaction.data)
```

Create a single SFT transfer (almost the same as above, the only difference being that for the transfer we set the desired amount, as an integer):

```
token = Token(identifier="SEMI-9efd0f", nonce=1)
transfer = TokenTransfer(token=token, amount=5)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[transfer]
)

print("Transaction:", transaction.__dict__)
print("Transaction data:", transaction.data)
```

Create a multiple ESDT / NFT transfer:

```
first_token = Token(identifier="TEST-38f249", nonce=1)
first_transfer = TokenTransfer(token=first_token, amount=1)

second_token = Token(identifier="BAR-c80d29")
second_transfer = TokenTransfer(token=second_token, amount=10000000000000000000)

transaction = transfer_factory.create_transaction_for_esdt_token_transfer(
    sender=alice,
    receiver=bob,
    token_transfers=[first_transfer, second_transfer]
)

print("Transaction:", transaction.__dict__)
print("Transaction data:", transaction.data)
```

[comment]: # "mx-context-auto"

## Relayed Transactions

First, we get the newtwork configuration using the network providers.

```
from multiversx_sdk_network_providers import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
network_config = provider.get_network_config()
```

[comment]: # "mx-context-auto"

### Relayed V1

```
from pathlib import Path
from multiversx_sdk_core.transaction_builders.relayed_v1_builder import RelayedTransactionV1Builder
from multiversx_sdk_core import Transaction, TransactionComputer, Address
from multiversx_sdk_wallet.user_signer import UserSigner

signer = UserSigner.from_pem_file(Path("./testwallets/bob.pem"))
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

relayed_builder = RelayedTransactionV1Builder()
relayed_builder.set_inner_transaction(inner_tx)
relayed_builder.set_relayer_nonce(2627)
relayed_builder.set_network_config(network_config)
relayed_builder.set_relayer_address(Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"))

relayed_tx = relayed_builder.build()
print(relayed_tx.__dict__)
```

[comment]: # "mx-context-auto"

### Relayed V2

```
from multiversx_sdk_core.transaction_builders.relayed_v2_builder import RelayedTransactionV2Builder
from multiversx_sdk_wallet.user_signer import UserSigner

signer = UserSigner.from_pem_file(Path("./testwallets/bob.pem"))

inner_tx = Transaction(
            chain_id=network_config.chain_id,
            sender="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
            receiver="erd1qqqqqqqqqqqqqpgqqczn0ccd2gh8eqdswln7w9vzctv0dwq7d8ssm4y34z",
            gas_limit=0,
            nonce=15,
            data=b"add@05"
        )
inner_tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(inner_tx))

builder = RelayedTransactionV2Builder()
builder.set_inner_transaction(inner_tx)
builder.set_inner_transaction_gas_limit(60_000_000)
builder.set_relayer_nonce(37)
builder.set_network_config(network_config)
builder.set_relayer_address(Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"))

relayed_tx = builder.build()
print(relayed_tx.__dict__)
```

[comment]: # "mx-context-auto"

## Contract deployments and interactions

Create a transaction to deploy a smart contract:

```
from pathlib import Path
from multiversx_sdk_core.transaction_factories import SmartContractTransactionsFactory

sc_factory = SmartContractTransactionsFactory(config, TokenComputer())
bytecode = Path("./contracts/counter.wasm").read_bytes()

deploy_transaction = sc_factory.create_transaction_for_deploy(
    sender=alice,
    bytecode=bytecode,
    arguments=[42, "test"],
    gas_limit=10000000,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

print("Transaction:", deploy_transaction.__dict__)
print("Transaction data:", deploy_transaction.data)
```

Create a transaction to upgrade an existing smart contract:

```
contract_address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")
bytecode = Path("./contracts/counter.wasm").read_bytes()

upgrade_transaction = sc_factory.create_transaction_for_upgrade(
    sender=alice,
    contract=contract_address,
    bytecode=bytecode,
    gas_limit=10000000,
    arguments=[42, "test"],
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

print("Transaction:", upgrade_transaction.__dict__)
print("Transaction data:", upgrade_transaction.data)
```

Create a transaction that invokes a smart contract function:

```
contract_address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

call_transaction = sc_factory.create_transaction_for_execute(
    sender=alice,
    contract=contract_address,
    function="foo",
    gas_limit=10000000,
    arguments=[42, "test"]
)

print("Transaction:", call_transaction.__dict__)
print("Transaction data:", call_transaction.data)
```

Now, let's create a call that also transfers one or more tokens (**transfer & execute**):

```
first_token = Token("TEST-38f249", 1)
first_transfer = TokenTransfer(first_token, 1)

second_token = Token("BAR-c80d29")
second_transfer = TokenTransfer(second_token, 10000000000000000000)

transfers = [first_transfer, second_transfer]

call_transaction = sc_factory.create_transaction_for_execute(
    sender=alice,
    contract=contract_address,
    function="hello",
    gas_limit=10000000,
    arguments=[42, "test"],
    token_transfers=transfers
)

print("Transaction:", call_transaction.__dict__)
print("Transaction data:", call_transaction.data)
```

[comment]: # "mx-context-auto"

## Contract queries

In order to create a contract query and run it against a network provider (more details about **network providers** can be found below), do as follows:

```
from multiversx_sdk_core import ContractQueryBuilder
from multiversx_sdk_core.interfaces import IAddress
from multiversx_sdk_network_providers import ApiNetworkProvider

contract: IAddress = Address.from_bech32("erd1qqqqqqqqqqqqqpgqqy34h7he2ya6qcagqre7ur7cc65vt0mxrc8qnudkr4")

builder = ContractQueryBuilder(
    contract=contract,
    function="getSum",
    call_arguments=[],
    caller=alice
)

query = builder.build()

network_provider = ApiNetworkProvider("https://devnet-api.multiversx.com")
response = network_provider.query_contract(query)

print("Return code:", response.return_code)
print("Return data:", response.return_data)
```

[comment]: # "mx-context-auto"

## Creating wallets

Mnemonic generation is based on [`trezor/python-mnemonic`](https://github.com/trezor/python-mnemonic) and can be achieved as follows:

```
from multiversx_sdk_wallet import Mnemonic

mnemonic = Mnemonic.generate()
words = mnemonic.get_words()

print(words)
```

The mnemonic can be saved to a keystore file:

```
from multiversx_sdk_wallet import UserWallet

wallet = UserWallet.from_mnemonic(mnemonic.get_text(), "password")
wallet.save(Path("./output/walletWithMnemonic.json"))
```

Given a mnemonic, one can derive keypairs:

```
secret_key = mnemonic.derive_key(0)
public_key = secret_key.generate_public_key()

print("Secret key:", secret_key.hex())
print("Public key:", public_key.hex())
```

A keypair can be saved as a JSON wallet:

```
wallet = UserWallet.from_secret_key(secret_key, "password")
wallet.save(Path("./output/wallet.json"), address_hrp="erd")
```

... or as a PEM wallet (usually not recommended):

```
from multiversx_sdk_wallet import UserPEM

label = Address(public_key.buffer, "erd").to_bech32()
pem = UserPEM(label=label, secret_key=secret_key)
pem.save(Path("./output/wallet.pem"))
```

[comment]: # "mx-context-auto"

## Loading wallets

This is not a very common use-case - you might refer to [signing objects](#signing-objects) instead.

Load a keystore that holds an **encrypted mnemonic** (and perform wallet derivation at the same time):

```
from multiversx_sdk_wallet import UserWallet

secret_key = UserWallet.load_secret_key(Path("./testwallets/withMnemonic.json"), "password", address_index=0)
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

Load a keystore that holds an **encrypted secret** key:

```
secret_key = UserWallet.load_secret_key(Path("./testwallets/alice.json"), "password")
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

Load the secret key from a PEM file:

```
from multiversx_sdk_wallet import UserPEM

pem = UserPEM.from_file(Path("./testwallets/alice.pem"))

print("Secret key:", pem.secret_key.hex())
print("Public key:", pem.public_key.hex())
```

[comment]: # "mx-context-auto"

## Signing objects

Creating a `UserSigner` from a JSON wallet:

```
from multiversx_sdk_wallet import UserSigner

signer = UserSigner.from_wallet(Path("./testwallets/alice.json"), "password")
```

Creating a `UserSigner` from a PEM file:

```
signer = UserSigner.from_pem_file(Path("./testwallets/alice.pem"))
```

Signing a transaction:

```
from multiversx_sdk_core import Transaction

tx = Transaction(
    nonce=90,
    sender="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    receiver="erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
    amount=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

transaction_computer = TransactionComputer()

tx.signature = signer.sign(transaction_computer.compute_bytes_for_signing(tx))
print("Signature:", tx.signature.hex())
```

Signing an arbitrary message:

```
from multiversx_sdk_core import Message, MessageComputer

message = Message(b"hello")
message_computer = MessageComputer()

message.signature = signer.sign(message_computer.compute_bytes_for_signing(message))

print("Signature:", message.signature.hex())
```

[comment]: # "mx-context-auto"

## Verifying signatures

Creating a `UserVerifier`:

```
from multiversx_sdk_core import Address
from multiversx_sdk_wallet import UserVerifier

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

alice_verifier = UserVerifier.from_address(alice)
bob_verifier = UserVerifier.from_address(bob)
```

Verifying a signature:

```
from multiversx_sdk_core import TransactionComputer, MessageComputer

transaction_computer = TransactionComputer()
message_computer = MessageComputer()

print(f"Is signature of Alice?", alice_verifier.verify(transaction_computer.compute_bytes_for_signing(tx), tx.signature))
print(f"Is signature of Alice?", alice_verifier.verify(message_computer.compute_bytes_for_signing(message), message.signature))
print(f"Is signature of Bob?", bob_verifier.verify(transaction_computer.compute_bytes_for_signing(tx), tx.signature))
print(f"Is signature of Bob?", bob_verifier.verify(message_computer.compute_bytes_for_signing(message), message.signature))
```

[comment]: # "mx-context-auto"

## Creating network providers

It's recommended to use the `multiversx_sdk_network_providers` components **as a starting point**. As your application matures, switch to using your own network provider (e.g. deriving from the default ones), tailored to your requirements.

Creating an API provider:

```
from multiversx_sdk_network_providers import ApiNetworkProvider

provider = ApiNetworkProvider("https://devnet-api.multiversx.com")
```

Creating a Proxy provider:

```
from multiversx_sdk_network_providers import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
```

[comment]: # "mx-context-auto"

## Fetching network parameters

In order to fetch network parameters, do as follows:

```
config = provider.get_network_config()

print("Chain ID:", config.chain_id)
print("Min gas price:", config.min_gas_price)
```

[comment]: # "mx-context-auto"

## Fetching account state

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account:

```
account_on_network = provider.get_account(alice)

print("Nonce:", account_on_network.nonce)
print("Balance:", account_on_network.balance)
```

When sending a number of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
from multiversx_sdk_core import AccountNonceHolder

nonce_holder = AccountNonceHolder(account_on_network.nonce)

tx.nonce = nonce_holder.get_nonce_then_increment()
# Then, sign & broadcast the transaction(s).
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

[comment]: # "mx-context-auto"

## Broadcasting transactions

Broadcast a single transaction:

```
alice = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

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

```
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

```
tx_on_network = provider.get_transaction("9270a6879b682a7b310c659f58b641ccdd5f083e5633669817130269e5b0939b", with_process_status=True)
print("Status:", tx_on_network.status)
print("Is completed:", tx_on_network.is_completed)
```

<!-- END_NOTEBOOK -->
