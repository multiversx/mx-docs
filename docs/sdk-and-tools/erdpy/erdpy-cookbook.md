---
id: erdpy-cookbook
title: Cookbook
---

This page will guide you through the process of handling common tasks using **erdpy**.

We are going to make use of `erdpy vNext` (currently nicknamed _erdpy-eggs_), which consists of the following packages:

 - `erdpy_core`
 - `erdpy_wallet`
 - `erdpy_network_providers`

These packages should be installed **directly from GitHub**, as opposed to being installed from **PyPI**. For example:

```
pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-core.git@v0.2.0#egg=erdpy_core

pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-wallet.git@v0.2.0#egg=erdpy_wallet

pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-network-providers.git@v0.2.0#egg=erdpy_network_providers
```

## Core components

:::note
Core components are defined in the package `erdpy_core`.
:::

### Addresses

Create an `Address` object from a _bech32-encoded_ string:

```
from erdpy_core import Address

address = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
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
from erdpy_core import AddressFactory

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
from erdpy_core import AddressConverter

converter = AddressConverter("erd")

pubkey = converter.bech32_to_pubkey("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bech32 = converter.pubkey_to_bech32(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

Getting the shard of an address:

```
address = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print(address.get_shard())
```

Checking whether an address is a smart contract:

```
address = Address.from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")

print(address.is_smart_contract())
```

### Transactions

## Wallet components

:::note
Wallet components are defined in the package `erdpy_wallet`.
:::

In order to use erdpy's wallet components, reference the following package in your `requirements.txt`:

```
git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-wallet.git@v0.2.0#egg=erdpy_wallet
```

### Creating wallets

Mnemonic generation is based on [`trezor/python-mnemonic`](https://github.com/trezor/python-mnemonic) and can be achieved as follows:

```
from erdpy_wallet import Mnemonic

mnemonic = Mnemonic.generate()
words = mnemonic.get_words()

print(words)
```

Given a mnemonic, one can derive keypairs:

```
secret_key = mnemonic.derive_key(0)
public_key = secret_key.generate_public_key()

print("Secret key", secret_key.hex())
print("Public key", public_key.hex())
```

A keypair can be saved as a JSON wallet (recommended):

```
from erdpy_wallet import UserWallet

wallet = UserWallet(secret_key, "password")
wallet.save("wallet.json")
```

... or as a PEM wallet (usually not recommended):

```
from erdpy_wallet import UserPEM

pem = UserPEM(label="erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th", secret_key)
pem.save("wallet.pem")
```

### Loading a keypair

:::note
This is not a common use-case. 
:::

From a JSON wallet:

```
from erdpy_wallet import UserWallet

secret_key = UserWallet.decrypt_secret_key_from_file(Path("alice.json"), "password")
public_key = secret_key.generate_public_key()

print("Secret key", secret_key.hex())
print("Public key", public_key.hex())
```

From a PEM file (usually not recommended):

```
from erdpy_wallet import UserPEM

pem = UserPEM.from_file("wallet.pem)

print("Secret key", pem.secret_key.hex())
print("Public key", pem.public_key.hex())
```

### Signing objects

Creating a `UserSigner` from a JSON wallet:

```
from erdpy_wallet import UserSigner

signer = UserSigner.from_wallet(Path("alice.json", "password")
```

Creating a `UserSigner` from a PEM file:

```
signer = UserSigner.from_pem_file(Path("alice.pem")
```

Signable objects (messages, transactions) must adhere to the following interface:

```
class ISignable(Protocol):
    def serialize_for_signing(self) -> bytes: ...
```

Both `Transaction` and `Message` - defined in `erdpy_core` - implement `ISignable`.

Signing a transaction:

```
from erdpy_core import Transaction

tx = Transaction(...)
tx.signature = signer.sign(tx)
```

Signing an arbitrary message:

```
from erdpy_core import Message

message = Message.from_string("hello")
message.signature = signer.sign(message)
```

### Verifying signatures

Creating a `UserVerifier`:

```
from erdpy_core import Address
from erdpy_wallet import UserVerifier

address = Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
verifier = UserVerifier.from_address(address)
```

For objects to support signature verification, they must adhere to the following interface:

```
class IVerifiable(Protocol):
    signature: ISignature
    def serialize_for_signing(self) -> bytes: ...
```

Both `Transaction` and `Message` - defined in `erdpy_core` - implement `IVerifiable`.

Verifying a signature:

```
is_ok = verifier.verify(verifiableObject)
print(is_ok)
```

## Network providers

:::note
Core components are defined in the package `erdpy_network`.
:::

:::important
It's recommended to use the `erdpy_network` components **as a starting point**. As your application matures, **switch to using your own network provider (e.g. deriving from the default ones)**, tailored to your requirements.
:::

Creating an API provider:

```
from erdpy_network import ApiNetworkProvider

provider = ApiNetworkProvider("https://devnet-api.elrond.com");
```

Creating a Proxy provider:

```
from erdpy_network import ProxyNetworkProvider

provider = ProxyNetworkProvider("https://devnet-gateway.elrond.com");
```

### Fetching network parameters

```
config = provider.get_network_config();

print(config.min_gas_price);
print(config.chain_id);
```

### Working with accounts

The following snippet fetches (from the Network) the **nonce** and the **balance** of an account:

```
address = Address.from_bech32("erd1...")
account_on_network = provider.get_account(address)

print(account_on_network.nonce)
print(account_on_network.balance)
```

When sending a bunch of transactions, you usually have to first fetch the account nonce from the network (see above), then manage it locally (e.g. increment upon signing & broadcasting a transaction):

```
from erdpy_core import AccountNonceHolder

nonce_holder = AccountNonceHolder(address)
nonce_holder.nonce = account_on_network.nonce

tx.nonce = nonce_holder.get_nonce_then_increment()
# ... sign transaction
# ... broadcast transaction
```

For further reference, please see [nonce management](/integrators/creating-transactions/#nonce-management).

### Broadcasting transactions

Broadcast a single transaction:

```
hash = provider.send_transaction(tx)
```

Broadcast multiple transactions:

```
hashes = provider.send_transactions([tx1, tx2, tx3])
```

### Wait for transaction completion

:::important
Documentation in this section is preliminary and subject to change.
:::
