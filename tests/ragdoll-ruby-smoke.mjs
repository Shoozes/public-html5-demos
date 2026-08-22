import { access, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const demoPath = path.join(root, 'ragdoll-ruby', 'index.html');
const galleryPath = path.join(root, 'index.html');
const requiredAssets = [
  path.join(root, 'assets', 'glb', 'Ruby_GR.glb'),
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
  '../assets/ogg/sfx/YEET.ogg',
  '../assets/ogg/music/backroom-static-track.ogg'
];

for (const value of requiredMarkup) {
  if (!html.includes(value)) throw new Error(`Missing required demo markup: ${value}`);
}
if (!gallery.includes('href="./ragdoll-ruby/"')) {
  throw new Error('Gallery does not link to Ruby Ragdoll Lab.');
}

for (const asset of requiredAssets) {
  await access(asset);
  if ((await stat(asset)).size === 0) throw new Error(`Asset is empty: ${asset}`);
}

const moduleScript = html.match(/<script type="module">([\s\S]*?)<\/script>/);
if (!moduleScript) throw new Error('Ruby demo module script was not found.');
const syntaxOnlySource = moduleScript[1].replace(/^\s*import .*;\r?\n/gm, '');
new Function(syntaxOnlySource);

console.log('Ruby Ragdoll Lab smoke test passed.');
