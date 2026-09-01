# Soldier Ragdoll Math Lab

The Math Lab is a Three.js-rendered custom rigid-body implementation of the
Soldier ragdoll. Three.js supplies rendering, asset loading, and vector/
quaternion adapters; the portable JavaScript/TypeScript core owns the physics
contracts. Rapier is not a runtime dependency of this page.

For the reusable process behind this implementation, read
[Clone Behavior, Not Constants](../docs/parity/CLONE_BEHAVIOR_NOT_CONSTANTS.md).

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
its presentation path separately; interactive behavior is not used as parity
evidence.

The interactive path advances a filtered three-dimensional cursor target once
per fixed step, then drives the selected local anchor through a damped compliant
point attachment. Twenty alternating velocity passes propagate that attachment
through the articulated island before integration, so moving a selected foot or
hand accelerates the connected body instead of only the selected capsule. A
frame-normalized positional grab row then runs before the joint rows in each of
the 27 coupled projection passes. Joint anchors therefore finish closed rather
than yielding after the selected body follows the cursor. Each pass still ends
on stage contact, keeping a held body bounded against the arena. While held,
nonselected bodies receive additional linear damping and the articulated chain
receives a lower angular-speed cap. Head self-contact is limited to the chest
and upper chest, disabled during a hold, and restored only after relative motion
is quiet. Interactive stage support acts only on bodies that actually contact
the arena; it does not apply the parity lane's whole-island velocity retention
or disable grounded joint-velocity transfer. Interactive sleep requires one
continuous quiet interval, so a transient low-velocity frame cannot freeze a
partially supported torso above the floor. After projection, the interactive
velocity rebuild preserves the joint solver's linear and angular constraint
deltas. Fixed sections therefore remain cohesive and hinge motion converges
instead of being regenerated on every frame after an impact. Interactive fixed
frames, hinge axes, and limit violations use stronger angular projection than
the preserved parity lane, reaching their intended rigidity during the impact
rather than gradually over the following frames.

While dragging, a velocity-neutral translational anchor projection follows each
normal articulated solve while the cursor target is moving. Stationary holds
remain with the regular contact-coupled joint solve. This removes visible limb
stretch without converting the correction into throw velocity or making
sustained floor contact chatter.

Once at least eight bodies continuously support a low-hips pose for half a
second and the whole chain is moving slowly, the interactive lane attenuates
the remaining linear and angular correction velocities to zero before applying
its existing continuous quiet-window sleep rule. A supported sleeping island
retains this evidence across a small wake-up, with brief contact loss decaying
the evidence instead of erasing it; ordinary drops still start from zero. This
broad-support gate removes visible floor creep without capturing a partly
landed, upright, launched, or held pose. The deterministic parity lane does not
use this rest capture.

Interactive stage and head penetration retain direct bounded translation and
use point effective mass to derive a 12-percent angular response about the
contact arm. This lets a floor correction rotate a capsule toward the contact
without the full lever-arm response destabilizing the articulated chain. Sleep
remains blocked while any articulation seam exceeds two centimeters, so no
terminal pose projection is needed and the frozen pose is already cohesive
before its velocities are zeroed. Once correction velocity is zero, two
mass-balanced 1.6-centimeter-capped anchor sweeps close the remaining error
gradually instead of snapping the pose at the sleep boundary.

The interactive integrator and velocity update are separate from the preserved
parity implementations. Per-body render scratch objects, drag scratch vectors,
and reusable contact arrays avoid recurrent allocation in the main simulation
and pose-mapping loops. Resting requires measured linear and angular quiet; the
page no longer force-sleeps a moving chain after a fixed contact timeout.

`?manual=1` pauses automatic stepping while retaining the assisted interaction
policies. `tests/ragdoll-interactive-browser.mjs` uses that mode to exercise
both pages deterministically and checks finite state, quaternion normalization,
bounded joint stretch, broad floor support, quiet sleep, post-landing drift,
post-sleep impulse wake/recovery, foot-pull response, sustained floorward
holds, drag-release recovery, and reset restoration. It also compares the Math
results with an assisted Rapier oracle envelope for support timing, resting
shape, contact count, joint closure, drag travel, and floor-hold motion. The
settling cases sample every fixed frame, retain the pre-sleep joint error and
largest one-frame pose delta, and reject any Math sleep transition above two
centimeters.

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

The 20-scenario gate passed ten local repetitions per scenario on 2026-08-23
after the interactive parity and allocation-reduction pass.
All 200 authority traces were deterministic within their scenario, and every
strict or bounded behavioral comparison passed. The retained run is
`output/parity/2026-08-24T02-36-59.893Z/`.

The unobscured visual run at
`output/parity/2026-08-23T09-16-11.135Z/` captured synchronized full-drop and
horizontal-hand-drag frames. GenEye accepted all compared 1280x720 captures as
usable: the initial full-drop pair had perceptual distance 0, while the dynamic
full-drop and drag pairs each had distance 3 at threshold 8. Visual inspection
confirmed intact skinning and articulated chains without tearing or joint
explosion. Behavioral parity is deliberately bounded rather than pixel or
per-body pose identity.
