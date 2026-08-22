import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = path.join(root, 'ragdoll-lab', 'index.html');
const galleryPath = path.join(root, 'index.html');
const soldierUrl = 'https://github.com/mrdoob/three.js/raw/refs/heads/dev/examples/models/gltf/Soldier.glb';
const requiredAssets = [
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
  soldierUrl,
  '../assets/ogg/sfx/YEET.ogg',
  '../assets/ogg/music/backroom-static-track.ogg'
];

for (const value of requiredMarkup) {
  if (!html.includes(value)) throw new Error(`Missing required demo markup: ${value}`);
}
if (!gallery.includes('href="./ragdoll-lab/"')) {
  throw new Error('Gallery does not link to Soldier Ragdoll Lab.');
}
if (html.includes('../assets/glb/')) {
  throw new Error('Soldier demo unexpectedly depends on a local GLB asset.');
}

for (const asset of requiredAssets) {
  await access(asset);
  if ((await stat(asset)).size === 0) throw new Error(`Asset is empty: ${asset}`);
}

const moduleScript = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!moduleScript) throw new Error('Soldier demo module script was not found.');
const syntaxOnlySource = moduleScript[1].replace(/^\s*import .*;\r?\n/gm, '');
new Function(syntaxOnlySource);

const response = await fetch(soldierUrl);
if (!response.ok) throw new Error(`Soldier GLB request failed: HTTP ${response.status}`);
if (response.headers.get('access-control-allow-origin') !== '*') {
  throw new Error('Soldier GLB is not served with public CORS access.');
}
const bytes = Buffer.from(await response.arrayBuffer());
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
