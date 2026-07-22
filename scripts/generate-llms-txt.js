#!/usr/bin/env node
/*
  generate-llms-txt.js

  Scans the Docusaurus sidebar and docs to produce a categorized llms.txt
  in a human-friendly format similar to llmstxt.org examples: a header
  with site title and description, followed by sections (## Category)
  and bullet links "- [Title](URL): Description". The output is written
  to static/llms.txt so it is served at /llms.txt.

  Usage: node scripts/generate-llms-txt.js
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const STATIC_DIR = path.join(ROOT, 'static');
const OUTPUT_FILE = path.join(STATIC_DIR, 'llms.txt');
const OUTPUT_FULL_FILE = path.join(STATIC_DIR, 'llms-full.txt');

function safeRequire(p) {
  try {
    return require(p);
  } catch (e) {
    return null;
  }
}

// Read site meta from docusaurus.config.js (best effort)
async function getSiteMeta() {
  const configPath = path.join(ROOT, 'docusaurus.config.js');
  try {
    const content = await fsp.readFile(configPath, 'utf8');
    const titleMatch = content.match(/\btitle:\s*["']([^"']+)["']/);
    const taglineMatch = content.match(/\btagline:\s*\n\s*["']([\s\S]*?)["'],/);
    const urlMatch = content.match(/\burl:\s*["']([^"']+)["']/);
    const baseMatch = content.match(/\bbaseUrl:\s*["']([^"']+)["']/);
    const url = urlMatch ? urlMatch[1] : '';
    const base = baseMatch ? baseMatch[1] : '/';
    const baseNorm = base.startsWith('/') ? base : `/${base}`;
    const siteUrl = url ? `${url.replace(/\/$/, '')}${baseNorm}`.replace(/\/$/, '') : '';
    return {
      siteUrl,
      title: (titleMatch ? titleMatch[1] : 'Documentation').trim(),
      tagline: (taglineMatch ? taglineMatch[1] : '').trim(),
    };
  } catch {
    return { siteUrl: '', title: 'Documentation', tagline: '' };
  }
}

function readFrontmatterSlug(mdContent) {
  // Extract slug from YAML frontmatter if present
  // Very light parser: only first frontmatter block
  if (!mdContent.startsWith('---')) return null;
  const end = mdContent.indexOf('\n---', 3);
  if (end === -1) return null;
  const block = mdContent.slice(3, end);
  const m = block.match(/^\s*slug:\s*(["']?)(.+?)\1\s*$/m);
  return m ? m[2].trim() : null;
}

async function resolveDocPath(docId) {
  // 1) Direct mapping
  const directMd = path.join(DOCS_DIR, `${docId}.md`);
  const directMdx = path.join(DOCS_DIR, `${docId}.mdx`);
  if (fs.existsSync(directMd)) return directMd;
  if (fs.existsSync(directMdx)) return directMdx;

  // 2) Try kebab-casing the last segment (spaces -> '-')
  const dir = path.join(DOCS_DIR, path.dirname(docId));
  const base = path.basename(docId);
  const kebab = base.replace(/\s+/g, '-');
  const kebabMd = path.join(dir, `${kebab}.md`);
  const kebabMdx = path.join(dir, `${kebab}.mdx`);
  if (fs.existsSync(kebabMd)) return kebabMd;
  if (fs.existsSync(kebabMdx)) return kebabMdx;

  // 3) Scan directory for file whose frontmatter id matches the base
  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile()) continue;
      if (!/\.(md|mdx)$/i.test(e.name)) continue;
      const full = path.join(dir, e.name);
      try {
        const content = await fsp.readFile(full, 'utf8');
        if (content.startsWith('---')) {
          const end = content.indexOf('\n---', 3);
          if (end !== -1) {
            const block = content.slice(3, end);
            const idm = block.match(/^\s*id:\s*(["']?)(.+?)\1\s*$/m);
            const fid = idm ? idm[2].trim() : null;
            if (fid && fid === base) {
              return full;
            }
          }
        }
      } catch {}
    }
  } catch {}

  return null;
}

async function computeUrlForDoc(docId, siteUrl) {
  // Try to resolve the actual file path
  const filePath = await resolveDocPath(docId);
  let defaultPath = `/${docId}`;
  if (filePath) {
    const rel = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
    defaultPath = `/${rel.replace(/\.(md|mdx)$/i, '')}`;
  }
  // If file has slug starting with "/", prefer that
  if (filePath) {
    try {
      const content = await fsp.readFile(filePath, 'utf8');
      const slug = readFrontmatterSlug(content);
      if (slug && slug.startsWith('/')) {
        return siteUrl ? `${siteUrl}${slug}` : slug;
      }
    } catch {}
  }
  return siteUrl ? `${siteUrl}${defaultPath}` : defaultPath;
}

function isString(x) {
  return typeof x === 'string' || x instanceof String;
}

function collectDocIdsFromItems(items, acc) {
  if (!items) return;
  for (const it of items) {
    if (isString(it)) {
      acc.add(String(it));
      continue;
    }
    if (it && typeof it === 'object') {
      if (it.type === 'category') {
        // Include linked doc for category, if present
        if (it.link && it.link.type === 'doc' && it.link.id) {
          acc.add(String(it.link.id));
        }
        collectDocIdsFromItems(it.items, acc);
      } else if (it.type === 'doc' && it.id) {
        acc.add(String(it.id));
      } else if (it.id) {
        acc.add(String(it.id));
      }
    }
  }
}

function titleCaseFromSlug(slug) {
  const name = slug.replace(/^.*\//, '').replace(/[-_]+/g, ' ').trim();
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

const SPECIAL_TITLE_SEGMENTS = new Map([
  ['rest-api', 'Rest API'],
  ['sdk-and-tools', 'SDK and Tools'],
]);

function humanizeSegmentForTitle(seg) {
  const s = seg.trim();
  if (SPECIAL_TITLE_SEGMENTS.has(s)) return SPECIAL_TITLE_SEGMENTS.get(s);
  return s
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function humanizeSegmentForDescription(seg) {
  const t = humanizeSegmentForTitle(seg);
  return t.toLowerCase();
}

//

function parseFrontmatter(mdContent) {
  const meta = {};
  if (!mdContent.startsWith('---')) return meta;
  const end = mdContent.indexOf('\n---', 3);
  if (end === -1) return meta;
  const block = mdContent.slice(3, end);
  const pairs = {
    id: block.match(/^\s*id:\s*(["']?)(.+?)\1\s*$/m),
    title: block.match(/^\s*title:\s*(["']?)(.+?)\1\s*$/m),
    slug: block.match(/^\s*slug:\s*(["']?)(.+?)\1\s*$/m),
    description: block.match(/^\s*description:\s*(["']?)([\s\S]*?)\1\s*$/m),
    // Cookbook recipe frontmatter — surfaced in the agent-ingestible llms.txt
    // so a coding agent can distinguish standalone projects from references.
    difficulty: block.match(/^\s*difficulty:\s*(["']?)(.+?)\1\s*$/m),
    artifact: block.match(/^\s*artifact:\s*(["']?)(.+?)\1\s*$/m),
  };
  if (pairs.id) meta.id = pairs.id[2].trim();
  if (pairs.title) meta.title = pairs.title[2].trim();
  if (pairs.slug) meta.slug = pairs.slug[2].trim();
  if (pairs.description) meta.description = pairs.description[2].trim();
  if (pairs.difficulty) meta.difficulty = pairs.difficulty[2].trim();
  if (pairs.artifact) meta.artifact = pairs.artifact[2].trim();
  meta._fmEnd = end + '\n---'.length;
  return meta;
}

function extractFirstParagraph(mdContent) {
  // Remove frontmatter
  let content = mdContent;
  if (mdContent.startsWith('---')) {
    const end = mdContent.indexOf('\n---', 3);
    if (end !== -1) content = mdContent.slice(end + 4);
  }
  const lines = content.split(/\r?\n/);
  // Simple state to skip admonitions blocks :::
  let inAdmonition = false;
  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    if (!line) continue;
    if (line.startsWith('[comment]:')) continue;
    if (line.startsWith(':::')) {
      inAdmonition = !inAdmonition; // toggle on start and end
      continue;
    }
    if (inAdmonition) continue;
    if (line.startsWith('#')) continue; // skip headings
    if (line.startsWith('<')) continue; // skip raw html blocks
    // collapse markdown links to text
    line = line.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
    // remove inline code markers
    line = line.replace(/`([^`]+)`/g, '$1');
    // compact whitespace
    line = line.replace(/\s+/g, ' ').trim();
    if (line) return line;
  }
  return '';
}

function stripFrontmatter(mdContent) {
  if (mdContent.startsWith('---')) {
    const end = mdContent.indexOf('\n---', 3);
    if (end !== -1) {
      return mdContent.slice(end + 4);
    }
  }
  return mdContent;
}

function trimLeadingTitle(mdContent, title) {
  const lines = mdContent.split(/\r?\n/);
  if (lines.length === 0) return mdContent;
  const first = lines[0].trim();
  const m = first.match(/^#+\s*(.+)$/);
  if (m) {
    const text = (m[1] || '').trim();
    if (text.toLowerCase() === (title || '').trim().toLowerCase()) {
      // remove heading and following optional blank line
      let idx = 1;
      if (lines[idx] !== undefined && lines[idx].trim() === '') idx++;
      return lines.slice(idx).join('\n');
    }
  }
  return mdContent;
}

function removeInternalComments(mdContent) {
  // Remove single-line Docusaurus comment markers like:
  // [comment]: # (mx-abstract)
  // [comment]: # (mx-context-auto)
  return mdContent
    .split(/\r?\n/)
    .filter((line) => !/^\s*\[comment\]:\s*#\s*\(/.test(line.trim()))
    .join('\n');
}

async function getDocMeta(docId) {
  const filePath = await resolveDocPath(docId);
  let meta = {
    id: docId,
    title: titleCaseFromSlug(docId),
    description: '',
    filePath: null,
    source: 'none',
  };
  if (!filePath) return meta;
  try {
    const content = await fsp.readFile(filePath, 'utf8');
    const fm = parseFrontmatter(content);
    let title = fm.title || meta.title;
    const fromFm = !!fm.description;
    const description = fm.description || extractFirstParagraph(content);
    // Contextualize short/generic titles using parent segments when helpful
    const rel = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '');
    const parts = rel.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const parent = parts[parts.length - 2];
      const last = parts[parts.length - 1];
      const humanLast = humanizeSegmentForTitle(last);
      const CONTEXT_PARENTS = new Set(['rest-api']);
      if (CONTEXT_PARENTS.has(parent) && title.trim() === humanLast) {
        title = `${humanizeSegmentForTitle(parent)} ${title}`;
      }
    }
    meta = { ...meta, title, description, filePath, source: fromFm ? 'frontmatter' : (description ? 'content' : 'none'), difficulty: fm.difficulty, artifact: fm.artifact };
  } catch {
    // ignore
  }
  return meta;
}

function isPoorDescription(desc) {
  if (!desc) return true;
  const d = desc.trim();
  if (!d) return true;
  if (d.startsWith('```')) return true;
  if (/mdx-code-block/i.test(d)) return true;
  if (/^:::/m.test(d)) return true;
  if (/please\s+take\s+note/i.test(d)) return true;
  // Very short and generic
  if (d.length < 20) return true;
  return false;
}

function brandFromTitle(siteTitle) {
  if (!siteTitle) return 'MultiversX';
  // Remove trailing words like 'Docs', 'Documentation'
  return siteTitle.replace(/\s+(Docs|Documentation)$/i, '').trim();
}

//

function generatedDescriptionFromPath(idOrPath, filePath, brand) {
  const ref = filePath
    ? path.relative(DOCS_DIR, filePath).replace(/\\/g, '/').replace(/\.(md|mdx)$/i, '')
    : idOrPath;
  let parts = ref.split('/').filter(Boolean);
  parts = parts.filter((p) => p !== 'index');
  if (parts.length >= 2 && parts[parts.length - 1].toLowerCase() === 'overview') {
    parts = parts.slice(0, -1);
  }
  if (parts.length === 0) return `Learn more about ${brand} documentation`;
  const phrase = parts.map(humanizeSegmentForDescription).join(' ');
  return `Learn more about ${brand} ${phrase}`.trim();
}

async function main() {
  const site = await getSiteMeta();
  const siteUrl = site.siteUrl;
  const brand = brandFromTitle(site.title || 'MultiversX');
  const sidebars = safeRequire(path.join(ROOT, 'sidebars.js'));
  if (!sidebars || !sidebars.docs) {
    console.error('Could not load sidebars.js or missing "docs" sidebar.');
    process.exit(1);
  }

  // In this repository, sidebars.docs is an object of top-level category labels -> items[]
  const categories = sidebars.docs;
  const outputLines = [];
  const fullLines = [];

  // Header with site title and tagline
  const headerTitle = site.title || 'Documentation';
  outputLines.push(`# ${headerTitle}`);
  if (site.tagline) outputLines.push('', `> ${site.tagline}`);
  outputLines.push(
    'MultiversX is a highly scalable, fast and secure blockchain platform. This documentation covers architecture, smart contracts, SDKs, APIs, wallets, validators, and the broader ecosystem.'
  );
  outputLines.push(
    'This documentation is organized into major sections. Each section includes tutorials, examples, and detailed technical references.'
  );
  outputLines.push('');

  // Header for full file
  fullLines.push(`# ${headerTitle}`);
  if (site.tagline) fullLines.push('', `> ${site.tagline}`);
  fullLines.push(
    'This file contains the full content of documentation pages, grouped by category, for AI consumption.'
  );
  fullLines.push('');

  for (const [categoryLabel, items] of Object.entries(categories)) {
    const ids = new Set();
    collectDocIdsFromItems(items, ids);
    if (ids.size === 0) continue;

    outputLines.push(`## ${categoryLabel}`);
    fullLines.push(`## ${categoryLabel}`);
    // Build entries with title + description + url
    const all = [];
    for (const id of Array.from(ids)) {
      // eslint-disable-next-line no-await-in-loop
      const meta = await getDocMeta(id);
      // eslint-disable-next-line no-await-in-loop
      const url = await computeUrlForDoc(id, siteUrl);
      all.push({ id, title: meta.title, description: meta.description, url, source: meta.source, filePath: meta.filePath, difficulty: meta.difficulty, artifact: meta.artifact });
    }
    all.sort((a, b) => a.title.localeCompare(b.title));
    for (const e of all) {
      let desc = (e.description || '').replace(/\s+/g, ' ').trim();
      if (e.source !== 'frontmatter' && isPoorDescription(desc)) {
        desc = generatedDescriptionFromPath(e.id, e.filePath, brand);
      }
      const clipped = desc.length > 400 ? `${desc.slice(0, 397)}...` : desc;
      // Cookbook pages append a compact, machine-parseable metadata tag so the
      // agent surface carries difficulty + artifact type. Only pages that
      // declare `difficulty` frontmatter are affected.
      let recipeTag = '';
      if (e.difficulty) {
        const bits = [e.difficulty];
        if (e.artifact === 'project') bits.push('build checked');
        if (e.artifact === 'reference') bits.push('reference');
        recipeTag = ` [${bits.join(', ')}]`;
      }
      outputLines.push(`- [${e.title}](${e.url})${clipped ? `: ${clipped}` : ''}${recipeTag}`);

      // Build full content entry
      if (e.filePath) {
        try {
          const raw = await fsp.readFile(e.filePath, 'utf8');
          let body = stripFrontmatter(raw);
          body = trimLeadingTitle(body, e.title);
          body = removeInternalComments(body);
          fullLines.push(`### ${e.title}`);
          fullLines.push('');
          const cleaned = body.trim();
          if (cleaned) fullLines.push(cleaned);
          // Add a consistent separator between pages
          fullLines.push('');
          fullLines.push('---');
          fullLines.push('');
        } catch {}
      }
    }
    outputLines.push('');
  }

  // Ensure static directory exists
  await fsp.mkdir(STATIC_DIR, { recursive: true });
  await fsp.writeFile(OUTPUT_FILE, outputLines.join('\n'), 'utf8');
  console.log(`Wrote ${OUTPUT_FILE}`);

  await fsp.writeFile(OUTPUT_FULL_FILE, fullLines.join('\n'), 'utf8');
  console.log(`Wrote ${OUTPUT_FULL_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
