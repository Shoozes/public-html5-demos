import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const temporary = await mkdtemp(path.join(tmpdir(), 'round55-package-'));
const run = (file, args = [], cwd = root) => spawnSync(process.execPath, [file, ...args], { cwd, encoding: 'utf8' });
const success = result => assert.equal(result.status, 0, result.stderr || result.stdout);
try {
  const packets = {};
  for (const arm of ['luna', 'sol']) {
    const out = path.join(temporary, arm);
    success(run('tools/prepare-round55.mjs', [`--arm=${arm}`, `--out=${out}`]));
    success(run('verify-inputs.mjs', [], out));
    assert.equal(await stat(path.join(out, '.git')).catch(() => null), null);
    const pkg = JSON.parse(await readFile(path.join(out, 'PACKAGE.json'), 'utf8'));
    assert.equal(pkg.requestedModel, `gpt-6-${arm}`);
    assert.equal(pkg.reasoningEffort, 'high');
    assert.equal(pkg.status, 'prepared-not-dispatched');
    for (const file of Object.keys(pkg.sha256)) {
      assert.ok(!/(?:^|\/)(?:results|submission|\.git)(?:\/|$)/.test(file), `Leaked solution/history path: ${file}`);
      assert.ok(!/REPORT\.md$/.test(file), `Leaked report: ${file}`);
    }
    const original = await readFile(path.join(out, 'round-4/harness/run-scenarios.mjs'), 'utf8');
    const adapter = await readFile(path.join(out, 'tools/run-scenarios.mjs'), 'utf8');
    assert.equal(adapter, original.replace("from '../../tools/browser-harness.mjs'", "from './browser-harness.mjs'"));
    packets[arm] = pkg;
  }
  assert.deepEqual(packets.luna.sha256, packets.sol.sha256, 'Arms must receive byte-identical context and adapters');
  const out = path.join(temporary, 'luna');
  assert.notEqual(run('tools/prepare-round55.mjs', ['--arm=luna', `--out=${out}`]).status, 0, 'Existing attempt must not be overwritten');
  assert.notEqual(run('tools/prepare-round55.mjs', ['--arm=luna', `--out=${path.join(root, 'forbidden-candidate')}`]).status, 0);
  assert.equal(await stat(path.join(root, 'forbidden-candidate')).catch(() => null), null);
  const passdown = path.join(out, 'round-5/PASSDOWN.md');
  const original = await readFile(passdown);
  await writeFile(passdown, 'modified task');
  assert.notEqual(run('verify-inputs.mjs', [], out).status, 0, 'Tampered task must fail');
  await writeFile(passdown, original);
  await writeFile(path.join(out, 'previous-solution.html'), '<!doctype html>');
  assert.notEqual(run('verify-inputs.mjs', [], out).status, 0, 'Extra solution input must fail');
  await rm(path.join(out, 'previous-solution.html'));
  success(run('verify-inputs.mjs', [], out));
} finally {
  await rm(temporary, { recursive: true, force: true });
}
console.log('Round 5.5 packet passed: identical inputs, preserved scenarios, no history/results, overwrite refusal, task-tamper and extra-input rejection. No candidate models ran.');
