# Execution going to a Sovereign Chain
![To Sovereign](../../static/sovereign/ToSovereign.png)

The ability to bridge tokens from the Mainchain to any Sovereign Chain is a required feature since any Sovereign will have the ability to be connected to the Main MultiversX Chain. With that the customizable Sovereign will have the ability to use any token used in the default network.

The most innovative part of the bridging mechanism from the Mainchain is that it is completely off-chain. The transfer of tokens is done with events and with the deposit endpoint.


### `deposit` endpoint
```rust
    #[payable("*")]
    #[endpoint]
    fn deposit(
        &self,
        to: ManagedAddress,
        optional_transfer_data: OptionalValueTransferDataTuple<Self::Api>,
    )
```

Depositing tokens to the Sovereign Chain is an important feature. One key aspect is being able to bridge tokens and also execute any endpoints within a single transaction. This endpoint first checks if the current Sovereign Chain has any enabled fees. Keep in mind that a maximum of 10 transfers per transaction is allowed.

Since a token whitelist system is in place, each token received by this endpoint has to be whitelisted; if not, it will be refunded. In a successful scenario the tokens will be verified for the corresponding chain prefix and will be burned.

As suggested by the parameters, the TransferData value can be optional. If any value is provided, there are 2 checks needed to be done before finishing bridging process:

- Check if the gas limit is under the specified limit.
- If the endpoint that has to be executed is not banned.

As mentioned in the diagram, the bridging process to the Sovereign Chain is being done with events. At the end of the deposit() endpoint, an event will be emitted and then the bridging process is complete.


```rust
#[event("deposit")]
fn deposit_event(
    &self,
    #[indexed] dest_address: &ManagedAddress,
    #[indexed] tokens: &MultiValueEncoded<MultiValue3<TokenIdentifier, u64, EsdtTokenData>>,
    event_data: OperationData<Self::Api>,
)
```

The event will propagate to the network information about the destination address and what tokens have been bridged in order to be handle by the protocol.
