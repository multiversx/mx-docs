# `executeBridgeOps@hashOfHashes@Operation`

This endpoint is responsible for executing and transferring the operation that is given as a parameter. The first checks that are performed include:

- If the current chain isn’t a Sovereign Chain, execution must happen inside the Main Chain.
- Ensure that the Smart Contract isn’t paused.
- Verify that the given Operation’s hash is registered by the `HeaderVerifier` Smart Contract.
- Check if the given tokens from the Operation are registered. If they are not registered, a Fail Event will be emitted.

After all these checks, the execution can start. But what does “execution” mean in this context? Here, it refers to bridging and creating tokens from a Sovereign Chain to the Main Chain or even from one Sovereign Chain to another. To understand how this is done, let’s take a closer look at the `Operation` struct:

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode, TypeAbi, ManagedVecItem, Clone)]
pub struct Operation<M: ManagedTypeApi> {
    pub to: ManagedAddress<M>,
    pub tokens: ManagedVec<M, OperationEsdtPayment<M>>,
    pub data: OperationData<M>,
}
```

As seen in the code snippet, the `Operation` struct contains a `to` address (the destination of the operation), a `tokens` array, and `data`. Different structs are used for each attribute since they are complex types, making them more readable and easier to use.

## I. Token Payment as `OperationEsdtPayment`

```rust
pub struct OperationEsdtPayment<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub token_data: EsdtTokenData<M>,
}
```

This struct describes each token payment within an `Operation`. The reasoning behind this structure is the need for identification, nonce, and data for minting or creating new tokens. `EsdtTokenData` is a struct related to the native ESDT tokens within the MultiversX protocol. If you are not familiar with ESDT tokens, we suggest reviewing our documentation as they are an important part of the ecosystem.

## II. Operation Data as `OperationData`

```rust
pub struct OperationData<M: ManagedTypeApi> {
    pub op_nonce: TxId,
    pub op_sender: ManagedAddress<M>,
    pub opt_transfer_data: Option<TransferData<M>>,
}
```

You may wonder why there are two structs related to “data.” The reason behind the `OperationData` struct is to encapsulate the needed information for the Operation that needs to be executed. These fields will be used for event logging, token refunds in case of transaction error, and execution of remote functions.

## III. Endpoints Execution Specified in `TransferData`

```rust
pub struct TransferData<M: ManagedTypeApi> {
    pub gas_limit: GasLimit,
    pub function: ManagedBuffer<M>,
    pub args: ManagedVec<M, ManagedBuffer<M>>,
}
```

One of the most important features of the `executeBridgeOps` endpoint is the ability to execute multiple endpoints with one transaction. This struct has all the necessary information for the execution of those endpoints:

- `Gas_limit`: Specifies the needed gas for the execution of all other endpoints.
- `Function`: The name of the endpoint that will be executed.
- `Args`: The arguments for the calls.

The actual execution phase takes place in another Smart Contract called `Token Handler`, which will be discussed in a separate section.
