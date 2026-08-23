import {
  DEFAULT_TOLERANCES,
  frameBodies,
  isTraceBody,
  metricRatio,
  quaternionError,
  scalarDistance
} from '../../shared/ragdoll-parity/protocol.mjs';

const asArray = (value) => Array.isArray(value) ? value : [];
const rms = (values) => values.length
  ? Math.sqrt(values.reduce((sum, value) => sum + value * value, 0) / values.length)
  : 0;

const frameJoints = (frame) => Array.isArray(frame?.joints)
  ? frame.joints
  : Object.entries(frame?.joints || {}).map(([id, value]) => ({
      id,
      ...(typeof value === 'number' ? { anchorError: value } : value)
    }));

const contactPairs = (frame) => new Set(asArray(frame?.contacts).map((contact) =>
  [contact.bodyA, contact.bodyB].map(String).sort().join('|')));

const sameIdSet = (left, right) => left.size === right.size
  && [...left.keys()].every((id) => right.has(id));
const normalizedLimit = (value, fallback = 0) => Number.isFinite(value) ? value : fallback;
const behavioral = (tolerances) => tolerances?.mode === 'behavioral';
const invalidFrameMetrics = (metric) => ({
  valid: false,
  metric,
  error: 'invalid-schema',
  largest: { metric, error: 'invalid-schema', ratio: 'invalid-schema' }
});

function centerOfMass(frame) {
  const bodies = frameBodies(frame);
  let mass = 0; const position = [0, 0, 0]; const velocity = [0, 0, 0];
  for (const body of bodies) {
    const weight = Number.isFinite(body.mass) && body.mass > 0 ? body.mass : 1;
    mass += weight;
    for (let i = 0; i < 3; i += 1) { position[i] += body.position[i] * weight; velocity[i] += body.linearVelocity[i] * weight; }
  }
  return { position: position.map((v) => v / mass), velocity: velocity.map((v) => v / mass) };
}

const stageContactCount = (frame) => asArray(frame?.contacts).filter((c) => String(c.bodyB) === 'stage' || String(c.bodyA) === 'stage').length;
const poseClass = (frame, tol = {}) => {
  if (exited(frame, tol)) return 'exited';
  if (stageContactCount(frame) === 0 && centerOfMass(frame).position[1] > normalizedLimit(tol.poseGroundY, .7)) return 'airborne';
  const torso = frameBodies(frame).find((b) => b.id === 'upperChest') || frameBodies(frame)[0];
  if (!torso) return 'airborne';
  const [x, y, z, w] = torso.rotation; const upY = 1 - 2 * (x * x + z * z);
  const threshold = normalizedLimit(tol.poseVertical, .45);
  if (upY >= threshold) return 'upright';
  if (upY <= -threshold) return 'inverted';
  return 'side';
};
const settleState = (frame, tol = {}) => frameBodies(frame).every((b) => Boolean(b.sleeping)
  || (Math.hypot(...b.linearVelocity) <= normalizedLimit(tol.settleLinear, .05)
    && Math.hypot(...b.angularVelocity) <= normalizedLimit(tol.settleAngular, .05)));
const exited = (frame, tol = {}) => frameBodies(frame).some((b) => Math.hypot(b.position[0], b.position[2]) > normalizedLimit(tol.exitRadius, 4.5) || b.position[1] < normalizedLimit(tol.exitMinY, -2) || b.position[1] > normalizedLimit(tol.exitMaxY, 12));
const stateTransitions = (trace, read) => {
  const result = []; let previous = false;
  for (let i = 0; i < trace.length; i += 1) { const current = read(trace[i]); if (current !== previous) result.push({ type: current ? 'enter' : 'exit', step: stepAt(trace, i) }); previous = current; }
  return result;
};

export function frameMetrics(authority, clone, tolerances = DEFAULT_TOLERANCES) {
  const authorityBodyList = frameBodies(authority);
  const cloneBodyList = frameBodies(clone);
  if (!authorityBodyList.length || !cloneBodyList.length) {
    return invalidFrameMetrics('zero-bodies');
  }
  if (authorityBodyList.some((body) => !isTraceBody(body)) || cloneBodyList.some((body) => !isTraceBody(body))) {
    return invalidFrameMetrics('body-schema');
  }
  const authorityBodies = new Map(authorityBodyList.map((body) => [body.id, body]));
  const cloneBodies = new Map(cloneBodyList.map((body) => [body.id, body]));
  if (authorityBodies.size !== authorityBodyList.length || cloneBodies.size !== cloneBodyList.length) {
    return invalidFrameMetrics('duplicate-body-id');
  }
  if (!sameIdSet(authorityBodies, cloneBodies)) {
    return invalidFrameMetrics('body-id-set');
  }

  const values = { position: [], rotation: [], linearVelocity: [], angularVelocity: [] };
  const limits = {
    position: normalizedLimit(tolerances.position),
    rotation: normalizedLimit(tolerances.rotation),
    linearVelocity: normalizedLimit(tolerances.linearVelocity),
    angularVelocity: normalizedLimit(tolerances.angularVelocity)
  };
  let largest = { error: -1, ratio: -1 };

  for (const [id, authorityBody] of authorityBodies) {
    const cloneBody = cloneBodies.get(id);
    for (const [metric, compare] of [
      ['position', scalarDistance],
      ['linearVelocity', scalarDistance],
      ['angularVelocity', scalarDistance],
      ['rotation', quaternionError]
    ]) {
      const error = compare(authorityBody[metric], cloneBody[metric]);
      values[metric].push(error);
      const limit = limits[metric];
      const ratio = metricRatio(error, limit);
      if (ratio > largest.ratio) largest = { body: id, metric, error, limit, ratio };
    }
  }

  const authorityJoints = new Map(frameJoints(authority).map((joint) => [joint.id, joint]));
  const cloneJoints = new Map(frameJoints(clone).map((joint) => [joint.id, joint]));
  if (!sameIdSet(authorityJoints, cloneJoints)) {
    return invalidFrameMetrics('joint-id-set');
  }

  const jointErrors = [];
  let hingeLimitMismatches = 0;
  for (const [id, authorityJoint] of authorityJoints) {
    const cloneJoint = cloneJoints.get(id);
    const error = Math.abs((authorityJoint.anchorError ?? authorityJoint.error ?? 0)
      - (cloneJoint.anchorError ?? cloneJoint.error ?? 0));
    jointErrors.push(error);
    const limit = normalizedLimit(tolerances.joint);
    const ratio = metricRatio(error, limit);
    if (ratio > largest.ratio) largest = { joint: id, metric: 'joint', error, limit, ratio };
    if ((authorityJoint.limitState ?? null) !== (cloneJoint.limitState ?? null)) hingeLimitMismatches += 1;
  }

  const authorityContacts = contactPairs(authority);
  const cloneContacts = contactPairs(clone);
  const contactMismatch = [...authorityContacts].filter((pair) => !cloneContacts.has(pair)).length
    + [...cloneContacts].filter((pair) => !authorityContacts.has(pair)).length;
  const sleepMismatch = [...authorityBodies].filter(([id, body]) =>
    Boolean(body.sleeping) !== Boolean(cloneBodies.get(id).sleeping)).length;

  return {
    valid: true,
    positionRms: rms(values.position),
    positionMax: Math.max(...values.position),
    quaternionRms: rms(values.rotation),
    quaternionMax: Math.max(...values.rotation),
    linearVelocityRms: rms(values.linearVelocity),
    angularVelocityRms: rms(values.angularVelocity),
    maxJointAnchorError: jointErrors.length ? Math.max(...jointErrors) : 0,
    hingeLimitMismatches,
    contactMismatch,
    sleepMismatch,
    contactsA: [...authorityContacts].sort(),
    contactsB: [...cloneContacts].sort(),
    largest
  };
}

const stepAt = (trace, index) => trace[index]?.step ?? index;

function transitionSeries(trace, keysForFrame) {
  const known = new Set();
  for (const frame of trace) for (const key of keysForFrame(frame)) known.add(key);
  const result = new Map();
  for (const key of known) {
    const transitions = [];
    let previous = false;
    for (let index = 0; index < trace.length; index += 1) {
      const current = keysForFrame(trace[index]).has(key);
      if (current !== previous) transitions.push({ type: current ? 'enter' : 'exit', step: stepAt(trace, index) });
      previous = current;
    }
    result.set(key, transitions);
  }
  return result;
}

function sleepKeys(frame) {
  return new Set(frameBodies(frame).filter((body) => Boolean(body.sleeping)).map((body) => body.id));
}

function compareTransitionMaps(authority, clone, limit, metric) {
  const keys = new Set([...authority.keys(), ...clone.keys()]);
  const mismatches = [];
  let maxStepDelta = 0;
  let incomplete = false;
  for (const key of keys) {
    const left = authority.get(key) || [];
    const right = clone.get(key) || [];
    const count = Math.max(left.length, right.length);
    for (let index = 0; index < count; index += 1) {
      const a = left[index];
      const b = right[index];
      const typeMismatch = a?.type !== b?.type;
      const stepDelta = a && b ? Math.abs(a.step - b.step) : null;
      if (Number.isFinite(stepDelta)) maxStepDelta = Math.max(maxStepDelta, stepDelta);
      else incomplete = true;
      if (!a || !b || typeMismatch || stepDelta > limit) {
        const finiteStep = a && b ? Math.min(a.step, b.step) : (a?.step ?? b?.step ?? 0);
        mismatches.push({
          metric,
          key,
          transition: a?.type || b?.type || 'unknown',
          authorityStep: a?.step ?? null,
          cloneStep: b?.step ?? null,
          step: finiteStep,
          error: typeMismatch ? null : (Number.isFinite(stepDelta) ? stepDelta : null),
          limit
        });
      }
    }
  }
  mismatches.sort((a, b) => a.step - b.step);
  return { mismatches, maxStepDelta: incomplete ? null : maxStepDelta };
}

function durableStateStep(trace, read) {
  if (!trace.length || !read(trace.at(-1))) return null;
  let index = trace.length - 1;
  while (index > 0 && read(trace[index - 1])) index -= 1;
  return stepAt(trace, index);
}

function physicalDivergence(metrics, step, tolerances) {
  if (!metrics.valid) return { step, ...metrics };
  const bad = metrics.positionMax > normalizedLimit(tolerances.position)
    || metrics.quaternionMax > normalizedLimit(tolerances.rotation)
    || metrics.linearVelocityRms > normalizedLimit(tolerances.linearVelocity)
    || metrics.angularVelocityRms > normalizedLimit(tolerances.angularVelocity)
    || metrics.maxJointAnchorError > normalizedLimit(tolerances.joint)
    || metrics.hingeLimitMismatches > normalizedLimit(tolerances.hingeLimits, 0);
  return bad ? { step, ...metrics } : null;
}

function behavioralDivergence(authority, clone, metrics, index, tolerances) {
  if (!metrics.valid) return { step: stepAt(authority, index), ...metrics };
  const a = authority[index]; const b = clone[index];
  const ca = centerOfMass(a); const cb = centerOfMass(b);
  const comPosition = scalarDistance(ca.position, cb.position);
  const comVelocity = scalarDistance(ca.velocity, cb.velocity);
  const jointAuthority = Math.max(0, ...frameJoints(a).map((j) => Math.abs(j.anchorError ?? j.error ?? 0)));
  const jointClone = Math.max(0, ...frameJoints(b).map((j) => Math.abs(j.anchorError ?? j.error ?? 0)));
  const joint = jointClone;
  const bad = comPosition > normalizedLimit(tolerances.comPosition, .35)
    || joint > normalizedLimit(tolerances.joint, .1);
  if (!bad) return null;
  const metric = comPosition > normalizedLimit(tolerances.comPosition, .35) ? 'comPosition' : 'joint';
  return { step: stepAt(authority, index), metric, error: metric === 'comPosition' ? comPosition : joint, comPosition, comVelocity, jointAuthority, jointClone, ...metrics };
}

export function compareTraces(authority, clone, tolerances = DEFAULT_TOLERANCES) {
  if (!Array.isArray(authority) || !Array.isArray(clone) || !authority.length || !clone.length) {
    const metric = invalidFrameMetrics('empty-trace');
    return { schemaVersion: 1, matching: false, tolerances, divergence: { step: 0, ...metric }, aggregate: {}, frames: [] };
  }
  const count = Math.min(authority.length, clone.length);
  const metrics = [];
  let divergence = null;
  const contactMismatchSteps = [];
  const sleepMismatchSteps = [];

  for (let index = 0; index < count; index += 1) {
    const metric = frameMetrics(authority[index], clone[index], tolerances);
    metrics.push(metric);
    const step = stepAt(authority, index);
    if (!metric.valid) {
      return { schemaVersion: 1, matching: false, tolerances, divergence: { step, ...metric }, aggregate: {}, frames: metrics };
    }
    if (metric.contactMismatch) contactMismatchSteps.push(step);
    if (metric.sleepMismatch) sleepMismatchSteps.push(step);
    divergence ||= behavioral(tolerances) ? behavioralDivergence(authority, clone, metric, index, tolerances) : physicalDivergence(metric, step, tolerances);
  }

  if (!divergence && authority.length !== clone.length) {
    const longer = authority.length > clone.length ? authority : clone;
    divergence = { step: stepAt(longer, count), metric: 'trace-length', error: Math.abs(authority.length - clone.length), limit: 0 };
  }

  const contactTransitions = compareTransitionMaps(
    transitionSeries(authority, contactPairs),
    transitionSeries(clone, contactPairs),
    normalizedLimit(tolerances.contactStep, 0),
    'contact-transition'
  );
  const sleepTransitions = compareTransitionMaps(
    transitionSeries(authority, sleepKeys),
    transitionSeries(clone, sleepKeys),
    normalizedLimit(tolerances.sleepStep, 0),
    'sleep-transition'
  );
  const behavior = behavioral(tolerances);
  if (!behavior) for (const candidate of [contactTransitions.mismatches[0], sleepTransitions.mismatches[0]]) {
    if (candidate && (!divergence || candidate.step < divergence.step)) divergence = candidate;
  }
  const stageA = authority.map(stageContactCount); const stageB = clone.map(stageContactCount);
  const stageMismatchSteps = stageA.map((count, i) => count !== stageB[i] ? stepAt(authority, i) : null).filter((v) => v !== null);
  const stageStateA = stateTransitions(authority, (f) => stageContactCount(f) > 0);
  const stageStateB = stateTransitions(clone, (f) => stageContactCount(f) > 0);
  const stageTransitions = compareTransitionMaps(new Map([['stage', stageStateA]]), new Map([['stage', stageStateB]]), normalizedLimit(tolerances.contactStep, 0), 'stage-contact-transition');
  const stageCountBad = stageA.some((count, i) => Math.abs(count - (stageB[i] ?? 0)) > normalizedLimit(tolerances.contactCount, 0));
  const exitA = authority.find((f) => exited(f, tolerances)); const exitB = clone.find((f) => exited(f, tolerances));
  const exitStepA = exitA ? stepAt(authority, authority.indexOf(exitA)) : null; const exitStepB = exitB ? stepAt(clone, clone.indexOf(exitB)) : null;
  const settledA = authority.length > 0 && settleState(authority.at(-1), tolerances);
  const settledB = clone.length > 0 && settleState(clone.at(-1), tolerances);
  const settleRead = (frame) => settleState(frame, tolerances);
  const settleStateTransitionsA = stateTransitions(authority, settleRead);
  const settleStateTransitionsB = stateTransitions(clone, settleRead);
  const settleStepA = durableStateStep(authority, settleRead);
  const settleStepB = durableStateStep(clone, settleRead);
  const settleTransitions = compareTransitionMaps(
    new Map([['settled', settleStepA === null ? [] : [{ type: 'enter', step: settleStepA }]]]),
    new Map([['settled', settleStepB === null ? [] : [{ type: 'enter', step: settleStepB }]]]),
    normalizedLimit(tolerances.settleStep, 0),
    'settle-transition'
  );
  const poseA = poseClass(authority.at(-1), tolerances); const poseB = poseClass(clone.at(-1), tolerances);
  if (behavior) {
    const exitBad = (exitStepA === null) !== (exitStepB === null) || (exitStepA !== null && Math.abs(exitStepA - exitStepB) > normalizedLimit(tolerances.exitStep, 8));
    const bothExited = exitStepA !== null && exitStepB !== null;
    const settleBad = !bothExited && (settledA !== settledB || settleTransitions.mismatches.length > 0);
    const firstStageA = stageStateA.find((t) => t.type === 'enter')?.step ?? null; const firstStageB = stageStateB.find((t) => t.type === 'enter')?.step ?? null;
    const stageTimingBad = (firstStageA === null) !== (firstStageB === null) || (firstStageA !== null && Math.abs(firstStageA - firstStageB) > normalizedLimit(tolerances.contactStep, 0));
    const finalStageBad = stageContactCount(authority.at(-1)) !== stageContactCount(clone.at(-1)) && Math.abs(stageContactCount(authority.at(-1)) - stageContactCount(clone.at(-1))) > normalizedLimit(tolerances.contactCount, 0);
    const stageBad = stageTimingBad || finalStageBad;
    const poseBad = poseA !== poseB;
    if (!divergence && (exitBad || settleBad || stageBad || poseBad)) {
      const candidateSteps = exitBad
        ? [exitStepA, exitStepB]
        : settleBad
          ? [settleStepA, settleStepB]
          : stageBad
            ? [stageTransitions.mismatches[0]?.step]
            : [];
      const finiteCandidateSteps = candidateSteps.filter(Number.isFinite);
      divergence = { step: finiteCandidateSteps.length ? Math.min(...finiteCandidateSteps) : stepAt(authority, Math.max(0, count - 1)), metric: exitBad ? 'arena-exit' : settleBad ? 'settle-state' : stageBad ? 'stage-contact-transition' : 'final-pose-class', error: exitBad ? Math.abs((exitStepA ?? 0) - (exitStepB ?? 0)) : settleBad && settleStepA !== null && settleStepB !== null ? Math.abs(settleStepA - settleStepB) : 1, limit: settleBad ? normalizedLimit(tolerances.settleStep, 0) : exitBad ? normalizedLimit(tolerances.exitStep, 8) : 0 };
    }
  }

  const aggregate = {
    positionRms: rms(metrics.map((metric) => metric.positionRms || 0)),
    positionMax: Math.max(0, ...metrics.map((metric) => metric.positionMax || 0)),
    quaternionMax: Math.max(0, ...metrics.map((metric) => metric.quaternionMax || 0)),
    linearVelocityRms: rms(metrics.map((metric) => metric.linearVelocityRms || 0)),
    angularVelocityRms: rms(metrics.map((metric) => metric.angularVelocityRms || 0)),
    maxJointAnchorError: Math.max(0, ...metrics.map((metric) => metric.maxJointAnchorError || 0)),
    hingeLimitMismatches: metrics.reduce((sum, metric) => sum + (metric.hingeLimitMismatches || 0), 0),
    contactMismatchFrames: contactMismatchSteps.length,
    sleepMismatchFrames: sleepMismatchSteps.length,
    contactMismatchSteps,
    sleepMismatchSteps,
    contactTransitionMismatches: contactTransitions.mismatches,
    sleepTransitionMismatches: sleepTransitions.mismatches,
    maxContactStepDelta: contactTransitions.maxStepDelta,
    maxSleepStepDelta: sleepTransitions.maxStepDelta
  };
  if (behavior) { const comVelocityRms = rms(metrics.map((m, i) => scalarDistance(centerOfMass(authority[i]).velocity, centerOfMass(clone[i]).velocity))); Object.assign(aggregate, { comPositionMax: Math.max(0, ...metrics.map((m, i) => scalarDistance(centerOfMass(authority[i]).position, centerOfMass(clone[i]).position))), comVelocityMax: Math.max(0, ...metrics.map((m, i) => scalarDistance(centerOfMass(authority[i]).velocity, centerOfMass(clone[i]).velocity))), comVelocityRms, stageContactMismatchSteps: stageMismatchSteps, stageContactTransitionMismatches: stageTransitions.mismatches, stageContactCountMismatch: stageCountBad, exitStepA, exitStepB, settledA, settledB, settleStepA, settleStepB, settleStateTransitionsA, settleStateTransitionsB, settleTransitionMismatches: settleTransitions.mismatches, finalPoseClassA: poseA, finalPoseClassB: poseB }); if (!divergence && comVelocityRms > normalizedLimit(tolerances.comVelocity, 2)) divergence = { step: stepAt(authority, 0), metric: 'comVelocityRms', error: comVelocityRms, limit: normalizedLimit(tolerances.comVelocity, 2) }; }
  return { schemaVersion: 1, matching: !divergence, tolerances, divergence, aggregate, frames: metrics };
}

function contextSlice(trace, step, radius) {
  let center = trace.findIndex((frame, index) => stepAt(trace, index) >= step);
  if (center < 0) center = Math.max(0, trace.length - 1);
  return trace.slice(Math.max(0, center - radius), center + radius + 1);
}

export function reportWithContext(authority, clone, result, radius = 5) {
  if (!result.divergence) return result;
  const step = result.divergence.step;
  return {
    ...result,
    context: {
      authority: contextSlice(authority, step, radius),
      clone: contextSlice(clone, step, radius)
    }
  };
}
