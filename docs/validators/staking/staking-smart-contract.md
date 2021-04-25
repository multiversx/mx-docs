---
id: staking-smart-contract
title: The Staking Smart Contract
---

# **Staking**

Nodes are _promoted_ to the role of **validator** when their operator sends a _staking transaction_ to the Staking smart contract. Through this transaction, the operator locks ("stakes") an amount of their own EGLD for each node that becomes a validator. A single staking transaction contains the EGLD and the information needed to stake for one or more nodes. Such a transaction contains the following:

- The number of nodes that the operator is staking for
- The concatenated list of BLS keys belonging to the individual nodes
- The stake amount for each individual node, namely the number of nodes × 2 500 EGLD
- A gas limit of 6 000 000 gas units × the number of nodes
- Optionally, a separate address may be specified, to which the rewards should transferred, instead of the address from which the transaction itself originates. The reward address must be first decoded to bytes from the Bech32 representation, then re-encoded to base16 (hexadecimal).

For example, if an operator manages two individual nodes with the 96-byte-long BLS keys `45e7131ba....294812f004` and `ecf6fdbf5....70f1d251f7`, then the staking transaction would be built as follows:

```
StakingTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 5000 EGLD
    GasLimit: 12000000
    Data: "stake" +
          "@0002" +
          "@45e7131ba....294812f004" +
          "@67656e65736973"
          "@ecf6fdbf5....70f1d251f7" +
          "@67656e65736973"
          "@optional_reward_address_HEX_ENCODED"
}
```

Because this transaction is a call to the Staking smart contract, it passes information via the `Data` field:

- `stake` is the name of the smart contract function to be called;
- `0002` is the number of nodes (unsigned integer, hex-encoded);
- 45e7131ba....294812f004 is the BLS key of the first node, represented as a 192-character-long hexadecimal string;
- `67656e65736973` is a reserved placeholder, required after each BLS key;
- `ecf6fdbf5....70f1d251f7` is the BLS key of the second node, represented as a 192-character-long hexadecimal string;
- `67656e65736973` is the aforementioned reserved placeholder, repeated;
- `optional_reward_address_HEX_ENCODED` is the address of the account which will receive the rewards for the staked nodes (decoded from its usual Bech32 representation into binary, then re-encoded to a hexadecimal string).

# **Changing the reward address**

Validator nodes produce rewards, which are then transferred to an account. By default, this account is the same one from which the staking transaction was submitted (see the section above). In the staking transaction, the node operator has the option to select a different reward address.

The reward address can also be changed at a later time, with a special transaction to the Staking smart contract. It is essential to know exactly how many nodes were specified in the original staking transaction, in order to properly compute the gas limit for changing the reward address.

- An amount of 0 EGLD
- A gas limit of 6 000 000 gas units × the nodes for which the reward address is changed (as specified by the original staking transaction).
- The new reward address. The reward address must be first decoded into binary from its normal Bech32 representation, then re-encoded to base16 (hexadecimal).

For example, changing the reward address for two nodes requires the following transaction:

```
ChangeRewardAddressTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 0 EGLD
    Data: "changeRewardAddress@reward_address_HEX_ENCODED"
    GasLimit: 12000000
}
```

# **Unstaking**

A node operator may _demote_ their validator nodes back to **observer** status by sending an _unstaking transaction_ to the Staking smart contract, containing the following:

- An amount of 0 EGLD
- The concatenated list of the BLS keys belonging to the individual nodes which are to be demoted from validator status
- A gas limit of 6 000 000 gas units × the number of nodes

Note that the demotion does not happen instantaneously: the unstaked nodes will remain validators until the network releases them, a process which is subject to various influences.

Moreover, the amount of EGLD which was previously locked as stake will not return instantaneously. It will only be available after a predetermined number of rounds, after which the node operator may claim back the amount with a third special transaction (see the following section).

Continuing the example in the previous section, an unstaking transaction for the two nodes contains the following:

```
UnstakingTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 0 EGLD
    GasLimit: 12000000
    Data: "unStake" +
          "@45e7131ba....294812f004" +
          "@ecf6fdbf5....70f1d251f7"
}
```

Note that:

- `45e7131ba....294812f004` is the BLS key of the first node, represented as a 192-character-long hexadecimal string;
- `ecf6fdbf5....70f1d251f7` is the BLS key of the second node, represented as a 192-character-long hexadecimal string;
- no reserved placeholder is needed, as opposed to the staking transaction (see above)

# **Unbonding**

A node operator may reclaim the stake which was previously locked for their validator nodes using an _unbonding transaction_ to the Staking smart contract. Before unbonding, the node operator must have already sent an unstaking transaction for some of their validators, and a predetermined amount of rounds must have passed after the unstaking transaction was processed.

The unbonding transaction is almost identical to the unstaking transaction, and contains the following:

- An amount of 0 EGLD
- The concatenated list of the BLS keys belonging to the individual nodes for which the stake is claimed back
- A gas limit of 6 000 000 gas units × the number of nodes

Following the example in the previous sections, an unbonding transaction for the two nodes contains the following information:

```
UnbondingTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 0 EGLD
    GasLimit: 12000000
    Data: "unBond" +
          "@45e7131ba....294812f004" +
          "@ecf6fdbf5....70f1d251f7"
}
```

Note that:

- 45e7131ba....294812f004 is the BLS key of the first node, represented as a 192-character-long hexadecimal string;
- `ecf6fdbf5....70f1d251f7` is the BLS key of the second node, represented as a 192-character-long hexadecimal string;
- no reserved placeholder is needed, as opposed to the staking transaction (see above)

# **Unjailing**

If a node operator notices that some of their validator nodes have been jailed due to low rating, they can restore the nodes back to being active validators by paying a small fine. This is done using an _unjailing transaction_, sent to the Staking smart contract, which contains the following:

- An amount of 2.5 EGLD (the fine) for each jailed node - this value must be correctly calculated; any other amount will result in a rejected unjail transaction
- The concatenated list of the BLS keys belonging to the individual nodes that are to be unjailed
- A gas limit of 6 000 000 gas units × the number of nodes

Continuing the example in the previous section, if the nodes `45e7131ba....294812f004` and `ecf6fdbf5....70f1d251f7` were placed in jail due to low rating, they can be unjailed with the following transaction:

```
UnjailTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 5 EGLD
    GasLimit: 12000000
    Data: "unJail" +
          "@45e7131ba....294812f004" +
          "@ecf6fdbf5....70f1d251f7"
}
```

Note that:

- `45e7131ba....294812f004` is the BLS key of the first node, represented as a 192-character-long hexadecimal string;
- `ecf6fdbf5....70f1d251f7` is the BLS key of the second node, represented as a 192-character-long hexadecimal string;
- no reserved placeholder is needed, as opposed to the staking transaction (see above)

# **Claiming unused tokens from Staking**

If a node operator has sent a staking transaction containing an amount of EGLD higher than the requirement for the nodes listed in the transaction, they can claim back the remainder of the sum with a simple _claim transaction_, containing:

- An amount of 0 EGLD
- A gas limit of 6 000 000 gas units

An example of a claim transaction is:

```
ClaimTransaction {
    Sender: <account address of the node operator>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqplllst77y4l
    Value: 0 EGLD
    Data: "claim"
    GasLimit: 6000000
}
```

After this transaction is processed, the Staking smart contract will produce a transaction _back_ to the sender account, but only if the sender account has previously staked for nodes, using a staking transaction.
