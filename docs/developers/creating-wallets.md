---
id: creating-wallets
title: Creating Wallets
---
[comment]: # (mx-abstract)

How to create wallets using the CLI or programmatically

Although wallets are commonly created through the [MultiversX Web Wallet](https://wallet.multiversx.com/) or the [MultiversX Ledger App](/wallet/ledger), one can also use the CLI or the SDK.

[comment]: # (mx-context-auto)

## **Generate a new mnemonic**

Using [mxjs-wallet](https://www.npmjs.com/package/@multiversx/sdk-wallet-cli), a mnemonic phrase (24 words) can be generated as follows:

```bash
mxjs-wallet new-mnemonic --mnemonic-file=mnemonicOfAlice.txt
```

Programmatically using [sdk-wallet](https://www.npmjs.com/package/@multiversx/sdk-wallet), the same can be achieved through:

```js
import { Mnemonic } from "@multiversx/sdk-wallet/mnemonic";

let mnemonic = Mnemonic.generate();
let words = mnemonic.getWords();
console.log(words);
```

[comment]: # (mx-context-auto)

## **Deriving a JSON key-file (from mnemonic)**

Using [mxjs-wallet](https://www.npmjs.com/package/@multiversx/sdk-wallet-cli), a JSON key-file can be obtained as follows:

```bash
mxjs-wallet derive-key --mnemonic-file=mnemonicOfAlice.txt \
 --account-index=0 \
 --key-file=keyOfAlice.json --password-file=passwordOfAlice.txt
```

Programmatically using [sdk-wallet](https://www.npmjs.com/package/@multiversx/sdk-wallet), the same can be achieved through:

```js
const mnemonic = Mnemonic.generate();
const password = "insert a password here";
const addressIndex = 0;

const privateKey = mnemonic.deriveKey(addressIndex);

const userWallet = new UserWallet(privateKey, password);

const jsonFileContent = userWallet.toJSON();

fs.writeFileSync("myKeyFile.json", JSON.stringify(jsonFileContent));
```
