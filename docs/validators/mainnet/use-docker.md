---
id: use-docker
title: How to use the Docker Image
---

As an alternative to the recommended installation flow, one could choose to run an Elrond Node using the official Docker image: [elrondnetwork/elrond-go-node-mainnet](https://hub.docker.com/r/elrondnetwork/elrond-go-node-mainnet).

Pull the latest image of an Elrond node with mainnet config from Dockerhub
```
docker pull elrondnetwork/elrond-go-node-mainnet:latest
```

The following commands run a Node using the `latest` Docker image and map a container folder to a local one that holds the necessary configuration:

```
PATH_TO_BLS_KEY_FILE=/absolute/path/to/bls-key

docker run --mount type=bind,source=${PATH_TO_BLS_KEY_FILE}/,destination=/data elrondnetwork/elrond-go-node-mainnet:latest \
 --validator-key-pem-file="/data/validatorKey.pem"
```

In the snippet above, make sure you adjust the path to a valid key file and also provide the appropriate command line arguments to the Node. For more details go to [Node CLI](/validators/node-cli).

:::note Attention required
**Mainnet** validators **should carefully** specify the precise tag when using the Docker setup, always test the new releases themselves, and only deploy them once they understand and agree with the changes.
:::

:::tip For CentOS users
If the docker image runs on CentOS, the machine needs the `allow_execheap` flag to be enabled.
In order to do this, one has to run the command `sudo setsebool allow_execheap=true`
:::