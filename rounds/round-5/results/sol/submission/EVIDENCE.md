# Round 5A Evidence

## Outcome and scores

- Hard gates: `PASS` — artifact, parse, bootstrap, first frame, behavior, evidence, and integrity all passed.
- Functional correctness: `98 / 100` (threshold 90).
- Visual convergence: `26 / 30` (threshold 24), with no final load-bearing checkpoint `BROKEN`.
- Workflow discipline: `20 / 20` (threshold 16).
- Final-gate elapsed time: 21 minutes 28 seconds from preflight timestamp `2026-09-01T05:45:57-04:00` to `2026-09-01T06:07:25-04:00`, inside the 60-minute budget.
- Artifact: `submission/index.html`, 121 physical lines, 33,118 bytes, SHA-256 `C3C21041834BF53441184E1D0D916D1936341620665865C404EBF166ABF6264A`.
- Browser backend: `WebGPUBackend` from `WebGPURenderer`, Chrome `152.0.7977.65`.

Functional scoring: artifact 10/10; bootstrap 15/15; world/lifecycle 15/15; movement/camera 15/15; threat/target/combat 15/15; salvage 10/10; visual clarity/atmosphere 8/10; mobile 5/5; restart/diagnostics 5/5. The two-point visual-clarity deduction reflects simpler procedural geometry and lighter haze than the oracle, not a functional gap.

Visual scoring: reference analysis 5/5; desktop composition 4/5; portrait composition 4/5; silhouette differentiation 4/5; lighting/contrast/depth 4/5; critique honesty/repair effectiveness 5/5. Final residuals are simpler ship/station assemblies, smaller controls, and less localized haze than the fixed mockups.

Workflow scoring: preflight/ledger 5/5; milestone/evidence preservation 5/5; blind self/external separation 5/5; scope/path/frozen-input discipline 5/5.

## Exact verification

Environment for every browser command:

```text
CODEX_NODE_MODULES=C:\Users\jc816\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules
HAIO_BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe
Node v26.5.0
Playwright 1.62.1
Chrome 152.0.7977.65
```

Final commands and results:

```text
node submission/evidence/verify-submission.mjs
PASS: Submission static contract passed: 122 logical split lines, 33118 bytes.

node submission/evidence/run-scenarios.mjs
PASS: 13 evidence groups, including Pointer Events joystick; zero console errors, rejected promises, or network failures.

node submission/evidence/visual-capture.mjs milestone-final-silhouette-portrait.png silhouette=1 390 844
PASS: WebGPUBackend, 13 entities, 13 representations, one loop, no errors.

node round-5/harness/verify-package.mjs
PASS: 19 frozen inputs, two approved references, fixed thresholds and budgets.
```

Retained transcripts: `final-static.log`, `final-scenarios.log`, `final-silhouette.log`, and `final-integrity.log`.

## Functional scenario proof

The adapted runner preserves the frozen Round 4 assertions while changing only the served root from `round-4/` to the repository root so the canonical Round 5 artifact is exercised without modifying the frozen harness.

1. Parse, guarded imports, awaited renderer initialization, first mobile frame, and initial invariants.
2. No hostile projectile during the no-input opening safety window.
3. WASD cardinal movement with expected XZ deltas and facing angles.
4. Pointer Events virtual joystick movement and release.
5. Named aggression, sticky acquisition, automatic fire, and independent weapon aim.
6. Manual lock disengagement with reacquisition suppression.
7. Transactional target destruction, target/render cleanup, and five staged drops.
8. Magnetic pull, automatic collection, one five-credit update, and pickup cleanup.
9. Station selection and `traffic data` contextual event.
10. Blur input recovery.
11. Restart reconstruction, reset hull/credits, one loop, and passing invariants.
12. Exact final desktop and portrait composition captures.
13. Console, rejected-promise, and network inspection.

Live invariants verify unique numeric IDs, valid target/selection IDs, no pending-destroy selection, no removed render remnants, no duplicate representation, one loop, and matched entity/representation counts.

## Visual workflow and evidence

- Silhouette checkpoint: `silhouette-desktop.png`, `silhouette-portrait.png`, intermediate repairs, and `milestone-final-silhouette-portrait.png`.
- First frame: immutable before images plus every accepted/rejected after image for desktop and portrait.
- Movement: `milestone-movement-camera.png`.
- Combat: `milestone-active-combat.png`.
- Destruction/drops: `milestone-destruction-drops.png`.
- Magnetic pair: `milestone-magnetic-attraction-before.png` and `milestone-magnetic-collection.png`.
- Post-restart pair: `milestone-post-restart-desktop-stable.png` and `milestone-post-restart-portrait-stable.png`.
- Blind reviews: `self-critique-silhouette.md`, `self-critique-first-frame.md`, `self-critique-gameplay-ladder.md`.
- Standardized second pass: corresponding `external-critic-*.md` files and mandatory entries in `VISUAL_REVIEW.md`.
- Full-size, 25-percent, and grayscale inspections used the same native-image lane. Frozen images were never overwritten.

## Repair budgets

- Functional repairs: four total pre-final corrections. Three occurred before the first full functional run (import-map alias, vector camera target, authoritative Vector3 spawn position). One of eight allowed post-first-run cycles was used: the named `forceAggro` diagnostic now establishes the named sticky lock instead of preserving an earlier proximity lock. Final full run passed.
- Visual review repairs: seven of twelve overall cycles. Five were bounded code repairs (station value; portrait horizontal compression; two preserved station-position calibrations; final station scale) and two were evidence-state timing repairs (magnetic before-state and stable restart recapture). First-frame portrait used exactly three of three checkpoint loops after the silhouette compression; all other checkpoints used at most one.
- No repair lowered a threshold, changed a reference, edited the critic skill, or mutated a frozen harness.

## Defect attribution

| Defect | Found by | Outcome |
| --- | --- | --- |
| Portrait station missing / beacon and contacts clipped | Blind self-critique and standardized critic | Repaired; final portrait `GOOD` |
| Desktop station too dominant in grayscale thumbnail | Standardized critic only | Repaired on first attempt; final desktop `GOOD` |
| Magnetic screenshot captured only the collected end state | Blind self-critique | Repaired by preserving attraction-before and collected-after images |
| 180 ms post-restart image preceded stable WebGPU composition | Blind self-critique | Repaired by exact-viewport one-second recaptures; live game invariant was already passing |
| Named force-aggression test retained earlier valid lock | Functional harness only | Repaired in one post-harness cycle |
| Pinned-module alias, camera overload, spawn Vector3 overwrite | Staged bootstrap diagnostics | Repaired before the full scenario run |

Predicted before coding: portrait cropping risk, station priority, capsule sameness, crushed darkness, and pickup/star confusion. Critic-only value: grayscale station priority. Operator-only defects: none. Known uncaught blockers: none.

## Discipline and limitations

- Git status before work was clean; final Git status contains only untracked `submission/`.
- No file outside `submission/` or `submission/evidence/` changed.
- No image generation, GenEye, other experiment arm, hosted CI, commit, push, branch change, or operator intervention was used.
- Context compaction events: none observed.
- The artifact uses pinned HTTPS Three.js modules, so first load requires network access to jsDelivr; runtime media and authored assets are fully procedural and inline.
- Visual residuals are scored above and do not leave a load-bearing checkpoint broken.
