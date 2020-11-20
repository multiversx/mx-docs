---
id: addresses
title: Addresses
---

Get information about an Elrond Address.

## **Get Address**

https://api.elrond.com**/address/:bech32Address**

This endpoint allows one to retrieve basic information about an Address (Account).

**Request**

Path Parameters:

```
bech32Address    string    The Address to query.
```

**Response**

🟢 200: OK

Address information successfully retrieved.



```
{
    "account": {
        "address": "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz",
        "nonce": 5,
        "balance": "100000000000000000000"
    }
}
```

## **Get Address Nonce**

https://api.elrond.com**/address/:bech32Address/nonce**

This endpoint allows one to retrieve the nonce of an Address.

Request

Response

Path Parameters

bech32Address

REQUIRED

string

The Address to query.

## **Get Address Balance**

https://api.elrond.com**/address/:bech32Address/balance**

This endpoint allows one to retrieve the balance of an Address.



Request

Response

Path Parameters

bech32Address

REQUIRED

string

The Address to query.

## **Get Address Transactions**

https://api.elrond.com**/address/:bech32Address/transactions**

This endpoint allows one to retrieve the latest 20 Transactions sent from an Address.

Request

Response

Path Parameters

bech32Address

REQUIRED

string

The Address to query.



This endpoint is not available on Observer Nodes. It is only available on Elrond Proxy. 

**Currently, this endpoint is only available on the Official Elrond Proxy instance.**

This endpoint requires the presence of an Elastic Search instance (populated through Observers) as well. 

## **Get Storage Value for Address**

https://api.elrond.com**/address/:bech32Address/storage/:storageKey**

This endpoint allows one to retrieve a value stored within the Blockchain for a given Address.

Request

Response

Path Parameters

bech32Address

REQUIRED

string

The Address to query.

storageKey

REQUIRED

string

The storage entry to fetch.