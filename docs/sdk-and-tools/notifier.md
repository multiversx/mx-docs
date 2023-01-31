---
id: notifier
title: Notifier
---

## Overview

A MultiversX observer node can be connected to a notifier service, which will publish blockchain
events to subscribers.

The GitHub repository for the notifier service can be found here:
https://github.com/multiversx/mx-chain-notifier-go.

## Architectural Overview

Any observer node in the network can be connected to notifier service. The observer will send
HTTP POST requests to notifier containing the block events data. The notifier service will
receive and filter events, it will apply deduplication if enabled, and it will push the events
to RabbitMQ instance, or push them to websockets subscribers.

![img](/technology/notifier-overview.png)

## Setup

### Observer Client

On the observer side, there is a http client that will push block events to notifier service.

In the observer node's configuration directory, `external.toml` config file can be configured
to enable notifier connector. The config file can be found 
[here](https://github.com/multiversx/mx-chain-go/blob/master/cmd/node/config/external.toml).

The supported config variables are as follows:

- `Enabled`: signals whether a driver should be attached when launching the node.
- `UseAuthorization`: signal whether to use authorization. For testing purposes it can be set to `false`.
- `ProxyUrl`: host and port on which the `eventNotifier` will push the parsed event data.
- `Username`: the username used for authorization.
- `Password`: the password used for authorization.

The corresponding config section for enabling the driver:

```toml
[EventNotifierConnector]
    # Enabled will turn on or off the event notifier connector
    Enabled = true

    # UseAuthorization signals the proxy to use authorization
    # Never run a production setup without authorization
    UseAuthorization = false

    # ProxyUrl is used to communicate with the subscriptions hub
    # The indexer instance will broadcast data using ProxyUrl
    ProxyUrl = "http://localhost:5000"

    # Username and Password need to be specified if UseAuthorization is set to true
    Username = ""

    # Password is used to authorize an observer to push event data
    Password = ""
```

:::tip
Due to the possible high data volume, it's not recommended to use validators as nodes
to push events to Notifier Service.
Similar to Elasticsearch indexing, our implementation uses a concept of a queue and makes
sure that everything is being processed. Consensus and synchronization mechanisms can have
delays because of the indexing.
:::

### Notifier Service

In the notifier configuration directory (`cmd/notifier/config`), there is the `config.toml`
file that can be used to configure the service.

The supported config variables are:
- `Port`: the port on which the http server listens on. Should be the same 
  as the port in the `ProxyUrl` described above.
- `Username`: the username used to authorize an observer. Can be left empty for `UseAuthorization = false`.
- `Password`: the password used to authorize an observer. Can be left empty for `UseAuthorization = false`.
- `CheckDuplicates`: if true, it will check (based on a locker service using redis) if the event have been already pushed to clients

The `ConnectorApi` section has to be aligned with the one from observer node:
```toml
[ConnectorApi]
    # The port on which the Hub listens for subscriptions
    Port = "5000"

    # Username is the username needed to authorize an observer to push data
    Username = ""
    
    # Password is the password needed to authorize an observer to push event data
    Password = ""

    # CheckDuplicates signals if the events received from observers have been already pushed to clients
    # Requires a redis instance/cluster and should be used when multiple observers push from the same shard
    CheckDuplicates = true
```

If `CheckDuplicates` will be set to true, notifier service will try to connect to a redis 
instance. In this context, redis will be used as a locker service mechanism for deduplication.
This is usefull in scenarios when multiple observer nodes from same shard are being to send
events to the same notifier instance.

The `Redis` section includes the following parameters as described below:

```toml
[Redis]
    # The url used to connect to a pubsub server
    # Note: not required for running in the notifier mode
    Url = "redis://localhost:6379/0"

    # The pubsub channel used for publishing/subscribing
    # Note: not required for running in the notifier mode
    Channel = "pub-sub"

    # The master name for failover client
    MasterName = "mymaster"

    # The sentinel url for failover client
    SentinelUrl = "localhost:26379"

    # The redis connection type. Options: | instance | sentinel |
    # instance - it will try to connect to a single redis instance
    # sentinel - it will try to connect to redis setup with master, slave and sentinel instances
    ConnectionType = "sentinel"

    # Time to live (in minutes) for redis lock entry
    TTL = 30
```

For more details on notifier service setup, please follow the **Install** and **Launching**
sections from README in the repository https://github.com/multiversx/mx-chain-notifier-go.

## Subscribers

Currently there are 2 supported subscribing solutions:
* RabbitMQ
* Websocket

:::tip
It is recommended to use the setup with RabbitMQ.
:::

There are multiple event types. In RabbitMQ there is a separate exchange for each event type,
in WS setup, there is a event type field in each message.

The WS event is defined as following:

| Field      | Description                                                                    |
|------------|--------------------------------------------------------------------------------|
| Type       | The type field defines the event type, it can be one of the followins: `all_events`, `revert_events`, `finalized_events`. `all_events` refers to all logs and events after the filtering. |
| Data       | Serialized data corresponding to the event type. |

### Push Event

Each time a block is commited on the chain, an event will be triggered with basic information
on the block together with logs and events. The structure data fields are as following:

Push Block Event

| Field          | Description                                               |
|----------------|-----------------------------------------------------------|
| hash           | The hash field represents the hash of the commited block. |
| events         | The events field holds a list of events.                  |

Event structure 

| Field       | Description                                                                                                                                                                               |
|-------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| identifier  | This field represents the identifier of the event.                                                                                                                                        |
| address     | The address field holds the address in a bech32 encoding. It can be the address of the smart contract that generated the event or the address of the receiver address of the transaction. |
| topics      | The topics field holds a list with extra information. They don't have a specific order because the smart contract is free to log anything that could be helpful.                          |
| data        | The data field can contain information added by the smart contract that generated the event.                                                                                              |
| order       | The order field represents the index of the event indicating the execution order.                                                                                                         |

### Revert Event

When there is a revert for a particular block on the chain, a revert event will be triggered,
containing basic info on the block.

| Field      | Description                                                                    |
|------------|--------------------------------------------------------------------------------|
| hash       | The hash field represents the hash of the commited block.                      |
| nonce      | The nonce field represents the sequence number of the block.                   |
| round      | The round field represents the round when the block was proposed and executed. |
| epoch      | The epoch field represents the epoch when the block was proposed and executed. |

### Finalized Block Event

When a block is completely finalized, including intra-shard transactions, a finalized event will
be triggered containing the hash of the block.

| Field      | Description                                                                    |
|------------|--------------------------------------------------------------------------------|
| hash       | The hash field represents the hash of the commited block.                      |
