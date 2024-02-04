---
id: extending-sdk-js
title: Extending sdk-js
---

[comment]: # (mx-abstract)

This tutorial will guide you through the process of extending and tailoring certain modules from sdk-js.

[comment]: # (mx-context-auto)

## Extending the Network Providers

The default classes from `@multiversx/sdk-network-providers` should **only be used as a starting point**. As your dApp matures, make sure you **switch to using your own network provider**, tailored to your requirements (whether deriving from the default ones or writing a new one, from scratch) that directly interacts with the MultiversX API (or Gateway).

[comment]: # (mx-context-auto)

### Performing HTTP requests from scratch

One can broadcast transactions and GET resources from the MultiversX API (or Gateway) by performing simple HTTP requests using the `axios` utility. Below are a few examples:

Broadcasting a transaction:

```
import axios, { AxiosResponse } from "axios";

let tx = new Transaction({ /* provide the fields */ });
// ... sign the transaction using a dApp / signing provider
let data = tx.toSendable();
let url = "https://devnet-api.multiversx.com/transactions";
let response: AxiosResponse = await axios.post(url, data, {
    headers: {
        "Content-Type": "application/json",
    }
});
let txHash = response.data.txHash;
```

Fetching a transaction:

```
let url = `https://devnet-api.multiversx.com/transactions/${txHash}`;
let response = await axios.get(url);
let transactionOnNetwork = TransactionOnNetwork.fromApiHttpResponse(txHash, response.data);
```

Querying a smart contract (with parsing the results):

```
let query = contract.createQuery({
    func: new ContractFunction("foobar"),
    args: [new AddressValue(addressOfAlice)],
    caller: new Address("erd1...")
});

let url = "https://devnet-api.multiversx.com/query";
let data = {
    scAddress: query.address.bech32(),
    caller: query.caller?.bech32() ? query.caller.bech32() : undefined,
    funcName: query.func.toString(),
    value: query.value ? query.value.toString() : undefined,
    args: query.getEncodedArguments()
};

let response: AxiosResponse = await axios.post(url, data, {
    headers: {
        "Content-Type": "application/json",
    }
});

let queryResponse = {
    returnCode: response.data.returnCode,
    returnMessage: response.data.returnMessage,
    getReturnDataParts: () => response.data.returnData.map((item) => Buffer.from(item || "", "base64"));
};

let endpointDefinition = contract.getEndpoint("foobar");
let { firstValue, secondValue, returnCode } = resultsParser.parseQueryResponse(queryResponse, endpointDefinition);
```

[comment]: # (mx-context-auto)

### Extending a default Network Provider

You can also derive from the default network providers (`ApiNetworkProvider` and `ProxyNetworkProvider`) and overwrite / add additional methods, making use of `doGetGeneric()` and `doPostGeneric()`.

```
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

```
await transactionWatcher.awaitAllEvents(transaction, ["mySpecialEventFoo", "mySpecialEventBar"]);
await transactionWatcher.awaitAnyEvents(transaction, ["mySpecialEventFoo", "mySpecialEventBar"]);
```

[comment]: # (mx-context-auto)

## Extending the contract results parser

If, for some reason (e.g. a bug), the default `ResultsParser` provided by **sdk-js** does not satisfy your requirements, you may want to extend it and override the method `createBundleWithCustomHeuristics()`:

```
export class MyTailoredResultsParser extends ResultsParser {
    protected createBundleWithCustomHeuristics(transaction: ITransactionOnNetwork, transactionMetadata: TransactionMetadata): UntypedOutcomeBundle | null {
        let returnMessage: string = "<< extract the message from the input transaction object >>";
        let values: Buffer[] = [
            Buffer.from("<< extract 1st result from the input transaction object >>"),
            Buffer.from("<< extract 2nd result from the input transaction object >>"),
            Buffer.from("<< extract 3rd result from the input transaction object >>"),
            // ...
        ]

        return {
            returnCode: ReturnCode.Ok,
            returnMessage: returnMessage,
            values: values
        };
    }
}
```

:::important
When the default `ResultsParser` misbehaves, please open an issue [on GitHub](https://github.com/multiversx/mx-sdk-js-core/issues), and also provide as many details as possible about the unparsable results (e.g. provide a dump of the transaction object if possible - make sure to remove any sensitive information).
:::
