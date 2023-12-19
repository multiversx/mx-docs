---
id: installing-mxpy
title: Installing mxpy
---

[comment]: # (mx-abstract)

This page describes how to install **mxpy** (the CLI tool). The recommended way to install **mxpy** is by using **pipx**. If you want to learn more about **pipx** you can check out [this page](https://pipx.pypa.io/stable/#overview-what-is-pipx).

**mxpy** is currently supported on Linux and MacOS. Some of its features might work on Windows as well, although using **mxpy** on Windows is neither recommended, nor supported at this time.

[comment]: # (mx-context-auto)

## **Prerequisites**

Before installing **mxpy**, please make sure you have a working **Python 3** environment. You'll need **Python 3.8** or later on Linux or MacOS.

[comment]: # (mx-context-auto)

## **Install using pipx**

:::info
Keep in mind that installing using **pipx** is only available for **mxpy v9.2.0** or later.
:::

You'll need **pipx** installed on your machine. For more details on how to install **pipx** check out [this page](https://pipx.pypa.io/stable/#install-pipx).

In order to install **mxpy** using `pipx`, run the following command:

```sh
pipx install multiversx-sdk-cli
```

This will simply install the latest version available.

In case you want to install a specific version you should also specify the version.
```sh
pipx install multiversx-sdk-cli==9.2.0
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

In order to install **mxpy** using the `mxpy-up` script, run the following commands:

```
wget -O mxpy-up.py https://raw.githubusercontent.com/multiversx/mx-sdk-py-cli/main/mxpy-up.py
python3 mxpy-up.py
```

Running the above will create a Python virtual environment in `~/multiversx-sdk/mxpy-venv`, it will install the package [`multiversx-sdk-cli`](https://pypi.org/project/multiversx-sdk-cli) into this environment, and it will create the shortcut `~/multiversx-sdk/mxpy`. 

The `mxpy` shortcut is not automatically added to your **`$PATH`** environment variable, so **you'll need to configure that manually** (see below).

[comment]: # (mx-context-auto)

## Make mxpy available in your shell

In order to have the **mxpy** shortcut available in the shell after installation, you'll need to manually include `~/multiversx-sdk` in your **`$PATH`** environment variable by editing the appropriate shell profile file: `~/.bashrc` (for Bash) or `~/.zshrc` (for Zsh).

For example:

```
echo "export PATH="\$HOME/multiversx-sdk:\$PATH"" >> ~/.bashrc
echo "export PATH="\$HOME/multiversx-sdk:\$PATH"" >> ~/.zshrc
```

Then, open a new shell and run the following to verify that **mxpy** is installed correctly:

```
mxpy --version
```
