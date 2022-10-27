---
id: node-operation-modes
title: Node operation modes
---

## Introduction

Starting with `v1.4.x` release, a new CLI flag has been introduced to the node. It is `--operation-mode` and its purpose 
is to override some configuration values that will allow the node to act differently, depending on the use-case.

## List of available operation modes

Below you can find a list of operation modes that are supported:

### Full archive

Usage:
```
./node --operation-mode full-archive
```

The `full-archive` operation mode will change the node's configuration in order to make it able to sync from genesis and also
be able to serve historical requests. 
Syncing a node from genesis might take some time since there aren't that many full archive peers to sync from. 

### Db Lookup Extension

Usage:
```
./node --operation-mode db-lookup-extension
```

The `db-lookup-extension` operation mode will change the node's configuration in order to support extended databases that are 
able to store more data that is to be used in further Rest API requests, such as logs, links between blocks and epoch, and so on.

For example, the proxy's `hyperblock` endpoint relies on the fact that its observers have this setting enabled. Other examples 
are `/network/esdt/supply/:tokenID` or `/transaction/:txhash?withResults=true`. 

### Historical balances

Usage:
```
./node --operation-mode historical-balances
```

The `historical-balances` operation mode will change the node's configuration in order to support historical balances queries. 
By setting this mode, the node won't perform the usual trie pruning, resulting in a more disk usage, but also in 
the ability to query the balance or the nonce of an address at blocks that were proposed long time ago. 

### Lite observers

Usage:
```
./node --operation-mode lite-observer
```

The `lite-observer` operation mode will change the node's configuration in order to make it efficient for real-time requests 
by disabling the trie snapshotting mechanism and making sure that older data is removed. 

A use-case for such an observer would be serving live balances requests, or broadcasting transactions, eliminating the costly operations 
of the trie snapshotting.
