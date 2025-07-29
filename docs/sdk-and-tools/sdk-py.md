---
id: sdk-py
title: Python SDK
pagination_prev: developers/testing/testing-in-go
pagination_next: sdk-and-tools/mxpy/installing-mxpy
---

[comment]: # (mx-abstract)

[comment]: # (mx-context-auto)

## Overview

This page will guide you through the process of handling common tasks using the MultiversX Python SDK (libraries) **v2 (latest, stable version)**.

:::important
This cookbook makes use of `sdk-py v2`. In order to migrate from `sdk-py v1` to `sdk-py v2`, please also follow [the migration guide](https://github.com/multiversx/mx-sdk-py/issues?q=label:migration).
:::

:::note
All examples depicted here are captured in **(interactive) [Jupyter notebooks](https://github.com/multiversx/mx-sdk-py/blob/main/examples/Cookbook.ipynb)**.
:::

We are going to use the [multiversx-sdk-py](https://github.com/multiversx/mx-sdk-py) package. This package can be installed directly from GitHub or from [**PyPI**](https://pypi.org/project/multiversx-sdk/).

<!-- BEGIN_NOTEBOOK { "url": "https://raw.githubusercontent.com/multiversx/mx-sdk-py/refs/heads/main/examples/Cookbook.ipynb" } -->

## Creating an Entrypoint

The Entrypoint represents a network client that makes the most common operations easily accessible. We have an entrypoint for each network: `MainnetEntrypoint`, `DevnetEntrypoint`, `TestnetEntrypoint` and `LocalnetEntrypoint`. For example, this is how to create a Devnet entrypoint:

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
```

If we want to create an entrypoint that uses a third party API, we can do so as follows:

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint(url="https://custom-multiversx-devnet-api.com")
```

By default, an Entrypoint, in our case the `DevnetEntrypoint`, uses the API, but we can also create a custom one that interacts with the proxy.

```py
from multiversx_sdk import DevnetEntrypoint

custom_entrypoint = DevnetEntrypoint(url="https://devnet-gateway.multiversx.com", kind="proxy")
```

We can create an entrypoint from a network provider.

```py
from multiversx_sdk import NetworkEntrypoint, ApiNetworkProvider

api = ApiNetworkProvider("https://devnet-api.multiversx.com")
entrypoint = NetworkEntrypoint.new_from_network_provider(network_provider=api, chain_id="D")
```

## Creating Accounts

We can create an account directly from the entrypoint. Keep in mind that the account you create is network agnostic, it does not matter which entrypoint is used.

The account can be used for signing and for storing the nonce of the account. It can also be saved to a `pem` or `keystore` file.

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
account = entrypoint.create_account()
```

There are also other ways to instantiate an `Account`.

#### Instantiating an Account using a secret key

```py
from multiversx_sdk import Account, UserSecretKey

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))

account = Account(secret_key)
```

#### Instantiating an Account from a PEM file

```py
from pathlib import Path
from multiversx_sdk import Account

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
```

#### Instantiating an Account from a Keystore file

```py
from pathlib import Path
from multiversx_sdk import Account

account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/alice.json"),
    password="password"
)
```

#### Instantiating an Account from a mnemonic

```py
from multiversx_sdk import Account, Mnemonic

mnemonic = Mnemonic.generate()
account = Account.new_from_mnemonic(mnemonic.get_text())
```

#### Instantiating an Account from a KeyPair

```py
from multiversx_sdk import Account, KeyPair

keypair = KeyPair.generate()
account = Account.new_from_keypair(keypair)
```

### Managing the Account nonce

The account has a `nonce` property that the user is responsible for keeping up to date. We can fetch the nonce of the account from the network once and then we can increment it with each transaction we create. Each transaction sent **must** have the correct nonce set, otherwise it will not be executed. For more details check out the [Creating Transactions](#creating-transactions) section below.

```py
from multiversx_sdk import Account, DevnetEntrypoint, UserSecretKey

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))

account = Account(secret_key)

entrypoint = DevnetEntrypoint()
account.nonce = entrypoint.recall_account_nonce(account.address)

# create any sort of transaction
...

# When needed, we can get the nonce and increment it
nonce = account.get_nonce_then_increment()
```

### Saving the Account to a file

We can save the account to either a `pem` file or a `keystore` file. **We discourage the use of PEM wallets for storing cryptocurrencies due to their lower security level.** However, they prove to be highly convenient and user-friendly for application testing purposes.

#### Saving the Account for a PEM file

```py
from pathlib import Path
from multiversx_sdk import Account, UserSecretKey

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))

account = Account(secret_key)
account.save_to_pem(path=Path("wallet.pem"))
```

#### Saving the Account to a Keystore file

```py
from pathlib import Path
from multiversx_sdk import Account, UserSecretKey

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))

account = Account(secret_key)
account.save_to_keystore(path=Path("keystoreWallet.json"), password="password")
```

### Ledger Account

It is possible to use a Ledger Device to manage your account. The Ledger account allows you to sign both transactions and messages, but it can also store the nonce of the account.

By default, the package does not include all the dependencies required to communicate with a Ledger device. To enable Ledger support, install the package with the following command:

```sh
pip install multiversx-sdk[ledger]
```

This will install the necessary dependencies for interacting with a Ledger device.

When instantiating a `LedgerAccount`, the index of the address that will be used should be provided. By default, the index `0` is used.

```py
from multiversx_sdk import LedgerAccount

account = LedgerAccount()
```

When signing transactions with a Ledger device, the transaction details will appear on the device, awaiting your confirmation. The same process applies when signing messages.

Both **Account** and **LedgerAccount** are compatible with the **IAccount** interface and can be used wherever the interface is expected (e.g. in transaction controllers).

## Calling the Faucet

This functionality is not yet available through the entrypoint, but we recommend using the faucet available within the Web Wallet.

- [Testnet Wallet](https://testnet-wallet.multiversx.com/)
- [Devnet Wallet](https://devnet-wallet.multiversx.com/)

## Interacting with the network

The entrypoint exposes a few methods to directly interact with the network, such as:

- `recall_account_nonce(address: Address) -> int;`
- `send_transaction(transaction: Transaction) -> bytes;`
- `send_transactions(transactions: list[Transaction]) -> tuple[int, list[bytes]];`
- `get_transaction(tx_hash: str | bytes) -> TransactionOnNetwork;`
- `await_transaction_completed(tx_hash: str | bytes) -> TransactionOnNetwork;`

Some other methods are exposed through a so called network provider. There are two types of network providers: ApiNetworkProvider and ProxyNetworkProvider. The ProxyNetworkProvider interacts directly with the proxy of an observing squad. The ApiNetworkProvider, as the name suggests, interacts with the API, that is a layer over the proxy. It fetches data from the network but also from Elastic Search.

To get the underlying network provider from our entrypoint, we can do as follows:

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()
```

## Creating a network provider

Additionally, when manually instantiating a network provider, a config can be provided to specify the client name and set custom request options.

```py
from multiversx_sdk import NetworkProviderConfig, ApiNetworkProvider

config = NetworkProviderConfig(
    client_name="hello-multiversx",
    requests_options={
        "timeout": 1,
        "auth": ("user", "password")
    }
)

api = ApiNetworkProvider(url="https://devnet-api.multiversx.com", config=config)
```

The network providers support a retry mechanism for failing requests. If you'd like to change the default values you can do so as follows:

```py
from multiversx_sdk import NetworkProviderConfig, ApiNetworkProvider, RequestsRetryOptions

retry_options = RequestsRetryOptions(
    retries=5,
    backoff_factor=0.1,
    status_forcelist=[500, 502, 503]
)

config = NetworkProviderConfig(
    client_name="hello-multiversx",
    requests_options={
        "timeout": 1,
        "auth": ("user", "password")
    },
    requests_retry_options=retry_options,
)

api = ApiNetworkProvider(url="https://devnet-api.multiversx.com", config=config)
```

A list of all the available methods from the `ApiNetworkProviders` can be found [here](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.network_providers.html#module-multiversx_sdk.network_providers.api_network_provider).

Both the `ApiNetworkProvider` and the `ProxyNetworkProvider` implement a common interface, that can be seen [here](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.network_providers.html#multiversx_sdk.network_providers.interface.INetworkProvider). Therefore, the two network providers can be used interchangeably.

The classes returned by the API have the most used fields easily accessible, but each object has a `raw` field where the raw API response is stored in case some other fields are needed.

## Fetching data from the network

### Fetching the network config

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

network_config = api.get_network_config()
```

### Fetching the network status

The status is fetched by default from the metachain, but a specific shard number can be provided.

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

network_status = api.get_network_status()  # fetches status from metachain
network_status = api.get_network_status(shard=1)  # fetches status from shard 1
```

### Fetching a block from the network

We instantiate the args and we are going to fetch the block using it's hash. The `API` only supports fetching blocks by hash, while the `PROXY` can fetch blocks by hash or by nonce. Keep in mind, that for the `PROXY` the shard should also be specified in the arguments.

#### Fetching a block using the API

```py
from multiversx_sdk import ApiNetworkProvider

api = ApiNetworkProvider("https://devnet-api.multiversx.com")

block_hash="1147e111ce8dd860ae43a0f0d403da193a940bfd30b7d7f600701dd5e02f347a"
block = api.get_block(block_hash=block_hash)
```

Additionally, we can fetch the latest block from the network:

```py
from multiversx_sdk import ApiNetworkProvider

api = ApiNetworkProvider("https://devnet-api.multiversx.com")
latest_block = api.get_latest_block()
```

#### Fetching a block using the PROXY

When using the proxy, we have to provide the shard, as well.

```py
from multiversx_sdk import ProxyNetworkProvider

proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")

block_hash="1147e111ce8dd860ae43a0f0d403da193a940bfd30b7d7f600701dd5e02f347a"
block = proxy.get_block(shard=1, block_hash=block_hash)
```

We can also fetch the latest block from the network. The default shard will be the metachain, but we can specify a shard to fetch the latest block from.

```py
from multiversx_sdk import ProxyNetworkProvider

proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
block = proxy.get_latest_block()
```

### Fetching an account

To fetch an account we'll need its address. Once we have the address, we simply create an `Address` object and pass it as an argument to the method.

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
account = api.get_account(address=alice)
```

### Fetching an account's storage

We can also fetch an account's storage, which means we can get all the key-value pairs saved for an account.

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
account = api.get_account_storage(address=address)
```

If we only want a specific key, we can fetch it as follows:

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
account = api.get_account_storage_entry(address=address, entry_key="testKey")
```

### Waiting for an account to meet a condition

There are times when we need to wait for a specific condition to be met before proceeding with an action. For example, let's say we want to send 7 EGLD from Alice to Bob, but this can only happen once Alice's balance reaches at least 7 EGLD. This approach is useful in scenarios where you are waiting for external funds to be sent to Alice, allowing her to then transfer the required amount to another recipient.

We need to define our condition that will be checked each time the account is fetched from the network. For this, we create a function that takes as an argument an `AccountOnNetwork` object and returns a `bool`.

Keep in mind that, this method has a default timeout that can be adjusted using the `AwaitingOptions` class.

```py
from multiversx_sdk import Address, AccountOnNetwork, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()


def condition_to_be_satisfied(account: AccountOnNetwork) -> bool:
    return account.balance >= 7000000000000000000  # 7 EGLD


alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
account = api.await_account_on_condition(address=alice, condition=condition_to_be_satisfied)
```

### Sending and simulating transactions

In order for our transactions to be executed, we use the network providers to broadcast them to the network. Keep in mind that, in order for transactions to be processed they need to be signed.

#### Sending a transaction

```py
from multiversx_sdk import Address, DevnetEntrypoint, Transaction

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

transaction = Transaction(
    sender=alice,
    receiver=bob,
    gas_limit=50000,
    chain_id="D"
)

# set correct nonce and sign the transaction
...

# broadcast the transaction to the network
transaction_hash = api.send_transaction(transaction)
```

#### Sending multiple transactions

```py
from multiversx_sdk import Address, DevnetEntrypoint, Transaction

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

first_transaction = Transaction(
    sender=alice,
    receiver=bob,
    gas_limit=50000,
    chain_id="D",
    nonce=2
)
# set correct nonce and sign the transaction
...

second_transaction = Transaction(
    sender=bob,
    receiver=alice,
    gas_limit=50000,
    chain_id="D",
    nonce=1
)
# set correct nonce and sign the transaction
...

third_transaction = Transaction(
    sender=alice,
    receiver=alice,
    gas_limit=60000,
    chain_id="D",
    nonce=3,
    data=b"hello"
)
# set correct nonce and sign the transaction
...

# broadcast the transactions to the network
num_of_txs, hashes = api.send_transactions([first_transaction, second_transaction, third_transaction])
```

#### Simulating transactions

A transaction can be simulated before being sent to be processed by the network. It is mostly used for smart contract calls to see what smart contract results are produced.

```py
from multiversx_sdk import Address, DevnetEntrypoint, Transaction

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgqccmyzj9sade2495w78h42erfrw7qmqxpd8sss6gmgn")

transaction = Transaction(
    sender=alice,
    receiver=contract,
    gas_limit=5000000,
    chain_id="D",
    nonce=entrypoint.recall_account_nonce(alice),  # nonce needs to be properly set
    data=b"add@07",
    signature=b'0' * 64,  #  signature is not checked by default, but a dummy value must be provided
)
transaction_on_network = api.simulate_transaction(transaction)
```

#### Estimating the gas cost of a transaction

Before sending a transaction to the network to be processed, one can get the estimated gas limit that is required for the transaction to be executed.

```py
from multiversx_sdk import Address, DevnetEntrypoint, Transaction

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgqccmyzj9sade2495w78h42erfrw7qmqxpd8sss6gmgn")

nonce = entrypoint.recall_account_nonce(alice)

transaction = Transaction(
    sender=alice,
    receiver=contract,
    gas_limit=5000000,
    chain_id="D",
    data=b"add@07",
    nonce=nonce
)

transaction_cost_response = api.estimate_transaction_cost(transaction)
```

### Waiting for transaction completion

After sending a transaction, we may want to wait until the transaction is processed in order to proceed with another action. Keep in mind that, this method has a default timeout that can be adjusted using the `AwaitingOptions` class.

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

tx_hash = "exampletransactionhash"
transaction_on_network = api.await_transaction_completed(transaction_hash=tx_hash)
```

### Waiting for a transaction to specify a condition

Similar to accounts, we can wait until a transaction satisfies a specific condition.

```py
from multiversx_sdk import DevnetEntrypoint, TransactionOnNetwork

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()


def condition_to_be_satisfied(transaction_on_network: TransactionOnNetwork) -> bool:
    # can be the creation of an event or something else
    ...


tx_hash = "exampletransactionhash"
transaction_on_network = api.await_transaction_on_condition(transaction_hash=tx_hash, condition=condition_to_be_satisfied)
```

### Fetching transactions from the network

After sending transactions, we can fetch the transactions from the network. To do so, we need the transaction hash that we got after broadcasting the transaction.

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

tx_hash = "exampletransactionhash"
transaction_on_network = api.get_transaction(tx_hash)
```

### Fetching a token from an account

We can fetch a specific token (ESDT, MetaESDT, SFT, NFT) of an account by providing the address and the token.

```py
from multiversx_sdk import Address, DevnetEntrypoint, Token

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

# these tokens are just for the example, they do not belong to Alice
token = Token(identifier="TEST-123456")  # ESDT
token_on_network = api.get_token_of_account(address=alice, token=token)

token = Token(identifier="NFT-987654", nonce=11)  # NFT
token_on_network = api.get_token_of_account(address=alice, token=token)
```

### Fetching all fungible tokens of an account

Fetches all fungible tokens held by an account. This method does not handle pagination, that can be achieved by using `do_get_generic`.

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
fungible_tokens = api.get_fungible_tokens_of_account(address=alice)
```

### Fetching all non-fungible tokens of an account

Fetches all non-fungible tokens held by an account. This method does not handle pagination, but can be achieved by using `do_get_generic`.

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
nfts = api.get_non_fungible_tokens_of_account(address=alice)
```

### Fetching token metadata

If we want to fetch the metadata of a token, like `owner`, `decimals` and so on, we can use the following methods:

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

# used for ESDT
fungible_token_definition = api.get_definition_of_fungible_token(token_identifier="TEST-123456")

# used for MetaESDT, SFT, NFT
non_fungible_token_definition = api.get_definition_of_tokens_collection(
    collection_name="NFT-987654")
```

### Querying Smart Contracts

Smart contract queries or view functions, are endpoints of a contract that only read data from the contract. To send a query to the observer nodes, we can proceed as follows:

```py
from multiversx_sdk import Address, DevnetEntrypoint, SmartContractQuery

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

query = SmartContractQuery(
    contract=Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq076flgeualrdu5jyyj60snvrh7zu4qrg05vqez5jen"),
    function="getSum",
    arguments=[]
)
response = api.query_contract(query=query)
```

### Custom Api/Proxy calls

The methods exposed by the `ApiNetworkProvider` or `ProxyNetworkProvider` are the most common and used ones. There might be times when custom API calls are needed. For that we have createad generic methods for both `GET` and `POST` requests.

Let's assume we want to get all the transactions that are sent by Alice where the `delegate` function was called.

```py
from multiversx_sdk import Address, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
api = entrypoint.create_network_provider()

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
url_params = {
    "sender": alice.to_bech32(),
    "function": "delegate"
}

transactions = api.do_get_generic(url="transactions", url_parameters=url_params)
```

## Creating transactions

In this section, we'll learn how to create different types of transactions. For creating transactions, we can use `controllers` or `factories`. The `controllers` can be used for scripts or quick network interactions, while the `factories` provide a more granular and lower-level approach, usually needed for DApps. Usually, the `controllers` use the same parameters as the `factories` but also take an `Account` and the `nonce` of the sender as arguments. The `controllers` also hold some extra functionality, like waiting for transaction completion and parsing transactions. The same functionality can be obtained for transactions built using the `factories` as well, we'll see how in the sections below. In the following section we'll learn how to create transactions using both.

### Instantiating controllers and factories

There are two ways to create controllers and factories: the first one is to get them from the entrypoint and the second one is to manually create them.

```py
from multiversx_sdk import DevnetEntrypoint, TransfersController, TransferTransactionsFactory, TransactionsFactoryConfig

entrypoint = DevnetEntrypoint()

# getting the controller and the factory from the entrypoint
transfers_controller = entrypoint.create_transfers_controller()
transfers_factory = entrypoint.create_transfers_transactions_factory()

# manually instantiating the controller and the factory
controller = TransfersController(chain_id="D")

config = TransactionsFactoryConfig(chain_id="D")
factory = TransferTransactionsFactory(config=config)
```

### Estimating the Gas Limit for a Transaction

When creating transaction factories or controllers, we can pass an additional argument, a **gas limit estimator**. This gas estimator simulates the transaction before being sent and computes the `gasLimit` that it will require. The `GasLimitEstimator` can be initialized with a multiplier, so that the estimated value will be multiplied by the specified value. It is recommended to use a small multiplier (e.g. 1.1) to cover any possible changes that may occur from the time the transaction is simulated to the time it is actually sent and processed on-chain. The gas limit estimator can be provided to any factory or controller available. Let's see how we can create a `GasLimitEstimator` and use it.

```py
from multiversx_sdk import ApiNetworkProvider, GasLimitEstimator, TransferTransactionsFactory, TransactionsFactoryConfig

api = ApiNetworkProvider("https://devnet-api.multiversx.com")
gas_estimator = GasLimitEstimator(network_provider=api) # create a gas limit estimator with default multiplier of 1.0
gas_estimator = GasLimitEstimator(network_provider=api, gas_multiplier=1.1) # create a gas limit estimator with a multiplier of 1.1

config = TransactionsFactoryConfig(chain_id="D")
transfers_factory = TransferTransactionsFactory(config=config, gas_limit_estimator=gas_estimator)
```

Also, factories or controllers created through the entrypoints can use the `GasLimitEstimator` as well:

```py
from multiversx_sdk import DevnetEntrypoint

entrypoint = DevnetEntrypoint(with_gas_limit_estimator=True, gas_limit_multiplier=1.1)

transfers_controller = entrypoint.create_transfers_controller() # will create the controller using the GasLimitEstimator with a 1.1 multiplier
transfers_factory = entrypoint.create_transfers_transactions_factory() # will create the factory using the GasLimitEstimator with a 1.1 multiplier
```

### Token transfers

We can send native tokens (EGLD) and ESDT tokens using both the `controller` and the `factory`.

#### Native token transfers using the controller

Because we'll use an `Account`, the transaction will be signed.

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

entrypoint = DevnetEntrypoint()

account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

transfers_controller = entrypoint.create_transfers_controller()
transaction = transfers_controller.create_transaction_for_transfer(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    native_transfer_amount=1000000000000000000,  # 1 EGLD
)

tx_hash = entrypoint.send_transaction(transaction)
```

If you know you'll only send native tokens, the same transaction can be created using the `create_transaction_for_native_token_transfer` method.

#### Native token transfers using the factory

Because we only use the address of the sender, the transactions are not going to be signed or have the nonce field set properly. This should be taken care after the transaction is created.

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

entrypoint = DevnetEntrypoint()
factory = entrypoint.create_transfers_transactions_factory()

alice = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
alice.nonce = entrypoint.recall_account_nonce(alice.address)

bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

transaction = factory.create_transaction_for_transfer(
    sender=alice.address,
    receiver=bob,
    native_amount=1000000000000000000  # 1 EGLD
)
# set the sender's nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction using the sender's account
transaction.signature = alice.sign_transaction(transaction)

tx_hash = entrypoint.send_transaction(transaction)
```

If you know you'll only send native tokens, the same transaction can be created using the `create_transaction_for_native_token_transfer` method.

#### Custom token transfers using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, Token, TokenTransfer

entrypoint = DevnetEntrypoint()

alice = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
alice.nonce = entrypoint.recall_account_nonce(alice.address)

esdt = Token(identifier="TEST-123456")
first_transfer = TokenTransfer(token=esdt, amount=1000000000)

nft = Token(identifier="NFT-987654", nonce=10)
second_transfer = TokenTransfer(token=nft, amount=1)  # when sending NFTs we set the amount to `1`

sft = Token(identifier="SFT-123987", nonce=10)
third_transfer = TokenTransfer(token=nft, amount=7)

transfers_controller = entrypoint.create_transfers_controller()
transaction = transfers_controller.create_transaction_for_transfer(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    token_transfers=[first_transfer, second_transfer, third_transfer]
)

tx_hash = entrypoint.send_transaction(transaction)
```

If you know you'll only send ESDT tokens, the same transaction can be created using `create_transaction_for_esdt_token_transfer`.

#### Custom token transafers using the factory

Because we only use the address of the sender, the transactions are not going to be signed or have the nonce field set properly. This should be taken care after the transaction is created.

```py
from pathlib import Path

from multiversx_sdk import Account, DevnetEntrypoint, Token, TokenTransfer

entrypoint = DevnetEntrypoint()

alice = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
alice.nonce = entrypoint.recall_account_nonce(alice.address)

bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

esdt = Token(identifier="TEST-123456")  # fungible tokens don't have nonce
first_transfer = TokenTransfer(token=esdt, amount=1000000000)  # we set the desired amount we want to send

nft = Token(identifier="NFT-987654", nonce=10)
second_transfer = TokenTransfer(token=nft, amount=1)  # when sending NFTs we set the amount to `1`

sft = Token(identifier="SFT-123987", nonce=10)
third_transfer = TokenTransfer(token=nft, amount=7)  #  for SFTs we set the desired amount we want to send

factory = entrypoint.create_transfers_transactions_factory()
transaction = factory.create_transaction_for_transfer(
    sender=alice.address,
    receiver=bob,
    token_transfers=[first_transfer, second_transfer, third_transfer]
)

# set the sender's nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction using the sender's account
transaction.signature = alice.sign_transaction(transaction)

tx_hash = entrypoint.send_transaction(transaction)
```

If you know you'll only send ESDT tokens, the same transaction can be created using `create_transaction_for_esdt_token_transfer`.

#### Sending native and custom tokens

Also, sending both native and custom tokens is now supported. If a `native_amount` is provided together with `token_transfers`, the native token will also be included in the `MultiESDTNFTTrasfer` built-in function call.

We can send both types of tokens using either the `controller` or the `factory`, but we'll use the controller for the sake of simplicity.

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, Token, TokenTransfer

entrypoint = DevnetEntrypoint()

account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

esdt = Token(identifier="TEST-123456")
first_transfer = TokenTransfer(token=esdt, amount=1000000000)

nft = Token(identifier="NFT-987654", nonce=10)
second_transfer = TokenTransfer(token=nft, amount=1)

transfers_controller = entrypoint.create_transfers_controller()
transaction = transfers_controller.create_transaction_for_transfer(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    native_transfer_amount=1000000000000000000,  # 1 EGLD
    token_transfers=[first_transfer, second_transfer]
)

tx_hash = entrypoint.send_transaction(transaction)
```

### Decoding transaction data

For example, when sending multiple ESDT and NFT tokens, the receiver field of the transaction is the same as the sender field and also the value is set to `0` because all the information is encoded in the `data` field of the transaction.

For decoding the data field we have a so called `TransactionDecoder`. We fetch the transaction from the network and then use the decoder.

```py
from multiversx_sdk import DevnetEntrypoint, TransactionDecoder

entrypoint = DevnetEntrypoint()
transaction = entrypoint.get_transaction("3e7b39f33f37716186b6ffa8761d066f2139bff65a1075864f612ca05c05c05d")

decoder = TransactionDecoder()
decoded_transaction = decoder.get_transaction_metadata(transaction)

print(decoded_transaction.to_dict())
```

### Smart Contracts

#### Contract ABIs

A contract's ABI describes the endpoints, data structure and events that a contract exposes. While contract interactions are possible without the ABI, they are easier to implement when the definitions are available.

##### Loading the ABI from a file

```py
from pathlib import Path
from multiversx_sdk.abi import Abi

abi = Abi.load(Path("./contracts/adder.abi.json"))
```

#### Manually construct the ABI

If an ABI file isn't directly available, but you do have knowledge of the contract's endpoints and types, you can manually construct the ABI.

```py
from multiversx_sdk.abi import Abi, AbiDefinition

abi_definition = AbiDefinition.from_dict({
    "endpoints": [{
        "name": "add",
        "inputs": [
            {
                "name": "value",
                "type": "BigUint"
            }
        ],
        "outputs": []
    }]
})

abi = Abi(definition=abi_definition)
```

### Smart Contract deployments

For creating smart contract deploy transactions, we have two options, as well: a `controller` and a `factory`. Both of these are similar to the ones presented above for transferring tokens.

When creating transactions that interact with smart contracts, we should provide the ABI file to the `controller` or `factory` if possible, so we can pass the arguments as native values. If the abi is not provided and we know what types the contract expects, we can pass the arguments as `typed values` (ex: BigUIntValue, ListValue, StructValue, etc.) or `bytes`.

#### Deploying a smart contract using the controller

```py
from pathlib import Path

from multiversx_sdk import Account, DevnetEntrypoint
from multiversx_sdk.abi import Abi, BigUIntValue

# prepare the account
account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_smart_contract_controller(abi=abi)

# load the contract bytecode
bytecode = Path("contracts/adder.wasm").read_bytes()

# For deploy arguments, use typed value objects if you haven't provided an ABI
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI
args = [42]

deploy_transaction = controller.create_transaction_for_deploy(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    bytecode=bytecode,
    gas_limit=5000000,
    arguments=args,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(deploy_transaction)
```

When creating transactions using `SmartContractController` or `SmartContractTransactionsFactory`, even if the ABI is available and provided, you can still use _typed value_ objects as arguments for deployments and interactions.

Even further, you can use a mix of typed value objects and plain Python values and objects. For example:
```py
args = [U32Value(42), "hello", { "foo": "bar" }, TokenIdentifierValue("TEST-123456")]
```

#### Parsing contract deployment transactions

After broadcasting the transaction, we can wait for it's execution to be completed and parse the processed transaction to extract the address of newly deployed smart contract.

```py
# we use the transaction hash we got when broadcasting the transaction
contract_deploy_outcome = controller.await_completed_deploy(tx_hash)  # waits for transaction completion and parses the result
contract_address = contract_deploy_outcome.contracts[0].address
print(contract_address.to_bech32())
```

If we want to wait for transaction completion and parse the result in two different steps, we can do as follows:

```py
# we use the transaction hash we got when broadcasting the transaction
# waiting for transaction completion
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# parsing the transaction
contract_deploy_outcome = controller.parse_deploy(transaction_on_network)
```

#### Computing the smart contract address

Even before broadcasting, at the moment you know the sender's address and the nonce for your deployment transaction, you can (deterministically) compute the (upcoming) address of the smart contract:

```py
from multiversx_sdk import Address, AddressComputer

# we used Alice for deploying the contract, so we are using her address
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

address_computer = AddressComputer()
contract_address = address_computer.compute_contract_address(
    deployer=alice,
    deployment_nonce=deploy_transaction.nonce  # the same nonce we set on the deploy transaction
)

print("Contract address:", contract_address.to_bech32())
```

#### Deploying a smart contract using the factory

After the transaction is created the `nonce` needs to be properly set and the transaction should be signed before broadcasting it.

```py
from pathlib import Path

from multiversx_sdk import Address, DevnetEntrypoint, SmartContractTransactionsOutcomeParser
from multiversx_sdk.abi import Abi, BigUIntValue


# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts transaction factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_smart_contract_transactions_factory(abi=abi)

# load the contract bytecode
bytecode = Path("contracts/adder.wasm").read_bytes()

# For deploy arguments, use typed value objects if you haven't provided an ABI to the factory:
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI to the factory:
args = [42]

alice_address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

deploy_transaction = factory.create_transaction_for_deploy(
    sender=alice_address,
    bytecode=bytecode,
    gas_limit=5000000,
    arguments=args,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

# load the account
alice = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
deploy_transaction.nonce = alice.nonce

# sign transaction
deploy_transaction.signature = alice.sign_transaction(deploy_transaction)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(deploy_transaction)
print(tx_hash.hex())

# waiting for transaction to complete
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# parsing transaction
parser = SmartContractTransactionsOutcomeParser(abi)
contract_deploy_outcome = parser.parse_deploy(transaction_on_network)

contract_address = contract_deploy_outcome.contracts[0].address
print(contract_address.to_bech32())
```

### Smart Contract calls

In this section we'll see how we can call an endpoint of our previously deployed smart contract using both approaches with the `controller` and the `factory`.

#### Calling a smart contract using the controller

```py
from pathlib import Path

from multiversx_sdk import Account, DevnetEntrypoint
from multiversx_sdk.abi import Abi, BigUIntValue

# prepare the account
account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_smart_contract_controller(abi=abi)

contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

# For deploy arguments, use typed value objects if you haven't provided an ABI
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI
args = [42]

deploy_transaction = controller.create_transaction_for_execute(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    contract=contract_address,
    gas_limit=5000000,
    function="add",
    arguments=args
)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(deploy_transaction)
print(tx_hash.hex())
```

#### Parsing smart contract call transactions

In our case, calling the `add` endpoint does not return anything, but similar to the example above, we could parse this transaction to get the output values of a smart contract call.

```py
# waits for transaction completion and parses the result
# we use the transaction hash we got when broadcasting the transaction
contract_call_outcome = controller.await_completed_execute(tx_hash)
values = contract_call_outcome.values
```

#### Calling a smart contract and sending tokens (transfer & execute)

Additionally, if our endpoint requires a payment when called, we can also send tokens to the contract when creating a smart contract call transaction. We can send EGLD, ESDT tokens or both. This is supported both on the `controller` and the `factory`.

```py
from pathlib import Path

from multiversx_sdk import Account, DevnetEntrypoint, Token, TokenTransfer
from multiversx_sdk.abi import Abi, BigUIntValue

# prepare the account
account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_smart_contract_controller(abi=abi)

contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

# For deploy arguments, use typed value objects if you haven't provided an ABI
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI
args = [42]

# creating the transfer
first_token = Token("TEST-38f249", 10)
first_transfer = TokenTransfer(first_token, 1)

second_token = Token("BAR-c80d29")
second_transfer = TokenTransfer(second_token, 10000000000000000000)

execute_transaction = controller.create_transaction_for_execute(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    contract=contract_address,
    gas_limit=5000000,
    function="add",
    arguments=args,
    native_transfer_amount=1000000000000000000,  # 1 EGLD,
    token_transfers=[first_transfer, second_transfer]
)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(execute_transaction)
print(tx_hash.hex())
```

#### Calling a smart contract using the factory

Let's create the same smart contract call transaction, but using the `factory`.

```py
from pathlib import Path

from multiversx_sdk import Account, DevnetEntrypoint, Token, TokenTransfer
from multiversx_sdk.abi import Abi, BigUIntValue

# prepare the account
account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_smart_contract_transactions_factory(abi=abi)

contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

# For deploy arguments, use typed value objects if you haven't provided an ABI to the factory:
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI to the factory:
args = [42]

# creating the transfer
first_token = Token("TEST-38f249", 10)
first_transfer = TokenTransfer(first_token, 1)

second_token = Token("BAR-c80d29")
second_transfer = TokenTransfer(second_token, 10000000000000000000)

execute_transaction = factory.create_transaction_for_execute(
    sender=account.address,
    contract=contract_address,
    gas_limit=5000000,
    function="add",
    arguments=args,
    native_transfer_amount=1000000000000000000,  # 1 EGLD,
    token_transfers=[first_transfer, second_transfer]
)

execute_transaction.nonce = account.get_nonce_then_increment()
execute_transaction.signature = account.sign_transaction(execute_transaction)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(execute_transaction)
print(tx_hash.hex())
```

### Parsing transaction outcome

As said before, the `add` endpoint we called does not return anything, but we could parse the outcome of smart contract call transactions, as follows:

```py
from pathlib import Path

from multiversx_sdk import SmartContractTransactionsOutcomeParser
from multiversx_sdk.abi import Abi

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# create the parser
parser = SmartContractTransactionsOutcomeParser(abi=abi)

# fetch the transaction of the network
transaction_on_network = entrypoint.get_transaction(tx_hash)  # the tx_hash from the transaction sent above

outcome = parser.parse_execute(transaction=transaction_on_network, function="add")
```

### Decoding transaction events

You might be interested into decoding events emitted by a contract. You can do so by using the `TransactionEventsParser`.

Suppose we'd like to decode a `startPerformAction` event emitted by the [multisig](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract.

First, we load the abi file, then we fetch the transaction, we extract the event from the transaction and then we parse it.

```py
from pathlib import Path

from multiversx_sdk import DevnetEntrypoint, TransactionEventsParser, find_events_by_first_topic
from multiversx_sdk.abi import Abi

# load the abi file
abi = Abi.load(Path("contracts/multisig-full.abi.json"))

# fetch the transaction of the network
network_provider = DevnetEntrypoint().create_network_provider()
transaction_on_network = network_provider.get_transaction("exampleTransactionHash")

# extract the event from the transaction
[event] = find_events_by_first_topic(transaction_on_network, "startPerformAction")

# create the parser
events_parser = TransactionEventsParser(abi=abi)

# parse the event
parsed_event = events_parser.parse_event(event)
```

### Encoding/Decoding custom types

Whenever needed, the contract ABI can be used for manually encoding or decoding custom types.

Let's encode a struct called `EsdtTokenPayment` (of [multisig](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/multisig) contract) into binary data.

```py
from pathlib import Path
from multiversx_sdk.abi import Abi

abi = Abi.load(Path("contracts/multisig-full.abi.json"))
encoded = abi.encode_custom_type("EsdtTokenPayment", ["TEST-8b028f", 0, 10000])
print(encoded)
```

Now, let's decode a struct using the ABI.

```py
from multiversx_sdk.abi import Abi, AbiDefinition

abi_definition = AbiDefinition.from_dict(
    {
        "endpoints": [],
        "events": [],
        "types": {
            "DepositEvent": {
                "type": "struct",
                "fields": [
                    {"name": "tx_nonce", "type": "u64"},
                    {"name": "opt_function", "type": "Option<bytes>"},
                    {"name": "opt_arguments", "type": "Option<List<bytes>>"},
                    {"name": "opt_gas_limit", "type": "Option<u64>"},
                ],
            }
        },
    }
)
abi = Abi(abi_definition)

decoded_type = abi.decode_custom_type(name="DepositEvent", data=bytes.fromhex("00000000000003db000000"))
print(decoded_type)
```

If you don't wish to use the ABI, there is another way to do it. First, let's encode a struct.

```py
from multiversx_sdk.abi import Serializer, U64Value, StructValue, Field, StringValue, BigUIntValue

struct = StructValue([
    Field(name="token_identifier", value=StringValue("TEST-8b028f")),
    Field(name="token_nonce", value=U64Value()),
    Field(name="amount", value=BigUIntValue(10000)),
])

serializer = Serializer()
serialized_struct = serializer.serialize([struct])
print(serialized_struct)
```

Now, let's decode a struct without using the ABI.

```py
from multiversx_sdk.abi import Serializer, U64Value, OptionValue, BytesValue, ListValue, StructValue, Field

tx_nonce = U64Value()
function = OptionValue(BytesValue())
arguments = OptionValue(ListValue([BytesValue()]))
gas_limit = OptionValue(U64Value())

attributes = StructValue([
    Field("tx_nonce", tx_nonce),
    Field("opt_function", function),
    Field("opt_arguments", arguments),
    Field("opt_gas_limit", gas_limit)
])

serializer = Serializer()
serializer.deserialize("00000000000003db000000", [attributes])

print(tx_nonce.get_payload())
print(function.get_payload())
print(arguments.get_payload())
print(gas_limit.get_payload())
```

### Smart Contract queries

When querying a smart contract, a **view function** is called. That function does not modify the state of the contract, thus we don't need to send a transaction.

To query a smart contract, we need to use the `SmartContractController`. Of course, we can use the contract's abi file to encode the arguments of the query, but also parse the result. In this example, we are going to use the [adder](https://github.com/multiversx/mx-contracts-rs/tree/main/contracts/adder) smart contract and we'll call the `getSum` endpoint.

```py
from pathlib import Path

from multiversx_sdk import Address, DevnetEntrypoint
from multiversx_sdk.abi import Abi

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# the contract address we'll query
contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

# create the controller
sc_controller = DevnetEntrypoint().create_smart_contract_controller(abi=abi)

# creates the query, runs the query, parses the result
response = sc_controller.query(
    contract=contract_address,
    function="getSum",
    arguments=[]  # our function expects no arguments, so we provide an empty list
)
```

If we need more granular control, we can split the process in three steps: create the query, run the query and parse the query response. This does the exact same as the example above.

```py
from pathlib import Path

from multiversx_sdk import Address, DevnetEntrypoint
from multiversx_sdk.abi import Abi

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# the contract address we'll query
contract_address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

# create the controller
sc_controller = DevnetEntrypoint().create_smart_contract_controller(abi=abi)

# creates the query
query = sc_controller.create_query(
    contract=contract_address,
    function="getSum",
    arguments=[]  # our function expects no arguments, so we provide an empty list
)

# run the query
result = sc_controller.run_query(query)

# parse the result
parsed_result = sc_controller.parse_query_response(result)
```

### Upgrading a smart contract

Contract upgrade transactions are similar to deployment transactions (see above), in the sense that they also require a contract bytecode. In this context though, the contract address is already known. Similar to deploying a smart contract, we can upgrade a smart contract using either the `controller` or the `factory`.

#### Uprgrading a smart contract using the controller

```py
from pathlib import Path

from multiversx_sdk import Account, Address, DevnetEntrypoint
from multiversx_sdk.abi import Abi, BigUIntValue

# prepare the account
account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)

entrypoint = DevnetEntrypoint()

# the developer is responsible for managing the nonce
account.nonce = entrypoint.recall_account_nonce(account.address)

# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts controller
controller = entrypoint.create_smart_contract_controller(abi=abi)

# load the contract bytecode; this is the new contract code, the one we want to upgrade to
bytecode = Path("contracts/adder.wasm").read_bytes()

# For deploy arguments, use typed value objects if you haven't provided an ABI
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI
args = [42]

contract_address = Address.new_from_bech32(
    "erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

deploy_transaction = controller.create_transaction_for_upgrade(
    sender=account,
    nonce=account.get_nonce_then_increment(),
    contract=contract_address,
    bytecode=bytecode,
    gas_limit=5000000,
    arguments=args,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(deploy_transaction)
print(tx_hash.hex())
```

#### Upgrading a smart contract using the factory

Let's create the same upgrade transaction using the `factory`.

```py
from pathlib import Path

from multiversx_sdk import Account, Address, DevnetEntrypoint
from multiversx_sdk.abi import Abi, BigUIntValue


# load the abi file
abi = Abi.load(Path("contracts/adder.abi.json"))

# get the smart contracts factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_smart_contract_transactions_factory(abi=abi)

# load the contract bytecode; this is the new contract code, the one we want to upgrade to
bytecode = Path("contracts/adder.wasm").read_bytes()

# For deploy arguments, use typed value objects if you haven't provided an ABI to the factory:
args = [BigUIntValue(42)]
# Or use simple, plain Python values and objects if you have provided an ABI to the factory:
args = [42]

alice_address = Address.new_from_bech32(
    "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

contract_address = Address.new_from_bech32(
    "erd1qqqqqqqqqqqqqpgq7cmfueefdqkjsnnjnwydw902v8pwjqy3d8ssd4meug")

deploy_transaction = factory.create_transaction_for_upgrade(
    sender=alice_address,
    contract=contract_address,
    bytecode=bytecode,
    gas_limit=5000000,
    arguments=args,
    is_upgradeable=True,
    is_readable=True,
    is_payable=True,
    is_payable_by_sc=True
)

# load the account
alice = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)
# the developer is responsible for managing the nonce
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
deploy_transaction.nonce = alice.nonce

# sign transaction
deploy_transaction.signature = alice.sign_transaction(deploy_transaction)

# broadcasting the transaction
tx_hash = entrypoint.send_transaction(deploy_transaction)
print(tx_hash.hex())
```

### Token management

In this section, we're going to create transactions to issue fungible tokens, issue semi-fungible tokens, create NFTs, set token roles, but also parse these transactions to extract their outcome (e.g. get the token identifier of the newly issued token).

Of course, the methods used here are available through the `TokenManagementController` or through the `TokenManagementTransactionsFactory`. The controller also contains methods for awaiting transaction completion and for parsing the transaction outcome. The same can be achieved for the transactions factory by using the `TokenManagementTransactionsOutcomeParser`. For scripts or quick network interactions we advise you use the controller, but for a more granular approach (e.g. DApps) we suggest using the factory.

#### Issuing fungible tokens using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_issuing_fungible(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_name="NEWFNG",
    token_ticker="FNG",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction to execute, extract the token identifier
outcome = controller.await_completed_issue_fungible(tx_hash)

token_identifier = outcome[0].token_identifier
print(token_identifier)
```

#### Issuing fungible tokens using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, TokenManagementTransactionsOutcomeParser

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_issuing_fungible(
    sender=alice.address,
    token_name="NEWFNG",
    token_ticker="FNG",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# if we know that the transaction is completed, we can simply call `entrypoint.get_transaction(tx_hash)`
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the token identifier
parser = TokenManagementTransactionsOutcomeParser()
outcome = parser.parse_issue_fungible(transaction_on_network)

token_identifier = outcome[0].token_identifier
print(token_identifier)
```

#### Setting special roles for fungible tokens using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

transaction = controller.create_transaction_for_setting_special_role_on_fungible_token(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    user=bob,
    token_identifier="TEST-123456",
    add_role_local_mint=True,
    add_role_local_burn=True,
    add_role_esdt_transfer_role=True
)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction to execute, extract the roles
outcome = controller.await_completed_set_special_role_on_fungible_token(tx_hash)

roles = outcome[0].roles
uaser = outcome[0].user_address
```

#### Setting special roles for fungible tokens using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, TokenManagementTransactionsOutcomeParser

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_setting_special_role_on_fungible_token(
    sender=alice.address,
    user=bob,
    token_identifier="TEST-123456",
    add_role_local_mint=True,
    add_role_local_burn=True,
    add_role_esdt_transfer_role=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# waits until the transaction is processed and fetches it from the network
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the roles
parser = TokenManagementTransactionsOutcomeParser()
outcome = parser.parse_set_special_role(transaction_on_network)

roles = outcome[0].roles
uaser = outcome[0].user_address
```

#### Issuing semi-fungible tokens using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_issuing_semi_fungible(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_name="NEWSEMI",
    token_ticker="SEMI",
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_transfer_nft_create_role=True,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction to execute, extract the token identifier
outcome = controller.await_completed_issue_semi_fungible(tx_hash)

token_identifier = outcome[0].token_identifier
print(token_identifier)
```

#### Issuing semi-fungible tokens using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, TokenManagementTransactionsOutcomeParser

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_issuing_semi_fungible(
    sender=alice.address,
    token_name="NEWSEMI",
    token_ticker="SEMI",
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_transfer_nft_create_role=True,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# waits until the transaction is processed and fetches it from the network
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the token identifier
parser = TokenManagementTransactionsOutcomeParser()
outcome = parser.parse_issue_semi_fungible(transaction_on_network)

token_identifier = outcome[0].token_identifier
print(token_identifier)
```

#### Issuing NFT collection & creating NFTs using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# issue NFT collection
transaction = controller.create_transaction_for_issuing_non_fungible(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_name="NEWNFT",
    token_ticker="NFT",
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_transfer_nft_create_role=True,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction to execute, extract the collection identifier
outcome = controller.await_completed_issue_non_fungible(tx_hash)

collection_identifier = outcome[0].token_identifier

# set roles
transaction = controller.create_transaction_for_setting_special_role_on_non_fungible_token(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    user=alice.address,
    token_identifier=collection_identifier,
    add_role_nft_create=True,
    add_role_nft_burn=True,
    add_role_nft_update_attributes=True,
    add_role_nft_add_uri=True,
    add_role_esdt_transfer_role=True,
)

# sending the transaction and waiting for completion
tx_hash = entrypoint.send_transaction(transaction)
entrypoint.await_transaction_completed(tx_hash)

# create a NFT
transaction = controller.create_transaction_for_creating_nft(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_identifier=collection_identifier,
    initial_quantity=1,
    name="TEST",
    royalties=2500,  # 25%
    hash="",
    attributes=b"",
    uris=["emptyUri"]
)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction to execute, extract the nft identifier
outcome = controller.await_completed_create_nft(tx_hash)

identifier = outcome[0].token_identifier
nonce = outcome[0].nonce
initial_quantity = outcome[0].initial_quantity
print(identifier)
print(nonce)
print(initial_quantity)
```

#### Issuing NFT collection & creating NFTs using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, TokenManagementTransactionsOutcomeParser

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# issue NFT collection
transaction = factory.create_transaction_for_issuing_non_fungible(
    sender=alice.address,
    token_name="NEWTOKEN",
    token_ticker="TKN",
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_transfer_nft_create_role=True,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# if we know that the transaction is completed, we can simply call `get_transaction(tx_hash)`
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the collection identifier
parser = TokenManagementTransactionsOutcomeParser()
outcome = parser.parse_issue_non_fungible(transaction_on_network)

collection_identifier = outcome[0].token_identifier

# set roles
transaction = factory.create_transaction_for_setting_special_role_on_non_fungible_token(
    sender=alice.address,
    user=alice.address,
    token_identifier=collection_identifier,
    add_role_nft_create=True,
    add_role_nft_burn=True,
    add_role_nft_update_attributes=True,
    add_role_nft_add_uri=True,
    add_role_esdt_transfer_role=True,
)
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction and waiting for completion
tx_hash = entrypoint.send_transaction(transaction)
entrypoint.await_transaction_completed(tx_hash)

# create a NFT
transaction = factory.create_transaction_for_creating_nft(
    sender=alice.address,
    token_identifier=collection_identifier,
    initial_quantity=1,
    name="TEST",
    royalties=2500,  # 25%
    hash="",
    attributes=b"",
    uris=["emptyUri"]
)
# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)

# waits until the transaction is processed and fetches it from the network
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the nft identifier
parser = TokenManagementTransactionsOutcomeParser()
outcome = parser.parse_nft_create(transaction_on_network)

identifier = outcome[0].token_identifier
nonce = outcome[0].nonce
initial_quantity = outcome[0].initial_quantity
print(identifier)
print(nonce)
print(initial_quantity)
```

These are just a few examples of what we can do using the token management controller or factory. For a full list of what methods are supported for both, check out the autogenerated documentation:
- [TokenManagementController](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.token_management.html#module-multiversx_sdk.token_management.token_management_controller)
- [TokenManagementTransactionsFactory](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.token_management.html#module-multiversx_sdk.token_management.token_management_transactions_factory)

### Account management

The account management controller and factory allow us to create transactions for managing accounts, like guarding and unguarding accounts and saving key-value pairs.

To read more about Guardians, check out the [documentation](/developers/built-in-functions/#setguardian).

A guardian can also be set using the WebWallet. The wallet uses our hosted `Trusted Co-Signer Service`. Check out the steps to guard an account using the wallet [here](/wallet/web-wallet/#guardian).

#### Guarding an account using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the account controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_account_controller()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# we can use a trusted service that provides a guardian, or simply set another address we own or trust
guardian = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

transaction = controller.create_transaction_for_setting_guardian(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    guardian_address=guardian,
    service_id="SelfOwnedAddress"  # this is just an example
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Guarding an account using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the account transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_account_transactions_factory()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# we can use a trusted service that provides a guardian, or simply set another address we own or trust
guardian = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

transaction = factory.create_transaction_for_setting_guardian(
    sender=alice.address,
    guardian_address=guardian,
    service_id="SelfOwnedAddress"  # this is just an example
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

tx_hash = entrypoint.send_transaction(transaction)
```

After we've set a guardian, we have to wait 20 epochs until we can activate the guardian. After the guardian is set, all the transactions we send should be signed by the guardian, as well.

#### Activating the guardian using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_account_controller()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_guarding_account(
    sender=alice,
    nonce=alice.get_nonce_then_increment()
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Activating the guardian using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_account_transactions_factory()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_guarding_account(
    sender=alice.address,
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Unguarding the account using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_account_controller()

# the account to unguard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# the guardian account
guardian = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/bob.pem"))

transaction = controller.create_transaction_for_unguarding_account(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    guardian=guardian.address
)

# the transaction should also be signed by the guardian before being sent, otherwise it won't be executed
transaction.guardian_signature = guardian.sign_transaction(transaction)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Unguarding the account using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_account_transactions_factory()

# the account to unguard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# the guardian account
guardian = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/bob.pem"))

transaction = factory.create_transaction_for_unguarding_account(
    sender=alice.address,
    guardian=guardian.address
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# the transaction should also be signed by the guardian before being sent otherwise it won't be executed
transaction.guardian_signature = guardian.sign_transaction(transaction)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Saving a key-value pair to an account using the controller

We can store key-value pairs for an account on the network. To do so, we create the following transaction:

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_account_controller()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# creating the key-value pairs we want to save
values = {
    "testKey".encode(): "testValue".encode(),
    b"anotherKey": b"anotherValue"
}

transaction = controller.create_transaction_for_saving_key_value(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    key_value_pairs=values
)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Saving a key-value pair to an account using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the account transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_account_transactions_factory()

# create the account to guard
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# creating the key-value pairs we want to save
values = {
    "testKey".encode(): "testValue".encode(),
    b"anotherKey": b"anotherValue"
}

transaction = factory.create_transaction_for_saving_key_value(
    sender=alice.address,
    key_value_pairs=values
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

### Delegation management

To read more about staking providers and delegation, please check out the [docs](/validators/delegation-manager/#introducing-staking-providers).

In this section, we are going to create a new delegation contract, get the address of the contract, delegate funds to the contract, redelegate rewards, claim rewards, undelegate and withdraw funds from the contract. The operations can be performed using both the `controller` and the `factory`. For a full list of all the methods supported check out the auto-generated documentation:
- [DelegationController](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.delegation.html#module-multiversx_sdk.delegation.delegation_controller)
- [DelegationTransactionsFactory](https://multiversx.github.io/mx-sdk-py/multiversx_sdk.delegation.html#module-multiversx_sdk.delegation.delegation_transactions_factory)

#### Creating a new delegation contract using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

# the owner of the contract
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_new_delegation_contract(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    total_delegation_cap=0,  # uncapped,
    service_fee=0,
    amount=1250000000000000000000  # 1250 EGLD
)

tx_hash = entrypoint.send_transaction(transaction)

# wait for transaction completion, extract delegation contract's address
outcome = controller.await_completed_create_new_delegation_contract(tx_hash)

contract_address = outcome[0].contract_address
```

#### Creating a new delegation contract using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint, DelegationTransactionsOutcomeParser

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

# the owner of the contract
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_new_delegation_contract(
    sender=alice.address,
    total_delegation_cap=0,  # uncapped,
    service_fee=0,
    amount=1250000000000000000000  # 1250 EGLD
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)

# waits until the transaction is processed and fetches it from the network
transaction_on_network = entrypoint.await_transaction_completed(tx_hash)

# extract the contract's address
parser = DelegationTransactionsOutcomeParser()
outcome = parser.parse_create_new_delegation_contract(transaction_on_network)

contract_address = outcome[0].contract_address
```

#### Delegating funds to the contract using the controller

We can send funds to a delegation contract to earn rewards.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

# create the account delegating funds
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# delegation contract
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva")

transaction = controller.create_transaction_for_delegating(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    delegation_contract=contract,
    amount=5000000000000000000000  # 5000 EGLD
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Delegating funds to the contract using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

# create the account delegating funds
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_delegating(
    sender=alice.address,
    delegation_contract=contract,
    amount=5000000000000000000000  # 5000 EGLD
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Redelegating rewards using the controller

After a period of time, we might have enough rewards that we want to redelegate to the contract to earn even more rewards.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# delegation contract
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva")

transaction = controller.create_transaction_for_redelegating_rewards(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    delegation_contract=contract
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Redelegating rewards using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_redelegating_rewards(
    sender=alice.address,
    delegation_contract=contract
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Claiming rewards using the controller

We can also claim our rewards.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# delegation contract
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva")

transaction = controller.create_transaction_for_claiming_rewards(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    delegation_contract=contract
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Claiming rewards using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_claiming_rewards(
    sender=alice.address,
    delegation_contract=contract
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Undelegating funds using the controller

By undelegating we let the contract know we want to get back our staked funds. This operation has a 10 epochs unbonding period.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# delegation contract
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva")

transaction = controller.create_transaction_for_undelegating(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    delegation_contract=contract,
    amount=1000000000000000000000  # 1000 EGLD
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Undelegating funds using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_undelegating(
    sender=alice.address,
    delegation_contract=contract,
    amount=1000000000000000000000  # 1000 EGLD
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Withdrawing funds using the controller

After the unbonding period has passed, we can withdraw our funds from the contract.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint

# create the entrypoint and the delegation controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_delegation_controller()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# delegation contract
contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqf8llllswuedva")

transaction = controller.create_transaction_for_withdrawing(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    delegation_contract=contract
)

tx_hash = entrypoint.send_transaction(transaction)
```

#### Withdrawing funds using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the delegation transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_delegation_transactions_factory()

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = factory.create_transaction_for_withdrawing(
    sender=alice.address,
    delegation_contract=contract
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce
transaction.nonce = alice.get_nonce_then_increment()

# sign the transaction
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

### Relayed transactions

We are currently on the third iteration of relayed transactions. V1 and V2 are soon to be deactivated so we'll focus on V3. For V3, two new fields have been added on transactions: `relayer` and `relayerSignature`. Before the sender signs the transaction, the relayer needs to be set. After the sender has signed the transaction, the relayer can also sign the transaction and broadcast it. Keep in mind that, for relayed V3 transactions we need an extra `50_000` gas. Let's see how we can create a relayed transaction:

```py
from pathlib import Path
from multiversx_sdk import Account, Address, DevnetEntrypoint, Transaction

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
bob = Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")

# carol will be our relayer, that means she is paying the gas for the transaction
carol = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/carol.pem"))

# fetch the sender's nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# create the transaction
transaction = Transaction(
    sender=alice.address,
    receiver=bob,
    gas_limit=110_000,
    chain_id="D",
    nonce=alice.get_nonce_then_increment(),
    relayer=carol.address,
    data="hello".encode()
)

# sender signs the transaction
transaction.signature = alice.sign_transaction(transaction)

# relayer signs the transaction
transaction.relayer_signature = carol.sign_transaction(transaction)

# broadcast the transaction
entrypoint = DevnetEntrypoint()
tx_hash = entrypoint.send_transaction(transaction)
```

#### Creating relayed transactions using controllers

We can create relayed transactions using any of the controllers. Each controller has a `relayer` argument, that can be set if we want to create a relayed transaction. Let's issue a fungible token creating a relayed transaction:

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# carol will be our relayer, that means she is paying the gas for the transaction
carol = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/carol.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_issuing_fungible(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_name="NEWTOKEN",
    token_ticker="TKN",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True,
    relayer=carol.address
)

# relayer also signs the transaction
transaction.relayer_signature = carol.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Create relayed transactions using factories

The transactions factories do not have a `relayer` argument, the relayer needs to be set after creating the transaction. This is good because the transaction is not signed by the sender when created. Let's issue a fungible token using the `TokenManagementTransactionsFactory`:

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# carol will be our relayer, that means she is paying the gas for the transaction
carol = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/carol.pem"))

transaction = factory.create_transaction_for_issuing_fungible(
    sender=alice.address,
    token_name="NEWTOKEN",
    token_ticker="TKN",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce of the sender
transaction.nonce = alice.get_nonce_then_increment()

# set the relayer
transaction.relayer = carol.address

# sender signs the transaction
transaction.signature = alice.sign_transaction(transaction)

# relayer signs the transaction
transaction.relayer_signature = carol.sign_transaction(transaction)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

### Guarded Transactions

#### Creating guarded transactions using controllers

Very similar to relayers, we have a field `guardian` and a field `guardianSignature`. Each controller has an argument for the guardian. The transaction can be sent to a service that signs it using the guardian's account or we can use another account as a guardian. Let's issue a token using a guarded account.

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management controller
entrypoint = DevnetEntrypoint()
controller = entrypoint.create_token_management_controller()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# carol is the guardian
carol = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/carol.pem"))

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

transaction = controller.create_transaction_for_issuing_fungible(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    token_name="NEWTOKEN",
    token_ticker="TKN",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True,
    guardian=carol.address
)

# guardian also signs the transaction
transaction.guardian_signature = carol.sign_transaction(transaction)

# sending the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

#### Creating guarded transactions using factories

The transactions factories do not have a `guardian` argument, the guardian needs to be set after creating the transaction. This is good because the transaction is not signed by the sender when created. Let's issue a fungible token using the `TokenManagementTransactionsFactory`:

```py
from pathlib import Path
from multiversx_sdk import Account, DevnetEntrypoint

# create the entrypoint and the token management transactions factory
entrypoint = DevnetEntrypoint()
factory = entrypoint.create_token_management_transactions_factory()

# create the issuer of the token
alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# carol is the guardian
carol = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/carol.pem"))

transaction = factory.create_transaction_for_issuing_fungible(
    sender=alice.address,
    token_name="NEWTOKEN",
    token_ticker="TKN",
    initial_supply=1_000_000_000000,  # 1 million tokens, with 6 decimals
    num_decimals=6,
    can_freeze=False,
    can_wipe=True,
    can_pause=False,
    can_change_owner=True,
    can_upgrade=True,
    can_add_special_roles=True
)

# fetch the nonce of the network
alice.nonce = entrypoint.recall_account_nonce(alice.address)

# set the nonce of the sender
transaction.nonce = alice.get_nonce_then_increment()

# set the guardian
transaction.guardian = carol.address

# sender signs the transaction
transaction.signature = alice.sign_transaction(transaction)

# guardian signs the transaction
transaction.guardian_signature = carol.sign_transaction(transaction)

# broadcast the transaction
tx_hash = entrypoint.send_transaction(transaction)
```

We can also create guarded relayed transactions the same way we did before. Keep in mind that, only the sender can be guarded, the relayer cannot. The same flow can be used. Using controllers, we set both `guardian` and `relayer` fields and then the transaction should be signed by both. Using a factory, we create the transaction, set both both fields and then sign the transaction using the sender's account, then the the guardian and the relayer sign the transaction.

### Multisig

The sdk contains components to interact with the [Multisig Contract](https://github.com/multiversx/mx-contracts-rs/releases/tag/v0.45.5). We can deploy a multisig smart contract, add members, propose and execute actions and query the contract. The same as the other components, to interact with a multisig smart contract we can use either the `MultisigController` or the `MultisigTransactionsFactory`.

#### Deploying a Multisig Smart Contract using the controller

```py
from pathlib import Path
from multiversx_sdk import Account, Address, ApiNetworkProvider, MultisigController
from multiversx_sdk.abi import Abi


alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
api = ApiNetworkProvider(url="https://devnet-api.multiversx.com")
alice.nonce = api.get_account(alice.address).nonce

abi = Abi.load(Path("../multiversx_sdk/testutils/testdata/multisig-full.abi.json"))
controller = MultisigController(chain_id="D", network_provider=api, abi=abi)

transaction = controller.create_transaction_for_deploy(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    bytecode=Path("../multiversx_sdk/testutils/testdata/multisig-full.wasm"),
    quorum=2,
    board=[alice.address, Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")],
    gas_limit=100_000_000,
)

# send the transaction
tx_hash = api.send_transaction(transaction)
```

#### Deploying a Multisig Smart Contract using the factory

```py
from pathlib import Path
from multiversx_sdk import Account, Address, ApiNetworkProvider, MultisigTransactionsFactory, TransactionsFactoryConfig
from multiversx_sdk.abi import Abi


alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
api = ApiNetworkProvider(url="https://devnet-api.multiversx.com")
alice.nonce = api.get_account(alice.address).nonce

abi = Abi.load(Path("../multiversx_sdk/testutils/testdata/multisig-full.abi.json"))
config = TransactionsFactoryConfig(chain_id="D")
factory = MultisigTransactionsFactory(config=config, abi=abi)

transaction = factory.create_transaction_for_deploy(
    sender=alice.address,
    bytecode=Path("../multiversx_sdk/testutils/testdata/multisig-full.wasm"),
    quorum=2,
    board=[alice.address, Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")],
    gas_limit=100_000_000,
)
transaction.nonce = alice.get_nonce_then_increment()
transaction.signature = alice.sign_transaction(transaction)

tx_hash = api.send_transaction(transaction)
```

#### Propose an action using the controller

We'll propose an action to send some EGLD to Carol. After we sent the proposal, we'll also parse the outcome of the transaction to get the `proposal id`. The id can be later for signing and performing the proposal.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, ApiNetworkProvider, MultisigController
from multiversx_sdk.abi import Abi


alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
api = ApiNetworkProvider(url="https://devnet-api.multiversx.com")
alice.nonce = api.get_account(alice.address).nonce

abi = Abi.load(Path("../multiversx_sdk/testutils/testdata/multisig-full.abi.json"))
controller = MultisigController(chain_id="D", network_provider=api, abi=abi)

transaction = controller.create_transaction_for_propose_transfer_execute(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    contract=Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq2ukrsg73nwgu3uz6sp8vequuyrhtv2akd8ssyrg7wj"),
    receiver=Address.new_from_bech32("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"),
    gas_limit=10_000_000,
    native_token_amount=1_000000000000000000,  # 1 EGLD
)

# send the transaction
tx_hash = api.send_transaction(transaction)

# parse the outcome and get the proposal id
action_id = controller.await_completed_execute_propose_any(tx_hash)
```

#### Propose an action using the factory

Proposing an action for a multisig contract using the `MultisigFactory` is very similar to using the controller, but in order to get the proposal id we need to use `MultisigTransactionsOutcomeParser`.

```py
from pathlib import Path
from multiversx_sdk import Account, Address, ApiNetworkProvider, MultisigTransactionsFactory, TransactionsFactoryConfig, MultisigTransactionsOutcomeParser, TransactionAwaiter
from multiversx_sdk.abi import Abi


alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
api = ApiNetworkProvider(url="https://devnet-api.multiversx.com")
alice.nonce = api.get_account(alice.address).nonce

abi = Abi.load(Path("../multiversx_sdk/testutils/testdata/multisig-full.abi.json"))
config = TransactionsFactoryConfig(chain_id="D")
factory = MultisigTransactionsFactory(config=config, abi=abi)

transaction = factory.create_transaction_for_propose_transfer_execute(
    sender=alice.address,
    contract=Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq2ukrsg73nwgu3uz6sp8vequuyrhtv2akd8ssyrg7wj"),
    receiver=Address.new_from_bech32("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"),
    gas_limit=10_000_000,
    native_token_amount=1_000000000000000000,  # 1 EGLD
)
transaction.nonce = alice.get_nonce_then_increment()
transaction.signature = alice.sign_transaction(transaction)

tx_hash = api.send_transaction(transaction)

# wait for the transaction to execute
transaction_awaiter = TransactionAwaiter(fetcher=api)
transaction_awaiter.await_completed(tx_hash)

# parse the outcome of the transaction
parser = MultisigTransactionsOutcomeParser(abi=abi)
transaction_on_network = api.get_transaction(tx_hash)
action_id = parser.parse_propose_action(transaction_on_network)
```

#### Querying the Multisig Smart Contract

Unlike creating transactions, querying the multisig can be performed only using the controller. Let's query the contract to get all board members.

```py
from pathlib import Path
from multiversx_sdk import Address, ApiNetworkProvider, MultisigController
from multiversx_sdk.abi import Abi

abi = Abi.load(Path("../multiversx_sdk/testutils/testdata/multisig-full.abi.json"))
api = ApiNetworkProvider(url="https://devnet-api.multiversx.com")
controller = MultisigController(chain_id="D", network_provider=api, abi=abi)

contract = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgq2ukrsg73nwgu3uz6sp8vequuyrhtv2akd8ssyrg7wj")
board_members = controller.get_all_board_members(contract)
```

### Governance

We can create transactions for creating a new governance proposal, vote for a proposal or query the governance contract.

#### Creating a new proposal using the controller

```py
from multiversx_sdk import Account, ProxyNetworkProvider, GovernanceController

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
alice.nonce = proxy.get_account(alice.address).nonce

controller = GovernanceController(chain_id="D", network_provider=proxy)
commit_hash = "1db734c0315f9ec422b88f679ccfe3e0197b9d67"

transaction = controller.create_transaction_for_new_proposal(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    commit_hash=commit_hash,
    start_vote_epoch=10,
    end_vote_epoch=15,
    native_token_amount=500_000000000000000000,
)

# send the transaction
tx_hash = proxy.send_transaction(transaction)

# get proposal outcome
[proposal] = controller.await_completed_new_proposal(tx_hash)
print(proposal.proposal_nonce)
print(proposal.commit_hash)
print(proposal.start_vote_epoch)
print(proposal.end_vote_epoch)
```

#### Creating a new proposal using the factory

```py
from multiversx_sdk import (Account, ProxyNetworkProvider, GovernanceTransactionsFactory,
                            GovernanceTransactionsOutcomeParser, TransactionsFactoryConfig, TransactionAwaiter)

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
alice.nonce = proxy.get_account(alice.address).nonce

config = TransactionsFactoryConfig(chain_id="D")
factory  = GovernanceTransactionsFactory(config)
commit_hash = "1db734c0315f9ec422b88f679ccfe3e0197b9d67"

transaction = factory.create_transaction_for_new_proposal(
    sender=alice.address,
    commit_hash=commit_hash,
    start_vote_epoch=10,
    end_vote_epoch=15,
    native_token_amount=500_000000000000000000,
)
transaction.nonce = alice.get_nonce_then_increment()
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = proxy.send_transaction(transaction)

# make sure the transaction is complete
awaiter = TransactionAwaiter(fetcher=proxy)
transaction_on_network = awaiter.await_completed(tx_hash)

# get proposal outcome
parser = GovernanceTransactionsOutcomeParser()
[proposal] = parser.parse_new_proposal(transaction_on_network=transaction_on_network)

print(proposal.proposal_nonce)
print(proposal.commit_hash)
print(proposal.start_vote_epoch)
print(proposal.end_vote_epoch)
```

#### Vote for a proposal using the controller

```py
from multiversx_sdk import Account, ProxyNetworkProvider, GovernanceController, VoteType


alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
alice.nonce = proxy.get_account(alice.address).nonce

controller = GovernanceController(chain_id="D", network_provider=proxy)

transaction = controller.create_transaction_for_voting(
    sender=alice,
    nonce=alice.get_nonce_then_increment(),
    proposal_nonce=1,
    vote=VoteType.YES
)

# send the transaction
tx_hash = proxy.send_transaction(transaction)

# get vote outcome
[vote] = controller.await_completed_vote(tx_hash)
print(vote.proposal_nonce)
print(vote.vote)
print(vote.total_stake)
print(vote.total_voting_power)
```

#### Vote for a proposal using the factory

```py
from multiversx_sdk import (Account, ProxyNetworkProvider, GovernanceTransactionsFactory,
                            GovernanceTransactionsOutcomeParser, TransactionsFactoryConfig,
                            TransactionAwaiter, VoteType)

alice = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))
proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
alice.nonce = proxy.get_account(alice.address).nonce

config = TransactionsFactoryConfig(chain_id="D")
factory  = GovernanceTransactionsFactory(config)

transaction = factory.create_transaction_for_voting(
    sender=alice.address,
    proposal_nonce=1,
    vote=VoteType.YES,
)
transaction.nonce = alice.get_nonce_then_increment()
transaction.signature = alice.sign_transaction(transaction)

# send the transaction
tx_hash = proxy.send_transaction(transaction)

# make sure the transaction is complete
awaiter = TransactionAwaiter(fetcher=proxy)
transaction_on_network = awaiter.await_completed(tx_hash)

# get vote outcome
parser = GovernanceTransactionsOutcomeParser()
[vote] = parser.parse_vote(transaction_on_network=transaction_on_network)

print(vote.proposal_nonce)
print(vote.vote)
print(vote.total_stake)
print(vote.total_voting_power)
```

#### Querying the governance contract

Unlike creating transactions, querying the contract is only possible using the controller. Let's query the contract to get more details about a proposal.

```py
from multiversx_sdk import ProxyNetworkProvider, GovernanceController


proxy = ProxyNetworkProvider("https://devnet-gateway.multiversx.com")
controller = GovernanceController(chain_id="D", network_provider=proxy)

proposal_info = controller.get_proposal(proposal_nonce=1)
```

## Addresses

Create an `Address` object from a _bech32-encoded_ string:

```py
from multiversx_sdk import Address

address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print("Address (bech32-encoded)", address.to_bech32())
print("Public key (hex-encoded):", address.to_hex())
print("Public key (hex-encoded):", address.get_public_key().hex())
```

Create an address from a _hex-encoded_ string - note that you have to provide the address prefix, also known as the **HRP** (_human-readable part_ of the address). If not provided, the default one will be used.

```py
from multiversx_sdk import Address

address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1", "erd")
```

Create an address from a raw public key:

```py
from multiversx_sdk import Address

pubkey = bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = Address(pubkey, "erd")
```

Alternatively, you can use an `AddressFactory` (initialized with a specific **HRP**) to create addresses. If the hrp is not provided, the default one will be used.

```py
from multiversx_sdk import AddressFactory

factory = AddressFactory("erd")

address = factory.create_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
address = factory.create_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
address = factory.create_from_public_key(bytes.fromhex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1"))
```

### Getting the shard of an address

```py
from multiversx_sdk import Address, AddressComputer

address_computer = AddressComputer()
address = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

print("Shard:", address_computer.get_shard_of_address(address))
```

### Checking if the address is a smart contract address

```py
from multiversx_sdk import Address

address = Address.new_from_bech32("erd1qqqqqqqqqqqqqpgquzmh78klkqwt0p4rjys0qtp3la07gz4d396qn50nnm")
print("Is contract address:", address.is_smart_contract())
```

### Changing the default hrp

We have a configuration class, called `LibraryConfig`, that only stores (for the moment) the **default hrp** of the addresses. The default value is `erd`. The hrp can be changed when instantiating an address, or it can be changed in the `LibraryConfig` class, and all the addresses created will have the newly set hrp.

```py
from multiversx_sdk import Address
from multiversx_sdk import LibraryConfig


print(LibraryConfig.default_address_hrp)
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
print(address.to_bech32())

LibraryConfig.default_address_hrp = "test"
address = Address.new_from_hex("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1")
print(address.to_bech32())

# setting back the default value
LibraryConfig.default_address_hrp = "erd"
```

## Wallets

### Generating a mnemonic

Mnemonic generation is based on [`trezor/python-mnemonic`](https://github.com/trezor/python-mnemonic) and can be achieved as follows:

```py
from multiversx_sdk import Mnemonic

mnemonic = Mnemonic.generate()
words = mnemonic.get_words()

print(words)
```

### Saving the mnemonic to a keystore file

The mnemonic can be saved to a keystore file:

```py
from pathlib import Path
from multiversx_sdk import Mnemonic, UserWallet

mnemonic = Mnemonic.generate()

# saves the mnemonic to a keystore file with kind=mnemonic
wallet = UserWallet.from_mnemonic(mnemonic.get_text(), "password")
wallet.save(Path("walletWithMnemonic.json"))
```

#### Deriving secret keys from a mnemonic

Given a mnemonic, we can derive keypairs:

```py
from multiversx_sdk import Mnemonic

mnemonic = Mnemonic.generate()

secret_key = mnemonic.derive_key(0)
public_key = secret_key.generate_public_key()

print("Secret key:", secret_key.hex())
print("Public key:", public_key.hex())
```

#### Saving a secret key to a keystore file

The secret key can also be saved to a keystore file:

```py
from pathlib import Path
from multiversx_sdk import Mnemonic, UserWallet

mnemonic = Mnemonic.generate()

# by default, derives using the index = 0
secret_key = mnemonic.derive_key()

# saves the mnemonic to a keystore file with kind=secretKey
wallet = UserWallet.from_secret_key(secret_key, "password")
wallet.save(Path("walletWithSecretKey.json"))
```

#### Saving a secrey key to a PEM file

We can save a secret key to a pem file. **This is not recommended as it is not secure, but it's very convenient for testing purposes.**

```py
from pathlib import Path
from multiversx_sdk import Address, UserPEM

mnemonic = Mnemonic.generate()

# by default, derives using the index = 0
secret_key = mnemonic.derive_key()

label = Address(public_key.buffer, "erd").to_bech32()
pem = UserPEM(label=label, secret_key=secret_key)
pem.save(Path("wallet.pem"))
```

### Generating a KeyPair

A `KeyPair` is a wrapper over a secret key and a public key. We can create a keypair and use it for signing or verifying.

```py
from multiversx_sdk import KeyPair

keypair = KeyPair.generate()

# get secret key
secret_key = keypair.get_secret_key()

# get public key
public_key = keypair.get_public_key()
```

### Loading a wallets from keystore mnemonic file

Load a keystore that holds an _encrypted mnemonic_ (and perform wallet derivation at the same time):

```py
from pathlib import Path
from multiversx_sdk import UserWallet

# loads the mnemonic and derives the a secret key; default index = 0
secret_key = UserWallet.load_secret_key(Path("walletWithMnemonic.json"), "password")
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())

# derive secret key with index = 7
secret_key = UserWallet.load_secret_key(
    path=Path("walletWithMnemonic.json"),
    password="password",
    address_index=7
)
address = secret_key.generate_public_key().to_address()

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

#### Loading a wallet from a keystore secret key file

```py
from pathlib import Path
from multiversx_sdk import UserWallet

secret_key = UserWallet.load_secret_key(Path("walletWithSecretKey.json"), "password")
address = secret_key.generate_public_key().to_address("erd")

print("Secret key:", secret_key.hex())
print("Address:", address.to_bech32())
```

#### Loading a wallet from a PEM file

```py
from pathlib import Path
from multiversx_sdk import UserPEM

pem = UserPEM.from_file(Path("wallet.pem"))

print("Secret key:", pem.secret_key.hex())
print("Public key:", pem.public_key.hex())
```

## Signing objects

The signing is performed using the **secret key** of an account. We have a few wrappers over the secret key, like [Account](#creating-accounts) that make siging easier. We'll first learn how we can sign using an `Account` and then we'll see how we can sign using the secret key.

#### Signing a Transaction using an Account

We are going to assume we have an account at this point. If you don't fell free to check out the [creating an account section](#creating-accounts).

```py
from pathlib import Path
from multiversx_sdk import Account, Address, Transaction

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = Transaction(
    nonce=90,
    sender=account.address,
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

# apply the signature on the transaction
transaction.signature = account.sign_transaction(transaction)

print(transaction.to_dictionary())
```

#### Signing a Transaction using a SecretKey

```py
from multiversx_sdk import Transaction, TransactionComputer, UserSecretKey

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))
public_key = secret_key.generate_public_key()

transaction = Transaction(
    nonce=90,
    sender=public_key.to_address(),
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

# serialize the transaction
transaction_computer = TransactionComputer()
serialized_transaction = transaction_computer.compute_bytes_for_signing(transaction)

# apply the signature on the transaction
transaction.signature = secret_key.sign(serialized_transaction)

print(transaction.to_dictionary())
```

#### Signing a Transaction by hash

```py
from pathlib import Path
from multiversx_sdk import Account, Address, Transaction, TransactionComputer

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = Transaction(
    nonce=90,
    sender=account.address,
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

transaction_computer = TransactionComputer()

# sets the least significant bit of the options field to `1`
transaction_computer.apply_options_for_hash_signing(transaction)

# compute a keccak256 hash for signing
hash = transaction_computer.compute_hash_for_signing(transaction)

# sign and apply the signature on the transaction
transaction.signature = account.sign(hash)

print(transaction.to_dictionary())
```

#### Signing a Message using an Account

```py
from pathlib import Path
from multiversx_sdk import Account, Message

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# creating a message
message = Message(data="this is a test message".encode(), address=account.address)

# signing the message
message.signature = account.sign_message(message)
```

#### Signing a message using a SecretKey

```py
from multiversx_sdk import UserSecretKey, Message, MessageComputer

secret_key_hex = "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9"
secret_key = UserSecretKey(bytes.fromhex(secret_key_hex))
public_key = secret_key.generate_public_key()

message_computer = MessageComputer()

# creating a message
message = Message(data="this is a test message".encode(), address=public_key.to_address())

# serialize the message
serialized_message = message_computer.compute_bytes_for_signing(message)

# signing the message
message.signature = secret_key.sign(serialized_message)
```

## Verifying signatures

The verification of a signature is done using the **public key** of an account. We have a few wrappers over public keys that make the verification of signatures a little bit easier.

#### Verifying Transaction signature using a UserVerifier

```py
from pathlib import Path
from multiversx_sdk import Account, Address, Transaction, TransactionComputer, UserVerifier

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = Transaction(
    nonce=90,
    sender=account.address,
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

# apply the signature on the transaction
transaction.signature = account.sign_transaction(transaction)

# instantiating a user verifier; basically gets the public key
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
alice_verifier = UserVerifier.from_address(alice)

# serialize the transaction for verification
transaction_computer = TransactionComputer()
serialized_transaction = transaction_computer.compute_bytes_for_verifying(transaction)

# verify the signature
is_signed_by_alice = alice_verifier.verify(
    data=serialized_transaction,
    signature=transaction.signature
)

print("Transaction is signed by Alice:", is_signed_by_alice)
```

#### Verifying Message signature using a UserVerifier

```py
from pathlib import Path
from multiversx_sdk import Account, Address, Message, MessageComputer, UserVerifier

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

message = Message(
    data="this is a test message".encode(),
    address=account.address
)

# apply the signature on the message
message.signature = account.sign_message(message)

# instantiating a user verifier; basically gets the public key
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
alice_verifier = UserVerifier.from_address(alice)

# serialize the message for verification
message_computer = MessageComputer()
serialized_message = message_computer.compute_bytes_for_verifying(message)

# verify the signature
is_signed_by_alice = alice_verifier.verify(
    data=serialized_message,
    signature=message.signature
)

print("Message is signed by Alice:", is_signed_by_alice)
```

#### Verifying a signature using the public key

```py
from pathlib import Path
from multiversx_sdk import Account, Address, Transaction, TransactionComputer, UserPublicKey

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

transaction = Transaction(
    nonce=90,
    sender=account.address,
    receiver=Address.new_from_bech32("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"),
    value=1000000000000000000,
    gas_limit=50000,
    chain_id="D"
)

# apply the signature on the transaction
transaction.signature = account.sign_transaction(transaction)

# instantiating a public key
alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")
public_key = UserPublicKey(alice.get_public_key())

# serialize the transaction for verification
transaction_computer = TransactionComputer()
serialized_transaction = transaction_computer.compute_bytes_for_verifying(transaction)

# verify the signature
is_signed_by_alice = public_key.verify(
    data=serialized_transaction,
    signature=transaction.signature
)

print("Transaction is signed by Alice:", is_signed_by_alice)
```

#### Sending messages over boundaries

Generally speaking, signed `Message` objects are meant to be sent to a remote party (e.g. a service), which can then verify the signature.

In order to prepare a message for transmission, you can use the `MessageComputer.packMessage()` utility method:

```py
from pathlib import Path
from multiversx_sdk import Account, Message, MessageComputer

account = Account.new_from_pem(Path("../multiversx_sdk/testutils/testwallets/alice.pem"))

# creating a message
message = Message(data="this is a test message".encode(), address=account.address)

# signing the message
message.signature = account.sign_message(message)

message_computer = MessageComputer()
packed_message = message_computer.pack_message(message)
print(packed_message)
```

Then, on the receiving side, you can use `MessageComputer.unpackMessage()` to reconstruct the message, prior verification:

```py
from multiversx_sdk import Address, MessageComputer, UserPublicKey

alice = Address.new_from_bech32("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")

message_computer = MessageComputer()

# restore message
message = message_computer.unpack_message(packed_message)

# verify signature
public_key = UserPublicKey(alice.get_public_key())

is_signed_by_alice = public_key.verify(message_computer.compute_bytes_for_verifying(message), message.signature)
print("Is signed by Alice:", is_signed_by_alice)
```

## Generating a Native Auth Token

The sdk implements a native auth client that can be used to generate a native auth token.

```py
from pathlib import Path

from multiversx_sdk import Account, Message, NativeAuthClient, NativeAuthClientConfig

config = NativeAuthClientConfig(origin="https://devnet-api.multiversx.com", api_url="https://devnet-api.multiversx.com")
client = NativeAuthClient(config)

account = Account.new_from_keystore(
    file_path=Path("../multiversx_sdk/testutils/testwallets/withDummyMnemonic.json"),
    password="password",
    address_index=0
)

init_token = client.initialize()
token_for_signing = client.get_token_for_signing(account.address, init_token)
signature = account.sign_message(Message(token_for_signing))
access_token = client.get_token(address=account.address, token=init_token, signature=signature.hex())

print(access_token)
```

## Validating a Native Auth Token

The sdk implements native auth server-side components that can be used to validate a native auth token. If you want to see the validated token, you can simply do the following:

```py
from multiversx_sdk import NativeAuthServerConfig, NativeAuthServer

config = config = NativeAuthServerConfig(
    api_url="https://devnet-api.multiversx.com",
    accepted_origins=["https://devnet-api.multiversx.com"],
    max_expiry_seconds=86400,
)

server = NativeAuthServer(config)

# we are using the token generated above
validated_token = server.validate(access_token)

print(validated_token.address.to_bech32())
print(validated_token.signer_address.to_bech32())
print(validated_token.issued)
print(validated_token.expires)
print(validated_token.origin)
print(validated_token.extra_info)
```

Or, alternatively, if you just want to check if the token is valid, you can do the following:

```py
from multiversx_sdk import NativeAuthServerConfig, NativeAuthServer

config = config = NativeAuthServerConfig(
    api_url="https://devnet-api.multiversx.com",
    accepted_origins=["https://devnet-api.multiversx.com"],
    max_expiry_seconds=86400,
)

server = NativeAuthServer(config)

# we are using the token generated above
is_valid = server.is_valid(access_token)
print(is_valid)
```

## Start your first project

We recommend using a Python version equal to `3.11` or higher, but the sdk should work with any version higher than `3.8`. We also recommend using a virtual environment for managing dependencies. Make sure you also have `pip` installed on your machine.

Using a Terminal or Console, create a directory on your system (hello-multiversx in this example) and make it the working directory.

```sh
mkdir hello-multiversx
cd hello-multiversx
```

### Create a virtual environment

Run the following command to create and activate your virtual environment:

```sh
python3 -m venv ./venv
source ./venv/bin/activate
```

After the virtual environment is created, we can install the sdk running the following command:

```sh
pip install multiversx-sdk
```

If you wish to interact with Ledger devices through the sdk, install the sdk as follows:

```sh
pip install multiversx-sdk[ledger]
```

If your project has multiple dependencies, we recommend using a `requirements.txt` file for having all dependencies in one place. Inside the file we are going to place each dependency on a new line:

```sh
multiversx-sdk
```

Additionally, we can also install it directly from GitHub. Place this line on a new line of your `requirements.txt` file. In this example, we are going to install the version `2.0.0`:

```sh
git+https://git@github.com/multiversx/mx-sdk-py.git@v2.0.0#egg=multiversx_sdk
```

If you've places all dependencies in a `requirements.txt` file, make sure you also install them by running:

```sh
pip install -r requirements.txt
```

We can then create a `main.py` file where we can write our code.

### Importing objects from the sdk

The most common classes can be imported from package level:

```py
from multiversx_sdk import Address, Transaction
```

When interacting with smart contracts, we might want to make use of the abi file or other contract types. We should import those from the abi subpackage.

```py
from multiversx_sdk.abi import Abi, BigUIntValue, StringValue
```
<!-- END_NOTEBOOK -->
