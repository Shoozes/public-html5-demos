import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = path.join(root, 'ragdoll-lab', 'index.html');
const galleryPath = path.join(root, 'index.html');
const readmePath = path.join(root, 'README.md');
const soldierAsset = path.join(root, 'assets', 'glb', 'Soldier.glb');
const requiredAssets = [
  soldierAsset,
  path.join(root, 'assets', 'ogg', 'sfx', 'YEET.ogg'),
  path.join(root, 'assets', 'ogg', 'music', 'backroom-static-track.ogg')
];

const html = await readFile(demoPath, 'utf8');
const gallery = await readFile(galleryPath, 'utf8');
const readme = await readFile(readmePath, 'utf8');
const requiredMarkup = [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/',
  'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/',
  'id="intro-splash"',
  'id="humanoid-joint-limits-toggle" type="checkbox" checked',
  'id="music-toggle"',
  'id="sound-toggle"',
  '../assets/glb/Soldier.glb',
  '../assets/ogg/sfx/YEET.ogg',
  '../assets/ogg/music/backroom-static-track.ogg'
];

for (const value of requiredMarkup) {
  if (!html.includes(value)) throw new Error(`Missing required demo markup: ${value}`);
}
if (!gallery.includes('href="./ragdoll-lab/"')) {
  throw new Error('Gallery does not link to Soldier Ragdoll Lab.');
}
if (!readme.includes('rigid neck/head link, framed limb hinges, selective head collision, and higher solver budget')) {
  throw new Error('README does not describe the current ragdoll stability behavior.');
}
if (html.includes('raw.githubusercontent.com') || html.includes('github.com/mrdoob')) {
  throw new Error('Soldier demo unexpectedly depends on an external model URL.');
}

const requiredPhysicsTuning = [
  'const jointConstraintBySegment = {',
  "spine: { type: 'fixed' },",
  "neck: { type: 'fixed' },",
  "head: { type: 'fixed' },",
  "leftUpperArm: { type: 'hinge', axis: 'z', limits: [-1.2, 1.2] },",
  "leftForearm: { type: 'hinge', axis: 'z', limits: [-1.35, 1.35] },",
  "leftThigh: { type: 'hinge', axis: 'x', limits: [-0.9, 0.9] },",
  'const createRagdollJoint = (child) => {',
  "const isHead = child.id === 'head';",
  'if ((!physicsSettings.humanoidJointLimits || !constraint) && !isHead) {',
  "if (isHead || constraint.type === 'fixed') {",
  'RAPIER.JointData.fixed(parentAnchor, parentFrame, childAnchor, childFrame);',
  'const getJointWorldFrame = (constraint) => {',
  'RAPIER.JointData.revolute(parentAnchor, childAnchor, { x: 1, y: 0, z: 0 });',
  'joint.setLocalFrame1(parentAnchor, parentFrame);',
  'joint.setLocalFrame2(childAnchor, childFrame);',
  'if (constraint.limits) joint.setLimits(constraint.limits[0], constraint.limits[1]);',
  'const rebuildRagdollJoints = () => {',
  'world.removeImpulseJoint(child.joint, true);',
  'humanoidJointLimits: true,',
  'physicsSettings.humanoidJointLimits = humanoidJointLimitsToggle.checked;',
  'resetRagdoll();\n      rebuildRagdollJoints();',
  'const settleRagdollAtRest = () => {',
  'const RESTING_SECONDS_BEFORE_SLEEP = 0.22;',
  'world.integrationParameters.numAdditionalFrictionIterations = 4;',
  '.setCanSleep(true)',
  '.setRestitution(0)',
  'settleGuardTime = 0;',
  'const COLLIDER_RADIUS_SCALE = 0.84;',
  'const COLLIDER_JOINT_GAP = 0.018;',
  'const TARGET_HUMAN_HEIGHT_METERS = 1.8;',
  'const RAGDOLL_SOLVER_ITERATIONS = 20;',
  'const getGravityForModelHeight = (modelHeight) => {',
  'const gravityY = getGravityForModelHeight(modelHeight);',
  'world = new RAPIER.World({ x: 0, y: gravityY, z: 0 });',
  'world.integrationParameters.numSolverIterations = RAGDOLL_SOLVER_ITERATIONS;',
  'const MIN_RAGDOLL_LAUNCH_IMPULSE = 3.5;',
  'const BODY_COLLISION_GROUPS = ((BODY_COLLISION_GROUP << 16) | HEAD_COLLISION_GROUP | STAGE_COLLISION_GROUP) >>> 0;',
  'const HEAD_COLLISION_GROUPS = ((HEAD_COLLISION_GROUP << 16) | BODY_COLLISION_GROUP | STAGE_COLLISION_GROUP) >>> 0;',
  "definition.id === 'head' ? HEAD_COLLISION_GROUPS : BODY_COLLISION_GROUPS",
  '.setCollisionGroups(STAGE_COLLISION_GROUPS)',
  'const MIN_YEET_RELEASE_IMPULSE = 5.5;',
  'const MIN_YEET_PLANAR_SPEED = 12;',
  'releaseStrength >= MIN_YEET_RELEASE_IMPULSE && planarLaunchSpeed >= MIN_YEET_PLANAR_SPEED',
  'const DRAG_THROW_DEAD_ZONE_PIXELS = 14;',
  'const DRAG_THROW_RESPONSE_PIXELS = 210;',
  'const getDragThrowStrength = (pullDistancePixels) => {',
  'const pullDistancePixels = dragStartScreen.distanceTo(lastPointerScreen);',
  'worldDirection.normalize().multiplyScalar(releaseStrength);'
];
for (const value of requiredPhysicsTuning) {
  if (!html.includes(value)) throw new Error(`Missing required physics tuning: ${value}`);
}
for (const staleController of ['configureJointMotors', 'applyJointSupport', 'applyPoseSupport', 'applyHumanoidJointLimits', 'JointData.revoluteWithAxes']) {
  if (html.includes(staleController)) throw new Error(`Stale competing joint controller remains: ${staleController}`);
}

const requiredMobileInputSafety = [
  'overscroll-behavior: none;',
  'touch-action: none;',
  'touch-action: manipulation;',
  'user-select: none;',
  '-webkit-user-select: none;',
  '-webkit-touch-callout: none;',
  '::-moz-selection'
];
for (const value of requiredMobileInputSafety) {
  if (!html.includes(value)) throw new Error(`Missing required mobile input safety rule: ${value}`);
}

const requiredLowLatencyAudio = [
  '<audio id="yeet-sound" preload="metadata">',
  'const getYeetAudioContext = () => {',
  'const warmYeetBuffer = (context) => {',
  'context.decodeAudioData(audioData)',
  'const source = context.createBufferSource();',
  'source.start(now);',
  'const MUSIC_VOLUME = 0.09;',
  'const YEET_MIN_VOLUME = 0.1;',
  'const YEET_MAX_VOLUME = 0.22;',
  'const YEET_FULL_VOLUME_RELEASE_IMPULSE = 9;',
  'const getYeetIntensity = (releaseStrength) => {',
  'const getYeetVolume = (releaseStrength) => {',
  'const getYeetFadeEnd = (soundDuration, intensity) => {',
  'gain.gain.linearRampToValueAtTime(0.0001, now + fadeEnd);',
  'playedYeet = playYeet(releaseStrength);'
];
for (const value of requiredLowLatencyAudio) {
  if (!html.includes(value)) throw new Error(`Missing required low-latency audio behavior: ${value}`);
}
if (html.includes('yeetSound.muted = true;') || html.includes('yeetSound.play().then(() =>')) {
  throw new Error('YEET startup sound prime must not play the audible sound element.');
}
if (html.includes('DRAG_THROW_MULTIPLIER') || html.includes('MAX_DRAG_THROW_IMPULSE')) {
  throw new Error('Throw strength must not depend directly on camera-scaled world distance.');
}
if (html.includes("addEventListener('pointercancel', releaseDrag)") || html.includes("addEventListener('blur', releaseDrag)")) {
  throw new Error('Cancelled or unfocused drags must not throw the ragdoll.');
}

for (const asset of requiredAssets) {
  await access(asset);
  if ((await stat(asset)).size === 0) throw new Error(`Asset is empty: ${asset}`);
}

const moduleScript = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!moduleScript) throw new Error('Soldier demo module script was not found.');
const syntaxOnlySource = moduleScript[1].replace(/^\s*import .*;\r?\n/gm, '');
new Function(syntaxOnlySource);

const bytes = await readFile(soldierAsset);
if (bytes.readUInt32LE(0) !== 0x46546c67 || bytes.readUInt32LE(16) !== 0x4e4f534a) {
  throw new Error('Soldier model is not a valid GLB.');
}
const jsonLength = bytes.readUInt32LE(12);
const gltf = JSON.parse(bytes.subarray(20, 20 + jsonLength).toString('utf8'));
const normalizeBoneName = (name) => name.replace(/[^a-z0-9]/gi, '').toLowerCase();
const soldierBones = new Set(gltf.nodes.map((node) => normalizeBoneName(node.name || '')));
const requiredBones = [
  'mixamorig:Hips', 'mixamorig:Spine', 'mixamorig:Spine1', 'mixamorig:Spine2',
  'mixamorig:Neck', 'mixamorig:Head', 'mixamorig:HeadTop_End',
  'mixamorig:LeftArm', 'mixamorig:LeftForeArm', 'mixamorig:LeftHand',
  'mixamorig:RightArm', 'mixamorig:RightForeArm', 'mixamorig:RightHand',
  'mixamorig:LeftUpLeg', 'mixamorig:LeftLeg', 'mixamorig:LeftFoot', 'mixamorig:LeftToeBase',
  'mixamorig:RightUpLeg', 'mixamorig:RightLeg', 'mixamorig:RightFoot', 'mixamorig:RightToeBase'
].map(normalizeBoneName);
const missingBones = requiredBones.filter((bone) => !soldierBones.has(bone));
if (missingBones.length) throw new Error(`Soldier rig is missing required bones: ${missingBones.join(', ')}`);

console.log('Soldier Ragdoll Lab smoke test passed.');
