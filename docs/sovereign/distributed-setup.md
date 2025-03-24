# Distributed Setup

## Create distributed Sovereign Chain configuration

This guide will help you deploy a public Sovereign Chain with real validators, enabling a truly decentralized setup. At its core, blockchain technology—and Sovereign Chains in particular—are designed to operate in a decentralized manner, powered by multiple independent validators. This ensures transparency, security, and resilience, as no single entity has control over the entire system. Unlike other guides we’ve provided, which focus on local setups, this solution emphasizes decentralization by involving multiple stakeholders in the validation process. By following the steps below, the owner can create the Sovereign Chain configuration for the network:

### Step 1: Get the `mx-chain-sovereign-go` Repository

Before proceeding, ensure that a **SSH key** for GitHub is configured on your machine.

1. Clone the GitHub repository:
    ```bash
    git clone git@github.com:multiversx/mx-chain-sovereign-go.git
    ```

2. Navigate to testnet directory:
    ```bash
    cd mx-chain-sovereign-go/scripts/testnet
    ```

### Step 2: Seeder Build

Build and run the seed node
```bash
cd cmd/seednode
go build
./seednode -rest-api-interface 127.0.0.1:9091 -log-level *:DEBUG -log-save
```

You should have an output similar to the one displayed below. The highlighted part is important and will be used later.

| Seednode addresses:                                                                         |
|---------------------------------------------------------------------------------------------|
| `/ip4/`127.0.0.1`/tcp/10000/p2p/16Uiu2HAmSY5NpuqC8UuFHunJensFbBc632zWnMPCYfM2wNLuvAvL`      |
| `/ip4/`192.168.10.100`/tcp/10000/p2p/16Uiu2HAmSY5NpuqC8UuFHunJensFbBc632zWnMPCYfM2wNLuvAvL` |

:::info
All the validator nodes will have to connect to this seed node.
:::

### Step 3: Sovereign node build

Build the sovereign node
```bash
cd ..
cd cmd/sovereignnode/
go build -v -ldflags="-X main.appVersion=v0.0.1"
```

:::info
Use your own custom version instead of `v0.0.1`.
:::

### Step 4: Edit the sovereign configuration

Node configs can be found in `cmd/node/config`. Below are the files and folders:
```
gasSchedules folder
genesisContracts folder
genesis.json*
genesisSmartContracts.json
nodesSetup.json*
api.toml
config.toml
economics.toml
enableEpochs.toml
enableRounds.toml
external.toml
fullArchiveP2P.toml
p2p.toml
prefs.toml
ratings.toml
systemSmartContractsConfig.toml
```

_Note: Files marked with * will be discussed later in the document._

Sovereign configs can be found in `cmd/sovereignnode/config`
```
enableEpochs.toml
prefs.toml
sovereignConfig.toml
```

#### Minimum recommended changes

1. Move the config files from `/node/config` into `/sovereignnode/config`, except _economics.toml_, _enableEpochs.toml_, _prefs.toml_.
2. Config changes:
   1. **config.toml**
      1. GeneralSettings.ChainID
      2. EpochStartConfig.RoundsPerEpoch
   2. **p2p.toml**
      1. KadDhtPeerDiscovery:InitialPeerList = `[/ip4/PUBLIC_IP/tcp/10000/p2p/16Uiu2HAmSY5NpuqC8UuFHunJensFbBc632zWnMPCYfM2wNLuvAvL]`
         - PUBLIC_IP is the IP of the machine where seed node is running, the other part is seed node address
   3. **systemSmartContractsConfig.toml**
      1. ESDTSystemSCConfig.ESDTPrefix
      2. StakingSystemSCConfig.NodeLimitPercentage [[docs](https://docs.multiversx.com/validators/staking-v4/#how-does-the-dynamic-node-limitation-work)]
   4. **sovereignConfig.toml**
      1. GenesisConfig.NativeESDT
3. Other changes:
   - Use the [custom configuration](/sovereign/custom-configurations) page to see more configs we recommend to be changed

### Step 5: Genesis configuration

#### `genesis.json`

This file should contain all the genesis addresses that will be funded and will be validators. Adjust as needed.

:::note
The sum of `supply` should be equal to `GenesisTotalSupply` from economics.toml
:::

Example with 2 validators:
```
[
  {
    "address": "erd1a2jq3rrqa0heta0fmlkrymky7yj247mrs54g6fyyx8dm45menkrsmu3dez",
    "supply": "10000000000000000000000000",
    "balance": "9997500000000000000000000",
    "stakingvalue": "2500000000000000000000",
    "delegation": {
      "address": "",
      "value": "0"
    }
  },
  {
    "address": "erd1pn564xpwk4anq9z50th3ae99vplsf7d2p55cnugf00eu0gcq6gdqcg7ytx",
    "supply": "10000000000000000000000000",
    "balance": "9997500000000000000000000",
    "stakingvalue": "2500000000000000000000",
    "delegation": {
      "address": "",
      "value": "0"
    }
  }
]
```

#### `nodesSetup.json`

This file contains all the initial nodes. Adjust as needed.

:::note
- `consensusGroupSize` should be equal to `minNodesPerShard`
- each node pair contains one genesis address associated with a validator public key
- `startTime` should be a timestamp from the future, the time when the network will start
- `roundDuration` is the duration in milliseconds per round
- `metaChainConsensusGroupSize` and `metaChainMinNodes` should always be 0
:::

Example:
```
{
  "startTime": 1733138599,
  "roundDuration": 6000,
  "consensusGroupSize": 2,
  "minNodesPerShard": 2,
  "metaChainConsensusGroupSize": 0,
  "metaChainMinNodes": 0,
  "hysteresis": 0,
  "adaptivity": false,
  "initialNodes": [
    {
      "pubkey": "6a1ee46baa8da9279f53addbfbc61a525604eb42d964bd3a25bf7f34097c3b3a31706728718ccdbe3d43386c37ec3011df6ceb4188e14025ab149bd568cafaba18a78b51e71c24046c5276a187a6c1d6da83e30590a6025875b8f6df8984ec05",
      "address": "erd1a2jq3rrqa0heta0fmlkrymky7yj247mrs54g6fyyx8dm45menkrsmu3dez",
      "initialRating": 0
    },
    {
      "pubkey": "40f3857218333f0b2ba8592fc053cbaebec8e1335f95957c89f6c601ce0758372ba31c30700f10f25202d8856bb948055f9f0ef53dea57b62f013ee01c9dc0346a2b3543f2b4d423166ee1981b310f2549fb879d4cd89de6c392d902a823d116",
      "address": "erd1pn564xpwk4anq9z50th3ae99vplsf7d2p55cnugf00eu0gcq6gdqcg7ytx",
      "initialRating": 0
    }
  ]
}
```

___

:::note
At this point, a `config` folder should be created that will contain all the .toml files and genesis configuration. This folder should be shared with the other validators so they will be able to join the network.
:::

## Join a Sovereign Chain as validator/observer

### Sovereign validator setup

Each validator should have:
- **walletKey.pem** - wallet that will be funded at genesis [[docs](/validators/key-management/wallet-keys)]
- **validatorKey.pem** (or **allValidatorsKey.pem** if multi key node) - validator key [[docs](/validators/key-management/validator-keys/#how-to-generate-a-new-key)]
- **config** folder - received from Sovereign Chain creator

### Sovereign validator/observer node start

The following commands will start the sovereign validator node with the configuration from **config** folder and with the **validatorKey** (or multi key from **allValidatorsKey**).
Adjust the flags as needed. You can find all the available flags in `/mx-chain-sovereign-go/cmd/sovereignnode/flags.go`

#### # single key
```
./sovereignnode --validator-key-pem-file ./config/validatorKey.pem --profile-mode --log-save --log-level *:INFO --log-logger-name --log-correlation --use-health-service --rest-api-interface :8080 --working-directory ~/my_validator_node
```

#### # multi key
```
./sovereignnode --all-validator-keys-pem-file ./config/allValidatorsKey.pem --profile-mode --log-save --log-level *:INFO --log-logger-name --log-correlation --use-health-service --rest-api-interface :8080 --working-directory ~/my_validator_node
```

#### # observer
```
./sovereignnode --profile-mode --log-save --log-level *:INFO --log-logger-name --log-correlation --use-health-service --rest-api-interface :8080 --working-directory ~/my_observer_node
```

### Staking transaction

Before staking, a node is a mere observer. After staking, the node becomes a validator, which means that it will be eligible for consensus and will earn rewards. You can find the documentation how to make the staking transaction with mxpy [here](/validators/staking#staking-through-mxpy).

## Deploy services

You can find the documentation on how to deploy services [here](/sovereign/services).
