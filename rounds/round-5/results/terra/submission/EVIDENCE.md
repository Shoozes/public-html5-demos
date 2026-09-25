# Round 5A Evidence

## Outcome

`submission/index.html` is the only playable deliverable. It is a complete HTML document with its CSS, module code, original procedural geometry, and pinned Three.js `0.185.1` imports inline. Evidence files and screenshots in this folder are not runtime dependencies.

## Preflight and integrity

- Dispatch commit: `1aa2761d8d091c687f91d83bcd02a1efd8b67a59`.
- `node round-5/harness/verify-package.mjs` passed before changes and again after the final artifact: `Round 5A package passed: 19 frozen inputs, two approved references, fixed thresholds and budgets.`
- The assigned frozen files, approved references, harnesses, and skill were never edited. Final Git status contains only the untracked `submission/` package.
- The inline module was extracted and parsed with `node --check %TEMP%\\submission-final-parse.mjs`; exit code `0`.
- Final artifact measurement: 131 lines and 28,437 UTF-8 bytes (captured after final code changes).

## Browser lane

- Runtime module path: `C:\Users\jc816\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules` through `CODEX_NODE_MODULES`.
- Browser: `C:\Program Files\Google\Chrome\Application\chrome.exe` through `HAIO_BROWSER`.
- Browser harness: frozen `tools/browser-harness.mjs` / `tools/browser-runtime.mjs`, launched against the repository static server.
- Backend reported by the artifact: WebGPU. Browser bootstrap had no staged overlay, console error, page error, failed request, or HTTP error.

## Actual-artifact functional ladder

The scenario assertions were run directly against `http://127.0.0.1:<frozen-harness-port>/submission/index.html`, not against the unrelated `round-4/submission` baseline that the frozen Round 4 script hard-codes. The command used the prescribed environment and Node inline runner:

```text
$env:CODEX_NODE_MODULES='C:\Users\jc816\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
$env:HAIO_BROWSER='C:\Program Files\Google\Chrome\Application\chrome.exe'
node --input-type=module -e '<Playwright scenario runner using openBrowserHarness(process.cwd()) and the frozen Round 4 assertions at /submission/index.html>'
```

Exit code: `0`.

Passed groups:

1. Bootstrap, 390×844 mobile first frame, and initial live invariants.
2. Three-second no-input opening safety.
3. Four-way WASD movement and cardinal facing.
4. Aggression, sticky automatic target acquisition, automatic fire, and separate weapon aim.
5. Disengagement suppression.
6. Hostile destruction, target/render cleanup, and staged salvage drops.
7. Magnetic attraction, automatic collection, one five-credit award, and pickup cleanup.
8. Station selection and the contextual docking-telemetry event.
9. Blur-driven input recovery.
10. Restart reconstruction, reset player state, and one-loop invariant.
11. 1440×900 desktop composition plus console/page/network inspection.

Final invariant snapshots passed with valid IDs, no pending-destroy representation, no stale target/selection ID, and `loopCount: 1`.

## Screenshots

- Functional: `evidence/first-frame-mobile.png`, `evidence/active-combat.png`, `evidence/hostile-destruction-pickups.png`, `evidence/magnetic-collection.png`, `evidence/post-restart.png`, `evidence/first-frame-desktop.png`.
- Visual before/after: `evidence/visual-before-*`, `evidence/visual-after-hud-*`, and `evidence/visual-after-grid-*`.
- Each final visual target has full-size, grayscale, and true 25% resized thumbnail inspection evidence. `evidence/visual-final-desktop.png` and `evidence/visual-final-portrait.png` are the final post-functional-stabilization captures. The full review order and concrete deltas are in `VISUAL_REVIEW.md`.

## Repairs and limitations

- Functional repairs: 5. They fixed module parse punctuation, missing `three/webgpu` import-map coverage, a read-only readiness assignment that showed an overlay, an overly early natural aggro condition, and a default pickup placement that could contaminate the single-credit scenario.
- Visual repairs: 2. They separated the portrait HUD/controls and reduced the grid line contrast. Before/after proof is retained.
- Self-found defects: the parse/import/ready/salvage failures, portrait control overlap, and grid dominance.
- Critic-found defect: the overlap’s correct escalation from `ODD` to `BROKEN` in the standardized native-image review.
- Verified limitation: compared with the fixed mockups, the original procedural ships and station use fewer faceted detail layers and the sector has less atmospheric debris/haze. This is a visual-fidelity limitation, not a broken behavior, readability, or responsive-layout gate.

## Scores

Hard gates: passed.

- Functional correctness: 100/100 (threshold 90).
- Visual convergence: 24/30 (threshold 24): specific reference contract and evidence, matched desktop/portrait hierarchy after repair, distinct procedural roles, readable grayscale/thumbnail contrast, and candid repair proof; detail density remains the documented limitation.
- Workflow discipline: 20/20 (threshold 16): preflight, fixed interpreter lane, separate blind/external reviews, bounded repairs, preserved evidence, and final path/integrity discipline.

Elapsed implementation time: approximately 12 minutes, from the recorded preflight ledger at 05:45 EDT through final integrity and stability verification at 05:56 EDT; within the 60-minute frozen budget.
