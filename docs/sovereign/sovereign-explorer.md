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

Example configuration:
```
{
   default: true,
   id: 'sovereign',
   name: 'Sovereign',
   chainId: 'S',
   adapter: 'api',
   theme: 'default',
   egldLabel: 'SOV',
   walletAddress: 'https://localhost:3000',
   explorerAddress: 'https://localhost:3003',
   apiAddress: 'https://localhost:3002',
   hrp: 'erd',
   isSovereign: true
}
```

### Step 3: Start Sovereign Explorer

```bash
yarn
npm run start-testnet
```

Read more about deploying explorer in [GitHub](https://github.com/multiversx/mx-explorer-dapp/tree/main#quick-start).
