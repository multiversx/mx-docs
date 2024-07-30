---
id: extending-sdk-js
title: Extending sdk-js
pagination_prev: sdk-and-tools/sdk-js/sdk-js
---

[comment]: # (mx-abstract)

This tutorial will guide you through the process of extending and tailoring certain modules from sdk-js.

:::important
Documentation in this section is preliminary and subject to change.
:::

[comment]: # (mx-context-auto)

## Extending the Network Providers

The default classes from `@multiversx/sdk-network-providers` should **only be used as a starting point**. As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements (whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

[comment]: # (mx-context-auto)

### Extending a default Network Provider

You can derive from the default network providers (`ApiNetworkProvider` and `ProxyNetworkProvider`) and overwrite / add additional methods, making use of `doGetGeneric()` and `doPostGeneric()`. For example:

```js
export class MyTailoredNetworkProvider extends ApiNetworkProvider {
    async getEconomics(): Promise<{totalSupply: number, marketCap: number}> {
        let response = await this.doGetGeneric("economics");
        return { totalSupply: response.totalSupply, marketCap: response.marketCap }
    }

    // ... other methods
}
```

[comment]: # (mx-context-auto)

## Customizing the transaction awaiting

If, for some reason, the default transaction completion detection algorithm provided by **sdk-js** does not satisfy your requirements, you may want to use a different strategy for transaction awaiting, such as:

```js
await transactionWatcher.awaitAllEvents(txHash, ["mySpecialEventFoo", "mySpecialEventBar"]);
await transactionWatcher.awaitAnyEvents(txHash, ["mySpecialEventFoo", "mySpecialEventBar"]);
```
