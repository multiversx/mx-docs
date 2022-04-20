---
id: install-update
title: Installing a Validator Node
---

An Elrond node requires a host (computer) with the aforementioned specifications, with the OS - preferably Ubuntu 18.04, 20.04 & up - installed. To begin, you will need to deploy the Elrond scripts which we had earlier configured, tune its parameters and ensure proper user permissions. Then installation, you will install the node, back up its private keys, and start it.

Let’s dive in!

## **Install your node(s)**

After preparing the user permissions, the script configurations, and the keys, the actual node installation can begin. The Validator script is a multi-purpose tool for managing your node, it is accessible to all networks: Mainnet, Devnet, and Testnet.

- *Note: This process installs a validator node for all Elrond networks (mainnet, devnet, and testnet).*

Following these few steps, we will work on installing the Elrond Network validator node to get it up and running on your local machine.

 For installation use`1 - install`

```bash
 ~/elrond-go-scripts-mainnet/script.sh
 1) install
 2) observing_squad
 3) upgrade
 4) upgrade_proxy
 5) upgrade_squad
 6) remove_db
 7) start
 8) stop
 9) cleanup
 10) github_pull
 11) get_logs
 12) quit
 Please select an action:1
```

- When asked, indicate the number of nodes you want to run, i.e. `1`
- When asked, indicate the name of your validator, i.e. `Valar`
- Quit the menu without starting (we need keys first) by using `12 - quit`

### **Prepare your keys**

Create a new folder "VALIDATOR_KEYS" to serve as a local backup when updating:

```bash
cd ~
mkdir -p ~/VALIDATOR_KEYS
    
```

Generate a certificate file containing your Validator key by running the `keygenerator` :

 ```bash
./elrond-utils/keygenerator
    
```

Copy the generated `validatorKey.pem` file to the `config` folder of your node(s), and repeat for each node.

```bash
    cp validatorKey.pem ~/elrond-nodes/node-0/config/
    
```

:::tip
Each node needs its unique `validatorKey.pem` file
:::

Then copy the `validatorKey.pem` file - in ZIP form - to the `$HOME/VALIDATOR_KEYS/` folder . This is important for your node to be able to restart correctly after an upgrade.

```bash
zip node-0.zip validatorKey.pem
mv node-0.zip $HOME/VALIDATOR_KEYS/
    
```

Repeat the above process for all your “n” nodes. When complete, please refer to our Key management section for instructions about how to properly backup and protect your keys.

### **Start the node(s)**

```bash
~/elrond-go-scripts/script.sh start
```

### **Start the node visual interface**

Once the node has started, you can check its progress, using the `TermUI` interface. Navigate to your `$HOME/elrond-utils` folder and start the `TermUI`, one for each of your nodes:

```bash
cd $HOME/elrond-utils
./termui -address localhost:8080
```

:::tip

 Your first node is called `node-0` and it is a REST API that will run on port `8080` by default. The next node is `node-1`on port `8081`, and so on.
:::

## **Update your node(s)**

Upgrade your node by running the script and selecting either of these options:

- `10 - github_pull` downloads the latest version of the scripts
- `3 - upgrade`
- `7 - start`
- `12 - quit`

```bash
~/elrond-go-scripts/script.sh
```

These are the basic steps. Please carefully read the on-screen instructions, refer to the scripts [readme file](https://github.com/ElrondNetwork/elrond-go-scripts-mainnet/blob/master/README.md). You can also ask any questions in the Elrond [Validators chat](https://t.me/ElrondValidators)

## **Mandatory: Backup your keys**

Your private keys are needed to run your node. Losing them means losing control of your node. A 3rd party gaining access to them could result in loss of funds.

Find them in `$HOME/elrond-nodes/node-0/config` [be mindful of your “`n`” nodes]

:::important

Create a safe backup for them on storage outside of the server running your node(s).
:::
