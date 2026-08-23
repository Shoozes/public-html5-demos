// Small dependency-free rigid-body primitives shared by browser demos.
// The host supplies Three.js-compatible Vector3/Matrix3/Quaternion classes.
export function capsuleMassProperties({ radius, halfHeight, density, Vector3, Matrix3 }) {
  const cylinderLength = halfHeight * 2;
  const cylinderMass = Math.PI * radius * radius * cylinderLength * density;
  const capMass = (4 / 3) * Math.PI * radius ** 3 * density;
  const mass = Math.max(0.0001, cylinderMass + capMass);
  const axial = Math.max(0.00001, 0.5 * cylinderMass * radius * radius + 0.4 * capMass * radius * radius);
  // The spherical part is two hemispheres whose centers of mass sit 3r/8
  // beyond the cylinder ends. The parallel-axis cross term is therefore
  // 3/4 * m_sphere * halfHeight * radius; treating the caps as one sphere at
  // the capsule center underestimates transverse inertia.
  const transverse = Math.max(0.00001,
    cylinderMass * (3 * radius * radius + cylinderLength * cylinderLength) / 12
    + capMass * (0.4 * radius * radius + halfHeight * halfHeight + 0.75 * halfHeight * radius));
  const localInverseInertia = new Matrix3().set(1 / transverse, 0, 0, 0, 1 / axial, 0, 0, 0, 1 / transverse);
  return { mass, inverseMass: 1 / mass, localInverseInertia, inverseInertia: 1 / transverse, principalInertia: new Vector3(transverse, axial, transverse) };
}

export function updateWorldInverseInertia(body, Matrix3, Matrix4) {
  const rotation = new Matrix4().makeRotationFromQuaternion(body.rotation);
  const r = new Matrix3().setFromMatrix4(rotation);
  const transpose = r.clone().transpose();
  body.worldInverseInertia.copy(r).multiply(body.localInverseInertia).multiply(transpose);
  return body.worldInverseInertia;
}

export function applyImpulse(body, impulse) {
  if (body.dynamic) body.velocity.addScaledVector(impulse, body.inverseMass);
}

export function applyTorqueImpulse(body, torque, Matrix3, Matrix4) {
  if (!body.dynamic) return;
  updateWorldInverseInertia(body, Matrix3, Matrix4);
  body.angularVelocity.add(torque.clone().applyMatrix3(body.worldInverseInertia));
}

export function applyImpulseAtPoint(body, impulse, worldPoint, Matrix3, Matrix4) {
  applyImpulse(body, impulse);
  const arm = worldPoint.clone().sub(body.position);
  applyTorqueImpulse(body, arm.cross(impulse), Matrix3, Matrix4);
}

function solveMatrix3Columns(x, y, z, target, Vector3) {
  const a = x.x, b = y.x, c = z.x;
  const d = x.y, e = y.y, f = z.y;
  const g = x.z, h = y.z, i = z.z;
  const determinant = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
  if (Math.abs(determinant) <= 1e-10) return new Vector3();
  return new Vector3(
    ((e * i - f * h) * target.x + (c * h - b * i) * target.y + (b * f - c * e) * target.z) / determinant,
    ((f * g - d * i) * target.x + (a * i - c * g) * target.y + (c * d - a * f) * target.z) / determinant,
    ((d * h - e * g) * target.x + (b * g - a * h) * target.y + (a * e - b * d) * target.z) / determinant
  );
}

function pointResponse(body, arm, axis) {
  return arm.clone().cross(axis)
    .applyMatrix3(body.worldInverseInertia)
    .cross(arm)
    .addScaledVector(axis, body.inverseMass);
}

export function solvePointEffectiveMass(body, point, target, Vector3, Matrix3, Matrix4) {
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

export function solvePairPointEffectiveMass(bodyA, pointA, bodyB, pointB, target, Vector3, Matrix3, Matrix4) {
  updateWorldInverseInertia(bodyA, Matrix3, Matrix4);
  updateWorldInverseInertia(bodyB, Matrix3, Matrix4);
  const armA = pointA.clone().sub(bodyA.position);
  const armB = pointB.clone().sub(bodyB.position);
  const combined = (axis) => pointResponse(bodyA, armA, axis).add(pointResponse(bodyB, armB, axis));
  return solveMatrix3Columns(
    combined(new Vector3(1, 0, 0)),
    combined(new Vector3(0, 1, 0)),
    combined(new Vector3(0, 0, 1)),
    target,
    Vector3
  );
}

export function dampingFactor(dt, damping) { return 1 / (1 + dt * damping); }
