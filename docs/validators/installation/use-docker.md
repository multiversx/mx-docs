---
id: use-docker-devnet
title: How to use the Docker Image
---


As an alternative to the recommended installation flow, one could choose to run an Elrond Node using the official Docker image: [elrondnetwork/elrond-go-node](https://hub.docker.com/r/elrondnetwork/elrond-go-node-testnet)

 Pull the latest image of an Elrond node with this config from Dockerhub

```docker
docker pull elrondnetwork/elrond-go-node:latest
```

- Note: *You can pull from either the devnet, or testnet network of your choice.* *Example,* `docker pull elrondnetwork/elrond-go-node-testnet:latest`  

Let’s proceed!

The following commands run a Node using the `latest` Docker image and map a container folder to a local one that holds the necessary configuration:

```docker
PATH_TO_BLS_KEY_FILE=/absolute/path/to/bls-key

docker run --mount type=bind,source=${PATH_TO_BLS_KEY_FILE}/,destination=/data elrondnetwork/elrond-go-node-testnet:latest \
 --validator-key-pem-file="/data/validatorKey.pem"
```

In the snippet above, make sure you adjust the path to a valid key file and also provide the appropriate command-line arguments to the Node. For more details go to [Node CLI](https://docs.elrond.com/validators/node-cli).

:::note Attention required

**Devnet** and **Testnet** validators **should carefully** specify the precise tag when using the Docker setup, always test the new releases themselves, and only deploy them once they understand and agree with the changes.
:::

:::tip For CentOS users
If the docker image runs on CentOS, the machine needs the `allow_execheap` flag to be enabled.

In order to do this, run the command `sudo setsebool allow_execheap=true`
:::
