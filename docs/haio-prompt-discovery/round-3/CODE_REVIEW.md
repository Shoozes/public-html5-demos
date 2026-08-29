# Round 3 Source Review: Architecture Transmitted, Integration Diverged

*Code-backed addendum, 2026-08-29*

Round 3 originally judged the outputs from behavior and screenshots. We later recovered the Gemini 3.6 Pro extended-reasoning and GPT-5.6 Pro HTML files, so we can now distinguish visual opinion from implementation evidence.

Grok 4.6 Build is still behavior-only. It generated a Vite repository rather than an HTML-all-in-one artifact, and that repository was not retained for this source review.

## Provenance and static receipt

| Artifact | State reviewed | Lines | Bytes | Static shape |
|---|---|---:|---:|---|
| Gemini 3.6 Pro extended reasoning | Manually repaired after generation | 1,331 | 37,112 | 1 class, 33 named functions, 13 Maps, 2 Sets |
| GPT-5.6 Pro | Original supplied HAIO | 2,254 | 101,354 | 24 classes, 12 named functions, 25 Maps, 6 Sets |

Both supplied snapshots pass `node --check` after extracting the module script. This does **not** retroactively make Gemini's generation valid. The operator reports repairing invalid seed literals before the artifact could run. We therefore treat it as a repaired specimen, not a pristine model output.

Checksums:

```text
gemini-3.6-proext-repaired.html
SHA-256 035bb5d7cf98771288612ffc78eba426cb50da95ba3ac9a1153182a4d7168bb7

gpt-5.6-pro-chat.html
SHA-256 213b22c794a908e974dd3b1ca7f3b397a8c17db2319b0efb7892807d1ec32f0c
```

## Gemini: it copied the architecture vocabulary, not the integration discipline

Gemini did not ignore the prompt. It implemented many of the requested nouns:

- pinned Three.js WebGPU/TSL imports and guarded dynamic loading;
- numeric entity IDs and component Maps;
- pending-destroy state and cleanup;
- custom joystick input with a dead zone;
- a seeded PRNG;
- swept projectile-versus-circle collision;
- projectile and effect limits;
- a first-frame watchdog and diagnostics object.

The failure was that these pieces were often present as adjacent declarations rather than one coherent game.

### Why the result looked flat

The main entity palette uses `MeshBasicNodeMaterial` for the player, hostile, neutral, and wreck materials. Those materials are unlit. The ambient and directional lights exist, but they cannot give those objects useful volume. The camera is also directly overhead at `(0, 50, 0)`, looking straight down. The model builders then reduce the player to a cone plus one box, hostiles to one box, and the station to two cylinders.

The screenshot was therefore not an unexplained art failure. The code deliberately combined:

```text
unlit primary materials
+ exact top-down camera
+ extremely small primitive assemblies
= flat colored tokens
```

The prompt said TSL and 3D, but it did not force the model to preserve lighting as the default material language. “Use TSL” was interpreted as “make node materials,” and the easiest node material was the unlit one.

### Separate aim existed on paper but not on screen

The world has a separate `aims` component, and the player model creates a `turret` Group. However, that Group is empty and the render-sync system never applies the aim value to it. The root hull heading is synchronized, but the requested independent weapon aim is not.

This is a useful category of failure:

> A named component is not proof that the behavior is connected end to end.

### Shader state leaked into CPU simulation

The AI drift code reads `time.value`, where `time` is a TSL shader node imported for material graphs. Shader nodes are not the simulation clock. Mixing that object into CPU trigonometry can produce invalid movement state rather than a reliable elapsed-time value.

The prompt strongly emphasized TSL, and the implementation let that rendering concept escape its boundary.

### Shared material mutation remained unsafe

The selection marker reuses the player's shared material, then sets that material to wireframe. Because the player hull uses the same object, selection feedback can mutate unrelated live renderables.

The prompt contained a long resource-ownership section, but the code still violated the core rule. This suggests the instruction should be shorter and executable:

> Shared materials are immutable after registration. Per-entity state uses uniforms, node parameters, or a dedicated marker material.

### Restart is not a clean transaction

`startSector()` marks every old entity for destruction and runs the ordinary cleanup system. Ordinary hostile death creates a wreck, so restarting can manufacture wrecks from the old hostile population while deleting the old world. The function also creates another starfield every restart without retaining and removing the previous one.

The restart path technically reuses lifecycle machinery, but it reuses the wrong semantic path. Teardown and combat death are not the same event.

### Pool slots are inferred from array length

Projectile and effect meshes are selected from their pools by using the current active-array length as the pool index. When active items expire out of order, array length does not identify a free slot. A new projectile can therefore reuse a mesh still owned by another live projectile.

A pool needs explicit free-slot ownership, not an array-length shortcut.

### The watchdog measured a call, not a presented frame

The first-frame flag is set immediately after `renderer.render(scene, camera)` is invoked. There is no awaited render result or backend confirmation. The watchdog can therefore report success because code reached a line, even if presentation later fails asynchronously.

### Diagnostics were mostly decorative

The diagnostics object declares live IDs, selected ID, target ID, pending destruction, projectile count, effect count, and other fields. Most are never populated, and the promised invariant function is absent. The prompt induced the shape of diagnostics without ensuring evidence behind each field.

### What Gemini genuinely got right

The normal combat-death path is substantially better than Round 1 Gemini. Pending destruction clears target state, removes the scene object, deletes component entries, and spawns a separate wreck ID. Swept collision and seeded layout are also real improvements.

The model learned the previous lesson. It then failed in rendering, restart semantics, shared-resource safety, and final integration.

## GPT-5.6 Pro: the architecture was connected

GPT's source explains why its result was visibly stronger. The large file is not merely verbose. Most of its major contracts are wired through:

- guarded imports, `WebGPURenderer`, `await renderer.init()`, a first update, a first render, runtime backend hooks, and a watchdog;
- an authoritative `World` with numeric IDs, component stores, queues, and immediate collider removal on destruction request;
- a `SectorFactory` that creates named entities from data;
- a `ResourceBank` with shared geometries, lit node materials, circular sprite materials, and explicit disposal;
- a render adapter with a live selectable registry and separate selection/target markers;
- separate movement, hull heading, weapon aim, combat, projectile, collision, damage, death, cleanup, effects, camera, HUD, and event-log paths;
- owner IDs, swept collision, staged damage, atomic cleanup, separate wreck creation, and removal of projectiles owned by a destroyed ship;
- listener bookkeeping, one animation loop, fixed-step simulation, clean world rebuild, diagnostics, and invariant checks.

The player and hostile builders also create actual silhouettes and separate weapon pivots. This is why the result reads as a small 3D sector rather than a diagram of the prompt.

### The camera error came directly from conflicting metrics

The camera configuration uses a base vertical view height of 34 and a minimum horizontal span of 36. On portrait screens it computes:

```text
view height = max(34, 36 / aspect)
```

At 9:16 portrait, that becomes approximately 64 world units vertically. The player model is only a little over two world units long, so it occupies roughly three to four percent of the viewport.

The prompt simultaneously demanded a large minimum horizontal view and a small player silhouette. GPT satisfied both literally and produced the satellite view. This is primarily a prompt-calibration failure.

Use one governing screen-space contract instead:

```text
portrait vertical span: approximately 28–32 world units
player height: approximately 8–12% of viewport
```

Do not add a competing large horizontal minimum.

### Manual fire consumed the mobile control budget

The source has a large `FIRE` button, pointer-capture logic dedicated to it, a `fireHeld` state, and a player command that sets the weapon trigger only while the button or Space is held. This is coherent implementation of a weak interaction design.

The next prompt should remove the feature rather than ask models to place the button more elegantly.

### Salvage is technically correct and ergonomically wrong

A wreck has a three-unit interaction range. The player must:

1. tap a small mesh at the zoomed-out scale;
2. keep the selection;
3. approach within the exact interaction range;
4. press the contextual action.

The code handles the transaction correctly, but the interaction does not fit the single-stick mobile loop. Ordinary rewards should burst out, magnetize, and auto-collect. Large wrecks and story objects can keep contextual actions.

### Selection and combat lock are still coupled

Selecting a hostile immediately locks it. Selecting a non-hostile clears the combat lock. Clearing selection also clears the target. The prompt called these concepts distinct, but repeated selection/target language still encouraged them to move together.

The next contract should be behavioral:

- inspection selection may change freely;
- combat lock persists independently;
- only an aggressive hostile is auto-lock eligible;
- tapping the active lock disengages it;
- inspecting a station does not silently cancel an ongoing defensive lock.

### Auto-targeting was not requested clearly enough

The source has a good `TargetSystem`, but it only validates or accepts explicit locks. Hostile aggression is calculated transiently inside AI and is not exposed as a stable threat component or query. There is no nearest-aggressive-target acquisition pass.

This is not a defect relative to the Round 3 prompt. It is the next design change.

### The HUD creates unnecessary dead zones

The player panel, selection panel, and event feed accept pointer events even though most of their contents are informational. On mobile, those panels can block world selection. The event feed is also a large opaque rectangle across the lower playfield.

Only actual buttons should consume pointer input. Informational HUD regions should default to `pointer-events: none`.

### Some repetition became architecture ceremony

GPT uses 24 classes and 25 Maps. Much of it is sensible, but the prompt effectively asked the model to transcribe a textbook architecture:

- named component inventory;
- named system inventory;
- exact system ownership;
- exact update order;
- detailed lifecycle sequence;
- resource categories;
- diagnostics schema;
- thirty acceptance checks.

That yielded a maintainable result, but also a 101 KB file and substantial duplicated ceremony for a tiny sector.

Specific redundancies:

- selection state exists both in per-entity selection records and `SelectionSystem.selectedId`;
- `TargetSystem` receives an event-log object it does not use;
- destruction reasons are retained without affecting cleanup behavior;
- one-class-per-system could be ordered functions without losing ownership;
- many diagnostics fields restate state already available through one checker.

The goal is not to remove the architecture. It is to retain the invariants while allowing a smaller implementation.

## Instruction transmission matrix

| Instruction | Gemini | GPT-5.6 Pro | Finding |
|---|---|---|---|
| One real HAIO | Repaired artifact | Passed | Format remains a separate score from runtime quality. |
| Modern Three.js WebGPU + TSL | Present, misapplied in places | Correctly integrated | API presence is not API boundary discipline. |
| Authoritative IDs/components | Present | Present and coherent | This instruction crossed strongly. |
| Atomic death and cleanup | Mostly passed in combat | Passed | One concise lifecycle invariant is worth keeping. |
| Clean restart | Failed semantically | Passed | Restart needs a teardown contract distinct from death. |
| Independent weapon aim | Declared, not rendered | Passed | Require a visible strafe-and-fire acceptance check. |
| Resource ownership | Violated by shared mutation/pool aliasing | Mostly passed | Replace prose taxonomy with two enforceable rules. |
| First-frame diagnostics | Superficial | Strong | Diagnostics need evidence, not a requested object shape. |
| Tactical camera | Too flat and distant | Too distant but oblique | The numeric camera constraints conflicted. |
| 3D visual quality | Failed | Passed | Require lit default materials and an oblique view. |
| Mobile interaction | Manual fire and precision salvage | Polished but still manual/precise | The design itself needs simplification. |

## What to curtail in the next prompt

| Current prompt pattern | What it produced | Replacement |
|---|---|---|
| Enumerate every component | Maps that sometimes existed only to satisfy the list | Require authoritative numeric IDs, no scene-owned truth, and only components needed by the implementation. |
| Require a named class for every system | Large ceremonial architecture | Permit ordered functions or classes; require one state owner per channel. |
| Repeat death rules across architecture, lifecycle, and acceptance sections | More text without preventing restart-specific bugs | One atomic-destruction invariant plus one executable destroy-selected-target check. |
| “Use TSL” across a long effects list | Gemini defaulted to unlit basic node materials | Require lit node materials for world objects; TSL only for specific custom effects. |
| Simultaneous vertical, horizontal, and player-size camera constraints | Portrait overzoom | One portrait view-height range and one player screen-size target. |
| Large diagnostics schema | Fields populated cosmetically or not at all | `firstFrame`, `counts`, `lastError`, and one `checkInvariants()` result. |
| Thirty acceptance criteria | Checklist optimization and output inflation | Ten observable smoke tests ordered by failure impact. |
| Manual fire plus targeting plus context action | Three competing interaction modes | One-stick movement, threat-gated sticky auto-fire, small disengage control, contextual action only for large objects. |
| Precision wreck selection and collection | Correct but awkward salvage | Visible pickup burst, magnetic attraction, automatic collection. |
| Broad “creative freedom” after many fixed details | Models spent creativity on local decoration | Fix behavior and composition; leave names, silhouettes, palette, and VFX open. |

## What to keep

The next prompt should retain these non-negotiable contracts:

1. One complete HTML artifact and no project scaffold.
2. Pinned dynamic imports, WebGPURenderer, guarded initialization, and a visible failure stage.
3. Numeric world identity and no authoritative object references.
4. Queued spawning, damage, and destruction.
5. One owner each for movement, hull heading, and weapon aim.
6. Scene objects as render adapters, not the game database.
7. Shared render resources immutable after registration.
8. Swept projectile collision and owner/faction filtering.
9. Clean restart distinct from combat death.
10. A small executable smoke-test contract.

## Revised design kernel

The next iteration can be materially shorter:

```text
Build one hostile sector as a complete HAIO using Three.js WebGPURenderer and TSL.
Use an authoritative ID-based world with queued damage/spawn/destroy and atomic cleanup.
Keep movement heading and weapon aim independent.
Use a slightly oblique tactical camera with a 28–32 unit portrait vertical span and keep the player near 8–12% of viewport height.
The joystick is the primary control. Automatically acquire the nearest aggressive hostile, retain the lock with hysteresis, and auto-fire in range. Provide only a small disengage control.
Destroyed enemies emit readable magnetic credit pickups that burst, attract, and auto-collect.
World objects use lit node materials. TSL custom work is limited to engine glow, markers, projectiles, stars, and soft sprite particles.
Restart must rebuild the world without combat-death side effects, duplicate listeners, duplicate loops, or retained renderables.
```

The source review strengthens the Round 3 conclusion: GPT-5.6 Pro did not win merely by writing more code. It connected the requested contracts. Gemini copied many of the same architectural words, but several remained disconnected, incorrectly bounded, or semantically reused.
