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
