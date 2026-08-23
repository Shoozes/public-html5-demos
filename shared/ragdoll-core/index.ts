export interface Vector3Like {
  x: number;
  y: number;
  z: number;
  clone(): Vector3Like;
  add(v: Vector3Like): Vector3Like;
  addScaledVector(v: Vector3Like, scale: number): Vector3Like;
  sub(v: Vector3Like): Vector3Like;
  cross(v: Vector3Like): Vector3Like;
  applyMatrix3(m: Matrix3Like): Vector3Like;
}

export interface Matrix3Like {
  set(...values: number[]): Matrix3Like;
  clone(): Matrix3Like;
  copy(m: Matrix3Like): Matrix3Like;
  transpose(): Matrix3Like;
  multiply(m: Matrix3Like): Matrix3Like;
  setFromMatrix4(m: Matrix4Like): Matrix3Like;
}

export interface Matrix4Like {
  makeRotationFromQuaternion(q: unknown): Matrix4Like;
}

export type Vector3Constructor = new (x?: number, y?: number, z?: number) => Vector3Like;
export type Matrix3Constructor = new () => Matrix3Like;
export type Matrix4Constructor = new () => Matrix4Like;

export interface MassProperties {
  mass: number;
  inverseMass: number;
  localInverseInertia: Matrix3Like;
  inverseInertia: number;
  principalInertia: Vector3Like;
}

export interface PortableBody {
  dynamic: boolean;
  velocity: Vector3Like;
  inverseMass: number;
  position: Vector3Like;
}

export interface InertialBody extends PortableBody {
  angularVelocity: Vector3Like;
  rotation: unknown;
  localInverseInertia: Matrix3Like;
  worldInverseInertia: Matrix3Like;
  inverseInertia: number;
}

export function capsuleMassProperties(args: {
  radius: number;
  halfHeight: number;
  density: number;
  Vector3: Vector3Constructor;
  Matrix3: Matrix3Constructor;
}): MassProperties {
  const { radius, halfHeight, density, Vector3, Matrix3 } = args;
  const cylinderLength = halfHeight * 2;
  const cylinderMass = Math.PI * radius * radius * cylinderLength * density;
  const capMass = (4 / 3) * Math.PI * radius ** 3 * density;
  const mass = Math.max(0.0001, cylinderMass + capMass);
  const axial = Math.max(0.00001, 0.5 * cylinderMass * radius * radius + 0.4 * capMass * radius * radius);
  const transverse = Math.max(
    0.00001,
    cylinderMass * (3 * radius * radius + cylinderLength * cylinderLength) / 12
      + capMass * (0.4 * radius * radius + halfHeight * halfHeight + 0.75 * halfHeight * radius)
  );
  const localInverseInertia = new Matrix3().set(
    1 / transverse, 0, 0,
    0, 1 / axial, 0,
    0, 0, 1 / transverse
  );
  return {
    mass,
    inverseMass: 1 / mass,
    localInverseInertia,
    inverseInertia: 1 / transverse,
    principalInertia: new Vector3(transverse, axial, transverse)
  };
}

export function updateWorldInverseInertia(
  body: InertialBody,
  Matrix3: Matrix3Constructor,
  Matrix4: Matrix4Constructor
): Matrix3Like {
  const rotation = new Matrix4().makeRotationFromQuaternion(body.rotation);
  const worldRotation = new Matrix3().setFromMatrix4(rotation);
  body.worldInverseInertia.copy(worldRotation)
    .multiply(body.localInverseInertia)
    .multiply(worldRotation.clone().transpose());
  return body.worldInverseInertia;
}

export function applyImpulse(body: PortableBody, impulse: Vector3Like): void {
  if (body.dynamic) body.velocity.addScaledVector(impulse, body.inverseMass);
}

export function applyTorqueImpulse(
  body: InertialBody,
  torque: Vector3Like,
  Matrix3: Matrix3Constructor,
  Matrix4: Matrix4Constructor
): void {
  if (!body.dynamic) return;
  updateWorldInverseInertia(body, Matrix3, Matrix4);
  body.angularVelocity.add(torque.clone().applyMatrix3(body.worldInverseInertia));
}

export function applyImpulseAtPoint(
  body: InertialBody,
  impulse: Vector3Like,
  worldPoint: Vector3Like,
  Matrix3: Matrix3Constructor,
  Matrix4: Matrix4Constructor
): void {
  applyImpulse(body, impulse);
  applyTorqueImpulse(body, worldPoint.clone().sub(body.position).cross(impulse), Matrix3, Matrix4);
}

function solveMatrix3Columns(
  x: Vector3Like,
  y: Vector3Like,
  z: Vector3Like,
  target: Vector3Like,
  Vector3: Vector3Constructor
): Vector3Like {
  const [a, b, c] = [x.x, y.x, z.x];
  const [d, e, f] = [x.y, y.y, z.y];
  const [g, h, i] = [x.z, y.z, z.z];
  const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(determinant) <= 1e-10) return new Vector3();
  return new Vector3(
    ((e * i - f * h) * target.x + (c * h - b * i) * target.y + (b * f - c * e) * target.z) / determinant,
    ((f * g - d * i) * target.x + (a * i - c * g) * target.y + (c * d - a * f) * target.z) / determinant,
    ((d * h - e * g) * target.x + (b * g - a * h) * target.y + (a * e - b * d) * target.z) / determinant
  );
}

function pointResponse(body: InertialBody, arm: Vector3Like, axis: Vector3Like): Vector3Like {
  return arm.clone().cross(axis)
    .applyMatrix3(body.worldInverseInertia)
    .cross(arm)
    .addScaledVector(axis, body.inverseMass);
}

export function solvePointEffectiveMass(
  body: InertialBody,
  point: Vector3Like,
  target: Vector3Like,
  Vector3: Vector3Constructor,
  Matrix3: Matrix3Constructor,
  Matrix4: Matrix4Constructor
): Vector3Like {
  updateWorldInverseInertia(body, Matrix3, Matrix4);
  const arm = point.clone().sub(body.position);
  return solveMatrix3Columns(
    pointResponse(body, arm, new Vector3(1, 0, 0)),
    pointResponse(body, arm, new Vector3(0, 1, 0)),
    pointResponse(body, arm, new Vector3(0, 0, 1)),
    target,
    Vector3
  );
}

export function solvePairPointEffectiveMass(
  bodyA: InertialBody,
  pointA: Vector3Like,
  bodyB: InertialBody,
  pointB: Vector3Like,
  target: Vector3Like,
  Vector3: Vector3Constructor,
  Matrix3: Matrix3Constructor,
  Matrix4: Matrix4Constructor
): Vector3Like {
  updateWorldInverseInertia(bodyA, Matrix3, Matrix4);
  updateWorldInverseInertia(bodyB, Matrix3, Matrix4);
  const armA = pointA.clone().sub(bodyA.position);
  const armB = pointB.clone().sub(bodyB.position);
  const combined = (axis: Vector3Like): Vector3Like => pointResponse(bodyA, armA, axis)
    .add(pointResponse(bodyB, armB, axis));
  return solveMatrix3Columns(
    combined(new Vector3(1, 0, 0)),
    combined(new Vector3(0, 1, 0)),
    combined(new Vector3(0, 0, 1)),
    target,
    Vector3
  );
}

export function dampingFactor(dt: number, damping: number): number {
  return 1 / (1 + dt * damping);
}
