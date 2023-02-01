---
id: whitelist-requirements
title: Whitelist requirements
---

[comment]: # (mx-context)

Before enabling a token to be sent via the Ad-Astra bridge, the token must be whitelisted. 
The whitelisting process is performed with the help of the MultiversX team.

1. The MultiversX team must whitelist the token on both the Safe(1) and Safe(3) contracts. Only whitelisted tokens can be bridged.
2. The token issuer must issue the token on the MultiversX network and submit a branding request manually or using https://assets.multiversx.com/.
3. The token issuer must assign the MINT&BURN role to the BridgedTokensWrapper (6) contract as per the instructions provided at https://docs.multiversx.com/tokens/esdt-tokens/#setting-and-unsetting-special-roles

**Note**: As an alternative approach, MultiversX team can issue an ESDT token on the MultiversX chain with the same properties as on Ethereum, and give the needed roles to the Smart Contracts, as indicated above. The MultiversX team can then give the token issuer the ownership of token management for that specific ESDT token.
