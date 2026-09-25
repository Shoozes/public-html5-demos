import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sourceCommit = '233cd51aa9c23185f6e910d2bb01b224e939f3f4';
const git = (...args) => execFileSync('git', args, { cwd: root, maxBuffer: 32 * 1024 * 1024 });
const original = relative => git('show', `${sourceCommit}:${relative}`);
const names = git('ls-tree', '-r', '--name-only', sourceCommit).toString().trim().split('\n');
let preserved = 0;
for (const name of names) {
  let moved;
  if (name.startsWith('docs/haio-prompt-discovery/round-2/')) moved = name.replace('docs/haio-prompt-discovery/round-2/', 'rounds/round-2/');
  else if (name.startsWith('docs/haio-prompt-discovery/round-3/')) moved = name.replace('docs/haio-prompt-discovery/round-3/', 'rounds/round-3/');
  else if (name.startsWith('docs/haio-prompt-discovery/')) moved = name.replace('docs/haio-prompt-discovery/', 'rounds/round-1/');
  else if (/^round-[45]\//.test(name) && !name.endsWith('.mjs')) moved = `rounds/${name}`;
  if (!moved) continue;
  assert.deepEqual(await readFile(path.join(root, moved)), original(name), `Historical bytes changed: ${moved}`);
  preserved += 1;
}
// One-time migration proof; future legitimate project edits must remain possible.
for (const demo of process.argv.includes('--migration') ? ['anthrocybernetics', 'ragdoll-lab', 'ragdoll-math-lab'] : []) {
  const expected = original(`${demo}/index.html`).toString()
    .replaceAll('../assets/', '../../assets/').replaceAll('../shared/', '../../shared/');
  assert.equal(await readFile(path.join(root, 'projects', demo, 'index.html'), 'utf8'), expected, `${demo}: change exceeds dependency-path rebase`);
}
for (const [canonical, legacy] of Object.entries({
  'rounds/round-4/submission/index.html': 'round-4/submission/index.html',
  'rounds/round-5/results/luna/submission/index.html': 'round-5/results/luna/submission/index.html',
  'rounds/round-5/results/terra/submission/index.html': 'round-5/results/terra/submission/index.html',
  'rounds/round-5/results/sol/submission/index.html': 'round-5/results/sol/submission/index.html'
})) {
  assert.ok((await stat(path.join(root, canonical))).isFile());
  const redirect = await readFile(path.join(root, legacy), 'utf8');
  let redirected;
  runInNewContext(redirect.match(/<script>([\s\S]*?)<\/script>/)[1], {
    location: { search: '?seed=42', hash: '#demo', replace: target => { redirected = target; } }
  });
  assert.equal(new URL(redirected, `https://example.test/public-html5-demos/${legacy}`).href,
    `https://example.test/public-html5-demos/${canonical}?seed=42#demo`);
}
execFileSync(process.execPath, ['tools/sync-legacy-routes.mjs', '--check'], { cwd: root, stdio: 'inherit' });
console.log(`Layout passed: ${preserved} historical records unchanged; legacy routes preserved.${process.argv.includes('--migration') ? ' Migration proof: 3 demos changed only dependency paths.' : ''}`);
