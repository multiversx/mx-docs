---
id: user-defined-smart-contracts
title: User-defined Smart Contracts
---

For user-defined Smart Contract deployments and function calls, the **actual gas consumption** of processing contains both of the previously mentioned cost components - though, while the **value movement and data handling** component is easily computable (using the previously depicted formula), the **contract execution** component is hard to determine precisely _a priori_. Therefore, for this component we have to rely on _simulations_ and _estimations_.

For **simulations**, we will start a local testnet using `erdpy` (detailed setup instructions can be found [here](/developers/setup-local-testnet)). Thus, before going further, make sure your local testnet is up and running.

## Contract deployments

In order to get the required `gasLimit` (the **actual gas cost**) for a deployment transaction, one should use the well-known `erdpy contract deploy` command, but with the `--simulate` flag set.

At first, pass the maximum possible amount for `gas-limit` (no guessing).

```
$ erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=600000000 \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --simulate
```

In the output, look for `txGasUnits`. For example:

```
"txSimulation": {
    ...
    "cost": {
        "txGasUnits": 1849711,
        ...
    }
}
```

:::note
The simulated cost `txGasUnits` contains both components of the cost.
:::

After that, check the cost simulation by running the simulation once again, but this time with the precise`gas-limit`:

```
$ erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=1849711 \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --simulate
```

In the output, look for the `status` - it should be `success`:

```
"txSimulation": {
    "execution": {
        "result": {
            "status": "success",
            ...
        },
        ...
    }
```

In the end, let's actually deploy the contract:

```
$ erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=1849711 \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --send --wait-result
```

:::important
For deployments, the **execution** component of the cost is associated with instantiating the Smart Contract and calling its `init()` function.

If the flow of `init()` is dependent on input arguments or it references blockchain data, then the cost will vary as well, depending on these variables. Make sure you simulate sufficient deployment scenarios and increase (decrease) the `gas-limit`.
:::

## Contract calls

In order to get the required `gasLimit` (the **actual gas cost**) for a contract call, one should first deploy the contract, then use the `erdpy contract call` command, with the `--simulate` flag set.

:::important
If the contract makes further calls to other contracts, please read the next section.
:::

Assuming we've already deployed the contract (see above) let's get the cost for calling one of its endpoints:

```
$ erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqygvvtlty3v7cad507v5z793duw9jjmlxd8sszs8a2y \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=increment\
 --recall-nonce --gas-limit=600000000\
 --simulate
```

In the output, look for `txGasUnits`. For example:

```
"txSimulation": {
    ...
    "cost": {
        "txGasUnits": 1225515,
        ...
    }
}
```

In the end, let's actually call the contract:

```
$ erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqygvvtlty3v7cad507v5z793duw9jjmlxd8sszs8a2y \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=increment\
 --recall-nonce --gas-limit=1225515\
 --send --wait-result
```

:::important
If the flow of the called function is dependent on input arguments or it references blockchain data, then the cost will vary as well, depending on these variables. Make sure you simulate sufficient scenarios for the contract call and increase (decrease) the `gas-limit`.
:::

## Contracts calling (asynchronously) other contracts

:::important
Documentation in this section is preliminary and subject to change. Furthermore, **only asynchronous calls are covered**.
:::

Before moving forward, make sure you first have a look over the following:

- [Asynchronous calls between contracts](/technology/the-elrond-wasm-vm/#asynchronous-calls-between-contracts)
- [Asynchronous calls (Rust framework)](/developers/developer-reference/elrond-wasm-contract-calls/#asynchronous-calls)
- [Callbacks (Rust framework)](/developers/developer-reference/elrond-wasm-annotations/#callbacks)

Suppose we have two contracts: `A` and `B`, where `A::foo(addressOfB)` asynchronously calls `B::bar()` (e.g. using `asyncCall()`).

Let's deploy the contracts `A` and `B`:

```
$ erdpy --verbose contract deploy --bytecode=./a.wasm \
 --recall-nonce --gas-limit=5000000 \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --send --wait-result --outfile=a.json

$ erdpy --verbose contract deploy --bytecode=./b.wasm \
 --recall-nonce --gas-limit=5000000 \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --send --wait-result --outfile=b.json
```

Assuming `A` is deployed at `erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts`, and `B` is deployed at `erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq`, let's **simulate** `A::foo(addressOfB)` (at first, pass a _large-enough_ or maximum `gas-limit`):

```
$ export hexAddressOfB=0x$(erdpy wallet bech32 --decode erd1qqqqqqqqqqqqqpgqj5zftf3ef3gqm3gklcetpmxwg43rh8z2d8ss2e49aq)

$ erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=foo\
 --recall-nonce --gas-limit=50000000\
 --arguments ${hexAddressOfB}\
 --simulate
```

In the output, look for the simulated cost (as above):

```
"txSimulation": {
    ...
    "cost": {
        "txGasUnits": 3473900,
        ...
    }
}
```

The simulated cost represents the **actual gas cost** for invoking `A::foo()`, `B::bar()` and `A::callBack()`.

**However, the simulated cost above isn't the value we are going to use as `gasLimit`.** If we were to do so, we would be presented the error `not enough gas`.

Upon reaching the call to `B::bar()` inside `A::foo()`, the MultiversX (previously Elrond) VM inspects the **remaining gas _at runtime_** and **temporarily locks (reserves) a portion of it**, to allow for the execution of `A::callBack()` once the call to `B::bar()` returns.

With respect to the [VM Gas Schedule](https://github.com/ElrondNetwork/elrond-config-mainnet/tree/master/gasSchedules), the aforementioned **remaining gas _at runtime_** has to satisfy the following conditions in order for the **temporary gas lock reservation** to succeed:

```
onTheSpotRemainingGas > gasToLockForCallback

gasToLockForCallback =
    costOf(AsyncCallStep) +
    costOf(AsyncCallbackGasLock) +
    codeSizeOf(callingContract) * costOf(AoTPreparePerByte)
```

:::note
Subsequent asynchronous calls (asynchronous calls performed by an asynchronously-called contract) will require temporary gas locks as well.
:::

For our example, where `A` has 453 bytes, the `gasToLockForCallback` would be (as of February 2022):

```
gasToLockForCallback = 100000 + 4000000 + 100 * 453 = 4145300
```

It follows that the value of `gasLimit` should be:

```
simulatedCost < gasLimit < simulatedCost + gasToLockForCallback
```

For our example, that would be:

```
3473900 < gasLimit < 7619200
```

:::important
As of February 2022, for contracts that call other contracts, the lowest `gasLimit` required by a successful execution isn't easy to determine using **erdpy**. While this value can be determined by a careful inspection of the local testnet logs, for the moment, the recommended approach is to **start with the right-hand side of the inequality above (`simulatedCost + gasToLockForCallback`) and gradually decrease the value** while simulating the call and looking for a successful output.
:::

For our example, let's simulate using the following values for `gasLimit`: `7619200, 7000000, 6000000`:

```
$ erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=foo\
 --recall-nonce --gas-limit=7619200\
 --arguments ${hexAddressOfB}\
 --simulate

... inspect output (possibly testnet logs); execution is successful

erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=foo\
 --recall-nonce --gas-limit=7000000\
 --arguments ${hexAddressOfB}\
 --simulate

... inspect output (possibly testnet logs); execution is successful

erdpy --verbose contract call erd1qqqqqqqqqqqqqpgqfzydqmdw7m2vazsp6u5p95yxz76t2p9rd8ss0zp9ts \
 --pem=~/elrondsdk/testwallets/latest/users/alice.pem \
 --function=foo\
 --recall-nonce --gas-limit=6000000\
 --arguments ${hexAddressOfB}\
 --simulate

... inspect output (possibly testnet logs); ERROR: out of gas when executing B::bar()

```

Therefore, in our case, a reasonable value for `gasLimit` would be 7000000.

:::important
In case of a highly gas-demanding callback (not recommended) which would consume more than `gasToLockForCallback`, one should appropriately increase the right-hand side of the `gasLimit` inequation depicted above, by inspecting the contract call output and the testnet logs.
:::
