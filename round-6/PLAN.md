# Round 6 Plan: Goal Mode Pair Test

## Experiment question

Does Codex Goal mode improve long-horizon completion, visual repair, evidence discipline, and tool use when the model receives the same successful Round 5 package?

Round 6 must not introduce a new game, reference, skill, harness, or rubric. The only intended independent variable is execution mode:

- ordinary high-reasoning task;
- `/goal` with the same model, baseline, context, tools, budget, and completion criteria.

## Why Round 6 follows Round 5

A `/goal` test against an unstable visual workflow would mix two questions. Round 5 first establishes the fixed visual oracle and critic loop. Round 6 then asks whether Goal mode sustains that loop more reliably over a longer task.

## Official behavior being tested

Goal mode is intended for a durable objective with a clear target and validation loop. It can continue working toward completion across a longer horizon instead of stopping after one ordinary turn. Round 6 is therefore a workflow-mode experiment, not a prompt rewrite.

## Paired design

Run each model twice from clean, independent worktrees:

| Pair | Model | Reasoning | Mode |
| --- | --- | --- | --- |
| Luna-N | Luna | High | Normal task |
| Luna-G | Luna | High | `/goal` |
| Terra-N | Terra | High | Normal task |
| Terra-G | Terra | High | `/goal` |
| Sol-N | Sol | High | Normal task |
| Sol-G | Sol | High | `/goal` |

Randomize or counterbalance the order of normal and Goal runs. Do not let one run inspect another run’s artifact, evidence, or critique.

## Frozen inputs

Every arm receives the exact same:

- Round 5 baseline commit;
- approved V2 desktop and portrait references;
- `haio-visual-critic` skill revision;
- Playwright harness;
- visual-interpreter lane;
- game pass-down and rubric;
- environment paths and network policy;
- time budget;
- maximum visual-repair cycles;
- canonical artifact path;
- evidence schema;
- operator intervention policy.

Do not improve the shared package between paired runs. Record a discovered harness defect and repair it only after the entire pair set finishes.

# Task 0: Create the durable goal contract

## What

Write one concise `round-6/GOAL.md` that points to the frozen Round 5 task package.

## Why

The `/goal` command should carry one durable objective, while the repository provides detailed context and measurable completion criteria.

## When/Where

Before any Round 6 run.

## How

Use four sections:

```text
Goal
Context
Constraints
Done when
```

The goal should not repeat the whole pass-down. It should state the artifact, visual and functional outcome, required validation loop, and completion threshold.

Suggested command:

```text
/goal Deliver the frozen Round 6 hostile-space HAIO at submission/index.html. Follow round-6/GOAL.md and the linked Round 5 pass-down, use the prescribed browser and visual-critic loop, repair failures within the fixed budget, and finish only when the hard gates, functional scenarios, visual threshold, and evidence package pass.
```

The normal-task arm receives the same sentence without the `/goal` prefix and with no extra instructions.

## Done When

Both arms receive semantically identical objectives and all detailed requirements live in the repository.

# Task 1: Protect the experiment boundary

## What

Prevent Goal mode from treating the benchmark itself as mutable work.

## Why

A long-running agent may try to improve the harness, rewrite the reference, broaden scope, or create a repository scaffold instead of satisfying the fixed task.

## When/Where

At run start and in `GOAL.md`.

## How

Mark these paths read-only for the agent:

- approved reference images and checksums;
- shared harness;
- rubric;
- project-local skill;
- experiment manifest;
- prior model results.

Allow writes only to the assigned submission and evidence paths.

Explicit constraints:

- do not change the game concept;
- do not regenerate references;
- do not lower thresholds;
- do not edit tests to make failures pass;
- do not create a Vite or framework runtime;
- do not continue polishing after the completion threshold is met;
- stop at the fixed time and repair budget.

## Done When

A path audit proves the agent modified only allowed outputs.

# Task 2: Run identical milestone checkpoints

## What

Use the same milestones in both normal and Goal modes.

## Why

Goal mode should be judged by whether it sustains a known workflow, not by whether it invents a different one.

## When/Where

During implementation.

## How

Required checkpoints:

1. tool and skill preflight;
2. visual contract;
3. first desktop and portrait frame;
4. first visual critique and repair;
5. functional core complete;
6. combat-state visual critique;
7. destruction and pickup critique;
8. restart and invariant proof;
9. final desktop and portrait critique;
10. final artifact/path/evidence audit.

At each checkpoint, retain the same evidence files and critic schema used in Round 5.

## Done When

The comparison can identify which arm skipped, repeated, or completed each checkpoint.

# Task 3: Define Goal-mode steering rules

## What

Control operator interaction during the long-running run.

## Why

Unbounded steering would make the Goal arm incomparable with the ordinary task.

## When/Where

Throughout each run.

## How

Allowed operator actions:

- approve an already-declared external permission;
- restore a failed shared service when the same repair applies to every arm;
- request a status report without adding new requirements;
- pause at the fixed budget boundary.

Disallowed operator actions:

- point out a model-specific visual defect;
- give a model-specific code fix;
- relax a requirement;
- move an artifact into the canonical path for the model;
- provide a new reference or tool to one arm;
- extend only one run because it appears close.

Record every intervention verbatim.

## Done When

The operator-intervention count is comparable across arms.

# Task 4: Measure persistence rather than raw duration

## What

Track whether Goal mode uses additional time productively.

## Why

A longer run is not automatically a better run. It may circle, over-polish, or repeatedly break working behavior.

## When/Where

In each arm’s evidence and the final report.

## How

Record:

- elapsed wall time;
- time to first frame;
- time to first functional pass;
- time to first visual `GOOD` verdict;
- number of browser runs;
- number of visual repair cycles;
- number of functional repair cycles;
- number of regressions after a passing checkpoint;
- number of repeated commands with no new evidence;
- number of context compactions or resumptions when observable;
- tool and skill invocations;
- self-detected defects;
- critic-detected defects;
- operator interventions;
- final artifact size;
- final functional, visual, and workflow scores.

A productive long run should increase proof and convergence while reducing unresolved defects. Mere activity does not count.

## Done When

The report can distinguish persistence from looping.

# Task 5: Use fixed stop conditions

## What

Give both modes an observable definition of completion and failure.

## Why

Goal mode can otherwise continue indefinitely or broaden the work after the artifact is already acceptable.

## When/Where

In `GOAL.md`, harness output, and operator protocol.

## How

Stop successfully when all are true:

- canonical HAIO hard gates pass;
- all required functional scenarios pass;
- functional score is at least the frozen threshold;
- visual convergence score is at least the frozen threshold;
- no load-bearing visual checkpoint remains `BROKEN`;
- required before/after evidence exists;
- invariant check passes after combat and restart;
- console/network checks are clean;
- tool ledger and evidence files are complete;
- reference and harness checksums remain unchanged.

Stop unsuccessfully when any is true:

- fixed wall-time budget expires;
- fixed repair-cycle budget expires;
- an external blocker prevents further work;
- the agent corrupts or modifies frozen benchmark inputs;
- the artifact remains noncanonical or unparseable after the allowed repair count;
- the run enters a documented no-progress loop.

## Done When

No arm receives an informal extension or subjective “one more try.”

# Task 6: Compare normal task and `/goal`

## What

Write a pairwise report before comparing model families.

## Why

The main causal question is execution mode. A cross-model leaderboard can hide the within-model effect.

## When/Where

After all six arms finish.

## How

For each model, compare:

- hard-gate outcome;
- final functional score;
- final visual score;
- final workflow score;
- missing or skipped checkpoints;
- visual defects caught and repaired;
- regressions introduced;
- tool use quality;
- evidence completeness;
- elapsed time and repair efficiency;
- scope and path discipline.

Then compare whether the Goal-mode delta is consistent across Luna, Terra, and Sol.

## Done When

The conclusion states whether `/goal` helped, hurt, or had mixed effects for each model and identifies the mechanism supported by evidence.

## Round 6 scoring

Reuse Round 5’s three score axes:

- Functional: 100
- Visual convergence: 30
- Workflow discipline: 20

Add a non-scored Goal-mode efficiency ledger:

| Metric | Normal | Goal | Delta |
| --- | ---: | ---: | ---: |
| Time to first frame | | | |
| Time to all functional gates | | | |
| Time to visual threshold | | | |
| Browser runs | | | |
| Visual repairs | | | |
| Regressions | | | |
| Operator interventions | | | |
| Final unresolved defects | | | |

## Expected findings

Round 6 may show any of these legitimate outcomes:

- Goal mode sustains the full visual and functional loop better.
- Goal mode improves evidence but over-polishes and wastes time.
- Goal mode protects completion for larger models but causes smaller models to loop.
- Goal mode increases tool use without improving judgment.
- Goal mode has little effect because the frozen repository workflow already supplies enough structure.

Do not predeclare Goal mode the winner. The purpose is to measure whether a durable objective changes the behavior of the same model under the same engineering conditions.

## Relationship to Round 5

Round 5 supplies the stable instrument. Round 6 tests the execution mode. Carry every successful Round 5 tool, skill, reference, and critic rule forward unchanged unless a documented shared defect makes the experiment impossible.