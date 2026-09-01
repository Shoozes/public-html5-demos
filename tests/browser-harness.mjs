import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openBrowserHarness } from '../tools/browser-harness.mjs';
import { loadPlaywright } from '../tools/browser-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalModuleRoot = process.env.CODEX_NODE_MODULES;
const originalNodePath = process.env.NODE_PATH;
const fixtureRoot = await mkdtemp(path.join(tmpdir(), 'browser-runtime-'));

try {
  const moduleRoot = path.join(fixtureRoot, 'modules');
  const playwrightRoot = path.join(moduleRoot, 'playwright');
  await mkdir(playwrightRoot, { recursive: true });
  await writeFile(path.join(playwrightRoot, 'index.js'), 'module.exports = { fixture: true };\n', 'utf8');
  delete process.env.CODEX_NODE_MODULES;
  process.env.NODE_PATH = [path.join(fixtureRoot, 'missing'), moduleRoot].join(path.delimiter);
  assert.equal((await loadPlaywright()).fixture, true);

  process.env.CODEX_NODE_MODULES = path.join(root, '.missing-playwright-modules');
  delete process.env.NODE_PATH;
  await assert.rejects(openBrowserHarness(root), /Playwright unavailable/);
} finally {
  if (originalModuleRoot === undefined) delete process.env.CODEX_NODE_MODULES;
  else process.env.CODEX_NODE_MODULES = originalModuleRoot;
  if (originalNodePath === undefined) delete process.env.NODE_PATH;
  else process.env.NODE_PATH = originalNodePath;
  await rm(fixtureRoot, { recursive: true, force: true });
}

console.log('Browser runtime multi-root discovery and startup-failure cleanup passed.');
