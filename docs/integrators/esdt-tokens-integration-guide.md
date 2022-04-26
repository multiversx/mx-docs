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
receiver can be further parsed. One has to follow these steps:
- check if the transaction is an ESDT transfer (data field format is `ESDTTransfer@<tokenID hexadecimal>@<amount hexadecimal`. More details [here](/developers/esdt-tokens#transfers))
- parse the tokens transfer details from Logs&Events. More details [here](/developers/esdt-tokens#parse-fungible-tokens-transfer-logs)

## **Sending ESDT tokens**
Sending ESDT tokens to a given recipient can be done via preparing and broadcasting to the network a transaction that 
follows the format described [here](/developers/esdt-tokens#transfers).

## **Balances check**
From time to time, or for safety reasons before performing a transaction, an integrator would want to check the tokens balance of some
addresses. This can be performed via [Get address token balance endpoint](/developers/esdt-tokens#get-balance-for-an-address-and-an-esdt-token).

## **Getting tokens properties**
Each tokens has some properties such as the name, the ticker, the token identifier or the number of decimals. 
These properties can be fetch via an API call described [here](/developers/esdt-tokens#get-esdt-token-properties).

## **Useful tools**
- ESDT documentation can be found [here](/developers/esdt-tokens).
- ESDT API docs can be found [here](/developers/esdt-tokens#rest-api).
- erdjs helper functions can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjs/blob/main/src/esdtHelpers.ts).
- erdjava helper functions can be found [here](https://github.com/ElrondNetwork/elrond-sdk-erdjava/blob/esdt-support/src/main/java/elrond/esdt/ESDTFunctions.java).
