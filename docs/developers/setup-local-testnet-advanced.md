# Setup a Local Testnet (advanced)

How to setup a local Elrond Testnet on a workstation.

# **Prerequisites**

First, clone [elrond-go](https://github.com/ElrondNetwork/elrond-go) and [elrond-proxy-go](https://github.com/ElrondNetwork/elrond-proxy-go) in a directory of your choice.



```
$ mkdir mytestnet && cd mytestnet
$ git clone git@github.com:ElrondNetwork/elrond-go.git
$ git clone git@github.com:ElrondNetwork/elrond-proxy-go.git
```

Then, run the `prerequisites` command.



```
$ cd elrond-go/scripts/testnet
$ ./prerequisites.sh
```

This will install some packages and also clone the [elrond-deploy-go](https://github.com/ElrondNetwork/elrond-deploy-go) repository, as a sibling of the previously cloned `elrond-go`.

Depending on your Linux distribution, you may need to run the following commands as well:



```
sudo apt install tmux
sudo apt install gnome-terminal
```

## **Configure the Testnet**

The variables that dictate the structure of the Testnet are located in the file `scripts/testnet/variables.sh`. For example:



```
export TESTNETDIR="$HOME/Elrond/testnet"
export SHARDCOUNT=2
...
```

You can override the default variables by creating a new file called `local.sh`, as a sibling of `variables.sh`. For example, in order to use a different directory than the default one:



```
local.sh
export TESTNETDIR="$HOME/Desktop/mytestnet/sandbox"
export USETMUX=1
export NODETERMUI=0
```

Once ready with overriding the desired parameters, run the `config` command.



```
$ ./config.sh
```

After that, you can inspect the generated configuration files in the specified folder:



```
$HOME/Desktop/mytestnet/sandbox
├── filegen
│   ├── filegen
│   └── output
│       ├── delegationWalletKey.pem
│       ├── delegators.pem
│       ├── genesis.json
│       ├── genesisSmartContracts.json
│       ├── nodesSetup.json
│       ├── validatorKey.pem
│       └── walletKey.pem
├── node
│   └── config
│       ├── api.toml
│       ├── config_observer.toml
│       ├── config_validator.toml
│       ├── delegationWalletKey.pem
│       ├── delegators.pem
│       ├── economics.toml
│       ├── external.toml
│       ├── gasSchedule.toml
│       ├── genesisContracts
│       │   ├── delegation.wasm
│       │   └── dns.wasm
│       ├── genesis.json
│       ├── genesisSmartContracts.json
│       ├── nodesSetup.json
│       ├── p2p.toml
│       ├── prefs.toml
│       ├── ratings.toml
│       ├── systemSmartContractsConfig.toml
│       ├── validatorKey.pem
│       └── walletKey.pem
├── node_working_dirs
├── proxy
│   └── config
│       ├── config.toml
│       ├── economics.toml
│       ├── external.toml
│       └── walletKey.pem
└── seednode
    └── config
        ├── config.toml
        └── p2p.toml
```

## **Starting and stopping the Testnet**

In order to start the Testnet, run the `start` command.



```
$ ./start.sh debug
```

After waiting about 1 minute,  you can inspect the logs of the running nodes in folder `mytestnet/sandbox/node_working_dirs`.

In order to stop the Testnet, run the `stop` command.



```
$ ./stop.sh
```

If desired, you can also `pause` and `resume` the Testnet (without actually stopping the running nodes):



```
$ ./pause.sh
$ ./resume.sh
```

## **Recreating the Testnet**

In order to destroy the Testnet, run the `clean` command:



```
./stop.sh
./clean.sh
```



After running **clean,** you need to run **config** before **start**, in order to start the Testnet again.

If you need to recreate a Testnet from scratch, use the `reset` command (which also executes `clean` under the hood):



```
$ ./reset.sh
```

## **Inspecting the Proxy**

By default, the local Testnet also includes a local Elrond Proxy instance, listening on port **7950**. You can query in in a browser or directly in the command line. Also see [REST API](https://docs.elrond.com/tools/rest-api-overview).



```
$ curl http://localhost:7950/network/config
```

Given the request above, extract and save the fields `erd_chain_id` and `erd_min_transaction_version` from the response. You will need them in order to send transactions against your local Testnet.

## **Configuring erdpy**

You can configure erdpy to point to your local Testnet by default:



```
$ erdpy config set chainID 15...
$ erdpy config set txVersion 123
$ erdpy config set proxy http://localhost:7950
```

## **Sending transactions**

Let's send a simple transaction using **erdpy:**



```
$ erdpy tx new --recall-nonce --data="Hello, World" --gas-limit=70000 \
 --receiver=erd1... \
 --pem=./sandbox/node/config/walletKey.pem --pem-index=0 \
 --send
```

You should see the prepared transaction and the **transaction hash** in the `stdout` (or in the `--outfile` of your choice). Using the transaction hash, you can query the status of the transaction against the Proxy:



```
$ curl http://localhost:7950/transaction/1363...
```

## **Deploying and interacting with Smart Contracts**

Let's deploy a Smart Contract using **erdpy**. We'll use the Simple Counter as an example.



```
Deploy
erdpy --verbose contract deploy --bytecode=./mycounter/output/counter.wasm \
 --recall-nonce --gas-limit=5000000 \
 --pem=./sandbox/node/config/walletKey.pem --pem-index=0 \
 --outfile=myCounter.json \
 --send
```

Upon deployment, you can check the status of the transaction and the existence of the Smart Contract:



```
$ curl http://localhost:7950/transaction/daf2...
$ curl http://localhost:7950/address/erd1qqqqqqqqqqqqqpgql...
```

If everything is fine (transaction status is `executed` and the `code` property of the address is set), you can interact with or perform queries against the deployed contract:



```
Call
erdpy --verbose contract call erd1qqqqqqqqqqqqqpgql... \
 --recall-nonce --gas-limit=1000000 --function=increment \
 --pem=./sandbox/node/config/walletKey.pem --pem-index=0 --outfile=myCall.json \
 --send

```



```
Query
erdpy --verbose contract query erd1qqqqqqqqqqqqqpgqlq... --function=get
```