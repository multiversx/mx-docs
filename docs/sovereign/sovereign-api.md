# API service

## Deploy Sovereign Proxy service

:::info
Proxy service is automatically deployed if the sovereign chain was started with [local setup](/sovereign/local-setup)
:::

### Step 1: Get the `mx-chain-proxy-sovereign-go` Repository

Before proceeding, ensure that a **SSH key** for GitHub is configured on your machine.

1. Clone the GitHub repository:
    ```bash
    git clone git@github.com:multiversx/mx-chain-proxy-sovereign-go.git
    ```

2. Navigate to proxy directory:
    ```bash
    cd mx-chain-proxy-sovereign-go/cmd/proxy
    ```

### Step 2: Edit Proxy `config.toml` file

Example:
```
[[Observers]]
   ShardId = 0
   Address = "http://127.0.0.1:10000"

[[Observers]]
   ShardId = 4294967295
   Address = "http://127.0.0.1:10000"
```

:::note
For sovereign proxy there are 2 Observers required for `ShardId` 0 and 4294967295. The `Address` should be the same for both.
:::

### Step 3: Start Sovereign Proxy service

Build and run the proxy
```bash
go build
./proxy --sovereign
```

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
   - `config.testnet.yaml` - enable/disable or configure the services you need
   - `dapp.config.testnet.json` - dapp configuration file

### Step 3: Start Sovereign API service

```bash
npm install
npm run init
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
