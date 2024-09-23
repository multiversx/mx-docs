---
id: installing-mxpy
title: Installing mxpy
---

[comment]: # (mx-abstract)

This page describes how to install **mxpy** (the CLI tool). The recommended way to install **mxpy** is by using **pipx**. If you want to learn more about **pipx** you can check out [this page](https://pipx.pypa.io/stable/#overview-what-is-pipx).

:::note
If you'd like to use **mxpy** on Windows, we recommend installing it within the [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install). If you experience an issue, please follow the [troubleshooter](/sdk-and-tools/troubleshooting/multiplatform).
:::

[comment]: # (mx-context-auto)

## **Prerequisites**

Before installing **mxpy**, please make sure you have a working **Python 3** environment. You'll need **Python 3.8** or later on Linux or MacOS.

[comment]: # (mx-context-auto)

## **Install using pipx**

You'll need **pipx** installed on your machine. For more details on how to install **pipx** check out [**this page**](https://pipx.pypa.io/stable/#install-pipx).

:::note
If you've previously installed **mxpy** using **mxpy-up** we advise you to switch to **pipx**, but make sure to remove the old `mxpy` shortcut and virtual Python environment beforehand:

```sh
rm ~/multiversx-sdk/mxpy
rm -rf ~/multiversx-sdk/mxpy-venv
```

:::

In order to install **mxpy** using `pipx`, run the following command:

```sh
pipx install multiversx-sdk-cli --force
```

This will simply install the latest version available.

In case you want to install a specific version you should also specify the version.

```sh
pipx install multiversx-sdk-cli==9.5.1
```

You can also install **mxpy** directly from a GitHub branch. Replace `branch_name` with your desired branch and run the following command:

```sh
pipx install git+https://github.com/multiversx/mx-sdk-py-cli@branch_name
```

To check that **mxpy** installed successfully you can run the following command:

```sh
mxpy --version
```

Aditionally, if you'd like to have shell completion for `bash` and `zsh` run the following command then restart the shell:

```sh
activate-global-python-argcomplete
```

[comment]: # (mx-context-auto)

## **Upgrade mxpy using pipx**

To upgrade **mxpy** to a newer version you can simply run the following command:

```sh
pipx upgrade multiversx-sdk-cli
```
