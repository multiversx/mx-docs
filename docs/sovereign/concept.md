# Concept

:::note

This documentation is not complete. More content will be added once it is accepted and discussed on Agora or once it is implemented and available for production.

The content created here is derived from:
- [Sovereign Shards - MIP7 - part - 1](https://agora.multiversx.com/t/sovereign-shards-mip-7-part-1/185)

:::

The MultiversX blockchain utilizes a fully sharded architecture designed for scalability, processing tens of thousands of transactions per second, and allowing developers to deploy decentralized applications using smart contracts. The in-protocol token standard, ESDT, facilitates simple, inexpensive, secure and scalable token transfers. As the network expands, new shards are created, enabling horizontal scaling. Additionally, parallelization within the same shard supports vertical scaling. The system is decentralized, public, open, and uses EGLD as its base token.

However, certain systems and applications require more customization than what a general-purpose network like MultiversX can offer. App-specific blockchains are tailored to run specific applications, providing several benefits:

- **Increased Performance**: Dedicating blockspace and computational resources to one concept can improve transaction throughput, reduce latency, and lower fees. This is important for applications needing high performance, such as gaming, real world use cases or DeFi.

- **Flexibility and Sovereignty**: Developers can customize various aspects of their blockchain, including the security model, fee token and model, governance mechanism, and VM. This customization can attract and retain users by offering unique incentive schemes, tokenomics models, and user experiences.

Sovereign Chains aim to provide an SDK that allows developers to create highly efficient chains connected to the global MultiversX Network. This enables composability, interoperability, and simplified usability across all chains, leveraging existing infrastructure and enhancing user experience.

## Historical Context

### Issues with Layer2 Solutions

The concept of Sovereign Chains is introduced to address some of the most encountered issues:

- **Unified Liquidity and Application Ecosystem:** Sovereign Chains eliminate the need for fragmented multi-signature wallets by providing a unified ecosystem. This ensures that liquidity is not dispersed and applications can operate seamlessly without silos.

- **Simplified User Experience:** With Sovereign Chains, users interact within a single ecosystem that supports all necessary operations, eliminating the need for multiple gas tokens. This streamlines the user experience, making interactions more intuitive and user-friendly.

- **Built-In Interoperability and Composability:** Sovereign Chains are designed with interoperability and composability as core features. Applications deployed on Sovereign Chains can interact seamlessly, leveraging built-in protocols that ensure secure and efficient cross-chain operations.

- **Seamless Fund Movement and Deployment Adaptation**: Users can move funds effortlessly across different shards and deployments within the Sovereign Chain ecosystem. This flexibility simplifies adaptation to various applications and enhances overall adoption.

## Concept of Sovereign Chains

**High-Level Features**

- **High Performance**: Capable of >4000 DeFi/Gaming transactions per second, achieved by a new consensus model that dedicates 90-95% of time to processing. Nevertheless this model will also be launched on the mainchain.
- **Configurable Features**: Options for private vs. public chains, staking setups, smart contracts, ESDTs, and customizable gas and transaction fees.

**Virtual Machine (VM) Configurations**

- **Default VMs**: SystemVM (GO) and WasmVM.
- **Custom VMs**: 
    - Ethereum Compatible VM;
    - Bitcoin Compatible VM;
    - Solana Compatible VM;

**Built-in Cross-Chain Mechanism**

A built-in cross-chain mechanism facilitates token transfers between the sovereign chain and the MultiversX network without relayers. The process ensures seamless interoperability and security through validator verification and proof systems.

## Cross-Chain Mechanism Concept

### Mainchain to Sovereign Chain Concept

#### 1. Sovereign Notifier Service and Header Inclusion

Sovereign Notifier Service

Validators on the Sovereign Chain should run a notifier service to monitor cross-chain transactions from the MultiversX mainchain. This service can connect to the validators' own nodes or public notifier services to receive notification events.

Header Inclusion Process

- *Detection*: When the leader validator detects a new header from the MultiversX mainchain, it attempts to include this header in the current block it is building.
- *Adding* `ShardHeaderHash`: The leader specifically adds the MultiversX `ShardHeaderHash` to the `SovereignShardHeader`.
- *Transaction Processing*: If there are cross-chain transactions from the mainchain, the protocol mandates the leader and validators to process all these transactions before adding the new `ShardHeaderHash`. This mimics the cross-shard transaction processing in MultiversX.

ShardHeader Inclusion

1. A `SovereignShardHeader` can contain multiple ShardHeaderHashes.
2. The leader adds only finalized ShardHeaders from the mainchain.
3. New MultiversX HeaderHash cannot be added if previous transactions are not executed.

#### 2. Execution of Incoming Transactions
Creating Miniblocks

- *Transaction Collection*: The leader collects all incoming cross-chain transactions and creates a miniblock named `“INCOMING TXS”`.
- *Data Preparation*: The notifier service prepares relevant data, including proof of execution, data availability, correctness, and finality.
- *Data Sending*: This prepared data is pushed to the Sovereign Chain client.

Validator Verification

1. Validators on the Sovereign Chain verify the leader's miniblock creation.
2. Validators perform header verification, incoming transaction creation, proof verification, and finality checks.
3. If verification fails, validators do not sign the block, preventing its creation.

Gas-Free Execution

1. Incoming cross-chain transactions are executed without gas on the Sovereign Chain.
    - these transactions are treated as DestME ESDT transfers, ensuring fast execution and complete integration with the MultiversX chain.

#### 3. UI and Smart Contract on MultiversX Chain

The intention is that the user should not feel the complexity of transfering a token from one chain to the other. That's why in 3 easy steps a cross-chain transaction should be felt as successful:

1. Users execute a transaction on the MultiversX chain directed towards the cross-chain contract.
2. Upon successful transaction on the mainchain, the user receives tokens on the Sovereign Chain.
3. The execution and transfer are done as the initial user, maintaining seamless cross-chain interaction.

But how do we achieve that? Even though the main components are going to be described at several stages in the documentation, from conceptual point of view we have the:

ESDTSafe Contract

- Functionality: Users can deposit tokens and specify the destination address and execution call.
- Endpoint: `deposit@address@gasLimit@functionToCall@arguments` receiving a `MultiESDTNFTTransfer`.
- Verification: The contract verifies the validity of the address and generates a specific `logEvent`.

`logEvent` Structure
```json
Identifier: deposit
Address: scAddress
Topics: address, LIST<tokenID, nonceAsBytes, valueAsBytes/ESDTTransferData>
Data: localNonce (increasing), originalSender, gasLimit, functionToCall, arguments
```

Customizable Features

- General Fee Model: Configurable fee and fee token.
- Whitelist/Blacklist: Tokens can be whitelisted or blacklisted for transfer.

#### 4. Sovereign Chain Cross-Chain Execution
Preparation and Miniblock Creation

1. The notifier service generates an Extended Shard Header structure and an Incoming Txs miniblock based on logEvents.
2. Validators finalize blocks by including mainchain shard headers and all incoming transactions.

Token ID Collision Avoidance

To avoid token ID collisions, each deployed Sovereign Chain adds a unique prefix or increasing nonce when registering token IDs on the ESDT SC. This ensures clear distinction of token origins on the Sovereign Chain.

#### 5. Mainchain to Sovereign Shard Process

    Notifier Service: Validators receive notifications of mainchain bridge transactions.
    Header Inclusion: Leaders include finalized MultiversX ShardHeaders in the SovereignShardHeader.
    Transaction Execution: Leaders collect and execute incoming transactions, forming an INCOMING TXS miniblock.
    Validator Verification: Validators verify and sign the block, ensuring all transactions are processed.
    Gas-Free Execution: Transactions are executed without gas on the Sovereign Shard, treated as DestME ESDT transfers.

### Sovereign Chain to MultiversX Mainchain

The Sovereign Chain to MultiversX Mainchain cross-chain communication process involves synchronizing the mainchain with the Sovereign Chain, handling cross-chain transactions, and ensuring smooth token transfers between the two. This description provides a conceptual explanation of the roles, processes, and smart contract interactions involved.

#### Responsibilities of Sovereign Validators

Sovereign Validators have two primary responsibilities:

1. Syncing with the mainchain and pushing bridge transactions.
2. Managing transfers from Sovereign to Main and vice versa.

Types of Tokens

There are two types of tokens involved in the bridging process:

- **Token Type A**: Tokens initially originating from Main to Sovereign, with liquidity held in the safe contract on Main.
- **Token Type B**: New tokens first issued on the Sovereign Chain, requiring creation and specific roles (`localMint`, `nftCreate`) for the `esdt-safe` contract.

**Cross-Chain tx Process**

Token Deposit

**1. Users Deposit Tokens:**
        Users on Sovereign deposit tokens into the `esdt-safe` contract on the Sovereign Chain. Now tokens are either burned (for Token Type A) or kept in the safe (for Token Type B).

**2. Block Creation and Finalization:**
        The Sovereign chain creates the next block and finalizes it. Outgoing transactions (Crossing to MultiversX) are compiled into compressed operations data.

**3. Header Hash Addition:**
        The leader adds the hash of the outgoing transaction data to the header of the Sovereign Chain block. Validators reach consensus, signing the header, which the leader combines using BLS multi-signature.

**4. Posting to Mainchain:**
        The signed header and list of outgoing transactions are posted to the MultiversX chain. The transaction data on MultiversX contains the signed header of the Sovereign chain, the outgoing operations data hash, and the full arguments of the outgoing operations.

**5. Contract Validation and Execution:**
        The contract on MultiversX validates the signed header and BLS multi-signature. It verifies if 

```rust
hash(outgoing operations data) = header.outgoingOpsHash
```

The bridge contract executes the operations, performing `TransferESDT/MultiTransferESDTNFT` for *Token Type A* and `minting/creating NFTs` for *Token Type B*.

**Finality and Consensus**

To ensure the integrity and synchronization between the Sovereign Chain and the mainchain, the following steps are taken:

- The Sovereign chain header includes an outgoing operations hash, which encapsulates the details of the operations to be executed on the mainchain.
- Once the outgoing operations are executed on the mainchain in subsequent blocks, the Sovereign chain remains synchronized by validating every MultiversX header hash.
- The finality gadget plays an important role by ensuring that a header with *Nonce X* on the Sovereign chain is only finalized after confirming that the mainchain has executed the outgoing operations from the previous header. This interconnected process maintains consistency and order of operations.

**Incentives and Validation**

To encourage validators to ensure the smooth operation of bridge transactions and maintain network integrity, the following incentive and validation mechanisms are implemented:

- **Incentive Structure Proposal:** Validators are incentivized to push outgoing transactions to the mainchain by distributing collected fees among them. Specifically, 10% of the fees are allocated to the leader, while the remaining 90% is distributed among the other validators. This incentivization ensures active participation and prompt processing of transactions.

- **Validation Process:** Finality is crucial to maintaining the order and integrity of transactions. The system ensures that outgoing operations are executed in sequence without any gaps. This is achieved by generating `logEvents` on the mainchain, which are then pushed to the Sovereign Chain. These `logEvents` serve as proof of execution, ensuring validators can verify the completion and correctness of transactions, thereby maintaining a reliable and secure cross-chain operation.

#### Smart Contracts for Cross Chain Tx

Process:

1. `SovereignMultiSigContract` is created and is the parent of the *ESDTSafe* contract, and only the `sovereignMultiSigContract` is allowed to transfer out funds from the `ESDTSafe` contract.

2. The OutGoingTXData BLS MultiSigned by the validators will be put inside a mainchain transaction and sent by the leader of the Sovereign Chain for the current block. This transaction contains a set of token operations for a set of addresses.
```
txData = bridgeOps@LIST<address<LIST<tokenID, nonceAsBytes, valueAsBytes>, gasLimit,functionToCall, Arguments>>@Nonce@BLSMultiSig
```

The `sovereignMultiSigContract` first verifies if the BLSMultiSig is valid and whether it is signed by 67% of the BLSPubkeys registered in the sovereignMultiSigContract. If yes, the contract calls with the ESDTSafe contract to transfer the set of tokens. The ESDTSafe contract will iterate on the given list and make a multiESDTNFTTransfer to the given addresses with the given tokens.

The contract emits a logEvent the same way as mainchain to sovereign ESDTSafe SC does, in order to keep track of the processed outgoing transactions. This logEvent will be pushed towards the sovereign shard, in order to notarize the finalization of processing of the OutGoingTxData. This will close the loop of processing and offer utmost security for all funds.

```
Identifier = bridgeOps
Address = scAddress
Topics = sender, hash(outGoingTxData)
Data = nonce - increasing from internal storage
```
The created event is an attestation that the `outGoingTx` was executed on the mainchain, and using this attestation on the sovereign chain, the rewards can be distributed from the accumulated fees.
