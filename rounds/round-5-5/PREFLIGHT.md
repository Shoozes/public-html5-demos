# Work preflight — 2026-09-25

Result: **BLOCKED / NOT RUN**. This is operator infrastructure evidence, not a
Luna, Sol or Astra result. No experiment subagents were launched.

| Check | Observation |
| --- | --- |
| Requested models | Current Work tool interface exposes `gpt-6-luna` and `gpt-6-sol` with explicit High effort |
| Context control | `fork_turns="none"` is exposed; subagents still share filesystem and tool permissions |
| Native image viewing | Tool exposed; full browser capture-to-image preflight not completed |
| Required Node | 26.5.0; installed 24.19.0 |
| Playwright | Installed 1.62.1, matching the historical version |
| Required browser | Chrome 152.0.7977.65; no local Chromium executable found |
| Default launch | Failed: expected `chromium_headless_shell-1234` executable did not exist |
| Standard installation | `playwright install chromium` failed; downloads returned invalid ZIP content |
| Installer target | Chrome for Testing 151.0.7922.34, which would still differ from the frozen browser |
| Pinned CDN / renderer / captures | Not reached because browser launch failed |
| Fixed external critic | Not preflighted; must be frozen before dispatch |
| Candidate artifacts and scores | None |

The failed download reported `End of central directory record signature not
found` and exited with status 1 after the installer's built-in retries. No network
or approval restriction was bypassed. Browser interaction tests for this cleanup
cannot be claimed as passed either.

[Official OpenAI subagent documentation](https://learn.chatgpt.com/docs/agent-configuration/subagents)
supports Work delegation and configurable model/effort. The observed session tools
establish availability here; the benchmark gates establish whether a particular
session is fit to run this experiment.
