# Public HTML5 Demos

A public GitHub Pages collection for browser-ready HTML-all-in-one demos, experiments, visual explainers, and prototypes.

- Gallery: https://shoozes.github.io/public-html5-demos/
- Anthrocybernetics demo: https://shoozes.github.io/public-html5-demos/anthrocybernetics/

## Repository contract

Each published demo uses one stable folder and one canonical entry file:

```text
demo-slug/
└── index.html
```

HAIO is the default. Keep HTML, CSS, and JavaScript in `index.html` when practical. A demo may use pinned HTTPS CDN dependencies. Add local assets only when embedding them would make the file impractical.

## Publishing a demo

1. Create a lowercase kebab-case folder such as `my-demo/`.
2. Place the complete playable file at `my-demo/index.html`.
3. Use relative paths for any local assets.
4. Add the demo to the root `index.html` gallery.
5. Commit to `main`.

GitHub Pages publishes directly from the repository root on `main`. No proxy, package installation, build command, or deployment workflow is required.

The resulting URL is:

```text
https://shoozes.github.io/public-html5-demos/my-demo/
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

- [Round 4: Pass-Down Workflow Experiment](round-4/REPORT.md) compares isolated Luna, Terra, and Sol hostile-space HAIO submissions. It now records the controlled-tool gap: screenshots were captured, but image generation, GenEye, semantic visual review, and a candid repair contract were not prescribed. The verified operator reference remains playable at `round-4/submission/index.html`.
- [Round 5: Visual Oracle and Critic Loop](round-5/PLAN.md) freezes an approved brighter image-generated reference pair, project-local visual-critic skill, common visual-interpreter lane, Playwright harness, tool ledger, blind self-critique, external critique, and bounded before/after repair loop.
- [Hostile Space reference lineage](round-5/HOSTILE_SPACE_REFERENCE.md) records the historical behavioral inspiration, supplied screenshot observations, modernization choices, and non-cloning boundary.
- [Starblast 3D presentation reference](round-5/STARBLAST_REFERENCE.md) records the low-poly depth, silhouette, lighting, motion-cue, and tactical-overlay inspiration without making it a cloning target.
- [Round 5 brighter mockup brief](round-5/MOCKUP_V2_BRIEF.md) preserves dark space while raising interactive-object readability, silhouette separation, and mobile composition.
- [Round 6: Goal Mode Pair Test](round-6/PLAN.md) reuses the successful Round 5 instrument and compares ordinary High-reasoning runs against `/goal` without changing the game, references, skills, harness, or rubric.

## Project knowledge

- [Current application state and verification](docs/APP_STATE.md)
- [Active gated work with completion conditions](docs/TODO.md)
- [Completed milestone index](docs/HISTORY.md)
- [Focused context routes](summary_bank.json)

## Current demos

### Soldier Ragdoll Lab

A mobile- and desktop-friendly Three.js physics playground using the local Soldier GLB asset. Grab and throw the character, orbit the scene, or reset the ragdoll. Its rigid neck/head link, framed limb hinges, selective head collision, and higher solver budget keep the figure proportionate during limb holds. It includes optional music and sound effects, enabled from a tap-to-start splash screen. Share the authoritative GitHub Pages version at [Soldier Ragdoll Lab](https://shoozes.github.io/public-html5-demos/ragdoll-lab/) or the additional [ChatGPT Site](https://ragdoll-physics-demo.shoozes.chatgpt.site). Agents must follow the scoped [ragdoll deployment workflow](ragdoll-lab/DEPLOYMENT.md) when changing or deploying it.

### Soldier Ragdoll Math Lab

A separate Three.js-rendered, custom-physics implementation of the Soldier ragdoll. Its portable JavaScript/TypeScript core owns mass and inertia, impulses, damping, and point effective-mass kernels; Three.js remains the rendering and adapter layer, with no Rapier runtime dependency. Start with [Clone Behavior, Not Constants](docs/parity/CLONE_BEHAVIOR_NOT_CONSTANTS.md) for the reusable oracle-driven cloning tutorial, then see [the portable solver math and current limits](ragdoll-math-lab/MATH.md) and [the parity pitfalls ledger](docs/parity/PITFALLS.md). Open [Soldier Ragdoll Math Lab](https://shoozes.github.io/public-html5-demos/ragdoll-math-lab/). The pinned Playwright dependency is development-only and used by the local parity harness.

### Anthrocybernetics Guided Demo

A mobile-first interactive presentation explaining feedback loops, the five observation lenses, evidence labels, and what actually moves when a cloud agent is ported to a local model.

Open it at `anthrocybernetics/index.html` or through the public gallery.

## Research notes

- [Prompt Archaeology: HAIO Space Shooter, Round 1](docs/haio-prompt-discovery/README.md) compares three model-generated implementations, connects visible failures to source-level causes, and records the next ECS-lite, WebGPU, TSL, and hostile-space hypothesis.
- [Prompt Archaeology, Round 2: The Prompt Became the Harness](docs/haio-prompt-discovery/round-2/README.md) records three failed one-shot builds and separates incomplete output, fatal API integration, and broken visual calibration from the instructions each model actually followed.
- [Prompt Archaeology, Round 3: Reasoning, Harnesses, and Format Drift](docs/haio-prompt-discovery/round-3/README.md) compares extended reasoning, build-agent, and pro-reasoning modes, then records the auto-target, oblique-camera, and magnetic-salvage design corrections.


## Legal (Discord app)

Public policy pages for The-Agent Discord application profile:

- Privacy Policy: https://shoozes.github.io/public-html5-demos/legal/privacy/
- Terms of Service: https://shoozes.github.io/public-html5-demos/legal/tos/

Markdown sources: [`docs/the-agent-privacy.md`](docs/the-agent-privacy.md), [`docs/the-agent-tos.md`](docs/the-agent-tos.md).
