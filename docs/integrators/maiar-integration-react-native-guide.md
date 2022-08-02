# Maiar integration documentation

This is the official documentation presented by the [Sense4FIT team](https://sense4fit.io/) for **Elrond developers** who want to integrate with the Maiar application.

# How to connect to Maiar and sign transactions using React-native

Currently all you need in order to make this work are the next libraries:

- [@walletconnect/client](https://www.npmjs.com/package/@walletconnect/client)
- [@elrondnetwork/erdjs](https://www.npmjs.com/package/@elrondnetwork/erdjs)
- [@elrondnetwork/erdjs-network-providers](https://www.npmjs.com/package/@elrondnetwork/erdjs-network-providers)

## WalletConnectProvider

You can use most of the `WalletConnectProvider` located [here](https://github.com/ElrondNetwork/elrond-sdk-erdjs-wallet-connect-provider/blob/main/src/walletConnectProvider.ts) already implemented by the Elrond team, the only thing that we had to provide to the constructor was the `clientMeta` prop.

```ts
import WalletClient from "@walletconnect/client";

const const bridgeUrl = "https://bridge.walletconnect.org";

const walletConnector = new WalletClient({
  bridge: bridgeUrl,
  clientMeta: {
    description: "Connect with <your_app>",
    url: "<your.app.website>",
    icons: ["<your_app_icon.url>"],
    name: "<your_app_name>",
  },
});
```

On the browser, using the `dapp-core` example, this information was inferred already, but on the native side, you have to explicitly provide this information.

---

Below are more detailed information about the `WalletConnectProvider` and how to work with it.

```ts
// Listenting to event provided by the wallet connector
walletConnector.on("connect", onConnect);
walletConnector.on("session_update", onDisconnect);
walletConnector.on("disconnect", onDisconnect);

/**
 * Callback invoked when the client connects.
 */
private onConnect = async (error: any, { params }: any) => {
  if (error) {
    throw error;
  }

  if (!params || !params[0]) {
    throw new Error("missing payload");
  }

  const { accounts: [account] } = params[0];
  const [address, signature] = account.split(".");

  // Do something with the address and the signature of the account...
}
```

How to login an account?

```ts
const WALLETCONNECT_ELROND_CHAIN_ID = 508;

/**
 * Returns a wc uri which can be scanned using the Maiar application in order to login.
 */
async login(): Promise<string> {
  // Check if the wallet connected was already initialized
  if (!this.walletConnector) {
    // You may have your own logic that you need to do in order to initialize the WalletConnectProvider,
    // otherwise you can use the default function provided by Elrond.
    await this.init();
  }

  if (this.walletConnector?.connected) {
    await this.walletConnector.killSession();
    return "";
  }

  await this.walletConnector?.createSession({
    chainId: WALLETCONNECT_ELROND_CHAIN_ID,
  });

  return this.walletConnector?.uri || "";
}
```

In order to logout, you can simply call the `walletConnector.killSession()` function.

---

How to sign a transaction using the `walletConnector`?

```ts
/**
 * Signs a transaction and returns it
 * @param transaction
 */
async signTransaction<T extends ITransaction>(transaction: T): Promise<T> {
  if (!this.walletConnector) {
    throw new Error("Wallet Connect not initialised, call init() first");
  }

  // Obtain the user's address.
  const address = await this.getAddress();

  // Create a message from the given transaction.
  const message = this.prepareWalletConnectMessage(transaction, address);

  // Obtain the signature
  const sig = await this.walletConnector.sendCustomRequest({
    method: "erd_sign",
    params: message,
  });

  if (!sig || !sig.signature) {
    throw new Error("Wallet Connect could not sign the transaction");
  }

  transaction.applySignature(Signature.fromHex(sig.signature), UserAddress.fromBech32(address));

  return transaction;
}

/**
 * Returns a transaction in the format understood by the Elrond blockchain.
 */
function prepareWalletConnectMessage(transaction: ITransaction, address: string) {
  return {
    nonce: transaction.getNonce().valueOf(),
    from: address,
    to: transaction.getReceiver().toString(),
    amount: transaction.getValue().toString(),
    gasPrice: transaction.getGasPrice().valueOf().toString(),
    gasLimit: transaction.getGasLimit().valueOf().toString(),
    data: Buffer.from((transaction as Transaction).getData().valueOf()).toString(),
    chainId: transaction.getChainID().valueOf(),
    version: transaction.getVersion().valueOf(),
  };
}
```

### A complete example of login flow can be seen here

```ts
import { Linking } from "react-native";

const bridgeUrl = "https://bridge.walletconnect.org";

export function getMaiarLoginSchemaUrl(wcUri: string): string {
  // This can be obtained also from here:
  // https://github.com/ElrondNetwork/dapp-core/blob/7254ac09ce47f337b826a9ac3fc2ecfa01525fc3/src/constants/network.ts#L19
  const walletConnectDeepLink =
    "https://maiar.page.link/?apn=com.elrond.maiar.wallet&isi=1519405832&ibi=com.elrond.maiar.wallet&link=https://maiar.com/";

  return `${walletConnectDeepLink}?wallet-connect=${wcUri}`;
}

const onLogin = async () => {
  const callbacks = {
    onClientLogin: async (address, walletConnectProvider) => {
      // This callback is executed once the client successfully logged in.
    },
    onClientLogout: async () => {
      // This callback is executed once the client logged out.
      // Usually here we clean up the previous state.
    },
  };

  const walletConnectProvider = new WalletConnectProvider(bridgeUrl, callbacks);

  await walletConnectProvider.init();
  // The connectorUri can be represented as a qr code and this is what you
  // usually see what you try to login with Maiar on different web applications.
  const connectorUri = await walletConnectProvider.login();

  // The schema url represents the deep linking url needed by the Maiar app
  // in order to let the user log in.
  const schemaUrl = getMaiarLoginSchemaUrl(connectorUri);

  // This opens the Maiar app using the given schema url.
  Linking.canOpenURL(schemaUrl)
    .then((supported) => {
      if (supported) {
        return Linking.openURL(schemaUrl);
      } else {
        console.log("An error occurred processing the Schema Url");
      }
    })
    .catch((err) => console.log(err));
};
```

The `onLogin` callback can be attached to a button and should be called when the user performs the "LOGIN WITH MAIAR" action.

Once the client successfully logs in, you may change your app state to reflect that the login was successful.

Below are some example of queries that you can run once the user logged in.

## Utilities

In order to perform certain queries, most of the times you can use the [API](https://api.elrond.com/) provided by the Elrond team.

Since the tokens have a lot of zeros, we have created this utility to transform the number to human readable format:

```ts
const tokensToHumanReadableFormat = (tokens) => {
  return BigNumber(tokens)
    .div(10 ** 18)
    .toNumber()
    .toLocaleString("en-US", { maximumFractionDigits: 2 });
};
```

Below are some examples of how to call and decode the responses from the `api.elrond.com`.

### Check the user's balance of your token

```ts
const API = "https://devnet-api.elrond.com";

export const getTokenBalance = async (
  address: string,
  tokenIdentifier: string
) => {
  const url = `${API}/accounts/${address}/tokens/${tokenIdentifier}`;

  try {
    const response = await axios.get(url);
    const payload = response.data;
    return tokensToHumanReadableFormat(payload.balance);
  } catch (error) {
    // Handle the error accordingly...
    return 0;
  }
};
```

### Check if the user has a certain NFT

```ts
const API = "https://devnet-api.elrond.com";

export const getNfts = async (address, nftIdentifier) => {
  const url = `${API}/accounts/${address}/nfts/${nftIdentifier}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    return null;
  }
};

export const hasNft = async (address, nftIdentifier) => {
  const nfts = await getNfts(address, nftIdentifier);
  return (nfts?.balance || 0) > 0;
};
```

## How to claim rewards using your own Smart Contract in React-Native?

We assume here you have already created your Smart Contract which contains a `claimRewards` function.

Here is an example of a claimRewardsTransaction definition using typescript:

```ts
import {
  Account,
  Transaction,
  Address,
  TransactionPayload,
  TransactionVersion,
} from "@elrondnetwork/erdjs";

// Make sure to update the string with your OWN Smart Contract address.
export const REWARDS_SC = "<your_SC_address>";

export const gasPriceModifier = "0.01";
export const gasPerDataByte = "1500";
export const defaultGasLimit = "10000000";
export const defaultGasPrice = 10000000000;
export const denomination = 18;
export const decimals = 4;
export const defaultVersion = 1;

enum ChainID {
  test = "T",
  dev = "D",
  main = "1",
}

export function getClaimRewardsTransaction(nonce: number) {
  return new Transaction({
    value: { toString: () => "0" },
    data: new TransactionPayload("claimRewards"),
    nonce: { valueOf: () => Number(nonce) },
    receiver: new Address(REWARDS_SC),
    gasLimit: { valueOf: () => Number(defaultGasLimit) },
    gasPrice: { valueOf: () => Number(defaultGasPrice) },
    chainID: ChainID.dev,
    version: new TransactionVersion(defaultVersion),
  });
}
```

### Working example of an actual call of `claimRewards` function from the SC.

```ts
import { TransactionWatcher, Account, Address } from "@elrondnetwork/erdjs";

// You may use a different network depending where you code is running.
const EXPLORER = "https://devnet-explorer.elrond.com";

// Obtain references to the wallet and network provider
// We stored this info using a React state once the user successfully logged in.
const { walletProvider, networkProvider, addressStr } = maiarData;

const account = new Account(new Address(addressStr));

// Get the raw transaction.
let transaction = getClaimRewardsTransaction(account.getNonceThenIncrement());

// Make the user sign the transaction.
transaction = await walletProvider.signTransaction(transaction);

await networkProvider.sendTransaction(transaction);

// This just shows the transaction hash which can be seen on the Elrond explorer.
// Depending on the network used, you may update the EXPLORER link.
console.log(
  `Transaction Hash = ${EXPLORER}/transactions/${transaction.getHash()}`
);

const watcher = new TransactionWatcher(networkProvider);
await watcher.awaitCompleted(transaction);

// Once the transaction completed, you can query the account for the updated balance...
```
