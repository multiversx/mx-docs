# Cookbook TypeScript verification: authoring convention

This is the TypeScript counterpart of the repo's Rust tutorial CI
(`testing/rust-tutorial-ci.sh` + `testing/extract-tutorial-code/`). The Rust CI
extracts the code from a tutorial's fenced blocks into a real crate and runs
`cargo test`. This one materializes titled files from cookbook pages, runs a
shared strict TypeScript check, and reconstructs every standalone recipe in one
of five isolated npm dependency environments to run its own build. The
**Project build checked** badge describes that complete project artifact;
**Reference** pages make no standalone project claim.

The one rule to remember: **what is shown is what is checked.** Every titled
fence is materialized at its displayed path. Titled `ts`/`tsx` files are checked
together with `tsc --noEmit --strict`; project pages are then installed and
built from their own package and configuration files.

## Where recipes live

Ported recipes are Docusaurus MDX under:

```text
docs/sdk-and-tools/sdk-js/cookbook/<section>/<slug>.mdx
```

- `<section>` is a grouping folder (`network-providers`, `transactions`,
  `wallets`, `tokens`, ...). It also drives the sidebar sub-category.
- `<slug>` is the recipe id and the folder the extractor assembles code into.
  Slugs must be unique across the whole cookbook (the extractor namespaces by
  slug, not by section). The extractor checks this globally and fails before
  extraction if a second page reuses a slug.

The extractor only scans this directory, so nothing else in `docs/` is affected.

## The fence convention

A recipe's runnable code is authored as **titled** fenced code blocks:

````markdown
```ts title="src/providers.ts"
// ... file contents ...
```
````

- **`title="<path>"`** is the file's path inside the recipe, relative to the
  recipe root (for example `src/index.ts`, `src/lib/multiversx.ts`). This is the
  same `title=` attribute Docusaurus already renders as the code-block filename
  label, so the reader sees exactly the file that gets compiled.
- Paths use portable ASCII segments (`A-Z`, `a-z`, digits, `.`, `_`, and `-`)
  separated by `/`. Absolute paths, empty paths, `.` / `..` segments,
  backslashes, duplicate paths, and symbolic links are rejected. Every resolved
  output must remain inside its resolved recipe root.
- The fence language describes the file contents (`ts`, `tsx`, `json`, `html`,
  `text`, and so on). Every titled fence is materialized; TypeScript files are
  additionally compiled by the shared strict harness.
- A recipe with several files is several titled fences on the page. The
  extractor writes each to its path, so relative imports between them
  (`import { x } from './providers'`) resolve exactly as they do in the real
  recipe project.

Fences **without** a `title=` are treated as illustrative only. They are shown to
the reader but never extracted or compiled. Use an untitled `ts` fence for a throwaway
snippet you do not want type-checked (for example a one-off "generate a wallet"
aside), and a `text` fence for expected program output.

`filename="..."` and the bare `` ```foo.ts `` shorthand are also accepted, matching
the Rust parser, but `title="..."` is the house style because Docusaurus renders it.

### What is shown is what is checked

Because only titled fences compile, a recipe must show **every** file needed for
its code to type-check as a closed unit. If `App.tsx` imports `./providers`, then
`providers.tsx` must also appear as a titled fence on the page. Do not hide a
required file. If a file is pure boilerplate the reader does not need to study
(a provider bootstrap, an entry `index.ts`), still show it, under a clearly
labelled section such as "Provider bootstrap" or "Wiring it together".

The only things the harness supplies that a recipe does not have to show are the
ambient environment types in `project/src/scaffold.d.ts` (see below).

## Frontmatter

Recipe pages carry the frontmatter the design-layer meta strip reads (rendered
by the `DocItem/Content` swizzle, which activates only when both `difficulty` and
`sdk_versions` are present):

```yaml
---
title: Send EGLD to an address
description: One-sentence summary shown in search and social cards.
difficulty: beginner        # beginner | intermediate | advanced
est_minutes: 6              # optional: renders the "EST n min" chip
artifact: project           # project | reference; CI checks this against files
sdk_versions:               # object; each entry renders a version chip
  sdk-core: "15.4.1"
tags:
  - sdk-core
  - transaction
  - typescript
---
```

`difficulty` + `sdk_versions` are required for the strip to render at all.
`title`, `description`, `artifact`, and `tags` are expected on every recipe.
`artifact: project` requires a complete titled `package.json`, `tsconfig.json`,
and runnable entrypoint; the generator and CI reject a mismatched label.
`est_minutes` is optional.

## Running the check

The whole pipeline is one script, mirroring `rust-tutorial-ci.sh`:

```bash
./testing/cookbook-ts-ci.sh
```

It runs extractor tests, materializes every titled file, executes the shared
strict TypeScript check, then installs and builds all 61 project recipes in a
one of five isolated dependency environments. Recipes only share an environment
when their exact dependency and dev-dependency sets match. The GitHub workflow
runs the same script on Node 20.19.0
on push / PR.

To iterate on a single recipe faster, once dependencies are installed:

```bash
cd testing/cookbook-ts && npm run extract
cd project && npm run typecheck
```

## Harness layout

```text
testing/
  cookbook-ts-ci.sh              # runner (mirror of rust-tutorial-ci.sh)
  cookbook-ts/                   # the extractor (mirror of extract-tutorial-code/)
    parser.ts                    # fence parser (mirror of parser.rs)
    extract.ts                   # assembler   (mirror of extract_code.rs)
    package.json                 # tsx + typescript
    verify-projects.mjs          # clean install + individual project builds
    project/                     # the compiled unit (mirror of the crowdfunding crate)
      package.json               # pinned SDK deps: sdk-core, sdk-dapp, react, ...
      tsconfig.json              # one strict config for every recipe
      src/
        scaffold.d.ts            # committed ambient types (import.meta.env)
        recipes/                 # git-ignored; the extractor fills this each run
.github/workflows/cookbook-ts-ci.yml
```

The extracted `src/recipes/**` is git-ignored, exactly as the Rust harness
git-ignores the tutorial code it writes into the crowdfunding crate. Only the
skeleton is committed.

### Why one tsconfig for everything

The standalone recipe projects ship two tsconfig shapes: the sdk-core
"backend/script" recipes (CommonJS, Node types) and the sdk-dapp "React" recipes
(JSX, DOM libs, bundler resolution). The harness type-checks with a single
superset config: `module: ESNext`, `moduleResolution: bundler`, `jsx: react-jsx`,
`lib` including DOM, and every strict flag the recipe projects use. Because the
harness only runs `tsc --noEmit` (it never emits or executes), the emit module
format is irrelevant, so one config checks both families. Nothing is checked more
loosely here than in a recipe's own repo.

### The scaffold ambient types

`project/src/scaffold.d.ts` declares `import.meta.env` so the sdk-dapp/Vite
recipes type-check without installing a bundler. It is the TS analogue of the
hand-written skeleton files (`meta/`, `sc-config.toml`) the Rust harness assumes
already exist. Recipes never need to show a `vite-env.d.ts`; the harness provides
the environment.

## Porting a prototype recipe (checklist)

To convert one runnable recipe project into a compliant Docusaurus page:

1. Create `docs/sdk-and-tools/sdk-js/cookbook/<section>/<slug>.mdx`.
2. Write the frontmatter above. Set `artifact` to `project` only for a complete
   standalone project, and keep `sdk_versions` identical to its package file.
3. Convert prose to Docusaurus: paragraphs stay as Markdown; callouts become
   admonitions (`:::note[Title]`, `:::warning[Title]`, `:::danger[Title]`), never
   raw HTML.
4. Inline every project file as a titled fence, including package/configuration,
   entrypoint, helpers, and text assets. Put boilerplate in a collapsed
   `<details>` disclosure so the main recipe stays skimmable. Give command
   blocks the `bash` language and expected-output blocks the `text` language.
5. Scrub any internal-only references from comments and prose (these are public
   docs). Fix cross-links to real pages (or drop them); `onBrokenLinks` is `log`,
   so broken links will not fail the build but should still be avoided.
6. Keep em-dashes sparing.
7. Add the page to `sidebars.js` under "Cookbook (recipes)".
8. Verify:
   - `./testing/cookbook-ts-ci.sh` is green (strict check plus project builds).
   - `npm run build` is green and the page appears with its meta strip.
   - markdownlint (`.markdownlint.jsonc`) and codespell (`.codespell`) pass on
     the new file.
