---
id: node-configuration
title: Node Configuration
---

## Introduction

The node relies on some configuration files that are meant to allow the node operator to easily change some values
that won't require a code change, a new release, or so on.

## Configuration files

All the configuration files are located by default in the `config` directory that resides near the node's binary. The paths can be changed
by using the node's CLI flags.

:::important
Not all configuration values can be user-defined. For example, it is perfectly fine if a node operator increases the size of a cacher or sets an Elasticsearch instance, but changing the genesis total supply, for example, will lead to an inconsistent state as compared to the Network.
:::

Below you can find an example of how the configuration files look like for the `v1.3.44` node.

```
├── api.toml                        
├── config.toml                     
├── economics.toml                  
├── enableEpochs.toml               
├── enableRounds.toml               
├── external.toml                   
├── gasSchedules                    
│ ├── gasScheduleV1.toml            
│ ├── gasScheduleV2.toml            
│ ├── gasScheduleV3.toml            
│ ├── gasScheduleV4.toml            
│ ├── gasScheduleV5.toml
│ ├── gasScheduleV6.toml            
│ └── gasScheduleV7.toml            
├── genesisContracts                
│ ├── delegation.wasm               
│ └── dns.wasm                      
├── genesis.json                    
├── genesisSmartContracts.json      
├── nodesSetup.json                 
├── p2p.toml                        
├── prefs.toml                      
├── ratings.toml                    
├── systemSmartContractsConfig.toml 
```

- `api.toml`  contains the Rest API endpoints configuration (open or closed endpoints, logging and so on)
- `config.toml`  contains the main configuration of the node (storers & cachers type and size, type of hasher, type of marshaller, and so on)
- `economics.toml` contains the economics configuration (such as genesis total supply, inflation per year, developer fees, and so on)
- `enableEpochs.toml` contains a list of new features or bugfixes and their activation epoch
- `enableRounds.toml` contains a list of new features or bugfixes and their activation epoch
- `external.toml` contains external drivers' configuration (for example: Elasticsearch or event notifier)
- `gasSchedules` is the directory that contains the gas consumption configuration to be used for SC execution, depending on activation epochs specified on enableEpochs.toml -> GasSchedule -> GasScheduleByEpochs
- `genesisContracts` is the directory that contains the WASM contracts that were deployed at the genesis
- `genesis.json`  contains all the addresses and their balance/active delegation at the genesis
- `genesisSmartContracts.json` specifies the SCs to be deployed at Genesis time, alongside additional parameters
- `nodesSetup.json` holds all the Genesis nodes' public keys, alongside their wallet address
- `p2p.toml` contains peer-to-peer configurable values, such as the number of peers to connect to
- `prefs.toml` contains a set of custom configuration values, that should not be replaced from an upgrade to another
- `ratings.toml` contains the parameters used for the nodes' rating mechanism, for example, the start rating, decrease steps, and so on
- `systemSmartContractsConfig.toml` contains System Smart Contracts configurable values, such as parameters for Staking, ESDT, or Governance

### Overriding config.toml values

As mentioned in the above descriptions, `prefs.toml` is not overwritten by the installation scripts when performing an upgrade.

However, there are some more custom values that nodes operators use (antiflood disabled or with fewer constraints, db lookup extension, and so on)
and they don't want these values to be changed during an upgrade.

For this use-case, release `v1.4.x` introduces the `OverridableConfigTomlValues` setting inside `prefs.toml` that is able to override certain configuration
values from `config.toml`.

Here's how to use it:

```
   OverridableConfigTomlValues = [
     { Path = "StoragePruning.NumEpochsToKeep", Value = "4" },
     { Path = "MiniBlocksStorage.Cache.Name", Value = "MiniBlocksStorage" }
   ]
```

Therefore, after each upgrade, the node will override these values to the newly provided values. The path points to an entry
in `config.toml` file before setting a new overridable value.
