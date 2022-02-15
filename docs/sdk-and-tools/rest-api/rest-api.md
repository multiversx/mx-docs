---
id: rest-api
title: REST API overview
---

## Introduction

Elrond has 2 layers of REST APIs that can be publicly accessed. Both of them can be recreated by anyone that
wants to have the same infrastructure, but self-hosted.

These 2 layers of REST APIs are:
- `https://gateway.elrond.com`: the lower level layer (backed by `Elrond Proxy`) that handles routing all the requests in accordance to
  the sharding mechanism. More details can be found [here](/sdk-and-tools/rest-api/gateway-overview).

- `https://api.elrond.com`: the higher level layer (backed by `api.elrond.com` repository) that uses the gateway level underneath,
  but also integrates Elasticsearch (historical) queries, battle-tested caching mechanisms, friendly fields formatting and so on. More details
  can be found [here](/sdk-and-tools/rest-api/api-elrond-com).