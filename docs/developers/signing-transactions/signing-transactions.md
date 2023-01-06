---
id: signing-transactions
title: Signing Transactions
---

How to serialize and sign the Transaction payload

Transactions must be **signed** with the Sender's Private Key before submitting them to the MultiversX Network. Signing is performed with the [Ed25519](https://ed25519.cr.yp.to/) algorithm.

## **General structure**

An _unsigned transaction_ has the following fields:

| Field      | Type   | Required           | Description                                                                    |
| ---------- | ------ | ------------------ | ------------------------------------------------------------------------------ |
| `nonce`    | number | Yes                | The account sequence number                                                    |
| `value`    | string | Yes (can be `"0"`) | The value to transfer, represented in atomic units:`EGLD` times `denomination` |
| `receiver` | string | Yes                | The address of the receiver (bech32 format)                                    |
| `sender`   | string | Yes                | The address of the sender (bech32 format)                                      |
| `gasPrice` | number | Yes                | The gas price to be used in the scope of the transaction                       |
| `gasLimit` | number | Yes                | The maximum number of gas units allocated for the transaction                  |
| `data`     | string | No                 | Arbitrary information about the transaction, **base64-encoded**.               |
| `chainID`  | string | Yes                | The chain identifier.                                                          |
| `version`  | number | Yes                | The version of the transaction (e.g. `1`).                                     |

A signed transaction has the additional **`signature`** field:

| Field     | Type   | Description                                                                                    |
| --------- | ------ | ---------------------------------------------------------------------------------------------- |
| signature | string | The digital signature consisting of 128 hex-characters (thus 64 bytes in a raw representation) |

## **Serialization for signing**

Before signing a transaction, one has to **serialize** it, that is, to obtain its raw binary representation - as a sequence of bytes. This is achieved through the following steps:

1. order the fields of the transaction with respect to their appearance order in the table above (`nonce` is first, `version` is last).
2. discard the `data` field if it's empty.
3. convert the `data` payload to its **base64** representation.
4. obtain a JSON representation (UTF-8 string) of the transaction, maintaining the order of the fields. This JSON representation must contain **no indentation** and **no separating spaces**.
5. encode the resulted JSON (UTF-8) string as a sequence of bytes.

For example, given the transaction:

```
nonce = 7
value = "10000000000000000000"  # 10 EGLD
receiver = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
sender = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
gasPrice = 1000000000
gasLimit = 70000
data = "for the book"
chainID = "1"
version = 1
```

By applying steps 1-3 (step 4 is omitted in this example), one obtains:

```
{"nonce":7,"value":"10000000000000000000","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":70000,"data":"Zm9yIHRoZSBib29r","chainID":"1","version":1}
```

If the transaction has an empty **no data field**:

```
nonce = 8
value = "10000000000000000000"  # 10 ERD
receiver = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
sender = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
gasPrice = 1000000000
gasLimit = 50000
data = ""
chainID = "1"
version = 1
```

Then it's serialized form (step 5 is omitted in this example) is as follows:

```
{"nonce":8,"value":"10000000000000000000","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"chainID":"1","version":1}
```

## **Ed25519 signature**

MultiversX uses the [Ed25519](https://ed25519.cr.yp.to/) algorithm to sign transactions. In order to obtain the signature, one can use generic software libraries such as [PyNaCl](https://pynacl.readthedocs.io/en/stable/signing/), [tweetnacl-js](https://github.com/dchest/tweetnacl-js#signatures) or components of MultiversX SDK such as [mx-sdk-erdjs-walletcore](https://github.com/multiversx/mx-sdk-erdjs-walletcore), [erdpy-wallet](https://github.com/multiversx/mx-sdk-erdpy-wallet), [erdgo](https://github.com/multiversx/mx-sdk-erdgo), [erdjava](https://github.com/multiversx/mx-sdk-erdjava), [erdwalletjs-cli](https://github.com/multiversx/mx-sdk-erdjs-wallet-cli) etc.

The raw signature consisting of 64 bytes has to be **hex-encoded** afterwards and placed in the transaction object.

## **Ready to broadcast**

Once the `signature` field is set as well, the transaction is ready to be broadcasted. Following the examples above, their ready-to-broadcast form is as follows:

```
# With data field
nonce = 7
value = "10000000000000000000"  # 10 EGLD
receiver = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
sender = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
gasPrice = 1000000000
gasLimit = 70000
data = "Zm9yIHRoZSBib29r"
chainID = "1"
version = 1
signature = "1702bb7696f992525fb77597956dd74059b5b01e88c813066ad1f6053c6afca97d6eaf7039b2a21cccc7d73b3e5959be4f4c16f862438c7d61a30c91e3d16c01"
```

```
# Without data field
nonce = 8
value = "10000000000000000000"  # 10 EGLD
receiver = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
sender = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
gasPrice = 1000000000
gasLimit = 50000
data = ""
chainID = "1"
version = 1
signature = "4a6d8186eae110894e7417af82c9bf9592696c0600faf110972e0e5310d8485efc656b867a2336acec2b4c1e5f76c9cc70ba1803c6a46455ed7f1e2989a90105"
```
