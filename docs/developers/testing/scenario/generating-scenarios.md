---
id: generating-scenarios
title: Generating scenarios
---
[comment]: # (mx-abstract)

There are currently several ways to generate scenarios.

The combination of generating and running scenarios is very powerful, since it means tests writtend originally for one system can be run of different systems too.

This diagram shows all the currently possible paths.

```mermaid
graph TD
    interact ----> blockchain["⚙️ Blockchain"]
    interact[Interactor] -->|trace| json
    manual[Manually implemented] --> json["JSON Scenario
        <i>*.scen.json</i>"]
    bb[BlackBox Test] -->|trace| json
    wb[WhiteBox Test] -.->|trace| json
    json --> test-go["Generated
        <i>*_scenario_go_test.rs</i>"] --> vm-go["⚙️ Go VM"]
    json --> test-rs["Generated
        <i>*_scenario_rs_test.rs</i>"] --> vm-rust["⚙️ Rust VM (Debugger)"]
    bb --> vm-rust
    wb --> vm-rust
```

More details about this coming soon.

