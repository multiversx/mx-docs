---
id: use-docker
title: How to use the Docker Image
---

As an alternative to the recommended installation flow, one could choose to run an Elrond Node using the official Docker image: [elrondnetwork/elrond-go-node](https://hub.docker.com/r/elrondnetwork/elrond-go-node).

The following command runs a Node using the `latest` Docker image and maps a container folder to a local one that holds the necessary configuration:

```
docker run -d -v /absolute/path/to/config/:/data/ elrondnetwork/elrond-go-node:latest \
 --nodes-setup-file="/data/nodesSetup.json" \
 --p2p-config="/data/config/p2p.toml" \
 --validator-key-pem-file="/data/keys/validatorKey.pem"
```

In the snippet above, make sure you adjust the path to a valid configuration folder and also provide the appropriate command line arguments to the Node. For more details go to [Node CLI](/validators/node-cli).

**Testnet** Validators may switch between different versions of the Node using the following Docker tags:

- `elrondnetwork/elrond-go-node:latest`
- `elrondnetwork/elrond-go-node:devlatest`
- `elrondnetwork/elrond-go-node:<tag>`, in general form

:::note Attention required
**Mainnet** validators **should carefully** specify the precise tag when using the Docker setup, always test the new releases themselves, and only deploy them once they understand and agree with the changes.
:::
