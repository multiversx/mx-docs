---
id: install-update
title: Installing a Validator Node
---

[comment]: # (mx-abstract)

This page will guide you through the process of installing and updating a validator node.

[comment]: # (mx-context-auto)

## **Install your node(s)**

After preparing the user permissions, the script configurations, and the keys, the actual node installation can begin. The Validator script is a multi-purpose tool for managing your node, it is accessible to Mainnet, Devnet or Testnet.

Following these few steps, we will work on installing the MultiversX Network validator node to get it up and running on your local machine.

For installation, one must start the scripts by:

```bash
cd ~/mx-chain-scripts
./script.sh
```

After that, a menu will appear with the following options. Select the option `1` to install the node.

```bash
 1) install
 2) observing_squad
 3) multikey_group
 4) upgrade
 5) upgrade_multikey
 6) upgrade_squad
 7) upgrade_proxy
 8) remove_db
 9) start
10) start_all
11) stop
12) stop_all
13) cleanup
14) github_pull
15) add_nodes
16) get_logs
17) benchmark
18) quit
 Please select an action:1
```

:::note
As an alternative, the installation can be triggered by executing the following command:

```bash
~/mx-chain-scripts/script.sh install
```
:::

- When asked, indicate the number of nodes you want to run, i.e. `1`
- When asked, indicate the name of your validator, i.e. `Valar`
- Quit the menu without starting (we need keys first) by using `14 - quit`

[comment]: # (mx-context-auto)

### **Prepare your keys**

Create a new folder "VALIDATOR_KEYS" to serve as a local backup when updating:

```bash
cd ~
mkdir -p ~/VALIDATOR_KEYS

```

Generate a certificate file containing your Validator key by running the `keygenerator`:

```bash
./elrond-utils/keygenerator

```

Copy the generated `validatorKey.pem` file to the `config` folder of your node(s), and repeat for each node.

```bash
    cp validatorKey.pem ~/elrond-nodes/node-0/config/

```

:::tip
Each node needs its unique `validatorKey.pem` file
:::

Then copy the `validatorKey.pem` file - in ZIP form - to the `$HOME/VALIDATOR_KEYS/` folder . This is important for your node to be able to restart correctly after an upgrade.

```bash
zip node-0.zip validatorKey.pem
mv node-0.zip $HOME/VALIDATOR_KEYS/

```

Repeat the above process for all your “n” nodes. When complete, please refer to our Key management section for instructions about how to properly backup and protect your keys.

[comment]: # (mx-context-auto)

### **Start the node(s)**

```bash
~/mx-chain-scripts/script.sh start
```

[comment]: # (mx-context-auto)

### **Start the node visual interface**

Once the node has started, you can check its progress, using the `TermUI` interface. Navigate to your `$HOME/elrond-utils` directory and start the `TermUI`, one for each of your nodes:

```bash
cd $HOME/elrond-utils
./termui -address localhost:8080
```

:::tip

Your first node is called `node-0` and it is a REST API that will run on port `8080` by default. The next node is `node-1`on port `8081`, and so on.
:::

[comment]: # (mx-context-auto)

## **Update your node(s)**

Upgrade your node by running the script and selecting either of these options:

- `14 - github_pull` downloads the latest version of the scripts
- `4 - upgrade`
- `9 - start`
- `18 - quit`

```bash
~/mx-chain-scripts/script.sh
```

These are the basic steps. Please carefully read the on-screen instructions, refer to the scripts [readme file](https://github.com/multiversx/mx-chain-scripts/blob/master/README). You can also ask any questions in the MultiversX [Validators chat](https://t.me/MultiversXValidators)

[comment]: # (mx-context-auto)

## **Mandatory: Backup your keys**

Your private keys are needed to run your node. Losing them means losing control of your node. A 3rd party gaining access to them could result in loss of funds.

Find them in `$HOME/elrond-nodes/node-0/config` [be mindful of your “`n`” nodes]

:::important
Create a safe backup for them on storage outside of the server running your node(s).
:::

[comment]: # (mx-context-auto)

## **Migration from old scripts**

Before the release of the current `mx-chain-scripts`, there were the `elrond-go-scripts-testnet`, `elrond-go-scripts-devnet` and `elrond-go-scripts-mainnet` for setting up nodes
on the testnet, devnet and mainnet respectively. Those three repositories have been deprecated because `elrond-go-scripts` can be used to manage nodes regardless of their target network (`testnet`, `devnet` or `mainnet`).

If one wants to migrate from the old scripts to the new ones, it is generally possible to do so while preserving the validator keys, current node installation, DB and logs.
These are the steps to be followed:

- clone the `mx-chain-scripts` repo near the old one (`elrond-go-scripts-testnet`/`elrond-go-scripts-devnet`/`elrond-go-scripts-mainnet`); assuming the old scripts were located in the home directory, run the following:

```
cd ~
git clone https://github.com/multiversx/mx-chain-scripts
```

- configure the new scripts as described in the sections above;
- make sure you set the new `ENVIRONMENT` variable declared within `~/mx-chain-scripts/config/variables.cfg`; it must contain one of `"testnet"`, `"devnet"` or `"mainnet"`;
- call the `migrate` operation on the scripts:

```
cd ~/mx-chain-scripts
./script.sh migrate
```

Be careful as to not mix the previous installation network with the new one. This might lead to unpredictable results.

[comment]: # (mx-context-auto)

## **Choosing a custom configuration tag or branch**

:::caution
This option should be only used when debugging or testing in advance of a pre-release tag.
Use this on your own risk!
:::

The power of the scripts set has been leveraged with a new addition: the possibility to tell the scripts a specified tag
or branch (not recommended using a branch due to the fact that an unsigned commit might bring malicious code or configs)

To accomplish this, edit the variables.cfg file

```
cd ~/mx-chain-scripts/config
nano variables.cfg
```

locate the `OVERRIDE_CONFIGVER` option and input a value there, something like `tags/T1.3.14.0`.
The `tags/` prefix will tell the scripts to use the tag and not search a branch called `T1.3.14.0`.
Call the `upgrade` command on the scripts to install the desired configuration version.

Resetting the value to `""` will make the scripts to use the released version.

:::caution
The `OVERRIDE_CONFIGVER` is not backed up when calling `github_pull` operation.
:::

## **Troubleshooting**

If the node fails to start and the termui window shows messages like:
```
termui websocket error, retrying in 10s...
termui websocket error, retrying in 10s...
termui websocket error, retrying in 10s...
```

a good method to check what the node is trying to do at startup (and fails) is to issue this command:

```bash
sudo journalctl -f -u elrond-node-XXX.service
```
 by replacing `XXX` with the actual node instance on the machine: 0, 1, 2, 3... 