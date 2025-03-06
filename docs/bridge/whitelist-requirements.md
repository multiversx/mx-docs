---
id: whitelist-requirements
title: Whitelist Requirements
---

[comment]: # (mx-abstract)

# Whitelist Requirements

[comment]: # (mx-abstract)

Before enabling a token to be sent via the Ad-Astra bridge, the token must be whitelisted.
The whitelisting process is performed with the help of the MultiversX team.

[comment]: # (mx-context-auto)

## Whitelist requirements

1. The token issuer must issue the token on the MultiversX network and submit a branding request manually or using [https://assets.multiversx.com](https://assets.multiversx.com);
2. The token issuer must assign the MINT & BURN role to the **BridgedTokensWrapper** or the **Safe** contract, depending on the 
token type configuration.

```rust
RolesAssigningTransaction {
    Sender: <address of the ESDT owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "setSpecialRole" +
          "@" + <token identifier in hexadecimal encoding> +
          "@" + <contract address: wrapper or safe contract> +
          "@" + <local mint role in hexadecimal encoding> +
          "@" + <local burn role in hexadecimal encoding>
}
```

Example: 

Let's suppose we want to whitelist the token `TKN-001122` on the Ethereum bridge and the token configuration type is 1. 
(mint/burn tokens on both ends, native on MultiversX)

The transaction will look like:

```rust
RolesAssigningTransaction {
    Sender: <address of the ESDT owner>
    Receiver: erd1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqzllls8a5w6u
    Value: 0
    GasLimit: 60000000
    Data: "setSpecialRole" +
          "@544b4e2d303031313232" +
          "@000000000000000005004ab1cd3d291159a38df7d2a1c498c9d7a7e3047ccc48" +
          "@45534454526f6c654c6f63616c4d696e74" +
          "@45534454526f6c654c6f63616c4275726e"
}
```

3. Depending on the token configuration (valid for 1. & 2. configuration types), the minter & burner role should be granted on
the EVM-compatible chain side (depending on the ERC20 contract variant, `addMinter` and `addBurner` endpoints can be used);
4. MultiversX team will complete the whitelisting process by issuing the required transactions.
   
For reference, this is the list of the known smart contracts:
* **Wrapper** `erd1qqqqqqqqqqqqqpgq305jfaqrdxpzjgf9y5gvzh60mergh866yfkqzqjv2h`
* **Ethereum Safe** `erd1qqqqqqqqqqqqqpgqf2cu60ffz9v68r0h62sufxxf67n7xprue3yq4ap4k2`
* **BSC Safe** `erd1qqqqqqqqqqqqqpgqa89ts8s3un2tpxcml340phcgypyyr609e3yqv4d8nz`

:::warning
To ensure the correct functioning of the bridge, as a MultiversX token owner please ensure the following points are met:
* if you make use of the transfer-role on your token, remember to grant the role also on the **Safe**, **MultiTransfer**, **BridgedTokensWrapper**, and **BridgeProxy** contracts; 
* do not freeze the above-mentioned contracts;
* do not wipe tokens on the above-mentioned contracts.

Failure to comply with these rules will force the bridge owner to blacklist the token in order to restore the correct functioning of the bridge.
:::
