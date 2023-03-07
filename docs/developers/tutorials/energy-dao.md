---
id: energy-dao
title: Energy DAO SC tutorial
---

[comment]: # (mx-abstract)

## **Introduction**

This tutorial will provide an in-depth analysis of the Energy DAO SC template, diving deeper into the concept of Energy and how a smart contract can use it to provide utility for users. Furthermore, while going through the various features of the contract, we will underline different aspects about how you can modify the template, in order to best suit your requirements.

While being in a way a variation of the auto-farm SC, it was designed as a completely independent contract in the mx-exchange-tools repo. It can be cloned directly, without the need to import any other contract. The only external dependency is the xExchange suite of contracts, that are referenced through a Github commit hash from the latest version of that repo.

:::important
The Energy DAO template SC can be found at the following address:
https://github.com/multiversx/mx-exchange-tools-sc
:::

[comment]: # (mx-context-auto)

## **Prerequisites**

This tutorial requires some basic knowledge regarding SC development on MultiversX, so in case this is your first tutorial, it is recommended that you follow some more basic SC tutorials first, like the Crowdfunding SC or the Staking SC.

[comment]: # (mx-context-auto)

## **Design**

So what exactly is an Energy DAO? 

Let's first take a look at the concept of Energy. With the launch of the new MultiversX DEX, a new utility token was introduced. XMEX is the locked counterpart of the MEX token, and it allows users to control the locking period, through a lock / unlock mechanism. The MEX token can be locked for a predefined period of 1, 2 or 4 years, and the more time it is locked, the more Energy that account has. With that Energy, the account is then entitled to a multitude of benefits, including collecting fees gathered from swaps & XMEX unlocks, Metabonding rewards and most importantly, boosted rewards for Farms & Metastaking.

And this is where the Energy DAO contract comes in. With the newly introduced feature that allows Energy for contracts, we can now deploy a SC that allows users to use their assets to farm & stake tokens on xExchange, while also enjoying the boosted rewards, without having any Energy. It does it by allowing users to deposit their tokens in the Energy DAO contract, for staking purposes, while the contract receives and locks MEX tokens in order to gather energy that benefits all the users.

:::important
In order to also benefit the ecosystem, the entire process of having Energy for contracts comes with a few mentions. First of all, XMEX cannot be transfered unless that account is whitelisted by the __Energy Factory__ contract. This means the Energy of a SC must come from new MEX tokens that are locked by the contract itself. Also, in order to send the rewards generated in XMEX to the users, those tokens need to be wrapped (which means they lose their Energy property). By being wrapped, the tokens can then be transfered, but they can be unwrapped (in order to benefit again from the Energy mechanism) only by user accounts, and not other SCs.
:::

[comment]: # (mx-context-auto)

## **Contract structure**

The contract acts like a wrapper over the xExchange contracts, with different approaches for each of them. 

**Key aspects**

- The Energy DAO integrates multiple DEX contracts, including __Farms__, __Metastaking__ (Farm Staking), __Fees Collector__, __Energy Factory__, as well as other smaller utility contracts.
- The SC always keeps one aggregated position for each feature (__Farms__ and __Metastaking__), and computes rewards using a rewards-per-share algorithm.
- Each user position is represented by specific tokens issued by the Energy DAO SC. There are tokens for both Farm & Metastaking current positions, as well as tokens for unbonding positions.
- The tokens are storing different metadata according to the user position, including the position's __rps__.
- The __Farms__ integration covers all 3 interaction points of the farm contract, including __enter_farm__, __exit_farm__ (with a 7 days unbonding period) and __claim_rewards__ as well, which aggregates all rewards and distributes them using an internal __rps__ computation.
- The __Metastaking__ integration resembles pretty much with the __Farms__ integration, with a few differences, including a double __rps__ computation, for each reward token, as well as a different unbonding implementation, in line with the __Metastaking__ SC logic.
- This SC template keeps the rewards from the __Fees Collector__ contract as rewards for providind Energy. Also, while entering the SC and claiming rewards are penalty free, a fee of __x%__ is imposed on every user exit action (the fee percentage is subject to change for each project individually).

:::important
During the entire SC implementation, every time a DEX contract is called and the respective endpoins require the opt_original_caller argument, the value OptionalValue::None is passed, as we want all the benefits of the integration to be sent to Energy DAO contract. Later, the contract can manage how these rewards are computed and further distributed.
:::

[comment]: # (mx-context-auto)

## **Technical implementation**

In the following section we will go through the main interest points of the template implementation.

[comment]: # (mx-context-auto)

## Init and Cargo.toml

The `init` method of the Energy DAO smart contract is quite simple, as it only sets up different configs of the contract.

```rust
    #[init]
    fn init(
        &self,
        energy_factory_address: ManagedAddress,
        fees_collector_sc_address: ManagedAddress,
        locked_token_wrapper_sc_address: ManagedAddress,
        exit_penalty_percent: u64,
        farm_unbond_period: u64,
    ) {
        self.require_sc_address(&energy_factory_address);
        self.require_sc_address(&fees_collector_sc_address);
        self.require_sc_address(&locked_token_wrapper_sc_address);

        self.energy_factory_address()
            .set_if_empty(energy_factory_address);
        self.fees_collector_sc_address()
            .set_if_empty(fees_collector_sc_address);
        self.locked_token_wrapper_sc_address()
            .set_if_empty(locked_token_wrapper_sc_address);
        self.exit_penalty_percent()
            .set_if_empty(exit_penalty_percent);
        self.farm_unbond_period().set_if_empty(farm_unbond_period);

        let caller = self.blockchain().get_caller();
        self.add_permissions(caller, Permissions::OWNER);
    }
```

Now let's take a look at the general Cargo.toml file of the rust SC. Below you will see only a part of the entire Cargo.toml, for demonstration purposes. Other that the usual lines found in other SCs, you can see that xExchange dependencies are also declared. The particularity here is that they reference a particular Github commit hash of the DEX SCs, which you must be sure that it is always up-to-date with the last version of the DEX, deployed on the mainnet.

```rust
[package]
name = "energy-dao"
version = "0.0.0"
authors = ["you"]
edition = "2021"
publish = false

[lib]
path = "src/lib.rs"
[dependencies.multiversx-sc]
version = "0.39.4"
features = ["esdt-token-payment-legacy-decode"]

[dependencies.multiversx-sc-modules]
version = "0.39.4"

[dependencies.farm]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.farm-with-locked-rewards]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.farm-staking]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.farm-staking-proxy]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.pair]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.energy-factory]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.fees-collector]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.locked-token-wrapper]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.simple-lock]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.common_structs]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dependencies.mergeable]
git = "https://github.com/multiversx/mx-exchange-sc"
rev = "8812ab8"

[dev-dependencies]
num-bigint = "0.4.2"

[dev-dependencies.multiversx-sc-scenario]
version = "0.39.4"
```

:::important
For testing purposes, we recommend that you update the references in the Cargo.toml file to a local source, like the one below. This way, you can still do step-by-step debugging.
```rust
[dependencies.pair]
path = "../../mx-exchange-sc/dex/pair"
```
:::

[comment]: # (mx-context-auto)

## Energy DAO config

In the __EnergyDAOConfigModule__ you can find almost all the configs and general utilities of this SC.

**Token issuance**

There are 4 tokens issued by this Energy DAO SC template, 2 for wrapping the user positions inside the contract (for farms & metastaking), and 2 for unbonding. Let's look at the how we issue one of these tokens. The mx-sdk framework has a storage mapper that is specialized in non fungible token management, namely the __NonFungibleTokenMapper__. A payment of __0.05 EGLD__ is needed to issue a token on the MultiversX Network.

```rust
    #[only_owner]
    #[payable("EGLD")]
    #[endpoint(registerWrappedFarmToken)]
    fn register_wrapped_farm_token(
        &self,
        token_display_name: ManagedBuffer,
        token_ticker: ManagedBuffer,
        num_decimals: usize,
    ) {
        let payment_amount = self.call_value().egld_value();
        self.wrapped_farm_token().issue_and_set_all_roles(
            EsdtTokenType::Meta,
            payment_amount,
            token_display_name,
            token_ticker,
            num_decimals,
            None,
        );
    }
```
:::important
You can find more details about the __NonFungibleTokenMapper__ here:
https://docs.multiversx.com/developers/developer-reference/storage-mappers/#nonfungibletokenmapper
:::

**Farms & Metastaking addresses management**

The template SC stores the data for each farm or farm staking in a __SingleValueMapper__, having the address of that contract as the key for the storage mapper. For each __Farm__ or __Metastaking__ address, we save a __FarmState__ or a __MetastakingState__ respectively, each with its own specific variables. Please observe the fact that these management endpoints do not have the `#[only_owner]` adnotation, but instead restricts the possibility of being called in a custom way, so that it allows both the owner and some designated admins to manage these settings.  

```rust
    #[derive(TypeAbi, TopEncode, TopDecode, Debug)]
    pub struct FarmState<M: ManagedTypeApi> {
        pub farm_staked_value: BigUint<M>,
        pub farm_token_nonce: Nonce,
        pub reward_token_nonce: Nonce,
        pub farm_unstaked_value: BigUint<M>,
        pub reward_reserve: BigUint<M>,
        pub farm_rps: BigUint<M>,
    }

    #[endpoint(addFarms)]
    fn add_farms(&self, farms: MultiValueEncoded<ManagedAddress>) {
        self.require_caller_has_owner_or_admin_permissions();
        for farm_addr in farms {
            let farm_state_mapper = self.farm_state(&farm_addr);
            require!(farm_state_mapper.is_empty(), ERROR_FARM_ALREADY_DEFINED);
            self.require_sc_address(&farm_addr);

            let farm_state = FarmState {
                farm_staked_value: BigUint::zero(),
                farm_token_nonce: 0u64,
                reward_token_nonce: 0u64,
                farm_unstaked_value: BigUint::zero(),
                reward_reserve: BigUint::zero(),
                farm_rps: BigUint::zero(),
            };
            farm_state_mapper.set(farm_state);
        }
    }

    #[storage_mapper("farmState")]
    fn farm_state(&self, farm_address: &ManagedAddress) -> SingleValueMapper<FarmState<Self::Api>>;
```

[comment]: # (mx-context-auto)

## Farm integration

The Energy DAO __Farm__ integration refers to the following workflow: User A provides a farming position (LP token) and the DAO SC enters the DEX farm contract. Then a second user B does the same thing, at which moment the DAO contract enters with both the current position and user B's position, always maintaining an aggregated farm position. The users positions are kept using a new __WrappedFarmToken__, issued by the Energy DAO SC. As new rewards are accumulated, they are stored in the contract and a __reward_per_share__ computation is saved as the rewards pool increases. The __WrappedFarmToken__ contains data about the __rps__ computed at the moment when the user entered the SC, and with that token, the user can claim his corresponding rewards. Because the rewards are given in XMEX, they are always merged as they are accumulated, and when they are sent to the users, they are first wrapped, in order to be transferable (Wrapped XMEX can only be unwrapped by user accounts). In the end, the user can choose to exit the Energy DAO SC, and after an unbonding period that must pass, a fee is applied on the farming position, before the user receives his tokens.

This template contract splits the __Farm__ integration in 2 different files, for better readability. One with the actual user interactions (the endpoints), where all the custom computation are done, and another one with the more generic actions regarding the DEX farm contract integration and any other general functions needed on this part.

[comment]: # (mx-context-auto)

### Farm actions

Here we have a code snippet, that does the actual interaction with the farm contract. We use a __farm_proxy__ imported from the DEX reference declared in the Cargo.toml file, proxy that receives the address of the corresponding farm. We then call the desired endpoint on the farm contract (in our case __enter_farm_endpoint__) using a multi_token_transfer of a __PaymentsVec__ received as an argument. Under the hood, this is a __ManagedVec__ of __ESDTTokenPayments__ usually consisting in two payments, the first one the being the position with which the user wants to enter the contract, and the second one the rest of the contract's aggregated position. Finally, the function returns an __EnterFarmResultType__ (type imported from the farm contract), which represents a __MultiValue2__ of __ESDTTokenPayments__, the first payment representing the new aggregated farm position, and the second one the boosted_rewards, if any.

```rust
    fn call_enter_farm(
        &self,
        farm_address: ManagedAddress,
        farming_tokens: PaymentsVec<Self::Api>,
    ) -> EnterFarmResultType<Self::Api> {
        self.farm_proxy(farm_address)
            .enter_farm_endpoint(OptionalValue::<ManagedAddress>::None)
            .with_multi_token_transfer(farming_tokens)
            .execute_on_dest_context()
    }

    #[proxy]
    fn farm_proxy(&self, sc_address: ManagedAddress) -> farm_with_locked_rewards::Proxy<Self::Api>;
```

:::important
A very important aspect here is that, with the current protocol design, in order to work as intended, the EnergyDAO SC must be deployed on the same shard as the DEX, in order to use intrashard contract calls and have syncronous, realtime SC results from the xExchange contracts.
Later on, with the launch of the AsyncV2 functionality, these kinds of contracts will be able to be deployed in other shards as well, as the protocol will support multiple asyncCalls.
:::

The other farm_proxy calls (__exit_farm__ & __claim_rewards__) follow the same logic as the one presented above, using the proper parameters for each case individually.

Going further, we can look at the `update_farm_after_claim` function (along with some descriptive comments), which updates the farm state, and which is called every time the `total_farm_supply` or `rewards_reserve` variables are updated (basically each time a proxy farm endpoint is called).

```rust
    fn update_farm_after_claim(
        &self,
        initial_farm_state: &FarmState<Self::Api>,
        farm_state_mapper: &mut SingleValueMapper<FarmState<Self::Api>>,
        new_farm_token: &EsdtTokenPayment,
        farm_rewards: EsdtTokenPayment,
        division_safety_constant: &BigUint,
    ) {
        // We instantiate the most current farm state
        let mut farm_state = farm_state_mapper.get();

        // The total stake value and the nonce of the new aggregated farm position are always saved
        // We then either return if there are no new rewards, or continue to further update the farm state
        farm_state.farm_staked_value = new_farm_token.amount.clone();
        farm_state.farm_token_nonce = new_farm_token.token_nonce;

        if farm_rewards.amount == 0 {
            farm_state_mapper.set(farm_state);
            return;
        }

        // The total farm rps is updated, using the newly aggregated farm position and the new received rewards
        let rps_increase = self.compute_farm_rps_increase(
            &farm_rewards.amount,
            &new_farm_token.amount,
            division_safety_constant,
        );

        // In most cases there will always be some remaining rewards so each time more rewards are accumulated,
        // we merge the new rewards with the existing ones, in order to always keep one position
        let new_rewards = if initial_farm_state.reward_reserve > 0 {
            let mut reward_payments = ManagedVec::new();
            let current_rewards = EsdtTokenPayment::new(
                farm_rewards.token_identifier.clone(),
                initial_farm_state.reward_token_nonce,
                initial_farm_state.reward_reserve.clone(),
            );
            reward_payments.push(farm_rewards);
            reward_payments.push(current_rewards);
            self.merge_locked_tokens(reward_payments)
        } else {
            farm_rewards
        };

        // Finally, we update all these variables in the farm state and save the updated state in the storage 
        farm_state.reward_token_nonce = new_rewards.token_nonce;
        farm_state.reward_reserve = new_rewards.amount;
        farm_state.farm_rps += rps_increase;

        farm_state_mapper.set(farm_state);
    }
```

Another part that is worth mentioning is the function that computes the user rewards. It is very important that this function is called after the `update_farm_after_claim` function, otherwise the rewards computation will be inconsistent. The user rewards are computed based on the __token_rps__ variable that is saved in the __WrappedFarmToken__ attributes. In the end, a new TokenPayment is returned, containing the computed amount and the current rewards token_nonce (this is why we always merge the locked rewards and keep only one position).

```rust
    fn compute_user_rewards_payment(
        &self,
        farm_state_mapper: &mut SingleValueMapper<FarmState<Self::Api>>,
        payment: &EsdtTokenPayment,
        division_safety_constant: &BigUint,
    ) -> EsdtTokenPayment {
        let farm_state = farm_state_mapper.get();
        let token_attributes: WrappedFarmTokenAttributes<Self::Api> =
            self.get_token_attributes(&payment.token_identifier, payment.token_nonce);
        let token_rps = token_attributes.token_rps;
        let reward = if farm_state.farm_rps > token_rps {
            let rps_diff = &farm_state.farm_rps - &token_rps;
            &payment.amount * &rps_diff / division_safety_constant
        } else {
            BigUint::zero()
        };
        let locked_token_id = self.get_locked_token_id();
        EsdtTokenPayment::new(locked_token_id, farm_state.reward_token_nonce, reward)
    }
```

[comment]: # (mx-context-auto)

### Farm interactions

The __FarmInteractionsModule__ is the place where you can find the most of the __Farm__ integration logic.

Let's take a look at the `enter_farm` endpoint, with some descriptive comments.

```rust
    // The farm_address argument specifies which farm the user wants to enter.
    #[payable("*")]
    #[endpoint(enterFarm)]
    fn enter_farm_endpoint(&self, farm_address: ManagedAddress) -> EsdtTokenPayment {
        let payment = self.call_value().single_esdt();

        // We load the farm_state_mapper into a variable, to avoid reading it multiple times from the storage
        // We then do a set of checks, to avoid SC errors from the beginning, in case some variables are not correct
        let mut farm_state_mapper = self.farm_state(&farm_address);
        require!(!farm_state_mapper.is_empty(), ERROR_FARM_DOES_NOT_EXIST);
        let farming_token_id = self.get_farming_token(&farm_address);
        require!(
            farming_token_id == payment.token_identifier,
            ERROR_BAD_PAYMENT_TOKENS
        );

        let farm_state = farm_state_mapper.get();
        let farm_token_id = self.get_farm_token(&farm_address);
        let division_safety_constant = self.get_division_safety_constant(&farm_address);
        let mut enter_farm_payments = ManagedVec::from_single_item(payment);

        // We create a new payment with the current aggregated farm position from the farm state
        // We then add it as an additional payment for the DEX enter_farm endpoint, in case the amount is greater than 0
        let current_farm_position = EsdtTokenPayment::new(
            farm_token_id,
            farm_state.farm_token_nonce,
            farm_state.farm_staked_value.clone(),
        );
        let initial_total_farm_amount = current_farm_position.amount.clone();
        if initial_total_farm_amount > 0 {
            enter_farm_payments.push(current_farm_position);
        }

        // DEX enter farm is called with a PaymentsVec, consisting of the user payment and the current SC total farm position
        let enter_farm_result = self.call_enter_farm(farm_address.clone(), enter_farm_payments);

        // We receive a result containing the new aggregated postion as well as any boosted rewards, if any
        // The new total position should be bigger than the initial position that we saved prior to entering the farm
        let (new_farm_token, farm_rewards) = enter_farm_result.into_tuple();

        require!(
            new_farm_token.amount > initial_total_farm_amount,
            ERROR_EXTERNAL_CONTRACT_OUTPUT
        );

        let user_farm_amount = &new_farm_token.amount - &initial_total_farm_amount;

        // The contract then updates the farm state, updating variables like total farm supply, total rewards or reward_per_share
        // More detailed info was presented in the Farm Actions section
        self.update_farm_after_claim(
            &farm_state,
            &mut farm_state_mapper,
            &new_farm_token,
            farm_rewards,
            &division_safety_constant,
        );

        // Finally, a new WrappedFarmToken is minted (containing the current farm_rps) and sent to the user
        let caller = self.blockchain().get_caller();
        let new_farm_state = farm_state_mapper.get();
        let user_token_attributes = WrappedFarmTokenAttributes {
            farm_address,
            token_rps: new_farm_state.farm_rps,
        };
        self.wrapped_farm_token().nft_create_and_send(
            &caller,
            user_farm_amount,
            &user_token_attributes,
        )
    }
```

Going futher to the `claim_user_rewards` endpoint, we can observe the same logical layout as with the `enter_farm_endpoint`, with a few particularities. We start once again reading the user's payment and checking that all variables are in the correct state, before calling the `claim_and_compute_user_rewards` function, which does a few operations (calls the claim_rewards endpoint from the DEX farm, updates the farm state, burns the current __WrappedFarmToken__ and then computes and returns the current accumulated rewards of the user). After that, a new __WrappedFarmToken__ is minted, containing the up-to-date __farm_rps__. Finally, the new position alongside the computed rewards are then sent to the user, but not before wrapping the reward tokens, in order to be able to make the transfer.

```rust
    #[payable("*")]
    #[endpoint(claimUserRewards)]
    fn claim_user_rewards(&self) -> PaymentsVec<Self::Api> {
        let payment = self.call_value().single_esdt();
        require!(
            payment.token_identifier == self.wrapped_farm_token().get_token_id(),
            ERROR_BAD_PAYMENT_TOKENS
        );
        let token_attributes: WrappedFarmTokenAttributes<Self::Api> =
            self.get_token_attributes(&payment.token_identifier, payment.token_nonce);
        let farm_address = token_attributes.farm_address;
        let mut farm_state_mapper = self.farm_state(&farm_address);
        require!(!farm_state_mapper.is_empty(), ERROR_FARM_DOES_NOT_EXIST);

        let (_, user_rewards) = self
            .claim_and_compute_user_rewards(&payment, &farm_address, &mut farm_state_mapper)
            .into_tuple();

        let new_farm_state = farm_state_mapper.get();
        let new_attributes = WrappedFarmTokenAttributes {
            farm_address,
            token_rps: new_farm_state.farm_rps,
        };
        let new_farm_token = self
            .wrapped_farm_token()
            .nft_create(payment.amount, &new_attributes);
        let mut user_payments = ManagedVec::from_single_item(new_farm_token);
        if user_rewards.amount > 0 {
            let wrapper_user_rewards = self.wrap_locked_token(user_rewards);
            user_payments.push(wrapper_user_rewards);
        }
        let caller = self.blockchain().get_caller();
        self.send().direct_multi(&caller, &user_payments);

        user_payments
    }
```

**Unstake and unbond**

There are a few things that are important to keep in mind when exiting from a farm. In order to avoid having users that enter & benefit from the boosted rewards, to then just exit after the boosted rewards are computed, the farm contract has a 7 day penalty period policy, in which if the user exits the farm after entering, he will receive a certain penalty fee. That is why, there is a __farm_unbond_period__ in the DAO contract (should be equal or greater than the DEX farm penalty period) that the user needs to wait before exiting the farm.

For that, the Energy DAO SC has an unstake & unbond mechanism, that is actually imposed only at the DAO SC level, and not by the actual farm contract. But how exactly can the user wait a predefined period of time, if the contract always keeps one general aggregated position?
When the users calls the `unstake_farm` endpoint, the farm proxy `claim_rewards` endpoint is called with the full position, which then gives the user his last rewards before unstaking his position. Then, while the newly created total farm position nonce is saved in both the farm state and the __UnstakeFarmToken__ attributes, the __farm_staked_value__ value is updated to reflect the user exit, by substracting the payment amount. And from this point forward, in future user interactions, the new amount and that token nonce will be used to do any kind of farm interaction, which will then lead to creating a new aggregated farm position (which in turn will have a different nonce).

```rust
    #[payable("*")]
    #[endpoint(unstakeFarm)]
    fn unstake_farm(&self) -> PaymentsVec<Self::Api> {
        let payment = self.call_value().single_esdt();
        require!(
            payment.token_identifier == self.wrapped_farm_token().get_token_id(),
            ERROR_BAD_PAYMENT_TOKENS
        );
        let token_attributes: WrappedFarmTokenAttributes<Self::Api> =
            self.get_token_attributes(&payment.token_identifier, payment.token_nonce);
        let farm_address = token_attributes.farm_address;
        let mut farm_state_mapper = self.farm_state(&farm_address);
        require!(!farm_state_mapper.is_empty(), ERROR_FARM_DOES_NOT_EXIST);

        let (new_farm_token, user_rewards) = self
            .claim_and_compute_user_rewards(&payment, &farm_address, &mut farm_state_mapper)
            .into_tuple();

        farm_state_mapper.update(|config| {
            config.farm_staked_value -= &payment.amount;
            config.farm_unstaked_value += &payment.amount;
        });
        let current_epoch = self.blockchain().get_block_epoch();
        let unstake_attributes = UnstakeFarmAttributes {
            farm_address,
            unstake_epoch: current_epoch,
            token_nonce: new_farm_token.token_nonce,
        };
        let unstake_token_payment = self
            .unstake_farm_token()
            .nft_create(payment.amount, &unstake_attributes);

        let mut user_payments = ManagedVec::from_single_item(unstake_token_payment);
        if user_rewards.amount > 0 {
            let wrapper_user_rewards = self.wrap_locked_token(user_rewards);
            user_payments.push(wrapper_user_rewards);
        }
        let caller = self.blockchain().get_caller();
        self.send().direct_multi(&caller, &user_payments);

        user_payments
    }
```

Finally, when the unbonding period has passed, the Energy DAO contract exits the farm with the amount of __UnstakeFarmToken__ that the user sends when calling this endpoint, and the token nonce that was saved in the attributes. After that, the __UnstakeFarmToken__ is burned, and the user gets his assets back, but not before the exit fee (discussed in the beginning) is applied.

```rust
    #[payable("*")]
    #[endpoint(unbondFarm)]
    fn unbond_farm(&self) -> PaymentsVec<Self::Api> {
        let payment = self.call_value().single_esdt();
        require!(
            payment.token_identifier == self.unstake_farm_token().get_token_id(),
            ERROR_BAD_PAYMENT_TOKENS
        );
        let token_attributes: UnstakeFarmAttributes<Self::Api> =
            self.get_token_attributes(&payment.token_identifier, payment.token_nonce);
        let farm_address = token_attributes.farm_address;
        let farm_state_mapper = self.farm_state(&farm_address);
        require!(!farm_state_mapper.is_empty(), ERROR_FARM_DOES_NOT_EXIST);

        let current_epoch = self.blockchain().get_block_epoch();
        let unbond_period = self.farm_unbond_period().get();
        let unbond_epoch = token_attributes.unstake_epoch + unbond_period;
        require!(current_epoch >= unbond_epoch, ERROR_UNBOND_TOO_SOON);

        let farm_token_id = self.get_farm_token(&farm_address);
        let unstake_payment = EsdtTokenPayment::new(
            farm_token_id,
            token_attributes.token_nonce,
            payment.amount.clone(),
        );
        let exit_farm_result = self.call_exit_farm(farm_address, unstake_payment);
        let (mut farming_tokens, locked_rewards_payment, _) = exit_farm_result.into_tuple();

        farm_state_mapper.update(|config| {
            config.farm_unstaked_value -= &payment.amount;
        });

        self.send().esdt_local_burn(
            &payment.token_identifier,
            payment.token_nonce,
            &payment.amount,
        );
        self.apply_fee(&mut farming_tokens);
        let mut user_payments = ManagedVec::from_single_item(farming_tokens);
        if locked_rewards_payment.amount > 0 {
            user_payments.push(locked_rewards_payment);
        }
        let caller = self.blockchain().get_caller();
        self.send().direct_multi(&caller, &user_payments);

        user_payments
    }
```

[comment]: # (mx-context-auto)

## Metastaking integration

The __Metastaking__ integration is quite similar to the __Farms__ integration, so following this integration should be pretty straightforward by now. There are still a few different nuances, especially regarding rewards computation (there are now 2 different reward tokens and for that we have 2 different rps amounts, one for each token) and the unstake & unbond mechanism (as this differs from the farm logic, by being imposed by the DEX contract), but none should provide any difficulties at this point.

:::note
You can find the entire Energy DAO contract, including the __Metastaking__ implementation, here:
https://github.com/multiversx/mx-exchange-tools-sc/tree/main/energy-dao/src/external_sc_interactions
:::

[comment]: # (mx-context-auto)

## Locked token integration

This Energy DAO contract template was designed with the following workflow regarding the accumulation of Energy
- The owner buys MEX tokens and sends them to the Energy DAO SC
- The contract then locks & energizes the account
- For providing the tokens that are now locked, the owner is entitled to rewards from the __Fees Collector__, as well as the exit fees (the percentage can be changed by each project) from users that use the Energy DAO contract.

The workflow can be updated, for example allowing admin wallets to also deposit MEX tokens in order to further energize the Energy DAO SC, but that may require some extra data handling. For this documentation though, we'll stick to the workflow presented above.

The `lock_energy_tokens` endpoint is quite simple, it just verifies that the token sent is the correct one, calls the lock endpoint, and then stores a list of locked tokens, that will make future locked tokens management more easier (feature is not implemented at this time). It receives a __lock_epoch__ argument, allowing the owner to choose for what period he wants to lock his tokens. In case the argument is not correct, the contract call will fail during the `lock_tokens_endpoint` execution in the __Energy Factory__ contract.

```rust
    #[only_owner]
    #[payable("*")]
    #[endpoint(lockEnergyTokens)]
    fn lock_energy_tokens(&self, lock_epoch: u64) {
        let payment = self.call_value().single_esdt();
        let base_token_id = self.get_base_token_id();
        require!(
            payment.token_identifier == base_token_id,
            ERROR_BAD_PAYMENT_TOKENS
        );

        let new_locked_tokens = self.lock_tokens(payment, lock_epoch);
        self.internal_locked_tokens()
            .update(|locked_tokens| locked_tokens.push(new_locked_tokens));
    }

    #[storage_mapper("internalLockedTokens")]
    fn internal_locked_tokens(&self) -> SingleValueMapper<PaymentsVec<Self::Api>>;
```

Diving deeper into the `lock_tokens` endpoint, the external interaction for locking the deposited tokens is done calling the __Energy Factory__ contract (__energy_factory_address__ was saved in the init function), using the desired epoch which is sent as an argument.

```rust
    fn lock_tokens(&self, payment: EsdtTokenPayment, epoch: Epoch) -> EsdtTokenPayment {
        let energy_factory_address = self.energy_factory_address().get();
        self.energy_factory_proxy(energy_factory_address)
            .lock_tokens_endpoint(epoch, OptionalValue::<ManagedAddress>::None)
            .with_egld_or_single_esdt_transfer(payment)
            .execute_on_dest_context()
    }
```

:::important
__Food for thought.__ In this version of the contract, the XMEX solely purpose is to provide energy for the account. In a future iteration, the Energy DAO could be extended to accept WEGLD as a one side payment, in order to enter the MEX-EGLD farm. But a completely new logic needs to be defined on this part, in order to make it attractive for the external users to provide the WEGLD, while also remaining profitable for the contract as well.
:::

[comment]: # (mx-context-auto)

## Collecting fees and the RewardsWrapper

In this version of the Energy DAO template, for providing MEX for the Energy, the owner of the contract is entitled to the rewards from the __Fees Collector__. Besides these rewards, the contract also takes an exit fee from users using it. For better handling these fees (they are kept in separate storages, for clear distinction), the Energy DAO SC implements a __RewardsWrapper__ which has some features that simplifies the rewards handling inside the contract.

Let's first look at the __Fees Collector__ integration.

The base idea of this endpoint is that it calls the __fees_collector_proxy__, receives a __PaymentsVec__ of rewards (based on the Energy of the account), and then saves them through the __RewardsWrapper__ in the __collected_fees__ storage mapper.

```rust
    #[endpoint(claimFeesCollectorRewards)]
    fn claim_fees_collector_rewards(&self) {
        let mut rewards = self.call_fees_collector_claim();
        let rewards_len = rewards.len();
        if rewards_len == 0 {
            return;
        }

        // tokens from the fees collector are kept by the contract
        let collected_fees_mapper = self.collected_fees();
        let mut new_collected_fees = if collected_fees_mapper.is_empty() {
            let locked_token_id = self.get_locked_token_id();
            RewardsWrapper::new(locked_token_id)
        } else {
            collected_fees_mapper.get()
        };

        // locked token rewards, if any, are always in the last position
        let last_payment = rewards.get(rewards_len - 1);
        if &last_payment.token_identifier == new_collected_fees.get_locked_token_id() {
            let mut fees_payments = new_collected_fees.locked_tokens.into_payments();
            fees_payments.push(last_payment);
            let new_locked_fee = self.merge_locked_tokens(fees_payments);
            new_collected_fees.locked_tokens = UniquePayments::new();
            new_collected_fees.add_tokens(new_locked_fee);
            rewards.remove(rewards_len - 1);
        }

        for rew in &rewards {
            new_collected_fees.add_tokens(rew);
        }
        collected_fees_mapper.set(new_collected_fees);
    }

    fn call_fees_collector_claim(&self) -> PaymentsVec<Self::Api> {
        let sc_address = self.fees_collector_sc_address().get();
        self.fees_collector_proxy(sc_address)
            .claim_rewards(OptionalValue::<ManagedAddress>::None)
            .execute_on_dest_context()
    }

    #[proxy]
    fn fees_collector_proxy(&self, sc_address: ManagedAddress) -> fees_collector::Proxy<Self::Api>;

    #[storage_mapper("feesCollectorScAddress")]
    fn fees_collector_sc_address(&self) -> SingleValueMapper<ManagedAddress>;

    #[storage_mapper("collectedFees")]
    fn collected_fees(&self) -> SingleValueMapper<RewardsWrapper<Self::Api>>;
```

**RewardsWrapper deep dive**

The __RewardsWrapper__ is basically a small struct with a few custom implementations. It first stores the __locked_token_id__, which is needed in order to check the TokenIdentifier of the payment, to see if it is a fungible reward payment, or a XMEX payment. It may seem a bit strange to save this information at this level, but the alternative is to check each time for the token_id during the endpoints execution, by reading the __locked_token_id__ from the storage. That's why, saving it in this manner, actually increases the efficiency of the contract.

```rust
    #[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, PartialEq, Debug)]
    pub struct RewardsWrapper<M: ManagedTypeApi> {
        locked_token_id: TokenIdentifier<M>,
        pub locked_tokens: UniquePayments<M>,
        pub other_tokens: UniquePayments<M>,
    }

    impl<M: ManagedTypeApi> RewardsWrapper<M> {
        pub fn new(locked_token_id: TokenIdentifier<M>) -> Self {
            Self {
                locked_token_id,
                locked_tokens: UniquePayments::default(),
                other_tokens: UniquePayments::default(),
            }
        }

        pub fn add_tokens(&mut self, payment: EsdtTokenPayment<M>) {
            if payment.token_identifier == self.locked_token_id {
                self.locked_tokens.add_payment(payment);
            } else {
                self.other_tokens.add_payment(payment);
            }
        }

        #[inline]
        pub fn get_locked_token_id(&self) -> &TokenIdentifier<M> {
            &self.locked_token_id
        }
    }
```

But then, what about the __UniquePayments__ struct? Well, the __UniquePayments__ is a single field struct, containing a simple __PaymentsVec__, but with a few implementations of its own. It implements the more generic __default()__ and __new()__ functions, and also a few other simple utility functions, like __new_from_payments()__ and __into_payments()__, which are self explanatory.
Now, the magic under the hood, so to speak, is that it also implements the __Mergeable__ trait from the DEX modules, which allows it to check if a new payment can be merged, and also handles the entire merging process, comparing both the token_id and the token_nonce of the payment. This merging algorithm is then used inside the custom __add_payment()__ function of the __UniquePayments__ struct, which simply receives the new payment that needs to be either added or merged, depending if another similiar ESDTTokenPayment already exists or not, always keeping only one instance of a token id/nonce pair (hence the name __UniquePayments__).
This all helps throughout the contract, including in the __claim_fees_collector_rewards__ presented above, where we simply call the __add_tokens__ function of the __PaymentsWrapper__, and all the checks and merging computation is done by the wrapper.

```rust
    #[derive(TypeAbi, TopEncode, TopDecode, NestedEncode, NestedDecode, Clone, PartialEq, Debug)]
    pub struct UniquePayments<M: ManagedTypeApi> {
        payments: PaymentsVec<M>,
    }

    impl<M: ManagedTypeApi> Default for UniquePayments<M> {
        #[inline]
        fn default() -> Self {
            Self {
                payments: PaymentsVec::new(),
            }
        }
    }

    impl<M: ManagedTypeApi> UniquePayments<M> {
        #[inline]
        pub fn new() -> Self {
            Self::default()
        }

        #[inline]
        pub fn new_from_unique_payments(payments: PaymentsVec<M>) -> Self {
            UniquePayments { payments }
        }

        pub fn new_from_payments(payments: PaymentsVec<M>) -> Self {
            let mut merged_payments = Self::new();
            for p in &payments {
                merged_payments.add_payment(p);
            }

            merged_payments
        }

        pub fn add_payment(&mut self, new_payment: EsdtTokenPayment<M>) {
            if new_payment.amount == 0 {
                return;
            }

            let len = self.payments.len();
            for i in 0..len {
                let mut current_payment = self.payments.get(i);
                if current_payment.can_merge_with(&new_payment) {
                    current_payment.amount += new_payment.amount;
                    let _ = self.payments.set(i, &current_payment);

                    return;
                }
            }

            self.payments.push(new_payment);
        }

        #[inline]
        pub fn into_payments(self) -> PaymentsVec<M> {
            self.payments
        }
    }

    impl<M: ManagedTypeApi> Mergeable<M> for UniquePayments<M> {
        #[inline]
        fn can_merge_with(&self, _other: &Self) -> bool {
            true
        }

        fn merge_with(&mut self, mut other: Self) {
            self.error_if_not_mergeable(&other);

            if self.payments.is_empty() {
                self.payments = other.payments;
                return;
            }
            if other.payments.is_empty() {
                return;
            }

            let first_len = self.payments.len();
            let mut second_len = other.payments.len();
            for i in 0..first_len {
                let mut current_payment = self.payments.get(i);
                for j in 0..second_len {
                    let other_payment = other.payments.get(j);
                    if !current_payment.can_merge_with(&other_payment) {
                        continue;
                    }

                    current_payment.amount += other_payment.amount;
                    let _ = self.payments.set(i, &current_payment);

                    other.payments.remove(j);
                    second_len -= 1;

                    break;
                }
            }

            self.payments.append_vec(other.payments);
        }
    }
```

[comment]: # (mx-context-auto)

## **Testing**

The Energy DAO SC was tested through various unit tests, that were conducted on top of a complete setup of the xExchange suite of contracts. Specifically, all the involved DEX contracts (like pair, farm, farm-staking, farm-staking-proxy, energy factory & so on) were set up from scratch, so the testing scenario could follow a complete flow where the owner locks his tokens through the SC in order to get Energy for the contract, and users provide liquidity in the pair contract, to later enter farm or metastaking, claim rewards and exit the Energy DAO contract.

:::note
In order to be able to have a complete step-by-step debugging layout, all the Github references from the main `Cargo.toml` file need to be updated to a local DEX repo path, as shown below.
```rust
[dependencies.pair]
path = "../../mx-exchange-sc/dex/pair"
```
:::

[comment]: # (mx-context-auto)

## **Next steps**

As stated in the beginning, this SC template is just but one possible variation of how an Energy DAO on the MultiversX Network could look like. There are quite a few more features that could be added, and the current implementation can be changed as needed. But the entire xExchange contracts integration flow is there, and the Energy DAO SC template can certainly be the backbone of any such DAO project.