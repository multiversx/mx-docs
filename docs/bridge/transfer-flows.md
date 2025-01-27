---
id: transfer-flows
title: Transfer Flows
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

[comment]: # (mx-abstract)

The main functionality of the bridge is to transfer tokens from one network to another. For example, a user can transfer tokens from an EVM-compatible chain to MultiversX or from MultiversX to an EVM-compatible chain.
Besides the main functionality, there is the possibility to call a smart contract on MultiversX when doing a swap.

[comment]: # (mx-context-auto)

# 1. Simple token transfer functionality

[comment]: # (mx-context-auto)
## 1.a. EVM-compatible chain to MultiversX

Let's suppose Alice has x tokens on an EVM-compatible chain and wants to transfer them to MultiversX at the address she owns
(or it might be Bob's address on MultiversX, the bridge does not care). The steps and flow are the following:
* Alice deposits the ERC20 tokens that she wants to transfer to the MultiversX network in the EVM-compatible chain's **Safe** contract;
* The EVM-compatible chain's **Safe** contract groups multiple deposits into batches;
* After a certain period of time (defined by the finality parameters of the EVM-compatible chain), each batch becomes final and starts being processed by the relayers;
* The relayers propose, vote, and perform the transfer using MultiversX's **Bridge** contract with a consensus of a minimum of 7 out of 10 votes;
* On the MultiversX network, the same amount of ESDT tokens are minted or released, depending on the token's settings;
* The destination address receives the equivalent amount of ESDT tokens on the MultiversX network.

[comment]: # (mx-context-auto)

## 1.b. MultiversX chain to an EVM-compatible chain

Now let's suppose Alice wants her x tokens on MultiversX to transfer them to an EVM-compatible chain in the address she owns
(or it might be Bob's address on the EVM-compatible chain, again, the bridge does not care). The steps and flow are the following:

* Alice deposits the ESDT tokens that she wants to transfer to the EVM-compatible network in MultiversX's **Safe** contract;
* The MultiversX's **Safe** contract groups multiple deposits into batches;
* After a certain period of time, each batch becomes final and ready to be processed by the relayers;
* The relayers propose, vote, and perform the transfer using the EVM-compatible chain's **Bridge** contract with a consensus of exactly 7 out of 10 votes;
* The user receives the equivalent amount of ERC20 tokens on their recipient address on the EVM-compatible network minus the fee for this operation;
* On the MultiversX network, the ESDT tokens that were transferred are burned or locked, depending on the token's settings.

# 2. Token transfer with smart-contract call on MultiversX side

Starting with bridge v3.0, swaps from the EVM-compatible chains can invoke a smart contract on the MultiversX side.
Let's suppose Alice has x tokens on an EVM-compatible chain and wants to transfer them to MultiversX to a contract while invoking
a function on that contract. The steps and flow are the following:

* Alice deposits the ERC20 tokens that she wants to transfer to the MultiversX network in the EVM-compatible chain's **Safe** contract,
  on a special endpoint also providing the MultiversX's contract address, function, the parameters for the invoked function, and a minimum
  gas-limit to be used when invoking the function;
* The EVM-compatible chain's **Safe** contract groups multiple deposits into batches, regardless of whether the deposits are of this type or 1.a. type;
* After a certain period of time (defined by the finality parameters of the EVM-compatible chain), each batch becomes final and starts being processed by the relayers;
* The relayers propose, vote, and perform the transfer using MultiversX's **Bridge** contract with a consensus of a minimum of 7 out of 10 votes;
* On the MultiversX network, the same amount of ESDT tokens are minted or released, depending on the token's settings;
* The minted or released tokens, along with the smart-contract call parameters (contract address, function, parameters, and minimum gas limit) are then moved in
  the specialized contract called **BridgeProxy**;
* On the **BridgeProxy** contract there is an endpoint for executing the smart-contract call. Alice or any MultiversX entity willing to
  spend the gas for execution can call the endpoint. The minimum gas limit for the execution is the one specified by Alice, or it can be higher;
* The entity triggering the execution flow will pay the gas limit and the **BridgeProxy** will handle the execution which can have 2 outcomes:
    * The call was successful: in this case, the contract will be credited with the tokens sent by Alice, and the invoked function would have produced the desired effects;
    * The call was unsuccessful: in this case, the **BridgeProxy** received back the tokens and will mark the transfer as failed.
        * The **BridgeProxy** can then be called on another endpoint to attempt the refund mechanism. Alice or any other MultiversX entity willing
          to spend gas limit can invoke that endpoint;
        * Whoever calls the **BridgeProxy** refund endpoint, will pay the gas limit for the reversed transfer operation. This will also attempt to subtract the fee
          as for any normal MultiversX to EVM-compatible chain transfer;
        * The transfer is placed in a MultiversX batch and eventually, Alice will get her tokens back on the originating EVM-compatible chain minus the fee.
          As stated, the operations on the **BridgeProxy** can be done manually, or by using the **scCallsExecutor** tool provided here https://github.com/multiversx/mx-bridge-eth-go/blob/feat/v3.1/cmd/scCallsExecutor

The README.md file contained in this directory is a good place to start on how to manually configure the tool and run it (on a dedicated host or VM)

## Notes regarding smart-contract invoked on MultiversX from an EVM-compatible chain:

The next diagram explains what happens with a token transfer with a smart-contract call in the direction EVM-compatible chain -> MultiversX when the tokens are unlocked/minted on the MultiversX chain.
The transfer is stored in the **BridgeProxy** (Step 1) and then, anyone can initiate the execution (Step 2). The tokens reach the 3-rd-party smart contract along with the function required to be called
and the provided parameters.

<!--- source file reference: /static/xbridge/xbridge-dark/light.drawio --->
<ThemedImage
    alt="SC bridge proxy happy flow"
    sources={{
        light: useBaseUrl('/xbridge/bridge-proxy-ok-call-light.png'),
        dark: useBaseUrl('/xbridge/bridge-proxy-ok-call-dark.png'),
    }}
/>

As stated above, this is the "happy flow" in which the smart contract call succeeds on the 3-rd-party contract. But what
happens if the invoked function fails? This is described in the next diagram. Step 1 was identical to the previous diagram
and it was omitted. Step 2 got a new step 2.c in which the tokens return to the **BridgeProxy** contract and the whole transfer
is marked as failed and ready to be refunded on the original source EVM-compatible chain **to the original sender address**.
There is another Step 3 involved, in which, anyone can call the refund method.

<!--- source file reference: /static/xbridge/xbridge-dark/light.drawio --->
<ThemedImage
    alt="SC bridge proxy with refund flow"
    sources={{
        light: useBaseUrl('/xbridge/bridge-proxy-refund-call-light.png'),
        dark: useBaseUrl('/xbridge/bridge-proxy-refund-call-dark.png'),
    }}
/>

Step 2 and Step 3 can be automatically triggered with the help of the **scCallsExecutor** tool referenced above.

TODO: add info how to assemble the SC call data
