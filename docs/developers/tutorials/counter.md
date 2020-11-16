# The Counter SmartContract

Write, build and deploy a simple Smart Contract written in C

## **Prerequisites**

You need to have [erdpy](https://docs.elrond.com/tools/erdpy) installed.

## **Create the contract**

In a folder of your choice, run the following command:



```
erdpy contract new --template="simple-counter" mycounter
```

This creates a new folder named `mycounter` which contains the C source code for a simple Smart Contract - based on the template [simple-counter](https://github.com/ElrondNetwork/sc-examples/tree/master/simple-counter). The file `counter.c` is the implementation of the Smart Contract, which defines the following functions:

- `init()`: this function is executed when the contract is deployed on the Blockchain
- `increment()` and `decrement()`: these functions modify the internal state of the Smart Contract 
- `get()`: this is a pure function (does not modify the state) which we'll use to query the value of the counter

## **Build the contract**

In order to build the contract to WASM, run the following command:



```
erdpy --verbose contract build mycounter
```

Above, `mycounter` refers to the previously created folder, the one that holds the source code. After executing the command, you can inspect the generated files in `mycounter/output`.

## **Deploy the contract on the Testnet**

In order to deploy the contract on the Testnet you need to have an account with sufficient balance (required for the deployment fee) and the associated private key in **PEM format**.

The deploy command is as follows:



```
erdpy --verbose contract deploy --project=mycounter --pem="alice.pem" --gas-limit=5000000 --proxy="https://testnet-api.elrond.com" --outfile="counter.json" --recall-nonce --send
```

Above, `mycounter` refers to the same folder that contains the source code and the build artifacts. The `deploy` command knows to search for the WASM bytecode within this folder.

Note the last parameter of the command - this instructs erdpy to dump the output of the operation in the specified file. The output contains the address of the newly deployed contract and the hash of the deployment transaction.



```
counter.json
{
    "tx": {
        "nonce": 1,
        "value": "0",
        "receiver": "erd1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq6gq4hu",
        "sender": "erd1...",
        "gasPrice": 1000000000,
        "gasLimit": 5000000,
        "data": "MDA2MTcz...",
        "chainID": "1596807148",
        "version": 123,
        "signature": "ff07..."
    },
    "hash": "",
    "data": "0061736...",
    "address": "erd1qqqqqqqqqqqqqpgqp93y6..."
}

```

Feel free to inspect these values in the [Explorer](https://explorer.elrond.com/).

## **Interact with the deployed contract**

Let's extract the contract address from `counter.json` before proceeding to an actual contract execution.



```
export CONTRACT_ADDRESS=$(python3 -c "import json; data = json.load(open('counter.json')); print(data['address'])")
```

Now that we have the contract address saved in an shell variable, we can call the `increment` function of the contract as follows:



```
erdpy --verbose contract call $CONTRACT_ADDRESS --pem="alice.pem" --gas-limit=2000000 --function="increment" --proxy="https://testnet-api.elrond.com" --recall-nonce --send
```

Execute the command above a few times, with some pause in between. Then feel free to experiment with calling the `decrement` function.

Then, in order to query the value of the counter - that is, to execute the `get` pure function of the contract - run the following:



```
erdpy contract query $CONTRACT_ADDRESS --function="get" --proxy="https://testnet-api.elrond.com"
```

The output should look like this:



```
[{'base64': 'AQ==', 'hex': '01', 'number': 1}]
```

## **Interaction script**

The previous steps can be summed up in a simple script as follows:



```
#!/bin/bash

# Deployment
erdpy --verbose contract deploy --project=mycounter --pem="alice.pem" --gas-limit=5000000 --proxy="https://testnet-api.elrond.com" --outfile="counter.json" --recall-nonce --send
export CONTRACT_ADDRESS=$(python3 -c "import json; data = json.load(open('address.json')); print(data['contract'])")

# Interaction
erdpy --verbose contract call $CONTRACT_ADDRESS --pem="alice.pem" --gas-limit=2000000 --function="increment" --proxy="https://testnet-api.elrond.com" --recall-nonce --send
sleep 10
erdpy --verbose contract call $CONTRACT_ADDRESS --pem="alice.pem" --gas-limit=2000000 --function="increment" --proxy="https://testnet-api.elrond.com" --recall-nonce --send
sleep 10
erdpy --verbose contract call $CONTRACT_ADDRESS --pem="alice.pem" --gas-limit=2000000 --function="decrement" --proxy="https://testnet-api.elrond.com" --recall-nonce --send
sleep 10

# Querying
erdpy contract query $CONTRACT_ADDRESS --function="get" --proxy="https://testnet-api.elrond.com"
```