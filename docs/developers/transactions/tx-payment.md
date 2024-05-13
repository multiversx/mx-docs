---
id: tx-payment
title: Payments
---

[comment]: # (mx-abstract)

- `.payment(...)` syntax, accepts all legal types

[comment]: # (mx-context-auto)

## No payments

- nothing added
- makes sense for contract calls

[comment]: # (mx-context-auto)

## EGLD payment

- `.egld(value)`
- `Egld(...)` wrapper
- `EgldValue` trait:
    - BigUint
    - u64
    - ...

[comment]: # (mx-context-auto)

## General ESDT payment

- `.esdt(...)`

[comment]: # (mx-context-auto)

## Single ESDT payment (with references)

[comment]: # (mx-context-auto)

## Graph of all payments

- inspired from legacy

## Normalization

- what it is, builtin function calls
- performed automatically
