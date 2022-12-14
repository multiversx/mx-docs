---
id: creating-wallets
title: Creating Wallets
---

This page describes how to create wallets using the command line or programmatically.

Although wallets are commonly created through the [Elrond Web Wallet](https://wallet.elrond.com/) or the [Elrond Ledger App](https://github.com/ElrondNetwork/ledger-elrond), one can also use the Python CLI, or the JavaScript CLI or SDK.

# Python

Requirements: Python 3.8 and [erdpy](https://docs.elrond.com/sdk-and-tools/erdpy/erdpy/). 

## Generate a new mnemonic

A mnemonic phrase (24 seed words) can be generated as follows:
```
$ ~/.local/bin/erdpy wallet new
hero second corn group cannon chase exclude whip strike car leader census assault force cat sister vendor various grace work biology tiger quote avoid
```

## Derive a `.pem` file

A [`.pem`](https://docs.elrond.com/sdk-and-tools/erdpy/deriving-the-wallet-pem-file/) file can be used to sign transactions without user input. It can be derived from the mnemonic as follows:
```
$ ~/.local/bin/erdpy wallet derive mnemonicOfAlice.pem --mnemonic  
Enter mnemonic:  
hero second corn group cannon chase exclude whip strike car leader census assault force cat sister vendor various grace work biology tiger quote avoid  
INFO:cli.wallet:Created PEM file [mnemonicOfAlice.pem] for [erd1krfqqvk98w30n9puznnvrdx2fxdd5q9gqj54uk970h9zflk45z0szj9nak]
```
Here, the mnemonic is read from STDIN, which makes it practical to use `erdpy` as a paper wallet, in conjunction with password management software.

# JavaScript CLI

Requirements: [Node.js](https://nodejs.org/en/download/), which bundles [npx](https://www.npmjs.com/package/npx). `npx` allows quick execution of Node package binaries. We'll be using the [erdwalletjs-cli](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli) package.

## Generate a new mnemonic

A mnemonic phrase (24 words) can be generated as follows:

```
$ npx @elrondnetwork/erdwalletjs-cli new-mnemonic --mnemonic-file=mnemonicOfAlice.txt
Mnemonic saved to file: [mnemonicOfAlice.txt].

hero second corn group cannon chase exclude whip strike car leader census assault force cat sister vendor various grace work biology tiger quote avoid
```

## Derive a JSON key-file (from mnemonic)

Using [erdwalletjs-cli](https://www.npmjs.com/package/@elrondnetwork/erdwalletjs-cli), a JSON key-file can be obtained as follows:

```
$ npx @elrondnetwork/erdwalletjs-cli derive-key --mnemonic-file=mnemonicOfAlice.txt \
 --account-index=0 \
 --key-file=keyOfAlice.json --password-file=passwordOfAlice.txt
Derived key for account index = 0, address = erd1krfqqvk98w30n9puznnvrdx2fxdd5q9gqj54uk970h9zflk45z0szj9nak.  
Encrypted with password from [passwordOfAlice.txt] and saved to file: [keyOfAlice.json].
```

In this example, `passwordOfAlice.txt` was an empty file, to match the output from [`erdpy`](#python).

# Programmatically in JavaScript

We'll be using [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js).

## Generate a new mnemonic
A mnemonic can be generated as follows:

```js
const core = require('@elrondnetwork/elrond-core-js');

const account = new core.account();
const mnemonic = account.generateMnemonic();
console.log(mnemonic);
```
## Derive a JSON key-file (from mnemonic)
A JSON key-file can be obtained as follows:

```js
const fs = require('fs');
const core = require('@elrondnetwork/elrond-core-js');

const mnemonic = 'foo bar ...';
const password = 'pass for JSON key-file';
const accountIndex = 0;

const account = new core.account();
const privateKeyHex = account.privateKeyFromMnemonic(mnemonic, false, accountIndex.toString(), '');
const privateKey = Buffer.from(privateKeyHex, "hex");
const keyFileObject = account.generateKeyFileFromPrivateKey(privateKey, password);
const keyFileJson = JSON.stringify(keyFileObject, null, 4);

fs.writeFileSync('myKeyFile.json', keyFileJson);
```
