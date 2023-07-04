---
id: sdk-py-cookbook
title: Cookbook
---

[comment]: # (mx-abstract)

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

[comment]: # (mx-context-auto)

## Addresses

Create an `Address` object from a _bech32-encoded_ string:

```
from multiversx_sdk_core import Address

address = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print("Address (bech32-encoded)", address.bech32())
print("Public key (hex-encoded):", address.hex())
print("Public key (hex-encoded):", address.pubkey.hex())
```

... or from a _hex-encoded_ string - note that you have to provide the address prefix, also known as the **HRP** (_human-readable part_ of the address):

```
address = Address.from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1", "erd");
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
address = factory.create_from_pubkey(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

Addresses can be converted from one representation to another as follows:

```
print(address.bech32())
print(address.hex())
```

... or using a converter:

```
from multiversx_sdk_core import AddressConverter

converter = AddressConverter("erd")

pubkey = converter.bech32_to_pubkey("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bech32 = converter.pubkey_to_bech32(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

Getting the shard of an address:

```
print("Shard:", address.get_shard())
```

Checking whether an address is a smart contract:

```
address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

print("Is contract:", address.is_smart_contract())
```

[comment]: # (mx-context-auto)

## EGLD / ESDT transfers

Create an EGLD transfer:

```
from multiversx_sdk_core import Address, TokenPayment, Transaction

tx = Transaction(
    nonce=90,
    sender=Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    receiver=Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=TokenPayment.egld_from_amount("1.0"),
    gas_limit=50000,
    gas_price=1000000000,
    chain_id="D",
    version=1
)

print(tx.to_dictionary())
```

We'll see later how to [sign](#signing-objects) and [broadcast](#broadcasting-transactions) a transaction.

Create an EGLD transfer, but this time with a payload (data):

```
from multiversx_sdk_core import TransactionPayload

data = TransactionPayload.from_str("for the book")

tx = Transaction(
    nonce=91,
    sender=Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    receiver=Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=TokenPayment.egld_from_amount("3.0"),
    data=data,
    gas_limit=50000 + 1500 * data.length(),
    gas_price=1000000000,
    chain_id="D",
    version=1
)

print(tx.to_dictionary())
```

Alternatively, we can create an EGLD transfer using a **transaction builder** (as we will see below, transaction builders are more commonly used). But before that, we have to create a configuration object (for any builder that we might use):

```
from multiversx_sdk_core.transaction_builders import DefaultTransactionBuildersConfiguration

config = DefaultTransactionBuildersConfiguration(chain_id="D")
```

The **transaction builder** is parametrized at instantiation, and the transaction is obtained by invoking the `build()` method:

```
from multiversx_sdk_core.transaction_builders import EGLDTransferBuilder

alice = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")
payment = TokenPayment.egld_from_amount("1.00")

# With "data" field
builder = EGLDTransferBuilder(
    config=config,
    sender=alice,
    receiver=bob,
    payment=payment,
    data="for the book",
    # Nonce can be set now, or later, prior signing
    nonce=42
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a single ESDT transfer:

```
from multiversx_sdk_core.transaction_builders import ESDTTransferBuilder

payment = TokenPayment.fungible_from_amount("TEST-8b028f", "100.00", 2)

builder = ESDTTransferBuilder(
    config=config,
    sender=alice,
    receiver=bob,
    payment=payment
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a single NFT transfer:

```
from multiversx_sdk_core.transaction_builders import ESDTNFTTransferBuilder

payment = TokenPayment.non_fungible("TEST-38f249", 1)

builder = ESDTNFTTransferBuilder(
    config=config,
    sender=alice,
    destination=bob,
    payment=payment
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a single SFT transfer (almost the same as above, the only difference being that for the token payment object we additionally use a quantity, as an integer):

```
payment = TokenPayment.semi_fungible("SEMI-9efd0f", 1, 5)

builder = ESDTNFTTransferBuilder(
    config=config,
    sender=alice,
    destination=bob,
    payment=payment
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a multiple ESDT / NFT transfer:

```
from multiversx_sdk_core.transaction_builders import MultiESDTNFTTransferBuilder

payment_one = TokenPayment.non_fungible("TEST-38f249", 1)
payment_two = TokenPayment.fungible_from_amount("BAR-c80d29", "10.00", 18)

builder = MultiESDTNFTTransferBuilder(
    config=config,
    sender=alice,
    destination=bob,
    payments=[payment_one, payment_two]
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

[comment]: # (mx-context-auto)

## Contract deployments and interactions

Create a transaction to deploy a smart contract:

```
from pathlib import Path

from multiversx_sdk_core import CodeMetadata
from multiversx_sdk_core.transaction_builders import ContractDeploymentBuilder

metadata = CodeMetadata(upgradeable=True, readable=True, payable=True, payable_by_contract=True)

builder = ContractDeploymentBuilder(
    config,
    owner=alice,
    deploy_arguments=[42, "test"],
    code_metadata=metadata,
    code=Path("./contracts/contract.wasm").read_bytes(),
    gas_limit=10000000
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a transaction to upgrade an existing smart contract:

```
from multiversx_sdk_core.transaction_builders import ContractUpgradeBuilder

contract_address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")
owner = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
metadata = CodeMetadata(upgradeable=True, readable=True, payable=True, payable_by_contract=True)

builder = ContractUpgradeBuilder(
    config,
    contract=contract_address,
    owner=owner,
    upgrade_arguments=[42, "test"],
    code_metadata=metadata,
    code=Path("./contracts/contract.wasm").read_bytes(),
    gas_limit=10000000
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Create a transaction that invokes a smart contract function:

```
from multiversx_sdk_core.transaction_builders import ContractCallBuilder

contract_address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

builder = ContractCallBuilder(
    config,
    contract=contract_address,
    function_name="foo",
    caller=alice,
    call_arguments=[42, "test", bob],
    gas_limit=10000000
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

Now, let's create a call that also transfers one or more tokens (**transfer & execute**):

```
transfers = [
    TokenPayment.non_fungible("TEST-38f249", 1),
    TokenPayment.fungible_from_amount("BAR-c80d29", "10.00", 18)
]

builder = ContractCallBuilder(
    config,
    contract=contract_address,
    function_name="hello",
    caller=alice,
    call_arguments=[42, "test", bob],
    gas_limit=10000000,
    esdt_transfers=transfers
)

tx = builder.build()
print("Transaction:", tx.to_dictionary())
print("Transaction data:", tx.data)
```

[comment]: # (mx-context-auto)

## Contract queries

In order to create a contract query and run it against a network provider (more details about **network providers** can be found below), do as follows:

```
from multiversx_sdk_core import ContractQueryBuilder
from multiversx_sdk_core.interfaces import IAddress
from multiversx_sdk_network_providers import ApiNetworkProvider

contract: IAddress = Address.from_bech32("erd1qqqqqqqqqqqqqpgqnzm7yhayarylux045qlm4lgzmtcsgrqg396qr9kupx")

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

[comment]: # (mx-context-auto)

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

print("Secret key", secret_key.hex())
print("Public key", public_key.hex())
```

A keypair can be saved as a JSON wallet:

```
wallet = UserWallet.from_secret_key(secret_key, "password")
wallet.save(Path("./output/wallet.json"), address_hrp="erd")
```

... or as a PEM wallet (usually not recommended):

```
from multiversx_sdk_wallet import UserPEM

label = Address(public_key.buffer, "erd").bech32()
pem = UserPEM(label=label, secret_key=secret_key)
pem.save(Path("./output/wallet.pem"))
```

[comment]: # (mx-context-auto)

## Loading wallets

This is not a very common use-case - you might refer to [signing objects](#signing-objects) instead.

Load a keystore that holds an **encrypted mnemonic** (and perform wallet derivation at the same time):

```
from multiversx_sdk_wallet import UserWallet

secret_key = UserWallet.load_secret_key(Path("./testwallets/withMnemonic.json"), "password", address_index=0)
address = secret_key.generate_public_key().to_address("erd")

print("Secret key", secret_key.hex())
print("Address", address)
```

Load a keystore that holds an **encrypted secret** key:

```
secret_key = UserWallet.load_secret_key(Path("./testwallets/alice.json"), "password")
address = secret_key.generate_public_key().to_address("erd")

print("Secret key", secret_key.hex())
print("Address", address)
```

Load the secret key from a PEM file:

```
from multiversx_sdk_wallet import UserPEM

pem = UserPEM.from_file(Path("./testwallets/alice.pem"))

print("Secret key", pem.secret_key.hex())
print("Public key", pem.public_key.hex())
```

[comment]: # (mx-context-auto)

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

Signable objects (messages, transactions) must adhere to the following interface:

```
class ISignable(Protocol):
    def serialize_for_signing(self) -> bytes: ...
```

Both `Transaction` and `Message` - defined in `multiversx_sdk_core` - implement `ISignable`.

Signing a transaction:

```
from multiversx_sdk_core import Transaction

tx = Transaction(
    nonce=90,
    sender=Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"),
    receiver=Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=TokenPayment.egld_from_amount("1.0"),
    gas_limit=50000,
    gas_price=1000000000,
    chain_id="D",
    version=1
)

tx.signature = signer.sign(tx)
print("Signature", tx.signature.hex())
```

Signing an arbitrary message:

```
from multiversx_sdk_core import MessageV1

message = MessageV1.from_string("hello")
message.signature = signer.sign(message)

print("Signature", message.signature.hex())
```

[comment]: # (mx-context-auto)

## Verifying signatures

Creating a `UserVerifier`:

```
from multiversx_sdk_core import Address
from multiversx_sdk_wallet import UserVerifier

alice = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")
alice_verifier = UserVerifier.from_address(alice)
bob_verifier = UserVerifier.from_address(bob)
```

For objects to support signature verification, they must adhere to the following interface:

```
class IVerifiable(Protocol):
    signature: ISignature
    def serialize_for_signing(self) -> bytes: ...
```

Both `Transaction` and `Message` - defined in `multiversx_sdk_core` - implement `IVerifiable`.

Verifying a signature:

```
print(f"Is signature of Alice?", alice_verifier.verify(tx))
print(f"Is signature of Alice?", alice_verifier.verify(message))
print(f"Is signature of Bob?", bob_verifier.verify(tx))
print(f"Is signature of Bob?", bob_verifier.verify(message))
```

[comment]: # (mx-context-auto)

## Creating network providers

It's recommended to use the `multiversx_sdk_network_providers` components **as a starting point**. As your application matures, switch to using your own network provider (e.g. deriving from the default ones), tailored to your requirements.

Creating an API provider:

```
from multiversx_sdk_network_providers import ApiNetworkProvider

provider = ApiNetworkProvider("https://devnet-api.multiversx.com");
```

Creating a Proxy provider:

```
from multiversx_sdk_network_providers import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.multiversx.com");
```

[comment]: # (mx-context-auto)

## Fetching network parameters

In order to fetch network parameters, do as follows:

```
config = provider.get_network_config();

print("Chain ID", config.chain_id);
print("Min gas price:", config.min_gas_price);
```

[comment]: # (mx-context-auto)

## Fetching account state

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account:

```
account_on_network = provider.get_account(alice)

print("Nonce", account_on_network.nonce)
print("Balance", account_on_network.balance)
```

When sending a number of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
from multiversx_sdk_core import AccountNonceHolder

nonce_holder = AccountNonceHolder(account_on_network.nonce)

tx.nonce = nonce_holder.get_nonce_then_increment()
# Then, sign & broadcast the transaction(s).
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

[comment]: # (mx-context-auto)

## Broadcasting transactions

Broadcast a single transaction:

```
alice = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

tx = Transaction(
    sender=alice,
    receiver=alice,
    gas_limit=50000,
    chain_id="D"
)

alice_on_network = provider.get_account(alice)

tx.nonce = alice_on_network.nonce
tx.signature = signer.sign(tx)

hash = provider.send_transaction(tx)
print("Transaction hash:", hash)
```

Broadcast multiple transactions:

```
tx_1 = Transaction(
    sender=alice,
    receiver=alice,
    gas_limit=50000,
    chain_id="D"
)

tx_2 = Transaction(
    sender=alice,
    receiver=alice,
    gas_limit=50000,
    chain_id="D"
)

tx_3 = Transaction(
    sender=alice,
    receiver=alice,
    gas_limit=50000,
    chain_id="D"
)

alice_on_network = provider.get_account(alice)
nonce_holder = AccountNonceHolder(account_on_network.nonce)

tx_1.nonce = nonce_holder.get_nonce_then_increment()
tx_2.nonce = nonce_holder.get_nonce_then_increment()
tx_3.nonce = nonce_holder.get_nonce_then_increment()

tx_1.signature = signer.sign(tx_1)
tx_2.signature = signer.sign(tx_2)
tx_3.signature = signer.sign(tx_3)

hashes = provider.send_transactions([tx_1, tx_2, tx_3])
print("Transactions hashes:", hashes)
```

Now let's fetch a previously-broadcasted transaction:

```
tx_on_network = provider.get_transaction("09e3b68d39f3759913239b927c7feb9ac871c8877e76bc56e1be45a2a597eb53")
print("Status:", tx_on_network.status)
print("Is completed:", tx_on_network.is_completed)
```
<!-- END_NOTEBOOK -->
