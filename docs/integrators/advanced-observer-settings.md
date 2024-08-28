---
id: advanced-observer-settings
title: Advanced Observer Settings
---

[comment]: # (mx-abstract)

This page describes some of the settings an integrator might want to apply on the observers in order to better make use of the nodes.

For the settings from the `config.toml` file that are needed to be altered, we recommend using the `OverridableConfigTomlValues` section found in the `prefs.toml` file. More info can be found [here](/validators/node-configuration#overriding-configtoml-values)

[comment]: # (mx-context-auto)

## Web antiflood settings

Each node, either observer or validator, will be configured automatically with the web antiflood turned on and set to relatively low limits. This was chosen as a protection measure during the initial setup of the node but can be easily changed through the configuration files.

The original section found in the `config.toml` file looks like this:

```toml
[WebServerAntiflood]
    WebServerAntifloodEnabled = true
    # SimultaneousRequests represents the number of concurrent requests accepted by the web server
    # this is a global throttler that acts on all http connections regardless of the originating source
    SimultaneousRequests = 100
    # SameSourceRequests defines how many requests are allowed from the same source in the specified
    # time frame (SameSourceResetIntervalInSec)
    SameSourceRequests = 10000
    # SameSourceResetIntervalInSec time frame between counter reset, in seconds
    SameSourceResetIntervalInSec = 1
    # TrieOperationsDeadlineMilliseconds represents the maximum duration that an API call targeting a trie operation
    # can take.
    TrieOperationsDeadlineMilliseconds = 10000
    # GetAddressesBulkMaxSize represents the maximum number of addresses to be fetched in a bulk per API request. 0 means unlimited
    GetAddressesBulkMaxSize = 100
    # VmQueryDelayAfterStartInSec represents the number of seconds to wait when starting node before accepting vm query requests
    VmQueryDelayAfterStartInSec = 120
    # EndpointsThrottlers represents a map for maximum simultaneous go routines for an endpoint
    EndpointsThrottlers = [{ Endpoint = "/transaction/:hash", MaxNumGoRoutines = 10 },
                           { Endpoint = "/transaction/send", MaxNumGoRoutines = 2 },
                           { Endpoint = "/transaction/simulate", MaxNumGoRoutines = 1 },
                           { Endpoint = "/transaction/send-multiple", MaxNumGoRoutines = 2 }]
```

The general off/on switch is done through the `WebServerAntifloodEnabled` config value. As an integrator you might want to turn off the web antiflooder, **in case the node is not directly reachable over the Internet** as a mean to provide your gateway instance (proxy) to use as many node resources it wants. 
This is the easiest way to tell the node to not bother with that type of antiflooding. However, this does not imply the integrator to remove all the web antiflooding protection, especially before his/her owned gateway instance (proxy).

The following list explains what the parameters do:
- `SimultaneousRequests` tells the node how many REST API calls can simultaneous serve;
- `SameSourceRequests` tells how many REST API requests originating from the same source the node can serve per time unit. The time unit is specified in the `SameSourceResetIntervalInSec` parameter and is expressed in seconds;
- `TrieOperationsDeadlineMilliseconds` tells the node when it should time out the REST API requests that involves data trie traversing. This should be increased in case the node is trying to fetch data from large smart contracts or user accounts;
- `GetAddressesBulkMaxSize` tells the node what is the maximum number of addresses that can be fetched in a bulk-get operation;
- `VmQueryDelayAfterStartInSec` is a parameter that should is taken into account only when the node is started. The vm-query requests are not executed in this initial startup phase;
- `EndpointsThrottlers` is a list that defines some REST API endpoints and their maximum simultaneous requests that the node can handle.

[comment]: # (mx-context-auto)

## VM settings for query operations

The node can handle one or more query-services able to simultaneous execute vm queries.

The original section found in the `config.toml` file looks like this:

```toml
[VirtualMachine.Querying]
    NumConcurrentVMs = 1
```

The `NumConcurrentVMs` value specifies the number of VMs instances allocated for vm-query operations. The higher this value is, the more concurrent vm-query operation the node can handle.

:::important
The increased number of VMs allocated for the vm-query engine will put pressure on the RAM allocation for the node process at around 500-600 MB / extra instance. Disk & CPU utilization will also get higher in a proportional manner.
:::

[comment]: # (mx-context-auto)

## UserAccounts cache parameters

As found during heavy testing, spending more RAM on caches might help in vm-query execution. The reason behind this statement is that, usually, smart contract execution need smart contract data to be read from storage and then processed.
The data fetch mechanism costs in terms of CPU cycles and disk utilization, so they affect the execution time of the vm-query.
If the node has more than the [minimum required RAM](/validators/system-requirements) then the following section from the `config.toml` file can be altered:

```toml
[AccountsTrieStorage]
    [AccountsTrieStorage.Cache]
        Name = "AccountsTrieStorage"
        Capacity = 500000
        Type = "SizeLRU"
        SizeInBytes = 314572800 #300MB
```

- `Capacity` can be increased to 10000000 or to a larger value;
- `SizeInBytes` can be increased to `1073741824` (1GB) or even pushed to `4294967296` (4GB).
