import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  assembleCookbook,
  findMdxFiles,
  resolveRecipeOutputPath,
  validateRelativeFileTitle,
  writeRecipeFile,
} from "./extract.ts";

const fence = "`".repeat(3);

function titledTypeScript(title: string, content = "export const ok = true;"): string {
  return [
    `${fence}ts title="${title}"`,
    content,
    fence,
    "",
  ].join("\n");
}

async function withSandbox(
  run: (sandbox: string) => Promise<void>,
): Promise<void> {
  const sandbox = await mkdtemp(join(tmpdir(), "cookbook-extractor-test-"));
  try {
    await run(sandbox);
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
}

test("rejects traversal before it can overwrite the harness package", async () => {
  await withSandbox(async (sandbox) => {
    const cookbook = join(sandbox, "docs");
    const recipesOut = join(sandbox, "project", "src", "recipes");
    const harnessPackage = join(sandbox, "project", "package.json");
    await mkdir(join(cookbook, "section"), { recursive: true });
    await mkdir(join(sandbox, "project"), { recursive: true });
    await writeFile(harnessPackage, '{"scripts":{"test":"safe"}}\n');
    await writeFile(
      join(cookbook, "section", "malicious.mdx"),
      titledTypeScript("../../../package.json", '{"scripts":{"postinstall":"pwned"}}'),
    );

    await assert.rejects(
      assembleCookbook({ cookbookDir: cookbook, recipesOut, log: () => {} }),
      /must not contain.*\.\./,
    );
    assert.equal(
      await readFile(harnessPackage, "utf8"),
      '{"scripts":{"test":"safe"}}\n',
    );
  });
});

test("rejects absolute, empty, dotted, and non-portable paths", () => {
  for (const title of [
    "",
    "/tmp/index.ts",
    "C:\\temp\\index.ts",
    "src/./index.ts",
    "src//index.ts",
    "src/index file.ts",
  ]) {
    assert.throws(() => validateRelativeFileTitle(title));
  }
  assert.doesNotThrow(() => validateRelativeFileTitle("src/vite-env.d.ts"));
});

test("resolved output remains beneath the resolved recipe root", () => {
  const root = "/tmp/cookbook-recipes/example";
  assert.equal(
    resolveRecipeOutputPath(root, "src/index.ts"),
    join(root, "src", "index.ts"),
  );
  assert.throws(
    () => resolveRecipeOutputPath(root, "../package.json"),
    /must not contain.*\.\./,
  );
});

test("rejects duplicate slugs across cookbook sections", async () => {
  await withSandbox(async (sandbox) => {
    const cookbook = join(sandbox, "docs");
    const recipesOut = join(sandbox, "recipes");
    await mkdir(join(cookbook, "a"), { recursive: true });
    await mkdir(join(cookbook, "b"), { recursive: true });
    await writeFile(join(cookbook, "a", "same.mdx"), titledTypeScript("src/a.ts"));
    await writeFile(join(cookbook, "b", "same.mdx"), titledTypeScript("src/b.ts"));

    await assert.rejects(
      assembleCookbook({ cookbookDir: cookbook, recipesOut, log: () => {} }),
      /Duplicate cookbook slug "same"/,
    );
  });
});

test("rejects duplicate output paths within one page", async () => {
  await withSandbox(async (sandbox) => {
    const cookbook = join(sandbox, "docs");
    const recipesOut = join(sandbox, "recipes");
    await mkdir(cookbook, { recursive: true });
    await writeFile(
      join(cookbook, "duplicate.mdx"),
      titledTypeScript("src/index.ts") + titledTypeScript("src/index.ts"),
    );

    await assert.rejects(
      assembleCookbook({ cookbookDir: cookbook, recipesOut, log: () => {} }),
      /Duplicate fence path "src\/index\.ts"/,
    );
  });
});

test("rejects symlinks in the cookbook input tree", async () => {
  await withSandbox(async (sandbox) => {
    const cookbook = join(sandbox, "docs");
    const outside = join(sandbox, "outside.mdx");
    await mkdir(cookbook);
    await writeFile(outside, titledTypeScript("src/index.ts"));
    await symlink(outside, join(cookbook, "linked.mdx"));

    await assert.rejects(findMdxFiles(cookbook), /Symbolic links are not allowed/);
  });
});

test("rejects writes through a symlinked output directory", async () => {
  await withSandbox(async (sandbox) => {
    const recipeRoot = join(sandbox, "recipes", "example");
    const outside = join(sandbox, "outside");
    await mkdir(recipeRoot, { recursive: true });
    await mkdir(outside);
    await symlink(outside, join(recipeRoot, "src"));

    await assert.rejects(
      writeRecipeFile(recipeRoot, "src/index.ts", "export {};\n"),
      /Refusing to write through symbolic link/,
    );
    await assert.rejects(readFile(join(outside, "index.ts"), "utf8"), /ENOENT/);
  });
});
