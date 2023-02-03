---
id: deriving-the-wallet-pem-file
title: Deriving the Wallet PEM file
---

[comment]: # (mx-abstract)

Submitting transactions with **mxpy** requires a JSON wallet (keystore) or a PEM file. On this page, we'll focus on deriving (creating) a PEM file, given a mnemonic (seed phrase).

[comment]: # (mx-context-auto)

## The `wallet derive` command

To derive a PEM file for a Wallet, the mnemonic words (seed phrase) of that account are needed. Make sure you have them before continuing.

The command for generating the PEM file from mnemonic words is:

```
mxpy --verbose wallet derive <output-file> --mnemonic
```

In the above command, you must replace `<output-file>` with the name of the PEM file to be created. Upon running the command you will be asked to provide the mnemonic words.

Here is an example:

```
mxpy --verbose wallet derive ./walletKey.pem --mnemonic
> words here some mnemonic words more words et cetera
```

The command above will generate a file called `walletKey.pem` in the current folder, using the mnemonic words you provided.

[comment]: # (mx-context-auto)

## Keep the PEM file safe

:::caution
A PEM file generated from a Wallet should be kept very safe, because **it contains the private key** of that Wallet.
:::

:::caution
Always safeguard any PEM files you have. Anyone who has them can submit transactions and perform actions in the MultiversX network as if they were you, so make sure nobody can get to them.
:::

[comment]: # (mx-context-auto)

## Passing the PEM file as a CLI parameter

Now, whenever you want to submit a transaction from the command-line, you can tell **mxpy** to use this generated PEM file to sign the transaction with. For example:

```bash
$ mxpy tx new --recall-nonce --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1... \
 --pem=walletKey.pem \
 --send
```

:::tip
The MultiversX network makes no distinction between manually submitting a transaction, and submitting a transaction through **mxpy**. This means that every transaction you send with **mxpy** will appear on [https://wallet.multiversx.com](https://wallet.multiversx.com/) when you open the Wallet which you generated the PEM for.
:::

