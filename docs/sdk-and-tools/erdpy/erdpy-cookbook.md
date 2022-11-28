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

## Wallet components

In order to use erdpy's wallet components, reference the following package in your `requirements.txt`:

```
git+https://git@github.com/ElrondNetwork/sdk-erdpy-eggs-wallet.git@v0.1.0#egg=erdpy_wallet
```

### Creating wallets

Mnemonic generation is based on [`trezor/python-mnemonic`](https://github.com/trezor/python-mnemonic) and is performed as follows:

```
from erdpy_wallet.mnemonic import Mnemonic

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
wallet = UserWallet(secret_key, "password")
wallet.save("wallet.json")
```

... or as a PEM wallet (not recommended):

```
from erdpy_wallet import pem

pem.write("wallet.pem", secret_key.buffer, public_key.buffer)
```

### Creating a `UserSigner`

From a PEM file:

```
signer = UserSigner.from_pem_file(Path("alice.pem")
```

From a JSON wallet:

```
signer = UserSigner.from_wallet(Path("alice.json", "password")
```

