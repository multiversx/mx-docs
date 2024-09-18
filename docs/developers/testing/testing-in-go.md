---
id: testing-in-go
title: Testing in Go
---

[comment]: # (mx-abstract)

At some point in the past we built some testing solutions in Go. They were never very popular, but are worth mentioning.

This page is currently a stub. If there is interest in this type of testing, we will expand it further.

[comment]: # (mx-context-auto)

## **Embedding in Go**

Scenario steps can be embedded in Go, in order to program for more flexible behavior. One can even save dynamically generated scenarios. For a comprehensive example on how to do that, check out the [delegation contract fuzzer in MultiversX VM](https://github.com/multiversx/mx-chain-vm-go/tree/master/fuzz/delegation) or the [DNS contract deployment scenario test generator](https://github.com/multiversx/mx-chain-vm-go/tree/master/cmd/testgen/dns). Just a snippet from the fuzzer:

```rust
_,
  (err = pfe.executeTxStep(
    fmt.Sprintf(
      `
	{
		"step": "scDeploy",
		"txId": "-deploy-",
		"tx": {
			"from": "''%s",
			"value": "0",
			"contractCode": "file:delegation.wasm",
			"arguments": [
				"''%s",
				"%d",
				"%d",
				"%d"
			],
			"gasLimit": "100,000",
			"gasPrice": "0"
		},
		"expect": {
			"out": [],
			"status": "",
			"logs": [],
			"gas": "*",
			"refund": "*"
		}
	}`,
      string(pfe.ownerAddress),
      string(pfe.auctionMockAddress),
      args.serviceFee,
      args.numBlocksBeforeForceUnstake,
      args.numBlocksBeforeUnbond
    )
  ));
```
