---
id: writing-and-running-erdpy-scripts
title: Writing and running erdpy scripts
---

:::caution
As of December 2022, the content on this page is deprecated - the page will be removed in the near future. Instead, please follow the [cookbook](/sdk-and-tools/erdpy/erdpy-cookbook).
:::

Since **erdpy** is not only a CLI tool, but also a **Python SDK**, one can write Python modules or scripts based on erdpy in order to interact with the Blockchain.

Some examples can be found at the following location:

- [elrond-sdk-erdpy examples](https://github.com/ElrondNetwork/elrond-sdk-erdpy/tree/master/examples)

The examples include scenarios such as:

- sending transactions one-by-one
- sending transactions in bulk
- deploying and upgrading Smart Contracts
- interacting with Smart Contracts

In order to run a script (Python module) that relies on erdpy, it is recommended to use the **Python Virtual Environment** set up by [erdpy-up](/sdk-and-tools/erdpy/installing-erdpy#install-using-erdpy-up-recommended). Prior to the actual invocation of the script, the Virtual Environment has to be activated:

```
source erdpy-activate
python ./myscript.py
deactivate
```

:::tip
erdpy-activate`is a symlink that points to`~/elrondsdk/erdpy-venv/bin/activate.
:::
