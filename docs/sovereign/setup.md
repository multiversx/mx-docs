# Setup Guide

## Deploy local Sovereign Chain

:::note
 This guide is a preliminary version and not the final documentation for sovereign chains. It serves as a starting point for setting up a sovereign chain on a local machine.
:::

This guide will help you deploy contract on main chain, set up configuration files and deploy sovereign chain and all dependent services. Follow these steps carefully to ensure a successful deployment.

## Step 1: Create a New Wallet

1. Create a new wallet:
    ```bash
    mxpy wallet new --format pem --outfile ~/wallet.pem
    ```

2. Get funds in the wallet on the chain you want the sovereign to be connected to.

:::note
You can use any wallet of your choice, but for the purpose of this guide we are taking the step by step approach as if there is nothing available nor installed on your node.
:::

## Step 2: Get the ```mx-chain-go``` Repository

Before proceeding, ensure that a **SSH key** for GitHub is configured on your machine.

1. Clone the GitHub repository:
    ```bash
    git clone git@github.com:multiversx/mx-chain-go.git
    ```

2. Checkout the specific sovereign chain sdk branch and navigate to testnet directory:
    ```bash
    cd mx-chain-go && git fetch && git checkout feat/chain-go-sdk && cd scripts/testnet
    ```

3. Run the prerequisites script:
    ```bash
    ./prerequisites.sh
    ```

:::note
The prerequisites script verifies and downloads the necessary packages to run the nodes and clones the required repositories:

- **mx-chain-deploy-go**: Initializes the configuration for the chain and deployment parameters.
- **mx-chain-proxy-go**: Repository for the proxy.
- **mx-chain-sovereign-bridge-go**: Repository for the cross-chain service.
:::

## Step 3: Deploy Sovereign setup

First navigate to the sovereignBridge folder:

```bash
cd sovereignBridge
```

1. Update the configuration file `config/configs.cfg` with paths you want to use, wallet location and main chain constants. Example:
    ```ini
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

- **SOVEREIGN_DIRECTORY, TXS_OUTFILE_DIRECTORY, CONTRACTS_DIRECTORY** - represent the paths to the location where the deploy scripts will generate the outputs.
- **WALLET** - should represent the wallet generated at Step 1.
- **PROXY** - in this case, for the purpose of the test, the used proxy is the testnet one. Of course that the proper proxy should be used when deploying your own set of contracts depending on the development phase of your project.
- **CHAIN_ID** - should represent the chain ID of the chain where the contracts are to be deployed. The currently supported constants are:
    - **"1"** for Mainnet;
    - **"D"** for Devnet;
    - **"T"** for Testnet;
:::

2. Source the script:
    ```bash
    source script.sh
    ```

3. Install the [software dependencies](/sovereign/software-dependencies) and download the cross-chain contracts by running the Sovereign bridge prerequisites:
    ```bash
    runBridgePrerequisites
    ```

4. Deploy all cross-chain contracts on main chain and deploy sovereign chain with all dependent services:
    ```bash
    deploySovereignWithCrossChainContracts
    ```

:::note
## Alternatively, you can deploy everything manually step-by-step:
### Deploy contracts and update sovereign configs:
1. Deploy cross-chain contracts on main chain:
    ```bash
    deployEsdtSafeContract 
    deployFeeMarketContract
    setFeeMarketAddress
    disableFeeMarketContract
    unpauseEsdtSafeContract
    ```

2. This instruction will copy the wasm files in the right location and update the genesis smart contracts:
    ```bash
    setGenesisContract
    ```

3. This instruction will update sovereignConfig.toml file: (Outgoing subscribed events deposit address will be esdt-safe address from sovereign chain. Notifier config subscribed events will come from esdt-safe address from main chain.)
    ```bash
    updateSovereignConfig
    ```

4. Prepare a docker container for the observer:
    ```bash
    prepareObserver
    ```
    alternatively, use a specific image version
    ```bash
    prepareObserver multiversx/chain-testnet:T1.7.4.0
    ```

### Deploy Sovereign Chain & Contracts

1. Update the notifier notarization round configuration (the observer will notarize blocks from current nonce, not from genesis of main chain):
    ```bash
    updateNotifierNotarizationRound
    ```

2. Run the configuration script:
    ```bash
    ../config.sh
    ```

3. Deploy the multisig verifier contract on testnet:
    ```bash
    deployHeaderVerifierContract
    ```

4. Set the ESDT safe address in the multisig contract on testnet:
    ```bash
    setEsdtSafeAddressInHeaderVerifier
    ```

5. Start the bridge service, start sovereign nodes and deploy the observer:
    ```bash
    sovereignStart
    ```

6. Set the multisig address in ESDT safe on testnet:
    ```bash
    setHeaderVerifierAddressInEsdtSafe
    ```

7. Get funds in your wallet from a genesis wallet:
    ```bash
    getFundsInAddressSovereign
    ```

8. Set the fee market address in sovereign:
    ```bash
    setFeeMarketAddressSovereign
    ```

9. Disable the fee market contract in sovereign:
    ```bash
    disableFeeMarketContractSovereign
    ```

10. Unpause the ESDT safe contract in sovereign:
    ```bash
    unpauseEsdtSafeContractSovereign
    ```
:::

## Stop local Sovereign Chain

1. Navigate to `/mx-chain-go/scripts/testnet/sovereignBridge`.

    Source the script:
    ```bash
    source script.sh
    ```

2. Stop and clean the chain with all dependent services:
    ```bash
    stopAndCleanSovereign
    ```

## Upgrade local Sovereign Chain

1. Navigate to `/mx-chain-go/scripts/testnet/sovereignBridge`.

    Source the script:
    ```bash
    source script.sh
    ```

2. Upgrade and restart Sovereign chain and all dependent services:
    ```bash
    sovereignUpgradeAndRestart
    ```

## Restart local Sovereign Chain

1. Navigate to `/mx-chain-go/scripts/testnet/sovereignBridge`.

    Source the script:
    ```bash
    source script.sh
    ```

3. Restart Sovereign chain and all dependent services:
    ```bash
    sovereignRestart
    ```

:::important
This version of the documentation focuses solely on the essential steps required to set up and deploy a sovereign chain on either a local or remote computer. It does not include instructions for configuring:

- Round length
- Gas token
- Fee model
- Consensus model
- And other related settings
:::

