# Clone Behavior, Not Constants

## An oracle-driven tutorial for reimplementing a physics system

Reimplementing a physics demo is easy to underestimate. The first version often
looks like a coefficient-matching exercise: copy gravity, damping, friction,
joint limits, and solver iterations, then tune until the two simulations look
similar.

That approach fails whenever the two implementations assign different meaning
to the same numbers. A friction coefficient is not a per-frame velocity
multiplier. An impulse is not a velocity increment. A hinge limit measured in a
mixed coordinate frame is not the same constraint. Twenty passes through a
position projector are not twenty iterations of a staged impulse solver.

The practical lesson from cloning the Rapier-backed Soldier Ragdoll Lab into a
custom math implementation is simple:

> Clone the observable contract and the executed semantics, not the source
> literals.

This article presents the strategy as a reusable tutorial. “Clone” here means
an independent implementation driven by a black-box behavioral oracle. It does
not require copying the authority's internal source or reproducing every hidden
engine detail.

## 1. Define the target before tuning

“One-to-one” can describe several different goals. Separate them so a green
test has an unambiguous meaning.

| Level | What must match | Best use |
| --- | --- | --- |
| Contract parity | Bodies, dimensions, masses, joints, limits, controls, stage, and fixed step | Construction checks |
| Trajectory parity | Per-step transforms and velocities within tight tolerances | Isolated bodies, contacts, and joints |
| Behavioral parity | Contact timing, center-of-mass path, joint stretch, settling, exit timing, and pose class | Full chaotic ragdolls |
| Visual integrity | Intact skinning, plausible poses, no tearing or explosions | Rendering and final review |
| Interaction feel | Responsive grab, coherent pulling, stable holds, believable release | Assisted product behavior |

Do not demand per-body trajectory identity from a complete articulated contact
simulation unless both implementations truly execute the same solver. Tiny
contact differences compound rapidly. Conversely, do not accept a broad
behavioral tolerance for a one-body impulse test; that would hide a foundational
units error.

For this project the target became:

- strict trajectory parity for free-body, impulse, damping, one-contact, and
  two-body joint scenarios;
- bounded behavioral parity for the complete ragdoll;
- a separately tested assisted mode for the interaction quality a user feels;
- visual review only after numeric tests pass.

## 2. Turn the original into an executable oracle

A clone cannot converge against screenshots or remembered feel alone. Give the
authority and clone the same non-DOM protocol:

```text
scenario + explicit commands
            |
            v
   +-------------------+
   | fixed-step driver |
   +-------------------+
      |             |
      v             v
 authority       clone
      |             |
      +------v------+
             |
       frame traces
             |
      first-divergence
         comparison
```

Both Soldier pages expose the same `window.__ragdollParity` interface in parity
mode:

```js
await backend.ready;
backend.reset(scenario);
backend.command(command);
backend.step(1);
const frame = backend.snapshot();
```

Parity mode disables automatic advancement and lets the harness own time. Each
step is the same fixed 1/60 second on both sides. Stable body insertion order,
scenario construction, command order, and step count are part of the contract.

The snapshot is deliberately richer than the rendered pose. It records:

- body position, rotation, linear velocity, and angular velocity;
- mass and local principal inertia;
- per-body sleeping state;
- joint anchor error, hinge twist, and limit state;
- contacts, normals, penetration, and available impulse information;
- backend version, effective configuration, scenario, seed, step, and time.

Record effective configuration, not intended configuration. A JavaScript
property assignment can survive after an engine option has been removed and do
nothing at runtime. Feature detection and the resulting configuration hash are
better evidence than a matching source string.

## 3. Make every input replayable

Randomness is useful in a demo and harmful in a comparison. Keep random UI
behavior as an input generator, then dispatch the generated value as an explicit
command:

```json
{
  "type": "apply-impulse",
  "body": "upperChest",
  "linear": [0.41, 1.2, -0.18],
  "angular": [0.32, -0.11, 0.47]
}
```

The same applies to dragging. Record a starting body and local point, followed
by one world-space cursor target per fixed step. Do not replay raw mouse events:
camera state, viewport size, and event timing would become uncontrolled inputs.

Store the expanded commands beside the trace. A later failure must be
reproducible without clicking the UI or reconstructing a gesture by hand.

## 4. Build a dependency-ordered scenario ladder

Do not start with the complete ragdoll. Full-body chaos makes a foundational
error look like a contact, joint, or coefficient problem hundreds of
corrections later.

The Soldier ladder contains 20 scenarios in this order:

| Layer | Scenarios | What they isolate |
| --- | --- | --- |
| Integration | `free-fall-120`, linear and angular damping | Time integration and damping semantics |
| Impulses | center impulse, torque impulse | Mass, inertia, and units |
| Contacts | floor drop, floor slide, rim tip | Normal response, friction, sleep, and bounded CCD |
| Joints | fixed pair, free hinge, lower and upper limits | Two-body effective mass and reference frames |
| Pair collision | head/torso overlap | Contact distribution between dynamic bodies |
| Cursor | step, ramp, floor push | Kinematic point constraint and contact competition |
| Full system | drop, seeded toss, hand drag, arena exit | Bounded behavioral parity |

Move up the ladder only after the lower layer passes. If `torque-impulse` fails,
do not tune elbow stiffness. If `capsule-rim-tip` never creates a contact, do not
increase response stiffness; the missing behavior is collision detection.

## 5. Stop at the first divergent frame

A final-pose comparison is useful for a gallery and poor for diagnosis. The
first incorrect frame is much closer to the cause.

For strict traces, compare every step and report:

- position RMS and maximum;
- quaternion geodesic error;
- linear- and angular-velocity RMS;
- maximum joint-anchor error delta;
- hinge limit-state mismatches;
- contact enter and exit timing;
- sleep transition timing;
- five frames before and after the first divergence.

Quaternion error should ignore the equivalent `q` and `-q` representations:

```text
angleError = 2 * acos(clamp(abs(dot(qAuthority, qClone)), 0, 1))
```

Full scenarios use observables that remain meaningful after trajectories
separate: center-of-mass motion, absolute joint error, support timing, durable
settle step, arena exit, and geometric pose class.

The comparison report is not merely a pass/fail artifact. It should answer the
next debugging question: which body, metric, event, and frame changed first?

## 6. Correct semantics in dependency order

Once the trace identifies the first broken layer, replace the incorrect
semantics rather than compensating for them later.

### Impulse and inertia

A linear impulse produces:

```text
deltaVelocity = inverseMass * impulse
```

A torque impulse produces:

```text
deltaAngularVelocity = worldInverseInertia * torqueImpulse
```

A capsule needs distinct axial and transverse inertia. Store local principal
inertia and rotate its inverse into world space:

```text
worldInverseInertia = R * localInverseInertia * transpose(R)
```

Directly adding an impulse-looking vector to velocity may look plausible, but
it guarantees immediate divergence between light limbs and heavy torso bodies.

### Damping

Matching the coefficient is insufficient when the integration formula differs.
The Rapier-compatible factor used by the custom core is:

```text
factor = 1 / (1 + dt * damping)
```

An exponential factor is also a valid design, but it solves a different
discrete-time problem.

### Joints

Solve anchor and angular constraints against both bodies. The correction must
be distributed through their inverse masses and world inverse inertias. A
child-only quaternion correction makes the chain behave like parent-driven
animation and prevents impacts from propagating naturally.

For hinges, measure twist entirely in the local joint frame. Mixing a
world-space hinge axis with a local relative quaternion aliases swing into
twist and creates limit snaps after compound rotation.

### Contacts, friction, and swept motion

Friction is a tangential contact impulse bounded by the normal response; it is
not `horizontalVelocity *= friction` every frame. The latter turns a reasonable
coefficient into extreme frame-rate-dependent damping.

Detection and response are separate problems. The authority enables CCD. The
custom demo implements only a targeted speculative finite-cylinder rim band,
because that is the narrow swept case the product needs. The scope is explicit:
bounded protection is not advertised as a general CCD engine.

### Sleeping

Never use sleep to hide an unsettled pose. Require measured whole-body quiet,
adequate support, a continuous quiet interval, and bounded joint error. Capture
the frames around sleep so a terminal correction cannot masquerade as
convergence.

## 7. Keep parity and assisted behavior separate

The most important architectural decision was to stop forcing one path to serve
two goals.

Parity mode answers:

> Does the independent implementation reproduce the authority's physical
> contract within the declared tolerances?

Assisted mode answers:

> Does grabbing, pulling, throwing, colliding, and settling feel good to a
> person using this demo?

The assisted path may legitimately add a filtered 3D cursor target, a compliant
point attachment, stronger interactive projection, selective self-collision,
held-body damping, and supported-island rest hysteresis. Those policies must not
leak into deterministic parity traces.

This boundary also prevents parity fixes from degrading product feel. The
custom contact angular response, for example, is assisted-only; the parity
branch retains its established response so the oracle comparison remains
stable.

## 8. Test time, not just endpoints

The hardest visible defect in the Math Lab was not the final pose. A terminal
rest projection moved parts of the ragdoll by roughly 10 to 13.5 centimeters in
one frame. A screenshot after sleep looked stable, but the transition looked
like the solver suddenly “figured out” the body.

The interactive browser test now samples every fixed frame and records:

- first broad-support step;
- first qualified low-hips, eight-contact support step;
- sleep step;
- largest body displacement on the sleep transition;
- maximum joint error immediately before sleep;
- six-second drift;
- drag-release and post-sleep nudge recovery.

The Math Lab is rejected if its sleep transition moves any body more than two
centimeters. The fix was not a larger final polish. It was continuous coupled
work: one additional interactive pass, bounded contact-derived angular
response, gradual mass-balanced anchor closure, a two-centimeter cohesion gate,
and support evidence that survives a small wake-up without affecting ordinary
drops.

Temporal tests are equally valuable for cursor input. Filter the raycast-derived
3D target at the fixed-step boundary, then measure both selected-point travel
and connected-body response. This catches a fast foot attached to a sluggish,
stretching body as well as a responsive-looking cursor that injects unstable
velocity.

## 9. Use visual comparison last

Numeric parity does not prove correct skinning, and a good screenshot does not
prove correct physics. Use both in the right order:

1. Pass contract and strict micro scenarios.
2. Pass bounded full-system traces.
3. Capture synchronized authority and clone frames at configured steps.
4. Verify that both captures are usable and unobscured.
5. Inspect mesh integrity, articulation, floor contact, camera, and UI.
6. Run manual interaction for feel.

GenEye or another read-only visual tool can accelerate the final comparison,
but its evidence must remain distinct from Playwright screenshots or human
inspection. Never relabel substitute captures as tool evidence when that tool
was unavailable.

## 10. Preserve failures as knowledge

Every substantial mismatch should leave three durable artifacts:

```text
docs/parity/PITFALLS.md
tests/parity/pitfalls.jsonl
output/parity/<run-id>/
```

The human ledger explains the developer story: context, evidence, attempted
solutions, decision, and prevention. The JSONL record supports search and
automation. The run directory retains exact inputs, traces, hashes, reports,
and first-divergence context.

This prevents a familiar failure cycle: a later maintainer sees an odd constant,
“simplifies” it, and unknowingly restores a bug whose rationale existed only in
someone's memory.

## 11. A repeatable working loop

Use this loop for any black-box behavior clone:

1. **Name the authority.** Pin its runtime and record effective settings.
2. **Define parity levels.** Decide which cases are strict and which are
   behavioral.
3. **Create one protocol.** Reset, command, fixed step, and snapshot both sides.
4. **Make inputs explicit.** Remove uncontrolled randomness and UI timing.
5. **Build the smallest scenario ladder.** Order it by dependency.
6. **Prove authority determinism.** Repeated authority traces must hash equally.
7. **Find the first divergence.** Do not reason backward from the final pose.
8. **Fix the lowest broken semantic layer.** Units and frames before tuning.
9. **Add a regression at that layer.** Preserve the discovery.
10. **Run the neighboring and full gates.** Prevent local fixes from leaking.
11. **Add temporal and visual proof.** Verify transitions, rendering, and feel.
12. **Document the decision.** Record scope and known non-goals.

Common anti-patterns are the inverse of this loop:

- copying constants without formulas;
- calling source-string checks behavioral parity;
- tuning the complete ragdoll before isolated bodies pass;
- comparing independent random gestures;
- counting labeled iterations instead of executed constraint work;
- adding whole-island stabilization to hide a local solver defect;
- forcing sleep on a moving chain;
- judging only the final screenshot;
- letting interaction assists contaminate the parity path.

## 12. Running this repository's proof lanes

From the repository root, run the cheap structural and numerical checks first:

```text
node tests/ragdoll-contract-smoke.mjs
node tests/ragdoll-parity-server.mjs
node tests/ragdoll-trace-parity.mjs --unit
node tests/ragdoll-core-contract.mjs
node tests/ragdoll-core-typescript-contract.mjs
node tests/ragdoll-interactive-browser.mjs
```

List or select trace scenarios:

```text
node tools/ragdoll-parity/run.mjs --list
node tools/ragdoll-parity/run.mjs --scenario torque-impulse
node tools/ragdoll-parity/run.mjs --scenario full-toss-seed-1
```

Run the complete gate and repeat authority traces for determinism:

```text
node tools/ragdoll-parity/run.mjs
node tools/ragdoll-parity/run.mjs --determinism-runs=10
```

Add `--screenshots` for configured visual steps. On Windows,
`PARITY_BROWSER` can select a specific installed Chromium browser if the default
executable is unstable.

## 13. Repository map

| Path | Responsibility |
| --- | --- |
| `ragdoll-lab/index.html` | Rapier authority and parity adapter |
| `ragdoll-math-lab/index.html` | Independent custom solver and assisted adapter |
| `shared/ragdoll-core/` | Portable mass, inertia, impulse, damping, and effective-mass kernels |
| `shared/ragdoll-parity/` | Shared command and trace protocol |
| `tests/parity/scenarios/index.json` | Scenario definitions and tolerances |
| `tools/ragdoll-parity/run.mjs` | Browser orchestration, trace capture, and reports |
| `tools/ragdoll-parity/compare.mjs` | Strict and behavioral comparison |
| `tests/ragdoll-interactive-browser.mjs` | Temporal assisted-mode oracle test |
| `docs/parity/PITFALLS.md` | Human decision and failure ledger |

## 14. Further reading

The authority semantics used in this project are documented in Rapier's
official JavaScript guides:

- [Forces and impulses](https://rapier.rs/docs/user_guides/javascript/rigid_body_forces_and_impulses/)
- [Collider friction](https://rapier.rs/docs/user_guides/javascript/collider_friction/)
- [Continuous collision detection](https://rapier.rs/docs/user_guides/javascript/rigid_body_ccd/)
- [Determinism](https://rapier.rs/docs/user_guides/javascript/determinism/)
- [Joints](https://rapier.rs/docs/user_guides/javascript/joints/)

Within this repository, pair this tutorial with the
[solver notes](../../ragdoll-math-lab/MATH.md) and the
[parity pitfalls ledger](PITFALLS.md).

## Conclusion

The custom ragdoll did not become closer to Rapier because it found a perfect
set of coefficients. It became closer when the project changed the question
from “which number looks wrong?” to “which executable semantic first diverges?”

That shift produced a reusable strategy:

- make the original observable;
- replay identical inputs;
- compare at the first wrong frame;
- fix foundations in dependency order;
- reserve broad tolerances for genuinely chaotic systems;
- isolate product assists from parity evidence;
- verify transitions and visuals after numeric behavior.

That is how a clone stops being an imitation of constants and becomes an
independent implementation of a tested behavioral contract.
