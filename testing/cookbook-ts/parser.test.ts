import assert from "node:assert/strict";
import test from "node:test";

import {
  extractCodeBlocksFromMarkdown,
  parseCodeBlockInfo,
} from "./parser.ts";

const fence = "`".repeat(3);

test("parses a quoted titled fence", () => {
  assert.deepEqual(parseCodeBlockInfo('ts title="src/index.ts"'), {
    language: "ts",
    title: "src/index.ts",
  });
});

test("rejects malformed fence attributes", () => {
  assert.throws(
    () => parseCodeBlockInfo('ts title="src/index.ts'),
    /Malformed code fence info string/,
  );
  assert.throws(
    () => parseCodeBlockInfo('ts title="src/a.ts" filename="src/b.ts"'),
    /Multiple file titles/,
  );
});

test("rejects an unclosed fence instead of extracting partial content", () => {
  const markdown = [
    `${fence}ts title="src/index.ts"`,
    "export const value = 1;",
  ].join("\n");

  assert.throws(
    () => extractCodeBlocksFromMarkdown(markdown),
    /Unclosed .* code fence opened on line 1/,
  );
});

test("a shorter or different fence does not close the block", () => {
  const markdown = [
    `${fence}\`ts title="src/index.ts"`,
    "export const value = 1;",
    fence,
  ].join("\n");

  assert.throws(
    () => extractCodeBlocksFromMarkdown(markdown),
    /Unclosed .* code fence/,
  );
});
