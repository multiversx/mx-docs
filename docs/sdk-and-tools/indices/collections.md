---
id: es-index-collections
title: collections
---

The `_id` field of this index is represented by a bech32 encoded address.

This index contains a list of collections and the NFTs from collections that are in the balance of the address.

Example:
```
{
    "COLLECTION1-af3ea3": {
        "1b": "1",
        "1c": "1",
        "23": "1",
        "24": "1"
    },
    "COLLECTION1-a52799": {
        "01": "1"
    }
}
```
