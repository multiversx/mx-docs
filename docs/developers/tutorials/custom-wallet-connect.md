---
id: custom-wallet-connect
title: Custom Wallet Connect
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## Custom Wallet Connect

Our custom Wallet Connect is a platform that allows you to connect decentralized applications (dApps) to your wallet. The dApp can send transaction requests to your wallet once you have authorized a connection request from it through our custom Wallet Connect.

In this guide, we will walk you through the process of connecting a dApp to our WalletConnect. This will provide users with the bridge that securely connects their MultiversX wallets to dApps.

[comment]: # (mx-context)

## **Prerequisites**

Before we begin, a few requirements are needed to get you running.

- Set up a working dApp.

We have created a tutorial on how to **[build a dApp](https://docs.multiversx.com/developers/tutorials/your-first-dapp/)** on the MultiversX blockchain in a few minutes.

- Purchase a domain for your Wallet Connect server.

To connect to our custom WalletConnect server, we need an HTTPS connection. This domain name will be used when configuring the Nginx host.

All set? Let’s get started! 🚀.

[comment]: # (mx-context)

## Set up the custom Wallet Connect server

With everything in place, let's set up the Wallet Connect application. To begin, launch a new instance on an [Ubuntu 18.04](https://ubuntu.com/) server and configure the Wallet Connect server.

**Install Dependencies**

Spin up your terminal and run this command to install the dependencies:

```bash
sudo apt-get update && sudo apt-get install certbot python3-certbot-nginx docker.io docker-compose nginx -y
```

By default, _nginx_ configuration is saved to the directory. Remove the _nginx_ configuration from the default directory and create the required directories.

```bash
sudo rm -f /etc/nginx/sites-enabled/default
mkdir -p /etc/nginx/sites-enabled
```

Navigate to your text editor and create a _walletconnect_ file in the `/etc/nginx/sites-enabled` location. Add these lines of code to the file:

```bash
cat << EOF > /etc/nginx/sites-enabled/walletconnect

server {
  server_name mycustomwalletconnect.com.;
  location / {
    proxy_set_header Upgrade \$http_upgrade;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host \$http_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header X-Forwarded-For \$remote_addr;
    proxy_set_header Host \$host;
    proxy_set_header Connection upgrade;
    proxy_cache_bypass \$http_upgrade;
    proxy_connect_timeout 5s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;
    proxy_buffering on;
    proxy_buffer_size 32k;
    proxy_buffers 8 32k;
    proxy_pass http://127.0.0.1:5001;
  }
}
EOF
```

Due to the significant configuration changes we have made, we need to fully restart _nginx_. Execute this command to restart and enable the server.

```bash
systemctl restart nginx.service && systemctl enable nginx.service
```

Next, request your _certbot_ certificates.

```bash
certbot --nginx -d1 mycustomwalletconnect.com
```

Run this command to download _Redis_ and its dependencies. Next check if _Redis_ is functioning properly using the `status` command.

```bash
sudo apt-get install -y redis

sudo systemctl status redis
```

We also need to install `nodejs` which will run in production.

```bash
curl -sL https://deb.nodesource.com/setup_14.x -o /tmp/setup_14.sh && chmod +x /tmp/setup_14.sh

sudo apt-get install -y nodejs
```

Lastly, we will set up a wallet connection bridge server for sending Wallet Connect connections. Run the commands below.

```bash
mkdir ~/wallet-connect
cd ~/wallet-connect
git clone https://github.com/WalletConnect/node-walletconnect-bridge
cd ~/wallet-connect/node-walletconnect-bridge
npm install --no-optional
npm run build
nohup npm run start > wallet_connect_log 2>&1 &
```

**Great job!** Our server is running!

The Wallet Connect essentially works as a "link", connecting users to dApps using their wallet. Therefore, in the next section of this guide, we configure our dApp to use the new custom wallet connect server.

[comment]: # (mx-context)

## Configure the dApp to use the new custom Wallet Connect server.

In this section, we will use the sample dApp that we created earlier to configure an array of Wallet Connect addresses (we can have more than one Wallet Connect server).

In your `config.tsx` file, add the following lines of code:

```bash
export const walletConnectBridgeAddresses = ['https://mycustomwalletconnect.com:5000'];
```

Next, create an `app.tsx` file, where we will import the array into the application and submit the array as a _key/value_ pair for the `customNetworkConfig` parameter when the `DappProvider` component is launched.

Add these codes to your `app.tsx` file,

```jsx
import { walletConnectBridgeAddresses } from 'config';
	<DappProvider
		environment={environment}
		customNetworkConfig={{
			name: 'customConfig',
			apiTimeout: 6000,
			walletConnectBridgeAddresses
		}}
		completedTransactionsDelay={200}
	>
```

Restart the application.

**Congratulations!** Now, when a user connects to a dApp through wallet connect, they will be using our custom wallet connect server. 🎉
