---
id: installing-mxpy
title: Installing mxpy
---

How to install mxpy

**mxpy** is currently supported on Linux and MacOS. Some of its features might work on Windows as well, although using **mxpy** on Windows is neither recommended, nor supported at this time.

[comment]: # (mx-context-auto)

## **Prerequisites**

Before installing **mxpy**, please make sure you have a working **Python 3** environment:

- **3.8** or later on Linux and MacOS

Smart contracts written in C require the ncurses library routines for compiling. Install them using the following:

For Linux:
```
sudo apt install libncurses5
```
For MacOS:
```
brew install ncurses
```

[comment]: # (mx-context-auto)

## **Install using mxpy-up (recommended)**

In order to install **mxpy** using the `mxpy-up` installation script, run the following commands in a terminal:

```
wget -O mxpy-up.py https://raw.githubusercontent.com/multiversx/mx-sdk-py-cli/main/mxpy-up.py
python3 mxpy-up.py
```

This will create a light Python virtual environment (based on `venv`) in `~/multiversx-sdk/mxpy-venv `and also include `~/multiversx-sdk`in your **`$PATH`** variable (by editing the appropriate `.profile` file).

[comment]: # (mx-context-auto)

### **Troubleshooting and other notes**

On Ubuntu 20.04, if you receive the error: `invalid command 'bdist_wheel'` - run the following command, then retry mxpy-up:

```
pip3 install wheel
python3 mxpy-up.py
```

On MacOS, you can switch to Python 3.8 as follows:

```
brew info python@3.8
brew unlink python
brew link --force python@3.8
python3 --version
```

[comment]: # (mx-context-auto)

## **Install without mxpy-up**

If you'd like to install without relying on the easy installation script, please read this section. Otherwise, feel free to skip it.

Make sure you also have **pip3** installed.

[comment]: # (mx-context-auto)

### **Prepare PATH**

In order to have the command **mxpy** available in your shell after install, make sure you adjust the `PATH` environment variable as described below:

On Linux in `~/.profile`:

```
export PATH="$HOME/.local/bin:$PATH"
```

On MacOS in `~/.bash_profile` or `~/.zshrc` if you’re using `zsh`:

```
export PATH=$HOME/Library/Python/3.8/bin:${PATH}
```

:::note add the right version
In the snippet above, replace `3.8` with your actual `MAJOR.MINOR` version of Python. This can be found by running:

```
python3 -c "import sys; print(f'{sys.version_info.major}.{sys.version_info.minor}')"
```

:::

You may need to restart your user session for these changes to take effect.

[comment]: # (mx-context-auto)

### **Install and smoke test**

In order to install **mxpy**, issue the following command:

```
pip3 install --user --upgrade --no-cache-dir multiversx-sdk-cli
```

[comment]: # (mx-context-auto)

### **Troubleshooting**

If you encounter encoding-related issues at installation time, such as: `UnicodeDecodeError: 'ascii' codec can't decode byte`, then please set `PYTHONIOENCODING` before running the installation command:

```
PYTHONIOENCODING=utf8 pip3 install --user --upgrade --no-cache-dir mxpy
```
