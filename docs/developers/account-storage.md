---
id: account-storage
title: Account storage
---

## Description

The Elrond protocol offers the possibility of storing additional data under an account as key-value pairs. This can be useful for many use cases.

A wallet owner can store key-value pairs by using the built-in function `SaveKeyValue` that receives any number of key-value pairs.

:::tip
Keys that begin with `ELROND` will be rejected because they are reserved for protocol usage.
:::

## Transaction format

```
SaveKeyValueTransaction {
    Sender: <account address of the wallet owner>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 250000 + additional gas limit*
    Data: "SaveKeyValue" +
          "@" + <key in hexadecimal encoding> +
          "@" + <value in hexadecimal encoding> +
          "@" + <key in hexadecimal encoding> +
          "@" + <value in hexadecimal encoding> +
          ...
}
```

*The gas used for saving a pair is 250,000. However, this will be higher because of the length of the data field or the storage saving. 

## Example 

Let's save a single key-value pair. Key would be `key0` and the value would be `value0`.
```
SaveKeyValueTransaction {
    Sender: <account address of the wallet owner>
    Receiver: <same as sender>
    Value: 0
    GasLimit: 751000
    Data: "SaveKeyValue" +
          "@" + 6b657930 +    // key0
          "@" + 76616c756530  // value0
}
```

## Rest API

There are two endpoints that can be used for fetching key-value pairs for an account. They are:

- [Get value for key](/sdk-and-tools/rest-api/addresses/#get-storage-value-for-address)
- [Get all key-value pairs](/sdk-and-tools/rest-api/addresses/#get-all-storage-for-address)
