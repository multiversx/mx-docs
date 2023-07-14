---
id: web-wallet
title: Web Wallet
---

[comment]: # (mx-abstract)

Use the wallet to send, receive and store EGLD in a secure manner. Includes automations for interacting with staking products and ecosystem pools.

[comment]: # (mx-context-auto)

## **Create a new wallet**

Go to [https://wallet.multiversx.com](https://wallet.multiversx.com/) & carefully acknowledge the instructions provided.

Click on "Create Wallet":

![img](/wallet/web-wallet/wallet_landing_page.png)

Carefully read and acknowledge the information, then click "Continue".

![img](/wallet/web-wallet/wallet_create.png)

[comment]: # (mx-context-auto)

## **Save your secret phrase! This is very important.**

The words, numbered in order, are your Secret Phrase. They are just displayed on your screen once and not saved on a server or anywhere in the world. You only get one chance to save them - please do so now.

Click the “copy” (two rectangles) button and then paste them into a text file. If your pets don’t usually find important pieces of paper to be delicious, you could even write the words down.

![img](/wallet/web-wallet/wallet_mnemonic.png)

The next page is a test to see if you actually have saved the Secret Phrase. Enter the random words as indicated there and press "Continue".

![img](/wallet/web-wallet/wallet_quiz.png)

You are one step away from getting your Keystore File. First, encrypt it with a password. Make sure it’s the strong kind, with 8 characters, at least one UPPER-CASE letter, a $ymb@l and numb3r.

![img](/wallet/web-wallet/wallet_password.png)

In case you forget this password, you can get a new Keystore File with your secret phrase. Remembering it is always better.

Congratulations, you have a new wallet! The associated Keystore File was downloaded to wherever your browser saves files by default. The file has the actual address of the wallet as default name, something like “erd….json”. You can rename it to “something.json” so it’s easier to manage, if you want.

![img](/wallet/web-wallet/wallet_created.png)

[comment]: # (mx-context-auto)

## **Access a wallet**

Go to https://wallet.multiversx.com/ and click on "Access Existing" Make sure the “Keystore file” access method is selected, click Browse and locate your Keystore File [erd1… .json], then put in your password and click "Access Wallet".

![img](/wallet/web-wallet/wallet_login.png)

And you’re in! Your EGLD address is on top, you can use the “copy” button (the two rectangles) to copy it to the clipboard.

![img](/wallet/web-wallet/wallet_welcome.png)

[comment]: # (mx-context-auto)

## **Overview of your EGLD balance**

After logging into your wallet, your EGLD balances are immediately visible and displayed in easy to follow boxes.

![img](/wallet/web-wallet/wallet_balance_overview.png)

- **Available:** Freely transferable EGLD balance
- **Stake Delegation:** Amount of EGLD delegated towards a Staking Services provider
- **Legacy Delegation:** Amount of EGLD delegated towards MultiversX Community Delegation
- **Staked Nodes:** Amount of EGLD locked for your staked nodes

[comment]: # (mx-context-auto)

## **Send a transaction**

Click "Send" on the right-hand section of the wallet:

![img](/wallet/web-wallet/wallet_send.png)

Input the destination address & amount, and then click "Send".

![img](/wallet/web-wallet/wallet_send_tx.png)

 Verify the destination and amount and click "Confirm".

![img](/wallet/web-wallet/wallet_confirm_tx.png)

After confirming the transaction you can see the progress and completion of the transaction.

![img](/wallet/web-wallet/wallet_success_tx.png)

You can always review your transaction history in the "Transactions" menu on the left-hand side of the wallet.

![img](/wallet/web-wallet/wallet_transactions.png)

[comment]: # (mx-context-auto)

## **Receiving EGLD in your wallet**

After logging into your wallet, as described above, you will be able to see your wallet address and share it with others, so they can send you EGLD.

Your address is immediately visible on the top part of the wallet. You can copy the address by pressing the copy button (two overlapping squares).

You can also click "Receive" on the right-hand side to see a QR code for the address, which can be scanned to reveal the public address.

![img](/wallet/web-wallet/wallet_receive.png)

[comment]: # (mx-context-auto)

## **Testnet and Devnet faucet**

You can request test tokens from [Testnet Wallet](https://testnet-wallet.multiversx.com) or [Devnet Wallet](https://devnet-wallet.multiversx.com) in the `Faucet` tab.

The faucet is only available once in a given time period. Other alternatives for getting test tokens are:

- request tokens on [Telegram - Validators chat](https://t.me/MultiversXValidators)
- use a third-party faucet, such as [https://r3d4.fr/faucet](https://r3d4.fr/faucet)

[comment]: # (mx-context-auto)

## **Guardian**

:::note
In case your balance is 0 eGLD, the **Guardian** option is not displayed.
:::

:::note
All screenshots have been taken from an internal private wallet on a private internal blockchain. The design of the feature may change for the final release on mainnet.
:::

Starting with Altair release, a new section for Guardian feature is available in the wallet interface:

![img](/wallet/web-wallet/guardian_feature1.png)

[comment]: # (mx-context-auto)

### **Registering the Guardian**

First step should be registering your guardian. After selecting the Guardian feature from the menu, you should be able to set it:

![img](/wallet/web-wallet/guardian_step1.png)

In order to set a Guardian you should use a software-based authenticator. This tool should be able to generate two-factor authentication (2FA's) codes. After installing your authenticator, use it for scanning the QR code and introduce the Guardian Code in the designated fields (see picture below). 

:::important
If this is the first time when you are doing the registration, you don't have to select the **I cannot access my guardian**.
:::

![img](/wallet/web-wallet/guardian_step2.png)

**Check & Confirm** the transaction:

![img](/wallet/web-wallet/guardian_step3.png)

[comment]: # (mx-context-auto)

### **Activation period**

Once you have successfully completed all the aforementioned steps, you will be required to wait for the registration period to finalize. In the case of Mainnet, this period will span across **20 epochs**.

:::important
While waiting for your Guardian to become active, all interactions with the blockchain should not behave differently. 
:::

![img](/wallet/web-wallet/guardian_step4.png)

[comment]: # (mx-context-auto)

### **Guarding your account**

After the activation period passes, you should be able to Guard your account:

![img](/wallet/web-wallet/guardian_step5.png)

:::important
In order to Guard your account, a normal ```GuardAccount``` transaction must be sent.
:::

![img](/wallet/web-wallet/guardian_step6.png)

[comment]: # (mx-context-auto)

### **Sending a guarded transaction**

After setting a guardian and sending the ```GuardAccount``` transaction, all following transactions must be guarded in order to be notarized by the blockchain. This translates that the 2FA code has to be filled in:

Let's take for example a simple eGLD transfer transaction:

![img](/wallet/web-wallet/guardian_sendTx1.png)

Confirm the transaction:

![img](/wallet/web-wallet/guardian_sendTx2.png)

In the last step, you will need to check your authenticator tool to retrieve the Guardian code (2FA code) and enter it for verification. See picture below:

![img](/wallet/web-wallet/guardian_sendTx3.png)

[comment]: # (mx-context-auto)

### **Unguarding your account**

Unguarding your account consists of sending an ```UnGuardAccount``` transaction to your own address. You can do it by simply using the **Unguard Account** button from the Guardian section:

![img](/wallet/web-wallet/guardian_unguard.png)

And confirming the transaction after checking the validity of it:

![img](/wallet/web-wallet/guardian_unguard2.png)

[comment]: # (mx-context-auto)

### **Changing your guardian**

The Guardians feature allows you to change your guardian in situations where you suspect your account has been compromised or if you have lost access to your Authenticator. It is crucial to be aware of certain indicators that signal the need for changing your guardian. One such indicator is the appearance of the image displayed below on the dashboard screen:

![img](/wallet/web-wallet/guardian_step8.png)

:::important
If it was not you the one triggering the change of the guardian, it may be the case that your account has been compromised and the scammer is trying to change the guardian to a new one, that he can control. Don't worry, he has to wait 20 epochs in order to have his own guardian becoming active. By then you can:
 - move the funds to a different account, that you control, by using the still active guardian.
 - instantly erase the pending guardian by using the **Cancel Guardian Change**, and play the "owning" game with the scammer.

We recommend the first solution. Even though you have your funds staked, the unbound period (10 epochs) is shorther than the guardian activation period so that you have enough time to unstake and safely move them to a safe account.
:::
