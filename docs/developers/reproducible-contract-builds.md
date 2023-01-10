---
id: reproducible-contract-builds
title: Reproducible Builds
---

This page will guide you through the process of supporting [reproducible contract builds](https://en.wikipedia.org/wiki/Reproducible_builds), by leveraging Docker and a set of [_frozen_ Docker images available on DockerHub](https://hub.docker.com/r/elrondnetwork/build-contract-rust/tags).

You will also learn how to reproduce a contract build, given its source code and the name (tag) of a _frozen_ Docker image that was used for its previous build (that we want to reproduce).

> **Reproducible builds**, also known as **deterministic compilation**, is a process of compiling software which ensures the resulting binary code can be reproduced. Source code compiled using deterministic compilation will always output the same binary [[Wikipedia]](https://en.wikipedia.org/wiki/Reproducible_builds).

:::important
As of September 2022, the Rust toolchain does not support reproducible builds out-of-the-box, thus we recommend smart contract developers to follow this tutorial in order to achieve deterministic compilation.
:::

## Smart Contract `codehash`

Before diving into contract build reproducibility, let's grasp the concept of `codehash`.

When a smart contract is deployed, the network stores the bytecode, and also computes its `blake2b` checksum (using a digest length of 256 bits). This is called the `codehash`.

Assume that we are interested into the following contract, deployed on _devnet_: [erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy](https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy). It's source code is published on [GitHub](https://github.com/ElrondNetwork/reproducible-contract-build-example).

We can fetch the _codehash_ of the contract from the API:

```bash
curl -s https://devnet-api.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy \
| jq -r -j .codeHash \
| base64 -d \
| xxd -p \
| tr -d '\n'
```

The output is:

```
58c6e78f40bd6ccc30d8a01f952b34a13ebfdad796a2526678be17c5d7820174
```

If the `WASM` file is directly available, we can also use the utility `b2sum` to locally compute the _codehash_:

```bash
b2sum -l 256 adder.wasm
```

The output would be the same:

```
58c6e78f40bd6ccc30d8a01f952b34a13ebfdad796a2526678be17c5d7820174
```

All in all, in order to verify the bytecode equality of two given builds of a contract we can simply compare the _codehash_ property.

## Supporting reproducible builds

As of October 2022, the recommended approach to support reproducible builds for your smart contract is to use a build script relying on a specially-designed, [publicly-available, tagged Docker image](https://hub.docker.com/r/elrondnetwork/build-contract-rust/tags), that includes tagged, explicit versions of the build tools (_Rust_, _wasm-opt_ etc.).

This approach is recommended in order to counteract eventual pieces of non-determinism related to `cargo`'s (essential component of the Rust toolchain) sensibility on the environment.

:::important
If the code source of your smart contract is hosted on GitHub, then it's a good practice to define a GitHub Workflow similar to [this one](https://github.com/ElrondNetwork/reproducible-contract-build-example/blob/main/.github/workflows/release-create.yml), which performs the deployment (production-ready) build within the _release_ procedure.
:::

### Choose an image tag

The first step for supporting reproducible builds is to decide on a specific Docker image tag to use. Check the **frozen** tags listed at [elrondnetwork/build-contract-rust](https://hub.docker.com/r/elrondnetwork/build-contract-rust/tags), and inspect their labels - especially the labels `rust` and `wasm-opt-binaryen`:

```
LABEL rust=nightly-2022-08-23
LABEL wasm-opt-binaryen=version_105
```

For a new smart contract that isn't released yet (deployed on the network), it's recommended to pick the tag with the **largest index number**, which tipically includes recent versions of `rust` and other necessary dependencies.

However, for minor releases or patches, it's wise to stick to the previously chosen image tag, for the same (nuanced) reasons you would not embrace an update of your development tools in the middle of fixing a critical bug (in any development context).

The chosen, _frozen_ image tag should accompany the versioned source code (e.g. via _release notes_), in order to inform others on how to reproduce a specific build (of a specific source code version). In this context, _frozen_ image tag refers to a Docker image tag that will never get any updates after its initial publishing.

:::tip
It's perfectly normal to switch to a newer image tag on each (major) release of your contract. Just make sure you spread this information - i.e. using _release notes_.
:::

:::caution
Never pick the tag called `latest` for production-ready builds.
:::

## Building via Docker (reproducible build)

In this section, you'll learn how to run a reproducible build, or, to put it differently, how to reproduce a previous build (made by you or by someone else in the past), on the local machine, using Docker - without the need to install other tools such as _erdpy_ (nor its dependencies).

### Fetch the source code

Let's clone the [example source code](https://github.com/ElrondNetwork/reproducible-contract-build-example) locally, and switch to [a certain version](https://github.com/ElrondNetwork/reproducible-contract-build-example/releases/tag/v0.1.4) that we'd like to build:

```bash
mkdir -p ~/contracts && cd ~/contracts
git clone https://github.com/ElrondNetwork/reproducible-contract-build-example.git --branch=v0.1.4 --depth=1
```

By inspecting the release notes, we see that [`v0.1.4`](https://github.com/ElrondNetwork/reproducible-contract-build-example/releases/tag/v0.1.4) was built using the `image:tag = elrondnetwork/build-contract-rust:v2.0.0`.

### Download the build wrapper

The build process (via Docker) is wrapped in a easy-to-use, friendly Python script. Let's download it:

```bash
wget https://raw.githubusercontent.com/multiversx/mx-sdk-build-contract/main/build_with_docker.py
```

### Prepare environment variables

Export the following variables:

```rust
export PROJECT=~/contracts/reproducible-contract-build-example
export BUILD_OUTPUT=~/contracts/output-from-docker
export IMAGE=elrondnetwork/build-contract-rust:v2.0.0
```

The latter export statement explicitly selects the **chosen, _frozen_ Docker image tag** to be used.

### Perform the build

Now let's build the contract by invoking the previously-downloaded build wrapper:

```bash
python3 ./build_with_docker.py --image=${IMAGE} \
    --project=${PROJECT} \
    --output=${BUILD_OUTPUT}
```

In the `output` folder(s), you should see the following files (example):

- `adder.wasm`: the actual bytecode of the smart contract, to be deployed on the network;
- `adder.abi.json`: the ABI of the smart contract (a listing of endpoints and types definitions), to be used when developing dApps or simply interacting with the contract (e.g. using _erdjs_);
- `adder.codehash.txt`: a file containing the computed `codehash` of the contract.
- `adder.wat`: a textual representation of the bytecode, to be displayed in text editors, if necessary;
- `adder.imports.json`: a listing of VM API functions imported and used by the contract.
- `adder-v1.2.3.zip`: a versioned archive containing the source code used as input for the build.

### TL;DR build snippet

These being said, let's summarize the steps above into a single bash snippet:

```bash
wget https://raw.githubusercontent.com/multiversx/mx-sdk-build-contract/main/build_with_docker.py

export PROJECT=~/contracts/reproducible-contract-build-example
export BUILD_OUTPUT=~/contracts/output-from-docker
export IMAGE=elrondnetwork/build-contract-rust:v2.0.0

python3 ./build_contract_rust_with_docker.py --image=${IMAGE} \
    --project=${PROJECT} \
    --output=${BUILD_OUTPUT}
```

### Comparing the codehashes

Once the build is ready, you can check the codehash of the generated `*.wasm`, by inspecting the file `*.codehash.txt`

For our example, that should be:

```
adder.codehash.txt: 58c6e78f40bd6ccc30d8a01f952b34a13ebfdad796a2526678be17c5d7820174
```

We can see that it matches the previously fetched (or computed) codehash. That is, the contract deployed at [erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy](https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqahertgz4020wegswus8m7f2ak8a6d0gv396qw3t2zy) is guaranteed to have been built from the same source code version as the one that we've checked out.

**Congratulations!** You've achieved a reproducible contract build 🎉
