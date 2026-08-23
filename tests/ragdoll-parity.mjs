import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const originalPath = path.join(root, 'ragdoll-lab', 'index.html');
const mathPath = path.join(root, 'ragdoll-math-lab', 'index.html');
const mathNotesPath = path.join(root, 'ragdoll-math-lab', 'MATH.md');
const soldierAsset = path.join(root, 'assets', 'glb', 'Soldier.glb');
const gitignorePath = path.join(root, '.gitignore');

const [original, math, mathNotes, gitignore] = await Promise.all([
  readFile(originalPath, 'utf8'),
  readFile(mathPath, 'utf8'),
  readFile(mathNotesPath, 'utf8'),
  readFile(gitignorePath, 'utf8')
]);

const fail = (message) => {
  throw new Error('Ragdoll parity failure: ' + message);
};

const requireText = (source, value, label) => {
  if (!source.includes(value)) fail(label + ' is missing ' + value);
};

const getSegmentIds = (source) => {
  const definitions = source.match(/const segmentDefinitions = \[([\s\S]*?)\n    \];/);
  if (!definitions) fail('segment definitions were not found');
  return [...definitions[1].matchAll(/id: '([^']+)'/g)].map((match) => match[1]);
};

const requireSame = (actual, expected, label) => {
  if (actual !== expected) fail(label + ' differs: ' + actual + ' !== ' + expected);
};

for (const [name, source] of [['Rapier lab', original], ['Math lab', math]]) {
  requireText(source, "const MODEL_URL = '../assets/glb/Soldier.glb';", name);
  requireText(source, 'const STEP_SECONDS = 1 / 60;', name);
  requireText(source, 'const MAX_STEPS_PER_FRAME = 3;', name);
  requireText(source, 'const STAGE_RADIUS = 7.35;', name);
  requireText(source, 'const TARGET_HUMAN_HEIGHT_METERS = 1.8;', name);
  requireText(source, 'const GRAVITY_METERS_PER_SECOND_SQUARED = 9.81;', name);
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
  '.setCcdEnabled(true);',
  '.setFriction(0.72)',
  '.setRestitution(0)',
  '.setDensity(1.15);',
  'world.integrationParameters.numAdditionalFrictionIterations = 4;',
  'target.y = Math.max(0.18, target.y);'
]) {
  requireText(original, value, 'Rapier physical contract');
}

for (const value of [
  'const createRigidBody = (position, rotation, length, radius) => {',
  'const buildRigidSolver = () => {',
  'const solveRigidJoint = (child) => {',
  'const solveRigidStageContact = (segment) => {',
  'const solveRigidHeadContacts = () => {',
  'const CUSTOM_COLLIDER_DENSITY = 1.15;',
  'const CUSTOM_SOLVER_ITERATIONS = 20;',
  'const CUSTOM_JOINT_VELOCITY_TRANSFER = .12;',
  'const CUSTOM_CONTACT_JOINT_VELOCITY_TRANSFER = 0;',
  'const CUSTOM_CONTACT_CHAIN_VELOCITY_RETENTION = .15;',
  'const CUSTOM_HIGH_HIPS_CONTACT_VELOCITY_RETENTION = .65;',
  'const CUSTOM_DRAG_STIFFNESS = 1;',
  'const CUSTOM_DRAG_MAX_CORRECTION = .32;',
  'const CUSTOM_DRAG_SUBSTEP_DISTANCE = .3;',
  'const CUSTOM_MAX_DRAG_SUBSTEPS = 12;',
  'const CUSTOM_DRAG_SUBSTEP_JOINT_PASSES = 6;',
  'const CUSTOM_DRAG_COHERENT_TRANSLATION = .6;',
  'const CUSTOM_FLOOR_DRAG_ROTATION_STIFFNESS = .18;',
  'const CUSTOM_RESTING_LINEAR_SPEED = .16;',
  'const CUSTOM_RESTING_ANGULAR_SPEED = .5;',
  'const CUSTOM_RESTING_SECONDS_BEFORE_SLEEP = .22;',
  'const CUSTOM_MAX_CONTACT_SETTLE_SECONDS = 1.2;',
  'const CUSTOM_MAX_RESTING_HIPS_Y = .9;',
  'const applyPositionCorrection = (body, correction, maxCorrection = CUSTOM_MAX_POSITION_CORRECTION) => {',
  'const applyJointPositionCorrection = (body, correction) => {',
  'const applyJointAnchorCorrection = (body, correction, worldPoint) => {',
  'const solveRigidJoints = (reverse = false) => {',
  'const propagateRigidDragTarget = () => {',
  'const getCollisionSafeRigidDragTarget = () => {',
  'const collisionSafeTarget = getCollisionSafeRigidDragTarget();',
  'rigidDrag.floorConstrained = collisionSafeTarget.y > rigidDragTarget.y + .0001;',
  'rigidDrag.stableRotation,',
  'applyPositionCorrection(rigidDrag.segment.body, correction, CUSTOM_DRAG_MAX_CORRECTION);',
  'const settleRigidRagdollAtRest = (dt) => {',
  'const isRigidRestHeightEligible = () => {',
  'solveRigidJoints(pass % 2 === 1);',
  'for (const segment of rigidSegments) solveRigidStageContact(segment);',
  'const parentInverseMass = rigidDrag?.segment.body === parent.body ? 0 : parent.body.inverseMass;',
  'rigidDrag.segment.body.previousPosition.copy(rigidDrag.segment.body.position);',
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
  'const applyPoseFromRigidBodies = () => {',
  'window.__ragdollParity = { snapshot: getRigidParitySnapshot };',
  'capsuleAxis = VERTICAL.clone().applyQuaternion(body.rotation);'
]) {
  requireText(math, value, 'Math lab');
}

for (const staleProjectionPath of [
  'CUSTOM_JOINT_CORRECTION_VELOCITY_BLEND',
  'CUSTOM_DRAG_CORRECTION_VELOCITY_BLEND',
  'applyStabilizedAnchorCorrection'
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
  ['const LAUNCH_FLIGHT_SECONDS = 0.95;', 'const CUSTOM_LAUNCH_FLIGHT_SECONDS = .95;', 'launch flight duration']
]) {
  requireText(original, originalValue, 'Rapier ' + label);
  requireText(math, customValue, 'Math ' + label);
}

for (const value of [
  '## Custom articulated solver',
  '## Parity work',
  'capsule-to-finite-stage contacts',
  'sequential Gauss-Seidel'
]) {
  requireText(mathNotes, value, 'Math Lab notes');
}

await access(soldierAsset);
if ((await stat(soldierAsset)).size === 0) fail('Soldier model is empty');

console.log('Ragdoll parity contract passed.');
