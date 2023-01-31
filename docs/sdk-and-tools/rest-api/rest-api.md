---
id: rest-api
title: REST API overview
---

[comment]: # (mx-context)

[comment]: # (mx-context)

## Introduction

MultiversX has 2 layers of REST APIs that can be publicly accessed. Both of them can be recreated by anyone that
wants to have the same infrastructure, but self-hosted.

These 2 layers of REST APIs are:

- `https://gateway.multiversx.com`: the lower level layer (backed by `MultiversX Proxy`) that handles routing all the requests in accordance to
  the sharding mechanism. More details can be found [here](/sdk-and-tools/rest-api/gateway-overview).

- `https://api.multiversx.com`: the higher level layer (backed by `api.multiversx.com` repository) that uses the gateway level underneath,
  but also integrates Elasticsearch (historical) queries, battle-tested caching mechanisms, friendly fields formatting and so on. More details
  can be found [here](/sdk-and-tools/rest-api/multiversx-api).
