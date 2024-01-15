---
id: xalias
title: xAlias
---

[comment]: # (mx-abstract)

**xAlias** is a _single sign-on_ solution for Web3, powered by Google Sign-In (Web2). It allows new users (not yet proficient in blockchain technologies) to quickly and easily create blockchain wallets (without the need of seed phrases), then start right away and interact with MultiversX dApps.

It's a _self-custody_ wallet, and it's _convertible_ to a conventional Web3 wallet at a later point.

:::important
**For dApp developers:** xAlias exposes **the same [URL hooks and callbacks](/wallet/webhooks)** as the [Web Wallet](/wallet/web-wallet). Therefore, integrating xAlias is **identical to integrating the Web Wallet** (with one trivial exception: the configuration of the URL base). See [Signing Providers for dApps](/sdk-and-tools/sdk-js/sdk-js-signing-providers).
:::

[comment]: # (mx-context-auto)

## Before you begin

If you don't already have a Google account, [set up one](https://accounts.google.com/signup).

## Sign Up with xAlias

Navigate to **[xAlias.com](https://xalias.com)**, then click on **Get Started** to reach the **Sign Up** screen:

![img](/wallet/xalias/xalias_signup_first.png)

Then, click on **Authenticate**, which redirecteds you to Google Sign-In.

![img](/wallet/xalias/xalias_signup_google_choose_account.png)

Pick the Google account you want to use, then click on **Confirm**.

![img](/wallet/xalias/xalias_signup_google_confirm.png)

Next, you'll have to **Authorize** xAlias to store and access its own data on your Google Drive account:

![img](/wallet/xalias/xalias_signup_second.png)

Read the Google consent screen, then click on **Allow**.

![img](/wallet/xalias/xalias_signup_authorize_google.png)

At the end of the Sign Up flow, you will be asked to back-up your xAlias account, as a document file, which can be either received by email or downloaded directly:

![img](/wallet/xalias/xalias_signup_backup_file.png)

To confirm the back-up and complete the flow, enter the confirmation code from the received (or downloaded) document:

![img](/wallet/xalias/xalias_signup_backup_code.png)

Congratulations, you have successfully **created your xAlias account**!

[comment]: # (mx-context-auto)

## Sign In

You can always sign-in to your xAlias account by navigating to **[xAlias.com](https://xalias.com)**, then clicking on **Sign In**. You will be asked to confirm the Google account, then reach the **xAlias Dashboard**.

## xAlias Dashboard

Upon the initial sign-up, and each time you sign-in to xAlias, you will be presented the **xAlias Dashboard**.

Here, you will be able to see the wallet address (the one starting with _erd1_) and share it with others, so they can send you EGLD or other tokens.‌ Additionally, you can click on **Open in Explorer** and see the all the blockchain transactions associated with your wallet address (blockchain address).

![img](/wallet/xalias/xalias_dashboard.png)

## Use a MultiversX dApp with xAlias

:::note
The screenshots below are from the [**MultiversX dApp Template**](https://devnet.template-dapp.multiversx.com).
:::

:::important
**For dApp developers:** if your dApp doesn't yet support **xAlias** as a signing provider, **we recommend that you enable the integration, and reach a broader audicence** (wider user base for your dApp). Please follow [Signing Providers for dApps](/sdk-and-tools/sdk-js/sdk-js-signing-providers) for technical details.
:::

If you've stumbled upon a MultiversX dApp that you'd like to use and it supports xAlias, follow the **Login** or **Connect** flow of the dApp, then pick **xAlias** (as your Web3 wallet).

![img](/wallet/xalias/xalias_dapp_login.png)

Then, you will reach the following consent screen:

![img](/wallet/xalias/xalias_dapp_consent.png)

Upon confirmation, you will be redirected to the dApp (which is informed about your blockchain address - **not your email address, of course**).

Then, as a user of the dApp (of any dApp), you might reach a point where you need to **sign a transaction** - then, you will be redirected to xAlias:

![img](/wallet/xalias/xalias_dapp_sign_transaction.png)

... or you might need to sign a message:

![img](/wallet/xalias/xalias_dapp_sign_message.png)

## Sign Out

To sign out from xAlias, navigate to **[xAlias.com](https://xalias.com)**, then click on **Sign Out**.

:::note
Note that disconnecting from a dApp doesn't sign you out from xAlias. 
:::
