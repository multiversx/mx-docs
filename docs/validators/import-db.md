---
id: import-db
title: Import DB
---

The node is able to reprocess a previously produced database by providing the database and starting 
the node with several flags explained in the section below. <br>
Let's suppose we have the following data structure:
```
  ~/elrond-go/cmd/node
```

the `node` binary and the `arwen` binary are found in the above mentioned path.
Now, we have a previously constructed database (from an observer that synced with the chain from the 
genesis and never switched the shards). This database will be placed in a directory, let's presume
we will place it near the node's binary, yielding a data structure as follows:

```
  ~/elrond-go/cmd/node/import-db/db/1/Epoch_0/....
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

The node will start the reprocessing of the provided database. It will end with a message like:
```
import ended because data from epochs [x] or [y] does not exist
```

:::tip
The import-db process can be sped up by skipping the block header's signature check if the import-db data comes from a trustworthy source.
In this case the node should be started with all previously mentioned flags, adding the `-import-db-no-sig-check` flag.
:::
