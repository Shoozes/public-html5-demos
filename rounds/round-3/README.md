# Prompt Archaeology, Round 3: Reasoning, Harnesses, and Format Drift

*Discovery log, 2026-08-29*

Round 2 used fast chat models and produced three unacceptable one-shot builds. For Round 3 we kept the same hostile-space prompt but moved to stronger reasoning or build-oriented modes.

This round did better overall, but it also exposed a new variable: **the model is only part of the system**. Reasoning budget, output budget, execution harness, product mode, and hidden project templates can change the result as much as the model family.

The Gemini and GPT source snapshots were later supplied for a separate [source-level review](CODE_REVIEW.md). Gemini required manual syntax repairs before it could be viewed, so the reviewed file is treated as a repaired specimen rather than a pristine generation. Grok Build remains behavior-only because it created a multi-file Vite repository and that source bundle was not retained.

<img src="images/round-3-comparison.webp" alt="Round 3 comparison: Gemini 3.6 Pro extended reasoning, Grok 4.6 Build, and GPT-5.6 Pro mobile results" width="760">

The source files are not published in this repository. The review records their provenance, static receipts, and checksums so later copies can be matched.

## Gemini 3.6 Pro extended reasoning: more thought, disconnected implementation

Gemini returned an HTML artifact, but the first usable version required manual syntax repair. The rendered result reduced the world to flat, incorrectly rotated shapes. It technically resembled the requested entities, yet lost the 3D composition, visual language, and polish expected from the prompt.

The source confirms that Gemini understood much of the architecture. It created numeric IDs, component Maps, queued destruction, seeded generation, swept projectile collision, custom joystick input, TSL materials, pooling, and diagnostics.

The integrations failed:

- primary world objects used unlit basic node materials, making the scene lights largely irrelevant;
- the camera was exactly top-down;
- the player was a cone and one engine box, while hostiles were single boxes;
- an aim component and turret Group existed, but the turret was empty and aim was never synchronized to it;
- shader-node time leaked into CPU AI logic;
- a selection marker mutated a material shared with the player hull;
- restart reused combat-death cleanup, creating replacement wrecks from the old hostile population and adding another untracked starfield;
- projectile/effect pool slots were inferred from active-array length rather than explicit free-slot ownership;
- the first-frame flag proved only that `render()` was called;
- most declared diagnostic fields were never populated.

**What crossed:** the vocabulary and broad shape of ECS-lite ownership, lifecycle cleanup, modern imports, mobile input, and combat.

**What did not:** reliable syntax in the original response, lit 3D presentation, API boundaries, restart semantics, resource immutability, and end-to-end wiring of the requested systems.

**Lesson:** extended reasoning can produce an architectural inventory without producing a connected implementation. Naming a component or system is not evidence that a visible behavior is wired through it.

## Grok 4.6 Build: the harness helped, but the format contract lost

Grok Build did not return an HTML-all-in-one artifact. It created a repository with Vite setup, project files, and `AGENTS.md`. That is a direct failure of the HAIO output contract.

The playable result was nevertheless much healthier than the fast one-shot attempts. The harness could create files, run a development workflow, and repair integration problems. The sector, event feed, targeting, combat, and salvage behavior were mostly present.

The remaining problems were visual and experiential:

- the camera-following background made movement feel like standing still;
- the lighting and materials were too dark;
- the scene remained too zoomed out;
- the interface occupied more space than the core movement loop needed.

**Lesson:** a work harness can rescue implementation quality while simultaneously overriding the requested artifact shape. Build mode optimized for “make a project,” not “return one portable file.” Format compliance and runtime quality are separate axes.

## GPT-5.6 Pro: expensive, large, and genuinely integrated

GPT-5.6 Pro took roughly an hour and returned a 2,254-line, 101 KB single HTML file. It was the strongest result in this round and the closest to the intended sector.

The source shows why. It implemented the contracts as connected paths rather than isolated labels:

- guarded WebGPU/TSL bootstrap with backend error hooks, awaited initialization, first update/render, watchdog, and fixed-step timing;
- an authoritative ID-based World with queues and immediate collider removal on destruction request;
- data-driven named entity creation;
- a shared ResourceBank with lit node materials, soft sprite materials, and disposal;
- a render adapter with live selectable registration;
- separate hull and weapon pivots;
- ordered movement, heading, weapon aim, combat, projectile, collision, damage, death, cleanup, effects, camera, HUD, and event-log behavior;
- atomic target clearing and separate wreck creation;
- clean restart through world reconstruction rather than a second animation loop;
- useful diagnostics and invariant checks.

The remaining complaints came mostly from our design brief:

- the camera formula combined a large minimum horizontal span with a base vertical span; on portrait screens this expands to roughly 64 visible world units and shrinks the player to only a few percent of the viewport;
- the large manual `FIRE` button and its dedicated input state consumed prime mobile space;
- salvage required tapping a small mesh, approaching within three units, and pressing a contextual action;
- selection and combat lock were still coupled, so inspecting a non-hostile cleared the active lock;
- the large informational HUD panels consumed pointer events and blocked world selection;
- repeated selection could produce duplicate event-feed messages.

**Lesson:** deeper reasoning and enough output budget improved one-shot integration substantially, but the prompt also induced a 24-class architecture and repeated state. The next revision should keep the invariants and remove the ceremony.

## The experiment now has five variables

Comparing model names alone is no longer enough. Each run should record:

1. **Model** — the underlying model family.
2. **Reasoning budget** — fast chat, extended reasoning, or maximum/pro reasoning.
3. **Output budget** — whether the response can physically finish the artifact.
4. **Harness access** — whether the model can run, inspect, and repair the result.
5. **Product scaffold** — chat, canvas, build workspace, React template, repository agent, or another hidden environment.

Round 3 suggests:

| Mode | Runtime quality | Format compliance | Typical failure |
|---|---:|---:|---|
| Extended reasoning without a harness | Low in this run | Partial | Architectural inventory without reliable integration |
| Build agent with a harness | Moderate | Failed | Working project that ignores the requested portable format |
| Pro reasoning with large output budget | Best | Passed | Slow, large, and still dependent on prompt design |

The current strongest conclusion is not “reasoning models are better” or “chat models are worse.” It is:

> Reliable artifact generation depends on the whole execution mode. Reasoning can improve integration, a harness validates reality, and a harness can also pull the result away from the requested format.

## What the prompt should stop repeating

The source review shows where the prompt became its own architecture framework.

Curtail:

- exhaustive component inventories;
- one named class for every system;
- the same destruction rule repeated in architecture, lifecycle, resource, restart, diagnostics, and acceptance sections;
- broad “TSL everywhere” language;
- competing camera metrics;
- a large diagnostics schema;
- thirty acceptance criteria;
- separate manual targeting, firing, and pickup controls.

Keep:

- one real HTML artifact;
- pinned guarded WebGPU/TSL imports;
- authoritative numeric identity;
- queued spawn, damage, and destruction;
- one owner each for movement, hull heading, and weapon aim;
- render objects as adapters rather than game state;
- immutable shared resources;
- swept collision;
- clean restart distinct from combat death;
- a short executable smoke-test contract.

The detailed mapping and replacement rules are in [CODE_REVIEW.md](CODE_REVIEW.md).

## Design correction: make movement the primary control

The `FIRE` button should disappear. It consumes prime mobile space and adds a manual step to a combat loop that should feel continuous.

The next combat contract should be:

- only ships that have already become aggressive are eligible for automatic targeting;
- when no combat target exists, acquire the nearest eligible hostile inside an acquisition radius;
- keep the target until it dies, exits a larger break radius, becomes non-hostile, or the player explicitly disengages;
- use hysteresis: the break radius must be larger than the acquisition radius;
- fire automatically whenever the target is valid, in range, and the weapon cooldown is ready;
- tapping the active target toggles disengagement;
- provide one small `DISENGAGE` or lock-cancel control in the target HUD, not a large bottom-right attack button;
- after manual disengagement, suppress immediate reacquisition of that same target for a short cooldown or until it leaves the acquisition radius.

Inspection selection should remain independent. Selecting a station or wreck must not silently cancel a defensive combat lock.

## Camera correction: between arena close-up and tactical satellite view

The previous prompt overcorrected the original close camera.

The next view should use a fixed, slightly oblique tactical camera:

- portrait vertical span around 28–32 world units;
- player screen height around 8–12%;
- player near the visual center;
- fixed camera yaw;
- enough visible space for several nearby contacts;
- no target-induced zoom;
- world-anchored near-field debris and landmarks;
- slower far-field parallax rather than a background rigidly attached to the camera.

Use those two governing scale targets instead of combining a large minimum horizontal span with another vertical constraint.

## Salvage correction: burst, magnet, collect

Small pickups should not require pixel-perfect selection or direct overlap.

When something breaks:

1. spawn several visible pickup objects with a short outward impulse;
2. let them drift for a brief readable moment;
3. inside a magnetic radius, accelerate them toward the ship;
4. auto-collect them inside a small collection radius;
5. show a trail, scale pulse, and compact credit confirmation;
6. remove them through the normal entity cleanup transaction.

Ordinary credits and materials should use this loop. Large wrecks, stations, and story objects may retain contextual interaction.

## Next prompt shape

The next prompt should remain strict but become shorter and hierarchical:

1. artifact and renderer contract;
2. world identity and lifecycle invariants;
3. joystick-first combat and magnetic pickup loop;
4. camera and visual calibration;
5. ten observable smoke tests.

Round 3 produced one genuinely promising one-shot HAIO. The source now shows why: GPT connected the contracts, while Gemini often reproduced their names without completing the wires between them.
