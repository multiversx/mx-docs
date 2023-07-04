---
id: best-practices-basics
title: Basics
---

[comment]: # (mx-context-auto)

## Code Arrangement

We'll start with something simple: code arrangement. It's best to separate your code into 4 main parts:
- endpoints
- view functions
- private functions
- storage

This ensures that it's much easier to find what you're looking for, and it's also much easier for everyone else who's working on that smart contract. Additionally, it's also best to split endpoints by their level of access. Some endpoints might be owner-only, some might be usable only by a select few addresses from a whitelist, and some can be called by anyone.

The recommended order is the one from the list above, but order is not important as long as you clearly separate your code. Even better if you split those into modules.
