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


# Node operator actions

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


# Creating a new delegation contract

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

The `Value` is set to 1250 eGLD, which will be automatically added into the staking pool of the newly created delegation contract. This amount always belongs to the owner of the delegation contract.

The first argument passed to `createNewDelegationContract` is the maximum total delegation amount (the maximum possible size of the staking pool). It is expressed as a fully denominated amount of eGLD. For example, to obtain the fully denominated form for 7231.941 eGLD the amount must be multiplied by $10^{18}$ resulting in 7231941000000000000000. The fully denominated total delegation cap must then be encoded hexadecimally. Make sure not to encode the ASCII string representing the total delegation cap (e.g. do not encode the ASCII string "7231941000000000000000", but encode the integer 7231941000000000000000 itself).


TODO describe argument encoding, with examples
TODO describe returned data


# Configuring the Delegation Contract

## Delegation cap

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


## Service fee

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


## Automatic activation

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


## Metadata

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


# Managing nodes

## Adding nodes

This step requires the BLS key pairs of each node to be added into the delegation contract.
```
AddNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 6000000
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

## Removing nodes

This step does not require the BLS key pairs of the nodes.
```
RemoveNodesTransaction {
    Sender: <account address of the delegation contract owner>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "removeNodes" +
          "@" + <public BLS key of the first node in hexadecimal encoding> +
          "@" + <public BLS key of the second node in hexadecimal encoding> +
          <...> +
          "@" + <public BLS key of the Nth node in hexadecimal encoding> +
}
```

## Staking nodes

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

## Unstaking nodes

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

## Restaking nodes

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

## Unbonding nodes

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

## Unjailing nodes

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

# Delegating and managing delegated funds

Accounts that delegate their own funds to the staking pool are called **delegators**. The delegation contract offers them a set of actions.


## Delegating funds

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


## Claiming rewards

```
ClaimRewardsTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    Gas: 6000000
    Data: "claimRewards"
}
```

## Redelegating rewards

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


## Undelegating funds

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


## Withdrawing

```
WithdrawTransaction {
    Sender: <account address of existing delegator>
    Receiver: <address of the delegation contract>
    Value: 0
    GasLimit: 12000000
    Data: "withdraw"
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