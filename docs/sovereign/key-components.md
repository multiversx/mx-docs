# Key Components

:::note

This documentation is not complete. More content will be added once it is accepted and discussed on Agora or once it is implemented and available for production.

:::

Sovereign Chains mark significant progress for MultiversX in the field of appchains. While the concept is straightforward to discuss in general terms, developers, builders, or other entities looking to launch a sovereign chain need to consider several critical components. For clarity, we will divide these components into four major categories and describe the importance and role of each one.

![img](/sovereign/sovereign-1.png)


### **1. Sovereign Cross-Chain Smart Contracts**

In order to have a native *connection* with the MultiversX MainChain three smart contracts have to be deployed:

#### **```esdt-safe``` Contract**

The ```esdt-safe``` smart contract, which operates on both the mainchain and the sovereign chain, is the primary contract responsible for token transfers.

Mainchain Endpoints:

- ```deposit```: This endpoint performs a ```MultiESDTNFTTransfer``` to the contract, locking the tokens on the mainchain and initiating their transfer to the sovereign chain (tokens on the mainchain remain locked in the smart contract, while those on the sovereign chain are burned).
- ```executeBridgeOps```: Called by the bridge service wallet, this endpoint transfers tokens on the mainchain. It first verifies that these operations have been previously stored in the multisig contract before executing.
- ```registerToken```: Issues a token and maps it to a sovereign token ID, granting the mainchain contract the rights to mint/burn and requiring a payment of 0.05 EGLD for the token issuance on the mainchain.

Sovereign Chain Endpoint:

- ```deposit```: Burns the token being sent to the mainchain. `registerToken` must be called beforehand to enable bridging, and the contract must have the *burn right* set. The default `ESDTRoleBurnForAll` role is assigned to any issued token. If this role is deactivated, a transaction is required to assign the *burn role*, facilitated by the script `setLocalBurnRoleSovereign`.

#### **Fee Market Contract**

This contract allows you to specify the fee for deposit transactions. The fee structure can vary and includes:
- No fee;
- Fixed fee with a specific token;
- Fee with any token (currently, this requires a check through an xexchange contract, which is not yet operational);

The fee is applicable either per token in the `MultiESDTNFTTransfer` action or based on the gas used in the deposit transaction.

### **MultiSig Verifier**

The `multisig` smart contract, operates solely on the mainchain, and is responsible for managing and validating the multi-signature operations for bridge transactions. It registers the public keys of the validators from the sovereign chain. It also validates the multi-signature received on this endpoint which is called by the bridge service:
- `registerBridgeOps` - here, the multisig is validated, the hashes of the bridge operations are verified, and the hashes are recorded (these hashes are checked during the execution of executeBridgeOps).

### **2. Sovereign Notifier**

:::note
The Sovereign Notifier exports outport blocks to Sovereign Chain. It needs to be a server outport host driver.
:::

There is only one Sovereign Notifier per Sovereign Chain, started specifically on the shard where the Sovereign's `esdt-safe` contract is deployed. It is subscribed to the address of the `esdt-safe` contract (automatically set during genesis by scripts). It listens for events with the IDs `deposit` and `execute`. When it detects an event, it sends the event to the sovereign chain as an incoming operation. The nodes then recognize the operation, process it, and the funds are credited to the account.

### **3. Sovereign Cross-Chain TX Service**

The Sovereign Cross-Chain TX service, connected via gRPC, manages the interaction between the mainchain and the sovereign chain for token transfers and other operations.

For the setup described in this documentation, there is a single cross-chain tx service in operation (recommended it is for every validator from Sovereign Chain to have a running cross-chain tx service for each instance). It has a wallet attached from the mainchain and contains addresses from the cross-chain contracts (`multisig` for registration and `esdt-safe` for execution), along with various security certificates.

#### Functionality:
- **Outgoing Operations**: The service listens for outgoing operations created from logs of deposit events in esdt-safe on the sovereign chain.
- **Validation and Signing**: These operations are validated, signed, hashed, and processed by all validators on the sovereign chain.
- **Register and Execute**: Once the service receives a validated operation, it sends the operation to the registerBridgeOps endpoint in the multisig contract and then to the executeBridgeOps endpoint in the esdt-safe contract for execution.

### **4. Sovereign Chain**

Info to be added about how to setup the nodes on a sovereign chain.


