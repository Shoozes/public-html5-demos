import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openBrowserHarness } from '../tools/browser-harness.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const harness = await openBrowserHarness(root);
const { address, browser } = harness;

const runtimeErrors = (page) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`);
  });
  page.on('requestfailed', (request) => errors.push(`request: ${request.url()} ${request.failure()?.errorText || ''}`));
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`response: ${response.status()} ${response.url()}`);
  });
  return errors;
};

try {
  const gallery = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const galleryErrors = runtimeErrors(gallery);
  const galleryResponse = await gallery.goto(`http://127.0.0.1:${address.port}/`, { waitUntil: 'networkidle' });
  assert.equal(galleryResponse?.status(), 200);
  assert.equal(await gallery.title(), 'Public HTML5 Demos');
  const links = await gallery.locator('.open-demo').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
  assert.deepEqual(links, ['./ragdoll-lab/', './ragdoll-math-lab/', './anthrocybernetics/']);
  assert.equal(galleryErrors.length, 0, galleryErrors.join(' | '));
  await gallery.close();

  const anthro = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const anthroErrors = runtimeErrors(anthro);
  const anthroResponse = await anthro.goto(`http://127.0.0.1:${address.port}/anthrocybernetics/`, { waitUntil: 'domcontentloaded' });
  assert.equal(anthroResponse?.status(), 200);
  await anthro.waitForFunction(() => document.querySelector('#runtime-badge')?.textContent !== 'Loading visual', null, { timeout: 15_000 });
  await anthro.getByRole('button', { name: 'Start' }).click();
  await anthro.locator('#system-input').fill('A local agent loses its task memory after every restart, so the team repeats setup work.');
  await anthro.getByRole('button', { name: 'Map this situation' }).click();
  await anthro.waitForFunction(() => document.querySelector('.slide.is-active')?.dataset.slide === '2');
  assert.match(await anthro.locator('#system-summary').textContent(), /system|map|signal|pattern|feedback/i);
  await anthro.getByRole('button', { name: 'Advanced' }).click();
  assert.equal(await anthro.locator('body').getAttribute('class'), 'advanced-mode');
  await anthro.locator('.progress-dot').nth(4).click();
  const downloadPromise = anthro.waitForEvent('download');
  await anthro.getByRole('button', { name: 'Export map' }).click();
  const download = await downloadPromise;
  const downloaded = JSON.parse(await readFile(await download.path(), 'utf8'));
  assert.equal(downloaded.map?.type, 'five_foci_field_map');
  await anthro.locator('#import-file').setInputFiles({
    name: 'invalid.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{}')
  });
  await anthro.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('not a Five-Foci map'));
  await anthro.getByRole('button', { name: 'Clear local state' }).click();
  assert.equal(await anthro.evaluate(() => localStorage.length), 0);
  assert.equal(anthroErrors.length, 0, anthroErrors.join(' | '));
  await anthro.close();

  const portrait = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const portraitErrors = runtimeErrors(portrait);
  await portrait.goto(`http://127.0.0.1:${address.port}/anthrocybernetics/`, { waitUntil: 'domcontentloaded' });
  await portrait.waitForFunction(() => window.__anthroViewportProfile?.orientation === 'portrait');
  const overflow = await portrait.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `portrait layout overflows by ${overflow}px`);
  assert.equal(portraitErrors.length, 0, portraitErrors.join(' | '));
  await portrait.close();
} finally {
  await harness.close();
}

console.log('Site browser contract passed: gallery, Anthrocybernetics workflow, export/import error path, persistence reset, and portrait layout.');
