#!/bin/sh

## This script assembles the TypeScript from every cookbook recipe page and
## type-checks it under strict settings, then builds every runnable project in
## isolated npm dependency environments. It is the TS counterpart of
## rust-tutorial-ci.sh: that one extracts tutorial code into a crate and runs
## `cargo test`; this one extracts titled ts/tsx fences into a project and runs
## `tsc --noEmit --strict`.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# 1. Extract every titled project file from recipe MDX -> project/src/recipes/.
cd "$SCRIPT_DIR/cookbook-ts" || exit 1
npm ci || exit 1
npm test || exit 1
npm run typecheck || exit 1
npm run extract || exit 1
npm run test:lifecycle || exit 1

# 2. Type-check: strict, no emit, across every extracted recipe at once.
cd "$SCRIPT_DIR/cookbook-ts/project" || exit 1
npm ci || exit 1
npm run typecheck || exit 1

# 3. Reconstruct every self-contained project, install its documented exact
# dependencies in one of five isolated environments (one per exact dependency
# set), and run each project's own build script.
cd "$SCRIPT_DIR/cookbook-ts" || exit 1
node verify-projects.mjs || exit 1
