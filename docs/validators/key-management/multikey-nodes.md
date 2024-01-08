---
id: multikey-nodes
title: Multikey nodes management
---

[comment]: # (mx-abstract)
This page contains information about how to manage multiple keys on a group of nodes.

[comment]: # (mx-context-auto)

## Multikey architecture overview

Since the mainnet launch, and up until the release candidate RC/v1.6.0, each node could have managed only
one key. So the relationship between the nodes and staked validator keys is `1:1`, the node "following" the shard where 
the managed key is assigned.
The multikey feature allows a node instance to hold more than one key. However, since MultiversX is a sharded blockchain 
and a single node is only able to store the state of a single shard at a time, we need a group of nodes with exactly
one node in each shard, similar with what we have on observing squad. Also, in each epoch, the keys can be shuffled among shards. 
This means that running multiple keys will require at least the number of shards + 1 node instances (one for each shard + metachain).
The same set of keys should be provided for all node instances. 

This type of nodes used in multikey operation can be assimilated as a hybrid between an observer node and a validator. 
It behaves as an observer by holding in the `validatorKey.pem` file a BLS key that will never be part of the consensus 
group and the shard should be specified in the `prefs.toml` file, so the node will not change shards. 
The node behaves also as a validator (or multiple validators) by monitoring and emitting consensus messages, 
whenever required on the behalf of the managed keys set.

Since an observer already performs block validation in its own shard, it can be easily used to manage a group of validator 
keys and propose or validate blocks on behalf of the keys it possesses.
To summarize, this type of node can use any provided keys, in any combination, to generate consensus messages provided 
that those used keys are part of the consensus group in the current round. With the multikey feature, the relationship 
now becomes `n:m`, providing that `n` is the number of keys managed by an entity and `m` is the number of shards + 1.

:::important
This feature is purely optional. Normal `1:1` relationship between the keys and the nodes is still supported. The multikey
mode should optimize the costs when running a set of keys (check [Economics running multikey nodes](#economics-running-multikey-nodes) section)
:::

The following image describes the keys and nodes relationship between the single operation mode versus multikey operation mode.
<!--- check /static/validators/multikey-diagram.drawio for the source file --->
![img](/validators/multikey-diagram.drawio.png) 

[comment]: # (mx-context-auto)

## General implementation details

The nodes running with the multikey feature, beside deciding the consensus group (which is normally done on each node), 
can access the provided keys set and use, in any combination, one or more keys, if the node detects that at least one managed
key is part of the consensus group.
The code changes to support multikey nodes affected mainly the `consensus`, `keyManagement` and `heartbeat` packages.

[comment]: # (mx-context-auto)

### Heartbeat information

The group managing the set of keys (we will call them multikey nodes or multikey group), will pass the validators BLS 
information tight to "virtual" peer IDs. A "virtual peer ID" is a generated p2p identity that the p2p network can not 
connect to as it does not have a real address bind to. Consequentially, this feature brings a new layer of security as 
the multikey nodes will hide the relationship between the validator BLS keys and the host that manages those BLS keys.

[comment]: # (mx-context-auto)

### Redundancy

The redundancy sub-system has been upgraded to accommodate the multikey requirements keeping the multiple redundancy 
fallback groups operation. A fallback multikey group will monitor each managed key for missed consensus activity **independent on 
each managed node**. So, a bad configured main group, offline or stuck main group nodes should trigger fallback events on 
the redundancy group. 
Example: if main multikey group was set to manage the following key set `[key_0, key_1 ... key_e-1, key_e+1 ... key_n]`
(mind the missing `key_e`) and the redundancy fallback multikey group has the set `[key_0, key_1 ... key_e-1, key_e, key_e+1 ... key_n]`,
then, the fallback group, after `k` misses in the consensus activity (propose/sign block) will start using that `key_e` as it 
was the only key assigned to the multikey group (`k` is the value defined in the `prefs.toml` file, `RedundancyLevel` option).

[comment]: # (mx-context-auto)

## Economics running multikey nodes

As for `n` managed keys we will need at least a group of nodes, there is a threshold that a staking operator
will want to consider when deciding to switch the operation towards the multikey mode. The switch becomes attractive for the
operator when the number of managed keys is greater than the number of shards. So, for the time being, when we have 
at least 5 keys that are either *eligible* or *waiting*, the switch to multikey mode becomes feasible.

:::caution
Although there are no hard limits in the source code to impose a maximum number of keys for a multikey group, the MultiversX team 
strongly recommends the node operators to not use more than 50 keys per group. The reason behind this recommendation is that a single node
controlling enough keys could cause damage to the chain as, in extreme cases, it could propose consecutive bad blocks, disrupting the
possibility of blocks synchronization or blocks cross-notarization. 
:::


[comment]: # (mx-context-auto)

## Usage

[comment]: # (mx-context-auto)

### allValidatorsKeys.pem file
The switch towards the multikey operation will only require aggregating all BLS keys in a new file, called `allValidatorsKeys.pem`
that will be loaded by default from the same directory where the `validatorKey.pem` file resides. The path can be altered by using the
binary flag called `--all-validator-keys-pem-file`.
Example of an `allValidatorsKeys.pem` file:
```
-----BEGIN PRIVATE KEY for e296e97524483e6b59bce00cb7a69ec8c0d1ac4227925f07fdd57b3ab4ec2f64b240728a0a3c5be2930aea570bf12c12314e25d942b106472800e51524add26ec9546475c1cfae91dd7e799f256d1b0758e17aaa3898c29d489bd87c86d04498-----
YzJlODM0NTdmOTVmYMDVjZGRiNzdiODc1N2YyZGEx
ZGRhYWY5MTI5Y2NlOWQyOQ==
-----END PRIVATE KEY for e296e97524483e6b59bce00cb7a69ec8c0d1ac4227925f07fdd57b3ab4ec2f64b240728a0a3c5be2930aea570bf12c12314e25d942b106472800e51524add26ec9546475c1cfae91dd7e799f256d1b0758e17aaa3898c29d489bd87c86d04498-----
-----BEGIN PRIVATE KEY for 5585ddceb6b7bf0d308162efd895d0717b22bab6b0412f09fb9cee234be73d197bfef8ae10064be5733472c573894015029672b70f63e0b58c7ab2e831ee0aff88b868e4d712bec0baf9a1cd1982e138af9b6cc55e4454b01cb8ad02a064f515-----
MzNlZjQyYTRhZDc3ZDBkZDk1M2JmNGIwNWE2MzczMmYxZWUy
ZWVkNzNiOGQ1ZDQ0NmEzMg==
-----END PRIVATE KEY for 5585ddceb6b7bf0d308162efd895d0717b22bab6b0412f09fb9cee234be73d197bfef8ae10064be5733472c573894015029672b70f63e0b58c7ab2e831ee0aff88b868e4d712bec0baf9a1cd1982e138af9b6cc55e4454b01cb8ad02a064f515-----
-----BEGIN PRIVATE KEY for 791c7e2bd6a5fb1371af18269267ad8ef9e56e264c4c95703c57526b16b84dd8df6347c0cc14f93d595a12316d38ae11264e05d2fa26d80387d12db52c1a98e93064d073d02549c71ec4e352d73724c21c02245b25d3643b532fac25d7580f0b-----
OTcxYjYyNWMzMzlkY2JhNTAyODMwNzZlYjMyY2MxMmYzNThiMjNiNzYz
NTA4YjFjMTVlYTIwNDYyMw==
-----END PRIVATE KEY for 791c7e2bd6a5fb1371af18269267ad8ef9e56e264c4c95703c57526b16b84dd8df6347c0cc14f93d595a12316d38ae11264e05d2fa26d80387d12db52c1a98e93064d073d02549c71ec4e352d73724c21c02245b25d3643b532fac25d7580f0b-----
```

[comment]: # (mx-context-auto)

### prefs.toml file

The existing fields `NodeDisplayName` and `Identity` will be applied to all managed and loaded BLS keys. The `NodeDisplayName` will 
be suffixed with an order index for all managed keys. 
For example, suppose we have the above example of the `allValidatorsKeys.pem` file and the `NodeDisplayName` is set to `example`.
The name for the managed keys will be:
```
example-0 e296e97524483e6b59...
example-1 585ddceb6b7bf0d308...
example-2 791c7e2bd6a5fb1371...
```

If part of the managed BLS keys will need to be run on a different identity and/or different naming, the file section called 
`NamedIdentity` will be of great use. 
Following the above example, if we need to use a different identity and/or node name for the `791c7e2bd6a5fb1371...` key, 
we will need to define the section as:
```
# NamedIdentity represents an identity that runs nodes on the multikey
# There can be multiple identities set on the same node, each one of them having different bls keys, just by duplicating the NamedIdentity
[[NamedIdentity]]
   # Identity represents the keybase/GitHub identity for the current NamedIdentity
   Identity = "identity2"
   # NodeName represents the name that will be given to the names of the current identity
   NodeName = "random"
   # BLSKeys represents the BLS keys assigned to the current NamedIdentity
   BLSKeys = [
      "791c7e2bd6a5fb1371af18269267ad8ef9e56e264c4c95703c57526b16b84dd8df6347c0cc14f93d595a12316d38ae11264e05d2fa26d80387d12db52c1a98e93064d073d02549c71ec4e352d73724c21c02245b25d3643b532fac25d7580f0b"
   ]
```

which will generate the naming as:
```
example-0 e296e97524483e6b59...
example-1 585ddceb6b7bf0d308...
random-0  791c7e2bd6a5fb1371...
```

### Security notes for the multikey nodes

As stated above, the multikey feature is able to use any number of keys with just 4 nodes. 
At the first sight, this can be seen as a security degradation in terms of means of attacking a large staking provider but there are ways to mitigate these concerns as explained in the following list:
1. use the recommendation found in this page regarding the maximum number of keys per multikey group;
2. for each main multikey group use at least one backup multikey group in case something bad happens with the main group;
3. use the `NamedIdentity` configuration explained above to obfuscate the BLS keys and their declared identity from the actual nodes that manage the keys.

Regarding point 3, each managed BLS key will create a virtual p2p identity that no node from the network can connect to since it does not advertise the connection info but is only used to sign p2p messages.
Associated with a separate named identity, the system will make that BLS key virtually unreachable, and its origin hidden from the multikey nodes. Therefore, the node operators will need to apply the following changes on the `prefs.toml` file:
* in the `[Preference]` section, the 2 options called `NodeDisplayName` and `Identity` should be changed to something different used in the BLS' definitions to prevent easy matching. Generic names like `gateway` or `observer` are suitable for this section. 
Also, completely random strings can be used as to be easier to identify the nodes in explorer. The `Identity` can be left empty;
* in the `[[NamedIdentity]]` section, the 2 options called `NodeName` and `Identity` will be changed to the real identities of the BLS keys: such as the staking provider brand names. **They should be different from the ones defined in the `[Preference]` section.**

In this way, the operation will be somewhat similar to the *sentinel nodes* seen elsewhere. 
The difference in our case is that the setup is greatly simplified as there is no separate network for the protected nodes that will need to be maintained.
The security of our setup (if points 1, 2 and 3 are applied) should be the same with a *sentinel setup*.

### Configuration example

Let's suppose we have 5 BLS keys that belong to a staking provider called `testing-staking-provider` and we want to apply the security notes described above.
So, for the sake of the example, we generated 5 random BLS keys, the `allValidatorsKeys.pem` should contain something like this:
```
-----BEGIN PRIVATE KEY for 15eb03756fae81d2fbae392a4d7d82abdf7618ce3056b89376c2a46bc6e8403ed3cc84e12bc819c0b088ee46e7c28302d2b666b011714cc8ea2b75488907d07e194a6e83f0f3d15c7699de412de425314be5cc3ce6ab2c594690006f9915dd15-----
NDA5MWVjODMwZjU3MDhkYmQwNzk5ZWEwNjg2MDc0MzUzYmZjNThjM2ZhYzU2Y2I1
ZGRhMjY3YTY1NjhkZjI1YQ==
-----END PRIVATE KEY for 15eb03756fae81d2fbae392a4d7d82abdf7618ce3056b89376c2a46bc6e8403ed3cc84e12bc819c0b088ee46e7c28302d2b666b011714cc8ea2b75488907d07e194a6e83f0f3d15c7699de412de425314be5cc3ce6ab2c594690006f9915dd15-----
-----BEGIN PRIVATE KEY for ff12bc7f471e2e375c6e8b981f13ed823dcca857c41a2ffc3a0956283a8428a95754375dabc0b412df3ec41d2a51ef1490a8d23f4e4f9348787f9615093e0129969085488b59d2ab550467cd0d0fa33df22e2ed2d8c8c0c0f59042dafd0c1098-----
MTcwN2ZlMzFhMzk3Y2VjOWM4ZjdmMWU3Njg4MjY3YTAwOWU5ZjJmMWYxY2Y0ZjFl
MzI2Y2M5NGJiZGFjNGQwZA==
-----END PRIVATE KEY for ff12bc7f471e2e375c6e8b981f13ed823dcca857c41a2ffc3a0956283a8428a95754375dabc0b412df3ec41d2a51ef1490a8d23f4e4f9348787f9615093e0129969085488b59d2ab550467cd0d0fa33df22e2ed2d8c8c0c0f59042dafd0c1098-----
-----BEGIN PRIVATE KEY for 3dec570c02a4444197c1ed53fefd7e57acb9bc99ae47db7661cfbfb47170418702162a46ed40e113e3381d68b713e903e286ffaf9cac77fed8f9c79e83f2abb0ccd690ef4f689607b6414a6f893e0c0ced93d7456240bbccbf223f7603dd8e05-----
ZWMwYWRjYjNiYTQ0YmM4MGM5ZjhmNTlkNTU5YTRlMWJlMTI2ODFmMDlmM2JiNTM4
MmMyYzdlYmNhYjNkNTk2MA==
-----END PRIVATE KEY for 3dec570c02a4444197c1ed53fefd7e57acb9bc99ae47db7661cfbfb47170418702162a46ed40e113e3381d68b713e903e286ffaf9cac77fed8f9c79e83f2abb0ccd690ef4f689607b6414a6f893e0c0ced93d7456240bbccbf223f7603dd8e05-----
-----BEGIN PRIVATE KEY for 38a93e3c00128c31769823710aa7deb145591b99a78c87dbd74c894afd540ade6de3906b45001d3f5a5882db34eaf30e412bef77ed43cf5a394edd0aa70254a74db1c80eef5d41342cae76fbbae596bc811fa491e00f16a7e011a836f7ceaa15-----
YWMzMDk2ZjY3NmExNjhiNTQ5ODQzM2JiM2NiZWFmNzkyYjQyYWZhZjJlZmMwNjNl
YzdhMWI5OGM1ZDdjODg1MQ==
-----END PRIVATE KEY for 38a93e3c00128c31769823710aa7deb145591b99a78c87dbd74c894afd540ade6de3906b45001d3f5a5882db34eaf30e412bef77ed43cf5a394edd0aa70254a74db1c80eef5d41342cae76fbbae596bc811fa491e00f16a7e011a836f7ceaa15-----
-----BEGIN PRIVATE KEY for 1fce426b632e5a5941d9989e4f8bbb93a0a08a0e85dfe16d4d65c08b351dfbff1a1104d5e75e1be7565b4bbc6a583103bfc4b4075727133a54fa421983d894e549576364694b3e8910359b3de5260360bfe9f9bea2fec1cb50c2cf79a3fd590d-----
ZmYzMjM2ODljODQwMDRiMDI1MGU0NjcyMzhjYjJlMDNlNzg0OGI0YzQ1ZTM0ZjQz
YTZkZDVmNTBjYjAwMjAyNg==
-----END PRIVATE KEY for 1fce426b632e5a5941d9989e4f8bbb93a0a08a0e85dfe16d4d65c08b351dfbff1a1104d5e75e1be7565b4bbc6a583103bfc4b4075727133a54fa421983d894e549576364694b3e8910359b3de5260360bfe9f9bea2fec1cb50c2cf79a3fd590d-----
```

The staking operators that will create the actual `allValidatorsKeys.pem` file used on the chain should concatenate all keys from their `validatorKey.pem` files with a text editor. 
The content should resemble the one depicted in this example.   

For the `prefs.toml` file, we can have definitions like:

```toml
[Preferences]
   # DestinationShardAsObserver represents the desired shard when running as observer
   # value will be given as string. For example: "0", "1", "15", "metachain"
   # if "disabled" is provided then the node will start in the corresponding shard for its public key or 0 otherwise
   DestinationShardAsObserver = "0"

   # NodeDisplayName represents the friendly name a user can pick for his node in the status monitor when the node does not run in multikey mode
   # In multikey mode, all bls keys not mentioned in NamedIdentity section will use this one as default
   NodeDisplayName = "s14"

   # Identity represents the GitHub identity when the node does not run in multikey mode
   # In multikey mode, all bls keys not mentioned in NamedIdentity section will use this one as default
   Identity = ""

   # RedundancyLevel represents the level of redundancy used by the node (-1 = disabled, 0 = main instance (default),
   # 1 = first backup, 2 = second backup, etc.)
   RedundancyLevel = 0

   # FullArchive, if enabled, will make the node able to respond to requests from past, old epochs.
   # It is highly recommended to enable this flag on an observer (not on a validator node)
   FullArchive = false

   # PreferredConnections holds an array containing valid ips or peer ids from nodes to connect with (in top of other connections)
   # Example:
   # PreferredConnections = [
   #    "127.0.0.10",
   #    "16Uiu2HAm6yvbp1oZ6zjnWsn9FdRqBSaQkbhELyaThuq48ybdorrr"
   # ]
   PreferredConnections = []

   # ConnectionWatcherType represents the type of the connection watcher needed.
   # possible options:
   #  - "disabled" - no connection watching should be made
   #  - "print" - new connection found will be printed in the log file
   ConnectionWatcherType = "disabled"

   # OverridableConfigTomlValues represents an array of items to be overloaded inside other configuration files, which can be helpful
   # so that certain config values need to remain the same during upgrades.
   # (for example, an Elasticsearch user wants external.toml->ElasticSearchConnector.Enabled to remain true all the time during upgrades, while the default
   # configuration of the node has the false value)
   # The Path indicates what value to change, while Value represents the new value in string format. The node operator must make sure
   # to follow the same type of the original value (ex: uint32: "37", float32: "37.0", bool: "true")
   # File represents the file name that holds the configuration. Currently, the supported files are: config.toml, external.toml, p2p.toml and enableEpochs.toml
   # -------------------------------
   # Un-comment and update the following section in order to enable config values overloading
   # -------------------------------
   # OverridableConfigTomlValues = [
   #    { File = "config.toml", Path = "StoragePruning.NumEpochsToKeep", Value = "4" },
   #    { File = "config.toml", Path = "MiniBlocksStorage.Cache.Name", Value = "MiniBlocksStorage" },
   #    { File = "external.toml", Path = "ElasticSearchConnector.Enabled", Value = "true" }
   #]

# BlockProcessingCutoff can be used to stop processing blocks at a certain round, nonce or epoch.
# This can be useful for snapshotting different stuff and also for debugging purposes.
[BlockProcessingCutoff]
   # If set to true, the node will stop at the given coordinate
   Enabled = false

   # Mode represents the cutoff mode. possible values: "pause" or "process-error".
   # "pause" mode will halt the processing at the block with the given coordinates. Useful for snapshots/analytics
   # "process-error" will return an error when processing the block with the given coordinates. Useful for debugging
   Mode = "pause"

   # CutoffTrigger represents the kind of coordinate to look after when cutting off the processing.
   # Possible values: "round", "nonce", or "epoch"
   CutoffTrigger = "round"

   # The minimum value of the cutoff. For example, if CutoffType is set to "round", and Value to 20, then the node will stop processing at round 20+
   Value = 0

# NamedIdentity represents an identity that runs nodes on the multikey
# There can be multiple identities set on the same node, each one of them having different bls keys, just by duplicating the NamedIdentity
[[NamedIdentity]]
   # Identity represents the GitHub identity for the current NamedIdentity
   Identity = "testing-staking-provider"
   # NodeName represents the name that will be given to the names of the current identity
   NodeName = "tsp"
   # BLSKeys represents the BLS keys assigned to the current NamedIdentity
   BLSKeys = [
       "15eb03756fae81d2fbae392a4d7d82abdf7618ce3056b89376c2a46bc6e8403ed3cc84e12bc819c0b088ee46e7c28302d2b666b011714cc8ea2b75488907d07e194a6e83f0f3d15c7699de412de425314be5cc3ce6ab2c594690006f9915dd15",
       "ff12bc7f471e2e375c6e8b981f13ed823dcca857c41a2ffc3a0956283a8428a95754375dabc0b412df3ec41d2a51ef1490a8d23f4e4f9348787f9615093e0129969085488b59d2ab550467cd0d0fa33df22e2ed2d8c8c0c0f59042dafd0c1098", 
       "3dec570c02a4444197c1ed53fefd7e57acb9bc99ae47db7661cfbfb47170418702162a46ed40e113e3381d68b713e903e286ffaf9cac77fed8f9c79e83f2abb0ccd690ef4f689607b6414a6f893e0c0ced93d7456240bbccbf223f7603dd8e05",
       "38a93e3c00128c31769823710aa7deb145591b99a78c87dbd74c894afd540ade6de3906b45001d3f5a5882db34eaf30e412bef77ed43cf5a394edd0aa70254a74db1c80eef5d41342cae76fbbae596bc811fa491e00f16a7e011a836f7ceaa15",
       "1fce426b632e5a5941d9989e4f8bbb93a0a08a0e85dfe16d4d65c08b351dfbff1a1104d5e75e1be7565b4bbc6a583103bfc4b4075727133a54fa421983d894e549576364694b3e8910359b3de5260360bfe9f9bea2fec1cb50c2cf79a3fd590d"
   ]
```

:::important
These 2 configuration files `allValidatorsKeys.pem` and `prefs.toml` should be copied on all n nodes that assemble the multikey group of nodes.

**Do not forget to change the `DestinationShardAsObserver` accordingly for each node.**
:::

After starting the multikey nodes, in ~10 minutes, the explorer will reflect the changes. All n nodes that run the multikey group will broadcast their identity as an empty string and their names will be `s14`.
The BLS keys' identities, on the other hand will have the following names & identities:


| Key          | Name   | Identity                 |
|--------------|--------|--------------------------|
| 15eb03756... | tsp-00 | testing-staking-provider |
| ff12bc7f4... | tsp-01 | testing-staking-provider |
| 3dec570c0... | tsp-02 | testing-staking-provider |
| 38a93e3c0... | tsp-03 | testing-staking-provider |
| 1fce426b6... | tsp-04 | testing-staking-provider |



