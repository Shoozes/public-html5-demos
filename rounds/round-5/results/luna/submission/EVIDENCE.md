# Round 5A Evidence

## Run metadata

- Dispatch commit: `1aa2761d8d091c687f91d83bcd02a1efd8b67a59`
- Artifact: `submission/index.html`
- Interpreter: native image view
- Browser lane: Google Chrome 152.0.7977.65; Node 26.5.0; Playwright 1.62.1
- Functional viewport lanes: 430x932 and 1440x900
- Reference capture lanes: 1440x900 and 390x844

## Verification log

The exact commands and results are appended as the arm runs. No screenshot or browser assertion is treated as proof until the command has completed.

## Evidence inventory

- `evidence/reference-copies-or-checksums.txt` records the immutable reference identities.
- `evidence/` retains first-frame, combat, destruction, collection, and restart captures without overwriting prior images.
- `VISUAL_REVIEW.md` keeps blind self-critique separate from standardized external critique.

## Defect attribution

- Predicted before coding: station hierarchy, role silhouettes, darkness gate, and edge-HUD balance.
- Blind self-critique: recorded in `evidence/self-critique-first-frame.md` after actual capture.
- Standardized critic: recorded in `evidence/external-critic-first-frame.md` using the native image-view lane.
- Functional-only: target cleanup, opening safety, single-credit collection, and one-loop restart behavior are covered by the frozen browser harness.

## Final gate results

- Package preflight: PASS — `node round-5/harness/verify-package.mjs` before implementation.
- Static contract: PASS — artifact-local inline static check; one complete 86-line, 37,681-byte HTML artifact, pinned imports, awaited renderer init, node materials, and one active animation loop.
- Browser scenarios: PASS — shared Playwright current-artifact runner against `submission/index.html`; 12 evidence groups covering bootstrap, opening safety, four-way movement/facing, combat, disengagement, destruction, staged drops, magnetic collection, station interaction, blur recovery, restart, responsive composition, and console/network inspection.
- Final direct captures: PASS — desktop and portrait HTTP 200, WebGPUBackend, 38 live entity/render representations, invariants pass, no page errors or failed requests.
- Frozen integrity: PASS — package verifier passed before changes; frozen inputs were not edited. Round 4 evidence files touched by the harness's fixed output path were restored to HEAD; this arm's proof is only under `submission/evidence/`.

## Scores and budgets

- Hard gates: PASS.
- Functional: 100/100 (threshold 90).
- Visual: 24/30 (threshold 24); residual opening verdict `ODD`, with no load-bearing `BROKEN` checkpoint.
- Workflow: 20/20 (threshold 16).
- Visual repair attempts: 3 total, 2 retained/effective; functional repairs after the first current-artifact run: 1 (selected-station interaction handler).
- Elapsed wall time: approximately 15 minutes from dispatch to final capture.

## Artifact evidence

- Final desktop: `evidence/final-first-frame-desktop.png` SHA-256 `c2214523ed59de5540a4e10352521dcb9b961f2a262b1ec841871d2829003b15`.
- Final portrait: `evidence/final-first-frame-portrait.png` SHA-256 `6b540994ba1a8ad942f8c36c1302f537ab8c8d3c1fab806137f45b830b3975ba`.
- Functional captures: `first-frame-mobile.png`, `active-combat.png`, `hostile-destruction-pickups.png`, `magnetic-collection.png`, and `post-restart.png`.
- Tool/skill use: package verifier, native image view, Playwright 1.62.1, Chrome 152.0.7977.65, HAIO visual-critic skill, and scoped patch editing were materially used.
- Defects found before external critique: portrait clipping, station/HUD overlap risk, sparse opening pickup field. Functional-only defects caught by tests: lifecycle, target, opening safety, input recovery, and single-credit cleanup assertions.
- Defects requiring the standardized critique: none beyond the same visible portrait overlap and reduced silhouette detail; the external critique confirmed rather than contradicted the blind read.
