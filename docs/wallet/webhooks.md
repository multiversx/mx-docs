---
id: webhooks
title: Webhooks
---

The web wallet webhooks allow you to build or setup integrations for dapps or payment flows.

The web wallet webhooks are links that point the user of the wallet to either login or populate a "send transaction" form with the provided arguments. Once the action is performed, the user is redirected to the provided callback URL along with a success or error status.

## **Login hook**

This is useful when you need to find the user's wallet address. A common use case is that, starting from this address you can query the API for the wallet's balance or recent transactions.

__URL Parameters__

`https://wallet.multiversx.com/hook/login?callbackUrl=https://example.com/`

| Param           | Required                                  | Description                                           |
| -------------   | ----------------------------------------- | ----------------------------------------------------- |
| callbackUrl     | <span class="text-danger">REQUIRED</span> | The URL the user should be redirected to after login. |

Upon a successful login, the user is redirected back to the callback URL along which the user's address is appended.

__Callback URL Parameters__

`https://example.com/?address=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh`

| Param           | Description                     |
| -------------   | ------------------------------- |
| address         | The users's Address (bech32).   |

## **Send transaction hook**

This is useful when you need to prepopulate a transaction required to send an EGLD amount or pre-populate the transaction's data field with a smart contract function invocation.

__URL Parameters__

`https://wallet.multiversx.com/hook/transaction?receiver=erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt&value=0&gasLimit=250000000&data=claimRewards&callbackUrl=https://example.com/`

| Param         | Required                                  | Description                                           |
| ------------- | ----------------------------------------- | ----------------------------------------------------- |
| receiver      | <span class="text-danger">REQUIRED</span> | The receiver's Address (bech32).                      |
| value         | <span class="text-danger">REQUIRED</span> | The Value to transfer (can be zero).                  |
| gasLimit      | <span class="text-normal">OPTIONAL</span> | The maximum amount of Gas Units to consume.           |
| data          | <span class="text-normal">OPTIONAL</span> | The message (data) of the Transaction.                |
| callbackUrl   | <span class="text-normal">OPTIONAL</span> | The URL the user should be redirected to after login. |

__Callback URL Parameters__

`https://example.com/?status=success&txHash=48f68a2b1ca1c3a343cbe14c8b755934eb1a4bb3a4a5f7068bc8a0b52094cc89&address=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh`

| Param           | Description                               |
| -------------   | ----------------------------------------- |
| status          | Success / failure of sending transaction. |
| txHash          | The transaction's hash.                   |
