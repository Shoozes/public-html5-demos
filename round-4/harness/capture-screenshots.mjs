import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'submission', 'evidence');
const url = process.argv[2];
if (!url) { console.error('Usage: node capture-screenshots.mjs <running-artifact-url>'); process.exit(2); }
const moduleRoot = process.env.CODEX_NODE_MODULES || process.env.NODE_PATH;
const loaded = await import(moduleRoot ? pathToFileURL(path.join(moduleRoot, 'playwright', 'index.js')).href : 'playwright');
const playwright = loaded.default || loaded;
const executablePath = process.env.HAIO_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
await mkdir(output, { recursive: true });
for (const [name, viewport] of [['portrait',{width:430,height:932}],['desktop',{width:1440,height:900}]]) {
  const page = await browser.newPage({ viewport });
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__haio?.ready, null, { timeout: 30_000 });
  await page.evaluate(() => window.__haio.ready);
  await page.screenshot({ path: path.join(output, `manual-${name}.png`) });
  await page.close();
}
await browser.close();
console.log(`Captured portrait and desktop screenshots in ${output}`);
