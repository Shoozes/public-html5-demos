# Active Work

Updated: 2026-09-01

There are no unresolved repository-integrity defects from the current pass. The remaining work is a gated experiment queue, not incomplete runtime logic.

## P1 — Freeze and run Round 5A

What: Freeze the final package commit, then start new isolated Luna, Terra, and Sol tasks against the approved Round 5A instrument. These are clean reruns, not continuations of the Round 4 tasks.

Why: The repository package is ready, but a model comparison is valid only when all arms start from the same immutable commit and tool lane.

When: After the current package changes are committed. Before any Round 6 arm.

Where: `round-5/EXPERIMENT.json`, `round-5/PLAN.md`, assigned external worktrees/tasks, and each arm’s `submission/` folder.

How:

1. Set `baseline.commit` to the commit containing the complete package and change manifest status to `ready`.
2. Run `node round-5/harness/verify-package.mjs` and retain its passing output.
3. Start three separate High-reasoning tasks with identical time, repair, browser, and interpreter settings and no access to one another’s artifacts.
4. Preserve each functional, visual, workflow, intervention, and tool ledger independently.
5. Compare the three axes without collapsing them prematurely.

Done when: All three arms reach a frozen stop condition and the final Round 5 report distinguishes self-found, critic-found, functional-test, and operator-found defects.

Verification: Package checksum gate, canonical artifact gate, all functional scenarios, visual milestone evidence, and final cross-arm path audit.

## P2 — Run the paired Round 6 goal experiment

What: Run normal and `/goal` arms for Luna, Terra, and Sol using the successful Round 5 package unchanged.

Why: This isolates execution mode from model family, visual target, harness, and task wording.

When: Only after Round 5 completes and its instrument is accepted without a shared blocker.

Where: `round-6/GOAL.md`, `round-6/PLAN.md`, the frozen Round 5 baseline, and six isolated external worktrees/tasks.

How: Counterbalance arm order, enforce identical budgets, record no-progress repetitions and interventions, then compare normal versus Goal within each model before comparing model families.

Done when: Six arms stop under the frozen criteria and the pairwise report explains whether Goal mode helped, hurt, or had mixed effects with evidence for the mechanism.

Verification: Frozen-input checksum audit, per-arm score/evidence audit, intervention ledger, path audit, and pairwise metric reconciliation.

## Backlog rules

- Add only non-duplicate work with What, Why, When, Where, How, Done when, and Verification.
- Implement in-scope correctness work instead of parking it here.
- Move completed outcomes to `HISTORY.md`; move recurring hazards to the owning pitfall ledger.
- Keep raw research outside the backlog until its claims and durable owner are clear.
