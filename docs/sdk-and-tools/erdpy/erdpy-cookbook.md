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
pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-core.git@v0.1.0#egg=erdpy_core

pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-wallet.git@v0.1.0#egg=erdpy_wallet

pip3 install git+https://git@github.com/ElrondNetwork/sdk-erdpy-network-providers.git@v0.1.0#egg=erdpy_network_providers
```

## Core components

:::important
Documentation in this section is preliminary and subject to change.
:::

## Wallet components

In order to use erdpy's wallet components, reference the following package in your `requirements.txt`:

```
git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-wallet.git@v0.1.0#egg=erdpy_wallet
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

... or as a PEM wallet (not recommended):

```
from erdpy_wallet import pem

pem.write("wallet.pem", secret_key.buffer, public_key.buffer)
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

From a PEM file:

```
from erdpy_wallet import pem

buffer, _ = pem.parse(path, index)
secret_key = UserSecretKey(buffer)
public_key = secret_key.generate_public_key()

print("Secret key", secret_key.hex())
print("Public key", public_key.hex())
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


Signable objects (message or transaction) must adhere to the following interface:

```
class ISignable(Protocol):
    def serialize_for_signing(self) -> bytes:
        return bytes()
```

Both `Transaction` and `Message`, defined in `erdpy_core`, implement `ISignable`.

Signing a transaction:

```
from erdpy_core import Transaction

tx = Transaction(...)
signature = signer.sign(tx)
tx.set_signature(signature)
```

Signing an arbitrary message:

```
from erdpy_core import Message

message = Message.from_string("hello")
signature = signer.sign(message)
message.set_signature(message)
```

### Verifying signatures

Creating a `UserVerifier`:

```
from erdpy_wallet import UserVerifier

verifier = UserVerifier.from_address(Address.from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"))
```

For objects to support signature verification, they must adhere to the following interface:

```
class IVerifiable(Protocol):
    def serialize_for_signing(self) -> bytes:
        return bytes()

    def get_signature(self) -> ISignature:
        return bytes()
```

Both `Transaction` and `Message`, defined in `erdpy_core`, implement `IVerifiable`.

Verifying a signature:

```
is_ok = verifier.verify(verifiableObject)
print(is_ok)
```

## Network providers

:::important
Documentation in this section is preliminary and subject to change.
:::
