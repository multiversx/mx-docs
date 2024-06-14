# Software Dependencies

Understanding and managing software dependencies is crucial for the successful deployment and maintenance of Sovereign Chains. Dependencies ensure that all components of your blockchain network work seamlessly together. This page outlines the key dependencies required for building and operating Sovereign Chains, including software libraries, frameworks, and tools.

:::note
Below is the list of software needed to deploy a local Sovereign Chain. All the software dependencies will be installed by scripts in [Setup Guide](/sovereign/setup).
:::

## Core Dependencies

### Python3
To install python3, use the following command:
```
sudo apt install python3
```

## pipx
To install pipx, use the following command:
```
sudo apt install pipx
pipx ensurepath
sudo pipx ensurepath --global
```

### mxpy

Ensure you are using the latest version of mxpy. Follow the installation or upgrade instructions provided [here](/sdk-and-tools/sdk-py/installing-mxpy#install-using-pipx) if you haven't done so already.

### multiversx-sdk

To install this dependency on Linux, use the following command:
```
pip install multiversx-sdk
```

### tmux

To install tmux, use the following command:
```
sudo apt install tmux
```

### screen

To install the screen utility on Linux, use the following command:

```
sudo apt install screen
```

### wget

To install wget, use the following command:
```
apt install wget
```

### Docker

While not mandatory, it is recommended to use the latest version of Docker. If you need to install it, please follow the instructions at [Docker's official documentation](https://docs.docker.com/get-docker/).

### Golang

Ensure you are using Go version 1.20.

:::note
Please note that at the time of writing this documentation, the setup scripts have been tested only on Ubuntu.
:::
