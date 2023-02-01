---
id: nodes
title: Nodes
---

[comment]: # (mx-context-auto)

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

Query Nodes (Peers) information.

[comment]: # (mx-context-auto)

## <span class="badge badge--primary">GET</span> **Get Heartbeat Status** {#get-heartbeat-status}

`https://gateway.multiversx.com/node/heartbeatstatus`

This endpoint allows one to query the status of the Nodes.

<Tabs
defaultValue="Response"
values={[
{label: 'Response', value: 'Response'}
]}>
<TabItem value="Response">

🟢 200: OK

Heartbeat status is retrieved successfully.

```json
{
    "data": {
        "heartbeats": [
          ...
          {
            "timeStamp": "2020-06-04T16:02:41.191947208Z",
            "publicKey": "006d...",
            "versionNumber": "v1.0.125-0-g2164f5f04/go1.13.4/linux-amd64",
            "nodeDisplayName": "DrDelphi4",
            "identity": "stakingagency",
            "totalUpTimeSec": 7367,
            "totalDownTimeSec": 0,
            "maxInactiveTime": "1m41.148001375s",
            "receivedShardID": 4294967295,
            "computedShardID": 4294967295,
            "peerType": "eligible",
            "isActive": true
          },
          {
            "timeStamp": "2020-06-04T16:02:29.567740999Z",
            "publicKey": "667a...",
            "versionNumber": "v1.0.125-0-g2164f5f04/go1.13.4/linux-amd64",
            "nodeDisplayName": "DrDelphi0",
            "identity": "stakingagency",
            "totalUpTimeSec": 7367,
            "totalDownTimeSec": 0,
            "maxInactiveTime": "1m9.537847751s",
            "receivedShardID": 4294967295,
            "computedShardID": 4294967295,
            "peerType": "eligible",
            "isActive": true
          },
          ...
        ]
    },
    "error": "",
    "code": "successful"
}
```

</TabItem>
</Tabs>

[comment]: # (mx-context-auto)

## <span class="badge badge--primary">GET</span> **Get Node Status** {#get-node-status}

`http://localhost:8080/node/status`

This endpoint allows one to query all the metrics of the Node.

<Tabs
defaultValue="Response"
values={[
{label: 'Response', value: 'Response'}
]}>
<TabItem value="Response">

🟢 200: OK

Statistics retrieved successfully.

```json
{
  "data": {
    "metrics": {
        "erd_shard_id": 2,
        "erd_nonce": 403,
        "erd_min_gas_limit": 50000,
        "erd_min_gas_price": 1000000000,
        "erd_denomination": 18,
        ...
    }
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

:::important
This endpoint is not available on the Proxy. Only Nodes (Observers) expose this endpoint.
:::

[comment]: # (mx-context-auto)

## <span class="badge badge--primary">GET</span> **Get P2P Status** {#get-p2p-status}

`http://localhost:8080/node/p2pstatus`

This endpoint allows one to query the P2P status of the Node.

<Tabs
defaultValue="Response"
values={[
{label: 'Response', value: 'Response'}
]}>
<TabItem value="Response">

🟢 200: OK

P2P status retrieved successfully.

```json
{
  "data": {
    "metrics": {
      "erd_p2p_cross_shard_observers": "...",
      "erd_p2p_cross_shard_validators": "...",
      "erd_p2p_intra_shard_observers": "...",
      "erd_p2p_intra_shard_validators": "...",
      "erd_p2p_num_connected_peers_classification": "...",
      "erd_p2p_num_receiver_peers_fast_reacting": 2,
      "erd_p2p_num_receiver_peers_out_of_specs": 2,
      "erd_p2p_num_receiver_peers_slow_reacting": 13,
      "erd_p2p_peak_num_receiver_peers_fast_reacting": 8,
      "erd_p2p_peak_num_receiver_peers_out_of_specs": 8,
      "erd_p2p_peak_num_receiver_peers_slow_reacting": 13,
      "erd_p2p_peak_peer_num_processed_messages_fast_reacting": 3,
      "erd_p2p_peak_peer_num_processed_messages_out_of_specs": 3,
      "erd_p2p_peak_peer_num_processed_messages_slow_reacting": 8,
      "erd_p2p_peak_peer_num_received_messages_fast_reacting": 3,
      "erd_p2p_peak_peer_num_received_messages_out_of_specs": 3,
      "erd_p2p_peak_peer_num_received_messages_slow_reacting": 8,
      "erd_p2p_peak_peer_size_processed_messages_fast_reacting": 1291,
      "erd_p2p_peak_peer_size_processed_messages_out_of_specs": 1291,
      "erd_p2p_peak_peer_size_processed_messages_slow_reacting": 4363,
      "erd_p2p_peak_peer_size_received_messages_fast_reacting": 1291,
      "erd_p2p_peak_peer_size_received_messages_out_of_specs": 1291,
      "erd_p2p_peak_peer_size_received_messages_slow_reacting": 4363,
      "erd_p2p_peer_info": "...",
      "erd_p2p_peer_num_processed_messages_fast_reacting": 1,
      "erd_p2p_peer_num_processed_messages_out_of_specs": 1,
      "erd_p2p_peer_num_processed_messages_slow_reacting": 5,
      "erd_p2p_peer_num_received_messages_fast_reacting": 1,
      "erd_p2p_peer_num_received_messages_out_of_specs": 1,
      "erd_p2p_peer_num_received_messages_slow_reacting": 5,
      "erd_p2p_peer_size_processed_messages_fast_reacting": 289,
      "erd_p2p_peer_size_processed_messages_out_of_specs": 289,
      "erd_p2p_peer_size_processed_messages_slow_reacting": 2711,
      "erd_p2p_peer_size_received_messages_fast_reacting": 289,
      "erd_p2p_peer_size_received_messages_out_of_specs": 289,
      "erd_p2p_peer_size_received_messages_slow_reacting": 2711,
      "erd_p2p_unknown_shard_peers": "..."
    }
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

:::important
This endpoint is not available on the Proxy. Only Nodes (Observers) expose this endpoint.
:::

[comment]: # (mx-context-auto)

## <span class="badge badge--primary">GET</span> **Get Peer Information** {#get-peer-information}

`http://localhost:8080/node/peerinfo`

This endpoint allows one to query specific information about its peers.

<Tabs
defaultValue="Response"
values={[
{label: 'Response', value: 'Response'}
]}>
<TabItem value="Response">

🟢 200: OK

Peer info retrieved successfully.

```json
{
  "data": {
    "info": [
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "",
        "peertype": "observer",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21100",
          "/ip4/127.0.0.1/tcp/21100",
          "/ip4/192.168.2.104/tcp/21100",
          "/ip4/172.17.0.1/tcp/21100"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "",
        "peertype": "unknown",
        "addresses": [
          "/ip4/127.0.0.1/tcp/9999",
          "/ip4/127.0.0.1/tcp/9999",
          "/ip4/192.168.2.104/tcp/9999",
          "/ip4/172.17.0.1/tcp/9999"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/192.168.2.104/tcp/21504",
          "/ip4/192.168.2.104/tcp/21504",
          "/ip4/172.17.0.1/tcp/21504",
          "/ip4/127.0.0.1/tcp/21504"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21503",
          "/ip4/172.17.0.1/tcp/21503",
          "/ip4/127.0.0.1/tcp/21503",
          "/ip4/192.168.2.104/tcp/21503"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21502",
          "/ip4/127.0.0.1/tcp/21502",
          "/ip4/192.168.2.104/tcp/21502",
          "/ip4/172.17.0.1/tcp/21502"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/127.0.0.1/tcp/21507",
          "/ip4/127.0.0.1/tcp/21507",
          "/ip4/192.168.2.104/tcp/21507",
          "/ip4/172.17.0.1/tcp/21507"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21501",
          "/ip4/192.168.2.104/tcp/21501",
          "/ip4/172.17.0.1/tcp/21501",
          "/ip4/127.0.0.1/tcp/21501"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21508",
          "/ip4/127.0.0.1/tcp/21508",
          "/ip4/192.168.2.104/tcp/21508",
          "/ip4/172.17.0.1/tcp/21508"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21506",
          "/ip4/127.0.0.1/tcp/21506",
          "/ip4/192.168.2.104/tcp/21506",
          "/ip4/172.17.0.1/tcp/21506"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "",
        "peertype": "observer",
        "addresses": [
          "/ip4/127.0.0.1/tcp/38188",
          "/ip4/192.168.2.104/tcp/38188",
          "/ip4/172.17.0.1/tcp/38188"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21505",
          "/ip4/127.0.0.1/tcp/21505",
          "/ip4/192.168.2.104/tcp/21505",
          "/ip4/172.17.0.1/tcp/21505"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "",
        "peertype": "observer",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21102",
          "/ip4/127.0.0.1/tcp/21102",
          "/ip4/192.168.2.104/tcp/21102",
          "/ip4/172.17.0.1/tcp/21102"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "...",
        "peertype": "validator",
        "addresses": [
          "/ip4/172.17.0.1/tcp/21500",
          "/ip4/127.0.0.1/tcp/21500",
          "/ip4/192.168.2.104/tcp/21500",
          "/ip4/172.17.0.1/tcp/21500"
        ]
      },
      {
        "isblacklisted": false,
        "pid": "...",
        "pk": "",
        "peertype": "observer",
        "addresses": [
          "/ip4/192.168.2.104/tcp/21101",
          "/ip4/192.168.2.104/tcp/21101",
          "/ip4/172.17.0.1/tcp/21101",
          "/ip4/127.0.0.1/tcp/21101"
        ]
      }
    ]
  },
  "error": "",
  "code": "successful"
}
```

</TabItem>
</Tabs>

:::important
This endpoint is not available on the Proxy. Only Nodes (Observers) expose this endpoint.
:::
