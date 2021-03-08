---
id: delegation-manager
title: The Delegation Manager
---

:::note
For reviewers:
* Gas limits for transactions that do not involve nodes, but only require the base cost of `DelegationOps`, have been set to `1100000`, where the extra `100000` is for the transaction itself. If there's a better way, please propose it and it will be added instead.
* Gas limits for transactions that involve nodes (e.g. `addNodes`, `removeNodes`) have been documented as `1000000 + N·1100000`, where `1000000` is the base cost of `DelegationOps`, `N` is the number of nodes involved and `1100000` is the `DelegationOps` cost plus `100000` gas for whatever extra gas is required by the individual node to appear in the `Data` field of the transaction. This way of defining `GasLimit` is only tentative. If there's a better way, please propose it and it will be added instead.
:::

## Introduction

**Node operators** may wish to set up a staking pool for their nodes, which can then be funded by anyone in exchange for a proportion of the validator rewards. This form of funding the stake for validators is called **delegation**.

For this purpose, node operators may use the **delegation manager** built into the Elrond Protocol to create their own **delegation contract**. A delegation contract automates certain tasks required for the management of a staking pool, such as keeping track of every account that has funded the staking pool, keeping track of the nodes themselves, as well as providing information to the delegators.

Note that the delegation manager is not required to set up a staking pool. For example, it is also possible to set up delegation using a regular smart contract, although that is a more complex process and is not discussed here.

Node operators may also choose set up a delegation dashboard, although they may use any user interface or none whatsoever. As an example, the boilerplate for such a delegation dashboard can be found here: https://github.com/ElrondNetwork/starter-dapp/tree/master/react-delegationdashboard.


**TODO Workflow overview**

* node operator requests a new delegation contract from the delegation manager
  * transfers eGLD for it
  * but the eGLD is then used as initially delegated funds
  * node operator is now the owner of the new delegation contract
* node operator registers their nodes into the new delegation contract
  * node operator must have the BLS keys of the nodes
  * the delegation contract becomes the "owner" of the nodes
  * registered nodes are not yet delegated
* node operator configures the delegation contract with the following:
  * service fee as percentage
  * maximum size of the delegation pool (the delegation contract will refuse funds above this limit)
  * automatic activation (on/off)
* third parties invoke the delegation contract to deposit funds into the staking pool, thus becoming **delegators**
* delegators claim their share of the validator rewards

TODO describe node statuses (active / inactive, staked / not-staked / unstaked etc)


## Creating a new delegation contract

The delegation contract for a new staking pool can be created by issuing a request to the delegation manager. This is done by submitting a transaction of the following form:
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

The `Receiver` address is set to `erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6`, which is the fixed address of the delegation manager, located on the Metashard.

The `Value` is set to 1250 eGLD, which will be automatically added into the funds of the newly created delegation contract, i.e. this is the initial amount of eGLD in the staking pool. This amount of eGLD always belongs to the owner of the delegation contract.

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

This subsection describes the _manual_ staking (activation) of nodes. To automatically stake (activate) nodes when funds become available, [automatic activation](/protocol/delegation-manager#automatic-activation) can be enabled.

To stake specific nodes manually, a transaction of the following form can be submitted:

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

The `Data` field contains an enumeration of `N` public BLS keys corresponding to the nodes to be staked.


### Unstaking nodes

Validator nodes that are already staked (active) can be manually unstaked. This _does not_ mean that the validators are instantly demoted to normal node status, nor does it mean that the staked amount returns to the staking pool. The validators will still spend a number of `X` epochs as validators.

After that period expires, another manual step is required, [unbonding](/protocol/delegation-manager#unbonding-nodes), which completes their deactivation and the staked amount is returned to the staking pool.

To cancel the deactivation of validators before their unstaking is complete, they can be [restaked](/protocol/delegation-manager#restaking-nodes).

To begin the deactivation process for a selection of nodes, a transaction of the following form is used:
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
The `Data` field contains an enumeration of `N` public BLS keys corresponding to the nodes to be unstaked.


### Restaking nodes

Validator nodes that have been unstaked can be restaked (reactivated) before their deactivation is complete. To cancel their deactivation, a transaction of the following form is used:
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
The `Data` field contains an enumeration of `N` public BLS keys corresponding to the nodes to be restaked.


### Unbonding nodes

Validator nodes that have been unstaked can be completely deactivated after a period of `X` epochs. Complete deactivation is called **unbonding** and it involves the demotion of validators to the status of regular nodes and also the return of the staked amount of eGLD back to the staking pool.

Validator nodes that have been unbonded cannot be restaked (reactivated). They must be staked anew.

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
The `Data` field contains an enumeration of `N` public BLS keys corresponding to the nodes to be unbonded.


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

Accounts that delegate their own funds to the staking pool are called **delegators**. The delegation contract offers them a set of actions as well.


### Delegating funds

Accounts become delegators by funding the staking pool, i.e. they delegate their funds. The delegators are rewarded for their contribution with a proportion of the rewards earned by the validator nodes.

Submitting a delegation transaction takes into account the status of [automatic activation](/protocol/delegation-manager#automatic-activation): if the delegated rewards cause the amount in the staking pool to become sufficient for the staking of extra nodes, it can trigger their activation automatically.

Funds can be delegated by submitting a transaction of the following form:

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

A portion of the rewards earned by validator nodes is reserved for each delegator. To claim the rewards, a delegator may issue a transaction of the following form:
```
ClaimRewardsTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 6000000
    Data: "claimRewards"
}
```

If the transaction is successful, the delegator receives the proportion of rewards they are entitled to.

### Redelegating rewards

Current delegation rewards can also be immediately delegated instead of [claimed](/protocol/delegation-manager#claiming-rewards).

This makes it an operation very similar to [delegation](/protocol/delegation-manager#delegating-funds). Just like delegation, it takes into account the status of [automatic activation](/protocol/delegation-manager#automatic-activation): if the redelegated rewards cause the amount in the staking pool to become sufficient for the staking of extra nodes, it can trigger their activation automatically.


Rewards are redelegated using a transaction of the form:
```
RedelegateRewardsTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 12000000
    Data: "reDelegateRewards"
}
```

If the transaction is successful, the delegator does not receive any eGLD at the moment, but the rewards they were entitled to will be added to their delegated amount.


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


## Delegation contract view functions

The following documentation sections only show the relevant `returnData` and omit the other fields for simplicity


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

### <span class="badge badge-success">POST</span> Number of delegators

The result is a value representing the number of delegators in base64 encoding of the hex encoding.

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getNumUsers"
}
```

<!--Response-->

```json
 {
  "returnData": [
    "<number of distinct delegators in base64 encoding of the hexadecimal encoding>"
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

The result is the number of nodes in base64 encoding of the hex encoding.

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getNumNodes"
}
```

<!--Response-->

```json
{
  "returnData": [
    "<number of nodes in base64 encoding of the hexadecimal encoding>"
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

### <span class="badge badge-success">POST</span> Nodes states

The result is an enumeration of alternating status codes and BLS keys. Each status code is followed by the BLS key of the node it describes. Both status codes and BLS keys are encoded in base64.

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getAllNodeStates"
}
```

<!--Response-->

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

### <span class="badge badge-success">POST</span> Total active stake

The result is a value representing the total active stake in base64 encoding of the hex encoding. 

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getTotalActiveStake"
}
```

<!--Response-->

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
  "funcName": "getTotalActiveStake"
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

### <span class="badge badge-success">POST</span> Total unstaked stake

The result is a value representing the total unstaked stake in base64 encoding of the hex encoding.

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "<address of the delegation contract in bech32 encoding>",
  "funcName": "getTotalUnStaked"
}
```

<!--Response-->

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

The result is a value representing the sum of all accumulated rewards in base64 encoding of the hex encoding.

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

```json
 {
  "returnData": [
    "<total accumulated rewards in base64 encoding of the hex encoding>"
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
The result is a value representing the total claimable rewards for the delegator in base64 encoding of the hex encoding.

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

The result is a value representing the active stake for the delegator in base64 encoding of the hex encoding.

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

The result is a value representing the unstaked stake for the delegator in base64 encoding of the hex encoding. 

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

The result is a value representing the unbondable stake in base64 encoding of the hex encoding.

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

```json
 {
  "returnData": [
    "<delegator unbondable stake in base64 encoding of the hex encoding>"
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

The result is an enumeration representing the different undelegated stake values in base64 encoding of the hex encoding.

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

Response (only `returnData` shown below; see linkSection for complete response)
```json
{
  "returnData": [
    "Q8M8GTdWSAAA",
    "iscjBInoAAA="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

## Delegation mananger view functions

### <span class="badge badge-success">POST</span> All contract addresses

The result is an enumeration of bech32 keys bytes in base64 encoding.

<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
  "funcName": "getAllContractAddresses"
}
```


<!--Response-->
```json
{
  "returnData": [
    "<address bytes of the system delegation smart contract in base64 encoding of the hexadecimal encoding>"
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

### <span class="badge badge-success">POST</span> Contract config
<!--DOCUSAURUS_CODE_TABS-->
<!--Request-->

```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
  "funcName": "getContractConfig"
}
```


<!--Response-->
The returnData member will contain an array of the properties in a fixed order (base64 encoded):
```json
{
  "returnData": [
    "<current number of contracts in base64 encoding>",
    "<last used address bytes in base64 encoding of the hexadecimal encoding>",
    "<minimum service fee as hundredths of percents in hexadecimal encoding>",
    "<maximum service fee as hundredths of percents in hexadecimal encoding>",
    "<minimum deposit amount in hexadecimal encoding>",
    "<minimum delegation amount in hexadecimal encoding>"
  ]
}
```

<!--Example-->

Request
```json
{
  "scAddress": "erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllslmq6y6",
  "funcName": "getContractConfig"
}
```

Response

```json
{
  "returnData": [
    "Gw==",
    "AAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAABz///8=",
    "",
    "JxA=",
    "Q8M8GTdWSAAA",
    "iscjBInoAAA="
  ]
}
```

<!--END_DOCUSAURUS_CODE_TABS-->
