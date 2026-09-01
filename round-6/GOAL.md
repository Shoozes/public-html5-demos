# Round 6 Durable Goal Contract

## Goal

Deliver the frozen Round 6 hostile-space HTML-all-in-one game at `submission/index.html`, preserving the Round 5 visual oracle while passing every functional, visual, workflow, and evidence threshold.

## Context

Use the approved Round 5 package without modification:

- `round-5/PASSDOWN.md`;
- `round-5/RUBRIC.md`;
- `round-5/EXPERIMENT.json`;
- both approved V2 references;
- the shared harness;
- `.agents/skills/haio-visual-critic/SKILL.md`.

The normal arm receives this same objective without the `/goal` prefix. The Goal arm starts with:

```text
/goal Deliver the frozen Round 6 hostile-space HAIO at submission/index.html. Follow round-6/GOAL.md and the linked Round 5 package, use the prescribed browser and visual-critic loop, repair failures within the fixed budget, and finish only when the hard gates, functional scenarios, visual threshold, and evidence package pass.
```

## Constraints

- Modify only the assigned submission and evidence paths.
- Do not edit references, checksums, harnesses, skills, manifests, rubrics, or prior results.
- Do not regenerate references, change the game concept, lower thresholds, edit tests to pass, or replace the HAIO with a framework runtime.
- Use the same browser, interpreter lane, time budget, and repair budget in normal and Goal arms.
- Record every operator intervention and every repeated command that produced no new evidence.
- Stop when the success threshold is met; additional polish after completion counts against efficiency.

## Done when

- Every hard gate in `round-5/RUBRIC.md` passes.
- Functional score is at least 90/100.
- Visual convergence is at least 24/30 with no load-bearing `BROKEN` verdict.
- Workflow discipline is at least 16/20.
- Console, network, invariant, restart, and canonical-path checks pass.
- Required before/after visual evidence and model/tool attribution are complete.
- Frozen-input checksums remain unchanged.
- The run stops within the 60-minute, twelve-visual-repair, and eight-functional-repair budgets.
