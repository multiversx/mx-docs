---
id: writing-and-running-mxpy-scripts
title: Writing and running mxpy scripts
---

:::caution
As of December 2022, the content on this page is deprecated - the page will be removed in the near future. Instead, please follow the [cookbook](/sdk-and-tools/mxpy/mxpy-cookbook).
:::

Since **mxpy** is not only a CLI tool, but also a **Python SDK**, one can write Python modules or scripts based on mxpy in order to interact with the Blockchain.

Some examples can be found in the cookbook:

- [mxpy-cookbook](/sdk-and-tools/mxpy/mxpy-cookbook/)

The examples include scenarios such as:

- sending transactions one-by-one
- sending transactions in bulk
- deploying and upgrading Smart Contracts
- interacting with Smart Contracts

In order to run a script (Python module) that relies on mxpy, it is recommended to use the **Python Virtual Environment** set up by [mxpy-up](/sdk-and-tools/mxpy/installing-mxpy#install-using-mxpy-up-recommended). Prior to the actual invocation of the script, the Virtual Environment has to be activated:

```
source mxpy-activate
python ./myscript.py
deactivate
```

:::tip
mxpy-activate`is a symlink that points to`~/elrondsdk/mxpy-venv/bin/activate.
:::
