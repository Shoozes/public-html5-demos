import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openBrowserHarness } from '../../tools/browser-harness.mjs';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(repositoryRoot, 'output', 'playwright', 'round-5-oracle-review');
const harness = await openBrowserHarness(repositoryRoot);
const { address, browser } = harness;

const references = [
  { name: 'desktop', file: 'desktop-reference-v2.png', viewport: { width: 1440, height: 900 } },
  { name: 'portrait', file: 'portrait-reference-v2.png', viewport: { width: 390, height: 844 } }
];

await mkdir(output, { recursive: true });

try {
  for (const reference of references) {
    for (const mode of ['full', 'thumbnail', 'grayscale']) {
      const factor = mode === 'thumbnail' ? 0.25 : 1;
      const viewport = {
        width: Math.round(reference.viewport.width * factor),
        height: Math.round(reference.viewport.height * factor)
      };
      const page = await browser.newPage({ viewport });
      const filter = mode === 'grayscale' ? 'filter:grayscale(1);' : '';
      await page.setContent(`<!doctype html><html><style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#02050c}img{display:block;width:100%;height:100%;object-fit:cover;${filter}}</style><img alt="${reference.name} reference" src="http://127.0.0.1:${address.port}/round-5/mockups/${reference.file}"></html>`);
      await page.locator('img').evaluate((image) => image.complete ? true : new Promise((resolve, reject) => {
        image.addEventListener('load', () => resolve(true), { once: true });
        image.addEventListener('error', () => reject(new Error('reference failed to load')), { once: true });
      }));
      await page.screenshot({ path: path.join(output, `${reference.name}-${mode}.png`) });
      await page.close();
    }
  }
} finally {
  await harness.close();
}

console.log(`Reference review captures written to ${output}`);
