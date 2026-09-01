import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tracked = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8'
}).trim().split(/\r?\n/).filter(Boolean);
const htmlFiles = tracked.filter((file) => file.endsWith('.html'));
const markdownFiles = tracked.filter((file) => file.endsWith('.md'));
const temporary = await mkdtemp(path.join(tmpdir(), 'public-html-contract-'));
const failures = [];

const check = (condition, message) => {
  if (!condition) failures.push(message);
};
const existsAsFile = async (candidate) => (await stat(candidate).catch(() => null))?.isFile() === true;
const stripTarget = (raw) => decodeURIComponent(raw.trim().replace(/^<|>$/g, '').split(/[?#]/, 1)[0]);
const isExternal = (target) => /^(?:[a-z]+:|\/\/)/i.test(target);

async function checkLocalTarget(owner, rawTarget) {
  const target = stripTarget(rawTarget);
  if (!target || target.startsWith('#') || isExternal(target)) return;
  check(!target.startsWith('/'), `${owner}: repository-root URL is not project-page safe: ${rawTarget}`);
  const resolved = path.resolve(root, path.dirname(owner), target);
  check(resolved === root || resolved.startsWith(`${root}${path.sep}`), `${owner}: path escapes repository: ${rawTarget}`);
  if (!(resolved === root || resolved.startsWith(`${root}${path.sep}`))) return;
  const info = await stat(resolved).catch(() => null);
  const file = info?.isDirectory() ? path.join(resolved, 'index.html') : resolved;
  check(await existsAsFile(file), `${owner}: local target does not exist: ${rawTarget}`);
}

function checkPinnedDependencies(owner, source) {
  const urls = source.match(/https:\/\/cdn\.jsdelivr\.net\/npm\/[^\s"'<>)}]+/g) || [];
  for (const url of urls) {
    const segments = url.split('/npm/')[1].split('/');
    const packageSpec = segments[0].startsWith('@') ? segments.slice(0, 2).join('/') : segments[0];
    const versionIndex = packageSpec.lastIndexOf('@');
    const packageNameEnd = packageSpec.startsWith('@') ? packageSpec.indexOf('/') : 0;
    check(versionIndex > packageNameEnd, `${owner}: unpinned jsDelivr package: ${url}`);
    check(!/@(?:latest|next|beta)(?:\/|$)/i.test(packageSpec), `${owner}: floating jsDelivr tag: ${url}`);
  }
}

try {
  for (const file of htmlFiles) {
    const source = await readFile(path.join(root, file), 'utf8');
    check(/^\s*<!doctype html>/i.test(source), `${file}: missing HTML doctype`);
    check(/<title>[^<]+<\/title>/i.test(source), `${file}: missing document title`);
    check(/<\/html>\s*$/i.test(source), `${file}: incomplete HTML document`);

    const ids = [...source.matchAll(/\bid=["']([^"']+)["']/gi)].map((match) => match[1]);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    check(duplicateIds.length === 0, `${file}: duplicate ids: ${duplicateIds.join(', ')}`);

    for (const match of source.matchAll(/\b(?:href|src)=["']([^"']+)["']/gi)) {
      await checkLocalTarget(file, match[1]);
    }
    checkPinnedDependencies(file, source);

    let moduleIndex = 0;
    for (const match of source.matchAll(/<script\s+type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)) {
      const modulePath = path.join(temporary, `${file.replaceAll(/[\\/]/g, '-')}-${moduleIndex += 1}.mjs`);
      await writeFile(modulePath, match[1], 'utf8');
      const parsed = spawnSync(process.execPath, ['--check', modulePath], { encoding: 'utf8' });
      check(parsed.status === 0, `${file}: inline module ${moduleIndex} does not parse: ${(parsed.stderr || parsed.stdout).trim()}`);
    }
  }

  for (const file of markdownFiles) {
    const source = await readFile(path.join(root, file), 'utf8');
    for (const match of source.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)) {
      const raw = match[1].trim().replace(/\s+["'][^"']*["']$/, '');
      await checkLocalTarget(file, raw);
    }
  }

  const gallery = await readFile(path.join(root, 'index.html'), 'utf8');
  const demoLinks = [...gallery.matchAll(/class=["']open-demo["'][^>]*href=["']([^"']+)["']/gi)].map((match) => match[1]);
  check(demoLinks.length > 0, 'index.html: gallery contains no demo links');
  for (const link of demoLinks) await checkLocalTarget('index.html', link);

  const allText = (await Promise.all(
    tracked.filter((file) => /\.(?:html|mjs|js|ts|md|json|yml|yaml|ps1|gitignore)$/i.test(file))
      .map((file) => readFile(path.join(root, file), 'utf8'))
  )).join('\n');
  check(!/(?:github_pat_[A-Za-z0-9_]{40,}|ghp_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9_-]{24,})/.test(allText), 'tracked text contains a credential-like token');
} finally {
  await rm(temporary, { recursive: true, force: true });
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Site contract passed: ${htmlFiles.length} HTML files, ${markdownFiles.length} Markdown files, ${tracked.length} repository files checked.`);
