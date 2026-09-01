import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const evidence = path.join(root, 'submission', 'evidence');
const moduleRoot = process.env.CODEX_NODE_MODULES || process.env.NODE_PATH;
let playwright;
try {
  const loaded = await import(moduleRoot ? pathToFileURL(path.join(moduleRoot, 'playwright', 'index.js')).href : 'playwright');
  playwright = loaded.default || loaded;
} catch (error) {
  console.error(`Playwright unavailable: ${error.message}`);
  console.error('Set CODEX_NODE_MODULES to a node_modules directory containing playwright.');
  process.exit(2);
}

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png' };
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://local').pathname);
    const relative = pathname === '/' ? 'submission/index.html' : pathname.replace(/^\/+/, '');
    const target = path.resolve(root, relative);
    if (!target.startsWith(root + path.sep) || !existsSync(target)) { response.writeHead(404).end('Not found'); return; }
    const { readFile } = await import('node:fs/promises');
    response.writeHead(200, { 'content-type': types[path.extname(target)] || 'application/octet-stream', 'cache-control': 'no-store' });
    response.end(await readFile(target));
  } catch (error) { response.writeHead(500).end(String(error)); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const executablePath = process.env.HAIO_BROWSER || ['C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
await mkdir(evidence, { recursive: true });
const failures = [], results = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pass = message => { results.push(message); console.log(`PASS: ${message}`); };
const nearAngle = (actual, expected, tolerance=.28) => Math.abs(Math.atan2(Math.sin(actual-expected), Math.cos(actual-expected))) <= tolerance;

const openGame = async viewport => {
  const page = await browser.newPage({ viewport });
  const errors = [], requests = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('requestfailed', request => requests.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) requests.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(`http://127.0.0.1:${port}/submission/index.html`, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  assert(response?.ok(), `artifact HTTP status was ${response?.status()}`);
  try {
    await page.waitForFunction(() => window.__haio?.ready, null, { timeout: 30_000 });
    await page.evaluate(() => window.__haio.ready);
  } catch (error) {
    const staged = await page.locator('#error').textContent().catch(() => 'error panel unavailable');
    throw new Error(`bootstrap did not become ready; staged=${staged}; console=${errors.join(' | ')}; network=${requests.join(' | ')}; ${error.message}`);
  }
  await page.waitForTimeout(250);
  assert(await page.locator('#error').evaluate(node => getComputedStyle(node).display === 'none'), 'staged error overlay is visible');
  return { page, errors, requests };
};

let mobile;
try {
  mobile = await openGame({ width: 430, height: 932 });
  const { page, errors, requests } = mobile;
  let snap = await page.evaluate(() => window.__haio.snapshot());
  console.log(`Backend: ${snap.backend}`);
  assert(snap.player && snap.entities.some(e => e.category === 'station') && snap.entities.some(e => e.category === 'navigation beacon'), 'first frame lacks player or landmark');
  assert(snap.invariants.pass, snap.invariants.errors.join('; '));
  await page.screenshot({ path: path.join(evidence, 'first-frame-mobile.png') });
  pass('parse, bootstrap, first mobile frame, and initial invariants');

  await page.waitForTimeout(2600);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.stats.shots.hostile === 0, 'hostile projectile appeared during the three-second no-input opening');
  pass('no-input opening safety');

  const cardinal = [
    ['KeyW', 2, -1, 0], ['KeyD', 0, 1, Math.PI/2], ['KeyS', 2, 1, Math.PI], ['KeyA', 0, -1, -Math.PI/2]
  ];
  for (const [code, axis, sign, angle] of cardinal) {
    await page.evaluate(() => { window.__haio.clearInput(); window.__haio.setPlayerPosition(0, 4); });
    const before = await page.evaluate(() => window.__haio.snapshot().player.pos);
    await page.keyboard.down(code); await page.waitForTimeout(320); await page.keyboard.up(code);
    const after = await page.evaluate(() => window.__haio.snapshot().player);
    assert((after.pos[axis] - before[axis]) * sign > 1.2, `${code} did not move in its expected world direction`);
    assert(nearAngle(after.facing, angle), `${code} facing ${after.facing} did not match ${angle}`);
  }
  pass('four cardinal movement and facing directions');

  await page.evaluate(() => { window.__haio.clearInput(); window.__haio.setPlayerPosition(0,4); window.__haio.moveNear('Red Vesper',10); window.__haio.forceAggro('Red Vesper'); });
  await page.waitForFunction(() => { const s=window.__haio.snapshot(); return s.targetId && s.stats.shots.player>0; }, null, { timeout: 5000 });
  await page.keyboard.down('KeyW'); await page.waitForTimeout(260); await page.keyboard.up('KeyW');
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(!nearAngle(snap.player.facing, snap.player.weaponFacing, .45), 'weapon aim overwrote movement heading');
  await page.screenshot({ path: path.join(evidence, 'active-combat.png') });
  pass('aggro, sticky automatic targeting, automatic fire, and independent weapon aim');

  const oldTarget = snap.targetId;
  await page.evaluate(() => window.__haio.disengage());
  await page.waitForTimeout(700);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.targetId === null, `target ${oldTarget} immediately reacquired after disengagement`);
  pass('manual disengagement suppression');

  await page.evaluate(() => { window.__haio.forceAggro('Red Vesper'); window.__haio.destroyHostile('Red Vesper'); });
  await page.waitForTimeout(180);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(!snap.entities.some(e => e.name === 'Red Vesper'), 'destroyed hostile remained in world state');
  assert(snap.targetId !== oldTarget && snap.invariants.pass, `target cleanup failed: ${snap.invariants.errors.join('; ')}`);
  assert(snap.entities.filter(e => e.kind === 'pickup').length >= 3, 'hostile destruction did not emit salvage');
  await page.screenshot({ path: path.join(evidence, 'hostile-destruction-pickups.png') });
  pass('hostile destruction, target cleanup, staged drops, and render cleanup');

  await page.evaluate(() => window.__haio.restart());
  const creditsBefore = await page.evaluate(() => window.__haio.snapshot().player.credits);
  const pickupId = await page.evaluate(() => window.__haio.spawnPickupNearPlayer(6));
  await page.waitForFunction(id => !window.__haio.snapshot().entities.some(e => e.id === id), pickupId, { timeout: 5000 });
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.player.credits === creditsBefore + 5, `pickup credited ${snap.player.credits-creditsBefore} instead of 5`);
  assert(snap.stats.pickups === 1 && snap.stats.creditsAwarded === 5, 'pickup collection was counted more than once');
  await page.screenshot({ path: path.join(evidence, 'magnetic-collection.png') });
  pass('magnetic attraction, automatic collection, single credit update, and pickup cleanup');

  await page.evaluate(() => { window.__haio.setPlayerPosition(10,9); window.__haio.selectByName('Lattice Haven'); });
  await page.waitForFunction(() => !document.querySelector('#interact').hidden);
  await page.getByRole('button', { name: 'Request docking telemetry' }).click();
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.events.some(text => text.includes('traffic data')), 'station contextual action did not emit a simulation event');
  pass('station selection and contextual interaction');

  await page.evaluate(() => window.__haio.setPlayerPosition(0,4));
  await page.keyboard.down('KeyW'); await page.waitForTimeout(100); await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const blurred = await page.evaluate(() => window.__haio.snapshot().player.pos);
  await page.waitForTimeout(350); await page.keyboard.up('KeyW');
  const recovered = await page.evaluate(() => window.__haio.snapshot().player.pos);
  assert(Math.hypot(recovered[0]-blurred[0], recovered[2]-blurred[2]) < .35, 'blur did not clear movement input');
  pass('blur input recovery');

  const beforeRestart = snap.restartCount;
  await page.getByRole('button', { name: 'Restart' }).click();
  await page.waitForTimeout(180);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.restartCount === beforeRestart + 1, 'restart did not reconstruct the world');
  assert(snap.player.hp === 100 && snap.player.credits === 0, 'restart retained player combat state');
  assert(snap.invariants.pass && snap.invariants.loopCount === 1, `post-restart invariants failed: ${snap.invariants.errors.join('; ')}`);
  await page.screenshot({ path: path.join(evidence, 'post-restart.png') });
  pass('restart teardown/reconstruction and post-restart invariant check');

  const desktop = await openGame({ width: 1440, height: 900 });
  const desktopSnap = await desktop.page.evaluate(() => window.__haio.snapshot());
  assert(desktopSnap.invariants.pass, desktopSnap.invariants.errors.join('; '));
  await desktop.page.screenshot({ path: path.join(evidence, 'first-frame-desktop.png') });
  await desktop.page.close();
  errors.push(...desktop.errors); requests.push(...desktop.requests);
  pass('first desktop frame and responsive composition');

  assert(errors.length === 0, `runtime errors: ${errors.join(' | ')}`);
  assert(requests.length === 0, `failed network requests: ${requests.join(' | ')}`);
  pass('console, rejected-promise, and network inspection');
} catch (error) {
  failures.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  if (mobile) await mobile.page.close();
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}

if (failures.length) { console.error(`FAIL: ${failures.join('\n')}`); process.exit(1); }
console.log(`Round 4 browser scenarios passed (${results.length} evidence groups).`);
