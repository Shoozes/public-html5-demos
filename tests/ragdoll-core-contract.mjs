import assert from 'node:assert/strict';
import { STEP_SECONDS, SEGMENTS, JOINTS, RAGDOLL_SPEC_VERSION } from '../shared/ragdoll-core/spec.mjs';
import { dampingFactor, solvePointEffectiveMass, solvePairPointEffectiveMass } from '../shared/ragdoll-core/index.js';
assert.equal(RAGDOLL_SPEC_VERSION, 1);
assert.equal(STEP_SECONDS, 1 / 60);
assert.equal(SEGMENTS.length, 18);
assert.equal(SEGMENTS[0].id, 'hips');
assert.equal(SEGMENTS.at(-1).id, 'rightFoot');
assert.equal(JOINTS.leftUpperArm.type, 'hinge');
assert.deepEqual(JOINTS.leftUpperArm.limits, [-1.2, 1.2]);
assert.equal(dampingFactor(1 / 60, 16), 1 / (1 + 16 / 60));

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
const target = new Vector3(2, 4, 6);
assert.deepEqual(solvePointEffectiveMass(body(.5), new Vector3(), target, Vector3, Matrix3, Matrix4).toArray(), [4, 8, 12]);
assert.deepEqual(solvePairPointEffectiveMass(body(.5), new Vector3(), body(1.5), new Vector3(), target, Vector3, Matrix3, Matrix4).toArray(), [1, 2, 3]);
console.log('Ragdoll core contract passed.');
