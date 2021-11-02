---
id: code-metadata
title: Code Metadata
---

## Introduction

Code metadata are flags retresented a 2-byte bitfield concerning smart contract creation and upgrading. 

## Usability

Upon creating or upgrading a contract the metadata provided allows certain behaviours of it.

```
const (
	// MetadataUpgradeable is the bit for upgradable flag
	MetadataUpgradeable = 1
	// MetadataPayable is the bit for payable flag
	MetadataPayable = 2
	// MetadataReadable is the bit for readable flag
	MetadataReadable = 4
)

```

## Converting Metadata to bytes

The 2 bytes of the representation are used to store the Code Metadata by the following rules: 

```
- Upgradeable: (bytes[0] & MetadataUpgradeable) != 0,
- Readable:    (bytes[0] & MetadataReadable) != 0,
- Payable:     (bytes[1] & MetadataPayable) != 0,
```
By this meaning if for example we wish to deploy a contract that is payable and upgradeable we would call the deploy function having as metadata `0x0102`

## Conclusion

We hope these flags will make it a lot easier to create and upgrade smart contracts.  

If you want to take a look at some more examples of how Code Metadata is used, take a look here: https://github.com/ElrondNetwork/elrond-wasm-rs/tree/master/contracts/examples  
