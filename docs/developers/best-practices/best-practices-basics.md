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

## Module Size

Each module should have a maximum of 200-300 lines. If you ever need more than that, consider splitting. Makes it much easier to find what you're looking for. 

## Function Size

Each function should be 30-50 lines. Any more than that and it's really hard to navigate the file. 

## Code Placement

The lib.rs file should contain only the init and upgrade functions most of the time. Sometimes it's tempting to bundle a bunch of unrelated functions there, but don't. You'll end up with a lib.rs file of 500 lines. 

## Module Placement

Each module can be placed in its own folder along with other related modules. Sure, splitting the code is nice, but having to navigate through 20 files, all at the level of lib.rs, doesn't help at all. This makes it even easier to search for specific features. 

## Error Messages

If you have the same error message in multiple places, it's better to declare a static with the message and use that instead of copy-pasting the message. If you have the same condition too, consider having a separate `require_X` function. 

## Small PRs

Unless you're mass-upgrading everything, in which case you really have no other choice, it's much better to keep your PRs focused on one specific task. Also much easier for reviewers to spot issues instead of simply giving you a green and moving on. 
