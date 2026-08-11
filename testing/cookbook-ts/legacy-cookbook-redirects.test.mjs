import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import {
  COOKBOOK_PATH,
  getLegacyCookbookTarget,
  legacyCookbookRedirectGroups,
  legacyCookbookRedirects,
} from "../../src/components/cookbook/LegacyCookbookRedirect/legacyCookbookRedirects.mjs";

const manifest = JSON.parse(
  fs.readFileSync(
    new URL("../../src/data/cookbook-manifest.json", import.meta.url),
    "utf8",
  ),
);

test("maps every legacy cookbook anchor exactly once", () => {
  const groupedAnchors = legacyCookbookRedirectGroups.flatMap(
    ({ anchors }) => anchors,
  );

  assert.equal(groupedAnchors.length, 149);
  assert.equal(new Set(groupedAnchors).size, groupedAnchors.length);
  assert.equal(Object.keys(legacyCookbookRedirects).length, groupedAnchors.length);
});

test("points every legacy anchor at an existing recipe or cookbook section", () => {
  const recipePaths = new Set(
    manifest.flatMap(({ recipes }) => recipes.map(({ href }) => href)),
  );
  const sectionPaths = new Set(
    manifest.map(({ id }) => `${COOKBOOK_PATH}#${id}`),
  );

  for (const [anchor, target] of Object.entries(legacyCookbookRedirects)) {
    assert.ok(
      target === COOKBOOK_PATH ||
        recipePaths.has(target) ||
        sectionPaths.has(target),
      `${anchor} points to missing destination ${target}`,
    );
  }
});

test("routes representative external bookmarks to their closest recipes", () => {
  assert.equal(
    getLegacyCookbookTarget("#signing-objects"),
    `${COOKBOOK_PATH}/accounts/sign-verify-transaction`,
  );
  assert.equal(
    getLegacyCookbookTarget("#relayed-transactions"),
    `${COOKBOOK_PATH}/accounts/relayed-v3-transaction`,
  );
  assert.equal(
    getLegacyCookbookTarget("#smart-contracts"),
    `${COOKBOOK_PATH}#smart-contracts-call`,
  );
  assert.equal(
    getLegacyCookbookTarget("#fetching-data-from-the-network"),
    `${COOKBOOK_PATH}/fetching-data-from-network/reference`,
  );
  assert.equal(
    getLegacyCookbookTarget("#wallets"),
    `${COOKBOOK_PATH}#wallets`,
  );
  assert.equal(
    getLegacyCookbookTarget(
      "#deploying-a-multisig-smart-contract-using-the-controller",
    ),
    `${COOKBOOK_PATH}/multisig/deploy-multisig-contract`,
  );
  assert.equal(
    getLegacyCookbookTarget(
      "#saving-a-key-value-pair-to-an-account-using-the-factory",
    ),
    `${COOKBOOK_PATH}/accounts/save-key-value`,
  );
});

test("falls back safely for empty, unknown, or malformed fragments", () => {
  assert.equal(getLegacyCookbookTarget(), COOKBOOK_PATH);
  assert.equal(getLegacyCookbookTarget("#unknown-anchor"), COOKBOOK_PATH);
  assert.equal(getLegacyCookbookTarget("#%E0%A4%A"), COOKBOOK_PATH);
});
