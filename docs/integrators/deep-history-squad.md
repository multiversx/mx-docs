---
id: deep-history-squad
title: Deep History Squad
---

[comment]: # (mx-abstract)

This page describes the Deep History Squad, which holds the entire trie data, so it can be used to query the state of an account at any point in time.

[comment]: # (mx-context-auto)

## General information

A variant of the standard [**observing squad**](/integrators/observing-squad) is one that retains a non-pruned history of the blockchain and allows one to query the state of an account at an arbitrary block in the past. Such a setup is called a [**deep-history observing squad**](https://github.com/multiversx/mx-chain-deep-history).

:::tip
The standard observing squad is sufficient for most use-cases. It is able to resolve past blocks, miniblocks, transactions, transaction events etc. Most often, you do not need a deep-history squad, but a [**regular observing squad**](/integrators/observing-squad), instead.
:::

A deep-history setup is able to resolve historical account (state) queries, that is, to answer questions such as:

> What was Alice's balance on [May the 4th](https://explorer.multiversx.com/blocks/5f6a02d6a5d2a851fd6dc1fb53435083830c2a13121e003958d97c2389711f06)?

```bash
GET http://squad:8080/address/erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th?blockNonce=9250000
```

:::tip
The API client has to perform the conversion from _desired timestamp_ to _block nonce_. Timestamp-based queries aren't directly supported yet.
:::

> How much UTK were in the [`UTK / WEGLD` Liquidity Pool](https://explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga) on [1st of October](https://explorer.multiversx.com/blocks/cefd41e1e9bbe3ba023a695f412b99cecb15ef789475648ee7c31e7d9fef31d1)?

```markup
GET http://squad:8080/address/erd1qqqqqqqqqqqqqpgq0lzzvt2faev4upyf586tg38s84d7zsaj2jpsglugga/key/726573657276650000000a55544b2d326638306539?blockNonce=11410000
```

In the example above, the key `726573657276650000000a55544b2d326638306539` is decoded as `reserve\x00\x00\x00\nUTK-2f80e9`.

[comment]: # (mx-context-auto)

### Historical VM queries

Starting with the [Sirius Patch 5](https://github.com/multiversx/mx-chain-mainnet-config/releases/tag/v1.6.18.0), deep-history observers can resolve historical VM queries. Such a query specifies the `blockNonce` parameter:

```
POST http://localhost:8080/vm-values/query?blockNonce={...} HTTP/1.1
Content-Type: application/json

{
  "scAddress": "...",
  "funcName": "...",
  "args": [ ... ]
}
```

[comment]: # (mx-context-auto)

### MultiversX squad

The observing squads backing the public Gateways, in addition to being full history squads (serving past blocks, transactions and events up until the Genesis), also act as 3-epochs deep-history squads. That is, for **mainnet**, one can use https://gateway.multiversx.com to resolve historical account (state) queries, for the last 3 days. This interval is driven by the configuration parameter `[StoragePruning.NumEpochsToKeep]`, which is set to `4`, by default.

In general:

```
...                                  deep history not available
CurrentEpoch - NumEpochsToKeep - 1:  deep history not available
CurrentEpoch - NumEpochsToKeep:      deep history not available
CurrentEpoch - NumEpochsToKeep + 1:  deep history parially available
CurrentEpoch - NumEpochsToKeep + 2:  deep history available
CurrentEpoch - NumEpochsToKeep + 3:  deep history available 
...                                  deep history available
CurrentEpoch:                        deep history available
```

In particular, for the public Gateway:

```
...                 deep history not available
CurrentEpoch - 5:   deep history not available
CurrentEpoch - 4    deep history not available
CurrentEpoch - 3:   deep history parially available
CurrentEpoch - 2:   deep history available
CurrentEpoch - 1:   deep history available
CurrentEpoch:       deep history available
```

[comment]: # (mx-context-auto)

### On-premises squad

Deep-history squads can be set up on-premises, just as regular observing squads. However, the storage requirements is significantly higher. For example, a deep-history squad for **mainnet**, configured for the interval July 2020 (Genesis) - January 2024 (Sirius), requires about 7.5 TB of storage:

```
307G    ./node-metachain
1.4T    ./node-0
3.9T    ./node-1
2.0T    ./node-2
```

Since each observer of a deep-history squad must have a non-pruned history, their (non-ordinary) databases have to be either **downloaded** or **reconstructed**, in advance (covered later, in detail).

[comment]: # (mx-context-auto)

## Observer installation and configuration

The installation of a deep history squad is the same as that of a [regular observing squad](/integrators/observing-squad).
The difference is that the deep history observers are set up to retain the whole, non-pruned history of the blockchain. Therefore, the following flag must be added in the `config/variables.cfg` file before installation:
```bash
NODE_EXTRA_FLAGS="--operation-mode=historical-balances"
```
:::tip
Apart from the flag mentioned above, the setup of a deep-history observer is identical to a regular full-history observer.
:::

:::warning
Never attach a non-pruned database to a regular observer (i.e. that does not have the above **operation-mode**) - unless you are not interested into the deep-history features. The regular observer irremediably removes, trucates and prunes the data (as configured, for storage efficiency).
:::

Now that we have finished with the installation part, we can proceed to populate the archive with a non-pruned database. There are two options here:
- Download non-pruned database
- Reconstruct non-pruned database

[comment]: # (mx-context-auto)

## Downloading non-pruned database

Archives supporting historical lookup are available to download from a Google Cloud Storage [bucket](https://console.cloud.google.com/storage/browser/multiversx-deep-history-archives-mainnet).

In order to avoid unintentional downloads and promote careful fetching of archives, we've enabled the [requester pays](https://cloud.google.com/storage/docs/requester-pays) feature on the bucket that holds the deep-history archives for mainnet.

### Requirements

1. **Google Cloud Platform Account**: An account on Google Cloud Platform with billing enabled is required. Find out how you can manage your billing account and modify your project here:
- https://cloud.google.com/billing/docs/how-to/manage-billing-account
- https://cloud.google.com/billing/docs/how-to/modify-project

2. **Google Cloud SDK**: The Google Cloud SDK includes the `gcloud` command-line tool, which you'll use to interact with Google Cloud Storage. In order to install it, please follow the instructions provided on the [Google Cloud SDK webpage](https://cloud.google.com/sdk/docs/install).

### Downloading archives

Once you have the Google Cloud SDK installed and you're [authenticated](https://cloud.google.com/docs/authentication/gcloud), you can download archives from the Google Cloud Storage bucket using the `gcloud storage cp` command.

Here's an example command that downloads an archive from the `multiversx-deep-history-archives-mainnet` bucket:
```
gcloud storage cp gs://multiversx-deep-history-archives-mainnet/shard-0/Epoch_01200.tar ~/DOWNLOAD_LOCATION --billing-project=BILLING_PROJECT
```
Replace **BILLING_PROJECT** with the name of your billing project and **~/DOWNLOAD_LOCATION** with the directory where the archives should be downloaded.

The following example will download epochs starting with Epoch_01000.tar up to Epoch_01300.tar, for a billing project called **multiversx**:
```
gcloud storage cp gs://multiversx-deep-history-archives-mainnet/shard-0/Epoch_0{1000..1300}.tar ~/Downloads/ --billing-project=multiversx
```

[comment]: # (mx-context-auto)

## Reconstructing non-pruned databases

An alternative to downloading the non-pruned history is to reconstruct it locally (on your own infrastructure). 

There are also two options for reconstructiong a non-pruned database:
- Based on the **[import-db](/validators/import-db/)** feature, which re-processes past blocks - and, while doing so, retains the whole, non-pruned accounts history.
- By performing a regular sync from the network (e.g. from Genesis), using a properly configured deep-history observer.

:::note
The reconstruction flow has to be performed **for each shard, separately**.
:::

### Reconstructing using import-db

First, you need to decide whether to reconstruct a **complete** or a **partial** history. A _complete_ history provides the deep-history squad the ability to resolve historical account (state) queries **up until the Genesis**. A _partial_ history, instead, allows it to resolve state queries up until **a chosen past epoch** or **between two chosen epochs**.

[comment]: # (mx-context-auto)

#### Reconstruct a complete history

:::note
Below, the reconstruction is exemplified for **mainnet, shard 0**. The same applies to other networks (devnet, testnet) and shards (including the metachain). When reconstructing the history, use the latest release available.
:::


Next, we neet to obtain (download) and extract **a recent daily archive (snapshot)** for the shard in question (e.g. shard 0). The daily archives are available to download **on request** ([Discord](https://discord.gg/multiversxbuilders) or [Telegram](https://t.me/MultiversXValidators)), from a cloud-based, _S3-compatible storage_ (Digital Ocean Spaces) - or you could fetch them from an existing regular full-history observer that you own. 

Upon extracting the downloaded archive, you'll have a new folder in your workspace: `db`, which contains the blockchain data for the shard in question. This data should be moved to a new folder, named `import-db`. All in all, the steps are as follows:

```
# Ask for the full download link on Discord or Telegram:
wget https://.../23-Jan-2024/Full-History-DB-Shard-0.tar.gz
# This produces a new folder: "db"
tar -xf Full-History-DB-Shard-0.tar.gz

# "import-db" should contain the whole blockchain to be re-processed
mkdir -p ./import-db && mv db ./import-db
# "db" will contain the reconstructed database (empty at first)
mkdir -p ./db
```

:::note
Downloading the archives and extracting them might take a while.
:::

The reconstruction workspace should look as follows (irrelevant files omitted):

```
.
├── config                        # network configuration files
│    ├── api.toml
│    ├── config.toml
│    ...
├── db                            # empty     
├── import-db
│    └── db                       # blockchain data
│        └── 1
│            │          ...
│            ├── Epoch_1270
│            │     └── Shard_0
│            ├── Epoch_1271
│            │     └── Shard_0       
│            ├── Epoch_1272
│            │     └── Shard_0
│            └── Static
│                  └── Shard_0                                
├── node                           # binary file, the Node itself
```

We are ready to start the reconstruction process :rocket:

```
./node --import-db=./import-db --operation-mode=historical-balances --import-db-no-sig-check --log-level=*:INFO --log-save --destination-shard-as-observer 0
```

:::note
The reconstruction (which uses _import-db_ under the hood, as previously stated) takes a long time (e.g. days) - depending on the machine's resources (CPU, storage capabilities and memory).
:::

Once the **import-db** is over, the `db` folder contains the reconstructed database for the shard in question, ready to support historical account (state) queries.

Now, do the same for the other shards, as needed.

:::tip
You can smoke test the data by launching an (in-place) ephemeral observer:

```
./node --operation-mode=historical-balances --log-save --destination-shard-as-observer 0
```

Then, in another terminal, do a historical (state) query against the ephemeral observer:

```
curl http://localhost:8080/address/erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx?blockNonce=42 | jq
```
:::

[comment]: # (mx-context-auto)

#### Reconstruct a partial history

:::tip
Make sure to read the section [**Reconstruct a complete history**](#reconstruct-a-complete-history) first, to understand the basics.
:::

Instead of reconstructing the whole history since Genesis, you may want to reconstruct a partial history, starting from a chosen epoch up until the latest epoch, or a history between two chosen epochs.

Below, we'll take the example of reconstructing the history for epochs `1255 - 1260` (inclusive), for **mainnet, shard 0**. 

Since we'd like to stop upon reconstruction of epoch `1260` (our example), we enable need to enable the `BlockProcessingCutoff` feature in `config/prefs.toml`:

```
[BlockProcessingCutoff]
   Enabled = true
   Mode = "pause"
   CutoffTrigger = "epoch"
   # The chosen end epoch, plus 1.
   Value = 1261
```

Now, get (download) and extract **two daily archives (snapshots)** for the shard in question (e.g. shard 0): one archive that was created on the epoch preceding the **chosen start epoch** (e.g. the archive created during epoch `1255 - 1 = 1254`); and one archive that was created on the epoch following the **chosen end epoch** (e.g. the archive created during epoch `1260 + 1 = 1261`). You can compute the correct URLs for the two archives manually, given the [**mainnet** Genesis time](https://gateway.multiversx.com/network/config) and the chosen epochs, or you can use the following Python snippet:

```
import datetime

# Available on request (Discord or Telegram)
url_base = "https://..."
shard = 0
chosen_start_epoch = 1255
chosen_end_epoch = 1260
genesis_timestamp = 1596117600

genesis_datetime = datetime.datetime.fromtimestamp(genesis_timestamp, tz=datetime.timezone.utc)
first_archive_day = (genesis_datetime + datetime.timedelta(days=chosen_start_epoch - 1)).strftime("%d-%b-%Y")
second_archive_day = (genesis_datetime + datetime.timedelta(days=chosen_end_epoch + 1)).strftime("%d-%b-%Y")

print("First daily archive:", f"{url_base}/{first_archive_day}/Full-History-DB-Shard-{shard}.tar.gz")
print("Second daily archive:", f"{url_base}/{second_archive_day}/Full-History-DB-Shard-{shard}.tar.gz")
```

The first archive should be used as `db` and the second archive should be used as `import-db/db`.

```
# Download & extract first archive to "db":
wget https://.../05-Jan-2024/Full-History-DB-Shard-0.tar.gz
tar -xf Full-History-DB-Shard-0.tar.gz

# Download & extract second archive to "import-db/db":
wget https://.../12-Jan-2024/Full-History-DB-Shard-0.tar.gz
mkdir -p ./import-db
tar -xf Full-History-DB-Shard-0.tar.gz --directory ./import-db
```

The reconstruction workspace should look as follows (irrelevant files omitted):

```
.
├── config                                    # network configuration files
│    ├── api.toml
│    ├── config.toml
│    ...
├── db                                        # blockchain data (second archive)
│   └── 1
│       │           ...
│       ├── Epoch_1252
│       │     └── Shard_0
│       ├── Epoch_1253
│       │     └── Shard_0       
│       ├── Epoch_1254
│       │     └── Shard_0 
│       └── Static
│             └── Shard_0                 
├── import-db
│    └── db                                   # blockchain data (first archive)
│        └── 1
│            │          ...
│            ├── Epoch_1259
│            │     └── Shard_0
│            ├── Epoch_1260
│            │     └── Shard_0       
│            ├── Epoch_1261
│            │     └── Shard_0
│            └── Static
│                  └── Shard_0                                
├── node                                      # binary file, the Node itself
```

We are now ready to start the reconstruction process :rocket:

```
./node --import-db=./import-db --operation-mode=historical-balances --import-db-no-sig-check --log-level=*:INFO --log-save --destination-shard-as-observer 0
```

Once the **import-db** is over, the `db` folder will contain the archive for the deep-history observer to support historical account (state) queries for the epochs `1255 - 1260`.

:::warning
Make sure to set the **BlockProcessingCutoff** back to false before starting an observer intended to continue processing blocks past the cutoff.
```
[BlockProcessingCutoff]
   Enabled = false
```
:::

### Reconstructing by performing a regular sync

This is  the simpler approach (even if it takes a bit more time, depending on the availability of peers, plus the network traffic).

Basically, if the required [node flag configuration](#observer-installation-and-configuration) was set at installation, all that's left to be done is to start the node and it will begin building the database by synchronizing from the network since Genesis.

On the other hand, if the observer only needs to support historical account (state) queries starting from a specific past epoch, we again need to download a daily archive (snapshot) for the start epoch in question and extract it in the **db** folder, then proceed to start the node and it will begin building the database by synchronizing from the network starting with the last block available in the **db** folder.

[comment]: # (mx-context-auto)

## Starting a squad

Suppose you have prepared the data for a deep-history squad beforehand, whether by downloading it or by reconstructing it locally. Then, the deep-history data root folder should look as follows:

```
.
├── node-0
│   └── db
├── node-1
│   └── db
├── node-2
│   └── db
└── node-metachain
    └── db

```

The squad and the proxy can be started using the command: 

```bash
~/mx-chain-scripts/script.sh start
```

Alternatively, you can set up a squad using any other known approach, **but make sure to apply the proper `operation-mode`** described in the section [**Observer installation and configuration**](#observer-installation-and-configuration).

**Congratulations!** You've set up a deep-history observing squad; the gateway should be ready to resolve historical account (state) queries :rocket:

