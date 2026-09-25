# Prompt Archaeology: HAIO Space Shooter, Round 1

*Discovery log, 2026-08-28*

We dug up an early-2025 HTML-all-in-one game prompt, removed most of its tutorial-style hand-holding, and gave the same behavioral brief to three current models. Each received one generation pass. We tested the results on mobile, compared the visuals, and then inspected the source.

This is not a leaderboard. The point is to learn which instructions crossed the model boundary, which were interpreted differently, and which requirements we incorrectly assumed would appear without being requested.

## What the prompt successfully transmitted

All three outputs understood the visible product shape:

- one browser-ready HTML file;
- a mobile HUD and virtual joystick;
- procedural player and UFO models;
- movement on an XZ plane;
- target selection, health, projectiles, hit feedback, and restart states;
- grouped Three.js scene objects and class-based game entities.

The core concept crossed cleanly. The failures happened in architecture, lifecycle, composition, and dependency handling rather than in understanding that we wanted a playable space shooter.

## The first run

### GPT-5.6-chat-instant: interface without a game frame

<img src="images/gpt-5-6-chat-instant.webp" alt="GPT-5.6-chat-instant output showing the HUD over a black game area" width="420">

The DOM and HUD loaded, but the 3D game did not render. The likely startup failure is an invented ESM path for `nipplejs@0.10.0`. Because it was a static module import, the module graph could fail before the game's own error handler ran.

**What worked:** responsive shell, readable HUD, health display, target display, fullscreen and audio controls.

**What failed:** first playable frame, dependency verification, and catchable startup diagnostics.

**Prompt lesson:** asking for an error overlay is not enough. The bootstrap itself must be able to catch dependency failures. Future HAIO prompts should require verified CDN paths, dynamic `import()` inside a guarded bootstrap, and a first-frame acceptance check that confirms the player and world are visible.

### Grok-4.6-fast: best game feel, strongest lifecycle, conflicted aiming

<img src="images/grok-4-6-fast.webp" alt="Grok-4.6-fast output with a green ship, selected UFO, combat particles, compact HUD, and joystick" width="420">

This was the strongest playable interpretation. It produced the clearest ship silhouette, a compact HUD, usable targeting, live combat, entity IDs, alive flags, and an end-of-tick compaction pass that removed dead entities and cleared dead targets.

Its biggest behavioral problem came from transform ownership. Movement rotated the ship toward its travel direction, then firing rotated that same root toward the target. While moving and firing, the hull alternated between two authorities and visibly snapped.

The gold squares around combat were not all stars. The impact effect used untextured `THREE.PointsMaterial`, so the particles rendered as square point sprites. The shader background also exposed a regular cell pattern.

**What worked:** best visual identity, functional targeting and combat, entity IDs, bounded delta time, logical root versus visual child, cleanup and target clearing.

**What partially failed:** hull aiming, particle shape, camera scale, and resource ownership. Geometry ownership tags were inconsistent, and cloned materials left original materials undisposed.

**Prompt lesson:** do not let movement, hull heading, target selection, and weapon aim own the same transform. Require one owner per state channel. Also require explicit shared, unique, and transient render-resource ownership.

### Gemini-3.6-flash: good targeting presentation, broken death transaction

<img src="images/gemini-3-6-flash.webp" alt="Gemini-3.6-flash output with the player ship, a large UFO, star points, HUD, and joystick" width="420">

Gemini produced the best-looking star treatment of the three and a clear targeting marker. The failure appeared after an enemy was defeated: the enemy remained visible, the selection marker remained attached, and the lock state became inconsistent.

The code explained the result. Damage marked the enemy dead but did not remove it from the scene. The player later set its target reference directly to `null`, bypassing the centralized target setter that would have hidden the marker. Dead enemies also remained in the enemy array until restart.

Three states therefore diverged:

```text
dead logically != removed from simulation != removed visually
```

**What worked:** targeting presentation, recursive raycast ownership, input separation, projectile sweep checks, and a readable HUD.

**What failed:** atomic entity death, target cleanup, scene removal, collection cleanup, and GPU-resource disposal.

**Prompt lesson:** death must be one transaction, not a suggestion passed among unrelated methods. Once destruction begins, an entity must immediately stop being targetable, collidable, updateable, visible, and HUD-addressable. Cleanup must then release every owned resource and remove every retained reference.

## Coverage matrix

| Requirement or assumption | GPT-5.6 chat instant | Grok-4.6 fast | Gemini-3.6 flash | What we learned |
|---|---|---|---|---|
| Single-file mobile HAIO | Yes | Yes | Yes | The visible product contract was clear. |
| First rendered game frame | Failed | Passed | Passed | A first-frame proof must be explicit. |
| Targeting | Not testable | Worked, but hull snapped | Worked until target death | Target state and aim transforms need separate ownership. |
| Dead entity removal | Not testable | Mostly correct | Broken | Lifecycle invariants matter more than class names. |
| Resource disposal | Not proven | Partial | Incomplete | Scene removal is not GPU cleanup. |
| Camera composition | Not testable | Too close | Too close | Specify screen-space composition, not only camera coordinates. |
| ECS or authoritative world registry | No | No, but ECS-adjacent | No | We never asked for it. Our assumption was the missing instruction. |
| WebGPU and TSL | No | No | No | The prompt still asked for legacy WebGL-era Three.js. |

## The assumption we missed: responsible world ownership

We did not instruct any model to build an ECS, an authoritative entity registry, ordered systems, or deferred destruction. None built a real ECS.

That is not a model failure. The prompt explicitly encouraged class inheritance and scene-owned entities, so the models followed it. We assumed that a game would naturally acquire responsible instance handling because most nontrivial games need it. What games actually need is authoritative identity and lifecycle management. A full ECS framework is optional.

The next architecture should be ECS-shaped without becoming framework theater:

- numeric entity IDs rather than object references;
- component maps for transform, health, faction, target, weapon, AI, collider, renderable, and lifetime;
- ordered systems with one owner for each state channel;
- spawn and destroy queues;
- an end-of-tick cleanup transaction;
- Three.js scene objects as render adapters, not the game database.

A target becomes `targetId`, not a retained enemy object. A dead entity becomes unavailable to queries immediately. Cleanup then clears references, removes collision and AI state, releases render or instance slots, disposes uniquely owned resources, and finally removes the entity ID.

## Where to curtail and where to be explicit

The old prompt over-specified primitive geometry, class names, tutorial steps, and implementation snippets. Modern models did not need that much steering.

It under-specified the contracts that determine whether a game remains coherent:

- the first visible frame;
- camera screen-space composition;
- authoritative entity identity;
- atomic death and cleanup;
- target reference validity;
- transform ownership;
- render-resource ownership;
- dependency verification;
- system update order;
- renderer and shader architecture.

The next prompt should say less about how to build a green cone and more about who owns a ship's state after that cone is destroyed.

## Next hypothesis

The next round will move toward a small hostile-space MMORPG/MUD slice rather than another empty arena:

- an orthographic tactical camera with a larger visible world radius;
- a small player silhouette and more navigational context;
- named ships, wrecks, a station, factions, scanning, lock-on combat, salvage, and an event log;
- ECS-lite simulation state;
- separate locomotion, hull heading, weapon aim, and target systems;
- `WebGPURenderer`, preferring WebGPU with WebGL2 fallback;
- TSL for all custom shader logic, including star fields, selection effects, hit flash, engine glow, and circular sprite particles;
- a pinned, verified current Three.js release rather than a stale hard-coded version.

Round 1 showed that current models can invent the game. Our job is to define the invariants that keep the invention alive.

## Running ledger

- **Round 0:** recovered the early-2025 tutorial prompt.
- **Round 1A:** converted it into a modern behavioral contract with more creative freedom.
- **Round 1B:** generated one HAIO from each of three models and tested on mobile.
- **Round 1C:** inspected the code to connect visual defects to architectural causes.
- **Next:** revise the prompt around ECS-lite ownership, TSL/WebGPU, tactical composition, and the hostile-space world direction.
