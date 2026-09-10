---
id: prepare-sc-supernova
title: Preparing SCs for Supernova
description: "Checklist to prepare smart contracts for the Supernova upgrade: timing changes, assumptions and safe migrations."
---

The MultiversX Supernova upgrade changes the configured round duration from **6 seconds to 0.6 seconds**, enabling sub-second blocks. While this is a major improvement, it can impact existing smart contracts, especially those relying on assumptions about timestamp behavior.

This guide explains how to prepare your contracts for Supernova safely.



[comment]: # (mx-context-auto)

## Understand What Changes — and What Doesn’t

APIs that return timestamps in **seconds** keep that unit. Contracts do not need to switch to milliseconds unless their required precision or timing logic calls for it.

Review assumptions about block frequency and timestamp uniqueness: consecutive blocks in the same shard may now share the same timestamp in seconds.

We are going to go through the most important patterns to look out for.



[comment]: # (mx-context-auto)

## Potential problems to look out for

[comment]: # (mx-context-auto)

### Replace Hardcoded Block Timing

Review hardcoded timing constants such as `6 seconds`, `6000 milliseconds`, or a number of blocks per day. A business duration of six seconds may remain valid; an assumption about block cadence may not.

For elapsed time, subtract block timestamps. Multiplying a nonce difference by the round duration is not reliable because rounds can pass without producing a block.

**Fix:** For logic expressed in rounds, use `self.blockchain().get_block_round_time_millis()`. It returns the configured duration (`6000` milliseconds before Supernova, `600` after) as `DurationMillis`. Do not apply the current duration retroactively to historical data from a different cadence.



[comment]: # (mx-context-auto)

### Avoid Timestamp-Based Monotonicity

Logic such as:

```
require!(ts_now > last_ts)
```

may break because multiple blocks can share the same timestamp.

**Fix:** Use **block nonces** to distinguish blocks within the execution shard. Use timestamp differences when the requirement is elapsed time.



[comment]: # (mx-context-auto)

### Review Timestamp-Based Rate Limiting

If your contract allows one action “per block” but compares timestamps in **seconds**, valid calls in later blocks may be rejected. A per-block rule also permits more actions per minute as blocks become more frequent.

**Fix:** Use block nonces for per-block limits and timestamp differences for time-based cooldowns. Use milliseconds when sub-second precision matters.



[comment]: # (mx-context-auto)

### Revisit Expiration Logic

Check whether expiration is defined by elapsed time or by a number of blocks:

* `timestamp + 60 seconds` keeps the same time window, with more blocks inside it
* `nonce + 100 blocks` takes approximately 60 seconds instead of 600, assuming no missed rounds

Use timestamps for time-based deadlines and test calls immediately before, at, and after expiration.



[comment]: # (mx-context-auto)

### Stop Using Timestamps as Block Identifiers

Timestamps were never globally unique block identifiers.
After Supernova, even consecutive blocks in the same shard may share a timestamp in seconds.

If you use timestamps as map keys or identifiers:

* collisions may occur
* data may be overwritten or skipped

**Fix:** Use block **nonces** within the execution shard. Off-chain systems combining shards must retain the shard identifier as well.



[comment]: # (mx-context-auto)

### Review Reward and Accumulation Calculations

Reward logic that uses:

```
delta = ts_now - last_ts
```

may behave unexpectedly:

* delta may be zero over multiple blocks
* rounding on frequent calls may discard small accrued amounts
* divisions by delta may cause division-by-zero errors

Handle zero deltas explicitly and check when the last-accounted timestamp advances. Use milliseconds when finer granularity is needed. Also review per-block reward rates: leaving them unchanged can increase rewards per minute as blocks become more frequent.



[comment]: # (mx-context-auto)

## Migration Guidance

Just as important as fixing potential issues with Supernova, it is essential not to introduce new bugs in the process.

Make sure to take the following into consideration when migrating:



[comment]: # (mx-context-auto)

### Seconds vs. Milliseconds

Switching from second to millisecond timestamp can be error-prone.

The most dangerous bug is accidentally mixing second and millisecond values, causing storage and logic corruption.

To prevent this issue, use the [strongly typed timestamp and duration objects](time-types).

Typed time APIs are available since **multiversx-sc v0.63.0**. Their names in v0.63.1 and later include:

* `get_block_timestamp_seconds()`
* `get_block_timestamp_millis()`
* `get_prev_block_timestamp_seconds()`
* `get_prev_block_timestamp_millis()`
* `get_block_round_time_millis()`
* `get_epoch_start_block_timestamp_millis()`

And avoid using raw `u64` for time values.

First replace raw `u64` values with typed values of the **same unit**. Changing the type does not convert stored values: decoding `1000` seconds as `TimestampMillis` preserves `1000`, rather than producing `1_000_000` milliseconds. Convert units explicitly and check overflow and rounding.



[comment]: # (mx-context-auto)

### Backwards compatibility

When upgrading an existing contract from second to millisecond timestamps, it is essential to:

* Convert existing storage and token attributes explicitly if their time units change
* Preserve the units of public endpoints and events, or coordinate changes with their consumers
* Add compatibility decoding if stored layouts change, and test upgrades with existing data

If you are unsure that this can be done safely, it might be safer to keep the contract running on second timestamps.



[comment]: # (mx-context-auto)

## Summary Checklist

To prepare for Supernova:

* [ ] If adopting typed time APIs, use a compatible SDK version (v0.63.1+ for the names above)
* [ ] Use typed timestamp/duration APIs
* [ ] Replace hardcoded current-cadence assumptions where they affect intended behavior
* [ ] Avoid using timestamps as block identifiers
* [ ] Review expiration, reward, and accumulation logic
* [ ] Switch to millisecond timestamps where appropriate
* [ ] Ensure storage/metadata compatibility
* [ ] Test both cadences, same-second blocks, zero deltas, missed rounds, and intervals spanning activation

In RustVM tests, set millisecond block timestamps for sub-second cases; the seconds API derives its value by truncation. A later seconds-only state update discards sub-second precision.
