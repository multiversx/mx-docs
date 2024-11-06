---
id: tx-run
title: Run transactions
---

[comment]: # (mx-abstract)

## Overview

As discussed previously, the transaction syntax is consistent through the various transaction environments. However, when sending the transaction across a specific environment, certain conditions apply, depending on the framework's capability of processing the information and the route of the transaction.

:::note
The transaction itself is not different and will produce the same result, but the way the framework processes the transaction might differ depending on the environment.
:::

[comment]: # (mx-context-auto)

## Smart contract 

From the smart contract point of view, the transaction ends when specifying the transaction type (sync/async call).

[comment]: # (mx-context-auto)

### `async_call_and_exit` 

Executes the transaction asynchronously and exits after execution.

```rust title=contract.rs
    self.tx() // tx with sc environment
        .to(&marketplace_address)
        .typed(nft_marketplace_proxy::NftMarketplaceProxy)
        .claim_tokens(token_id, token_nonce, caller)
        .async_call_and_exit(); // async call and stop execution
```

In this case, the function `async_call_and_exit` marks the end of the transaction and executes it asynchronously. After the transaction is executed, the `never` type is returned, marking the end of the execution.

[comment]: # (mx-context-auto)

### `sync_call` 

Sends a transaction synchronously.

```rust title=contract.rs
    self
        .tx() // tx with sc environment
        .to(&to)
        .typed(vault_proxy::VaultProxy)
        .retrieve_funds(token, token_nonce, amount)
        .sync_call(); // synchronous call
```

[comment]: # (mx-context-auto)

### `upgrade_async_call_and_exit` 

Upgrades contract asynchronously and exits after execution.

```rust title=contract.rs
    self.tx() // tx with sc environment
        .to(child_sc_address)
        .typed(vault_proxy::VaultProxy)
        .upgrade(opt_arg) // calling the upgrade function
        .from_source(source_address)
        .upgrade_async_call_and_exit(); // upgrades async and exits
```

[comment]: # (mx-context-auto)

### `sync_call_same_context`

Executes the transaction synchronously on the same context (in the name of the caller).

```rust title=contract.rs
    self
        .tx() // tx with sc environment
        .to(&to)
        .raw_call(endpoint_name)
        .arguments_raw(args.to_arg_buffer())
        .sync_call_same_context(); // sync call in the same context
```

[comment]: # (mx-context-auto)

### `sync_call_readonly`

Executes the transaction synchronously, in readonly mode (target contract cannot have its state altered).

```rust title=contract.rs
    let result = self
        .tx() // tx with sc environment
        .to(&to)
        .raw_call(endpoint_name)
        .arguments_raw(args.to_arg_buffer())
        .returns(ReturnsRawResult) // result handler - returns raw result data
        .sync_call_readonly(); // sync call in readonly mode
```

### `transfer_execute`

Sends transaction asynchronously, and doesn't wait for callback.

```rust title=contract.rs
      self
          .tx()
          .to(&caller)
          .gas(50_000_000u64)
          .raw_call(func_name)
          .single_esdt(&token, 0u64, &amount)
          .transfer_execute();
```


### `transfer`

Same as `transfer_execute`, but only allowed for simple transfers.

```rust title=contract.rs
      self
          .tx()
          .to(&caller_address)
          .egld(&collected_fees)
          .transfer();
```


[comment]: # (mx-context-auto)

### `async_call`, `async_call_promise`

Backwards compatibility only.

:::important
For the moment, the functions `async_call` and `async_call_promise` exist for backwards compatibility reasons only. These functions do `NOT` execute a transaction, they just return the current object state. Delete them from existing codebases.
:::


[comment]: # (mx-context-auto)

## Integration test

For the Rust testing environment, the only keyword for sending transactions is `run`. Inside an integration test, a  developer can build a transaction, choose the return type and then `run` it, marking the end of the transaction and the start of the execution.

```rust title=blackbox_test.rs
    world // ScenarioWorld instance
        .query() // query with test environment
        .to(ADDER_ADDRESS)
        .typed(adder_proxy::AdderProxy)
        .sum()
        .returns(ExpectValue(6u32)) // result handler - assert return value
        .run(); // runs the query step
```

In this case, regarding of the type of the transaction (raw call, deploy, upgrade, query), it eventually turns into a scenario `Step` (`ScQueryStep`, `ScCallStep`, `ScDeployStep`) and it is processed as such. 


[comment]: # (mx-context-auto)

## Interactor

[comment]: # (mx-context-auto)

### Async Rust

In the case of the interactor, the processing is similar to the integration test, with the exception that the interactor is using async Rust. First, the transaction is built, then it is turned into a `Step` using the `prepare_async` function, then we can `run` it and `await` the result.

```rust title=interact.rs
    self.interactor // Interactor instance
        .tx() // tx with interactor exec environment
        .from(&self.wallet_address)
        .to(self.state.current_multisig_address())
        .gas(NumExpr("30,000,000"))
        .typed(multisig_proxy::MultisigProxy)
        .dns_register(dns_address, name)
        .prepare_async() // converts tx into step
        .run() // runs the step
        .await; // awaits the result - async Rust
```

[comment]: # (mx-context-auto)

### Sync Rust

We also have a plan for adding support for a blocking interactor API, but this is currently not available.



[comment]: # (mx-context-auto)

## Feature table

This table shows what transaction fields are mandatory, optional, or disallowed, in order to run a transaction.

<table>
   <thead>
      <tr>
         <th>Environment</th>
         <th>Run method</th>
         <th>From</th>
         <th>To</th>
         <th>Payment</th>
         <th>Gas</th>
         <th>Data</th>
         <th>Result Handler</th>
      </tr>
   </thead>
   <tbody class="table-center-content">
      <tr>
         <td>SC: call</td>
         <td><code>async_call_and_exit</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>⛔</td>
         <td>FC or <code>()</code></td>
         <td>callback only</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>register_promise</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>FC</td>
         <td>callbacks only, with gas for callback</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>transfer_execute</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>FC or <code>()</code></td>
         <td>⛔</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>transfer</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td><code>()</code></td>
         <td>⛔</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>sync_call</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>🟡</td>
         <td>FC</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>sync_call_same_context</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>🟡</td>
         <td>FC</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>SC: call</td>
         <td><code>sync_call_readonly</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td>✅</td>
         <td>🟡</td>
         <td>FC</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>SC: deploy</td>
         <td><code>sync_call</code></td>
         <td>⛔</td>
         <td>⛔</td>
         <td><img loading="lazy" alt="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABO0lEQVR4XtWUMa4BURiFzUgUIpGn0Uh4sQmd7pW2YgMSaluwDRtQqrQUejtQ4k5cmfmuuf9/zZ2XOMnXXOc/50hEoxGoJEluPuiPIpZoYU6w0jRdMjQUk8FclRhUFeZ7xeNYsOeteBQb9hVEc12wN1OMH5yWR92K/f/27S3q8vH1fBsed867xGC/zW75nkccYAIIPYR+381HAyyd2d/L155OnM/VA/hIhqedE6jF3DKPiAMsDJfgfRnqARYWEfolggdYqhZbvm8Aiwn9EuoBvcXcKSujv1k792WIA5o/XadAS2s0cPKI97+AgXl+LweVz8DcQnnoAHoI/b4bcUA+kO8SmrvXAGlEHRTKn1rRVBemi+WZaKwL9hZEc2zY91Y8igV7vOJxVZivVeUfpslgaLAYqoU5UcQSQr+kO8u8NsE2OCZnAAAAAElFTkSuQmCC" width="32" height="32" class="img_node_modules-@docusaurus-theme-classic-lib-theme-MDXComponents-Img-styles-module" /></td>
         <td>🟡</td>
         <td>deploy</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>SC: upgrade</td>
         <td><code>upgrade_async_call_and_exit</code></td>
         <td>⛔</td>
         <td>✅</td>
         <td><img loading="lazy" alt="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABO0lEQVR4XtWUMa4BURiFzUgUIpGn0Uh4sQmd7pW2YgMSaluwDRtQqrQUejtQ4k5cmfmuuf9/zZ2XOMnXXOc/50hEoxGoJEluPuiPIpZoYU6w0jRdMjQUk8FclRhUFeZ7xeNYsOeteBQb9hVEc12wN1OMH5yWR92K/f/27S3q8vH1fBsed867xGC/zW75nkccYAIIPYR+381HAyyd2d/L155OnM/VA/hIhqedE6jF3DKPiAMsDJfgfRnqARYWEfolggdYqhZbvm8Aiwn9EuoBvcXcKSujv1k792WIA5o/XadAS2s0cPKI97+AgXl+LweVz8DcQnnoAHoI/b4bcUA+kO8SmrvXAGlEHRTKn1rRVBemi+WZaKwL9hZEc2zY91Y8igV7vOJxVZivVeUfpslgaLAYqoU5UcQSQr+kO8u8NsE2OCZnAAAAAElFTkSuQmCC" width="32" height="32" class="img_node_modules-@docusaurus-theme-classic-lib-theme-MDXComponents-Img-styles-module" /></td>
         <td>🟡</td>
         <td>upgrade</td>
         <td>callback only</td>
      </tr>
      <tr>
         <td>Test: tx call</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>🟡</td>
         <td>FC or <code>()</code></td>
         <td>✅</td>
      </tr>
      <tr>
         <td>Test: tx deploy</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>⛔</td>
         <td><img loading="lazy" alt="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABO0lEQVR4XtWUMa4BURiFzUgUIpGn0Uh4sQmd7pW2YgMSaluwDRtQqrQUejtQ4k5cmfmuuf9/zZ2XOMnXXOc/50hEoxGoJEluPuiPIpZoYU6w0jRdMjQUk8FclRhUFeZ7xeNYsOeteBQb9hVEc12wN1OMH5yWR92K/f/27S3q8vH1fBsed867xGC/zW75nkccYAIIPYR+381HAyyd2d/L155OnM/VA/hIhqedE6jF3DKPiAMsDJfgfRnqARYWEfolggdYqhZbvm8Aiwn9EuoBvcXcKSujv1k792WIA5o/XadAS2s0cPKI97+AgXl+LweVz8DcQnnoAHoI/b4bcUA+kO8SmrvXAGlEHRTKn1rRVBemi+WZaKwL9hZEc2zY91Y8igV7vOJxVZivVeUfpslgaLAYqoU5UcQSQr+kO8u8NsE2OCZnAAAAAElFTkSuQmCC" width="32" height="32" class="img_node_modules-@docusaurus-theme-classic-lib-theme-MDXComponents-Img-styles-module" /></td>
         <td>🟡</td>
         <td>deploy</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>Test: query</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>⛔</td>
         <td>FC</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>Interactor: tx call</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>🟡</td>
         <td>FC or <code>()</code></td>
         <td>✅</td>
      </tr>
      <tr>
         <td>Interactor: tx deploy</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>⛔</td>
         <td><img loading="lazy" alt="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABO0lEQVR4XtWUMa4BURiFzUgUIpGn0Uh4sQmd7pW2YgMSaluwDRtQqrQUejtQ4k5cmfmuuf9/zZ2XOMnXXOc/50hEoxGoJEluPuiPIpZoYU6w0jRdMjQUk8FclRhUFeZ7xeNYsOeteBQb9hVEc12wN1OMH5yWR92K/f/27S3q8vH1fBsed867xGC/zW75nkccYAIIPYR+381HAyyd2d/L155OnM/VA/hIhqedE6jF3DKPiAMsDJfgfRnqARYWEfolggdYqhZbvm8Aiwn9EuoBvcXcKSujv1k792WIA5o/XadAS2s0cPKI97+AgXl+LweVz8DcQnnoAHoI/b4bcUA+kO8SmrvXAGlEHRTKn1rRVBemi+WZaKwL9hZEc2zY91Y8igV7vOJxVZivVeUfpslgaLAYqoU5UcQSQr+kO8u8NsE2OCZnAAAAAElFTkSuQmCC" width="32" height="32" class="img_node_modules-@docusaurus-theme-classic-lib-theme-MDXComponents-Img-styles-module" /></td>
         <td>🟡</td>
         <td>deploy</td>
         <td>✅</td>
      </tr>
      <tr>
         <td>Interactor: query</td>
         <td><code>run</code></td>
         <td>✅</td>
         <td>✅</td>
         <td>✅</td>
         <td>⛔</td>
         <td>FC</td>
         <td>✅</td>
      </tr>
   </tbody>
</table>

Legend:

<table>
   <thead>
      <tr>
         <th>Symbol</th>
         <th>Meaning</th>
      </tr>
   </thead>
   <tbody class="table-center-content">
      <tr>
         <td>✅</td>
         <td>Mandatory, any allowed value type</td>
      </tr>
      <tr>
         <td>⛔</td>
         <td>Not allowed</td>
      </tr>
      <tr>
         <td>🟡</td>
         <td>Optional</td>
      </tr>
      <tr>
         <td><img loading="lazy" alt="img" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABO0lEQVR4XtWUMa4BURiFzUgUIpGn0Uh4sQmd7pW2YgMSaluwDRtQqrQUejtQ4k5cmfmuuf9/zZ2XOMnXXOc/50hEoxGoJEluPuiPIpZoYU6w0jRdMjQUk8FclRhUFeZ7xeNYsOeteBQb9hVEc12wN1OMH5yWR92K/f/27S3q8vH1fBsed867xGC/zW75nkccYAIIPYR+381HAyyd2d/L155OnM/VA/hIhqedE6jF3DKPiAMsDJfgfRnqARYWEfolggdYqhZbvm8Aiwn9EuoBvcXcKSujv1k792WIA5o/XadAS2s0cPKI97+AgXl+LweVz8DcQnnoAHoI/b4bcUA+kO8SmrvXAGlEHRTKn1rRVBemi+WZaKwL9hZEc2zY91Y8igV7vOJxVZivVeUfpslgaLAYqoU5UcQSQr+kO8u8NsE2OCZnAAAAAElFTkSuQmCC" width="32" height="32" class="img_node_modules-@docusaurus-theme-classic-lib-theme-MDXComponents-Img-styles-module" /></td>
         <td>EGLD only</td>
      </tr>
      <tr>
         <td>FC</td>
         <td>Function Call</td>
      </tr>
   </tbody>
</table>
