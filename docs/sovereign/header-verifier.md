# Header-Verifier SC

As mentioned in the [Introduction](cross-chain-execution.md) the Header-Verifier smart contract is responsible to verify signatures, store the *BLS Keys* of the validators and register incoming *Operations*.

### Registering a set of *Operations*
```rust
    #[endpoint(registerBridgeOps)]
    fn register_bridge_operations(
        &self,
        signature: BlsSignature<Self::Api>,
        bridge_operations_hash: ManagedBuffer,
        operations_hashes: MultiValueEncoded<ManagedBuffer>,
    )
```

Any *Operation* before being executed has to be registered in this smart contract. The reason behind this is that the hash will be verified and it will be locked until the operation is executed by the ESDT-Safe contract.

The registering endpoint operates as follows:
1. Verifies that  `bridge_operations_hash` is not found in the `hash_of_hashes_history` storage mapper, otherwise it will return an error.
2. Verifies that the hash of all `operations_hashes` matches the `bridge_operations_hash, otherwise, the endpoint will return an error.
3. All `operations_hashes` are stored in the smart contract's storage with the status OperationsHashStatus::NotLocked.
4. The `bridge_operations_hash` is added to the `hash_of_hashes_history` storage mapper.

```rust
    #[endpoint(lockOperationHash)]
    fn lock_operation_hash(&self, hash_of_hashes: ManagedBuffer, operation_hash: ManagedBuffer)
```

The Header-Verifier has a system in place for locking *Operation* hashes. Locking those registered hashes prevents any unwanted behaviour when executing or removing an *Operation* hash. Remember that the execution of *Operations* can only be done by the ESDT-Safe smart contract. This endpoint when called will follow this flow:

1. Check if the caller is the ESDT-Safe smart contract.
2. Check if the *Operation* is registered.
3. If the hash is not locked set the status in the storage as locked or else return panic.

:::note
The hash can be in two different states: `OperationHashStatus::NotLocked` or `OperationHashStatus::Locked`
:::

```rust
    #[endpoint(removeExecutedHash)]
    fn remove_executed_hash(&self, hash_of_hashes: &ManagedBuffer, operation_hash: &ManagedBuffer)
```

After registering and executing an *Operation* the status of the hash associated to it must be removed from the Header-Verifier's internal storage. This endpoint will be called by the ESDT-Safe smart contract after the execution of the *Operation* is successful. The steps are pretty clear:

1. Check if the caller is the ESDT-Safe smart contract.
2. Remove the status of the hash from storage.

:::note
The source code for this contract can be found [here](https://github.com/multiversx/mx-sovereign-sc/blob/main/header-verifier/src/lib.rs).
:::
