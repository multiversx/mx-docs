---
id: unjailing
title: Unjailing
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## **Introduction**

In the unfortunate situation of losing too much **rating score**, a validator will be **jailed**, which means that they will be taken out of the shards, they will not participate in consensus, and thus they will not earn any more rewards. Currently, the rating limit at which a node will be jailed is `10`. Read more on the [Ratings](/validators/rating) page.

You can reinstate one of your jailed validators using an **unjailing transaction**. This transaction effectively represents the payment of a fine. After the transaction is successfully executed, your validator will return to the network in the next epoch, and treated as if the validator is brand new, with the rating reset to `50`.

It is easy to submit an unjailing transaction. You have the option of unjailing your validators either through the online Wallet at [https://wallet.multiversx.com](https://wallet.multiversx.com/), or by using `mxpy` in the command-line.

You'll see some BLS public keys in the examples on this page. Make sure you don't copy-paste them into your staking transaction. These BLS keys have been randomly generated and do not belong to any real node.

Each unjailing process requires a transaction to be sent to the Staking Smart Contract. These transactions must contain all the required information, encoded properly, and must provide a high enough gas limit to allow for successful execution. These details are described in the following pages.

There are currently 2 supported methods of constructing and submitting these transactions to the Staking SmartContract:

- Manually constructing the transaction, then submitting it to [wallet.multiversx.com](https://wallet.multiversx.com/);
- Automatically constructing the transaction and submitting it using the `mxpy` command-line tool.

The following pages will describe both approaches in each specific case.

[comment]: # (mx-context)

## **Prerequisites**

In order to submit an unjailing transaction, you require the following:

- A wallet with at least 2.5 EGLD (the cost of unjailing a _single validator_). If you want to unjail multiple validators at once, you need to multiply that minimum amount with the number of validators. For example, unjailing 3 validators at once will require 7.5 EGLD. Make sure you have enough in your wallet.
- The **BLS public keys** of the validators you want to unjail. You absolutely **do not require the secret key** of the validators. The BLS public keys of the validators are found in the `validatorKey.pem` files. Please read [Validator Keys](/validators/key-management/validator-keys) to find out how to extract the public key only. Remember that the BLS public key consists of exactly 192 hexadecimal characters (that is, `0` to `9` and `a` to `f` only).

[comment]: # (mx-context)

## **Unjailing through the Wallet**

Open your wallet on [https://wallet.multiversx.com](https://wallet.multiversx.com/) and click the "Send" button. Carefully fill the form with the following information. Make sure it is clear to you what this information is, and where to adjust it with your own information.

In the "To" field, paste the address of the Staking SmartContract, which also handles unjailing: `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l`

For the "Amount" field, you first need to calculate the amount of EGLD required for unjailing. This is done by multiplying 2.5 EGLD by the _number of nodes_ you want to unjail. For example, if you want to unjail a single node, you need to enter `2.5`. For two nodes, it's `5` and for three nodes it is `7.5`.

Next, expand the "Fee limit" section of the form. You'll see the "Gas limit" field appear. The value that needs to be entered here also depends on the _number of nodes_ you want to unjail. To calculate the "Gas limit" value, mulitply `6000000` (six million gas units) by the number of nodes. For example, if you want to unjail a single node, enter `6000000`. For two nodes, enter `12000000`, for three nodes enter `18000000` and so on. Observe how the "Fee limit" field automatically calculates the cost of this transaction.

[comment]: # (mx-context)

## **The "Data" field**

Next, you must fill the "Data" field. The text you will write here will be read by the Staking SmartContract to find out what nodes you want to unjail. Remember, you can unjail any number of nodes at once.

When writing in the "Data" field, you must adhere to a strict format, described in the following subsections.

[comment]: # (mx-context)

### **Unjailing a single node**

If you want to unjail a single node, the format of the "Data" field is simple:

```python
unJail@<BLS1>
```

Do not copy-paste the above format as-is into the "Data". Instead, you must **replace** `<BLS1>` with the **BLS public key** of the node you want to stake for. You can find the BLS public key in the `validatorKey.pem` file of that node. Read the page [Validator Keys](/validators/key-management/validator-keys) to help you interpret the contents of the file and locate the BLS public key.

Make sure you do not remove the `@` character. They are used to separate the pieces of information in the "Data" field. Only replace`<BLS1>`. The angle-brackets `<` and `>` must be removed as well.

As an example, the "Data" field of an unjailing transaction for a single node looks like this:

unJail@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-MA1YB7F53LJCTlFj8qn%2F-MA1_N1up06vncGVTyfp%2Funjailing-single-node.png?alt=media&token=fe0ca638-6433-4c07-b7ac-ef3fcf199835)

[comment]: # (mx-context)

### **Unjailing multiple nodes at once**

Unjailing more than one node at a time isn't very different from unjailing a single node. You only need to append the BLS public keys of the remaining nodes, separated by `@`, to the "Data" field constructed for a single node. Please read the previous section "Unjailing a single node" before continuing, if you haven't already. Also, _do not forget_ to update the "Amount" and "Gas Limit" fields according to the number of nodes you are unjailing.

For a _single_ node, as explained in the previous subsection, the format is this one:

```python
unJail@<BLS1>
```

For _two_ nodes, the format is as follows:

```python
unJail@<BLS1>@<BLS2>
```

And for _three_ nodes, the format is:

```python
unJail@<BLS1>@<BLS2>@<BLS3>
```

Notice how each extra node adds the part `@<BLS…>` to the previous format. You need to replace with `<BLS…>` with the actual **BLS public keys** of your nodes, which you can find inside their individual `validatorKey.pem` files. Make sure you **do not write the BLS secret keys**! Read the page [Validator Keys](/validators/key-management/validator-keys) to see how to interpret the `validatorKey.pem` files.

For example, the "Data" field for an unjailing transaction for two nodes looks like this:

unJail@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-MA1mbsWLwDtxs1LX3w-%2F-MA1nGcSQTZqmnGoxtRA%2Funjailing-two-nodes.png?alt=media&token=991f11c8-fe7c-46f5-93fb-566ab0590279)

[comment]: # (mx-context)

### **The general format**

You can write the text for the "Data" field for _any_ number of nodes. The general format looks like this:

```python
unJail@<BLS1>@<BLS2>@…@<BLS99>
```

[comment]: # (mx-context)

## **Unjailing through mxpy**

Submitting the unjailing transaction using `mxpy` avoids having to write the "Data" field manually. Instead, the transaction is constructed automatically by `mxpy` and submitted to the network directly, in a single command.

Make sure `mxpy` is installed and has the latest version before continuing. If `mxpy` is not installed, please follow [these instructions](/sdk-and-tools/sdk-py/installing-mxpy).

[comment]: # (mx-context)

## **Your Wallet PEM file**

To send transactions on your behalf _without_ using the online MultiversX Wallet, `mxpy` must be able to sign for you. For this reason, you have to generate a PEM file using your Wallet mnemonic.

Please follow the guide [Deriving the Wallet PEM file](/sdk-and-tools/sdk-py/deriving-the-wallet-pem-file). Make sure you know exactly where the PEM file was generated, because you'll need to reference its path in the `mxpy` commands.

After the PEM file was generated, you can issue transactions from `mxpy`directly.

[comment]: # (mx-context)

## **The unjailing transaction**

The following commands assume that the PEM file for your Wallet was saved with the name `walletKey.pem` in the current folder, where you are issuing the commands from.

The command to submit an unjailing transaction with `mxpy` is this:

```python
mxpy --verbose validator unjail --pem=walletKey.pem --value="<unjail-value>" --nodes-public-keys="<BLS1>,<BLS2>,...,<BLS99>" --proxy=https://gateway.multiversx.com --estimate-gas --recall-nonce
```

Notice that we are using the `walletKey.pem` file. Moreover, before executing this command, you need to replace the following:

- Replace `<unjail-value>` with the amount of EGLD required for unjailing your validators. You need to calculate this value with respect to the number of nodes you are unjailing. See the [beginning of the Unjailing through the Wallet](/validators/staking/unjailing#unjailing-through-the-wallet) section for info on how to do it.
- Replace all the `<BLS…>` with the actual **BLS public keys** of your nodes, which you can find inside their individual `validatorKey.pem` files. Make sure you **do not write the BLS secret keys**! Read the page [Validator Keys](/validators/key-management/validator-keys) to see how to interpret the `validatorKey.pem` files.

Notice also that there is no calculation for "Gas Limit". If you provide the `--estimate-gas` argument to `mxpy`, the gas limit will be estimated automatically.

Here's an example for an unjailing command for one validator:

```python
mxpy --verbose validator unjail --pem=walletKey.pem --value="2500000000000000000000" --nodes-public-keys="b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27" --proxy=https://gateway.multiversx.com --estimate-gas --recall-nonce
```

:::note important
You must take **denomination** into account when specifying the `value` parameter in **mxpy**.
:::

For two validators, the command becomes this one:

```python
mxpy --verbose validator unjail --pem=walletKey.pem --value="5000000000000000000000" --nodes-public-keys="b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27,f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d" --proxy=https://gateway.multiversx.com --estimate-gas --recall-nonce
```

Notice that the two BLS public keys are separated by a comma, with no extra space between them.
