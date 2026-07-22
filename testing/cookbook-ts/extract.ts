// extract.ts — assemble compilable TypeScript from cookbook recipe MDX.
//
// Every titled TypeScript fence is treated as a file path relative to one
// recipe root. Inputs are untrusted because this extractor runs for pull
// requests, before npm installs the extracted harness. Keep all output path
// checks here, next to the writes they protect.

import { existsSync } from "node:fs";
import {
  lstat,
  mkdir,
  readdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  relative,
  resolve,
  sep,
  win32,
} from "node:path";
import { fileURLToPath } from "node:url";

import { extractCodeBlocksFromMarkdown } from "./parser.ts";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..");
const COOKBOOK_DIR = resolve(
  REPO_ROOT,
  "docs/sdk-and-tools/sdk-js/cookbook",
);
const RECIPES_OUT = resolve(HERE, "project", "src", "recipes");
const COMPILE_LANGUAGES = new Set(["ts", "tsx"]);
const SAFE_RELATIVE_PATH =
  /^[A-Za-z0-9][A-Za-z0-9._-]*(?:\/[A-Za-z0-9][A-Za-z0-9._-]*)*$/;

function escapesRoot(relativePath: string): boolean {
  return (
    relativePath === ".." ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  );
}

function assertContained(root: string, candidate: string, message: string): void {
  if (escapesRoot(relative(resolve(root), resolve(candidate)))) {
    throw new Error(message);
  }
}

export async function findMdxFiles(
  dir: string,
  cookbookRoot = resolve(dir),
): Promise<string[]> {
  const root = resolve(cookbookRoot);
  const current = resolve(dir);
  assertContained(root, current, `Cookbook input path escapes its root: ${current}`);

  const currentStat = await lstat(current);
  if (currentStat.isSymbolicLink()) {
    throw new Error(`Symbolic links are not allowed in the cookbook tree: ${current}`);
  }

  const entries = await readdir(current, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(current, entry.name);
    assertContained(root, full, `Cookbook input path escapes its root: ${full}`);
    if (entry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in the cookbook tree: ${full}`);
    }
    if (entry.isDirectory()) {
      files.push(...(await findMdxFiles(full, root)));
    } else if (entry.name.endsWith(".mdx") || entry.name.endsWith(".md")) {
      files.push(full);
    }
  }
  return files.sort();
}

function slugFor(mdxPath: string): string {
  return basename(mdxPath).replace(/\.mdx?$/, "");
}

export function validateRelativeFileTitle(title: string): void {
  if (title.trim() === "") {
    throw new Error("Fence title must be a non-empty relative file path.");
  }
  if (isAbsolute(title) || win32.isAbsolute(title)) {
    throw new Error(`Fence title must not be absolute: "${title}".`);
  }
  const segments = title.split("/");
  if (segments.some((segment) => segment === "." || segment === "..")) {
    throw new Error(`Fence title must not contain '.' or '..' segments: "${title}".`);
  }
  if (!SAFE_RELATIVE_PATH.test(title)) {
    throw new Error(
      `Fence title is not a conservative portable relative path: "${title}".`,
    );
  }
}

export function resolveRecipeRoot(recipesOut: string, slug: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(slug)) {
    throw new Error(`Recipe slug is not a safe path segment: "${slug}".`);
  }
  const root = resolve(recipesOut);
  const recipeRoot = resolve(root, slug);
  assertContained(root, recipeRoot, `Recipe root escapes extraction root: ${slug}`);
  return recipeRoot;
}

export function resolveRecipeOutputPath(
  recipeRoot: string,
  title: string,
): string {
  validateRelativeFileTitle(title);
  const root = resolve(recipeRoot);
  const output = resolve(root, title);
  const rel = relative(root, output);
  if (rel === "" || escapesRoot(rel)) {
    throw new Error(`Fence title escapes its recipe root: "${title}".`);
  }
  return output;
}

async function ensureSafeDirectoryTree(
  recipeRoot: string,
  targetDirectory: string,
): Promise<void> {
  const root = resolve(recipeRoot);
  const target = resolve(targetDirectory);
  assertContained(root, target, `Output directory escapes recipe root: ${target}`);

  await mkdir(root, { recursive: true });
  const rootStat = await lstat(root);
  if (rootStat.isSymbolicLink()) {
    throw new Error(`Recipe output root must not be a symbolic link: ${root}`);
  }
  if (!rootStat.isDirectory()) {
    throw new Error(`Recipe output root is not a directory: ${root}`);
  }

  const relativeTarget = relative(root, target);
  let cursor = root;
  for (const segment of relativeTarget === "" ? [] : relativeTarget.split(sep)) {
    cursor = resolve(cursor, segment);
    try {
      const stat = await lstat(cursor);
      if (stat.isSymbolicLink()) {
        throw new Error(`Refusing to write through symbolic link: ${cursor}`);
      }
      if (!stat.isDirectory()) {
        throw new Error(`Expected output directory but found a file: ${cursor}`);
      }
    } catch (error: unknown) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
        throw error;
      }
      await mkdir(cursor);
    }
  }

  const realRoot = await realpath(root);
  const realTarget = await realpath(target);
  assertContained(
    realRoot,
    realTarget,
    `Resolved output directory escapes recipe root: ${realTarget}`,
  );
}

export async function writeRecipeFile(
  recipeRoot: string,
  title: string,
  content: string,
): Promise<string> {
  const outPath = resolveRecipeOutputPath(recipeRoot, title);
  await ensureSafeDirectoryTree(recipeRoot, dirname(outPath));
  if (existsSync(outPath)) {
    const stat = await lstat(outPath);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to overwrite symbolic link: ${outPath}`);
    }
    if (!stat.isFile()) {
      throw new Error(`Refusing to overwrite non-file output: ${outPath}`);
    }
  }
  await writeFile(outPath, content, "utf-8");
  return outPath;
}

export interface AssembleCookbookOptions {
  cookbookDir: string;
  recipesOut: string;
  repoRoot?: string;
  log?: (message: string) => void;
}

export interface AssembleCookbookResult {
  recipeCount: number;
  fileCount: number;
}

export async function assembleCookbook({
  cookbookDir,
  recipesOut,
  repoRoot = REPO_ROOT,
  log = console.log,
}: AssembleCookbookOptions): Promise<AssembleCookbookResult> {
  const resolvedCookbookDir = resolve(cookbookDir);
  const resolvedRecipesOut = resolve(recipesOut);
  const resolvedRepoRoot = resolve(repoRoot);
  if (!existsSync(resolvedCookbookDir)) {
    throw new Error(`Cookbook directory not found: ${resolvedCookbookDir}`);
  }

  await rm(resolvedRecipesOut, { recursive: true, force: true });
  await mkdir(resolvedRecipesOut, { recursive: true });

  const mdxFiles = await findMdxFiles(resolvedCookbookDir);
  const slugOwners = new Map<string, string>();
  for (const mdxPath of mdxFiles) {
    const slug = slugFor(mdxPath);
    const slugKey = slug.toLowerCase();
    const previousOwner = slugOwners.get(slugKey);
    if (previousOwner !== undefined) {
      throw new Error(
        `Duplicate cookbook slug "${slug}" in ${relative(resolvedRepoRoot, mdxPath)}; ` +
          `already used by ${relative(resolvedRepoRoot, previousOwner)}.`,
      );
    }
    slugOwners.set(slugKey, mdxPath);
  }

  let recipeCount = 0;
  let fileCount = 0;
  for (const mdxPath of mdxFiles) {
    const slug = slugFor(mdxPath);
    const markdown = await readFile(mdxPath, "utf-8");
    const blocks = extractCodeBlocksFromMarkdown(markdown);
    const compilable = blocks.filter(
      (block) =>
        block.title !== undefined &&
        block.language !== undefined &&
        COMPILE_LANGUAGES.has(block.language),
    );
    if (compilable.length === 0) {
      continue;
    }

    const recipeRoot = resolveRecipeRoot(resolvedRecipesOut, slug);
    const seen = new Set<string>();
    for (const block of compilable) {
      const title = block.title!;
      const outPath = resolveRecipeOutputPath(recipeRoot, title);
      const outputKey = outPath.toLowerCase();
      if (seen.has(outputKey)) {
        throw new Error(
          `Duplicate fence path "${title}" in ${relative(resolvedRepoRoot, mdxPath)} ` +
            "— every titled fence in a recipe must map to a unique file.",
        );
      }
      seen.add(outputKey);

      await writeRecipeFile(recipeRoot, title, block.content);
      fileCount += 1;
      log(
        `Extracted ${relative(resolvedRepoRoot, mdxPath)} :: ${title} (${block.language})`,
      );
    }
    recipeCount += 1;
  }

  log(
    `\nAssembled ${fileCount} file(s) across ${recipeCount} recipe(s) into ` +
      `${relative(resolvedRepoRoot, resolvedRecipesOut)}`,
  );

  if (fileCount === 0) {
    throw new Error(
      "No compilable fences found. Expected titled ```ts / ```tsx fences in " +
        `${relative(resolvedRepoRoot, resolvedCookbookDir)}.`,
    );
  }

  return { recipeCount, fileCount };
}

async function main(): Promise<void> {
  await assembleCookbook({
    cookbookDir: COOKBOOK_DIR,
    recipesOut: RECIPES_OUT,
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
