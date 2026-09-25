import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Map(process.argv.slice(2).map(arg => {
  const match = arg.match(/^--([^=]+)=(.+)$/);
  if (!match) throw new Error(`Expected --name=value, got ${arg}`);
  return match.slice(1);
}));
if ([...args.keys()].some(key => !['out', 'arm'].includes(key))) throw new Error('Unknown option');
const arm = args.get('arm');
if (!['luna', 'sol', 'astra'].includes(arm)) throw new Error('Use --arm=luna|sol|astra');
if (!args.get('out') || !path.isAbsolute(args.get('out'))) throw new Error('--out must be an absolute, new directory outside the repository');
const out = path.resolve(args.get('out'));
const inside = (parent, candidate) => candidate === parent || candidate.startsWith(parent + path.sep);
if (inside(root, out)) throw new Error('Candidate workspace must be outside the repository');
const config = JSON.parse(await readFile(path.join(root, 'rounds/round-5-5/EXPERIMENT.json'), 'utf8'));
const sourceCommit = config.sourceContentCommit;
if (!/^[a-f0-9]{40}$/.test(sourceCommit)) throw new Error('Invalid frozen source commit');
const atRevision = relative => execFileSync('git', ['show', `${sourceCommit}:${relative}`], {
  cwd: root, maxBuffer: 32 * 1024 * 1024
});
const manifest = JSON.parse(atRevision('round-5/EXPERIMENT.json'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const canonical = (name, bytes) => manifest.integrity.textExtensions.includes(path.extname(name))
  ? Buffer.from(bytes.toString().replaceAll('\r\n', '\n')) : bytes;
const files = new Map();
for (const [name, expected] of Object.entries(manifest.frozenInputs)) {
  if (path.isAbsolute(name) || name.split('/').includes('..') || /(?:^|\/)(?:results|submission|\.git)(?:\/|$)/.test(name)) {
    throw new Error(`Unsafe or solution-bearing frozen path: ${name}`);
  }
  const bytes = atRevision(name);
  if (sha256(canonical(name, bytes)) !== expected) throw new Error(`Frozen input mismatch: ${name}`);
  files.set(name, bytes);
}
for (const ref of Object.values(manifest.references)) {
  const bytes = atRevision(ref.path);
  if (sha256(bytes) !== ref.sha256) throw new Error(`Reference mismatch: ${ref.path}`);
  files.set(ref.path, bytes);
}
// Record the final baseline pointer, as the historical archive verifier does.
manifest.baseline.commit = sourceCommit;
files.set('round-5/EXPERIMENT.json', Buffer.from(JSON.stringify(manifest, null, 2) + '\n'));

const originalRunner = files.get('round-4/harness/run-scenarios.mjs').toString();
const importAnchor = "from '../../tools/browser-harness.mjs'";
if (originalRunner.split(importAnchor).length !== 2) throw new Error('Scenario adapter anchor drifted');
// At tools/run-scenarios.mjs the unchanged '..' root points at this clean packet.
files.set('tools/run-scenarios.mjs', Buffer.from(originalRunner.replace(importAnchor, "from './browser-harness.mjs'")));
files.set('tools/check-submission.mjs', await readFile(path.join(root, 'rounds/round-5-5/harness/check-submission.mjs')));
files.set('verify-inputs.mjs', Buffer.from(`import {createHash} from 'node:crypto';
import {readFile,readdir,lstat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url));
const manifest=JSON.parse(await readFile(path.join(root,'PACKAGE.json'),'utf8'));
for(const [name,expected] of Object.entries(manifest.sha256)){
  if(name.split('/').includes('..')||path.isAbsolute(name))throw new Error('Unsafe package path');
  const hash=createHash('sha256').update(await readFile(path.join(root,name))).digest('hex');
  if(hash!==expected)throw new Error('Input changed: '+name);
}
async function walk(dir,prefix=''){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const name=prefix+entry.name;
    if(entry.isSymbolicLink())throw new Error('Unexpected symlink: '+name);
    if(name==='submission')continue;
    if(entry.isDirectory())await walk(path.join(dir,entry.name),name+'/');
    else if(name!=='PACKAGE.json'&&!Object.hasOwn(manifest.sha256,name))throw new Error('Unexpected input: '+name);
  }
}
await walk(root);
console.log('Package integrity passed. This does not authorize dispatch; common environment/critic preflight is still required.');
`));
files.set('TASK.md', Buffer.from(`# Round 5.5 candidate task

Your assigned arm and requested model are in PACKAGE.json. Work only in this
workspace. The original round-4/ and round-5/ paths are deliberate frozen inputs.
No previous implementation is supplied. Do not search for one.

Wait for the operator's common environment receipt and start signal before any
implementation. Unavailable tools mean BLOCKED, not permission to skip a gate.
Read round-5/PASSDOWN.md, round-5/PLAN.md, round-5/RUBRIC.md and their required
context files. Inspect the supplied images through native image view. Follow the
local haio-visual-critic skill and the complete checkpoint sequence.

Write only inside submission/, including temporary scripts and evidence. You may
read only this packet and required runtime dependencies. Do not inspect sibling
directories, Git history, any other checkout, earlier results or hidden operator
tests. No memory retrieval, repository/web search, extra agents, image generation
or external solution/templates. Fetch only the pinned runtime CDN dependencies.
Record accidental exposure immediately and stop; never hide it or restart.

Create TOOL_LEDGER.md and VISUAL_CONTRACT.md before game code. At each checkpoint,
preserve the blind self-review before requesting the fixed external critique from
the operator. Do not relabel a second self-review as external feedback. Preserve
before/after images and disagreements. Do not request coding help from the parent.

Canonical artifact: submission/index.html. Static check: node tools/check-submission.mjs.
Functional scenarios: node tools/run-scenarios.mjs. Integrity: node verify-inputs.mjs.
The original round-4 static verifier expects an old operator report and is supplied
only as a frozen historical input; use the portable static check above. Do not run
the old Git-dependent package verifier in this history-free workspace.

The operator starts a 60-minute wall-clock timer. Stop at its expiry or the frozen
repair limits: 3 visual per checkpoint, 12 visual overall, 8 functional. Keep the
original 90/100, 24/30, 16/20 scores separate and never relax hard gates. No informal
extension, retries from scratch or best-of-N. Do not claim an unrun test passed.

Finish with the required decisions, contract, ledger, visual review, evidence and
screenshots. Record observed model/environment, timestamps, repairs, tool failures
and interventions; unavailable token telemetry is null. Seal output when done;
independent operator evaluation happens outside this workspace.
`));

const outputManifest = {
  schemaVersion: 1, round: '5.5', arm, requestedModel: `gpt-6-${arm}`,
  reasoningEffort: 'high', sourceCommit, status: 'prepared-not-dispatched',
  requiredEnvironment: config.requiredEnvironment,
  adapter: { path: 'tools/run-scenarios.mjs', change: 'Only module import/root location; original scenario assertions unchanged' },
  sha256: Object.fromEntries([...files].map(([name, bytes]) => [name, sha256(bytes)]))
};
// All source reads and checks complete before creating a candidate directory.
await mkdir(path.dirname(out), { recursive: true });
if (inside(await realpath(root), await realpath(path.dirname(out)))) throw new Error('Destination resolves inside source repository');
await mkdir(out); // Refuse existing outputs; never overwrite a candidate attempt.
for (const [name, bytes] of files) {
  const destination = path.join(out, name);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
}
await mkdir(path.join(out, 'submission'));
const packageBytes = JSON.stringify(outputManifest, null, 2) + '\n';
await writeFile(path.join(out, 'PACKAGE.json'), packageBytes);
console.log(`Prepared ${arm}: ${files.size} checksummed inputs at ${out}. No model was started.`);
console.log(`Operator seal (retain outside builder workspace): PACKAGE.json SHA-256 ${sha256(packageBytes)}`);
