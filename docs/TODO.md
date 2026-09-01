# Active Work

Updated: 2026-09-01

There are no unresolved repository-integrity defects from the current pass. The remaining work is a gated experiment queue, not incomplete runtime logic.

## P1 — Add the Round 6 temporal/systemic holdout lane

What: Extend and freeze the next experiment evaluator so it measures kinetic and semantic behavior that the Round 5 state-oriented holdout missed.

Why: The owner playtest confirmed four blind spots: Luna's rendered nose opposes lateral velocity; Terra and Sol hostiles never move; Terra's radar is decorative; and Sol's pre-placed pickups do not share the magnet behavior of spawned drops.

When: Next, before dispatching any Round 6 arm.

Where: `round-6/`, the frozen operator evaluator copied forward from `round-5/operator/evaluate-arm.mjs`, its fixtures, rubric, and package manifest.

How: Add bounded assertions for rendered-forward-vector alignment with movement, hostile patrol or pursuit displacement over time, radar contacts derived from live entity positions, and collection parity across pre-placed and combat-dropped loot. Exercise ordinary world objects rather than only diagnostic-created pickups. Prove the assertions reject the archived negative cases and accept an explicit positive fixture before freezing the package.

Done when: The lane detects each confirmed Round 5 defect, its positive fixture passes, results distinguish visual composition from kinetic/systemic behavior, and the evaluator/package hashes are frozen together.

Verification: Run the evaluator against Luna, Terra, and Sol archives plus the positive fixture; verify the expected per-assertion outcomes, rerun the package verifier in a fresh worktree, and retain structured evidence.

## P2 — Run the paired Round 6 goal experiment

What: Run normal and `/goal` arms for Luna, Terra, and Sol using one newly accepted frozen package with the temporal/systemic lane above.

Why: This isolates execution mode from model family, visual target, harness, and task wording.

When: Only after the expanded evaluator and resulting package are accepted without a shared blocker.

Where: `round-6/GOAL.md`, `round-6/PLAN.md`, the frozen Round 5 baseline, and six isolated external worktrees/tasks.

How: Counterbalance arm order, enforce identical budgets, record no-progress repetitions and interventions, then compare normal versus Goal within each model before comparing model families.

Done when: Six arms stop under the frozen criteria and the pairwise report explains whether Goal mode helped, hurt, or had mixed effects with evidence for the mechanism.

Verification: Frozen-input checksum audit, per-arm score/evidence audit, intervention ledger, path audit, and pairwise metric reconciliation.

## Backlog rules

- Add only non-duplicate work with What, Why, When, Where, How, Done when, and Verification.
- Implement in-scope correctness work instead of parking it here.
- Move completed outcomes to `HISTORY.md`; move recurring hazards to the owning pitfall ledger.
- Keep raw research outside the backlog until its claims and durable owner are clear.
