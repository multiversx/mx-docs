# Enshrine ESDT Safe Bridge Contract
## `executeBridgeOps@hashOfHashes@Operation`
```rust
#[endpoint(executeBridgeOps)]
fn execute_operations(&self, hash_of_hashes: ManagedBuffer, operation: Operation<Self::Api>)
```
This endpoint is responsible for executing and transferring the `Operation` that is given as a parameter. The first checks that are performed include:

- If the current chain isn’t a Sovereign Chain, execution must happen inside the Main Chain.
- Ensure that the Smart Contract isn’t paused.
- Verify that the given `Operation`’s hash is registered by the `HeaderVerifier` Smart Contract.
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

### I. Token Payment as `OperationEsdtPayment`

```rust
pub struct OperationEsdtPayment<M: ManagedTypeApi> {
    pub token_identifier: TokenIdentifier<M>,
    pub token_nonce: u64,
    pub token_data: EsdtTokenData<M>,
}
```

This struct describes each token payment within an `Operation`. The reasoning behind this structure is the need for identification, nonce, and data for minting or creating new tokens. `EsdtTokenData` is a struct related to the native ESDT tokens within the MultiversX protocol. If you are not familiar with ESDT tokens, we suggest reviewing our [documentation](https://docs.multiversx.com/tokens/intro/) as they are an important part of the ecosystem.

### II. Operation Data as `OperationData`

```rust
pub struct OperationData<M: ManagedTypeApi> {
    pub op_nonce: TxId,
    pub op_sender: ManagedAddress<M>,
    pub opt_transfer_data: Option<TransferData<M>>,
}
```

You may wonder why there are two structs related to “data.” The reason behind the `OperationData` struct is to encapsulate the needed information for the Operation that needs to be executed. These fields will be used for event logging, token refunds in case of transaction error, and execution of remote functions.

### III. Endpoints Execution Specified in `TransferData`

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

## `registerNewTokenId`
The name of this endpoint is pretty self explanatory. It is used to insert an array of tokens inside the bridge's storage. The endpoint is also payable because registering a new token identifier costs 0.05 WEGLD. There are 2 checks:

- If the received token as payment is in fact `WEGLD`.
- If the amount received as payment is exactly the needed amount for registering all the tokens.

## `deposit`
```rust
    #[payable("*")]
    #[endpoint]
    fn deposit(
        &self,
        to: ManagedAddress,
        opt_transfer_data: OptionalValue<
            MultiValue3<GasLimit, ManagedBuffer, ManagedVec<ManagedBuffer>>,
        >,
    )
```
Depositing tokens to the Sovereign Chain is an important feature. One big feature is being able to bridge tokens and also execute other functions from a single transaction. This endpoint firstly checks if there is any fee enabled for the current Sovereign Chain.
If any fee is enabled there is a convention implemented that the first payment sent as parameter to be the fee token. Another convention is that there can only be 10 maximum transfers per transaction.   

Since there is a token whitelist system in place, each token received by this endpoint will be checked for this condition and in the case that the token is not whitelisted it will be simply refunded back to the caller. In the other scenario the tokens will be verifier for the chain prefix inside the `TokenIdentifier` field and with that they will be burned from the current chain the transaction will be happening.
As the parameters suggest, the `TransferData` value can be optional. In the case when it's not, there are 2 checks needed to be done before finishing the process of bridging. 

- Check if the gas limit is under the specified limit.
- If the endpoint that has to be executed is not banned.

The bridging of the tokens happen through smart contracts events. In this case the event will look like this:

```rust
#[event("deposit")]
fn deposit_event(
    &self,
    #[indexed] dest_address: &ManagedAddress,
    #[indexed] tokens: &MultiValueEncoded<MultiValue3<TokenIdentifier, u64, EsdtTokenData>>,
    event_data: OperationData<Self::Api>,
);
```
Events are another great feature of the MultiversX protocol. We recommend taking a look over the [Events documentation](https://docs.multiversx.com/developers/event-logs/execution-events/).
# Token Handler SC
The Token Handler SC takes the responsibility of the bridge for issuing and minting tokens. When a new Sovereign Chain will be deployed there will be multiple bridge contracts that will call the same Token Handler.

## `whitelistEnshrineEsdt`
```rust
    #[only_owner]
    #[endpoint(whitelistEnshrineEsdt)]
    fn whitelist_enshrine_esdt(&self, enshrine_esdt_address: ManagedAddress<Self::Api>)
```
Since there will be multiple bridge contracts that will call the same Token Handler contract, those have to be whitelisted so only them can call it. This endpoint has the `[only_owner]` annotation to specify that nobody else but the owner can whitelist any other contract.
The only implied check on this endpoint is that the address given as parameter is in fact a valid smart contract address and if this condition is met, the address is registered in the contract's storage.

## `transferTokens`
```rust
    #[payable("*")]
    #[endpoint(transferTokens)]
    fn transfer_tokens(
        &self,
        opt_transfer_data: Option<TransferData<Self::Api>>,
        to: ManagedAddress,
        tokens: MultiValueEncoded<OperationEsdtPayment<Self::Api>>,
    )
```
This endpoint is the logic for transferring tokens between Sovereign Chains. At first sight it seems pretty simple since it has few lines of code. The `structs` used as parameters will probably look familiar if you read the `Enshrine ESDT` section because they were explained there.
```rust
        opt_transfer_data: Option<TransferData<Self::Api>>,
        to: ManagedAddress,
        tokens: MultiValueEncoded<OperationEsdtPayment<Self::Api>>,
```
The first step is to mint the tokens received as a parameter. Here for each token received the contract will make a `sync_call` to the ESDT System SC on the `esdt_local_mint` function if the nonce of the token is equal to 0, meaning it is not a NFT token. In the latter case, the contract will send a raw call to the same System SC but for the NFT create function. 
After the minting step, there comes the *distribution* step. If the given `opt_transfer_data` has any data this means that the Token Handler will initiate a raw call towards another contract. Information such as receiver address, function name, arguments, gas limit are specified in `transfer_data`. If the optional structure holds no data means that the given tokens are meant for a simple transfer and with that the ESDT multi transfer function is called.
