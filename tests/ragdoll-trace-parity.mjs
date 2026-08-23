import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareTraces, reportWithContext } from '../tools/ragdoll-parity/compare.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
if (args.has('--help')) { console.log('Usage: node tests/ragdoll-trace-parity.mjs [--unit|--scenario NAME]'); process.exit(0); }
const scenarios = JSON.parse(await readFile(path.join(root, 'tests/parity/scenarios/index.json'), 'utf8'));
if (args.has('--unit')) {
  const { compareTraces: compare } = await import('../tools/ragdoll-parity/compare.mjs');
  const frame = { step: 0, bodies: [{ id: 'x', position: [0, 0, 0], rotation: [0, 0, 0, 1], linearVelocity: [0, 0, 0], angularVelocity: [0, 0, 0] }] };
  if (!compare([frame], [frame]).matching) throw new Error('Comparator equal-frame test failed');
  const changed = structuredClone(frame); changed.bodies[0].position[0] = 1;
  if (compare([frame], [changed]).matching) throw new Error('Comparator divergence test failed');
  const objectBody = { ...frame, bodies: { x: frame.bodies[0] } }; if (!compare([frame], [objectBody]).matching) throw new Error('Object-body normalization failed');
  const extraBody = { ...frame, bodies: [...frame.bodies, { id: 'extra', position: [0,0,0], rotation: [0,0,0,1], linearVelocity: [0,0,0], angularVelocity: [0,0,0] }] }; if (compare([frame], [extraBody]).matching) throw new Error('Extra body false pass');
  const rotated = structuredClone(frame); rotated.bodies[0].rotation = [0, 1, 0, 0]; if (compare([frame], [rotated]).matching) throw new Error('Quaternion mismatch missed');
  const joint = { ...frame, joints: [{ id: 'j', anchorError: 1, limitState: 'lower' }] }; const jointClone = { ...frame, joints: [{ id: 'j', anchorError: 0, limitState: 'upper' }] }; if (compare([joint], [jointClone]).matching) throw new Error('Joint mismatch missed');
  const extraJoint = { ...frame, joints: [{ id: 'extra', anchorError: 0 }] }; if (compare([frame], [extraJoint]).matching) throw new Error('Extra joint false pass');

  const trace = (contactStart, sleepStart = Infinity) => Array.from({ length: 8 }, (_, step) => ({
    ...structuredClone(frame),
    step: step * 10,
    contacts: step >= contactStart && step < 6 ? [{ bodyA: 'x', bodyB: 'stage' }] : [],
    bodies: [{ ...structuredClone(frame.bodies[0]), sleeping: step >= sleepStart }]
  }));
  if (!compare(trace(2), trace(3), { ...scenarios[7].tolerances, contactStep: 10 }).matching) throw new Error('Bounded contact transition drift rejected');
  const lateContact = compare(trace(2), trace(4), { ...scenarios[7].tolerances, contactStep: 10 });
  if (lateContact.matching || lateContact.divergence.metric !== 'contact-transition') throw new Error('Late contact transition missed');
  if (!compare(trace(Infinity, 4), trace(Infinity, 5), { ...scenarios[0].tolerances, sleepStep: 10 }).matching) throw new Error('Bounded sleep transition drift rejected');
  const lateSleep = compare(trace(Infinity, 3), trace(Infinity, 5), { ...scenarios[0].tolerances, sleepStep: 10 });
  if (lateSleep.matching || lateSleep.divergence.metric !== 'sleep-transition') throw new Error('Late sleep transition missed');

  const mixed = structuredClone(frame);
  mixed.bodies[0].position[0] = 0.2;
  mixed.bodies[0].angularVelocity[0] = 0.02;
  const attributed = compare([frame], [mixed], { ...scenarios[0].tolerances, position: 1, angularVelocity: 0.001 });
  if (attributed.divergence?.largest?.metric !== 'angularVelocity') throw new Error('Threshold-ratio attribution failed');

  const behavioralTolerance = { mode: 'behavioral', comPosition: .1, comVelocity: .2, joint: .1, contactStep: 2, contactCount: 1, exitRadius: 4.5, exitStep: 2, settleLinear: .05, settleAngular: .05, settleStep: 2, poseVelocity: .25 };
  const behaviorFrame = (step, x, sleeping = false, contacts = []) => ({ step, bodies: [{ id: 'x', mass: 2, position: [x, 1, 0], rotation: [0, 0, 0, 1], linearVelocity: [0, 0, 0], angularVelocity: [0, 0, 0], sleeping }], contacts });
  const behaviorA = [behaviorFrame(0, 0), behaviorFrame(1, 0), behaviorFrame(2, 5, true, [{ bodyA: 'x', bodyB: 'stage' }])];
  const behaviorB = [behaviorFrame(0, .02), behaviorFrame(1, .02), behaviorFrame(3, 5, true, [{ bodyA: 'x', bodyB: 'stage' }])];
  if (!compare(behaviorA, behaviorB, behavioralTolerance).matching) throw new Error('Behavioral bounded COM/contact/exit comparison rejected');
  const behaviorBad = [behaviorFrame(0, 0), behaviorFrame(1, 0), behaviorFrame(2, 5.4, true, [{ bodyA: 'x', bodyB: 'stage' }])];
  const badBehavior = compare(behaviorA, behaviorBad, behavioralTolerance);
  if (badBehavior.matching || !['comPosition', 'arena-exit'].includes(badBehavior.divergence?.metric)) throw new Error('Behavioral COM/exit divergence missed');
  const jointBad = structuredClone(behaviorA); jointBad[2].joints = [{ id: 'j', anchorError: .2 }]; const jointRef = structuredClone(behaviorA); jointRef[2].joints = [{ id: 'j', anchorError: .01 }];
  if (compare(jointRef, jointBad, behavioralTolerance).matching) throw new Error('Behavioral absolute clone joint bound missed');
  const countBad = structuredClone(behaviorA); countBad[2].contacts = [{ bodyA: 'x', bodyB: 'stage' }, { bodyA: 'y', bodyB: 'stage' }];
  if (compare(behaviorA, countBad, { ...behavioralTolerance, contactCount: 0 }).matching) throw new Error('Behavioral stage contact count mismatch missed');
  const velocityBad = structuredClone(behaviorA); velocityBad[2].bodies[0].linearVelocity = [1, 0, 0];
  if (compare(behaviorA, velocityBad, behavioralTolerance).matching) throw new Error('Behavioral COM velocity mismatch missed');
  const strictBehavior = compare([behaviorFrame(0, 0)], [behaviorFrame(0, .02)], { position: .001, rotation: .001, linearVelocity: .001, angularVelocity: .001, joint: .001 });
  if (strictBehavior.matching) throw new Error('Strict mode was weakened by behavioral support');
  if (compare([], []).matching || compare([], [frame]).matching || compare([{ nope: true }], [{ nope: true }]).matching) throw new Error('Invalid/empty traces must diverge');
  const invalidSchema = compare([{ nope: true }], [{ nope: true }]);
  const serializedInvalidSchema = JSON.parse(JSON.stringify(invalidSchema));
  if (invalidSchema.divergence?.error !== 'invalid-schema' || serializedInvalidSchema.divergence?.error !== 'invalid-schema') {
    throw new Error('Invalid-schema diagnostics must survive JSON serialization');
  }
  for (const malformedBody of [
    { id: 'x', rotation: [0, 0, 0, 1], linearVelocity: [0, 0, 0], angularVelocity: [0, 0, 0] },
    { ...frame.bodies[0], position: [Number.NaN, 0, 0] },
    { ...frame.bodies[0], rotation: [0, 0, 0, 0] }
  ]) {
    const malformed = compare([{ step: 0, bodies: [malformedBody] }], [frame]);
    const serialized = JSON.parse(JSON.stringify(malformed));
    if (malformed.matching || malformed.divergence?.metric !== 'body-schema' || serialized.divergence?.error !== 'invalid-schema') {
      throw new Error('Malformed body schema must produce a serializable divergence');
    }
  }
  const comBad = compare([behaviorFrame(0, 0)], [behaviorFrame(0, .5)], behavioralTolerance);
  if (comBad.divergence?.metric !== 'comPosition' || comBad.divergence.error !== comBad.divergence.comPosition) throw new Error('Behavioral COM error attribution failed');
  const settleFrame = (step, sleeping) => ({ ...behaviorFrame(step, 0, sleeping), bodies: [{ ...behaviorFrame(step, 0, sleeping).bodies[0], linearVelocity: sleeping ? [0, 0, 0] : [0.2, 0, 0] }] });
  const settleTol = { ...behavioralTolerance, comPosition: 1, comVelocity: 1, settleLinear: .05, settleAngular: .05, settleStep: 1 };
  const transientSettleA = [settleFrame(0, false), settleFrame(1, true), settleFrame(2, false), settleFrame(3, true)];
  const transientSettleB = [settleFrame(0, false), settleFrame(1, false), settleFrame(2, false), settleFrame(3, true)];
  if (!compare(transientSettleA, transientSettleB, settleTol).matching) throw new Error('Transient early settle state should be ignored');
  const lateSettle = [...transientSettleB.slice(0, 3), settleFrame(5, true)];
  if (compare(transientSettleA, lateSettle, settleTol).matching) throw new Error('Final settle-entry timing mismatch missed');
  const exitA = [behaviorFrame(0, 0), behaviorFrame(1, 5, true)]; const exitB = [behaviorFrame(0, 0), behaviorFrame(2, 5, false)];
  if (!compare(exitA, exitB, { ...settleTol, exitStep: 2 }).matching) throw new Error('Post-exit settle mismatch should be ignored');
  const poseBase = behaviorFrame(1, 0); poseBase.bodies[0].position[1] = .5;
  const poseA = [behaviorFrame(0, 0), poseBase]; const poseB = [behaviorFrame(0, 0), { ...poseBase, bodies: [{ ...poseBase.bodies[0], rotation: [1, 0, 0, 0] }] }];
  const poseMismatch = compare(poseA, poseB, { ...settleTol, poseVertical: .45 });
  if (poseMismatch.matching || poseMismatch.divergence?.step !== 1) throw new Error('Final-only pose mismatch step attribution failed');
  console.log(`Trace comparator passed; ${scenarios.length} scenarios registered.`); process.exit(0);
}
// Browser driving is opt-in so the focused comparator unit check stays dependency-free.
const requested = process.argv.find((arg) => arg.startsWith('--scenario='));
if (requested && !scenarios.some((scenario) => scenario.name === requested.slice(11))) throw new Error(`Unknown scenario: ${requested.slice(11)}`);
if (process.env.CODEX_NODE_MODULES || process.env.NODE_PATH || process.env.PARITY_BROWSER) {
  const { spawn } = await import('node:child_process');
  const child = spawn(process.execPath, ['tools/ragdoll-parity/run.mjs', ...process.argv.slice(2)], { cwd: root, stdio: 'inherit', env: process.env });
  child.on('exit', (code) => process.exit(code ?? 1));
  await new Promise(() => {});
}
console.error('Browser adapter unavailable; set CODEX_NODE_MODULES or PARITY_BROWSER.');
process.exit(2);
