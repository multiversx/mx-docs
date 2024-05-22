# Key Components

:::note

This documentation is not complete. More content will be added once it is accepted and discussed on Agora or once it is implemented and available for production.

:::

Sovereign Chains represent a great progress for MultiversX into the world of appchains. The concept itself is easy to share when discussing about it in general terms but if you are a developer, builder or other entity who wants to spin out a sovereign, there are several components that you have to care about. For the ease of discussion we will split it in 3 big components and we will take each of it to describe their importance and role.

### **1. Sovereign Cross-Chain Smart Contracts**

In order to have a native *connection* with the MultiversX MainChain 4 smart contracts have to be deployed:

**1. ESDT Safe Contract**- used for transfering tokens from MultiversX mainchain to Sovereign Chain.

**2. Fee Market Contract** - used when other tokens are used as fee for transfering tokens between mainchain and sovereign

**3. Genesis SC**

**4. MultiSig Verifier**

### **2. Sovereign Notifier**

The Sovereign Notifier exports outport blocks to Sovereign Chain. It needs to be a server outport host driver.

### **3. Sovereign Cross-Chain TX Sender Service**

The Cross-Chain TX Sender is a service which bridges tokens from Sovereign Chain to MultiversX Mainchain.

### **4. Sovereign Chain**

Info to be added about how to setup the nodes on a sovereign chain.

![img](/sovereign/sovereign-1.png)

