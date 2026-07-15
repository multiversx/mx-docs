#!/bin/sh

## This script assembles the TypeScript from every cookbook recipe page and
## type-checks it under strict settings. It is the TS counterpart of
## rust-tutorial-ci.sh: that one extracts tutorial code into a crate and runs
## `cargo test`; this one extracts titled ts/tsx fences into a project and runs
## `tsc --noEmit --strict`.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Extract: titled ts/tsx fences from the recipe MDX -> project/src/recipes/.
cd "$SCRIPT_DIR/cookbook-ts" || exit 1
npm ci || exit 1
npm run extract || exit 1

# 2. Type-check: strict, no emit, across every extracted recipe at once.
cd "$SCRIPT_DIR/cookbook-ts/project" || exit 1
npm ci || exit 1
npm run typecheck || exit 1
