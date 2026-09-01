# Round 5A Pass-Down: Fixed Visual Oracle

Build the hostile-space HTML-all-in-one game at `submission/index.html` by following the functional contract in [Round 4](../round-4/PASSDOWN.md) and the frozen Round 5 visual package.

Round 5A changes the workflow, not the game. The supplied desktop and portrait references are immutable visual oracles. Do not regenerate them, use them as runtime textures, or move the target during implementation.

## Required sequence

1. Read `KNOWN_FAILURES.md`, `HOSTILE_SPACE_REFERENCE.md`, `STARBLAST_REFERENCE.md`, `REFERENCE_OUTLINE.md`, `RUBRIC.md`, and `.agents/skills/haio-visual-critic/SKILL.md`.
2. Preflight every required tool and create `submission/TOOL_LEDGER.md`.
3. Inspect both references, reconcile them with the shared outline/component map, and write `submission/VISUAL_CONTRACT.md` before substantial game code.
4. Build the first-frame slice: guarded bootstrap, renderer, camera, background, player, station, beacon, and compact HUD.
5. Capture deterministic desktop and portrait frames. Write blind self-critiques before receiving standardized external critique.
6. Make one bounded visual repair per review entry and retain before/after evidence.
7. Add the connected Round 4 gameplay loop without changing the visual target.
8. Run the complete milestone ladder, functional harness, invariant checks, and final path audit.

## Frozen inputs

Do not edit:

- `round-5/mockups/desktop-reference-v2.png`;
- `round-5/mockups/portrait-reference-v2.png`;
- `round-5/EXPERIMENT.json`;
- `round-5/PASSDOWN.md`;
- `round-5/RUBRIC.md`;
- `round-5/KNOWN_FAILURES.md`;
- `round-5/HOSTILE_SPACE_REFERENCE.md`;
- `round-5/STARBLAST_REFERENCE.md`;
- `round-5/REFERENCE_OUTLINE.md`;
- `round-5/harness/`;
- `.agents/skills/haio-visual-critic/SKILL.md`.

Write only inside the assigned `submission/` and its evidence folder unless the operator explicitly repairs a shared harness defect for every arm.

## Required outputs

```text
submission/
├── index.html
├── DECISIONS.md
├── VISUAL_CONTRACT.md
├── VISUAL_REVIEW.md
├── TOOL_LEDGER.md
├── EVIDENCE.md
└── evidence/
```

The evidence package must keep self-critique separate from external critique, preserve every claimed repair’s before/after images, and record console, network, scenario, invariant, artifact-path, elapsed-time, and intervention results.

## Stop condition

Stop successfully only when every hard gate passes, all functional scenarios pass, the thresholds in `RUBRIC.md` are met, no load-bearing checkpoint remains `BROKEN`, and the evidence package is complete. Stop unsuccessfully at the frozen wall-time or repair budget; do not lower a threshold or mutate the benchmark.
