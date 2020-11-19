# Blocks

Query blocks information.

## **Get Hyperblock by Nonce**

https://api.elrond.com**/hyperblock/by-nonce/:nonce**

This endpoint allows one to query a **Hyperblock** by its nonce.

Request

Response

Path Parameters

nonce

REQUIRED

number

The Block nonce (height).



This endpoint is only is only defined by the Proxy. The Observer does not expose this endpoint.



A **Hyperblock** is a block-like abstraction that reunites the data from all shards, and contains only **fully-executed transactions** (that is, transactions executed both in *source* and in *destination* shard).

A **hyperblock** is composed using a **metablock** as a starting point - therefore, the `nonce` or `hash` of a hyperblock is the same as the `nonce` or `hash` of the base metablock.

## **Get Hyperblock by Hash**

https://api.elrond.com**/hyperblock/by-hash/:hash**

This endpoint allows one to query a **Hyperblock** by its hash.

Request

Response

Path Parameters

hash

OPTIONAL

string

The Block hash.



This endpoint is only is only defined by the Proxy. The Observer does not expose this endpoint.

## **Get Block by Nonce**

http://localhost:8080**/block/:shard/by-nonce/:nonce**

This endpoint allows one to query a Shard Block by its nonce (or height).

Request

Response

Path Parameters

shard

OPTIONAL

number

The Shard.

nonce

REQUIRED

number

The Block nonce (height).

Query Parameters

withTxs

OPTIONAL

boolean

Whether to include the transactions in the response.



For Observers, the `shard` parameter should not be set.

## **Get Block by Hash**

http://localhost:8080**/block/:shard/by-hash/:hash**

This endpoint allows one to query a Shard Block by its hash.

Request

Response

Path Parameters

shard

OPTIONAL

number

The Shard

hash

REQUIRED

string

The Block hash.

Query Parameters

withTxs

OPTIONAL

boolean

Whether to include the transactions in the response.



For Observers, the `shard` parameter should not be set.