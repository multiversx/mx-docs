# Axelar Amplifier setup for MultiversX

## Prerequisites

- have an [Axelar Validator](https://docs.axelar.dev/validator/setup/overview/) running (node, tofnd & vald)

## Become an Amplifier Verifier

For more detailed information check out the [Become a Verifier](https://docs.axelar.dev/validator/amplifier/verifier-onboarding/) Axelar docs.

You can skip this if already having an Amplifier Verifier up and running.

### Set up `tofnd`

If running on the same machine as the Axelar Validator, the existing `tofnd` can be used.

If you want to setup on a new machine, then you can setup `tofnd` using Docker:

```
docker pull axelarnet/tofnd:v1.0.1
docker run -p 50051:50051 --env MNEMONIC_CMD=auto --env NOPASSWORD=true --env ADDRESS=0.0.0.0 -v tofnd:/.tofnd axelarnet/tofnd:v1.0.1
```

### Set up `ampd`

Setup the `ampd` process using Docker:

```
docker pull axelarnet/axelar-ampd:v1.3.1
```

Make sure that the `ampd` process can communicate with `tofnd`.

To view your Verifier address you can run: `docker run axelarnet/axelar-ampd:v1.3.1 verifier-address`

### Configure the verifier

You need to create a configuration file at `~/.ampd/config.toml` and add the required configuration depending on your environment.

For complete configuration files for different environments, check out the [Configure the verifier](https://docs.axelar.dev/validator/amplifier/verifier-onboarding/#configure-the-verifier) section in the Axelar Amplifier docs.

Example basic `config.toml` for mainnet:

```
# replace with your Axelar mainnet node
tm_jsonrpc="http://127.0.0.1:26657"
tm_grpc="tcp://127.0.0.1:9090"
event_buffer_cap=100000

[service_registry]
cosmwasm_contract="axelar1rpj2jjrv3vpugx9ake9kgk3s2kgwt0y60wtkmcgfml5m3et0mrls6nct9m"

[broadcast]
batch_gas_limit="20000000"
broadcast_interval="1s"
chain_id="axelar-dojo-1"
gas_adjustment="2"
gas_price="0.007uaxl"
queue_cap="1000"
tx_fetch_interval="1000ms"
tx_fetch_max_retries="15"

[tofnd_config]
batch_gas_limit="10000000"
key_uid="axelar"
party_uid="ampd"
url="http://127.0.0.1:50051"

[[handlers]]
cosmwasm_contract="axelar14a4ar5jh7ue4wg28jwsspf23r8k68j7g5d6d3fsttrhp42ajn4xq6zayy5"
type="MultisigSigner"
```

You need to configure aditional `handlers` for each chain you want to support. Check out the [ampd README file](https://github.com/axelarnetwork/axelar-amplifier/blob/main/ampd/README.md) for more information.
Find below an example for configuring handlers for **MultiversX**.

### Activate and run the verifier

For more information check out the [Axelar docs](https://docs.axelar.dev/validator/amplifier/verifier-onboarding/#activate-and-run-the-verifier).

Find below basic instructions for mainnet:

1. Bond your verifier: `ampd bond-verifier amplifier 50000000000 uaxl`

2. Register public key:

`ampd register-public-key ecdsa`

`ampd register-public-key ed25519`

3. Register support for chains for which you have configured handlers: `ampd register-chain-support amplifier flow ethereum multiversx [MORE_CHAINS]`

Run the `ampd` process with `docker run axelarnet/axelar-ampd:v1.3.1`

## Add support for MultiversX to Verifier

### Running a MultiversX Observing Squad

For security reasons, you will need to run your own MultiversX Observing Squad, which is a collection of nodes, one node for each MultiversX shard + the Proxy API service. This API will be used by the Verifier to get transactions from the MultiversX network in order to be able to verify them.

You can find detailed steps in the [MultiversX Observing Squad docs](https://docs.multiversx.com/integrators/observing-squad). There exist installation scripts that making setting up an Observing Squad easy.

Below you can find basic information on how to setup a squad for mainnet:

1. Clone the `mx-chain-scripts` repo: `git clone https://github.com/multiversx/mx-chain-scripts`

2. Edit the `config/variables.cfg` according, for example:

```
ENVIRONMENT="mainnet"
...
CUSTOM_HOME="/home/ubuntu"
CUSTOM_USER="ubuntu"
```

3. Setup the Observing Squad: `./script.sh observing_squad`

4. Start the nodes & the Proxy: `./script.sh start`

### Updating Verifier `config.toml` file

In order to support MultiversX, first you need to add the two required handlers at the end of your `~/.ampd/config.toml` file:

#### Devnet

```
[[handlers]]
type = 'MvxMsgVerifier'
cosmwasm_contract = 'axelar1sejw0v7gmw3fv56wqr2gy00v3t23l0hwa4p084ft66e8leap9cqq9qlw4t'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'

[[handlers]]
type = 'MvxVerifierSetVerifier'
cosmwasm_contract = 'axelar1sejw0v7gmw3fv56wqr2gy00v3t23l0hwa4p084ft66e8leap9cqq9qlw4t'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'
```

#### Testnet

```
[[handlers]]
type = 'MvxMsgVerifier'
cosmwasm_contract = 'TBD'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'

[[handlers]]
type = 'MvxVerifierSetVerifier'
cosmwasm_contract = 'TBD'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'
```

#### Mainnet

```
[[handlers]]
type = 'MvxMsgVerifier'
cosmwasm_contract = 'TBD'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'

[[handlers]]
type = 'MvxVerifierSetVerifier'
cosmwasm_contract = 'TBD'
# replace with your MultiversX Proxy URL
proxy_url = 'http://127.0.0.1:8079'
```

### Register MultiversX chain

1. (optional) If you have not done so already, first register the `ed25519` public key: `ampd register-public-key ed25519`

2. Then register support for the `multiversx` chain: `ampd register-chain-support amplifier multiversx`

At this point you can restart the `ampd` process and you should be able to validate MultiversX messages.
