---
id: multikey-nodes
title: Multikey nodes management
---

[comment]: # (mx-abstract)
This page contains information about how to manage multiple keys on an observing squad.

[comment]: # (mx-context-auto)
## Multikey architecture overview

At the mainnet launch, and up until the release candidate RC/v1.6.0 becomes mainstream, each node could have managed only
one key. So the relationship between the nodes and keys is `1:1`, the node "following" the shard where the managed key is assigned.
The main idea behind the multikey feature is that a set of keys can be managed by an observing squad set. The same set of keys
should be provided for all observing squad nodes, so the nodes can **pick** any key from that set and use it to propose or sign
blocks whenever the consensus group in a round contains at least one managed key. The observing node that runs in multikey mode
is able to use the provided keys in any combination possible. So one node can use one key to propose a block and one or more other
keys to already sign on that proposed block automatically to improve performance.
So, with the multikey feature, the relationship now becomes `n:[num_shards]`, providing that `n` is the number of keys 
managed by an entity.

:::important
This feature is purely optional. Normal `1:1` relationship between the keys and the nodes is still supported. The multikey
mode should optimize the costs when running a set of keys (check [Economics running multikey nodes](#economics-running-multikey-nodes) section)
:::

[comment]: # (mx-context-auto)
## General implementation details

The observers running with the multikey feature, beside deciding the consensus group (which is normally done on each node), 
can access the provided keys set and use, in any combination one or more key, if the node detects that the at least one managed
key is part of the consensus group.
Code-wise, the implementation focused on the `consensus`, `keyManagement` and `heartbeat` packages.

[comment]: # (mx-context-auto)
### Heartbeat information

The squad managing the set of keys (we will call them multikey nodes or multikey squad), will pass the validators BLS information tight to 
"virtual" peer IDs. A "virtual peer ID" is a generated p2p identity that the p2p network can not connect to as it does not
have a real address bind to. Consequentially, this feature brings a new layer of security as the multikey nodes interface 
the network on a random BLS key, emitting managed heartbeat information on the behalf of generated p2p identities. 

[comment]: # (mx-context-auto)
### Redundancy

The redundancy sub-system has been upgraded to accommodate the multikey requirements keeping the multiple redundancy 
fallback squads operation. A fallback multikey squad will monitor each managed key for missed consensus activity **independent on 
each managed node**. So, a bad configured main squad, offline or stuck main squad nodes should trigger fallback events on 
the redundancy squad. 
Example: if main multikey squad was set to manage the following key set `[key_0, key_1 ... key_e-1, key_e+1 ... key_n]`
(mind the missing `key_e`) and the redundancy fallback multikey squad has the set `[key_0, key_1 ... key_e-1, key_e, key_e+1 ... key_n]`,
then, the fallback squad, after `k` misses in the consensus activity (propose/sign block) will start using that `key_e` as it 
was the only key assigned to the multikey squad (`k` is the value defined in the `prefs.toml` file, `RedundancyLevel` option).

[comment]: # (mx-context-auto)
## Economics running multikey nodes

As for `n` managed keys we will need at least a squad of observing nodes, there is a threshold that a staking operator
will want to consider when deciding to switch the operation towards the multikey mode. The switch becomes attractive for the
operator when the number of managed keys is greater or equal of the number of shards. So, for the time being, when we have 
at least 4 keys that are either *eligible* or *waiting*, the switch to multikey mode becomes feasible.

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