---
id: reproducible-contract-builds
title: Reproducible Builds
---

This page will guide you through the process of supporting [reproducible contract builds](https://en.wikipedia.org/wiki/Reproducible_builds), by leveraging Docker and a set of _frozen_ Docker images available on [DockerHub](https://hub.docker.com/r/elrondnetwork/elrond-sdk-erdpy-rust/tags). 

You will also learn how to reproduce a contract build, given its source code and the name (tag) of a _frozen_ Docker image that was used for its previous build (that we want to reproduce).

> **Reproducible builds**, also known as **deterministic compilation**, is a process of compiling software which ensures the resulting binary code can be reproduced. Source code compiled using deterministic compilation will always output the same binary [[Wikipedia]](https://en.wikipedia.org/wiki/Reproducible_builds).

:::important
As of September 2022, the Rust compiler does not support reproducible builds out-of-the-box, thus we recommend smart contract developers to follow this tutorial in order to achieve deterministic compilation.
:::

## Smart Contract `codehash`

Before diving into contract build reproducibility, let's grasp the concept of `codehash`.

When a smart contract is deployed, the network stores the bytecode and also computes its `blake2b` hash (using a digest length of 256 bits). This is called the `codehash`.

Assume that we are interested into the following contract, on _devnet_: [erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy](https://devnet-explorer.elrond.com/accounts/erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy).

Using Python3 and [`requests`](https://requests.readthedocs.io) (for readability), we can fetch its _codehash_ from the API:

```
import base64

import requests

contract = "erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy"
data = requests.get(f"https://devnet-api.elrond.com/accounts/{contract}").json()

# The API returns the base-64 encoded codehash
codehash_base64 = data["codeHash"]
codehash = base64.b64decode(codehash_base64)
codehash_hex = codehash.hex()

print(codehash_hex)
```

The output is:

```
8da80dd8bf5b32dfdeaa919901c679d8167162aed7eb7ea41502c7f3d1b27e25
```

Alternatively, we can locally compute the _codehash_, as well (using the `blake2b` module):

```
from hashlib import blake2b

import requests

contract = "erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy"
data = requests.get(f"https://devnet-api.elrond.com/accounts/{contract}").json()
code_hex = data["code"]
code = bytes.fromhex(code_hex)

h = blake2b(digest_size=32)
h.update(code)
codehash_hex = h.hexdigest()

print(codehash_hex)
```

If the `WASM` file is directly available, the snippet simplifies to:

```
from hashlib import blake2b

bytecode_file = open("adder.wasm", "rb")
code = bytecode_file.read()
bytecode_file.close()

h = blake2b(digest_size=32)
h.update(code)
codehash_hex = h.hexdigest()

print(codehash_hex)
```

One can also use the utility `b2sum` to locally compute the _codehash_:

```
b2sum -l 256 adder.wasm
```

Now, one can easily compare two builds of a given contract using solely the _codehash_.

## Supporting reproducible builds

As of September 2022, the recommended approach to support reproducible builds for your smart contract is to perform the **deployment build** (as opposed to regular development builds) in a Docker container based on a [publicly-available, tagged Docker image](https://hub.docker.com/r/elrondnetwork/elrond-sdk-erdpy-rust/tags), that includes fixed, explicit versions of the build tools (_erdpy_, _Rust_, _wasm-opt_ etc.). In addition, the current directory when running the build command should be: `/home/elrond`. 

The above constraints are recommended in order to avoid eventual pieces of non-determinism related to `cargo`'s (essential component of the Rust toolchain) sensibility on the environment.

:::important
If the code source of your smart contract is hosted on GitHub, then a good practice is to define a GitHub workflow similar to [this one](https://github.com/ElrondNetwork/reproducible-contract-build-example/blob/main/.github/workflows/release.yml) to perform the build.
:::

### Choose an image tag

The first step for supporting reproducible builds is to decide on a specific Docker image tag to use. Check the **frozen** tags listed at [elrondnetwork/elrond-sdk-erdpy-rust](https://hub.docker.com/r/elrondnetwork/elrond-sdk-erdpy-rust/tags), and inspect their labels - especially the label `rust`:

```
LABEL rust=nightly-2022-03-01
```

The chosen, _frozen_ image tag will accompany the source code (e.g. via _release notes_) and allow others to reproduce the build.

:::note
In this context, _frozen_ image tag refers to a Docker image tag that will never get any updates after its initial publishing.
:::

### Regular builds vs. _deployment_ build

Usually, while developing, testing and integrating a smart contract, one would simply run locally the command `erdpy contract build`, which generates the WASM bytecode. 

However, for production-ready deployments, in order to achieve reproducible builds, make sure to only deploy contracts built as described in the next section, using the chosen Docker image.

## (Re)producing a build

In this section, we'll learn how to run a reproducible build, or, to put it differently, how to reproduce the previous build, on your local machine - using the chosen (by the developer of the smart contract) Docker image (tag).

### Fetch the source code

Let's clone the source code locally, and checkout to a certain tag we'd like to build:

```
mkdir -p ~/contracts && cd ~/contracts
git clone https://github.com/ElrondNetwork/reproducible-contract-build-example.git --branch=v0.1.2 --depth=1
```

### Preparing environment variables

Let's export the following variables:

```
export REPOSITORY_ON_HOST=~/contracts/reproducible-contract-build-example
export REPOSITORY_IN_CONTAINER=/home/elrond/reproducible-contract-build-example
export IMAGE=elrondnetwork/elrond-sdk-erdpy-rust:frozen-003
```

The latter export statement explicitly selects the **chosen, _frozen_ Docker image tag** to be used.

### Performing the build

On the host (locally), make sure the folder containing the source code can be accessed by the user defined in the Docker image, `elrond:elrond`. You can easily do so by granting read & write permissions for all users:

```
sudo chmod -R a+rw ${REPOSITORY_ON_HOST}
```

Now let's build the contract by invoking the following `docker run` command:

```
docker run -it \
--mount type=bind,source=${REPOSITORY_ON_HOST},destination=${REPOSITORY_IN_CONTAINER} \
--rm \
--entrypoint /bin/bash \
${IMAGE} \
-c "\
cd ${REPOSITORY_IN_CONTAINER} && \
erdpy contract clean --recursive && \
erdpy contract build --recursive\
"
```

After running the command, take ownership over `output` folders created within `${REPOSITORY_ON_HOST}`:

```
sudo chown -R $(id -un):$(id -gn) ${REPOSITORY_ON_HOST}
```

### Comparing the codehashes

Once the build is ready, you can compute the codehash of the `*.wasm` files, as follows:

```
for i in $(find ${REPOSITORY_ON_HOST} -type f -wholename **/output/*.wasm); do
    filename=$(basename ${i})
    checksum=($(b2sum -l 256 ${i}))
    echo "${filename}: ${checksum}"
done
```

In our example, the output should be:

```
adder.wasm: 8da80dd8bf5b32dfdeaa919901c679d8167162aed7eb7ea41502c7f3d1b27e25
```

We can see that it matches the previously fetched (or computed) codehash.

**Congratulations!** You've achieved a reproducible contract build 🎉
