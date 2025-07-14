---
id: tools-for-signing
title: Tools for signing
---
[comment]: # (mx-abstract)

In order to sign a transaction without actually dispatching it, several tools can be used. One of the most popular ones is [mxpy](/sdk-and-tools/sdk-py).

[comment]: # (mx-context-auto)

## **Sign using [mxpy](/sdk-and-tools/sdk-py/) (Command Line Interface)**

Using a **pem** file:

```
$ mxpy tx new --nonce=41 --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz \
 --pem=aliceKey.pem --pem-index=0 --outfile=myTransaction.json

```

Using a JSON wallet key (and its password):

```
mxpy tx new --nonce=41 --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz \
 --keyfile=walletKeyOfAlice.json --passfile=passwordOfAlice.txt \
 --outfile=myTransaction.json

```

In either case, the output file looks like this:

```
{
    "tx": {
        "nonce": 41,
        "value": "0",
        "receiver": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
        "sender": "erd1aedmqfsflx4rhwvs7v9z52e7eylkevz4w342jzuaa9ezy5unsc5qqy963v",
        "gasPrice": 1000000000,
        "gasLimit": 70000,
        "data": "SGVsbG8sIFdvcmxk",
        "chainID": "1596807148",
        "version": 123,
        "signature": "f432442ebfee6edf4518c10d006ab571d8ecbd6f2601995554c75d3402b424364908235d45449ba5dd28575e4a8129271020e4718cf8a4c6f44e22c0885ac40a"
    },
    "hash": "",
    "data": "Hello, World"
}
```

[comment]: # (mx-context-auto)

## **Other signing tools**

Each SDK includes functions for signing and broadcasting transactions. Please refer to [SDKs & Tools](/sdk-and-tools/overview) for the full list.
