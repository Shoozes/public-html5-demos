# Public HTML5 Demos

A public GitHub Pages collection for browser-ready HTML-all-in-one demos, experiments, visual explainers, and prototypes.

- Gallery: https://shoozes.github.io/public-html5-demos/
- Visual experiment flight log: https://shoozes.github.io/public-html5-demos/rounds/
- 3D projects: https://shoozes.github.io/public-html5-demos/projects/3d-stuff/
- Retired projects: https://shoozes.github.io/public-html5-demos/the-gravyard/

## Repository contract

Maintained demos live under `projects/<category>/`; experiment protocols and evidence live under `rounds/`; retired work lives in `the-gravyard/`. Each demo has one canonical entry file:

```text
projects/3d-stuff/demo-slug/index.html
rounds/round-5-5/PLAN.md
the-gravyard/anthrocybernetics/index.html
```

HAIO is the default. Keep HTML, CSS, and JavaScript in `index.html` when practical. A demo may use pinned HTTPS CDN dependencies. Add local assets only when embedding them would make the file impractical.

See [repository layout and compatibility routes](docs/REPOSITORY_LAYOUT.md). The small legacy root folders preserve published URLs; `ragdoll-lab/index.html` is a generated export for the existing Sites sync. Edit only the canonical project and refresh exports with `node tools/sync-legacy-routes.mjs`.

The [3D stuff category](projects/3d-stuff/README.md) groups scenes, physics and rendering work. Three.js, WebGL and WebGPU are implementation labels; they do not require overlapping folder trees. Add new categories when real projects need them.

## Publishing a demo

1. Choose an existing category, or add one when justified, and create a lowercase kebab-case folder such as `projects/3d-stuff/my-demo/`.
2. Place the complete playable file at `projects/3d-stuff/my-demo/index.html`.
3. Use relative paths for any local assets.
4. Add the demo to its category index and the root `index.html` gallery.
5. Run `node tests/site-contract.mjs` and relevant project checks, then commit to `main`.

GitHub Pages publishes directly from the repository root on `main`. No proxy, package installation, build command, or deployment workflow is required.

The resulting URL is:

```text
https://shoozes.github.io/public-html5-demos/projects/3d-stuff/my-demo/
```

## Demo requirements

- Runs from HTTPS without a development server.
- Contains no API keys, tokens, private endpoints, or user secrets.
- Pins CDN package versions rather than using floating `latest` URLs.
- Works on current desktop and mobile browsers.
- Handles portrait and landscape layouts where relevant.
- Provides a readable fallback when WebGL, WebGPU, or a CDN dependency fails.
- Avoids absolute repository-root paths so project-page URLs keep working.
- Uses a clear title, description, and primary action.

## Workflow experiments

The image-led [HAIO Flight Log](https://shoozes.github.io/public-html5-demos/rounds/) is the public entry point for the experiment series. It keeps the main story short, exposes Round 5 desktop/portrait comparisons in tabs, and links back to the authoritative repository documents below.

- [Round 4: Pass-Down Workflow Experiment](rounds/round-4/REPORT.md) compares isolated Luna, Terra, and Sol hostile-space HAIO submissions. It now records the controlled-tool gap: screenshots were captured, but image generation, GenEye, semantic visual review, and a candid repair contract were not prescribed. The verified operator reference remains playable at `rounds/round-4/submission/index.html`.
- [Round 5: Visual Oracle and Critic Loop](rounds/round-5/REPORT.md) completed the controlled Luna/Terra/Sol comparison with an approved brighter image-generated reference pair, project-local visual-critic skill, common visual-interpreter lane, Playwright holdout, tool ledger, blind self-critique, external critique, and bounded before/after repairs. Sol passed the complete operator contract; Luna missed the visual threshold; Terra remained playable but was hard-gated by diagnostic-contract drift.
- [Hostile Space reference lineage](rounds/round-5/HOSTILE_SPACE_REFERENCE.md) records the historical behavioral inspiration, supplied screenshot observations, modernization choices, and non-cloning boundary.
- [Starblast 3D presentation reference](rounds/round-5/STARBLAST_REFERENCE.md) records the low-poly depth, silhouette, lighting, motion-cue, and tactical-overlay inspiration without making it a cloning target.
- [Round 5 brighter mockup brief](rounds/round-5/MOCKUP_V2_BRIEF.md) preserves dark space while raising interactive-object readability, silhouette separation, and mobile composition.
- [Round 5.5: GPT-6 model refresh](rounds/round-5-5/PLAN.md) is next: clean GPT-6 Luna and Sol Work arms, with Astra reserved for a standalone Codex thread. No runs have started; the required browser preflight is blocked. Frozen inputs, no prior-solution access and unchanged scoring are mandatory. The [Astra handoff](rounds/round-5-5/ASTRA_HANDOFF.md) is operator-only.
- [Round 6: Goal Mode Pair Test](rounds/round-6/PLAN.md) follows Round 5.5. It first freezes the missing temporal/systemic checks, then compares ordinary High-reasoning runs against `/goal` using the same package within each pair.

## Project knowledge

- [Current application state and verification](docs/APP_STATE.md)
- [Repository layout and archival integrity](docs/REPOSITORY_LAYOUT.md)
- [Active gated work with completion conditions](docs/TODO.md)
- [Completed milestone index](docs/HISTORY.md)
- [Focused context routes](summary_bank.json)

## Active 3D demos

### Soldier Ragdoll Lab

A mobile- and desktop-friendly Three.js physics playground using the local Soldier GLB asset. Grab and throw the character, orbit the scene, or reset the ragdoll. Its rigid neck/head link, framed limb hinges, selective head collision, and higher solver budget keep the figure proportionate during limb holds. It includes optional music and sound effects, enabled from a tap-to-start splash screen. Share the authoritative GitHub Pages version at [Soldier Ragdoll Lab](https://shoozes.github.io/public-html5-demos/projects/3d-stuff/ragdoll-lab/) or the additional [ChatGPT Site](https://ragdoll-physics-demo.shoozes.chatgpt.site). Agents must follow the scoped [ragdoll deployment workflow](projects/3d-stuff/ragdoll-lab/DEPLOYMENT.md) when changing or deploying it.

### Soldier Ragdoll Math Lab

A separate Three.js-rendered, custom-physics implementation of the Soldier ragdoll. Its portable JavaScript/TypeScript core owns mass and inertia, impulses, damping, and point effective-mass kernels; Three.js remains the rendering and adapter layer, with no Rapier runtime dependency. Start with [Clone Behavior, Not Constants](docs/parity/CLONE_BEHAVIOR_NOT_CONSTANTS.md) for the reusable oracle-driven cloning tutorial, then see [the portable solver math and current limits](projects/3d-stuff/ragdoll-math-lab/MATH.md) and [the parity pitfalls ledger](docs/parity/PITFALLS.md). Open [Soldier Ragdoll Math Lab](https://shoozes.github.io/public-html5-demos/projects/3d-stuff/ragdoll-math-lab/). The pinned Playwright dependency is development-only and used by the local parity harness.

## Retired projects

[Anthrocybernetics](the-gravyard/anthrocybernetics/index.html) is preserved in [The Gravyard](the-gravyard/README.md). It was removed from the active gallery on 2026-09-25; the original implementation and legacy entry URLs remain available.

## Research notes

- [Prompt Archaeology: HAIO Space Shooter, Round 1](rounds/round-1/README.md) compares three model-generated implementations, connects visible failures to source-level causes, and records the next ECS-lite, WebGPU, TSL, and hostile-space hypothesis.
- [Prompt Archaeology, Round 2: The Prompt Became the Harness](rounds/round-2/README.md) records three failed one-shot builds and separates incomplete output, fatal API integration, and broken visual calibration from the instructions each model actually followed.
- [Prompt Archaeology, Round 3: Reasoning, Harnesses, and Format Drift](rounds/round-3/README.md) compares extended reasoning, build-agent, and pro-reasoning modes, then records the auto-target, oblique-camera, and magnetic-salvage design corrections.


## Legal (Discord app)

Public policy pages for The-Agent Discord application profile:

- Privacy Policy: https://shoozes.github.io/public-html5-demos/legal/privacy/
- Terms of Service: https://shoozes.github.io/public-html5-demos/legal/tos/

Markdown sources: [`docs/the-agent-privacy.md`](docs/the-agent-privacy.md), [`docs/the-agent-tos.md`](docs/the-agent-tos.md).
