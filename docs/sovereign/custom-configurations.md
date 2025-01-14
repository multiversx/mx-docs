# Custom Configurations

## Sovereign network customisations

The Sovereign Chain SDK is built with flexibility in mind, allowing you to tailor it to your specific needs. This page highlights various customizations you can apply to make your network unique.

### config.toml

- `GeneralSettings.ChainID` - defines your unique chain identifier
- `EpochStartConfig.RoundsPerEpoch` - defines how many round are in each epoch

### economics.toml

- `GlobalSettings.GenesisTotalSupply` - total native ESDT supply at genesis
- `GlobalSettings.YearSettings` - adjust the inflation rate each year
- `FeeSettings` - adjust the fee settings as needed

### ratings.toml

- `General` - adjust the rating parameters as needed

### systemSmartContractsConfig.toml

- `ESDTSystemSCConfig.ESDTPrefix` - the prefix for all issued tokens
- `ESDTSystemSCConfig.BaseIssuingCost` - base cost for issuing a token
- `StakingSystemSCConfig.NodeLimitPercentage` [[docs](https://docs.multiversx.com/validators/staking-v4/#how-does-the-dynamic-node-limitation-work)]

### sovereignConfig.toml

- `GenesisConfig.NativeESDT` - Native ESDT identifier for the sovereign chain

### prefs.toml

The `OverridableConfigTomlValues` will overwrite the parameters in the config files. Make sure that your new config parameters are not overwritten by this file.

:::note
These are just a few examples that you can adjust to make the sovereign chain unique. All the files you could adjust when creating a sovereign chain can be found in the [deployment guide](/sovereign/distributed-setup#step-4-edit-the-sovereign-configuration).
:::
