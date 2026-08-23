# Soldier Ragdoll Math Lab

The Math Lab is a Three.js-rendered custom rigid-body implementation of the
Soldier ragdoll. Three.js supplies rendering, asset loading, and vector/
quaternion adapters; the portable JavaScript/TypeScript core owns the physics
contracts. Rapier is not a runtime dependency of this page.

## Solver boundary

The shared core owns the narrow, reusable numerical pieces required by both
adapters:

- capsule mass, principal inertia, and rotated world inverse inertia;
- impulse and torque-impulse application;
- Rapier-compatible rational damping;
- 3x3 single-body and two-body point effective-mass kernels.

The page adapter supplies the Soldier skeleton, fixed and hinge constraints,
finite-cylinder contacts, trace capture, and rendering. Both pages consume the
same named skeleton specification and fixed-step parity protocol.

## Parity and assisted paths

`?parity=1` runs the deterministic physical path used by the browser harness.
It replays serializable commands at 60 Hz, solves the cursor as a mass-infinite
kinematic point constraint, and records bodies, joints, contacts, sleep, and
configuration in the shared trace schema. The ordinary interactive page keeps
its assisted UI path separately for responsive presentation behavior; assisted
preconditioning is not used as parity evidence.

There are 20 registered scenarios: 16 strict micro scenarios for impulses,
damping, inertia, contacts, joints, limits, overlap, and cursor steps; and four
full scenarios compared with bounded behavioral observables. Full comparison
uses center-of-mass path and RMS velocity, absolute joint error, gross stage
contact onset/final count, durable settle timing, arena-exit timing, and
geometric pose class. Full toss allows a 70-step settle tolerance. Arena-exit
comparison ignores settle timing after both backends have crossed the rim; the
traces still retain the post-exit frames.

## Contact scope

Stage contact uses a finite-cylinder model with a targeted speculative rim band
for fast capsule crossings. This is a bounded CCD-style safeguard, not a
general continuous-collision-detection subsystem. The articulated contact
manifold uses a synthetic rolling row bounded at 0.15 of the Coulomb radius
limit; it is intentionally narrower than a general friction-cone solver.
General limb self-collision, broad-phase management, arbitrary collider types,
per-island sleep, and a general CCD implementation remain outside this demo's
scope.

## Verification

Run the structural and trace unit checks first:

```text
node tests/ragdoll-contract-smoke.mjs
node tests/ragdoll-parity-server.mjs
node tests/ragdoll-trace-parity.mjs --unit
node tests/ragdoll-core-contract.mjs
node tests/ragdoll-core-typescript-contract.mjs
```

Run the browser harness with pinned Playwright dependencies using:

```text
node tools/ragdoll-parity/run.mjs --determinism-runs=10
```

The 20-scenario gate passed ten local repetitions per scenario on 2026-08-23.
All 200 authority traces were deterministic within their scenario, and every
strict or bounded behavioral comparison passed. The retained run is
`output/parity/2026-08-23T10-06-34.605Z/`.

The unobscured visual run at
`output/parity/2026-08-23T09-16-11.135Z/` captured synchronized full-drop and
horizontal-hand-drag frames. GenEye accepted all compared 1280x720 captures as
usable: the initial full-drop pair had perceptual distance 0, while the dynamic
full-drop and drag pairs each had distance 3 at threshold 8. Visual inspection
confirmed intact skinning and articulated chains without tearing or joint
explosion. Behavioral parity is deliberately bounded rather than pixel or
per-body pose identity.
