import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const artifact = path.join(root, 'submission', 'index.html');
const html = await readFile(artifact, 'utf8');
const report = await readFile(path.join(root, 'REPORT.md'), 'utf8');
const visualContract = await readFile(path.join(root, 'NEXT_ROUND_VISUAL_CONTRACT.md'), 'utf8');
const decisions = await readFile(path.join(root, 'submission', 'DECISIONS.md'), 'utf8');
const evidence = await readFile(path.join(root, 'submission', 'EVIDENCE.md'), 'utf8');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };

check(/^<!doctype html>/i.test(html), 'missing HTML doctype');
check(/<html[\s>]/i.test(html) && /<\/html>\s*$/i.test(html), 'HTML document is incomplete');
check((html.match(/<script\s+type="module">/g) || []).length === 1, 'expected one inline module script');
check(html.includes('three@0.185.1/build/three.webgpu.js'), 'Three.js WebGPU import is not pinned to 0.185.1');
check(html.includes('three@0.185.1/build/three.tsl.js'), 'Three.js TSL import is not pinned to 0.185.1');
check(/await Promise\.all\(\[import\('three'\),import\('three\/tsl'\)\]\)/.test(html), 'guarded dynamic imports are missing');
check(/new THREE\.WebGPURenderer/.test(html) && /await renderer\.init\(\)/.test(html), 'WebGPURenderer is not awaited');
check(/MeshStandardNodeMaterial/.test(html) && /emissiveNode/.test(html), 'lit node materials and custom TSL behavior are missing');
check(!/(ShaderMaterial|RawShaderMaterial|gl_Position|@vertex|@fragment)/.test(html), 'forbidden shader source or material detected');
check(!/<(?:img|audio|video|source)\b[^>]*\bsrc=["']https?:/i.test(html), 'external media asset detected');
check(!/>\s*fire\s*</i.test(html), 'permanent manual fire control detected');
check(/window\.__haio=/.test(html) && /const invariants=/.test(html), 'diagnostic invariant surface is missing');
check((html.match(/setAnimationLoop\(/g) || []).length === 2, 'expected one loop registration and one failure shutdown');
check(
  /Classification:\s+skills and tools were allowed and materially used,[\s\S]{0,220}not frozen as experimental controls\./i.test(report),
  'report does not classify Round 4 skill/tool usage'
);
check(report.includes('Luna') && report.includes('Terra') && report.includes('Sol'), 'report omits a model result');
check(visualContract.includes('Verdict: BROKEN | ODD | GOOD'), 'visual contract lacks the mandatory verdict vocabulary');
check(visualContract.includes('Blunt read: This looks <broken/odd/good> because...'), 'visual contract lacks the blunt-read checkpoint');
check(decisions.split(/\r?\n/).filter(line => line.startsWith('- I will take')).length >= 5, 'decision log has fewer than five material interpretations');
check(evidence.includes('Round 4 browser scenarios passed') || evidence.includes('12 browser evidence groups'), 'evidence does not identify the completed browser gate');

for (const name of ['desktop-reference.png', 'portrait-reference.png']) {
  const imagePath = path.join(root, 'mockups', name);
  const [metadata, signature] = await Promise.all([stat(imagePath), readFile(imagePath).then(data => data.subarray(0, 8))]);
  check(metadata.size > 100_000, `${name} is missing or unexpectedly small`);
  check(signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${name} is not a PNG`);
}

const moduleMatch = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!moduleMatch) failures.push('inline module source could not be extracted');
else {
  const temp = await mkdtemp(path.join(tmpdir(), 'haio-parse-'));
  const source = path.join(temp, 'artifact.mjs');
  try {
    await writeFile(source, moduleMatch[1], 'utf8');
    const parsed = spawnSync(process.execPath, ['--check', source], { encoding: 'utf8' });
    check(parsed.status === 0, `module parse failed: ${(parsed.stderr || parsed.stdout).trim()}`);
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

if (failures.length) {
  console.error(failures.map(item => `FAIL: ${item}`).join('\n'));
  process.exit(1);
}
console.log(`HAIO static contract passed: ${html.split(/\r?\n/).length} lines, ${Buffer.byteLength(html)} bytes.`);
