---
id: your-first-microservice
title: Build a Microservice for your dApp
---

[comment]: # (mx-abstract)

Let's build a microservice for your decentralized App

:::important
This guide extends the [**Build a dApp in 15 minutes** guide](/developers/tutorials/your-first-dapp), please follow it before following this one.
We'll work on the Devnet, so you should create and manage a web wallet [here](https://devnet-wallet.multiversx.com).
:::

This guide has been made available in video format as well:

<iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/pd-vSIiw6Us" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>

[comment]: # (mx-context-auto)

## Ping Pong Microservice

This guide extends the decentralized app we have built in our previous guide [**Build a dApp in 15 minutes**](/developers/tutorials/your-first-dapp). If you haven't followed it so far, please do it now.

In this guide we're going to build a microservice (an API), which is an intermediary layer between the blockchain layer and the app layer. Our app will consume this microservice instead of making requests directly on the blockchain.

[comment]: # (mx-context-auto)

### Caching

In our guide, the purpose of this microservice is to cache the values that come from the blockchain (e.g. `get_time_to_pong`), so every subsequent request will get fast results from our microservice.

[comment]: # (mx-context-auto)

### Transaction processor

We will also invalidate the cache when a pong transaction will be done. This means that the microservice will listen to all the `pong` transactions on the blockchain that have our smart contract address as the receiver and as soon as one transaction is confirmed, we will invalidate the cache record corresponding to the sender wallet address.

[comment]: # (mx-context-auto)

### The Microservice

We're going to use a microservice template based on nestjs, the caching will be done using redis, so the prerequisites for this guide are: nodejs, npm and redis.

We will extend "Build a dApp in 15 minutes" guide, so let's build on the existing folder structure and create the microservice into a subfolder of the parent project folder:

[comment]: # (mx-context-auto)

## Prerequisites

Before we begin, we'll make sure `redis-server` is installed and is running on our development server.

```sh
sudo apt install redis-server
```

Optionally, we can daemonize redis-server, so it'll run in the background.

```sh
redis-server --daemonize yes
```

We want to make sure redis is running, so if we run:

```sh
ps aux | grep redis
```

then, we will have to see a log line like this one:

`/usr/bin/redis-server 127.0.0.1:6379`

[comment]: # (mx-context-auto)

## The microservice

Ok, let's get started with the microservice. First, we'll clone the template provided by the MultiversX team.

```sh
git clone https://github.com/multiversx/mx-ping-pong-service
```

Let's take a look at the app structure:
`config` - here we'll set up the ping pong smart contract address
`src/crons` - transactions processors are defined here
`src/endpoints` - here we will find the code for `/ping-pong/time-to-pong/<address>` endpoint

[comment]: # (mx-context-auto)

### Configure the microservice

We'll find a configuration file specific for every network we want to deploy the microservice on. In our guide we will use the devnet configuration, which will be found here:

```sh
~ping-pong/microservice/config/config.devnet.yaml
```

First we're going to configure the redis server url. If we run a redis-server on the same machine (or on our development machine) then we can leave the default value.

Now we'll move on to the smart contract address. We can find it in our `dapp` repository (if we followed the previous guide ["Build a dApp in 15 minutes"](/docs/developers/tutorials/your-first-dapp.md)). If you don't have a smart contract deployed on devnet, then we suggest to follow the previous guide first and then get back to this step.

Set the `contracts.pingPong` key with the value for the smart contract address and we're done with configuring the microservice.

[comment]: # (mx-context-auto)

### Start the microservice

We'll install the dependencies using npm

``` sh
npm install
```

and then we will start the microservice for the devnet:

``` sh
npm run start:devnet
```

Now we have our microservice started on port 3001. Let's identify its URL.
The default url is `http://localhost:3001`, but if you run the decentralized application on a different machine, then we should use `http://<ip>:3001`.

[comment]: # (mx-context-auto)

### Revisit "Your First dApp"

Now it's time to tell the dApp to use the microservice instead of directly reading the values from the blockchain. First we will set up the microservice URL in the dApp configuration file `src/config.devnet.tsx`:
We will add:

```javascript
export const microserviceAddress = "http://<ip>:3001/ping-pong/time-to-pong/";
```

Next, we want to switch from using the vm query to using our newly created microservice. The request to get the time to pong is done in `src/pages/Dashboard/Actions/index.tsx`.

We will change vm query code:

```javascript
React.useEffect(() => {
  const query = new Query({
    address: new Address(contractAddress),
    func: new ContractFunction("getTimeToPong"),
    args: [new AddressValue(new Address(address))],
  });
  dapp.proxy
    .queryContract(query)
    .then(({ returnData }) => {
      const [encoded] = returnData;
      switch (encoded) {
        case undefined:
          setHasPing(true);
          break;
        case "":
          setSecondsLeft(0);
          setHasPing(false);
          break;
        default: {
          const decoded = Buffer.from(encoded, "base64").toString("hex");
          setSecondsLeft(parseInt(decoded, 16));
          setHasPing(false);
          break;
        }
      }
    })
    .catch((err) => {
      console.error("Unable to call VM query", err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

into a generic HTTP request (in our example we use `axios`):

```javascript
React.useEffect(() => {
  axios
    .get(`${microserviceAddress}${address}`)
    .then(({ data }) => {
      const { status, timeToPong } = data;
      switch (status) {
        case "not_yet_pinged":
          setHasPing(true);
          break;
        case "awaiting_pong":
          setSecondsLeft(timeToPong);
          setHasPing(false);
          break;
      }
    })
    .catch((err) => {
      console.error("Unable to call microservice", err);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

Of course, don't forget to manage the required imports (`axios` and the microservice address that we defined previously in the configuration file `config.devnet.tsx`).

```javascript
import axios from "axios";
import { contractAddress, microserviceAddress } from "config";
```

We can now save index.tsx and let's run the decentralized app one more time.

```sh
npm run start
```

We can now verify that on the dashboard we still have the countdown and the Pong button is shown like it should be. We can refresh the app multiple times and at first the app will take the value (time to `pong` in seconds) from the blockchain. This value is then cached and all subsequent queries will read the value from the cache.

You can also find the complete code on our public repository for the dApp in the branch `microservice`:

```sh
https://github.com/multiversx/mx-template-dapp/blob/microservice/src/pages/Dashboard/Actions/index.tsx
```

[comment]: # (mx-context-auto)

## Let's deep dive into the microservice code and explain the 2 basic features we implemented

We want to minimize the number of requests done directly on the blockchain because of the overhead they incur, so we'll first read the time to `pong` from the blockchain, we'll cache that value and all the subsequent reads will be done from the cache. That value won't change over time. It will only reset AFTER we `pong`.

[comment]: # (mx-context-auto)

### The Cache

So the caching part is done in

```sh
ping-pong/microservice/src/endpoints/ping.pong/ping.pong.controller.ts
```

which uses

```sh
ping-pong/microservice/src/endpoints/ping.pong/ping.pong.service.ts
```

The number of seconds until the user can `pong` is returned by the function `getTimeToPong` at line 16 in `ping.pong.service.ts`.

```javascript
async getTimeToPong(address: Address): Promise<{ status: string, timeToPong?: number }> {
```

On line 17 we call `this.getPongDeadline` which, on line 33 will set the returned value in cache

```javascript
return await this.cachingService.getOrSetCache(
  `pong:${address}`,
  async () => await this.getPongDeadlineRaw(address),
  Constants.oneMinute() * 10
);
```

The function `this.getPongDeadlineRaw` will invoke the only read action on the blockchain, then `this.cachingService.getOrSetCache` will set it in cache.

[comment]: # (mx-context-auto)

### The Transaction Processor

After the user clicks the `Pong` button and performs the `pong` transaction, we have to invalidate the cache and we will use the transaction processor to identify all the `pong` transactions on the blockchain that have the receiver set to our smart contract address.

Let's look at the transaction processor source file here:

```sh
~/ping-pong/microservice/src/crons/transaction.processor.cron.ts
```

On line 23 we'll implement the `async handleNewTransactions()` function that has an interesting event: `onTransactionsReceived`.
Whenever new transactions are confirmed on the blockchain, this event will be executed and an array of transactions will be provided as a parameter.
We'll look in that array for a transaction that has the receiver equal to our smart contract address and the data field should be `pong` (as defined in the smart contract).

```javascript
if (
  transaction.receiver === this.apiConfigService.getPingPongContract() &&
  transaction.data
) {
  let dataDecoded = Buffer.from(transaction.data, "base64").toString();
  if (["ping", "pong"].includes(dataDecoded)) {
    await this.cachingService.deleteInCache(`pong:${transaction.sender}`);
  }
}
```

If we find one, we will invalidate the cache data for the key `pong:<wallet address>`, where we previously stored the time to pong value. We will use `this.cachingService.deleteInCache` function for this.

[comment]: # (mx-context-auto)

## Conclusion

So that's all, we created a _microservice_ in order to make our dApp faster and scalable.
This is a generic decentralized application architecture and most of the examples from this guide were the starting point for some of our highly available and massively used products.
Now we provide you a starting point in order to build your ideas and projects.

[comment]: # (mx-context-auto)

## Where to go next?

Break down this guide and learn more about how to extend the microservice, the dapp and the smart contract. Learn more on the MultiversX official documentation site here: [https://docs.multiversx.com](/).

If you have any questions, feel free to ask them using stackoverflow here:
[https://stackoverflow.com/questions/tagged/multiversx](https://stackoverflow.com/questions/tagged/multiversx).

Share this guide if you found it useful.
