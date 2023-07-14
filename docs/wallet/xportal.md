---
id: xportal
title: xPortal
---

[comment]: # (mx-abstract)

:::info
On this page, we will start presenting features from xPortal, beginning with the Invisible Guardians feature. Subsequently, we will introduce other features in the following sections.
:::

[comment]: # (mx-context-auto)

## What are Invisible Guardians?

Invisible Guardians is a variation of the Guardians feature tailored for xPortal users. It is specifically designed to deliver the same level of security introduced by the Guardians feature while maintaining the same ease of use xPortal users are accustomed to.

![img](/wallet/xportal/activate_guardian.jpg)

[comment]: # (mx-context-auto)

## How do Invisible Guardians work?

When active, the feature enables an invisible guardian which is encrypted and stored locally on your device, silently co-signing every transaction. This acts as an additional security layer and safeguards the account in situations where, one way or another, the secret phrase has been compromised.

[comment]: # (mx-context-auto)

## How do I activate an Invisible Guardian on my account?
The Guardians feature can be accessed in the Security section, which can be found in the xPortal Settings. There, users can activate an Invisible Guardian on their account by going through a few simple steps:

- Create a backup password for your guarded account
![img](/wallet/xportal/inv_guardian_step1.jpg)
- Enable the Invisible Guardian through a blockchain transaction
![img](/wallet/xportal/inv_guardian_step2.jpg)
- Wait for the 20-day cooldown period to pass
![img](/wallet/xportal/inv_guardian_step4.jpg)
- Activate the Invisible Guardian through another blockchain transaction 
![img](/wallet/xportal/inv_guardian_step5.jpg)

[comment]: # (mx-context-auto)

## Can I deactivate the Invisible Guardian feature once it was activated?

The Invisible Guardian can be deactivated at any time, but it requires that a transaction is sent and signed by the Guardian currently in place on that account. 

[comment]: # (mx-context-auto)

## Can I change my Guardian?

Yes, the Invisible Guardian can be changed, and there are two ways in which this action can be performed:

- If the user has access to the current Guardian the change can be done immediately by signing a transaction;
- If the user doesn’t have access to the current Guardian the process implies a 20-day cooldown period before the change of Guardian takes place.
 
[comment]: # (mx-context-auto)

## Why do I have to wait 20 days to activate or change an Invisible Guardian?

The 20-day cooldown period is designed to safeguard staked funds and relieve pressure on users. 
Given that it might take longer than 10 days to safely transfer funds to a secure account, we have extended this period by an additional 10 days. 
This not only allows the user ample time to react if their account is compromised, but it also provides a buffer for the user to counteract potential threats.

[comment]: # (mx-context-auto)

## What implications should I be aware of before activating an Invisible Guardian on my account?

Aside from the extra security and the peace of mind that goes hand in hand with activating an Invisible Guardian on your account, there are a few things everyone should be aware of beforehand:
- You will only be able to process transactions from xPortal or by logging in with xPortal
- You won’t be able to import your secret phrase into other wallet apps

[comment]: # (mx-context-auto)

## What if something happens to my device or I change it?

The Invisible Guardian is stored locally on your device, but the first step of setting it up is creating an encrypted backup containing the Guardian. This makes importing it on a different device as easy as it gets, all you need to do is to provide the password associated with the guarded backup.
[comment]: # (mx-context-auto)

## What happens if my secret phrase is compromised?

If your secret phrase is compromised and the Invisible Guardian is active, whoever has access to the secret phrase will be unable to process any transactions from your account. They will be able though to request the change of the Guardian. This process lasts 20 days.

You will be able to cancel any request of this kind, but our recommendation is to transfer all your assets (staked and unstaked) to a new wallet.

[comment]: # (mx-context-auto)

## How would I know if my account is compromised?

A red warning message is displayed in your xPortal account every time a Guardian is enabled, changed or disabled. If it was you who processed this change, you can confirm that the action was performed by you and the message disappears.

If the action was not performed by you, we strongly recommend moving all your assets to a new wallet within 20 days.

Also, to ensure maximum protection we strongly recommend you access your account periodically.
