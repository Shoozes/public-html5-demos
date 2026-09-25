# Astra standalone handoff — operator only

Do not send this file, prior reports, the repository checkout, or the coordinator's
conversation to the candidate. The coordinator has already inspected previous
results and must not submit an Astra attempt from that context.

Task: Run the reserved GPT-6 Astra arm from a fresh standalone Codex thread after
the common Round 5.5 preflight and freeze are complete.

Why: Preserve the same task and scoring contract while avoiding solution leakage.

When/Where: After `PLAN.md` gates 1 and 2 pass; use a new isolated directory
containing the allowlisted packet only. No resumed thread and no repository history.

How:

1. Prepare the packet with `node tools/prepare-round55.mjs --arm=astra --out=<new-absolute-directory>`.
2. Verify the package checksum and common environment. Match the frozen external
   critic and budgets. Record any unavoidable host differences before the run.
3. Start a new Codex thread with model `gpt-6-astra`, High effort, and that directory
   as its workspace. Disable unrelated context sources, repository discovery and
   retrieval integrations. Do not use the main repository as the working directory.
4. Supply only: `Read TASK.md in this workspace and perform the benchmark exactly
   as written. The operator will provide the frozen environment receipt, start
   signal and standardized external critique. Do not start implementation before
   preflight passes.`
5. Start the recorded 60-minute timer at the operator's signal. Preserve the full
   tool/feedback record and enforce the original repair limits.
6. Seal outputs and run the independent operator evaluation elsewhere. Retain a
   failed result unchanged; do not have this coordinator finish the candidate.

Done When: The evidence identifies the real model, environment, packet digest,
elapsed time, interventions, hard gates and three separate scores; or records an
honest infrastructure stop. Treat cross-host differences as a comparison limit.
