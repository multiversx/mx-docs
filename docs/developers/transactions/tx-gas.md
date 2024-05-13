---
id: tx-gas
title: Gas (Bianca)
---

[comment]: # (mx-abstract)



[comment]: # (mx-context-auto)

## Default gas

- not added
- appropriate:
    - async call (legacy)
    - sync call - default all gas left
    - transfer execute with no payload (simple transfers) - VM knows
    - tests, there is a default amount of 5,000,000 - only relevant in mandos-go, because RustVM does not measure ...
    - interactors, there is a default amount of 5,000,000

[comment]: # (mx-context-auto)

## Explicit gas

- needed:
    - async call - promises
    - transfer execute with payload
    - tests - if a different amount is needed
    - interactors - if a different amount is needed
- allowed
    - sync calls (???)
