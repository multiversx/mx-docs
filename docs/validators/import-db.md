---
id: import-db
title: Import DB
---

## Introduction
The node is able to reprocess a previously produced database by providing the database and starting 
the node with the import-db related flags explained in the section below. <br>
Possible use cases for the import-db process:
- index in ElasticSearch (or something similar) all the data from genesis to present time;
- validate the blockchain state;
- make sure there aren't backwards compatibility issues with a new software version;
- check the blockchain state at a specified time (this includes additional code changes, but for example if you are 
  interested in the result of an API endpoint at the block 255255, you could use import db and force the node to stop 
  at the block corresponding to that date).
  
## How to start the process
Let's suppose we have the following data structure:
```
  ~/elrond-go/cmd/node
```

the `node` binary is found in the above-mentioned path.
Now, we have a previously constructed database (from an observer that synced with the chain from the 
genesis and never switched the shards). This database will be placed in a directory, let's presume
we will place it near the node's binary, yielding a data structure as follows:

```
.
├── config
│    ├── api.toml
│    ├── config.toml
│    ...
├── import-db
│    └── db
│        └── 1
│            ├── Epoch_0
│            │     └── Shard_1
│            │         ├── BlockHeaders
│            │         │   ...
│            │         ├── BootstrapData
│            │         │   ...
│            │         ...
│            └── Static
│                  └── Shard_1
│                      ...
├── node
```

It is very important that the directory called `db` is a subdirectory (in our case of the `import-db`).
Also, please check that the `config` directory matches the one of the node that produced the `db` data 
structure, including the `prefs.toml` file. <br>

:::warning
Please make sure the `/elrond-go/cmd/node/db` directory is empty so the import-db process will start 
from the genesis up until the last epoch provided.
:::

Next, the node can be started by using:

```
 cd ~/elrond-go/cmd/node
 ./node -use-log-view -log-level *:INFO -import-db ./import-db 
```

:::note
Please note that the `-import-db` flag specifies the path to the directory containing the source db directory. The value provided in the example above assumes that the import db directory is called `import-db` and is located near the `node` executable file.
:::


The node will start the reprocessing of the provided database. It will end with a message like:
```
import ended because data from epochs [x] or [y] does not exist
```

:::tip
The import-db process can be sped up by skipping the block header's signature check if the import-db data comes from a trustworthy source.
In this case the node should be started with all previously mentioned flags, adding the `-import-db-no-sig-check` flag.
:::

## Import-DB with populating an Elasticsearch cluster

One of the use-cases for utilizing the `import-db` mechanism is to populate an Elasticsearch cluster with data that is 
re-processed with the help of this process. 

:::tip
Import-DB for populating an Elasticsearch cluster should be used only for a full setup (a node in each Shard + a Metachain node)
:::

The preparation implies the update of the `external.toml` file for each node. More details can be found [here](/sdk-and-tools/elastic-search/#setup).

If everything is configured correctly, nodes will push the re-processed data into the Elasticsearch cluster.
