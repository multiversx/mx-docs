---
id: sending-bulk-transactions
title: Sending bulk transactions
---

It is easy to prepare a set of transaction and then send them all at once using `erdpy`. Here's how.

Requirements:

- You must have `erdpy` installed on your computer. See [Installing erdpy](/docs/sdk-and-tools/erdpy/installing-erdpy) for details.
- You need a wallet that contains sufficient eGLD. We will use the mnemonics you have for this wallet to generate a PEM file that `erdpy` needs.

There will be 3 steps to fulfill:

1. Prepare the PEM file from the wallet mnemonics.
2. Prepare the transaction set, which involves you configuring a Bash script (provided below). This script will contain your desired transactions and will reference your PEM file.
3. Execute the command that sends all the transactions in the prepared set.

:::warning
Make sure your terminal is running `bash`, and not `zsh` or any other shell. Run the following command:

```
ps -p $$
```

It should print something like:

```
PID TTY          TIME CMD
169860 pts/6 00:00:00 bash
```

The word under the `CMD `keyword must be `bash`, otherwise the script provided below will not work. If it says `zsh`, `csh`, `tcsh` or anything else, run the following command to start a `bash` session:

```
exec /bin/bash
```

:::

## **Step 1: Prepare the PEM file**

See the page [Deriving the Wallet PEM](/docs/sdk-and-tools/erdpy/deriving-the-wallet-pem-file) file for how to prepare a PEM file. Make sure you know exactly where `erdpy` saved it for you.

## **Step 2: Prepare the transaction set**

The following Bash script defines a set of 9 example transactions. Each transaction is on one line, and contains the receiver wallet address (such as`erd1qx22...`), then a space, then the eGLD amount to be transferred (for example `8`). The script will take care of applying the correct eGLD denomination.

You must change the value of `MYWALLET` first. The wallet you see in the script below doesn't actually exist and transactions sent from it will fail. Therefore you need to write your wallet address between the quotation marks `"` on the line where `MYWALLET` is defined.

Next, you must change the `PEM_FILE` variable to the path to the PEM file you prepared at Step 1 (see above).

Next, you must change the `TRANSACTIONS` list with the receiver wallets you want, and the amounts you want to transfer. You can delete some of the lines in this list, or add more if you want.

```
# You must edit the values of MYWALLET and PEM_FILE
# and then modify the TRANSACTIONS list.

MYWALLET="erd1sg4u62lzvgkeu4grnlwn7h2s92rqf8a64z48pl9c7us37ajv9u8qj9w8xg"
PEM_FILE="./walletKey.pem"

declare -a TRANSACTIONS=(
  "erd1qx22s3yyawvfvsn3573r3nkwk6c9efj756ex5cnqk5ul6fz5nggqhaze4y 2"
  "erd1qx22s3yyawvfvsn3573r3nkwk6c9efj756ex5cnqk5ul6fz5nggqhaze4y 4"
  "erd1qx22s3yyawvfvsn3573r3nkwk6c9efj756ex5cnqk5ul6fz5nggqhaze4y 8"
  "erd1nuxuu4s07m0348tacnu7et3x9dsskj6rql3yax2qsmct8uux3qqqf86kl9 16"
  "erd1nuxuu4s07m0348tacnu7et3x9dsskj6rql3yax2qsmct8uux3qqqf86kl9 32"
  "erd1nuxuu4s07m0348tacnu7et3x9dsskj6rql3yax2qsmct8uux3qqqf86kl9 64"
  "erd1a6wdtlr72ejdf8szvxaz4xvtcq8650az9005s9s92n7vpkj0lylsmja0h0 128"
  "erd1a6wdtlr72ejdf8szvxaz4xvtcq8650az9005s9s92n7vpkj0lylsmja0h0 256"
  "erd1a6wdtlr72ejdf8szvxaz4xvtcq8650az9005s9s92n7vpkj0lylsmja0h0 512"
)



# DO NOT MODIFY ANYTHING FROM HERE ON

PROXY="https://api.elrond.com"
DENOMINATION="000000000000000000"

# We recall the nonce of the wallet
NONCE=$(erdpy account get --nonce --address="$MYWALLET" --proxy="$PROXY")

function send-bulk-tx {
  for transaction in "${TRANSACTIONS[@]}"; do
    set -- $transaction
    erdpy --verbose tx new --send --outfile="bon-mission-tx-$NONCE.json" --pem=$PEM_FILE --nonce=$NONCE --receiver=$1 --value="$2$DENOMINATION" --gas-limit=50000 --proxy=$PROXY
    echo "Transaction sent with nonce $NONCE and backed up to bon-mission-tx-$NONCE.json."
    (( NONCE++ ))
  done
}
```

Save the above code into a file called `transactions.sh`. We will need it in the next step.

## **Step 3: Send the transactions**

Let's send the transactions:

```
source ./transactions.sh
send-bulk-tx
```

The first command imports the `send-bulk-tx` command from the `transactions.sh` file (see the file in step 1 above). Then the second command executes `send-bulk-tx`, which will call `erdpy` for each of the transactions in the set.

Done!
