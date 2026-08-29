# Prompt Archaeology, Round 2: The Prompt Became the Harness

*Discovery log, 2026-08-28*

Round 1 exposed missing contracts around entity lifecycle, targeting, camera composition, dependencies, and renderer ownership. We folded those lessons into a much more ambitious prompt: ECS-lite world state, numeric entity IDs, staged cleanup, `WebGPURenderer`, TSL materials, guarded imports, an orthographic tactical camera, diagnostics, named contacts, salvage, and a MUD-like event feed.

We then gave that prompt to the same three fast chat models in a one-shot setting with no browser, console, screenshot loop, or repair pass.

**Result: zero of three produced an acceptable build.**

The interesting part is that most individual instructions were understood. The integrations failed.

## GPT-5.6-chat-instant: architecture without completion

The response began well. It created a guarded bootstrap, diagnostics, an ECS-shaped `World`, component maps, queues, deterministic random state, and custom input handling.

Then the file stopped at line 330 in the middle of a joystick condition:

```js
if(e.pointerId===this.joyPointer
```

There are no closing braces, no completed module, and no closing HTML. The browser cannot parse it, so none of the carefully requested startup diagnostics can run.

**Failure class:** incomplete artifact.

**Lesson:** output length and completion are architectural constraints. Asking for a full game, renderer migration, ECS, diagnostics, resource policy, MUD layer, mobile controls, and thirty acceptance checks in one file can exceed what a fast one-shot response completes reliably. “Return the complete file” is not a completion mechanism.

## Gemini-3.6-flash: a complete file killed by one API seam

Gemini completed the file and correctly built a visible staged error overlay. That overlay was the only successful output because world creation used constructors such as:

```js
new TSL.MeshStandardNodeMaterial()
new TSL.MeshBasicNodeMaterial()
```

The node material classes belong to the Three.js namespace; the TSL module supplies shader nodes such as `color()` and `float()`. A single namespace mistake stopped the entire 1,200-line build before the first frame.

The error overlay therefore proves one instruction worked: the failure was visible and attributed to a bootstrap stage. It did not make the game valid.

The code also duplicated authority. Selection and target state existed in both the ECS-shaped world and a separate `inputState`, while several world events still wrote directly to the DOM. It reproduced the nouns of ECS without fully preserving one source of truth.

**Failure class:** fatal integration error behind broad checklist compliance.

**Lesson:** modern API seams need a verified bootstrap, a known-good scaffold, or an execution harness. Prose cannot validate an import namespace. One wrong constructor can invalidate hundreds of otherwise reasonable lines.

## Grok-4.6-fast: the only renderer, but literal compliance damaged play

Grok was the only model to reach a playable frame. It also implemented the strongest overall architecture: IDs, component maps, deferred destruction, a render adapter, TSL materials, separate aim state, named entities, salvage, diagnostics, and cleanup.

It still failed the game test in three obvious ways.

### The camera overcorrected

The prompt tried to prevent Round 1’s giant close-ups by demanding a minimum tactical span and a player no larger than roughly seven percent of the screen. Grok set a fixed 32-unit horizontal span. On a portrait phone, preserving that width expands the vertical span to roughly 57 units. The ship becomes a speck.

This was not random. The model optimized the literal metric and lost the intended feel.

### The ship was backwards

The procedural model places its nose toward local negative Z and its engines toward local positive Z. The heading math and render rotation use a different forward-axis assumption. Movement and visual orientation are internally coherent in separate places, but not coherent with each other.

This is the same family of bug as Round 1, expressed through a cleaner architecture. ECS does not repair a coordinate convention.

### The sector begins already aggroed

The player starts at `(0, 10)`. Two hostiles start about 24.1 and 22.4 units away, both inside the 28-unit aggro radius. Their initial weapon cooldowns are under 0.4 seconds. They begin closing immediately and fire almost as soon as they cross the 20-unit weapon range.

We requested a hostile world but never requested a safe opening state, activation gate, grace period, or minimum spawn separation from aggro range.

**Failure class:** valid implementation with broken calibration and spatial semantics.

**Lesson:** numeric acceptance criteria can overfit the previous defect. Camera composition needs a target range, not only a maximum ship size. Coordinate systems need one canonical local-forward convention. Spawn design needs an explicit safe-start contract.

## The common pattern: local compliance, global failure

The models did not simply ignore the prompt.

- GPT mapped the requested architecture, then failed to finish the artifact.
- Gemini finished the artifact, then failed one critical runtime integration.
- Grok integrated the stack, then failed visual calibration, facing, and encounter pacing.

This is the core Round 2 finding:

> A model can satisfy many instructions locally while still failing the product globally.

The revised prompt accidentally became a written substitute for a work harness. It described imports, diagnostics, lifecycle rules, camera bounds, invariants, and tests, but no model could actually load the page, inspect the console, view the frame, move the ship, or repair the result.

A prompt can request a watchdog. It cannot watch its own output.

## Did reasoning make game generation worse?

This round does not prove that current models are universally worse than older models. The task changed substantially. The early prompt used familiar WebGL-era Three.js patterns and a small arcade loop. Round 2 demanded a newer renderer stack, TSL, ECS-like ownership, diagnostics, deterministic state, interactions, and a larger world in one generation.

What this round does show is narrower and useful:

- fast chat variants are not reliable for large, modern, one-shot game artifacts without execution feedback;
- adding more instructions can increase integration surface faster than it increases correctness;
- reasoning about code is not equivalent to running code;
- architectural sophistication does not guarantee basic playability;
- visual feel, axis orientation, and encounter pacing remain difficult to prove from text alone.

Older models may also have benefited from producing smaller, more conventional code. A fair historical comparison would require the same prompt, same constraints, and same test protocol.

## Next controlled experiment

The next round keeps this exact prompt and changes only one variable: **highest reasoning instead of the fast chat setting**.

We will record:

- whether the HTML completes;
- parser and bootstrap errors;
- the reported error stage;
- first-frame success;
- output length;
- camera world span and player screen size;
- all four cardinal facing directions;
- time until the first hostile shot;
- target, death, wreck, salvage, and restart behavior;
- diagnostics and invariant results.

After that, a separate harness round should let a model run the same artifact, read the console, inspect a screenshot, and repair it. That will separate reasoning budget from execution feedback instead of mixing them together.

## Running conclusion

Round 1 taught us to specify ownership and lifecycle. Round 2 taught us that the specification itself cannot replace validation.

The durable path is likely:

- keep product behavior and invariants in the prompt;
- move stable renderer, ECS, input, and diagnostics contracts into a tested scaffold or skill;
- use a harness for syntax, startup, screenshots, controls, lifecycle, and pacing;
- reserve model freedom for world design, visuals, effects, and game feel.
