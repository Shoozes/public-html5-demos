# Soldier Ragdoll Math Lab

This is the dependency-free physics alternate to `ragdoll-lab`. Three.js is used only for rendering, loading the Soldier asset, and its vector/quaternion data types. It has no Rapier import or runtime dependency.

## Custom articulated solver

The custom solver maps the same named Soldier bones and simulated segments as the authoritative demo into capsule-like rigid bodies. Each body stores only transferable physics state:

- world-space position and orientation
- linear and angular velocity
- inverse mass and inverse rotational inertia
- a capsule radius and half-height
- mass and rotational inertia derived from the same capsule density (`1.15`) as the original
- a local joint anchor for its parent connection

Screen interaction follows the same camera ray contract as the original Lab. `intersectRayCapsule` transforms the pointer ray into each body's local capsule space, tests the cylinder and endpoint spheres, and returns the nearest collider hit. The visible drag target is the ray/plane intersection through that exact 3D point, with the original `y >= 0.18` cursor clamp. At stage contact, the internal constraint target is raised only enough to keep the selected capsule outside the floor while the marker remains under the pointer.

At a fixed 60 Hz, `runCustomRigidStep` does the following:

1. `integrateRigidBodies(dt)` advances linear velocity with gravity and orientation with angular velocity.
2. `propagateRigidDragTarget()` divides a sudden pointer jump into as many as twelve internal cursor increments, coherently pre-translates the full chain by 60% of each increment, and runs alternating joint sweeps after every increment. That preconditioner preserves anchor spacing while the remaining point-force correction still articulates the held limb. The visible marker and throw sampling continue to use the raw pointer target, while the articulated chain reaches that target inside the same fixed step instead of letting a grabbed hand outrun its arm.
3. `constrainRigidBodies()` performs 20 coupled sequential Gauss-Seidel passes over joints, the drag anchor, finite-stage contacts, and head contacts. Alternating forward and reverse joint sweeps keep corrections from accumulating at one end of the skeleton. The dragged body has zero effective constraint mass and a hard positional tie, matching the original kinematic cursor joint without turning the remaining body into an elastic chain. Stage and held-cursor corrections remain velocity-neutral. A bounded 12% of joint correction reaches the next velocity update in free motion; multi-body stage contact transfers none of that projection into velocity, preventing floor contention from continuously re-injecting energy. Final coupled articulation/contact sweeps end on collision so no limb is left below the stage between frames.
4. `solveRigidJoint(child)` projects parent/child anchor positions together. Fixed torso, neck, head, and hand joints additionally restore their reference orientation. Hinged elbows and knees align their hinge axes and enforce their configured range.
5. Floorward dragging keeps the visual cursor on the requested screen-space target while raising the internal constraint anchor just enough to keep the selected capsule outside the stage. This removes the impossible drag-versus-floor constraint pair that otherwise injects angular energy. Cursor projection is translational rather than torque-producing. Free-space grabs still rotate naturally, while a selected capsule pressed into the floor is damped toward its last collision-free orientation so the rest of the articulated body cannot revolve indefinitely around a pinned floor pivot.
6. `solveRigidStageContact(segment)` resolves against the same finite cylinder as the visible arena: top surface at `y = -0.04`, radius `7.35`, and a short outer wall. Once a capsule center crosses the rim, side overlap is measured from its inward surface and resolved outward; the stage therefore sheds the body instead of acting like an inward retaining wall. A capsule fully outside the disc is allowed to fall, and launch flight bypasses the side entirely. Applying a contact correction at the capsule contact point also changes orientation, which prevents hands or limbs from visually sinking through the floor. The matching previous transform follows only that contact projection, so zero-restitution support does not become artificial rebound velocity while joint and cursor motion remains dynamic.
7. `solveRigidHeadContacts()` reproduces the original's filtered collision groups: the head capsule can contact every non-head, non-neck body while limb-to-limb contacts remain disabled. Closest points on the two capsule center segments determine the zero-restitution positional separation.
8. `updateRigidVelocities(dt)` derives new velocities from the solved position/orientation, applies bounded damping, and removes downward/tangential energy at direct stage contacts. When at least two bodies support the chain and the hips are at or below `y = 0.9`, a 15% per-step linear-velocity retention damps linked non-contact translation; hips-high compact poses retain 65% so gravity can unfold them instead of preserving a crouched ball. Angular motion keeps the original damping profile unless that body directly contacts the stage, allowing raised limbs to finish settling. Launch flight bypasses contact-chain damping for the same 0.95-second low-damping window as the original Lab. `settleRigidRagdollAtRest(dt)` sleeps a quiet contact-supported ragdoll after 0.22 seconds and has a 1.2-second sustained-contact ceiling for solver chatter; active drag and launch flight always stay awake. Drop itself adds no custom lean or impulse.
9. `applyPoseFromRigidBodies()` converts each solved rigid-body transform back into the GLB skeleton's local bone transform.

The essential positional solve is deliberately portable:

    error = childAnchorWorld - parentAnchorWorld
    parent.position += error * parentInverseMass / totalInverseMass
    child.position  -= error * childInverseMass / totalInverseMass

For an anchor that is not at a body's center, the same correction produces an angular adjustment using the moment arm:

    angularCorrection = cross(contactPoint - body.position, correction) * inverseInertia

That is sufficient to reproduce tactile articulated behavior without an external rigid-body library. A target language needs vectors, quaternions, a fixed step, and the small functions named above; Three.js itself is not part of the solver contract.

Gravity uses the same scale conversion as the original: `-9.81 * (modelHeight / 1.8)`. It is therefore expressed in the model's world units per second squared rather than as a hand-tuned scene constant.

## Deliberate scope

This lab currently has capsule-to-finite-stage contacts, the original's filtered head-to-body contacts, the joint constraints needed for Soldier, and whole-ragdoll rest sleeping. It does not yet include general limb self-collision, a broad phase, continuous collision detection, per-island sleeping, or a full impulse/friction-cone formulation. Those are additive solver stages, not hidden dependencies.

## Parity work

The default presentation, model, stage dimensions, camera controls, control labels, and segmented skeleton are kept aligned with `ragdoll-lab`. We validate that contract with:

    node tests/ragdoll-parity.mjs

For behavior and visual tuning, run headless Playwright against local static hosting and retain test-owned screenshots under `output/playwright`. GenEye may compare those screenshots as read-only evidence; it never controls a browser or decides whether tests pass.
