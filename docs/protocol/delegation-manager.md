---
id: delegation-manager
title: The Delegation Manager
---

:::note
For reviewers:
* Gas limits for transactions that do not involve nodes, but only require the base cost of `DelegationOps`, have been set to `1100000`, where the extra `100000` is for the transaction itself. If there's a better way, please propose it and it will be added instead.
* Gas limits for transactions that involve nodes (e.g. `addNodes`, `removeNodes`)have been documented as `1000000 + N·1100000`, where `1000000` is the base cost of `DelegationOps`, `N` is the number of nodes involved and `1100000` is the `DelegationOps` cost plus `100000` gas for whatever extra gas is required by the individual node to appear in the `Data` field of the transaction. This way of defining `GasLimit` is only tentative. If there's a better way, please propose it and it will be added instead.
:::

## Introduction

The Delegation Manager is a smart contract that is built into the Elrond Protocol. It allows **node operators** to set up a staking pool for their nodes, which can then be funded by anyone in exchange for a proportion of the validator rewards. This form of funding the stake for validators is called **delegation**.

The goal of the Delegation Manager is to simplify the whole process of setting up the delegation, to manage the status of validator nodes with delegated stake and to provide an easy way for anyone to delegate their funds.

Note that the Delegation Manager is not required to set up delegation. For example, it is also possible to set up delegation using a regular smart contract, although that is a more complex process and is not discussed here.

**TODO Workflow overview**

* node operator requests a new Delegation Contract from the Delegation Manager
  * transfers eGLD for it
  * but the eGLD is then used as initially delegated funds
  * node operator is now the owner of the new Delegation Contract
* node operator registers their nodes into the new Delegation Contract
  * node operator must have the BLS keys of the nodes
  * the Delegation Contract becomes the "owner" of the nodes
  * registered nodes are not yet delegated
* node operator configures the Delegation Contract with the following:
  * service fee as percentage
  * maximum size of the delegation pool (the Delegation Contract will refuse funds above this limit)
  * automatic activation (on/off)
* third parties invoke the Delegation Contract to deposit funds into the staking pool, thus becoming **delegators**
* delegators claim their share of the validator rewards

TODO describe node statuses (active / inactive, staked / not-staked / unstaked etc)


## Creating a new delegation contract

A new delegation contract can be instantiated by issuing a request to the Delegation Manager using a transaction of the following form:
```
NewDelegationContractTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6
    Value: 1250000000000000000000 (1250 eGLD)
    GasLimit: 60000000
    Data: "createNewDelegationContract" +
          "@" + <total delegation cap in eGLD, fully denominated, in hexadecimal encoding> +
          "@" + <service fee as hundredths of percents, in hexadecimal encoding>
}
```

The `Receiver` address is set to `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6`, which is the fixed address of the Delegation Manager, located on the Metashard.

The `Value` is set to 1250 eGLD, which will be automatically added into the staking pool of the newly created delegation contract. This amount of eGLD always belongs to the owner of the delegation contract.

In the `Data field`, the first argument passed to `createNewDelegationContract` is the total delegation cap (the maximum possible size of the staking pool). It is expressed as a fully denominated amount of eGLD. For example, to obtain the fully denominated form of 7231.941 eGLD, the amount must be multiplied by $10^{18}$, resulting in 7231941000000000000000.

The fully denominated total delegation cap must then be encoded hexadecimally. Make sure not to encode the ASCII string representing the total delegation cap. Following the example above, do not encode the ASCII string `"7231941000000000000000"`, but encode the integer 7231941000000000000000 itself. This would result in `"01880b57b708cf408000"`.

Setting the total delegation cap to 0 ("00" in hexadecimal) specifies an unlimited total delegation amount. It can always be modified later (see [Delegation cap](/protocol/delegation-manager#delegation-cap)).

The second argument passed to `createNewDelegationContract` is the service fee that will be reserved for the owner of the delegation contract. It is computed as a proportion of the total rewards earned by the validator nodes. The remaining rewards apart from this proportion will be available to delegators to either claim or redelegate.

The service fee is expressed as hundredths of a percent. For example, a service fee of 37.45% is expressed by the integer 3745. This integer must then be encoded hexadecimally (3745 becomes `"0EA1"`).

Setting the service fee to 0 (`"00"` in hexadecimal) specifies that no rewards are reserved for the owner of the delegation contract - all rewards will be available to the delegators. The service fee can always be modified later (see [Service fee](/protocol/delegation-manager#service-fee)).

The following is a complete example of a transaction requesting the creation of a new delegation contract:
```
NewDelegationContractTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6
    Value: 1250000000000000000000
    GasLimit: 60000000
    Data: "createNewDelegationContract" +
          "@01880b57b708cf408000" +
          "@0EA1"
}
```

The above transaction creates a new delegation contract owned by the sender, with total delegation cap of 7231.941 eGLD and service fee of 37.45% from the rewards. Moreover, the newly created delegation contract will start with a staking pool of 1250 eGLD.

TODO describe returned data


## Configuring the delegation contract

The owner of the delegation contract has a number of operations at their disposal.

TODO expand?

### Delegation cap

The total delegation cap is the maximum possible size amount of eGLD which can be held by the delegation contract. After reaching the total delegation cap, the contract will reject any subsequent funds.

The total delegation cap can be modified at any time using a transaction of the form:
```
ModifyTotalDelegationCapTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 1100000
    Data: "modifyTotalDelegationCap" +
          "@" + <total delegation cap in eGLD, fully denominated, in hexadecimal encoding>
}
```

In the `Data` field, the only argument passed to `modifyTotalDelegationCap` is the new value for the delegation cap. It is expressed as a fully denominated amount of eGLD. For example, to obtain the fully denominated form of 7231.941 eGLD, the amount must be multiplied by the denomination factor $10^{18}$, resulting in 7231941000000000000000.

The fully denominated total delegation cap must then be encoded hexadecimally. Make sure not to encode the ASCII string representing the total delegation cap. Following the example above, do not encode the ASCII string `"7231941000000000000000"`, but encode the integer 7231941000000000000000 itself. This would result in "01880b57b708cf408000".

Setting the total delegation cap to 0 (`"00"` in hexadecimal) specifies an unlimited total delegation amount. It can always be modified later.

For example, a `Data` field containing `"modifyTotalDelegationCap@c405abdb8467a04000"` will change the total delegation cap to 3615.9705 eGLD.


### Service fee

The service fee is a percentage of the validator rewards that will be reserved for the owner of the delegation contract. The rest of the rewards will be available to delegators to either claim or redelegate.

The service fee can be changed at any time using a transaction of the form:
```
ChangeServiceFeeTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 1100000
    Data: "changeServiceFee" +
          "@" + <service fee as hundredths of percents, in hexadecimal encoding>
}
```

In the `Data` field, the only argument passed to `changeServiceFee` is the new value of the service fee, expressed as hundredths of a percent. For example, a service fee of 37.45% is expressed by the integer 3745. This integer must then be encoded hexadecimally (3745 becomes `"0EA1"`).

Setting the service fee to 0 (`"00"` in hexadecimal) specifies that no rewards are reserved for the owner of the delegation contract - all rewards will be available to the delegators. The service fee can always be modified later.

For example, a `Data` field containing `changeServiceFee@0dc2` will change the service fee to 35.22%.


### Automatic activation

When automatic activation is enabled, the delegation contract will activate (stake) inactive nodes as soon as funds have become available in sufficient amount. Consequently, any [delegation transaction](/protocol/delegation-manager#delegating-funds) can potentially trigger the activation of inactive nodes.

Automatic activation can be enabled or disabled using a transaction of the form:
```
SetAutomaticActivationTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 1100000
    Data: "setAutomaticActivation" +
          "@" + <"true" or "false" in hexadecimal encoding>
}
```

The only argument passed to `setAutomaticActivation` is either `true` or `false`, as an ASCII string encoded hexadecimally. For reference, `true` is `"74727565"` and `false` is `"66616c7365"`.

For example, a `Data` field containing `"setAutomaticActivation@74727565"` enables automatic activation.


### Metadata

```
SetMetadataTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: TODO
    Data: "setMetaData"
          "@" + < TODO > +
          "@" + < TODO > +
          "@" + < TODO >
}
```


## Managing nodes

### Adding nodes

When a delegation contract is first created, it contains no information about nodes. The owner of the contract must then register nodes into the contract, so that they can be later activated. Any newly added node is "inactive" by default.

Adding nodes requires the BLS key pairs belonging to each of them, which the owner of the contract uses to prove that they have access to the nodes. This proof consists of signing the address of the delegation contract itself with the secret BLS key of each node, individually. This results in as many signed messages as there are nodes.

Adding `N` nodes to the delegation contract is done by submitting a transaction with the values set as follows:
```
AddNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 1000000 + N·1100000
    Data: "addNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <address of the delegation contract signed with the secret BLS key of the first node, in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          "@" + <address of the delegation contract signed with the secret BLS key of the second node, in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
          "@" + <address of the delegation contract signed with the secret BLS key of the Nth node, in hexadecimal encoding>
}
```

As shown above, the `Data` field contains an enumeration of `N` pairs. Such a pair consists of the public BLS key of a node along with the message produced by signing the address of the delegation contract with the secret BLS key of the respective node. There are as many pairs as there are nodes to add.

### Removing nodes

Inactive (not staked) nodes can be removed from the delegation contract by the owner at any time. Neither active (staked) nor unstaked nodes cannot be removed.

Unlike [adding nodes](/protocol/delegation-manager#adding-nodes), this step does not require the BLS key pairs of the nodes.

Removing `N` nodes from the delegation contract is done by submitting a transaction with the values set as follows:
```
RemoveNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 1000000 + N·1100000
    Data: "removeNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```
The `Data` field contains an enumeration of `N` public BLS keys corresponding to the nodes to be removed.

### Staking nodes

When the staking pool held by the delegation contract contains a sufficient amount of eGLD, the inactive (non-staked) nodes can be staked (activated). This promotes the nodes to the status of **validator**, which means they participate in consensus and earn rewards.

```
StakeNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "stakeNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

### Unstaking nodes

```
UnstakeNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "unStakeNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

### Restaking nodes

```
RestakeNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "reStakeUnStakedNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

### Unbonding nodes

```
UnbondNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "unBondNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

### Unjailing nodes

```
UnjailNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 2.5 eGLD × <number of nodes to be unjailed>
    GasLimit: 12000000
    Data: "unJailNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

## Delegating and managing delegated funds

Accounts that delegate their own funds to the staking pool are called **delegators**. The delegation contract offers them a set of actions.


### Delegating funds

```
DelegateTransaction {
    Sender: <account address of funds holder>
    Receiver: <address of the delegation contract>
    Value: minimum 10 eGLD
    GasLimit: 12000000
    Data: "delegate"
}
```

If the transaction is successful, the funds holder has become a delegator.


### Claiming rewards

```
ClaimRewardsTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 6000000
    Data: "claimRewards"
}
```

### Redelegating rewards

Current delegation rewards can also be immediately delegated instead of claimed.
```
RedelegateRewardsTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 12000000
    Data: "reDelegateRewards"
}
```


### Undelegating funds

```
UndelegateTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 12000000
    Data: "unDelegate"
          "@" + <amount to undelegate in eGLD, fully denominated, in hexadecimal encoding>
}
```


### Withdrawing

```
WithdrawTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "withdraw"
}
```


## *Views*

The following documentation sections only show the relevant returnData and omit the other fields for simplicity


```json
{
  "data": {
    "data": {
      "returnData": [
      ],
      "returnCode": "ok",
      "returnMessage": "",
      "gasRemaining": 0,
      "gasRefund": 0,
      "outputAccounts": null,
      "deletedAccounts": null,
      "touchedAccounts": null,
      "logs": []
    }
  },
  "error": "",
  "code": "successful"
}
```

### <span class="badge badge-success">POST</span> Delegation manager all contract addresses
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
  "funcName": "getAllContractAddresses"
}
```


<!--Response-->
The result is an enumeration of BLS keys base64 encoded.
```json
{
  "returnData": [
    "<address bytes of the system delegation smart contract in base64 encoding>"
  ]
}
```

<!--Example-->

Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
  "funcName": "getAllContractAddresses"
}
```

Response

```json
{
  "returnData": [
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAL///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAP///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAT///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAX///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAb///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAf///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAj///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAn///8=",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAr///8="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Number of delegators
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getNumUsers"
}
```

<!--Response-->

The result is a value representing the number of delegators in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<total active stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getNumUsers"
}
```

Response
```json
 {
  "returnData": [
    "BQ=="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Number of nodes
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getNumNodes"
}
```

<!--Response-->
The result is the number of nodes in base64 encoding of the hex encoding.
```json
{
  "returnData": [
    "<number of nodes in base64 encoding of the hex enconding>"
  ]
}
```

<!--Example-->

Request

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqlllllskf06ky",
  "funcName": "getNumNodes"
}
``` 

Response

```json
{
  "returnData": [
    "Dg=="
  ]
}
```  

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> All contract nodes states
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getAllNodeStates"
}
```

<!--Response-->

The result is an enumeration of alternating status codes and BLS keys. Each status code is followed by the BLS key of the node it describes. Both status codes and BLS keys are encoded in base64.

```json
 {
  "returnData": [
    "<state in base64 encoding>",
    "<public BLS key of the node in hexadecimal encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getAllNodeStates"
}
```

Response
```json
 {
  "returnData": [
    "c3Rha2Vk",
    "KJ6auG3rKQydktc9soWvyBOa5UPA7DYezttTqlS6JIIvsvOaH8ghs2Qruc4aXLUXNJ1if7Ot9gbt5dNUrmNfkLtZl1hpLvPllrGmFP4bKCzZ25UNiTratwOMcXhhCmSD",
    "bm90U3Rha2Vk",
    "7gJzQ3GQ4htSx6CYvOkXPDdwGfzdahuDY4agZkGhIAMfB44K08FP6z3wLQEnn2IULfZ8/Hds38LEu3Xq+mJZ4FktF0vm8C1T34b5uAEpZWtDZLICAEFCuQZrqS5Qb1CR",
    "vTyNQ/vDxg0L8LmoGuKP+4/wsbyWv8RaqeQ+WH+xrMvk1m7Q3wjheOpjYtQPz80YZ1CrwKj6ObsCUejP4uuvi3MQ1oMEGKg5yh3kRgybRb4TXAWEpAPszYMLIQhrIn2P",
    "9TbGQCcrbyXH9HBAhzIWOuH/cdSNO1dwxO5foM2L28tWU0p9Kos6DKsPMtKMx4sAeRal08K3Dk0gQxeTSAvC2fb3DAQt01rmPSAqCSXZetSX12BVcTi+pYGUHaXKJ/OW"
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Total unstaked stake
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getTotalUnStaked"
}
```

<!--Response-->

The result is a value representing the total unstaked stake in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<total unstaked stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getTotalUnStaked"
}
```

Response
```json
 {
  "returnData": [
    "ArXjrxaxiAAA"
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Total cumulated rewards
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getTotalCumulatedRewards",
  "caller": "erd1qqqqqqqqqqqqqqqpqqqqqqqqlllllllllllllllllllllllllllsr9gav8"
}
```

<!--Response-->

The result is a value representing the total cumulated rewards in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<total cumulated rewards in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getTotalCumulatedRewards",
  "caller": "erd1qqqqqqqqqqqqqqqpqqqqqqqqlllllllllllllllllllllllllllsr9gav8"
}
```

Response
```json
 {
  "returnData": [
    "czSCSSYZr8E="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Delegator claimable rewards
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getClaimableRewards",
  "args" : ["<delegator address in hexadecimal encoding of the bech32 decoded value>"]
}
```

<!--Response-->

The result is a value representing the total claimable rewards for the delegator in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<delegator claimable rewards in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getClaimableRewards",
  "args":["ebfd923cd251f857ed7639e87143ac83f12f423827abc4a0cdde0119c3e37915"]
}
```

Response
```json
 {
  "returnData": [
    "Ft9RZzF7Dyc"
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Delegator active stake
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getUserActiveStake",
  "args" : ["<delegator address in hexadecimal encoding of the bech32 decoded value>"]
}
```

<!--Response-->

The result is a value representing the active stake for the delegator in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<active stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getUserActiveStake",
  "args":["ebfd923cd251f857ed7639e87143ac83f12f423827abc4a0cdde0119c3e37915"]
}
```

Response
```json
 {
  "returnData": [
    "slsrv1so8QAA"
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Delegator unstaked stake
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getUserUnStakedValue",
  "args" : ["<delegator address in hexadecimal encoding of the bech32 decoded value>"]
}
```

<!--Response-->

The result is a value representing the unstaked stake for the delegator in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<delegator unstaked stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getUserUnStakedValue",
  "args":["ebfd923cd251f857ed7639e87143ac83f12f423827abc4a0cdde0119c3e37915"]
}
```

Response
```json
 {
  "returnData": [
    "ARWORgkT0AAA"
  ]
}
```
<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Delegator unbondable stake
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getUserUnBondable",
  "args" : ["<delegator address in hexadecimal encoding of the bech32 decoded value>"]
}
```

<!--Response-->

The result is a value representing the unbondable stake in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<unbondable stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getUserUnBondable",
  "args":["ebfd923cd251f857ed7639e87143ac83f12f423827abc4a0cdde0119c3e37915"]
}
```

Response
```json
 {
  "returnData": [
    "ARWORgkT0AAA"
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

### <span class="badge badge-success">POST</span> Delegator undelegated stake
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getUserUnDelegatedList",
  "args" : ["<delegator address in hexadecimal encoding of the bech32 decoded value>"]
}
```

<!--Response-->

The result is an enumeration representing the different undelegated stake values in base64 encoding of the hex encoding.

```json
 {
  "returnData": [
    "<undelegated stake in base64 encoding of the hex encoding>"
  ]
}
```

<!--Example-->
Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqp0llllswfeycs",
  "funcName": "getUserUnDelegatedList",
  "args":["ebfd923cd251f857ed7639e87143ac83f12f423827abc4a0cdde0119c3e37915"]
}
```

Response
```json
 {
  "returnData": [
    "Q8M8GTdWSAAA",
    "iscjBInoAAA="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->