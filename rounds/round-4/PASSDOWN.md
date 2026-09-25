# Task: Build the Hostile Space Sector HAIO

## What

Build a polished, immediately playable HTML-all-in-one hostile-space game prototype at `submission/index.html`. The player pilots one ship through a named sector with four named hostile ships, a neutral station, a neutral vessel, landmarks, debris, and salvage. It should feel like the first navigable room of a graphical space MUD, not an empty shooting range.

The game must be one portable HTML file with no build step or repository runtime files. Harness scripts, screenshots, decisions, and evidence remain development-only.

## Why

This round tests whether a coding agent can interpret a structured pass-down, preserve HAIO/WebGPU/TSL constraints, connect movement/combat/lifecycle/salvage behavior, test in a real browser, repair failures, and leave credible proof.

## Who

The assigned model is sole implementation owner. It records five to ten material interpretations in `submission/DECISIONS.md`, makes safe routine decisions without clarification, implements them consistently, and does not inspect other model submissions.

## When and where

Work in the assigned isolated branch or worktree. Do not change the shared harness or rubric during a model run. Evidence belongs in `submission/evidence/`.

## How

### Artifact and bootstrap

- Inline all HTML, CSS, and game JavaScript.
- Use no external assets and only pinned Three.js 0.185.1 CDN modules.
- Use `WebGPURenderer`, allowing its WebGL2 backend.
- Use guarded dynamic imports, await renderer initialization, and show staged import/renderer/scene/update/render errors.
- Use TSL/node materials for custom shader behavior; do not use shader source strings or shader materials.
- Cap pixel ratio at 2, handle resize/orientation, and establish exactly one animation loop.
- The first frame contains the player, readable space, a landmark, no overlay, and no console error.

### World ownership

- World relationships use stable numeric entity IDs; scene objects are representations, not truth.
- Selected/target IDs are validated before use.
- Spawn and destruction are staged; pending-destroy entities immediately stop participating.
- Cleanup removes simulation, collision, selection, targeting, rendering, and references.
- Registered shared geometry/materials stay immutable. Unique/transient resources have explicit ownership.
- Restart tears down and reconstructs the world without creating another animation loop.
- Diagnostics prove live target/selection IDs, no selectable pending destroys, no removed render remnants, no duplicate representation, and one loop.

### Sector

Procedurally create a player, four named hostiles, a named neutral station, a named roaming neutral, two named wreck/beacon landmarks, anchored debris, and stable far-field stars. Major ships are multi-primitive, lit, three-dimensional silhouettes with height and emissive accents.

### Movement and camera

- Support WASD, arrow keys, and one Pointer Events virtual joystick.
- Use consistent XZ movement and cardinal facing.
- Reset input on blur, cancellation, hidden document, restart, and death.
- Use a fixed-yaw, slightly oblique tactical camera with the player near center at roughly 8–12% viewport height.
- Fit several contacts, preserve visible hull height, never change zoom for targeting, and make world movement visually obvious.

### Threat-gated automatic combat

- No permanent manual fire button and no hostile projectile in the first three seconds without input.
- Hostiles become aggressive through a coherent encounter rule; only aggressive hostiles can be auto-targeted.
- Acquire the nearest eligible aggressive hostile inside an acquisition radius only when no valid target exists.
- Preserve a valid lock; use a larger break radius; clear dead, non-hostile, or distant locks.
- Auto-fire only at a valid in-range target after cooldown. The weapon pivot aims independently without overwriting movement heading.
- Tapping the locked hostile or the compact HUD control disengages, suppressing immediate reacquisition.
- Projectiles are non-homing and carry owner/faction/lifetime/range with swept collision, one-hit cleanup, and no owner/friendly damage.

### Magnetic salvage

Destroyed hostiles leave staged drops with outward impulse, a readable free delay, magnetic attraction, automatic close collection, one credit update, visible collection feedback, and normal cleanup. Ordinary drops require no selection or contextual action.

### HUD and events

Keep hull, credits, selection, combat lock/disengage, two to four simulation-driven events, contextual landmark action, restart, and fullscreen compact and edge-mounted. Do not intercept unrelated playfield taps or repeat unchanged selection messages.

### Verification

Run and repair all scenarios in `harness/run-scenarios.mjs`. Capture first-frame, combat, destruction/pickups, collection, and post-restart screenshots. Record exact commands, results, backend, artifacts, invariants, limitations, line count, and bytes in `submission/EVIDENCE.md`. Never claim unrun proof.

## Done when

All hard gates and required scenarios pass; the artifact is standalone; no uncaught console or failed network request remains; combat and restart invariants pass; the decision log matches the behavior; and evidence matches the actual files.
