---
id: time-types
title: Time-related Types
---


The Supernova release introduces increased block frequency and encourages transitioning to millisecond timestamps, instead of seconds. To support this, the SpaceCraft SDK (starting with `v0.63.0`) provides strong type wrappers for time values to prevent common bugs.


[comment]: # (mx-context-auto)

## Overview

Traditionally, smart contracts used plain `u64` values to represent timestamps and durations. As the ecosystem transitions to millisecond precision, mixing seconds and milliseconds becomes error-prone. Runtime errors are difficult to detect, so the compiler now assists by enforcing type correctness.


[comment]: # (mx-context-auto)

## The Four Time-Related Types

The framework introduces four new types:

* **`TimestampSeconds`** — moment in time measured in seconds
* **`TimestampMillis`** — moment in time measured in milliseconds
* **`DurationSeconds`** — duration measured in seconds
* **`DurationMillis`** — duration measured in milliseconds

Each is a **newtype wrapper around `u64`**, with an identical underlying representation but distinct meaning.


[comment]: # (mx-context-auto)

## Why These Types Exist

Using plain `u64` makes it easy to:

* accidentally mix seconds and milliseconds
* add timestamps together (nonsensical)
* subtract mismatched units
* perform invalid arithmetic without realizing it

The new types make such mistakes **fail at compile time**.


[comment]: # (mx-context-auto)

## Supported Operations

The framework implements common operators only where they make sense.

Examples:

```
TimestampMillis - TimestampMillis → DurationMillis
TimestampSeconds + DurationSeconds → TimestampSeconds
DurationSeconds + DurationSeconds → DurationSeconds
```

Examples of invalid operations (will not compile):

```
TimestampMillis - TimestampSeconds
TimestampMillis + TimestampMillis
```


[comment]: # (mx-context-auto)

## Codec and ABI Support

All four types:

* support codec and ABI traits
* can be used in storage
* can be used in events and arguments
* behave like `u64` for serialization

This makes them safe to adopt even in existing contracts.


[comment]: # (mx-context-auto)

## When to Use Seconds vs. Milliseconds

* **Seconds**: acceptable when your contract already stores timestamps in seconds or relies on existing storage/metadata
* **Milliseconds**: recommended for all new contracts and for future-proof logic

The key rule: **Never mix seconds and milliseconds without explicit conversion.**


[comment]: # (mx-context-auto)

## Testing

Time-related types also work in testing frameworks.

In blackbox tests, one can write:

```rust
    let block_timestamp_ms = TimestampMillis::new(123_000_000);

    world
        .epoch_start_block()
        .block_timestamp_ms(block_timestamp_ms)
        .block_nonce(15_000)
        .block_round(17_000);
```


Mandos supports both `blockTimestamp` and the newer `blockTimestampMs`. Set both if they are used together for backward compatibility.


[comment]: # (mx-context-auto)

## Summary

* Time-related newtypes enforce correctness at compile time
* They eliminate a class of subtle bugs related to timestamp unit mismatches
* Both seconds and milliseconds will continue to work, but milliseconds are recommended for new code

Use these types to ensure your contract remains safe and consistent across all future protocol updates.
