import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalPath = path.join(root, 'ragdoll-lab', 'index.html');
const mathPath = path.join(root, 'ragdoll-math-lab', 'index.html');
const mathNotesPath = path.join(root, 'ragdoll-math-lab', 'MATH.md');
const cloningTutorialPath = path.join(root, 'docs', 'parity', 'CLONE_BEHAVIOR_NOT_CONSTANTS.md');
const soldierAsset = path.join(root, 'assets', 'glb', 'Soldier.glb');
const gitignorePath = path.join(root, '.gitignore');
const sharedSpecPath = path.join(root, 'shared', 'ragdoll-core', 'spec.mjs');
const sharedProtocolPath = path.join(root, 'shared', 'ragdoll-parity', 'protocol.mjs');

const [original, math, mathNotes, cloningTutorial, gitignore, sharedSpec, sharedProtocol] = await Promise.all([
  readFile(originalPath, 'utf8'),
  readFile(mathPath, 'utf8'),
  readFile(mathNotesPath, 'utf8'),
  readFile(cloningTutorialPath, 'utf8'),
  readFile(gitignorePath, 'utf8'),
  readFile(sharedSpecPath, 'utf8'),
  readFile(sharedProtocolPath, 'utf8')
]);

const fail = (message) => {
  throw new Error('Ragdoll parity failure: ' + message);
};

const requireText = (source, value, label) => {
  if (!source.includes(value)) fail(label + ' is missing ' + value);
};

const getSegmentIds = (source) => {
  const definitions = source.match(/const segmentMetadata = \[([\s\S]*?)\n    \];/);
  if (!definitions) fail('segment definitions were not found');
  return [...definitions[1].matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
};

const requireSame = (actual, expected, label) => {
  if (actual !== expected) fail(label + ' differs: ' + actual + ' !== ' + expected);
};

for (const [name, source] of [['Rapier lab', original], ['Math lab', math]]) {
  requireText(source, "const MODEL_URL = '../assets/glb/Soldier.glb';", name);
  requireText(source, 'const MAX_STEPS_PER_FRAME = 3;', name);
  requireText(source, "const manualStepMode = searchParams.get('manual') === '1';", name);
  requireText(source, 'const STAGE_RADIUS = 7.35;', name);
  requireText(source, "from '../shared/ragdoll-core/spec.mjs';", name);
  requireText(source, "from '../shared/ragdoll-parity/protocol.mjs';", name);
  requireText(source, 'const segmentDefinitions = SHARED_SEGMENTS.map', name);
  requireText(source, 'Object.entries(SHARED_JOINTS)', name);
  requireText(source, 'manualStepMode', name);
  requireText(source, 'id="drop-button"', name);
  requireText(source, 'id="toss-button"', name);
  requireText(source, 'id="reset-button"', name);
  requireText(source, 'OrbitControls', name);
  requireText(source, 'new GLTFLoader()', name);
  requireText(source, 'Physics playground', name);
  requireText(source, 'Soldier Ragdoll Lab', name);
  requireText(source, 'Grab a limb, spin the camera, and let Soldier loose.', name);
}

requireSame(getSegmentIds(math).join(','), getSegmentIds(original).join(','), 'simulated segment order');
for (const value of ['export const STEP_SECONDS = 1 / 60;', 'export const TARGET_HUMAN_HEIGHT_METERS = 1.8;', 'export const GRAVITY_METERS_PER_SECOND_SQUARED = 9.81;', 'export const SEGMENTS', 'export const JOINTS']) {
  requireText(sharedSpec, value, 'Shared ragdoll specification');
}
for (const value of ['export const PARITY_COMMAND_TYPES', 'export function getParityCommandType']) {
  requireText(sharedProtocol, value, 'Shared parity command protocol');
}
requireText(original, "import RAPIER from '@dimforge/rapier3d-compat';", 'Rapier lab');
if (math.includes('RAPIER') || math.includes('rapier')) {
  fail('Math lab must stay independent from Rapier');
}
if (math.includes('CUSTOM_RELEASE_LEAN') || math.includes('releaseRigidRagdoll(true)')) {
  fail('Math lab Drop must not inject motion absent from the Rapier authority');
}
requireText(gitignore, 'output/playwright/', 'Git ignore rules');

for (const value of [
  'const RAGDOLL_SOLVER_ITERATIONS = 20;',
  'const startInteractivePhysicsDrag = (selected, hitPoint, suppliedLocalAnchor = null) => {',
  '.setCcdEnabled(true);',
  '.setFriction(0.72)',
  '.setRestitution(0)',
  '.setDensity(1.15);',
  'target.y = Math.max(0.18, target.y);'
]) {
  requireText(original, value, 'Rapier physical contract');
}
if (original.includes('numAdditionalFrictionIterations =')) {
  fail('Rapier physical contract must not assign the removed additional-friction-iterations API');
}

for (const value of [
  'const createRigidBody = (position, rotation, length, radius) => {',
  'const buildRigidSolver = () => {',
  'const solveRigidJoint = (child) => {',
  'const angularStiffness = parityMode ? CUSTOM_ANGULAR_STIFFNESS : CUSTOM_INTERACTIVE_ANGULAR_STIFFNESS;',
  'limitDifference * (parityMode ? .16 : CUSTOM_INTERACTIVE_LIMIT_STIFFNESS)',
  'const solveRigidStageContact = (segment) => {',
  'const solveRigidHeadContacts = () => {',
  'const CUSTOM_COLLIDER_DENSITY = 1.15;',
  'const CUSTOM_SOLVER_ITERATIONS = 20;',
  'const CUSTOM_INTERACTIVE_SOLVER_ITERATIONS = 27;',
  'const CUSTOM_INTERACTIVE_VELOCITY_SOLVER_ITERATIONS = 20;',
  'const CUSTOM_INTERACTIVE_ANGULAR_STIFFNESS = .5;',
  'const CUSTOM_INTERACTIVE_LIMIT_STIFFNESS = .32;',
  'const CUSTOM_INTERACTIVE_MOVING_ANCHOR_STIFFNESS = .9999;',
  'const CUSTOM_JOINT_VELOCITY_TRANSFER = .12;',
  'const CUSTOM_CONTACT_JOINT_VELOCITY_TRANSFER = 0;',
  'const CUSTOM_PARITY_ANCHOR_TORQUE_SCALE = .006;',
  'const CUSTOM_CONTACT_ANGULAR_RESPONSE = .12;',
  'const CUSTOM_CONTACT_CHAIN_VELOCITY_RETENTION = .15;',
  'const CUSTOM_HIGH_HIPS_CONTACT_VELOCITY_RETENTION = .65;',
  'const CUSTOM_DRAG_TARGET_HALF_LIFE_SECONDS = .022;',
  'const CUSTOM_DRAG_TARGET_MAX_SPEED = 32;',
  'const CUSTOM_DRAG_TARGET_DEAD_ZONE = .008;',
  'const CUSTOM_DRAG_SPRING_STIFFNESS = 420;',
  'const CUSTOM_DRAG_SPRING_DAMPING = 42;',
  'const CUSTOM_DRAG_POSITION_STIFFNESS = .82;',
  'const CUSTOM_DRAG_POSITION_PASS_STIFFNESS = 1',
  'const CUSTOM_HELD_LINEAR_DAMPING = 6.5;',
  'const CUSTOM_HELD_ANGULAR_DAMPING = 28;',
  'const CUSTOM_HELD_MAX_ANGULAR_SPEED = 3.5;',
  'const CUSTOM_RESTING_LINEAR_SPEED = .16;',
  'const CUSTOM_RESTING_ANGULAR_SPEED = .5;',
  'const CUSTOM_RESTING_SECONDS_BEFORE_SLEEP = .22;',
  'const CUSTOM_REST_CAPTURE_MIN_STAGE_CONTACTS = 8;',
  'const CUSTOM_REST_CAPTURE_LINEAR_SPEED = 1.1;',
  'const CUSTOM_REST_CAPTURE_ANGULAR_SPEED = 1.25;',
  'const CUSTOM_REST_CAPTURE_SUPPORT_SECONDS = .5;',
  'const CUSTOM_REST_SUPPORT_LOSS_DECAY = 2;',
  'const CUSTOM_REST_CAPTURE_LINEAR_RETENTION = 0;',
  'const CUSTOM_REST_CAPTURE_ANGULAR_RETENTION = 0;',
  'const CUSTOM_REST_MAX_SLEEP_JOINT_ERROR = .02;',
  'const CUSTOM_REST_ANCHOR_SWEEPS_PER_STEP = 2;',
  'const CUSTOM_REST_ANCHOR_MAX_CORRECTION = .016;',
  'const CUSTOM_FULL_SLEEP_SECONDS = .5;',
  'const CUSTOM_FULL_ROLLING_FRICTION_SCALE = .15;',
  'const CUSTOM_MAX_RESTING_HIPS_Y = .9;',
  'const applyPositionCorrection = (body, correction, maxCorrection = CUSTOM_MAX_POSITION_CORRECTION) => {',
  'const worldAnchorInto = (target, body, localAnchor) =>',
  'const solvePointEffectiveMass = (body, point, target) => solveSharedPointEffectiveMass(',
  'const solvePairPointEffectiveMass = (parentBody, parentPoint, childBody, childPoint, target) => solveSharedPairPointEffectiveMass(',
  'const solveRigidJoints = (reverse = false) => {',
  'const closeInteractiveJointAnchor = (segment) => {',
  'const closeInteractiveJointAnchors = (reverse = false) => {',
  'const updateInteractiveDragTarget = () => {',
  'const applyInteractiveDragSpring = () => {',
  'const solveInteractiveJointVelocity = (segment) => {',
  'const solveInteractiveJointVelocities = (reverse = false) => {',
  'const solveInteractiveDragVelocityConstraints = () => {',
  'const solveInteractiveDragPosition = () => {',
  'const updateInteractiveRigidVelocities = (dt) => {',
  'const stabilizeInteractiveRigidRagdollAtRest = (dt) => {',
  'const getInteractiveRestMaxJointError = () => {',
  'const closeInteractiveRestJointAnchors = (maxCorrection) => {',
  'const impulse = solvePointEffectiveMass(body, worldPoint, correction);',
  'constraintLinearVelocityDelta: new THREE.Vector3(),',
  'constraintAngularVelocityDelta: new THREE.Vector3(),',
  'body.constraintLinearVelocityDelta.copy(body.velocity).sub(body.integratedVelocity);',
  'body.constraintAngularVelocityDelta.copy(body.angularVelocity).sub(body.integratedAngularVelocity);',
  'body.velocity.add(body.constraintLinearVelocityDelta);',
  'body.angularVelocity.add(body.constraintAngularVelocityDelta);',
  "const CUSTOM_HEAD_SELF_COLLISION_BLOCKERS = new Set(['chest', 'upperChest']);",
  'const updateInteractiveHeadSelfCollisionPolicy = () => {',
  'const settleRigidRagdollAtRest = (dt) => {',
  'const isRigidRestHeightEligible = () => {',
  'solveInteractiveDragPosition();',
  'solveRigidJoints(pass % 2 === 1);',
  'for (const segment of rigidSegments) solveRigidStageContact(segment);',
  'const CUSTOM_STAGE_CENTER_Y = -.22;',
  'const CUSTOM_STAGE_HALF_HEIGHT = .18;',
  'const sidePenetration = STAGE_RADIUS + body.radius - centerRadius;',
  'outward.multiplyScalar(sidePenetration * CUSTOM_STAGE_SIDE_STIFFNESS)',
  'const CUSTOM_LAUNCH_FLIGHT_SECONDS = .95;',
  'const launchRigidRagdoll = (velocity) => {',
  'const intersectRayCapsule = (origin, direction, body) => {',
  'const findRigidPhysicsHit = () => {',
  'const physicsHit = findRigidPhysicsHit();',
  'nextTarget.y = Math.max(.18, nextTarget.y);',
  'const runCustomRigidStep = () => {',
  'const integrateInteractiveRigidBodies = (dt) => {',
  'const applyPoseFromRigidBodies = () => {',
  'restRotationInverse: restRotation.clone().invert(),',
  'poseDelta: new THREE.Quaternion(),',
  'capsuleAxis = VERTICAL.clone().applyQuaternion(body.rotation);'
]) {
  requireText(math, value, 'Math lab');
}
if (!/solveInteractiveDragPosition\(\);\s+solveRigidHeadContacts\(\);\s+solveRigidJoints\(pass % 2 === 1\);\s+closeInteractiveJointAnchors\(pass % 2 === 1\);\s+for \(const segment of rigidSegments\) solveRigidStageContact\(segment\);/.test(math)) {
  fail('Math lab interactive drag, joint, and stage constraints are not coupled in the required order');
}
if (!/applyInteractiveDragSpring\(\);\s+solveInteractiveJointVelocities\(pass % 2 === 1\);/.test(math)) {
  fail('Math lab interactive drag velocity is not propagated through the articulated chain');
}
const interactiveVelocityUpdate = math.match(/const updateInteractiveRigidVelocities = \(dt\) => \{([\s\S]*?)\n    \};/);
if (!interactiveVelocityUpdate) fail('Math lab interactive velocity update was not found');
if (interactiveVelocityUpdate[1].includes('CUSTOM_CONTACT_CHAIN_VELOCITY_RETENTION') || interactiveVelocityUpdate[1].includes('CUSTOM_HIGH_HIPS_CONTACT_VELOCITY_RETENTION')) {
  fail('Math lab interactive velocity update still applies parity-only whole-island retention');
}
for (const requiredConstraintDelta of [
  'body.velocity.add(body.constraintLinearVelocityDelta);',
  'body.angularVelocity.add(body.constraintAngularVelocityDelta);'
]) {
  if (!interactiveVelocityUpdate[1].includes(requiredConstraintDelta)) {
    fail('Math lab interactive velocity update discards solved constraint delta ' + requiredConstraintDelta);
  }
}
if (!/const getJointVelocityTransfer = \(\) => parityMode && rigidStageContactCount >= CUSTOM_MIN_RESTING_STAGE_CONTACTS && isRigidRestHeightEligible\(\)/.test(math)) {
  fail('Math lab must preserve assisted joint correction velocity while retaining parity-only grounded neutralization');
}
if (!/const releaseRigidRagdoll = \(\) => \{[\s\S]*const wakingSupportedSleep = rigidSleeping[\s\S]*rigidSleeping = false;[\s\S]*rigidRestCaptureSupportTime = wakingSupportedSleep \? CUSTOM_REST_CAPTURE_SUPPORT_SECONDS : 0;[\s\S]*rigidRestSupportHysteresisEnabled = wakingSupportedSleep;/.test(math)) {
  fail('Math lab release does not wake a previously sleeping articulated island');
}
if (!/const closeInteractiveJointAnchor = \(segment\) => \{[\s\S]*CUSTOM_INTERACTIVE_MOVING_ANCHOR_PASS_STIFFNESS[\s\S]*previousPosition\.addScaledVector[\s\S]*const closeInteractiveJointAnchors = \(reverse = false\) => \{[\s\S]*rigidDrag\.cursorVelocity\.lengthSq\(\)[\s\S]*closeInteractiveJointAnchors\(pass % 2 === 1\);[\s\S]*solveRigidStageContact/.test(math)) {
  fail('Math lab live drag does not close joint anchors velocity-neutrally before stage contact');
}
if (!/if \(!quiet\) \{\s+rigidRestSettleTime = 0;\s+return;\s+\}\s+rigidRestSettleTime \+= dt;\s+if \(rigidRestSettleTime < CUSTOM_RESTING_SECONDS_BEFORE_SLEEP\) return;/.test(math)) {
  fail('Math lab interactive sleep does not require a continuous quiet interval');
}
if (!/rigidStageContactCount < CUSTOM_REST_CAPTURE_MIN_STAGE_CONTACTS[\s\S]*rigidRestCaptureSupportTime \+= dt[\s\S]*CUSTOM_REST_CAPTURE_SUPPORT_SECONDS[\s\S]*const broadlyQuiet = rigidSegments\.every[\s\S]*CUSTOM_REST_CAPTURE_LINEAR_RETENTION[\s\S]*CUSTOM_REST_CAPTURE_ANGULAR_RETENTION/.test(math)) {
  fail('Math lab interactive rest capture is not guarded by broad support and whole-body quiet');
}
if (!/const applyAnchorCorrection = \(body, correction, worldPoint[\s\S]*solvePointEffectiveMass\(body, worldPoint, correction\)[\s\S]*cross\(impulse\)\s*\.applyMatrix3\(body\.worldInverseInertia\)[\s\S]*CUSTOM_CONTACT_ANGULAR_RESPONSE/.test(math)) {
  fail('Math lab contact projection does not derive its bounded angular response from point effective mass');
}
if (!/const getInteractiveRestMaxJointError = \(\) => \{[\s\S]*getInteractiveRestMaxJointError\(\) > CUSTOM_REST_MAX_SLEEP_JOINT_ERROR/.test(math)) {
  fail('Math lab sleep does not require a cohesive articulated pose');
}
if (!/window\.__ragdollParity\s*=\s*\{[\s\S]*snapshot\s*:/.test(math)) fail('Math lab parity snapshot hook is missing');

for (const staleProjectionPath of [
  'CUSTOM_JOINT_CORRECTION_VELOCITY_BLEND',
  'CUSTOM_DRAG_CORRECTION_VELOCITY_BLEND',
  'applyStabilizedAnchorCorrection',
  'CUSTOM_DRAG_SUBSTEP_DISTANCE',
  'CUSTOM_DRAG_COHERENT_TRANSLATION',
  'CUSTOM_FLOOR_DRAG_ROTATION_STIFFNESS',
  'getCollisionSafeRigidDragTarget',
  'propagateRigidDragTarget',
  'CUSTOM_MAX_CONTACT_SETTLE_SECONDS'
]) {
  if (math.includes(staleProjectionPath)) fail('Math lab retains stale rubber-band projection path ' + staleProjectionPath);
}

if (math.includes('applyAnchorCorrection(rigidDrag.segment.body, correction')) {
  fail('Math lab cursor projection still injects repeated lever-arm torque.');
}
if (math.includes('centerRadius + body.radius - STAGE_RADIUS') || math.includes('multiplyScalar(-sidePenetration')) {
  fail('Math lab stage rim still uses the inward-growing correction.');
}

for (const [originalValue, customValue, label] of [
  ['const COLLIDER_RADIUS_SCALE = 0.84;', 'const CUSTOM_COLLIDER_RADIUS_SCALE = .84;', 'collider radius scale'],
  ['const COLLIDER_JOINT_GAP = 0.018;', 'const CUSTOM_COLLIDER_JOINT_GAP = .018;', 'collider joint gap'],
  ['const MAX_LINEAR_SPEED = 28;', 'const CUSTOM_MAX_LINEAR_SPEED = 28;', 'maximum linear speed'],
  ['const MAX_ANGULAR_SPEED = 18;', 'const CUSTOM_MAX_ANGULAR_SPEED = 18;', 'maximum angular speed'],
  ['const MAX_DRAG_THROW_STRENGTH = 12;', 'const CUSTOM_DRAG_THROW_STRENGTH = 12;', 'drag throw strength'],
  ['const DRAG_THROW_DEAD_ZONE_PIXELS = 14;', 'const CUSTOM_DRAG_THROW_DEAD_ZONE_PIXELS = 14;', 'drag throw dead zone'],
  ['const DRAG_THROW_RESPONSE_PIXELS = 210;', 'const CUSTOM_DRAG_THROW_RESPONSE_PIXELS = 210;', 'drag throw response'],
  ['const DRAG_LAUNCH_VELOCITY_MULTIPLIER = 2.45;', 'const CUSTOM_LAUNCH_VELOCITY_MULTIPLIER = 2.45;', 'launch multiplier'],
  ['const MAX_DRAG_LAUNCH_SPEED = 26;', 'const CUSTOM_MAX_LAUNCH_SPEED = 26;', 'maximum launch speed'],
  ['const MIN_LAUNCH_LIFT = 6;', 'const CUSTOM_MIN_LAUNCH_LIFT = 6;', 'minimum launch lift'],
  ['const LAUNCH_FLIGHT_SECONDS = 0.95;', 'const CUSTOM_LAUNCH_FLIGHT_SECONDS = .95;', 'launch flight duration'],
  ['const DRAG_TARGET_HALF_LIFE_SECONDS = 0.022;', 'const CUSTOM_DRAG_TARGET_HALF_LIFE_SECONDS = .022;', 'drag target half-life'],
  ['const DRAG_TARGET_MAX_SPEED = 32;', 'const CUSTOM_DRAG_TARGET_MAX_SPEED = 32;', 'drag target speed'],
  ['const DRAG_TARGET_DEAD_ZONE = 0.008;', 'const CUSTOM_DRAG_TARGET_DEAD_ZONE = .008;', 'drag target dead zone'],
  ['const DRAG_SPRING_STIFFNESS = 420;', 'const CUSTOM_DRAG_SPRING_STIFFNESS = 420;', 'drag spring stiffness'],
  ['const DRAG_SPRING_DAMPING = 42;', 'const CUSTOM_DRAG_SPRING_DAMPING = 42;', 'drag spring damping'],
  ['const HELD_RAGDOLL_LINEAR_DAMPING = 6.5;', 'const CUSTOM_HELD_LINEAR_DAMPING = 6.5;', 'held linear damping'],
  ['const HELD_RAGDOLL_ANGULAR_DAMPING = 28;', 'const CUSTOM_HELD_ANGULAR_DAMPING = 28;', 'held angular damping'],
  ['const HELD_RAGDOLL_MAX_ANGULAR_SPEED = 3.5;', 'const CUSTOM_HELD_MAX_ANGULAR_SPEED = 3.5;', 'held angular speed']
]) {
  requireText(original, originalValue, 'Rapier ' + label);
  requireText(math, customValue, 'Math ' + label);
}

for (const value of [
  '## Solver boundary',
  '## Parity and assisted paths',
  'finite-cylinder',
  '3x3 single-body and two-body point effective-mass kernels'
]) {
  requireText(mathNotes, value, 'Math Lab notes');
}

for (const value of [
  '# Clone Behavior, Not Constants',
  '## 2. Turn the original into an executable oracle',
  '## 4. Build a dependency-ordered scenario ladder',
  '## 5. Stop at the first divergent frame',
  '## 7. Keep parity and assisted behavior separate',
  '## 8. Test time, not just endpoints',
  '## 11. A repeatable working loop',
  '## 12. Running this repository\'s proof lanes'
]) {
  requireText(cloningTutorial, value, 'Cloning tutorial');
}

await access(soldierAsset);
if ((await stat(soldierAsset)).size === 0) fail('Soldier model is empty');

console.log('Ragdoll parity contract passed.');
