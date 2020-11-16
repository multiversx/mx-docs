# Staking, unstaking and unjailing

Before staking, a node is a mere observer. After staking, the node becomes a validator, which means that it will be eligible for consensus and will earn rewards. Validators play a central role in the operation of the network.

**Staking** is the process by which the operator of the node sends a sum of 2500 eGLD to be locked in a system SmartContract. Multiple nodes can be staked for at once, and their operator must lock 2500 eGLD for each of the nodes. This sum acts as a collateral, and it will be released back to the node operator through the process of **unstaking**, with a final step called **unbonding**.

A validator node produces rewards, which are transferred to the node operator at their **reward address** of choice, decided upon during the staking process. The reward address may be changed after staking as well.

If a validator has poor performance, the network will *jail* it, which means that it will not be able to participate in consensus anymore, nor will it produce rewards. The node must be **unjailed** before it can resume its role as a validator.

The processes mentioned above (staking, unstaking, unbonding, changing the reward address and unjailing) are performed by interacting with the Staking SmartContract, integrated into the Elrond protocol.

Each such process requires a transaction to be sent to the Staking SmartContract. These transactions must contain all the required information, encoded properly, and must provide a high enough gas limit to allow for successful execution. These details are described in the following pages.

There are currently 2 supported methods of constructing and submitting these transactions to the Staking SmartContract: 

- Manually constructing the transaction, then submitting it to [wallet.elrond.com](https://wallet.elrond.com/);
- Automatically constructing the transaction and submitting it using the `erdpy` command-line tool.

The following pages will describe both approaches in each specific case.