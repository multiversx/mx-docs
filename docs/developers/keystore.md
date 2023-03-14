---
id: keystore
title: MultiversX Wallet - Keystore files
---

[comment]: # (mx-abstract)

The keystore is a JSON file that encrypts a mnemonic (seed phrase). Until the user uses their password, the seed phrase remains encrypted, ensuring the safety and security of their transactions. The MultiversX keystore file provides users with a reliable and convenient method for managing their keys, protecting their assets, and ensuring the integrity of their transactions.

[comment]: # (mx-context-auto)

## MultiversX Keystore

**How does a MultiversX Keystore look like?**

Here is an example:

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

- **ciphertext** - Your MultiversX mnemonic or secret key encrypted using the `cipher` algorithm below;
- **cipher** - The name of a symmetric AES algorithm;
- **cipherparams** - The parameters required for the `cipher` algorithm above;
- **kdf** - A key derivation function used to let you encrypt your keystore file with a password;
- **kdfparams** - The parameters required for the `kdf` algorithm above;
- **mac** - A code used to verify your password.

With the advent of the new wallet (February 14th, 2023), newly generated keystore files will hold the encrypted mnemonic, instead of the encrypted secret key. In particular, a new field called **kind** has been added, which can have two values: `secretKey` and `mnemonic`.

When **kind** is set (or not set at all) to `secretKey`, the `ciphertext` field will contain the encrypted secret key, as it did before. However, when **kind** is set to `mnemonic`, the `ciphertext` field will contain the encrypted mnemonic instead. This will allow users to initiate a wallet at any index, not only index 0 as it was before when only the secrey key was encrypted (similar to how it is initiated when using the Ledger device).

Auxiliary reference: [ERC-2335: BLS12-381 Keystore](https://eips.ethereum.org/EIPS/eip-2335).
