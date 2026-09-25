# Round 5.5: GPT-6 model refresh

Status: **blocked before dispatch**. No Luna, Sol or Astra candidate has started.
Round 5.5 is an experiment number, not the GPT-5.5 model. Round 6 remains the later
normal-versus-Goal experiment, with its temporal/systemic evaluator gate intact.

## Question and boundaries

How do `gpt-6-luna` and `gpt-6-sol` perform on the unchanged Round 5A task in
ChatGPT Work? Reserve `gpt-6-astra` for a fresh, standalone Codex thread, as the
owner requested. The coordinator of this repository cleanup is not a candidate:
it has already inspected prior results.

Reuse the frozen game brief, desktop/portrait references, native-image lane,
visual-critic skill, rubric, diagnostic contract and repair budgets. Export the
inputs from content commit `591530a153eac58d4dfdfed05162cd65a7b9cc78`, not current
working-tree substitutes. Preserve the historical scores. Round 6's proposed
new assertions must not be introduced into Round 5.5 scoring after dispatch.
Later observations of those behaviors may be reported separately as post-hoc.

| Arm | Requested model | Reasoning | Execution |
| --- | --- | --- | --- |
| Luna | `gpt-6-luna` | High | Fresh Work subagent, no conversation fork |
| Sol | `gpt-6-sol` | High | Fresh Work subagent, no conversation fork |
| Astra | `gpt-6-astra` | High | Standalone Codex thread with only the clean packet |

One attempt per arm, with the existing bounded repair loop. Run arms sequentially
when they share browser/CPU resources; wall-time results from concurrent runs
are otherwise confounded by resource contention. Do not choose a best-of-N run.
Archive failures and infrastructure stops as well as completed submissions.

## Gate 1: common environment and package freeze

Before any candidate starts, the operator must:

1. Export and integrity-check each arm's allowlisted package with the tool below.
2. Prove the required Node, Playwright and Chrome versions in `EXPERIMENT.json`,
   pinned Three.js 0.185.1 imports, awaited renderer initialization, actual pixels,
   console/network capture, and both 1440×900 and 390×844 screenshots.
3. Inspect a test screenshot through native image view. Fix one external critic
   identity, model/effort if applicable, prompt, response schema and feedback
   delivery path for every arm. A second self-review is not an external critique.
4. Freeze the environment receipt, adapter hashes, standardized critic prompt,
   dispatch instructions and package digest together. Record the actual model
   identity available from the host, rather than trusting a self-written label.
5. Confirm independent output folders, the 60-minute timer and repair counters.

If any required capability is unavailable, stop without implementing a candidate.
Changing the common environment requires an explicitly versioned protocol
amendment **before all runs**, never an undisclosed per-arm fallback. Do not call
different browser/tool versions an exact repeat of Round 5.

The 2026-09-25 Work preflight found Node 24.19.0 and Playwright 1.62.1; no Chromium
executable was available. Standard Playwright installation failed because the
browser download was not a valid ZIP. See [PREFLIGHT.md](PREFLIGHT.md).
No model was dispatched, no timer started and no score assigned.

## Gate 2: clean context, no coaching

Use a new empty directory outside the repository for each arm. It contains only
the builder packet and an empty `submission/`. It must contain no `.git`, prior
submission, report, model score, screenshot of an earlier implementation, owner
playtest addendum, hidden evaluator, or conversation transcript.

Work dispatch must explicitly request `fork_turns="none"`, the exact model and
High reasoning. Both prompts must be byte-identical apart from arm ID and absolute
workspace path. Do not attach this plan or the repository orientation pack to a
builder; the generated `TASK.md` is the candidate instruction.

Builders may read only their packet and required runtime dependencies, write only
their own `submission/`, and fetch only the pinned runtime CDN dependencies.
No GitHub search, memory/personal-context retrieval, sibling reads, source reuse,
extra helper agents, template generation or image generation is allowed. Record
any accidental exposure; disqualify the affected attempt rather than silently
retrying it. A clean folder is not an OS security boundary: Work agents share a
filesystem and tool set. The operator must audit tool activity and may not claim
technically enforced isolation. If that assurance is required, use isolated
standalone environments for all arms instead.

The coordinator may give identical administrative clarification and the fixed
external critique after a preserved blind self-review. It may not suggest code,
algorithms, solutions from earlier arms, or extra repairs. Preserve every such
interaction. Shared harness failures stop the cohort; do not fix the harness for
only the second arm.

## Prepare packets

From the repository root, with the frozen commit available locally:

```sh
node tools/prepare-round55.mjs --arm=luna --out=/absolute/new/luna-workspace
node tools/prepare-round55.mjs --arm=sol --out=/absolute/new/sol-workspace
node tools/prepare-round55.mjs --arm=astra --out=/absolute/new/astra-workspace
```

The exporter verifies the original hashes, refuses existing or in-repository
destinations, excludes history/results, and emits a checksummed allowlist and
`TASK.md`. It does not start a run or mark this protocol ready. Original paths
inside the clean package are deliberate: they are the frozen contract. An
explicitly recorded path-only adapter lets the original browser scenarios target
the arm's `submission/` without copying an old implementation.

## Evidence and interpretation

Require the complete original sequence: tool ledger, image-based visual contract,
first frame, blind self-critique, standardized external critique, bounded repair,
connected gameplay, eight-state visual ladder and final proof. The original
90/100 functional, 24/30 visual and 16/20 workflow thresholds remain separate.
Hard-gate failures cannot be averaged away. Missing evidence is missing evidence.

Stop at 60 minutes, three visual repairs per checkpoint, twelve visual repairs
overall, or eight functional repairs. Preserve timestamps, package checksums,
tool/feedback transcripts and before/after images. Record tokens only when the
host supplies them; unavailable telemetry is null, not zero. Seal the submission
before independent evaluation; the operator must not repair candidate code.

Evaluate from a separate operator checkout using the preserved Round 5 holdout,
without revealing it to builders. Record its checksum before dispatch. Its legacy
runner writes a historical dispatch ID: the Round 5.5 operator receipt must bind
the actual new packet, model, environment and artifact hashes explicitly, retaining
that raw legacy output as historical-runner output rather than presenting its
embedded ID as this run's provenance. Preflight this receipt path before dispatch.
Publish
model-owned output, operator findings and infrastructure failures separately.

Luna versus Sol in a matched Work environment can support a within-Work
comparison. Astra in Codex changes both model and host; report it as an additional
arm with that limitation, not as causal evidence of model superiority. Historical
Round 5 is context, not a same-host controlled trial. Never claim a winner before
the complete evidence exists.

See [ASTRA_HANDOFF.md](ASTRA_HANDOFF.md) for the operator-only standalone procedure.
