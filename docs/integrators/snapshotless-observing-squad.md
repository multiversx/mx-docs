---
id: snapshotless-observing-squad
title: Snapshotless Observing Squad
---

[comment]: # (mx-abstract)

This page describes the Snapshotless Observing Squad, a type of Observing Squad optimized for real-time requests such as accounts data fetching and vm-query operations.

[comment]: # (mx-context-auto)

## Overview

Whenever a node is executing the trie snapshotting process, the accounts data fetching & vm-query operations are greatly affected.
This is caused by the fact that the snapshotting operation consumes a large number of CPU cycles along with disk iops.
The nodes started with the flag `--operation-mode snapshotless-observer` will not create trie snapshots on every epoch and will 
also prune the trie storage in order to save space. 

## Setup

### Creating a snapshotless observing squad from scratch

If you choose to install a snapshotless observing squad from 0, you should follow the instruction from the
[observing squad section](/integrators/observing-squad) and, when you will start configuring the `variables.cfg` file,
remember to add the operation mode in the node's extra flags definition:
```
NODE_EXTRA_FLAGS="-log-save -operation-mode snapshotless-observer"
```

After that, wou can resume following the normal observer squad installation steps.

### Converting a normal observing squad to a snapshotless observing squad

If you already have an observing squad, and you want to transform it into a snapshotless observing squad, the
easiest way is to manually edit the service file `/etc/systemd/system/elrond-node-x.service` (with `sudo`) and
append the `-operation-mode snapshotless-observer` flag at the end of the `ExecStart=` line.
In the end, the file should look like:
```
[Unit]
  Description=MultiversX Node-0
  After=network-online.target

  [Service]
  User=jls
  WorkingDirectory=/home/ubuntu/elrond-nodes/node-0
  ExecStart=/home/ubuntu/elrond-nodes/node-0/node -use-log-view -log-logger-name -log-correlation -log-level *:DEBUG -rest-api-interface :8080 -log-save -profile-mode -operation-mode snapshotless-observer
  StandardOutput=journal
  StandardError=journal
  Restart=always
  RestartSec=3
  LimitNOFILE=4096

  [Install]
  WantedBy=multi-user.target
```

Save the file, and force a reload units with the command
```bash
sudo systemctl daemon-reload
```

After units reload, you can stop the nodes and start them.

:::caution
Even if the nodes are synced, after changing the operation mode, they will start re-sync their state in 
"snapshotless" format.
:::

