// extract.ts — assemble compilable TypeScript from the cookbook recipe MDX.
//
// TypeScript counterpart of ../extract-tutorial-code/src/extract_code.rs.
//
// The Rust CI extracts a hard-coded set of named blocks from one tutorial into
// one crate, then runs `cargo test`. The cookbook is many small recipes instead
// of one tutorial, so this walks a directory of recipe pages, and for each page
// writes every titled `ts`/`tsx` fence into its own folder inside the harness
// project:
//
//   docs/.../cookbook/<section>/<slug>.mdx
//        ```ts title="src/foo.ts"   ->  project/src/recipes/<slug>/src/foo.ts
//
// Afterwards `tsc --noEmit --strict` in project/ type-checks every recipe at
// once (see ../cookbook-ts-ci.sh). "What is shown is what is compiled": only the
// fences a reader sees on the page are extracted; untitled/illustrative fences
// (bash, output, prose snippets) are ignored.

import { existsSync } from "node:fs";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { extractCodeBlocksFromMarkdown } from "./parser.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");

/** The one directory that holds ported cookbook recipes (analogous to the
 *  Rust extractor's hard-coded tutorial path list). */
const COOKBOOK_DIR = join(REPO_ROOT, "docs/sdk-and-tools/sdk-js/cookbook");

/** Where assembled recipes land — git-ignored, wiped and rebuilt each run. */
const RECIPES_OUT = join(HERE, "project", "src", "recipes");

/** Only these fence languages are compiled. */
const COMPILE_LANGUAGES = new Set(["ts", "tsx"]);

async function findMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await findMdxFiles(full)));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files.sort();
}

/** Recipe slug = the MDX file's basename (send-egld.mdx -> "send-egld"). */
function slugFor(mdxPath: string): string {
  const base = mdxPath.split("/").at(-1)!;
  return base.replace(/\.mdx?$/, "");
}

async function main(): Promise<void> {
  if (!existsSync(COOKBOOK_DIR)) {
    throw new Error(`Cookbook directory not found: ${COOKBOOK_DIR}`);
  }

  // Fresh start, so a removed fence never lingers as a stale extracted file.
  await rm(RECIPES_OUT, { recursive: true, force: true });
  await mkdir(RECIPES_OUT, { recursive: true });

  const mdxFiles = await findMdxFiles(COOKBOOK_DIR);
  let recipeCount = 0;
  let fileCount = 0;

  for (const mdxPath of mdxFiles) {
    const slug = slugFor(mdxPath);
    const markdown = await readFile(mdxPath, "utf-8");
    const blocks = extractCodeBlocksFromMarkdown(markdown);

    const compilable = blocks.filter(
      (b) => b.title && b.language && COMPILE_LANGUAGES.has(b.language),
    );
    if (compilable.length === 0) {
      continue;
    }

    const seen = new Set<string>();
    for (const block of compilable) {
      const title = block.title!;
      if (seen.has(title)) {
        throw new Error(
          `Duplicate fence title "${title}" in ${relative(REPO_ROOT, mdxPath)} ` +
            `— every titled fence in a recipe must map to a unique file.`,
        );
      }
      seen.add(title);

      const outPath = join(RECIPES_OUT, slug, title);
      await mkdir(dirname(outPath), { recursive: true });
      await writeFile(outPath, block.content, "utf-8");
      fileCount += 1;
      console.log(
        `Extracted ${relative(REPO_ROOT, mdxPath)} :: ${title} (${block.language})`,
      );
    }
    recipeCount += 1;
  }

  console.log(
    `\nAssembled ${fileCount} file(s) across ${recipeCount} recipe(s) into ` +
      `${relative(REPO_ROOT, RECIPES_OUT)}`,
  );

  if (fileCount === 0) {
    throw new Error(
      "No compilable fences found. Expected titled ```ts / ```tsx fences in " +
        `${relative(REPO_ROOT, COOKBOOK_DIR)}.`,
    );
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exitCode = 1;
});
