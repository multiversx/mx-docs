---
id: user-defined-smart-contracts
title: User-defined Smart Contracts
---

For User-defined Smart Contract deployments and function calls, the **actual gas cost** of processing contains the two previously mentioned cost components - though, while the **value movement and data handling** component is easily computable (using the previously depicted formula), the **contract execution** component is hard to determine precisely _a priori_. Therefore, for this component we have to rely on _simulations_ and _estimations_.

For **simulations**, we will start a local testnet using erdpy (detailed setup instructions can be found [here](/developers/setup-local-testnet)). Thus, before going further, make sure your local testnet is running.

## Contract deployments

In order to get the required `gasLimit` (the **actual gas cost**) for a deployment transaction, one should use the well-known `erdpy contract deploy` command, but with the `--simulate` flag set.

At first, pass the maximum possible amount for `gas-limit` (no guessing).

```
$ erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=600000000 \
 --pem=./testnet/wallets/users/alice.pem \
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

After that, check the cost simulation by running the simulation once again, but this time with the precise`gas-limit`:

```
$ erdpy --verbose contract deploy --bytecode=./counter.wasm \
 --recall-nonce --gas-limit=1849711 \
 --pem=./testnet/wallets/users/alice.pem \
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
 --pem=./testnet/wallets/users/alice.pem \
 --send
```

:::important
The **execution** component of the cost is associated with instantiating the Smart Contract and calling its `init()` function.

If the flow of `init()` is dependent on input arguments or references blockchain data, then the cost will vary as well, depending on these variables. Make sure you simulate sufficient deployment scenarios and increase (decrease) the `gas-limit`.
:::

## Contract calls

In order to get the required `gasLimit` (the **actual gas cost**) for a contract call, one should first deploy the contract, then use the `erdpy contract call` command, with the `--simulate` flag set.

Assuming we've already deployed the contract (see above) let's get the cost for calling one of its endpoints:

```
TBD
```

:::important
The simulation only handles the original transaction - that is, the contract call performed by the user. If the contract makes further calls to other contracts, and these calls have to be executed _at destination_, _out-of-context_ (as opposed to _execute-at-source_, _same-context_ calls), these subsequent calls are not simulated. **Thus, make sure you adjust (increase) the gas limit accordingly (see next section).**
:::

## Contracts calling other contracts

TBD
