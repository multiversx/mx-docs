---
id: custom-types
title: Custom Types
---
[comment]: # (mx-abstract)

We sometimes create new types that we want to serialize and deserialize directly when interacting with contracts. For `struct`s and `enum`s it is very easy to set them up, with barely any code.



[comment]: # (mx-context-auto)

### Custom structures

Any structure defined in a contract of library can become serializable if it is annotated with either or all of: `TopEncode`, `TopDecode`, `NestedEncode`, `NestedDecode`.

**Example implementation:**

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
pub struct Struct {
	pub int: u16,
	pub seq: Vec<u8>,
	pub another_byte: u8,
	pub uint_32: u32,
	pub uint_64: u64,
}
```

**Top-encoding**: All fields nested-encoded one after the other.

**Nested encoding**: The same, all fields nested-encoded one after the other.

**Example value**

```rust
Struct {
		int: 0x42,
		seq: vec![0x1, 0x2, 0x3, 0x4, 0x5],
		another_byte: 0x6,
		uint_32: 0x12345,
		uint_64: 0x123456789,
}
```

It will be encoded (both top-encoding and nested encoding) as: `0x004200000005010203040506000123450000000123456789`.

Explanation:

```
[
/* int */ 0, 0x42,
/* seq length */ 0, 0, 0, 5,
/* seq contents */ 1, 2, 3, 4, 5,
/* another_byte */ 6,
/* uint_32 */ 0x00, 0x01, 0x23, 0x45,
/* uint_64 */ 0x00, 0x00, 0x00, 0x01, 0x23, 0x45, 0x67, 0x89
]
```

---

[comment]: # (mx-context-auto)

### Custom enums

Any enum defined in a contract of library can become serializable if it is annotated with either or all of: `TopEncode`, `TopDecode`, `NestedEncode`, `NestedDecode`.

**A simple enum example:**

_Example taken from the multiversx-sc-codec tests._

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
enum DayOfWeek {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}
```

**A more complex enum example:**

```rust
#[derive(TopEncode, TopDecode, NestedEncode, NestedDecode)]
enum EnumWithEverything {
	Default,
	Today(DayOfWeek),
	Write(Vec<u8>, u16),
	Struct {
		int: u16,
		seq: Vec<u8>,
		another_byte: u8,
		uint_32: u32,
		uint_64: u64,
	},
}
```

**Nested encoding**:
First, the discriminant is encoded. The discriminant is the index of the variant, starting with `0`.
Then the fields in that variant (if any) get nested-encoded one after the other.

**Top-encoding**: Same as nested-encoding, but with an additional rule:
if the discriminant is `0` (first variant) and there are no fields, nothing is encoded.

**Example values**

_The examples below are taken from the multiversx-sc-codec tests._

<ExampleTable />

export const ExampleTable = () => (
  <table>
    <tr>
      <th>Value</th>
      <th>Top-encoding bytes</th>
      <th>Nested encoding bytes</th>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            DayOfWeek::Monday
          </pre>
        </code>
      </td>
      <td>
        <code>
          <pre> 
            /* nothing */
          </pre>
        </code>
      </td>
      <td>
        <code>
          <pre> 
            /* discriminant */ 0,
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
        <pre> 
          DayOfWeek::Tuesday
        </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            /* discriminant */ 1,
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Default
          </pre>
        </code>
      </td>
      <td>
        <code>
          <pre> 
            /* nothing */
          </pre>
        </code>
      </td>
      <td>
        <code>
          <pre> 
            /* discriminant */ 0,
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Today(
            <br/>    DayOfWeek::Monday
            <br/>)
          </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            <br/>/* discriminant */ 1,
            <br/>/* DayOfWeek discriminant */ 0
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Today(
            <br/>    DayOfWeek::Friday
            <br/>)
          </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            <br/>/* discriminant */ 1,
            <br/>/* DayOfWeek discriminant */ 4
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Write(
            <br/>    Vec::new(),
            <br/>    0,
            <br/>)
          </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            <br/>/* discriminant */ 2,
            <br/>/* vec length */ 0, 0, 0, 0,
            <br/>/* u16 */ 0, 0,
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Write(
            <br />    [1, 2, 3].to_vec(),
            <br />    4
            <br />)
          </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            <br />/* discriminant */ 2,
            <br />/* vec length */ 0, 0, 0, 3,
            <br />/* vec contents */ 1, 2, 3,
            <br />/* an extra 16 */ 0, 4,
          </pre>
        </code>
      </td>
    </tr>
    <tr>
      <td>
        <code>
          <pre> 
            EnumWithEverything::Struct (
            <br/>    int: 0x42,
            <br/>    seq: vec![0x1, 0x2, 0x3, 0x4, 0x5],
            <br/>    another_byte: 0x6,
            <br/>    uint_32: 0x12345,
            <br/>    uint_64: 0x123456789,
            <br />);
          </pre>
        </code>
      </td>
      <td colspan="2">
        <code>
          <pre> 
            <br/>/* discriminant */ 3,
            <br/>/* int */ 0, 0x42,
            <br/>/* seq length */ 0, 0, 0, 5,
            <br/>/* seq contents */ 1, 2, 3, 4, 5,
            <br/>/* another_byte */ 6,
            <br/>/* uint_32 */ 0x00, 0x01, 0x23, 0x45,
            <br/>/* uint_64 */ 0x00, 0x00, 0x00, 0x01,
            <br/>              0x23, 0x45, 0x67, 0x89,
          </pre>
        </code>
      </td>
    </tr>
  </table>
);
