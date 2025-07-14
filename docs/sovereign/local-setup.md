# Full Local Setup

## Deploy local Sovereign Chain

This guide will help you deploy a full sovereign local network connected to MultiversX network. This includes all the smart contracts and dependent services needed. Follow these steps carefully to ensure a successful deployment.

### Step 1: Get the `mx-chain-sovereign-go` Repository

Before proceeding, ensure that a **SSH key** for GitHub is configured on your machine.

1. Clone the GitHub repository:
    ```bash
    git clone git@github.com:multiversx/mx-chain-sovereign-go.git
    ```

2. Navigate to testnet directory:
    ```bash
    cd mx-chain-sovereign-go/scripts/testnet
    ```

3. Run the prerequisites script:
    ```bash
    ./prerequisites.sh
    ```

    :::info
    The prerequisites script verifies and downloads the necessary packages to run the nodes and clones the required repositories:

    - **mx-chain-deploy-sovereign-go**: Initializes the configuration for the chain and deployment parameters.
    - **mx-chain-proxy-sovereign-go**: Repository for the sovereign proxy.
    - **mx-chain-sovereign-bridge-go**: Repository for the cross-chain service.
    - **mx-chain-tools-go**: Repository for updating elastic indices.
    :::

### Step 2: Deploy Sovereign setup

#### Sovereign chain with no main chain connection

1. Update chain parameters in `variables.sh` file

2. Start the chain with local scripts:
```bash
./config.sh && ./sovereignStart.sh
```

#### Sovereign chain with main chain connection

Navigate to the `sovereignBridge` folder:
```bash
cd sovereignBridge
```

1. Install the [software dependencies](/sovereign/software-dependencies) and download the cross-chain contracts by running the sovereign bridge prerequisites script:
    ```bash
    ./prerequisites.sh
    ```

2. Create a new wallet:
    ```bash
    mxpy wallet new --format pem --outfile ~/wallet.pem
    ```

    :::info
    This wallet is the owner for cross chain smart contracts and is used by the sovereign bridge service.
    :::
    
    :::note
    You can use any wallet of your choice, but for the purpose of this guide we are generating a new wallet.
    :::

3. Get funds in this wallet on the chain (testnet/devnet/mainnet) you want the sovereign to be connected to.

4. Update the configuration file `config/configs.cfg` with paths you want to use, wallet location and main chain constants. The following example shows the paths you have to use in order to connect to public MultiversX testnet:
    ```
    # Sovereign Paths
    SOVEREIGN_DIRECTORY="~/sovereign"
    TXS_OUTFILE_DIRECTORY="${SOVEREIGN_DIRECTORY}/txsOutput"
    CONTRACTS_DIRECTORY="${SOVEREIGN_DIRECTORY}/contracts"

    # Owner Configuration
    WALLET="~/wallet.pem"

    # Main Chain Constants
    MAIN_CHAIN_ELASTIC=https://testnet-index.multiversx.com
    PROXY = https://testnet-gateway.multiversx.com
    CHAIN_ID = T

    # Native token
    NATIVE_ESDT_TICKER=SOV
    NATIVE_ESDT_NAME=SovToken
    ```

    :::note
    - **SOVEREIGN_DIRECTORY, TXS_OUTFILE_DIRECTORY, CONTRACTS_DIRECTORY** - represent the paths to the location where the deployment scripts will generate the outputs.
    - **WALLET** - should represent the wallet generated at Step 2.2.
    - **MAIN_CHAIN_ELASTIC** - represents the elasticsearch db from the main chain
    - **PROXY** - in this case, for the purpose of the test, the used proxy is the testnet one. Of course that the proper proxy should be used when deploying your own set of contracts depending on the development phase of your project.
    - **CHAIN_ID** - should represent the chain ID of the chain where the contracts are to be deployed.
        - **"1"** for Mainnet;
        - **"D"** for Devnet;
        - **"T"** for Testnet;
        - or use you own local network ID
    - **NATIVE_ESDT_TICKER** - represents the ticker from which the native esdt will be generated, and updated in configs
    - **NATIVE_ESDT_NAME** - represents the native esdt name
    :::

5. Source the script:
    ```bash
    source script.sh
    ```

6. Deploy all cross-chain contracts on main chain and deploy Sovereign Chain with all required services:
    ```bash
    deploySovereignWithCrossChainContracts sov
    ```

    :::info
    `deploySovereignWithCrossChainContracts` command will:
    - deploy all main chain smart contracts and update sovereign configs
    - deploy sovereign nodes and the main chain observer
    - `sov` is the prefix for ESDT tokens in the sovereign chain - it can be changed to any string consisting of 4 lowercase alphanumeric characters
    :::

### Step 3: Deploy services

You can find the documentation on how to deploy services [here](/sovereign/services).

___

## Stop and clean local Sovereign Chain

1. Navigate to `mx-chain-sovereign-go/scripts/testnet/sovereignBridge`.
    Source the script:
    ```bash
    source script.sh
    ```

2. Stop and clean the chain, and all sovereign services:
    ```bash
    stopAndCleanSovereign
    ```

## Upgrade and reset local Sovereign Chain

1. Navigate to `mx-chain-sovereign-go/scripts/testnet/sovereignBridge`.
    Source the script:
    ```bash
    source script.sh
    ```

2. Upgrade and reset the chain, and all sovereign services:
    ```bash
    sovereignUpgradeAndReset
    ```
