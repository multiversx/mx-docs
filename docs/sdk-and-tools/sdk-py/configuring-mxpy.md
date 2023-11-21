---
id: configuring-mxpy
title: Configuring mxpy
---

[comment]: # (mx-abstract)

This page describes how to configure `mxpy` (the CLI tool), using the `mxpy config` command.

:::tip
mxpy's configuration is stored in the file `~/multiversx-sdk/mxpy.json`.
:::

[comment]: # (mx-context-auto)

## Viewing the current `mxpy` configuration

In order to view the current configuration, one can issue the command `mxpy config dump`. Output example:

```
{
    "txVersion": "1",
    "dependencies.llvm.tag": "v...",
    "dependencies.vmtools.tag": "v...",
    "dependencies.rust.tag": ""
}
```

[comment]: # (mx-context-auto)

## Updating the `mxpy` configuration

One can alter the current configuration using the command `mxpy config set`. For example, in order to set the **_rust version_** to be used, one would do the following:

```
$ mxpy config set dependencies.rust.tag nightly-2023-05-26
```
