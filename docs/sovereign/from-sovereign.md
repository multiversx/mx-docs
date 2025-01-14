# Execution starting from a Sovereign Chain
![From Sovereign](../../static/sovereign/from-sovereign.png)

For the user — whether an External Owned Account (EOA) like a user wallet or another smart contract — procedure is simple. An address will be able to perform a multiTransfer deposit for various types of tokens:
1. Fungible Tokens
2. Non-Fungible Tokens
3. Semi-Fungible Tokens
4. Meta ESDT Tokens

When making the deposit, the user specifies:
1. A destination address on the Sovereign Chain
2. The function to call
3. Any required arguments
4. *gasLimit* if a smart contract execution is needed after the cross-chain operation

Each action that can be executed remotely through this contract is called an *Operation*. The endpoint responsible for executing those operations is called `execute_operations`.

#### Execution from inside the Sovereign Chain flow
1. User sends token to the ESDT-Safe smart contract on Sovereign.
2. The validators generate a proof on the Sovereign Chain for a batch of transfers, which will be sent to the mainchain ESDT-Safe contract.
3. Validators add this information to the sovereignChainBlockBody. Otherwise the block is not signed.
4. Leader will push the created txData to the mainchain
5. The ESDT-Safe contract on the mainchain verifies the proof and executes the transfers.
6. Sovereign validators notarize the completion of the transfer in the subsequent Sovereign block by receiving the attestation log event directly from the mainchain.

Before talking about the logic of the endpoint, let’s give some more context about the *Operation*.

This structure, derived with multiple traits for serialization, encoding, and type interfacing, represents a fundamental unit of execution within the bridging mechanism.

:::note
The source code for the following structures can be found [here](https://github.com/multiversx/mx-sovereign-sc/blob/main/common/transaction/src/lib.rs)
:::

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, ManagedVecItem, Clone)]
pub struct Operation<M: ManagedTypeApi> {
    pub to: ManagedAddress<M>,
    pub tokens: ManagedVec<M, OperationEsdtPayment<M>>,
    pub data: OperationData<M>,
}
```

- `to`: specifies the destination of the *Operation*
- `tokens`: represents one or more token transfers associated with the operation
- `data`: encapsulates additional instructions or parameters that guide the execution of the operation

Why do we need so many custom structures? This a question related to clean code principles, the answer is easy: to ensure that complex logic remains organized and maintainable, thus improving code extension and flexibility.

```rust
pub struct OperationEsdtPayment<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub token_data: EsdtTokenData<M>,
}
```

This struct describes a single token transfer action within an Operation. Each Operation can have one or more of such payments, with that enabling the transfer of a variety of tokens during a cross-chain transaction.

- `token_identifier`: used for the identification of the token
- `token_nonce`: if the token is Non-Fungible or Semi-Fungible, it will have a custom nonce, if not the value will be 0
- `token_data`: a structure holding metadata and additional token-related details used for minting, token creation (for more details about this structure, please visit the official ESDT Documentation)

```rust
pub struct OperationData<M: ManagedTypeApi> {
    pub op_nonce: TxId,
    pub op_sender: ManagedAddress<M>,
    pub opt_transfer_data: Option<TransferData<M>>,
}
```

`OperationData` encapsulates the needed information for the *Operation* that needs to be executed. This isn’t just another data definition, we’ve already seen data-related fields elsewhere. Instead, it centralizes the contextual information that *Operation* needs before, during, and after execution.

- `op_nonce`: is used for the identification of each *Operation*
- `op_sender`: represents the original sender of the *Operation*
- `opt_transfer_data`: an optional `TransferData` field, when present, contains details about the cross-chain execution of another Smart Contract

```rust
pub struct TransferData<M: ManagedTypeApi> {
    pub gas_limit: GasLimit,
    pub function: ManagedBuffer<M>,
    pub args: ManagedVec<M, ManagedBuffer<M>>,
}
```

`TransferData` represents the description of the remove execution of another Smart Contract, one standout feature of the `executeBridgeOps` endpoint is the capability of executing multiple endpoint calls in one transaction.

- `gas_limit`: specifies the needed gas for the execution of all other endpoints.
- `function`: the name of the endpoint that will be executed.
- `args`: the arguments for the calls.


:::note
The source code for the endpoint can be found [here](https://github.com/multiversx/mx-sovereign-sc/blob/main/esdt-safe/src/from_sovereign/transfer_tokens.rs)
:::
### Executing an *Operation*

This endpoint serves as the key component in orchestrating cross-chain operations within the bridging mechanism.
```rust
#[endpoint(executeBridgeOps)]
 fn execute_operations(
    &self, 
    hash_of_hashes: ManagedBuffer, 
    operation: Operation<Self::Api>
)
```
- `hash_of_hashes`: the key for the hashes map used to track executed and non executed Operations
- `operation`: the data and the behavior for the cross-chain execution that must happen

1. If the current chain isn’t a Sovereign Chain, execution must happen inside the Main Chain.
2. Verify that the given Operation’s hash is registered by the Header-Verifier Smart Contract.
3. Check if the given tokens from the Operation are registered. If they are not registered, a Fail Event will be emitted.
