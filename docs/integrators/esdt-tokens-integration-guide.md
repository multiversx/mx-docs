---
id: esdt-tokens-integration-guide
title: ESDT tokens integration guide
---

## **Introduction**
Integrating ESDT tokens support can be done alongside native EGLD integration, so one should refer to the [egld-integration-guide](/integrators/egld-integration-guide).

The only differences are internal ways to store ESDT tokens alongside with their token identifier and number of decimals and different approaches
for identifying and parsing ESDT transactions.

## **ESDT transactions parsing**
Considering that the platform which wants to support ESDT tokens already supports EGLD transfers, this section will
provide the additional steps that are to be integrated over the existing system. 

If so, all the transactions on the network are being parsed so the integrator will check if the sender or receiver of the transaction
is an address that is interested in. 
In addition to this, one can check if the transaction is a successful ESDT transfer. If so, then the transferred token, the amount and the
receiver can be further parsed. 

One has to follow these steps:
- check if the transaction is an ESDT transfer (data field format is `ESDTTransfer@<tokenID hexadecimal>@<amount hexadecimal>`. More details [here](/developers/esdt-tokens#transfers))
- parse the tokens transfer details from Logs&Events. More details [here](/developers/esdt-tokens#parse-fungible-tokens-transfer-logs)

### Example
Let's suppose we are watching these addresses:
- `erd1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3z92425g3zygs3mthts`
- `erd1venxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenq5ezmpv`

And we support the following tokens:
- `TKN-99hh44` (hex encoded: `544b4e2d393968683434`)
- `TKN2-77hh33` (hex encoded: `544b4e322d373768683333`)

Therefore, we will look for transactions that have the following structure:
```
TokenTransferTransaction {
    Sender: erd1....
    Receiver: erd1zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zyg3zygspavcaj OR erd1venxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenxvenq5ezmpv
    Value: 0 
    GasLimit: 60000000
    Data: "ESDTTransfer" +
          "@<token identifier hex>" + // 544b4e2d393968683434 OR 544b4e322d373768683333
          "@<amount hex>"
}
```
*For more details about how arguments have to be encoded, check [here](/developers/sc-calls-format).*

Any other transaction that does not follow this structure has to be omitted. 

When we find such a transaction, we will fetch the logs of the transaction, as described [here](/developers/esdt-tokens#parse-fungible-tokens-transfer-logs). 
The logs will provide us information about the receiver, the token and the amount to be transferred. If the log is there, we are sure that 
the transfer is successful, and we can start processing with the extracted data.

## **Sending ESDT tokens**
Sending ESDT tokens to a given recipient can be done via preparing and broadcasting to the network a transaction that 
follows the format described [here](/developers/esdt-tokens#transfers).

Also, there is support for building tokens transfer transaction on many SDKs. A few examples are:
- [erdjs - ESDTTransferPayloadBuilder](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/tokenTransferBuilders.ts)
- [erdjava - ESDTTransferBuilder](https://github.com/ElrondNetwork/elrond-sdk-erdjava/blob/main/src/main/java/elrond/esdt/builders/ESDTTransferBuilder.java)

## **Balances check**
From time to time, or for safety reasons before performing a transaction, an integrator would want to check the tokens balance of some
addresses. This can be performed via [Get address token balance endpoint](/developers/esdt-tokens#get-balance-for-an-address-and-an-esdt-token).

## **Getting tokens properties**
Each tokens has some properties such as the name, the ticker, the token identifier or the number of decimals. 
These properties can be fetch via an API call described [here](/developers/esdt-tokens#get-esdt-token-properties).

## **Useful tools**
- ESDT documentation can be found [here](/developers/esdt-tokens).
- ESDT API docs can be found [here](/developers/esdt-tokens#rest-api).
- erdjs helper functions can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/release/v9/src/esdtHelpers.ts).
- erdjs token transfer transactions builder can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/tokenTransferBuilders.ts).
- erdjava helper functions can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjava/blob/esdt-support/src/main/java/elrond/esdt/ESDTFunctions.java).
- erdjava token transfer transactions builder can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjava/blob/main/src/main/java/elrond/esdt/builders/ESDTTransferBuilder.java).
- [@elrondnetwork/transaction-decoder](https://www.npmjs.com/package/@elrondnetwork/transaction-decoder).
