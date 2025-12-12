# Introduction

## Sovereign services

### API service

The Sovereign API is a wrapper over the Sovereign Proxy that brings a robust caching mechanism, alongside Elasticsearch historical queries support, tokens media support, delegation & staking data, and many others.

### Lite Extras API
The Sovereign Lite Extras API includes a faucet service that allows users to obtain test tokens for their wallet.

### Lite Wallet
The Sovereign Lite Wallet is a lightweight version of the public wallet. It supports key functionalities such as cross-chain transfers, token issuance, token transfers, and more.

### Explorer DApp
The Explorer DApp serves as the blockchain explorer for the Sovereign Chain, providing insights into transactions, blocks, and other on-chain activity.

## Software dependencies

### Node.js

[Download Node.js](https://nodejs.org/en/download) or use a version manager like [NVM](https://github.com/nvm-sh/nvm)

### Yarn

To install yarn, use the following command:
```bash
npm install --global yarn
```  

### Redis

To install and start redis, use the following commands:

```bash
sudo apt update
sudo apt install redis
sudo systemctl start redis
sudo systemctl enable redis
```

## Prerequisites

### Sovereign network deployed

Before starting the services it is required to have a full sovereign network running, see [setup guide](/sovereign/local-setup).
