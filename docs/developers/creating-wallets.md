---
id: creating-wallets
title: Creating Wallets
---

How to create wallets using the CLI or programmatically

Although wallets are commonly created through the [MultiversX (previously Elrond) Web Wallet](https://wallet.elrond.com/) or the [MultiversX (previously Elrond) Ledger App](https://github.com/ElrondNetwork/ledger-elrond), one can also use the CLI or the SDK.

## **Generate a new mnemonic**

Using [erdwalletjs-cli](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli), a mnemonic phrase (24 words) can be generated as follows:

```
erdwalletjs new-mnemonic --mnemonic-file=mnemonicOfAlice.txt
```

Programmatically using [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js), the same can be achieved through:

```
const core = require("@elrondnetwork/elrond-core-js");

let account = new core.account();
let mnemonic = account.generateMnemonic();
console.log(mnemonic);
```

## **Deriving a JSON key-file (from mnemonic)**

Using [erdwalletjs-cli](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli), a JSON key-file can be obtained as follows:

```
erdwalletjs derive-key --mnemonic-file=mnemonicOfAlice.txt \
 --account-index=0 \
 --key-file=keyOfAlice.json --password-file=passwordOfAlice.txt
```

Programmatically using [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js), the same can be achieved through:

```
const fs = require("fs");
const core = require("@elrondnetwork/elrond-core-js");

let mnemonic = "foo bar ...";
let password = "pass for JSON key-file";
let accountIndex = 0;

let account = new core.account();
let privateKeyHex = account.privateKeyFromMnemonic(mnemonic, false, accountIndex.toString(), "");
let privateKey = Buffer.from(privateKeyHex, "hex");
let keyFileObject = account.generateKeyFileFromPrivateKey(privateKey, password);
let keyFileJson = JSON.stringify(keyFileObject, null, 4);

fs.writeFileSync("myKeyFile.json", keyFileJson);
```
