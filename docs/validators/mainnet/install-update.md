---
id: install-update
title: Installing a Validator Node
---

An Elrond node requires a host (computer) with the aforementioned specifications, with the OS - preferably Ubuntu 18.04 - installed. First you will deploy the Elrond scripts, tune its parameters and ensure proper user permissions. Then you will install the node, backup its private keys and start it. Further steps include optional configurations, such as setting up monitoring.

Let's dig in.

**Node installation**

After preparing the user permissions, the script configurations and the keys, the actual node installation can begin. The Validator script is a multi-purpose tool for managing your node. For installation use`1 - install`.



```
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

- When asked, indicate the number of nodes you want to run, i.e. `1`
- When asked, indicate the name for your validator, i.e. `Valar`
- Quit the menu without starting (we need keys first) by using `12 - quit`

**Prepare your keys**

Create a new folder "VALIDATOR_KEYS" to serve as local backup when updating:

```
cd ~
mkdir -p ~/VALIDATOR_KEYS
```

Generate a certificate file containing your Validator key by running the `keygenerator` :

```
./elrond-utils/keygenerator
```

Copy the generated `validatorKey.pem` file - in ZIP form - to the `$HOME/VALIDATOR_KEYS/` folder . This is important for your node to be able to restart correctly after an upgrade.

```
zip node-0.zip validatorKey.pem
mv node-0.zip $HOME/VALIDATOR_KEYS/
```

Repeat the above for all your “n” nodes. When complete, please refer to our Key management section for instructions about how to properly backup and protect your keys.

**Start the node(s)**

```
~/elrond-go-scripts-mainnet/script.sh start
```

**Start the node visual interface**

Once the node has started, you can check how it’s doing, using the `TermUI` interface. Navigate to your `$HOME/elrond-utils` folder and start the `TermUI`  , one for each of your nodes:

```
cd $HOME/elrond-utils
./termui -address localhost:8080
```

:::tip
Your first node is called `node-0` and it its REST API will run on port `8080` by default. The next node is `node-1 `on port `8081`, and so on.
:::

**Update your node**

Upgrade your node by running the script and selecting options:

- `10 - github_pull` downloads the latest version of the scripts
- `3 - upgrade`
- `7 - start`
- `12 - quit`

```
~/elrond-go-scripts-mainnet/script.sh
```

Those are the basic steps. Please carefully read the on-screen instructions, refer to the scripts [readme file](https://github.com/ElrondNetwork/elrond-go-scripts-mainnet/blob/master/README.md) and make sure to ask any questions in the Elrond [Validators chat](https://t.me/ElrondValidators).

**Mandatory: Backup your keys**

Your private keys are needed to run your node. Losing them means losing control of your node. A 3rd party gaining access to them could result in lost funds.

Find them in `$HOME/elrond-nodes/node-0/config` [be mindful of your “`n`” nodes]

:::important
Create a safe backup for them on storage outside of the server running your node(s).
:::