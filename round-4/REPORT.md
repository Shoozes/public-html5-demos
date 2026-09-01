# Round 4: Pass-Down Workflow Experiment Report

## Status

Round 4 is complete as a no-mockup baseline. Luna, Terra, and Sol each received the same game brief in isolated projectless tasks, then received the same clarification that “single HTML” described the runtime artifact rather than excluding decisions/evidence. They also received the same local-browser environment note.

Classification: skills/tools allowed, but usage vague and uncontrolled.

The operator reference and harness in this folder passed static verification plus 12 browser evidence groups on Chrome with `WebGPUBackend`. A neutral post-run operator audit then loaded all three model artifacts for eight seconds at 1440 × 900 and inspected canonical path existence, canvas presentation, console errors, and failed requests.

## Hard-gate result

| Model | Canonical artifact | Parse/bootstrap/frame | Operator console/network | Result |
| --- | --- | --- | --- | --- |
| Luna | Pass: `submission/index.html` | Pass | 0 / 0 | Passed hard gates |
| Terra | **Fail:** artifact remained at `outputs/submission/index.html` after one repair request | Pass from noncanonical path | 0 / 0 | Gated; do not rank as an ordinary pass |
| Sol | Pass: `submission/index.html` | Pass | 0 / 0 | Passed hard gates |

The Terra artifact is runnable, but the benchmark explicitly names `submission/index.html` as the final path. The operator did not move it behind the model’s back.

## Comparative result

Scores below are evidence-based rubric estimates, not pixel-perfect visual judgments. Terra’s raw score is shown for diagnosis but remains hard-gated.

| Area | Luna | Terra raw | Sol |
| --- | ---: | ---: | ---: |
| Artifact and format compliance | 10 | 3 | 10 |
| Bootstrap and runtime reliability | 15 | 14 | 15 |
| World identity and lifecycle correctness | 14 | 10 | 15 |
| Movement, facing, and camera | 13 | 11 | 14 |
| Threat, targeting, and combat | 14 | 13 | 15 |
| Magnetic salvage loop | 10 | 8 | 10 |
| Visual clarity and sector atmosphere | 8 | 4 | 8 |
| Mobile UI and interaction | 4 | 2 | 4 |
| Restart, diagnostics, and cleanup | 4 | 4 | 5 |
| **Raw total** | **92** | **69 (gated)** | **96** |

### Luna

- 329 lines / 37,738 bytes; 9 decision entries.
- Strong connected behavior, numeric-ID ownership, full screenshots, state-based browser waits, and a real repair of the Dock button’s pointer-layer bug.
- Multi-primitive ships and landmarks read clearly. Portrait composition is functional, though the station dominates the upper frame.
- Runtime evidence reports `WebGLBackend`, zero console/page errors, zero failed requests, and post-restart one-loop invariants.
- Elapsed task time: 965,670 ms (about 16:06).

### Terra

- 125 lines / 22,028 bytes; 9 decision entries.
- Fastest completion and a functioning combat/salvage/restart loop, with zero errors in its own run and the operator bootstrap.
- It made the clearest spontaneous visual comment—“too close to a foreground landmark”—and repositioned the composition.
- Major ships remained simple capsule-like forms, contrary to the multi-primitive silhouette requirement; mobile evidence was incomplete; the exact artifact path remained wrong after a bounded repair request.
- Initial elapsed task time: 590,331 ms (about 9:50), plus a 6-second unsuccessful path-repair follow-up.

### Sol

- 56 compact lines / 23,828 bytes; 10 decision entries.
- Strongest deterministic harness: 20 assertions covering bootstrap, movement/facing, combat, suppression, cleanup, salvage, interaction, blur, restart, ownership, console, and network behavior.
- Clear multi-part ships, coherent orthographic tactical composition, compact portrait HUD, and the smallest complete artifact.
- Runtime evidence reports `WebGLBackend`, zero console/page errors, zero failed requests, and 38 entity/render pairs with one loop after restart.
- Elapsed task time: 952,827 ms (about 15:53).

## Skills and tools: allowed, but vague/uncontrolled

This round did allow normal Codex skills and tools. They were materially used, but the prompt did not prescribe an identical skill stack or require a written visual critique. Therefore skill/tool use is observational metadata and a confound, not an isolated variable.

| Model | Skills observed | Tool behavior observed | Visual self-critique quality |
| --- | --- | --- | --- |
| Luna | Playwright skill | Shell, browser automation/MCP, screenshots, state-based waits, console/network inspection | Called frames “coherent”; found concrete import-map and pointer-layer defects, but did not write a blunt aesthetic verdict |
| Terra | Project-scope-understanding, then Playwright | Playwright CLI snapshots/screenshots, console checks, repeated visual repositioning | Most explicit spontaneous judgment: foreground landmark was too close; still did not challenge capsule-like ship silhouettes |
| Sol | Sites building, Playwright/browser-testing | Custom Playwright harness, screenshots, source inspection, 20 assertions | Said it was doing a “final visual review,” but left no structured “good/odd/broken” critique |

None of the three model runs used image generation. Image generation was introduced only after the round, by the operator, to create the fixed references in `mockups/`.

### What the prompt elicited

The prompt strongly elicited correctness language: passed, coherent, clean, repaired, and verified. It did not elicit candid perception language such as:

- “This looks weird because the station dominates the portrait frame.”
- “This looks odd because every ship reads as the same capsule.”
- “This looks good because the player scale, contact spacing, and hull lighting match the reference.”

That is a prompt-design omission, not proof that the models cannot make those judgments.

## Experimental limitations

- The three tasks were created before the operator package was available, so they did not start from one frozen Git commit or one literally shared read-only harness.
- Skills were available but not prescribed; skill routing differed.
- The user-facing “single HTML” request initially conflicted with the evidence-file wording and required one identical clarification.
- Browser environment guidance was sent identically after Luna encountered a missing-browser lane.
- Terra received one model-specific artifact-path repair request; it declined the repair.
- No fixed visual reference or formal screenshot-comparison protocol existed.
- The operator can compare behavior and presentation, but model-size and reasoning-length effects cannot be separated cleanly from skill choice, implementation strategy, and time spent.

## Conclusion

Round 4 supports the pass-down workflow for connected behavior: all three produced runnable games, and Luna/Sol passed the canonical hard gates with broad browser proof. It does not yet cleanly test visual judgment. The next controlled round should make the visual target, the required skills, the critique vocabulary, and the screenshot-repair loop explicit.
