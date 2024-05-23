# Concept

:::note

This documentation is not complete. More content will be added once it is accepted and discussed on Agora or once it is implemented and available for production.

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
- Endpoint: `deposit@address@functionToCall@arguments@gasLimit` receiving a `MultiESDTNFTTransfer`.
- Verification: The contract verifies the validity of the address and generates a specific `logEvent`.

`logEvent` Structure
```init
Identifier: deposit
Address: scAddress
Topics: address, LIST<tokenID, nonceAsBytes, valueAsBytes/ESDTTransferData>
Data: localNonce (increasing), originalSender, gasLimit, functionToCall, Arguments
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


