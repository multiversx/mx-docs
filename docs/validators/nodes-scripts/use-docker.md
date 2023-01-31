---
id: use-docker
title: How to use the Docker Image
---

[comment]: # (mx-context)

As an alternative to the recommended installation flow, one could choose to run an MultiversX Node using the official Docker images: [here](https://hub.docker.com/u/multiversx)

On the `dockerhub` there are Docker images for every chain (mainnet, devnet and testnet).

Images name:
- for mainnet: [chain-mainnet](https://hub.docker.com/r/multiversx/chain-mainnet)
- for devnet: [chain-devnet](https://hub.docker.com/r/multiversx/chain-devnet)
- for testnet: [chain-testnet](https://hub.docker.com/r/multiversx/chain-testnet)

:::note Attention required

In order to get the latest tag for an image check the latest `RELEASE` from the config repository ([mainnet](https://github.com/multiversx/mx-chain-mainnet-config/releases), [devnet](https://github.com/multiversx/mx-chain-devnet-config/releases) or [testnet](https://github.com/multiversx/mx-chain-testnet-config/releases)).
:::

[comment]: # (mx-context)

### How to pull a Docker image from Dockerhub for node ? 
```docker
IMAGE_NAME=chain-mainnet
IMAGE_TAG=[latest_release_tag]
docker pull multiversx/${IMAGE_NAME}:${IMAGE_TAG}
```

[comment]: # (mx-context)

### How to generate a BLS key ? 
In order to generate a new BLS key one has to pull from `dockerhub` an image for the `chain-keygenerator` tool:
```
# pull image from dockerhub
docker pull multiversx/chain-keygenerator:latest

# create a folder for the bls key
BLS_KEY_FOLDER=~/bls-key
mkdir ${BLS_KEY_FOLDER}

# generate a new BLS key
docker run --rm --mount type=bind,source=${BLS_KEY_FOLDER},destination=/keys --workdir /keys multiversx/chain-keygenerator:latest
```

[comment]: # (mx-context)

### How to run a node with Docker ? 

The following commands run a Node using the Docker image and map a container folder to a local one that holds the necessary configuration:

```docker
PATH_TO_BLS_KEY_FILE=/absolute/path/to/bls-key
IMAGE_NAME=chain-mainnet
IMAGE_TAG=[latest_release_tag]

docker run --mount type=bind,source=${PATH_TO_BLS_KEY_FILE}/,destination=/data multiversx/${IMAGE_NAME}:${IMAGE_TAG} \
 --validator-key-pem-file="/data/validatorKey.pem"
```

In the snippet above, make sure you adjust the path to a valid key file and also provide the appropriate command-line arguments to the Node. For more details go to [Node CLI](https://docs.multiversx.com/validators/node-cli).

:::note Attention required

**Devnet** and **Testnet** validators **should carefully** specify the precise tag when using the Docker setup, always test the new releases themselves, and only deploy them once they understand and agree with the changes.
:::

:::tip For CentOS users
If the docker image runs on CentOS, the machine needs the `allow_execheap` flag to be enabled.

In order to do this, run the command `sudo setsebool allow_execheap=true`
:::
