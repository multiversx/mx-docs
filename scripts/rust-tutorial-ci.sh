#!/bin/sh

## This script copies code from the tutorial into a proper contract crate and runs all tests in it.
## The tests are also taken from the tutorial.
## Tests are only run on the rust backend.

cd testing/extract-tutorial-code
cargo run || return 1

cd ../crowdfunding
cargo test || return 1
