---
id: dex-walkthrough
title: DEX Walkthrough
---

[comment]: # (mx-abstract)

## Introduction

If you are building a project that involves decentralized exchange functionality, integrating DEX contracts can be a crucial step in achieving your goals. These contracts provide the underlying infrastructure necessary to facilitate the exchange of assets on a decentralized platform. However, implementing these contracts can be a complex process, and understanding the various public endpoints and functions can be challenging. In this in-depth walkthrough, we will guide you through the process of integrating DEX contracts into your __MultiversX__ project. We will cover all of the main contracts involved in a typical DEX implementation, and provide detailed explanations of the most commonly used public endpoints. By the end of this tutorial, you should have a solid understanding of how to implement DEX functionality in your own project, and be able to make informed decisions about how to customize and extend the functionality to meet your specific needs.

[comment]: # (mx-context-auto)

## Prerequisites

The DEX contracts are a bit more advance than you standard SCs, so basic knowledge about Rust SC development is required. If you are a beginner, an easier starting point (like the Crowdfunding SC or the Staking SC tutorials) is strongly advised. Also, to better grasp the DEX contracts implementation, it is important that you first understand the xExchange economic model.

:::important
You can find the xExchange whitepaper here:
https://xexchange.com/x-exchange-economics.pdf
:::

[comment]: # (mx-context-auto)

## **DEX repo structure** & recommendations

The main DEX contracts are as follow:

- __Pair SC__
- __Farm SC__
- __Proxy DEX SC__
- __Farm Staking SC__
- __Farm Staking Proxy SC__
- __Simple Lock SC__
- __Energy Factory SC__
- __Token Unstake SC__
- __Fees Collector SC__
- __Locked Token Wrapper SC__

:::important
You can find the repository containing all the DEX contracts here:
https://github.com/multiversx/mx-exchange-sc
:::

This walkthough was made based on a synchronous, intrashard contract calls flow as the suggested implementation. While you can still use async calls, that approach would complicate the implementation of any new projects building on top of the DEX contracts to some extent, with more complex gas handling requirements and callbacks logic. In order to have synchronous integration with the DEX contracts, the newly developed SCs need to be deployed on the same shard as the xExchange contracts.

Later on, with the launch of the AsyncV2 functionality, these kinds of contracts will be able to be deployed in other shards as well, as the protocol will support multiple asyncCalls.

:::important
You can find an in-depth overview of SC interactions here:
https://docs.multiversx.com/developers/developer-reference/sc-contract-calls
:::

[comment]: # (mx-context-auto)

## Pair SC

This contract allows users to provide liquidity and to swap tokens. Users are incentivized to add liquidity by earning rewards from fees and by being able to enter farms, thus earning even more rewards. This contract is usually deployed by the router smart contract and it (usually) has no dependency, as it is used as a DeFi primitive.

[comment]: # (mx-context-auto)

### Add liquidity

```rust
    pub type AddLiquidityResultType<BigUint> =
        MultiValue3<EsdtTokenPayment<BigUint>, EsdtTokenPayment<BigUint>, EsdtTokenPayment<BigUint>>;

    #[payable("*")]
    #[endpoint(addLiquidity)]
    fn add_liquidity(
        &self,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> AddLiquidityResultType<Self::Api>
```

The process of adding liquidity to a pool is a straightforward one and does not affect the ratio between the two tokens. Let's assume that the reserves of the first and second tokens are denoted by __rA__ and __rB__ respectively, while the desired amounts of those tokens to be added as liquidity are denoted by __aA__ and __aB__. In order to maintain the ratio of the tokens in the liquidity pool, the following formula must hold true: `rA / rB = aA / aB`. Calculating the appropriate values is easy since one of the desired values, __aA__ or __aB__, can be fixed, and the other one can be derived from the aforementioned formula.

For newly deployed pairs, the first liquidity addition sets the ratio and price of the tokens since there are no tokens in the pool yet, and thus no formula to be followed.

When the add liquidity function is called, it takes an array of two payments that correspond to the amounts the user wants to add to the liquidity pool. The order of the payments is important, as they must correspond to the order of the tokens in the contract. The function also takes in two arguments, __first_token_amount_min__ and __second_token_amount_min__, which represent the desired slippage, or the minimum amount of tokens that must be returned by the contract.

After all necessary checks and computations are done, the endpoint returns a vector of 3 payments to the user in the following order: __liquidity added__, the difference between the __first token__ amount sent by the user and the amount that was used, and the difference between the __second token__ amount sent by the user and the amount that was used. A __MultiValue__ of these 3 __EsdtTokenPayment__ is returned as the final result.

[comment]: # (mx-context-auto)

### Remove liquidity

```rust
    pub type RemoveLiquidityResultType<BigUint> =
        MultiValue2<EsdtTokenPayment<BigUint>, EsdtTokenPayment<BigUint>>;

    #[payable("*")]
    #[endpoint(removeLiquidity)]
    fn remove_liquidity(
        &self,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> RemoveLiquidityResultType<Self::Api>
```

The removal of liquidity from a pool is a process that can be thought of as the reverse of adding liquidity. It involves a liquidity provider sending their LP tokens back to the __Pair SC__ and providing the same parameters that were presented in the `addLiquidity` endpoint, namely the __first_token_amount_min__ and __second_token_amount_min__. In exchange, the provider receives back both types of tokens that he initially provided. Typically, for a pool that is relatively stable, the amounts received when removing liquidity will be greater than the amounts provided initially during the addition process, as they will include the accumulated swap fees.

After all the checks and computations are done, the endpoint constructs and sends back to the user a vector of 2 payments with the following amounts: __first_token_amount_removed__ and __second_token_amount_removed__. In the end, a __MultiValue__ of 2 __EsdtTokenPayment__ is returned.

[comment]: # (mx-context-auto)

### Swap tokens fixed input

```rust
    pub type SwapTokensFixedInputResultType<BigUint> = EsdtTokenPayment<BigUint>;
    
    #[payable("*")]
    #[endpoint(swapTokensFixedInput)]
    fn swap_tokens_fixed_input(
        &self,
        token_out: TokenIdentifier,
        amount_out_min: BigUint,
    ) -> SwapTokensFixedInputResultType<Self::Api>
```

This smart contract acts as an AMM based on the constant product formula `x * y = k`.
This means that swapping, when ignoring fees, would happen based on the following logic:

Let's assume that:

- __rI__ is the reserve of the input token (the one that the user paid)
- __rO__ is the reserve of the output token (the one that the user desires in exchange of the paid one)
- __aI__ is the amount of the input token
- __aO__ is the amount of the output token

```math
rI * rO = k
(rI + aI) * (rO - aO) = k
```

From the two equations, we can safely state that

```math
rI * rO = (rI + aI) * (rO - aO)
```

Where __aI__ would be known, and __aO__ would need to be calculated.

Considering __f__ being the percent of total fee, the formula including fees is the following:

```math
rI * rO = (rI + (1 - f) * aI) * (rO - aO)
```

The workflow of the endpoint is as follows: the users sends a payment with the tokens he wants to swap to the contract, along with 2 parameters (__token_out__ and __amount_out_min__). Based on the __token_out__ parameter, the swapping order is deducted, the variables are checked and then the contract performs the swap operation as described above.

In the end, the user receives back his requested tokens, with one important mention. If one of the pair tokens is an underlying version of a locked token, then the output token is locked before it is sent to the user. Finally, the endpoints returns the __EsdtTokenPayment__, containing the output token payment.

[comment]: # (mx-context-auto)

### Swap tokens fixed output

```rust
    pub type SwapTokensFixedOutputResultType<BigUint> =
        MultiValue2<EsdtTokenPayment<BigUint>, EsdtTokenPayment<BigUint>>;

    #[payable("*")]
    #[endpoint(swapTokensFixedOutput)]
    fn swap_tokens_fixed_output(
        &self,
        token_out: TokenIdentifier,
        amount_out: BigUint,
    ) -> SwapTokensFixedOutputResultType<Self::Api>
```

The flow is approximately the same as with the SwapFixedInput function, with the main difference that __aO__ is fixed and __aI__ is calculated using the same formulas. One other difference is that besides the desired tokens, the contract also sends back the __leftover__ tokens, in case there are any. The __leftover__ amount in this case is the difference between the __amount_in_max__ and the actual amount that was used to swap in order to get to the desired __amount_out__. 
In the end, the endpoint returns a __MultiValue__ of 2 __EsdtTokenPayment__.

[comment]: # (mx-context-auto)

## Farm SC

This base farm contract has the role of generating and distributing __MEX__ tokens to liquidity providers that choose to lock their LP tokens, thus increasing the ecosystem stability. On the xExchange, a variation of the __Farm__ contract is deployed, namely the __Farm with locked rewards__ contract, which heavily relies on the standard __Farm__ contract, the difference being that the generated rewards are locked (which also involves an additional energy computation step, according to the new xExchange economics model).

Throughout the __Farm SC__ we will come across an optional variable, namely __opt_orig_caller__. When building an external SC on top of the xExchange farm contract, this argument must always be sent as __None__ (it is used by the other whitelisted xExchange contracts to claim rewards and compute energy for another user, other that the caller - in our case the external xExchange contract). With the new update of the __MEX__ economics model (where SCs are allowed to have energy), the account that now has and uses the Energy can be the external SC itself, which later computes any existing rewards for its users or applies any other custom logic (e.g. like the __Energy DAO SC__) to further distribute those rewards.

[comment]: # (mx-context-auto)

### Enter farm

```rust
    pub type EnterFarmResultType<M> = DoubleMultiPayment<M>;

    #[payable("*")]
    #[endpoint(enterFarm)]
    fn enter_farm_endpoint(
        &self,
        opt_orig_caller: OptionalValue<ManagedAddress>,
    ) -> EnterFarmResultType<Self::Api>
```

This endpoint receives at least one payment:

- The first payment has to be of type __farming_token_id__, and represents the actual token that is meant to be locked inside the Farm contract.
- The additional payments, if any, will be current farm positions and will be merged with the newly created tokens, in order to consolidate all previous positions with the current one.

This endpoint will give back to the caller a Farm position as a result. This is a __MetaESDT__ that contains, in its attributes, information about the user input tokens and the current state of the contract when the user did enter. This information will be later used when trying to claim rewards or exit farm.

### Claim rewards

```rust
    pub type ClaimRewardsResultType<M> = DoubleMultiPayment<M>;

    #[payable("*")]
    #[endpoint(claimRewards)]
    fn claim_rewards_endpoint(
        &self,
        opt_orig_caller: OptionalValue<ManagedAddress>,
    ) -> ClaimRewardsResultType<Self::Api>
```

When a user makes a call to this endpoint, they must provide their current farm position (or positions). The endpoint will then use this position to compute the rewards that the user has earned. The rewards that are calculated will depend on each specific farm. Some farms may offer both base rewards and boosted rewards, with the latter being calculated only once every 7 epochs. Other farms may offer only base rewards.
In the end, the function will return two pieces of information: the updated farm position (which will now include the latest RPS information) and the amount of rewards that the user has earned.

[comment]: # (mx-context-auto)

### Exit farm

```rust
    pub type ExitFarmWithPartialPosResultType<M> =
    MultiValue3<EsdtTokenPayment<M>, EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(exitFarm)]
    fn exit_farm_endpoint(
        &self,
        exit_amount: BigUint,
        opt_orig_caller: OptionalValue<ManagedAddress>,
    ) -> ExitFarmWithPartialPosResultType<Self::Api>
```

The `exitFarm` endpoint allows users to exit their position in the farm. It receives the entire farm position as a payment, and an __exit_amount__ as a parameter, which tells the function with how much tokens the user wants to exit the farm. This logic was implemented in order to be able to compute the complete farm position's boosted rewards, without losing any tokens. 

The flows is as follows:
- The user calls the endpoint with his entire farm position as a single payment and specifies which is the exit amount
- The endpoint first computes the boosted rewards, if any, and then it exits the farm with the specified amount
- The energy of the user is updated accordingly (or deleted if the user exited the farm with the entire position)
- Lastly, the user receives back the initial farming position (usually the LP tokens), the rewards, if any, and the remaining farm position, in case he did not exit the farm with the entire position

[comment]: # (mx-context-auto)

### Merge farm tokens

```rust
    #[payable("*")]
    #[endpoint(mergeFarmTokens)]
    fn merge_farm_tokens_endpoint(
        &self,
        opt_orig_caller: OptionalValue<ManagedAddress>,
    ) -> EsdtTokenPayment<Self::Api>
```

The `mergeFarmTokens` endpoint allows users to send multiple farm positions and combine them into one aggregated position. One important aspect here is that in order to be able to merge the farm tokens, the user must have the energy claim progress up-to-date.

[comment]: # (mx-context-auto)

### Boosted rewards formula

It's worth noting that while not a specific function, the boosted rewards formula is still an important concept to understand when participating in certain farms. This formula is used to maximize the potential boosted rewards that an account can receive.

The formula takes into account several variables, including the amount of tokens that the user has staked in the farm (__user_farm_amount__), the total amount of tokens staked in the farm (__total_farm_amount__), the amount of energy that the user has (__user_energy_amount__), and the total amount of energy contributed to the farm (__total_energy__). It is important to mention that the weekly values are used. Additionally, certain boost factors are applied to further fine-tune the calculation of rewards. For example, some factors may overemphasize the importance of the user's energy contribution in the rewards calculation.

By understanding this formula, an account holder can determine how much energy they need to have in order to maximize the rewards for their current farm position. Alternatively, they can determine how much energy they need to obtain in order to to achieve a certain level of boosted rewards. This knowledge can be especially valuable for those projects seeking to optimize their yield farming strategies.

```rust
    // computed user rewards = total_boosted_rewards *
    // (energy_const * user_energy / total_energy + farm_const * user_farm / total_farm) /
    // (energy_const + farm_const)
    let boosted_rewards_by_energy =
        &weekly_reward.amount * &factors.user_rewards_energy_const * energy_amount
            / total_energy;
    let boosted_rewards_by_tokens =
        &weekly_reward.amount * &factors.user_rewards_farm_const * &self.user_farm_amount
            / &farm_supply_for_week;
    let constants_base = &factors.user_rewards_energy_const + &factors.user_rewards_farm_const;
    let boosted_reward_amount =
        (boosted_rewards_by_energy + boosted_rewards_by_tokens) / constants_base;

    // min between base rewards per week and computed rewards
    let user_reward = cmp::min(max_rewards, boosted_reward_amount);
    if user_reward > 0 {
        sc.remaining_boosted_rewards_to_distribute(week)
            .update(|amount| *amount -= &user_reward);

        user_rewards.push(EsdtTokenPayment::new(
            weekly_reward.token_identifier,
            0,
            user_reward,
        ));
    }
```

[comment]: # (mx-context-auto)

## Proxy DEX SC

This smart contract offers users with locked __MEX__ the possibility of interacting with the DEX contracts, for operations like adding liquidity or entering farms, as if they had __MEX__.

[comment]: # (mx-context-auto)

### Add liquidity proxy

```rust
    #[payable("*")]
    #[endpoint(addLiquidityProxy)]
    fn add_liquidity_proxy(
        &self,
        pair_address: ManagedAddress,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> MultiValueEncoded<EsdtTokenPayment>
```
 
The `addLiquidityProxy` intermediates liquidity adding in a __Pair SC__ as follows:
- The user must send the tokens in the same order as they are in the Pair contract
- The user must configure the slippage as he would in the Pair contract

The output payments of this endpoint consists not in the original LP token, but instead in a Wrapped LP token, along with any leftover tokens. The reason for wrapping the LP tokens is that if the user receives them directly, he would have had the possibility of removing the liquidity and thus unlocking his locked __MEX__.

[comment]: # (mx-context-auto)

### Remove liquidity proxy

 ```rust
    #[payable("*")]
    #[endpoint(removeLiquidityProxy)]
    fn remove_liquidity_proxy(
        &self,
        pair_address: ManagedAddress,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> MultiValueEncoded<EsdtTokenPayment>
```

The `removeLiquidityProxy` endpoint intermediates removing liquidity from a Pair contract as follows: the user sends Wrapped LP tokens and receives the first token and the locked __MEX__ tokens. The address and slippage are configurable as they would be for the __Pair SC__.

[comment]: # (mx-context-auto)

### Merge wrapped LP tokens

```rust
    #[payable("*")]
    #[endpoint(mergeWrappedLpTokens)]
    fn merge_wrapped_lp_tokens_endpoint(&self) -> EsdtTokenPayment
```

This function merges two or more positions of Wrapped LP tokens (LP positions obtained using locked __MEX__ instead of __MEX__ and this intermediary contract). The same logic as for __mergeWrappedFarmTokens__ is applied.

[comment]: # (mx-context-auto)

### Enter farm proxy

```rust
    #[payable("*")]
    #[endpoint(enterFarmProxy)]
    fn enter_farm_proxy_endpoint(&self, farm_address: ManagedAddress) -> EsdtTokenPayment
```

The process of entering a Farm contract is facilitated by the Enter Farm Proxy function. This involves the user sending Wrapped LP tokens and receiving Wrapped Farm tokens. The rationale behind using Wrapped Farm tokens is similar to that of Wrapped LP tokens.

It should be noted that the original LP tokens and Farm tokens are kept in the smart contract, which creates Wrapped Tokens. These original tokens will be used by the smart contract to carry out actions on behalf of the user.

[comment]: # (mx-context-auto)

### Exit farm proxy

```rust
    pub type ExitFarmProxyResultType<M> =
        MultiValue3<EsdtTokenPayment<M>, EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(exitFarmProxy)]
    fn exit_farm_proxy(
        &self,
        farm_address: ManagedAddress,
        exit_amount: BigUint,
    ) -> ExitFarmProxyResultType<Self::Api> 
```

The `exitFarmProxy` works exactly like its base contract couterpart, except it takes Wrapped Farm tokens as input. This includes the new __exit_amount__ logic, where the user sends his entire position and specifies the actual exit amount as an argument. The output of this endpoint consists of a __MultiValue__ of 3 __EsdtTokenPayment__, namely the __initial_proxy_farming_tokens__, the __reward_tokens__ and the __remaining_wrapped_tokens__, like with the base `exitFarm` endpoint.

[comment]: # (mx-context-auto)

### Claim rewards proxy

```rust
    pub type ClaimRewardsFarmProxyResultType<M> = MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(claimRewardsProxy)]
    fn claim_rewards_proxy(
        &self,
        farm_address: ManagedAddress,
    ) -> ClaimRewardsFarmProxyResultType<Self::Api>
```

As with the __exitFarm__ function, the `claimRewardsProxy` endpoint works in the exact same way as the base farm __claimRewards__ function, but instead it receives a payment of Wrapped Farm tokens. The output of this endpoint consists of a __MultiValue__ of 2 __EsdtTokenPayment__, namely the __new_wrapped_token__ and the __reward_tokens__.

[comment]: # (mx-context-auto)

### Merge wrapped farm tokens

```rust
    #[payable("*")]
    #[endpoint(mergeWrappedFarmTokens)]
    fn merge_wrapped_farm_tokens_endpoint(&self, farm_address: ManagedAddress) -> EsdtTokenPayment
```

This function merges two or more positions of Wrapped Farm (farm positions obtained using locked __MEX__ instead of __MEX__ and this intermediary contract). In order to merge two positions of this type, the contract uses merge endpoints for the underlying tokens like Farm tokens, locked __MEX__ tokens, Wrapped LP tokens and so on, and after that, the newly created Wrapped Farm token will just reference the newly created and merged underlying tokens.

## Farm Staking SC

This contract allows users to stake their tokens and/or LP tokens and earn rewards. It works in conjunction with the Farm Staking Proxy contract and offers the complete array of utility functions, from entering and exit the contract, to rewards handling and tokens merging.

It is important to note that the following functions are related to the current implementation of the __Farm Staking SC__, that does not take into account the user's energy. In the future, a new energy-integrated __Farm Staking SC__ will be used.

[comment]: # (mx-context-auto)

### Stake farm

```rust
    #[payable("*")]
    #[endpoint(stakeFarm)]
    fn stake_farm_endpoint(&self) -> EsdtTokenPayment
```
 
Endpoint that allows an user to stake his tokens (different for each contract) in order to enter the staking farm. It receives the farming_token as a payment and it sends the farm_token back to the caller.


[comment]: # (mx-context-auto)

### Farm staking claim rewards

```rust
    pub type ClaimRewardsResultType<M> = MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(claimRewards)]
    fn claim_rewards(&self) -> ClaimRewardsResultType<Self::Api>
```
 
Endpoint that allows the caller to send his farm staking tokens and to receive the corresponding rewards. The sent farm staking tokens are burnt and new tokens are minted, in order to reset that user's position. The output result of this endpoint consists of a __MultiValue__ of 2 __EsdtTokenPayment__, namely the __new_token__ and the __reward_tokens__.

[comment]: # (mx-context-auto)

### Farm staking compound rewards

```rust
    #[payable("*")]
    #[endpoint(compoundRewards)]
    fn compound_rewards(&self) -> EsdtTokenPayment
```

Payable endpoint that allows the caller to harvest the rewards generated by the staking farm and reinvest them seamlessly, within a single endpoint. It burns the current farm tokens and computes the actual position with the rewards included. It returns an __EsdtTokenPayment__ with the new farm staking tokens.

[comment]: # (mx-context-auto)

### Unstake farm staking

```rust
    pub type ExitFarmResultType<M> = MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(unstakeFarm)]
    fn unstake_farm(&self) -> ExitFarmResultType<Self::Api>
```

Endpoint that allows the user to unstake his farm staking tokens. It receives the __farm_token__ as a payment and it sends the __unbond_farming_token__ back to the caller. The __farm_tokens__ are burnt and the __unbond_farming_tokens__ are then minted through the `nft_create_tokens` function, which encodes the `UnbondSftAttributes` in the newly created tokens. Also, the calculated rewards, if any, are sent to the caller. The output result of this endpoint consists of a __MultiValue__ of 2 __EsdtTokenPayment__, namely the __new_token__ and the __reward_tokens__.

[comment]: # (mx-context-auto)

### Unbond farm staking

```rust
    #[payable("*")]
    #[endpoint(unbondFarm)]
    fn unbond_farm(&self) -> EsdtTokenPayment
```

Endpoint that allows the user to unbond his farming tokens. As previously stated, the `unstakeFarm` endpoint gives the user __unbond_farming_tokens__, that have the unbonding period encoded. The unbond function receives the __unbond_farming_tokens__ as a payment and decodes the unbonding period in order to check if the tokens can be unbonded. If the unbonding period has passed, the __unbond_farming_tokens__ are burnt and then the __farming_tokens__ are sent back to the caller.

[comment]: # (mx-context-auto)

### Merge farm staking tokens

```rust
    #[payable("*")]
    #[endpoint(mergeFarmTokens)]
    fn merge_farm_tokens_endpoint(&self) -> EsdtTokenPayment<Self::Api>
```

A payable endpoint that allows the user to merge his __farm_staking_tokens__. It is also the method that is called by the proxy farm staking contract in order to give the user his combined position. In this case, a __MultiESDTTransfer__ is being send by the proxy contract with the __lp_farm_token__ and the __proxy_dual_yield_token__. The new __lp_farm_tokens__ are being minted and sent back to the proxy contract, which will then send the new __dual_yield_tokens__ to the user. 

[comment]: # (mx-context-auto)

## Farm Staking Proxy SC

This SC works in conjunction with the Farm Staking contract and offers the configuration means for the dual yield token, that takes care of the staking logic of the farm staking process. As a high level overview, we can underline the following steps:
- The user follows the usual steps to enter a simple farm: add liquidity + enter farm with the LP tokens
- He then sends the farming tokens to the farm staking proxy contract
- The proxy contract calculates the user's position and simulates a transfer on his behalf to the staking contract. By being whitelisted as a trustworthy address, the staking contract accepts the data as a simulated transfer
- The staking contract calculates the farming token (by quoting the LP contract) and sends the farm staking position to the proxy contract
- The proxy contract keeps the farming token and sends the dual yield token instead to the user
- The user can then use the dual yield token to claim his rewards or unstake his position

For this walkthrough we will take a look at the main functions that you will use when implementing the __Farm Staking Proxy SC__. Again, as with the __Farm Staking SC__, this walkthrough uses the current implementation of the __Farm Staking Proxy SC__, that does not take into account the user's energy. When implementing these 2 DEX contracts be sure to check which is the latest version of the contracts.

[comment]: # (mx-context-auto)

### Stake farm proxy

```rust
    pub type StakeResult<Api> = EsdtTokenPayment<Api>;

    #[payable("*")]
    #[endpoint(stakeFarmTokens)]
    fn stake_farm_tokens(&self) -> StakeResult<Self::Api>
```
 
The first endpoint in the farm staking workflow. It receives the __farming_token__ as a single or as a multiple payment. The endpoint calculates the position for each payment and burns the current __dual_yield_token__ for the corresponding nonce, if there is any. The workflow continues by quoting the LP contract of the correct token amount and then simulates a token transfer with that amount towards the farm staking contract. It will then receive the corresponding __farm_staking_token__ amount (amount that will remain inside the contract) and will send the user the corresponding __dual_yield_token__.
It is important to mention that only the proxy contract can simulate the token transfer, by being whitelisted inside the farm staking contract to do so. This means that any outside attempts to replicate this process will fail in the staking contract.
Another aspect that is worth mentioning is that the endpoint will try to merge the user's position. For that, it calls the merging function of the farm staking contract in order to give the user a combined position.

[comment]: # (mx-context-auto)

### Claim farm staking proxy rewards

```rust
    pub type ClaimDualYieldResult<Api> = MultiValueEncoded<Api, EsdtTokenPayment<Api>>;

    #[payable("*")]
    #[endpoint(claimDualYield)]
    fn claim_dual_yield(&self) -> ClaimDualYieldResult<Self::Api>
```
 
For claiming rewards from the farm staking contract, the user has to send his __dual_yield_tokens__ to the proxy contract as a payment. Based on this payment, the proxy contract identifies the corresponding position for the user and burns those dual yield tokens. It then uses the staking farm tokens to claim the corresponding rewards. In the end, the proxy contract sends those claimed rewards to the user, along with a new, reset position for the __dual_yield_tokens__.
One thing to note here is that between claiming rewards in the farming contract and the staking contract, the balance of the LP token may vary. Because of that, the proxy contract first harvest the rewards from the farming contract with the initial known value and then requotes the LP contract to get the new LP ratio (that may or may not vary). It then harvest rewards with the new value.

[comment]: # (mx-context-auto)

### Unstake farm staking proxy

```rust
    pub type UnstakeResult<Api> = MultiValueEncoded<Api, EsdtTokenPayment<Api>>;

    #[payable("*")]
    #[endpoint(unstakeFarmTokens)]
    fn unstake_farm_tokens(
        &self,
        pair_first_token_min_amount: BigUint,
        pair_second_token_min_amount: BigUint,
        exit_amount: BigUint,
    ) -> UnstakeResult<Self::Api>
```

To unstake his current position, a user must send the desired amount of __dual_yield_tokens__ to the proxy contract. At this moment, the proxy contract knows, based on the sent __dual_yield_token__, both the __farm_token__ position and __staking_token__ position. The first step is for the proxy contract to withdraw the LP tokens from the farms and the liquidity from the pair contract. After that all the harvested rewards, the resulting __farming_tokens__ from removing the LP token and the unstake position of the staking token are all sent to the user. The unstaking process is ended with the burning of the __dual_yield_tokens__.
It is important to note that because of the user’s unstaked position, an unbonding period is not needed.

[comment]: # (mx-context-auto)

## Simple Lock SC

The __Simple Lock SC__ facilitates the locking of tokens, useful for example when launching a new token/product, while also offering the means to unlock or to use them in other xExchange contracts (like the __Pair SC__ or the __Farm SC__).

[comment]: # (mx-context-auto)

### Lock tokens

```rust
    #[payable("*")]
    #[endpoint(lockTokens)]
    fn lock_tokens_endpoint(
        &self,
        unlock_epoch: u64,
        opt_destination: OptionalValue<ManagedAddress>,
    ) -> EgldOrEsdtTokenPayment<Self::Api>
```

This endpoint receives any type of token as a payment (including __EGLD__) and locks them until `unlock_epoch`, by minting MetaESDT LOCKED tokens on a 1:1 ratio. If unlock epoch has already passed, the original tokens are sent instead. In the end, it sends the LOCKED tokens (or original payment if current_epoch >= unlock_epoch)

Arguments:
- unlock epoch - the epoch from which the LOCKED token holder may call the unlock endpoint
- opt_destination - OPTIONAL: destination address for the LOCKED tokens. Default is caller.

[comment]: # (mx-context-auto)

### Unlock tokens

```rust
    #[payable("*")]
    #[endpoint(unlockTokens)]
    fn unlock_tokens_endpoint(
        &self,
        opt_destination: OptionalValue<ManagedAddress>,
    ) -> EgldOrEsdtTokenPayment<Self::Api>
```

Endpoint that unlocks tokens, previously locked with the `lockTokens` endpoint, so it receives the LOCKED tokens as the payment. If the unlocking period has passed, the function sends & returns the originally locked tokens.

Arguments:
- opt_destination - OPTIONAL: destination address for the unlocked tokens

[comment]: # (mx-context-auto)

### Add liquidity locked tokens

```rust
    pub type AddLiquidityThroughProxyResultType<M> =
        MultiValue3<EsdtTokenPayment<M>, EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(addLiquidityLockedToken)]
    fn add_liquidity_locked_token(
        &self,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> AddLiquidityThroughProxyResultType<Self::Api>
```

As it name suggests, this endpoint allow users to use their locked tokens in order to provide liquidity as if they had the unlocked token. It will fail if a liquidity pool is not configured for the token pair. The endpoint can receive any type of payments pair from the following: `(LOCKED token, LOCKED token)` / `(LOCKED token, any token)` / `(any token, LOCKED token)`.

Arguments: 
- first_token_amount_min: forwarded to the LP pool, may not be zero. 
- second_token_amount_min: forwarded to the LP pool, may not be zero.

After the endpoint succesfully provides liquidity in the __Pair SC__, it returns a __MultiValue__ of 3 __EsdtTokenPayment__: the refunded tokens from the first payment and from the second payment, as well as the LP_PROXY tokens, which can later be used to further interact with the LP pool through this SC.

[comment]: # (mx-context-auto)

### Remove liquidity locked tokens

```rust
    pub type RemoveLiquidityThroughProxyResultType<M> =
        MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(removeLiquidityLockedToken)]
    fn remove_liquidity_locked_token(
        &self,
        first_token_amount_min: BigUint,
        second_token_amount_min: BigUint,
    ) -> RemoveLiquidityThroughProxyResultType<Self::Api>
```

The counterpart of the add liquidity function, it removes liquidity previously added through this SC. One important aspect here is what kind of tokens will the user receive back. If the unlock_epoch has not passed for the original LOCKED tokens, he caller will receive locked tokens. Otherwise, they will receive the unlocked version. It receives a payment of LP_PROXY tokens.

Arguments: 
- first_token_amount_min: forwarded to the LP pool, may not be zero. 
- second_token_amount_min: forwarded to the LP pool, may not be zero.

In the end, the endpoint sends to the user and returns a __MultiValue__ of 2 __EsdtTokenPayment__, consisting of the __first_token__ original liquidity and the __second_token__ original liquidity, along with any accumulated rewards for each token (included in the sent amount).

[comment]: # (mx-context-auto)

### Enter farm locked tokens

```rust
    pub enum FarmType {
        SimpleFarm,
        FarmWithLockedRewards,
    }

    pub type EnterFarmThroughProxyResultType<M> = MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(enterFarmLockedToken)]
    fn enter_farm_locked_token(
        &self,
        farm_type: FarmType,
    ) -> EnterFarmThroughProxyResultType<Self::Api>
```

Like with the __Pair SC__ interactions, this endpoint facilitates entering a farm with LOCKED tokens. User will choose if they want to enter a farm with normal rewards, or locked rewards. At this moment, in the case of the xExchange contracts, only farms with locked rewards are applicable. As with the normal farm contract, the user should provide not only the farming token (in our case the LP_PROXY tokens), but also any additional farm positions that he may have, in order to receive any accumulated reward.

Arguments:
- farm_type - The farm type the user wishes to enter.

The final output is a __MultiValue__ of 2 __EsdtTokenPayment__, consisting of the FARM_PROXY token, which can later be used to further interact with the specific farm, and any accumulated reward, if any.

[comment]: # (mx-context-auto)

### Exit farm locked tokens

```rust
    pub type ExitFarmThroughProxyResultType<M> = MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(exitFarmLockedToken)]
    fn exit_farm_locked_token(
        &self,
        exit_amount: BigUint,
    ) -> ExitFarmThroughProxyResultType<Self::Api>
```

Endpoint used to exit a farm previously entered through `enterFarmLockedToken`, so it receives a single payment consisting of __FARM_PROXY__ tokens. This payment should be the full farm position of the user, in order to also receive all the accumulated rewards.

Arguments:
- exit_amount - The amount that the user intends to withdraw from the farm

In the end, the function sends and returns a __MultiValue__ of 2 __EsdtTokenPayment__, consisting of the original farming tokens and the farm reward tokens, if any.

[comment]: # (mx-context-auto)

### Claim locked tokens farm rewards

```rust
    pub type FarmClaimRewardsThroughProxyResultType<M> =
        MultiValue2<EsdtTokenPayment<M>, EsdtTokenPayment<M>>;

    #[payable("*")]
    #[endpoint(farmClaimRewardsLockedToken)]
    fn farm_claim_rewards_locked_token(&self) -> FarmClaimRewardsThroughProxyResultType<Self::Api>
```

Another important public endpoint is `farmClaimRewardsLockedToken`, which claims the rewards from a previously entered farm. The __FARM_PROXY__ tokens received as a single payment are burned, and new ones are created. This is needed because every farm action changes the farm token nonce, to properly store the new token RPS. Finally, the output payments consist of a new __FARM_PROXY__ token, and the computed farm reward tokens.

[comment]: # (mx-context-auto)

## Energy Factory SC

Before delving into the __Energy Factory SC__, it is important to have a clear understanding of the Energy concept on the xExchange. The introduction of the __MultiversX__ DEX brought a new utility token, __XMEX__, which is the new locked version of the __MEX__ token. __XMEX__ offers users the ability to control the locking period through a lock/unlock mechanism. By locking __MEX__ tokens for a certain period (1, 2, or 4 years), the account accumulates Energy, with the amount of Energy increasing the longer the tokens are locked.

With the accumulated Energy, the account is eligible for various benefits, including collecting fees from swaps and __XMEX__ unlocks, Metabonding rewards, and most significantly, enhanced rewards for Farms and Metastaking. It is this Energy that is integral to the __Energy Factory SC__ and its functionality.

[comment]: # (mx-context-auto)

### Energy structure

```rust
    pub struct Energy<M: ManagedTypeApi> {
        amount: BigInt<M>,
        last_update_epoch: Epoch,
        total_locked_tokens: BigUint<M>,
}
```

The Energy refers to a struct that contains necessary data about the locked tokens held by an account, including the last update epoch and the actual computed amount of Energy. This struct is utilized in all the contracts that implement the Energy mechanism, including the __Farm SC__.

In the farm contract, the rewards __claim_progress__ of the user is saved as a struct that comprises an Energy structure and the last claim week. This enables the contract to keep track of the amount of Energy each user has in each week and the duration of time that has elapsed since their last claim.

[comment]: # (mx-context-auto)

### Energy factory lock tokens

```rust
    #[payable("*")]
    #[endpoint(lockTokens)]
    fn lock_tokens_endpoint(
        &self,
        lock_epochs: Epoch,
        opt_destination: OptionalValue<ManagedAddress>,
    ) -> EsdtTokenPayment
```

The `lockTokens` endpoint, as it name implies, locks a whitelisted token until a specified `unlock_epoch` and receive MetaESDT LOCKED tokens on a 1:1 ratio. Accepted input tokens:
- base asset token
- old factory token -> extends all periods to the provided option
- previously locked token -> extends period to the provided option

As for the arguments, the only one that needs to be sent is the __lock_epochs__ variable, which refers to the number of epochs for which the tokens are locked. The caller may only choose an option from the available ones, options that can be seen by querying `getLockOptions`. The second argument is the optional __opt_destination__, which represents the destination address for the LOCKED tokens. In case of a __None__ argument value, the default is the caller, and this will probably be the case for most SC that will be built on top of the DEX contract (in order to have their logic inside the contract). But of course the external contract can still specify another destination.

[comment]: # (mx-context-auto)

### Energy factory unlock tokens

```rust
    #[payable("*")]
    #[endpoint(unlockTokens)]
    fn unlock_tokens_endpoint(&self) -> EsdtTokenPayment
```

The `unlockTokens` endpoint, as it name suggests, unlocks tokens, previously locked with the `lockTokens` endpoint. This function works only with unlockable tokens, and it also updates the energy of the user as well. In case the tokens locking period has not passed, they can be unlocked through the `unlockEarly` endpoint.

[comment]: # (mx-context-auto)

### Unlock early

```rust
    #[payable("*")]
    #[endpoint(unlockEarly)]
    fn unlock_early(&self)
```

Unlocks a locked token, with an unbonding period. This incures a penalty. The longer the remaining locking time, the bigger the penalty. Tokens can be unlocked through another SC after the unbond period has passed. This endpoint updates the user's energy as well.

[comment]: # (mx-context-auto)

### Reduce lock period

```rust
    #[payable("*")]
    #[endpoint(reduceLockPeriod)]
    fn reduce_lock_period(&self, new_lock_period: Epoch) -> EsdtTokenPayment
```

Reduce the locking period of a locked token. This incures a penalty. The longer the reduction, the bigger the penalty. The __new_lock_period__ parameter must be one of the available lock options and is used as the new lock duration of the tokens. The endpoint returns the __new_locked_tokens__ payment, containing the new unlock epoch.

[comment]: # (mx-context-auto)

### Migrate old locked tokens

```rust
    #[payable("*")]
    #[endpoint(migrateOldTokens)]
    fn migrate_old_tokens(&self) -> MultiValueEncoded<EsdtTokenPayment>
```

With the new __MEX__ economic model, a new locked __MEX__ token was introduced, that benefits from all these new improved features, like the ability to extend the locking period, in order to gain more energy, or the __unlockEarly__ functionality, that allows the user to get the unlock tokens any time he wants, by paying a fee. This endpoint does just that, it receives a __PaymentsVec__ of legacy locked tokens, and returns back the new locked tokens. An important aspect here is that the new locking period is not maintained at a 1:1 parity, but instead a 4x longer locking period is used for the new token. This was introduced in order to avoid users gaming the system, by migrating and immediately unlocking the new locked __MEX__.

[comment]: # (mx-context-auto)

### Energy factory merge locked tokens

```rust
    #[payable("*")]
    #[endpoint(mergeTokens)]
    fn merge_tokens_endpoint(
        &self,
        opt_original_caller: OptionalValue<ManagedAddress>,
    ) -> EsdtTokenPayment
```

This endpoint receives a __PaymentsVec__ of locked tokens, which then merges into one locked token payment, and update the user's energy accordingly. As always, the __original_caller__ optional argument should be ignored (as it only accepts values from whitelisted addresses).

[comment]: # (mx-context-auto)

## Token Unstake SC

The __Energy Factory SC__ is one of the most used SC on the __MultiversX Network__. In order to keep it as simple as possible, the entire unlock/unbond __XMEX__ logic was designed as a different contract, namely the __Token Unstake SC__. Besides unbonding tokens, this contract offers the possibility to cancel the unbond process at any time, through a dedicated endpoint.

[comment]: # (mx-context-auto)

### Claim unlocked tokens

```rust
    #[endpoint(claimUnlockedTokens)]
    fn claim_unlocked_tokens(&self) -> MultiValueEncoded<EsdtTokenPayment>
```

This endpoint enables the user to initiate the unbonding process and receive their unlocked tokens. In the background, a record of the tokens that are eligible for unlocking (including the unbonding epoch) is maintained. When the user requests to claim their tokens, the system checks the list and only sends the tokens that are unlockable. However, before the tokens are sent, a penalty fee is applied (fee which is computed based on the lock duration of those newly unlocked tokens).

[comment]: # (mx-context-auto)

### Cancel unbond

```rust
    #[endpoint(cancelUnbond)]
    fn cancel_unbond(&self) -> MultiValueEncoded<EsdtTokenPayment>
```

The purpose of this endpoint is to enable users to cancel the unbonding process without incurring any fees. It is important to note that it is not possible to specify a particular token for which the unbonding process is to be reverted. For example, if a user wants to unbond two locked tokens and the unbonding period has expired only for one of them, they can either claim the unlocked token using the `claimUnlockedTokens` endpoint before cancelling the unbonding process to receive the second token, or they can use the `cancelUnbond` endpoint to receive both tokens directly without any penalty.

When a user cancels the unbonding process of a token, the __Energy Factory SC__ calculates the user's energy using the newly regained tokens and updates it accordingly.

[comment]: # (mx-context-auto)

## Fees Collector SC

The __Fees Collector SC__ plays a critical role in the new Energy mechanism and serves as a central contract that collects and distributes fees. These fees are collected in various tokens, including locked tokens, and they come from both trading and energy removal taxes. As the fee tokens accumulate, they are grouped by weeks to ensure that they are later collected by users once every seven epochs. This was necessary to avoid distributing amounts that are too small.

The collected fees are distributed to users who have locked their __MEX__ tokens and have accumulated energy as a result. The users are entitled to a multitude of benefits, including boosted rewards for Farms & Metastaking and collecting fees gathered from swaps and __XMEX__ unlocks. By gathering and distributing these fees, the __Fees Collector SC__ plays a crucial role in maintaining the new Energy mechanism relevant and ensuring that users are rewarded for their participation.

[comment]: # (mx-context-auto)

### Fees collector claim rewards

```rust
    #[endpoint(claimRewards)]
    fn claim_rewards(&self) -> PaymentsVec<Self::Api>
```

The `claimRewards` endpoint in the __Fees Collector SC__ allows users to claim their weekly rewards for the total energy that they've accumulated. The function calculates the user's rewards using a __ClaimProgress__ struct and a global weekly energy amount, and returns a PaymentsVec that includes all rewarded tokens, including locked __MEX__ tokens. It is important to note that the contract keeps rewards for as long as 4 weeks, so the tokens should be claimed at least once during each interval.

[comment]: # (mx-context-auto)

## Locked Token Wrapper SC

The __Locked Token Wrapper SC__ is used to distribute locked tokens through a wrapping mechanism, allowing anyone to wrap a token, but only user accounts to unwrap it. However, certain limitations are in place to ensure the security and integrity of the system. Users must first be granted a transfer role to send wrapped tokens, which is restricted to whitelisted addresses to prevent unauthorized users or projects from compromising the ecosystem. The contract is designed to provide a community-facilitating mechanism, particularly for projects building on top of the xExchange. Wrapping and unwrapping the locked token also updates the account's Energy, and this should be taken into account by projects using the contract.

Key aspects:
- Anyone (user or SC) can wrap a token
- Only user accounts can unwrap the token (SCs are limited only to wrapping the token)
- The wrapped token can be sent only by whitelisted addresses
- Wrapping & unwrapping the locked token also updates the account's Energy

[comment]: # (mx-context-auto)

### Wrap locked token

```rust
    #[payable("*")]
    #[endpoint(wrapLockedToken)]
    fn wrap_locked_token_endpoint(&self) -> EsdtTokenPayment
```

This function is designed to facilitate the wrapping of locked tokens. When called, the function receives a single payment of locked tokens, which are then deducted from the account's energy. The function then mints a new wrapped locked token and sends it to the caller.

[comment]: # (mx-context-auto)

### Unwrap locked token

```rust
    #[payable("*")]
    #[endpoint(unwrapLockedToken)]
    fn unwrap_locked_token_endpoint(&self) -> EsdtTokenPayment
```

This endpoint is responsible for unwrapping locked tokens that were previously minted using the `wrapLockedToken` endpoint. Upon calling this endpoint, the contract will burn the wrapped tokens, mint the locked tokens, and add back the correct amount of energy to the user's account. It's worth noting that only user accounts are authorized to call this endpoint, as smart contracts are prohibited from unwrapping tokens for security reasons explained previously.

[comment]: # (mx-context-auto)

## **Closing thoughts and next steps**

As you've learned from this walkthrough, integrating DEX contracts can be a complex but essential step in building a decentralized exchange platform. By understanding the key contracts and public endpoints, you can create a platform that is secure, reliable, and user-friendly. As with any development project, it's important to thoroughly test your code and perform due diligence to ensure that your platform is secure and reliable. Additionally, as the blockchain ecosystem is constantly evolving, it's important to stay up-to-date on the latest changes and developments of the DEX contracts in order to ensure that your platform remains competitive and relevant. With the knowledge and skills you've gained from this walkthrough, you are well on your way to building a successful and innovative Web3 application. Good luck with your project!