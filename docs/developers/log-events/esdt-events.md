---
id: esdt-events
title: ESDT Operations Events
---


ESDT Operations Events are generated in response to interactions with an ESDT token.
These events help keep track of actions like creating new tokens, transferring tokens between addresses, burning tokens, etc.


### Fungible token transfer

| Field      | Value                                                                                                                  | 
|------------|------------------------------------------------------------------------------------------------------------------------|
| identifier | ESDTTransfer                                                                                                           |
| address    | the sender  of the token                                                                                               |
| topics     | `topics[0]` - token identifier <br/>`topics[1]` - empty <br/> `topics[2]` - value <br/> `topics[3]` - receiver address |
| data       | empty                                                                                                                  |


### Semi-fungible or non-fungible or meta-esdt token transfer

| Field      | Value                                                                                                                        | 
|------------|------------------------------------------------------------------------------------------------------------------------------|
| identifier | ESDTNFTTransfer                                                                                                              |
| address    | the sender  of the token                                                                                                     |
| topics     | `topics[0]` - token identifier <br/>`topics[1]` - token nonce <br/> `topics[2]` - value <br/> `topics[3]` - receiver address |
| data       | empty                                                                                                                        |


### Multi token transfer


| Field      | Value                                                                                                                           | 
|------------|---------------------------------------------------------------------------------------------------------------------------------|
| identifier | MultiESDTNFTTransfer                                                                                                            |
| address    | the sender  of the token                                                                                                        |
| topics     | `topics[0]` - token identifier <br/>`topics[1]` - token nonce <br/> `topics[2]` - value <br/> `topics[3]` - receiver address    |
| data       | empty                                                                                                                           |

:::note
For a multi-token transfer operation, multiple `MultiESDTNFTTransfer` events will be generated, one for each token being transferred.
:::

:::important Important
Starting from release `rc/v1.6.0`, the `MultiESDTNFTTransfer` will be changed when the `ScToScLogEventEnableEpoch` will be enabled.

Instead of generating multiple events with the same identifier, only one event will be generated for the entire multi-token transfer operation. 
The event will follow the new format outlined below:

| Field      | Value                                                                                 | 
|------------|---------------------------------------------------------------------------------------|
| identifier | MultiESDTNFTTransfer                                                                  |
| address    | the sender  of the token                                                              |
| topics     | `LIST`<token identifier, token nonce, value> <br/>  `topics[n-1]` - receiver address  |
| data       | empty                                                                                 |

:::



