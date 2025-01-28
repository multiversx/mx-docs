---
id: token-types
title: Token Types
---

import useBaseUrl from '@docusaurus/useBaseUrl';
import ThemedImage from '@theme/ThemedImage';

[comment]: # (mx-abstract)

# Token Types

With the release of the bridge v3.0 & v3.1 different token types are allowed to be bridged. By token type, we refer to how the
tokens are locked/burnt or unlocked/minted along with the chain side on which they are native. The decision of how the token should
be configured in the bridge depends on the availability of the minter/burner role on the EVM-compatible chain side along with
the marketing decision of "on which chain the token should be native (a.k.a. where it was first minted)"

[comment]: # (mx-abstract)

**1. Mint/Burn & Native on MultiversX < - > EVM-chain has Mint/Burn & Non-Native**

This bridge token-type configuration has the advantage of not holding a single token in the bridge.
The swapped tokens are minted/burned on both sides. The total token quantity of tokens equals the (minted - burned) on MultiversX
added with the (minted - burned) on the EVM-compatible chain side. The initial supply & mint is done on MultiversX.

<!--- source file reference: /static/xbridge/xbridge-dark/light.drawio --->
<ThemedImage
    alt="mint/burn tokens"
    sources={{
        light: useBaseUrl('/xbridge/mint-burn-tokens-light.png'),
        dark: useBaseUrl('/xbridge/mint-burn-tokens-dark.png'),
    }}
/>

[comment]: # (mx-abstract)

**2. Mint/Burn & Non-Native on MultiversX < - > EVM-chain has Mint/Burn & Native**

This has the same advantages as 1. but the initial minting is done on the EVM-compatible chain side.

[comment]: # (mx-abstract)

**3. Mint/Burn & Non-Native on MultiversX < - > EVM-chain has Locked/Unlocked & Native**

This bridge token configuration type will need to be initiated on the EVM-compatible chain side and the tokens transferred to
MultiversX will be locked in the bridge contract (no minter role is needed on the EVM-compatible chain as opposed to 1 & 2) and
will be unlocked when swaps from MultiversX to the EVM-compatible chain are done. On the MultiversX side, there will be mint/burn
actions. The total value of tokens in both systems will be computed as: supply on EVM-compatible chain. Everything that is
locked in the bridge contract will equal to what was minted - burned on MultiversX side.

:::warning
This configuration will also require an intermediate token as to allow the bridging on more than one EVM-compatible chain. 
It also can create discrepancies between the allowed supplies to bridge between multiple chains.
:::

Example: if tokens are being brought to MultiversX from EVM-compatible chain 1 and then the tokens are bridged out from
MultiversX to EVM-compatible chain 2, then the bridge for EVM-compatible chain 2, at some point, will be unable to process
swaps because it will run out of its intermediary tokens. The solution here is to manually bridge in the reversed order
as described (an operation that consumes time & fees).

<!--- source file reference: /static/xbridge/xbridge-dark/light.drawio --->
<ThemedImage
    alt="mint/burn with lock/unlock tokens"
    sources={{
        light: useBaseUrl('/xbridge/lock-unlock-tokens-light.png'),
        dark: useBaseUrl('/xbridge/lock-unlock-tokens-dark.png'),
    }}
/>

**Note:** The diagram above is a little misleading because the ERC20 contracts hold the address/balance ledgers inside 
the contracts. For the sake of simplicity, the tokens are depicted stored inside the bridge **Safe** contracts 
(just as MultiversX ESDTs).
