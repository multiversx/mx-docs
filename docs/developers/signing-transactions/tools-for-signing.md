---
id: tools-for-signing
title: Tools for signing
---

In order to sign a transaction without actually dispatching it, one can use [erdpy](/sdk-and-tools/erdpy) or [sdk-js-wallet-cli](/sdk-and-tools/sdk-js-wallet-cli).

## **Sign using [erdpy](/sdk-and-tools/erdpy/) (Command Line Interface)**

Using a **pem** file:

```
$ erdpy tx new --nonce=41 --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz \
 --pem=aliceKey.pem --pem-index=0 --outfile=myTransaction.json

```

Using a JSON wallet key (and its password):

```
erdpy tx new --nonce=41 --data="Hello, World" --gas-limit=70000 \
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

## **Sign using [sdk-js-wallet-cli](/sdk-and-tools/sdk-js-wallet-cli)**

Given an unsigned transaction in a JSON file:

```
{
    "nonce": 42,
    "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
    "value": "100000000000000000",
    "gasPrice": 1000000000,
    "gasLimit": 70000,
    "data": "food for cats",
    "chainID": "1",
    "version": 1
}
```

You can sign it as follows:

```
$ erdwalletjs sign -i ./aliceToBob.json -o ./aliceToBobSigned.json \
 -k walletKeyOfAlice.json -p passwordOfAlice.txt
```

The signed transaction looks like this:

```
{
    "nonce": 42,
    "value": "100000000000000000",
    "receiver": "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r",
    "sender": "erd1ylzm22ngxl2tspgvwm0yth2myr6dx9avtx83zpxpu7rhxw4qltzs9tmjm9",
    "gasPrice": 1000000000,
    "gasLimit": 70000,
    "data": "Zm9vZCBmb3IgY2F0cw==",
    "chainID": "1",
    "version": 1,
    "signature": "5845301de8ca3a8576166fb3b7dd25124868ce54b07eec7022ae3ffd8d4629540dbb7d0ceed9455a259695e2665db614828728d0f9b0fb1cc46c07dd669d2f0e"
}

```

## **Other signing tools**

Each SDK includes functions for signing and broadcasting transactions. Please refer to [SDKs & Tools](/sdk-and-tools/overview) for the full list.
