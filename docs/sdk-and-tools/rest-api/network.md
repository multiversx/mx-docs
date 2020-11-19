# Network

Query information about the Network.

## **Get Network Configuration**

https://api.elrond.com**/network/config**

This endpoint allows one to query basic details about the configuration of the Network.

Request

Response



## **Get Shard Status**

https://api.elrond.com**/network/status/:shardId**

This endpoint allows one to query the status of a given Shard.

Request

Response

Path Parameters

shardId

REQUIRED

number

The Shard ID. 0, 1, 2 etc. Use **4294967295** in order to query the Metachain.



The path parameter `**shardId**` is only applicable on the Proxy endpoint. The Observer endpoint does not define this parameter.