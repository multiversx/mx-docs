---
id: node-databases
title: Node Databases
---

## **Node databases**

Nodes use Serial LevelDB databases to persist processed blocks, transactions, and so on.
The data can be removed or not, depending on the pruning flags that can be enabled or not in `config.toml`.
By default, validators only keep the last 4 epochs and delete older ones for freeing disk space.

The default databases directory is `<node-working-directory>/db` and it's content should match the following structure:
```
/db
└── <chain id>
    ├── Epoch_X
    │  └── Shard_X
    │        ├── BlockHeaders
    │        │    ├── 000001.log
    │        │    ├── CURRENT
    │        │    ├── LOCK
    │        │    ├── LOG
    │        │    └── MANIFEST-000000
    │        ├── BootstrapData
    │        │    ├── 000001.log
    |     .............
    └── Static
        └── Shard_X
            ├── AccountsTrie
            │     └── MainDB
            │           ├── 000001.log
         .............
```


When starting a node, if databases exist, it will try to start with the state fetched from the storage. If it does not match
the current network height, it will sync the rest of the data from the network, until fully synced.

## **Starting a node with existent databases**

There are use-cases when a node can receive the entire database from other node that is fully synced in order to speed up the process.
In order to perform this, one has to copy the entire database directory to the new node. This is as simple as copying the `db/`
directory from one node to the other one.

The configuration files must be the same as the old node, except the BLS key which is independent of databases.

Two nodes in the same shard generate the same databases. These databases are interchangeable between them. However, starting
a node as observer and setting the `--destination-shard-as-observer` so it will join a pre-set shard, requires that it's database
is from the same shard. So starting an observer in shard 1 with a database of a shard 0 node will result in ignoring the database
and network-only data fetch.

If the configuration and the database's shard are the same, then the node should have the full state from the database and 
start to sync with the network only remaining items. If, for instance, a node starts with a database of 255 epochs, and the current epoch is 
256, then it will only sync from network the data from the missing epoch.

