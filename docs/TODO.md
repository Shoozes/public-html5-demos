# Active Work

Updated: 2026-09-01

There are no unresolved repository-integrity defects from the current pass. The remaining work is a gated experiment queue, not incomplete runtime logic.

## P1 — Add owner Round 5 qualitative commentary

What: Record the owner's per-arm observations as a clearly labeled addendum to the completed operator report.

Why: The automated holdout and blind visual review are closed, but direct play impressions can identify feel, control, pacing, and aesthetic issues that static first-frame scoring does not capture.

When: Next, before changing or dispatching the Round 6 package.

Where: `round-5/REPORT.md`, the archived games under `round-5/results/<model>/submission/index.html`, and a focused owner-addendum section or companion document if the notes become long.

How: Record Luna, Terra, and Sol notes separately; distinguish subjective preference from reproducible defects; link each reproducible claim to a state or capture; preserve the operator scores unchanged; then state which observations change the next protocol.

Done when: All three owner perspectives are recorded, disagreements with the operator review are explicit, and accepted next-round changes have one authoritative owner.

Verification: Report links resolve, archived artifacts retain their recorded SHA-256 values, and no operator evidence or score is silently rewritten.

## P2 — Run the paired Round 6 goal experiment

What: Run normal and `/goal` arms for Luna, Terra, and Sol using one newly accepted frozen package. Reuse Round 5 unchanged unless the owner addendum explicitly authorizes the operator-evaluator or component-reference improvements identified in the report.

Why: This isolates execution mode from model family, visual target, harness, and task wording.

When: Only after the Round 5 owner addendum is complete and the resulting instrument is accepted without a shared blocker.

Where: `round-6/GOAL.md`, `round-6/PLAN.md`, the frozen Round 5 baseline, and six isolated external worktrees/tasks.

How: Counterbalance arm order, enforce identical budgets, record no-progress repetitions and interventions, then compare normal versus Goal within each model before comparing model families.

Done when: Six arms stop under the frozen criteria and the pairwise report explains whether Goal mode helped, hurt, or had mixed effects with evidence for the mechanism.

Verification: Frozen-input checksum audit, per-arm score/evidence audit, intervention ledger, path audit, and pairwise metric reconciliation.

## Backlog rules

- Add only non-duplicate work with What, Why, When, Where, How, Done when, and Verification.
- Implement in-scope correctness work instead of parking it here.
- Move completed outcomes to `HISTORY.md`; move recurring hazards to the owning pitfall ledger.
- Keep raw research outside the backlog until its claims and durable owner are clear.
