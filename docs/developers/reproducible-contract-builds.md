---
id: reproducible-contract-builds
title: Reproducible Builds
---
[comment]: # (mx-abstract)

This page will guide you through the process of supporting [reproducible contract builds](https://en.wikipedia.org/wiki/Reproducible_builds), by leveraging Docker and a set of [_frozen_ Docker images available on DockerHub](https://hub.docker.com/r/multiversx/sdk-rust-contract-builder/tags).

You will also learn how to reproduce a contract build, given its source code and the name (tag) of a _frozen_ Docker image that was used for its previous build (that we want to reproduce).

> **Reproducible builds**, also known as **deterministic compilation**, is a process of compiling software which ensures the resulting binary code can be reproduced. Source code compiled using deterministic compilation will always output the same binary [[Wikipedia]](https://en.wikipedia.org/wiki/Reproducible_builds).

:::important
As of May 2024, the Rust toolchain does not support reproducible builds out-of-the-box, thus we recommend smart contract developers to follow this tutorial in order to achieve deterministic compilation.
:::

[comment]: # (mx-context-auto)

## Smart Contract "codehash"

Before diving into contract build reproducibility, let's grasp the concept of `codehash`.

When a smart contract is deployed, the network stores the bytecode, and also computes its `blake2b` checksum (using a digest length of 256 bits). This is called the `codehash`.

Assume that we are interested into the following contract (a simple on-chain **adder**), deployed on _devnet_: [erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy](https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy). It's source code is published on [GitHub](https://github.com/multiversx/mx-contracts-rs).

We can fetch the _codehash_ of the contract from the API:

```bash
curl -s https://devnet-api.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy \
| jq -r -j .codeHash \
| base64 -d \
| xxd -p \
| tr -d '\n'
```

The output is:

```
384b680df7a95ebceca02ffb3e760a2fc288dea1b802685ef15df22ae88ba15b
```

If the `WASM` file is directly available, we can also use the utility `b2sum` to locally compute the _codehash_:

```bash
b2sum -l 256 adder.wasm
```

The output would be the same:

```
384b680df7a95ebceca02ffb3e760a2fc288dea1b802685ef15df22ae88ba15b
```

All in all, in order to verify the bytecode equality of two given builds of a contract we can simply compare the _codehash_ property.

[comment]: # (mx-context-auto)

## Supporting reproducible builds

As of May 2024, the recommended approach to support reproducible builds for your smart contract is to use a build script relying on a specially-designed, [publicly-available, tagged Docker image](https://hub.docker.com/r/multiversx/sdk-rust-contract-builder/tags), that includes tagged, explicit versions of the build tools (_Rust_, _wasm-opt_ etc.).

This approach is recommended in order to counteract eventual pieces of non-determinism related to `cargo`'s (essential component of the Rust toolchain) sensibility on the environment.

:::important
If the code source of your smart contract is hosted on GitHub, then it's a good practice to define a GitHub Workflow similar to [release.yml](https://github.com/multiversx/mx-contracts-rs/blob/main/.github/workflows/release.yml), which performs the deployment (production-ready) build within the _release_ procedure. Additionally, define a dry-run reproducible build on all your branches. See this workflow as an example: [on_pull_request_build_contracts.yml](https://github.com/multiversx/mx-contracts-rs/blob/main/.github/workflows/on_pull_request_build_contracts.yml).
:::

[comment]: # (mx-context-auto)

### Choose an image tag

For a new smart contract that isn't released yet (deployed on the network), it's recommended to pick the tag with the **largest index number**, which typically includes recent versions of `rust` and other necessary dependencies.

However, for minor releases or patches, it's wise to stick to the previously chosen image tag, for the same (nuanced) reasons you would not embrace an update of your development tools in the middle of fixing a critical bug (in any development context).

The chosen, _frozen_ image tag **should accompany the versioned source code (e.g. via _release notes_), in order to inform others on how to reproduce a specific build** (of a specific source code version). In this context, a _frozen_ image tag refers to a Docker image tag that will never get any updates after its initial publishing.

:::tip
It's perfectly normal to switch to a newer image tag on each (major) release of your contract. Just make sure you spread this information - i.e. using _release notes_.
:::

:::caution
Never pick the tag called `latest` or `next` for production-ready builds.
:::

[comment]: # (mx-context-auto)

## Building via Docker (reproducible build)

In this section, you'll learn how to run a reproducible build, or, to put it differently, how to reproduce a previous build (made by you or by someone else in the past), on the local machine, using Docker - without the need to install other tools such as _mxpy_ (nor its dependencies).

[comment]: # (mx-context-auto)

### Fetch the source code

Let's clone [mx-contracts-rs](https://github.com/multiversx/mx-contracts-rs) locally, and switch to [a certain version](https://github.com/multiversx/mx-contracts-rs/releases/tag/v0.45.4) that we'd like to build:

```bash
mkdir -p ~/contracts && cd ~/contracts
git clone https://github.com/multiversx/mx-contracts-rs.git --branch=v0.45.4 --depth=1
```

By inspecting the release notes, we see that [`v0.45.4`](https://github.com/multiversx/mx-contracts-rs/releases/tag/v0.45.4) was built using the `image:tag = multiversx/sdk-rust-contract-builder:v5.4.1`.

[comment]: # (mx-context-auto)

### Download the build wrapper

The build process (via Docker) is wrapped in a easy-to-use, friendly Python script. Let's download it:

```bash
wget https://raw.githubusercontent.com/multiversx/mx-sdk-build-contract/main/build_with_docker.py
```

[comment]: # (mx-context-auto)

### Prepare environment variables

Export the following variables:

```bash
export PROJECT=~/contracts/mx-contracts-rs
export BUILD_OUTPUT=~/contracts/output-from-docker
# Below, the image tag is just an example:
export IMAGE=multiversx/sdk-rust-contract-builder:v1.2.3
```

The latter export statement explicitly selects the **chosen, _frozen_ Docker image tag** to be used.

[comment]: # (mx-context-auto)

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
- **`adder.source.json`** : packaged (bundled) source code.

[comment]: # (mx-context-auto)

### TL;DR build snippet

These being said, let's summarize the steps above into a single bash snippet:

```bash
wget https://raw.githubusercontent.com/multiversx/mx-sdk-build-contract/main/build_with_docker.py

export PROJECT=~/contracts/mx-contracts-rs
export BUILD_OUTPUT=~/contracts/output-from-docker
# Below, the image tag is just an example:
export IMAGE=multiversx/sdk-rust-contract-builder:v1.2.3

python3 ./build_with_docker.py --image=${IMAGE} \
    --project=${PROJECT} \
    --output=${BUILD_OUTPUT}
```

[comment]: # (mx-context-auto)

### Reproducible build using mxpy

A more straightforward alternative to the previous bash script is to use **mxpy** to build a contract in a reproducible manner.

First, make sure you have the:

- latest [mxpy](/sdk-and-tools/sdk-py/installing-mxpy) installed,
- latest [docker engine](https://docs.docker.com/engine/install/) installed.

Then, use the `reproducible-build` command (below, the image tag is just an example):

```
mxpy contract reproducible-build --docker-image="multiversx/sdk-rust-contract-builder:v1.2.3"
```

This will build all the smart contracts inside the current working directory. If you want to build the smart contracts inside another directory, you can specify an input directory:

```
mxpy contract reproducible-build ~/contracts/mx-contracts-rs --docker-image="multiversx/sdk-rust-contract-builder:v1.2.3"
```

Upon a successful build, an output folder named `output-docker` will be generated. It contains one subfolder for each contract, each holding the following files:

- `contract.wasm`: the actual bytecode of the smart contract, to be deployed on the network;
- `contract.abi.json`: the ABI of the smart contract (a listing of endpoints and types definitions), to be used when developing dApps or simply interacting with the contract (e.g. using _sdk-js_);
- `contract.codehash.txt`: the computed `codehash` of the contract.
- **`contract-1.2.3.source.json`** : packaged (bundled) source code.

:::tip
You can run a local test using [these example contracts](https://github.com/multiversx/mx-contracts-rs).
:::

[comment]: # (mx-context-auto)

### Comparing the codehashes

Once the build is ready, you can check the codehash of the generated `*.wasm`, by inspecting the file `*.codehash.txt`

For our example, that should be:

```
adder.codehash.txt: 384b680df7a95ebceca02ffb3e760a2fc288dea1b802685ef15df22ae88ba15b
```

We can see that it matches the previously fetched (or computed) codehash. That is, the contract deployed at [erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy](https://devnet-explorer.multiversx.com/accounts/erd1qqqqqqqqqqqqqpgqws44xjx2t056nn79fn29q0rjwfrd3m43396ql35kxy) is guaranteed to have been built from the same source code version as the one that we've checked out.

**Congratulations!** You've achieved a reproducible contract build 🎉

[comment]: # (mx-context-auto)

## How to verify a smart contract on Explorer?

The new MultiversX Explorer provides a convenient way to visualise the source code of deployed smart contracts on blockchain. This is the beauty of the Web3 vision for a decentralized internet, where anyone can deploy contracts that everyone can interact with. 

:::caution
Please note that as a **Beta** feature still in development, certain steps described may undergo changes.
:::

:::tip
Make sure that you have the latest `mxpy` installed. In order to install mxpy, follow the instructions at [install mxpy](/sdk-and-tools/sdk-py/installing-mxpy).
:::

1. The contract must be deterministically built as described [above](/developers/reproducible-contract-builds#building-via-docker-reproducible-build).
2. To start with the verification process, we need to first deploy the smart contract. For deploying contracts have a look [here](/sdk-and-tools/sdk-py/smart-contract-interactions/#deploy--upgrade).
3. Upon deploying, the output will not only provide information such as the transaction hash and data, but also the address of the newly deployed contract.
4. In order to verify your contract the command you have to use is (below, the image tag is just an example):

```
mxpy --verbose contract verify "erd1qqqqqqqqqqqqqpgq6u07hhkfsvuk5aae92g549s6pc2s9ycq0dps368jr5" --packaged-src=./output-docker/contract/contract-0.0.0.source.json --verifier-url="https://play-api.multiversx.com" --docker-image="multiversx/sdk-rust-contract-builder:v1.2.3"  --pem=contract-owner.pem
```

:::tip
For the above code snippet:
- `erd1qqqqqqqqqqqqqpgq6u07hhkfsvuk5aae92g549s6pc2s9ycq0dps368jr5` - should be your contract address (in this case is a dummy address);
- `--packaged-src=./output-docker/contract/contract-0.0.0.source.json` - should be found in the output folder after deterministically building your contract;
- `--verifier-url="https://play-api.multiversx.com"` - this is the verifier api address. Be advised that it may be subject to change;
- `--docker-image="multiversx/sdk-rust-contract-builder:v1.2.3"` - the same version utilized in constructing the contract must be utilized here too;
- `--pem=contract-owner.pem` - represents the owner of the contract.
:::

5. Given the current limited bandwidth, it might take some time to be processed.
