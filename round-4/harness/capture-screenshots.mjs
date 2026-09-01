import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChromium } from '../../tools/browser-runtime.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'submission', 'evidence');
const url = process.argv[2];
if (!url) { console.error('Usage: node capture-screenshots.mjs <running-artifact-url>'); process.exit(2); }
const browser = await launchChromium();
try {
  await mkdir(output, { recursive: true });
  for (const [name, viewport] of [['portrait',{width:430,height:932}],['desktop',{width:1440,height:900}]]) {
    const page = await browser.newPage({ viewport });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__haio?.ready, null, { timeout: 30_000 });
    await page.evaluate(() => window.__haio.ready);
    await page.screenshot({ path: path.join(output, `manual-${name}.png`) });
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Captured portrait and desktop screenshots in ${output}`);
