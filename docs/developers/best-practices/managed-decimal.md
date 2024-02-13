---
id: managed-decimal
title: Managed Decimal
---

[comment]: # (mx-context-auto)

## Managed Decimal Overview

`ManagedDecimal` is a generic type representing a fixed-point decimal number managed by the API. 
It is designed to handle decimal values with a specific number of decimals, providing operations such as addition, subtraction, multiplication, division, scaling, and conversion between different decimal precision and also more complex operations such as logarithm and nth root with a customizable degree of precision.

Essentially, `ManagedDecimal` is simply a struct containing a wrapper over a `BigIntHandle` (`BigUint`) and the number of decimals associated with that value (precision). Having such a light design helps `ManagedDecimal` become the optimal solution for dealing with fixed-point decimal numbers in terms of efficiency and readability.

```rust title=managed_decimal.rs
#[derive(Debug, Clone)]
pub struct ManagedDecimal<M: ManagedTypeApi, D: Decimals> {
    data: BigUint<M>, // value * scaling_factor
    decimals: D, // number_of_decimals (precision)
}
```

The `scaling factor` of the decimal is `10^num_of_decimals` and is a cached value across multiple `ManagedDecimal` instances for increased efficiency.

```rust title=example.rs
pub fn main() {
    let decimal = ManagedDecimal::<StaticApi, ConstDecimals<2>>::from(BigUint::from(1u64));
    let cached_decimal = ManagedDecimal::<StaticApi, ConstDecimals<2>>::from(BigUint::from(5u64));
}
```

In this case, when creating `decimal` from a `BigUint` of value `1`, the `data` field of the struct will contain the value `1 * scaling_factor` (in this case `10^2`). Being the first instance, the value will be calculated and then cached, so that when `cached_decimal` is created, the `scaling_factor` value for the specific number of decimals (`ConstDecimals<2>`) will be retrieved from the static API instead of recalculated.


[comment]: # (mx-context-auto)

## Number of decimals

`Decimals` is a trait representing the number of decimals associated with a decimal value and is only
implemented for `NumDecimals` and `ConstDecimals`.
`NumDecimals` is a type alias for `usize` and is used to specify the number of decimals dynamically, while `ConstDecimals` is a type that represents a constant number of decimals and is used to statically specify the number of decimals for ManagedDecimal instances.

```rust title=example.rs
pub fn main() {
    let decimal: ManagedDecimal<StaticApi, NumDecimals> = ManagedDecimal::from_raw_units(BigUint::from(100u64), 2usize);
    let const_decimal = ManagedDecimal::<StaticApi, ConstDecimals<3>>::const_decimals_from_raw(BigUint::from(500u64))
}
```

[comment]: # (mx-context-auto)

## Operations

`ManagedDecimal` supports various types of simple and complex operations, as well as conversions and scaling. More code examples can be found at `mx-sdk-rs/framework/scenario/tests/managed_decimal_test.rs` 

### Available methods:
- Simple Operations:
    - `add`, `mul`, `div`, `sub` are all implemented for `ConstDecimals` of the same scale.
    ```rust title=example.rs
    pub fn main() {
        let fixed = ManagedDecimal::<StaticApi, ConstDecimals<2>>::from(BigUint::from(1u64));
        let fixed_2 = ManagedDecimal::<StaticApi, ConstDecimals<2>>::from(BigUint::from(5u64));
    
        let addition = fixed + fixed_2;
        assert_eq!(
            addition,
            ManagedDecimal::<StaticApi, ConstDecimals<2>>::from(BigUint::from(6u64))
        );
    }
    ```
    - `trunc(&self) -> BigUint<M>` returns the `data` field without the `scaling_factor` applied, by dividing the value to the scaling factor and truncating.
    ```rust title=example.rs
    pub fn main() {
        ...
        assert_eq!(addition.trunc(), BigUint::from(6u64));
    }
    ```
- Complex Operations:
    - `log<T: Decimals>(self, target_base: BigUint<M>, precision: T) -> ManagedDecimal<M, T>` returns the value of log in any base with customizable precision level. 
    ```rust title=example.rs
    pub fn logarithm() {
        let fixed = ManagedDecimal::<StaticApi, NumDecimals>::from_raw_units(BigUint::from(10u64), 1usize);
        let fixed_const = ManagedDecimal::<StaticApi, ConstDecimals<1>>::const_decimals_from_raw(BigUint::from(10u64));

        let log2_fixed = fixed.log(BigUint::from(2u64), 10_000usize);
        assert_eq!(
            log2_fixed,
            ManagedDecimal::<StaticApi, NumDecimals>::from_raw_units(BigUint::from(33219u64), 10_000usize)
        );
    }
    ```
    - `root<T: Decimals>(&self, degree: BigUint<M>, precision: T) ->` !TODO! nth root
- Scaling:
    - `scale(&self) -> usize` returns the number of decimals (the scale).
    - `scaling_factor<M: ManagedTypeApi>(&self) -> BigUint<M>` returns the scaling factor value (`10^num_decimals`).
    - `rescale<T: Decimals>(self, scale_to: T) -> ManagedDecimal<M, T>` returns the correspondent of the decimal in the newly specified scale. It can also convert between `NumDecimal` and `ConstDecimals` instances.

    ```rust title=example.rs
    pub fn main() {
        ...
        let fixed_8: ManagedDecimal<StaticApi, NumDecimals> = ManagedDecimal::from_raw_units(BigUint::from(5u64), 5usize);
        let fixed_9 = fixed_8.rescale(ConstDecimals::<3>);
        assert_eq!(
            fixed_9,
            ManagedDecimal::<StaticApi, ConstDecimals<3>>::const_decimals_from_raw(BigUint::from(500u64))
        );
    }
    ```
- Conversions:
    - `into_raw_units(&self) -> &BigUint<M>` returns the `data` field value.

    ```rust title=example.rs
    pub fn main() {
        ...
        assert_eq!(addition.into_raw_units(), &BigUint::from(600u64));
    }
    ```
    - `from_raw_units(data: BigUint<M>, decimals: D) -> Self` returns a `ManagedDecimal` from a data field value without applying scaling factor.

    ```rust title=example.rs
    pub fn main() {
        ...
        let fixed_4: ManagedDecimal<StaticApi, NumDecimals> = ManagedDecimal::from_raw_units(BigUint::from(100u64), 2usize);
        let fixed_5 = fixed_4.rescale(2usize);
        assert_eq!(
            fixed_5,
            ManagedDecimal::from_raw_units(BigUint::from(100000000u64), 8usize)
        );
    }
    ```
    - `const_decimals_from_raw(data: BigUint<M>) -> Self` returns a `ConstDecimals` type of `ManagedDecimal` from a data field value without applying scaling factor.
    ```rust title=example.rs
    pub fn main() {
        ...
        let fixed_const: ManagedDecimal<StaticApi, ConstDecimals<1>> = ManagedDecimal::const_decimals_from_raw(BigUint::from(1u64));
    }
    ```
    - `num_decimals(&self) -> NumDecimals` returns the number of decimals.
    - `to_big_float(&self) -> BigFloat<M>` returns the decimal as `BigFloat<M>`.
    - `to_big_int(self) -> BigInt<M>` returns the decimal as `BigInt`.
    - `from_big_int<T: Decimals>(big_int: BigInt<M>, num_decimals: T) -> ManagedDecimal<M, T>` constructs a `ManagedDecimal` from a `BigInt` with customizable `num_decimals`.
    - `from_big_float<T: Decimals>(big_float: BigFloat<M>, num_decimals: T) -> ManagedDecimal<M, T>` constructs a `ManagedDecimal` from a `BigFloat` with customizable `num_decimals`.
    ```rust title=example.rs
    pub fn main() {
        ...
        let float_1 = BigFloat::<StaticApi>::from_frac(3i64, 2i64);
        let fixed_float_1 = ManagedDecimal::<StaticApi, ConstDecimals<1>>::from_big_float(float_1.clone(),ConstDecimals::<1>);
        let fixed_float_2 = ManagedDecimal::<StaticApi, NumDecimals>::from_big_float(float_1, 1usize);

        assert_eq!(
            fixed_float_1,
            ManagedDecimal::<StaticApi, ConstDecimals<1>>::const_decimals_from_raw(BigUint::from(15u64))
        );
        assert_eq!(
            fixed_float_2,
            ManagedDecimal::<StaticApi, NumDecimals>::from_raw_units(BigUint::from(15u64), 1usize)
        );
    }
    ```