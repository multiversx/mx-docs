---
id: keystore
title: MultiversX Smart Contracts
---

[comment]: # (mx-abstract)

A keystore is a mechanism for storing private keys. It is a JSON file that encrypts a private key and is the standard for interchanging keys between devices as until a user provides their password, their key is safe.

Before continuing, please read this reference: [ERC-2335: BLS12-381 Keystore](https://eips.ethereum.org/EIPS/eip-2335).

[comment]: # (mx-context-auto)

## MultiversX Keystore

**How does a MultiversX Keystore look like?**

If you were to open Alice's keystore, it would look like this:

```json
{
    "version": 4,
    "id": "0dc10c02-b59b-4bac-9710-6b2cfa4284ba",
    "address": "0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1",
    "bech32": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
    "crypto": {
        "ciphertext": "4c41ef6fdfd52c39b1585a875eb3c86d30a315642d0e35bb8205b6372c1882f135441099b11ff76345a6f3a930b5665aaf9f7325a32c8ccd60081c797aa2d538",
        "cipherparams": {
            "iv": "033182afaa1ebaafcde9ccc68a5eac31"
        },
        "cipher": "aes-128-ctr",
        "kdf": "scrypt",
        "kdfparams": {
            "dklen": 32,
            "salt": "4903bd0e7880baa04fc4f886518ac5c672cdc745a6bd13dcec2b6c12e9bffe8d",
            "n": 4096,
            "r": 8,
            "p": 1
        },
        "mac": "5b4a6f14ab74ba7ca23db6847e28447f0e6a7724ba9664cf425df707a84f5a8b"
    }
}
```

At first, you will see an unappealing JSON file, which appears to contain magic parameters used for numerous complex cryptographic operations with unclear and vague purpose. But if you dig a little deeper you will see that it contains:

- **ciphertext** - Your MultiversX private key encrypted using the “cipher” algorithm below;
- **cipher** - The name of a symmetric AES algorithm;
- **cipherparams** - The parameters required for the “cipher” algorithm above;
- **kdf** - A Key Derivation Function used to let you encrypt your keystore file with a password;
- **kdfparams** - The parameters required for the “kdf” algorithm above;
- **mac** - A code used to verify your password.
