import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { launchChromium } from '../../tools/browser-runtime.mjs';

const benchmarkRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(benchmarkRoot, 'operator-evidence');
const submissionRoots = {
  luna: process.env.ROUND4_LUNA_ROOT,
  terra: process.env.ROUND4_TERRA_ROOT,
  sol: process.env.ROUND4_SOL_ROOT
};
const missingRoots = Object.entries(submissionRoots).filter(([, value]) => !value).map(([name]) => name);
if (missingRoots.length) {
  console.error(`Missing submission roots for: ${missingRoots.join(', ')}. Set ROUND4_LUNA_ROOT, ROUND4_TERRA_ROOT, and ROUND4_SOL_ROOT.`);
  process.exit(2);
}
const submissions = {
  luna: { root: submissionRoots.luna, entry: 'submission/index.html' },
  terra: { root: submissionRoots.terra, entry: 'outputs/submission/index.html', requiredEntry: 'submission/index.html' },
  sol: { root: submissionRoots.sol, entry: 'submission/index.html' }
};
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const parts = decodeURIComponent(new URL(request.url, 'http://local').pathname).split('/').filter(Boolean);
    const model = parts.shift();
    const spec = submissions[model];
    if (!spec) { response.writeHead(404).end('Unknown submission'); return; }
    const target = path.resolve(spec.root, parts.join('/'));
    if (!target.startsWith(path.resolve(spec.root) + path.sep) || !existsSync(target)) { response.writeHead(404).end('Not found'); return; }
    response.writeHead(200, { 'content-type': mime[path.extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(await readFile(target));
  } catch (error) { response.writeHead(500).end(String(error)); }
});
const report = {};
let failed = false;
let browser;

try {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  browser = await launchChromium();
  await mkdir(output, { recursive: true });

  for (const [model, spec] of Object.entries(submissions)) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [], failedRequests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('requestfailed', request => failedRequests.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`); });
    const started = Date.now();
    try {
      const response = await page.goto(`http://127.0.0.1:${port}/${model}/${spec.entry}`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.waitForTimeout(8000);
      const state = await page.evaluate(() => ({
        title: document.title,
        canvases: [...document.querySelectorAll('canvas')].map(canvas => ({ width: canvas.width, height: canvas.height, clientWidth: canvas.clientWidth, clientHeight: canvas.clientHeight })),
        bodyText: document.body.innerText.slice(0, 500),
        hooks: { HAIO: !!window.__HAIO, haio: !!window.__haio, sectorTest: !!window.__sectorTest }
      }));
      await page.screenshot({ path: path.join(output, `${model}-desktop.png`) });
      const artifactExists = existsSync(path.join(spec.root, spec.requiredEntry || spec.entry));
      const pass = response?.ok() && artifactExists && state.canvases.some(canvas => canvas.clientWidth >= 1000 && canvas.clientHeight >= 600) && errors.length === 0 && failedRequests.length === 0;
      report[model] = { pass, requiredArtifactExists: artifactExists, httpStatus: response?.status(), elapsedMs: Date.now() - started, errors, failedRequests, ...state };
      failed ||= !pass;
      console.log(`${model.toUpperCase()}: ${pass ? 'PASS' : 'FAIL'} artifact=${artifactExists} console=${errors.length} network=${failedRequests.length}`);
    } finally {
      await page.close();
    }
  }
} finally {
  await browser?.close();
  if (server.listening) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
}
console.log(JSON.stringify(report, null, 2));
if (failed) process.exit(1);
