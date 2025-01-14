# API service

## Deploy Sovereign API service

### Step 1: Get the `mx-api-service` Repository

1. Clone the GitHub repository:
    ```bash
    git clone https://github.com/multiversx/mx-api-service.git
    ```

2. Checkout the sovereign branch and navigate to testnet directory:
    ```bash
    cd mx-api-service && git fetch && git checkout feat/sovereign
    ```

### Step 2: Edit API config

1. Navigate to the `config` folder:
   ```bash
   cd config
   ```

2. Update the configuration files (we are starting from testnet configuration in this example):
   - config.testnet.yaml` - enable/disable the services you need
   - `dapp.config.testnet.json`

### Step 3: Start Sovereign API service

```bash
npm run start:testnet
```

## Deploy Sovereign Extras service

The extras service only includes the `faucet` option at the moment.

### Step 1: Get the ```mx-lite-extras-service``` Repository

```bash
git clone https://github.com/multiversx/mx-lite-extras-service.git
```

### Step 2: Update extras configuration files

- `.env.custom` - change `API_URL` and `GATEWAY_URL` with your own URLs
- `config/config.yaml` - update the faucet configuration parameters as needed

### Step 3: Start Sovereign Extras service

```bash
NODE_ENV=custom npm run start:faucet
```

Read more about deploying API service in [GitHub](https://github.com/multiversx/mx-lite-extras-service#quick-start).
