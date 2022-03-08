---
id: biguint-operations
title: BigUint Operations
---

## BigUint Operations

`BigUint` is simply a handle to the actual representation, similar to how system file handles work, so it's simply a struct with an `i32` as member, representing the handle. All the operations have to be done through API functions, passing the handles for result, first operand, second operand. Using Rust's operator overloading feature, we're able to overwrite arithmetic operators and provide an easy way of adding `BigUint`s, just like primitive number types.

Even so, you might easily reach situations where you want to use the same number multiple times. For instance, let's say you have 4 `BigUint`s: `a`, `b`, `c`, `d`, and you want to do the following operations:
```
c = a + b;
d = c + a;
```

You will quickly come to realize this does not work, due to Rust's ownership system. `a` is consumed after the first operation, and you will likely reach an error like this:
```
move occurs because `a` has type `<Self as ContractBase>::BigUint`, which does not implement the `Copy` trait
```

The easiest way to solve this is to simply clone `a`.
```
c = a.clone() + b;
d = c + a;
```

The errors are now gone, but behind the scenes, this is more complex than simply copying the handle. `a.clone()` creates a whole new `BigUint`, copying the bytes from the original `a`.

This can be solved by borrowing `a`. `+` and the other operations are defined for references of `BigUint`, so this can be rewritten as:
```
c = &a + &b;
d = c + a;
```

Another example of avoiding the creation of additional `BigUint`s is performing operations with multiple arguments:
```
e = a + b + c + d;
```
Or, if you want to keep the instances (can't add owned `BigUint` to `&BigUint`, so you have to borrow the results as well):
```
e = &((&(&a + &b) + &c) + &d;
```

In both cases, this would do the following API calls:
```
temp1 = bigIntNew();
bigIntAdd(temp1, a, b);

temp2 = bigIntNew();
bigIntAdd(temp2, temp1, c);

temp3 = bigIntNew();
bigIntAdd(temp3, temp2, d);
```

And as such, creating 3 new `BigUints`, one for the result of `a + b`, one for the result of `(a + b) + c` and one for the final result that ends up in `e`. This can be optimized by rewriting the code in the following way:

```
e = BigUint::zero();
e += &a;
e += &b;
e += &c;
e += &d;
```

This creates a single `BigUint` instead of 3.

Of course, these are trivial examples, but we hope this clears up some confusion about how `BigUint`s work and how you can get the most of them.
