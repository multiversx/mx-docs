---
id: devcontainers
title: Devcontainers
---

[comment]: # (mx-abstract)

In **Visual Studio Code**, you use a **container** as a [full-featured **development environment**](https://code.visualstudio.com/docs/devcontainers/containers). As of September 2023, one MultiversX devcontainer is available:
 - [**MultiversX: Smart Contracts Development (Rust)**](https://containers.dev/templates). This one includes **mxpy**, **Rust**, **sc-meta**, the **MultiversX IDE** (Visual Studio Code extension) etc.

:::note
The devcontainers for MultiversX are maintained in [**mx-template-devcontainers**](https://github.com/multiversx/mx-template-devcontainers).
:::

Before setting up a MultiversX devcontainer, make sure to follow these tutorials:
 - [Beginner's Series to Dev Containers](https://youtube.com/playlist?list=PLj6YeMhvp2S5G_X6ZyMc8gfXPMFPg3O31)
 - [Dev Container How To](https://youtube.com/playlist?list=PLj6YeMhvp2S6GjVyDHTPp8tLOR0xLGLYb)

Once you're accustomed to the concept, follow the steps below to set up a MultiversX devcontainer:
 - In Visual Studio Code, open the _Command Palette_ (e.g. `Ctrl + Shift + P`) and select `Dev Containers: New Dev Container`;
 - When prompted, select `MultiversX: Smart Contracts Development (Rust)`, or any other devcontainer you want to use;
 - When prompted, select `Trust @multiversx`;
 - Enter a name for your devcontainer.

Once the development environment is ready, do a quick exploration exercise. For example, run the following commands in the terminal (within Visual Studio Code):

```
mxpy --version
sc-meta --version
```

## Using the Docker images without VSCode

If you'd like to use the development Docker image(s) without VSCode's devcontainers feature, this is entirely possible. For example, let's try the following (in any terminal):

```
docker run --rm -it multiversx/devcontainer-smart-contracts-rust:latest mxpy --version
docker run --rm -it multiversx/devcontainer-smart-contracts-rust:latest sc-meta --version
```

For a set of real-world examples, please follow [this](https://github.com/multiversx/mx-template-devcontainers#using-the-docker-images-without-vscode).
