import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const manifestPath = path.join(root, 'round-5', 'EXPERIMENT.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const failures = [];
const check = (condition, message) => { if (!condition) failures.push(message); };
const sha256 = (bytes) => createHash('sha256').update(bytes).digest('hex');
const frozenTextExtensions = new Set(manifest.integrity?.textExtensions || []);
const canonicalFrozenBytes = (relative, bytes) => (
  frozenTextExtensions.has(path.extname(relative).toLowerCase())
    ? Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'), 'utf8')
    : bytes
);
const isInsideRoot = (candidate) => candidate === root || candidate.startsWith(`${root}${path.sep}`);

function resolveInsideRoot(relative) {
  const target = path.resolve(root, relative);
  check(isInsideRoot(target), `archive path escapes repository root: ${relative}`);
  return isInsideRoot(target) ? target : null;
}

function readAtRevision(revision, relative) {
  if (!resolveInsideRoot(relative)) return null;
  const result = spawnSync('git', ['show', `${revision}:${relative.replaceAll('\\', '/')}`], {
    cwd: root,
    encoding: null,
    maxBuffer: 32 * 1024 * 1024
  });
  if (result.status !== 0) {
    check(false, `archive input unavailable at ${revision}: ${relative}`);
    return null;
  }
  return result.stdout;
}

const baseline = manifest.baseline?.commit;
const validBaseline = typeof baseline === 'string' && /^[0-9a-f]{40}$/.test(baseline);
check(validBaseline, 'baseline content commit must be a full hexadecimal Git identity');
const baselineCommit = validBaseline
  ? spawnSync('git', ['cat-file', '-e', `${baseline}^{commit}`], { cwd: root }).status === 0
  : false;
check(baselineCommit, 'baseline content commit does not resolve locally');

if (baselineCommit) {
  const archivedManifestBytes = readAtRevision(baseline, 'round-5/EXPERIMENT.json');
  if (archivedManifestBytes) {
    const archivedManifest = JSON.parse(archivedManifestBytes.toString('utf8'));
    archivedManifest.baseline.commit = baseline;
    check(
      JSON.stringify(archivedManifest) === JSON.stringify(manifest),
      'current experiment manifest drifted beyond its final baseline pointer'
    );
  }

  for (const [relative, expectedHash] of Object.entries(manifest.frozenInputs || {})) {
    const archivedBytes = readAtRevision(baseline, relative);
    if (archivedBytes) {
      check(
        sha256(canonicalFrozenBytes(relative, archivedBytes)) === expectedHash,
        `archived checksum drift: ${relative}`
      );
    }
    const currentPath = resolveInsideRoot(relative);
    check(currentPath && (await stat(currentPath).catch(() => null))?.isFile(), `current archive path is missing: ${relative}`);
  }

  for (const [name, expected] of Object.entries(manifest.references || {})) {
    const currentPath = resolveInsideRoot(expected.path);
    const currentBytes = currentPath ? await readFile(currentPath).catch(() => null) : null;
    const archivedBytes = readAtRevision(baseline, expected.path);
    check(currentBytes !== null, `current ${name} reference is missing`);
    if (currentBytes) check(sha256(currentBytes) === expected.sha256, `current ${name} reference checksum drifted`);
    if (archivedBytes) check(sha256(archivedBytes) === expected.sha256, `archived ${name} reference checksum drifted`);
  }
}

if (failures.length) {
  console.error(failures.map((failure) => `FAIL: ${failure}`).join('\n'));
  process.exit(1);
}

console.log(`Round 5A archive passed: ${Object.keys(manifest.frozenInputs).length} historical inputs verified at ${baseline}; current shared tooling may evolve without rewriting the experiment.`);
