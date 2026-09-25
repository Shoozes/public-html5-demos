# Round 4 Reference Evidence

## Commands run

From `C:\DevStuff\public-html5-demos` on Windows 11 / PowerShell 7:

```powershell
node .\round-4\harness\verify-haio.mjs
$env:CODEX_NODE_MODULES=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
node .\round-4\harness\run-scenarios.mjs
```

## Results

- Static HAIO contract: pass.
- Module parse, pinned imports, renderer initialization, and first frame: pass.
- Browser backend reported by `renderer.backend`: `WebGPUBackend`.
- First portrait and desktop frames: pass.
- Three-second no-input opening safety: pass.
- Four cardinal movement and facing directions: pass.
- Aggression, automatic sticky targeting, automatic firing, and independent weapon aim: pass.
- Manual disengagement and reacquisition suppression: pass.
- Hostile destruction, target cleanup, staged drops, and render cleanup: pass.
- Magnetic attraction, automatic collection, one credit update, and pickup cleanup: pass.
- Station contextual interaction: pass.
- Blur input recovery: pass.
- Full restart teardown/reconstruction and post-restart invariants: pass.
- Console, rejected-promise, and failed-network inspection: pass with zero collected failures.

Final harness result: `Round 4 browser scenarios passed (12 evidence groups).`

Final diagnostic output reported one active animation loop, live selected/target IDs, no pending-destroy participation, no detached or duplicate render representations, and matching entity/render registries.

## Screenshots

- `submission/evidence/first-frame-mobile.png`
- `submission/evidence/first-frame-desktop.png`
- `submission/evidence/active-combat.png`
- `submission/evidence/hostile-destruction-pickups.png`
- `submission/evidence/magnetic-collection.png`
- `submission/evidence/post-restart.png`

## Artifact

- Final HTML line count: 107.
- Final HTML byte size: 33,378.
- Runtime files: one (`submission/index.html`).
- Runtime network dependencies: pinned Three.js 0.185.1 WebGPU and TSL ESM modules from jsDelivr.

## Repairs made from browser evidence

1. Added the `three/webgpu` import-map alias required by the pinned `three.tsl.js` module.
2. Corrected the restart scenario's accessible-name selector from the button title to its visible label.
3. Added explicit bootstrap diagnostics so renderer/import failures include the staged error panel, console errors, and failed requests.

## Known limitations

- This artifact is the operator reference used to validate the Round 4 contract and harness; it is not one of the isolated Luna, Terra, or Sol submissions.
- Automated browser proof uses local Chrome with the installed WebGPU backend. Other browser/GPU combinations were not exercised.

## Closing verification

On 2026-09-01, `node round-4/harness/verify-haio.mjs` was rerun after the report and next-round visual contract were finalized. The verifier now covers the HAIO source, model-result report, mandatory visual-critic vocabulary, decision/evidence logs, and PNG signatures/sizes for both fixed mockups.
