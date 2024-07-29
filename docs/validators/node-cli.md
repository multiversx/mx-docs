---
id: node-cli
title: Node CLI
---

[comment]: # (mx-abstract)

This page will guide you through the CLI fields available for the node and other tools from the `mx-chain-go` repository.

[comment]: # (mx-context-auto)

## **Introduction**

Command Line Interface for the Node and the associated Tools

The **Command Line Interface** of the **Node** and its associated **Tools** is described at the following locations:

- [Node](https://github.com/multiversx/mx-chain-go/blob/master/cmd/node/CLI)
- [SeedNode](https://github.com/multiversx/mx-chain-go/blob/master/cmd/seednode/CLI)
- [Keygenerator](https://github.com/multiversx/mx-chain-go/blob/master/cmd/keygenerator/CLI)
- [TermUI](https://github.com/multiversx/mx-chain-go/blob/master/cmd/termui/CLI)
- [Logviewer](https://github.com/multiversx/mx-chain-go/blob/master/cmd/logviewer/CLI)

[comment]: # (mx-context-auto)

## **Examples**

For example, the following command starts an **Observer Node** in **Shard 0**:

```
./node --rest-api-interface=localhost:8080 \
 --log-save --log-level=*:DEBUG --log-logger-name \
 --destination-shard-as-observer=0 --start-in-epoch\
 --validator-key-pem-file=observer0.pem
```

While the following starts a Node as a **Metachain Observer**:

```
./node --rest-api-interface=localhost:8080 \
 --use-log-view --log-save --log-level=*:DEBUG --log-logger-name \
 --destination-shard-as-observer=metachain --start-in-epoch\
 --validator-key-pem-file=observerMetachain.pem
```
