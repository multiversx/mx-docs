---
id: staking
title: Staking
---

# **Prerequisites**

In order to submit a staking transaction, you must have the following:

- A wallet with a sufficiently high amount of eGLD: you'll need 2500 eGLD for each node you want to stake for. You will submit the staking transaction from this wallet, so make sure you can access it.
- The `validatorKey.pem` files of _each node_ you want to stake for. Each of these files contains the **BLS public key** of a node, along with its **secret key**. For staking, you'll only need the public keys of your nodes. Remember that the BLS public key consists of exactly 192 hexadecimal characters (that is, `0` to `9` and `a` to `f` only).
- An optional, second wallet, where the rewards produced by the validators will be gathered. You only need this second wallet if you do not want the rewards to go into the same wallet from which you submitted the staking transaction. You will have to use the `erdpy` command-line tool to decode the address of this account. See the section "[Specifying an optional reward address](/validators/staking/staking#specifying-an-optional-reward-address)" for details. The reward address can be changed later as well.

You have the option of staking through the online Wallet at [https://wallet.elrond.com](https://wallet.elrond.com/) or by using `erdpy`. This page describes both approaches. However, it is recommended to use `erdpy` if possible, because it is less error-prone and builds the staking transaction automatically.

You'll see some BLS public keys in the examples on this page. Make sure you don't copy-paste them into your staking transaction. These BLS keys have been randomly generated and do not belong to any real node.

# **Staking through the Wallet**

Open your wallet on [https://wallet.elrond.com](https://wallet.elrond.com/) and click the "Send" button. Carefully fill the form with the following information. Make sure it is clear to you what this information is, and where to adjust it with your own information.

In the "To" field, paste the address of the Staking SmartContract: `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l`

For the "Amount" field, you first need to calculate the amount of eGLD that needs to be staked. This is done by multiplying 2500 eGLD by the _number of nodes_ you want to stake. For example, if you want to stake for a single node, you need to enter `2500` (2500 eGLD). For two nodes, it's `5000` and for three nodes it is `7500`.

Next, expand the "Fee limit" section of the form. You'll see the "Gas limit" field appear. The value that needs to be entered here also depends on the _number of nodes_ you want to stake. To calculate the "Gas limit" value, mulitply `6000000` by the number of nodes. For example, if you want to stake for a single node, enter `6000000`. For two nodes, enter `12000000`, for three nodes enter `18000000` and so on. Observe how the "Fee limit" field automatically calculates the cost of this transaction.

## **The "Data" field**

Next, you must fill the "Data" field. The text you will write here will be read by the Staking SmartContract to find out what nodes you want to stake for. Remember, you can stake for any number of nodes at once, if you have the funds.

When writing in the "Data" field, you must adhere to a strict format, described in the following subsections.

### **Staking for a single node**

If you want to stake for a single node, the format of the "Data" field is simpler:

```
stake@01@<BLS1>@67656e65736973
```

Do not copy-paste the above format as-is into the "Data". Instead, you must **replace** `<BLS1>` with the **BLS public key** of the node you want to stake for. You can find the BLS public key in the `validatorKey.pem` file of that node. Read the page [Validator Keys](/validators/key-management/validator-keys) to help you interpret the contents of the file and locate the BLS public key.

Make sure you do not remove the `@` characters. They are used to separate the pieces of information in the "Data" field. Only replace `<number>` and `<BLS1>`. The angle-brackets `<` and `>` must be removed.

You must also make sure that the part `@67656e65736973` remains in place and is not deleted. It is a reserved placeholder and it must exist in the "Data" field after each BLS public key you add.

As an example, the "Data" field of a staking transaction for a single node, _without_ specifying an optional reward address, looks like this:

stake@01@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-M9NpOqGa_t-XucylYWc%2F-M9O39oKgkM4DGWncS6M%2Fstaking-single-node.png?alt=media&token=04d3f9b2-d895-4f9f-87f7-19cd5dc91943)

### **Staking for multiple nodes at once**

Staking for more than one node at a time isn't very different. You only need to append the information for your remaining nodes, after the information of the first node. Please read the previous section "Staking for a single node" before continuing. Also, _do not forget_ to update the "Amount" and "Gas Limit" fields according to the number of nodes you are staking for. See the [beginning of the "Staking through the Wallet"](/validators/staking/staking#staking-through-the-wallet) section for info on how to do it.

For a _single_ node, as explained in the previous subsection, the format is this one:

```
stake@01@<BLS1>@67656e65736973
```

For _two_ nodes, the format is as follows:

```
stake@02@<BLS1>@67656e65736973@<BLS2>@67656e65736973
```

And for _three_ nodes, the format is:

```
stake@03@<BLS1>@67656e65736973@<BLS2>@67656e65736973@<BLS3>@67656e65736973
```

Notice how each extra node adds the part `@<BLS…>@67656e65736973` to the previous format. You need to replace with `<BLS…>` with the actual **BLS public keys** of your nodes, which you can find inside their individual `validatorKey.pem` files. Make sure you **do not write the BLS secret keys**! Read the page [Validator Keys](/validators/key-management/validator-keys) to see how to interpret the `validatorKey.pem` files.

Moreover, with each extra BLS public key added, the first part of the format changes as well: `stake@01@…`, then `stake@02@…` and then `stake@03@…` . The number after `stake@` is the **number of nodes** you are staking for.

For example, the "Data" field for a staking transaction for two nodes looks like this:

stake@02@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973@f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d@67656e65736973

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-M9NpOqGa_t-XucylYWc%2F-M9O3Hws-5rwP264XN1X%2Fstaking-two-nodes.png?alt=media&token=16b347fa-4552-4ec0-8f4e-89b71783c31e)

For three nodes, it's like this:

stake@03@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973@f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d@67656e65736973@fbfc0b43b146d8c809a489aa2aeeaf5c33557c969a97f866748f52f01c4e930415953136f674d4449753eff460894714b245217954783d35cdaa6fb28b6cedea109246099d9bbabebfe10420745acd899bc2f28ec225a649301dec59ee4497f1@67656e65736973

Notice how the `@` character separates the pieces of information. It makes it easier to check for mistakes if you look for them.

### **The general format**

You can write the text for the "Data" field for _any_ number of nodes. The general format looks like this:

stake@<number>@<BLS1>@67656e65736973@<BLS2>@67656e65736973@…@<BLS99>@67656e65736973

Remember to replace `<number>` with the number of nodes you want to stake for, with leading zeros, so that there is an even number of characters. If you stake for one node, replace with `01`. If you stake for 15 nodes, replace with `0F`. If you stake for 243 nodes, replace with `F3`.

Also remember to update the "Amount" and "Gas Limit" according to the number of nodes you are staking for. See the first few paragraphs of the section [Staking through the wallet](/validators/staking/staking#staking-through-the-wallett) to see how.

## **Specifying an optional reward address**

When you submit a staking transaction, the Staking SmartContract remembers the Wallet you sent it from, and the rewards from your staked validators will go to that Wallet. This is the _default_ behavior.

However, if you wish to have your rewards sent to a _different_ Wallet, you can add an extra part to the "Data" field, before submitting the staking transaction.

You need the **address of your reward Wallet** (it looks like `erd1xxxxx…`), which you'll have to decode it using `erdpy`.

Make sure `erdpy` is installed by issuing this command on a terminal:

```
erdpy --version
```

The version reported by this command must be at least `erdpy 0.8.0`, or higher. If `erdpy` is not installed (`command not found`), or if the version is lower, please follow [these instructions](/sdk-and-tools/erdpy/installing-erdpy).

Once you're sure `erdpy` is installed and has the correct version, you can decode the address of your reward Wallet. For example, if this address is `erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg`, you can decode it with:

```
erdpy wallet bech32 --decode erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg
```

The above command gives the result `822bcd2be2622d9e55039fdd3f5d502a86049fbaa8aa70fcb8f7211f764c2f0e`, but do not copy-paste it from this page. It is not a real address. Don't forget to **replace this example address with your real Wallet address**.

After you run the decoding command with your real address, take the result and append it to the "Data" field, but only _after_ you added all the BLS public keys you wanted, and _after_ you added an extra `@` character.

Here are some examples. For one node:

stake@01@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973@822bcd2be2622d9e55039fdd3f5d502a86049fbaa8aa70fcb8f7211f764c2f0e

Notice how this example includes the part `@822bcd2be2622d9e55039fdd3f5d502a86049fbaa8aa70fcb8f7211f764c2f0e` at the end. This part is just an `@` character followed by the result of the `erdpy` decoding command on the example address above.

![img](https://gblobscdn.gitbook.com/assets%2F-LhHlNldCYgbyqXEGXUS%2F-M9NpOqGa_t-XucylYWc%2F-M9O3Pq32b8MqqmTi1d_%2Fstaking-single-node-reward-addr.png?alt=media&token=431f611a-5d1b-4f46-a158-47e84f75e308)

For two nodes:

stake@02@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973@f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d@67656e65736973@822bcd2be2622d9e55039fdd3f5d502a86049fbaa8aa70fcb8f7211f764c2f0e

For three nodes:

stake@03@b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27@67656e65736973@f921a0f76ed70e8a806c6f9119f87b12700f96f732e6070b675e0aec10cb0723803202a4c40194847c38195db07b1001f6d50c81a82b949e438cd6dd945c2eb99b32c79465aefb9144c8668af67e2d01f71b81842d9b94e4543a12616cb5897d@67656e65736973@fbfc0b43b146d8c809a489aa2aeeaf5c33557c969a97f866748f52f01c4e930415953136f674d4449753eff460894714b245217954783d35cdaa6fb28b6cedea109246099d9bbabebfe10420745acd899bc2f28ec225a649301dec59ee4497f1@67656e65736973@822bcd2be2622d9e55039fdd3f5d502a86049fbaa8aa70fcb8f7211f764c2f0e

Again, the examples above use fictious BLS public keys and a fictitious reward address. **Do not copy-paste these examples** when filling up the "Send" form on [https://wallet.elrond.com](https://wallet.elrond.com/).

# **Staking through erdpy**

Submitting the staking transaction using `erdpy` avoids having to write the "Data" field manually. Instead, the staking transaction is constructed automatically by `erdpy` and submitted to the network directly, in a single command.

Make sure `erdpy` is installed by issuing this command on a terminal:

```
erdpy --version
```

The version reported by this command must be at least `erdpy 0.8.0`, or higher. If `erdpy` is not installed (`command not found`), or if the version is lower, please follow [these instructions](/sdk-and-tools/erdpy/installing-erdpy).

Make sure `erdpy` is installed and has the latest version before continuing.

## **Your Wallet PEM file**

To send transactions on your behalf _without_ using the online Elrond Wallet, `erdpy` must be able to sign for you. For this reason, you have to generate a PEM file using your Wallet mnemonic.

Please follow the guide [Deriving the Wallet PEM file](/sdk-and-tools/erdpy/deriving-the-wallet-pem-file). Make sure you know exactly where the PEM file was generated, because you'll need to reference its path in the `erdpy` commands.

After the PEM file was generated, you can issue transactions from `erdpy`directly.

## **The staking transaction**

The following commands assume that the PEM file for your Wallet was saved with the name `walletKey.pem` in the current folder, where you are issuing the commands from.

The command to submit a staking transaction with `erdpy` is this:

```
erdpy --verbose validator stake --pem=walletKey.pem --value="<stake-value>" --validators-file=<validators-json-file> --proxy=https://api.elrond.com --estimate-gas --recall-nonce
```

Notice that we are using the `walletKey.pem` file. Moreover, before executing this command, you need to replace the following:

- Replace `<stake-value>` with the amount you are staking. You need to calculate this value with respect to the number of nodes you are staking for. See the [beginning of the "Staking through the Wallet"](/validators/staking/staking#staking-through-the-wallet) section for info on how to do it.
- Replace `<validators-json-file>` with the a JSON file that lists the nodes you are staking for. This JSON file should look like this:

```
{
  "validators" : [
    {
      "pemFile": "valPem1.pem"
    },
    {
      "pemFile": "valPem2.pem"
    },
      {
      "pemFile": "valPem3.pem"
    }
  ]
}
```

The `pemFile` field should point to valid Validator PEM file. **Note that paths must be relative to the JSON file itself.**

Notice also that there is no calculation for "Gas Limit". If you provide the `--estimate-gas` argument to `erdpy`, the gas limit will be estimated automatically.

Here's an example for a staking command for one node:

```
erdpy --verbose validator stake --pem=walletKey.pem --value="2500000000000000000000" --validators-file=my-validators.json --proxy=https://api.elrond.com --estimate-gas --recall-nonce
```

:::note important
You must take **denomination** into account when specifying the `value` parameter in **erdpy**.
:::

For two nodes, it becomes this:

```
erdpy --verbose validator stake --pem=walletKey.pem --value="5000000000000000000000" --validators-file=my-validators.json --proxy=https://api.elrond.com --estimate-gas --recall-nonce
```

Notice that the two BLS public keys are separated by a comma, with no extra space between them.

## **The --reward-address parameter**

When you submit a staking transaction, the Staking SmartContract remembers the wallet you sent it from, and the rewards from your staked validators will go to that wallet. This is the _default_ behavior. In this case, it will be the wallet which you used to generate the `walletKey.pem` file in the earlier subsection ["Your Wallet PEM file"](/validators/staking/staking#your-wallet-pem-file).

Alternatively, you can tell `erdpy` to specify another wallet to which your rewards should be transferred. You will need the **address of your reward wallet** (it looks like `erd1xxxxx…`) for this, which you will pass to `erdpy` using the `--reward-address` parameter.

For example, a staking command for a single node, with a reward address specified, looks like this:

```
erdpy --verbose validator stake --pem=walletKey.pem --reward-address="erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg" --value="2500000000000000000000" --number-of-nodes=1  --nodes-public-keys="b617d8bc442bda59510f77e04a1680e8b2d3293c8c4083d94260db96a4d732deaaf9855fa0cef2273f5a67b4f442c725efc06a5d366b9f15a66da9eb8208a09c9ab4066b6b3d38c3cf1ea7fab6489a90713b3b56d87de68c6558c80d7533bf27" --proxy=https://api.elrond.com --estimate-gas --recall-nonce
```

The above command will submit a staking command and will also inform the Staking SmartContract that the rewards should be transferred to the wallet `erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg` .
