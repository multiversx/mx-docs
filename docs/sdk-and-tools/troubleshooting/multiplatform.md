---
id: multiplatform
title: MultiversX tools on multiple platforms
---

Generally speaking, the MultiversX tools should work on all platforms. However, platform-specific issues can occur. This page aims to be an entry point for troubleshooting platform-specific issues, in regards to the MultiversX toolset.

## Linux

All tools are expected to work on Linux. They are generally tested on Ubuntu-based distributions. If you encounter an issue with a specific Linux distribution, please let us known, on the [corresponding GitHub repository](/sdk-and-tools/overview).

## MacOS

All tools are expected to work on MacOS. Though, even if the tests within the continous integration flows cover MacOS, some inconveniences might still occur.

If you encounter an issue on MacOS, please let us known, on the [corresponding GitHub repository](/sdk-and-tools/overview).

### Apple Silicon (M1, M2)

As of February 2024, the Node can only be compiled using the AMD64 version of Go. Thus, dependent tools, such as [localnets](/developers/setup-local-testnet.md), the [Chain Simulator](/sdk-and-tools/chain-simulator.md) etc. will rely on the [Apple Rosetta binary translator](https://en.wikipedia.org/wiki/Rosetta_(software)).

:::note
As of February 2024, a native ARM64 version of the Node is in the works. This will allow the dependent tools to run natively on Apple Silicon.
:::

If you'd like to build a Go tool that is not yet available for ARM64, this is how you can do it:

1. Download & extract the Go toolchain for AMD64: https://go.dev/dl/go1.20.7.darwin-amd64.tar.gz

2. Export `GOPATH` and `GOENV` variables into your shell:

```sh
export GOPATH=/(extraction path)/go
export GOENV=/(extraction path)/go/env
```

3. Build the tools, as needed.

The obtained binaries will be AMD64, and they will run on your ARM64 system.

## Windows

Some tools can be difficult to install or run **directly on Windows**. For example, when building smart contracts, the encountered issues might be harder to tackle, especially for beginners. 

Therefore, we recommend using the [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install), instead of running the tools directly on Windows. 

If you still encounter an issue on WSL, please let us known, on the [corresponding GitHub repository](/sdk-and-tools/overview).
