// scaffold.d.ts — ambient types the harness provides so recipe code type-checks
// without pulling in a bundler.
//
// This is committed (the extractor never touches it) and is the TS analogue of
// the hand-written skeleton files in the crowdfunding crate (meta/, sc-config
// .toml, …) that the Rust extractor assumes already exist.
//
// The sdk-dapp "React" recipes are authored for Vite and read Vite env vars via
// `import.meta.env.VITE_*`. In their own repo a `vite-env.d.ts` referencing
// `vite/client` supplies these types. The harness does not install Vite, so we
// declare just the shape the recipes rely on (VITE_* string vars) here instead.

interface ImportMetaEnv {
  readonly [key: `VITE_${string}`]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
