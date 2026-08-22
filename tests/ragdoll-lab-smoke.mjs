import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = path.join(root, 'ragdoll-lab', 'index.html');
const galleryPath = path.join(root, 'index.html');
const soldierAsset = path.join(root, 'assets', 'glb', 'Soldier.glb');
const requiredAssets = [
  soldierAsset,
  path.join(root, 'assets', 'ogg', 'sfx', 'YEET.ogg'),
  path.join(root, 'assets', 'ogg', 'music', 'backroom-static-track.ogg')
];

const html = await readFile(demoPath, 'utf8');
const gallery = await readFile(galleryPath, 'utf8');
const requiredMarkup = [
  'https://cdn.jsdelivr.net/npm/three@0.185.1/',
  'https://cdn.jsdelivr.net/npm/@dimforge/rapier3d-compat@0.20.0/',
  'id="intro-splash"',
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
if (html.includes('raw.githubusercontent.com') || html.includes('github.com/mrdoob')) {
  throw new Error('Soldier demo unexpectedly depends on an external model URL.');
}

const requiredPhysicsTuning = [
  'const poseDeadZoneBySegment = {',
  'const settleRagdollAtRest = () => {',
  'const RESTING_SECONDS_BEFORE_SLEEP = 0.22;',
  'world.integrationParameters.numSolverIterations = 8;',
  'world.integrationParameters.numAdditionalFrictionIterations = 4;',
  '.setCanSleep(true)',
  '.setRestitution(0)',
  'poseSupportTime = 0;',
  'const TARGET_HUMAN_HEIGHT_METERS = 1.8;',
  'const getGravityForModelHeight = (modelHeight) => {',
  'const gravityY = getGravityForModelHeight(modelHeight);',
  'world = new RAPIER.World({ x: 0, y: gravityY, z: 0 });',
  'const MIN_RAGDOLL_LAUNCH_IMPULSE = 3.5;',
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
