---
id: create-a-fungible-token
title: Web Wallet Tokens
---

[comment]: # (mx-context-auto)

[comment]: # (mx-context-auto)

## **Introduction**

**ESDT** stands for _eStandard Digital Token_.

MultiversX network natively supports the issuance of custom tokens, without the need for contracts such as ERC20, but addressing the same use-cases.
You can create and issue an ESDT token from [MultiversX web wallet](https://wallet.multiversx.com/) in a few steps. Let's go over these steps.

[comment]: # (mx-context-auto)

## **Prerequisites**

- A wallet on MultiversX Network.
- 0.05 EGLD issuance fee
- fees for transactions

[comment]: # (mx-context-auto)

## **Creating a fungible token from Web Wallet**

To get started, open up the [MultiversX web wallet](https://wallet.multiversx.com/). You can create a new wallet if you do not have one or import your existing wallet. Here is a [guide](https://docs.multiversx.com/wallet/web-wallet/) to help you navigate.

On the left sidebar, you will notice the **ISSUE** section.

![sidebar](/wallet/wallet-tokens/sidebar.png)

Click on **Tokens**.

![issue-token}](/wallet/wallet-tokens/issue-token.png)

:::note
The Web Wallet will handle the preparation of the transaction. Therefore, if you'd want a token with a supply of 10 and 2 decimals, you should simply put 10 as supply and 2 as number of decimals.
:::

When creating a token, you are required to provide the token name, a ticker, the initial supply, and the number of decimals.
In addition to these, tokens' properties should be set.

Useful resources:

- [Token parameters format](/tokens/esdt-tokens#parameters-format) - constraints about length, charset and so on.
- [Token properties](/tokens/esdt-tokens#configuration-properties-of-an-esdt-token) - what the properties stand for.

Enter the required details. Next, click on **_Continue_** button to proceed. You will have to review the transaction and sign it, if everything looks good.

Once the transaction is processed, your token will be issued.

[comment]: # (mx-context-auto)

### **Finding the token identifier**

The token identifier of a token is unique. It is composed by the token ticker, a `-` char, followed by 6 random hex characters. Example: `MTKN-c66c30`.

Because the token identifier isn't deterministic, it can be found only after issuing it. There are 2 ways of finding it:

1. On the Explorer page of the issue transaction, you will see a Smart Contract Result which has a data field similar to: `@4d544b4e2d373065323338@152d02c7e14af6800000`.
   On the right side, choose `Smart` and you will able to see the decoded parameters. In this example, the token identifier is `MTKN-c66c30`.

![Token issue SCR](/wallet/wallet-tokens/scr-issue-token.png)

2. From the Web Wallet, go to `TOKENS` tab from the left sidebar, and you can see the token there, including its identifier.

![Token view in Web Wallet](/wallet/wallet-tokens/web-wallet-token-display.png)

[comment]: # (mx-context-auto)

## **Transfer a token from your wallet**

You can transfer an amount of a token to another account. To get started, open up the [MultiversX web wallet](https://wallet.multiversx.com/).

Navigate to the `Tokens` tab, and click on `Send` for the token you want to transfer.

![Web Wallet Tokens page](/wallet/wallet-tokens/web-wallet-tokens-page.png)

On the pop-up, introduce the recipient and the amount you want to send. Then press `Send`.

![Web Wallet Transfer Token](/wallet/wallet-tokens/web-wallet-transfer-token.png)

Once the transaction is successfully executed, the recipient should receive the amount of tokens.

[comment]: # (mx-context-auto)

## **Managing a token from Web Wallet**

At the time of writing, a dashboard for tokens owners is still under construction. Meanwhile, token operations have to be done
manually, by following the transaction formats described [here](/tokens/esdt-tokens/#management-operations).
