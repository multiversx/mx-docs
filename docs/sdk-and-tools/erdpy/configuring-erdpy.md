---
id: configuring-erdpy
title: Configuring erdpy
---

**erdpy** can be configured using the `erdpy config` command.

In order to view the current configuration, one can issue the command `erdpy config dump`. Output example:



```
{
    "proxy": "https://api.elrond.com",
    "txVersion": "1",
    "dependencies.llvm.tag": "v...",
    "dependencies.arwentools.tag": "v...",
    "chainID": "v...",
    "dependencies.rust.tag": ""
}
```

One can alter the current configuration using the command `erdpy config set`. For example, in order to set the proxy URL or the chain ID, one would do the following:



```
$ erdpy config set chainID 1...
$ erdpy config set proxy https://api.elrond.com
```

:::tip
erdpy's configuration is stored in the file `~/elrondsdk/erdpy.json`.
:::