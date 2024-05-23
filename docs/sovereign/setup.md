# Setup Guide

:::note
 This guide is a preliminary version and not the final documentation for sovereign chains. It serves as a starting point for setting up a sovereign chain on a local machine.
:::

This guide will help you set up and deploy contracts on a sovereign chain. Follow these steps carefully to ensure a successful deployment.

## Step 1: Create a New Wallet

1. Create a new wallet:
    ```bash
    mxpy wallet new --format pem --outfile ~/wallet.pem
    ```

:::note
You can use any wallet of your choice, but for the purpose of this guide we are taking the step by step approach as if there is nothing available nor installed on your node.
:::

## Step 2: Download necessary contracts

2. Download the WASM files from [here](https://github.com/multiversx/mx-sovereign-sc/releases).

3. For the purpose of the automated setup and deployment, save them in a directory called `contracts` in the same location where the wallet has been stored. Otherwise you could configure their own location at step number 4.

## Step 3: Clone the ```mx-chain-go``` Repository

1. Clone the github repository:
    ```bash
    git clone https://github.com/multiversx/mx-chain-go.git
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

- mx-chain-deploy-go: Initializes the configuration for the chain and deployment parameters.
- mx-chain-proxy-go: Repository for the proxy.
- mx-chain-sovereign-bridge-go: Repository for the bridge service.
:::

## Step 4: Deploy Contracts on Testnet

First navigate to the sovereignBridge folder:

```bash
cd ./sovereignBridge
```

1. Update the `/config/configs.cfg` file with the Owner and WASM file details. Example:
    ```ini
    # Owner Configuration
    WALLET="~/wallet.pem" 

    # Main Chain Constants
    PROXY = https://testnet-gateway.multiversx.com
    CHAIN_ID = T

    # WASM Files
    ESDT_SAFE_WASM="~/contracts/esdt-safe.wasm"
    FEE_MARKET_WASM="~/contracts/fee-market.wasm"
    MULTISIG_VERIFIER_WASM="~/contracts/multisigverifier.wasm"
    ```

:::note

- **WALLET** - should represent the wallet generated at Step 1.
- **PROXY** - in this case, for the purpose of the test, the used proxy is the testnet one. Of course that the proper proxy should be used when deploying your own set of contracts depending on the development phase of your project.
- **CHAIN_ID** - should represent the chain ID of the chain where the contracts are to be deployed. The currently supported constants are :
    - **"1"** for Mainnet;
    - **"D"** for Devnet;
    - **"T"** for Testnet;
- **ESDT_SAFE_WASM, FEE_MARKET_WASM, MULTISIG_VERIFIER_WASM** - represent the paths to the location where the contracts have been downloaded at Step 2.
:::

2. Source the script:
    ```bash
    source script.sh
    ```

3. Deploy all bridge contracts, Sovereign Notifier and Service:
    ```bash
    deployMainChainContractsAndSetupObserver
    ```

4. Initialize and deploy all sovereign chain dependencies:
    ```bash
    sovereignDeploy
    ```

:::note
## Alternatively, you can do everything manually step-by-step:
### Deploy contracts:
```bash
    deployEsdtSafeContract 
    deployFeeMarketContract
    setFeeMarketAddress
    disableFeeMarketContract
    unpauseEsdtSafeContract
```

### Update Sovereign Configurations

1. This instruction will copy the wasm files in the right location and update the genesis smart contracts:

    ```bash
    setGenesisContract
    ```

2. This instruction will update sovereign config.toml file:
    ```bash
    updateSovereignConfig
    ```

### Prepare Docker Observer

1. Prepare the observer:
    ```bash
    prepareObserver
    ```

2. Specify an image version:
    ```bash
    prepareObserver multiversx/chain-testnet:T1.7.4.0
    ```
### Deploy Sovereign Chain & Contracts

1. Update the notifier notarization round configuration:
    ```bash
    updateNotifierNotarizationRound
    ```

2. Run the configuration script:
    ```bash
    ../config.sh
    ```

3. Deploy the multisig verifier contract on testnet:
    ```bash
    deployMultisigVerifierContract
    ```

4. Set the ESDT safe address in the multisig contract on testnet:
    ```bash
    setEsdtSafeAddress
    ```

5. Update and start the bridge service:
    ```bash
    updateAndStartBridgeService
    ```

6. Start the sovereign chain:
    ```bash
    ../sovereignStart.sh
    ```

7. Deploy the observer on testnet:
    ```bash
    deployObserver
    ```

8. Set the multisig address in ESDT safe on testnet:
    ```bash
    setMultisigAddress
    ```

9. Set the sovereign bridge address in ESDT safe on testnet:
    ```bash
    setSovereignBridgeAddress
    ```

10. Get funds in your wallet from a genesis wallet:
    ```bash
    getFundsInAddressSovereign
    ```

11. Set the fee market address in sovereign:
    ```bash
    setFeeMarketAddressSovereign
    ```

12. Disable the fee market contract in sovereign:
    ```bash
    disableFeeMarketContractSovereign
    ```

13. Unpause the ESDT safe contract in sovereign:
    ```bash
    unpauseEsdtSafeContractSovereign
    ```


:::

## Step 5: Stop Local Sovereign Chain

1. Stop the chain and all dependent services:
    ```bash
    stopAndCleanSovereign
    ```

:::important
This version of the documentation focuses solely on the essential steps required to set up and deploy a sovereign chain on either a local or remote computer. It does not include instructions for configuring:

- Round length
- Gas token
- Fee model
- Consensus model
- And other related settings
:::

