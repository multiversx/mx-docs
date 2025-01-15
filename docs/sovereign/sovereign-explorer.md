# Explorer service

## Deploy Explorer

### Step 1: Get the `mx-explorer-dapp` Repository

```bash
git clone https://github.com/multiversx/mx-explorer-dapp.git
```

### Step 2: Update explorer configuration file

1. Navigate to the `src/config` folder:
    ```bash
    cd src/config
    ```

2. Update the parameters and URLs with your own configuration in `config.testnet.ts` file

### Step 3: Start Sovereign Explorer

```bash
yarn
npm run start-testnet
```

Read more about deploying explorer in [GitHub](https://github.com/multiversx/mx-explorer-dapp/tree/main#quick-start).
