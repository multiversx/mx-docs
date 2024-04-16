---
id: multiversx-api
title: MultiversX API
---

[comment]: # (mx-abstract)

## About MultiversX API

`api.multiversx.com` is the public instance of MultiversX API and is a wrapper over `gateway.multiversx.com` that brings a robust caching mechanism, alongside Elasticsearch
historical queries support, tokens media support, delegation & staking data, and many others.

[comment]: # (mx-context-auto)

## Public URLs

Mainnet: [https://api.multiversx.com](https://api.multiversx.com).

Testnet: [https://testnet-api.multiversx.com](https://testnet-api.multiversx.com).

Devnet: [https://devnet-api.multiversx.com](https://devnet-api.multiversx.com).

[comment]: # (mx-context-auto)

## External Providers

**Blastapi**

Mainnet: [https://multiversx-api.public.blastapi.io](https://multiversx-api.public.blastapi.io).

Devnet: [https://multiversx-api-devnet.public.blastapi.io](https://multiversx-api-devnet.public.blastapi.io).

Checkout information about [pricing](https://blastapi.io/pricing) and API [limitations per plan](https://docs.blastapi.io/blast-documentation/apis-documentation/core-api/multiversx).

More details on how to get your private endpoint can be found [here](https://docs.blastapi.io/blast-documentation/tutorials-and-guides/using-blast-to-get-a-blockchain-endpoint-1).

[comment]: # (mx-context-auto)

## Dependencies

[comment]: # (mx-context-auto)

### Core dependencies

For its basic functionality (without including caching or storage improvements), api.multiversx.com depends on the following external systems:

- `gateway`: also referred as Proxy, provides access to node information, such as network settings, account balance, sending transactions, etc
  docs: [Proxy](/sdk-and-tools/proxy).
- `index`: a database that indexes data that can be queries, such as transactions, blocks, nfts, etc.
  docs: [Elasticsearch](/sdk-and-tools/elastic-search).
- `delegation`: a microservice used to fetch providers list from the delegation API. Not currently open for public access.

[comment]: # (mx-context-auto)

### Other dependencies

It uses on the following internal systems:

- redis: used to cache various data, for performance purposes
- rabbitmq: pub/sub for sending mainly NFT process information from the transaction processor instance to the queue worker instance

It depends on the following optional external systems:

- events notifier rabbitmq: queue that pushes logs & events which are handled internally e.g. to trigger NFT media fetch
- data: provides EGLD price information for transactions
- xexchange: provides price information regarding various tokens listed on xExchange
- ipfs: ipfs gateway for fetching mainly NFT metadata & media files
- media: ipfs gateway which will be used as prefix for NFT media & metadata returned in the NFT details
- media internal: caching layer for ipfs data to fetch from a centralized system such as S3 for performance reasons
- AWS S3: used to process newly minted NFTs & uploads their thumbnails
- github: used to fetch provider profile & node information from github

It uses the following optional internal systems:

- mysql database: used to store mainly NFT media & metadata information
- mongo database: used to store mainly NFT media & metadata information

[comment]: # (mx-context-auto)

## Ways to start MultiversX API

An API instance can be started with the following behavior:

- public API: provides REST API for the consumers
- private API: used to report prometheus metrics & health checks
- transaction processor & completed: fetches real-time transactions & logs from the blockchain; takes action based on various events, such as clearing cache values and publishing events on a queue
- cache warmer: used to proactively fetch data & pushes it to cache, to improve performance & scalability
- elastic updater: used to attach various extra information to items in the elasticsearch, for not having to fetch associated data from other external systems when performing listing requests
- events notifier: perform various decisions based on incoming logs & events

[comment]: # (mx-context-auto)

## Rate limiting

Public MultiversX APIs have a rate limit mechanism that brings the following limitations:

- api.multiversx.com (_mainnet_): 2 requests / IP / second
- devnet-api.multiversx.com (_devnet_): 5 requests / IP / second

[comment]: # (mx-context-auto)

## Rest API documentation

Rest API documentation of `api.multiversx.com` can be found on the [Swagger docs](https://api.multiversx.com).

[comment]: # (mx-context-auto)

## References:

- Github repository: [https://github.com/multiversx/mx-api-service](https://github.com/multiversx/mx-api-service)
- Swagger docs: [https://api.multiversx.com](https://api.multiversx.com)
- Raw JSON Swagger OpenAPI definitions: [https://api.multiversx.com/-json](https://api.multiversx.com/-json)
- MultiversX blog: [https://elrond.com/blog/elrond-api-internet-scale-defi](https://elrond.com/blog/elrond-api-internet-scale-defi)
