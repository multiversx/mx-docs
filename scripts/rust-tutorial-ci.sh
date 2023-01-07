#!/bin/sh

## This script copies code from the tutorial into a proper contract crate and runs all tests in it.
## The Mandos tests are also taken from the tutorial.
## Only mandos-rs tests are run.

cd testing/extract-tutorial-code
cargo run || return 1

cd ../crowdfunding-esdt
cargo test || return 1
