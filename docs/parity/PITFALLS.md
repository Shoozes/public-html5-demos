# Ragdoll parity pitfalls

This ledger records the failure modes that can make the custom ragdoll look plausible while diverging from the Rapier authority. The runtime trace harness is the verification authority. Source-string checks cover only the construction contract.

## Focused guard commands

```text
node tests/ragdoll-contract-smoke.mjs
node tests/ragdoll-parity-server.mjs
node tests/ragdoll-trace-parity.mjs --unit
node tools/ragdoll-parity/run.mjs --scenario full-toss-seed-1
```

Browser runs retain JSONL traces and first-divergence reports under `output/parity/<run-id>/`.
The complete local gate is:

```text
node tools/ragdoll-parity/run.mjs --determinism-runs=10
```

Current evidence: the local 2026-08-23 gate passes all 20 scenarios (16 strict
micro scenarios and four bounded behavioral full scenarios) across ten
repetitions each. Every scenario has one unique authority trace hash across its
ten runs, and every strict or bounded behavioral comparison passes. Retained
evidence: `output/parity/2026-08-23T10-06-34.605Z/`.

The synchronized visual run in
`output/parity/2026-08-23T09-16-11.135Z/` passes full-drop and
full-horizontal-hand-drag. GenEye rated all compared 1280x720 inputs usable:
distance 0 for the initial pair and distance 3 for both dynamic pairs at
threshold 8. Human inspection confirms intact skinning and articulation with
no mesh tearing or joint explosion; bounded full-scenario parity does not claim
pixel-identical or per-body-identical poses.

## Current ordering

| ID | Failure mode | Taxonomy | Regression scenario |
| --- | --- | --- | --- |
| RAG-PAR-001 | Source-string smoke test labeled as behavioral parity | instrumentation-gap | full-drop |
| RAG-PAR-002 | Linear impulse treated as direct velocity | units-mismatch | center-impulse |
| RAG-PAR-003 | Torque impulse treated as direct angular velocity | units-mismatch | torque-impulse |
| RAG-PAR-004 | Coulomb friction treated as per-step velocity retention | stabilization-policy | capsule-floor-slide |
| RAG-PAR-005 | Rapier damping coefficient used with another damping formula | contract-mismatch | linear-damping-120 |
| RAG-PAR-006 | Scalar inertia used instead of a rotated 3D tensor | contract-mismatch | torque-impulse |
| RAG-PAR-007 | Child-only angular joint correction | solver-order-mismatch | fixed-pair-drop |
| RAG-PAR-008 | Hinge twist measured across mixed coordinate frames | reference-frame-mismatch | hinge-upper-limit |
| RAG-PAR-009 | Kinematic cursor joint replaced by global chain translation | stabilization-policy | cursor-ramp |
| RAG-PAR-010 | Floor drag freezes rotation and angular velocity | stabilization-policy | cursor-floor-push |
| RAG-PAR-011 | Non-quiet chain forced asleep after 1.2 seconds | stabilization-policy | full-drop |
| RAG-PAR-012 | A “20 iteration” label hides a variable 27-to-99-pass solve | solver-order-mismatch | cursor-step |
| RAG-PAR-013 | Custom backend misses fast rim crossings | contact-manifold-mismatch | capsule-rim-tip |
| RAG-PAR-014 | Stale Rapier source assignment treated as active configuration | version-api-drift | authority-determinism |
| RAG-PAR-015 | Random UI commands cannot be replayed | nondeterminism | full-toss-seed-1 |
| RAG-PAR-016 | Trace omits rotations, mass properties, and contact state | instrumentation-gap | trace-schema |

## Developer stories

### Q: RAG-PAR-001 — What pitfall are we preventing?
**What:** Calling a source-contract scan “parity.”<br>
**Context and constraints:** Both browser implementations must be compared at identical fixed steps without removing the lightweight static-demo workflow.<br>
**Why it happened:** The original test checked matching literals and symbols but never launched either page.<br>
**Where:** Retired `tests/ragdoll-parity.mjs`; replacement contract and trace tests under `tests/` and `tools/ragdoll-parity/`.<br>
**Evidence:** The old test could pass while toss units, damping, friction, joints, dragging, sleeping, and CCD differed.<br>
**Developer story:** A green test was compared with the executed code paths. The turning point was finding no browser launch, simulation step, transform capture, or numeric comparison in the test.<br>
**How to catch it:** Require nonempty body traces from both backends and a first-divergence report.<br>
**Solutions tried:** 1. `20/100` matching source strings; false behavioral confidence. 2. `95/100` separate contract smoke plus browser trace; preserves both contracts.<br>
**Current solution:** `ragdoll-contract-smoke.mjs` owns construction checks; `ragdoll-trace-parity.mjs` owns behavior.<br>
**Decision rationale:** Structural and runtime assertions answer different questions and must fail independently.<br>
**Effectiveness:** `95/100`, durable. It makes an empty or unavailable runtime comparison fail.<br>
**Relevance check:** Current. Reintroducing a source-only parity label would hide every downstream error.<br>
**Next prevention step:** Keep at least one intentionally perturbed comparator regression.

### Q: RAG-PAR-002 — What pitfall are we preventing?
**What:** Adding an impulse vector directly to linear velocity.<br>
**Context and constraints:** The same explicit command must have mass-dependent results in both backends.<br>
**Why it happened:** An impulse was treated as if its units were velocity.<br>
**Where:** Custom toss and command handling; `shared/ragdoll-core/`.<br>
**Evidence:** Rapier applies `deltaVelocity = inverseMass * impulse`; the old custom toss omitted inverse mass.<br>
**Developer story:** Deterministic toss inspection showed divergence before any contact or joint solve. Applying the dimensional relation isolated mass semantics as the first cause.<br>
**How to catch it:** `center-impulse` compares the first post-command velocity.<br>
**Solutions tried:** 1. `10/100` tune toss coefficients; body-specific and dimensionally wrong. 2. `96/100` central `applyImpulse`; direct and reusable.<br>
**Current solution:** All explicit linear impulses pass through inverse mass.<br>
**Decision rationale:** Correct units eliminate per-body tuning.<br>
**Effectiveness:** `96/100`, durable. Strict first-step coverage prevents regression.<br>
**Relevance check:** Current. Every toss and cursor release depends on it.<br>
**Next prevention step:** Cover impulse-at-point separately from center impulses.

### Q: RAG-PAR-003 — What pitfall are we preventing?
**What:** Adding torque impulse directly to angular velocity.<br>
**Context and constraints:** Capsules have different axial and transverse response.<br>
**Why it happened:** The custom body had one scalar inverse inertia and bypassed it during toss.<br>
**Where:** Custom torque command and mass-property core.<br>
**Evidence:** Equal torque vectors incorrectly produced equal angular deltas across differently shaped bodies.<br>
**Developer story:** The linear impulse fix left immediate rotational divergence. Separating torque from contacts showed that inertia application, not joint tuning, was the remaining first-step cause.<br>
**How to catch it:** `torque-impulse` compares angular velocity after one command.<br>
**Solutions tried:** 1. `12/100` scale torque coefficient; pose-dependent. 2. `94/100` apply the world inverse inertia tensor.<br>
**Current solution:** `applyTorqueImpulse` updates and applies world inverse inertia.<br>
**Decision rationale:** Tensor response is the smallest physically valid model.<br>
**Effectiveness:** `94/100`, durable. Orientation-sensitive regression remains explicit.<br>
**Relevance check:** Current. Throws, contacts, and joints all use angular inertia.<br>
**Next prevention step:** Add an impulse-at-offset scenario.

### Q: RAG-PAR-004 — What pitfall are we preventing?
**What:** Implementing friction as a per-frame velocity multiplier.<br>
**Context and constraints:** Stage/body friction coefficients describe a contact impulse bound, not velocity retention.<br>
**Why it happened:** The shared numeric coefficient was mistaken for shared behavior.<br>
**Where:** Custom stage contact and velocity update.<br>
**Evidence:** Multiplying by `0.86` sixty times retains roughly `0.000117` of tangential speed before chain-wide retention is applied.<br>
**Developer story:** The clone settled far earlier than the authority. Converting the repeated multiplier into its one-second retention exposed friction as velocity erasure.<br>
**How to catch it:** `capsule-floor-slide` compares tangent speed and accumulated contact impulses.<br>
**Solutions tried:** 1. `8/100` retune retention; frame-rate dependent. 2. `90/100` Coulomb tangent impulse clamped by the normal impulse.<br>
**Current solution:** Parity mode excludes velocity retention and uses the contact-impulse path.<br>
**Decision rationale:** It preserves unrelated tangential and articulated motion.<br>
**Effectiveness:** `90/100`, durable when contact impulse traces remain covered.<br>
**Relevance check:** Current. Sliding and settling depend on it.<br>
**Next prevention step:** Keep material-combine behavior in the configuration hash.

### Q: RAG-PAR-005 — What pitfall are we preventing?
**What:** Sharing a damping coefficient while using a different integration formula.<br>
**Context and constraints:** Parity mode must reproduce the authority’s discrete step, not merely a similar continuous curve.<br>
**Why it happened:** Exponential damping was substituted for Rapier’s rational factor.<br>
**Where:** Custom linear and angular velocity update.<br>
**Evidence:** The discrepancy compounds each 1/60-second step and is large for angular damping `16`.<br>
**Developer story:** Free-body traces diverged without contacts. Comparing the two discrete formulas isolated damping before solver constraints.<br>
**How to catch it:** `linear-damping-120` and `angular-damping-120`.<br>
**Solutions tried:** 1. `55/100` refit coefficients; hides timestep dependence. 2. `97/100` use `1 / (1 + dt * damping)`.<br>
**Current solution:** Shared rational `dampingFactor` in parity mode.<br>
**Decision rationale:** Matching the discrete contract is simpler than coefficient fitting.<br>
**Effectiveness:** `97/100`, durable. Both damping lanes have strict traces.<br>
**Relevance check:** Current. It affects every active body every step.<br>
**Next prevention step:** Assert the fixed timestep in snapshots.

### Q: RAG-PAR-006 — What pitfall are we preventing?
**What:** Representing a capsule with scalar rotational inertia.<br>
**Context and constraints:** The portable core may remain narrow, but it must be orientation-aware.<br>
**Why it happened:** A single transverse approximation was used for all axes and poses.<br>
**Where:** Body mass properties in `shared/ragdoll-core/`.<br>
**Evidence:** Axial and transverse capsule inertia differ, and the effective tensor rotates with the body.<br>
**Developer story:** Torque parity remained shape-insensitive until local principal inertia and world rotation were separated.<br>
**How to catch it:** Rotate the same capsule before `torque-impulse` and compare angular response.<br>
**Solutions tried:** 1. `25/100` scalar average; cheap but incorrect. 2. `93/100` local diagonal tensor transformed by orientation.<br>
**Current solution:** Bodies store mass, principal inertia, local inverse inertia, and updated world inverse inertia.<br>
**Decision rationale:** A 3-by-3 tensor is sufficient without creating a general engine.<br>
**Effectiveness:** `93/100`, durable. The representation supports contacts and joints too.<br>
**Relevance check:** Current. All angular effective-mass calculations depend on it.<br>
**Next prevention step:** Validate capsule formulas against authority snapshots.

### Q: RAG-PAR-007 — What pitfall are we preventing?
**What:** Rotating only the child while solving a two-body joint.<br>
**Context and constraints:** Fixed and revolute constraints must transmit angular motion in both directions.<br>
**Why it happened:** Translation used inverse-mass weights while orientation restoration remained parent-driven.<br>
**Where:** Fixed and revolute custom constraints.<br>
**Evidence:** Elbow and knee impacts failed to rotate the parent limb naturally.<br>
**Developer story:** Anchor error could be small while energy propagation remained asymmetric. Inspecting angular updates showed no equal-and-opposite parent response.<br>
**How to catch it:** `fixed-pair-drop` records both bodies’ angular velocities and joint error.<br>
**Solutions tried:** 1. `30/100` more child correction; stiffer asymmetry. 2. `88/100` two-body angular effective mass.<br>
**Current solution:** Parity constraints distribute equal-and-opposite angular corrections using both world inverse inertia tensors.<br>
**Decision rationale:** Constraint stiffness cannot substitute for two-body momentum transfer.<br>
**Effectiveness:** `88/100`, good. Warm-start quality still depends on contact ordering.<br>
**Relevance check:** Current. Every articulated chain path crosses it.<br>
**Next prevention step:** Retain parent/child response ratios in the micro report.

### Q: RAG-PAR-008 — What pitfall are we preventing?
**What:** Measuring hinge twist with a world axis against a local relative quaternion.<br>
**Context and constraints:** Compound rotations must not contaminate limit angle.<br>
**Why it happened:** Relative orientation and signing axis came from different frames.<br>
**Where:** Revolute joint limit solve.<br>
**Evidence:** Off-axis swing could change the reported twist and cause snapping near a limit.<br>
**Developer story:** Limit behavior looked acceptable near rest but failed after swing. Expressing both joint frames locally made the reference-frame mismatch observable.<br>
**How to catch it:** `hinge-lower-limit` and `hinge-upper-limit` include off-axis orientation.<br>
**Solutions tried:** 1. `35/100` sign quaternion vector against world axis. 2. `90/100` local swing-twist decomposition.<br>
**Current solution:** Parity hinge constraints remove swing and clamp local twist.<br>
**Decision rationale:** Limits are defined in joint coordinates.<br>
**Effectiveness:** `90/100`, durable with both limit directions covered.<br>
**Relevance check:** Current. Limbs routinely undergo compound rotation.<br>
**Next prevention step:** Assert `limitState` transitions as well as angle.

### Q: RAG-PAR-009 — What pitfall are we preventing?
**What:** Moving the whole chain before solving a grabbed point.<br>
**Context and constraints:** Parity dragging must use the same physical command as the authority.<br>
**Why it happened:** Global pretranslation was introduced to hide joint lag.<br>
**Where:** Custom drag propagation.<br>
**Evidence:** Sixty percent of each cursor increment was applied to every body before constraint solving.<br>
**Developer story:** Drag poses looked coherent but center-of-mass motion occurred before joint impulses. Replaying cursor targets exposed uncommanded chain translation.<br>
**How to catch it:** `cursor-step` and `cursor-ramp` compare every body from the first target change.<br>
**Solutions tried:** 1. `45/100` assisted global translation; visually useful but nonphysical. 2. `91/100` kinematic cursor plus point constraint in parity mode.<br>
**Current solution:** Assisted behavior remains isolated from deterministic parity commands; parity uses a mass-infinite kinematic cursor and replayable point-to-point effective-mass constraint.<br>
**Decision rationale:** The old controller remains optional without contaminating the oracle path.<br>
**Effectiveness:** `91/100`, durable. Explicit cursor trajectories are replayable.<br>
**Relevance check:** Current. Dragging is a primary user path.<br>
**Next prevention step:** Compare cursor anchor error separately from body-center error.

### Q: RAG-PAR-010 — What pitfall are we preventing?
**What:** Freezing orientation and angular velocity while a grabbed body touches the floor.<br>
**Context and constraints:** Conflicting cursor/floor constraints must be solved physically.<br>
**Why it happened:** A stabilization assist stored and restored a collision-free rotation.<br>
**Where:** Custom floor-constrained drag path.<br>
**Evidence:** Rotation slerp and explicit angular-velocity zeroing had no authority equivalent.<br>
**Developer story:** Floor pushes appeared stable but did not transmit torque. Removing the override revealed the actual constraint weakness that needed solving.<br>
**How to catch it:** `cursor-floor-push` compares rotation and angular velocity.<br>
**Solutions tried:** 1. `40/100` rotation lock; masks motion. 2. `89/100` cursor/contact impulse solve without hidden state.<br>
**Current solution:** Parity mode disables floor rotation locking.<br>
**Decision rationale:** Stability must emerge from constraints, not animation state.<br>
**Effectiveness:** `89/100`, good. Contact manifold approximation remains a sensitivity.<br>
**Relevance check:** Current. Floorward dragging is a direct regression case.<br>
**Next prevention step:** Track contact-normal impulse during the push.

### Q: RAG-PAR-011 — What pitfall are we preventing?
**What:** Sleeping a supported ragdoll after a wall-clock ceiling even when it is moving.<br>
**Context and constraints:** Sleep must not hide an incorrect pose.<br>
**Why it happened:** The custom solver used 1.2 seconds of contact as an unconditional stabilization escape hatch.<br>
**Where:** Whole-ragdoll settle logic.<br>
**Evidence:** The chain could be frozen when velocity thresholds were still exceeded.<br>
**Developer story:** Stable final screenshots contradicted pre-sleep motion traces. The forced ceiling, rather than natural settling, explained the apparent success.<br>
**How to catch it:** Compare first sleep step and pre-sleep velocities in `full-drop`.<br>
**Solutions tried:** 1. `25/100` forced timer; hides errors. 2. `92/100` threshold-qualified sleep only.<br>
**Current solution:** Parity mode never sleeps a non-quiet chain.<br>
**Decision rationale:** A visible freeze is not physical convergence.<br>
**Effectiveness:** `92/100`, durable. Sleep-step mismatch is explicit.<br>
**Relevance check:** Current. Final-pose judgments otherwise remain misleading.<br>
**Next prevention step:** Preserve five frames before every sleep transition.

### Q: RAG-PAR-012 — What pitfall are we preventing?
**What:** Comparing iteration labels rather than executed constraint work.<br>
**Context and constraints:** Deterministic workload and ordering are part of the solver contract.<br>
**Why it happened:** Main, polish, final, and drag-substep passes were all hidden behind one constant.<br>
**Where:** Custom coupled solve and drag preconditioner.<br>
**Evidence:** A nominal 20-pass step actually executed about 27 to 99 passes.<br>
**Developer story:** Increasing the shared constant did not converge behavior. Counting every loop showed workload varied with pointer distance.<br>
**How to catch it:** Snapshot effective pass counts and exercise `cursor-step`.<br>
**Solutions tried:** 1. `18/100` match the visible constant. 2. `91/100` one deterministic parity loop with separately named assisted passes.<br>
**Current solution:** Parity mode executes exactly the configured coupled passes.<br>
**Decision rationale:** Comparable work requires comparable accounting.<br>
**Effectiveness:** `91/100`, durable. Configuration hash catches silent order changes.<br>
**Relevance check:** Current. Solver-order changes can dominate tuning.<br>
**Next prevention step:** Include constraint-order version in configuration.

### Q: RAG-PAR-013 — What pitfall are we preventing?
**What:** Treating missed fast collisions as a contact-stiffness problem.<br>
**Context and constraints:** The bounded solver needs fast capsule/stage protection, not a general collision engine.<br>
**Why it happened:** Custom collision tests sampled only the final step pose.<br>
**Where:** Capsule-stage and capsule-head collision paths.<br>
**Evidence:** Rapier bodies enable CCD while a fast custom capsule can cross the rim or floor between samples.<br>
**Developer story:** Contact tuning could not correct frames where no contact was generated. A swept-path check separated detection failure from response failure.<br>
**How to catch it:** `capsule-rim-tip` and fast toss scenarios assert contact enter time and arena exit.<br>
**Solutions tried:** 1. `20/100` increase stiffness after overlap. 2. `83/100` targeted sweep/substeps for fast bounded shapes.<br>
**Current solution:** Fast capsule/stage rim motion uses a targeted speculative finite-cylinder rim band. This is bounded CCD-style protection, not general CCD.<br>
**Decision rationale:** Narrow swept detection covers this demo without a general engine.<br>
**Effectiveness:** `83/100`, good. Capsule/head sweep remains a watched edge.<br>
**Relevance check:** Watch. Most ordinary drops are discrete-safe, throws are not.<br>
**Next prevention step:** Add a fast head/torso crossing case.

### Q: RAG-PAR-014 — What pitfall are we preventing?
**What:** Treating a stale source assignment as an active engine option.<br>
**Context and constraints:** The authority is pinned to Rapier `0.20.0`; runtime behavior is authoritative.<br>
**Why it happened:** The smoke test required a removed configuration property to remain in source.<br>
**Where:** Rapier world initialization, configuration snapshot, and contract smoke.<br>
**Evidence:** The assignment may create an inert JavaScript property without changing Rapier integration.<br>
**Developer story:** Source review suggested four extra friction iterations, but API history and runtime inspection did not support that conclusion. Feature detection became the turning point.<br>
**How to catch it:** Snapshot effective engine settings and compare authority hashes across ten runs.<br>
**Solutions tried:** 1. `15/100` preserve a literal. 2. `94/100` record documented/effective settings and feature flags.<br>
**Current solution:** Runtime configuration is hashed; stale intent is not a parity requirement.<br>
**Decision rationale:** Executed behavior, not an arbitrary object property, defines the oracle.<br>
**Effectiveness:** `94/100`, durable. Version drift becomes visible.<br>
**Relevance check:** Current. CDN runtime changes and wrapper APIs are recurring risks.<br>
**Next prevention step:** Keep the pinned version in every trace.

### Q: RAG-PAR-015 — What pitfall are we preventing?
**What:** Comparing independently randomized tosses.<br>
**Context and constraints:** The UI may remain playful while tests must replay exact world-space commands.<br>
**Why it happened:** Each page called `Math.random()` internally.<br>
**Where:** Toss UI and shared command protocol.<br>
**Evidence:** Two clicks produced different linear and angular vectors even before physics differences.<br>
**Developer story:** First-step traces could not be attributed to a backend because inputs differed. Logging generated vectors made the nondeterminism explicit.<br>
**How to catch it:** `full-toss-seed-1` dispatches a concrete body, linear impulse, and torque impulse.<br>
**Solutions tried:** 1. `30/100` seed global randomness; fragile across unrelated calls. 2. `98/100` generate then dispatch an explicit command.<br>
**Current solution:** UI randomness is an input generator; the physics API receives serializable commands.<br>
**Decision rationale:** Explicit commands are portable, loggable, and replayable.<br>
**Effectiveness:** `98/100`, durable. The applied command is stored beside traces.<br>
**Relevance check:** Current. Toss and cursor paths both require deterministic input.<br>
**Next prevention step:** Reject commands containing non-finite values.

### Q: RAG-PAR-016 — What pitfall are we preventing?
**What:** Recording too little state to identify the first cause of divergence.<br>
**Context and constraints:** Full-ragdoll chaos makes final-pose-only comparison non-diagnostic.<br>
**Why it happened:** The custom snapshot exposed positions and velocities but omitted rotation, mass, contacts, limits, and effective configuration; the authority exposed nothing.<br>
**Where:** Shared trace schema and both page adapters.<br>
**Evidence:** A final error could not be traced back to a torque, contact, limit, or sleep transition.<br>
**Developer story:** Review could name likely causes but could not identify the first divergent frame. Extending both snapshots created a common evidence surface.<br>
**How to catch it:** Schema validation rejects missing/empty bodies and reports contact, joint, and sleep mismatches.<br>
**Solutions tried:** 1. `35/100` final position snapshot. 2. `96/100` complete per-step trace plus context window.<br>
**Current solution:** Schema version 1 records transforms, velocities, mass properties, joints, contacts, events, configuration, seed, and step.<br>
**Decision rationale:** Diagnostic traces must preserve the state needed to separate cause from secondary effects.<br>
**Effectiveness:** `96/100`, durable. First divergence and surrounding frames are retained.<br>
**Relevance check:** Current. Every parity investigation depends on it.<br>
**Next prevention step:** Version the schema when contact manifold fields change.
