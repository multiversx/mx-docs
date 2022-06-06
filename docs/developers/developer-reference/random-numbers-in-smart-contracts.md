---
id: random-numbers-in-smart-contracts
title: Random Numbers in Smart Contracts
---

## Introduction

Randomness in the blockchain environment is a challenging task to accomplish. Due to the nature of the environemnt, nodes must all have the same "random" generator to be able to reach consensus. This is solved by using Golang's standard seeded random number generator, directly in the VM: https://cs.opensource.google/go/go/+/refs/tags/go1.17.5:src/math/rand/

The VM function `mBufferSetRandom` uses this library, seeded with the concatenation of:
- previous block random seed
- current block random seed
- tx hash

We're not going to go into details about how exactly the Golang library uses the seed or how it generates said random numbers, as that's not the purpose of this tutorial.

## Random numbers in smart contracts

The `ManagedBuffer` type has two methods you can use for this:
- `fn new_random(nr_bytes: usize) -> Self`, which creates a new `ManagedBuffer` of `nr_bytes` random bytes
- `fn set_random(&mut self, nr_bytes: usize)`, which sets an already existing buffer to random bytes

For convenience, a wrapper over these methods was created, namely the `RandomnessSource` struct, which contains methods for generating a random number for all base rust unsigned numerical types, and a method for generating random bytes.

For example, let's say you wanted to generate `n` random `u16`:
```rust
let mut rand_source = RandomnessSource::<Self::Api>::new();
for _ in 0..n {
    let my_rand_nr = rand_source.next_u16();
    // do something with the number
}
```

Similar methods exist for all Rust unsigned numerical types.

## Random numbers in a specific range

Let's say you wanted to implement a Fisher-Yates shuffling algorithm inside your smart contract (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle).

The `RandomnessSource` struct provides methods for generating numbers within a range, namely `fn next_usize_in_range(min: usize, max: usize) -> usize`, which generates a random `usize` in the `[min, max)` range. These methods are available for the rest of the numerical types as well, but for this example, we need `usize` (in Rust, indexes are `usize`).

For that, you would probably have a vector of some kind. For example, let's assume you wanted to shuffle a vector of `ManagedBuffer`s.

```rust
let mut my_vec = ManagedVec::new();
// ...
// fill my_vec with elements
// ...

let vec_len = my_vec.len();
let mut rand_source = RandomnessSource::<Self::Api>::new();
for i in 0..vec_len {
    let rand_index = rand_source.next_usize_in_range(i, vec_len);
    let first_item = my_vec.get(i).unwrap();
    let second_item = my_vec.get(rand_index).unwrap();

    my_vec.set(i, &second_item);
    my_vec.set(rand_index, &first_item);
}
```

This algorithm will shuffle each element at position `i`, with an element from position `[i, vec_len)`.

## Random bytes

Let's say you want to create some NFTs in your contract, and want to give each of them a random hash of 32 bytes. To do that, you would use the `next_bytes(len: usize)` method of the `RandomnessSource` struct:

```rust
let mut rand_source = RandomnessSource::<Self::Api>::new();
let rand_hash = rand_source.next_bytes(32);
// NFT create logic here
```

## Considerations

:::warning
NEVER have logic in your smart contract that only depends on the current state.
:::

Example of BAD implementation:
```rust
#[payable("EGLD")]
#[endpoint(rollDie)]
fn roll_die(&self) {
    // ...
    let payment = self.call_value().egld_value();
    let rand_nr = rand_source.next_u8();
    if rand_nr % 6 == 0 {
        let prize = payment * 2u32;
        self.send().direct(&caller, &prize, b"you win!");
    }
    // ...
}
```

This is very easy to abuse, as you can simply simulate your transactions, and only send them when you see you've won. Therefore, guarnateeing a 100% win chance!

Keep in mind you are not running this on your own private server, you are running it on a public blockchain, so you need a complete shift in design.

Example of GOOD implementation:
```rust
#[payable("EGLD")]
#[endpoint(signUp)]
fn sign_up(&self) {
    let already_signed_up = self.user_list().insert(caller.clone());
    if already_signed_up {
        sc_panic!("Already signed up");
    }
}

#[only_owner]
#[endpoint(selectWinners)]
fn select_winners(&self) {
    for user in self.user_list().iter() {
        let rand_nr = rand_source.next_u8();
        if rand_nr % 6 == 0 {
            self.winners_list().insert(user.clone());
        }
    }
}

#[endpoint]
fn claim(&self) {
    let was_winner = self.winners_list().swap_remove(&caller);
    if was_winner {
        self.send().direct_egld(&caller, &prize, &[]);
    }
}

#[storage_mapper("userList")]
fn user_list(&self) -> UnorderedSetMapper<ManagedAddress>;

#[storage_mapper("winnersList")]
fn winners_list(&self) -> UnorderedSetMapper<ManagedAddress>;
```


## Conclusion

This random number generator should be enough for most purposes. Enjoy using it for your lotteries and such!
