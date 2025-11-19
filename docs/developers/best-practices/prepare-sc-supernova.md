---
id: prepare-sc-supernova
title: Preparing SCs for Supernova
---


The MultiversX Supernova upgrade reduces block time from **6 seconds to 0.6 seconds**, enabling sub-second blocks. While this is a major improvement, it can impact existing smart contracts, especially those relying on assumptions about timestamp behavior.

This guide explains how to prepare your contracts for Supernova safely.



[comment]: # (mx-context-auto)

## Understand What Changes — and What Doesn’t

All existing timestamp APIs continue returning **seconds** unless you explicitly call the millisecond versions. Nothing changes silently in the VM, the framework, or deployed contracts.

Obviously, contracts that have the 6 seconds between blocks hardcoded will have to change. But more importantly, block times expressed in seconds no longer uniquely identify a block, which leads to potential problems.

We are going to go through the most important patterns to look out for.



[comment]: # (mx-context-auto)

## Potential problems to look out for

[comment]: # (mx-context-auto)

### Replace Hardcoded Block Timing

If your contract uses hard-coded constants (like `6 seconds` or `6000 milliseconds`) to estimate the time between blocks, this logic will need to be changed.

It might estimate durations from nonce deltas, or vice-versa, it might estimate number of blocks by timestamps.

**Fix:** Use the API instead: `self.blockchain().get_block_round_time_millis()`. This returns `6000` (as `DurationMillis`) today and `600` after Supernova.



[comment]: # (mx-context-auto)

### Avoid Timestamp-Based Monotonicity

Logic such as:

```
require!(ts_now > last_ts)
```

may break because multiple blocks can share the same timestamp.

**Fix:** Use **block nonces** for guaranteed monotonicity.



[comment]: # (mx-context-auto)

### Prevent Rate-Limit Bypasses

If your contract allows one action “per block” but checks the difference in **seconds**, multiple blocks in the same second can bypass restrictions.

**Fix:** Use block nonces or switch to millisecond timestamps.



[comment]: # (mx-context-auto)

### Revisit Expiration Logic

Expiration logic written assuming a fixed block interval may accidentally allow:

* extra blocks before expiration
* longer-than-intended windows for execution

If your expiration logic uses seconds, double-check assumptions.



[comment]: # (mx-context-auto)

### Stop Using Timestamps as Block Identifiers

Before Supernova, a timestamp could uniquely identify a block.
After Supernova, multiple blocks may share the same timestamp.

If you use timestamps as map keys or identifiers:

* collisions will occur
* data may be overwritten or skipped

**Fix:** Use block **nonces**.



[comment]: # (mx-context-auto)

### Review Reward and Accumulation Calculations

Reward logic that uses:

```
delta = ts_now - last_ts
```

may behave unexpectedly:

* delta may be zero over multiple blocks
* rewards might accumulate slower or unevenly
* divisions by delta may cause division-by-zero errors

Consider switching to milliseconds for finer granularity.



[comment]: # (mx-context-auto)

## Migration Guidance

Just as important as fixing potential issues with Supernova, it is essential not to introduce new bugs in the process.

Make sure to take the following into consideration when migrating:



[comment]: # (mx-context-auto)

### Seconds vs. Milliseconds

Switching from second to millisecond timestamp can be error-prone.

The most dangerous bug is accidentally mixing second and millisecond values, causing storage and logic corruption.

To prevent this issue, use the [strongly typed timestamp and duration objects](time-types).

Starting in **multiversx-sc v0.63.0**, all timestamp APIs have typed replacements:

* `get_block_timestamp_seconds()`
* `get_block_timestamp_millis()`
* `get_prev_block_timestamp_seconds()`
* `get_prev_block_timestamp_millis()`
* `get_block_round_time_millis()`
* `epoch_start_block_timestamp_millis()`

And avoid using raw `u64` for time values.

Make sure to convert form `u64` to type timestamps **before** doing any other refactoring. It is much safer this way.



[comment]: # (mx-context-auto)

### Backwards compatibility

When upgrading an existing contract from second to millisecond timestamps, it is essential to:

* Ensure storage remains consistent
* Update ESDT metadata carefully
* Add compatibility logic if needed

If you are unsure that this can be done safely, it might be safer to keep the contract running on second timestamps.



[comment]: # (mx-context-auto)

## Summary Checklist

To prepare for Supernova:

* [ ] Upgrade to `multiversx-sc v0.63.0`
* [ ] Use typed timestamp/duration APIs
* [ ] Remove all hardcoded 6-second or 6000-millisecond assumptions
* [ ] Avoid using timestamps as block identifiers
* [ ] Review expiration, reward, and accumulation logic
* [ ] Switch to millisecond timestamps where appropriate
* [ ] Ensure storage/metadata compatibility
* [ ] Update tests to use for millisecond block timestamps, where needed
