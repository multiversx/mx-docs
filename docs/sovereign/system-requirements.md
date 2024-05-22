# System Requirements

:::note
 This is a living document. More content will be added once it is implemented and available for production. As this documentation evolves, some sections may be updated or modified to reflect the latest developments and best practices. Community feedback and contributions are encouraged to help improve and refine this guide. Please note that the information provided is subject to change and may not always reflect the latest updates in the technology or procedures. s
:::

This page provides information about the recommended system requirements for running a Sovereign Chain node. 

In general, the hardware requirements for running a Sovereign Chain validator node depends upon the node configuration and can change over time as upgrades to the Sovereign network are implemented. But as you already know, nodes can be run even on low power, resource-constrained devices such as Raspberry Pi's. If the Sovereign Chain has no special function that it serves (AI, DA, DePIN, etc.) the minimum requirements should match the ones needed for running a MultiversX node.

## Processor

It is preferable to use a **4 x dedicated/physical** CPUs, either Intel or AMD, with ```SSE4.1``` and ```SSE4.2``` flags (use lscpu to verify). The CPUs must be ```SSE4.1``` and ```SSE4.2``` capable, otherwise the node won't be able to use the Wasmer 2 VM available through the VM 1.5 (and above) and the node will not be able to sync blocks from the network.

:::caution
If the system chosen to host the node is a VPS, the host must have dedicated CPUs. Using shared CPUs can hinder your node's performance that will result in a decrease of node's rating and eventually the node might get jailed.
:::

:::tip
We are promoting using processors that support the fma or fma3 instruction set since it is widely used by our VM. Displaying the available CPU instruction set can be done using the Linux shell command sudo lshw or lscpu
:::

## Memory

It is recommended to use at least 8GB RAM.

## Disk space

Disk space is usually the primary bottleneck for node operators. At the time of writing, for running a node with the **chain-sdk** binary

As well as storage capacity, Geth nodes rely on fast read and write operations. This means HDDs and cheaper SSDs can sometimes struggle to sync the blockchain. A list of SSD models that users report being able and unable to sync Geth is available in this GitHub Gist. Please note that the list has not been verified by the Geth team.

## Bandwidth

It is important to have a stable and reliable internet connection, especially for running a validator because downtime can result in missed rewards or penalties. It is recommended to have at least 25Mbps download speed to run a node. Running a node also requires a lot of data to be uploaded and downloaded so it is better to use an ISP that does not have a capped data allowance.

## Networking
