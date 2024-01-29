---
id: rust-nightly
title: Nightly Rust
---

[comment]: # (mx-abstract)

## Why Nighly?

The Rust framework currently requires nightly Rust to run. This often causes issues with the inherent instability and frequent changes in the Rust compiler.

While it would be ideal to have our infrastructure running on stable Rust, there are a number of features that we currently require.

This page is intended to provide a list of all these features that we use, and explain what it would take to renounce them and move to stable.


[comment]: # (mx-context-auto)

## Nightly features

<NightlyFeaturesTable />

export const NightlyFeaturesTable = () => (
  <table>
    <tr>
      <th>Feature</th>
      <th>Why we need it</th>
      <th>What it would take to discard</th>
    </tr>
    <tr>
      <td>
        <code>never_type</code> and <code>exhaustive_patterns</code>
      </td>
      <td>
        <p>
          The codec is optimized to work within smart contracts, but also to be used outside them, in a standard environment. Encoding and decoding functions return <code>Result</code>, because we want to allow programs to recover from a failed encoding or decoding attempt. However, this feature is not needed in contracts, where we want failures to interrupt execution immediately.
        </p>
        <p>
          Our solution relies heavily on the never type (<code>!</code>), to guide the compiler to discard any error recovery when compiling contracts.
        </p>
        <p>
          Exhaustive patterns are a nice way to engage with code that is guaranteed at compile time to never return an error.
        </p>
      </td>
      <td>
        <p>
          The <code>never_type</code> seems to be close to being stabilized. 
        </p>
        <p>
          Exhaustive patterns, if not stabilized soon, could be replaced with regular patterns with an unreacheable clause on the else.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>auto_traits</code> and <code>negative_impls</code>
      </td>
      <td>
        <p>
          We have a feature that allows safe conversions from one type to another via the codec. For instance, a smaller integer can be safely cast to a larger one. This feature is central to proxies and transaction syntax.
        </p>
        <p>
          We are using auto-traits and negative implementations to overcome overlaps in the implementations of the <code>CodecFrom</code> trait.
        </p>
      </td>
      <td>
        <p>
          Could be replaced by relying more heavily on proc-macros. We would need a way to generate the <code>CodecFrom&lt;Self&gt;</code> when deriving <code>TopEncode</code> and <code>TopDecode</code>.
        </p>
        <p>
          Alternately, we could wait for an overlapping marker trait impls.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>try_trait_v2</code>
      </td>
      <td>
        <p>
          Used in the deprecated <code>SCResult</code> type.
        </p>
      </td>
      <td>
        <p>
          Remove <code>SCResult</code>.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>maybe_uninit_uninit_array</code> and <code>maybe_uninit_array_assume_init</code>
      </td>
      <td>
        <p>
          Used in <code>ManagedVec</code> <code>to_array_of_refs</code>.
        </p>
      </td>
      <td>
        <p>
          There are less elegant ways to write that method, without using these features.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>generic_const_exprs</code>
      </td>
      <td>
        <p>
          Used everywhere in working with the <code>ManagedVec</code> payload, without using the heap. They allow us to allocate variable sized byte arrays on the stack.
        </p>
      </td>
      <td>
        <p>
          Using universal fixed-sized arrays on heap for handling payloads. Might hurt performance, and might also occasionally run into overflows.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>slice_partition_dedup</code>
      </td>
      <td>
        <p>
          Used in <code>ManagedVec</code> <code>dedup</code>.
        </p>
      </td>
      <td>
        <p>
          We could probably replace that one with an in-house de-duplication function.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>is_sorted</code>
      </td>
      <td>
        <p>
          Used in <code>ManagedVec</code> <code>is_sorted</code>, <code>is_sorted_by</code>, and <code>is_sorted_by_key</code>. These methods are currently mostly used in tests.
        </p>
      </td>
      <td>
        <p>
          We could probably replace them with in-house equivalent functions.
        </p>
      </td>
    </tr>
    <tr>
      <td>
        <code>panic_info_message</code>
      </td>
      <td>
        <p>
          Used in the wasm adapter to retrieve panic messages, for debugging purposes.
        </p>
      </td>
      <td>
        <p>
          Figuring out a way to use the format function provided by the stable version of the library, without performing memory allocation.
        </p>
      </td>
    </tr>
  </table>
);

[comment]: # (mx-context-auto)

## Deal breakers

Some of the nightly features that we use could be easily replaced with something from stable. However, there are a few essential ones that we have yet no solution for:

[comment]: # (mx-context-auto)

### `generic_const_exprs`

This one is very difficult to get rid of without compromising the `ManagedVec` functionality. We have also recently added a new `ManagedDecimal` component that makes use of this feature. This is the main deal breaker right now for switching to stable Rust.

[comment]: # (mx-context-auto)

### `never_type`

Our entire codec relies on the never type. There might be a workaround using void enums, not sure if it works. Fortunately, this feature is close to being stabilized.

[comment]: # (mx-context-auto)

### `auto_traits` and `negative_impls`

This is not impossible to overcome, but would need a redesign of some of the codec traits.
