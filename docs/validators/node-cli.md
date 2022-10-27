---
id: node-cli
title: Node CLI
---

Command Line Interface for the Node and the associated Tools

The **Command Line Interface** of the **Node** and its associated **Tools** is described at the following locations:

- [Node](https://github.com/ElrondNetwork/elrond-go/blob/development/cmd/node/CLI.md)
- [SeedNode](https://github.com/ElrondNetwork/elrond-go/blob/development/cmd/seednode/CLI.md)
- [Keygenerator](https://github.com/ElrondNetwork/elrond-go/blob/development/cmd/keygenerator/CLI.md)
- [TermUI](https://github.com/ElrondNetwork/elrond-go/blob/development/cmd/termui/CLI.md)
- [Logviewer](https://github.com/ElrondNetwork/elrond-go/blob/development/cmd/logviewer/CLI.md)

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
