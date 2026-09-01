import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { openBrowserHarness } from '../../tools/browser-harness.mjs';

const operatorRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = new Map();
for (const argument of process.argv.slice(2)) {
  const match = argument.match(/^--([^=]+)=(.*)$/);
  if (match) args.set(match[1], match[2]);
}

if (!args.has('root')) throw new Error('required argument missing: --root=<arm repository root>');
const armRoot = path.resolve(args.get('root') || '');
const label = args.get('label') || path.basename(path.dirname(armRoot));
const output = path.resolve(args.get('output') || path.join(operatorRoot, 'round-5', 'results', 'operator', label));
const pickupMethod = args.get('pickup-method') || 'spawnPickupNearPlayer';
if (!['spawnPickupNearPlayer', 'spawnPickupNear'].includes(pickupMethod)) {
  throw new Error(`unsupported pickup diagnostic method: ${pickupMethod}`);
}
const artifact = path.join(armRoot, 'submission', 'index.html');
const evidenceRoot = path.join(armRoot, 'submission');
const screenshots = path.join(output, 'screenshots');
const results = [];
const failures = [];
const runtimeErrors = [];
const networkErrors = [];
const startedAt = new Date();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const assert = (condition, message) => { if (!condition) throw new Error(message); };
const pass = message => {
  results.push({ status: 'pass', message });
  console.log(`PASS: ${message}`);
};
const nearAngle = (actual, expected, tolerance = .28) => (
  Math.abs(Math.atan2(Math.sin(actual - expected), Math.cos(actual - expected))) <= tolerance
);

await mkdir(screenshots, { recursive: true });

const html = await readFile(artifact, 'utf8');
const artifactStat = await stat(artifact);
const canonicalHtml = html.replaceAll('\r\n', '\n');
const staticFailures = [];
const staticCheck = (condition, message) => { if (!condition) staticFailures.push(message); };
staticCheck(/^<!doctype html>/i.test(html), 'missing HTML doctype');
staticCheck(/<html[\s>]/i.test(html) && /<\/html>\s*$/i.test(html), 'HTML document is incomplete');
staticCheck((html.match(/<script\s+type=["']module["']>/g) || []).length === 1, 'expected one inline module script');
staticCheck(html.includes('three@0.185.1/build/three.webgpu.js'), 'Three.js WebGPU import is not pinned to 0.185.1');
staticCheck(html.includes('three@0.185.1/build/three.tsl.js'), 'Three.js TSL import is not pinned to 0.185.1');
staticCheck(/new THREE\.WebGPURenderer/.test(html), 'WebGPURenderer construction is missing');
staticCheck(/await (?:state\.)?renderer\.init\(\)/.test(html), 'renderer initialization is not awaited');
staticCheck(/MeshStandardNodeMaterial/.test(html), 'lit node materials are missing');
staticCheck(!/(ShaderMaterial|RawShaderMaterial|gl_Position|@vertex|@fragment)/.test(html), 'forbidden shader source or material detected');
staticCheck(!/<(?:img|audio|video|source)\b[^>]*\bsrc=["']https?:/i.test(html), 'external media asset detected');
staticCheck(/window\.__haio\s*=/.test(html), 'diagnostic surface is missing');

for (const name of ['DECISIONS.md', 'VISUAL_CONTRACT.md', 'VISUAL_REVIEW.md', 'TOOL_LEDGER.md', 'EVIDENCE.md']) {
  try { await stat(path.join(evidenceRoot, name)); }
  catch { staticFailures.push(`required evidence file is missing: submission/${name}`); }
}

const moduleMatch = html.match(/<script\s+type=["']module["']>([\s\S]*?)<\/script>/);
if (!moduleMatch) staticFailures.push('inline module source could not be extracted');
else {
  const parseRoot = await mkdtemp(path.join(tmpdir(), 'round5-operator-parse-'));
  try {
    const source = path.join(parseRoot, 'artifact.mjs');
    await writeFile(source, moduleMatch[1], 'utf8');
    const parsed = spawnSync(process.execPath, ['--check', source], { encoding: 'utf8' });
    staticCheck(parsed.status === 0, `module parse failed: ${(parsed.stderr || parsed.stdout).trim()}`);
  } finally {
    await rm(parseRoot, { recursive: true, force: true });
  }
}

if (staticFailures.length) failures.push(...staticFailures.map(message => `static: ${message}`));
else pass('canonical artifact, module parse, static constraints, and required evidence files');

const harness = await openBrowserHarness(armRoot);
const { address, browser } = harness;
const openPages = new Set();

const openGame = async viewport => {
  const page = await browser.newPage({ viewport });
  openPages.add(page);
  const errors = [];
  const requests = [];
  page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
  page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('requestfailed', request => requests.push(`${request.url()}: ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) requests.push(`${response.status()} ${response.url()}`); });
  const response = await page.goto(`http://127.0.0.1:${address.port}/submission/index.html`, {
    waitUntil: 'domcontentloaded',
    timeout: 30_000
  });
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

const closePage = async page => {
  openPages.delete(page);
  await page.close();
};

try {
  for (const capture of [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'portrait', width: 390, height: 844 }
  ]) {
    const opened = await openGame({ width: capture.width, height: capture.height });
    const snap = await opened.page.evaluate(() => window.__haio.snapshot());
    assert(snap.player, `${capture.name} first frame lacks player`);
    assert(snap.entities.some(entity => entity.category === 'station'), `${capture.name} first frame lacks station`);
    assert(snap.invariants.pass, `${capture.name} invariants: ${snap.invariants.errors.join('; ')}`);
    await opened.page.screenshot({ path: path.join(screenshots, `first-frame-${capture.name}.png`) });
    runtimeErrors.push(...opened.errors);
    networkErrors.push(...opened.requests);
    await closePage(opened.page);
  }
  pass('standardized 1440x900 and 390x844 first frames with initial invariants');

  const mobile = await openGame({ width: 430, height: 932 });
  const { page, errors, requests } = mobile;
  let snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.player && snap.entities.some(entity => entity.category === 'station') && snap.entities.some(entity => entity.category === 'navigation beacon'), 'first frame lacks player or landmark');
  assert(snap.invariants.pass, snap.invariants.errors.join('; '));
  pass('parse, bootstrap, first mobile frame, and initial invariants');

  await page.waitForTimeout(2600);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.stats.shots.hostile === 0, 'hostile projectile appeared during the three-second no-input opening');
  pass('no-input opening safety');

  const cardinal = [
    ['KeyW', 2, -1, 0], ['KeyD', 0, 1, Math.PI / 2], ['KeyS', 2, 1, Math.PI], ['KeyA', 0, -1, -Math.PI / 2]
  ];
  for (const [code, axis, sign, angle] of cardinal) {
    await page.evaluate(() => { window.__haio.clearInput(); window.__haio.setPlayerPosition(0, 4); });
    const before = await page.evaluate(() => window.__haio.snapshot().player.pos);
    await page.keyboard.down(code);
    await page.waitForTimeout(320);
    await page.keyboard.up(code);
    const after = await page.evaluate(() => window.__haio.snapshot().player);
    assert((after.pos[axis] - before[axis]) * sign > 1.2, `${code} did not move in its expected world direction`);
    assert(nearAngle(after.facing, angle), `${code} facing ${after.facing} did not match ${angle}`);
  }
  pass('four cardinal movement and facing directions');

  await page.evaluate(() => {
    window.__haio.clearInput();
    window.__haio.setPlayerPosition(0, 4);
    window.__haio.moveNear('Red Vesper', 10);
    window.__haio.forceAggro('Red Vesper');
  });
  await page.waitForFunction(() => {
    const state = window.__haio.snapshot();
    return state.targetId && state.stats.shots.player > 0;
  }, null, { timeout: 5000 });
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(260);
  await page.keyboard.up('KeyW');
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(!nearAngle(snap.player.facing, snap.player.weaponFacing, .45), 'weapon aim overwrote movement heading');
  pass('aggro, sticky automatic targeting, automatic fire, and independent weapon aim');

  const oldTarget = snap.targetId;
  await page.evaluate(() => window.__haio.disengage());
  await page.waitForTimeout(700);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.targetId === null, `target ${oldTarget} immediately reacquired after disengagement`);
  pass('manual disengagement suppression');

  await page.evaluate(() => {
    window.__haio.forceAggro('Red Vesper');
    window.__haio.destroyHostile('Red Vesper');
  });
  await page.waitForTimeout(180);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(!snap.entities.some(entity => entity.name === 'Red Vesper'), 'destroyed hostile remained in world state');
  assert(snap.targetId !== oldTarget && snap.invariants.pass, `target cleanup failed: ${snap.invariants.errors.join('; ')}`);
  assert(snap.entities.filter(entity => entity.kind === 'pickup').length >= 3, 'hostile destruction did not emit salvage');
  pass('hostile destruction, target cleanup, staged drops, and render cleanup');

  await page.evaluate(() => window.__haio.restart());
  const creditsBefore = await page.evaluate(() => window.__haio.snapshot().player.credits);
  const pickupId = await page.evaluate(method => {
    const diagnostic = window.__haio[method];
    if (typeof diagnostic !== 'function') throw new TypeError(`window.__haio.${method} is not a function`);
    return diagnostic(6);
  }, pickupMethod);
  await page.waitForFunction(id => !window.__haio.snapshot().entities.some(entity => entity.id === id), pickupId, { timeout: 5000 });
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.player.credits === creditsBefore + 5, `pickup credited ${snap.player.credits - creditsBefore} instead of 5`);
  assert(snap.stats.pickups === 1 && snap.stats.creditsAwarded === 5, 'pickup collection was counted more than once');
  pass('magnetic attraction, automatic collection, single credit update, and pickup cleanup');

  await page.evaluate(() => {
    window.__haio.setPlayerPosition(10, 9);
    window.__haio.selectByName('Lattice Haven');
  });
  await page.waitForFunction(() => !document.querySelector('#interact').hidden);
  await page.getByRole('button', { name: 'Request docking telemetry' }).click();
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.events.some(text => text.includes('traffic data')), 'station contextual action did not emit a simulation event');
  pass('station selection and contextual interaction');

  await page.evaluate(() => window.__haio.setPlayerPosition(0, 4));
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(100);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  const blurred = await page.evaluate(() => window.__haio.snapshot().player.pos);
  await page.waitForTimeout(350);
  await page.keyboard.up('KeyW');
  const recovered = await page.evaluate(() => window.__haio.snapshot().player.pos);
  assert(Math.hypot(recovered[0] - blurred[0], recovered[2] - blurred[2]) < .35, 'blur did not clear movement input');
  pass('blur input recovery');

  const beforeRestart = snap.restartCount;
  await page.getByRole('button', { name: 'Restart' }).click();
  await page.waitForTimeout(180);
  snap = await page.evaluate(() => window.__haio.snapshot());
  assert(snap.restartCount === beforeRestart + 1, 'restart did not reconstruct the world');
  assert(snap.player.hp === 100 && snap.player.credits === 0, 'restart retained player combat state');
  assert(snap.invariants.pass && snap.invariants.loopCount === 1, `post-restart invariants failed: ${snap.invariants.errors.join('; ')}`);
  pass('restart teardown/reconstruction and post-restart invariant check');

  runtimeErrors.push(...errors);
  networkErrors.push(...requests);
  await closePage(page);
  assert(runtimeErrors.length === 0, `runtime errors: ${runtimeErrors.join(' | ')}`);
  assert(networkErrors.length === 0, `failed network requests: ${networkErrors.join(' | ')}`);
  pass('console, rejected-promise, and network inspection');
} catch (error) {
  failures.push(error instanceof Error ? error.stack || error.message : String(error));
} finally {
  await Promise.allSettled([...openPages].map(page => page.close()));
  await harness.close();
}

const report = {
  schemaVersion: 1,
  label,
  armRoot,
  diagnosticOverrides: pickupMethod === 'spawnPickupNearPlayer' ? [] : [`pickup-method=${pickupMethod}`],
  dispatchCommit: spawnSync('git', ['-C', armRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).stdout.trim(),
  startedAt: startedAt.toISOString(),
  completedAt: new Date().toISOString(),
  artifact: {
    path: artifact,
    sourceBytes: artifactStat.size,
    bytes: Buffer.byteLength(canonicalHtml),
    lines: canonicalHtml.split('\n').length,
    sha256: sha256(Buffer.from(canonicalHtml))
  },
  results,
  failures,
  runtimeErrors,
  networkErrors,
  screenshots: {
    desktop: path.join(screenshots, 'first-frame-desktop.png'),
    portrait: path.join(screenshots, 'first-frame-portrait.png')
  },
  passed: failures.length === 0
};
await writeFile(path.join(output, 'evaluation.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');

if (failures.length) {
  console.error(failures.map(failure => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log(`Round 5 operator evaluation passed for ${label}: ${results.length} evidence groups.`);
