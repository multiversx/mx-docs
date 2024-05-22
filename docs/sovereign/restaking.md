# Restaking

## Introduction

In the always evolving blockchain space, reStaking products are emerging as a significant innovation. Eigenlayer is currently the leading platform, but new projects are continuously entering the Ethereum ecosystem with impressive valuations. Currently, over $13 billion is reStaked in Eigenlayer, despite the absence of a live product. 

## General Economics and Staking Models

When designing the General Economics for Sovereign Chains, extensive research was conducted on various economic and staking models. This included insights from IBC (Cosmos ecosystem), the new Interchain Security model, Polygon SuperChains, Avalanche Appchains, various Ethereum Layer 2 solutions, and Eigenlayer. Each model was analyzed, incorporating the best features and discarding the less effective ones.

## Current Proposed Economics Design

The currently proposed economic design for Sovereign Chains incorporates a one-time reStaking model, non-custodial delegation, and allows extensive customization with native tokens. This framework enables the creation of an economic security fund that Sovereign Chains can leverage. Additionally, a general Sovereign Validator pool can be established, allowing new chains to launch using existing validators and economic resources without needing to gather new participants.

This design allows validators to be sponsored by users, meaning validators do not need to hold EGLD; instead, users can delegate their tokens. This flexibility extends to users delegating directly to Sovereign Chains.

## Enhanced Flexibility and Security

The designed system aims to combine the benefits of Eigenlayer with added freedom for users, validators, and projects. Open markets and freedom encourage competition, opportunities, and innovation. The current system proposes one-time reStaking, the use of liquid staked assets, and even DeFi positions containing liquid staked assets. Key considerations include whether to allow multiple reStaking and if Sovereign Chains should be required to allocate a portion of rewards to the reStaking layer.

## Multiple ReStaking

Enabling multiple reStaking would allow EGLD reStakers to earn significantly higher returns, potentially doubling or tripling yields. Non-custodial reStaking ensures that users retain the base EGLD rewards, making it an attractive option for participation.
Benefits for Different Actors

- **SovereignChain Builders**: They can utilize existing funds and validators, simplifying the process of securing their network. With pre-built contracts and a streamlined launch process, Sovereign Chains can achieve high security from the outset without distributing excessive tokens to validators.
- **Validators**: Validators can earn more by participating in multiple networks without owning EGLD, as users provide the required tokens. Validators can create their own economies by rewarding users who delegate to them, fostering a competitive environment.
- **Users**: Users face slightly higher risks of slashing but benefit from increased returns through multiple yields. They maintain a close connection with builders and validators from the beginning.
- **EGLD**: Increased staking reduces market supply, enhancing yield percentages and utility. ReStaking creates a new utility layer for EGLD, making it more appealing to investors.

## Security Considerations

ReStaking leverages the security of ETH, with slashing risks being the primary concern. Slashing events are rare in existing PoS networks, indicating that proper economic incentives generally ensure validator honesty. However, potential systemic risks from widespread slashing events need careful management.

Mitigation Strategies that we are analyzing:

- **Limit Slashing**: Set global and local limits on slashed EGLD.
- **Distribution of Slashed EGLD**: Distribute slashed tokens to honest validators and participants, incentivizing honest behavior.
- **Cooldown Period**: Implement a cooldown period before distributing slashed EGLD to mitigate immediate impacts.
- **Global Redistribution**: Distribute slashed EGLD globally rather than locally to spread the risk and reward.

## Conclusion

The risk/reward ratio for reStaking supports enabling multiple reStaking, offering significant benefits to all participants. By carefully managing the associated risks, the system can provide enhanced returns and foster a thriving ecosystem.
