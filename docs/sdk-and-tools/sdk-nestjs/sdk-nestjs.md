---
id: sdk-nestjs
title: NestJS SDK
---

MultiversX NestJS Microservice Utilities

**sdk-nestjs** contains a set of utilities commonly used in the MultiversX microservices ecosystem.

| Package                                                            | Source code                                           | Description                                                                |
|--------------------------------------------------------------------|-------------------------------------------------------|----------------------------------------------------------------------------|
| [sdk-nestjs](https://www.npmjs.com/package/@multiversx/sdk-nestjs) | [Github](https://github.com/multiversx/mx-sdk-nestjs) | A set of utilities commonly used in the MultiversX Microservice ecosystem. |

:::tip
When developing microservices, we recommend starting from the **microservice-template** as it integrates off-the-shelf features like: public & private endpoints, cache warmer, transactions processor, queue worker
:::

| Source code                                                                | Description                                                                              |
|----------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| [microservice-template](https://github.com/multiversx/mx-template-service) | REST API facade template for microservices that interact with the MultiversX blockchain. |

[comment]: # (mx-context-auto)

## Packages

The following table contains the NPM packages that are included inside the NestJS SDK:

| Package               | NPM                                                                                                  | Description  + additional docs                                                            |
|-----------------------|------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------|
| sdk-nestjs-common     | [@multiversx/sdk-nestjs-common](https://www.npmjs.com/package/@multiversx/sdk-nestjs-common)         | Common functionalities to be used in MultiversX microsevices.                             |
| sdk-nestjs-auth       | [@multiversx/sdk-nestjs-auth](https://www.npmjs.com/package/@multiversx/sdk-nestjs-auth)             | Native Auth functionalities to be used for securily handle sessions.                      |
| sdk-nestjs-http       | [@multiversx/sdk-nestjs-http](https://www.npmjs.com/package/@multiversx/sdk-nestjs-http)             | HTTP requests handling utilities                                                          |
| sdk-nestjs-monitoring | [@multiversx/sdk-nestjs-monitoring](https://www.npmjs.com/package/@multiversx/sdk-nestjs-monitoring) | Microservices monitoring helpers. [docs](/sdk-and-tools/sdk-nestjs/sdk-nestjs-monitoring) |
| sdk-nestjs-elastic    | [@multiversx/sdk-nestjs-elastic](https://www.npmjs.com/package/@multiversx/sdk-nestjs-elastic)       | Elasticsearch interactions helpers.                                                       |
| sdk-nestjs-redis      | [@multiversx/sdk-nestjs-redis](https://www.npmjs.com/package/@multiversx/sdk-nestjs-redis)           | Redis interactions helpers.                                                               |
| sdk-nestjs-rabbitmq   | [@multiversx/sdk-nestjs-rabbitmq](https://www.npmjs.com/package/@multiversx/sdk-nestjs-rabbitmq)     | RabbitMQ interactions helpers.                                                            |
| sdk-nestjs-cache      | [@multiversx/sdk-nestjs-cache](https://www.npmjs.com/package/@multiversx/sdk-nestjs-cache)           | Common cache operations utilites. [docs](/sdk-and-tools/sdk-nestjs/sdk-nestjs-cache)      |

