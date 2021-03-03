---
id: delegation-manager
title: The Delegation Manager
---

# Introduction

The Delegation Manager is a smart contract that is built into the Elrond Protocol. It allows **node operators** to set up a staking pool for their nodes, which can then be funded by anyone in exchange for a proportion of the validator rewards. This form of funding the stake for validators is called **delegation**.

The goal of the Delegation Manager is to simplify the whole process of setting up the delegation, to manage the status of validator nodes with delegated stake and to provide an easy way for anyone to delegate their funds.

Note that the Delegation Manager is not required to set up delegation. For example, it is also possible to set up delegation using a regular smart contract, although that is a more complex process and is not discussed here.

* how
* who

**Workflow overview**

* node operator requests a new Delegation Contract from the Delegation Manager
  * pays a lot of eGLD for it 
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


## Node operator actions

* `createNewDelegationContract` (only sent to the Delegation Manager, once)
* `setAutomaticActivation`
* `changeServiceFee`
* `modifyTotalDelegationCap`
* `getContractConfig`
* `addNodes`
* `removeNodes`
* `stakeNodes`
* `reStakeUnStakedNodes`
* `unStakeNodes`
* `unBondNodes`
* `setMetaData`
* `setCheckCapOnReDelegateRewards`
* `unJailNodes`


## Creating a new Delegation Contract

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

TODO describe argument encoding, with examples
TODO describe what happens with the 1250 eGLD


## Configuring the Delegation Contract

### Delegation cap

Modifying the total delegation cap:
```
ModifyTotalDelegationCapTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 6000000
    Data: "modifyTotalDelegationCap" +
          "@" + <total delegation cap in eGLD, fully denominated, in hexadecimal encoding>
}
```

### Service fee

Changing the service fee:
```
ChangeServiceFeeTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 6000000
    Data: "changeServiceFee" +
          "@" + <service fee as hundredths of percents, in hexadecimal encoding>
}
```

### Automatic activation

Enabling or disabling automatic activation:
```
SetAutomaticActivationTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 6000000
    Data: "setAutomaticActivation" +
          "@" + <"true" or "false" in hexadecimal encoding>
}
```

# Views

-> query own observers... 

## Number of nodes

```
GetNumNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 0
    Data: "getNumNodes"          
}
```