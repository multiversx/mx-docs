#!/bin/sh

## This script copies code from the tutorial into a proper contract crate and runs all tests in it.
## The tests are also taken from the tutorial.
## Tests are only run on the rust backend.

cd extract-tutorial-code || exit 1
cargo run || exit 1

cd ../crowdfunding || exit 1
cargo test || exit 1