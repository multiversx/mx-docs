---
id: ide-setup
title: Fix IDEs configuration
---

[comment]: # (mx-abstract)

The issues tackled on this page are related to IDEs preferred by MultiversX builders, such as **VSCode** or **RustRover**. The issues are not strictly related to the official MultiversX VSCode extension (also known as [MultiversX IDE](https://marketplace.visualstudio.com/items?itemName=Elrond.vscode-elrond-ide)).

[comment]: # (mx-context-auto)

## VSCode: fix configuration for Rust Analyzer

If `rust-analyzer` is not working properly on VSCode, you might see (one of) the following error messages:

```
 - rust-analyzer failed to load workspace: Failed to load the project.
 - Failed to query rust toolchain version.
 - error: rustup could not choose a version of cargo to run, because one wasn't specified explicitly, and no default is configured.
```

To fix this, first **[make sure Rust is properly installed](/sdk-and-tools/troubleshooting/rust-setup)**.

Afterwards, check the content of the configuration file `.vscode/settings.json`.

Basic `.vscode/settings.json` for Linux:

```json
{
    "terminal.integrated.env.linux": {
        "PATH": "${env:HOME}/multiversx-sdk:${env:HOME}/multiversx-sdk/vmtools:${env:PATH}",
    }
}
```

Basic `.vscode/settings.json` for MacOS:

```json
{
    "terminal.integrated.env.osx": {
        "PATH": "${env:HOME}/multiversx-sdk:${env:HOME}/multiversx-sdk/vmtools:${env:PATH}",
    }
}
```

Then, restart VSCode. Now, `rust-analyzer` should work properly. If the problem persists, please [contact us](/developers/overview).
