import { existsSync } from 'node:fs';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createStaticServer } from '../tools/ragdoll-parity/static-server.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = process.env.CODEX_NODE_MODULES || process.env.NODE_PATH;
let playwright;
try {
  const loaded = await import(modules
    ? pathToFileURL(path.join(modules, 'playwright', 'index.js')).href
    : 'playwright');
  playwright = loaded.default || loaded;
} catch (error) {
  console.error(`Playwright unavailable: ${error.message}`);
  process.exit(2);
}

const executablePath = process.env.PARITY_BROWSER || (process.platform === 'win32'
  ? [
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
    ].find(existsSync)
  : undefined);
const server = createStaticServer(root);
const address = await server.listen();
const browser = await playwright.chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const reportMode = process.argv.includes('--report');
const compactReportMode = process.argv.includes('--report-compact');
const captureTemporal = process.argv.includes('--capture-temporal');
const temporalCaptureDir = captureTemporal ? await mkdtemp(path.join(tmpdir(), 'ragdoll-temporal-')) : null;
const temporalCaptureSteps = new Set([90, 120, 150, 180, 210, 240]);

const magnitude = (values) => Math.hypot(...values);
const maxBy = (items, selector) => Math.max(0, ...items.map(selector));
const stageContactCount = (snapshot) => snapshot.contacts.filter((contact) => contact.bodyB === 'stage').length;
const bodyById = (snapshot, id) => snapshot.bodies.find((body) => body.sourceId === id || body.id === id);
const centerOfMass = (snapshot) => {
  const totalMass = snapshot.bodies.reduce((total, body) => total + (body.mass || 1), 0);
  return [0, 1, 2].map((axis) => snapshot.bodies.reduce(
    (total, body) => total + body.position[axis] * (body.mass || 1),
    0
  ) / totalMass);
};
const poseMetrics = (snapshot) => {
  const bounds = [0, 1, 2].map((axis) => {
    const values = snapshot.bodies.map((body) => body.position[axis]);
    return Math.max(...values) - Math.min(...values);
  });
  return {
    centerOfMass: centerOfMass(snapshot).map((value) => +value.toFixed(4)),
    bounds: bounds.map((value) => +value.toFixed(4)),
    stageContacts: stageContactCount(snapshot),
    maxJointError: +maxBy(snapshot.joints, (joint) => joint.anchorError).toFixed(4)
  };
};
const maxPositionDelta = (first, second) => maxBy(first.bodies, (body) => {
  const other = bodyById(second, body.sourceId || body.id);
  return other ? Math.hypot(...body.position.map((value, index) => value - other.position[index])) : Infinity;
});

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const assertNear = (actual, expected, tolerance, label) => {
  assert(
    Math.abs(actual - expected) <= tolerance,
    `${label}: ${actual.toFixed(4)} differs from the Rapier oracle ${expected.toFixed(4)} by more than ${tolerance}`
  );
};

const assertAssistedOracleMatch = (oracle, candidate) => {
  for (const motion of ['drop', 'toss', 'reverseToss', 'twistToss']) {
    const oracleResult = oracle[motion];
    const candidateResult = candidate[motion];
    assertNear(candidateResult.broadSupportStep, oracleResult.broadSupportStep, 90, `${motion} broad-support step`);
    assert(candidateResult.sleepStep !== null, `${motion}: Math did not settle within the test window`);
    assert(
      candidateResult.sleepStep >= candidateResult.qualifiedSupportStep + 30,
      `${motion}: Math slept before half a second of low-hips, eight-body support`
    );
    const oracleSettlingTail = oracleResult.sleepStep - oracleResult.qualifiedSupportStep;
    const candidateSettlingTail = candidateResult.sleepStep - candidateResult.qualifiedSupportStep;
    assert(
      candidateSettlingTail <= oracleSettlingTail + 35,
      `${motion}: Math kept solving for ${candidateSettlingTail} steps after landing; the Rapier tail was ${oracleSettlingTail}`
    );
    assert(
      candidateResult.sleepStep <= oracleResult.sleepStep + 30,
      `${motion}: Math stayed active longer than the Rapier oracle`
    );
    assert(
      candidateResult.sleepTransitionDelta <= .02,
      `${motion}: Math snapped ${candidateResult.sleepTransitionDelta.toFixed(4)} m while entering sleep`
    );
    assertNear(
      candidateResult.pose.centerOfMass[1],
      oracleResult.pose.centerOfMass[1],
      .12,
      `${motion} resting center-of-mass height`
    );
    const boundTolerance = motion === 'drop' || motion === 'toss' ? .7 : 1.25;
    const oracleHorizontalBounds = [oracleResult.pose.bounds[0], oracleResult.pose.bounds[2]].sort((a, b) => a - b);
    const candidateHorizontalBounds = [candidateResult.pose.bounds[0], candidateResult.pose.bounds[2]].sort((a, b) => a - b);
    assertNear(candidateHorizontalBounds[0], oracleHorizontalBounds[0], boundTolerance, `${motion} narrow resting bound`);
    assertNear(candidateHorizontalBounds[1], oracleHorizontalBounds[1], boundTolerance, `${motion} long resting bound`);
    // The custom solver exposes one endpoint contact per capsule while Rapier
    // can retain a denser manifold; compare the supported island, not identical
    // manifold cardinality.
    assertNear(candidateResult.pose.stageContacts, oracleResult.pose.stageContacts, 5, `${motion} resting stage contacts`);
    assert(
      candidateResult.pose.maxJointError <= .03,
      `${motion}: Math retained ${candidateResult.pose.maxJointError.toFixed(4)} m of final joint error`
    );
  }

  assertNear(candidate.drag.footTravel, oracle.drag.footTravel, .1, 'dragged foot travel');
  assert(
    Math.abs(candidate.drag.hipsTravel) <= Math.abs(oracle.drag.hipsTravel) + .3,
    `dragged hips response: ${candidate.drag.hipsTravel.toFixed(4)} exceeded the oracle envelope`
  );
  assert(
    candidate.drag.pullJointError <= .02,
    `moving drag retained ${candidate.drag.pullJointError.toFixed(4)} m of joint error`
  );
  assertNear(candidate.drag.heldLinearSpeed, oracle.drag.heldLinearSpeed, .25, 'floor-hold linear speed');
  assert(
    candidate.drag.heldAngularSpeed <= oracle.drag.heldAngularSpeed + .5,
    `floor-hold angular speed ${candidate.drag.heldAngularSpeed.toFixed(4)} exceeded the oracle envelope`
  );
  assertNear(candidate.drag.floorContacts, oracle.drag.floorContacts, 5, 'floor-hold stage contacts');
  assert(
    candidate.drag.floorJointError <= .02,
    `floor hold retained ${candidate.drag.floorJointError.toFixed(4)} m of joint error`
  );
  assert(
    candidate.drag.releaseSleepStep <= oracle.drag.releaseSleepStep + 90,
    `drag release settled at step ${candidate.drag.releaseSleepStep}, after the oracle's ${oracle.drag.releaseSleepStep}`
  );
  assert(
    candidate.nudge.sleepStep <= oracle.nudge.sleepStep + 30,
    `post-landing nudge settled at step ${candidate.nudge.sleepStep}, after the oracle's ${oracle.nudge.sleepStep}`
  );
};

const assertFiniteSnapshot = (snapshot, label) => {
  assert(snapshot.bodies.length === 18, `${label}: expected 18 bodies, received ${snapshot.bodies.length}`);
  assert(snapshot.joints.length === 17, `${label}: expected 17 joints, received ${snapshot.joints.length}`);
  for (const body of snapshot.bodies) {
    for (const [field, values] of Object.entries({
      position: body.position,
      rotation: body.rotation,
      linearVelocity: body.linearVelocity,
      angularVelocity: body.angularVelocity
    })) {
      assert(Array.isArray(values) && values.every(Number.isFinite), `${label}: ${body.id} has a non-finite ${field}`);
    }
    const quaternionLength = magnitude(body.rotation);
    assert(Math.abs(quaternionLength - 1) <= .002, `${label}: ${body.id} quaternion length is ${quaternionLength}`);
  }
  for (const joint of snapshot.joints) {
    assert(Number.isFinite(joint.anchorError), `${label}: ${joint.id} has a non-finite anchor error`);
    assert(joint.anchorError <= .15, `${label}: ${joint.id} stretched to ${joint.anchorError.toFixed(4)} m`);
  }
};

const openBackend = async (folder) => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  const response = await page.goto(`http://127.0.0.1:${address.port}/${folder}?manual=1`, { waitUntil: 'networkidle' });
  assert(response?.ok(), `${folder}: HTTP ${response?.status() ?? 'unknown'}`);
  await page.waitForFunction(() => typeof window.__ragdollParity?.snapshot === 'function', null, { timeout: 20_000 });
  await page.evaluate(async () => { await window.__ragdollParity.ready; });
  assert(errors.length === 0, `${folder}: startup errors: ${errors.join(' | ')}`);
  return { page, errors };
};

const resetFull = async (page, label) => {
  await page.evaluate((name) => window.__ragdollParity.reset({ name, kind: 'full' }), label);
  const snapshot = await page.evaluate(() => window.__ragdollParity.snapshot());
  assertFiniteSnapshot(snapshot, `${label} reset`);
  assert(maxBy(snapshot.bodies, (body) => magnitude(body.linearVelocity)) <= 1e-8, `${label}: reset retained linear velocity`);
  assert(maxBy(snapshot.bodies, (body) => magnitude(body.angularVelocity)) <= 1e-8, `${label}: reset retained angular velocity`);
  return snapshot;
};

const runSettlingCase = async (page, label, start) => {
  const initial = await resetFull(page, label);
  await start();
  const pausedBefore = await page.evaluate(() => window.__ragdollParity.snapshot());
  await page.waitForTimeout(100);
  const pausedAfter = await page.evaluate(() => window.__ragdollParity.snapshot());
  assert(maxPositionDelta(pausedBefore, pausedAfter) <= 1e-9, `${label}: manual-step mode advanced on the display clock`);
  const checkpoints = new Map();
  const motionSamples = [];
  let sawBroadSupport = false;
  let broadSupportStep = null;
  let qualifiedSupportStep = null;
  let sleepStep = null;
  let sleepTransitionDelta = 0;
  let preSleepMaxJointError = 0;
  let preSleepWorstJoint = 'none';
  let previousFrame = pausedBefore;
  for (let step = 30; step <= 480; step += 30) {
    const frames = await page.evaluate(() => {
      const nextFrames = [];
      for (let index = 0; index < 30; index += 1) {
        window.__ragdollParity.step(1);
        nextFrames.push(window.__ragdollParity.snapshot());
      }
      return nextFrames;
    });
    for (let index = 0; index < frames.length; index += 1) {
      const frame = frames[index];
      const frameStep = step - frames.length + index + 1;
      assertFiniteSnapshot(frame, `${label} frame ${frameStep}`);
      if (stageContactCount(frame) >= 5) {
        sawBroadSupport = true;
        broadSupportStep ??= frameStep;
      }
      const frameHips = bodyById(frame, 'hips');
      if (stageContactCount(frame) >= 8 && frameHips?.position[1] <= .9) qualifiedSupportStep ??= frameStep;
      const frameSleeping = frame.bodies.every((body) => body.sleeping === true);
      const previousSleeping = previousFrame.bodies.every((body) => body.sleeping === true);
      if (frameSleeping && !previousSleeping) {
        sleepStep ??= frameStep;
        sleepTransitionDelta = Math.max(sleepTransitionDelta, maxPositionDelta(previousFrame, frame));
        const worstJoint = previousFrame.joints.reduce(
          (worst, joint) => joint.anchorError > worst.anchorError ? joint : worst,
          { id: 'none', anchorError: 0 }
        );
        preSleepMaxJointError = worstJoint.anchorError;
        preSleepWorstJoint = worstJoint.id;
      }
      previousFrame = frame;
    }
    const snapshot = frames.at(-1);
    assertFiniteSnapshot(snapshot, `${label} step ${step}`);
    if (temporalCaptureDir && temporalCaptureSteps.has(step)
      && (label.endsWith('-drop') || label.endsWith('-reverse-toss'))) {
      await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => resolve())));
      await page.screenshot({ path: path.join(temporalCaptureDir, `${label}-step-${step}.png`) });
    }
    motionSamples.push({
      step,
      linear: +maxBy(snapshot.bodies, (body) => magnitude(body.linearVelocity)).toFixed(4),
      angular: +maxBy(snapshot.bodies, (body) => magnitude(body.angularVelocity)).toFixed(4),
      centerY: +centerOfMass(snapshot)[1].toFixed(4),
      contacts: stageContactCount(snapshot),
      sleeping: snapshot.bodies.every((body) => body.sleeping === true)
    });
    if (step === 360 || step === 480) checkpoints.set(step, snapshot);
  }
  const atSixSeconds = checkpoints.get(360);
  const final = checkpoints.get(480);
  const hips = bodyById(final, 'hips');
  const finalLinearSpeed = maxBy(final.bodies, (body) => magnitude(body.linearVelocity));
  const finalAngularSpeed = maxBy(final.bodies, (body) => magnitude(body.angularVelocity));
  const finalStageContacts = stageContactCount(final);
  const finalWorstJoint = final.joints.reduce((worst, joint) => joint.anchorError > worst.anchorError ? joint : worst, { id: 'none', anchorError: 0 });
  const finalJointError = finalWorstJoint.anchorError;
  assert(sawBroadSupport, `${label}: never established broad stage support`);
  assert(qualifiedSupportStep !== null, `${label}: never established low-hips, eight-body stage support`);
  assert(hips && hips.position[1] <= .9, `${label}: hips did not reach a resting height`);
  if (!reportMode) {
    assert(finalLinearSpeed <= .16, `${label}: final linear speed ${finalLinearSpeed.toFixed(4)} is not quiet (angular ${finalAngularSpeed.toFixed(4)}, ${finalStageContacts} stage contacts)`);
    assert(finalAngularSpeed <= .5, `${label}: final angular speed ${finalAngularSpeed.toFixed(4)} is not quiet (${finalStageContacts} stage contacts)`);
    assert(final.bodies.every((body) => body.sleeping === true), `${label}: not every body entered sleep`);
    assert(maxPositionDelta(atSixSeconds, final) <= .005, `${label}: body crept after six seconds`);
    assert(finalJointError <= .03, `${label}: ${finalWorstJoint.id} remained stretched by ${finalJointError.toFixed(4)} m`);
  }
  const reset = await resetFull(page, `${label}-post`);
  assert(maxPositionDelta(initial, reset) <= 1e-7, `${label}: reset did not restore the original pose`);
  return {
    broadSupportStep,
    qualifiedSupportStep,
    sleepStep,
    sleepTransitionDelta: +sleepTransitionDelta.toFixed(5),
    preSleepMaxJointError: +preSleepMaxJointError.toFixed(5),
    preSleepWorstJoint,
    driftAfterSixSeconds: +maxPositionDelta(atSixSeconds, final).toFixed(5),
    finalLinearSpeed: +finalLinearSpeed.toFixed(4),
    finalAngularSpeed: +finalAngularSpeed.toFixed(4),
    pose: poseMetrics(final),
    ...(reportMode ? { motionSamples } : {})
  };
};

const settleAfterDisturbance = async (page, label, before, { requireMovement = false } = {}) => {
  let sleepStep = null;
  let maxMotion = 0;
  let nearFinal;
  let final;
  for (let step = 30; step <= 360; step += 30) {
    await page.evaluate(() => window.__ragdollParity.step(30));
    final = await page.evaluate(() => window.__ragdollParity.snapshot());
    assertFiniteSnapshot(final, `${label} step ${step}`);
    maxMotion = Math.max(maxMotion, maxPositionDelta(before, final));
    if (final.bodies.every((body) => body.sleeping === true)) sleepStep ??= step;
    if (step === 300) nearFinal = final;
  }
  assert(!requireMovement || maxMotion >= .01, `${label}: disturbance did not wake and move the ragdoll`);
  assert(sleepStep !== null, `${label}: ragdoll did not return to sleep within six seconds`);
  assert(maxPositionDelta(nearFinal, final) <= .005, `${label}: ragdoll crept during its final second`);
  return {
    sleepStep,
    maxMotion: +maxMotion.toFixed(4),
    finalSecondDrift: +maxPositionDelta(nearFinal, final).toFixed(5)
  };
};

const runPostLandingNudgeCase = async (page, label) => {
  const initial = await resetFull(page, label);
  await page.getByRole('button', { name: 'Drop Soldier' }).click();
  await page.evaluate(() => window.__ragdollParity.step(240));
  const landed = await page.evaluate(() => window.__ragdollParity.snapshot());
  assertFiniteSnapshot(landed, `${label} landed`);
  assert(landed.bodies.every((body) => body.sleeping === true), `${label}: initial drop did not sleep before nudge`);
  await page.evaluate(() => window.__ragdollParity.command({
    type: 'apply-impulse',
    body: 'upperChest',
    linear: [.18, .7, -.09],
    angular: [.14, -.08, .16]
  }));
  const recovery = await settleAfterDisturbance(page, label, landed, { requireMovement: true });
  const reset = await resetFull(page, `${label}-post`);
  assert(maxPositionDelta(initial, reset) <= 1e-7, `${label}: reset after nudge did not restore the original pose`);
  return recovery;
};

const runDragCase = async (page, label) => {
  const initial = await resetFull(page, label);
  const initialFoot = bodyById(initial, 'leftFoot');
  const initialHips = bodyById(initial, 'hips');
  assert(initialFoot && initialHips, `${label}: drag bodies are missing`);
  const start = [...initialFoot.position];
  await page.evaluate((worldPoint) => window.__ragdollParity.command({
    type: 'cursor-start',
    body: 'leftFoot',
    worldPoint
  }), start);
  let final;
  for (let step = 1; step <= 90; step += 1) {
    const progress = step / 90;
    const target = [start[0] + 1.8 * progress, start[1] + .2 * progress, start[2]];
    await page.evaluate((worldPoint) => window.__ragdollParity.command({ type: 'cursor-target', worldPoint }), target);
    await page.evaluate(() => window.__ragdollParity.step(1));
    if (step % 10 === 0 || step === 90) {
      final = await page.evaluate(() => window.__ragdollParity.snapshot());
      assertFiniteSnapshot(final, `${label} step ${step}`);
    }
  }
  const finalFoot = bodyById(final, 'leftFoot');
  const finalHips = bodyById(final, 'hips');
  const footTravel = finalFoot.position[0] - initialFoot.position[0];
  const hipsTravel = finalHips.position[0] - initialHips.position[0];
  const worstJoint = final.joints.reduce((worst, joint) => joint.anchorError > worst.anchorError ? joint : worst, { id: 'none', anchorError: 0 });
  assert(footTravel >= 1, `${label}: selected foot only followed ${footTravel.toFixed(3)} m`);
  assert(Math.abs(hipsTravel) >= .08, `${label}: hips only reacted by ${hipsTravel.toFixed(3)} m`);
  assert(worstJoint.anchorError <= .12, `${label}: ${worstJoint.id} stretched by ${worstJoint.anchorError.toFixed(4)} m while pulling`);

  const floorTarget = [start[0] + 1.8, .18, start[2]];
  let sawFloorContact = false;
  for (let step = 1; step <= 120; step += 1) {
    await page.evaluate((worldPoint) => window.__ragdollParity.command({ type: 'cursor-target', worldPoint }), floorTarget);
    await page.evaluate(() => window.__ragdollParity.step(1));
    if (step % 10 !== 0) continue;
    final = await page.evaluate(() => window.__ragdollParity.snapshot());
    assertFiniteSnapshot(final, `${label} floor hold ${step}`);
    sawFloorContact ||= stageContactCount(final) > 0;
  }
  const heldLinearSpeed = maxBy(final.bodies, (body) => magnitude(body.linearVelocity));
  const heldAngularSpeed = maxBy(final.bodies, (body) => magnitude(body.angularVelocity));
  const heldWorstJoint = final.joints.reduce((worst, joint) => joint.anchorError > worst.anchorError ? joint : worst, { id: 'none', anchorError: 0 });
  assert(sawFloorContact, `${label}: floorward hold never contacted the stage`);
  assert(heldLinearSpeed <= 1, `${label}: floorward hold retained ${heldLinearSpeed.toFixed(3)} m/s linear jitter`);
  assert(heldAngularSpeed <= 3.5, `${label}: floorward hold retained ${heldAngularSpeed.toFixed(3)} rad/s angular jitter`);
  assert(heldWorstJoint.anchorError <= .12, `${label}: ${heldWorstJoint.id} stretched by ${heldWorstJoint.anchorError.toFixed(4)} m against the floor`);
  await page.evaluate(() => window.__ragdollParity.command({ type: 'cursor-end' }));
  const release = await settleAfterDisturbance(page, `${label} release`, final);
  const reset = await resetFull(page, `${label}-post`);
  assert(maxPositionDelta(initial, reset) <= 1e-7, `${label}: reset after dragging did not restore the original pose`);
  return {
    footTravel: +footTravel.toFixed(4),
    hipsTravel: +hipsTravel.toFixed(4),
    pullJointError: +worstJoint.anchorError.toFixed(4),
    heldLinearSpeed: +heldLinearSpeed.toFixed(4),
    heldAngularSpeed: +heldAngularSpeed.toFixed(4),
    floorContacts: stageContactCount(final),
    floorJointError: +heldWorstJoint.anchorError.toFixed(4),
    releaseSleepStep: release.sleepStep,
    releaseFinalSecondDrift: release.finalSecondDrift
  };
};

let failed = false;
const results = {};
try {
  for (const folder of ['ragdoll-lab/', 'ragdoll-math-lab/']) {
    const backend = folder.replaceAll('/', '');
    const { page, errors } = await openBackend(folder);
    const drop = await runSettlingCase(page, `${backend}-drop`, async () => {
      await page.getByRole('button', { name: 'Drop Soldier' }).click();
    });
    const toss = await runSettlingCase(page, `${backend}-toss`, async () => {
      await page.evaluate(() => window.__ragdollParity.command({
        type: 'apply-impulse',
        body: 'upperChest',
        linear: [.41, 2.4, -.18],
        angular: [.32, -.11, .47]
      }));
    });
    const reverseToss = await runSettlingCase(page, `${backend}-reverse-toss`, async () => {
      await page.evaluate(() => window.__ragdollParity.command({
        type: 'apply-impulse',
        body: 'upperChest',
        linear: [-.66, 2.4, .5],
        angular: [-.58, .54, -.57]
      }));
    });
    const twistToss = await runSettlingCase(page, `${backend}-twist-toss`, async () => {
      await page.evaluate(() => window.__ragdollParity.command({
        type: 'apply-impulse',
        body: 'upperChest',
        linear: [.05, 2.4, -.52],
        angular: [.58, -.55, .6]
      }));
    });
    const drag = await runDragCase(page, `${backend}-foot-drag`);
    const nudge = await runPostLandingNudgeCase(page, `${backend}-post-landing-nudge`);
    results[backend] = { drop, toss, reverseToss, twistToss, drag, nudge };
    assert(errors.length === 0, `${backend}: runtime errors: ${errors.join(' | ')}`);
    await page.close();
    console.log(`${backend}: interactive drop, toss, sleep, foot drag/floor hold, and reset PASS`);
  }
  if (reportMode) console.log(JSON.stringify(results, null, 2));
  if (compactReportMode) {
    const compactResults = Object.fromEntries(Object.entries(results).map(([backend, cases]) => [
      backend,
      Object.fromEntries(Object.entries(cases).map(([name, result]) => [name, {
        broadSupportStep: result.broadSupportStep,
        qualifiedSupportStep: result.qualifiedSupportStep,
        sleepStep: result.sleepStep,
        sleepTransitionDelta: result.sleepTransitionDelta,
        preSleepMaxJointError: result.preSleepMaxJointError,
        driftAfterSixSeconds: result.driftAfterSixSeconds,
        pose: result.pose,
        releaseSleepStep: result.releaseSleepStep,
        finalSecondDrift: result.finalSecondDrift
      }]))
    ]));
    console.log(JSON.stringify(compactResults, null, 2));
  }
  assertAssistedOracleMatch(results['ragdoll-lab'], results['ragdoll-math-lab']);
  console.log('ragdoll-math-lab: assisted behavior matches the Rapier oracle envelope PASS');
} catch (error) {
  failed = true;
  console.error(error instanceof Error ? error.message : error);
} finally {
  await browser.close();
  await server.close();
}

if (temporalCaptureDir) console.log(`Temporal screenshots: ${temporalCaptureDir}`);
if (failed) process.exit(1);
console.log('Ragdoll interactive browser contract passed.');
