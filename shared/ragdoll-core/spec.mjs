// Canonical, browser-consumable ragdoll contract. Keep numeric authority here.
export const RAGDOLL_SPEC_VERSION = 1;
export const STEP_SECONDS = 1 / 60;
export const GRAVITY_METERS_PER_SECOND_SQUARED = 9.81;
export const TARGET_HUMAN_HEIGHT_METERS = 1.8;
export const SEGMENTS = Object.freeze([
  ['hips', null], ['spine', 'hips'], ['chest', 'spine'], ['upperChest', 'chest'], ['neck', 'upperChest'], ['head', 'neck'],
  ['leftUpperArm', 'upperChest'], ['leftForearm', 'leftUpperArm'], ['leftHand', 'leftForearm'],
  ['rightUpperArm', 'upperChest'], ['rightForearm', 'rightUpperArm'], ['rightHand', 'rightForearm'],
  ['leftThigh', 'hips'], ['leftShin', 'leftThigh'], ['leftFoot', 'leftShin'],
  ['rightThigh', 'hips'], ['rightShin', 'rightThigh'], ['rightFoot', 'rightShin']
].map(([id, parent]) => Object.freeze({ id, parent })));
export const JOINTS = Object.freeze({
  spine: { type: 'fixed' }, chest: { type: 'fixed' }, upperChest: { type: 'fixed' }, neck: { type: 'fixed' }, head: { type: 'fixed' },
  leftUpperArm: { type: 'hinge', limits: [-1.2, 1.2] }, leftForearm: { type: 'hinge', limits: [-1.35, 1.35] }, leftHand: { type: 'fixed' },
  rightUpperArm: { type: 'hinge', limits: [-1.2, 1.2] }, rightForearm: { type: 'hinge', limits: [-1.35, 1.35] }, rightHand: { type: 'fixed' },
  leftThigh: { type: 'hinge', limits: [-0.9, 0.9] }, leftShin: { type: 'hinge', limits: [-1.25, 1.25] }, leftFoot: { type: 'hinge', limits: [-0.45, 0.45] },
  rightThigh: { type: 'hinge', limits: [-0.9, 0.9] }, rightShin: { type: 'hinge', limits: [-1.25, 1.25] }, rightFoot: { type: 'hinge', limits: [-0.45, 0.45] }
});
