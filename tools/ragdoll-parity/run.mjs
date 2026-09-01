import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { openBrowserHarness } from '../browser-harness.mjs';
import { compareTraces, reportWithContext } from './compare.mjs';
import { getParityCommandType } from '../../shared/ragdoll-parity/protocol.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);

if (args.includes('--help')) {
  console.log([
    'Usage: node tools/ragdoll-parity/run.mjs [options]',
    '',
    'Options:',
    '  --scenario NAME          Run one scenario; repeat or comma-separate names.',
    '  --determinism-runs N      Repeat each authority trace N times (default: 1).',
    '  --screenshots             Capture configured authority/clone visual steps.',
    '  --headed                  Show the browser.',
    '  --list                    List registered scenarios.'
  ].join('\n'));
  process.exit(0);
}

const optionValues = (name) => args.flatMap((arg, index) => {
  if (arg === name && args[index + 1]) return [args[index + 1]];
  if (arg.startsWith(`${name}=`)) return [arg.slice(name.length + 1)];
  return [];
});

const scenarios = JSON.parse(await readFile(path.join(root, 'tests/parity/scenarios/index.json'), 'utf8'));
if (args.includes('--list')) {
  for (const scenario of scenarios) console.log(scenario.name);
  process.exit(0);
}

const requestedNames = optionValues('--scenario').flatMap((value) => value.split(',')).filter(Boolean);
const requestedSet = new Set(requestedNames);
const selected = requestedSet.size ? scenarios.filter((scenario) => requestedSet.has(scenario.name)) : scenarios;
const missing = requestedNames.filter((name) => !scenarios.some((scenario) => scenario.name === name));
if (missing.length) throw new Error(`Unknown scenario${missing.length === 1 ? '' : 's'}: ${missing.join(', ')}`);

const determinismRaw = optionValues('--determinism-runs').at(-1) ?? '1';
const determinismRuns = Number(determinismRaw);
const captureScreenshots = args.includes('--screenshots');
if (!Number.isInteger(determinismRuns) || determinismRuns < 1 || determinismRuns > 100) {
  throw new Error('--determinism-runs must be an integer from 1 through 100.');
}

const repositoryRevision = (() => {
  try {
    return execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
})();
const runId = new Date().toISOString().replaceAll(':', '-');
const outputRoot = path.join(root, 'output/parity', runId);
await mkdir(outputRoot, { recursive: true });

const hashTrace = (trace) => createHash('sha256').update(JSON.stringify(trace)).digest('hex');
const cloneJson = (value) => JSON.parse(JSON.stringify(value));
const interpolate = (from, to, t) => from.map((value, index) => value + (to[index] - value) * t);
const expandScenario = (scenario) => {
  const commands = (scenario.commands || []).map(cloneJson);
  const trajectory = scenario.cursorTrajectory;
  if (Array.isArray(trajectory)) {
    trajectory.forEach((worldPoint, step) => commands.push({ step, type: 'cursor-target', worldPoint }));
  } else if (trajectory?.from && trajectory?.to) {
    const start = Math.max(0, Math.floor(trajectory.startStep ?? 0));
    const end = Math.max(start, Math.floor(trajectory.endStep ?? scenario.steps - 1));
    for (let step = start; step <= end; step += 1) {
      const t = end === start ? 1 : (step - start) / (end - start);
      commands.push({ step, type: 'cursor-target', worldPoint: interpolate(trajectory.from, trajectory.to, t) });
    }
  }
  for (const command of commands) getParityCommandType(command);
  commands.sort((a, b) => (a.step ?? 0) - (b.step ?? 0));
  return { ...cloneJson(scenario), commands };
};

const markdownReport = (scenario, report) => {
  const divergence = report.divergence;
  const largest = divergence?.largest;
  const aggregate = report.aggregate || {};
  const behavior = scenario.tolerances?.mode === 'behavioral';
  return [
    `# ${scenario.name}`,
    '',
    `Result: ${report.matching && report.determinismMatching ? 'PASS' : 'FAIL'}`,
    `Seed: ${scenario.seed ?? 0}`,
    `Authority deterministic: ${report.determinismMatching ? 'yes' : 'no'} (${report.authorityHashes.length} run${report.authorityHashes.length === 1 ? '' : 's'})`,
    `First divergence: ${divergence ? `step ${divergence.step}` : 'none'}`,
    `Largest first-divergence error: ${largest ? `${largest.body ?? 'trace'} / ${largest.metric}: ${largest.error}` : 'none'}`,
    '',
    '## Aggregate metrics',
    '',
    `- Position RMS: ${aggregate.positionRms ?? 0}`,
    `- Position maximum: ${aggregate.positionMax ?? 0}`,
    `- Quaternion maximum: ${aggregate.quaternionMax ?? 0}`,
    `- Linear-velocity RMS: ${aggregate.linearVelocityRms ?? 0}`,
    `- Angular-velocity RMS: ${aggregate.angularVelocityRms ?? 0}`,
    `- Maximum joint-anchor ${behavior ? 'error' : 'error delta'}: ${aggregate.maxJointAnchorError ?? 0}`,
    `- Hinge limit-state mismatches: ${aggregate.hingeLimitMismatches ?? 0}`,
    `- Contact transition mismatches: ${(aggregate.contactTransitionMismatches || []).length}`,
    `- Sleep transition mismatches: ${(aggregate.sleepTransitionMismatches || []).length}`,
    ...(behavior ? [
      `- Center-of-mass position maximum: ${aggregate.comPositionMax ?? 0}`,
      `- Center-of-mass velocity RMS: ${aggregate.comVelocityRms ?? 0}`,
      `- Durable settle steps: ${aggregate.settleStepA ?? 'none'} / ${aggregate.settleStepB ?? 'none'}`,
      `- Arena exit steps: ${aggregate.exitStepA ?? 'none'} / ${aggregate.exitStepB ?? 'none'}`,
      `- Final pose classes: ${aggregate.finalPoseClassA ?? 'unknown'} / ${aggregate.finalPoseClassB ?? 'unknown'}`
    ] : []),
    '',
    divergence ? 'See `first-divergence.json` for the five frames before and after the divergence.' : 'No tolerance was exceeded.',
    ''
  ].join('\n');
};

const harness = await openBrowserHarness(root, { browserOptions: { headless: !args.includes('--headed') } });
const { address, browser } = harness;

const openBackend = async (folder) => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  const response = await page.goto(`http://127.0.0.1:${address.port}/${folder}?parity=1`, { waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error(`${folder} returned HTTP ${response?.status() ?? 'unknown'}`);
  try {
    await page.waitForFunction(() => typeof window.__ragdollParity?.snapshot === 'function', null, { timeout: 20_000 });
    await page.evaluate(async () => { await window.__ragdollParity.ready; });
  } catch (error) {
    throw new Error(`${folder} parity API did not become ready: ${[error.message, ...errors].join(' | ')}`);
  }
  const missingMethods = await page.evaluate(() => ['reset', 'command', 'step', 'snapshot']
    .filter((name) => typeof window.__ragdollParity?.[name] !== 'function'));
  if (missingMethods.length) throw new Error(`${folder} parity API is missing: ${missingMethods.join(', ')}`);
  return page;
};

const reloadBackend = async (page, folder) => {
  const response = await page.reload({ waitUntil: 'networkidle' });
  if (!response?.ok()) throw new Error(`${folder} returned HTTP ${response?.status() ?? 'unknown'} after reload`);
  await page.waitForFunction(() => typeof window.__ragdollParity?.snapshot === 'function', null, { timeout: 20_000 });
  await page.evaluate(async () => { await window.__ragdollParity.ready; });
};

const snapshot = (page) => page.evaluate(() => window.__ragdollParity.snapshot());
const executeScenario = async (page, sourceScenario, { screenshotDir = null, screenshotPrefix = 'trace' } = {}) => {
  const scenario = expandScenario(sourceScenario);
  const visualSteps = new Set((sourceScenario.visualSteps || []).filter(Number.isFinite));
  const captureStep = async (step) => {
    if (!screenshotDir || !visualSteps.has(step)) return;
    await page.screenshot({
      path: path.join(screenshotDir, `${screenshotPrefix}-step-${String(step).padStart(4, '0')}.png`),
      fullPage: true
    });
  };
  await page.evaluate((value) => window.__ragdollParity.reset(value), scenario);
  const trace = [await snapshot(page)];
  await captureStep(0);
  const appliedCommands = [];
  for (let step = 0; step < scenario.steps; step += 1) {
    for (const command of scenario.commands) {
      if ((command.step ?? 0) !== step) continue;
      const applied = cloneJson(command);
      await page.evaluate((value) => window.__ragdollParity.command(value), applied);
      appliedCommands.push(applied);
    }
    await page.evaluate(() => window.__ragdollParity.step(1));
    trace.push(await snapshot(page));
    await captureStep(step + 1);
  }
  return { trace, appliedCommands, seed: scenario.seed ?? 0 };
};

let failed = false;
try {
  const [authorityPage, clonePage] = await Promise.all([
    openBackend('ragdoll-lab/'),
    openBackend('ragdoll-math-lab/')
  ]);

  for (const scenario of selected) {
    const scenarioOutput = path.join(outputRoot, scenario.name);
    await mkdir(scenarioOutput, { recursive: true });
    try {
      // Each scenario starts from newly constructed worlds. A reset restores
      // public state between identical repeats, while the reload prevents
      // contact/island activation caches leaking from the prior scenario.
      await Promise.all([
        reloadBackend(authorityPage, 'ragdoll-lab/'),
        reloadBackend(clonePage, 'ragdoll-math-lab/')
      ]);
      const authorityRuns = [];
      for (let repeat = 0; repeat < determinismRuns; repeat += 1) {
        authorityRuns.push(await executeScenario(
          authorityPage,
          scenario,
          captureScreenshots && repeat === 0 ? { screenshotDir: scenarioOutput, screenshotPrefix: 'authority' } : {}
        ));
      }
      const cloneRun = await executeScenario(
        clonePage,
        scenario,
        captureScreenshots ? { screenshotDir: scenarioOutput, screenshotPrefix: 'clone' } : {}
      );
      const authorityTrace = authorityRuns[0].trace;
      const authorityHashes = authorityRuns.map((run) => hashTrace(run.trace));
      const determinismMatching = authorityHashes.every((hash) => hash === authorityHashes[0]);
      const comparison = compareTraces(authorityTrace, cloneRun.trace, scenario.tolerances);
      const report = {
        ...reportWithContext(authorityTrace, cloneRun.trace, comparison),
        repositoryRevision,
        runId,
        authorityHashes,
        cloneHash: hashTrace(cloneRun.trace),
        determinismMatching
      };

      await writeFile(path.join(scenarioOutput, 'inputs.json'), JSON.stringify({
        scenario,
        seed: authorityRuns[0].seed,
        appliedCommands: authorityRuns[0].appliedCommands,
        determinismRuns,
        repositoryRevision
      }, null, 2));
      await writeFile(path.join(scenarioOutput, 'authority.jsonl'), `${authorityTrace.map(JSON.stringify).join('\n')}\n`);
      await writeFile(path.join(scenarioOutput, 'clone.jsonl'), `${cloneRun.trace.map(JSON.stringify).join('\n')}\n`);
      await writeFile(path.join(scenarioOutput, 'determinism.json'), JSON.stringify({ authorityHashes, matching: determinismMatching }, null, 2));
      if (!determinismMatching) {
        for (let repeat = 1; repeat < authorityRuns.length; repeat += 1) {
          await writeFile(
            path.join(scenarioOutput, `authority-run-${repeat + 1}.jsonl`),
            `${authorityRuns[repeat].trace.map(JSON.stringify).join('\n')}\n`
          );
        }
      }
      await writeFile(path.join(scenarioOutput, 'report.json'), JSON.stringify(report, null, 2));
      await writeFile(path.join(scenarioOutput, 'report.md'), markdownReport(scenario, report));
      if (report.divergence) {
        await writeFile(path.join(scenarioOutput, 'first-divergence.json'), JSON.stringify({
          divergence: report.divergence,
          context: report.context
        }, null, 2));
      }

      const matching = report.matching && determinismMatching;
      failed ||= !matching;
      const suffix = report.divergence
        ? ` (step ${report.divergence.step}, ${report.divergence.largest?.body ?? 'trace'} / ${report.divergence.largest?.metric ?? report.divergence.metric ?? 'unknown'})`
        : '';
      console.log(`${scenario.name}: ${matching ? 'PASS' : 'FAIL'}${suffix}`);
    } catch (error) {
      failed = true;
      await writeFile(path.join(scenarioOutput, 'error.json'), JSON.stringify({
        scenario: scenario.name,
        message: error.message,
        stack: error.stack
      }, null, 2));
      console.error(`${scenario.name}: ERROR (${error.message})`);
    }
  }
} finally {
  await harness.close();
}

await writeFile(path.join(outputRoot, 'run.json'), JSON.stringify({
  runId,
  repositoryRevision,
  scenarios: selected.map((scenario) => scenario.name),
  determinismRuns,
  screenshots: captureScreenshots,
  matching: !failed
}, null, 2));
process.exitCode = failed ? 1 : 0;
