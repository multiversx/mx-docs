#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.join(scriptDirectory, 'project');
const blockedSeverities = new Set(['high', 'critical']);

// sharp is an optional Next image-optimizer dependency, and no recipe imports
// next/image. Revisit this exception when Next adopts sharp 0.35.
const allowedAdvisories = new Map([
  ['GHSA-F88M-G3JW-G9CJ', 'sharp'],
]);

function fail(message) {
  console.error(`Cookbook audit gate failed: ${message}`);
  process.exitCode = 1;
}

function extractAdvisoryId(advisory) {
  const match = advisory.url?.match(/GHSA-[0-9A-Z]{4}-[0-9A-Z]{4}-[0-9A-Z]{4}/i);
  return match?.[0].toUpperCase();
}

function terminalHighAdvisories(packageName, vulnerabilities, seen = new Set()) {
  if (seen.has(packageName)) return [];
  const vulnerability = vulnerabilities[packageName];
  if (!vulnerability) return [];

  const nextSeen = new Set(seen);
  nextSeen.add(packageName);
  const advisories = [];

  for (const via of vulnerability.via ?? []) {
    if (typeof via === 'string') {
      advisories.push(...terminalHighAdvisories(via, vulnerabilities, nextSeen));
    } else if (blockedSeverities.has(via.severity)) {
      advisories.push({
        id: extractAdvisoryId(via),
        packageName: via.name ?? packageName,
        title: via.title ?? 'untitled advisory',
      });
    }
  }

  return advisories;
}

function loadAuditReport() {
  if (process.argv.includes('--stdin')) {
    return fs.readFileSync(0, 'utf8');
  }

  const result = spawnSync(
    'npm',
    ['audit', '--package-lock-only', '--json'],
    {
      cwd: projectDirectory,
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    },
  );
  if (result.error) throw result.error;
  if (!result.stdout.trim()) {
    throw new Error(`npm audit returned no JSON: ${result.stderr.trim()}`);
  }
  return result.stdout;
}

let report;
try {
  report = JSON.parse(loadAuditReport());
} catch (error) {
  fail(error instanceof Error ? error.message : String(error));
}

if (!process.exitCode) {
  const vulnerabilities = report.vulnerabilities;
  const totals = report.metadata?.vulnerabilities;
  if (!vulnerabilities || !totals) {
    fail(`unexpected npm audit response: ${JSON.stringify(report.error ?? report)}`);
  } else {
    console.log(
      `Audit totals: ${totals.total} vulnerable package(s) ` +
        `(${totals.info} info, ${totals.low} low, ${totals.moderate} moderate, ` +
        `${totals.high} high, ${totals.critical} critical).`,
    );

    const blockedPackages = Object.entries(vulnerabilities)
      .filter(([, vulnerability]) => blockedSeverities.has(vulnerability.severity));
    const rejected = [];
    const allowed = new Map();

    for (const [packageName] of blockedPackages) {
      const advisories = terminalHighAdvisories(packageName, vulnerabilities);
      if (advisories.length === 0) {
        rejected.push(`${packageName}: high/critical cause could not be identified`);
        continue;
      }

      for (const advisory of advisories) {
        const allowedPackage = advisory.id && allowedAdvisories.get(advisory.id);
        if (allowedPackage === advisory.packageName) {
          allowed.set(advisory.id, advisory.packageName);
        } else {
          rejected.push(
            `${packageName}: ${advisory.id ?? 'unknown advisory'} ` +
              `(${advisory.packageName}: ${advisory.title})`,
          );
        }
      }
    }

    for (const [id, packageName] of allowed) {
      console.log(`Allowed known advisory: ${id} (${packageName}).`);
    }

    if (rejected.length > 0) {
      fail(`unallowlisted high/critical finding(s):\n- ${[...new Set(rejected)].join('\n- ')}`);
    } else {
      console.log('Cookbook audit gate passed: no new high/critical advisories.');
    }
  }
}
