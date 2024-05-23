# System Requirements

:::note
 This is a living document. More content will be added once it is implemented and available for production. As this documentation evolves, some sections may be updated or modified to reflect the latest developments and best practices. Community feedback and contributions are encouraged to help improve and refine this guide. Please note that the information provided is subject to change and may not always reflect the latest updates in the technology or procedures. s
:::

This page outlines the recommended system requirements for running a Sovereign Chain node.

The hardware requirements for running a Sovereign Chain validator node generally depend on the node configuration and may evolve as the Sovereign network undergoes upgrades. If the Sovereign Chain does not serve any special function (such as AI, DA, DePIN, etc.), the minimum requirements should align with those for running a MultiversX node.

## Processor

It is preferable to use a **4 x dedicated/physical** CPUs, either Intel or AMD, with ```SSE4.1``` and ```SSE4.2``` flags (use lscpu to verify). The CPUs must be ```SSE4.1``` and ```SSE4.2``` capable, otherwise the node won't be able to use the Wasmer 2 VM available through the VM 1.5 (and above) and the node will not be able to sync blocks from the network.

:::caution
If the system chosen to host the node is a VPS, the host must have dedicated CPUs. Using shared CPUs can hinder your node's performance that will result in a decrease of node's rating and eventually the node might get jailed.
:::

:::tip
We are promoting using processors that support the fma or fma3 instruction set since it is widely used by our VM. Displaying the available CPU instruction set can be done using the Linux shell command sudo lshw or lscpu
:::

## Memory

It is recommended to use at least 16GB RAM.

## Disk space

Disk space is usually the primary bottleneck for node operators. At the time of writing, for running a node with the **chain-sdk** binary you would need at least 200 GB SSD.
As well as storage capacity, MultiversX nodes rely on fast read and write operations. This means HDDs and cheaper SSDs can sometimes struggle to sync the blockchain.

## Bandwidth

It is important to have a stable and reliable internet connection, especially for running a validator because downtime can result in missed rewards or penalties. It is recommended to have at least 100 Mbit/s always-on internet connection. Running a node also requires a lot of data to be uploaded and downloaded so it is better to use an ISP that does not have a capped data allowance and if it does you would need at least 4 TB/month data plan.
