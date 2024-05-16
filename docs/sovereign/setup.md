# Setup Guide

**Disclaimer: This guide is a preliminary version and not the final documentation for sovereign chains. It serves as a starting point for setting up and deploying contracts.**

This guide will help you set up and deploy contracts on a sovereign chain. Follow these steps carefully to ensure a successful deployment.

## Step 1: Create a New Wallet

1. Create a new wallet:
    ```bash
    mxpy wallet new --format pem --outfile /home/ubuntu/wallet.pem
    ```

2. Download the WASM files from [here](https://github.com/multiversx/mx-sovereign-sc/releases).

## Step 2: Clone the ```mx-chain-go``` Repository

1. Clone the repository:
    ```bash
    git clone https://github.com/multiversx/mx-chain-go.git
    ```

2. Checkout the specific branch:
    ```bash
    git checkout chain-sdk-go
    ```

3. Navigate to the testnet scripts directory:
    ```bash
    cd mx-chain-go/scripts/testnet
    ```

4. Run the prerequisites script:
    ```bash
    ./prerequisites.sh
    ```

## Step 3: Deploy Contracts on Testnet

1. Update the `/config/configs.cfg` file with the OWNER and WASM file details. Example:
    ```ini
    # Owner Configuration
    WALLET="~/wallet.pem"
    WALLET_ADDRESS=erd1...

    # WASM Files
    ESDT_SAFE_WASM="~/contracts/esdt-safe.wasm"
    FEE_MARKET_WASM="~/contracts/fee-market.wasm"
    MULTISIG_VERIFIER_WASM="~/contracts/multisigverifier.wasm"
    ```

2. Navigate to the `sovereignBridge` directory:
    ```bash
    cd mx-chain-go/scripts/testnet/sovereignBridge/
    ```

3. Source the script:
    ```bash
    source script.sh
    ```

4. Deploy all bridge contracts automatically:
    ```bash
    deployAll
    ```

5. Initialize the sovereign chain:
    ```bash
    sovereignInit
    ```

Alternatively, you can deploy step-by-step:

    ```bash
    deployEsdtSafeContract
    deployFeeMarketContract
    setFeeMarketAddress
    disableFeeMarketContract
    unpauseEsdtSafeContract
    ```

## Step 4: Update Sovereign Configurations

1. Set the genesis contract:
    ```bash
    setGenesisContract
    ```

2. Update the sovereign configuration file:
    ```bash
    updateSovereignConfig
    ```

## Step 5: Prepare Docker Observer

1. Prepare the observer:
    ```bash
    prepareObserver
    ```

2. Or specify an image version:
    ```bash
    prepareObserver multiversx/chain-testnet:T1.7.4.0
    ```

## Step 6: Deploy Sovereign Chain & Contracts

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

## Step 7: Stop Local Sovereign Chain

1. Stop the chain and all dependent services:
    ```bash
    stopSovereign
    ```

# Sovereign Deposit Tokens Guide

## Main Chain -> Sovereign Chain

1. Update the `/config/configs.cfg` file with the token settings. Example:
    ```ini
    # Issue Token Settings
    TOKEN_TICKER=TKN
    TOKEN_DISPLAY_NAME=Token
    NR_DECIMALS=18
    INITIAL_SUPPLY=111222333
    ```

2. Navigate to the `sovereignBridge` directory:
    ```bash
    cd mx-chain-go/scripts/testnet/sovereignBridge/
    ```

3. Source the script:
    ```bash
    source script.sh
    ```

4. Issue a token on the main chain:
    ```bash
    issueToken
    ```

5. Deposit the token in the smart contract:
    ```bash
    depositTokenInSC
    ```

## Sovereign Chain -> Main Chain

1. Update the `/config/configs.cfg` file with the sovereign token settings. Example:
    ```ini
    # Issue Sovereign Token Settings
    TOKEN_TICKER_SOVEREIGN=SVN
    TOKEN_DISPLAY_NAME_SOVEREIGN=SovToken
    NR_DECIMALS_SOVEREIGN=18
    INITIAL_SUPPLY_SOVEREIGN=333222111
    ```

2. Navigate to the `sovereignBridge` directory:
    ```bash
    cd mx-chain-go/scripts/testnet/sovereignBridge/
    ```

3. Source the script:
    ```bash
    source script.sh
    ```

4. Issue a new token on the local sovereign chain:
    ```bash
    issueTokenSovereign
    ```

Steps to transfer tokens:

- Ensure the sovereign bridge contract has the BurnRole for the token you want to bridge. All new tokens have `ESDTBurnRoleForAll` enabled. If disabled, register the burn role:
    ```bash
    setLocalBurnRoleSovereign
    ```

- Register the sovereign token identifier on the main chain bridge contract:
    ```bash
    registerToken
    ```

- Deposit the token in the smart contract on the sovereign chain:
    ```bash
    depositTokenInSCSovereign
    ```
