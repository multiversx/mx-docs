---
id: configuring-mxpy
title: Configuring mxpy
---

[comment]: # (mx-context)

**mxpy** can be configured using the `mxpy config` command.

In order to view the current configuration, one can issue the command `mxpy config dump`. Output example:

```
{
    "proxy": "https://gateway.multiversx.com",
    "txVersion": "1",
    "dependencies.llvm.tag": "v...",
    "dependencies.vmtools.tag": "v...",
    "chainID": "...",
    "dependencies.rust.tag": ""
}
```

One can alter the current configuration using the command `mxpy config set`. For example, in order to set the proxy URL or the chain ID, one would do the following:

```
$ mxpy config set chainID 1...
$ mxpy config set proxy https://gateway.multiversx.com
```

:::note
For `mainnet` use `proxy: https://gateway.multiversx.com` and `chainID: 1`.

For `devnet` use `proxy: https://devnet-gateway.multiversx.com` and `chainID: D`.

For `testnet` use `proxy: https://testnet-api.multiversx.com` and `chainID: T`.
:::

:::tip
mxpy's configuration is stored in the file `~/multiversx-sdk/mxpy.json`.
:::
