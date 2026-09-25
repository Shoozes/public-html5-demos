# Application State

Updated: 2026-09-25

This is the canonical concise description of what the repository currently runs and how that state is proved. Forward research work belongs in `TODO.md`; detailed experiment evidence remains in its owning round folder.

## Published surface

The root GitHub Pages gallery publishes four stable browser surfaces:

| Demo | Canonical entry | Current behavior |
| --- | --- | --- |
| HAIO Flight Log | `rounds/index.html` | Image-led experiment archive with Overview, Round 4, Round 5, Round 5.5, Round 6, and Docs tabs; desktop/portrait operator comparisons; playable frozen submissions; and GitHub-rendered deep evidence. |
| Soldier Ragdoll Lab | `projects/ragdoll-lab/index.html` | Rapier-backed Soldier rig with grab, throw, orbit, reset, audio, mobile input, finite-stage collision, and parity diagnostics. |
| Soldier Ragdoll Math Lab | `projects/ragdoll-math-lab/index.html` | Three.js-rendered custom rigid-body/joint solver sharing portable mass, impulse, inertia, damping, and effective-mass kernels. |
| Anthrocybernetics Guided Demo | `projects/anthrocybernetics/index.html` | Six-step responsive presentation with local analysis, Five-Foci visualization, evidence labels, JSON export/import, persistence, 3D visualization, and timed 2D fallback. |

The gallery, flight log, and demos use relative paths and pinned CDN dependencies. Soldier media, the GLB rig, experiment references, and operator screenshots are local assets. No build step is required for publication. Legacy playable routes remain generated compatibility entries; the Ragdoll Lab export also preserves the separate Site sync source path. See `REPOSITORY_LAYOUT.md`.

## Shared implementation seams

- `shared/ragdoll-core/` is the portable JavaScript/TypeScript math authority used by the custom solver and contract tests.
- `shared/ragdoll-parity/protocol.mjs` defines the shared command protocol for both ragdoll implementations.
- `tools/ragdoll-parity/` owns the safe static server, explicit browser MIME map including WebP, scenario runner, and trace comparison.
- `tools/browser-runtime.mjs` owns Playwright discovery and browser selection; `tools/browser-harness.mjs` owns paired browser/static-server acquisition and cleanup.
- `summary_bank.json` routes focused code, documentation, tests, and experiment context; `tools/context-bank.mjs` validates paths and budgets.

## Workflow experiments

- Prompt-discovery Rounds 1–3 are historical research under `rounds/round-1/`.
- Round 4 is complete as the uncontrolled-tools/no-fixed-oracle baseline. Its canonical operator artifact passes static and twelve-group browser verification.
- Round 5A is complete. The corrected package content commit is `591530a153eac58d4dfdfed05162cd65a7b9cc78`; all reruns used dispatch commit `1aa2761d8d091c687f91d83bcd02a1efd8b67a59`. The independent operator holdout passed Luna and Sol across 13 functional evidence groups, hard-gated Terra for renaming the frozen pickup diagnostic, and reproduced Terra's remaining gameplay through a labeled compatibility probe. Blind full-size/thumbnail/grayscale review scored Luna 22/30, Terra 19/30, and Sol 26/30; only Sol passed the complete operator contract. The owner playtest then confirmed a Luna lateral rendered-heading inversion, stationary Terra and Sol hostiles, a decorative Terra radar, and inconsistent Sol magnet eligibility between pre-placed and spawned loot. The archived artifacts, screenshots, structured verdicts, owner addendum, and analysis are in `rounds/round-5/results/` and `rounds/round-5/REPORT.md`.
- Round 5.5 is prepared as the GPT-6 refresh: Luna and Sol in fresh Work contexts, Astra reserved for standalone Codex. No arms started. Browser preflight is blocked; the allowlisted packet exporter excludes Git history and prior results. See `rounds/round-5-5/PLAN.md` and `PREFLIGHT.md`.
- Round 6 follows Round 5.5 and has a durable `GOAL.md` and paired protocol, but dispatch is gated on adding and freezing temporal/systemic assertions for visible heading, hostile movement, live radar semantics, and loot-class parity. Component-level visual references remain an independent package decision.

## Current verification contract

Run the inexpensive repository checks first:

```powershell
node tests/site-contract.mjs
node tests/repository-layout.mjs
node tests/round55-package.mjs
node tests/browser-harness.mjs
node tools/context-bank.mjs --list
node rounds/round-4/harness/verify-haio.mjs
node rounds/round-5/harness/verify-archive.mjs
node rounds/round-5/operator/verify-results.mjs
node tests/ragdoll-contract-smoke.mjs
node tests/ragdoll-lab-smoke.mjs
node tests/ragdoll-math-lab-smoke.mjs
node tests/ragdoll-core-contract.mjs
node tests/ragdoll-core-typescript-contract.mjs
node tests/ragdoll-trace-parity.mjs --unit
node tests/ragdoll-parity-server.mjs
```

Browser checks discover Playwright from a local install, `CODEX_NODE_MODULES`, each `NODE_PATH` entry, or the conventional Codex runtime cache. In Work, set `CODEX_NODE_MODULES` to `CODEX_PRIMARY_RUNTIME_NODE_MODULES` when using the installed runtime. `HAIO_BROWSER` or `PARITY_BROWSER` may select the executable:

```powershell
node tests/site-browser.mjs
node tests/ragdoll-interactive-browser.mjs
node rounds/round-4/harness/run-scenarios.mjs
node rounds/round-5/harness/capture-reference-review.mjs
node rounds/round-5/operator/evaluate-arm.mjs --label=archive-luna --root=rounds/round-5/results/luna --output=output/playwright/round-5-operator/luna
node tools/ragdoll-parity/run.mjs --determinism-runs=10
```

The hosted workflow is not local proof. Local command results are the verification authority. `rounds/round-5/harness/verify-package.mjs` remains the immutable dispatch-time working-tree preflight; the current archive check verifies its historical inputs at the frozen content commit so shared tooling can evolve without rewriting provenance.

The site contracts also parse every tracked JavaScript module, resolve relative static imports, require gallery images to decode before inspection, and exercise mobile layout. The Flight Log's same-viewport visual comparison and bounded responsive repair are recorded in `design-qa.md`; transient screenshots remain under ignored `output/playwright/` evidence.

## Verification for the 2026-09-25 move

Migration checks compare the three demo implementations with the pre-move commit after only dependency-path rebasing, and keep 83 historical records byte-identical. Browser interaction and screenshot checks are blocked in this Work environment: Chromium is absent and its standard installation failed. Prior browser receipts remain historical evidence, not a fresh browser pass.

## Known limitations

- The Round 5 images are generator-native sizes close to, but not identical with, their comparison viewports. The reference-review harness normalizes them; source dimensions and checksums remain frozen.
- Anthrocybernetics analysis is an educational heuristic, not a scientific inference engine. Its 2D fallback is intentional when Three.js fails or misses the startup deadline.
- The custom ragdoll solver targets observable parity for the registered scenarios, not a general replacement for Rapier.
- Round 5's first dispatch is excluded because of a shared checksum-harness defect; the report uses only the corrected common-baseline reruns. Owner qualitative notes are retained as a separate post-hoc perspective and do not revise the frozen scores. Round 6 remains gated on evaluator hardening and protocol acceptance.

## Knowledge ownership

- Current state and verification: this file.
- Active or gated work: `docs/TODO.md`.
- Completed milestones: `docs/HISTORY.md`.
- Repeated ragdoll hazards: `docs/parity/PITFALLS.md`.
- Focused context routes: `summary_bank.json`.
- Experiment protocols and evidence: their `rounds/round-*/` owners.
