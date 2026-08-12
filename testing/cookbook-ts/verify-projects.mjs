#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const EXPECTED_PROJECTS = 61;
const EXPECTED_REFERENCES = 11;
const REQUIRED_NODE_RANGE = '>=20.19.0';
const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const extractedRoot = path.join(scriptDirectory, 'project', 'src', 'recipes');
const cookbookRoot = path.resolve(scriptDirectory, '../../docs/sdk-and-tools/sdk-js/cookbook');
const requiredSecurityOverrides = {
  postcss: '^8.5.18',
  'brace-expansion': '^5.0.9',
  nanoid: '^3.3.17',
};

function fail(message) {
  throw new Error(message);
}

function isExactVersion(version) {
  return /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version);
}

function dependencySignature(manifest) {
  const sorted = (dependencies = {}) =>
    Object.fromEntries(
      Object.entries(dependencies).sort(([left], [right]) => left.localeCompare(right)),
    );

  return JSON.stringify({
    dependencies: sorted(manifest.dependencies),
    devDependencies: sorted(manifest.devDependencies),
    overrides: sorted(manifest.overrides),
  });
}

function requireDirectDependencies(slug, manifest, dependencies) {
  const declared = manifest.dependencies ?? {};
  for (const dependency of dependencies) {
    if (!declared[dependency]) {
      fail(`${slug}: dependencies.${dependency} must be declared directly`);
    }
  }
}

function run(command, args, options = {}) {
  const rendered = [command, ...args].join(' ');
  console.log(`\n$ ${rendered}`);
  const result = spawnSync(command, args, {
    ...options,
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID: 'ci-build-verification',
      VITE_WALLETCONNECT_PROJECT_ID: 'ci-build-verification',
    },
    stdio: 'inherit',
  });
  if (result.error) throw result.error;
  if (result.status !== 0) fail(`${rendered} exited with status ${result.status}`);
}

if (!fs.existsSync(extractedRoot)) {
  fail(`Missing extracted recipes at ${extractedRoot}; run npm run extract first.`);
}

function walkMdx(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory()
      ? walkMdx(target)
      : target.endsWith('.mdx')
        ? [target]
        : [];
  });
}

const artifactCounts = { project: 0, reference: 0 };
for (const file of walkMdx(cookbookRoot)) {
  const source = fs.readFileSync(file, 'utf8');
  const match = source.match(/^artifact:\s*(project|reference)\s*$/m);
  if (!match) continue; // Cookbook index and agent on-ramp are not recipes.
  const declared = match[1];
  const derived = /```json\s+title=["']package\.json["']/.test(source)
    ? 'project'
    : 'reference';
  if (declared !== derived) {
    fail(`${path.relative(cookbookRoot, file)}: artifact=${declared}, derived ${derived}`);
  }
  artifactCounts[declared] += 1;
}
if (
  artifactCounts.project !== EXPECTED_PROJECTS ||
  artifactCounts.reference !== EXPECTED_REFERENCES
) {
  fail(
    `Expected ${EXPECTED_PROJECTS} project and ${EXPECTED_REFERENCES} reference pages; ` +
      `found ${artifactCounts.project} and ${artifactCounts.reference}.`,
  );
}

const recipes = [];
for (const slug of fs.readdirSync(extractedRoot).sort()) {
  const sourceDirectory = path.join(extractedRoot, slug);
  const packagePath = path.join(sourceDirectory, 'package.json');
  if (!fs.existsSync(packagePath)) continue;

  const manifest = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  if (!manifest.name) fail(`${slug}: package.json has no name`);
  if (manifest.engines?.node !== REQUIRED_NODE_RANGE) {
    fail(`${slug}: engines.node must be ${REQUIRED_NODE_RANGE}`);
  }
  if (!manifest.scripts?.build) fail(`${slug}: package.json has no build script`);
  if (!fs.existsSync(path.join(sourceDirectory, 'tsconfig.json'))) {
    fail(`${slug}: missing tsconfig.json`);
  }

  const entrypoints = ['src/index.ts', 'src/main.tsx', 'app/page.tsx'];
  if (!entrypoints.some((entrypoint) => fs.existsSync(path.join(sourceDirectory, entrypoint)))) {
    fail(`${slug}: no runnable entrypoint (${entrypoints.join(', ')})`);
  }

  for (const dependencyGroup of ['dependencies', 'devDependencies']) {
    for (const [dependency, version] of Object.entries(manifest[dependencyGroup] ?? {})) {
      if (!isExactVersion(version)) {
        fail(`${slug}: ${dependencyGroup}.${dependency} must use an exact version, got ${version}`);
      }
    }
  }

  if (manifest.dependencies?.['@multiversx/sdk-core']) {
    requireDirectDependencies(slug, manifest, ['bignumber.js', 'protobufjs']);
  }
  if (manifest.dependencies?.['@multiversx/sdk-dapp']) {
    requireDirectDependencies(slug, manifest, [
      '@multiversx/sdk-core',
      '@multiversx/sdk-dapp-ui',
      '@multiversx/sdk-dapp-utils',
      'axios',
      'bignumber.js',
      'protobufjs',
      'react',
      'react-dom',
    ]);
  }

  const needsSecurityOverrides =
    manifest.dependencies?.['@multiversx/sdk-dapp'] ||
    manifest.dependencies?.next ||
    manifest.devDependencies?.vite;
  const overrides = manifest.overrides ?? {};
  if (
    needsSecurityOverrides &&
    (
      overrides.postcss !== requiredSecurityOverrides.postcss ||
      overrides['brace-expansion'] !== requiredSecurityOverrides['brace-expansion'] ||
      overrides.nanoid !== requiredSecurityOverrides.nanoid ||
      Object.keys(overrides).length !== Object.keys(requiredSecurityOverrides).length
    )
  ) {
    fail(
      `${slug}: overrides must pin patched postcss, brace-expansion, and nanoid transitives`,
    );
  }
  recipes.push({ slug, sourceDirectory, manifest });
}

if (recipes.length !== EXPECTED_PROJECTS) {
  fail(`Expected ${EXPECTED_PROJECTS} runnable cookbook projects, found ${recipes.length}.`);
}

const names = new Set();
for (const recipe of recipes) {
  if (names.has(recipe.manifest.name)) fail(`Duplicate package name: ${recipe.manifest.name}`);
  names.add(recipe.manifest.name);
}

const environments = new Map();
for (const recipe of recipes) {
  const signature = dependencySignature(recipe.manifest);
  const environment = environments.get(signature) ?? [];
  environment.push(recipe);
  environments.set(signature, environment);
}

const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'cookbook-projects-'));

let succeeded = false;
try {
  console.log(
    `Validated ${recipes.length} project and ${artifactCounts.reference} reference labels; ` +
      `installing ${environments.size} isolated dependency environments at ${temporaryRoot}`,
  );

  let environmentIndex = 0;
  for (const group of environments.values()) {
    environmentIndex += 1;
    const environmentRoot = path.join(
      temporaryRoot,
      `${String(environmentIndex).padStart(2, '0')}-${group[0].slug}`,
    );
    const projectsRoot = path.join(environmentRoot, 'projects');
    fs.mkdirSync(projectsRoot, { recursive: true });

    for (const recipe of group) {
      fs.cpSync(recipe.sourceDirectory, path.join(projectsRoot, recipe.slug), {
        recursive: true,
        dereference: false,
      });
    }

    fs.writeFileSync(
      path.join(environmentRoot, 'package.json'),
      `${JSON.stringify({
        name: `cookbook-project-verification-${environmentIndex}`,
        private: true,
        version: '0.0.0',
        engines: { node: REQUIRED_NODE_RANGE },
        dependencies: group[0].manifest.dependencies ?? {},
        devDependencies: group[0].manifest.devDependencies ?? {},
        overrides: group[0].manifest.overrides ?? {},
      }, null, 2)}\n`,
    );

    console.log(
      `\n=== Environment ${environmentIndex}/${environments.size}: ` +
        `${group.length} project${group.length === 1 ? '' : 's'} ===`,
    );
    // Lifecycle scripts stay disabled because this runs untrusted pull-request
    // dependencies in CI. That safety choice means the matrix does not fully
    // reproduce a reader's ordinary `npm install`; builds and the explicit
    // audit below cover the resulting dependency tree without running package
    // install hooks.
    run('npm', [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
    ], { cwd: environmentRoot });
    run(process.execPath, [
      path.join(scriptDirectory, 'audit-project.mjs'),
      '--directory',
      environmentRoot,
    ], { cwd: scriptDirectory });

    for (const { slug, manifest } of group) {
      const projectRoot = path.join(projectsRoot, slug);
      console.log(`\n=== Building ${slug} (${manifest.scripts.build}) ===`);
      run('npm', ['run', 'build'], { cwd: projectRoot });
    }
  }
  succeeded = true;
  console.log(
    `\nBuilt all ${recipes.length} cookbook projects across ` +
      `${environments.size} isolated dependency environments.`,
  );
} finally {
  if (succeeded || process.env.COOKBOOK_KEEP_TEMP !== '1') {
    fs.rmSync(temporaryRoot, { recursive: true, force: true });
  } else {
    console.error(`Preserved failed environments: ${temporaryRoot}`);
  }
}
