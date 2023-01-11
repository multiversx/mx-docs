---
id: deriving-the-wallet-pem-file
title: Deriving the Wallet PEM file
---

**erdpy** can be used to simplify and automate the interaction with the MultiversX network and can be easily used in scripts.

While **erdpy** has features that do not need a Wallet, submitting any sort of transaction with **erdpy** does require one. And to automate submitting transactions to the MultiversX network, **erdpy** needs a so-called PEM file, associated with a specific Wallet. This is needed because **erdpy** must be able to sign transactions on your behalf, without your help. Having a PEM file obviates the need for manually entering a password, like on [https://wallet.multiversx.com](https://wallet.multiversx.com/). However, one might choose to use a JSON keyfile Wallet instead. erdpy has support for these as well - the associated password has to be provided by means of a separate file.

:::caution
A PEM file generated from a Wallet should be kept very safe, because **it contains the private key** of that Wallet.
:::

To derive a PEM file for a Wallet, the mnemonic words of that account are needed. Make sure you have them before continuing. Also, make sure **erdpy** is installed on your system:

```
erdpy --version
```

If you see `command not found` it means you need to install **erdpy** first. See [Installing erdpy](/sdk-and-tools/erdpy/installing-erdpy) for how to do that.

The command for generating the PEM file from mnemonic words is:

```
erdpy --verbose wallet derive <output-file> --mnemonic
```

In the above command, you must replace `<output-file>` with the name of the PEM file to be created. Upon running the command you will be asked to provide the mnemonic words.

Here is an example:

```
erdpy --verbose wallet derive ./walletKey.pem --mnemonic
> words here some mnemonic words more words et cetera
```

The command above will generate a file called `walletKey.pem` in the current folder, using the mnemonic words you provided.

Now, whenever you want to submit a transaction from the command-line, you can tell **erdpy** to use this generated PEM file to sign the transaction with.

:::tip
The MultiversX network makes no distinction between manually submitting a transaction, and submitting a transaction through **erdpy**. This means that every transaction you send with **erdpy** will appear on [https://wallet.multiversx.com](https://wallet.multiversx.com/) when you open the Wallet which you generated the PEM for.
:::

:::caution
Always safeguard any PEM files you have. Anyone who has them can submit transactions and perform actions in the MultiversX network as if they were you, so make sure nobody can get to them.
:::
