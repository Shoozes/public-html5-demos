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
export interface Matrix4Like { makeRotationFromQuaternion(q: unknown): Matrix4Like }
export type Vector3Constructor = new (x?: number, y?: number, z?: number) => Vector3Like;
export type Matrix3Constructor = new () => Matrix3Like;
export type Matrix4Constructor = new () => Matrix4Like;
export interface MassProperties { mass: number; inverseMass: number; localInverseInertia: Matrix3Like; inverseInertia: number; principalInertia: Vector3Like }
export interface PortableBody { dynamic: boolean; velocity: Vector3Like; inverseMass: number; position: Vector3Like }
export interface InertialBody extends PortableBody { angularVelocity: Vector3Like; rotation: unknown; localInverseInertia: Matrix3Like; worldInverseInertia: Matrix3Like; inverseInertia: number }
export declare function capsuleMassProperties(args: { radius: number; halfHeight: number; density: number; Vector3: Vector3Constructor; Matrix3: Matrix3Constructor }): MassProperties;
export declare function updateWorldInverseInertia(body: InertialBody, Matrix3: Matrix3Constructor, Matrix4: Matrix4Constructor): Matrix3Like;
export declare function applyImpulse(body: PortableBody, impulse: Vector3Like): void;
export declare function applyTorqueImpulse(body: InertialBody, torque: Vector3Like, Matrix3: Matrix3Constructor, Matrix4: Matrix4Constructor): void;
export declare function applyImpulseAtPoint(body: InertialBody, impulse: Vector3Like, worldPoint: Vector3Like, Matrix3: Matrix3Constructor, Matrix4: Matrix4Constructor): void;
export declare function solvePointEffectiveMass(body: InertialBody, point: Vector3Like, target: Vector3Like, Vector3: Vector3Constructor, Matrix3: Matrix3Constructor, Matrix4: Matrix4Constructor): Vector3Like;
export declare function solvePairPointEffectiveMass(bodyA: InertialBody, pointA: Vector3Like, bodyB: InertialBody, pointB: Vector3Like, target: Vector3Like, Vector3: Vector3Constructor, Matrix3: Matrix3Constructor, Matrix4: Matrix4Constructor): Vector3Like;
export declare function dampingFactor(dt: number, damping: number): number;
