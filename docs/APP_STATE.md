# Application State

Updated: 2026-09-01

This is the canonical concise description of what the repository currently runs and how that state is proved. Forward research work belongs in `TODO.md`; detailed experiment evidence remains in its owning round folder.

## Published surface

The root GitHub Pages gallery publishes three stable HTML-all-in-one demos:

| Demo | Canonical entry | Current behavior |
| --- | --- | --- |
| Soldier Ragdoll Lab | `ragdoll-lab/index.html` | Rapier-backed Soldier rig with grab, throw, orbit, reset, audio, mobile input, finite-stage collision, and parity diagnostics. |
| Soldier Ragdoll Math Lab | `ragdoll-math-lab/index.html` | Three.js-rendered custom rigid-body/joint solver sharing portable mass, impulse, inertia, damping, and effective-mass kernels. |
| Anthrocybernetics Guided Demo | `anthrocybernetics/index.html` | Six-step responsive presentation with local analysis, Five-Foci visualization, evidence labels, JSON export/import, persistence, 3D visualization, and timed 2D fallback. |

The gallery and demos use relative paths and pinned CDN dependencies. Soldier media and the GLB rig are local assets. No build step is required for publication.

## Shared implementation seams

- `shared/ragdoll-core/` is the portable JavaScript/TypeScript math authority used by the custom solver and contract tests.
- `shared/ragdoll-parity/protocol.mjs` defines the shared command protocol for both ragdoll implementations.
- `tools/ragdoll-parity/` owns the safe static server, scenario runner, and trace comparison.
- `tools/browser-runtime.mjs` owns Playwright discovery and browser selection; `tools/browser-harness.mjs` owns paired browser/static-server acquisition and cleanup.
- `summary_bank.json` routes focused code, documentation, tests, and experiment context; `tools/context-bank.mjs` validates paths and budgets.

## Workflow experiments

- Prompt-discovery Rounds 1–3 are historical research under `docs/haio-prompt-discovery/`.
- Round 4 is complete as the uncontrolled-tools/no-fixed-oracle baseline. Its canonical operator artifact passes static and twelve-group browser verification.
- Round 5A now has approved desktop/portrait V2 oracles, a common native-image-view lane, a Hostile Space behavioral lineage, a Starblast 3D presentation lineage, explicit non-cloning boundaries, a scene/component outline, visual-critic skill, pass-down, rubric, fixed thresholds/budgets, and package verification. Its first Luna/Terra/Sol dispatch stopped cleanly before implementation because raw text hashes differed in fresh Windows worktrees. The corrected package content commit is `591530a153eac58d4dfdfed05162cd65a7b9cc78`; text hashes are LF-canonical while binary references remain byte-exact, and the isolated rerun is in progress.
- Round 6 has a durable `GOAL.md` and paired protocol, but execution is gated on a completed, successful Round 5 instrument.

## Current verification contract

Run the inexpensive repository checks first:

```powershell
node tests/site-contract.mjs
node tests/browser-harness.mjs
node tools/context-bank.mjs --list
node round-4/harness/verify-haio.mjs
node round-5/harness/verify-package.mjs
node tests/ragdoll-contract-smoke.mjs
node tests/ragdoll-lab-smoke.mjs
node tests/ragdoll-math-lab-smoke.mjs
node tests/ragdoll-core-contract.mjs
node tests/ragdoll-core-typescript-contract.mjs
node tests/ragdoll-trace-parity.mjs --unit
node tests/ragdoll-parity-server.mjs
```

Browser checks require Playwright through `CODEX_NODE_MODULES` or `NODE_PATH`; `HAIO_BROWSER` or `PARITY_BROWSER` may select the executable:

```powershell
node tests/site-browser.mjs
node tests/ragdoll-interactive-browser.mjs
node round-4/harness/run-scenarios.mjs
node round-5/harness/capture-reference-review.mjs
node tools/ragdoll-parity/run.mjs --determinism-runs=10
```

The hosted workflow is not local proof. Local command results are the verification authority.

## Known limitations

- The Round 5 images are generator-native sizes close to, but not identical with, their comparison viewports. The reference-review harness normalizes them; source dimensions and checksums remain frozen.
- Anthrocybernetics analysis is an educational heuristic, not a scientific inference engine. Its 2D fallback is intentional when Three.js fails or misses the startup deadline.
- The custom ragdoll solver targets observable parity for the registered scenarios, not a general replacement for Rapier.
- Round 5 model arms run in independent tasks from one committed frozen baseline. Round 6 remains gated on an accepted Round 5 result.

## Knowledge ownership

- Current state and verification: this file.
- Active or gated work: `docs/TODO.md`.
- Completed milestones: `docs/HISTORY.md`.
- Repeated ragdoll hazards: `docs/parity/PITFALLS.md`.
- Focused context routes: `summary_bank.json`.
- Experiment protocols and evidence: their `round-*` or `docs/haio-prompt-discovery/` owners.
