import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const read = relative => readFile(path.join(root, relative));

const artifacts = {
  luna: { bytes: 37681, sha256: '8ee26f7dc384becd44dab749646e1296ac5c074a7eeb7931d376b8ff0b244f57' },
  terra: { bytes: 28437, sha256: '21643c0e43b34800a0f1a2d2e105e4287fe02508938a46dabf1cae12598379e2' },
  sol: { bytes: 33118, sha256: 'c3c21041834bf53441184e1d0d916d1936341620665865c404ebf166abf6264a' }
};
const requiredEvidence = ['DECISIONS.md', 'EVIDENCE.md', 'TOOL_LEDGER.md', 'VISUAL_CONTRACT.md', 'VISUAL_REVIEW.md'];

for (const [model, expected] of Object.entries(artifacts)) {
  const base = `round-5/results/${model}/submission`;
  const bytes = await read(`${base}/index.html`).catch(() => null);
  check(bytes !== null, `${model} artifact is missing`);
  if (bytes) {
    const canonical = Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'), 'utf8');
    check(canonical.length === expected.bytes, `${model} canonical artifact size drifted`);
    check(sha256(canonical) === expected.sha256, `${model} canonical artifact checksum drifted`);
  }
  for (const name of requiredEvidence) {
    check(await stat(path.join(root, base, name)).then(() => true).catch(() => false), `${model} evidence is missing: ${name}`);
  }
}

const evaluations = {
  luna: { passed: true, groups: 13 },
  terra: { passed: false, groups: 8 },
  'terra-compat': { passed: true, groups: 13, override: 'pickup-method=spawnPickupNear' },
  sol: { passed: true, groups: 13 }
};

for (const [label, expected] of Object.entries(evaluations)) {
  const relative = `round-5/results/operator/${label}/evaluation.json`;
  const evaluation = await read(relative).then(bytes => JSON.parse(bytes)).catch(() => null);
  check(evaluation !== null, `${label} operator evaluation is missing or invalid`);
  if (!evaluation) continue;
  check(evaluation.passed === expected.passed, `${label} pass state drifted`);
  check(evaluation.results?.length === expected.groups, `${label} evidence-group count drifted`);
  check(evaluation.dispatchCommit === '1aa2761d8d091c687f91d83bcd02a1efd8b67a59', `${label} dispatch commit drifted`);
  const artifactModel = label.startsWith('terra') ? 'terra' : label;
  check(evaluation.artifact?.sha256 === artifacts[artifactModel].sha256, `${label} evaluated artifact checksum drifted`);
  check(evaluation.artifact?.bytes === artifacts[artifactModel].bytes, `${label} evaluated artifact size drifted`);
  if (expected.override) check(evaluation.diagnosticOverrides?.includes(expected.override), `${label} compatibility override is not explicit`);
  if (label === 'terra') {
    check(evaluation.failures?.some(failure => failure.includes('spawnPickupNearPlayer is not a function')), 'Terra hard-gate failure signature drifted');
  }
}

const screenshots = {
  'luna/first-frame-desktop.png': { width: 1440, height: 900, sha256: 'cc8a78343394fb93b865400540f4a9ca470c736a13b7c4e0dc7dedc988e76265' },
  'luna/first-frame-portrait.png': { width: 390, height: 844, sha256: '9d75e9d23b7d746850dcfcd7ef81d38d1397194175d012d7ee753e610ca17e8c' },
  'terra/first-frame-desktop.png': { width: 1440, height: 900, sha256: 'd3bfe66f3285b144b143528c6562fee2be30fe7bb5b563572847b579f3fdef63' },
  'terra/first-frame-portrait.png': { width: 390, height: 844, sha256: '8ef28fc1ff8df04a45822e886ce92b02bbf6488ee45168abe43bada07b1fbca0' },
  'sol/first-frame-desktop.png': { width: 1440, height: 900, sha256: '49e5ec9dde62c0326c30293fbd4baa11ceeba7bb7c6ab14a57731caa4e6ba050' },
  'sol/first-frame-portrait.png': { width: 390, height: 844, sha256: '36c6514cd863459f5ca911aa29932ab96bdd16c86179d20c4d657b18abb18dff' }
};

for (const [name, expected] of Object.entries(screenshots)) {
  const relative = `round-5/results/operator/${name.split('/')[0]}/screenshots/${name.split('/')[1]}`;
  const bytes = await read(relative).catch(() => null);
  check(bytes !== null, `operator screenshot is missing: ${name}`);
  if (!bytes) continue;
  check(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `operator screenshot is not PNG: ${name}`);
  check(bytes.readUInt32BE(16) === expected.width && bytes.readUInt32BE(20) === expected.height, `operator screenshot dimensions drifted: ${name}`);
  check(sha256(bytes) === expected.sha256, `operator screenshot checksum drifted: ${name}`);
}

const [report, visualReview] = await Promise.all([
  read('round-5/REPORT.md').then(bytes => bytes.toString('utf8')),
  read('round-5/results/operator/VISUAL_REVIEW.md').then(bytes => bytes.toString('utf8'))
]);
check(report.includes('| Sol | Pass | 98 | **26** | 20 | Passed all thresholds |'), 'report operator outcome table drifted');
check(report.includes('Owner qualitative notes'), 'report does not preserve the owner-addendum boundary');
const lunaReview = visualReview.match(/## Luna([\s\S]*?)## Terra/)?.[1] || '';
const terraReview = visualReview.match(/## Terra([\s\S]*?)## Sol/)?.[1] || '';
const solReview = visualReview.match(/## Sol([\s\S]*)$/)?.[1] || '';
check(lunaReview.includes('Verdict: ODD'), 'Luna operator visual verdict drifted');
check(terraReview.includes('Verdict: ODD'), 'Terra operator visual verdict drifted');
check(solReview.includes('Verdict: GOOD'), 'Sol operator visual verdict drifted');

if (failures.length) {
  console.error(failures.map(failure => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}
console.log('Round 5 results passed: three archived artifacts, four operator evaluations, six fixed screenshots, and report verdicts.');
