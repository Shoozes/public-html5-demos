import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(root, 'round-5', 'EXPERIMENT.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const resolveInsideRoot = (relative) => {
  const target = path.resolve(root, relative);
  check(target.startsWith(`${root}${path.sep}`), `path escapes repository root: ${relative}`);
  return target;
};
const resolvesToCommit = (revision) => {
  if (!revision) return false;
  try {
    execFileSync('git', ['cat-file', '-e', `${revision}^{commit}`], { cwd: root, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

check(manifest.schemaVersion === 1, 'unsupported experiment schema');
check(manifest.round === '5A', 'manifest is not for Round 5A');
check(manifest.visualInterpreter?.lane === 'native_image_view', 'visual interpreter lane is not frozen to native image view');
check(manifest.budgets?.wallTimeMinutes === 60, 'wall-time budget drifted');
check(manifest.budgets?.visualRepairsPerCheckpoint === 3, 'per-checkpoint visual repair budget drifted');
check(manifest.budgets?.visualRepairsTotal === 12, 'total visual repair budget drifted');
check(manifest.budgets?.functionalRepairsTotal === 8, 'functional repair budget drifted');
check(manifest.thresholds?.functional === 90, 'functional threshold drifted');
check(manifest.thresholds?.visual === 24, 'visual threshold drifted');
check(manifest.thresholds?.workflow === 16, 'workflow threshold drifted');
check(manifest.viewports?.desktop?.width === 1440 && manifest.viewports.desktop.height === 900, 'desktop capture viewport drifted');
check(manifest.viewports?.portrait?.width === 390 && manifest.viewports.portrait.height === 844, 'portrait capture viewport drifted');
check(typeof manifest.browser?.playwright === 'string' && manifest.browser.playwright.length > 0, 'Playwright version is missing');
check(typeof manifest.browser?.executable === 'string' && manifest.browser.executable.length > 0, 'browser executable contract is missing');
check(Object.keys(manifest.references || {}).sort().join(',') === 'desktop,portrait', 'reference set must contain only desktop and portrait');

for (const [relative, expectedHash] of Object.entries(manifest.frozenInputs || {})) {
  const target = resolveInsideRoot(relative);
  const bytes = await readFile(target).catch(() => null);
  check(bytes !== null, `missing frozen input: ${relative}`);
  if (bytes) check(sha256(bytes) === expectedHash, `checksum drift: ${relative}`);
}

for (const [name, expected] of Object.entries(manifest.references || {})) {
  const target = resolveInsideRoot(expected.path);
  const bytes = await readFile(target).catch(() => null);
  check(bytes !== null, `missing ${name} reference`);
  if (!bytes) continue;
  check(bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), `${name} reference is not PNG`);
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  check(width === expected.nativeWidth && height === expected.nativeHeight, `${name} native dimensions drifted`);
  check(Math.abs((width / height) - (expected.captureWidth / expected.captureHeight)) < 0.002, `${name} aspect ratio does not normalize safely to its capture viewport`);
  check(sha256(bytes) === expected.sha256, `${name} reference checksum drifted`);
  check((await stat(target)).size > 100_000, `${name} reference is unexpectedly small`);
}

check(manifest.baseline?.sourceCommit, 'source commit is missing');
check(resolvesToCommit(manifest.baseline?.sourceCommit), 'source commit does not resolve locally');
check(
  manifest.baseline?.commit || manifest.status === 'oracle-approved-awaiting-baseline-commit',
  'baseline commit is missing without an explicit waiting status'
);
if (manifest.baseline?.commit) check(resolvesToCommit(manifest.baseline.commit), 'baseline commit does not resolve locally');

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Round 5A package passed: ${Object.keys(manifest.frozenInputs).length} frozen inputs, two approved references, fixed thresholds and budgets.`);
if (!manifest.baseline.commit) console.log('WAITING: baseline commit must be frozen before model runs begin.');
