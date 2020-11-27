---
id: signing-programmatically
title: Signing programmatically
---

## **Sign using [elrond-core-js](https://www.npmjs.com/package/@elrondnetwork/elrond-core-js)**

Upon installing **elrond-core-js**, a transaction can be signed as follows:

```
const fs = require("fs");
const core = require("@elrondnetwork/elrond-core-js");

let keyFileJson = fs.readFileSync("myWallet.json", { encoding: "utf8" }).trim();
let keyFileObject = JSON.parse(keyFileJson);

let account = new core.account();
account.loadFromKeyFile(keyFileObject, "passwordOfMyWallet");

let transaction = new core.transaction(
    42,                // nonce
    "erd1...",         // sender
    "erd1...",         // receiver
    "100000000000000000", // value
    1000000000,           // gas price
    70000,                // gas limit
    "food for cats",      // data (not encoded)
    "1",                  // chain ID
    1                     // tx version
);

let serializedTransaction = transaction.prepareForSigning();
transaction.signature = account.sign(serializedTransaction);
let signedTransaction = transaction.prepareForNode();
let signedTransactionJson = JSON.stringify(signedTransaction, null, 4);
```

Above, the content of `signedTransactionJson` can be submitted to Elrond API in order to broadcast the transaction.

## **Sign using erdpy**

```
from erdpy.accounts import Account
from erdpy.transactions import Transaction

tx = Transaction()
tx.nonce = 43
tx.value = "20000000000000000"  # 0.00002 EGLD
tx.sender = "erd1..."
tx.receiver = "erd1..."
tx.gasPrice = 1000000000
tx.gasLimit = 50000
tx.data = "hello, World!"
tx.chainID = "1"
tx.version = 1

account = Account(key_file="myWallet.json", pass_file="myPass.txt")
tx.sign(account)

payload = tx.to_dictionary()
print(payload)
```

Above, `payload` can be submitted to Elrond API in order to broadcast the transaction. Alternatively, the `send` function can be used:

```
from erdpy.proxy import ElrondProxy

proxy = ElrondProxy("http://api.elrond.com")
tx.send(proxy)
```
