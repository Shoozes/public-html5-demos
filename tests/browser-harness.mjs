import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openBrowserHarness } from '../tools/browser-harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalModuleRoot = process.env.CODEX_NODE_MODULES;
const originalNodePath = process.env.NODE_PATH;

try {
  process.env.CODEX_NODE_MODULES = path.join(root, '.missing-playwright-modules');
  delete process.env.NODE_PATH;
  await assert.rejects(openBrowserHarness(root), /Playwright unavailable/);
} finally {
  if (originalModuleRoot === undefined) delete process.env.CODEX_NODE_MODULES;
  else process.env.CODEX_NODE_MODULES = originalModuleRoot;
  if (originalNodePath === undefined) delete process.env.NODE_PATH;
  else process.env.NODE_PATH = originalNodePath;
}

console.log('Browser harness startup-failure cleanup passed.');
