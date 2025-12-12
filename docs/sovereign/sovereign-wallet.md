# Wallet service

## Deploy Lite Wallet

### Step 1: Get the `mx-lite-wallet-dapp` Repository

```bash
git clone https://github.com/multiversx/mx-lite-wallet-dapp.git
```

### Step 2: Update sovereign configuration file

1. Navigate to the `src/config` folder:
  ```bash
  cd src/config
  ```

2. Update the `sharedNetworks.ts` file:
   - for `sovereign` item
     - update the URLs with your own
     - update `WEGLDid` with the sovereign native token identifier from `config.toml` -> `BaseTokenID`
     - update `sovereignContractAddress` with contract address from `sovereignConfig.toml` -> `SubscribedEvents` from `OutgoingSubscribedEvents`
   - for `testnet` item (or the network your sovereign is connected to)
     - update `sovereignContractAddress` with contract address from `sovereignConfig.toml` -> `SubscribedEvents` from `NotifierConfig`

### Step 3: Start Sovereign Lite Wallet

```bash
yarn install
yarn start-sovereign
```

Read more about deploying lite wallet in [GitHub](https://github.com/multiversx/mx-lite-wallet-dapp/tree/main#multiversx-lite-wallet-dapp).
