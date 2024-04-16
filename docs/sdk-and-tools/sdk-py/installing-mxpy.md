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

:::info
Keep in mind that installing using **pipx** is only available for **mxpy v9.2.0** or later.
:::

You'll need **pipx** installed on your machine. For more details on how to install **pipx** check out [**this page**](https://pipx.pypa.io/stable/#install-pipx).

:::note
If you've previously installed **mxpy** using **mxpy-up** and you'd like to switch to **pipx**, make sure to remove the old `mxpy` shortcut and virtual Python environment beforehand:

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

[comment]: # (mx-context-auto)

## **Upgrade mxpy using pipx**

To upgrade **mxpy** to a newer version you can simply run the following command:

```sh
pipx upgrade multiversx-sdk-cli
```

[comment]: # (mx-context-auto)

## **Install using mxpy-up**

Installing **mxpy** using **mxpy-up** is not recommended anymore. We recommend using **pipx** instead.

If you've previously installed **mxpy** using **mxpy-up** and you'd like to switch to **pipx**, make sure to remove the old `mxpy` shortcut and virtual Python environment beforehand:

```sh
rm ~/multiversx-sdk/mxpy
rm -rf ~/multiversx-sdk/mxpy-venv
```

Additionally, you might want to cleanup the shell profile files, to not alter anymore the `PATH` variable with respect to `~/multiversx-sdk`: `~/.profile`, `~/.bashrc` and / or `~/.zshrc`.
