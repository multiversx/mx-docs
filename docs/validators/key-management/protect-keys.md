---
id: protect-keys
title: Protecting your keys
---

[comment]: # (mx-abstract)
This page contains information about how to protect your validator and wallet keys.

[comment]: # (mx-context-auto)

## How sensitive are your keys

Validator Keys are very sensitive:

- if you lose them and your node crashes irreparably (i.e. you delete the virtual machine, your VPS provider deletes/loses it), you lose access to that node, you won't be able to bring it back up online and will thus stop earning money with it
- if someone steals them and maliciously uses them in the MultiversX network, they can engage in bad behavior such as double-signing, produce bad blocks, inject fake transactions, mint new coins, etc. - all of those actions are slashable, meaning you can lose your EGLD stake - all 2500!

Wallet Keys are extremely sensitive because:

- if you lose the keys, you can't recover your stake or claim your rewards -> you lose all the money
- if someone steals your keys, they can send an unstake transaction from it and claim the EGLD -> the bad guys steal your money

[comment]: # (mx-context-auto)

## How to protect your keys

How to protect them:

- make multiple safe backups of the private keys & files
  - paper
  - hardware
  - encrypted physical storage
  - distributed cloud storage, etc
  - [some hints](https://coinsutra.com/bitcoin-private-key/)

:::tip
Wallet Keys are not required on host running the Node. Store them on a different location.
:::

[comment]: # (mx-context-auto)

## How to secure your node

Secure your MultiversX node

- no ports should open in the firewall except for the ones used by the node's normal operation 
(the port range can be checked [here](/validators/system-requirements).)
- don't run the node as `root`
- use encryption, all other measures
- [some hints ](https://www.liquidweb.com/kb/security-for-your-linux-server/)
