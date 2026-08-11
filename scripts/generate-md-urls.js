#!/usr/bin/env node
/*
  generate-md-urls.js

  For each documentation page, generates a clean Markdown file at the
  URL-matching path under static/. This lets users (and LLMs) append
  .md to any docs URL to get raw Markdown.

  Example:
    docs.multiversx.com/developers/overview
    → docs.multiversx.com/developers/overview.md  (raw Markdown)

  The files are placed in static/ so Docusaurus copies them as-is to
  the build output. MDX-specific syntax (imports, JSX components,
  Docusaurus comments) is stripped to produce clean, LLM-friendly
  Markdown.

  Usage: node scripts/generate-md-urls.js
*/

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOCS_DIR = path.join(ROOT, 'docs');
const STATIC_DIR = path.join(ROOT, 'static');
const COOKBOOK_ROUTE = '/sdk-and-tools/sdk-js/cookbook';
const COOKBOOK_MANIFEST = path.join(
  ROOT,
  'src',
  'data',
  'cookbook-manifest.json'
);

// ---------------------------------------------------------------------------
// Sidebar parsing
// ---------------------------------------------------------------------------

function safeRequire(p) {
  try {
    return require(p);
  } catch {
    return null;
  }
}

function collectDocIdsFromItems(items, acc) {
  if (!items) return;
  for (const it of items) {
    if (typeof it === 'string' || it instanceof String) {
      acc.add(String(it));
      continue;
    }
    if (it && typeof it === 'object') {
      if (it.type === 'category') {
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

// ---------------------------------------------------------------------------
// File resolution  (mirrors generate-llms-txt.js logic)
// ---------------------------------------------------------------------------

async function resolveDocPath(docId) {
  const directMd = path.join(DOCS_DIR, `${docId}.md`);
  const directMdx = path.join(DOCS_DIR, `${docId}.mdx`);
  if (fs.existsSync(directMd)) return directMd;
  if (fs.existsSync(directMdx)) return directMdx;

  const dir = path.join(DOCS_DIR, path.dirname(docId));
  const base = path.basename(docId);
  const kebab = base.replace(/\s+/g, '-');
  const kebabMd = path.join(dir, `${kebab}.md`);
  const kebabMdx = path.join(dir, `${kebab}.mdx`);
  if (fs.existsSync(kebabMd)) return kebabMd;
  if (fs.existsSync(kebabMdx)) return kebabMdx;

  try {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      if (!e.isFile() || !/\.(md|mdx)$/i.test(e.name)) continue;
      const full = path.join(dir, e.name);
      try {
        const content = await fsp.readFile(full, 'utf8');
        if (content.startsWith('---')) {
          const end = content.indexOf('\n---', 3);
          if (end !== -1) {
            const block = content.slice(3, end);
            const idm = block.match(/^\s*id:\s*(["']?)(.+?)\1\s*$/m);
            if (idm && idm[2].trim() === base) return full;
          }
        }
      } catch {}
    }
  } catch {}

  return null;
}

// ---------------------------------------------------------------------------
// Frontmatter helpers
// ---------------------------------------------------------------------------

function parseFrontmatter(mdContent) {
  const meta = {};
  if (!mdContent.startsWith('---')) return meta;
  const end = mdContent.indexOf('\n---', 3);
  if (end === -1) return meta;
  const block = mdContent.slice(3, end);
  const pairs = {
    title: block.match(/^\s*title:\s*(["']?)(.+?)\1\s*$/m),
    slug: block.match(/^\s*slug:\s*(["']?)(.+?)\1\s*$/m),
    description: block.match(/^\s*description:\s*(["']?)([\s\S]*?)\1\s*$/m),
  };
  if (pairs.title) meta.title = pairs.title[2].trim();
  if (pairs.slug) meta.slug = pairs.slug[2].trim();
  if (pairs.description) meta.description = pairs.description[2].trim();
  meta._fmEnd = end + '\n---'.length;
  return meta;
}

// ---------------------------------------------------------------------------
// URL path computation (without site URL prefix)
// ---------------------------------------------------------------------------

async function computeUrlPath(docId) {
  const filePath = await resolveDocPath(docId);
  let defaultPath = `/${docId}`;

  if (filePath) {
    const rel = path.relative(DOCS_DIR, filePath).replace(/\\/g, '/');
    defaultPath = `/${rel.replace(/\.(md|mdx)$/i, '')}`;

    try {
      const content = await fsp.readFile(filePath, 'utf8');
      const fm = parseFrontmatter(content);
      if (fm.slug && fm.slug.startsWith('/')) return fm.slug;
    } catch {}
  }

  return defaultPath;
}

// ---------------------------------------------------------------------------
// MDX → clean Markdown
// ---------------------------------------------------------------------------

function renderCookbookIndex() {
  const sections = JSON.parse(fs.readFileSync(COOKBOOK_MANIFEST, 'utf8'));

  return sections
    .map((section) => {
      const recipes = section.recipes.map((recipe) => {
        const description = (recipe.description || '').replace(/\s+/g, ' ').trim();
        return `- [${recipe.title}](${recipe.href}.md)${description ? `: ${description}` : ''}`;
      });
      return [`## ${section.label}`, '', ...recipes].join('\n');
    })
    .join('\n\n');
}

function splitLinkTarget(target) {
  const suffixAt = target.search(/[?#]/);
  return suffixAt === -1
    ? { pathname: target, suffix: '' }
    : { pathname: target.slice(0, suffixAt), suffix: target.slice(suffixAt) };
}

function normalizeRoute(route) {
  if (route.length > 1) return route.replace(/\/$/, '');
  return route;
}

function findSourceRoute(targetPath, sourcePath, routeBySource) {
  const resolved = path.resolve(path.dirname(sourcePath), targetPath);
  const candidates = [resolved];

  if (!/\.(md|mdx)$/i.test(resolved)) {
    candidates.push(
      `${resolved}.md`,
      `${resolved}.mdx`,
      path.join(resolved, 'index.md'),
      path.join(resolved, 'index.mdx')
    );
  }

  for (const candidate of candidates) {
    const route = routeBySource.get(candidate);
    if (route) return route;
  }

  return null;
}

function rewriteInternalDocLinks(content, sourcePath, routeBySource, routeByUrl) {
  let fenceMarker = null;

  return content
    .split(/\r?\n/)
    .map((line) => {
      const fence = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        const marker = fence[1][0];
        if (!fenceMarker) fenceMarker = marker;
        else if (fenceMarker === marker) fenceMarker = null;
        return line;
      }
      if (fenceMarker) return line;

      return line.replace(/(\]\(\s*)([^\s)]+)([^)]*\))/g, (match, start, target, end) => {
        const wrapped = target.startsWith('<') && target.endsWith('>');
        const rawTarget = wrapped ? target.slice(1, -1) : target;
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(rawTarget)) return match;

        const { pathname: targetPath, suffix } = splitLinkTarget(rawTarget);
        let route = null;

        if (targetPath.startsWith('/')) {
          const routeTarget = normalizeRoute(
            targetPath.replace(/\.(md|mdx)$/i, '')
          );
          route = routeByUrl.get(routeTarget) || null;
        } else {
          route = findSourceRoute(targetPath, sourcePath, routeBySource);
        }

        if (!route) return match;
        const rewritten = `${route}.md${suffix}`;
        return `${start}${wrapped ? `<${rewritten}>` : rewritten}${end}`;
      });
    })
    .join('\n');
}

function cleanMdxContent(content, sourcePath, routeBySource, routeByUrl) {
  // Strip frontmatter — we'll prepend our own header
  if (content.startsWith('---')) {
    const end = content.indexOf('\n---', 3);
    if (end !== -1) content = content.slice(end + 4);
  }

  // Remove ```mdx-code-block ... ``` fenced blocks (usually wrapping imports)
  content = content.replace(/```mdx-code-block\n[\s\S]*?```\n?/g, '');

  // Remove standalone import statements
  content = content.replace(/^import\s+.+$/gm, '');

  // The website renders this data-driven component. Render the same manifest
  // as ordinary Markdown for the raw .md version of the cookbook index.
  content = content.replace(
    /^[ \t]*<CookbookIndex\s+sections=\{manifest\}\s*\/>[ \t]*$/gm,
    renderCookbookIndex
  );

  // Remove [comment]: # (...) lines
  content = content.replace(/^\[comment\]:\s*#\s*\(.*\)\s*$/gm, '');

  // Remove JSX wrapper components (Tabs, TabItem) but keep inner content.
  // Opening tags can span multiple lines: <Tabs\n  defaultValue=...\n  ...>
  content = content.replace(/<Tabs[\s\S]*?>/g, '');
  content = content.replace(/<\/Tabs>/g, '');
  content = content.replace(/<TabItem[\s\S]*?>/g, '');
  content = content.replace(/<\/TabItem>/g, '');

  // Remove other common Docusaurus JSX wrappers
  content = content.replace(/<details[\s\S]*?>/gi, '');
  content = content.replace(/<\/details>/gi, '');
  content = content.replace(/<summary[\s\S]*?>/gi, '');
  content = content.replace(/<\/summary>/gi, '');

  // Collapse 3+ consecutive blank lines into 2
  content = content.replace(/\n{3,}/g, '\n\n');

  content = rewriteInternalDocLinks(
    content,
    sourcePath,
    routeBySource,
    routeByUrl
  );

  return content.trim();
}

function validateCookbookMarkdown(generatedPaths, routeByUrl) {
  const errors = [];

  for (const generatedPath of generatedPaths) {
    if (
      generatedPath !== `${COOKBOOK_ROUTE}.md` &&
      !generatedPath.startsWith(`${COOKBOOK_ROUTE}/`)
    ) {
      continue;
    }

    const filePath = path.join(STATIC_DIR, generatedPath.replace(/^\//, ''));
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    let fenceMarker = null;

    for (let index = 0; index < lines.length; index++) {
      const line = lines[index];
      const fence = line.match(/^\s*(`{3,}|~{3,})/);
      if (fence) {
        const marker = fence[1][0];
        if (!fenceMarker) fenceMarker = marker;
        else if (fenceMarker === marker) fenceMarker = null;
        continue;
      }
      if (fenceMarker) continue;

      if (/^\s*<[A-Z][A-Za-z\d.]*(?:\s|\/?>)/.test(line)) {
        errors.push(`${generatedPath}:${index + 1}: unresolved MDX component`);
      }

      for (const match of line.matchAll(/\]\(\s*([^\s)]+)[^)]*\)/g)) {
        const target = match[1].replace(/^<|>$/g, '');
        if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)) continue;

        const { pathname: targetPath } = splitLinkTarget(target);
        if (/\.mdx$/i.test(targetPath)) {
          errors.push(`${generatedPath}:${index + 1}: unresolved link ${target}`);
          continue;
        }

        if (targetPath.startsWith('/')) {
          const routeTarget = normalizeRoute(
            targetPath.replace(/\.(md|mdx)$/i, '')
          );
          if (!/\.md$/i.test(targetPath) && routeByUrl.has(routeTarget)) {
            errors.push(`${generatedPath}:${index + 1}: HTML documentation link ${target}`);
            continue;
          }
        }

        if (!/\.md$/i.test(targetPath)) continue;
        const targetFile = targetPath.startsWith('/')
          ? path.join(STATIC_DIR, targetPath.replace(/^\//, ''))
          : path.resolve(path.dirname(filePath), targetPath);
        if (!fs.existsSync(targetFile)) {
          errors.push(`${generatedPath}:${index + 1}: missing link target ${target}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    throw new Error(`Generated cookbook Markdown validation failed:\n- ${errors.join('\n- ')}`);
  }

  console.log('generate-md-urls: cookbook Markdown links validated');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const sidebars = safeRequire(path.join(ROOT, 'sidebars.js'));
  if (!sidebars || !sidebars.docs) {
    console.error('Could not load sidebars.js or missing "docs" sidebar.');
    process.exit(1);
  }

  // Collect all doc IDs from every sidebar category
  const allIds = new Set();
  for (const items of Object.values(sidebars.docs)) {
    collectDocIdsFromItems(items, allIds);
  }

  let written = 0;
  let skipped = 0;
  const generatedPaths = [];
  const documents = [];
  const routeBySource = new Map();
  const routeByUrl = new Map();

  for (const docId of allIds) {
    const filePath = await resolveDocPath(docId);
    if (!filePath) {
      skipped++;
      continue;
    }

    const urlPath = await computeUrlPath(docId);
    documents.push({ docId, filePath, urlPath });
    routeBySource.set(path.resolve(filePath), urlPath);
    routeByUrl.set(normalizeRoute(urlPath), urlPath);
  }

  for (const { filePath, urlPath } of documents) {
    const rawContent = await fsp.readFile(filePath, 'utf8');
    const fm = parseFrontmatter(rawContent);
    const cleaned = cleanMdxContent(
      rawContent,
      filePath,
      routeBySource,
      routeByUrl
    );

    // Build a clean markdown file with a descriptive header
    const lines = [];
    if (fm.title) lines.push(`# ${fm.title}`);
    if (fm.description) lines.push('', `> ${fm.description}`);
    if (lines.length > 0) lines.push('');
    lines.push(cleaned);

    // Write to static/ at the URL-matching path
    const outPath = path.join(STATIC_DIR, `${urlPath}.md`);
    await fsp.mkdir(path.dirname(outPath), { recursive: true });
    await fsp.writeFile(outPath, lines.join('\n') + '\n', 'utf8');

    generatedPaths.push(`${urlPath}.md`);
    written++;
  }

  console.log(
    `generate-md-urls: wrote ${written} files, skipped ${skipped} (unresolved)`
  );
  validateCookbookMarkdown(generatedPaths, routeByUrl);

  return generatedPaths;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
