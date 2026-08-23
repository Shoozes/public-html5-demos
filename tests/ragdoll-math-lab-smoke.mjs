import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = path.join(root, 'ragdoll-math-lab', 'index.html');
const galleryPath = path.join(root, 'index.html');
const soldierAsset = path.join(root, 'assets', 'glb', 'Soldier.glb');
const html = (await readFile(demoPath, 'utf8')).replace(/\r\n/g, '\n');
const gallery = await readFile(galleryPath, 'utf8');

for (const value of [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/',
  "import * as THREE from 'three';",
  "import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';",
  "import { OrbitControls } from 'three/addons/controls/OrbitControls.js';",
  "from '../shared/ragdoll-core/spec.mjs';",
  "from '../shared/ragdoll-parity/protocol.mjs';",
  'solvePointEffectiveMass as solveSharedPointEffectiveMass',
  'solvePairPointEffectiveMass as solveSharedPairPointEffectiveMass',
  "const MODEL_URL = '../assets/glb/Soldier.glb';",
  'const MAX_STEPS_PER_FRAME = 3;',
  'const segmentDefinitions = SHARED_SEGMENTS.map',
  'const customJointConstraints = Object.fromEntries(Object.entries(SHARED_JOINTS)',
  'const getGravityForModelHeight = (modelHeight) => -GRAVITY_METERS_PER_SECOND_SQUARED * (modelHeight / TARGET_HUMAN_HEIGHT_METERS);',
  'const CUSTOM_SOLVER_ITERATIONS = 20;',
  'const CUSTOM_COLLIDER_DENSITY = 1.15;',
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
  'const CUSTOM_RESTING_SECONDS_BEFORE_SLEEP = .22;',
  'const CUSTOM_FULL_SLEEP_SECONDS = .5;',
  'const CUSTOM_FULL_ROLLING_FRICTION_SCALE = .15;',
  'const CUSTOM_MAX_CONTACT_SETTLE_SECONDS = 1.2;',
  'const CUSTOM_MAX_RESTING_HIPS_Y = .9;',
  'const createRigidBody = (position, rotation, length, radius) => {',
  'const buildRigidSolver = () => {',
  'const solveRigidJoint = (child) => {',
  'const solveRigidStageContact = (segment) => {',
  'const applyVelocityNeutralContactCorrection = (body, correction, worldPoint) => {',
  'const applyPositionCorrection = (body, correction, maxCorrection = CUSTOM_MAX_POSITION_CORRECTION) => {',
  'const solvePointEffectiveMass = (body, point, target) => solveSharedPointEffectiveMass(',
  'const solvePairPointEffectiveMass = (parentBody, parentPoint, childBody, childPoint, target) => solveSharedPairPointEffectiveMass(',
  'const closestPointsOnSegments = (firstStart, firstEnd, secondStart, secondEnd) => {',
  'const solveRigidHeadContacts = () => {',
  'const solveRigidJoints = (reverse = false) => {',
  'const propagateRigidDragTarget = () => {',
  'const getCollisionSafeRigidDragTarget = () => {',
  'const collisionSafeTarget = getCollisionSafeRigidDragTarget();',
  'rigidDrag.floorConstrained = collisionSafeTarget.y > rigidDragTarget.y + .0001;',
  'rigidDrag.stableRotation,',
  'applyPositionCorrection(rigidDrag.segment.body, correction, CUSTOM_DRAG_MAX_CORRECTION);',
  "window.addEventListener('pointerup', (event) => {",
  "renderer.domElement.addEventListener('lostpointercapture', () => releaseRigidDrag());",
  'const settleRigidRagdollAtRest = (dt) => {',
  'const isRigidRestHeightEligible = () => {',
  'solveRigidJoints(pass % 2 === 1);',
  'for (const segment of rigidSegments) solveRigidStageContact(segment);',
  'rigidDrag.segment.body.previousPosition.copy(rigidDrag.segment.body.position);',
  'const CUSTOM_STAGE_CENTER_Y = -.22;',
  'const CUSTOM_STAGE_HALF_HEIGHT = .18;',
  'const sidePenetration = STAGE_RADIUS + body.radius - centerRadius;',
  'outward.multiplyScalar(sidePenetration * CUSTOM_STAGE_SIDE_STIFFNESS)',
  'const CUSTOM_LAUNCH_FLIGHT_SECONDS = .95;',
  'const launchRigidRagdoll = (velocity) => {',
  'const intersectRayCapsule = (origin, direction, body) => {',
  'const findRigidPhysicsHit = () => {',
  'const findRigidSelectionHit = () => {',
  'const physicsHit = findRigidPhysicsHit();',
  'nextTarget.y = Math.max(.18, nextTarget.y);',
  'const runCustomRigidStep = () => {',
  'const applyPoseFromRigidBodies = () => {',
  'const getRigidJointError = () => {',
  "id: 'leftHand', bone: 'mixamorig:LeftHand', end: 'mixamorig:LeftHandMiddle4'",
  "id: 'rightHand', bone: 'mixamorig:RightHand', end: 'mixamorig:RightHandMiddle4'",
  'Physics playground',
  'Soldier Ragdoll Lab',
  'id="settings-button"'
]) {
  if (!html.includes(value)) throw new Error('Missing manual-solver behavior: ' + value);
}

if (!/window\.__ragdollParity\s*=\s*\{[\s\S]*snapshot\s*:/.test(html)) throw new Error('Missing manual-solver parity snapshot hook.');
if (html.includes('RAPIER') || html.includes('rapier')) {
  throw new Error('Ragdoll Math Lab must not import or reference Rapier.');
}
if (html.includes('integrateParticles') || html.includes('solveDistanceConstraint') || html.includes('applyPoseFromParticles')) {
  throw new Error('Ragdoll Math Lab must not retain the replaced particle-prototype solver.');
}
for (const staleProjectionPath of [
  'CUSTOM_JOINT_CORRECTION_VELOCITY_BLEND',
  'CUSTOM_DRAG_CORRECTION_VELOCITY_BLEND',
  'applyStabilizedAnchorCorrection'
]) {
  if (html.includes(staleProjectionPath)) {
    throw new Error('Ragdoll Math Lab must not retain the rubber-band projection path: ' + staleProjectionPath);
  }
}
if (html.includes('getRigidDragGroundMinimumY')) {
  throw new Error('Ragdoll Math Lab drag target must follow the authoritative cursor clamp exactly.');
}
if (html.includes('applyAnchorCorrection(rigidDrag.segment.body, correction')) {
  throw new Error('Ragdoll Math Lab cursor projection must not inject repeated lever-arm torque.');
}
if (html.includes('CUSTOM_RELEASE_LEAN') || html.includes('releaseRigidRagdoll(true)')) {
  throw new Error('Ragdoll Math Lab Drop must not inject a custom release rotation.');
}
if (html.includes('centerRadius + body.radius - STAGE_RADIUS') || html.includes('multiplyScalar(-sidePenetration')) {
  throw new Error('Ragdoll Math Lab must not restore the inward-growing stage rim correction.');
}
if (!gallery.includes('href="./ragdoll-math-lab/"')) {
  throw new Error('Gallery does not link to Soldier Ragdoll Math Lab.');
}

const stageRadius = 7.35;
const bodyRadius = .2;
const getSideCorrection = (centerRadius) => centerRadius < stageRadius
  ? 0
  : Math.max(0, stageRadius + bodyRadius - centerRadius);
if (getSideCorrection(stageRadius - .01) !== 0) throw new Error('A capsule centered on the stage must not hit its outer side.');
if (!(getSideCorrection(stageRadius + .05) > 0)) throw new Error('A capsule crossing the rim must receive outward separation.');
if (getSideCorrection(stageRadius + bodyRadius + .01) !== 0) throw new Error('A capsule clear of the rim must be allowed to fall.');
await access(soldierAsset);
if ((await stat(soldierAsset)).size === 0) throw new Error('Soldier model is empty.');

const moduleScript = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!moduleScript) throw new Error('Manual solver module script was not found.');
const syntaxOnlySource = moduleScript[1].replace(/^\s*import .*;\n/gm, '');
new Function(syntaxOnlySource);

console.log('Soldier Ragdoll Math Lab smoke test passed.');
