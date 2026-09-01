# Round 5 Plan: Visual Oracle and Critic Loop

## Experiment question

Does a fixed visual oracle, prescribed skill stack, semantic screenshot review, and bounded repair loop improve visual convergence without reducing functional correctness or HAIO format compliance?

Round 4 proved that the 5W/How pass-down can produce connected behavior. Round 5 tests the missing visual workflow. It is not primarily another feature round.

## Hypotheses

1. A shared approved mockup will reduce camera, silhouette, lighting, and HUD drift.
2. A mandatory `BROKEN | ODD | GOOD` critique will expose visible defects that ordinary browser assertions miss.
3. A blind self-critique followed by one standardized external critic will distinguish what each coding model notices from what the shared tool supplies.
4. One bounded repair per checkpoint will improve the image more reliably than general requests to “polish” it.
5. Freezing tool access and context will make Luna, Terra, and Sol more comparable than Round 4.

## Primary lane: Round 5A

Round 5A is the controlled comparison. The operator generates and approves one brighter desktop/portrait mockup pair before any model starts. Every model receives the same images and may not regenerate, edit, or replace them.

Round 5B is optional and must run later. In 5B, each model may generate its own mockup. That tests autonomous art direction plus implementation, but it does not isolate coding-model convergence because each model receives a different oracle.

## Frozen variables

Every Round 5A run must use the same:

- baseline Git commit;
- Luna, Terra, or Sol at High reasoning;
- time limit and repair allowance;
- `PASSDOWN.md` and `RUBRIC.md`;
- approved desktop and portrait V2 mockups;
- project-local `haio-visual-critic` skill revision;
- read-only Playwright harness;
- browser executable and dependency paths;
- visual-interpreter lane;
- artifact path: `submission/index.html`;
- milestone states and screenshot dimensions;
- network policy and Three.js version.

Do not change the harness, references, skill, or rubric between model runs. Record any shared defect and repair it only after all runs finish.

## Tool contract

### Image generation

Image generation is an operator setup tool in Round 5A. It creates the shared visual oracle once. It is not available to the model as a way to replace a difficult implementation or move the target during the run.

### Playwright

Playwright owns deterministic navigation, interaction, viewport selection, console/network capture, state setup, and screenshot creation. A screenshot existing is evidence that pixels were captured, not evidence that they look correct.

### Visual interpreter

Before the first run, the operator must select exactly one semantic interpretation lane for all three models:

- the coding environment’s native image-reading path; or
- one fixed GenEye real-model profile, preferably `general-game-qa` after capability/profile preflight.

Do not use GenEye for one model and host vision for another. If the common lane is unavailable, stop the experiment and record a harness failure.

### Project skill

Every model must read and follow:

`.agents/skills/haio-visual-critic/SKILL.md`

The skill operationalizes visual comparison, candid verdicts, semantic parity, and bounded repair. It supplements the functional harness; it never replaces it.

### Tool ledger

Each submission must maintain `submission/TOOL_LEDGER.md` with one row per materially used tool or skill:

| Tool or skill | Available | Used | Why | Evidence produced | Decision or repair caused | Skip/failure reason |
| --- | --- | --- | --- | --- | --- | --- |

Availability without use must be recorded. This prevents “tools were available” from being mistaken for “the workflow used them.”

## Shared context pack

Keep context narrow and legible. Every model receives only:

1. Round 5 pass-down and rubric.
2. Approved V2 mockups and generation record.
3. The visual-critic skill.
4. The read-only browser harness and environment note.
5. `KNOWN_FAILURES.md`, covering artifact path, black-screen imports, dead-target cleanup, backwards facing, unsafe opening fire, zoom extremes, dark materials, capsule silhouettes, and precision salvage.
6. The `Clone Behavior, Not Constants` method as optional methodology, not source to copy literally.

Do not attach the full conversation or every prior implementation. Too much history encourages architecture transcription and dilutes the current goal.

# Task 0: Freeze and approve the visual oracle

## What

Generate a brighter desktop and portrait mockup pair from `MOCKUP_V2_BRIEF.md`.

## Why

A dark or internally inconsistent reference teaches every model the same wrong lesson.

## When/Where

Before any Luna, Terra, or Sol run. Save the approved images under `round-5/mockups/` and record checksums.

## How

- Generate one desktop reference first.
- Review it at full size, 25 percent thumbnail size, and grayscale.
- Reject it if interactive geometry disappears into the background, the station dominates, the player is not the visual subject, or the HUD blocks the scene.
- Derive the portrait reference from the approved desktop art direction.
- Freeze both files and their checksums.

## Done When

The operator records `APPROVED` for both images and no experiment has started.

# Task 1: Preflight the tool stack

## What

Prove that every required tool and skill is available through the same path.

## Why

Round 4 allowed tools but did not control routing. That makes model comparisons ambiguous.

## When/Where

Before implementation in each clean worktree.

## How

- Confirm the exact baseline commit.
- Confirm the visual-critic skill revision.
- Confirm Playwright and browser paths.
- Confirm the selected visual-interpreter lane.
- If using GenEye, discover capabilities, profile path, and model readiness rather than guessing; require the real profile for semantic evidence.
- Create `submission/TOOL_LEDGER.md` before coding.

## Done When

All required tools are marked available or the run is stopped as a harness failure.

# Task 2: Translate the mockups into a visual contract

## What

Write `submission/VISUAL_CONTRACT.md` before building the game.

## Why

The model must convert pixels into implementable relationships instead of vaguely copying a mood.

## When/Where

After reading both references and before substantial edits to `submission/index.html`.

## How

Record:

- ten desktop observations and five portrait-specific observations;
- player screen-height target;
- camera projection, yaw, tilt, and focus interpretation;
- object scale and spacing relationships;
- silhouette rules for player, hostile, neutral, station, wreck, beacon, and pickup;
- background, grid, star, debris, palette, light, material, and glow rules;
- HUD footprint and control hierarchy;
- what will be simplified procedurally without breaking the visible invariant.

Each item must cite a visible relationship. “Polished sci-fi” is invalid. “The cyan player occupies about one tenth of viewport height and is isolated by negative space” is valid.

## Done When

The contract is measurable enough that a critic can identify a delta without reading the source.

# Task 3: Build and judge the first frame before gameplay

## What

Implement only bootstrap, renderer, camera, background, player, station, beacon, and compact HUD.

## Why

Camera, lighting, silhouettes, and composition are expensive to repair after gameplay is layered over them.

## When/Where

First implementation milestone.

## How

- Run static and bootstrap gates.
- Capture deterministic desktop and portrait screenshots.
- Perform the coding model’s blind self-critique before reading any external critic output.
- Run the fixed external visual interpreter with the same prompt template.
- Append both results to `submission/VISUAL_REVIEW.md`.
- Make one bounded visual repair.
- Recapture without overwriting the original images.

## Done When

Both viewports are at least `GOOD` or have an explicitly accepted residual delta, and the player, station, camera, lighting, and HUD hierarchy match the visual contract.

# Task 4: Implement the game without moving the visual target

## What

Add movement, threat-gated sticky auto-targeting, automatic fire, disengagement, destruction, magnetic pickups, contextual interaction, event feed, restart, and diagnostics.

## Why

Round 5 still needs to prove that visual convergence does not break the connected game behavior established in Round 4.

## When/Where

Only after the first-frame checkpoint passes.

## How

Follow the existing functional pass-down and harness. Keep the approved visual contract stable. Any necessary departure from the mockup must be recorded before implementation and justified as a gameplay requirement.

## Done When

All functional hard gates and scenarios pass at the canonical artifact path.

# Task 5: Run the visual state ladder

## What

Critique the game at fixed gameplay milestones rather than only the first frame.

## Why

A good opening screenshot can hide broken combat hierarchy, invisible pickups, cluttered effects, or post-restart drift.

## When/Where

Capture and review:

1. first frame desktop;
2. first frame portrait;
3. movement and camera follow;
4. active combat;
5. destruction and staged drops;
6. magnetic attraction and collection;
7. post-restart desktop;
8. post-restart portrait.

## How

For each state:

- capture through the shared harness;
- write the blind self-verdict;
- obtain the standardized external verdict;
- name three concrete deltas from the reference or visual contract;
- retain one thing that works;
- choose one bounded repair;
- predict what the next image should prove;
- repair and recapture when the verdict is `BROKEN` or `ODD` on a load-bearing invariant.

Limit each checkpoint to three repair cycles. More cycles count as a planning or architecture failure and must be recorded.

## Done When

The before/after evidence shows whether the critique caused the expected visible change.

# Task 6: Separate model judgment from tool assistance

## What

Record which defects were found by the model before external feedback and which required the shared critic.

## Why

The experiment should document what each model already brings, not merely the quality of the combined toolchain.

## When/Where

In `submission/EVIDENCE.md` and the final comparison report.

## How

For every meaningful defect, classify it as:

- predicted from the mockup before coding;
- caught by blind self-critique;
- caught only by the standardized critic;
- caught only by functional tests;
- caught only by operator audit;
- never caught during the run.

Also record whether the repair succeeded on the first attempt.

## Done When

The final report can distinguish native planning, native visual judgment, external tool value, and operator intervention.

# Task 7: Final proof

## What

Produce a complete evidence package without hiding visual or functional failures.

## Why

One blended score can let visual polish conceal a broken game or passing assertions conceal a visibly poor result.

## When/Where

Final submission.

## How

Required outputs:

```text
submission/
├── index.html
├── DECISIONS.md
├── VISUAL_CONTRACT.md
├── VISUAL_REVIEW.md
├── TOOL_LEDGER.md
├── EVIDENCE.md
└── evidence/
    ├── reference-copies-or-checksums.txt
    ├── milestone-before-*.png
    ├── milestone-after-*.png
    ├── self-critique-*.md
    └── external-critic-*.json-or-md
```

Run static verification, all browser scenarios, final desktop/portrait captures, console/network checks, invariants, and artifact-path verification.

## Done When

The artifact passes hard gates, evidence is complete, references were not modified, and every claimed repair has a before/after receipt.

## Scoring

Keep three separate scores.

### Functional score: 100

Reuse the Round 4 rubric. Hard gates remain decisive.

### Visual convergence score: 30

| Area | Points |
| --- | ---: |
| Reference analysis specificity | 5 |
| Desktop composition | 5 |
| Portrait composition | 5 |
| Silhouette differentiation | 5 |
| Lighting, contrast, and depth | 5 |
| Critique honesty and repair effectiveness | 5 |

### Workflow discipline score: 20

| Area | Points |
| --- | ---: |
| Correct tool/skill preflight and ledger | 5 |
| Milestone order and evidence preservation | 5 |
| Separation of self and external critique | 5 |
| Scope, path, and artifact discipline | 5 |

Do not collapse these into one winner number until after the separate axes are discussed.

## Model-capability ledger

For Luna, Terra, and Sol, record:

- initial interpretation quality;
- useful visual decisions made before tooling;
- self-detected visual defects;
- defects found only by the common critic;
- repair success rate;
- functional test depth;
- artifact/path compliance;
- elapsed time;
- output size;
- context or compaction events;
- operator intervention.

This is the evidence needed to discuss model size or reasoning length responsibly. Round 5 may show a correlation, but it still should not claim causation without a paired control.

## Round 5B, optional autonomous art-direction test

After 5A completes, reset to the same baseline and let each agent use image generation to create its own mockup before coding. Require the same visual-critic loop, but score art-direction quality separately from implementation quality.

Do not compare 5B render similarity as though all models targeted the same design. The research question is different: can the model conceive, constrain, implement, inspect, and repair its own visual direction?