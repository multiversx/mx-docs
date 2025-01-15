# Full Local Setup

## Deploy local Sovereign Chain

This guide will help you deploy a full sovereign local network connected to MultiversX network. This includes all the smart contracts and dependent services needed. Follow these steps carefully to ensure a successful deployment.

### Step 1: Get the `mx-chain-go` Repository

Before proceeding, ensure that a **SSH key** for GitHub is configured on your machine.

1. Clone the GitHub repository:
    ```bash
    git clone git@github.com:multiversx/mx-chain-go.git
    ```

2. Checkout the specific Sovereign Chain SDK branch and navigate to testnet directory:
    ```bash
    cd mx-chain-go && git fetch && git checkout d699ffd6a29513c573b1d212861f932e037d8f67 && cd scripts/testnet
    ```

    :::info
    `d699ffd6a29513c573b1d212861f932e037d8f67` is the commit hash we recommend to be used. If you want to use the latest version you can use the branch `feat/chain-go-sdk`.
    :::

3. Run the prerequisites script:
    ```bash
    ./prerequisites.sh
    ```

    :::info
    The prerequisites script verifies and downloads the necessary packages to run the nodes and clones the required repositories:

    - **mx-chain-deploy-go**: Initializes the configuration for the chain and deployment parameters.
    - **mx-chain-proxy-go**: Repository for the proxy.
    - **mx-chain-sovereign-bridge-go**: Repository for the cross-chain service.
    - **mx-chain-tools-go**: Repository for updating elastic indices.
    :::

### Step 2: Deploy Sovereign setup

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
    PROXY = https://testnet-gateway.multiversx.com
    CHAIN_ID = T
    ```

    :::note
    - **SOVEREIGN_DIRECTORY, TXS_OUTFILE_DIRECTORY, CONTRACTS_DIRECTORY** - represent the paths to the location where the deployment scripts will generate the outputs.
    - **WALLET** - should represent the wallet generated at Step 2.2.
    - **PROXY** - in this case, for the purpose of the test, the used proxy is the testnet one. Of course that the proper proxy should be used when deploying your own set of contracts depending on the development phase of your project.
    - **CHAIN_ID** - should represent the chain ID of the chain where the contracts are to be deployed.
        - **"1"** for Mainnet;
        - **"D"** for Devnet;
        - **"T"** for Testnet;
        - or use you own local network ID
    :::

5. Source the script:
    ```bash
    source script.sh
    ```

6. Deploy all cross-chain contracts on main chain and deploy Sovereign Chain with all required services:
    ```bash
    deploySovereignWithCrossChainContracts
    ```

    :::info
    `deploySovereignWithCrossChainContracts` command will:
    - deploy all main chain smart contracts and update sovereign configs
    - deploy sovereign nodes and the main chain observer
    :::

### Step 3: Deploy services

You can find the documentation on how to deploy services [here](/sovereign/services).

___

## Stop and clean local Sovereign Chain

1. Navigate to `mx-chain-go/scripts/testnet/sovereignBridge`.
    Source the script:
    ```bash
    source script.sh
    ```

2. Stop and clean the chain, and all sovereign services:
    ```bash
    stopAndCleanSovereign
    ```

## Upgrade and reset local Sovereign Chain

1. Navigate to `mx-chain-go/scripts/testnet/sovereignBridge`.
    Source the script:
    ```bash
    source script.sh
    ```

2. Upgrade and reset the chain, and all sovereign services:
    ```bash
    sovereignUpgradeAndReset
    ```
