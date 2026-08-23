import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { stripTypeScriptTypes } from 'node:module';
import * as javaScriptCore from '../shared/ragdoll-core/index.js';
const source = await readFile(new URL('../shared/ragdoll-core/index.ts', import.meta.url), 'utf8');
const declarations = await readFile(new URL('../shared/ragdoll-core/index.d.ts', import.meta.url), 'utf8');
for (const symbol of ['export interface MassProperties', 'export interface PortableBody', 'export interface InertialBody', 'export function capsuleMassProperties', 'export function updateWorldInverseInertia', 'export function applyImpulse(', 'export function applyTorqueImpulse(', 'export function applyImpulseAtPoint(', 'export function solvePointEffectiveMass(', 'export function solvePairPointEffectiveMass(', 'export function dampingFactor']) assert.ok(source.includes(symbol), `missing ${symbol}`);
for (const symbol of ['solvePointEffectiveMass', 'solvePairPointEffectiveMass', 'updateWorldInverseInertia']) assert.ok(declarations.includes(symbol), `declaration missing ${symbol}`);
assert.match(source, /return 1 \/ \(1 \+ dt \* damping\)/);
assert.match(source, /body\.velocity\.addScaledVector\(impulse, body\.inverseMass\)/);
assert.match(source, /localInverseInertia/);
assert.doesNotMatch(source, /\bany\b/, 'portable TypeScript core must not erase solver types with any');

const executableSource = stripTypeScriptTypes(source, { mode: 'strip' });
const typeScriptCore = await import(`data:text/javascript;base64,${Buffer.from(executableSource).toString('base64')}`);
class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
  addScaledVector(v, scale) { this.x += v.x * scale; this.y += v.y * scale; this.z += v.z * scale; return this; }
  sub(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; }
  cross(v) { const { x, y, z } = this; this.x = y * v.z - z * v.y; this.y = z * v.x - x * v.z; this.z = x * v.y - y * v.x; return this; }
  applyMatrix3() { return this; }
  toArray() { return [this.x, this.y, this.z]; }
}
class Matrix3 { set() { return this; } clone() { return new Matrix3(); } copy() { return this; } transpose() { return this; } multiply() { return this; } setFromMatrix4() { return this; } }
class Matrix4 { makeRotationFromQuaternion() { return this; } }
const body = (inverseMass) => ({ dynamic: true, inverseMass, inverseInertia: 1, position: new Vector3(), velocity: new Vector3(), angularVelocity: new Vector3(), rotation: {}, localInverseInertia: new Matrix3(), worldInverseInertia: new Matrix3() });
for (const core of [javaScriptCore, typeScriptCore]) {
  const single = core.solvePointEffectiveMass(body(.5), new Vector3(), new Vector3(2, 4, 6), Vector3, Matrix3, Matrix4);
  const pair = core.solvePairPointEffectiveMass(body(.5), new Vector3(), body(1.5), new Vector3(), new Vector3(2, 4, 6), Vector3, Matrix3, Matrix4);
  assert.deepEqual(single.toArray(), [4, 8, 12]);
  assert.deepEqual(pair.toArray(), [1, 2, 3]);
}
console.log('Ragdoll core TypeScript contract passed.');
