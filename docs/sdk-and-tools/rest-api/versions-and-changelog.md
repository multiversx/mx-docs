---
id: versions-and-changelog
title: Versions and Changelog
---

## **Overview**

This page offers a high level overview of the important releases of the MultiversX Proxy API, along with recommendations (such as upgrade or transitioning recommendations) for API consumers.

:::warning
Documentation in this section is preliminary and subject to change.
:::

## **MultiversX Proxy HTTP API [v1.1.0](https://github.com/multiversx/mx-chain-proxy-go/releases/tag/v1.1.0)**

This is the API launched at the Genesis.

## **MultiversX Proxy HTTP API [v1.1.1](https://github.com/multiversx/mx-chain-proxy-go/releases/tag/v1.1.1)**

This API version brought new features such as the [_hyperblock_-related endpoints](/sdk-and-tools/rest-api/blocks#get-hyperblock-by-nonce), useful for monitoring the blockchain. Furthermore, the `GET transaction` endpoint has been adjusted to include extra fields - for example, the so-called _hyperblock coordinates_ (the _nonce_ and the _hash_ of the containing hyperblock).

This API **has never been deployed to the central instance** of the MultiversX Proxy, available at [gateway.multiversx.com](https://gateway.multiversx.com/). However, until November 2020, **this API has been deployed on-premises** to several partners and 3rd party services (such as Exchange systems) - in the shape of [Observing Squads](/integrators/observing-squad), set up via the nodes scripts - [mx-chain-scripts](https://github.com/multiversx/mx-chain-scripts).

This version of the API requires Observer Nodes with tag [e1.1.0](https://github.com/multiversx/mx-chain-go/releases/tag/v1.1.6/releases/tag/e1.1.0) or greater.

There are **no breaking changes** between API **v1.1.0** and API **v1.1.1** - neither in terms of structure and format of the requests / responses, nor in the scheme of the URL. **However**, in terms of semantics, the following fixes might lead to breaking changes for some API consumers:

- `GET transaction` endpoint has been fixed to report the appropriate status **invalid** for actually _invalid transactions_ (e.g. not enough balance). In v1.1.0, the reported status was imprecise: **partially-executed**.

:::warning
As of November 2020, new API consumers are recommended to use a newer version of the API.

**v1.1.0 and v1.1.1 will be deprecated** once all existing API consumers are known to have been upgraded to a more recent version.
:::

## **MultiversX Proxy HTTP API [v1.1.3](https://github.com/multiversx/mx-chain-proxy-go/releases/tag/v1.1.3)**

This API version brought additions - new endpoints, such as `network/economics` or `address/shard`. Furthermore, the response of `vm-values` endpoints has been altered. Though, perhaps the most significant change is **the renaming of transaction statuses**.

This version of the API requires Observer Nodes with tag [v1.1.6](https://github.com/multiversx/mx-chain-go/releases/tag/v1.1.6) or greater.

Between API **v1.1.1** and API **v1.1.3**, the API consumer would observe the following **breaking changes**:

- All fields of `vm-values` endpoints has been renamed (changed casing, among others).
- The possible set of values for the transaction statuses has been changed: **executed** has been renamed to **success.** The statuses **received** and **partially-executed** have been merged under the status **pending**, while the status **not-executed** has been renamed to **fail**. For API consumers to not be affected by this change, they should follow the recommendations in [Querying the Blockchain](/integrators/querying-the-blockchain).

:::important
As of November 2020, new API consumers are recommended to switch to this version (or a more recent one) of the API.

For API consumers that use **on-premises Observing Squads**, an updated installer will be provided (on this matter, the work is in progress).
:::
